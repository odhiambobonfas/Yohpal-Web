"use client"
import { useEffect, useState } from "react"

import { removeCookie } from "@/actions/cookies"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { COOKIES, INTERESTS, SUPPORTED_COUNTRIES } from "@/constants"
import { useEmailAuth } from "@/hooks/auth/use-email-auth"
import { useUserMutation } from "@/hooks/user/use-user-mutation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/providers/Auth"
import { LucideCheck, LucideLoader2, LucideMail } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const sanitizeUserName = (name: string | undefined): string =>
    !name || name.toLowerCase().startsWith("user") ? "" : name

const isValidUserName = (name: string | undefined): boolean => {
    const sanitized = sanitizeUserName(name)
    return sanitized.length > 0
}

export default function Page() {
    const router = useRouter()
    const [selected, setSelected] = useState<string[]>([])
    const { profile, user } = useAuth()
    const [email, setEmail] = useState("")
    const [userName, setUserName] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [country, setCountry] = useState("")
    const [refererCode, setRefererCode] = useState("")
    const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([])
    const { verifyEmail, loading: verificationEmailLoading } = useEmailAuth()
    const {
        completeOnboarding,
        loading: onboardingLoading,
        error: onboardingError,
    } = useUserMutation()

    const hasValidExistingUsername = isValidUserName(profile?.userName)

    useEffect(() => {
        if (profile) {
            setEmail((prev) => prev || profile.email)
            setUserName((prev) => prev || sanitizeUserName(profile.userName))
            setFirstName((prev) => prev || profile.firstName)
            setLastName((prev) => prev || profile.lastName)
            setSelected((prev) => (prev.length ? prev : (profile?.contentPreferences ?? [])))
            setCountry((prev) => prev || profile.Country)
            setRefererCode((prev) => prev || profile.refererCode)
        }
    }, [profile])

    useEffect(() => {
        if (email && !hasValidExistingUsername) {
            const emailPrefix = email.split("@")[0]
            const suggestions = generateUsernameSuggestions(emailPrefix)
            setUsernameSuggestions(suggestions)
        } else {
            setUsernameSuggestions([])
        }
    }, [email, hasValidExistingUsername])

    const generateUsernameSuggestions = (emailPrefix: string): string[] => {
        const base = emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, "")
        const suggestions = [
            base,
            base.replace(/\./g, "_"),
            base.slice(0, 1) + (base.split(/[._]/).pop()?.slice(0, 4) || ""),
            base + Math.floor(Math.random() * 100),
        ]
        return [...new Set(suggestions)].slice(0, 4)
    }

    const toggleInterest = (interest: string) => {
        setSelected((prev) =>
            prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
        )
    }

    const handleUsernameSuggestionClick = (suggestion: string) => {
        setUserName(suggestion)
    }

    const handleVerifyEmail = async () => {
        await verifyEmail()
        toast.info("Verification email sent! Please check your inbox.")
    }

    const handleCompleteOnboarding = async () => {
        const safeUserName = sanitizeUserName(userName)
        if (!safeUserName) {
            toast.error("Please enter a valid username")
            return
        }

        await completeOnboarding({
            firstName,
            lastName,
            country,
            refererCode,
            userName: safeUserName,
            preferences: selected,
        })

        if (onboardingError) toast.error(onboardingError)
        toast.success("Welcome aboard")
        await removeCookie(COOKIES.EmailNotVerified)
        router.push("/")
    }

    const isFormValid =
        isValidUserName(userName) && firstName.trim() && lastName.trim() && selected?.length >= 3

    return (
        <div className="min-h-screen flex flex-col md:flex-row justify-center overflow-y-auto">
            <div className="flex flex-col w-full md:max-w-md justify-center border-b md:border-b-0 md:border-r md:w-1/2 p-4">
                <CardHeader>
                    <CardTitle>Set Up Your Profile</CardTitle>
                    <CardDescription>Enter your details below to continue</CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username" className="text-muted-foreground">
                                Username
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="your_username"
                                disabled={hasValidExistingUsername}
                                required
                            />
                            {usernameSuggestions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    <span className="text-xs text-muted-foreground mb-1 w-full">
                                        Suggested usernames:
                                    </span>
                                    {usernameSuggestions.map((suggestion, index) => (
                                        <Badge
                                            key={index}
                                            variant="outline"
                                            className="rounded-full cursor-pointer text-xs px-2 py-1 border-primary/40 hover:bg-primary hover:text-white transition-colors"
                                            onClick={() =>
                                                handleUsernameSuggestionClick(suggestion)
                                            }
                                        >
                                            {suggestion}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                            {!isValidUserName(userName) && userName && (
                                <span className="text-xs text-red-500">
                                    Please enter a valid username
                                </span>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="firstName" className="text-muted-foreground">
                                First Name
                            </Label>
                            <Input
                                id="firstName"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="John"
                                required
                                disabled={!!profile?.firstName}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="lastName" className="text-muted-foreground">
                                Last Name
                            </Label>
                            <Input
                                id="lastName"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Doe"
                                required
                                disabled={!!profile?.lastName}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-muted-foreground">
                                Confirm Email
                            </Label>
                            <div className="relative group">
                                <Input
                                    id="email"
                                    type="email"
                                    defaultValue={profile?.email}
                                    disabled
                                    placeholder="m@example.com"
                                    required
                                    className={cn(
                                        "pr-10",
                                        !user?.emailVerified && "border-green-500 bg-green-50",
                                    )}
                                />
                                {user?.emailVerified && (
                                    <LucideCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                                )}
                                {!user?.emailVerified && (
                                    <LucideMail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                )}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="country" className="text-muted-foreground">
                                Country
                            </Label>
                            <Select required onValueChange={(c) => setCountry(c)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Countries</SelectLabel>
                                        {SUPPORTED_COUNTRIES.map((country, idx) => (
                                            <SelectItem value={country} key={idx}>
                                                {country}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="refererCode" className="text-muted-foreground">
                                Refferer Code
                            </Label>
                            <Input
                                id="referrerCode"
                                type="text"
                                value={refererCode}
                                onChange={(e) => setRefererCode(e.target.value)}
                                placeholder="referer Code (optional)"
                                disabled={!!profile?.refererCode}
                            />
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex items-center justify-center">
                    {!user?.emailVerified && (
                        <Button
                            variant="outline"
                            className="mt-4 w-full border-primary/50"
                            onClick={handleVerifyEmail}
                            disabled={verificationEmailLoading}
                            type="button"
                        >
                            {verificationEmailLoading && <LucideLoader2 className="animate-spin" />}
                            {!verificationEmailLoading && <LucideMail className="mr-2 h-4 w-4" />}
                            Verify Email
                        </Button>
                    )}
                </CardFooter>
            </div>

            <div className="flex flex-col bg-background justify-center p-4 w-full md:w-1/2">
                <h1 className="text-xl font-bold mb-2">Personalize Your Feed</h1>
                <h4 className="text-sm text-gray-600 mb-4">
                    Select at least 3 topics so we can recommend the best content for you
                </h4>

                <div className="flex flex-wrap gap-2 overflow-y-auto">
                    {INTERESTS.map((interest) => (
                        <Badge
                            key={interest}
                            onClick={() => toggleInterest(interest)}
                            className={cn(
                                "cursor-pointer px-4 py-2 rounded-full text-sm",
                                selected?.includes(interest)
                                    ? "bg-primary text-white"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-500",
                            )}
                        >
                            {interest}
                        </Badge>
                    ))}
                </div>

                <div className="sticky bottom-0 left-0 right-0 bg-background py-2 mt-10 flex flex-row gap-2">
                    <Button
                        className="flex-1"
                        disabled={!isFormValid || onboardingLoading}
                        onClick={handleCompleteOnboarding}
                    >
                        {onboardingLoading && <LucideLoader2 className="animate-spin mr-2" />}
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    )
}
