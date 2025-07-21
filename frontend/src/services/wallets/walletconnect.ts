import { ConnectedWallet, WalletError } from '@types/wallet'
import { ethers } from 'ethers'

// WalletConnect v2 types (simplified for this implementation)
interface WalletConnectProvider {
  connect(): Promise<void>
  disconnect(): Promise<void>
  request(args: { method: string; params?: any[] }): Promise<any>
  on(event: string, listener: (...args: any[]) => void): void
  removeListener(event: string, listener: (...args: any[]) => void): void
  accounts: string[]
  chainId: number
  connected: boolean
}

export class WalletConnectAdapter {
  private provider: WalletConnectProvider | null = null
  private projectId: string

  constructor(projectId: string = 'your-walletconnect-project-id') {
    this.projectId = projectId
  }

  async initialize(): Promise<void> {
    try {
      // In a real implementation, you would initialize WalletConnect v2 here
      // For now, we'll create a mock implementation
      console.log('WalletConnect initialization would happen here')
      
      // Mock provider for demonstration
      this.provider = {
        connect: async () => {
          throw new WalletError('WalletConnect not fully implemented', 'NOT_IMPLEMENTED', 'walletconnect')
        },
        disconnect: async () => {},
        request: async () => {},
        on: () => {},
        removeListener: () => {},
        accounts: [],
        chainId: 1,
        connected: false,
      }
    } catch (error: any) {
      throw new WalletError('Failed to initialize WalletConnect', 'INITIALIZATION_FAILED', 'walletconnect')
    }
  }

  isInstalled(): boolean {
    // WalletConnect doesn't require installation, it's protocol-based
    return true
  }

  async connect(): Promise<ConnectedWallet> {
    if (!this.provider) {
      await this.initialize()
    }

    if (!this.provider) {
      throw new WalletError('WalletConnect provider not available', 'PROVIDER_NOT_AVAILABLE', 'walletconnect')
    }

    try {
      await this.provider.connect()

      if (!this.provider.accounts || this.provider.accounts.length === 0) {
        throw new WalletError('No accounts connected', 'NO_ACCOUNTS', 'walletconnect')
      }

      const account = this.provider.accounts[0]
      const chainId = this.provider.chainId

      // Get balance
      const balance = await this.provider.request({
        method: 'eth_getBalance',
        params: [account, 'latest'],
      })

      return {
        id: `walletconnect-${account}`,
        type: 'walletconnect',
        address: account,
        chainId,
        chainName: this.getChainName(chainId),
        balance: ethers.formatEther(balance),
        isActive: true,
        connectedAt: new Date(),
      }
    } catch (error: any) {
      if (error.message?.includes('User rejected')) {
        throw new WalletError('User rejected connection', 'USER_REJECTED', 'walletconnect')
      }
      throw new WalletError(error.message || 'Failed to connect', 'CONNECTION_FAILED', 'walletconnect')
    }
  }

  async disconnect(): Promise<void> {
    if (this.provider) {
      try {
        await this.provider.disconnect()
      } catch (error) {
        console.warn('Error disconnecting WalletConnect:', error)
      }
    }
  }

  async switchChain(chainId: number): Promise<void> {
    if (!this.provider) {
      throw new WalletError('WalletConnect not available', 'WALLET_NOT_AVAILABLE', 'walletconnect')
    }

    const chainIdHex = `0x${chainId.toString(16)}`

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      })
    } catch (error: any) {
      throw new WalletError(error.message || 'Failed to switch chain', 'CHAIN_SWITCH_FAILED', 'walletconnect')
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.provider) {
      throw new WalletError('WalletConnect not available', 'WALLET_NOT_AVAILABLE', 'walletconnect')
    }

    if (!this.provider.connected || !this.provider.accounts.length) {
      throw new WalletError('WalletConnect not connected', 'WALLET_NOT_CONNECTED', 'walletconnect')
    }

    try {
      return await this.provider.request({
        method: 'personal_sign',
        params: [message, this.provider.accounts[0]],
      })
    } catch (error: any) {
      if (error.message?.includes('User rejected')) {
        throw new WalletError('User rejected signature', 'USER_REJECTED', 'walletconnect')
      }
      throw new WalletError(error.message || 'Failed to sign message', 'SIGN_FAILED', 'walletconnect')
    }
  }

  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (this.provider) {
      this.provider.on('accountsChanged', callback)
    }
  }

  onChainChanged(callback: (chainId: number) => void): void {
    if (this.provider) {
      this.provider.on('chainChanged', callback)
    }
  }

  onDisconnect(callback: () => void): void {
    if (this.provider) {
      this.provider.on('disconnect', callback)
    }
  }

  removeAllListeners(): void {
    if (this.provider) {
      this.provider.removeListener('accountsChanged', () => {})
      this.provider.removeListener('chainChanged', () => {})
      this.provider.removeListener('disconnect', () => {})
    }
  }

  private getChainName(chainId: number): string {
    const chainNames: Record<number, string> = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      56: 'BNB Smart Chain',
      97: 'BNB Smart Chain Testnet',
      137: 'Polygon Mainnet',
      80001: 'Polygon Mumbai',
      8453: 'Base Mainnet',
      84531: 'Base Goerli',
      42161: 'Arbitrum One',
      421613: 'Arbitrum Goerli',
      10: 'Optimism',
      420: 'Optimism Goerli',
    }
    return chainNames[chainId] || `Chain ${chainId}`
  }
}

// Factory function to create WalletConnect adapter
export const createWalletConnectAdapter = (projectId?: string) => {
  return new WalletConnectAdapter(projectId)
}