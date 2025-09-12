import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import React from "react"
import AppNavHeader from "./AppNavHeader"
import { LucideHome, LucideUploadCloud } from "lucide-react"

const navItems = [
  { icon: LucideHome, title: "Home", link: "/" },
  { icon: LucideUploadCloud, title: "Upload Video", link: "#" },
]

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppNavHeader />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item, idx) => (
            <SidebarMenuItem className="inline-flex" key={idx}>
              <SidebarMenuButton tooltip={item.title}>
                <item.icon className="size-20" />
                <span className="p-2 group-data-[collapsible=icon]/sidebar:hidden">
                  {item.title}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <h1>User</h1>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
