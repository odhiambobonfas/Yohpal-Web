"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Heart, Bookmark, History } from "lucide-react"

export default function PageVideoLoading() {
  const renderLoadingCards = () => (
    <div className="flex flex-wrap">
      {[...Array(4)].map((unused, i) => (
        <div key={i} className="w-[200px] h-[200px] m-3 space-y-3">
          <Skeleton className="w-full h-[150px] rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  )

  return (
    <div className="bg-background h-[60vh]">
      <Tabs defaultValue="uploads">
        <TabsList>
          <TabsTrigger value="uploads"><Upload /> Uploads</TabsTrigger>
          <TabsTrigger value="liked"><Heart /> Liked</TabsTrigger>
          <TabsTrigger value="bookmarked"><Bookmark /> Bookmarked</TabsTrigger>
          <TabsTrigger value="history"><History /> History</TabsTrigger>
        </TabsList>

        <TabsContent value="uploads">{renderLoadingCards()}</TabsContent>
        <TabsContent value="liked">{renderLoadingCards()}</TabsContent>
        <TabsContent value="bookmarked">{renderLoadingCards()}</TabsContent>
        <TabsContent value="history">{renderLoadingCards()}</TabsContent>
      </Tabs>
    </div>
  )
}
