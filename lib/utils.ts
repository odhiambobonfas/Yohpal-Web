import { FirebaseTimestamp } from "@/types/base"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getError(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
}

export function serializeTimestamp(timestamp: string | FirebaseTimestamp): string {
    if (typeof timestamp === "string") return timestamp

    if (typeof timestamp === "object" && "seconds" in timestamp) {
        return new Date(timestamp.seconds * 1000).toISOString()
    }

    return new Date().toISOString()
}

export function replaceWithCDN(link: string): string {
    const oldUrl = "https://firebasestorage.googleapis.com/v0/b/yohlab.firebasestorage.app/o/"
    const cdnUrl = "http://cdn.yohpal.com/"

    const regex = new RegExp(`\\b${oldUrl}\\b`, "g")
    const newLink = link.replace(regex, cdnUrl)
    return newLink
}
