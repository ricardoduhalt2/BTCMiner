import { ConnectedWallet, WalletError, NetworkSwitchRequest } from '@types/wallet'
import { ethers } from 'ethers'

declare global {
  interface Window {
    ethereum?: any
  }
}

export class MetaMaskAdapter {
  private provider: any = null

  constructor() {
    if (typeof window !== 'undefined' && window.ethereum?.isMetaMask) {
      this.provider = window.ethereum
    }
  }

  isInstalled(): boolean {
    return !!(typeof window !== 'undefined' && window.ethereum?.isMetaMask)
  }

  async connect(): Promise<ConnectedWallet> {
    if (!this.isInstalled()) {
      throw new WalletError('MetaMask not installed', 'WALLET_NOT_INSTALLED', 'metamask')
    }

    try {
      // Request account access
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts',
      })

      if (!accounts || accounts.length === 0) {
        throw new WalletError('No accounts found', 'NO_ACCOUNTS', 'metamask')
      }

      // Get chain ID
      const chainId = await this.provider.request({
        method: 'eth_chainId',
      })

      // Get balance
      const balance = await this.provider.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest'],
      })

      const chainName = this.getChainName(parseInt(chainId, 16))

      return {
        id: `metamask-${accounts[0]}`,
        type: 'metamask',
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        chainName,
        balance: ethers.formatEther(balance),
        isActive: true,
        connectedAt: new Date(),
      }
    } catch (error: any) {
      if (error.code === 4001) {
        throw new WalletError('User rejected connection', 'USER_REJECTED', 'metamask')
      }
      if (error.code === -32002) {
        throw new WalletError('Connection request already pending', 'REQUEST_PENDING', 'metamask')
      }
      throw new WalletError(error.message || 'Failed to connect', 'CONNECTION_FAILED', 'metamask')
    }
  }

  async disconnect(): Promise<void> {
    // MetaMask doesn't have a programmatic disconnect method
    // The user needs to disconnect manually from the extension
    console.log('MetaMask disconnection requested - user must disconnect manually from extension')
  }

  async switchChain(chainId: number): Promise<void> {
    if (!this.provider) {
      throw new WalletError('MetaMask not available', 'WALLET_NOT_AVAILABLE', 'metamask')
    }

    const chainIdHex = `0x${chainId.toString(16)}`

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      })
    } catch (error: any) {
      // Chain not added to MetaMask
      if (error.code === 4902) {
        const networkConfig = this.getNetworkConfig(chainId)
        if (networkConfig) {
          await this.addChain(networkConfig)
          // Try switching again after adding
          await this.provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chainIdHex }],
          })
        } else {
          throw new WalletError(`Unsupported chain ID: ${chainId}`, 'UNSUPPORTED_CHAIN', 'metamask')
        }
      } else {
        throw new WalletError(error.message || 'Failed to switch chain', 'CHAIN_SWITCH_FAILED', 'metamask')
      }
    }
  }

  async addChain(networkConfig: NetworkSwitchRequest): Promise<void> {
    if (!this.provider) {
      throw new WalletError('MetaMask not available', 'WALLET_NOT_AVAILABLE', 'metamask')
    }

    try {
      await this.provider.request({
        method: 'wallet_addEthereumChain',
        params: [networkConfig],
      })
    } catch (error: any) {
      throw new WalletError(error.message || 'Failed to add chain', 'ADD_CHAIN_FAILED', 'metamask')
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.provider) {
      throw new WalletError('MetaMask not available', 'WALLET_NOT_AVAILABLE', 'metamask')
    }

    try {
      const accounts = await this.provider.request({
        method: 'eth_accounts',
      })

      if (!accounts || accounts.length === 0) {
        throw new WalletError('No accounts connected', 'NO_ACCOUNTS', 'metamask')
      }

      return await this.provider.request({
        method: 'personal_sign',
        params: [message, accounts[0]],
      })
    } catch (error: any) {
      if (error.code === 4001) {
        throw new WalletError('User rejected signature', 'USER_REJECTED', 'metamask')
      }
      throw new WalletError(error.message || 'Failed to sign message', 'SIGN_FAILED', 'metamask')
    }
  }

  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (this.provider) {
      this.provider.on('accountsChanged', callback)
    }
  }

  onChainChanged(callback: (chainId: string) => void): void {
    if (this.provider) {
      this.provider.on('chainChanged', callback)
    }
  }

  removeAllListeners(): void {
    if (this.provider) {
      this.provider.removeAllListeners('accountsChanged')
      this.provider.removeAllListeners('chainChanged')
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

  private getNetworkConfig(chainId: number): NetworkSwitchRequest | null {
    const networks: Record<number, NetworkSwitchRequest> = {
      56: {
        chainId: 56,
        chainName: 'BNB Smart Chain',
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com'],
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18,
        },
      },
      8453: {
        chainId: 8453,
        chainName: 'Base',
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org'],
        nativeCurrency: {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
        },
      },
      137: {
        chainId: 137,
        chainName: 'Polygon',
        rpcUrls: ['https://polygon-rpc.com/'],
        blockExplorerUrls: ['https://polygonscan.com'],
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18,
        },
      },
    }
    return networks[chainId] || null
  }
}