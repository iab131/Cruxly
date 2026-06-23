"use client"

import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
        <Button 
            variant="outline" 
            size="sm" 
            onClick={handleShare}
            className={cn(
                "gap-1.5 text-slate-600 hover:text-blue-950 hover:bg-slate-50 border-slate-200 hover:border-slate-300 rounded-lg h-9 px-3 font-semibold text-sm transition-all shadow-xs",
                className
            )}
        >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
        </Button>
    )
}
