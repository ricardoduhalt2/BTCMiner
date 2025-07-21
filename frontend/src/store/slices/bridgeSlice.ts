import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface BridgeState {
  isTransferring: boolean
  transferHistory: any[]
  error: string | null
}

const initialState: BridgeState = {
  isTransferring: false,
  transferHistory: [],
  error: null,
}

const bridgeSlice = createSlice({
  name: 'bridge',
  initialState,
  reducers: {
    setTransferring: (state, action: PayloadAction<boolean>) => {
      state.isTransferring = action.payload
    },
    addTransfer: (state, action: PayloadAction<any>) => {
      state.transferHistory.unshift(action.payload)
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setTransferring, addTransfer, setError } = bridgeSlice.actions
export default bridgeSlice.reducer