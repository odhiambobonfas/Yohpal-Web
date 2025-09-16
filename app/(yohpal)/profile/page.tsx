"use client"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Heart, Bookmark, History } from "lucide-react"
import { useAuth } from "@/providers/Auth"
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import { useState } from "react"

export default function Page() {
    const { profile,  } = useAuth()
    const [expanded, setExpanded] = useState(false)
    const wordsToShow = 5

    const bio = profile?.bio || ""
    const words = bio.split(" ")
    const isLong = words.length > wordsToShow
    const visibleText = expanded ? bio : words.slice(0, wordsToShow).join(" ")
    return (
        <div className="flex flex-col">
            <div className="h-[40vh] bg-background flex flex-col p-2 items-center md:flex-row overflow-auto md:justify-center">
                <div className="flex-shrink-0">
                    <Avatar className="w-[150px] h-[150px]">
                        <AvatarImage
                            loading="lazy"
                            width={100}
                            height={100}
                            className="rounded-full object-cover"
                            // src="/logo_circular.png"
                            // alt="user avatar"
                            src={profile?.profile_picture || ""}
                            alt={profile?.userName || "User profile image"}
                        />
                        {/* <AvatarFallback>{userInitials}</AvatarFallback> */}
                    </Avatar>
                </div>
                <div className="ml-4 flex-1 min-w-0">
                    <div className="">
                        <h1 className="mb-2 text-3xl">
                            <strong>{profile?.userName}</strong>
                        </h1>
                        <h3 className="text-muted-foreground mb-2">{profile?.email}</h3>
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
                        <h3 className="text-muted-foreground">{profile?.phoneNumber}</h3>
                    </div>
                    <div className="flex flex-row mt-2 gap-4">
                        <div>
                            <h4>post</h4>
                            <span className="text-muted-foreground">4</span>
                        </div>
                        <div>
                            <h4>Views</h4>
                            <span className="text-muted-foreground">56</span>
                        </div>
                        <div>
                            <h4>Followers</h4>
                            <span className="text-muted-foreground">67</span>
                        </div>
                        <div>
                            <h4>Following</h4>
                            <span className="text-muted-foreground">78</span>
                        </div>
                    </div>
                </div>
            </div>
            <hr></hr>
            <div className="bg-background h-[60vh]">
                <Tabs defaultValue="uploads">
                    <TabsList>
                        <TabsTrigger value="uploads">
                            {" "}
                            <Upload />
                            uploads
                        </TabsTrigger>
                        <TabsTrigger value="liked">
                            <Heart />
                            Liked
                        </TabsTrigger>
                        <TabsTrigger value="bookmarked">
                            <Bookmark />
                            Bookmarked
                        </TabsTrigger>
                        <TabsTrigger value="history">
                            <History />
                            History
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="uploads">
                        Uploads
                        <Card className="w-[200px] h-[200px] m-3">
                            <CardContent>
                                <Avatar>
                                    <AvatarImage
                                        src="/404-error.svg"
                                        width={400}
                                        height={400}
                                        alt="Card content"
                                    />
                                </Avatar>
                            </CardContent>
                            <CardFooter className="text-muted-foreground">Video comment</CardFooter>
                        </Card>
                    </TabsContent>
                    <TabsContent value="liked">
                        Liked Videos
                        <Card className="w-[200px] h-[200px] m-3">
                            <CardContent>
                                <Avatar>
                                    <AvatarImage
                                        src="/logo_circular.png"
                                        width={400}
                                        height={400}
                                        alt="Card content"
                                    />
                                </Avatar>
                            </CardContent>
                            <CardFooter className="text-muted-foreground">Video comment</CardFooter>
                        </Card>
                    </TabsContent>
                    <TabsContent value="bookmarked">
                        Bookmarked Videos
                        <Card className="w-[200px] h-[200px] m-3">
                            <CardContent>
                                <Avatar>
                                    <AvatarImage
                                        src="/404-error.svg"
                                        width={400}
                                        height={400}
                                        alt="Card content"
                                    />
                                </Avatar>
                            </CardContent>
                            <CardFooter className="text-muted-foreground">Video comment</CardFooter>
                        </Card>
                    </TabsContent>
                    <TabsContent value="history">
                        View History
                        <Card className="w-[200px] h-[200px] m-3">
                            <CardContent>
                                <Avatar>
                                    <AvatarImage
                                        src="/logo_circular.png"
                                        width={400}
                                        height={400}
                                        alt="Card content"
                                    />
                                </Avatar>
                            </CardContent>
                            <CardFooter className="text-muted-foreground">Video comment</CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
