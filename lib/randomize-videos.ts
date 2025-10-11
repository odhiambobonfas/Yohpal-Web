import { VideoWithStats } from "#/videos"

export function randomizeVideos(videos: VideoWithStats[]) {
    if (videos.length === 0) return videos

    const sorted = [...videos].sort((a, b) => b.timestamp.localeCompare(a.timestamp))

    const byUser = new Map<string, VideoWithStats[]>()
    sorted.forEach((video) => {
        if (!byUser.has(video.userId)) {
            byUser.set(video.userId, [])
        }
        byUser.get(video.userId)!.push(video)
    })

    const result: VideoWithStats[] = []
    let lastUserId: string | null = null

    while (byUser.size > 0) {
        let available = Array.from(byUser.keys()).filter((id) => id !== lastUserId)

        // If we must repeat the last user, include them
        if (available.length === 0) {
            available = Array.from(byUser.keys())
            // When forced to repeat, prefer users with more videos
            if (available.length > 1) {
                available.sort((a, b) => byUser.get(b)!.length - byUser.get(a)!.length)
                const topCount = Math.min(3, available.length)
                available = available.slice(0, topCount)
            }
        }

        const randomUserId = available[Math.floor(Math.random() * available.length)]
        const userQueue = byUser.get(randomUserId)!

        result.push(userQueue.shift()!)
        lastUserId = randomUserId

        // Remove user from map if empty
        if (userQueue.length === 0) {
            byUser.delete(randomUserId)
        }
    }

    return result
}
