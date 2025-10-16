import { CommentActionProps, VideoCommentInteraction } from "#/videos"
import { db, serverTimestamp } from "@/lib/firebase/firebase.admin"

async function addComment(interaction: VideoCommentInteraction) {
    const commentsRef = db.collection("comments").doc(interaction.videoId).collection("messages")

    await commentsRef.add({
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
}

async function deleteComment(commentId: string, videoId: string) {
    const commentRef = db.collection("comments").doc(videoId).collection("messages").doc(commentId)

    await commentRef.update({ deleted: true })
}

async function likeComment(cap: CommentActionProps) {
    const commentRef = db
        .collection("comments")
        .doc(cap.videoId)
        .collection("messages")
        .doc(cap.commentId)

    const commentUserIdRef = commentRef.collection("userIds").doc(cap.userId)
    const [commentDoc, commentUserIdDoc] = await Promise.all([
        commentRef.get(),
        commentUserIdRef.get(),
    ])

    if (commentUserIdDoc.exists) return

    const likes = (!commentDoc.exists ? 0 : commentDoc.data()?.likes || 0) + 1

    await Promise.all([
        commentRef.update({ likes: likes }),
        commentUserIdRef.set({ userId: cap.userId, timestamp: serverTimestamp() }),
    ])
}

async function unlikeComment(cap: CommentActionProps) {
    const commentRef = db
        .collection("comments")
        .doc(cap.videoId)
        .collection("messages")
        .doc(cap.commentId)
    const commentUserIdRef = commentRef.collection("userIds").doc(cap.userId)
    const [commentDoc, commentUserIdDoc] = await Promise.all([
        commentRef.get(),
        commentUserIdRef.get(),
    ])

    if (!commentUserIdDoc.exists) throw new Error("Cant unlike comment you never liked")

    const likes = (!commentDoc.exists ? 0 : commentDoc.data()?.likes || 0) - 1
    const newLikes = likes < 0 ? 0 : likes

    await Promise.all([commentRef.update({ likes: newLikes }), commentUserIdRef.delete()])
}

export { addComment, deleteComment, likeComment, unlikeComment }
