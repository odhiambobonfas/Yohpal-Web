import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES } from "@/constants"
import { db } from "@/lib/firebase/firebase.admin"
import { ApiResponse } from "@/types/account"
import { UserVideo } from "@/types/ads"

// GET - Get user's videos for promotion selection
export async function GET() {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get(COOKIES.User)?.value

        if (!userId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Fetch user's videos
        const videosSnapshot = await db
            .collection("videos")
            .where("userId", "==", userId)
            .orderBy("timestamp", "desc")
            .limit(50) // Limit to 50 most recent videos
            .get()

        // Get all video IDs that already have promotions
        const promotionsSnapshot = await db
            .collection("videoPromotions")
            .where("userId", "==", userId)
            .get()

        const promotedVideoIds = new Set(
            promotionsSnapshot.docs.map((doc) => doc.data().videoId)
        )

        const videos: UserVideo[] = videosSnapshot.docs.map((doc) => {
            const data = doc.data()
            // Convert Firestore timestamps to ISO strings
            const createdAt = data.timestamp && typeof data.timestamp === "object" && "toDate" in data.timestamp
                ? data.timestamp.toDate().toISOString()
                : data.timestamp
            return {
                id: doc.id,
                title: data.title || data.caption || "Untitled Video",
                thumbnail: data.thumbnail || "",
                hasPromotion: promotedVideoIds.has(doc.id),
                createdAt,
            }
        })

        return NextResponse.json<ApiResponse<UserVideo[]>>({
            success: true,
            data: videos,
        })
    } catch (error) {
        console.error("Error fetching user videos:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to fetch videos" },
            { status: 500 }
        )
    }
}
