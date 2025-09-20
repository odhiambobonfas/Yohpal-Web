import { db } from "@/lib/firebase/firebase.admin"
import { Video } from "@/types/videos"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    if (!id) return new Response("", { status: 403, statusText: "Missing require field" })

    const videoDoc = await db.collection("videos").doc(id).get()
    if (!videoDoc.exists) return new Response("", { status: 404, statusText: "Video not found" })

    const video = videoDoc.data() as Video

    const response = await fetch(video.videoUrl)
    const name = video.title || `yp-${videoDoc.id.slice(0, 5)}`

    return new Response(response.body, {
        headers: {
            "Content-Disposition": `attachment; filename="${name}.mp4"`,
            "Content-Type": "application/octet-stream",
        },
    })
}
