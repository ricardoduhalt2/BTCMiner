import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface PriceState {
  currentPrice: number
  priceChange24h: number
  isLoading: boolean
  error: string | null
}

const initialState: PriceState = {
  currentPrice: 0,
  priceChange24h: 0,
  isLoading: false,
  error: null,
}

const priceSlice = createSlice({
  name: 'price',
  initialState,
  reducers: {
    setPriceData: (state, action: PayloadAction<{
      currentPrice: number
      priceChange24h: number
    }>) => {
      state.currentPrice = action.payload.currentPrice
      state.priceChange24h = action.payload.priceChange24h
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setPriceData, setLoading, setError } = priceSlice.actions
export default priceSlice.reducer