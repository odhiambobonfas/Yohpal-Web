"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles } from "lucide-react"
import { OnboardingFormData, BUSINESS_CATEGORIES } from "../types"

interface BasicInfoStepProps {
    formData: OnboardingFormData
    onUpdate: (updates: Partial<OnboardingFormData>) => void
}

const CATEGORY_FACTS: Record<string, string> = {
    ecommerce: "E-commerce businesses on our platform see an average 40% increase in visibility within the first month.",
    retail: "Retail businesses benefit from our local targeting features, reaching nearby customers effectively.",
    service: "Service providers using our ads report 3x more client inquiries compared to traditional advertising.",
    technology: "Tech companies on our platform connect with over 50,000 tech-savvy users daily.",
    entertainment: "Entertainment businesses see peak engagement during evenings and weekends on our platform.",
    food: "Food & Beverage businesses are among the top performers, with high engagement rates from hungry customers.",
    health: "Health & Wellness brands build trust faster with our verified business badge program.",
    education: "Educational services reach students and lifelong learners actively seeking growth opportunities.",
    finance: "Financial services benefit from our secure, trust-focused advertising environment.",
    other: "Unique businesses often stand out the most! Our diverse audience appreciates variety.",
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

const factVariants = {
    hidden: { opacity: 0, y: 10, height: 0 },
    visible: {
        opacity: 1,
        y: 0,
        height: "auto" as const,
        transition: {
            duration: 0.4,
            ease: "easeOut" as const,
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        height: 0,
        transition: {
            duration: 0.3,
        },
    },
}

export function BasicInfoStep({ formData, onUpdate }: BasicInfoStepProps) {
    const selectedFact = formData.category ? CATEGORY_FACTS[formData.category] : null

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className="text-center mb-10" variants={itemVariants}>
                <h2 className="text-2xl md:text-3xl font-semibold mb-3">Basic Information</h2>
                <p className="text-muted-foreground text-lg">Tell us about your business</p>
            </motion.div>

            <div className="space-y-8 max-w-2xl mx-auto">
                <motion.div className="space-y-3" variants={itemVariants}>
                    <Label htmlFor="businessName" className="text-base">Business Name *</Label>
                    <Input
                        id="businessName"
                        placeholder="e.g., Acme Inc."
                        value={formData.businessName}
                        onChange={(e) => onUpdate({ businessName: e.target.value })}
                        className="h-12 text-base"
                    />
                    <p className="text-sm text-muted-foreground">
                        This is how your business will appear to customers
                    </p>
                </motion.div>

                <motion.div className="space-y-3" variants={itemVariants}>
                    <Label htmlFor="category" className="text-base">Category *</Label>
                    <Select
                        value={formData.category}
                        onValueChange={(value) => onUpdate({ category: value })}
                    >
                        <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {BUSINESS_CATEGORIES.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                        Choose the category that best describes your business
                    </p>

                    <AnimatePresence mode="wait">
                        {selectedFact && (
                            <motion.div
                                key={formData.category}
                                variants={factVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10"
                            >
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-foreground/80">{selectedFact}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.div>
    )
}
