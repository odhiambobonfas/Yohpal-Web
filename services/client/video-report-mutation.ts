import { db } from "@/lib/firebase/firebase.browser"
import { doc, serverTimestamp, setDoc } from "firebase/firestore"

export async function reportVideo(data: {
    userId: string
    videoId: string
    reason: string
    context: string
    userName: string
}) {
    if (!data.videoId || !data.reason) {
        throw new Error("Missing required fields: videoId or reason")
    }

    const videoReportRef = doc(db, "feedback", "videoReports", "videoIds", data.videoId)
    await setDoc(videoReportRef, {
        [data.userId]: {
            userName: data.userName,
            reason: data.reason,
            context: data.context,
            reportedAt: serverTimestamp(),
        },
    })
}
