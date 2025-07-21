export interface TransferRequest {
  fromChain: number
  toChain: number
  amount: string
  recipient: string
  token: string
}

export interface TransferResult {
  transactionId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  estimatedTime: number
  fee: string
}