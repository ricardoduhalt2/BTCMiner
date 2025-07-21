import { WalletError, WalletType } from '@types/wallet'

export const handleWalletError = (error: any, walletType: WalletType): WalletError => {
  if (error instanceof WalletError) {
    return error
  }

  // MetaMask specific errors
  if (walletType === 'metamask') {
    if (error.code === 4001) {
      return new WalletError('User rejected the request', 'USER_REJECTED', walletType)
    }
    if (error.code === -32002) {
      return new WalletError('Request already pending', 'REQUEST_PENDING', walletType)
    }
    if (error.code === 4902) {
      return new WalletError('Chain not added to wallet', 'CHAIN_NOT_ADDED', walletType)
    }
    if (error.message?.includes('No Ethereum provider')) {
      return new WalletError('MetaMask not installed', 'WALLET_NOT_INSTALLED', walletType)
    }
  }

  // Phantom specific errors
  if (walletType === 'phantom') {
    if (error.code === 4001 || error.message?.includes('User rejected')) {
      return new WalletError('User rejected the request', 'USER_REJECTED', walletType)
    }
    if (error.message?.includes('Phantom not found')) {
      return new WalletError('Phantom wallet not installed', 'WALLET_NOT_INSTALLED', walletType)
    }
  }

  // WalletConnect specific errors
  if (walletType === 'walletconnect') {
    if (error.message?.includes('User rejected')) {
      return new WalletError('User rejected connection', 'USER_REJECTED', walletType)
    }
    if (error.message?.includes('No provider')) {
      return new WalletError('WalletConnect provider not available', 'PROVIDER_NOT_AVAILABLE', walletType)
    }
  }

  // Internet Identity specific errors
  if (walletType === 'internet-identity') {
    if (error.message?.includes('UserInterrupt')) {
      return new WalletError('User cancelled authentication', 'USER_REJECTED', walletType)
    }
    if (error.message?.includes('anonymous')) {
      return new WalletError('Authentication failed', 'AUTHENTICATION_FAILED', walletType)
    }
  }

  // Generic errors
  if (error.message?.includes('network')) {
    return new WalletError('Network error occurred', 'NETWORK_ERROR', walletType)
  }

  if (error.message?.includes('timeout')) {
    return new WalletError('Request timed out', 'TIMEOUT', walletType)
  }

  return new WalletError(
    error.message || 'Unknown wallet error occurred',
    'UNKNOWN_ERROR',
    walletType
  )
}

export const getErrorMessage = (error: WalletError): string => {
  const messages: Record<string, string> = {
    WALLET_NOT_INSTALLED: `${error.walletType.charAt(0).toUpperCase() + error.walletType.slice(1)} is not installed. Please install it first.`,
    USER_REJECTED: 'Request was rejected by user',
    REQUEST_PENDING: 'A request is already pending. Please check your wallet.',
    CHAIN_NOT_ADDED: 'This network is not added to your wallet. Please add it manually.',
    PROVIDER_NOT_AVAILABLE: 'Wallet provider is not available',
    AUTHENTICATION_FAILED: 'Authentication failed. Please try again.',
    NETWORK_ERROR: 'Network error occurred. Please check your connection.',
    TIMEOUT: 'Request timed out. Please try again.',
    CONNECTION_FAILED: 'Failed to connect to wallet',
    CHAIN_SWITCH_FAILED: 'Failed to switch network',
    SIGN_FAILED: 'Failed to sign message',
    TRANSACTION_FAILED: 'Transaction failed',
    UNKNOWN_ERROR: 'An unknown error occurred',
  }

  return messages[error.code] || error.message
}

export const isRetryableError = (error: WalletError): boolean => {
  const retryableCodes = [
    'NETWORK_ERROR',
    'TIMEOUT',
    'CONNECTION_FAILED',
    'REQUEST_PENDING'
  ]
  
  return retryableCodes.includes(error.code)
}

export const shouldShowInstallPrompt = (error: WalletError): boolean => {
  return error.code === 'WALLET_NOT_INSTALLED'
}

export const getInstallUrl = (walletType: WalletType): string | null => {
  const installUrls: Record<WalletType, string> = {
    metamask: 'https://metamask.io/download/',
    phantom: 'https://phantom.app/',
    walletconnect: '', // WalletConnect doesn't require installation
    'internet-identity': '', // Internet Identity is web-based
  }
  
  return installUrls[walletType] || null
}