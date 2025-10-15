"use server"
import {
    bookmarkVideo,
    downloadVideo,
    likeVideo,
    shareVideo,
    unbookmarkVideo,
    unlikeVideo,
    updateView,
} from "@/services/server/video-interactions"
import { VideoInteraction } from "@/types/videos"
import {
    downloadCachedVideoAction,
    shareCachedVideoAction,
    toggleBookmarkCachedVideoAction,
    toggleCachedVideoLikeAction,
    viewCachedVideoAction,
} from "./video-stats-cache-mut"

// NOTE(d6e453a10692)

async function likeVideoAction(interaction: VideoInteraction) {
    await Promise.all([toggleCachedVideoLikeAction(interaction), likeVideo(interaction)])
}

async function unlikeVideoAction(interaction: VideoInteraction) {
    await Promise.all([toggleCachedVideoLikeAction(interaction), unlikeVideo(interaction)])
}

async function bookmarkVideoAction(interaction: VideoInteraction) {
    await Promise.all([toggleBookmarkCachedVideoAction(interaction), bookmarkVideo(interaction)])
}

async function unbookmarkVideoAction(interaction: VideoInteraction) {
    await Promise.all([toggleBookmarkCachedVideoAction(interaction), unbookmarkVideo(interaction)])
}

async function downloadVideoAction(interaction: VideoInteraction) {
    await Promise.all([downloadCachedVideoAction(interaction), downloadVideo(interaction)])
}

async function updateViewAction(interaction: VideoInteraction) {
    await Promise.all([viewCachedVideoAction(interaction), updateView(interaction)])
}

async function shareVideoAction(interaction: VideoInteraction) {
    await Promise.all([shareCachedVideoAction(interaction), shareVideo(interaction)])
}

export {
    bookmarkVideoAction,
    downloadVideoAction,
    likeVideoAction,
    shareVideoAction,
    unbookmarkVideoAction,
    unlikeVideoAction,
    updateViewAction,
}
