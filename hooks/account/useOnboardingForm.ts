"use client"

import { useState, useCallback } from "react"
import { OnboardingStep, OnboardingFormData, INITIAL_FORM_DATA } from "@/components/custom/account/onboarding/types"

export function useOnboardingForm() {
    const [step, setStep] = useState<OnboardingStep>(0)
    const [formData, setFormData] = useState<OnboardingFormData>(INITIAL_FORM_DATA)

    const nextStep = useCallback(() => {
        setStep((prev) => Math.min(prev + 1, 4) as OnboardingStep)
    }, [])

    const prevStep = useCallback(() => {
        setStep((prev) => Math.max(prev - 1, 0) as OnboardingStep)
    }, [])

    const goToStep = useCallback((targetStep: OnboardingStep) => {
        setStep(targetStep)
    }, [])

    const updateFormData = useCallback((updates: Partial<OnboardingFormData>) => {
        setFormData((prev) => ({ ...prev, ...updates }))
    }, [])

    const resetForm = useCallback(() => {
        setStep(0)
        setFormData(INITIAL_FORM_DATA)
    }, [])

    return {
        step,
        formData,
        nextStep,
        prevStep,
        goToStep,
        updateFormData,
        resetForm,
    }
}
