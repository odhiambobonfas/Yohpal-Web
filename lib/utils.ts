import { clsx, type ClassValue } from "clsx"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { twMerge } from "tailwind-merge"

import { CDN_URL, DEFAULT_THUMBNAIL, OLD_URL } from "@/constants"
import { FirebaseTimestamp } from "@/types/base"

dayjs.extend(relativeTime)

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

function getError(error: unknown): string {
    if (error instanceof Error) return error.message
    return String(error)
}

function serializeTimestamp(timestamp: string | FirebaseTimestamp): string {
    if (typeof timestamp === "string") return timestamp

    if (typeof timestamp === "object" && "seconds" in timestamp) {
        return new Date(timestamp.seconds * 1000).toISOString()
    }

    return new Date().toISOString()
}

function replaceWithCDN(link: string): string {
    if (!link) return DEFAULT_THUMBNAIL
    if (link === DEFAULT_THUMBNAIL) return link

    const regex = new RegExp(`\\b${OLD_URL}\\b`, "g")
    const newLink = link.replace(regex, CDN_URL)
    return newLink
}

function recoverThumbnail(thumbnailUrl: string | undefined) {
    if (!thumbnailUrl) return DEFAULT_THUMBNAIL

    return replaceWithCDN(thumbnailUrl)
}

function formatTime(timestamp: string) {
    const date = dayjs(timestamp)
    const now = dayjs()

    const dateTime = now.diff(date, "day")
    if (dateTime >= 7) {
        return date.format("MMM D, YYYY")
    } else {
        return date.fromNow()
    }
}

function getLast<T>(items: T[] | undefined) {
    return items ? items[items.length - 1] : null
}

function formatStat(num: number) {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B"
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K"

    return num.toString()
}
function flattenObject(raw: object): object {
    const result: Record<string, any> = {}

    function flatten(obj: object, prefix: string = ""): void {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const newKey = prefix ? `${prefix}.${key}` : key
                const value = (obj as any)[key]

                if (value !== null && typeof value === "object" && !Array.isArray(value)) {
                    flatten(value, newKey)
                } else {
                    result[newKey] = value
                }
            }
        }
    }

    flatten(raw)
    return result
}

export {
    cn,
    flattenObject,
    formatStat,
    formatTime,
    getError,
    getLast,
    recoverThumbnail,
    replaceWithCDN,
    serializeTimestamp,
}
