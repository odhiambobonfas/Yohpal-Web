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
    downloads: string[]
    shares: string[]
    views: string[]
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
    // added to make working with comment interactions
    // much easier
    videoId: string
    userHasLiked: boolean
    deleted: boolean
}

export interface VideoCommentInteraction {
    tempId: string
    userId: string
    profilePicture: string
    username: string
    videoId: string
    comment: string
    isReply: boolean
}

export interface CommentActionProps {
    videoId: string
    userId: string
    commentId: string
}

export interface VideoInteraction {
    userId: string
    videoId: string
}

export interface InteractionMutationProps {
    handleDownload: () => void
    handleShare: () => void
    handleBookmark: () => void
    handleLikeToggle: () => void
    handleFollowToggle: () => void

    handleComment: (e: FormEvent) => void
    handleCommentDelete: (commentId: string, videoId: string) => void
    handleCommentLikeToggle: (commentId: string, videoId: string, wasLiked: boolean) => void

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
    ownerProfilePicture: string | undefined

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

export interface VideoPlayerProps {
    promoted: boolean
    videoId: string
    videoSrc: string
    activeVideoId: string
    thumbnail: string
    index: number
    activeIndex: number
    onEnded?: () => void
    autoScrollEnabled: boolean
    setAutoScrollEnabled: (val: boolean) => void
}
