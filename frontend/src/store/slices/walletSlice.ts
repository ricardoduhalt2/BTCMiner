import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ConnectedWallet {
  id: string
  type: 'metamask' | 'phantom' | 'walletconnect' | 'internet-identity'
  address: string
  chainId: number
  chainName: string
  balance: string
  isActive: boolean
  connectedAt: string // Changed from Date to string for serialization
}

interface WalletState {
  connectedWallets: ConnectedWallet[]
  isConnecting: boolean
  isInitializing: boolean
  error: string | null
  selectedWallet: string | null
  balances: Record<string, Record<string, string>>
}

const initialState: WalletState = {
  connectedWallets: [],
  isConnecting: false,
  isInitializing: true,
  error: null,
  selectedWallet: null,
  balances: {},
}

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setInitializing: (state, action: PayloadAction<boolean>) => {
      state.isInitializing = action.payload
    },
    connectWalletStart: (state) => {
      state.isConnecting = true
      state.error = null
    },
    connectWalletSuccess: (state, action: PayloadAction<ConnectedWallet>) => {
      state.connectedWallets.push(action.payload)
      state.isConnecting = false
      state.error = null
      if (!state.selectedWallet) {
        state.selectedWallet = action.payload.id
      }
    },
    connectWalletFailure: (state, action: PayloadAction<string>) => {
      state.isConnecting = false
      state.error = action.payload
    },
    disconnectWallet: (state, action: PayloadAction<string>) => {
      state.connectedWallets = state.connectedWallets.filter(
        wallet => wallet.id !== action.payload
      )
      if (state.selectedWallet === action.payload) {
        state.selectedWallet = state.connectedWallets.length > 0 
          ? state.connectedWallets[0].id 
          : null
      }
    },
    updateWalletBalance: (state, action: PayloadAction<{
      walletId: string
      chainId: string
      balance: string
    }>) => {
      const { walletId, chainId, balance } = action.payload
      if (!state.balances[walletId]) {
        state.balances[walletId] = {}
      }
      state.balances[walletId][chainId] = balance
      
      // Update wallet balance in connectedWallets
      const wallet = state.connectedWallets.find(w => w.id === walletId)
      if (wallet) {
        wallet.balance = balance
      }
    },
    updateWalletChain: (state, action: PayloadAction<{
      walletId: string
      chainId: number
      chainName: string
    }>) => {
      const { walletId, chainId, chainName } = action.payload
      const wallet = state.connectedWallets.find(w => w.id === walletId)
      if (wallet) {
        wallet.chainId = chainId
        wallet.chainName = chainName
      }
    },
    setSelectedWallet: (state, action: PayloadAction<string>) => {
      state.selectedWallet = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setInitializing,
  connectWalletStart,
  connectWalletSuccess,
  connectWalletFailure,
  disconnectWallet,
  updateWalletBalance,
  updateWalletChain,
  setSelectedWallet,
  clearError,
} = walletSlice.actions

export default walletSlice.reducer