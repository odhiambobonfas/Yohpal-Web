"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/providers/Auth"
import { updateBusinessProfile } from "@/services/client/user-mutations"
import { uploadBusinessLogo, validateImageFile } from "@/services/client/file-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Upload, X } from "lucide-react"

export default function OnboardingPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        businessName: "",
        businessDescription: "",
        contactInfo: "",
        category: "",
        businessLogo: "",
    })

    const [logoPreview, setLogoPreview] = useState<string | null>(null)

    const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        const validation = validateImageFile(file)
        if (!validation.valid) {
            toast.error(validation.error)
            return
        }

        try {
            setIsUploading(true)

            // Create preview
            const reader = new FileReader()
            reader.onload = (event) => {
                setLogoPreview(event.target?.result as string)
            }
            reader.readAsDataURL(file)

            // Upload to Firebase Storage
            const downloadUrl = await uploadBusinessLogo(user.uid, file)
            setFormData({ ...formData, businessLogo: downloadUrl })
            toast.success("Logo uploaded successfully")
        } catch (error) {
            console.error("Error uploading logo:", error)
            toast.error("Failed to upload logo. Please try again.")
            setLogoPreview(null)
        } finally {
            setIsUploading(false)
        }
    }

    const removeLogo = () => {
        setLogoPreview(null)
        setFormData({ ...formData, businessLogo: "" })
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        if (!formData.businessName || !formData.contactInfo || !formData.category) {
            toast.error("Please fill in all required fields")
            return
        }

        if (!formData.businessDescription) {
            toast.error("Please provide a business description")
            return
        }

        try {
            setIsLoading(true)
            await updateBusinessProfile(
                {
                    businessName: formData.businessName,
                    businessDescription: formData.businessDescription,
                    contactInfo: formData.contactInfo,
                    category: formData.category,
                    businessLogo: formData.businessLogo || "https://github.com/shadcn.png",
                    verificationStatus: "verified",
                    walletBalance: 0,
                    totalSpent: 0,
                },
                user.uid
            )
            toast.success("Account details updated successfully!")
            router.push("/account")
        } catch (error) {
            console.error(error)
            toast.error("Failed to update account details")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container max-w-2xl py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Complete Your Business Profile</CardTitle>
                    <CardDescription>
                        Please provide your business details to access the Account Manager.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="businessName">Business Name *</Label>
                            <Input
                                id="businessName"
                                placeholder="Acme Inc."
                                value={formData.businessName}
                                onChange={(e) =>
                                    setFormData({ ...formData, businessName: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="businessDescription">Business Description *</Label>
                            <Textarea
                                id="businessDescription"
                                placeholder="Tell us about your business, products, or services..."
                                value={formData.businessDescription}
                                onChange={(e) =>
                                    setFormData({ ...formData, businessDescription: e.target.value })
                                }
                                rows={4}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Briefly describe what your business does and what products/services you offer.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                                onValueChange={(value) =>
                                    setFormData({ ...formData, category: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                                    <SelectItem value="retail">Retail</SelectItem>
                                    <SelectItem value="service">Service</SelectItem>
                                    <SelectItem value="technology">Technology</SelectItem>
                                    <SelectItem value="entertainment">Entertainment</SelectItem>
                                    <SelectItem value="food">Food & Beverage</SelectItem>
                                    <SelectItem value="health">Health & Wellness</SelectItem>
                                    <SelectItem value="education">Education</SelectItem>
                                    <SelectItem value="finance">Finance</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactInfo">Contact Information *</Label>
                            <Input
                                id="contactInfo"
                                placeholder="Email or Phone number"
                                value={formData.contactInfo}
                                onChange={(e) =>
                                    setFormData({ ...formData, contactInfo: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Business Logo</Label>
                            <div className="flex items-start gap-4">
                                {logoPreview || formData.businessLogo ? (
                                    <div className="relative">
                                        <Image
                                            src={logoPreview || formData.businessLogo}
                                            alt="Business logo preview"
                                            width={80}
                                            height={80}
                                            className="rounded-lg object-cover border"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeLogo}
                                            className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </div>
                                ) : null}
                                <div className="flex-1">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleLogoSelect}
                                        className="hidden"
                                        id="logo-upload"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="w-full"
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                {logoPreview || formData.businessLogo
                                                    ? "Change Logo"
                                                    : "Upload Logo"}
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Accepted formats: JPEG, PNG, GIF, WebP. Max size: 5MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading || isUploading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Complete Setup"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
