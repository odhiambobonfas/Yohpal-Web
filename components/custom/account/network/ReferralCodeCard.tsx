"use client"

import { useState, useEffect } from "react"
import { Copy, Check, Share2, MessageCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { NetworkStats } from "@/types/account"

interface ReferralCodeCardProps {
  stats: NetworkStats | null
  loading: boolean
}

export function ReferralCodeCard({ stats, loading }: ReferralCodeCardProps) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null)
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && "share" in navigator)
  }, [])

  const handleCopy = async (text: string, type: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      toast.success(`${type === "code" ? "Referral code" : "Referral link"} copied!`)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Join Yohpal and earn with me! Use my referral link: ${stats?.referralLink || ""}`
    )
    window.open(`https://wa.me/?text=${message}`, "_blank")
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Yohpal",
          text: "Join Yohpal and start earning!",
          url: stats?.referralLink || "",
        })
      } catch {
        // User cancelled or share failed
      }
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Referral Code</CardTitle>
        <CardDescription>
          Share your code and earn when friends join Yohpal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Referral Code</label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={stats?.referralCode || ""}
              className="font-mono text-lg font-bold tracking-wider"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(stats?.referralCode || "", "code")}
            >
              {copied === "code" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Referral Link</label>
          <div className="flex gap-2">
            <Input
              readOnly
              value={stats?.referralLink || ""}
              className="text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(stats?.referralLink || "", "link")}
            >
              {copied === "link" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleWhatsAppShare}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp
          </Button>
          {canShare && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleNativeShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
