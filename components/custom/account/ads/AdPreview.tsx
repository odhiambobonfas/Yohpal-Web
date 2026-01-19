"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

interface AdPreviewProps {
    imageUrl: string | null
    title: string
    description: string
    callToAction: string
    destinationUrl: string
    businessName: string
}

export function AdPreview({
    imageUrl,
    title,
    description,
    callToAction,
    destinationUrl,
    businessName,
}: AdPreviewProps) {
    const hasContent = imageUrl || title || description

    if (!hasContent) {
        return (
            <Card className="overflow-hidden">
                <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                    Fill in the form to see a preview
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={title || "Ad preview"}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        No image uploaded
                    </div>
                )}
                <Badge className="absolute top-2 left-2" variant="secondary">
                    Sponsored
                </Badge>
            </div>
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                        {businessName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{businessName}</span>
                </div>
                <div>
                    <h3 className="font-semibold line-clamp-1">
                        {title || "Ad Title"}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {description || "Ad description will appear here"}
                    </p>
                </div>
                <Button className="w-full" disabled={!destinationUrl}>
                    {callToAction || "Learn More"}
                    <ExternalLink className="ml-2 size-4" />
                </Button>
            </CardContent>
        </Card>
    )
}
