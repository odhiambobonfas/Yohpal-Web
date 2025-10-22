import { AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser } from "@/hooks/user/use-user"
import { useAuth } from "@/providers/Auth"
import { YPUser } from "@/types/users"
import { Avatar } from "@radix-ui/react-avatar"
import Link from "next/link"
import useSWR from "swr"
import { UserPreviewSkeleton } from "./UserPreviewLoading"

export default function ProfileDetails({
    view,
    profileType,
    userId,
}: {
    view: "followers" | "following"
    profileType: "personal" | "public"
    userId: string | undefined
}) {
    const { getFollowersProfile, getFollowingProfile } = useUser()

    const getFF = (userId: string) =>
        view === "followers" ? getFollowersProfile(userId) : getFollowingProfile(userId)
    const { data, isLoading } = useSWR(["user-ff-profile", view, profileType, userId], () =>
        getFF(userId || ""),
    )

    return (
        <>
            <DialogTitle>
                {view === "followers" ? "Followers" : "Following"} ({data?.length})
            </DialogTitle>
            <ScrollArea className="h-96">
                {isLoading && (
                    <>
                        <UserPreviewSkeleton />
                        <UserPreviewSkeleton />
                        <UserPreviewSkeleton />
                    </>
                )}

                {!isLoading && data?.length === 0 && <p>No {view} yet.</p>}

                {!isLoading &&
                    data?.map((user, idx) => <UserPreview key={user.uid + idx} user={user} />)}
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
