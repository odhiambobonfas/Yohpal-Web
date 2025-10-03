import { deleteDoc, doc, serverTimestamp, setDoc } from "firebase/firestore"

import { VideoInteraction } from "#/videos"
import { db } from "@/lib/firebase/firebase.browser"
import { DOC } from "@/services"

export async function likeVideoAction(interaction: VideoInteraction) {
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

export async function unlikeVideoAction(interaction: VideoInteraction) {
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

export async function bookmarkVideoAction(interaction: VideoInteraction) {
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
export async function unbookmarkVideoAction(interaction: VideoInteraction) {
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
