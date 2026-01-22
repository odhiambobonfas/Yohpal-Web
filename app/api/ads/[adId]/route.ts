import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES, AD_DESCRIPTION_MAX_LENGTH } from "@/constants"
import { db, serverTimestamp } from "@/lib/firebase/firebase.admin"
import { ApiResponse } from "@/types/account"
import { Ad, AdWithStats, UpdateAdRequest } from "@/types/ads"
import { calculateSpentAmount, calculateTimeDelivered } from "@/lib/ads/calculations"

interface RouteParams {
    params: Promise<{ adId: string }>
}

// GET - Get ad details with stats
export async function GET(request: Request, { params }: RouteParams) {
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

        // Calculate stats from views
        const totalSpent = calculateSpentAmount(adData.viewsGenerated)
        const totalTimeSeconds = calculateTimeDelivered(adData.viewsGenerated)

        // Convert Firestore timestamps to ISO strings
        const createdAt = adData.createdAt && typeof adData.createdAt === "object" && "toDate" in adData.createdAt
            ? (adData.createdAt as { toDate: () => Date }).toDate().toISOString()
            : adData.createdAt
        const updatedAt = adData.updatedAt && typeof adData.updatedAt === "object" && "toDate" in adData.updatedAt
            ? (adData.updatedAt as { toDate: () => Date }).toDate().toISOString()
            : adData.updatedAt

        const adWithStats: AdWithStats = {
            id: adDoc.id,
            ...adData,
            createdAt,
            updatedAt,
            stats: {
                views: adData.viewsGenerated,
                totalTimeSeconds,
                totalSpent,
            },
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

// PATCH - Update ad (only drafts can be updated)
export async function PATCH(request: Request, { params }: RouteParams) {
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

        // Can only update drafts (unpublished ads)
        if (adData.isPublished) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Cannot update a published ad" },
                { status: 400 }
            )
        }

        // Validate description length if provided
        if (body.description && body.description.length > AD_DESCRIPTION_MAX_LENGTH) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: `Description must be ${AD_DESCRIPTION_MAX_LENGTH} characters or less` },
                { status: 400 }
            )
        }

        // Build update object
        const updateData: Record<string, unknown> = {
            updatedAt: serverTimestamp(),
        }

        if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl
        if (body.description !== undefined) updateData.description = body.description || undefined

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

// DELETE - Delete ad and refund remaining budget
export async function DELETE(request: Request, { params }: RouteParams) {
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

        // Calculate refund (amount allocated minus what was spent on views)
        const spentAmount = calculateSpentAmount(adData.viewsGenerated)
        const refundAmount = adData.amountAllocated - spentAmount

        // Use batch to delete ad and refund wallet
        const batch = db.batch()

        // Delete the ad
        batch.delete(adRef)

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
                description: `Refund from deleted ad (KES ${refundAmount.toFixed(2)} remaining budget)`,
                status: "completed",
                createdAt: serverTimestamp(),
            })
        }

        await batch.commit()

        return NextResponse.json<ApiResponse<null>>({
            success: true,
            data: null,
        })
    } catch (error) {
        console.error("Error deleting ad:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to delete ad" },
            { status: 500 }
        )
    }
}
