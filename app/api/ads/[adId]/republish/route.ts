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

        // Get user's available balance
        const userRef = db.collection("users").doc(userId)
        const userDoc = await userRef.get()
        const userData = userDoc.data()
        let availableBalance = userData?.availableBalance || 0

        // Fallback: calculate from mpesa_transactions if balance not stored
        if (availableBalance === 0) {
            const depositsSnapshot = await db
                .collection("mpesa_transactions")
                .where("userId", "==", userId)
                .where("status", "==", "completed")
                .get()

            let totalDeposited = 0
            depositsSnapshot.forEach((doc) => {
                totalDeposited += doc.data().amount || 0
            })

            // Calculate balance from deposits minus what's been allocated to ads
            const publishSnapshot = await db
                .collection("adTransactions")
                .where("userId", "==", userId)
                .get()

            let totalAllocated = 0
            publishSnapshot.forEach((doc) => {
                const data = doc.data()
                if (data.type === "ad_publish" || data.type === "ad_republish") {
                    totalAllocated += Math.abs(data.amount || 0)
                }
            })

            availableBalance = Math.max(0, totalDeposited - totalAllocated)
        }

        // Check available balance
        if (availableBalance < amountToAllocate) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Insufficient balance. Please deposit funds first." },
                { status: 400 }
            )
        }

        // Calculate new total allocated (ADD to existing, don't replace)
        const newAmountAllocated = (adData.amountAllocated || 0) + amountToAllocate

        // Use batch to update ad, balance, and create transaction
        const batch = db.batch()

        // Update ad - DO NOT reset viewsGenerated
        batch.update(adRef, {
            amountAllocated: newAmountAllocated,
            isPublished: true,
            isDepleted: false,
            updatedAt: serverTimestamp(),
        })

        // Deduct from available balance
        batch.update(userRef, {
            availableBalance: availableBalance - amountToAllocate,
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
