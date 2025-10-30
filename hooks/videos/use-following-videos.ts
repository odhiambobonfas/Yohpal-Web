import { randomizeVideos } from "@/lib/randomize-videos"
import { useAuth } from "@/providers/Auth"
import { FollowingFeed, FollowingFeedMeta, VideoWithStats } from "@/types/videos"
import useVideo from "./use-video"

export default function useFollowingVideos() {
    const { profile } = useAuth()
    const { loading, getClientPaginatedVideos } = useVideo(profile?.uid)

    const getFollowingVideos = async (meta: FollowingFeedMeta) => {
        const updatedMeta: FollowingFeedMeta = {}
        const allVideos: VideoWithStats[] = []

        const promises = Object.entries(meta).map(async ([uid, data]) => {
            if (!data.contentEnded) {
                const followingContent = await getClientPaginatedVideos(data.lastDoc, undefined)
                const contentEnded = followingContent.videos.length === 0

                if (!contentEnded) allVideos.push(...followingContent.videos)

                updatedMeta[uid] = {
                    lastDoc: followingContent.lastVideoDocId || data.lastDoc,
                    contentEnded: contentEnded,
                }
            } else {
                updatedMeta[uid] = data
            }
        })

        await Promise.all(promises)

        return {
            videos: randomizeVideos(allVideos),
            followingMeta: updatedMeta,
        } as FollowingFeed
    }

    return {
        loading,
        getFollowingVideos,
    }
}
