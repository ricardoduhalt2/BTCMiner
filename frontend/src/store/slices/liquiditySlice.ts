import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LiquidityPosition } from '../../types/liquidity'

interface LiquidityState {
  positions: LiquidityPosition[]
  totalLiquidity: number
  isLoading: boolean
  error: string | null
}

const initialState: LiquidityState = {
  positions: [],
  totalLiquidity: 0,
  isLoading: false,
  error: null,
}

const liquiditySlice = createSlice({
  name: 'liquidity',
  initialState,
  reducers: {
    setPositions: (state, action: PayloadAction<LiquidityPosition[]>) => {
      state.positions = action.payload
    },
    setTotalLiquidity: (state, action: PayloadAction<number>) => {
      state.totalLiquidity = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setPositions, setTotalLiquidity, setLoading, setError } = liquiditySlice.actions
export default liquiditySlice.reducer