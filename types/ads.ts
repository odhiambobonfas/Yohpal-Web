import { FirebaseTimestamp } from "./base"

// View frequency: how many times per day same user can see the ad (1-5)
export type AdViewFrequency = 1 | 2 | 3 | 4 | 5

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
    viewFrequency?: AdViewFrequency  // How many times per day same user sees ad (defaults to 1)

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
    viewFrequency?: AdViewFrequency  // Optional, defaults to 1
}

// Republish ad request
export interface RepublishAdRequest {
    amountToAllocate: number
    viewFrequency?: AdViewFrequency  // Optional, can change on republish
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

// ============================================
// VIDEO PROMOTIONS
// ============================================

// Video Promotion interface
export interface VideoPromotion {
    id: string
    userId: string
    videoId: string                   // Reference to the video being promoted
    videoTitle?: string               // Cached video title for display
    videoThumbnail?: string           // Cached video thumbnail for display

    amountAllocated: number           // Budget assigned
    viewsGenerated: number            // Actual views (continues on republish)

    isPublished: boolean              // false = draft
    isDepleted: boolean               // true when budget exhausted
    viewFrequency?: AdViewFrequency   // How many times per day same user sees promotion (defaults to 1)

    createdAt: FirebaseTimestamp | string
    updatedAt: FirebaseTimestamp | string
}

// Video Promotion filter type
export type PromotionFilterType = "all" | "drafts" | "published" | "depleted"

// Create video promotion request
export interface CreateVideoPromotionRequest {
    videoId: string
}

// Publish video promotion request
export interface PublishVideoPromotionRequest {
    amountToAllocate: number
    viewFrequency?: AdViewFrequency
}

// Republish video promotion request
export interface RepublishVideoPromotionRequest {
    amountToAllocate: number
    viewFrequency?: AdViewFrequency
}

// Video promotions list response
export interface VideoPromotionsListResponse {
    promotions: VideoPromotion[]
    total: number
    page: number
    totalPages: number
    hasMore: boolean
}

// User video (for video selector)
export interface UserVideo {
    id: string
    title: string
    thumbnail: string
    hasPromotion: boolean  // Whether this video already has a promotion
    createdAt: FirebaseTimestamp | string
}
