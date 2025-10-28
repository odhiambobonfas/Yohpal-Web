"use client"
import { logger } from "@/lib/logger"

export default function FeedPage() {
    logger.debug("content shuold be here")
    const data = sessionStorage.getItem("feedData")
    const currentId = sessionStorage.getItem("currentId")
    logger.debug("data here", data)
    logger.debug("currentId here", currentId)
    return <h1>feed</h1>
}
