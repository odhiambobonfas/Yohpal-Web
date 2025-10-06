import NotLoggedIn from "@/components/custom/app/video/following/NotLoggedIn"
import DebugWindow from "@/components/custom/DebugWindow"
import { COOKIES } from "@/constants"
import { getFollowingFeed } from "@/services/server/following-feed"
import { VideoWithStats } from "@/types/videos"
import { LucideHeart } from "lucide-react"
import { cookies } from "next/headers"
import Image from "next/image"
import Link from "next/link"

export default async function Page() {
    const cookieStore = await cookies()
    const userId = cookieStore.get(COOKIES.User)?.value

    if (!userId) return <NotLoggedIn />
    const feed = await getFollowingFeed(userId)

    return (
        <>
            <DebugWindow>
                <pre>{JSON.stringify(feed.followingMeta, null, 2)}</pre>
            </DebugWindow>
            <div
                className="grid gap-4 p-2"
                style={{
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(max(calc(100% / 6 - 1rem), 200px), 1fr))",
                }}
            >
                {feed.videos.map((video) => (
                    <VideoPreview key={video.id} video={video} userId={userId} />
                ))}
            </div>
        </>
    )
}

function VideoPreview({ video, userId }: { video: VideoWithStats; userId: string }) {
    return (
        <Link
            href={viewProfileVideos(video.userId, video.id)}
            key={video.id}
            className="h-70 relative w-full bg-secondary/40 shadow-md rounded-lg flex flex-col overflow-hidden"
        >
            <div className="h-full w-full bg-slate-100/10">
                <Image
                    src={video.thumbnail}
                    className="flex bg-slate-100/10 h-full w-full object-cover"
                    alt="videoId"
                    width={100}
                    height={100}
                />
            </div>
            <div className="absolute text-white bottom-0 w-full h-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex justify-center items-end gap-2 px-4 py-3">
                <Link href={`/user/${video.userId}`} className="h-5 flex-1">
                    {video.userName}
                </Link>
                <div className=" inline-flex gap-1 text-sm items-center">
                    <LucideHeart
                        className={`size-4 ${video.likes.includes(userId) ? "text-red-500 fill-current" : ""}`}
                    />{" "}
                    {video.likes.length}
                </div>
            </div>
        </Link>
    )
}

function viewProfileVideos(userId: string, videoId: string) {
    const params = new URLSearchParams({
        u: userId,
        v: videoId,
    })
    return `/?${params.toString()}`
}
