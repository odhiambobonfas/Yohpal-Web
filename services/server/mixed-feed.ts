import { VideoWithStats } from "@/types/videos"

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
