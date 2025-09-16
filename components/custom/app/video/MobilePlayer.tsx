import { Video } from "#/videos"
import { Card, CardContent } from "@/components/ui/card"

export default function MobilePlayer({ video }: { video: Video }) {
    return (
        <div className="h-full flex snap-start mb-2">
            <Card className="h-full p-0 m-0 w-full overflow-hidden">
                <CardContent className="h-full p-0">
                    <video
                        src={video.videoUrl}
                        className="w-full aspect-9/16 h-full object-cover"
                        loop
                        muted
                        controls
                    ></video>
                </CardContent>
            </Card>
        </div>
    )
}
