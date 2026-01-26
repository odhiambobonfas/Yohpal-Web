"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/providers/Auth"
import { updateBusinessProfile } from "@/services/client/user-mutations"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { useOnboardingForm } from "@/hooks/account/useOnboardingForm"
import { WizardProgress } from "./WizardProgress"
import { WizardNavigation } from "./WizardNavigation"
import { WelcomeStep } from "./steps/WelcomeStep"
import { IntroStep } from "./steps/IntroStep"
import { BasicInfoStep } from "./steps/BasicInfoStep"
import { DetailsStep } from "./steps/DetailsStep"
import { ReviewStep } from "./steps/ReviewStep"
import { OnboardingStep, MAX_DESCRIPTION_LENGTH } from "./types"

const pageVariants = {
    initial: (direction: number) => ({
        x: direction > 0 ? 100 : -100,
        opacity: 0,
    }),
    animate: {
        x: 0,
        opacity: 1,
        transition: {
            x: { type: "spring" as const, stiffness: 300, damping: 30 },
            opacity: { duration: 0.3 },
        },
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -100 : 100,
        opacity: 0,
        transition: {
            x: { type: "spring" as const, stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
        },
    }),
}

export function OnboardingWizard() {
    const { user } = useAuth()
    const router = useRouter()
    const { step, formData, nextStep, prevStep, goToStep, updateFormData } = useOnboardingForm()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [direction, setDirection] = useState(1)

    const validateCurrentStep = (): boolean => {
        switch (step) {
            case 0:
            case 1:
                return true
            case 2:
                return formData.businessName.trim() !== "" && formData.category !== ""
            case 3:
                return (
                    formData.businessDescription.trim() !== "" &&
                    formData.businessDescription.length <= MAX_DESCRIPTION_LENGTH &&
                    formData.contactInfo.trim() !== ""
                )
            case 4:
                return (
                    formData.businessName.trim() !== "" &&
                    formData.category !== "" &&
                    formData.businessDescription.trim() !== "" &&
                    formData.businessDescription.length <= MAX_DESCRIPTION_LENGTH &&
                    formData.contactInfo.trim() !== ""
                )
            default:
                return false
        }
    }

    const handleNext = async () => {
        if (!validateCurrentStep()) {
            toast.error("Please fill in all required fields")
            return
        }

        if (step === 4) {
            await handleSubmit()
        } else {
            setDirection(1)
            nextStep()
        }
    }

    const handleBack = () => {
        setDirection(-1)
        prevStep()
    }

    const handleStepClick = (targetStep: OnboardingStep) => {
        if (targetStep < step) {
            setDirection(-1)
            goToStep(targetStep)
        }
    }

    const handleSubmit = async () => {
        if (!user) {
            toast.error("You must be logged in to complete setup")
            return
        }

        try {
            setIsSubmitting(true)
            await updateBusinessProfile(
                {
                    businessName: formData.businessName,
                    businessDescription: formData.businessDescription,
                    contactInfo: formData.contactInfo,
                    category: formData.category,
                    businessLogo: formData.businessLogo || "https://github.com/shadcn.png",
                    verificationStatus: "unverified",
                },
                user.uid
            )
            toast.success("Your business profile has been created!")
            router.push("/account")
        } catch (error) {
            console.error("Error creating business profile:", error)
            toast.error("Failed to create business profile. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderStep = () => {
        switch (step) {
            case 0:
                return <WelcomeStep />
            case 1:
                return <IntroStep />
            case 2:
                return <BasicInfoStep formData={formData} onUpdate={updateFormData} />
            case 3:
                return <DetailsStep formData={formData} onUpdate={updateFormData} />
            case 4:
                return <ReviewStep formData={formData} onUpdate={updateFormData} userId={user?.uid || ""} />
            default:
                return null
        }
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
            <WizardProgress currentStep={step} onStepClick={handleStepClick} />

            <Card className="overflow-hidden">
                <CardContent className="p-6 md:p-10">
                    <div className="min-h-[500px] md:min-h-[550px]">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={step}
                                custom={direction}
                                variants={pageVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                            >
                                {renderStep()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <WizardNavigation
                        currentStep={step}
                        onBack={handleBack}
                        onNext={handleNext}
                        isNextDisabled={!validateCurrentStep()}
                        isLoading={isSubmitting}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
