import * as zksync from 'zksync';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import xhr from 'utils/xhr';
import cache from 'utils/cache';

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions: {},
});

export default class Wallet {
  constructor() {
    this.loadAssets();
  }

  async connect() {
    await this.setupEthers();
    await this.setupRegistry();
    await this.setupZkSync();
  }

  async setupEthers() {
    this.web3Provider = await web3Modal.connect();
    this.ethersProvider = new ethers.providers.Web3Provider(this.web3Provider);
    this.net = await this.ethersProvider.getNetwork();

    this.ethersWallet = this.ethersProvider.getSigner();
    this.address = await this.ethersWallet.getAddress();

    this.web3Provider.on('accountsChanged', () => {
      window.location.reload();
    });
    this.web3Provider.on('chainChanged', () => {
      window.location.reload();
    });
    // web3Provider.on('disconnect', () => {
    //   disconnect();
    // });
  }

  async setupRegistry() {
    const challenge = await xhr(
      'get',
      `/auth/${this.net.chainId}/${this.address.toLowerCase()}`
    );

    // sign
    // const signature = await this.ethersWallet._signTypedData(
    //   challenge.domain,
    //   [challenge.types.Challenge],
    //   challenge.message
    // );
    const signature = await this.web3Provider.request({
      method: 'eth_signTypedData_v4',
      params: [this.address.toLowerCase(), JSON.stringify(challenge)],
      from: this.address,
    });

    // verify
    const token = await xhr(
      'get',
      `/auth/${this.net.chainId}/${challenge.message.challenge}/${signature}`
    );
    cache('token', token);
  }

  async setupZkSync() {
    const netName = ~['homestead'].indexOf(this.net.name)
      ? 'mainnet'
      : this.net.name; // todo
    this.syncProvider = await zksync.getDefaultProvider(netName);
    this.syncWallet = await zksync.Wallet.fromEthSigner(
      this.ethersWallet,
      this.syncProvider
    );
    await this.loadAssets();
  }

  async disconnect() {
    this.address = null;
  }

  async deposit(depositTo, amount) {
    const receipt = await this.syncWallet.depositToSyncFromEthereum({
      depositTo,
      token: 'ETH',
      amount: ethers.utils.parseEther(amount),
    });
    await this.loadAssets();
    return receipt;
  }

  async transfer(to, amountStr) {
    const amount = zksync.utils.closestPackableTransactionAmount(
      ethers.utils.parseEther(amountStr)
    );
    const receipt = await this.syncWallet.syncTransfer({
      to,
      token: 'ETH',
      amount,
    });
    await this.loadAssets();
    return receipt;
  }

  async register() {
    if (await this.getIsRegistered()) {
      return;
    }

    // eslint-disable-next-line eqeqeq
    if ((await this.syncWallet.getAccountId()) == undefined) {
      throw new Error('Unknown account');
    }

    // As any other kind of transaction, `ChangePubKey` transaction requires fee.
    // User doesn't have (but can) to specify the fee amount. If omitted, library will query zkSync node for
    // the lowest possible amount.
    const changePubkey = await this.syncWallet.setSigningKey({
      feeToken: 'ETH',
    });

    // Wait until the tx is committed
    await changePubkey.awaitVerifyReceipt();
  }

  async getIsRegistered() {
    return await this.syncWallet.isSigningKeySet();
  }

  async loadAssets() {
    const assets = { main: [], zk: [] };
    if (this.address) {
      assets.main.push({
        name: 'ETH',
        value: ethers.utils.formatEther(
          await this.ethersProvider.getBalance(this.address)
        ),
      });
      assets.zk.push({
        name: 'ETH',
        value: ethers.utils.formatEther(
          await this.syncWallet.getBalance('ETH')
        ),
      });
    }
    this.assets = assets;
  }
}
