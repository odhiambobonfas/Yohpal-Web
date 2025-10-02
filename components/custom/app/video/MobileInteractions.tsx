"use client"
import {
    LucideArrowDownToLine,
    LucideBookmark,
    LucideCheck,
    LucideEye,
    LucideHeart,
    LucideMessageCircleMore,
    LucidePlus,
    LucideShare2,
} from "lucide-react"
import Link from "next/link"

import { InteractionMutationProps } from "#/videos"
import CommentDrawer from "@/components/custom/app/comments/CommentDrawer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatTime } from "@/lib/utils"

import { useAuth } from "@/providers/Auth"
import { ResponsiveShareDialog } from "./ResponsiveShareDialog"

export default function MobileInteractions({
    handleBookmark,
    handleDownload,
    handleShare,
    handleLikeToggle,
    handleFollowToggle,
    handleComment,
    handleCommentDelete,
    handleCommentLikeToggle,
    isLoading,
    currentStats,
    ownerProfilePicture,
    video,
    commentMutation,
    userFollowed,
}: InteractionMutationProps) {
    const { profile } = useAuth()

    return (
        <>
            <div className="absolute right-3 bottom-15 flex flex-col items-center gap-4">
                <Link
                    href={video.userId !== profile?.uid ? `/user/${video.userId}` : "/profile"}
                    className="flex flex-col items-center text-white gap-2"
                >
                    <div className="relative">
                        <Avatar className="size-10">
                            <AvatarImage
                                src={ownerProfilePicture}
                                className="object-cover bg-blue-100"
                            />
                            <AvatarFallback>{video.userName[0]}</AvatarFallback>
                        </Avatar>
                        {video.userId !== profile?.uid && (
                            <div className="flex rounded-full size-5 items-center justify-center right-0 bottom-0 absolute translate-x-1/4 translate-y-1/4 shadow-md">
                                {userFollowed ? (
                                    <LucideCheck className="bg-green-500 p-0.5 rounded-full size-5" />
                                ) : (
                                    <LucidePlus
                                        className="bg-primary p-0.5 rounded-full size-5"
                                        onClick={handleFollowToggle}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </Link>

                <Button className="flex flex-col gap-1 text-white p-2 size-12" variant={"ghost"}>
                    <LucideEye className="size-7" />
                    <span className="text-xs">{currentStats.views}</span>
                </Button>

                <Button
                    onClick={handleLikeToggle}
                    className="flex flex-col gap-1 text-white p-2 size-12"
                    variant={"ghost"}
                >
                    <LucideHeart
                        className={`size-7   ${currentStats.userLiked ? "fill-red-500 stroke-red-500" : "fill-current"}`}
                    />
                    <span className="text-xs">{currentStats.likes}</span>
                </Button>

                <CommentDrawer
                    isDisabled={!video.allowComments || commentMutation.disabled}
                    isLoading={isLoading}
                    comments={currentStats.comments}
                    handleComment={handleComment}
                    handleCommentDelete={handleCommentDelete}
                    handleCommentLikeToggle={handleCommentLikeToggle}
                    commentText={commentMutation.text}
                    setCommentText={commentMutation.setText}
                >
                    <Button
                        disabled={!video.allowComments}
                        className="flex flex-col gap-1 text-white p-2 size-12"
                        variant={"ghost"}
                    >
                        <LucideMessageCircleMore className="size-7 fill-current" />
                        <span className="text-xs">{currentStats.comments.length}</span>
                    </Button>
                </CommentDrawer>

                <Button
                    onClick={handleBookmark}
                    className="flex flex-col gap-1 text-white p-2 size-12"
                    variant={"ghost"}
                >
                    <LucideBookmark
                        className={`size-7  ${currentStats.userBookmarked ? "fill-blue-400 stroke-blue-400" : "fill-current"}`}
                    />
                    <span className="text-xs">{currentStats.bookmarks}</span>
                </Button>

                <ResponsiveShareDialog videoId={video.id} onAction={handleShare}>
                    <Button
                        className="flex flex-col gap-1 text-white p-2 size-12"
                        variant={"ghost"}
                    >
                        <LucideShare2 className="size-7" />
                        <span className="text-xs">{currentStats.shares}</span>
                    </Button>
                </ResponsiveShareDialog>

                <Button
                    onClick={handleDownload}
                    className="flex flex-col gap-1 text-white p-2 size-12"
                    variant={"ghost"}
                >
                    <LucideArrowDownToLine className="size-7" />
                    <span className="text-xs">{currentStats.downloads}</span>
                </Button>
            </div>
            <div className="flex flex-col absolute bottom-15 left-3">
                <span className="text-secondary-foreground text-xs bg-secondary items-center justify-center px-2 py-1 w-fit rounded-full">
                    {formatTime(video.timestamp)}
                </span>
                <p className="text-background font-semibold">
                    {video.title || "Yohpal Monetizing Creativity"}
                </p>
                <p className="text-background">
                    {video.caption?.split(" ").slice(0, 6).join(" ") +
                        (video.caption?.split(" ").length > 6 ? "…" : "")}
                </p>
            </div>
        </>
    )
}
