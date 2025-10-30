import FollowingVideoPreview from "@/components/custom/app/following/FollowingVideoPreview"
import NotLoggedIn from "@/components/custom/app/video/following/NotLoggedIn"
import DebugWindow from "@/components/custom/DebugWindow"
import { COOKIES } from "@/constants"
import { randomizeVideos } from "@/lib/randomize-videos"
import { getFollowingFeed } from "@/services/server/following-feed"
import { cookies } from "next/headers"

export default async function Page() {
    const cookieStore = await cookies()
    const userId = cookieStore.get(COOKIES.User)?.value

    if (!userId) return <NotLoggedIn />

    const feed = await getFollowingFeed(userId)
    const videos = randomizeVideos(feed.videos)

    return (
        <>
            <DebugWindow>
                <span>Count: {feed.videos.length}</span>
            </DebugWindow>
            <div
                className="grid gap-4 p-2"
                style={{
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(clamp(200px, 100% / 6, 50%), 1fr))",
                }}
            >
                {videos.map((video) => (
                    <FollowingVideoPreview
                        key={video.id}
                        video={video}
                        userId={userId}
                        feed={feed}
                    />
                ))}
            </div>
        </>
    )
}
