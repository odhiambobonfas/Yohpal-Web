export interface YPUser {
    uid: string
    email: string
    userName: string
    firstName: string
    lastName: string
    phoneNumber: string
    profile_picture: string
    bio: string
    Country: string
    refererCode: string
    referralCode: string
    followersCount: number
    followingCount: number
    contentPreferences: string[] | undefined
    businessProfile?: BusinessProfile
    // Balance fields (stored on user document)
    totalDeposits?: number
    availableBalance?: number
    referralEarnings?: number
    bonusEarnings?: number
}

export interface BusinessProfile {
    businessName: string
    businessDescription: string
    businessLogo: string
    contactInfo: string
    category: string
    verificationStatus: "pending" | "verified" | "rejected" | "unverified"
}

// Document type for the separate business_profiles collection
export interface BusinessProfileDocument extends BusinessProfile {
    userId: string
    createdAt: Date
    updatedAt: Date
}

export interface AuthUser {
    email: string
    password: string
}
