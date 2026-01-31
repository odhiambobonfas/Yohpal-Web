import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES, AD_MIN_PUBLISH_AMOUNT, AD_DEFAULT_VIEW_FREQUENCY, AD_MAX_VIEW_FREQUENCY } from "@/constants"
import { db, serverTimestamp } from "@/lib/firebase/firebase.admin"
import { ApiResponse } from "@/types/account"
import { Ad, PublishAdRequest, AdViewFrequency } from "@/types/ads"

interface RouteParams {
    params: Promise<{ adId: string }>
}

// POST - Publish an ad draft
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
        const body: PublishAdRequest = await request.json()
        const { amountToAllocate, viewFrequency: requestedFrequency } = body

        // Validate and default view frequency
        const viewFrequency: AdViewFrequency = (requestedFrequency && requestedFrequency >= 1 && requestedFrequency <= AD_MAX_VIEW_FREQUENCY)
            ? requestedFrequency as AdViewFrequency
            : AD_DEFAULT_VIEW_FREQUENCY as AdViewFrequency

        // Validate amount
        if (!amountToAllocate || amountToAllocate < AD_MIN_PUBLISH_AMOUNT) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: `Minimum amount to publish is KES ${AD_MIN_PUBLISH_AMOUNT}` },
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

        // Check if ad is already published
        if (adData.isPublished && !adData.isDepleted) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Ad is already published. Use republish for depleted ads." },
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

        // Use batch to update ad, balance, and create transaction
        const batch = db.batch()

        // Update ad
        batch.update(adRef, {
            amountAllocated: amountToAllocate,
            isPublished: true,
            isDepleted: false,
            viewFrequency,
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
            type: "ad_publish",
            amount: -amountToAllocate,
            description: `Published ad with KES ${amountToAllocate} budget`,
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
                amountAllocated: amountToAllocate,
                isPublished: true,
                isDepleted: false,
                viewFrequency,
                updatedAt: now,
            },
        })
    } catch (error) {
        console.error("Error publishing ad:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to publish ad" },
            { status: 500 }
        )
    }
}
