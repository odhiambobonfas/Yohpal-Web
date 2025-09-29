"use client"
import { useEffect, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useUserMutation } from "@/hooks/user/use-user-mutation"
import { useAuth } from "@/providers/Auth"
import { YPUser } from "@/types/users"
import { LucideUserMinus2, LucideUserPlus2 } from "lucide-react"
interface ProfileHeaderProps {
    user: YPUser | null
    stats:
        | {
              uploadedStat?: number
              viewedStat?: number
              followersStat?: string[]
              followingStat?: number
              likedStat?: number
          }
        | null
        | undefined
    profileType: "personal" | "public"
}

export default function ProfileHeader({ user, stats, profileType }: ProfileHeaderProps) {
    const [expanded, setExpanded] = useState(false)
    const wordsToShow = 5
    const words = user?.bio?.split(" ") || []
    const isLong = words.length > wordsToShow
    const visibleText = expanded ? words.join(" ") : words.slice(0, wordsToShow).join(" ")
    const { profile, isAuthenticated } = useAuth()
    const [userFollowed, setUserFollowed] = useState(false)
    const { toggleFollow } = useUserMutation()

    useEffect(() => {
        if (profile?.uid && stats?.followersStat) {
            setUserFollowed(stats.followersStat.includes(profile.uid))
        }
    }, [profile?.uid, stats?.followersStat])

    const handleFollowToggle = async ({
        targetUserId,
        isFollowing,
    }: {
        targetUserId: string
        isFollowing: boolean
    }) => {
        if (!isAuthenticated) return
        setUserFollowed(!isFollowing)

        await toggleFollow(targetUserId, isFollowing)
    }

    return (
        <div className="min-h-[30%] flex flex-col p-2 items-center md:flex-row overflow-auto md:justify-center">
            <div className="flex-shrink-0">
                <Avatar className="size-50">
                    <AvatarImage
                        loading="lazy"
                        width={10}
                        height={10}
                        className="rounded-full object-cover"
                        src={user?.profile_picture || "/logo_circular.png"}
                        alt={user?.userName || "User profile image"}
                    />
                    <AvatarFallback>{user?.userName[0] || user?.email[0]}</AvatarFallback>
                </Avatar>
            </div>

            <div className="ml-4 flex-1 flex-col flex items-center md:items-start">
                <div className="flex flex-row gap-7">
                    <h1 className="mb-2 text-3xl font-bold">{user?.userName}</h1>
                    {profileType === "public" && (
                        <Button
                            onClick={() => {
                                handleFollowToggle({
                                    targetUserId: user!.uid,
                                    isFollowing: userFollowed,
                                })
                            }}
                            className={`rounded-full text-lg px-5 py-2 ${
                                userFollowed ? "border-primary bg-none" : ""
                            }`}
                        >
                            {userFollowed ? (
                                <>
                                    <LucideUserMinus2 /> Unfollow
                                </>
                            ) : (
                                <>
                                    <LucideUserPlus2 /> Follow
                                </>
                            )}
                        </Button>
                    )}
                </div>
                {profileType === "personal" && (
                    <span className="text-muted-foreground mb-2">{user?.email}</span>
                )}

                <span className="text-muted-foreground mb-2 w-full md:w-[600px]">
                    {visibleText}
                    {isLong && !expanded && "..."}
                    {isLong && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-muted-foreground text-xs hover:underline ml-1"
                        >
                            {expanded ? "Show less" : "Read more"}
                        </button>
                    )}
                </span>

                {profileType === "personal" && (
                    <span className="text-muted-foreground">{user?.phoneNumber}</span>
                )}

                {/* Stats */}
                <div className="flex flex-row mt-2 gap-4">
                    <div className="bg-accent py-2 px-3 rounded-lg flex flex-col items-center text-muted-foreground justify-center font-semibold">
                        <span className="text-muted-foreground">{stats?.uploadedStat}</span>
                        <span className="text-xs">Posts</span>
                    </div>
                    <div className="bg-accent py-2 px-3 rounded-lg flex flex-col items-center text-muted-foreground justify-center font-semibold">
                        <span className="text-muted-foreground">
                            {stats?.followersStat?.length}
                        </span>
                        <span className="text-xs ">Followers</span>
                    </div>
                    <div className="bg-accent py-2 px-3 rounded-lg flex flex-col items-center text-muted-foreground justify-center font-semibold">
                        <span className="text-muted-foreground">{stats?.followingStat}</span>
                        <span className="text-xs">Following</span>
                    </div>
                    <div className="bg-accent py-2 px-3 rounded-lg flex flex-col items-center text-muted-foreground justify-center font-semibold">
                        <span className="text-muted-foreground">{stats?.likedStat}</span>
                        <span className="text-xs">Liked</span>
                    </div>
                    <div className="bg-accent py-2 px-3 rounded-lg flex flex-col items-center text-muted-foreground justify-center font-semibold">
                        <span className="text-muted-foreground">{stats?.viewedStat}</span>
                        <span className="text-xs">Views</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
