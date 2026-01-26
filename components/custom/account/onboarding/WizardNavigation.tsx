"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { OnboardingStep } from "./types"

interface WizardNavigationProps {
    currentStep: OnboardingStep
    onBack: () => void
    onNext: () => void
    isNextDisabled?: boolean
    isLoading?: boolean
}

export function WizardNavigation({
    currentStep,
    onBack,
    onNext,
    isNextDisabled = false,
    isLoading = false,
}: WizardNavigationProps) {
    const getNextButtonText = () => {
        if (currentStep === 0) return "Get Started"
        if (currentStep === 4) return "Complete Setup"
        return "Continue"
    }

    return (
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
            {currentStep > 0 ? (
                <Button type="button" variant="ghost" onClick={onBack} disabled={isLoading}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
            ) : (
                <div />
            )}

            <Button type="button" onClick={onNext} disabled={isNextDisabled || isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Setting up...
                    </>
                ) : (
                    <>
                        {getNextButtonText()}
                        {currentStep < 4 && <ArrowRight className="w-4 h-4 ml-2" />}
                    </>
                )}
            </Button>
        </div>
    )
}
