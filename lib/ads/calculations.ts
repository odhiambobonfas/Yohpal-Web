import { AD_COST_PER_VIEW, AD_VIEW_DURATION_SECONDS } from "@/constants"

export interface ViewCalculation {
    views: number
    totalSeconds: number
    minutes: number
    formattedTime: string
}

/**
 * Calculate the number of views and display time from a given amount
 * @param amount - Amount in KES
 * @returns Object with views, total seconds, minutes, and formatted time string
 */
export function calculateViewsFromAmount(amount: number): ViewCalculation {
    if (amount <= 0) {
        return {
            views: 0,
            totalSeconds: 0,
            minutes: 0,
            formattedTime: "0 seconds",
        }
    }

    const views = Math.floor(amount / AD_COST_PER_VIEW)
    const totalSeconds = views * AD_VIEW_DURATION_SECONDS
    const minutes = totalSeconds / 60

    return {
        views,
        totalSeconds,
        minutes,
        formattedTime: formatAdTime(totalSeconds),
    }
}

/**
 * Calculate remaining budget from amount allocated and views generated
 * @param amountAllocated - Total amount allocated to the ad
 * @param viewsGenerated - Number of views already generated
 * @returns Remaining budget in KES
 */
export function getRemainingBudget(amountAllocated: number, viewsGenerated: number): number {
    const spent = viewsGenerated * AD_COST_PER_VIEW
    return Math.max(0, amountAllocated - spent)
}

/**
 * Check if an ad is depleted based on amount allocated and views generated
 * @param amountAllocated - Total amount allocated to the ad
 * @param viewsGenerated - Number of views already generated
 * @returns true if the ad has exhausted its budget
 */
export function isAdDepleted(amountAllocated: number, viewsGenerated: number): boolean {
    const remainingBudget = getRemainingBudget(amountAllocated, viewsGenerated)
    return remainingBudget < AD_COST_PER_VIEW
}

/**
 * Format total seconds into a human-readable string
 * @param totalSeconds - Total seconds
 * @returns Formatted time string (e.g., "25 minutes", "1 hour 30 minutes")
 */
export function formatAdTime(totalSeconds: number): string {
    if (totalSeconds <= 0) {
        return "0 seconds"
    }

    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const parts: string[] = []

    if (hours > 0) {
        parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`)
    }

    if (minutes > 0) {
        parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`)
    }

    if (seconds > 0 && hours === 0) {
        parts.push(`${seconds} ${seconds === 1 ? "second" : "seconds"}`)
    }

    return parts.join(" ") || "0 seconds"
}

/**
 * Calculate spent amount from views generated
 * @param viewsGenerated - Number of views generated
 * @returns Amount spent in KES
 */
export function calculateSpentAmount(viewsGenerated: number): number {
    return viewsGenerated * AD_COST_PER_VIEW
}

/**
 * Calculate total time delivered in seconds from views generated
 * @param viewsGenerated - Number of views generated
 * @returns Total time in seconds
 */
export function calculateTimeDelivered(viewsGenerated: number): number {
    return viewsGenerated * AD_VIEW_DURATION_SECONDS
}
