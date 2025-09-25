import ProfileHeader from "@/components/custom/app/profile/ProfileHeader"
import ProfileVideosSection from "@/components/custom/app/profile/ProfileVideoSection"
import { getUserProfile, getUserProfileStats } from "@/services/server/user"
import { getUserVideoUploads } from "@/services/server/videos"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { LucideBan } from "lucide-react"
import Link from "next/link"
import ProfileHeaderLoading from "@/components/custom/app/profile/ProfileHeaderLoading"
import ProfileVideoLoading from "@/components/custom/app/profile/ProfileVideoLoading"
export default async function Page({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params

    const [user, stats, uploadedVideos] = await Promise.all([
        getUserProfile(userId),
        getUserProfileStats(userId),
        getUserVideoUploads(userId),
    ])

    if (!user) return <NotFound />

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

function NotFound() {
    return (
        <>
            <ProfileHeaderLoading />
            <ProfileVideoLoading />
            <AlertDialog open>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <LucideBan className="text-primary" />
                        <AlertDialogTitle>User not found</AlertDialogTitle>
                        <AlertDialogDescription>
                            We were unable to find the user you are looking for
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Link className="font-bold text-primary" href="/">
                            Go back Home
                        </Link>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
