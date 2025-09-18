import { db } from "@/lib/firebase/firebase.browser"
import { VideoCommentInteraction, VideoInteraction } from "#/videos"
import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore"
import { DOC } from "."

export async function commentVideo(interaction: VideoCommentInteraction) {
    const commentsRef = collection(db, "comments", interaction.videoId, "messages")

    const docRef = await addDoc(commentsRef, {
        profile_picture: interaction.profilePicture,
        userId: interaction.userId,
        username: interaction.username,
        msg: interaction.comment,
        isReply: interaction.isReply,
        replies: 0,
        likes: 0,
        timestamp: serverTimestamp(),
    })

    return docRef.id
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
