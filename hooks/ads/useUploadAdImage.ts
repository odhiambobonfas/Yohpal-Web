"use client"

import { useState, useCallback } from "react"
import { uploadAdImage, validateImageFile } from "@/services/client/file-upload"

export function useUploadAdImage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [preview, setPreview] = useState<string | null>(null)

    const upload = useCallback(async (userId: string, file: File) => {
        try {
            setLoading(true)
            setError(null)

            // Validate file
            const validation = validateImageFile(file, 10) // 10MB max for ads
            if (!validation.valid) {
                throw new Error(validation.error)
            }

            // Create preview
            const reader = new FileReader()
            reader.onload = (event) => {
                setPreview(event.target?.result as string)
            }
            reader.readAsDataURL(file)

            // Upload to Firebase Storage
            const url = await uploadAdImage(userId, file)
            setImageUrl(url)
            return url
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to upload image"
            setError(errorMessage)
            setPreview(null)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const reset = useCallback(() => {
        setLoading(false)
        setError(null)
        setImageUrl(null)
        setPreview(null)
    }, [])

    return { upload, loading, error, imageUrl, preview, reset }
}
