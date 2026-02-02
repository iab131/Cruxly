"use client"

import { useState, useTransition } from "react"
import { Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface SaveButtonProps {
    problemId: string
    initialHasSaved: boolean
    isLoggedIn: boolean
    className?: string
}

export function SaveButton({ problemId, initialHasSaved, isLoggedIn, className }: SaveButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [hasSaved, setHasSaved] = useState(initialHasSaved)

    const toggleSave = async () => {
        if (!isLoggedIn) {
            toast.error("You must be logged in to save problems")
            return
        }

        // Optimistic update
        const previousHasSaved = hasSaved
        const newHasSaved = !hasSaved

        setHasSaved(newHasSaved)

        try {
            const res = await fetch(`/api/problems/${problemId}/save`, {
                method: "POST",
            })

            if (!res.ok) {
                setHasSaved(previousHasSaved)
                if (res.status === 401) {
                    toast.error("Please sign in to save problems")
                } else {
                    toast.error("Something went wrong")
                }
            } else {
                router.refresh()
                if (newHasSaved) {
                    toast.success("Problem saved")
                } else {
                    toast.success("Problem removed from saves")
                }
            }
        } catch (error) {
            setHasSaved(previousHasSaved)
            toast.error("Failed to connect to server")
        }
    }

    return (
        <Button 
            onClick={toggleSave}
            disabled={isPending}
            variant={hasSaved ? "default" : "outline"}
            size="sm"
            className={cn("gap-2", hasSaved ? "bg-slate-900 text-white hover:bg-slate-800" : "text-slate-700", className)}
        >
            <Bookmark className={cn("w-4 h-4", hasSaved && "fill-current")} /> 
            {hasSaved ? "Saved" : "Save"}
        </Button>
    )
}
