import { Badge } from "@/components/ui/badge"

interface PromotionStatusBadgeProps {
    isPublished: boolean
    isDepleted: boolean
}

export function PromotionStatusBadge({ isPublished, isDepleted }: PromotionStatusBadgeProps) {
    if (!isPublished) {
        return <Badge variant="secondary">Draft</Badge>
    }

    if (isDepleted) {
        return <Badge variant="outline">Depleted</Badge>
    }

    return <Badge variant="default">Published</Badge>
}
