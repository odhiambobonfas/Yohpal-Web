import type { Metadata } from "next"
import "@/app/globals.css"
import { Toaster } from "sonner"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/custom/AppSidebar"
import { Separator } from "@/components/ui/separator"

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
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            </div>
          </header>
          <main className="p-2 w-full">{children}</main>
        </SidebarInset>
      </SidebarProvider>
      <Toaster position="top-right" richColors />
    </>
  )
}
