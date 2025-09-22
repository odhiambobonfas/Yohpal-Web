"use client"

import Link from "next/link"

import { InteractionMutationProps } from "#/videos"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import CommentCard from "@/components/custom/app/comments/CommentCard"
import NoCommentsCard from "@/components/custom/app/comments/NoCommentsCard"
import { ResponsiveShareDialog } from "@/components/custom/app/video/ResponsiveShareDialog"

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

export default function DesktopPlayerInteractions({
    handleBookmark,
    handleComment,
    handleDownload,
    handleShare,
    handleLikeToggle,
    handleFollowToggle,
    isLoading,
    currentStats,
    userFollowed,
    userAuthed,
    ownerProfilePicture,
    video,
    commentMutation,
}: InteractionMutationProps) {
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
                                    src={ownerProfilePicture}
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

                        {userAuthed && (
                            <Button
                                onClick={handleFollowToggle}
                                className={`rounded-full text-lg px-5 py-2 ${
                                    !userFollowed ? "border-primary bg-none" : ""
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
                        onClick={handleLikeToggle}
                        disabled={isLoading || !userAuthed}
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
                        disabled={isLoading || !userAuthed}
                    >
                        <LucideBookmark
                            className={currentStats.userBookmarked ? "fill-current" : ""}
                        />
                        {currentStats.bookmarks}
                    </Button>
                    <ResponsiveShareDialog videoId={video.id} onAction={handleShare}>
                        <Button variant={"ghost"} className="text-foreground" disabled={isLoading}>
                            <LucideShare2 />
                            {currentStats.shares}
                        </Button>
                    </ResponsiveShareDialog>

                    <Button
                        variant={"ghost"}
                        className="text-foreground"
                        onClick={handleDownload}
                        disabled={isLoading}
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
                        value={commentMutation.text}
                        onChange={(e) => commentMutation.setText(e.target.value)}
                        className="rounded-full p-3 text-lg"
                        placeholder="What's going on..."
                    />
                    <Button
                        type="submit"
                        className="rounded-full"
                        disabled={commentMutation.disabled}
                    >
                        {isLoading ? <LucideLoader className="animate-spin" /> : <LucideSend />}
                    </Button>
                </form>
                <ScrollArea className="flex-1 h-1/2 overflow-hidden py-3 flex flex-col gap-2">
                    {currentStats.comments.length === 0 ? (
                        <NoCommentsCard />
                    ) : (
                        currentStats.comments.map((c) => <CommentCard key={c.id} comment={c} />)
                    )}
                </ScrollArea>
            </div>
        </div>
    )
}
