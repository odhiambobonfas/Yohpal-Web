import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore"

import { VideoCommentInteraction } from "#/videos"
import { db } from "@/lib/firebase/firebase.browser"

interface CommentActionProps {
    videoId: string
    userId: string
    commentId: string
}

export async function addCommentAction(interaction: VideoCommentInteraction) {
    const commentsRef = collection(db, "comments", interaction.videoId, "messages")

    const docRef = await addDoc(commentsRef, {
        username: interaction.username,
        profile_picture: interaction.profilePicture,
        userId: interaction.userId,
        msg: interaction.comment,
        isReply: interaction.isReply,
        replies: 0,
        likes: 0,
        hasReply: false,
        timestamp: serverTimestamp(),
    })

    return docRef.id
}

export async function deleteCommentAction(commentId: string, videoId: string) {
    const commentRef = doc(db, "comments", videoId, "messages", commentId)

    // TODO(80186fb26301)
    await updateDoc(commentRef, { deleted: true })
}

export async function replyCommentAction() {
    console.log(`[TODO]: Implement reply functionality`)
}

export async function likeCommentAction(cap: CommentActionProps) {
    const commentRef = doc(db, "comments", cap.videoId, "messages", cap.commentId)
    const commentUserIdRef = doc(commentRef, "userIds", cap.userId)
    const [commentDoc, commentUserIdDoc] = await Promise.all([
        getDoc(commentRef),
        getDoc(commentUserIdRef),
    ])
    if (commentUserIdDoc.exists()) return // no need to update as we already liked it

    const likes = (!commentDoc.exists() ? 0 : commentDoc.data()?.likes || 0) + 1

    await Promise.all([
        updateDoc(commentRef, { likes: likes }),
        setDoc(commentUserIdRef, { userId: cap.userId, timestamp: serverTimestamp() }),
    ])
}

export async function unlikeCommentAction(cap: CommentActionProps) {
    const commentRef = doc(db, "comments", cap.videoId, "messages", cap.commentId)
    const commentUserIdRef = doc(commentRef, "userIds", cap.userId)
    const [commentDoc, commentUserIdDoc] = await Promise.all([
        getDoc(commentRef),
        getDoc(commentUserIdRef),
    ])

    if (!commentUserIdDoc.exists()) throw new Error("Can't unlike comment you never liked")

    const likes = (!commentDoc.exists() ? 0 : commentDoc.data()?.likes || 0) - 1
    const newLikes = likes < 0 ? 0 : likes

    await Promise.all([updateDoc(commentRef, { likes: newLikes }), deleteDoc(commentUserIdRef)])
}
