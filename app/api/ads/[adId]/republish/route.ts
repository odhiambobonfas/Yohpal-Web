import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES, AD_MIN_PUBLISH_AMOUNT } from "@/constants"
import { db, serverTimestamp } from "@/lib/firebase/firebase.admin"
import { ApiResponse } from "@/types/account"
import { Ad, RepublishAdRequest } from "@/types/ads"

interface RouteParams {
    params: Promise<{ adId: string }>
}

// POST - Republish a depleted ad
export async function POST(request: Request, { params }: RouteParams) {
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
        const body: RepublishAdRequest = await request.json()
        const { amountToAllocate } = body

        // Validate amount
        if (!amountToAllocate || amountToAllocate < AD_MIN_PUBLISH_AMOUNT) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: `Minimum amount to republish is KES ${AD_MIN_PUBLISH_AMOUNT}` },
                { status: 400 }
            )
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

        // Verify ownership
        if (adData.userId !== userId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Unauthorized" },
                { status: 403 }
            )
        }

        // Check if ad is depleted (allow republish for depleted ads or unpublished ads with some views)
        if (!adData.isDepleted && adData.isPublished) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Ad is still active. Wait until depleted to republish." },
                { status: 400 }
            )
        }

        // Get user's wallet balance
        const userRef = db.collection("users").doc(userId)
        const userDoc = await userRef.get()
        const userData = userDoc.data()
        const walletBalance = userData?.businessProfile?.walletBalance || 0

        // Check wallet balance
        if (walletBalance < amountToAllocate) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Insufficient wallet balance" },
                { status: 400 }
            )
        }

        // Calculate new total allocated (ADD to existing, don't replace)
        const newAmountAllocated = (adData.amountAllocated || 0) + amountToAllocate

        // Use batch to update ad, wallet, and create transaction
        const batch = db.batch()

        // Update ad - DO NOT reset viewsGenerated
        batch.update(adRef, {
            amountAllocated: newAmountAllocated,
            isPublished: true,
            isDepleted: false,
            updatedAt: serverTimestamp(),
        })

        // Deduct from wallet
        batch.update(userRef, {
            "businessProfile.walletBalance": walletBalance - amountToAllocate,
        })

        // Create transaction record
        const txRef = db.collection("adTransactions").doc()
        batch.set(txRef, {
            userId,
            adId,
            type: "ad_republish",
            amount: -amountToAllocate,
            description: `Republished ad with additional KES ${amountToAllocate} (total: KES ${newAmountAllocated})`,
            status: "completed",
            createdAt: serverTimestamp(),
        })

        await batch.commit()

        // Return the updated ad with properly formatted timestamps
        const now = new Date().toISOString()
        // Convert Firestore timestamp to ISO string
        const createdAt = adData.createdAt && typeof adData.createdAt === "object" && "toDate" in adData.createdAt
            ? (adData.createdAt as { toDate: () => Date }).toDate().toISOString()
            : adData.createdAt

        return NextResponse.json<ApiResponse<Ad>>({
            success: true,
            data: {
                id: adId,
                ...adData,
                createdAt,
                amountAllocated: newAmountAllocated,
                isPublished: true,
                isDepleted: false,
                updatedAt: now,
            },
        })
    } catch (error) {
        console.error("Error republishing ad:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to republish ad" },
            { status: 500 }
        )
    }
}
