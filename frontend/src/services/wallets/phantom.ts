import { ConnectedWallet, WalletError } from '@types/wallet'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'

declare global {
  interface Window {
    solana?: any
  }
}

export class PhantomAdapter {
  private provider: any = null
  private connection: Connection

  constructor() {
    if (typeof window !== 'undefined' && window.solana?.isPhantom) {
      this.provider = window.solana
    }
    // Use Solana mainnet RPC
    this.connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed')
  }

  isInstalled(): boolean {
    return !!(typeof window !== 'undefined' && window.solana?.isPhantom)
  }

  async connect(): Promise<ConnectedWallet> {
    if (!this.isInstalled()) {
      throw new WalletError('Phantom wallet not installed', 'WALLET_NOT_INSTALLED', 'phantom')
    }

    try {
      const response = await this.provider.connect()
      
      if (!response.publicKey) {
        throw new WalletError('No public key received', 'NO_PUBLIC_KEY', 'phantom')
      }

      // Get balance
      const publicKey = new PublicKey(response.publicKey.toString())
      const balance = await this.connection.getBalance(publicKey)

      return {
        id: `phantom-${response.publicKey.toString()}`,
        type: 'phantom',
        address: response.publicKey.toString(),
        chainId: 101, // Solana mainnet
        chainName: 'Solana Mainnet',
        balance: (balance / LAMPORTS_PER_SOL).toString(),
        isActive: true,
        connectedAt: new Date(),
        publicKey: response.publicKey.toString(),
      }
    } catch (error: any) {
      if (error.code === 4001 || error.message?.includes('User rejected')) {
        throw new WalletError('User rejected connection', 'USER_REJECTED', 'phantom')
      }
      throw new WalletError(error.message || 'Failed to connect', 'CONNECTION_FAILED', 'phantom')
    }
  }

  async disconnect(): Promise<void> {
    if (this.provider) {
      try {
        await this.provider.disconnect()
      } catch (error) {
        console.warn('Error disconnecting Phantom:', error)
      }
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.provider) {
      throw new WalletError('Phantom not available', 'WALLET_NOT_AVAILABLE', 'phantom')
    }

    if (!this.provider.isConnected) {
      throw new WalletError('Phantom not connected', 'WALLET_NOT_CONNECTED', 'phantom')
    }

    try {
      const encodedMessage = new TextEncoder().encode(message)
      const signedMessage = await this.provider.signMessage(encodedMessage, 'utf8')
      
      // Convert signature to hex string
      return Array.from(signedMessage.signature, byte => 
        byte.toString(16).padStart(2, '0')
      ).join('')
    } catch (error: any) {
      if (error.code === 4001 || error.message?.includes('User rejected')) {
        throw new WalletError('User rejected signature', 'USER_REJECTED', 'phantom')
      }
      throw new WalletError(error.message || 'Failed to sign message', 'SIGN_FAILED', 'phantom')
    }
  }

  async signTransaction(transaction: any): Promise<any> {
    if (!this.provider) {
      throw new WalletError('Phantom not available', 'WALLET_NOT_AVAILABLE', 'phantom')
    }

    if (!this.provider.isConnected) {
      throw new WalletError('Phantom not connected', 'WALLET_NOT_CONNECTED', 'phantom')
    }

    try {
      return await this.provider.signTransaction(transaction)
    } catch (error: any) {
      if (error.code === 4001 || error.message?.includes('User rejected')) {
        throw new WalletError('User rejected transaction', 'USER_REJECTED', 'phantom')
      }
      throw new WalletError(error.message || 'Failed to sign transaction', 'SIGN_FAILED', 'phantom')
    }
  }

  async signAndSendTransaction(transaction: any): Promise<string> {
    if (!this.provider) {
      throw new WalletError('Phantom not available', 'WALLET_NOT_AVAILABLE', 'phantom')
    }

    if (!this.provider.isConnected) {
      throw new WalletError('Phantom not connected', 'WALLET_NOT_CONNECTED', 'phantom')
    }

    try {
      const response = await this.provider.signAndSendTransaction(transaction)
      return response.signature
    } catch (error: any) {
      if (error.code === 4001 || error.message?.includes('User rejected')) {
        throw new WalletError('User rejected transaction', 'USER_REJECTED', 'phantom')
      }
      throw new WalletError(error.message || 'Failed to send transaction', 'TRANSACTION_FAILED', 'phantom')
    }
  }

  onConnect(callback: () => void): void {
    if (this.provider) {
      this.provider.on('connect', callback)
    }
  }

  onDisconnect(callback: () => void): void {
    if (this.provider) {
      this.provider.on('disconnect', callback)
    }
  }

  onAccountChanged(callback: (publicKey: PublicKey | null) => void): void {
    if (this.provider) {
      this.provider.on('accountChanged', callback)
    }
  }

  removeAllListeners(): void {
    if (this.provider) {
      this.provider.removeAllListeners()
    }
  }

  async getBalance(publicKey: string): Promise<number> {
    try {
      const pubKey = new PublicKey(publicKey)
      const balance = await this.connection.getBalance(pubKey)
      return balance / LAMPORTS_PER_SOL
    } catch (error) {
      console.error('Error getting balance:', error)
      return 0
    }
  }

  async getTokenAccounts(publicKey: string): Promise<any[]> {
    try {
      const pubKey = new PublicKey(publicKey)
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(pubKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      })
      
      return tokenAccounts.value.map(account => ({
        pubkey: account.pubkey.toString(),
        mint: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
      }))
    } catch (error) {
      console.error('Error getting token accounts:', error)
      return []
    }
  }
}