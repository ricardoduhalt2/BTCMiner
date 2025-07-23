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
    console.log('🚀 Attempting to connect to MetaMask...')
    
    // Verificar si window.ethereum está disponible de manera segura
    let ethereum = (window as any).ethereum
    
    // Verificar si hay múltiples proveedores inyectados
    if (ethereum?.providers?.length > 0) {
      console.log('🔍 Multiple Ethereum providers detected:', ethereum.providers)
      
      // Buscar específicamente MetaMask
      let metaMaskProvider = ethereum.providers.find(
        (p: any) => p.isMetaMask
      )
      
      // Si no encontramos MetaMask, buscar cualquier proveedor que tenga el método request
      if (!metaMaskProvider) {
        console.log('🔍 MetaMask not found, looking for any provider with request method...')
        metaMaskProvider = ethereum.providers.find(
          (p: any) => typeof p.request === 'function'
        )
      }
      
      if (metaMaskProvider) {
        console.log('✅ Found provider:', metaMaskProvider)
        // Usar el proveedor seleccionado directamente
        ethereum = metaMaskProvider
        // Actualizar la referencia global
        ;(window as any).ethereum = ethereum
      } else {
        console.warn('⚠️ No suitable provider found, using first available')
        ethereum = ethereum.providers[0]
      }
    }
    
    if (!ethereum) {
      console.error('❌ MetaMask not found in window.ethereum')
      throw new WalletError(
        'MetaMask is not installed. Please install the MetaMask extension and refresh the page.',
        'WALLET_NOT_INSTALLED',
        'metamask'
      )
    }
    
    // Verificar si hay una extensión conflictiva
    if (ethereum.isBraveWallet) {
      console.warn('⚠️ Detected Brave Wallet, which might interfere with MetaMask')
    }
    
    // Verificar métodos disponibles
    console.log('🔍 Available methods:', 
      Object.keys(ethereum)
        .filter(k => typeof (ethereum as any)[k] === 'function')
        .join(', ')
    )

    console.log('✅ window.ethereum found, checking if MetaMask is available...')

    try {
      // Verificar si es MetaMask
      const isMetaMask = ethereum.isMetaMask
      console.log('🔍 isMetaMask:', isMetaMask)
      
      if (!isMetaMask) {
        console.error('❌ MetaMask not detected in window.ethereum.isMetaMask')
        throw new WalletError(
          'Please make sure MetaMask is installed and unlocked.',
          'WALLET_NOT_DETECTED',
          'metamask'
        )
      }
      
      console.log('🔌 MetaMask detected, attempting to connect...')
      
      // Función auxiliar para hacer la solicitud de manera segura
      const safeRequest = async (method: string, params: any[] = []) => {
        const requestId = Date.now()
        const logPrefix = `[${requestId}]`
        
        try {
          console.log(`${logPrefix} 🔵 Sending request: ${method}`, params)
          
          // 1. Intentar con el método request estándar
          if (typeof ethereum.request === 'function') {
            try {
              console.log(`${logPrefix} Using ethereum.request...`)
              const result = await ethereum.request({ 
                method, 
                params,
                jsonrpc: '2.0',
                id: requestId,
              })
              console.log(`${logPrefix} 🟢 Response from ${method}:`, result)
              return result
            } catch (error) {
              console.error(`${logPrefix} 🔴 Error in ethereum.request:`, error)
              // No lanzar error todavía, intentar con otros métodos
            }
          }
          
          // 2. Si el método es eth_requestAccounts, intentar con ethereum.enable()
          if (method === 'eth_requestAccounts' && typeof ethereum.enable === 'function') {
            try {
              console.log(`${logPrefix} ⚠️ Trying ethereum.enable()...`)
              const result = await ethereum.enable()
              console.log(`${logPrefix} 🟢 ethereum.enable() result:`, result)
              return result
            } catch (error) {
              console.error(`${logPrefix} 🔴 Error in ethereum.enable():`, error)
            }
          }
          
          // 3. Intentar con sendAsync
          if (typeof ethereum.sendAsync === 'function') {
            try {
              console.log(`${logPrefix} Trying ethereum.sendAsync...`)
              return await new Promise((resolve, reject) => {
                ethereum.sendAsync({
                  method,
                  params,
                  from: ethereum.selectedAddress,
                  jsonrpc: '2.0',
                  id: requestId,
                }, (err: any, result: any) => {
                  if (err) {
                    console.error(`${logPrefix} 🔴 Error in sendAsync:`, err)
                    reject(err)
                  } else {
                    console.log(`${logPrefix} 🟢 sendAsync result:`, result)
                    resolve(result?.result)
                  }
                })
              })
            } catch (error) {
              console.error(`${logPrefix} 🔴 Error in sendAsync:`, error)
            }
          }
          
          // 4. Si todo falla, lanzar un error
          const error = new Error(`No se pudo completar la solicitud: ${method}`)
          console.error(`${logPrefix} ❌ No compatible provider methods found`)
          console.error(`${logPrefix} Available methods:`, 
            Object.keys(ethereum)
              .filter(k => typeof (ethereum as any)[k] === 'function')
              .join(', ')
          )
          throw error
          
        } catch (error) {
          console.error(`${logPrefix} ❌ Error in safeRequest(${method}):`, error)
          throw error
        }
      }
      
      // Obtener cuentas
      let accounts: string[] = []
      try {
        // Intentar obtener cuentas existentes primero
        accounts = await safeRequest('eth_accounts') as string[]
        console.log('📋 Existing accounts:', accounts)
        
        // Si no hay cuentas, solicitar acceso
        if (!accounts || accounts.length === 0) {
          console.log('🔓 No existing accounts, requesting access...')
          accounts = await safeRequest('eth_requestAccounts') as string[]
          console.log('🔑 Accounts after request:', accounts)
        }
        
        if (!accounts || accounts.length === 0) {
          throw new WalletError(
            'No accounts available. Please unlock MetaMask and try again.',
            'NO_ACCOUNTS',
            'metamask'
          )
        }
      } catch (error: any) {
        console.error('❌ Error requesting accounts:', error)
        if (error.code === 4001 || error.code === -32002) {
          throw new WalletError(
            'You have rejected the connection request or have a pending request.',
            'USER_REJECTED',
            'metamask'
          )
        }
        throw new WalletError(
          error.message || 'Failed to connect to MetaMask',
          'CONNECTION_FAILED',
          'metamask'
        )
      }
      
      // Obtener el chainId
      let chainId: string
      try {
        chainId = await safeRequest('eth_chainId') as string
        console.log('🌐 Chain ID:', chainId)
      } catch (error) {
        console.error('❌ Error getting chain ID:', error)
        chainId = '0x1' // Valor por defecto (Ethereum Mainnet)
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