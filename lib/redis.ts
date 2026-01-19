import { DEBUG_BUILD } from "@/constants"
import Redis from "ioredis"

let redis: Redis | null = null

if (process.env.REDIS_URL && process.env.REDIS_PORT) {
    if (!DEBUG_BUILD && (!process.env.REDIS_USERNAME || !process.env.REDIS_PASSWORD)) {
        console.warn("[REDIS]: Missing username/password in production mode")
    }

    redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        port: Number(process.env.REDIS_PORT),
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
    })
} else {
    console.warn("[REDIS]: Missing configuration, caching disabled")
}

export { redis }
