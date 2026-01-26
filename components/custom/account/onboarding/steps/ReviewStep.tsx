"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, X, Loader2, CheckCircle2 } from "lucide-react"
import { uploadBusinessLogo, validateImageFile } from "@/services/client/file-upload"
import { toast } from "sonner"
import { OnboardingFormData, BUSINESS_CATEGORIES } from "../types"

interface ReviewStepProps {
    formData: OnboardingFormData
    onUpdate: (updates: Partial<OnboardingFormData>) => void
    userId: string
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut" as const,
        },
    },
}

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut" as const,
        },
    },
}

export function ReviewStep({ formData, onUpdate, userId }: ReviewStepProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)

    const categoryLabel =
        BUSINESS_CATEGORIES.find((c) => c.value === formData.category)?.label || formData.category

    const displayLogo = logoPreview || formData.businessLogo

    const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

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
            const downloadUrl = await uploadBusinessLogo(userId, file)
            onUpdate({ businessLogo: downloadUrl })
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
        onUpdate({ businessLogo: "" })
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className="text-center mb-10" variants={itemVariants}>
                <h2 className="text-2xl md:text-3xl font-semibold mb-3">Review Your Profile</h2>
                <p className="text-muted-foreground text-lg">Make sure everything looks good before finishing</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Preview Card */}
                <motion.div variants={cardVariants}>
                    <Label className="text-base mb-3 block">Profile Preview</Label>
                    <Card className="overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <Avatar className="w-16 h-16">
                                    <AvatarImage src={displayLogo} alt={formData.businessName} />
                                    <AvatarFallback className="text-lg bg-primary/10">
                                        {formData.businessName.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-lg truncate">{formData.businessName}</h3>
                                    <Badge variant="secondary" className="mt-1">
                                        {categoryLabel}
                                    </Badge>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
                                {formData.businessDescription}
                            </p>
                            <p className="mt-3 text-sm">
                                <span className="text-muted-foreground">Contact: </span>
                                {formData.contactInfo}
                            </p>
                        </CardContent>
                    </Card>

                    <motion.div
                        className="mt-4 flex items-center gap-2 text-sm text-green-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Your profile is ready to go!</span>
                    </motion.div>
                </motion.div>

                {/* Logo Upload */}
                <motion.div className="space-y-3" variants={itemVariants}>
                    <Label className="text-base">Business Logo (Optional)</Label>
                    <div className="flex items-start gap-4">
                        {displayLogo ? (
                            <motion.div
                                className="relative"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <Image
                                    src={displayLogo}
                                    alt="Business logo preview"
                                    width={100}
                                    height={100}
                                    className="rounded-xl object-cover border"
                                />
                                <button
                                    type="button"
                                    onClick={removeLogo}
                                    className="absolute -top-2 -right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                                >
                                    <X className="size-3" />
                                </button>
                            </motion.div>
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
                                className="w-full h-12"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        {displayLogo ? "Change Logo" : "Upload Logo"}
                                    </>
                                )}
                            </Button>
                            <p className="text-sm text-muted-foreground mt-2">
                                JPEG, PNG, GIF, or WebP. Max 5MB.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}
