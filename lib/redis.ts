import { DEBUG_BUILD } from "@/constants"
import Redis from "ioredis"

if (!process.env.REDIS_URL || !process.env.REDIS_PORT) {
    throw new Error("Missing redis configuration")
}

if (!DEBUG_BUILD && (!process.env.REDIS_USERNAME || !process.env.REDIS_PASSWORD)) {
    throw new Error("Missing redis username and password config")
}

const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
})

export { redis }
