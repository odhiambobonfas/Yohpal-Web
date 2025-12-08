import ReportVideoDialog from "@/components/custom/app/video/ReportVideoDialog"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { isSafari } from "@/lib/utils"
import { LucideArrowBigUpDash, LucideFlag, MoreVertical } from "lucide-react"

export default function VideoPlayerSettings({
    videoId,
    autoScrollEnabled,
    updateAutoScroll,
}: {
    videoId: string
    autoScrollEnabled: boolean
    updateAutoScroll: (c: boolean) => void
}) {
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild className="absolute top-2 right-2 z-10">
                <Button className="bg-transparent hover:bg-transparent" size="icon">
                    <MoreVertical className="fill-current" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-56 relative" align="end" avoidCollisions>
                <DropdownMenuLabel className="text-muted-foreground">Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!isSafari() ? (
                    <DropdownMenuItem
                        className="w-full inline-flex items-center"
                        onSelect={(e) => e.preventDefault()}
                    >
                        <LucideArrowBigUpDash />
                        <div className="flex flex-1 flex-row justify-between p-0">
                            <Label htmlFor="enableAutoScroll">Autoscroll</Label>

                            <Switch
                                id="enableAutoScroll"
                                checked={autoScrollEnabled}
                                onCheckedChange={(checked) => updateAutoScroll(checked)}
                            />
                        </div>
                    </DropdownMenuItem>
                ) : null}

                <ReportVideoDialog videoId={videoId}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <LucideFlag /> Report
                    </DropdownMenuItem>
                </ReportVideoDialog>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
