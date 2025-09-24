import { FirebaseTimestamp } from "@/types/base"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { CDN_URL, DEFAULT_THUMBNAIL, OLD_URL } from "@/constants"

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
    const regex = new RegExp(`\\b${OLD_URL}\\b`, "g")
    const newLink = link.replace(regex, CDN_URL)
    return link
}

// if a thumbnail has an mp4 anywhere, skip it, use default one instead
export function recoverThumbnail(thumbnailUrl: string | undefined) {
    if (!thumbnailUrl) return DEFAULT_THUMBNAIL

    return thumbnailUrl.includes("mp4") ? DEFAULT_THUMBNAIL : replaceWithCDN(thumbnailUrl)
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
