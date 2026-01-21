import { FirebaseTimestamp } from "./base"

// Account Balance & Stats
export interface AccountBalance {
  totalDeposits: number
  totalEarnings: number
  availableBalance: number
  pendingBalance: number
  networkSize: number
  referralEarnings: number
  bonusEarnings: number
}

export interface AccountStats {
  depositsChange: number // percentage change from previous period
  earningsChange: number
  depositsThisMonth: number
}

// Transactions
export type TransactionType = "deposit" | "referral" | "bonus"
export type TransactionStatus = "pending" | "completed" | "failed" | "cancelled"

export interface Transaction {
  id: string
  userId: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  description: string
  reference?: string
  phoneNumber?: string
  createdAt: FirebaseTimestamp | string
  completedAt?: FirebaseTimestamp | string
}

export interface TransactionFilters {
  type?: TransactionType | "all"
  status?: TransactionStatus | "all"
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}

export interface TransactionHistoryResponse {
  transactions: Transaction[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

// Deposit
export interface DepositRequest {
  phoneNumber: string
  amount: number
}

export interface DepositResponse {
  success: boolean
  message: string
  transactionId?: string
  checkoutRequestId?: string
}

// Referrals / Network
export type ReferralLevel = "primary" | "secondary"

export interface Referral {
  id: string
  userId: string
  userName: string
  firstName: string
  lastName: string
  profilePicture?: string
  level: ReferralLevel
  joinedAt: FirebaseTimestamp | string
  totalEarned: number
  isActive: boolean
}

export interface NetworkStats {
  primaryReferrals: number
  secondaryReferrals: number
  totalNetworkSize: number
  totalNetworkEarnings: number
  referralCode: string
  referralLink: string
}

export interface ReferralsResponse {
  referrals: Referral[]
  stats: NetworkStats
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

export interface ReferralFilters {
  level?: ReferralLevel | "all"
  page?: number
  limit?: number
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
