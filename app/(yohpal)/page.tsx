import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { getLandingVideos } from "@/services/server/videos"
import UserDropDown from "@/components/custom/app/UserDropDown"
import PlayerCanvas from "@/components/custom/app/video/PlayerCanvas"

export default async function Home() {
    const videos = await getLandingVideos("")
    return (
        <>
            <header
                className="flex h-16 sticky top-0 z-10 bg-primary-foreground/20 backdrop-blur-xl shrink-0 items-center
                gap-2 transition-[width,height] justify-between ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
            >
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1 size-8 text-secondary-foreground" />
                    <Separator
                        decorative
                        orientation="vertical"
                        className="data-[orientation=vertical]:h-5 text-primary"
                    />
                </div>
                <UserDropDown className="mr-4" />
            </header>
            <PlayerCanvas videos={videos} />
        </>
    )
}
