// Extend the Window interface to include ethereum and solana
declare interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (request: { method: string; params?: any[] }) => Promise<any>;
    on: (eventName: string, callback: (params: any) => void) => void;
    removeListener: (eventName: string, callback: (params: any) => void) => void;
    chainId?: string;
    networkVersion?: string;
    selectedAddress?: string;
  };
  solana?: any; // Para Phantom u otras wallets de Solana
}
