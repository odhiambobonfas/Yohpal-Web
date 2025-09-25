import { FormEvent } from "react"

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
    title: string | undefined
    caption: string
    tags: string[]
    timestamp: string

    campaignMeta: CampaignMeta | null
    promoted: boolean
}

export interface VideoWithStats extends Video {
    downloads: number
    shares: number
    views: number
    likes: string[]
    bookmarks: string[]
    comments: VideoComment[]
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

export interface InteractionMutationProps {
    handleComment: (e: FormEvent) => void
    handleDownload: () => void
    handleShare: () => void
    handleBookmark: () => void
    handleLikeToggle: () => void
    handleFollowToggle: () => void

    isLoading: boolean
    error: string | null

    currentStats: {
        likes: number
        bookmarks: number
        shares: number
        downloads: number
        views: number
        comments: VideoComment[]
        userLiked: boolean
        userBookmarked: boolean
    }

    userFollowed: boolean
    userAuthed: boolean
    ownerProfilePicture: string

    video: Video

    commentMutation: {
        text: string
        setText: (c: string) => void
        disabled: boolean
    }
}

export interface OptimisticVideoState {
    likes?: { liked: boolean; count: number }
    bookmarks?: { bookmarked: boolean; count: number }
    views?: number
    shares?: number
    downloads?: number
    comments?: VideoComment[]
    following?: boolean
}
