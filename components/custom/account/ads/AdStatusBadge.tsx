import { Badge } from "@/components/ui/badge"

interface AdStatusBadgeProps {
    isPublished: boolean
    isDepleted: boolean
}

export function AdStatusBadge({ isPublished, isDepleted }: AdStatusBadgeProps) {
    if (!isPublished) {
        return <Badge variant="secondary">Draft</Badge>
    }

    if (isDepleted) {
        return <Badge variant="outline">Depleted</Badge>
    }

    return <Badge variant="default">Published</Badge>
}
