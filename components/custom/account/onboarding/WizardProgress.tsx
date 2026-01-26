"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { OnboardingStep, STEP_LABELS } from "./types"

interface WizardProgressProps {
    currentStep: OnboardingStep
    onStepClick?: (step: OnboardingStep) => void
}

export function WizardProgress({ currentStep, onStepClick }: WizardProgressProps) {
    // Steps 0-4 map to visual steps: 0 shows step 1 as upcoming, 1-4 show current progress
    const visualStep = currentStep

    return (
        <div className="w-full max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-between">
                {STEP_LABELS.map((label, index) => {
                    const stepNumber = (index + 1) as OnboardingStep
                    const isCompleted = visualStep > stepNumber
                    const isCurrent = visualStep === stepNumber
                    const isClickable = isCompleted && onStepClick

                    return (
                        <div key={index} className="flex items-center flex-1">
                            {/* Step indicator */}
                            <div className="flex flex-col items-center">
                                <button
                                    type="button"
                                    disabled={!isClickable}
                                    onClick={() => isClickable && onStepClick(stepNumber)}
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                                        isCompleted &&
                                            "bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90",
                                        isCurrent && "bg-primary text-primary-foreground",
                                        !isCompleted && !isCurrent && "bg-muted text-muted-foreground",
                                        !isClickable && "cursor-default"
                                    )}
                                >
                                    {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                                </button>
                                <span
                                    className={cn(
                                        "text-xs mt-1 hidden sm:block",
                                        isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"
                                    )}
                                >
                                    {label.full}
                                </span>
                                <span
                                    className={cn(
                                        "text-xs mt-1 sm:hidden",
                                        isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"
                                    )}
                                >
                                    {label.short}
                                </span>
                            </div>
                            {/* Connector line */}
                            {index < STEP_LABELS.length - 1 && (
                                <div
                                    className={cn(
                                        "flex-1 h-0.5 mx-2",
                                        visualStep > stepNumber ? "bg-primary" : "bg-muted"
                                    )}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
