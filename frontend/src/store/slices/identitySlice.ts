import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface IdentityState {
  isAuthenticated: boolean
  principal: string | null
  profile: any | null
  isLoading: boolean
  error: string | null
}

const initialState: IdentityState = {
  isAuthenticated: false,
  principal: null,
  profile: null,
  isLoading: false,
  error: null,
}

const identitySlice = createSlice({
  name: 'identity',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload
    },
    setPrincipal: (state, action: PayloadAction<string | null>) => {
      state.principal = action.payload
    },
    setProfile: (state, action: PayloadAction<any | null>) => {
      state.profile = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setAuthenticated, setPrincipal, setProfile, setLoading, setError } = identitySlice.actions
export default identitySlice.reducer