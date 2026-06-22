"use client"

import { useState, useTransition, useEffect } from "react"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { pusherClient } from "@/lib/pusher"

interface LikeButtonProps {
    problemId: string
    initialHasLiked: boolean
    initialLikesCount: number
    isLoggedIn: boolean
    className?: string
    variant?: "default" | "card"
    showLabel?: boolean
}

export function LikeButton({ 
    problemId, 
    initialHasLiked, 
    initialLikesCount, 
    isLoggedIn, 
    className,
    variant = "default",
    showLabel = false
}: LikeButtonProps) {
    const router = useRouter()
    const [isPending] = useTransition()
    const [hasLiked, setHasLiked] = useState(initialHasLiked)
    const [likesCount, setLikesCount] = useState(initialLikesCount)

    useEffect(() => {
        const channel = pusherClient.subscribe(`problem-${problemId}`)
        
        channel.bind("like:updated", (data: { count: number }) => {
            setLikesCount(data.count)
        })

        return () => {
            pusherClient.unsubscribe(`problem-${problemId}`)
        }
    }, [problemId])

    const toggleLike = async () => {
        if (!isLoggedIn) {
            toast.error("You must be logged in to like problems")
            return
        }

        // Optimistic update
        const previousHasLiked = hasLiked
        const previousLikesCount = likesCount
        
        const newHasLiked = !hasLiked
        const newLikesCount = hasLiked ? likesCount - 1 : likesCount + 1

        setHasLiked(newHasLiked)
        setLikesCount(newLikesCount)

        try {
            const res = await fetch(`/api/problems/${problemId}/like`, {
                method: "POST",
            })

            if (!res.ok) {
                // Revert on failure
                setHasLiked(previousHasLiked)
                setLikesCount(previousLikesCount)
                if (res.status === 401) {
                    toast.error("Please sign in to like problems")
                } else {
                    toast.error("Something went wrong")
                }
            } else {
                // Ensure server state is synced (optional, but good for consistency)
                await res.json()
                router.refresh()
            }
        } catch {
            // Revert on error
            setHasLiked(previousHasLiked)
            setLikesCount(previousLikesCount)
            toast.error("Failed to connect to server")
        }
    }

    return (
        <button
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleLike()
            }}
            disabled={isPending}
            className={cn("flex items-center gap-1.5 group transition-colors", className)}
        >
            <div className={cn(
                "p-1.5 rounded-full transition-colors",
                hasLiked ? "bg-transparent" : "group-hover:bg-slate-100/10"
            )}>
                <Heart
                    className={cn(
                        "w-5 h-5 transition-all",
                        hasLiked
                            ? "fill-red-500 text-red-500 scale-110"
                            : cn(
                                "hover:text-red-400 hover:fill-red-400 scale-105",
                                variant === "card" ? "text-white" : "text-slate-900"
                            )
                    )}
                />
            </div>
            {(showLabel || likesCount > 0) && (
                <span className={cn(
                    "text-sm font-semibold tabular-nums transition-colors",
                    hasLiked 
                        ? "text-red-600" 
                        : (variant === "card" ? "text-white" : "text-slate-900")
                )}>
                    {showLabel ? (hasLiked ? "Liked" : "Like") : ""}
                    {likesCount > 0 ? (showLabel ? ` (${likesCount})` : likesCount) : ""}
                </span>
            )}
        </button>
    )
}
