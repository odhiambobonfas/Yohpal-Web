import { DEBUG_BUILD } from "@/constants"
import { db } from "@/lib/firebase/firebase.admin"
import { NextResponse } from "next/server"

    if (!DEBUG_BUILD) return new Response("", { status: 406, statusText: "welp" })

    try {
        const videoDocs = await db
            .collection("videos")
            .select("videoUrl")
            .where("broken", "!=", true)
            .get()

        const videos = videoDocs.docs.map((v) => {
            const videoData = v.data()
            if (videoData?.watermarked !== undefined) return null
            if (!v.exists) return null

            return {
                videoId: v.id,
                videoUrl: videoData.videoUrl,
            }
        })

        return NextResponse.json(videos.filter((v) => v !== null))
    } catch (error) {
        console.error("Error fetching videos:", error)
        return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
    }
}
