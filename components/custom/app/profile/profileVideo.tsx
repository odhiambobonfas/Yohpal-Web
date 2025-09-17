"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Heart, Bookmark, History } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Video } from "@/types/videos"

interface ProfileVideosSectionProps {
    uploads: Video[] | undefined
    liked: Video[] | undefined
    bookmarked: Video[] | undefined
    history: Video[] | undefined
}

export default function ProfileVideosSection({ videos }: { videos: ProfileVideosSectionProps }) {
    return (
        <div className="bg-background h-[60vh]">
            <Tabs defaultValue="uploads">
                <TabsList>
                    <TabsTrigger value="uploads">
                        <Upload /> Uploads
                    </TabsTrigger>
                    <TabsTrigger value="liked">
                        <Heart /> Liked
                    </TabsTrigger>
                    <TabsTrigger value="bookmarked">
                        <Bookmark /> Bookmarked
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <History /> History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="uploads">
                    {videos.uploads ? (
                        videos.uploads.map((video) => <ProfileVideoPreview key={video.id} video={video} />)
                    ) : (
                        <ProfileNoVideos />
                    )}
                </TabsContent>
                <TabsContent value="liked">
                    {videos.liked ? (
                        videos.liked.map((video) => <ProfileVideoPreview key={video.id} video={video} />)
                    ) : (
                        <ProfileNoVideos />
                    )}
                </TabsContent>
                <TabsContent value="bookmarked">   {videos.bookmarked ? (
                        videos.bookmarked.map((video) => <ProfileVideoPreview key={video.id} video={video} />)
                    ) : (
                        <ProfileNoVideos />
                    )}</TabsContent>
                <TabsContent value="history">   {videos.history ? (
                        videos.history.map((video) => <ProfileVideoPreview key={video.id} video={video} />)
                    ) : (
                        <ProfileNoVideos />
                    )}</TabsContent>
            </Tabs>
        </div>
    )
}

function ProfileVideoPreview({ video }: { video: Video }) {
    return (
        <Card key={video.id} className="w-[200px] h-[200px] m-3">
            <CardContent>
                <Avatar>
                    <AvatarImage
                        src={video.thumbnail}
                        width={400}
                        height={400}
                        alt="Video thumbnail"
                    />
                </Avatar>
            </CardContent>
            <CardFooter className="text-muted-foreground">
                {video.caption || "No description"}
            </CardFooter>
        </Card>
    )
}

function ProfileNoVideos() {
    return <p>no videos</p>
}
