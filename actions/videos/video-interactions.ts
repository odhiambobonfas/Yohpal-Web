"use server"
import { db, serverTimestamp } from "@/lib/firebase/firebase.admin"
import { DOC } from "@/services"
import { VideoInteraction } from "@/types/videos"

async function likeVideoAction(interaction: VideoInteraction) {
    const userLikeRef = db
        .collection("users")
        .doc(interaction.userId)
        .collection("likes")
        .doc(DOC)
        .collection("videoIds")
        .doc(interaction.videoId)

    const videoLikeRef = db
        .collection("videos")
        .doc(interaction.videoId)
        .collection("likes")
        .doc(DOC)
        .collection("userIds")
        .doc(interaction.userId)

    await Promise.all([
        userLikeRef.set({ videoId: interaction.videoId, timestamp: serverTimestamp() }),
        videoLikeRef.set({ userId: interaction.userId, timestamp: serverTimestamp() }),
    ])
}

async function unlikeVideoAction(interaction: VideoInteraction) {
    const userLikeRef = db
        .collection("users")
        .doc(interaction.userId)
        .collection("likes")
        .doc(DOC)
        .collection("videoIds")
        .doc(interaction.videoId)

    const videoLikeRef = db
        .collection("videos")
        .doc(interaction.videoId)
        .collection("likes")
        .doc(DOC)
        .collection("userIds")
        .doc(interaction.userId)

    await Promise.all([userLikeRef.delete(), videoLikeRef.delete()])
}

async function bookmarkVideoAction(interaction: VideoInteraction) {
    const userBookmarkRef = db
        .collection("users")
        .doc(interaction.userId)
        .collection("bookmarks")
        .doc(DOC)
        .collection("videoIds")
        .doc(interaction.videoId)

    const videoBookmarkRef = db
        .collection("videos")
        .doc(interaction.videoId)
        .collection("bookmarks")
        .doc(DOC)
        .collection("userIds")
        .doc(interaction.userId)

    await Promise.all([
        userBookmarkRef.set({ videoId: interaction.videoId, timestamp: serverTimestamp() }),
        videoBookmarkRef.set({ userId: interaction.userId, timestamp: serverTimestamp() }),
    ])
}

async function unbookmarkVideoAction(interaction: VideoInteraction) {
    const userBookmarkRef = db
        .collection("users")
        .doc(interaction.userId)
        .collection("bookmarks")
        .doc(DOC)
        .collection("videoIds")
        .doc(interaction.videoId)

    const videoBookmarkRef = db
        .collection("videos")
        .doc(interaction.videoId)
        .collection("bookmarks")
        .doc(DOC)
        .collection("userIds")
        .doc(interaction.userId)

    await Promise.all([userBookmarkRef.delete(), videoBookmarkRef.delete()])
}

async function downloadVideoAction(interaction: VideoInteraction) {
    const colName = "downloads"
    const userDownloadsRef =  db
        .collection("users")
        .doc(interaction.userId)
        .collection(colName)
        .doc(DOC)
        .collection("videoIds")
        .doc(interaction.videoId)

    const videoDownloadsRef =  db
        .collection("videos")
        .doc(interaction.videoId)
        .collection(colName)
        .doc(DOC)
        .collection("userIds")
        .doc(interaction.userId)

    await Promise.all([
        userDownloadsRef.set({ videoId: interaction.videoId, timestamp: serverTimestamp() }),
        videoDownloadsRef.set({ userId: interaction.userId, timestamp: serverTimestamp() }),
    ])
}

async function updateViewAction(interaction: VideoInteraction) {
    const userVideoWatchRef = db
        .collection("users")
        .doc(interaction.userId)
        .collection("watched")
        .doc(DOC)
        .collection("videoIds")
        .doc(interaction.videoId)

    const videoWatchRef = db
        .collection("videos")
        .doc(interaction.videoId)
        .collection("views")
        .doc(DOC)
        .collection("userIds")
        .doc(interaction.userId)

    await Promise.all([
        userVideoWatchRef.set({videoId: interaction.videoId, timestamp: serverTimestamp()}),
        videoWatchRef.set({userId: interaction.userId, timestamp: serverTimestamp() })
    ])    
}

async function shareVideoAction(interaction: VideoInteraction) {
    const colName = "shares"
    const userSharesRef =  db
        .collection("users")
        .doc(interaction.userId)
        .collection(colName)
        .doc(DOC)
        .collection("videoIds")
        .doc(interaction.videoId)

    const videoSharesRef =  db
        .collection("videos")
        .doc(interaction.videoId)
        .collection(colName)
        .doc(DOC)
        .collection("userIds")
        .doc(interaction.userId)

    await Promise.all([
        userSharesRef.set({ videoId: interaction.videoId, timestamp: serverTimestamp() }),
        videoSharesRef.set({ userId: interaction.userId, timestamp: serverTimestamp() }),
    ])
}

export {
    bookmarkVideoAction,
    downloadVideoAction,
    likeVideoAction,
    shareVideoAction,
    unbookmarkVideoAction,
    unlikeVideoAction,
    updateViewAction
}
