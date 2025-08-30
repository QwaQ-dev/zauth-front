// Wallet connection utilities
export const walletConnectors = {
  metamask: async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        return {
          address: accounts[0],
          name: `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          success: true,
        };
      } catch (error) {
        console.error("MetaMask connection failed:", error);
        return { success: false, error: "User rejected connection" };
      }
    }
    return { success: false, error: "MetaMask not installed" };
  },

  phantom: async () => {
    if (typeof window.solana !== "undefined" && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect();
        const address = response.publicKey.toString();
        return {
          address,
          name: `${address.slice(0, 6)}...${address.slice(-4)}`,
          success: true,
        };
      } catch (error) {
        console.error("Phantom connection failed:", error);
        return { success: false, error: "User rejected connection" };
      }
    }
    return { success: false, error: "Phantom wallet not installed" };
  },

  tonkeeper: async () => {
    if (typeof window.ton !== "undefined") {
      try {
        const response = await window.ton.send("ton_requestAccounts");
        const address = response[0];
        return {
          address,
          name: `${address.slice(0, 6)}...${address.slice(-4)}`,
          success: true,
        };
      } catch (error) {
        console.error("TON wallet connection failed:", error);
        return { success: false, error: "User rejected connection" };
      }
    }
    return { success: false, error: "TON wallet not installed" };
  },
};

export const connectWallet = async (
  walletKey: string,
): Promise<{
  success: boolean;
  address?: string;
  name?: string;
  error?: string;
}> => {
  switch (walletKey) {
    case "metamask":
      return await walletConnectors.metamask();
    case "phantom":
      return await walletConnectors.phantom();
    case "tonkeeper":
      return await walletConnectors.tonkeeper();
    default:
      return { success: false, error: "Unsupported wallet" };
  }
};

export const disconnectWallet = async (walletKey: string): Promise<boolean> => {
  try {
    switch (walletKey) {
      case "metamask":
        return true;
      case "phantom":
        if (window.solana?.disconnect) {
          await window.solana.disconnect();
        }
        return true;
      case "tonkeeper":
        return true;
      default:
        return false;
    }
  } catch (error) {
    console.error("Wallet disconnect failed:", error);
    return false;
  }
};

// Type declarations for wallet objects
declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
    ton?: any;
  }
}
