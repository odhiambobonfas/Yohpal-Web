import { FirebaseTimestamp } from "./base"

// Core Ad interface (simplified - view-based pricing)
export interface Ad {
    id: string
    userId: string
    businessId?: string

    imageUrl: string              // Required, landscape
    description?: string          // Optional, max 100 chars

    amountAllocated: number       // Budget assigned
    viewsGenerated: number        // Actual views (continues on republish)

    isPublished: boolean          // false = draft
    isDepleted: boolean           // true when budget exhausted

    createdAt: FirebaseTimestamp | string
    updatedAt: FirebaseTimestamp | string
}

// Ad statistics
export interface AdStats {
    views: number
    totalTimeSeconds: number
    totalSpent: number
}

// Ad with stats combined
export interface AdWithStats extends Ad {
    stats: AdStats
}

// Ad transaction types
export type AdTransactionType = "deposit" | "ad_spend" | "ad_publish" | "ad_republish"

export interface AdTransaction {
    id: string
    userId: string
    adId?: string
    type: AdTransactionType
    amount: number
    description: string
    status?: "pending" | "success" | "failed" | "completed"
    createdAt: FirebaseTimestamp | string
}

// Ad wallet balance
export interface AdWalletBalance {
    balance: number
    totalDeposited: number
    totalSpent: number
}

// Create ad request (simplified - draft only)
export interface CreateAdRequest {
    imageUrl: string
    description?: string
}

// Publish ad request
export interface PublishAdRequest {
    amountToAllocate: number
}

// Republish ad request
export interface RepublishAdRequest {
    amountToAllocate: number
}

// Update ad request (simplified)
export interface UpdateAdRequest {
    imageUrl?: string
    description?: string
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

// Ad view tracking
export interface AdView {
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

// Ad filter type for list view
export type AdFilterType = "all" | "drafts" | "published" | "depleted"
