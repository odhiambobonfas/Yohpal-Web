import { getPromotedVideosAction } from "@/actions/videos/promoted-videos"
import PlayerCanvas from "@/components/custom/app/video/PlayerCanvas"
import { COOKIES, PROMOTED_VIDEOS_LIMIT } from "@/constants"
import { filterBlocked } from "@/lib/filter-blocked"
import { getBlocked } from "@/services/server/user"
import { getLandingVideos } from "@/services/server/videos"
import { cookies } from "next/headers"
import FriendsPage from "./friends/page"

export default async function Home({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const showFriends = "friends" in params

    const videoId = (await searchParams)?.v as string | undefined
    const userId = (await searchParams)?.u as string | undefined

    const cookieStore = await cookies()
    const loggedInUserId = cookieStore.get(COOKIES.User)?.value

    const [content, blockedUsers] = await Promise.all([
        getLandingVideos(videoId, userId, loggedInUserId),
        getBlocked(loggedInUserId),
    ])

    const blockFiltered = filterBlocked(content!.videos, blockedUsers)

    const LIMIT = Math.min(PROMOTED_VIDEOS_LIMIT, blockFiltered.length / 2) || 3

    const promoted = await getPromotedVideosAction(loggedInUserId, LIMIT)

    return (
        <div className="flex flex-row">
            {showFriends && <FriendsPage />}
            <PlayerCanvas
                videos={blockFiltered}
                promotedVideos={promoted?.videos}
                blockedUsers={blockedUsers}
                lastVideoDoc={content!.lastVideoDoc}
                firstVideo={content?.firstVideo || undefined}
            />
        </div>
    )
}
