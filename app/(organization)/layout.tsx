import type { Metadata } from "next"

import "@/app/globals.css"
import NavHeader from "@/components/custom/orgarnization/NavHeader"

export const metadata: Metadata = {
    title: "Yohpal International",
    description: `Yohpal is a forward-thinking digital enterprise dedicated to innovation,
    inclusivity, and impact. Our mission is to empower individuals and
    organizations with tools that drive growth and meaningful engagement.
    Learn more about our vision, values, and the team behind Yohpal.`,
}

export default function OrganizationLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <main className="w-full">
            <NavHeader />
            {children}
        </main>
    )
}
