import { db } from "@/lib/firebase/firebase.admin"
import { Ad } from "@/types/ads"
import { AD_FREQUENCY_BASE } from "@/constants"

export interface AdForFeed extends Ad {
    isAd: true
}

/**
 * Select ads for the feed based on remaining budget
 * @param count Number of ads to select
 * @returns Array of ads to show in the feed
 */
export async function selectAdsForFeed(count: number = 1): Promise<AdForFeed[]> {
    try {
        // Get active ads with remaining budget
        const adsSnapshot = await db
            .collection("ads")
            .where("status", "==", "active")
            .where("isArchived", "==", false)
            .orderBy("totalBudget", "desc")
            .limit(count * 3) // Get extra to filter
            .get()

        const eligibleAds: AdForFeed[] = []

        for (const doc of adsSnapshot.docs) {
            const adData = doc.data() as Omit<Ad, "id">
            const remainingBudget = adData.totalBudget - adData.spentAmount

            // Only include ads with remaining budget for at least one impression
            if (remainingBudget >= adData.costPerImpression) {
                eligibleAds.push({
                    id: doc.id,
                    ...adData,
                    isAd: true,
                } as AdForFeed)
            }
        }

        if (eligibleAds.length === 0) {
            return []
        }

        // Weighted random selection based on remaining budget
        const selectedAds: AdForFeed[] = []
        const adsCopy = [...eligibleAds]

        while (selectedAds.length < count && adsCopy.length > 0) {
            // Calculate total weight (remaining budget)
            const totalWeight = adsCopy.reduce(
                (sum, ad) => sum + (ad.totalBudget - ad.spentAmount),
                0
            )

            // Random selection weighted by budget
            let random = Math.random() * totalWeight
            let selectedIndex = 0

            for (let i = 0; i < adsCopy.length; i++) {
                random -= adsCopy[i].totalBudget - adsCopy[i].spentAmount
                if (random <= 0) {
                    selectedIndex = i
                    break
                }
            }

            selectedAds.push(adsCopy[selectedIndex])
            adsCopy.splice(selectedIndex, 1)
        }

        return selectedAds
    } catch (error) {
        console.error("Error selecting ads for feed:", error)
        return []
    }
}

/**
 * Calculate how many ads to show in a feed of given size
 * @param feedSize Total number of items in the feed
 * @returns Number of ads to insert
 */
export function calculateAdCount(feedSize: number): number {
    return Math.floor(feedSize / AD_FREQUENCY_BASE)
}

/**
 * Get the positions where ads should be inserted in the feed
 * @param feedSize Total number of items in the feed
 * @param adCount Number of ads to insert
 * @returns Array of positions for ads
 */
export function getAdPositions(feedSize: number, adCount: number): number[] {
    const positions: number[] = []

    for (let i = 0; i < adCount; i++) {
        // Insert at every AD_FREQUENCY_BASE position
        const position = (i + 1) * AD_FREQUENCY_BASE - 1
        if (position < feedSize + i) {
            positions.push(position)
        }
    }

    return positions
}
