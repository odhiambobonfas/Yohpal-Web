import { VideoWithStats } from "@/types/videos"
import { Ad } from "@/types/ads"
import { AD_FREQUENCY_BASE } from "@/constants"

// Type for feed items that can be videos or ads
export type FeedItem = VideoWithStats | (Ad & { isAd: true })

export function videoMix(
    base: VideoWithStats[],
    promoted: VideoWithStats[] | undefined,
    bias: number,
    biasOffset: number = 0,
) {
    if (!promoted || promoted.length === 0) return base

    const baseWithoutPromoted = base.filter((v) => !v.promoted)
    const uniquePromoted = promoted.filter((p) => !base.some((v) => v.id === p.id))

    if (uniquePromoted.length === 0 || bias <= 0) return baseWithoutPromoted

    const mixed: VideoWithStats[] = []
    let promotedIndex = 0
    let baseIndex = 0

    while (baseIndex < baseWithoutPromoted.length || promotedIndex < uniquePromoted.length) {
        const currentOverallPosition = biasOffset + mixed.length
        const nextOverallPosition = currentOverallPosition + 1

        if (nextOverallPosition % bias === 0 && promotedIndex < uniquePromoted.length) {
            mixed.push(uniquePromoted[promotedIndex])
            promotedIndex++
        } else if (baseIndex < baseWithoutPromoted.length) {
            mixed.push(baseWithoutPromoted[baseIndex])
            baseIndex++
        } else {
            mixed.push(uniquePromoted[promotedIndex])
            promotedIndex++
        }
    }

    return mixed
}

/**
 * Mix ads into the feed at regular intervals
 * @param videos Array of videos
 * @param ads Array of ads to insert
 * @param frequency Insert ad every N videos (default: AD_FREQUENCY_BASE)
 * @param offset Starting offset for frequency calculation
 * @returns Mixed feed with videos and ads
 */
export function mixAdsIntoFeed(
    videos: VideoWithStats[],
    ads: (Ad & { isAd: true })[],
    frequency: number = AD_FREQUENCY_BASE,
    offset: number = 0,
): FeedItem[] {
    if (!ads || ads.length === 0) return videos

    const mixed: FeedItem[] = []
    let adIndex = 0
    let videoIndex = 0

    while (videoIndex < videos.length) {
        const currentPosition = offset + mixed.length
        const nextPosition = currentPosition + 1

        // Insert ad at every frequency position
        if (nextPosition % frequency === 0 && adIndex < ads.length) {
            mixed.push(ads[adIndex])
            adIndex++
        }

        // Always add the next video
        if (videoIndex < videos.length) {
            mixed.push(videos[videoIndex])
            videoIndex++
        }
    }

    return mixed
}

/**
 * Check if a feed item is an ad
 * @param item Feed item to check
 * @returns True if the item is an ad
 */
export function isAdItem(item: FeedItem): item is Ad & { isAd: true } {
    return "isAd" in item && item.isAd === true
}
