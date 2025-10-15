"use server"

import { CommentActionProps, VideoCommentInteraction } from "#/videos"
import { addComment, deleteComment, likeComment, unlikeComment } from "@/services/server/comments"
import {
    addCommentCacheAction,
    deleteCacheComment,
    toggleCacheCommentLike,
} from "./comment-cache-mut"

// NOTE(15c5834672a2)

async function addCommentAction(interaction: VideoCommentInteraction) {
    const [c] = await Promise.all([addCommentCacheAction(interaction), addComment(interaction)])
    return c
}

async function deleteCommentAction(commentId: string, videoId: string) {
    await Promise.all([deleteCacheComment(commentId, videoId), deleteComment(commentId, videoId)])
}

async function likeCommentAction(cap: CommentActionProps) {
    await Promise.all([toggleCacheCommentLike(cap, true), likeComment(cap)])
}

async function unlikeCommentAction(cap: CommentActionProps) {
    await Promise.all([toggleCacheCommentLike(cap, false), unlikeComment(cap)])
}

export { addCommentAction, deleteCommentAction, likeCommentAction, unlikeCommentAction }
