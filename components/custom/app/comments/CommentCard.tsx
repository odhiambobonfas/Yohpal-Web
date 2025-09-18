import { VideoComment } from "#/videos"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { serializeTimestamp } from "@/lib/utils"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import updateLocale from "dayjs/plugin/updateLocale"
import Link from "next/link"

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
                    <Link href={`/user/${comment.userId}`}><span className="text-sm font-semibold">{comment.username}</span></Link>
                    <span className="ml-auto text-muted-foreground text-sm">
                        {formatedTime(serializeTimestamp(comment.timestamp))}
                    </span>
                </div>
                <p>{comment.msg}</p>
            </CardContent>
        </Card>
    )
}
dayjs.extend(relativeTime)
dayjs.extend(updateLocale)

dayjs.updateLocale("en", {
    relativeTime: {
        future: "in %s",
        past: "%s ago",
        s: "%d seconds",
        m: "1 minute",
        mm: "%dm",
        h: "1 hour",
        hh: "%dhrs",
        d: "1 day",
        dd: "%d days",
        M: "1 month",
        MM: "%d months",
        y: "1 year",
        yy: "%d years",
    },
})

function formatedTime(timestamp: string) {
    const date = dayjs(timestamp)
    const now = dayjs()

    if (now.diff(date, "day") > 7) {
        return date.format("MMM D, YYYY")
    } else {
        return date.fromNow()
    }
}
