"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/Auth"
import { useCreateAd, useUploadAdImage, useAdWallet } from "@/hooks/ads"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { AdImageUpload } from "./AdImageUpload"
import { AdPreview } from "./AdPreview"
import { CALL_TO_ACTION_OPTIONS } from "@/types/ads"
import { AD_MIN_BUDGET } from "@/constants"

export function CreateAdForm() {
    const { user, profile } = useAuth()
    const router = useRouter()
    const { balance } = useAdWallet()
    const { createAd, loading: creating } = useCreateAd()
    const {
        upload,
        loading: uploading,
        imageUrl,
        preview,
        error: uploadError,
        reset: resetUpload,
    } = useUploadAdImage()

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        callToAction: "",
        destinationUrl: "",
        totalBudget: "",
    })

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

        const budget = parseFloat(formData.totalBudget)
        if (isNaN(budget) || budget < AD_MIN_BUDGET) {
            toast.error(`Minimum budget is KES ${AD_MIN_BUDGET}`)
            return
        }

        if (budget > balance) {
            toast.error("Insufficient wallet balance. Please deposit more funds.")
            return
        }

        if (!formData.title || !formData.description || !formData.callToAction || !formData.destinationUrl) {
            toast.error("Please fill in all required fields")
            return
        }

        try {
            await createAd({
                title: formData.title,
                description: formData.description,
                callToAction: formData.callToAction,
                destinationUrl: formData.destinationUrl,
                imageUrl,
                totalBudget: budget,
            })
            toast.success("Ad created successfully!")
            router.push("/account/ads")
        } catch {
            toast.error("Failed to create ad")
        }
    }

    const businessName = profile?.businessProfile?.businessName || "Your Business"

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Ad</CardTitle>
                    <CardDescription>
                        Fill in the details to create your advertisement
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Ad Image *</Label>
                            <AdImageUpload
                                imageUrl={imageUrl}
                                preview={preview}
                                loading={uploading}
                                onUpload={handleImageUpload}
                                onRemove={handleRemoveImage}
                                error={uploadError}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="Enter ad title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe your ad..."
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={3}
                                maxLength={250}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="callToAction">Call to Action *</Label>
                            <Select
                                value={formData.callToAction}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, callToAction: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select call to action" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CALL_TO_ACTION_OPTIONS.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="destinationUrl">Destination URL *</Label>
                            <Input
                                id="destinationUrl"
                                type="url"
                                placeholder="https://example.com"
                                value={formData.destinationUrl}
                                onChange={(e) =>
                                    setFormData({ ...formData, destinationUrl: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="totalBudget">Budget (KES) *</Label>
                            <Input
                                id="totalBudget"
                                type="number"
                                placeholder={`Minimum KES ${AD_MIN_BUDGET}`}
                                value={formData.totalBudget}
                                onChange={(e) =>
                                    setFormData({ ...formData, totalBudget: e.target.value })
                                }
                                min={AD_MIN_BUDGET}
                                step="0.01"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Available balance: KES {balance.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={creating || uploading}
                        >
                            {creating ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Creating Ad...
                                </>
                            ) : (
                                "Create Ad"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="font-semibold">Preview</h3>
                <AdPreview
                    imageUrl={preview || imageUrl}
                    title={formData.title}
                    description={formData.description}
                    callToAction={formData.callToAction}
                    destinationUrl={formData.destinationUrl}
                    businessName={businessName}
                />
            </div>
        </div>
    )
}
