"use client"

import { Share2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ShareButtonProps {
    className?: string
}

export function ShareButton({ className }: ShareButtonProps) {
    const handleShare = async () => {
        const url = window.location.href
        try {
            await navigator.clipboard.writeText(url)
            toast.success("Link copied to clipboard!")
        } catch (error) {
            console.error("Error copying link:", error)
            toast.error("Failed to copy link")
        }
    }

    return (
        <button
            onClick={handleShare}
            aria-label="Share"
            className={cn(
                "group/share flex items-center justify-center rounded-full px-3 py-1.5 hover:bg-slate-100 transition-colors",
                className
            )}
        >
            <Share2 className="w-5 h-5 text-slate-900 transition-colors group-hover/share:text-blue-600 scale-105" />
        </button>
    )
}
