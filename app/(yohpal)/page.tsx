import { getPromotedVideosAction } from "@/actions/videos/promoted-videos"
import PlayerCanvas from "@/components/custom/app/video/PlayerCanvas"
import { COOKIES } from "@/constants"
import { getLandingVideos } from "@/services/server/videos"
import { cookies } from "next/headers"

export default async function Home({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const videoId = (await searchParams)?.v as string | undefined
    const userId = (await searchParams)?.u as string | undefined

    const cookieStore = await cookies()
    const loggedInUserId = cookieStore.get(COOKIES.User)?.value

    const [content, promoted] = await Promise.all([
        getLandingVideos(videoId, userId, loggedInUserId),
        getPromotedVideosAction(loggedInUserId),
    ])

    return (
        <PlayerCanvas
            videos={content!.videos}
            promotedVideos={promoted?.videos}
            lastVideoDoc={content!.lastVideoDoc}
            firstVideo={content?.firstVideo || null}
        />
    )
}
