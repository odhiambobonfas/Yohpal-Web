"use client"
import useSWR from "swr"

import { useAuth } from "@/providers/Auth"
import { useUser } from "@/hooks/user/use-user"
import ProfileHeader from "@/components/custom/app/profile/ProfileHeader"
import ProfileVideosSection from "@/components/custom/app/profile/ProfileVideoSection"
import ProfileHeaderLoading from "@/components/custom/app/profile/ProfileHeaderLoading"

export default function Page() {
    const { profile } = useAuth()

    const { getProfileStats, getProfileVideos } = useUser()
    const { data: profileStats, isLoading: profileStatsLoading } = useSWR(
        ["user-profile", profile?.uid],
        () => getProfileStats(profile?.uid || ""),
    )

    const { data: profileVideos, isLoading: profileVideosLoading } = useSWR(
        ["user-profile-videos", profile?.uid],
        () => getProfileVideos(profile?.uid || ""),
    )

    const isLoading = profileStatsLoading || profileVideosLoading

    return (
        <div className="flex flex-col min-h-screen p-2 gap-2">
            {isLoading ? (
                <ProfileHeaderLoading />
            ) : (
                <ProfileHeader user={profile!} stats={profileStats} profileType="personal" />
            )}
            <ProfileVideosSection
                profileType="personal"
                loading={isLoading}
                videos={{
                    uploads: profileVideos?.uploaded,
                    bookmarked: profileVideos?.bookmarked,
                    history: profileVideos?.watched,
                    liked: profileVideos?.liked,
                }}
            />
        </div>
    )
}
