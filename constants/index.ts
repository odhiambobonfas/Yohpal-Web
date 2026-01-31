const DEFAULT_THUMBNAIL = "/app/default_thumbnail.jpg"
const DEFAULT_PROFILE = "/logo_circular.png"
const CDN_URL = "https://cdn.stream.yohpal.com/"
const OLD_URL = "https://firebasestorage.googleapis.com/v0/b/yohlab.firebasestorage.app/o/"

const FOLLOWER_FOLLOWING_LIMIT = 30
const CACHE_TTL = 3600
const DEFAULT_PROMOTED_VIDEO_BIAS = 4
const DEFAULT_REFERER_CODE = "rjjYT4peGQ"

const COOKIES = {
    Session: "__auth",
    EmailNotVerified: "__emailVerified",
    User: "__u",
} as const

const INTERESTS = [
    "Kids",
    "Politics & News",
    "Sports & Talents",
    "Agribusiness & Env",
    "Education (Basic)",
    "Education (Advanced / Tertiary)",
    "Food & Culinary",
    "Technology & Innovation",
    "Health & Fitness",
    "Travel & Lifestyle",
    "Finance & Business",
    "Entertainment & Pop Culture",
    "Gaming & Esports",
    "Motivation & Self-Help",
    "Religion & Spirituality",
] as const

const SUPPORTED_COUNTRIES = ["Kenya", "Tanzania", "Uganda", "South-Sudan", "Sudan"] as const
const DELETE_IDENT = "__dd"

const DEBUG_BUILD = process.env.NODE_ENV === "development"

const VIDEO_LIMIT = DEBUG_BUILD ? 10 : 30
const PROMOTED_VIDEOS_LIMIT = Math.ceil(VIDEO_LIMIT / 4)

const FOLLOWING_FEED_KEY = "followingFeedVideos"
const FOLLOWING_FEED_CURRENT_VID_KEY = "currentFollowingVideoId"

const FETCH_TRIGGER_OFFSET = Math.floor(VIDEO_LIMIT * 0.75)

// Ad constants
const AD_COST_PER_VIEW = 1                // 1 KES per view
const AD_VIEW_DURATION_SECONDS = 15       // Each view = 15 seconds
const AD_MIN_PUBLISH_AMOUNT = 20          // Minimum amount to publish an ad
const AD_DESCRIPTION_MAX_LENGTH = 100     // Max description characters
const AD_MIN_DEPOSIT = 10                 // KES minimum deposit
const AD_FREQUENCY_BASE = 5               // Show ad every N videos

// Ad view frequency options (how many times per day same user sees the ad)
const AD_VIEW_FREQUENCY_OPTIONS = [
    { value: 1, label: "Once per day", description: "Each user sees ad once per day" },
    { value: 2, label: "Twice per day", description: "Each user can see ad 2 times per day" },
    { value: 3, label: "3 times per day", description: "Each user can see ad 3 times per day" },
    { value: 4, label: "4 times per day", description: "Each user can see ad 4 times per day" },
    { value: 5, label: "5 times per day", description: "Each user can see ad 5 times per day (max)" },
] as const

const AD_MAX_VIEW_FREQUENCY = 5
const AD_DEFAULT_VIEW_FREQUENCY = 1

export {
    AD_COST_PER_VIEW,
    AD_VIEW_DURATION_SECONDS,
    AD_MIN_PUBLISH_AMOUNT,
    AD_DESCRIPTION_MAX_LENGTH,
    AD_FREQUENCY_BASE,
    AD_MIN_DEPOSIT,
    AD_VIEW_FREQUENCY_OPTIONS,
    AD_MAX_VIEW_FREQUENCY,
    AD_DEFAULT_VIEW_FREQUENCY,
    CACHE_TTL,
    CDN_URL,
    COOKIES,
    DEBUG_BUILD,
    DEFAULT_PROFILE,
    DEFAULT_PROMOTED_VIDEO_BIAS,
    DEFAULT_THUMBNAIL,
    DELETE_IDENT,
    FETCH_TRIGGER_OFFSET,
    FOLLOWER_FOLLOWING_LIMIT,
    DEFAULT_REFERER_CODE,
    FOLLOWING_FEED_CURRENT_VID_KEY,
    FOLLOWING_FEED_KEY,
    INTERESTS,
    OLD_URL,
    PROMOTED_VIDEOS_LIMIT,
    SUPPORTED_COUNTRIES,
    VIDEO_LIMIT,
}
