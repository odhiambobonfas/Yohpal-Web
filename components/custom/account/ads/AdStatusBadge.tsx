import { Badge } from "@/components/ui/badge"
import { AdStatus } from "@/types/ads"

interface AdStatusBadgeProps {
    status: AdStatus
}

const statusConfig: Record<
    AdStatus,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
    draft: { label: "Draft", variant: "secondary" },
    active: { label: "Active", variant: "default" },
    paused: { label: "Paused", variant: "outline" },
    completed: { label: "Completed", variant: "secondary" },
    rejected: { label: "Rejected", variant: "destructive" },
}

export function AdStatusBadge({ status }: AdStatusBadgeProps) {
    const config = statusConfig[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
}
