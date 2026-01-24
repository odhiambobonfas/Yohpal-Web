import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES, AD_COST_PER_VIEW } from "@/constants"
import { db, serverTimestamp } from "@/lib/firebase/firebase.admin"
import { ApiResponse } from "@/types/account"
import { Ad } from "@/types/ads"
import { isAdDepleted } from "@/lib/ads/calculations"

interface ViewRequest {
    adId: string
}

// POST - Record ad view and deduct cost
export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const viewerId = cookieStore.get(COOKIES.User)?.value

        // Anonymous users can view ads but we track them differently
        const anonymousId = request.headers.get("x-anonymous-id") || "anonymous"
        const effectiveViewerId = viewerId || anonymousId

        const body: ViewRequest = await request.json()
        const { adId } = body

        if (!adId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Ad ID is required" },
                { status: 400 }
            )
        }

        // Check if this viewer has already seen this ad (dedup)
        const viewId = `${adId}__${effectiveViewerId}`
        const existingView = await db
            .collection("adViews")
            .doc(viewId)
            .get()

        if (existingView.exists) {
            // Already counted this view, don't charge again
            return NextResponse.json<ApiResponse<{ charged: boolean }>>({
                success: true,
                data: { charged: false },
            })
        }

        // Get the ad
        const adRef = db.collection("ads").doc(adId)
        const adDoc = await adRef.get()

        if (!adDoc.exists) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Ad not found" },
                { status: 404 }
            )
        }

        const adData = adDoc.data() as Omit<Ad, "id">

        // Check if ad is published and not depleted
        if (!adData.isPublished || adData.isDepleted) {
            return NextResponse.json<ApiResponse<{ charged: boolean }>>({
                success: true,
                data: { charged: false },
            })
        }

        // Check if ad has budget remaining
        if (isAdDepleted(adData.amountAllocated, adData.viewsGenerated)) {
            // No budget left, mark ad as depleted
            await adRef.update({
                isDepleted: true,
                updatedAt: serverTimestamp(),
            })

            return NextResponse.json<ApiResponse<{ charged: boolean }>>({
                success: true,
                data: { charged: false },
            })
        }

        // Use batch to record view and update ad
        const batch = db.batch()

        // Record view
        batch.set(db.collection("adViews").doc(viewId), {
            adId,
            viewerId: effectiveViewerId,
            timestamp: serverTimestamp(),
        })

        // Update ad views count
        const newViewsGenerated = adData.viewsGenerated + 1
        const updateData: Record<string, unknown> = {
            viewsGenerated: newViewsGenerated,
            updatedAt: serverTimestamp(),
        }

        // Check if budget is now exhausted
        if (isAdDepleted(adData.amountAllocated, newViewsGenerated)) {
            updateData.isDepleted = true
        }

        batch.update(adRef, updateData)

        // Record transaction
        const txRef = db.collection("adTransactions").doc()
        batch.set(txRef, {
            userId: adData.userId,
            adId,
            type: "ad_spend",
            amount: -AD_COST_PER_VIEW,
            description: `View on ad (view #${newViewsGenerated})`,
            status: "completed",
            createdAt: serverTimestamp(),
        })

        await batch.commit()

        return NextResponse.json<ApiResponse<{ charged: boolean }>>({
            success: true,
            data: { charged: true },
        })
    } catch (error) {
        console.error("Error recording view:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to record view" },
            { status: 500 }
        )
    }
}
