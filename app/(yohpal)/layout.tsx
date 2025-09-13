import type { Metadata } from "next"
import "@/app/globals.css"
import { Toaster } from "sonner"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/custom/AppSidebar"

export const metadata: Metadata = {
    title: "Yohpal",
    description: "Yohpal International limited",
}

export default function AppLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <main className="w-full">{children}</main>
                </SidebarInset>
            </SidebarProvider>
            <Toaster position="top-right" richColors />
        </>
    )
}
