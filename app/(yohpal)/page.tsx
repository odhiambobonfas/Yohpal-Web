"use client"
import { ThemeToggle } from "@/components/custom/ThemeToggle"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function Home() {
  return (
    <>
      <ThemeToggle />
      <div>Hello world</div>
      <Button onClick={() => toast.success("yoo")}>Toast</Button>
    </>
  )
}
