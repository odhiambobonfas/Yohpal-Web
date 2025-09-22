import { db } from "@/lib/firebase/firebase.admin"
import { VideoComment, VideoWithStats } from "#/videos"
import { replaceWithCDN, serializeTimestamp, recoverThumbnail } from "@/lib/utils"
import { DEFAULT_THUMBNAIL, VIDEO_LIMIT } from "@/constants"
import { DOC } from ".."

const videoRef = db.collection("videos")

export async function getLandingVideos(videoId: string | undefined) {
    const videos: VideoWithStats[] = []

    if (videoId) {
        const videoDoc = await videoRef.doc(videoId).get()

        if (videoDoc.exists) {
            const videoData = videoDoc.data()
            if (!videoData) return
            delete videoData["campaignMeta"]

            const videoStats = await getVideoStats(videoId)

            const cleanVideoData = {
                id: videoDoc.id,
                ...videoData,
                videoUrl: replaceWithCDN(videoData.videoUrl),
                thumbnail: recoverThumbnail(
                    replaceWithCDN(videoData.thumbnail || DEFAULT_THUMBNAIL),
                    replaceWithCDN(videoData.videoUrl),
                ),
                timestamp: serializeTimestamp(videoData.timestamp),
                ...videoStats,
            } as unknown as VideoWithStats

            videos.push(cleanVideoData)
        }
    }

    const videosDocs = await videoRef
        .where("broken", "==", false)
        .orderBy("timestamp", "desc")
        .limit(VIDEO_LIMIT)
        .get()

    const moreVids = (await Promise.all(
        videosDocs.docs.map(async (v) => {
            // TODO(583fae8a3d42):: find a way to deal with campaignMeta
            const videoData = v.data()
            delete videoData["campaignMeta"]

            const videoStats = await getVideoStats(v.id)
            return {
                id: v.id,
                ...videoData,
                videoUrl: replaceWithCDN(videoData.videoUrl),
                thumbnail: replaceWithCDN(videoData.thumbnail) || DEFAULT_THUMBNAIL,
                timestamp: serializeTimestamp(videoData.timestamp),
                ...videoStats,
            }
        }),
    )) as unknown as VideoWithStats[]

    videos.push(...moreVids)

    return videos
}

async function getVideoStats(videoId: string) {
    const [likes, bookmarks, shares, views, comments] = await Promise.all([
        getVideoLikes(videoId),
        getVideoBookmarks(videoId),
        getVideoShares(videoId),
        getVideoViews(videoId),
        getVideoComments(videoId),
    ])

    return {
        likes,
        bookmarks,
        shares,
        views,
        comments,
    }
}

export async function getUserVideoUploads(userId: string) {
    const videoUploads = await db
        .collection("videos")
        .where("userId", "==", userId)
        .where("broken", "==", false)
        .orderBy("timestamp", "desc")
        .get()

    if (videoUploads.empty) return []

    const videos = await Promise.all(
        videoUploads.docs.map(async (v) => {
            const videoData = v.data()
            delete videoData["campaignMeta"]

            const videoStats = await getVideoStats(v.id)

            return {
                id: v.id,
                ...videoData,
                videoUrl: replaceWithCDN(videoData.videoUrl),
                thumbnail: recoverThumbnail(
                    replaceWithCDN(videoData.thumbnail || DEFAULT_THUMBNAIL),
                    replaceWithCDN(videoData.videoUrl),
                ),
                timestamp: serializeTimestamp(videoData.timestamp),
                ...videoStats,
            }
        }),
    )

    return videos as unknown as VideoWithStats[]
}

async function getVideoLikes(videoId: string) {
    const videoRef = await db
        .collection("videos")
        .doc(videoId)
        .collection("likes")
        .doc(DOC)
        .collection("userIds")
        .get()

    if (videoRef.empty) return []

    return videoRef.docs.map((v) => v.id)
}

async function getVideoBookmarks(videoId: string) {
    const videoRef = await db
        .collection("videos")
        .doc(videoId)
        .collection("bookmarks")
        .doc(DOC)
        .collection("userIds")
        .get()

    if (videoRef.empty) return []

    return videoRef.docs.map((v) => v.id)
}

async function getVideoShares(videoId: string) {
    const videoRef = await db
        .collection("videos")
        .doc(videoId)
        .collection("shares")
        .doc(DOC)
        .collection("userIds")
        .count()
        .get()

    return videoRef.data().count ?? 0
}

async function getVideoViews(videoId: string) {
    const videoRef = await db
        .collection("videos")
        .doc(videoId)
        .collection("views")
        .doc(DOC)
        .collection("userIds")
        .count()
        .get()

    return videoRef.data().count ?? 0
}

async function getVideoComments(videoId: string) {
    const commentsRef = await db.collection("comments").doc(videoId).collection("messages").get()

    if (commentsRef.empty) return []
    const comments = commentsRef.docs.map((c) => {
        const data = c.data()
        return { id: c.id, ...data, timestamp: serializeTimestamp(data.timestamp) }
    })

    return comments as unknown as VideoComment[]
}
