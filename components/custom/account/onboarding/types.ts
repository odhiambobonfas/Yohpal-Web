export type OnboardingStep = 0 | 1 | 2 | 3 | 4

export interface OnboardingFormData {
    businessName: string
    businessDescription: string
    contactInfo: string
    category: string
    businessLogo: string
}

export const INITIAL_FORM_DATA: OnboardingFormData = {
    businessName: "",
    businessDescription: "",
    contactInfo: "",
    category: "",
    businessLogo: "",
}

export const BUSINESS_CATEGORIES = [
    { value: "ecommerce", label: "E-commerce" },
    { value: "retail", label: "Retail" },
    { value: "service", label: "Service" },
    { value: "technology", label: "Technology" },
    { value: "entertainment", label: "Entertainment" },
    { value: "food", label: "Food & Beverage" },
    { value: "health", label: "Health & Wellness" },
    { value: "education", label: "Education" },
    { value: "finance", label: "Finance" },
    { value: "other", label: "Other" },
] as const

export const ACCOUNT_MANAGER_BENEFITS = [
    {
        title: "Run Ads",
        description: "Create and manage targeted ad campaigns to reach more customers on the platform.",
        icon: "Megaphone" as const,
    },
    {
        title: "Earn Referrals",
        description: "Invite others and earn commission when they use the platform.",
        icon: "Users" as const,
    },
    {
        title: "Track Performance",
        description: "Monitor your ads, earnings, and business growth with detailed analytics.",
        icon: "BarChart3" as const,
    },
] as const

export const STEP_LABELS = [
    { short: "Intro", full: "Introduction" },
    { short: "Info", full: "Basic Info" },
    { short: "Details", full: "Details" },
    { short: "Review", full: "Review" },
] as const

export const MAX_DESCRIPTION_LENGTH = 500
