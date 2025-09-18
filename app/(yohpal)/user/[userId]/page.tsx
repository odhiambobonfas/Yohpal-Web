import ProfileHeader from "@/components/custom/app/profile/profileHeader"
import ProfileVideosSection from "@/components/custom/app/profile/profileVideo"
import { getUserProfile, getUserProfileStats } from "@/services/server/user"

export default async function Page({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params

    const [user, stats] = await Promise.all([getUserProfile(userId), getUserProfileStats(userId)])

    if (!user) return <h1>user not found</h1>

    // return <pre className="whitespace-pre">{JSON.stringify(userProfile, null, 2)}</pre>
    return (
        <>
            <ProfileHeader
                stats={{
                    followersStat: stats.followers,
                    followingStat: stats.following,
                    uploadedStat: stats.uploadedVideos,
                    viewedStat:stats.views,
                    likedStat:stats.likes
                }}
                user={user}
            />
            <ProfileVideosSection
                videos={{
                    bookmarked: undefined,
                    history: undefined,
                    liked: undefined,
                    uploads: undefined,
                }}
            />
        </>
    )
}
