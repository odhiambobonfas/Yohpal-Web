"use server"

import { DEFAULT_THUMBNAIL } from "@/constants"
import { onlyProd } from "@/lib/dev"
import { db } from "@/lib/firebase/firebase.admin"
import { flattenObject, replaceWithCDN, serializeTimestamp } from "@/lib/utils"
import { getVideoStats } from "@/services/server/videos"
import { VideoWithStats } from "@/types/videos"

const videoRef = db.collection("videos")

async function getPromotedVideosAction(
    loggedInUserId: string | undefined,
    limit: number,
    lastPromotedDocId?: string,
) {
    const safeLimit = limit ?? 3
    try {
        let query = videoRef
            .where("promoted", "==", true)
            .orderBy("timestamp", "desc")
            .limit(safeLimit)

        // Apply pagination if we have a lastPromotedDocId
        if (lastPromotedDocId) {
            const lastDocRef = await videoRef.doc(lastPromotedDocId).get()
            if (lastDocRef.exists) query = query.startAfter(lastDocRef)
        }

        const promotedSnapshot = await query.get()
        if (promotedSnapshot.empty) {
            return { videos: [], lastPromotedDoc: null }
        }

        const promotedVideos = await Promise.all(
            promotedSnapshot.docs.map(async (doc) => {
                const data = doc.data()

                const stats = await onlyProd(() => getVideoStats(doc.id, loggedInUserId), {
                    shares: [],
                    views: [],
                    likes: [],
                    comments: [],
                    bookmarks: [],
                    downloads: [],
                })

                return flattenObject({
                    id: doc.id,
                    ...data,
                    videoUrl: replaceWithCDN(data.videoUrl),
                    thumbnail: replaceWithCDN(data.thumbnail) || DEFAULT_THUMBNAIL,
                    timestamp: serializeTimestamp(data.timestamp),
                    ...stats,
                }) as VideoWithStats
            }),
        )

        const lastPromotedDoc =
            promotedVideos.length > 0 ? promotedVideos[promotedVideos.length - 1].id : null

        return {
            videos: promotedVideos,
            lastPromotedDoc,
        }
    } catch (error) {
        console.error("Error fetching promoted videos:", error)
        return { videos: [], lastPromotedDoc: null }
    }
}

export { getPromotedVideosAction }
