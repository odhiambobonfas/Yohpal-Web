"use client"

import {
    LucideBookmark,
    LucideDownload,
    LucideEye,
    LucideHeart,
    LucideMessageCircleMore,
    LucideSend,
    LucideShare2,
    LucideUserMinus2,
    LucideUserPlus2,
} from "lucide-react"
import Link from "next/link"

import { InteractionMutationProps } from "#/videos"
import CommentCard from "@/components/custom/app/comments/CommentCard"
import NoCommentsCard from "@/components/custom/app/comments/NoCommentsCard"
import { ResponsiveShareDialog } from "@/components/custom/app/video/ResponsiveShareDialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatStat, formatTime } from "@/lib/utils"
import { useAuth } from "@/providers/Auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DesktopPlayerInteractions({
    handleBookmark,
    handleDownload,
    handleShare,
    handleLikeToggle,
    handleFollowToggle,
    handleComment,
    handleCommentDelete,
    handleCommentLikeToggle,
    currentStats,
    userFollowed,
    ownerProfilePicture,
    video,
    commentMutation,
}: InteractionMutationProps) {
    const { profile } = useAuth()
    const [active, setActive] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (active) {
            router.prefetch(`/user/${video.userId}`)
        }
    }, [active, video.userId, router])

    return (
        <div className="w-6/12 px-3 gap-3 flex flex-col h-full">
            <Card className="w-full m-0 p-0 ">
                <CardContent className="w-full p-4">
                    <div className="inline-flex items-center gap-4 justify-between w-full">
                        <div className="w-4/6 inline-flex items-center gap-2">
                            <Avatar className="size-8">
                                <AvatarImage
                                    loading="lazy"
                                    width={50}
                                    height={50}
                                    src={ownerProfilePicture}
                                    alt={`${video.userName}'s profile picture`}
                                />
                                <AvatarFallback>{video.userName[0]}</AvatarFallback>
                            </Avatar>

                            <span className="flex flex-col items-start">
                                <Link
                                    href={
                                        video.userId === profile?.uid
                                            ? `/profile`
                                            : `/user/${video.userId}`
                                    }
                                    className="hover:underline underline-offset-2"
                                    prefetch={active ? null : false}
                                    onMouseEnter={() => setActive(true)}
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
                        {video.userId !== profile?.uid && (
                            <Button
                                onClick={handleFollowToggle}
                                className={`rounded-full text-lg px-5 py-2 ${
                                    userFollowed ? "border-primary bg-none" : ""
                                }`}
                            >
                                {userFollowed ? (
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
                    <span className="text-sm text-muted-foreground font-semibold">
                        {video.title || "Yohpal monetizing Creativity"}
                    </span>

                    {video.caption && (
                        <div className="py-2 text-foreground text-lg max-h-24 overflow-y-auto">
                            {video.caption}
                        </div>
                    )}
                    <div className="inline-flex gap-2">
                        {video.tags &&
                            Array.isArray(video.tags) &&
                            video.tags.map((t, idx) => <span key={idx}>{t}</span>)}
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col items-center w-full">
                <div className="inline-flex gap-1 w-full">
                    <Button variant={"ghost"} disabled className="text-foreground">
                        <LucideEye />
                        {formatStat(currentStats.views)}
                    </Button>
                    <Button
                        variant={"ghost"}
                        className="text-foreground"
                        onClick={handleLikeToggle}
                    >
                        <LucideHeart
                            className={currentStats.userLiked ? "text-red-500 fill-current" : ""}
                        />
                        {formatStat(currentStats.likes)}
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
                    >
                        <LucideBookmark
                            className={currentStats.userBookmarked ? "fill-current" : ""}
                        />
                        {currentStats.bookmarks}
                    </Button>
                    <ResponsiveShareDialog videoId={video.id} onAction={handleShare}>
                        <Button variant={"ghost"} className="text-foreground">
                            <LucideShare2 />
                            {currentStats.shares}
                        </Button>
                    </ResponsiveShareDialog>

                    <Button variant={"ghost"} className="text-foreground" onClick={handleDownload}>
                        <LucideDownload /> {currentStats.downloads}
                    </Button>
                </div>
            </div>
            <div className="h-120 py-3 w-full flex gap-3 flex-col">
                <form onSubmit={handleComment} className="relative w-full h-10">
                    <Input
                        type="text"
                        value={commentMutation.text}
                        onChange={(e) => commentMutation.setText(e.target.value)}
                        className="rounded-full py-4 pr-12 text-lg w-full h-full"
                        placeholder="What's going on..."
                    />
                    <Button
                        type="submit"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full size-8"
                        disabled={commentMutation.disabled}
                    >
                        <LucideSend />
                    </Button>
                </form>
                <ScrollArea className="flex-1 h-1/2 overflow-hidden py-3 flex flex-col gap-2">
                    {currentStats.comments.length === 0 ? (
                        <NoCommentsCard />
                    ) : (
                        currentStats.comments.map((c) => (
                            <CommentCard
                                key={c.id}
                                comment={c}
                                handleCommentLikeToggle={handleCommentLikeToggle}
                                handleCommentDelete={handleCommentDelete}
                            />
                        ))
                    )}
                </ScrollArea>
            </div>
        </div>
    )
}
