import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useReportVideoMutation } from "@/hooks/report/use-report-video"
import { AlertCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { POLICIES } from "./_policy-data"

export default function ReportVideoDialog({
    videoId,
    children,
}: {
    videoId: string
    children: React.ReactNode
}) {
    const [scenario, setScenario] = useState<string>("")
    const [details, setDetails] = useState<string>("")
    const { submitReport, loading } = useReportVideoMutation()

    const handleSubmit = async () => {
        await submitReport(videoId, scenario, details)
        setScenario("")
        setDetails("")
        toast.success("Video report sent")
    }

    const selectedPolicy = POLICIES.find((p) => p.scenario === scenario)

    return (
        <Dialog>
            <DialogTrigger asChild className="w-full">
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Report Content</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-2">
                        Help us keep the community safe by reporting content that violates our
                        policies.
                    </DialogDescription>
                </DialogHeader>
                <Separator />
                <div className="space-y-4">
                    <div className="space-y-2 flex flex-col">
                        <label className="text-sm font-semibold text-muted-foreground">
                            What&apos;s wrong with this content?{" "}
                            <span className="text-destructive align-super">*</span>
                        </label>
                        <Select value={scenario} onValueChange={setScenario} required>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {POLICIES.map((policy, idx) => (
                                        <SelectItem value={policy.scenario} key={idx}>
                                            {policy.scenario}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {scenario && selectedPolicy && scenario !== "Other" && (
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2 border">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <p className="font-medium">
                                        We don&apos;t allow the following:
                                    </p>
                                    <ul className="text-muted-foreground space-y-1.5">
                                        {selectedPolicy.limits.map((limit, idx) => (
                                            <li key={idx} className="flex gap-2">
                                                <span className="text-destructive">•</span>
                                                <span>{limit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 flex flex-col">
                        <label className="text-sm font-semibold text-muted-foreground">
                            Additional details{" "}
                            <span className="font-medium text-muted-foreground">
                                ({scenario === "Other" ? "required" : "optional"})
                            </span>
                        </label>
                        <Textarea
                            required={scenario === "Other"}
                            placeholder="Provide any additional context that might help us review this report..."
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 w-full">
                    <DialogClose asChild className="flex-1">
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild className="flex-1">
                        <Button
                            variant={"destructive"}
                            onClick={handleSubmit}
                            disabled={!scenario}
                            className="gap-2"
                        >
                            {loading ? "Submitting..." : "Submit Report"}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
