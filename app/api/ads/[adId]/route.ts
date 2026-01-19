import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES } from "@/constants"
import { db, serverTimestamp } from "@/lib/firebase/firebase.admin"
import { ApiResponse } from "@/types/account"
import { Ad, AdWithStats, UpdateAdRequest, AdStats } from "@/types/ads"

// GET - Get ad details with stats
export async function GET(
    request: Request,
    { params }: { params: Promise<{ adId: string }> }
) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get(COOKIES.User)?.value

        if (!userId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { adId } = await params

        const adDoc = await db.collection("ads").doc(adId).get()

        if (!adDoc.exists) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Ad not found" },
                { status: 404 }
            )
        }

        const adData = adDoc.data() as Omit<Ad, "id">

        // Check ownership
        if (adData.userId !== userId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Unauthorized" },
                { status: 403 }
            )
        }

        // Get impression and click counts
        const impressionsSnapshot = await db
            .collection("adImpressions")
            .where("adId", "==", adId)
            .count()
            .get()

        const clicksSnapshot = await db
            .collection("adClicks")
            .where("adId", "==", adId)
            .count()
            .get()

        const impressions = impressionsSnapshot.data().count || 0
        const clicks = clicksSnapshot.data().count || 0
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0

        const stats: AdStats = {
            impressions,
            clicks,
            ctr,
            totalSpent: adData.spentAmount,
        }

        const adWithStats: AdWithStats = {
            id: adDoc.id,
            ...adData,
            stats,
        }

        return NextResponse.json<ApiResponse<AdWithStats>>({
            success: true,
            data: adWithStats,
        })
    } catch (error) {
        console.error("Error fetching ad:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to fetch ad" },
            { status: 500 }
        )
    }
}

// PATCH - Update ad
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ adId: string }> }
) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get(COOKIES.User)?.value

        if (!userId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { adId } = await params
        const body: UpdateAdRequest = await request.json()

        const adRef = db.collection("ads").doc(adId)
        const adDoc = await adRef.get()

        if (!adDoc.exists) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Ad not found" },
                { status: 404 }
            )
        }

        const adData = adDoc.data() as Omit<Ad, "id">

        // Check ownership
        if (adData.userId !== userId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Unauthorized" },
                { status: 403 }
            )
        }

        // Build update object
        const updateData: Record<string, unknown> = {
            updatedAt: serverTimestamp(),
        }

        if (body.title !== undefined) updateData.title = body.title
        if (body.description !== undefined) updateData.description = body.description
        if (body.callToAction !== undefined) updateData.callToAction = body.callToAction
        if (body.destinationUrl !== undefined) updateData.destinationUrl = body.destinationUrl
        if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl
        if (body.status !== undefined) {
            // Validate status transitions
            const validStatuses = ["active", "paused"]
            if (!validStatuses.includes(body.status)) {
                return NextResponse.json<ApiResponse<null>>(
                    { success: false, error: "Invalid status" },
                    { status: 400 }
                )
            }
            updateData.status = body.status
        }

        await adRef.update(updateData)

        const updatedDoc = await adRef.get()

        return NextResponse.json<ApiResponse<Ad>>({
            success: true,
            data: {
                id: updatedDoc.id,
                ...updatedDoc.data(),
            } as Ad,
        })
    } catch (error) {
        console.error("Error updating ad:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to update ad" },
            { status: 500 }
        )
    }
}

// DELETE - Archive ad (soft delete) and refund remaining budget
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ adId: string }> }
) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get(COOKIES.User)?.value

        if (!userId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { adId } = await params

        const adRef = db.collection("ads").doc(adId)
        const adDoc = await adRef.get()

        if (!adDoc.exists) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Ad not found" },
                { status: 404 }
            )
        }

        const adData = adDoc.data() as Omit<Ad, "id">

        // Check ownership
        if (adData.userId !== userId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Unauthorized" },
                { status: 403 }
            )
        }

        // Calculate refund
        const refundAmount = adData.totalBudget - adData.spentAmount

        // Use batch to update ad and refund wallet
        const batch = db.batch()

        // Archive the ad
        batch.update(adRef, {
            isArchived: true,
            status: "completed",
            updatedAt: serverTimestamp(),
        })

        // Refund remaining budget to wallet
        if (refundAmount > 0) {
            const userRef = db.collection("users").doc(userId)
            const userDoc = await userRef.get()
            const userData = userDoc.data()
            const currentBalance = userData?.businessProfile?.walletBalance || 0

            batch.update(userRef, {
                "businessProfile.walletBalance": currentBalance + refundAmount,
            })

            // Create refund transaction
            const txRef = db.collection("adTransactions").doc()
            batch.set(txRef, {
                userId,
                adId,
                type: "deposit",
                amount: refundAmount,
                description: `Refund from deleted ad: ${adData.title}`,
                createdAt: serverTimestamp(),
            })
        }

        await batch.commit()

        return NextResponse.json<ApiResponse<null>>({
            success: true,
            message: refundAmount > 0
                ? `Ad deleted. KES ${refundAmount.toFixed(2)} refunded to wallet.`
                : "Ad deleted.",
        })
    } catch (error) {
        console.error("Error deleting ad:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to delete ad" },
            { status: 500 }
        )
    }
}
