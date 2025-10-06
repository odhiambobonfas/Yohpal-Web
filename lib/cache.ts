import { CACHE_TTL } from "@/constants"
import Redis from "ioredis"
import { unstable_cache } from "next/cache"

if (!process.env.REDIS_URL || !process.env.REDIS_PORT) {
    throw new Error("Missing redis configuration")
}

if (
    process.env.NODE_ENV === "production" &&
    (!process.env.REDIS_USERNAME || !process.env.REDIS_PASSWORD)
) {
    throw new Error("Missing redis username and password config")
}

const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
})

export async function withCache<T>(fn: () => Promise<T>, key: string) {
    const start = Date.now()

    if (!redis) {
        console.error(`[REDIS ERR]: Redis not initialized, falling back to next cache`)
        console.debug(`[Cache] ${key} - ${Date.now() - start}ms`)
        return await withUnstableCache(fn, key)
    }

    try {
        const cached = await redis.get(key)
        if (cached) {
            console.debug(`[Cache HIT] ${key} - ${Date.now() - start}ms`)
            return JSON.parse(cached) as T
        }

        console.debug(`[Cache MISS] Falling back to unstable_cache for ${key}`)
        const result = await withUnstableCache(fn, key)
        await redis.setex(key, CACHE_TTL, JSON.stringify(result))

        console.debug(`[Cache MISS] ${key} - ${Date.now() - start}ms`)
        return result
    } catch (error) {
        console.error(`[Cache ERROR] ${key}:`, error)
        console.debug(`[Cache] Falling back to unstable_cache for ${key}`)
        console.debug(`[Cache] ${key} - ${Date.now() - start}ms`)
        return await withUnstableCache(fn, key)
    }
}

async function withUnstableCache<T>(fn: () => Promise<T>, key: string) {
    return await unstable_cache(fn, [key], { revalidate: CACHE_TTL })()
}
