import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    LucideArrowDownToLine,
    LucideBookmark,
    LucideEye,
    LucideHeart,
    LucideMessageCircleMore,
    LucideShare2,
} from "lucide-react"
import Link from "next/link"
import { ResponsiveShareDialog } from "./ResponsiveShareDialog"
import { Video, VideoComment, VideoCommentInteraction } from "@/types/videos"
import { useAuth } from "@/providers/Auth"
import { useUser } from "@/hooks/user/use-user"
import { useVideo } from "@/hooks/videos/use-video"
import { FormEvent, useEffect, useState } from "react"
import useSWR from "swr"

interface VideoMutationProps {
    onToggleLike: (videoId: string, isCurrentlyLiked: boolean) => Promise<{ liked: boolean } | null>
    onToggleBookmark: (
        videoId: string,
        isCurrentlyBookmarked: boolean,
    ) => Promise<{ bookmarked: boolean } | null>
    onAddComment: (
        videoId: string,
        text: string,
    ) => Promise<{ commentId: string; comment: VideoCommentInteraction } | null>
    onShare: (videoId: string) => Promise<{ shared: boolean } | null>
    onDownload: (videoId: string) => Promise<{ downloaded: boolean } | null>
    mutationLoading: boolean
    mutationError: string | null
}

interface PlayerInteractionsProps extends VideoMutationProps {
    video: Video
}

export default function MobileInteractions({
    video,
    onToggleLike,
    onToggleBookmark,
    onAddComment,
    onShare,
    onDownload,
    mutationLoading,
    mutationError,
}: PlayerInteractionsProps) {
    const { isAuthenticated, profile } = useAuth()
    const { getProfile, getFollowing } = useUser()
    const { getVideoStats } = useVideo()

    // optimistic ui updates
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

    const {
        data: stats,
        isLoading: videoStatsLoading,
        mutate: mutateStats,
    } = useSWR([`video-stats`, video.id], ([, videoId]) => getVideoStats(videoId), swrConfig)

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

    const loading = videoStatsLoading || profileLoading || followingsLoading
    const isFollowing = (followings && followings.includes(video.userId)) || false

    // current stats with optimistic updates
    const currentStats = {
        likes: optimisticLike?.count ?? stats?.likes ?? 0,
        bookmarks: optimisticBookmark?.count ?? stats?.bookmarks ?? 0,
        shares: optimisticShare ?? stats?.shares ?? 0,
        downloads: optimisticDownload ?? stats?.downloads ?? 0,
        views: stats?.views ?? 0,
        comments: [...optimisticComments, ...(stats?.comments ?? [])],
        userLiked: optimisticLike?.liked ?? stats?.userLiked ?? false,
        userBookmarked: optimisticBookmark?.bookmarked ?? stats?.userBookmarked ?? false,
    }

    const handleLike = async () => {
        if (!isAuthenticated || !stats) return

        const newLiked = !currentStats.userLiked
        const newCount = newLiked ? currentStats.likes + 1 : currentStats.likes - 1

        setOptimisticLike({ liked: newLiked, count: newCount })

        const result = await onToggleLike(video.id, currentStats.userLiked)
        if (result) {
            mutateStats() // revalidate to get active stats
        }
        if (mutationError) {
            // revert on error
            setOptimisticLike(null)
            console.error("Failed to toggle like:", mutationError)
        }
        // clear optimistic state
        setTimeout(() => setOptimisticLike(null), 1000)
    }

    const handleBookmark = async () => {
        if (!isAuthenticated || !stats) return

        const newBookmarked = !currentStats.userBookmarked
        const newCount = newBookmarked ? currentStats.bookmarks + 1 : currentStats.bookmarks - 1

        setOptimisticBookmark({ bookmarked: newBookmarked, count: newCount })

        const result = await onToggleBookmark(video.id, currentStats.userBookmarked)
        if (result) {
            mutateStats()
        }
        if (mutationError) {
            setOptimisticBookmark(null)
            console.error("Failed to toggle bookmark:", mutationError)
        }
        setTimeout(() => setOptimisticBookmark(null), 1000)
    }

    const handleShare = async () => {
        if (!isAuthenticated) return

        setOptimisticShare(currentStats.shares + 1)

        const result = await onShare(video.id)
        if (result) {
            mutateStats()
        }
        if (mutationError) {
            setOptimisticShare(null)
            console.error("Failed to share:", mutationError)
        }
        setTimeout(() => setOptimisticShare(null), 1000)
    }

    const handleDownload = async () => {
        setOptimisticDownload(currentStats.downloads + 1)

        const link = document.createElement("a")
        link.href = `/api/proxy/${video.id}`
        link.download = ""
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        const result = await onDownload(video.id)
        if (result) {
            mutateStats()
        }

        if (mutationError) {
            setOptimisticDownload(null)
            console.error("Failed to download:", mutationError)
        }

        setTimeout(() => setOptimisticDownload(null), 1000)
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

        const res = await onAddComment(video.id, text)
        if (res) {
            mutateStats()
            setOptimisticComments((prev) => prev.filter((c) => c.id !== tempComment.id))
        }

        if (mutationError) {
            setOptimisticComments((prev) => prev.filter((c) => c.id !== tempComment.id))
            setCommentText(text) // Restore text on error
            console.error("Failed to add comment:", mutationError)
        }
    }
    return (
        <div className="absolute right-2 bottom-10 flex flex-col items-center gap-4">
            <Link
                href={`/user/${video.userId}`}
                className="mb-3 flex flex-col items-center text-white gap-2"
            >
                <Avatar className="size-10">
                    <AvatarImage src={"/logo_circular.png"} className="object-cover bg-blue-100" />
                    <AvatarFallback>{video.userName[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs">
                    <b>@{video.userName}</b>
                </span>
            </Link>

            <Button className="flex flex-col gap-1 text-white p-2 size-12" variant={"ghost"}>
                <LucideEye className="size-7" />
                <span className="text-xs">{currentStats.views}</span>
            </Button>

            <Button className="flex flex-col gap-1 text-white p-2 size-12" variant={"ghost"}>
                <LucideHeart className="size-7 fill-primary stroke-primary" />
                <span className="text-xs">{currentStats.likes}</span>
            </Button>

            <Button className="flex flex-col gap-1 text-white p-2 size-12" variant={"ghost"}>
                <LucideMessageCircleMore className="size-7 fill-current" />
                <span className="text-xs">{currentStats.comments.length}</span>
            </Button>

            <Button className="flex flex-col gap-1 text-white p-2 size-12" variant={"ghost"}>
                <LucideBookmark className="size-7 fill-current" />
                <span className="text-xs">{currentStats.bookmarks}</span>
            </Button>

            <ResponsiveShareDialog videoId={"blue"}>
                <Button className="flex flex-col gap-1 text-white p-2 size-12" variant={"ghost"}>
                    <LucideShare2 className="size-7" />
                    <span className="text-xs">{currentStats.shares}</span>
                </Button>
            </ResponsiveShareDialog>

            <Button className="flex flex-col gap-1 text-white p-2 size-12" variant={"ghost"}>
                <LucideArrowDownToLine className="size-7" />
                <span className="text-xs">{currentStats.downloads}</span>
            </Button>
        </div>
    )
}
