import { EventEmitter } from 'events'
import { ConnectedWallet } from '@store/slices/walletSlice'

export type WalletType = 'metamask' | 'phantom' | 'walletconnect' | 'internet-identity'

export class WalletError extends Error {
  constructor(
    message: string,
    public code: string,
    public walletType: string
  ) {
    super(message)
    this.name = 'WalletError'
  }
}

class WalletManager extends EventEmitter {
  private connectedWallets: ConnectedWallet[] = []

  async restoreConnections(): Promise<void> {
    // Simulate restoring previous connections
    const savedWallets = localStorage.getItem('btcminer-wallets')
    if (savedWallets) {
      try {
        const wallets = JSON.parse(savedWallets)
        // Clean up any duplicate wallets and fix format
        const cleanWallets = wallets
          .map((w: any) => ({
            ...w,
            connectedAt: typeof w.connectedAt === 'string' ? w.connectedAt : new Date(w.connectedAt).toISOString()
          }))
          .filter((wallet: ConnectedWallet, index: number, arr: ConnectedWallet[]) => {
            // Remove duplicates based on ID and type+address combination
            return arr.findIndex(w => w.id === wallet.id || (w.type === wallet.type && w.address === wallet.address)) === index
          })
        
        this.connectedWallets = cleanWallets
        
        // Save cleaned wallets back to localStorage
        if (cleanWallets.length !== wallets.length) {
          this.saveWallets()
        }
      } catch (error) {
        console.error('Failed to restore wallet connections:', error)
        // Clear corrupted data
        localStorage.removeItem('btcminer-wallets')
      }
    }
  }

  async connectWallet(walletType: WalletType): Promise<ConnectedWallet> {
    try {
      let wallet: ConnectedWallet

      switch (walletType) {
        case 'metamask':
          wallet = await this.connectMetaMask()
          break
        case 'phantom':
          wallet = await this.connectPhantom()
          break
        case 'walletconnect':
          wallet = await this.connectWalletConnect()
          break
        case 'internet-identity':
          wallet = await this.connectInternetIdentity()
          break
        default:
          throw new WalletError(`Unsupported wallet type: ${walletType}`, 'UNSUPPORTED_WALLET', walletType)
      }

      // Check if wallet already exists to prevent duplicates
      const existingWallet = this.connectedWallets.find(w => w.id === wallet.id || (w.type === wallet.type && w.address === wallet.address))
      if (!existingWallet) {
        this.connectedWallets.push(wallet)
        this.saveWallets()
        this.emit('wallet:connected', wallet)
      } else {
        // Return existing wallet instead of creating duplicate
        return existingWallet
      }
      
      return wallet
    } catch (error: any) {
      if (error instanceof WalletError) {
        throw error
      }
      throw new WalletError(error.message || 'Failed to connect wallet', 'CONNECTION_FAILED', walletType)
    }
  }

