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
}

export interface BusinessProfile {
    businessName: string
    businessDescription: string
    businessLogo: string
    contactInfo: string
    category: string
    verificationStatus: "pending" | "verified" | "rejected" | "unverified"
    walletBalance: number
    totalSpent: number
}

export interface AuthUser {
    email: string
    password: string
}
