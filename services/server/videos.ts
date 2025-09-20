import { db } from "@/lib/firebase/firebase.admin"
import { Video } from "#/videos"
import { replaceWithCDN, serializeTimestamp } from "@/lib/utils"
import { DEFAULT_THUMBNAIL, VIDEO_LIMIT } from "@/constants"
import { Timestamp } from "firebase/firestore"

const videoRef = db.collection("videos")

export async function getLandingVideos(videoId: string | undefined) {
    const videos = []
    if (videoId) {
        const videoDoc = await videoRef.doc(videoId).get()
        if (videoDoc.exists) {
            let videoData = videoDoc.data()
            if (!videoData) return
            delete videoData["campaignMeta"]

            videoData = {
                id: videoDoc.id,
                ...videoData,
                videoUrl: replaceWithCDN(videoData.videoUrl),
                thumbnail: replaceWithCDN(videoData.thumbnail) || DEFAULT_THUMBNAIL,
                timestamp: serializeTimestamp(videoData.timestamp),
            }

            videos.push(videoData)
        }
    }

    const videosDocs = await videoRef
        .where("broken", "==", false)
        .orderBy("timestamp", "desc")
        .limit(VIDEO_LIMIT)
        .get()

    const moreVids = videosDocs.docs.map((v) => {
        // TODO(583fae8a3d42):: find a way to deal with campaignMeta
        const videoData = v.data()
        delete videoData["campaignMeta"]
        return {
            id: v.id,
            ...videoData,
            videoUrl: replaceWithCDN(videoData.videoUrl),
            thumbnail: replaceWithCDN(videoData.thumbnail) || DEFAULT_THUMBNAIL,
            timestamp: serializeTimestamp(videoData.timestamp),
        }
    }) as Video[]
    videos.push(...moreVids)
    return videos
}

export async function getUserVideoUploads(userId: string) {
    const videoUploads = await db
        .collection("videos")
        .where("userId", "==", userId)
        .where("broken", "==", false)
        .orderBy("timestamp", "desc")
        .get()

    if (videoUploads.empty) return []

    // TODO::(583fae8a3d42)
    return videoUploads.docs.map((v) => {
        const videoData = v.data()
        delete videoData["campaignMeta"]
        return {
            id: v.id,
            ...videoData,
            videoUrl: replaceWithCDN(videoData.videoUrl),
            thumbnail: replaceWithCDN(videoData.thumbnail) || DEFAULT_THUMBNAIL,
            timestamp: serializeTimestamp(videoData.timestamp),
        }
    }) as Video[]
}
