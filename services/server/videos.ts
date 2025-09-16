import { db } from "@/lib/firebase/firebase.admin"
import { Video } from "#/videos"
import { serializeTimestamp } from "@/lib/utils"

const videoRef = db.collection("videos")
const VIDEO_LIMIT = 50

export async function getLandingVideos(lastVideoId: string | null) {
    const videosDocs = lastVideoId
        ? await videoRef
              .orderBy("timestamp", "desc")
              .startAfter({ id: lastVideoId })
              .limit(VIDEO_LIMIT)
              .get()
        : await videoRef.orderBy("timestamp", "desc").limit(VIDEO_LIMIT).get()

    const videos = videosDocs.docs.map((v) => {
        // TODO(583fae8a3d42):: find a way to deal with campaignMeta
        const { campaignMeta, ...clean } = v.data()
        return {
            id: v.id,
            ...clean,
            timestamp: serializeTimestamp(clean.timestamp),
        }
    }) as Video[]
    const liveVideos = videos.filter((v) => !v.broken && v.privacy.toLowerCase() == "everyone")

    return liveVideos
}
