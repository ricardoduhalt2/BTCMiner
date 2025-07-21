// LayerZero Testnet Configuration
export interface LayerZeroConfig {
  chainId: number;
  lzChainId: number;
  endpoint: string;
  name: string;
}

export const LAYERZERO_ENDPOINTS: Record<string, LayerZeroConfig> = {
  // Ethereum Sepolia
  sepolia: {
    chainId: 11155111,
    lzChainId: 10161,
    endpoint: "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1",
    name: "Ethereum Sepolia"
  },
  
  // BNB Chain Testnet
  bscTestnet: {
    chainId: 97,
    lzChainId: 10102,
    endpoint: "0x6Fcb97553D41516Cb228ac03FdC8B9a0a9df04A1",
    name: "BNB Chain Testnet"
  },
  
  // Base Sepolia
  baseSepolia: {
    chainId: 84532,
    lzChainId: 10245,
    endpoint: "0x6EDCE65403992e310A62460808c4b910D972f10f",
    name: "Base Sepolia"
  },
  
  // Additional testnets for future expansion
  mumbai: {
    chainId: 80001,
    lzChainId: 10109,
    endpoint: "0xf69186dfBa60DdB133E91E9A4B5673624293d8F8",
    name: "Polygon Mumbai"
  },
  
  arbitrumGoerli: {
    chainId: 421613,
    lzChainId: 10143,
    endpoint: "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab",
    name: "Arbitrum Goerli"
  }
};

// Trusted remote path configuration
export function getTrustedRemotePath(localChain: string, remoteChain: string): string {
  const localConfig = LAYERZERO_ENDPOINTS[localChain];
  const remoteConfig = LAYERZERO_ENDPOINTS[remoteChain];
  
  if (!localConfig || !remoteConfig) {
    throw new Error(`Chain configuration not found for ${localChain} or ${remoteChain}`);
  }
  
  // This will be the deployed contract address + local contract address
  // Format: remoteAddress + localAddress (both 20 bytes, total 40 bytes)
  return "0x"; // Will be updated after deployment
}

// Gas limits for cross-chain operations
export const GAS_LIMITS = {
  SEND: 200000,
  RECEIVE: 200000,
  ADAPTER_PARAMS: "0x00010000000000000000000000000000000000000000000000000000000000030d40" // 200k gas
};

export const DEPLOYMENT_CONFIG = {
  TOKEN_NAME: "BTCMiner",
  TOKEN_SYMBOL: "BTCM",
  INITIAL_SUPPLY: "100000000", // 100M tokens
  DECIMALS: 18
};