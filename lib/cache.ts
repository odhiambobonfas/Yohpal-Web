import { CACHE_TTL } from "@/constants"
import { unstable_cache } from "next/cache"
import { logger } from "./logger"
import { redis } from "./redis"

export async function withCache<T>(fn: () => Promise<T>, key: string) {
    if (!redis) {
        logger.debug(`[REDIS]: Not configured, using Next.js cache`)
        return await withUnstableCache(fn, key)
    }

    try {
        const cached = await redis.get(key)
        if (cached) {
            logger.debug(`[CACHE HIT]: Key <${key}>`)
            return JSON.parse(cached) as T
        }
        logger.debug(`[CACHE MISS]: Key <${key}>`)

        const result = await withUnstableCache(fn, key)
        await redis.setex(key, CACHE_TTL, JSON.stringify(result))

        return result
    } catch (error) {
        logger.error(`[CACHE ERROR] ${key}:`, error)
        return await withUnstableCache(fn, key)
    }
}

async function withUnstableCache<T>(fn: () => Promise<T>, key: string) {
    return await unstable_cache(fn, [key], { revalidate: CACHE_TTL })()
}
