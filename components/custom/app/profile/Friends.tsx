// FriendsDialog.tsx
"use client"

import { UserPreviewSkeleton } from "@/components/custom/app/profile/UserPreviewLoading"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser } from "@/hooks/user/use-user"
import { useAuth } from "@/providers/Auth"
import { YPUser } from "@/types/users"
import Link from "next/link"
import useSWR from "swr"

export default function FriendsDialog({ userId }: { userId: string }) {
    const { getFriendsProfile } = useUser()
    const { profile } = useAuth()

    const { data, isLoading } = useSWR(profile?.uid ? ["user-friends-profile", userId] : null, () =>
        getFriendsProfile(userId || ""),
    )

    return (
        <>
            <DialogTitle>Friends ({data?.length || 0})</DialogTitle>
            <ScrollArea className="h-96">
                {isLoading && (
                    <>
                        <UserPreviewSkeleton />
                        <UserPreviewSkeleton />
                        <UserPreviewSkeleton />
                    </>
                )}

                {!isLoading && data?.length === 0 && <p>No friends yet.</p>}

                {!isLoading &&
                    data?.map((friend, idx) => (
                        <UserPreview key={friend.uid + idx} user={friend} />
                    ))}
            </ScrollArea>
        </>
    )
}

function UserPreview({ user }: { user: YPUser }) {
    const { profile } = useAuth()
    return (
        <Link
            href={user.uid !== profile?.uid ? `/user/${user.uid}` : "/profile"}
            className="flex overflow-y-auto my-3 p-2 rounded-[8px] items-center hover:bg-muted-foreground/30 cursor-pointer"
        >
            <Avatar className="size-10">
                <AvatarImage
                    loading="lazy"
                    width={2}
                    height={2}
                    className="rounded-full object-cover"
                    src={user?.profile_picture || "/logo_circular.png"}
                    alt={user?.userName || "User profile image"}
                />
                <AvatarFallback>{user?.userName[0] || user?.email[0]}</AvatarFallback>
            </Avatar>
            <div className="ml-6">{user.userName}</div>
        </Link>
    )
}
