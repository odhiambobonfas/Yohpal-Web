"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AdPreviewProps {
    imageUrl: string | null
    description?: string
}

export function AdPreview({ imageUrl, description }: AdPreviewProps) {
    if (!imageUrl) {
        return (
            <Card className="overflow-hidden">
                <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                    Upload an image to see a preview
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
                <Image
                    src={imageUrl}
                    alt="Ad preview"
                    fill
                    className="object-cover"
                />
                <Badge className="absolute top-2 left-2" variant="secondary">
                    Sponsored
                </Badge>
            </div>
            {description && (
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </CardContent>
            )}
        </Card>
    )
}
