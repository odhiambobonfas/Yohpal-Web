import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES } from "@/constants"
import { db, serverTimestamp } from "@/lib/firebase/firebase.admin"
import { ApiResponse } from "@/types/account"
import { VideoPromotion, VideoPromotionsListResponse, CreateVideoPromotionRequest, PromotionFilterType } from "@/types/ads"

// GET - List user's video promotions
export async function GET(request: Request) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get(COOKIES.User)?.value

        if (!userId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")
        const filter = (searchParams.get("filter") || "all") as PromotionFilterType

        // Build query
        let queryRef = db.collection("videoPromotions").where("userId", "==", userId)

        // Apply filter before orderBy
        if (filter === "drafts") {
            queryRef = queryRef.where("isPublished", "==", false)
        } else if (filter === "published") {
            queryRef = queryRef.where("isPublished", "==", true).where("isDepleted", "==", false)
        } else if (filter === "depleted") {
            queryRef = queryRef.where("isDepleted", "==", true)
        }

        // Add orderBy after all where clauses
        const query = queryRef.orderBy("createdAt", "desc")

        // Get total count
        let total = 0
        try {
            const countSnapshot = await query.count().get()
            total = countSnapshot.data().count
        } catch (countError) {
            console.error("Error counting promotions:", countError)
        }

        // Get paginated results
        const offset = (page - 1) * limit
        const promotionsSnapshot = await query.offset(offset).limit(limit).get()

        const promotions: VideoPromotion[] = promotionsSnapshot.docs.map((doc) => {
            const data = doc.data()
            // Convert Firestore timestamps to ISO strings
            const createdAt = data.createdAt && typeof data.createdAt === "object" && "toDate" in data.createdAt
                ? data.createdAt.toDate().toISOString()
                : data.createdAt
            const updatedAt = data.updatedAt && typeof data.updatedAt === "object" && "toDate" in data.updatedAt
                ? data.updatedAt.toDate().toISOString()
                : data.updatedAt
            return {
                id: doc.id,
                ...data,
                createdAt,
                updatedAt,
            }
        }) as VideoPromotion[]

        const totalPages = Math.ceil(total / limit)

        return NextResponse.json<ApiResponse<VideoPromotionsListResponse>>({
            success: true,
            data: {
                promotions,
                total,
                page,
                totalPages,
                hasMore: page < totalPages,
            },
        })
    } catch (error) {
        console.error("Error fetching promotions:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to fetch promotions" },
            { status: 500 }
        )
    }
}

// POST - Create new video promotion (as draft)
export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get(COOKIES.User)?.value

        if (!userId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body: CreateVideoPromotionRequest = await request.json()
        const { videoId } = body

        // Validate required fields
        if (!videoId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Video ID is required" },
                { status: 400 }
            )
        }

        // Check if video exists and belongs to user
        const videoDoc = await db.collection("videos").doc(videoId).get()
        if (!videoDoc.exists) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Video not found" },
                { status: 404 }
            )
        }

        const videoData = videoDoc.data()
        if (videoData?.userId !== userId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "You can only promote your own videos" },
                { status: 403 }
            )
        }

        // Check if video already has a promotion (no duplicates allowed)
        const existingPromotion = await db.collection("videoPromotions")
            .where("videoId", "==", videoId)
            .limit(1)
            .get()

        if (!existingPromotion.empty) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "This video already has a promotion. You can republish the existing one instead." },
                { status: 400 }
            )
        }

        // Create the promotion as draft
        const promotionRef = db.collection("videoPromotions").doc()
        const timestamp = serverTimestamp()
        const promotionData: Record<string, unknown> = {
            userId,
            videoId,
            videoTitle: videoData?.title || videoData?.caption || "Untitled Video",
            videoThumbnail: videoData?.thumbnail || "",
            amountAllocated: 0,
            viewsGenerated: 0,
            isPublished: false,
            isDepleted: false,
            createdAt: timestamp,
            updatedAt: timestamp,
        }

        await promotionRef.set(promotionData)

        // Return the created promotion with ISO timestamp strings
        const now = new Date().toISOString()
        const responseData: VideoPromotion = {
            id: promotionRef.id,
            userId,
            videoId,
            videoTitle: videoData?.title || videoData?.caption || "Untitled Video",
            videoThumbnail: videoData?.thumbnail || "",
            amountAllocated: 0,
            viewsGenerated: 0,
            isPublished: false,
            isDepleted: false,
            createdAt: now,
            updatedAt: now,
        }

        return NextResponse.json<ApiResponse<VideoPromotion>>({
            success: true,
            data: responseData,
        })
    } catch (error) {
        console.error("Error creating promotion:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to create promotion" },
            { status: 500 }
        )
    }
}
