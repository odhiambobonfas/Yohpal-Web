import { FirebaseTimestamp } from "#/base"

export interface Video {
    id: string
    userId: string
    userName: string
    fullName: string
    videoUrl: string
    privacy: string
    broken: boolean | null
    thumbnail: string
    allowComments: boolean
    title: string
    caption: string
    tags: string[]
    timestamp: string

    campaignMeta: CampaignMeta | null
    promoted: boolean
}

export interface CampaignMeta {
    promotionId: string
    newVideoUrl: string
    newThumbnailUrl: string
    timestamp: FirebaseTimestamp
}

export interface VideoComment {
    id: string
    replies: number
    msg: string
    userId: string
    hasReply: boolean
    isReply: boolean
    username: string
    profile_picture: string
    likes: number
    timestamp: FirebaseTimestamp
}

export interface VideoCommentInteraction {
    userId: string
    profilePicture: string
    username: string
    videoId: string
    comment: string
    isReply: boolean
}

export interface VideoInteraction {
    userId: string
    videoId: string
}
