import React from 'react';
import Wallet, { web3Modal } from 'utils/wallet';

export const wallet = new Wallet();
const WalletContext = React.createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = React.useState(null);

  async function connect() {
    if (wallet.address) return;
    await wallet.connect();
    setAddress(wallet.address);
  }

  async function disconnect() {
    await wallet.disconnect();
    setAddress(wallet.address);
  }

  async function onLoad() {
    if (web3Modal.cachedProvider) {
      connect();
    }
  }

  React.useEffect(() => {
    onLoad();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <WalletContext.Provider
      value={{
        address,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = React.useContext(WalletContext);
  if (!context) {
    throw new Error('Missing wallet context');
  }
  const { address, connect, disconnect } = context;

  return {
    address,
    connect,
    disconnect,
  };
}
