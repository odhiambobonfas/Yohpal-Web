import { LucideLoader, LucideSend } from "lucide-react"
import { FormEvent } from "react"

import { VideoComment } from "#/videos"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

import CommentCard from "./CommentCard"
import NoCommentsCard from "./NoCommentsCard"


interface CommentOperations {
    comments: VideoComment[]
    handleComment: (e: FormEvent) => void
    setCommentText: (text: string) => void
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
                                <CommentCard key={comment.id} comment={comment} />
                            ))
                        )}
                    </ScrollArea>
                    <form
                        onSubmit={handleComment}
                        className="inline-flex w-full items-center gap-2 h-10 mt-auto"
                    >
                        <Input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="rounded-full p-3 text-lg"
                            placeholder="What's going on..."
                        />
                        <Button type="submit" className="rounded-full" disabled={isDisabled}>
                            {isLoading ? <LucideLoader className="animate-spin" /> : <LucideSend />}
                        </Button>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
