"use client"

import { useState } from "react"
import { useCreatePromotion } from "@/hooks/promotions"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, Video } from "lucide-react"
import { VideoSelector } from "./VideoSelector"
import { UserVideo } from "@/types/ads"

interface CreatePromotionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function CreatePromotionDialog({ open, onOpenChange, onSuccess }: CreatePromotionDialogProps) {
    const { createPromotion, loading, reset } = useCreatePromotion()
    const [selectedVideo, setSelectedVideo] = useState<UserVideo | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedVideo) {
            toast.error("Please select a video to promote")
            return
        }

        try {
            await createPromotion(selectedVideo.id)
            toast.success("Promotion created! You can now publish it with a budget.")
            onSuccess?.()
            handleClose()
        } catch {
            toast.error("Failed to create promotion")
        }
    }

    const handleClose = () => {
        reset()
        setSelectedVideo(null)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Video className="size-5" />
                        Promote a Video
                    </DialogTitle>
                    <DialogDescription>
                        Select a video from your uploads to create a promotion
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <VideoSelector
                        selectedVideoId={selectedVideo?.id ?? null}
                        onSelect={setSelectedVideo}
                    />

                    {selectedVideo && (
                        <div className="rounded-lg border p-3 bg-muted/50">
                            <p className="text-sm font-medium">Selected: {selectedVideo.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                You will be able to set a budget after creating the promotion
                            </p>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !selectedVideo}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Promotion"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
