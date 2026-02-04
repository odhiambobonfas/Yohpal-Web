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
        getUserVideoUploads(userId, undefined, undefined), // we don't care about the intricacies of who liked what
    ])

    if (!user) return <ProfileNotFound />

    return (
        <div className="min-h-screen p-2 md:p-4">
            <ProfileHeader
                profileType="public"
                stats={{
                    followersStat: user.followersCount,
                    followingStat: user.followingCount,
                    followerProfileStat: stats.followers,
                    uploadedStat: stats.uploadedVideos,
                    viewedStat: stats.views,
                    likedStat: stats.likes,
                    friendsStat: stats.friends,
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
