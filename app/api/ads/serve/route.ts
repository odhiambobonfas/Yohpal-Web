import { NextResponse } from "next/server"
import { db } from "@/lib/firebase/firebase.admin"
import { ApiResponse } from "@/types/account"
import { Ad } from "@/types/ads"
import { getRemainingBudget } from "@/lib/ads/calculations"
import { AD_COST_PER_VIEW } from "@/constants"

// GET - Get ads to serve in the feed (internal use)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get("limit") || "5")

        // Get published, non-depleted ads
        const adsSnapshot = await db
            .collection("ads")
            .where("isPublished", "==", true)
            .where("isDepleted", "==", false)
            .orderBy("amountAllocated", "desc") // Prioritize higher budget ads
            .limit(limit * 2) // Get more than needed to filter
            .get()

        const eligibleAds: Ad[] = []

        for (const doc of adsSnapshot.docs) {
            const adData = doc.data()
            const remainingBudget = getRemainingBudget(adData.amountAllocated, adData.viewsGenerated)

            // Only include ads with remaining budget for at least one more view
            if (remainingBudget >= AD_COST_PER_VIEW) {
                // Convert Firestore timestamps to ISO strings
                const createdAt = adData.createdAt && typeof adData.createdAt === "object" && "toDate" in adData.createdAt
                    ? adData.createdAt.toDate().toISOString()
                    : adData.createdAt
                const updatedAt = adData.updatedAt && typeof adData.updatedAt === "object" && "toDate" in adData.updatedAt
                    ? adData.updatedAt.toDate().toISOString()
                    : adData.updatedAt

                eligibleAds.push({
                    id: doc.id,
                    ...adData,
                    createdAt,
                    updatedAt,
                } as Ad)
            }
        }

        // Shuffle to add some randomness while still favoring higher budgets
        const shuffledAds = eligibleAds
            .map((ad) => ({
                ad,
                // Weight by remaining budget
                weight: Math.random() * getRemainingBudget(ad.amountAllocated, ad.viewsGenerated),
            }))
            .sort((a, b) => b.weight - a.weight)
            .slice(0, limit)
            .map(({ ad }) => ad)

        return NextResponse.json<ApiResponse<Ad[]>>({
            success: true,
            data: shuffledAds,
        })
    } catch (error) {
        console.error("Error serving ads:", error)
        return NextResponse.json<ApiResponse<null>>(
            { success: false, error: "Failed to serve ads" },
            { status: 500 }
        )
    }
}
