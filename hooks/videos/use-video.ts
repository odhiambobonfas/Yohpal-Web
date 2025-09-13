import { VideoInteraction } from "#/videos"
import { useState } from "react"

export function useVideo() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const likeVideo = async (interactionDetails: VideoInteraction) => {}
    const bookmarkVideo = async (interactionDetails: VideoInteraction) => {}
    const shareVideo = async (interactionDetails: VideoInteraction) => {}
    const downloadVideo = async (interactionDetails: VideoInteraction) => {}

    return { loading, error, likeVideo, bookmarkVideo, shareVideo, downloadVideo }
}
