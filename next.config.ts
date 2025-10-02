import type { NextConfig } from "next"
import pwa from "next-pwa"

    //   default-src 'self';

const securityHeaders = [
    {
        key: "Content-Security-Policy",
        value: `
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;
      style-src 'self' 'unsafe-inline' https:;
      img-src 'self' data: https: blob:;
      font-src 'self' https:;
      connect-src 'self' https: wss:;
      manifest-src 'self';
      worker-src 'self' blob:;
      frame-ancestors 'none';
      object-src 'none';
      base-uri 'self';
    `
            .replace(/\s{2,}/g, " ")
            .trim(),
    },
    {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
    },
    {
        key: "X-Frame-Options",
        value: "DENY",
    },
    {
        key: "X-Content-Type-Options",
        value: "nosniff",
    },
    {
        key: "X-DNS-Prefetch-Control",
        value: "on",
    },
    {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
    },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=()",
    },
]

const withPWA = pwa({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
})

const nextConfig = {
    reactStrictMode: true,
    async headers() {
        return [
            {
                // Apply to all routes, including service worker and PWA assets
                source: "/(.*)",
                headers: securityHeaders,
            },
        ]
    },
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
} satisfies NextConfig

export default withPWA(nextConfig)
