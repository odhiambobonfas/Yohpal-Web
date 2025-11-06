"use client"
import {
    LucideAlbum,
    LucideBriefcase,
    LucideCompass,
    LucideGlobeLock,
    LucideHome,
    LucideScrollText,
    LucideUserCheck,
    LucideWallet,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

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

const navItems = [
    { icon: LucideHome, title: "Suggested", link: "/" },
    { icon: LucideCompass, title: "Explore", link: "//" },
    {
        icon: LucideUserCheck,
        title: "following",
        link: "/following",
        prefetch: true,
    },
    {
        icon: LucideAlbum,
        title: "About Us",
        position: "bottom",
        link: "/about",
        prefetch: true,
    },
    {
        icon: LucideGlobeLock,
        title: "Privacy Policy",
        position: "bottom",
        link: "/privacy",
        prefetch: true,
    },
    {
        icon: LucideScrollText,
        title: "Terms & Conditions",
        position: "bottom",
        link: "/terms",
        prefetch: true,
    },
    {
        icon: LucideBriefcase,
        title: "Yohpal Hustle",
        target: "_blank",
        link: "https://hustle.yohpal.com",
    },
    {
        icon: LucideWallet,
        title: "Account Manager",
        target: "_blank",
        link: "https://accountmanager.yohpal.com",
    },
]

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

    const isActive = (itemLink: string) => {
        if (itemLink === "/") {
            console.log("active")
            return pathname === "/"
        }
        return pathname.startsWith(itemLink)
    }

    return (
        <Sidebar collapsible="icon" className="group/sidebar" {...props}>
            <SidebarHeader className="flex justify-center">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar">
                            <Link href="/" className="flex items-center gap-2">
                                <Image
                                    priority={true}
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
                    {navItems.map((item, idx) =>
                        item.position !== "bottom" ? (
                            <Link
                                href={item.link}
                                target={item.target}
                                className="w-full inline-flex items-center p-1"
                                prefetch={item.prefetch || false}
                                key={idx}
                            >
                                <SidebarMenuItem className="w-full">
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        isActive={isActive(item.link)}
                                        className="hover:bg-primary/5 cursor-pointer"
                                    >
                                        <item.icon />
                                        <span className="text-lg group-data-[collapsible=icon]/sidebar:hidden">
                                            {item.title}
                                        </span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </Link>
                        ) : null,
                    )}
                </SidebarMenu>
            </SidebarContent>
            <SidebarRail />
            <SidebarFooter>
                <SidebarMenu>
                    {navItems.map((item, idx) =>
                        item.position === "bottom" ? (
                            <Link
                                href={item.link}
                                className="w-full inline-flex items-center p-1"
                                prefetch={item.prefetch || false}
                                key={idx}
                            >
                                <SidebarMenuItem className="w-full">
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        isActive={isActive(item.link)}
                                        className="hover:bg-primary/5 cursor-pointer"
                                    >
                                        <item.icon />
                                        <span className="text-lg group-data-[collapsible=icon]/sidebar:hidden">
                                            {item.title}
                                        </span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </Link>
                        ) : null,
                    )}
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
