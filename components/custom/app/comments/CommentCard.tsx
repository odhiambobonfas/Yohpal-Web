import Link from "next/link"

import { VideoComment } from "#/videos"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatTime, serializeTimestamp } from "@/lib/utils"
import { LucideHeart, LucideTrash2 } from "lucide-react"

export default function CommentCard({ comment }: { comment: VideoComment }) {
    return (
        <Card className="shadow-none my-2 p-3">
            <CardContent className="m-0 p-0">
                <div className="inline-flex items-center gap-2 w-full">
                    <Avatar className="size-6">
                        <AvatarImage
                            loading="lazy"
                            width={50}
                            height={50}
                            src={comment.profile_picture || "/logo_circular.png"}
                            alt={`${comment.username}'s profile picture`}
                        />
                        <AvatarFallback>{comment.username[0]}</AvatarFallback>
                    </Avatar>
                    <Link href={`/user/${comment.userId}`}>
                        <span className="text-sm font-semibold">{comment.username}</span>
                    </Link>
                    <span className="ml-auto text-muted-foreground text-sm">
                        {formatTime(serializeTimestamp(comment.timestamp))}
                    </span>
                </div>
                <div className="flex flex-col">
                    <p>{comment.msg}</p>
                    <div className="flex flex-row gap-3 ml-auto">
                        <Button
                            className="flex flex-row"
                            variant={"ghost"}
                            // onClick={handleCommentLikeToggle}
                        >
                            <LucideHeart
                            // className={comment.userHasLiked ? "text-red-500 fill-current" : ""}
                            />
                            <span>{comment.likes}</span>
                        </Button>
                        <Button className="" variant={"ghost"}>
                            <LucideTrash2 className="size-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
