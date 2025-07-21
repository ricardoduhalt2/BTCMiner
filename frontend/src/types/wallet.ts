export type WalletType = 'metamask' | 'walletconnect' | 'phantom' | 'internet-identity'

export interface ConnectedWallet {
  id: string
  type: WalletType
  address: string
  chainId: number
  chainName: string
  balance: string
  isActive: boolean
  connectedAt: string // Changed from Date to string for serialization
  publicKey?: string // For Solana wallets
  principal?: string // For ICP wallets
}

export interface WalletAdapter {
  type: WalletType
  name: string
  icon: string
  supportedChains: string[]
  isInstalled: boolean
  connect: () => Promise<ConnectedWallet>
  disconnect: (walletId: string) => Promise<void>
  switchChain?: (chainId: number) => Promise<void>
  signMessage?: (message: string) => Promise<string>
  signTransaction?: (transaction: any) => Promise<any>
}

export interface ChainConfig {
  id: number
  name: string
  symbol: string
  rpcUrl: string
  blockExplorerUrl: string
  iconUrl: string
  isTestnet: boolean
  layerZeroId?: number
  wormholeId?: number
}

export interface WalletBalance {
  chainId: number
  tokenAddress: string
  balance: string
  decimals: number
  symbol: string
  usdValue: number
}

export interface NetworkSwitchRequest {
  chainId: number
  chainName: string
  rpcUrls: string[]
  blockExplorerUrls: string[]
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

export class WalletError extends Error {
  constructor(
    message: string,
    public code: string,
    public walletType: WalletType
  ) {
    super(message)
    this.name = 'WalletError'
  }
}