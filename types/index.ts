export interface SocialAccount {
  id: number;
  key: string; // "telegram" | "twitter" | ...
  name: string; // label в UI
  isConnected: boolean;
}

export interface WalletAccount {
  id: number;
  key: string; // "metamask" | "phantom" | ...
  name: string; // label в UI
  isConnected: boolean;
}
