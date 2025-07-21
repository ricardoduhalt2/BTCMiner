import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface PortfolioState {
  totalValue: number
  totalValueChange: number
  isLoading: boolean
  error: string | null
}

const initialState: PortfolioState = {
  totalValue: 0,
  totalValueChange: 0,
  isLoading: false,
  error: null,
}

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setPortfolioData: (state, action: PayloadAction<{
      totalValue: number
      totalValueChange: number
    }>) => {
      state.totalValue = action.payload.totalValue
      state.totalValueChange = action.payload.totalValueChange
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setPortfolioData, setLoading, setError } = portfolioSlice.actions
export default portfolioSlice.reducer