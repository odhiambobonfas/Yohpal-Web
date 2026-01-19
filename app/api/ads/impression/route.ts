import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES } from "@/constants"
import { db, serverTimestamp } from "@/lib/firebase/firebase.admin"
import { ApiResponse } from "@/types/account"
import { Ad } from "@/types/ads"

interface ImpressionRequest {
    adId: string
}

// POST - Record ad impression and deduct cost
export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const viewerId = cookieStore.get(COOKIES.User)?.value

        // Anonymous users can view ads but we track them differently
        const anonymousId = request.headers.get("x-anonymous-id") || "anonymous"
        const effectiveViewerId = viewerId || anonymousId

        const body: ImpressionRequest = await request.json()
        const { adId } = body

        if (!adId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Ad ID is required" },
                { status: 400 }
            )
        }

        // Check if this viewer has already seen this ad (dedup)
        const impressionId = `${adId}__${effectiveViewerId}`
        const existingImpression = await db
            .collection("adImpressions")
            .doc(impressionId)
            .get()

        if (existingImpression.exists) {
            // Already counted this impression, don't charge again
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

        // Check if ad is active and has budget
        if (adData.status !== "active") {
            return NextResponse.json<ApiResponse<{ charged: boolean }>>({
                success: true,
                data: { charged: false },
            })
        }

        const remainingBudget = adData.totalBudget - adData.spentAmount
        if (remainingBudget < adData.costPerImpression) {
            // No budget left, mark ad as completed
            await adRef.update({
                status: "completed",
                updatedAt: serverTimestamp(),
            })

            return NextResponse.json<ApiResponse<{ charged: boolean }>>({
                success: true,
                data: { charged: false },
            })
        }

        // Use batch to record impression and update ad
        const batch = db.batch()

        // Record impression
        batch.set(db.collection("adImpressions").doc(impressionId), {
            adId,
            viewerId: effectiveViewerId,
            timestamp: serverTimestamp(),
        })

        // Update ad spend
        const newSpentAmount = adData.spentAmount + adData.costPerImpression
        const updateData: Record<string, unknown> = {
            spentAmount: newSpentAmount,
            updatedAt: serverTimestamp(),
        }

        // Check if budget is exhausted
        if (newSpentAmount >= adData.totalBudget) {
            updateData.status = "completed"
        }

        batch.update(adRef, updateData)

        // Update business profile total spent
        const userRef = db.collection("users").doc(adData.userId)
        const userDoc = await userRef.get()
        const userData = userDoc.data()
        const currentTotalSpent = userData?.businessProfile?.totalSpent || 0

        batch.update(userRef, {
            "businessProfile.totalSpent": currentTotalSpent + adData.costPerImpression,
        })

        // Record transaction
        const txRef = db.collection("adTransactions").doc()
        batch.set(txRef, {
            userId: adData.userId,
            adId,
            type: "ad_spend",
            amount: -adData.costPerImpression,
            description: `Impression on ad: ${adData.title}`,
            createdAt: serverTimestamp(),
        })

        await batch.commit()

        return NextResponse.json<ApiResponse<{ charged: boolean }>>({
            success: true,
            data: { charged: true },
        })
    } catch (error) {
        console.error("Error recording impression:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to record impression" },
            { status: 500 }
        )
    }
}
