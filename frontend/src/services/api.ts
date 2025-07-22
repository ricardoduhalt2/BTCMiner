import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { 
  UserService,
  ConnectedWalletsService,
  TransactionsService,
  PriceDataService,
  PriceAlertsService,
  LiquidityPositionsService,
  LiquidityPoolsService,
  NotificationsService,
  PortfolioSnapshotsService,
  TradingHistoryService,
  BridgeTransfersService,
  AnalyticsEventsService
} from './supabaseService'
import { Database } from '../types/supabase'

type Tables = Database['public']['Tables']

export const btcMinerApi = createApi({
  reducerPath: 'btcMinerApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    'User', 
    'Wallets', 
    'Portfolio', 
    'Prices', 
    'Transactions', 
    'Liquidity', 
    'Notifications',
    'PriceAlerts',
    'TradingHistory',
    'BridgeTransfers'
  ],
  endpoints: (builder) => ({
    // User endpoints
    getUser: builder.query<Tables['users']['Row'], string>({
      queryFn: async (userId) => {
        try {
          const data = await UserService.getUserById(userId)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      providesTags: ['User'],
    }),

    updateUser: builder.mutation<Tables['users']['Row'], { id: string; updates: Tables['users']['Update'] }>({
      queryFn: async ({ id, updates }) => {
        try {
          const data = await UserService.updateUser(id, updates)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      invalidatesTags: ['User'],
    }),

    // Wallet endpoints
    getUserWallets: builder.query<Tables['connected_wallets']['Row'][], string>({
      queryFn: async (userId) => {
        try {
          const data = await ConnectedWalletsService.getUserWallets(userId)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      providesTags: ['Wallets'],
    }),

    addWallet: builder.mutation<Tables['connected_wallets']['Row'], Tables['connected_wallets']['Insert']>({
      queryFn: async (walletData) => {
        try {
          const data = await ConnectedWalletsService.addWallet(walletData)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      invalidatesTags: ['Wallets'],
    }),

    updateWalletBalance: builder.mutation<Tables['connected_wallets']['Row'], { id: string; balance: string }>({
      queryFn: async ({ id, balance }) => {
        try {
          const data = await ConnectedWalletsService.updateWalletBalance(id, balance)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      invalidatesTags: ['Wallets', 'Portfolio'],
    }),

    // Portfolio endpoints
    getPortfolioSnapshot: builder.query<Tables['portfolio_snapshots']['Row'], string>({
      queryFn: async (userId) => {
        try {
          const data = await PortfolioSnapshotsService.getLatestSnapshot(userId)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      providesTags: ['Portfolio'],
    }),

    getPortfolioHistory: builder.query<Tables['portfolio_snapshots']['Row'][], { userId: string; days?: number }>({
      queryFn: async ({ userId, days = 30 }) => {
        try {
          const data = await PortfolioSnapshotsService.getSnapshotHistory(userId, days)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      providesTags: ['Portfolio'],
    }),

    createPortfolioSnapshot: builder.mutation<Tables['portfolio_snapshots']['Row'], Tables['portfolio_snapshots']['Insert']>({
      queryFn: async (snapshotData) => {
        try {
          const data = await PortfolioSnapshotsService.createSnapshot(snapshotData)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      invalidatesTags: ['Portfolio'],
    }),

    // Price endpoints
    getLatestPrices: builder.query<Tables['price_data']['Row'][], string[]>({
      queryFn: async (symbols) => {
        try {
          const data = await PriceDataService.getLatestPrices(symbols)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      providesTags: ['Prices'],
    }),

    getPriceHistory: builder.query<Tables['price_data']['Row'][], { symbol: string; timeframe: string }>({
      queryFn: async ({ symbol, timeframe }) => {
        try {
          const data = await PriceDataService.getPriceHistory(symbol, timeframe)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      providesTags: ['Prices'],
    }),

    // Price Alerts endpoints
    getUserPriceAlerts: builder.query<Tables['price_alerts']['Row'][], string>({
      queryFn: async (userId) => {
        try {
          const data = await PriceAlertsService.getUserAlerts(userId)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      providesTags: ['PriceAlerts'],
    }),

    createPriceAlert: builder.mutation<Tables['price_alerts']['Row'], Tables['price_alerts']['Insert']>({
      queryFn: async (alertData) => {
        try {
          const data = await PriceAlertsService.createAlert(alertData)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      invalidatesTags: ['PriceAlerts'],
    }),

    updatePriceAlert: builder.mutation<Tables['price_alerts']['Row'], { id: string; updates: Tables['price_alerts']['Update'] }>({
      queryFn: async ({ id, updates }) => {
        try {
          const data = await PriceAlertsService.updateAlert(id, updates)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      invalidatesTags: ['PriceAlerts'],
    }),

    deletePriceAlert: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          await PriceAlertsService.deleteAlert(id)
          return { data: undefined }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      invalidatesTags: ['PriceAlerts'],
    }),

    // Transaction endpoints
    getUserTransactions: builder.query<any, { userId: string; page?: number; limit?: number }>({
      queryFn: async ({ userId, page = 1, limit = 20 }) => {
        try {
          const data = await TransactionsService.getUserTransactions(userId, page, limit)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      providesTags: ['Transactions'],
    }),

    createTransaction: builder.mutation<Tables['transactions']['Row'], Tables['transactions']['Insert']>({
      queryFn: async (transactionData) => {
        try {
          const data = await TransactionsService.createTransaction(transactionData)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      invalidatesTags: ['Transactions', 'Portfolio'],
    }),

    updateTransactionStatus: builder.mutation<Tables['transactions']['Row'], { 
      id: string; 
      status: Tables['transactions']['Row']['status'];
      updates?: Partial<Tables['transactions']['Update']>
    }>({
      queryFn: async ({ id, status, updates }) => {
        try {
          const data = await TransactionsService.updateTransactionStatus(id, status, updates)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      invalidatesTags: ['Transactions'],
    }),

    // Liquidity endpoints
    getUserLiquidityPositions: builder.query<Tables['liquidity_positions']['Row'][], string>({
      queryFn: async (userId) => {
        try {
          const data = await LiquidityPositionsService.getUserPositions(userId)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      providesTags: ['Liquidity'],
    }),

    getAllLiquidityPools: builder.query<Tables['liquidity_pools']['Row'][], void>({
      queryFn: async () => {
        try {
          const data = await LiquidityPoolsService.getAllPools()
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      providesTags: ['Liquidity'],
    }),

    createLiquidityPosition: builder.mutation<Tables['liquidity_positions']['Row'], Tables['liquidity_positions']['Insert']>({
      queryFn: async (positionData) => {
        try {
          const data = await LiquidityPositionsService.createPosition(positionData)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      invalidatesTags: ['Liquidity', 'Portfolio'],
    }),

    // Notification endpoints
    getUserNotifications: builder.query<any, { userId: string; page?: number; limit?: number }>({
      queryFn: async ({ userId, page = 1, limit = 20 }) => {
        try {
          const data = await NotificationsService.getUserNotifications(userId, page, limit)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      providesTags: ['Notifications'],
    }),

    createNotification: builder.mutation<Tables['notifications']['Row'], Tables['notifications']['Insert']>({
      queryFn: async (notificationData) => {
        try {
          const data = await NotificationsService.createNotification(notificationData)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      invalidatesTags: ['Notifications'],
    }),

    markNotificationAsRead: builder.mutation<Tables['notifications']['Row'], string>({
      queryFn: async (id) => {
        try {
          const data = await NotificationsService.markAsRead(id)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      invalidatesTags: ['Notifications'],
    }),

    markAllNotificationsAsRead: builder.mutation<Tables['notifications']['Row'][], string>({
      queryFn: async (userId) => {
        try {
          const data = await NotificationsService.markAllAsRead(userId)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      invalidatesTags: ['Notifications'],
    }),

    // Trading History endpoints
    getUserTradingHistory: builder.query<any, { userId: string; page?: number; limit?: number }>({
      queryFn: async ({ userId, page = 1, limit = 20 }) => {
        try {
          const data = await TradingHistoryService.getUserTrades(userId, page, limit)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      providesTags: ['TradingHistory'],
    }),

    createTrade: builder.mutation<Tables['trading_history']['Row'], Tables['trading_history']['Insert']>({
      queryFn: async (tradeData) => {
        try {
          const data = await TradingHistoryService.createTrade(tradeData)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      invalidatesTags: ['TradingHistory', 'Portfolio'],
    }),

    // Bridge Transfer endpoints
    getUserBridgeTransfers: builder.query<any, { userId: string; page?: number; limit?: number }>({
      queryFn: async ({ userId, page = 1, limit = 20 }) => {
        try {
          const data = await BridgeTransfersService.getUserTransfers(userId, page, limit)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      providesTags: ['BridgeTransfers'],
    }),

    createBridgeTransfer: builder.mutation<Tables['bridge_transfers']['Row'], Tables['bridge_transfers']['Insert']>({
      queryFn: async (transferData) => {
        try {
          const data = await BridgeTransfersService.createTransfer(transferData)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      invalidatesTags: ['BridgeTransfers', 'Transactions', 'Portfolio'],
    }),

    updateBridgeTransferStatus: builder.mutation<Tables['bridge_transfers']['Row'], { 
      id: string; 
      status: Tables['bridge_transfers']['Row']['status'];
      updates?: Partial<Tables['bridge_transfers']['Update']>
    }>({
      queryFn: async ({ id, status, updates }) => {
        try {
          const data = await BridgeTransfersService.updateTransferStatus(id, status, updates)
          return { data }
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error.message } }
        }
      },
      invalidatesTags: ['BridgeTransfers'],
    }),

    // Analytics endpoint
    trackEvent: builder.mutation<Tables['analytics_events']['Row'] | null, Tables['analytics_events']['Insert']>({
      queryFn: async (eventData) => {
        try {
          const data = await AnalyticsEventsService.trackEvent(eventData)
          return { data }
        } catch (error) {
          // Don't return error for analytics to avoid disrupting user experience
          return { data: null }
        }
      },
    }),
  }),
})

export const {
  // User hooks
  useGetUserQuery,
  useUpdateUserMutation,
  
  // Wallet hooks
  useGetUserWalletsQuery,
  useAddWalletMutation,
  useUpdateWalletBalanceMutation,
  
  // Portfolio hooks
  useGetPortfolioSnapshotQuery,
  useGetPortfolioHistoryQuery,
  useCreatePortfolioSnapshotMutation,
  
  // Price hooks
  useGetLatestPricesQuery,
  useGetPriceHistoryQuery,
  
  // Price Alert hooks
  useGetUserPriceAlertsQuery,
  useCreatePriceAlertMutation,
  useUpdatePriceAlertMutation,
  useDeletePriceAlertMutation,
  
  // Transaction hooks
  useGetUserTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionStatusMutation,
  
  // Liquidity hooks
  useGetUserLiquidityPositionsQuery,
  useGetAllLiquidityPoolsQuery,
  useCreateLiquidityPositionMutation,
  
  // Notification hooks
  useGetUserNotificationsQuery,
  useCreateNotificationMutation,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  
  // Trading hooks
  useGetUserTradingHistoryQuery,
  useCreateTradeMutation,
  
  // Bridge hooks
  useGetUserBridgeTransfersQuery,
  useCreateBridgeTransferMutation,
  useUpdateBridgeTransferStatusMutation,
  
  // Analytics hooks
  useTrackEventMutation,
} = btcMinerApi