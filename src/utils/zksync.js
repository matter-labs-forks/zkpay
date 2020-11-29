const zksync = require('zksync');
const ethers = require('ethers');
require('dotenv').config();

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(1);
  }
);

async function main() {
  const ethersProvider = new ethers.getDefaultProvider('rinkeby');
  const syncProvider = await zksync.getDefaultProvider('rinkeby');

  const [from, to] = await Promise.all([
    getWallet(ethersProvider, syncProvider),
    getWallet(ethersProvider, syncProvider, 1),
  ]);

  console.log(from.syncWallet.address());
  console.log(to.syncWallet.address());

  await deposit(from, to, '0.1');
  // await transfer(to, from, '0.005');
  // await transfer(from, to, '0.005');

  console.log(await getBalance(from));
  console.log(await getBalance(to));
}

async function getWallet(ethersProvider, syncProvider, id = 0) {
  const ethersWallet = ethers.Wallet.fromMnemonic(
    process.env.MNEMONIC,
    `m/44'/60'/0'/0/${id}`
  ).connect(ethersProvider);
  const syncWallet = await zksync.Wallet.fromEthSigner(
    ethersWallet,
    syncProvider
  );
  return { ethersWallet, syncWallet };
}

async function deposit(from, to, amount) {
  const deposit = await from.syncWallet.depositToSyncFromEthereum({
    depositTo: to.syncWallet.address(),
    token: 'ETH',
    amount: ethers.utils.parseEther(amount),
  });
  console.log(await deposit.awaitVerifyReceipt());
}

async function transfer(from, to, amountStr) {
  await register(from);

  const amount = zksync.utils.closestPackableTransactionAmount(
    ethers.utils.parseEther(amountStr)
  );

  const transfer = await from.syncWallet.syncTransfer({
    to: to.syncWallet.address(),
    token: 'ETH',
    amount,
  });
  console.log(await transfer.awaitReceipt());
}

async function register({ syncWallet }) {
  if (!(await syncWallet.isSigningKeySet())) {
    if ((await syncWallet.getAccountId()) == undefined) {
      throw new Error('Unknown account');
    }

    // As any other kind of transaction, `ChangePubKey` transaction requires fee.
    // User doesn't have (but can) to specify the fee amount. If omitted, library will query zkSync node for
    // the lowest possible amount.
    const changePubkey = await syncWallet.setSigningKey({ feeToken: 'ETH' });

    // Wait until the tx is committed
    await changePubkey.awaitVerifyReceipt();
  }
}

async function withdraw(to, amount) {
  const withdraw = await to.syncWallet.withdrawFromSyncToEthereum({
    ethAddress: to.ethersWallet.address(),
    token: 'ETH',
    amount: ethers.utils.parseEther(amount),
  });
  console.log(await withdraw.awaitVerifyReceipt());
}

async function getBalance({ syncWallet }) {
  // const balances = await Promise.all([
  //   syncWallet.getBalance('ETH'),
  //   syncWallet.getBalance('ETH', 'verified'),
  // ]);
  const balances = [];
  balances.push(await syncWallet.getBalance('ETH'));
  balances.push(await syncWallet.getBalance('ETH', 'verified'));
  return balances.map(ethers.utils.formatEther);
}
