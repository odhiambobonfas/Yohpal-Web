import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES } from "@/constants"
import { db, serverTimestamp } from "@/lib/firebase/firebase.admin"
import { ApiResponse } from "@/types/account"

interface ClickRequest {
    adId: string
}

// POST - Record ad click (for analytics purposes)
export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const viewerId = cookieStore.get(COOKIES.User)?.value

        const anonymousId = request.headers.get("x-anonymous-id") || "anonymous"
        const effectiveViewerId = viewerId || anonymousId

        const body: ClickRequest = await request.json()
        const { adId } = body

        if (!adId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Ad ID is required" },
                { status: 400 }
            )
        }

        // Get the ad to verify it exists
        const adDoc = await db.collection("ads").doc(adId).get()

        if (!adDoc.exists) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Ad not found" },
                { status: 404 }
            )
        }

        // Record the click for analytics
        await db.collection("adClicks").add({
            adId,
            viewerId: effectiveViewerId,
            timestamp: serverTimestamp(),
        })

        return NextResponse.json<ApiResponse<{ recorded: boolean }>>({
            success: true,
            data: {
                recorded: true,
            },
        })
    } catch (error) {
        console.error("Error recording click:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to record click" },
            { status: 500 }
        )
    }
}
