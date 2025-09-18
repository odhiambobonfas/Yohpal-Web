"use client"
import { useAuth } from "@/providers/Auth"
import useSWR from "swr"
import { useUser } from "@/hooks/user/use-user"
import ProfileHeader from "@/components/custom/app/profile/profileHeader"
import ProfileVideosSection from "@/components/custom/app/profile/profileVideo"
import PageHeaderLoading from "@/components/custom/app/profile/profileHeaderLoading"
import PageVideoLoading from "@/components/custom/app/profile/profileVideoLoading"
// import { Video } from "@/types/videos"

export default function Page() {
    const { profile } = useAuth()

    const { getProfileStats } = useUser()
    const { data, isLoading } = useSWR(["user-profile", profile?.uid || ""], () =>
        getProfileStats(profile?.uid || ""),
    )
    if (isLoading) {
        return (
            <div className="flex flex-col">
                <PageHeaderLoading />
                <hr />
                <PageVideoLoading />
            </div>
        )
    }
    return (
        <div className="flex flex-col">
            <ProfileHeader user={profile!} stats={data} />
            <hr />
            <ProfileVideosSection
                videos={{
                    uploads: undefined,
                    bookmarked: undefined,
                    history: undefined,
                    liked: undefined,
                }}
            />
        </div>
    )
}
