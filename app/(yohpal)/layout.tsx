import type { Metadata } from "next"
import "@/app/globals.css"
import { Toaster } from "sonner"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/custom/AppSidebar"
import { Separator } from "@radix-ui/react-separator"
import UserDropDown from "@/components/custom/app/UserDropDown"

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
                    <header
                        className="flex h-16 sticky top-0 z-10 bg-primary-foreground/20 backdrop-blur-xl shrink-0 items-center
                gap-2 transition-[width,height] justify-between ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
                    >
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1 size-8 text-secondary-foreground" />
                            <Separator
                                decorative
                                orientation="vertical"
                                className="data-[orientation=vertical]:h-5 text-primary"
                            />
                        </div>
                        <UserDropDown className="mr-4" />
                    </header>
                    {children}
                </SidebarInset>
            </SidebarProvider>
            <Toaster position="top-right" richColors />
        </>
    )
}
