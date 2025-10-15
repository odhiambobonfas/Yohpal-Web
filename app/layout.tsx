import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

import { DEBUG_BUILD } from "@/constants"
import { logger } from "@/lib/logger"
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
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    logger.info(`BUILD: ${DEBUG_BUILD ? "DEV" : "PROD"}`)
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className="scroll-smooth"
            data-scroll-behavior="smooth"
        >
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
