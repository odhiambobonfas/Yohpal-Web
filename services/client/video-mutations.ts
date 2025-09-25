import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore"

import { db } from "@/lib/firebase/firebase.browser"
import { VideoCommentInteraction, VideoInteraction } from "#/videos"
import { DOC } from "@/services"

export async function commentVideo(interaction: VideoCommentInteraction) {
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

    await deleteDoc(commentRef)
}

export async function likeVideo(interaction: VideoInteraction) {
    const userLikeRef = doc(
        db,
        "users",
        interaction.userId,
        "likes",
        DOC,
        "videoIds",
        interaction.videoId,
    )
    const videoLikeRef = doc(
        db,
        "videos",
        interaction.videoId,
        "likes",
        DOC,
        "userIds",
        interaction.userId,
    )

    await Promise.all([
        setDoc(userLikeRef, { videoId: interaction.videoId, timestamp: serverTimestamp() }),
        setDoc(videoLikeRef, { userId: interaction.userId, timestamp: serverTimestamp() }),
    ])
}

export async function unlikeVideo(interaction: VideoInteraction) {
    const userLikeRef = doc(
        db,
        "users",
        interaction.userId,
        "likes",
        DOC,
        "videoIds",
        interaction.videoId,
    )
    const videoLikeRef = doc(
        db,
        "videos",
        interaction.videoId,
        "likes",
        DOC,
        "userIds",
        interaction.userId,
    )

    await Promise.all([deleteDoc(userLikeRef), deleteDoc(videoLikeRef)])
}

export async function bookmarkVideo(interaction: VideoInteraction) {
    const userBookmarkRef = doc(
        db,
        "users",
        interaction.userId,
        "bookmarks",
        DOC,
        "videoIds",
        interaction.videoId,
    )
    const videoBookmarkRef = doc(
        db,
        "videos",
        interaction.videoId,
        "bookmarks",
        DOC,
        "userIds",
        interaction.userId,
    )

    await Promise.all([
        setDoc(userBookmarkRef, { videoId: interaction.videoId, timestamp: serverTimestamp() }),
        setDoc(videoBookmarkRef, { userId: interaction.userId, timestamp: serverTimestamp() }),
    ])
}
export async function unbookmarkVideo(interaction: VideoInteraction) {
    const userBookmarkRef = doc(
        db,
        "users",
        interaction.userId,
        "bookmarks",
        DOC,
        "videoIds",
        interaction.videoId,
    )
    const videoBookmarkRef = doc(
        db,
        "videos",
        interaction.videoId,
        "bookmarks",
        DOC,
        "userIds",
        interaction.userId,
    )

    await Promise.all([deleteDoc(userBookmarkRef), deleteDoc(videoBookmarkRef)])
}

export async function shareVideoAction(interaction: VideoInteraction) {
    const colName = "shares"
    const userSharesRef = doc(
        db,
        "users",
        interaction.userId,
        colName,
        DOC,
        "videoIds",
        interaction.videoId,
    )
    const videoSharesRef = doc(
        db,
        "videos",
        interaction.videoId,
        colName,
        DOC,
        "userIds",
        interaction.userId,
    )

    await Promise.all([
        setDoc(userSharesRef, { videoId: interaction.videoId, timestamp: serverTimestamp() }),
        setDoc(videoSharesRef, { userId: interaction.userId, timestamp: serverTimestamp() }),
    ])
}

export async function downloadVideoAction(interaction: VideoInteraction) {
    const colName = "downloads"
    const userDownloadsRef = doc(
        db,
        "users",
        interaction.userId,
        colName,
        DOC,
        "videoIds",
        interaction.videoId,
    )
    const videoDownloadsRef = doc(
        db,
        "videos",
        interaction.videoId,
        colName,
        DOC,
        "userIds",
        interaction.userId,
    )

    await Promise.all([
        setDoc(userDownloadsRef, { videoId: interaction.videoId, timestamp: serverTimestamp() }),
        setDoc(videoDownloadsRef, { userId: interaction.userId, timestamp: serverTimestamp() }),
    ])
}

export async function updateViewAction(interaction: VideoInteraction) {
    const userVideoWatchRef = doc(
        db,
        "users",
        interaction.userId,
        "watched",
        DOC,
        "videoIds",
        interaction.videoId,
    )
    const videoWatchRef = doc(
        db,
        "videos",
        interaction.videoId,
        "views",
        DOC,
        "userIds",
        interaction.userId,
    )

    await Promise.all([
        setDoc(userVideoWatchRef, { videoId: interaction.videoId, timestamp: serverTimestamp() }),
        setDoc(videoWatchRef, { userId: interaction.userId, timestamp: serverTimestamp() }),
    ])
}
