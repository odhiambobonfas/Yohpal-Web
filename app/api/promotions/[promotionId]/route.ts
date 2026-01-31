import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES } from "@/constants"
import { db, serverTimestamp } from "@/lib/firebase/firebase.admin"
import { ApiResponse } from "@/types/account"
import { VideoPromotion } from "@/types/ads"

interface RouteParams {
    params: Promise<{ promotionId: string }>
}

// GET - Get single promotion
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

        const { promotionId } = await params
        const promotionDoc = await db.collection("videoPromotions").doc(promotionId).get()

        if (!promotionDoc.exists) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Promotion not found" },
                { status: 404 }
            )
        }

        const data = promotionDoc.data()

        // Verify ownership
        if (data?.userId !== userId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Unauthorized" },
                { status: 403 }
            )
        }

        // Convert Firestore timestamps to ISO strings
        const createdAt = data.createdAt && typeof data.createdAt === "object" && "toDate" in data.createdAt
            ? data.createdAt.toDate().toISOString()
            : data.createdAt
        const updatedAt = data.updatedAt && typeof data.updatedAt === "object" && "toDate" in data.updatedAt
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt

        const promotion: VideoPromotion = {
            id: promotionDoc.id,
            ...data,
            createdAt,
            updatedAt,
        } as VideoPromotion

        return NextResponse.json<ApiResponse<VideoPromotion>>({
            success: true,
            data: promotion,
        })
    } catch (error) {
        console.error("Error fetching promotion:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to fetch promotion" },
            { status: 500 }
        )
    }
}

// DELETE - Delete a draft promotion
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

        const { promotionId } = await params
        const promotionRef = db.collection("videoPromotions").doc(promotionId)
        const promotionDoc = await promotionRef.get()

        if (!promotionDoc.exists) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Promotion not found" },
                { status: 404 }
            )
        }

        const data = promotionDoc.data()

        // Verify ownership
        if (data?.userId !== userId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Unauthorized" },
                { status: 403 }
            )
        }

        // Only allow deleting drafts or depleted promotions
        if (data?.isPublished && !data?.isDepleted) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Cannot delete an active promotion. Wait until it depletes." },
                { status: 400 }
            )
        }

        // If there's remaining budget, refund it
        if (data?.amountAllocated > 0 && !data?.isDepleted) {
            const userRef = db.collection("users").doc(userId)
            const userDoc = await userRef.get()
            const userData = userDoc.data()
            const currentBalance = userData?.availableBalance || 0

            // Calculate remaining budget
            const spentAmount = data.viewsGenerated || 0  // 1 KES per view
            const remainingBudget = Math.max(0, data.amountAllocated - spentAmount)

            if (remainingBudget > 0) {
                const batch = db.batch()

                // Delete promotion
                batch.delete(promotionRef)

                // Refund remaining balance
                batch.update(userRef, {
                    availableBalance: currentBalance + remainingBudget,
                })

                // Create refund transaction
                const txRef = db.collection("adTransactions").doc()
                batch.set(txRef, {
                    userId,
                    promotionId,
                    type: "promotion_refund",
                    amount: remainingBudget,
                    description: `Refunded KES ${remainingBudget} from deleted promotion`,
                    status: "completed",
                    createdAt: serverTimestamp(),
                })

                await batch.commit()

                return NextResponse.json<ApiResponse<{ refunded: number }>>({
                    success: true,
                    data: { refunded: remainingBudget },
                })
            }
        }

        // Simple delete for drafts with no budget
        await promotionRef.delete()

        return NextResponse.json<ApiResponse<{ refunded: number }>>({
            success: true,
            data: { refunded: 0 },
        })
    } catch (error) {
        console.error("Error deleting promotion:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to delete promotion" },
            { status: 500 }
        )
    }
}
