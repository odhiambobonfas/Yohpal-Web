import { DEFAULT_THUMBNAIL } from "@/constants"
import { withCache } from "@/lib/cache"
import { db } from "@/lib/firebase/firebase.admin"
import { flattenObject, replaceWithCDN, serializeTimestamp } from "@/lib/utils"
import { Video } from "@/types/videos"

const videoTagRef = (tag: string) => db.collection("videos").where("tags", "array-contains", tag)

async function getVideosByTag(tag: string) {
    const [count, firstVideo, rest] = await Promise.all([
        withCache(() => getVideosByTagCount(tag), `tag:${tag}:videoCount`),
        withCache(() => getFirstVideoForTag(tag), `tag:${tag}:firstVideo`),
        withCache(() => getRemainingVideos(tag), `tag:${tag}:videos`),
    ])

    const uniqueVideos = rest.filter((v) => v.id !== firstVideo?.id)
    return { count, videos: [firstVideo, ...uniqueVideos].filter((v) => v !== null) }
}

async function getVideosByTagCount(tag: string) {
    const videoCount = await videoTagRef(tag).count().get()

    return videoCount.data().count ?? 0
}

async function getRemainingVideos(tag: string) {
    const videoDocs = await videoTagRef(tag).orderBy("timestamp", "desc").limit(50).get()
    if (videoDocs.empty) return []

    return videoDocs.docs.map((v) => {
        const data = v.data()

        return flattenObject({
            id: v.id,
            ...data,
            videoUrl: replaceWithCDN(data.videoUrl),
            thumbnail: replaceWithCDN(data.thumbnail) || DEFAULT_THUMBNAIL,
            timestamp: serializeTimestamp(data.timestamp),
        }) as Video
    })
}

async function getFirstVideoForTag(tag: string) {
    const videoDocs = await videoTagRef(tag).orderBy("timestamp", "asc").limit(1).get()
    if (videoDocs.empty) return null
    const videoDoc = videoDocs.docs.at(0)
    if (!videoDoc?.exists) return null

    const videoDocData = videoDoc.data()

    return flattenObject({
        id: videoDoc.id,
        ...videoDocData,
        videoUrl: replaceWithCDN(videoDocData.videoUrl),
        thumbnail: replaceWithCDN(videoDocData.thumbnail) || DEFAULT_THUMBNAIL,
        timestamp: serializeTimestamp(videoDocData.timestamp),
    }) as Video
}

export { getVideosByTag }
