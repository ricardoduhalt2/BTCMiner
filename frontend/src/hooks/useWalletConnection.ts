import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import {
  setInitializing,
  connectWalletStart,
  connectWalletSuccess,
  connectWalletFailure,
  disconnectWallet as disconnectWalletAction,
  updateWalletBalance,
  updateWalletChain,
  clearError,
} from '@store/slices/walletSlice'
import { addNotification } from '@store/slices/notificationSlice'
import { WalletType, ConnectedWallet, WalletError } from '@types/wallet'
import { walletManager } from '@services/walletManager'

export const useWalletConnection = () => {
  const dispatch = useAppDispatch()
  const { 
    connectedWallets, 
    isConnecting, 
    isInitializing, 
    error, 
    selectedWallet 
  } = useAppSelector(state => state.wallet)

  // Initialize wallet connections on app start
  useEffect(() => {
    const initializeWallets = async () => {
      try {
        // Clear any existing duplicates from localStorage first
        localStorage.removeItem('btcminer-wallets')
        
        // Restore previous connections
        await walletManager.restoreConnections()
        
        // Sync with Redux store
        const wallets = walletManager.getConnectedWallets()
        wallets.forEach(wallet => {
          dispatch(connectWalletSuccess(wallet))
        })
      } catch (error) {
        console.error('Failed to initialize wallets:', error)
      } finally {
        dispatch(setInitializing(false))
      }
    }

    // Only initialize once
    if (isInitializing) {
      initializeWallets()
    }
  }, [dispatch, isInitializing])

  // Set up wallet manager event listeners
  useEffect(() => {
    const handleWalletConnected = (wallet: ConnectedWallet) => {
      // Only add if not already in Redux store
      const existingWallet = connectedWallets.find(w => w.id === wallet.id)
      if (!existingWallet) {
        dispatch(connectWalletSuccess(wallet))
        dispatch(addNotification({
          type: 'system',
          priority: 'medium',
          title: 'Wallet Connected',
          message: `${wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)} wallet connected successfully!`
        }))
      }
    }

    const handleWalletDisconnected = (data: any) => {
      if (data.walletType) {
        // Handle by wallet type
        const walletsToRemove = connectedWallets.filter(w => w.type === data.walletType)
        walletsToRemove.forEach(wallet => {
          dispatch(disconnectWalletAction(wallet.id))
        })
      } else if (data.id) {
        // Handle specific wallet
        dispatch(disconnectWalletAction(data.id))
      }
      
      dispatch(addNotification({
        type: 'system',
        priority: 'low',
        title: 'Wallet Disconnected',
        message: 'Wallet disconnected'
      }))
    }

    const handleAccountsChanged = (data: { walletType: WalletType; accounts: string[] }) => {
      if (data.accounts.length === 0) {
        // All accounts disconnected
        const walletsToRemove = connectedWallets.filter(w => w.type === data.walletType)
        walletsToRemove.forEach(wallet => {
          dispatch(disconnectWalletAction(wallet.id))
        })
        
        dispatch(addNotification({
          type: 'security',
          priority: 'medium',
          title: 'Accounts Disconnected',
          message: `${data.walletType} accounts disconnected`
        }))
      }
    }

    const handleChainChanged = (data: { walletType?: WalletType; wallet?: ConnectedWallet; chainId: number }) => {
      if (data.wallet) {
        dispatch(updateWalletChain({
          walletId: data.wallet.id,
          chainId: data.chainId,
          chainName: data.wallet.chainName
        }))
      } else if (data.walletType) {
        // Update all wallets of this type
        const walletsToUpdate = connectedWallets.filter(w => w.type === data.walletType)
        walletsToUpdate.forEach(wallet => {
          dispatch(updateWalletChain({
            walletId: wallet.id,
            chainId: data.chainId,
            chainName: walletManager.getChainName ? walletManager.getChainName(data.chainId) : `Chain ${data.chainId}`
          }))
        })
      }
      
      dispatch(addNotification({
        type: 'system',
        priority: 'low',
        title: 'Network Switched',
        message: `Network switched to chain ${data.chainId}`
      }))
    }

    const handleBalancesUpdated = () => {
      const wallets = walletManager.getConnectedWallets()
      wallets.forEach(wallet => {
        dispatch(updateWalletBalance({
          walletId: wallet.id,
          chainId: wallet.chainId.toString(),
          balance: wallet.balance
        }))
      })
    }

    // Register event listeners
    walletManager.on('wallet:connected', handleWalletConnected)
    walletManager.on('wallet:disconnected', handleWalletDisconnected)
    walletManager.on('wallet:accountsChanged', handleAccountsChanged)
    walletManager.on('wallet:chainChanged', handleChainChanged)
    walletManager.on('balances:updated', handleBalancesUpdated)

    // Cleanup
    return () => {
      walletManager.off('wallet:connected', handleWalletConnected)
      walletManager.off('wallet:disconnected', handleWalletDisconnected)
      walletManager.off('wallet:accountsChanged', handleAccountsChanged)
      walletManager.off('wallet:chainChanged', handleChainChanged)
      walletManager.off('balances:updated', handleBalancesUpdated)
    }
  }, [dispatch, connectedWallets])

  const connectWallet = useCallback(async (walletType: WalletType) => {
    dispatch(connectWalletStart())
    dispatch(clearError())
    
    try {
      const wallet = await walletManager.connectWallet(walletType)
      // Success is handled by the event listener automatically
      // No need to dispatch here as the event listener will handle it
    } catch (error: any) {
      let errorMessage = 'Failed to connect wallet'
      
      if (error instanceof WalletError) {
        switch (error.code) {
          case 'WALLET_NOT_INSTALLED':
            errorMessage = `${walletType.charAt(0).toUpperCase() + walletType.slice(1)} is not installed. Please install it first.`
            break
          case 'USER_REJECTED':
            errorMessage = 'Connection was rejected by user'
            break
          case 'REQUEST_PENDING':
            errorMessage = 'Connection request is already pending'
            break
          default:
            errorMessage = error.message
        }
      }
      
      dispatch(connectWalletFailure(errorMessage))
      dispatch(addNotification({
        type: 'security',
        priority: 'high',
        title: 'Wallet Connection Failed',
        message: errorMessage
      }))
    }
  }, [dispatch])

  const disconnectWallet = useCallback(async (walletId: string) => {
    try {
      await walletManager.disconnectWallet(walletId)
      // Success is handled by the event listener
    } catch (error: any) {
      console.error('Failed to disconnect wallet:', error)
      dispatch(addNotification({
        type: 'system',
        priority: 'medium',
        title: 'Disconnect Failed',
        message: 'Failed to disconnect wallet'
      }))
    }
  }, [dispatch])

  const disconnectAllWallets = useCallback(async () => {
    try {
      await walletManager.disconnectAllWallets()
      dispatch(addNotification({
        type: 'system',
        priority: 'low',
        title: 'All Wallets Disconnected',
        message: 'All wallets disconnected'
      }))
    } catch (error: any) {
      console.error('Failed to disconnect all wallets:', error)
      dispatch(addNotification({
        type: 'system',
        priority: 'high',
        title: 'Disconnect All Failed',
        message: 'Failed to disconnect all wallets'
      }))
    }
  }, [dispatch])

  const switchChain = useCallback(async (walletId: string, chainId: number) => {
    try {
      await walletManager.switchChain(walletId, chainId)
      // Success is handled by the event listener
    } catch (error: any) {
      let errorMessage = 'Failed to switch network'
      
      if (error instanceof WalletError) {
        switch (error.code) {
          case 'CHAIN_SWITCH_NOT_SUPPORTED':
            errorMessage = 'Network switching is not supported for this wallet'
            break
          case 'USER_REJECTED':
            errorMessage = 'Network switch was rejected by user'
            break
          default:
            errorMessage = error.message
        }
      }
      
      dispatch(addNotification({
        type: 'system',
        priority: 'medium',
        title: 'Network Switch Failed',
        message: errorMessage
      }))
    }
  }, [dispatch])

  const signMessage = useCallback(async (walletId: string, message: string): Promise<string | null> => {
    try {
      const signature = await walletManager.signMessage(walletId, message)
      dispatch(addNotification({
        type: 'system',
        priority: 'medium',
        title: 'Message Signed',
        message: 'Message signed successfully'
      }))
      return signature
    } catch (error: any) {
      let errorMessage = 'Failed to sign message'
      
      if (error instanceof WalletError) {
        switch (error.code) {
          case 'SIGN_NOT_SUPPORTED':
            errorMessage = 'Message signing is not supported for this wallet'
            break
          case 'USER_REJECTED':
            errorMessage = 'Message signing was rejected by user'
            break
          default:
            errorMessage = error.message
        }
      }
      
      dispatch(addNotification({
        type: 'system',
        priority: 'high',
        title: 'Message Signing Failed',
        message: errorMessage
      }))
      return null
    }
  }, [dispatch])

  const updateBalances = useCallback(async () => {
    try {
      await walletManager.updateBalances()
      // Success is handled by the event listener
    } catch (error: any) {
      console.error('Failed to update balances:', error)
    }
  }, [])

  return {
    connectedWallets,
    isConnecting,
    isInitializing,
    error,
    selectedWallet,
    connectWallet,
    disconnectWallet,
    disconnectAllWallets,
    switchChain,
    signMessage,
    updateBalances,
  }
}