import { VideoWithStats } from "@/types/videos"

export function filterBlocked(
    videos: VideoWithStats[],
    blockedUsers: string[] | undefined,
): VideoWithStats[] {
    if (!blockedUsers) return videos
    // remove videos from the users unless its promoted
    return videos.filter((v) => !blockedUsers.includes(v.userId) && !v.promoted)
}
