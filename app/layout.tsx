import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

import { YPAuthProvider } from "@/providers/Auth"
import { ThemeProvider } from "@/providers/ThemeProvider"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: "Yohpal",
    description: `Discover Yohpal; a digital platform that connects people, businesses, and
    communities through innovative tools and services. Explore features
    designed to simplify your online experience and empower your digital
    journey. Join Yohpal today and be part of the future of digital
    connection`,
    manifest: "/manifest.json",
    themeColor: "#1E3A8A", // Tailwind blue-800, adjust to your theme
    icons: {
        icon: "/favicon.ico", // fallback favicon
        apple: "/icons/logo-circular.png", // recommended PWA apple touch
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className="scroll-smooth"
            data-scroll-behavior="smooth"
        >
            <head>
                {/* Ensures manifest + theme color is picked up in browsers */}
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#1E3A8A" />
                <link rel="apple-touch-icon" href="/icons/logo_circular.png" />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    <YPAuthProvider>
                        <div className="w-full">{children}</div>
                    </YPAuthProvider>
                </ThemeProvider>
                <Toaster position="top-right" richColors />
            </body>
        </html>
    )
}
