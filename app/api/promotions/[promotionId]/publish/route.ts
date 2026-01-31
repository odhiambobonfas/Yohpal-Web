import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES, AD_MIN_PUBLISH_AMOUNT, AD_DEFAULT_VIEW_FREQUENCY, AD_MAX_VIEW_FREQUENCY } from "@/constants"
import { db, serverTimestamp } from "@/lib/firebase/firebase.admin"
import { ApiResponse } from "@/types/account"
import { VideoPromotion, PublishVideoPromotionRequest, AdViewFrequency } from "@/types/ads"

interface RouteParams {
    params: Promise<{ promotionId: string }>
}

// POST - Publish a video promotion draft
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

        const { promotionId } = await params
        const body: PublishVideoPromotionRequest = await request.json()
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

        // Get the promotion
        const promotionRef = db.collection("videoPromotions").doc(promotionId)
        const promotionDoc = await promotionRef.get()

        if (!promotionDoc.exists) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Promotion not found" },
                { status: 404 }
            )
        }

        const promotionData = promotionDoc.data() as Omit<VideoPromotion, "id">

        // Verify ownership
        if (promotionData.userId !== userId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Unauthorized" },
                { status: 403 }
            )
        }

        // Check if promotion is already published
        if (promotionData.isPublished && !promotionData.isDepleted) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Promotion is already published. Use republish for depleted promotions." },
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

            // Calculate balance from deposits minus what's been allocated
            const publishSnapshot = await db
                .collection("adTransactions")
                .where("userId", "==", userId)
                .get()

            let totalAllocated = 0
            publishSnapshot.forEach((doc) => {
                const data = doc.data()
                if (data.type === "ad_publish" || data.type === "ad_republish" ||
                    data.type === "promotion_publish" || data.type === "promotion_republish") {
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

        // Use batch to update promotion, balance, video, and create transaction
        const batch = db.batch()

        // Update promotion
        batch.update(promotionRef, {
            amountAllocated: amountToAllocate,
            isPublished: true,
            isDepleted: false,
            viewFrequency,
            updatedAt: serverTimestamp(),
        })

        // Update video to mark as promoted
        const videoRef = db.collection("videos").doc(promotionData.videoId)
        batch.update(videoRef, {
            promoted: true,
            campaignMeta: {
                promotionId,
                timestamp: serverTimestamp(),
            },
        })

        // Deduct from available balance
        batch.update(userRef, {
            availableBalance: availableBalance - amountToAllocate,
        })

        // Create transaction record
        const txRef = db.collection("adTransactions").doc()
        batch.set(txRef, {
            userId,
            promotionId,
            type: "promotion_publish",
            amount: -amountToAllocate,
            description: `Published video promotion with KES ${amountToAllocate} budget`,
            status: "completed",
            createdAt: serverTimestamp(),
        })

        await batch.commit()

        // Return the updated promotion with properly formatted timestamps
        const now = new Date().toISOString()
        const createdAt = promotionData.createdAt && typeof promotionData.createdAt === "object" && "toDate" in promotionData.createdAt
            ? (promotionData.createdAt as { toDate: () => Date }).toDate().toISOString()
            : promotionData.createdAt

        return NextResponse.json<ApiResponse<VideoPromotion>>({
            success: true,
            data: {
                id: promotionId,
                ...promotionData,
                createdAt,
                amountAllocated: amountToAllocate,
                isPublished: true,
                isDepleted: false,
                viewFrequency,
                updatedAt: now,
            },
        })
    } catch (error) {
        console.error("Error publishing promotion:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to publish promotion" },
            { status: 500 }
        )
    }
}
