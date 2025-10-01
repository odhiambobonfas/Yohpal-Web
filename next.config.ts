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
                protocol: "https",
                hostname: "cdn.stream.yohpal.com",
                pathname: "/**",
            },
            // whitelist exact paths to store badges images
            {
                protocol: "https",
                hostname: "tools.applemediaservices.com",
                pathname: "/api/badges/download-on-the-app-store/black/en-us",
            },
            {
                protocol: "https",
                hostname: "play.google.com",
                pathname: "/intl/en_us/badges/static/images/badges/en_badge_web_generic.png",
            },
        ],
        qualities: [20, 25, 50, 75],
    },
}

export default nextConfig
