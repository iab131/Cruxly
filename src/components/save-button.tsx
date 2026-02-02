"use client"

import { useState, useTransition } from "react"
import { Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface SaveButtonProps {
    problemId: string
    initialHasSaved: boolean
    isLoggedIn: boolean
    className?: string
    variant?: "default" | "card"
}

export function SaveButton({ 
    problemId, 
    initialHasSaved, 
    isLoggedIn, 
    className,
    variant = "default" 
}: SaveButtonProps) {
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
        <button
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleSave()
            }}
            disabled={isPending}
            className={cn("flex items-center gap-1.5 group transition-colors", className)}
        >
            <div className={cn(
                "p-1.5 rounded-full transition-colors",
                hasSaved ? "bg-transparent" : "group-hover:bg-slate-100/10"
            )}>
                <Bookmark
                    className={cn(
                        "w-5 h-5 transition-all",
                        hasSaved
                            ? "fill-blue-500 text-blue-500 scale-110"
                            : cn(
                                "hover:text-blue-400 hover:fill-blue-400 scale-105",
                                variant === "card" ? "text-white" : "text-slate-900"
                            )
                    )}
                />
            </div>
            {/* Optional label if needed, but usually icon-only for cards or standard "Saved" text */}
            {variant === "default" && (
                 <span className={cn(
                    "text-sm font-semibold transition-colors",
                    hasSaved ? "text-blue-600" : "text-slate-900"
                 )}>
                    {hasSaved ? "Saved" : "Save"}
                 </span>
            )}
        </button>
    )
}
