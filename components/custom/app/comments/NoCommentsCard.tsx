import { LucideMessageCircleWarning } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export default function NoCommentsCard() {
    return (
        <Card className="my-2 p-3 bg-secondary/5 border-none">
            <CardContent className="flex flex-col items-center justify-center">
                <LucideMessageCircleWarning className="text-muted-foreground/30 size-10" />
                <span className="text-muted-foreground/30 font-semibold text-2xl">No comments</span>
            </CardContent>
        </Card>
    )
}
