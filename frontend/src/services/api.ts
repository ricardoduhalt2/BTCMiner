import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const btcMinerApi = createApi({
  reducerPath: 'btcMinerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      // Add auth headers if needed
      return headers
    },
  }),
  tagTypes: ['Portfolio', 'Prices', 'Transactions', 'Liquidity'],
  endpoints: (builder) => ({
    getPortfolio: builder.query<any, string>({
      query: (userId) => `portfolio/${userId}`,
      providesTags: ['Portfolio'],
    }),
    getPrices: builder.query<any[], { timeframe: string }>({
      query: ({ timeframe }) => `prices?timeframe=${timeframe}`,
      providesTags: ['Prices'],
    }),
    getTransactions: builder.query<any[], { userId: string; page: number }>({
      query: ({ userId, page }) => `transactions/${userId}?page=${page}`,
      providesTags: ['Transactions'],
    }),
  }),
})

export const {
  useGetPortfolioQuery,
  useGetPricesQuery,
  useGetTransactionsQuery,
} = btcMinerApi