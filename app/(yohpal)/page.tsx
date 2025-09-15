import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { getLandingVideos } from "@/services/server/videos"
import { LucidePlay } from "lucide-react"
import UserDropDown from "@/components/custom/app/UserDropDown"

export default async function Home() {
    const videos = await getLandingVideos("")
    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] justify-between ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1 size-8" />
                    <Separator orientation="vertical" className="data-[orientation=vertical]:h-5" />
                </div>
                <div className="mr-4 w-full inline-flex items-center justify-end">
                    <UserDropDown />
                </div>
            </header>
            <section className="grid grid-cols-4 gap-4 p-4">
                {videos.map((video) => (
                    <Card key={video.id} className="w-full shadow-none border-none">
                        <Link href={`/videos?w=${video.id}`}>
                            <CardContent className="group cursor-pointer relative bg-blue-400 rounded-lg overflow-hidden flex items-center justify-center">
                                <Image
                                    width={300}
                                    height={300}
                                    className="group-hover:scale-150 duration-300 ease-in-out aspect-video object-contain rounded-md"
                                    src={video.thumbnail || "/app/auth-bg.jpg"}
                                    alt="Yohpal video"
                                />

                                <div className="group-hover:bg-black/10 duration-300 ease-in-out absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                                    <LucidePlay className="group-hover:text-primary-foreground group-hover:scale-90 duration-300 ease-in-out text-primary size-15" />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <p>{video.userName}</p>
                            </CardFooter>
                        </Link>
                    </Card>
                ))}
            </section>
        </>
    )
}
