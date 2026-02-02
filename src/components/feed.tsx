"use client"

import { useState, useEffect } from "react"
import { ProblemCard } from "@/components/problem-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { SignInButton } from "@clerk/nextjs"

interface FeedProps {
    initialProblems: any[] // We can type this better with shared types later
    isLoggedIn: boolean
}

export function Feed({ initialProblems, isLoggedIn }: FeedProps) {
    const [problems, setProblems] = useState(initialProblems)
    const [page, setPage] = useState(1)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    const loadMore = async () => {
        if (isLoadingMore || !hasMore) return

        setIsLoadingMore(true)
        const nextPage = page + 1
        try {
            const res = await fetch(`/api/feed?page=${nextPage}&limit=12`)
            const data = await res.json()
            
            if (data.problems && data.problems.length > 0) {
                setProblems(prev => [...prev, ...data.problems])
                setPage(nextPage)
                
                if (data.problems.length < 12) {
                    setHasMore(false)
                }
            } else {
                setHasMore(false)
            }
        } catch (error) {
            console.error("Failed to load more feed items", error)
        } finally {
            setIsLoadingMore(false)
        }
    }

    // Filter duplicates (just in case of feed shift)
    const uniqueProblems = problems.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)

    return (
        <div className="max-w-6xl mx-auto px-4 mb-20">
             {/* Optional Header for "Discovery" vibe */}
             {/* <div className="flex items-center justify-between mb-8 pt-4 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Fresh Climbs</h2>
               
             </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                {uniqueProblems.map((prob) => (
                    <ProblemCard
                        key={prob.id}
                        {...prob}
                        initialLikesCount={prob.likesCount}
                        initialHasLiked={prob.hasLiked}
                        initialHasSaved={prob.hasSaved}
                        isLoggedIn={isLoggedIn}
                    />
                ))}
            </div>

            <div className="flex justify-center py-12">
                {hasMore ? (
                    <Button 
                        variant="ghost" 
                        onClick={loadMore} 
                        disabled={isLoadingMore}
                        className="text-slate-500 hover:text-blue-950 gap-2"
                    >
                        {isLoadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isLoadingMore ? "Loading..." : "Load More"}
                    </Button>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                         <div className="w-1 h-1 rounded-full bg-current" />
                         <p className="text-sm">You&apos;re all caught up</p>
                    </div>
                )}
            </div>
        </div>
    )
}
