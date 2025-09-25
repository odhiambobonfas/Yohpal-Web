"use client"
import { useEffect, useState } from "react"

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
import { cn } from "@/lib/utils"
import { useAuth } from "@/providers/Auth"

const interests = [
    "Kids",
    "Politics & News",
    "Sports & Talents",
    "Agribusiness & Env",
    "Education (Basic)",
    "Education (Advanced / Tertiary)",
    "Food & Culinary",
    "Technology & Innovation",
    "Health & Fitness",
    "Travel & Lifestyle",
    "Finance & Business",
    "Entertainment & Pop Culture",
    "Gaming & Esports",
    "Motivation & Self-Help",
    "Religion & Spirituality",
]

export default function Page() {
    const [selected, setSelected] = useState<string[]>([])
    const { profile } = useAuth()
    const [email, setEmail] = useState("")
    const [userName, setUserName] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")

    useEffect(() => {
        if (profile) {
            setEmail(profile.email)
            setUserName(profile.userName)
            setFirstName(profile.firstName)
            setLastName(profile.lastName)
        }
    }, [profile])

    const toggleInterest = (interest: string) => {
        setSelected((prev) =>
            prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
    }

    return (
        <>
            <div className="min-h-screen flex flex-col md:flex-row justify-center overflow-y-auto">
                <div className="flex flex-col w-full max-w-md justify-center border-b md:border-b-0 md:border-r md:w-1/2 p-4">
                    <CardHeader>
                        <CardTitle>Set Up Your Profile</CardTitle>
                        <CardDescription>Enter your details below to continue</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        placeholder="your_username"
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="John"
                                        required
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
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-muted-foreground">
                                        Confirm Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        defaultValue={profile?.email}
                                        disabled
                                        placeholder="m@example.com"
                                        required
                                    />
                                </div>
                            </div>
                        </form>
                    </CardContent>

                    <CardFooter className="flex items-center justify-center">
                        <Button className="mt-4 w-full">Verify Email</Button>
                    </CardFooter>
                </div>
                <div className="flex flex-col bg-background justify-center  p-4 w-full md:w-1/2">
                    <h1 className="text-xl font-bold mb-2">Personalize Your Feed</h1>
                    <h4 className="text-sm text-gray-600 mb-4">
                        Select atleast 3 topics so we can recommend the best content for you
                    </h4>

                    <div className="flex flex-wrap gap-2 overflow-y-auto">
                        {interests.map((interest) => (
                            <Badge
                                key={interest}
                                onClick={() => toggleInterest(interest)}
                                className={cn(
                                    "cursor-pointer px-4 py-2 rounded-full text-sm",
                                    selected.includes(interest)
                                        ? "bg-primary text-white"
                                        : "bg-gray-200 hover:bg-gray-300 text-gray-500",
                                )}
                            >
                                {interest}
                            </Badge>
                        ))}
                    </div>

                    <div className="sticky bottom-0 left-0 right-0 bg-background py-2 mt-10 flex flex-row gap-2">
                        <Button className="flex-1" disabled={selected.length < 3}>
                            Continue
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}
