"use client"

import { useMemo, useState } from "react"
import { ProblemCard } from "@/components/problem-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, SlidersHorizontal, X } from "lucide-react"
import { cn } from "@/lib/utils"

type FeedProblem = {
    id: string
    name: string
    grade: string
    gym: string
    type?: string
    image: string | null
    tags?: string[]
    likesCount?: number
    hasLiked?: boolean
    hasSaved?: boolean
    [key: string]: unknown
}

interface FeedProps {
    initialProblems: FeedProblem[]
    isLoggedIn: boolean
}

const GRADE_FILTERS = [
    { label: "All", value: "all" },
    { label: "VB-V2", value: "easy" },
    { label: "V3-V5", value: "moderate" },
    { label: "V6-V8", value: "hard" },
    { label: "V9+", value: "elite" },
] as const

const DISCIPLINE_FILTERS = [
    { label: "All", value: "all" },
    { label: "Boulder", value: "boulder" },
    { label: "Sport", value: "sport" },
    { label: "Trad", value: "trad" },
] as const

function getGradeBucket(grade: string) {
    const number = Number(grade.replace(/^V/i, ""))
    if (grade.toUpperCase() === "VB" || number <= 2) return "easy"
    if (number <= 5) return "moderate"
    if (number <= 8) return "hard"
    return "elite"
}

export function Feed({ initialProblems, isLoggedIn }: FeedProps) {
    const [problems, setProblems] = useState(initialProblems)
    const [page, setPage] = useState(1)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [gradeFilter, setGradeFilter] = useState("all")
    const [disciplineFilter, setDisciplineFilter] = useState("all")
    const [locationFilter, setLocationFilter] = useState("")

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

    const hasActiveFilters = gradeFilter !== "all" || disciplineFilter !== "all" || locationFilter.trim().length > 0

    const uniqueProblems = useMemo(
        () => problems.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i),
        [problems]
    )

    const filteredProblems = useMemo(() => {
        const locationQuery = locationFilter.trim().toLowerCase()

        return uniqueProblems.filter((problem) => {
            const matchesGrade = gradeFilter === "all" || getGradeBucket(problem.grade) === gradeFilter
            const matchesDiscipline = disciplineFilter === "all" || problem.type === disciplineFilter
            const matchesLocation =
                !locationQuery ||
                problem.gym.toLowerCase().includes(locationQuery) ||
                String(problem.locationAddress || "").toLowerCase().includes(locationQuery)

            return matchesGrade && matchesDiscipline && matchesLocation
        })
    }, [disciplineFilter, gradeFilter, locationFilter, uniqueProblems])

    function clearFilters() {
        setGradeFilter("all")
        setDisciplineFilter("all")
        setLocationFilter("")
    }

    return (
        <div className="max-w-6xl mx-auto px-4 mb-20">
            <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-blue-950 tracking-tight">Discovery Feed</h1>
                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500">
                                <X className="h-4 w-4" />
                                Clear
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => setFiltersOpen((open) => !open)}
                            className="border-slate-200 text-slate-700 hover:text-blue-950"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filter Problems
                        </Button>
                    </div>
                </div>

                {filtersOpen && (
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.2fr]">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Difficulty</label>
                                <div className="flex flex-wrap gap-2">
                                    {GRADE_FILTERS.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setGradeFilter(option.value)}
                                            className={cn(
                                                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                                                gradeFilter === option.value
                                                    ? "border-blue-950 bg-blue-950 text-white"
                                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                            )}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Discipline</label>
                                <div className="flex flex-wrap gap-2">
                                    {DISCIPLINE_FILTERS.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setDisciplineFilter(option.value)}
                                            className={cn(
                                                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                                                disciplineFilter === option.value
                                                    ? "border-blue-950 bg-blue-950 text-white"
                                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                            )}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700" htmlFor="feed-location-filter">
                                    Gym or location
                                </label>
                                <Input
                                    id="feed-location-filter"
                                    value={locationFilter}
                                    onChange={(event) => setLocationFilter(event.target.value)}
                                    placeholder="Filter by gym..."
                                    className="bg-white"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-12">
                {filteredProblems.map((prob) => (
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

            {filteredProblems.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-16 text-center text-slate-500">
                    No problems match those filters.
                </div>
            )}

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
