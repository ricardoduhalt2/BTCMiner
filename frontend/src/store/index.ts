import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

import { btcMinerApi } from '@services/api'
import walletReducer from './slices/walletSlice'
import portfolioReducer from './slices/portfolioSlice'
import bridgeReducer from './slices/bridgeSlice'
import priceReducer from './slices/priceSlice'
import liquidityReducer from './slices/liquiditySlice'
import identityReducer from './slices/identitySlice'
import uiReducer from './slices/uiSlice'
import notificationReducer from './slices/notificationSlice'

export const store = configureStore({
  reducer: {
    // API
    [btcMinerApi.reducerPath]: btcMinerApi.reducer,
    
    // Feature slices
    wallet: walletReducer,
    portfolio: portfolioReducer,
    bridge: bridgeReducer,
    price: priceReducer,
    liquidity: liquidityReducer,
    identity: identityReducer,
    ui: uiReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['wallet.connectedWallets.connectedAt'],
        ignoredActionsPaths: ['payload.connectedAt'],
      },
    }).concat(btcMinerApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
})

// Enable listener behavior for the store
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch