"use client"
import { CircleUser, LogOut, LucideLaptopMinimal, LucideMoon, LucideSun, User } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEmailAuth } from "@/hooks/auth/use-email-auth"
import { useAuth } from "@/providers/Auth"

export default function UserDropDown({ className }: { className: string | undefined }) {
    const { isAuthenticated, user, profile, loading } = useAuth()
    const { logOut } = useEmailAuth()
    const router = useRouter()

    const { setTheme } = useTheme()

    const handleLogout = async () => {
        await logOut()
        router.push("/")
    }

    if (loading) {
        return (
            <Button variant="ghost" size="icon" disabled className={className}>
                <CircleUser className="size-8 animate-pulse" />
            </Button>
        )
    }

    if (!isAuthenticated) {
        return (
            <Button variant="ghost" size="icon" asChild className={className}>
                <Link href="/auth/login">
                    <CircleUser className="size-8" />
                    <span className="sr-only">Login</span>
                </Link>
            </Button>
        )
    }

    const userInitials =
        profile?.userName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild className={className}>
                <Button variant="ghost" className="relative size-8 rounded-full">
                    <Avatar className="rounded-xl">
                        <AvatarImage
                            loading="lazy"
                            width={100}
                            height={100}
                            src={profile?.profile_picture || "/logo_circular.png"}
                            alt={profile?.userName || "User profile image"}
                        />
                        <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-56" align="end" forceMount avoidCollisions>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <span className="text-sm font-medium leading-none">
                            {profile?.userName || profile?.email.split("@")[0]}
                        </span>
                        <span className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                        </span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 size-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <LucideLaptopMinimal className="size-4 mr-3 text-muted-foreground" />
                        <span>Theme</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => setTheme("light")}>
                                <LucideSun /> <span>Light</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")}>
                                <LucideMoon /> <span>Dark</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("system")}>
                                <LucideLaptopMinimal /> <span>System</span>
                            </DropdownMenuItem>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-500 hover:text-red-500"
                >
                    <LogOut className="size-4 mr-2" />
                    Log Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
