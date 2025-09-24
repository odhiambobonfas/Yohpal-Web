import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/providers/ThemeProvider"
import { YPAuthProvider } from "@/providers/Auth"

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
    description: "Yohpal International limited",
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
