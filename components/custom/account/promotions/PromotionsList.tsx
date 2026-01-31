"use client"

import { useState } from "react"
import { usePromotions } from "@/hooks/promotions"
import { PromotionCard } from "./PromotionCard"
import { CreatePromotionDialog } from "./CreatePromotionDialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, Video } from "lucide-react"
import { PromotionFilterType } from "@/types/ads"

export function PromotionsList() {
    const [filter, setFilter] = useState<PromotionFilterType>("all")
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const { promotions, loading, error, refetch } = usePromotions({ filter })

    const handleSuccess = () => {
        refetch()
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Tabs value={filter} onValueChange={(v) => setFilter(v as PromotionFilterType)}>
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="drafts">Drafts</TabsTrigger>
                        <TabsTrigger value="published">Active</TabsTrigger>
                        <TabsTrigger value="depleted">Depleted</TabsTrigger>
                    </TabsList>
                </Tabs>

                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 size-4" />
                    Promote Video
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
            ) : error ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p>Failed to load promotions</p>
                    <Button variant="outline" onClick={refetch} className="mt-4">
                        Try Again
                    </Button>
                </div>
            ) : promotions.length === 0 ? (
                <div className="text-center py-12">
                    <Video className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No promotions yet</h3>
                    <p className="text-muted-foreground mb-4">
                        Promote your videos to reach more viewers
                    </p>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="mr-2 size-4" />
                        Create Your First Promotion
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {promotions.map((promotion) => (
                        <PromotionCard
                            key={promotion.id}
                            promotion={promotion}
                            onUpdate={handleSuccess}
                        />
                    ))}
                </div>
            )}

            <CreatePromotionDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={handleSuccess}
            />
        </div>
    )
}
