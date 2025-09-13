import type { Metadata } from "next"
import "@/app/globals.css"
import NavHeader from "@/components/custom/orgarnization/NavHeader"

export const metadata: Metadata = {
  title: "Yohpal International",
  description: `YohPal is a next-generation digital ecosystem combining
  social media, services, e-commerce, messaging, and digital finance.
  Whether you're a creator, hustler, shopper, or entrepreneur — YohPal is your
  all-in-one platform to grow, connect, and thrive.`,
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
