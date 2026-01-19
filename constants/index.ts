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
const AD_COST_PER_IMPRESSION = 0.10  // KES
const AD_MIN_BUDGET = 100            // KES minimum per ad
const AD_MIN_DEPOSIT = 50            // KES minimum deposit
const AD_FREQUENCY_BASE = 5          // Show ad every N videos

export {
    AD_COST_PER_IMPRESSION,
    AD_FREQUENCY_BASE,
    AD_MIN_BUDGET,
    AD_MIN_DEPOSIT,
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
