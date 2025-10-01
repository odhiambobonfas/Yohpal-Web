import type { NextConfig } from "next"
import pwa from "next-pwa"

const withPWA = pwa({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
})

const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "firebasestorage.googleapis.com",
                pathname: "/v0/b/yohlab.firebasestorage.app/o/**",
            },
            {
                protocol: "https",
                hostname: "cdn.stream.yohpal.com",
                pathname: "/**",
            },
        ],
        qualities: [20, 25, 50, 75],
    },
} satisfies NextConfig

export default withPWA(nextConfig)
