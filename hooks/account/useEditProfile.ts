"use client"

import { useState, useCallback, useMemo } from "react"
import { BusinessProfile } from "@/types/users"
import { updateBusinessProfile } from "@/services/client/user-mutations"
import { uploadBusinessLogo, validateImageFile } from "@/services/client/file-upload"
import { toast } from "sonner"

export interface EditProfileFormData {
    businessName: string
    businessDescription: string
    contactInfo: string
    category: string
    businessLogo: string
}

interface UseEditProfileOptions {
    profile: BusinessProfile
    userId: string
    onSuccess?: () => void
}

export function useEditProfile({ profile, userId, onSuccess }: UseEditProfileOptions) {
    const [formData, setFormData] = useState<EditProfileFormData>({
        businessName: profile.businessName,
        businessDescription: profile.businessDescription,
        contactInfo: profile.contactInfo,
        category: profile.category,
        businessLogo: profile.businessLogo,
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploadingLogo, setIsUploadingLogo] = useState(false)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)

    const initialData = useMemo(
        () => ({
            businessName: profile.businessName,
            businessDescription: profile.businessDescription,
            contactInfo: profile.contactInfo,
            category: profile.category,
            businessLogo: profile.businessLogo,
        }),
        [profile]
    )

    const isDirty = useMemo(() => {
        return (
            formData.businessName !== initialData.businessName ||
            formData.businessDescription !== initialData.businessDescription ||
            formData.contactInfo !== initialData.contactInfo ||
            formData.category !== initialData.category ||
            formData.businessLogo !== initialData.businessLogo
        )
    }, [formData, initialData])

    const isValid = useMemo(() => {
        return (
            formData.businessName.trim().length > 0 &&
            formData.businessDescription.trim().length > 0 &&
            formData.businessDescription.length <= 500 &&
            formData.contactInfo.trim().length > 0 &&
            formData.category.trim().length > 0
        )
    }, [formData])

    const updateField = useCallback(
        <K extends keyof EditProfileFormData>(field: K, value: EditProfileFormData[K]) => {
            setFormData((prev) => ({ ...prev, [field]: value }))
        },
        []
    )

    const uploadLogo = useCallback(
        async (file: File) => {
            const validation = validateImageFile(file)
            if (!validation.valid) {
                toast.error(validation.error)
                return false
            }

            try {
                setIsUploadingLogo(true)

                // Create preview
                const reader = new FileReader()
                reader.onload = (event) => {
                    setLogoPreview(event.target?.result as string)
                }
                reader.readAsDataURL(file)

                // Upload to Firebase Storage
                const downloadUrl = await uploadBusinessLogo(userId, file)
                updateField("businessLogo", downloadUrl)
                toast.success("Logo uploaded successfully")
                return true
            } catch (error) {
                console.error("Error uploading logo:", error)
                toast.error("Failed to upload logo. Please try again.")
                setLogoPreview(null)
                return false
            } finally {
                setIsUploadingLogo(false)
            }
        },
        [userId, updateField]
    )

    const removeLogo = useCallback(() => {
        setLogoPreview(null)
        updateField("businessLogo", "")
    }, [updateField])

    const submit = useCallback(async () => {
        if (!isValid) {
            toast.error("Please fill in all required fields")
            return false
        }

        if (!isDirty) {
            toast.info("No changes to save")
            return false
        }

        try {
            setIsSubmitting(true)

            await updateBusinessProfile(
                {
                    businessName: formData.businessName.trim(),
                    businessDescription: formData.businessDescription.trim(),
                    contactInfo: formData.contactInfo.trim(),
                    category: formData.category,
                    businessLogo: formData.businessLogo,
                },
                userId
            )

            toast.success("Profile updated successfully")
            onSuccess?.()
            return true
        } catch (error) {
            console.error("Error updating profile:", error)
            toast.error("Failed to update profile. Please try again.")
            return false
        } finally {
            setIsSubmitting(false)
        }
    }, [formData, userId, isValid, isDirty, onSuccess])

    const reset = useCallback(() => {
        setFormData(initialData)
        setLogoPreview(null)
    }, [initialData])

    const displayLogo = logoPreview || formData.businessLogo

    return {
        formData,
        updateField,
        isDirty,
        isValid,
        isSubmitting,
        isUploadingLogo,
        displayLogo,
        uploadLogo,
        removeLogo,
        submit,
        reset,
    }
}
