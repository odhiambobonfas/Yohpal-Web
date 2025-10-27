import { LucideSend } from "lucide-react"
import { FormEvent } from "react"

import { VideoComment } from "#/videos"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

import CommentCard from "./CommentCard"
import NoCommentsCard from "./NoCommentsCard"

interface CommentOperations {
    handleComment: (e: FormEvent) => void
    setCommentText: (text: string) => void

    handleCommentDelete: (commentId: string, videoId: string) => void
    handleCommentLikeToggle: (commentId: string, videoId: string, wasLiked: boolean) => void

    comments: VideoComment[]
    commentText: string
    isLoading: boolean
    isDisabled: boolean
    children: React.ReactNode
}
export default function CommentDrawer({
    comments,
    isLoading,
    isDisabled,
    handleComment,
    setCommentText,
    handleCommentDelete,
    handleCommentLikeToggle,
    commentText,
    children,
}: CommentOperations) {
    return (
        <Drawer>
            <DrawerTrigger asChild>{children}</DrawerTrigger>
            <DrawerContent className="p-2 h-[80vh] max-h-[80vh]">
                <DrawerTitle className="hidden">Comments</DrawerTitle>
                <DrawerDescription className="hidden">Comments section</DrawerDescription>
                <div className="h-full py-3 w-full flex gap-3 flex-col">
                    <ScrollArea className="flex-1 overflow-hidden py-3 flex flex-col gap-2">
                        {comments.length === 0 ? (
                            <NoCommentsCard />
                        ) : (
                            comments.map((comment) => (
                                <CommentCard
                                    key={comment.id}
                                    comment={comment}
                                    handleCommentDelete={handleCommentDelete}
                                    handleCommentLikeToggle={handleCommentLikeToggle}
                                />
                            ))
                        )}
                    </ScrollArea>

                    <form onSubmit={handleComment} className="relative w-full h-10">
                        <Input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="rounded-full py-4 pr-12 text-lg w-full h-full"
                            placeholder="What's going on..."
                        />
                        <Button
                            type="submit"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full size-8"
                            disabled={isDisabled}
                        >
                            <LucideSend />
                        </Button>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
