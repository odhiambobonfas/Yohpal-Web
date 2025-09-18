import { getLandingVideos } from "@/services/server/videos"
import PlayerCanvas from "@/components/custom/app/video/PlayerCanvas"

export default async function Home({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const videoId = (await searchParams)?.v
    const videos = await getLandingVideos(videoId as string)
    return <PlayerCanvas videos={videos} />
}
