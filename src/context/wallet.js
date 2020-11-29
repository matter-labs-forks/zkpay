import React, { useContext, useState } from 'react';
import * as zksync from 'zksync';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

const WalletContext = React.createContext(null);
const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions: {},
});

export function WalletProvider({ children }) {
  const [web3Provider, setWeb3Provider] = useState(null);
  const [ethersProvider, setEthersProvider] = useState(null);
  const [syncProvider, setSyncProvider] = useState(null);
  const [ethersWallet, setEthersWallet] = useState(null);
  const [syncWallet, setSyncWallet] = useState(null);
  const [address, setAddress] = useState(null);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [assets, setAssets] = useState({
    main: [{ name: 'ETH', value: 0 }],
    zk: [{ name: 'ETH', value: 0 }],
  });

  return (
    <WalletContext.Provider
      value={{
        address,
        ethersProvider,
        syncProvider,
        ethersWallet,
        syncWallet,
        hasRegistered,
        web3Provider,
        assets,

        setWeb3Provider,
        setEthersProvider,
        setSyncProvider,
        setEthersWallet,
        setSyncWallet,
        setAddress,
        setHasRegistered,
        setAssets,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useEthersProvider() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('Missing wallet context');
  }
  return context.ethersProvider;
}

export function useSyncProvider() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('Missing wallet context');
  }
  return context.syncProvider;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('Missing wallet context');
  }
  const {
    setWeb3Provider,
    setEthersProvider,
    setSyncProvider,
    setEthersWallet,
    setSyncWallet,
    setAddress,
    setHasRegistered,
    setAssets,

    address,
    syncWallet,
    hasRegistered,
    assets,
  } = context;

  return {
    address,
    syncWallet,
    hasRegistered,
    assets,
    async connect() {
      const web3Provider = await web3Modal.connect();
      const ethersProvider = new ethers.providers.Web3Provider(web3Provider);
      const ethersWallet = ethersProvider.getSigner();
      const address = await ethersWallet.getAddress();

      web3Provider.on('accountsChanged', () => {
        window.location.reload();
      });
      web3Provider.on('chainChanged', () => {
        window.location.reload();
      });
      // web3Provider.on('disconnect', () => {
      //   disconnect();
      // });

      const net = await ethersProvider.getNetwork();
      const syncProvider = await zksync.getDefaultProvider(net.name);
      const syncWallet = await zksync.Wallet.fromEthSigner(
        ethersWallet,
        syncProvider
      );

      setHasRegistered(await getHasSyncAccount(syncWallet));
      setSyncProvider(syncProvider);

      setSyncWallet(syncWallet);
      setEthersProvider(ethersProvider);
      setEthersWallet(ethersWallet);
      setAddress(address);

      const assets = { main: [], zk: [] };
      assets.main.push({
        name: 'ETH',
        value: ethers.utils.formatEther(
          await ethersProvider.getBalance(address)
        ),
      });
      assets.zk.push({
        name: 'ETH',
        value: ethers.utils.formatEther(
          await syncWallet.getBalance('ETH', 'verified')
        ),
      });

      setAssets(assets);
    },

    async disconnect() {
      setWeb3Provider(null);
      setEthersProvider(null);
      setSyncProvider(null);
      setEthersWallet(null);
      setSyncWallet(null);
      setAddress(null);
    },

    async deposit(depositTo, amount) {
      return await syncWallet.depositToSyncFromEthereum({
        depositTo,
        token: 'ETH',
        amount: ethers.utils.parseEther(amount),
      });
    },

    async transfer(to, amountStr) {
      const amount = zksync.utils.closestPackableTransactionAmount(
        ethers.utils.parseEther(amountStr)
      );

      return await syncWallet.syncTransfer({
        to,
        token: 'ETH',
        amount,
      });
    },

    async register() {
      if (!(await getHasSyncAccount(syncWallet))) {
        // eslint-disable-next-line eqeqeq
        if ((await syncWallet.getAccountId()) == undefined) {
          throw new Error('Unknown account');
        }

        // As any other kind of transaction, `ChangePubKey` transaction requires fee.
        // User doesn't have (but can) to specify the fee amount. If omitted, library will query zkSync node for
        // the lowest possible amount.
        const changePubkey = await syncWallet.setSigningKey({
          feeToken: 'ETH',
        });

        // Wait until the tx is committed
        await changePubkey.awaitVerifyReceipt();
      }
    },

    async getHasSyncAccount() {
      return getHasSyncAccount(syncWallet);
    },

    async getBalance() {
      // const balances = await Promise.all([
      //   syncWallet.getBalance('ETH'),
      //   syncWallet.getBalance('ETH', 'verified'),
      // ]);
      const balances = [];
      balances.push(await syncWallet.getBalance('ETH'));
      balances.push(await syncWallet.getBalance('ETH', 'verified'));
      return balances.map(ethers.utils.formatEther);
    },
  };
}

async function getHasSyncAccount(syncWallet) {
  return await syncWallet.isSigningKeySet();
}
