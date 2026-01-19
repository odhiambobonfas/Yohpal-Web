import { FirebaseTimestamp } from "./base"

// Ad Status
export type AdStatus = "draft" | "active" | "paused" | "completed" | "rejected"

// Core Ad interface
export interface Ad {
    id: string
    userId: string
    businessName: string

    // Media (image only for MVP)
    imageUrl: string

    // Content
    title: string
    description: string
    callToAction: string // "Shop Now", "Learn More", etc.
    destinationUrl: string

    // Budget
    totalBudget: number // KES allocated
    spentAmount: number // KES spent
    costPerImpression: number // Fixed: 0.10 KES

    // Status
    status: AdStatus
    createdAt: FirebaseTimestamp | string
    updatedAt: FirebaseTimestamp | string
    isArchived: boolean
}

// Ad statistics
export interface AdStats {
    impressions: number
    clicks: number
    ctr: number // Click-through rate
    totalSpent: number
}

// Ad with stats combined
export interface AdWithStats extends Ad {
    stats: AdStats
}

// Ad transaction types
export type AdTransactionType = "deposit" | "ad_spend"

export interface AdTransaction {
    id: string
    userId: string
    adId?: string
    type: AdTransactionType
    amount: number
    description: string
    // Status is optional for backward compatibility, but new transactions should include it
    status?: "pending" | "success" | "failed" | "completed"
    createdAt: FirebaseTimestamp | string
}

// Ad wallet balance
export interface AdWalletBalance {
    balance: number
    totalDeposited: number
    totalSpent: number
}

// Create ad request
export interface CreateAdRequest {
    title: string
    description: string
    callToAction: string
    destinationUrl: string
    imageUrl: string
    totalBudget: number
}

// Update ad request
export interface UpdateAdRequest {
    title?: string
    description?: string
    callToAction?: string
    destinationUrl?: string
    imageUrl?: string
    status?: AdStatus
}

// Ad deposit request (for ad wallet)
export interface AdDepositRequest {
    phoneNumber: string
    amount: number
}

export interface AdDepositResponse {
    success: boolean
    message: string
    transactionId?: string
    checkoutRequestId?: string
}

// Ad impression tracking
export interface AdImpression {
    adId: string
    viewerId: string
    timestamp: FirebaseTimestamp | string
}

// API response types
export interface AdsListResponse {
    ads: Ad[]
    total: number
    page: number
    totalPages: number
    hasMore: boolean
}

export interface AdTransactionsResponse {
    transactions: AdTransaction[]
    total: number
    page: number
    totalPages: number
    hasMore: boolean
}

// Call-to-action options
export const CALL_TO_ACTION_OPTIONS = [
    "Shop Now",
    "Learn More",
    "Sign Up",
    "Get Offer",
    "Contact Us",
    "Download",
    "Watch Now",
    "Book Now",
] as const

export type CallToAction = (typeof CALL_TO_ACTION_OPTIONS)[number]
