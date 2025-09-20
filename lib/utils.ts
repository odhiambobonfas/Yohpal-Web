import { FirebaseTimestamp } from "@/types/base"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { DEFAULT_THUMBNAIL } from "@/constants"

dayjs.extend(relativeTime)

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

// Some video thumbnails point to the same resource as the video
// we check if they are similar return default thumbnail url instead
export function recoverThumbnail(thumbnailUrl: string, videoUrl: string) {
    return thumbnailUrl === videoUrl ? DEFAULT_THUMBNAIL : thumbnailUrl
}

export function formatTime(timestamp: string) {
    const date = dayjs(timestamp)
    const now = dayjs()

    const dateTime = now.diff(date, "day")
    if (dateTime >= 7) {
        return date.format("MMM D, YYYY")
    } else {
        return date.fromNow()
    }
}
