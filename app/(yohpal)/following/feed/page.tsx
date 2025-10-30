import { getPromotedVideosAction } from "@/actions/videos/promoted-videos"
import FollowingCanvas from "@/components/custom/app/following/FollowingCanvas"
import NotLoggedIn from "@/components/custom/app/video/following/NotLoggedIn"
import { COOKIES, PROMOTED_VIDEOS_LIMIT } from "@/constants"
import { withCache } from "@/lib/cache"
import { cookies } from "next/headers"

export default async function FeedPage() {
    const cookieStore = await cookies()
    const loggedInUserId = cookieStore.get(COOKIES.User)?.value
    if (!loggedInUserId) return <NotLoggedIn />

    const promotedContent = await withCache(
        () => getPromotedVideosAction(loggedInUserId, PROMOTED_VIDEOS_LIMIT),
        `following-feed:promoted:${loggedInUserId}`,
    )
    return <FollowingCanvas promotedVideos={promotedContent.videos} />
}
