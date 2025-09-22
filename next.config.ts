import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "firebasestorage.googleapis.com",
                pathname: "/v0/b/yohlab.firebasestorage.app/o/**",
            },
            {
                protocol: "http",
                hostname: "cdn.stream.yohpal.com",
                pathname: "/**",
            },
        ],
        qualities: [20, 25, 50, 75],
    },
}

export default nextConfig
