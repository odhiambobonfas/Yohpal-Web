import ProfileHeader from "@/components/custom/app/profile/ProfileHeader"
import ProfileNotFound from "@/components/custom/app/profile/ProfileNotFound"
import ProfileVideosSection from "@/components/custom/app/profile/ProfileVideoSection"
import { getUserProfile, getUserProfileStats } from "@/services/server/user"
import { getUserVideoUploads } from "@/services/server/videos"

export default async function Page({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params

    const [user, stats, uploadedVideos] = await Promise.all([
        getUserProfile(userId),
        getUserProfileStats(userId),
        getUserVideoUploads(userId),
    ])

    if (!user) return <ProfileNotFound />

    return (
        <div className="h-screen">
            <ProfileHeader
                profileType="public"
                stats={{
                    followersStat: stats.followers,
                    followingStat: stats.following,
                    uploadedStat: stats.uploadedVideos,
                    viewedStat: stats.views,
                    likedStat: stats.likes,
                }}
                user={user}
            />
            <ProfileVideosSection
                loading={false}
                profileType="public"
                videos={{
                    bookmarked: undefined,
                    history: undefined,
                    liked: undefined,
                    uploads: uploadedVideos,
                }}
            />
        </div>
    )
}
