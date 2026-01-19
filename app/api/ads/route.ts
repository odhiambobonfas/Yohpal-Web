import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIES, AD_COST_PER_IMPRESSION, AD_MIN_BUDGET } from "@/constants"
import { db, serverTimestamp } from "@/lib/firebase/firebase.admin"
import { ApiResponse } from "@/types/account"
import { Ad, AdsListResponse, CreateAdRequest } from "@/types/ads"

// GET - List user's ads
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
        const status = searchParams.get("status")

        let query = db
            .collection("ads")
            .where("userId", "==", userId)
            .where("isArchived", "==", false)
            .orderBy("createdAt", "desc")

        if (status) {
            query = query.where("status", "==", status)
        }

        // Get total count
        const countSnapshot = await query.count().get()
        const total = countSnapshot.data().count

        // Get paginated results
        const offset = (page - 1) * limit
        const adsSnapshot = await query.offset(offset).limit(limit).get()

        const ads: Ad[] = adsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Ad[]

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

// POST - Create new ad
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
        const { title, description, callToAction, destinationUrl, imageUrl, totalBudget } = body

        // Validate required fields
        if (!title || !description || !callToAction || !destinationUrl || !imageUrl || !totalBudget) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "All fields are required" },
                { status: 400 }
            )
        }

        // Validate budget
        if (totalBudget < AD_MIN_BUDGET) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: `Minimum budget is KES ${AD_MIN_BUDGET}` },
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

        // Check wallet balance
        const walletBalance = businessProfile.walletBalance || 0
        if (walletBalance < totalBudget) {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, error: "Insufficient wallet balance" },
                { status: 400 }
            )
        }

        // Create the ad
        const adRef = db.collection("ads").doc()
        const timestamp = serverTimestamp()
        const adData = {
            userId,
            businessName: businessProfile.businessName,
            imageUrl,
            title,
            description,
            callToAction,
            destinationUrl,
            totalBudget,
            spentAmount: 0,
            costPerImpression: AD_COST_PER_IMPRESSION,
            status: "active" as const,
            createdAt: timestamp,
            updatedAt: timestamp,
            isArchived: false,
        }

        // Use a batch to update both ad and wallet
        const batch = db.batch()

        // Create ad
        batch.set(adRef, adData)

        // Deduct from wallet balance
        batch.update(db.collection("users").doc(userId), {
            "businessProfile.walletBalance": walletBalance - totalBudget,
        })

        // Create transaction record
        const txRef = db.collection("adTransactions").doc()
        batch.set(txRef, {
            userId,
            adId: adRef.id,
            type: "ad_spend",
            amount: -totalBudget,
            description: `Budget allocated for ad: ${title}`,
            createdAt: serverTimestamp(),
        })

        await batch.commit()

        // Return the created ad with ISO timestamp strings
        const now = new Date().toISOString()
        return NextResponse.json<ApiResponse<Ad>>({
            success: true,
            data: {
                id: adRef.id,
                userId,
                businessName: businessProfile.businessName,
                imageUrl,
                title,
                description,
                callToAction,
                destinationUrl,
                totalBudget,
                spentAmount: 0,
                costPerImpression: AD_COST_PER_IMPRESSION,
                status: "active",
                createdAt: now,
                updatedAt: now,
                isArchived: false,
            },
        })
    } catch (error) {
        console.error("Error creating ad:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to create ad" },
            { status: 500 }
        )
    }
}
