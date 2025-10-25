"use client"
import { useEffect, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useUserMutation } from "@/hooks/user/use-user-mutation"
import { useAuth } from "@/providers/Auth"
import { YPUser } from "@/types/users"
import { LucideUserMinus2, LucideUserPlus2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import AppAlert from "../AppAlert"
import ProfileDetails from "./ProfileDetails"
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
    const [confirmBlock, setConfirmBlock] = useState(false)
    const { toggleFollow } = useUserMutation()
    const router = useRouter()

    const isPersonal = profileType === "personal"

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

    const { blockUser } = useUserMutation()
    const handleBlockUser = async () => {
        if (user?.uid) {
            await blockUser(user.uid)
            toast.success(`Blocked ${user.userName} successfully`)
            router.replace("/")
        }
    }

    return (
        <>
            <AppAlert
                isOpen={confirmBlock}
                type="confirm"
                title="This action is none reversible"
                description={`You are about to block ${user?.userName || "this user"}`}
                cancelText="Never mind"
                actionText="Block"
                onAction={handleBlockUser}
                onClose={() => setConfirmBlock(false)}
            />

            <div className="min-h-[30%] flex flex-col p-2 items-center md:flex-row  md:justify-center">
                <div className="flex-shrink-0">
                    <Avatar className="size-[90px] md:size-50">
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

                <div className="md:ml-5 flex-1 flex-col flex items-center md:items-start">
                    <div className="flex flex-col gap-1 justify-center">
                        <h1 className="mb-2 text-3xl font-bold">{user?.userName}</h1>
                    </div>
                    {isPersonal && (
                        <span className="text-muted-foreground mb-2">{user?.email}</span>
                    )}

                    <span className="text-muted-foreground mb-2 w-full text-center md:text-start md:w-[600px]">
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

                    {isPersonal && (
                        <span className="text-muted-foreground">{user?.phoneNumber}</span>
                    )}

                    {!isPersonal && isAuthenticated && (
                        <div className="flex my-2 text-sm md:text-lg px-3 py-1 md:px-5 md:py-2 gap-2">
                            <Button
                                onClick={() => {
                                    handleFollowToggle({
                                        targetUserId: user!.uid,
                                        isFollowing: userFollowed,
                                    })
                                }}
                                className={`rounded-lg  ${
                                    userFollowed ? "border-primary bg-none" : ""
                                }`}
                            >
                                {userFollowed ? (
                                    <>
                                        <LucideUserMinus2 className="size-4 md:size-5" />
                                        <span>Unfollow</span>
                                    </>
                                ) : (
                                    <>
                                        <LucideUserPlus2 className="size-4 md:size-5" />
                                        <span>Follow</span>
                                    </>
                                )}
                            </Button>
                            <Button
                                variant={"outline"}
                                onClick={() => setConfirmBlock(true)}
                                className="border-primary/20"
                            >
                                Block
                            </Button>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="flex flex-row mt-2 gap-2 md:gap-4">
                        <div className="bg-accent py-1 px-2 md:py-2 md:px-3 rounded-lg flex flex-col items-center text-muted-foreground justify-center font-semibold">
                            <span className="text-sm md:text-base">{stats?.uploadedStat}</span>
                            <span className="text-[10px] md:text-xs">Posts</span>
                        </div>
                        <Dialog>
                            <DialogTrigger>
                                <div className="bg-accent py-1 px-2 md:py-2 md:px-3 rounded-lg flex flex-col items-center text-muted-foreground justify-center font-semibold">
                                    <span className="text-sm md:text-base">
                                        {stats?.followersStat?.length}
                                    </span>
                                    <span className="text-[10px] md:text-xs">Followers</span>
                                </div>
                            </DialogTrigger>
                            <DialogContent>
                                <ProfileDetails
                                    view="followers"
                                    profileType={profileType}
                                    userId={user?.uid}
                                />
                            </DialogContent>
                        </Dialog>

                        <Dialog>
                            <DialogTrigger>
                                <div className="bg-accent py-1 px-2 md:py-2 md:px-3 rounded-lg flex flex-col items-center text-muted-foreground justify-center font-semibold">
                                    <span className="text-sm md:text-base">
                                        {stats?.followingStat}
                                    </span>
                                    <span className="text-[10px] md:text-xs">Following</span>
                                </div>
                            </DialogTrigger>
                            <DialogContent>
                                <ProfileDetails
                                    view="following"
                                    profileType={profileType}
                                    userId={user?.uid}
                                />
                            </DialogContent>
                        </Dialog>

                        <div className="bg-accent py-1 px-2 md:py-2 md:px-3 rounded-lg flex flex-col items-center text-muted-foreground justify-center font-semibold">
                            <span className="text-sm md:text-base">{stats?.likedStat}</span>
                            <span className="text-[10px] md:text-xs">Liked</span>
                        </div>
                        <div className="bg-accent py-1 px-2 md:py-2 md:px-3 rounded-lg flex flex-col items-center text-muted-foreground justify-center font-semibold">
                            <span className="text-sm md:text-base">{stats?.viewedStat}</span>
                            <span className="text-[10px] md:text-xs">Views</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
