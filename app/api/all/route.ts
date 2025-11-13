import { DEBUG_BUILD } from "@/constants"
import { db } from "@/lib/firebase/firebase.admin"
import { replaceWithCDN } from "@/lib/utils"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!DEBUG_BUILD) return new Response("", { status: 406, statusText: "welp" })

    try {
        const videoDocs = await db
            .collection("videos")
            .select("videoUrl")
            .where("broken", "!=", true)
            .get()

        const videos = videoDocs.docs.map((v) => {
            if (!v.exists) return null
            return {
                videoId: v.id,
                videoUrl: replaceWithCDN(v.data().videoUrl),
            }
        })

        return NextResponse.json(videos.filter((v) => v !== null))
    } catch (error) {
        console.error("Error fetching videos:", error)
        return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 })
    }
}
