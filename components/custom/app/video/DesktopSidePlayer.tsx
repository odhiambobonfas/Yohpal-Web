"use client"

import { FormEvent, useEffect, useState } from "react"
import { useUser } from "@/hooks/user/use-user"
import { useVideo } from "@/hooks/videos/use-video"
import { useAuth } from "@/providers/Auth"
import { useUserMutation } from "@/hooks/user/use-user-mutation"

import useSWR, { mutate } from "swr"
import Link from "next/link"

import { Video, VideoComment, VideoCommentInteraction } from "#/videos"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import CommentsLoading from "@/components/custom/app/comments/CommentsLoading"
import CommentCard from "@/components/custom/app/comments/CommentCard"
import NoCommentsCard from "@/components/custom/app/comments/NoCommentsCard"
import { ResponsiveShareDialog } from "@/components/custom/app/video/ResponsiveShareDialog"

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import updateLocale from "dayjs/plugin/updateLocale"

import {
    LucideBookmark,
    LucideDownload,
    LucideEye,
    LucideHeart,
    LucideLoader,
    LucideMessageCircleMore,
    LucideSend,
    LucideShare2,
    LucideUserMinus2,
    LucideUserPlus2,
} from "lucide-react"
import { formatTime } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

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

interface DesktopSidePlayerProps extends VideoMutationProps {
    video: Video
}

export default function DesktopSidePlayer({
    video,
    onToggleLike,
    onToggleBookmark,
    onAddComment,
    onShare,
    onDownload,
    mutationLoading,
    mutationError,
}: DesktopSidePlayerProps) {
    const { isAuthenticated, profile } = useAuth()
    const { getProfile, getFollowing } = useUser()
    const { getVideoStats } = useVideo()
    const {
        loading: userMutationLoading,
        error: userMutatioError,
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
    const isFollowing =
        optimisticFollow ?? (followings && followings.includes(video.userId)) ?? false

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

    const handleFollowToggle = async () => {
        if (!isAuthenticated) return

        setOptimisticFollow(!isFollowing)

        const res = await toggleFollow(video.userId, isFollowing)

        if (res) await mutate([`user-following`, profile?.uid])

        if (userMutatioError) {
            console.error("Failed to follow: ", userMutatioError)
            setOptimisticFollow(null)
        }
        setTimeout(() => setOptimisticFollow(null), 1000)
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
        <div className="w-6/12 px-3 gap-3 flex flex-col h-full">
            <Card className="w-full m-0 p-0 min-h-28">
                <CardContent className="w-full p-4">
                    <div className="inline-flex items-center gap-4 justify-between w-full">
                        <div className="w-4/6 inline-flex items-center gap-2">
                            <Avatar className="size-8">
                                <AvatarImage
                                    loading="lazy"
                                    width={50}
                                    height={50}
                                    src={ownerProfile?.profile_picture || "/logo_circular.png"}
                                    alt={`${video.userName}'s profile picture`}
                                />
                                <AvatarFallback>{video.userName[0]}</AvatarFallback>
                            </Avatar>

                            <span className="flex flex-col items-start">
                                <Link
                                    href={`/user/${video.userId}`}
                                    className="hover:underline underline-offset-2"
                                >
                                    <b>@{video.userName}</b>
                                </Link>
                                <span className="text-muted-foreground text-sm">
                                    {video.fullName}
                                </span>
                                <span className="text-muted-foreground text-sm">
                                    {formatTime(video.timestamp)}
                                </span>
                            </span>
                        </div>

                        {isAuthenticated && (
                            <Button
                                onClick={handleFollowToggle}
                                className={`rounded-full text-lg px-5 py-2 ${
                                    !(optimisticFollow ?? isFollowing)
                                        ? "border-primary bg-none"
                                        : ""
                                }`}
                            >
                                {(optimisticFollow ?? isFollowing) ? (
                                    <>
                                        <LucideUserMinus2 /> Unfollow
                                    </>
                                ) : (
                                    <>
                                        <LucideUserPlus2 /> Follow
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                    {video.caption && (
                        <p className="py-2 text-foreground text-lg">{video.caption}</p>
                    )}
                    <div className="inline-flex gap-2">
                        {video.tags && video.tags.map((t, idx) => <span key={idx}>{t}</span>)}
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col items-center w-full">
                <div className="inline-flex gap-1 w-full">
                    <Button variant={"ghost"} disabled className="text-foreground">
                        <LucideEye />
                        {currentStats.views}
                    </Button>
                    <Button
                        variant={"ghost"}
                        className="text-foreground"
                        onClick={handleLike}
                        disabled={!isAuthenticated || mutationLoading}
                    >
                        <LucideHeart
                            className={currentStats.userLiked ? "text-red-500 fill-current" : ""}
                        />
                        {currentStats.likes}
                    </Button>
                    <Button variant={"ghost"} className="text-muted-foreground">
                        <LucideMessageCircleMore /> {currentStats.comments.length}
                    </Button>

                    <Button
                        variant={"ghost"}
                        className={
                            currentStats.userBookmarked ? "text-blue-500" : "text-foreground"
                        }
                        onClick={handleBookmark}
                        disabled={!isAuthenticated || mutationLoading}
                    >
                        <LucideBookmark
                            className={currentStats.userBookmarked ? "fill-current" : ""}
                        />
                        {currentStats.bookmarks}
                    </Button>
                    <ResponsiveShareDialog videoId={video.id} onAction={handleShare}>
                        <Button
                            variant={"ghost"}
                            className="text-foreground"
                            disabled={mutationLoading}
                        >
                            <LucideShare2 className="text-emerald-800/60" />
                            {currentStats.shares}
                        </Button>
                    </ResponsiveShareDialog>

                    <Button
                        variant={"ghost"}
                        className="text-foreground"
                        onClick={handleDownload}
                        disabled={mutationLoading}
                    >
                        <LucideDownload /> {currentStats.downloads}
                    </Button>
                </div>
            </div>
            <div className="h-full py-3 w-full flex gap-3 flex-col">
                <form
                    onSubmit={handleComment}
                    className="inline-flex w-full items-center gap-2 h-10"
                >
                    <Input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="rounded-full p-3 text-lg"
                        placeholder="What's going on..."
                    />
                    <Button
                        type="submit"
                        className="rounded-full"
                        disabled={!isAuthenticated || !commentText.trim() || mutationLoading}
                    >
                        {mutationLoading ? (
                            <LucideLoader className="animate-spin" />
                        ) : (
                            <LucideSend />
                        )}
                    </Button>
                </form>
                <ScrollArea className="flex-1 h-1/2 overflow-hidden py-3 flex flex-col gap-2">
                    {loading && <CommentsLoading />}
                    {!loading &&
                        (currentStats.comments.length === 0 ? (
                            <NoCommentsCard />
                        ) : (
                            currentStats.comments.map((c) => <CommentCard key={c.id} comment={c} />)
                        ))}
                </ScrollArea>
            </div>
        </div>
    )
}
