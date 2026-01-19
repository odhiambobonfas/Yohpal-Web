import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase/firebase.browser"

/**
 * Upload a business logo to Firebase Storage
 * @param userId - The user's ID
 * @param file - The image file to upload
 * @returns The download URL of the uploaded image
 */
export async function uploadBusinessLogo(userId: string, file: File): Promise<string> {
    const timestamp = Date.now()
    const extension = file.name.split(".").pop() || "png"
    const fileName = `business-logos/${userId}/${timestamp}.${extension}`

    const storageRef = ref(storage, fileName)

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
    })

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
}

/**
 * Upload an ad image to Firebase Storage
 * @param userId - The user's ID
 * @param file - The image file to upload
 * @returns The download URL of the uploaded image
 */
export async function uploadAdImage(userId: string, file: File): Promise<string> {
    const timestamp = Date.now()
    const extension = file.name.split(".").pop() || "png"
    const fileName = `ad-images/${userId}/${timestamp}.${extension}`

    const storageRef = ref(storage, fileName)

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
    })

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
}

/**
 * Validate image file before upload
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default 5MB)
 * @returns Validation result
 */
export function validateImageFile(
    file: File,
    maxSizeMB: number = 5
): { valid: boolean; error?: string } {
    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
        return {
            valid: false,
            error: "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.",
        }
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
        return {
            valid: false,
            error: `File size must be less than ${maxSizeMB}MB.`,
        }
    }

    return { valid: true }
}
