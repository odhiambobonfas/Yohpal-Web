import { FOLLOWER_FOLLOWING_LIMIT } from "@/constants"
import { VideoWithStats } from "@/types/videos"
import { getFollowingCount } from "./user"
import { getUserVideoUploads } from "./videos"

const FF_VIDEO_LIMIT = 5
export const getFollowingFeed = async (userId: string) => {
    const followingIds = await getFollowingCount(userId, FOLLOWER_FOLLOWING_LIMIT)
    const videos: VideoWithStats[] = []
    // We'll use this to know the actual last docId we got for the user
    // and randomizing can be done client side
    const followingMeta: Map<string, { contentEnded: boolean; lastDoc: string }> = new Map()

    await Promise.all(
        followingIds.map(async (f) => {
            const vids = await getUserVideoUploads(f, undefined, FF_VIDEO_LIMIT)
            if (vids.length > 0) {
                followingMeta.set(f, { lastDoc: vids[vids.length - 1].id, contentEnded: false })
            }
            // returns an array
            videos.push(...vids) //we spread em into
        }),
    )
    return {
        videos: videos.sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
        followingMeta: followingMeta,
    }
}
