import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES, AD_DESCRIPTION_MAX_LENGTH } from "@/constants"
import { db, serverTimestamp } from "@/lib/firebase/firebase.admin"
import { ApiResponse } from "@/types/account"
import { Ad, AdsListResponse, CreateAdRequest, AdFilterType } from "@/types/ads"

// GET - List user's ads
export async function GET(request: Request) {
    try {
        const cookieStore = await cookies()
        const userId = cookieStore.get(COOKIES.User)?.value

        console.log("Fetching ads for userId:", userId)

        if (!userId) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")
        const filter = (searchParams.get("filter") || "all") as AdFilterType

        console.log("Filter:", filter, "Page:", page, "Limit:", limit)

        // Build query - where clauses must come before orderBy
        let queryRef = db.collection("ads").where("userId", "==", userId)

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
            console.error("Error counting ads (index may be needed):", countError)
            // Fall back to getting all docs and counting
        }

        // Get paginated results
        const offset = (page - 1) * limit
        const adsSnapshot = await query.offset(offset).limit(limit).get()

        console.log("Found", adsSnapshot.docs.length, "ads, total:", total)

        const ads: Ad[] = adsSnapshot.docs.map((doc) => {
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
        }) as Ad[]

        const totalPages = Math.ceil(total / limit)

        return NextResponse.json<ApiResponse<AdsListResponse>>({
            success: true,
            data: {
                ads,
                total,
                page,
                totalPages,
                hasMore: page < totalPages,
            },
        })
    } catch (error) {
        console.error("Error fetching ads:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to fetch ads" },
            { status: 500 }
        )
    }
}

// POST - Create new ad (as draft)
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

        const body: CreateAdRequest = await request.json()
        const { imageUrl, description } = body

        // Validate required fields
        if (!imageUrl) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Image is required" },
                { status: 400 }
            )
        }

        // Validate description length if provided
        if (description && description.length > AD_DESCRIPTION_MAX_LENGTH) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: `Description must be ${AD_DESCRIPTION_MAX_LENGTH} characters or less` },
                { status: 400 }
            )
        }

        // Check user's business profile
        const userDoc = await db.collection("users").doc(userId).get()
        if (!userDoc.exists) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "User not found" },
                { status: 404 }
            )
        }

        const userData = userDoc.data()
        const businessProfile = userData?.businessProfile

        if (!businessProfile || businessProfile.verificationStatus !== "verified") {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Business profile not verified" },
                { status: 403 }
            )
        }

        // Create the ad as draft - NO balance check needed
        const adRef = db.collection("ads").doc()
        const timestamp = serverTimestamp()
        const adData: Record<string, unknown> = {
            userId,
            imageUrl,
            amountAllocated: 0,
            viewsGenerated: 0,
            isPublished: false,
            isDepleted: false,
            createdAt: timestamp,
            updatedAt: timestamp,
        }

        // Only add optional fields if they have values
        if (businessProfile.id) {
            adData.businessId = businessProfile.id
        }
        if (description) {
            adData.description = description
        }

        await adRef.set(adData)

        // Return the created ad with ISO timestamp strings
        const now = new Date().toISOString()
        const responseData: Ad = {
            id: adRef.id,
            userId,
            imageUrl,
            amountAllocated: 0,
            viewsGenerated: 0,
            isPublished: false,
            isDepleted: false,
            createdAt: now,
            updatedAt: now,
        }

        if (businessProfile.id) {
            responseData.businessId = businessProfile.id
        }
        if (description) {
            responseData.description = description
        }

        return NextResponse.json<ApiResponse<Ad>>({
            success: true,
            data: responseData,
        })
    } catch (error) {
        console.error("Error creating ad:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to create ad" },
            { status: 500 }
        )
    }
}
