"use client"
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
import { InteractionMutationProps } from "#/videos"
import CommentDrawer from "@/components/custom/app/comments/CommentDrawer"

export default function MobileInteractions({
    handleBookmark,
    handleComment,
    handleDownload,
    handleShare,
    handleLikeToggle,
    isLoading,
    currentStats,
    ownerProfilePicture,
    video,
    commentMutation,
}: InteractionMutationProps) {
    return (
        <div className="absolute right-3 bottom-15 flex flex-col items-center gap-4">
            <Link
                href={`/user/${video.userId}`}
                className="flex flex-col items-center text-white gap-2"
            >
                <Avatar className="size-10">
                    <AvatarImage src={ownerProfilePicture} className="object-cover bg-blue-100" />
                    <AvatarFallback>{video.userName[0]}</AvatarFallback>
                </Avatar>
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
                isDisabled={commentMutation.disabled}
                isLoading={isLoading}
                comments={currentStats.comments}
                handleComment={handleComment}
                commentText={commentMutation.text}
                setCommentText={commentMutation.setText}
            >
                <Button className="flex flex-col gap-1 text-white p-2 size-12" variant={"ghost"}>
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

            <ResponsiveShareDialog videoId={"blue"} onAction={handleShare}>
                <Button className="flex flex-col gap-1 text-white p-2 size-12" variant={"ghost"}>
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
    )
}
