import React, { useContext, useState } from 'react';
import Wallet from 'utils/wallet';
import { slPrompt } from 'utils/sl';

export const wallet = new Wallet();
const WalletContext = React.createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [assets, setAssets] = useState({
    main: [{ name: 'ETH', value: 0 }],
    zk: [{ name: 'ETH', value: 0 }],
  });

  async function connect() {
    if (wallet.address) return;

    await wallet.connect();
    setAddress(wallet.address);
    setAssets(wallet.assets);
  }

  async function disconnect() {
    await wallet.disconnect();
    setAddress(wallet.address);
    setAssets(wallet.assets);
  }

  async function deposit(...args) {
    const receipt = await wallet.deposit(...args);
    setAssets(wallet.assets);
    return receipt;
  }

  async function transfer(...args) {
    const receipt = await wallet.transfer(...args);
    setAssets(wallet.assets);
    return receipt;
  }

  async function withdraw(...args) {
    const receipt = await wallet.withdraw(...args);
    setAssets(wallet.assets);
    return receipt;
  }

  async function ensureIsRegistered() {
    if (await wallet.getIsRegistered()) {
      return;
    }
    await slPrompt(
      'To start using your account you need to register your public key once. This operation costs 15000 gas on-chain. In the future, we will eliminate this step by verifying ETH signatures with zero-knowledge proofs. Please bear with us!',
      'Register',
      wallet.register
    );
  }

  async function onLoad() {
    // todo: load cached session?
    // if (web3Modal.cachedProvider) {
    //   connect();
    // }
  }

  React.useEffect(() => {
    onLoad();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <WalletContext.Provider
      value={{
        address,
        assets,

        connect,
        disconnect,
        deposit,
        transfer,
        withdraw,
        ensureIsRegistered,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('Missing wallet context');
  }
  const {
    address,
    assets,

    connect,
    disconnect,
    deposit,
    transfer,
    withdraw,
    ensureIsRegistered,
  } = context;

  return {
    address,
    assets,

    connect,
    disconnect,
    deposit,
    transfer,
    withdraw,
    ensureIsRegistered,
  };
}
