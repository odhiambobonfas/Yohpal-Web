import ProfileHeader from "@/components/custom/app/profile/ProfileHeader"
import ProfileVideosSection from "@/components/custom/app/profile/ProfileVideoSection"
import NotLoggedIn from "@/components/custom/app/video/following/NotLoggedIn"
import { COOKIES } from "@/constants"
import { getUserProfile, getUserProfileStats } from "@/services/server/user"
import { getUserProfileVideos } from "@/services/server/videos"
import { cookies } from "next/headers"

export default async function Page() {
    const cookieStore = await cookies()
    const userId = cookieStore.get(COOKIES.User)?.value

    if (!userId) return <NotLoggedIn />

    const [stats, videos, user] = await Promise.all([
        getUserProfileStats(userId),
        getUserProfileVideos(userId),
        getUserProfile(userId),
    ])

    return (
        <div className="flex flex-col min-h-screen p-2 md:p-4 gap-2">
            <ProfileHeader
                user={user!}
                stats={{
                    followersStat: user!.followersCount,
                    followingStat: user!.followingCount,
                    followerProfileStat: stats.followers,
                    friendsStat: stats.friends,
                    likedStat: stats.likes,
                    uploadedStat: stats.uploadedVideos,
                    viewedStat: stats.views,
                }}
                profileType="personal"
            />
            <ProfileVideosSection
                profileType="personal"
                loading={false}
                videos={{
                    uploads: videos.uploadedVideo,
                    bookmarked: videos.bookmarkedVideos,
                    history: videos.watchedVideos,
                    liked: videos.likedVideos,
                }}
            />
        </div>
    )
}
