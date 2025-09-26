import PlayerCanvas from "@/components/custom/app/video/PlayerCanvas"
import { getLandingVideos } from "@/services/server/videos"

export default async function Home({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const videoId = (await searchParams)?.v as string | undefined
    const userId = (await searchParams)?.u as string | undefined
    const videos = await getLandingVideos(videoId, userId)
    return <PlayerCanvas videos={videos!} />
}
