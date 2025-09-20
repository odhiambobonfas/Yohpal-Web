import { useIsMobile } from "@/hooks/use-mobile"
import { VideoComment, VideoWithStats } from "#/videos"
import { useAuth } from "@/providers/Auth"
import { useUser } from "@/hooks/user/use-user"
import { useVideoMutation } from "@/hooks/videos/use-video-mutations"
import { useUserMutation } from "@/hooks/user/use-user-mutation"
import { useState, useEffect, FormEvent } from "react"

import useSWR from "swr"
import DesktopPlayerInteractions from "./DesktopPlayerInteractions"
import { DEFAULT_THUMBNAIL } from "@/constants"
import MobileInteractions from "./MobileInteractions"

export default function Interactions({ video }: { video: VideoWithStats }) {
    const isMobile = useIsMobile()

    const { isAuthenticated, profile } = useAuth()
    const { getProfile, getFollowing } = useUser()

    const {
        loading: mutationLoading,
        error: mutationError,
        toggleLike,
        toggleBookmark,
        addComment,
        shareVideo,
        downloadVideo,
    } = useVideoMutation()
    const {
        loading: userMutatationLoading,
        error: userMutationError,
        toggleFollow,
    } = useUserMutation()

    // optimistic ui updates
    const [optimisticFollow, setOptimisticFollow] = useState<boolean | null>(null)
    const [optimisticLike, setOptimisticLike] = useState<{ liked: boolean; count: number } | null>(
        null,
    )
    const [optimisticBookmark, setOptimisticBookmark] = useState<{
        bookmarked: boolean
        count: number
    } | null>(null)
    const [optimisticShare, setOptimisticShare] = useState<number | null>(null)
    const [optimisticDownload, setOptimisticDownload] = useState<number | null>(null)
    const [optimisticComments, setOptimisticComments] = useState<VideoComment[]>([])
    const [commentText, setCommentText] = useState("")

    const swrConfig = {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 60000,
        errorRetryCount: 2,
    }

    const { data: followings, isLoading: followingsLoading } = useSWR(
        ["user-following", profile?.uid],
        () => getFollowing(profile!.uid),
        swrConfig,
    )

    const { data: ownerProfile, isLoading: profileLoading } = useSWR(
        [`user-profile`, video.userId],
        ([, userId]) => getProfile(userId),
        swrConfig,
    )
    useEffect(() => {
        setOptimisticComments([]) // clear optimistic comments on video change
        setCommentText("") //clear input
    }, [video.id])

    const loading = userMutatationLoading || profileLoading || followingsLoading || mutationLoading
    const isFollowing =
        optimisticFollow ?? (followings && followings.includes(video.userId)) ?? false

    // current stats with optimistic updates
    const currentStats = {
        likes: optimisticLike?.count ?? video.likes.length ?? 0,
        bookmarks: optimisticBookmark?.count ?? video.bookmarks.length ?? 0,
        shares: optimisticShare ?? video.shares ?? 0,
        downloads: optimisticDownload ?? video.downloads ?? 0,
        views: video.views ?? 0,
        comments: [...optimisticComments, ...(video.comments ?? [])],
        userBookmarked:
            optimisticBookmark?.bookmarked ?? video.bookmarks.includes(profile?.uid || "") ?? false,
        userLiked: optimisticLike?.liked ?? video.likes.includes(profile?.uid || "") ?? false,
    }

    const handleFollowToggle = async () => {
        if (!isAuthenticated) return

        setOptimisticFollow(!isFollowing)

        const res = await toggleFollow(video.userId, isFollowing)

        if (!res?.followed) {
            console.error("Failed to follow: ", userMutationError)
            setOptimisticFollow(null)
        }
    }
    const handleLikeToggle = async () => {
        if (!isAuthenticated) return

        const newLiked = !currentStats.userLiked
        const newCount = newLiked ? currentStats.likes + 1 : currentStats.likes - 1

        setOptimisticLike({ liked: newLiked, count: newCount })

        const result = await toggleLike(video.id, currentStats.userLiked)

        if (!result?.liked) {
            console.error("Failed to like: ", mutationError)
            setOptimisticLike(null)
        }
    }

    const handleBookmark = async () => {
        if (!isAuthenticated) return

        const newBookmarked = !currentStats.userBookmarked
        const newCount = newBookmarked ? currentStats.bookmarks + 1 : currentStats.bookmarks - 1

        setOptimisticBookmark({ bookmarked: newBookmarked, count: newCount })

        const result = await toggleBookmark(video.id, currentStats.userBookmarked)

        if (!result?.bookmarked) {
            console.error("Failed to bookmark: ", mutationError)
            setOptimisticFollow(null)
        }
    }

    const handleShare = async () => {
        if (!isAuthenticated) return

        setOptimisticShare(currentStats.shares + 1)

        const result = await shareVideo(video.id)

        if (!result?.shared) {
            console.error("Failed to share: ", mutationError)
            setOptimisticShare(null)
        }
    }

    const handleDownload = async () => {
        setOptimisticDownload(currentStats.downloads + 1)

        const link = document.createElement("a")
        link.href = `/api/proxy/${video.id}`
        link.download = ""
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        const result = await downloadVideo(video.id)

        if (!result?.downloaded) {
            setOptimisticDownload(null)
            console.error("Failed to download:", mutationError)
        }
    }

    const handleComment = async (e: FormEvent) => {
        e.preventDefault()
        if (!isAuthenticated || !commentText.trim()) return

        const text = commentText.trim()
        setCommentText("")

        const tempComment = {
            id: `temp-${Date.now()}`,
            msg: text,
            username: profile?.userName,
            profile_picture: profile?.profile_picture,
            isReply: false,
            likes: 0,
            replies: 0,
        } as unknown as VideoComment

        setOptimisticComments((prev) => [tempComment, ...prev])

        const res = await addComment(video.id, text)

        if (!res?.commentId) {
            setOptimisticComments((prev) => prev.filter((c) => c.id !== tempComment.id))
            setCommentText(text) // Restore text on error
            console.error("Failed to add comment:", mutationError)
        }
    }

    if (isMobile) {
        return (
            <MobileInteractions
                handleBookmark={handleBookmark}
                handleDownload={handleDownload}
                handleComment={(e: FormEvent) => handleComment(e)}
                handleShare={handleShare}
                handleLikeToggle={handleLikeToggle}
                handleFollowToggle={handleFollowToggle}
                currentStats={currentStats}
                isLoading={loading}
                userAuthed={isAuthenticated}
                userFollowed={isFollowing}
                error={mutationError}
                ownerProfilePicture={ownerProfile?.profile_picture || DEFAULT_THUMBNAIL}
                video={video}
                commentMutation={{ disabled: loading, setText: setCommentText, text: commentText }}
            />
        )
    }

    return (
        <DesktopPlayerInteractions
            handleBookmark={handleBookmark}
            handleDownload={handleDownload}
            handleComment={(e: FormEvent) => handleComment(e)}
            handleShare={handleShare}
            handleLikeToggle={handleLikeToggle}
            handleFollowToggle={handleFollowToggle}
            currentStats={currentStats}
            isLoading={loading}
            userAuthed={isAuthenticated}
            userFollowed={isFollowing}
            error={mutationError}
            ownerProfilePicture={ownerProfile?.profile_picture || DEFAULT_THUMBNAIL}
            video={video}
            commentMutation={{ disabled: loading, setText: setCommentText, text: commentText }}
        />
    )
}
