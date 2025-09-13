import { FirebaseTimestamp } from "#/base"

export interface Video {
    id: string
    userId: string
    userName: string
    videoUrl: string
    privacy: "Everyone" | ""
    timestamp: string | FirebaseTimestamp
    broken: boolean | null
    thumbnail: string
}

export interface VideoInteraction {
    userId: string
    videoId: string
}
