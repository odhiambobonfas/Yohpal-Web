import PlayerCanvas from "@/components/custom/app/video/PlayerCanvas"
import { getLandingVideos } from "@/services/server/videos"

export default async function Home({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const videoId = (await searchParams)?.v as string | undefined
    const userId = (await searchParams)?.u as string | undefined
    const content = await getLandingVideos(videoId, userId)
    return (
        <PlayerCanvas
            videos={content!.videos}
            lastVideoDoc={content!.lastVideoDoc}
            firstVideo={content?.firstVideo || null}
        />
    )
}
