import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import React from "react"
import { LucideAlbum, LucideHome, LucideUploadCloud } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const navItems = [
  { icon: LucideHome, title: "Home", link: "/" },
  { icon: LucideUploadCloud, title: "Upload Video", link: "#" },
  { icon: LucideAlbum, title: "About Us", link: "/about" },
]

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="group/sidebar" {...props}>
      <SidebarHeader className="flex justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo_circular.png"
                  className="size-8 shrink-0"
                  width={100}
                  height={100}
                  alt="Yohpal's logo"
                />
                <span className="font-black text-2xl">Yohpal</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item, idx) => (
            <Link href={item.link} className="w-full inline-flex  items-center p-1" key={idx}>
              <SidebarMenuItem className="w-full">
                <SidebarMenuButton
                  tooltip={item.title}
                  className="hover:bg-primary/5 cursor-pointer"
                >
                  <item.icon />
                  <span className="text-lg group-data-[collapsible=icon]/sidebar:hidden">
                    {item.title}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
