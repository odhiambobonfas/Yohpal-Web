"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/Auth"
import { useCreateAd, useUploadAdImage } from "@/hooks/ads"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { AdImageUpload } from "./AdImageUpload"
import { AdPreview } from "./AdPreview"
import { AD_DESCRIPTION_MAX_LENGTH } from "@/constants"

export function CreateAdForm() {
    const { user, profile } = useAuth()
    const router = useRouter()
    const { createAd, loading: creating } = useCreateAd()
    const {
        upload,
        loading: uploading,
        imageUrl,
        preview,
        error: uploadError,
        reset: resetUpload,
    } = useUploadAdImage()

    const [description, setDescription] = useState("")
    const [showLeaveDialog, setShowLeaveDialog] = useState(false)

    const isDirty = useMemo(() => {
        return description.trim() !== "" || !!imageUrl
    }, [description, imageUrl])

    // Warn user about unsaved changes when leaving the page
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault()
                e.returnValue = ""
            }
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [isDirty])

    const handleImageUpload = async (file: File) => {
        if (!user) return
        try {
            await upload(user.uid, file)
        } catch {
            toast.error("Failed to upload image")
        }
    }

    const handleRemoveImage = () => {
        resetUpload()
    }

    const handleCancel = () => {
        if (isDirty) {
            setShowLeaveDialog(true)
        } else {
            router.push("/account/ads")
        }
    }

    const handleLeave = () => {
        setShowLeaveDialog(false)
        router.push("/account/ads")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user || !profile?.businessProfile) {
            toast.error("You must be logged in with a business profile")
            return
        }

        if (!imageUrl) {
            toast.error("Please upload an ad image")
            return
        }

        if (description.length > AD_DESCRIPTION_MAX_LENGTH) {
            toast.error(`Description must be ${AD_DESCRIPTION_MAX_LENGTH} characters or less`)
            return
        }

        try {
            const createdAd = await createAd({
                imageUrl,
                description: description || undefined,
            })
            toast.success("Ad saved as draft!")
            router.push(`/account/ads/${createdAd?.id}`)
        } catch {
            toast.error("Failed to create ad")
        }
    }

    const charactersRemaining = AD_DESCRIPTION_MAX_LENGTH - description.length

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Ad</CardTitle>
                    <CardDescription>
                        Upload an image and optionally add a description. Your ad will be saved as a draft until you publish it.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Ad Image (Landscape) *</Label>
                            <AdImageUpload
                                imageUrl={imageUrl}
                                preview={preview}
                                loading={uploading}
                                onUpload={handleImageUpload}
                                onRemove={handleRemoveImage}
                                error={uploadError}
                            />
                            <p className="text-xs text-muted-foreground">
                                Upload a landscape image for best display
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Add a short description for your ad..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                maxLength={AD_DESCRIPTION_MAX_LENGTH}
                            />
                            <p className={`text-xs ${charactersRemaining < 20 ? "text-destructive" : "text-muted-foreground"}`}>
                                {charactersRemaining} characters remaining
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={handleCancel}
                                disabled={creating || uploading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={creating || uploading || !imageUrl}
                            >
                                {creating ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Saving Draft...
                                    </>
                                ) : (
                                    "Save as Draft"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="font-semibold">Preview</h3>
                <AdPreview
                    imageUrl={preview || imageUrl}
                    description={description}
                />
            </div>

            <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Discard changes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes that will be lost if you leave this page.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Editing</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLeave}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Discard
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
