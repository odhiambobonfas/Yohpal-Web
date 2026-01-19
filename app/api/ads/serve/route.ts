import { NextResponse } from "next/server"
import { db } from "@/lib/firebase/firebase.admin"
import { ApiResponse } from "@/types/account"
import { Ad } from "@/types/ads"

// GET - Get ads to serve in the feed (internal use)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get("limit") || "5")

        // Get active ads with remaining budget, weighted by budget
        const adsSnapshot = await db
            .collection("ads")
            .where("status", "==", "active")
            .where("isArchived", "==", false)
            .orderBy("totalBudget", "desc") // Prioritize higher budget ads
            .limit(limit * 2) // Get more than needed to filter
            .get()

        const eligibleAds: Ad[] = []

        for (const doc of adsSnapshot.docs) {
            const adData = doc.data() as Omit<Ad, "id">
            const remainingBudget = adData.totalBudget - adData.spentAmount

            // Only include ads with remaining budget
            if (remainingBudget >= adData.costPerImpression) {
                eligibleAds.push({
                    id: doc.id,
                    ...adData,
                } as Ad)
            }
        }

        // Shuffle to add some randomness while still favoring higher budgets
        const shuffledAds = eligibleAds
            .map((ad) => ({
                ad,
                // Weight by remaining budget
                weight: Math.random() * (ad.totalBudget - ad.spentAmount),
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