  private async connectMetaMask(): Promise<ConnectedWallet> {
    if (typeof window.ethereum === 'undefined') {
      throw new WalletError('MetaMask is not installed', 'WALLET_NOT_INSTALLED', 'metamask')
    }

    try {
      // Check if MetaMask is available and responsive
      if (!window.ethereum.isMetaMask) {
        throw new WalletError('MetaMask not detected', 'WALLET_NOT_DETECTED', 'metamask')
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      
      if (accounts.length === 0) {
        throw new WalletError('No accounts found', 'NO_ACCOUNTS', 'metamask')
      }

      const chainIdNumber = parseInt(chainId, 16)
      const chainName = this.getChainName(chainIdNumber)

      return {
        id: `metamask-${accounts[0]}`,
        type: 'metamask',
        address: accounts[0],
        chainId: chainIdNumber,
        chainName,
        balance: '0',
        isActive: true,
        connectedAt: new Date().toISOString(),
      }
    } catch (error: any) {
      // Handle specific MetaMask errors gracefully
      if (error.code === 4001) {
        throw new WalletError('User rejected the request', 'USER_REJECTED', 'metamask')
      } else if (error.code === -32002) {
        throw new WalletError('MetaMask is already processing a request', 'REQUEST_PENDING', 'metamask')
      } else if (error.message?.includes('Unexpected error')) {
        throw new WalletError('MetaMask connection failed. Please try again.', 'CONNECTION_FAILED', 'metamask')
      }
      
      // Log the error for debugging but don't expose internal details
      console.warn('MetaMask connection error:', error)
      throw new WalletError('Failed to connect to MetaMask', 'CONNECTION_FAILED', 'metamask')
    }
  }

  private async connectPhantom(): Promise<ConnectedWallet> {
    if (typeof window.solana === 'undefined') {
      throw new WalletError('Phantom is not installed', 'WALLET_NOT_INSTALLED', 'phantom')
    }

    try {
      const response = await window.solana.connect()
      
      return {
        id: `phantom-${response.publicKey.toString()}`,
        type: 'phantom',
        address: response.publicKey.toString(),
        chainId: 101, // Solana mainnet
        chainName: 'Solana',
        balance: '0',
        isActive: true,
        connectedAt: new Date().toISOString(),
      }
    } catch (error: any) {
      if (error.code === 4001) {
        throw new WalletError('User rejected the request', 'USER_REJECTED', 'phantom')
      }
      throw error
    }
  }

  private async connectWalletConnect(): Promise<ConnectedWallet> {
    // Mock WalletConnect implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockAddress = '0x' + Math.random().toString(16).substring(2, 42)
        resolve({
          id: `walletconnect-${mockAddress}`,
          type: 'walletconnect',
          address: mockAddress,
          chainId: 1,
          chainName: 'Ethereum',
          balance: '0',
          isActive: true,
          connectedAt: new Date().toISOString(),
        })
      }, 1000)
    })
  }

  private async connectInternetIdentity(): Promise<ConnectedWallet> {
    // Mock Internet Identity implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockPrincipal = 'rdmx6-jaaaa-aaaah-qacaa-cai'
        const uniqueId = `internet-identity-${mockPrincipal}`
        resolve({
          id: uniqueId,
          type: 'internet-identity',
          address: mockPrincipal,
          chainId: 0, // ICP doesn't use traditional chain IDs
          chainName: 'Internet Computer',
          balance: '0',
          isActive: true,
          connectedAt: new Date().toISOString(),
        })
      }, 1500)
    })
  }

  async disconnectWallet(walletId: string): Promise<void> {
    this.connectedWallets = this.connectedWallets.filter(w => w.id !== walletId)
    this.saveWallets()
    this.emit('wallet:disconnected', { id: walletId })
  }

  async disconnectAllWallets(): Promise<void> {
    this.connectedWallets = []
    this.saveWallets()
    this.emit('wallet:disconnected', { all: true })
  }

  async switchChain(walletId: string, chainId: number): Promise<void> {
    const wallet = this.connectedWallets.find(w => w.id === walletId)
    if (!wallet) {
      throw new WalletError('Wallet not found', 'WALLET_NOT_FOUND', 'unknown')
    }

    // Mock chain switching
    wallet.chainId = chainId
    wallet.chainName = this.getChainName(chainId)
    this.saveWallets()
    this.emit('wallet:chainChanged', { wallet, chainId })
  }

  async signMessage(walletId: string, message: string): Promise<string> {
    const wallet = this.connectedWallets.find(w => w.id === walletId)
    if (!wallet) {
      throw new WalletError('Wallet not found', 'WALLET_NOT_FOUND', 'unknown')
    }

    // Mock message signing - in real implementation would use the message
    console.log('Signing message:', message, 'with wallet:', wallet.type)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('0x' + Math.random().toString(16).substring(2, 130))
      }, 1000)
    })
  }

  async updateBalances(): Promise<void> {
    // Mock balance updates
    this.connectedWallets.forEach(wallet => {
      wallet.balance = (Math.random() * 1000).toFixed(6)
    })
    this.saveWallets()
    this.emit('balances:updated')
  }

  getConnectedWallets(): ConnectedWallet[] {
    return [...this.connectedWallets]
  }

  // Clean up localStorage and remove duplicates
  async cleanupStorage(): Promise<void> {
    try {
      // Clear old wallet data
      localStorage.removeItem('btcminer-wallets')
      this.connectedWallets = []
      console.log('✅ Wallet storage cleaned up successfully')
    } catch (error) {
      console.error('Failed to cleanup wallet storage:', error)
    }
  }

  private getChainName(chainId: number): string {
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      56: 'BNB Chain',
      8453: 'Base',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
      101: 'Solana',
    }
    return chainNames[chainId] || `Chain ${chainId}`
  }

  private saveWallets(): void {
    localStorage.setItem('btcminer-wallets', JSON.stringify(this.connectedWallets))
  }
}

export const walletManager = new WalletManager()

// Extend Window interface for wallet objects
declare global {
  interface Window {
    ethereum?: any
    solana?: any
  }
}