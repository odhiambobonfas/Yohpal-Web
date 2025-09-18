import { db } from "@/lib/firebase/firebase.admin"
import { Video } from "#/videos"
import { replaceWithCDN, serializeTimestamp } from "@/lib/utils"
import { VIDEO_LIMIT } from "@/constants"

const videoRef = db.collection("videos")

export async function getLandingVideos(videoId: string | undefined) {
    const videos = []
    if (videoId) {
        const videoDoc = await videoRef.doc(videoId).get()
        if (videoDoc.exists) {
            let vid = { id: videoDoc.id, ...videoDoc.data() } as unknown as Video
            const { campaignMeta, ...clean } = vid
            vid = {
                ...vid,
                videoUrl: replaceWithCDN(vid.videoUrl),
                thumbnail: replaceWithCDN(vid.thumbnail),
                timestamp: serializeTimestamp(clean.timestamp),
            }

            videos.push(vid)
        }
    }

    const videosDocs = await videoRef
        .where("broken", "==", false)
        .orderBy("timestamp", "desc")
        .limit(VIDEO_LIMIT)
        .get()

    const moreVids = videosDocs.docs.map((v) => {
        // TODO(583fae8a3d42):: find a way to deal with campaignMeta
        // const { campaignMeta, ...clean } = v.data()
        const videoData = v.data()
        delete videoData["campaignMeta"]
        return {
            id: v.id,
            ...videoData,
            videoUrl: replaceWithCDN(videoData.videoUrl),
            thumbnail: replaceWithCDN(videoData.thumbnail),
            timestamp: serializeTimestamp(videoData.timestamp),
        }
    }) as Video[]
    videos.push(...moreVids)
    return videos
}
