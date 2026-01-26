"use client"

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { OnboardingFormData, MAX_DESCRIPTION_LENGTH } from "../types"

interface DetailsStepProps {
    formData: OnboardingFormData
    onUpdate: (updates: Partial<OnboardingFormData>) => void
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

export function DetailsStep({ formData, onUpdate }: DetailsStepProps) {
    const descriptionLength = formData.businessDescription.length
    const isOverLimit = descriptionLength > MAX_DESCRIPTION_LENGTH

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className="text-center mb-10" variants={itemVariants}>
                <h2 className="text-2xl md:text-3xl font-semibold mb-3">Business Details</h2>
                <p className="text-muted-foreground text-lg">Help customers understand what you do</p>
            </motion.div>

            <div className="space-y-8 max-w-2xl mx-auto">
                <motion.div className="space-y-3" variants={itemVariants}>
                    <Label htmlFor="businessDescription" className="text-base">Description *</Label>
                    <Textarea
                        id="businessDescription"
                        placeholder="Tell us about your business, products, or services..."
                        value={formData.businessDescription}
                        onChange={(e) => onUpdate({ businessDescription: e.target.value })}
                        rows={5}
                        className={cn(
                            "text-base resize-none",
                            isOverLimit && "border-destructive focus-visible:ring-destructive"
                        )}
                    />
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                            Briefly describe what your business does
                        </p>
                        <span
                            className={cn(
                                "text-sm font-medium",
                                isOverLimit ? "text-destructive" : "text-muted-foreground"
                            )}
                        >
                            {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
                        </span>
                    </div>
                </motion.div>

                <motion.div className="space-y-3" variants={itemVariants}>
                    <Label htmlFor="contactInfo" className="text-base">Contact Information *</Label>
                    <Input
                        id="contactInfo"
                        placeholder="Email or phone number"
                        value={formData.contactInfo}
                        onChange={(e) => onUpdate({ contactInfo: e.target.value })}
                        className="h-12 text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                        How customers can reach you for inquiries
                    </p>
                </motion.div>
            </div>
        </motion.div>
    )
}
