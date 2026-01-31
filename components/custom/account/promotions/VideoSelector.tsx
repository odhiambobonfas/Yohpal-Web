"use client"

import Image from "next/image"
import { useUserVideos } from "@/hooks/promotions"
import { UserVideo } from "@/types/ads"
import { Loader2, PlayCircle, Check, Megaphone } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoSelectorProps {
    selectedVideoId: string | null
    onSelect: (video: UserVideo) => void
}

export function VideoSelector({ selectedVideoId, onSelect }: VideoSelectorProps) {
    const { videos, loading, error } = useUserVideos()

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <p>Failed to load videos</p>
                <p className="text-sm">{error}</p>
            </div>
        )
    }

    if (videos.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <PlayCircle className="size-12 mx-auto mb-3 opacity-50" />
                <p>No videos found</p>
                <p className="text-sm">Upload videos from the app to promote them here</p>
            </div>
        )
    }

    const availableVideos = videos.filter((v) => !v.hasPromotion)
    const promotedVideos = videos.filter((v) => v.hasPromotion)

    return (
        <div className="space-y-4">
            {availableVideos.length === 0 && promotedVideos.length > 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                    All your videos already have promotions
                </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1">
                {availableVideos.map((video) => {
                    const isSelected = selectedVideoId === video.id
                    return (
                        <button
                            key={video.id}
                            type="button"
                            onClick={() => onSelect(video)}
                            className={cn(
                                "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                                isSelected
                                    ? "border-primary ring-2 ring-primary ring-offset-2"
                                    : "border-transparent hover:border-muted-foreground/50"
                            )}
                        >
                            {video.thumbnail ? (
                                <Image
                                    src={video.thumbnail}
                                    alt={video.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full bg-muted">
                                    <PlayCircle className="size-8 text-muted-foreground" />
                                </div>
                            )}
                            {isSelected && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                    <div className="rounded-full bg-primary p-1">
                                        <Check className="size-4 text-primary-foreground" />
                                    </div>
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                <p className="text-xs text-white line-clamp-1">{video.title}</p>
                            </div>
                        </button>
                    )
                })}
                {promotedVideos.map((video) => (
                    <div
                        key={video.id}
                        className="relative aspect-video rounded-lg overflow-hidden border-2 border-transparent opacity-50 cursor-not-allowed"
                    >
                        {video.thumbnail ? (
                            <Image
                                src={video.thumbnail}
                                alt={video.title}
                                fill
                                className="object-cover grayscale"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full bg-muted">
                                <PlayCircle className="size-8 text-muted-foreground" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="rounded-full bg-muted p-1.5">
                                <Megaphone className="size-4 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="text-xs text-white line-clamp-1">{video.title}</p>
                            <p className="text-[10px] text-white/70">Already promoted</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
