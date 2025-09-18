"use client"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { YPUser } from "@/types/users"
import { useState } from "react"

interface ProfileHeaderProps {
    user: YPUser 
    stats:
        | {
              uploadedStat?: number
              viewedStat?: number
              followersStat?: number
              followingStat?: number
              likedStat?: number
          }
        | null
        | undefined
}


export default function ProfileHeader({user, stats }: ProfileHeaderProps) {
    const [expanded, setExpanded] = useState(false)
    const wordsToShow = 5
    const words = user.bio.split(" ")
    const isLong = words.length > wordsToShow
    const visibleText = expanded ? user.bio : words.slice(0, wordsToShow).join(" ")

    return (
        <div className="h-[40vh] bg-background flex flex-col p-2 items-center md:flex-row overflow-auto md:justify-center">
            <div className="flex-shrink-0">
                <Avatar className="w-[150px] h-[150px]">
                    <AvatarImage
                        loading="lazy"
                        width={100}
                        height={100}
                        className="rounded-full object-cover"
                        src={user.profile_picture || ""}
                        alt={user.userName || "User profile image"}
                    />
                </Avatar>
            </div>

            <div className="ml-4 flex-1 min-w-0">
                <h1 className="mb-2 text-3xl font-bold">{user.userName}</h1>
                <h3 className="text-muted-foreground mb-2">{user.email}</h3>
                <h3 className="text-muted-foreground mb-2">
                    {visibleText}
                    {isLong && !expanded && "... "}
                    {isLong && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-foreground hover:underline ml-1"
                        >
                            {expanded ? "Show less" : "Read more"}
                        </button>
                    )}
                </h3>
                <h3 className="text-muted-foreground">{user.phoneNumber}</h3>

                {/* Stats */}
                <div className="flex flex-row mt-2 gap-4">
                    <div>
                        <h4>Post</h4>
                        <span className="text-muted-foreground">{stats?.uploadedStat}</span>
                    </div>
                    <div>
                        <h4>Views</h4>
                        <span className="text-muted-foreground">{stats?.viewedStat}</span>
                    </div>
                    <div>
                        <h4>Followers</h4>
                        <span className="text-muted-foreground">{stats?.followersStat}</span>
                    </div>
                    <div>
                        <h4>Following</h4>
                        <span className="text-muted-foreground">{stats?.followingStat}</span>
                    </div>
                    <div>
                        <h4>Liked</h4>
                        <span className="text-muted-foreground">{stats?.likedStat}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
