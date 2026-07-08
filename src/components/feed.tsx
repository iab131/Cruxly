"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ProblemCard } from "@/components/problem-card"
import { FeaturedProblemCard } from "@/components/featured-problem-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Flame, Loader2, SlidersHorizontal, X } from "lucide-react"
import { cn } from "@/lib/utils"

type FeedProblem = {
    id: string
    name: string
    grade: string
    gym: string
    type?: string
    image: string | null
    tags?: string[]
    builder?: string | null
    builderImage?: string | null
    likesCount?: number
    commentsCount?: number
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

    // Story-style rail: the setters behind the current feed, deduped
    const setters = useMemo(() => {
        const seen = new Set<string>()
        const out: { name: string; image: string | null }[] = []
        for (const p of uniqueProblems) {
            const name = p.builder
            if (!name || name === "Unknown" || seen.has(name)) continue
            seen.add(name)
            out.push({ name, image: p.builderImage ?? null })
            if (out.length >= 12) break
        }
        return out
    }, [uniqueProblems])

    // Spotlight the top-ranked climb ("Today's Proj") on the unfiltered feed.
    const showSpotlight = !hasActiveFilters && filteredProblems.length > 1
    const spotlight = showSpotlight ? filteredProblems[0] : null
    const gridProblems = spotlight ? filteredProblems.slice(1) : filteredProblems

    return (
        <div className="max-w-6xl mx-auto px-4 mb-20">
            {/* Sticky feed header with quick category rail — floating liquid-glass island */}
            <div className="glass-panel sticky top-16 md:top-3 z-30 mb-6 rounded-3xl border border-white/50 px-4 pb-3 pt-3">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-blue-950 tracking-tight">Discovery</h1>
                    <div className="flex items-center gap-2">
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="rounded-full text-slate-600 hover:bg-white/40">
                                <X className="h-4 w-4" />
                                Clear
                            </Button>
                        )}
                        <Button
                            size="sm"
                            onClick={() => setFiltersOpen((open) => !open)}
                            className={cn(
                                "gap-2 rounded-full border backdrop-blur-md transition-all active:scale-95",
                                filtersOpen || disciplineFilter !== "all" || locationFilter
                                    ? "border-white/30 bg-blue-950/90 text-white shadow-md shadow-blue-950/25 hover:bg-blue-950"
                                    : "border-white/60 bg-white/35 text-slate-700 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] hover:bg-white/55 hover:text-blue-950"
                            )}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            <span className="hidden sm:inline">Filters</span>
                        </Button>
                    </div>
                </div>

                {/* Always-visible difficulty chip rail */}
                <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
                    {GRADE_FILTERS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setGradeFilter(option.value)}
                            className={cn(
                                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold backdrop-blur-md transition-all active:scale-95",
                                gradeFilter === option.value
                                    ? "border-white/30 bg-blue-950/90 text-white shadow-md shadow-blue-950/25"
                                    : "border-white/60 bg-white/35 text-slate-700 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] hover:bg-white/55 hover:text-blue-950"
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {filtersOpen && (
                    <div className="mt-3 rounded-2xl border border-white/50 bg-white/30 backdrop-blur-md p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] animate-rise-in">
                        <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Discipline</label>
                                <div className="flex flex-wrap gap-2">
                                    {DISCIPLINE_FILTERS.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setDisciplineFilter(option.value)}
                                            className={cn(
                                                "rounded-full border px-3 py-1.5 text-sm font-medium backdrop-blur-md transition-all active:scale-95",
                                                disciplineFilter === option.value
                                                    ? "border-white/30 bg-blue-950/90 text-white shadow-md shadow-blue-950/25"
                                                    : "border-white/60 bg-white/35 text-slate-700 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] hover:bg-white/55 hover:text-blue-950"
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
                                    className="rounded-full border-white/60 bg-white/40 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Setter rail — the people behind this feed */}
            {setters.length > 1 && (
                <div className="mb-8 animate-rise-in">
                    <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Setters on the wall
                        <span className="h-px flex-1 bg-slate-200" />
                    </div>
                    <div className="no-scrollbar flex gap-4 overflow-x-auto pb-1">
                        {setters.map((setter) => (
                            <Link
                                key={setter.name}
                                href={`/u/${setter.name}`}
                                className="group/setter flex w-16 shrink-0 flex-col items-center gap-1.5"
                            >
                                <span className="rounded-full bg-gradient-to-tr from-blue-950 via-blue-600 to-sky-400 p-[2.5px] transition-transform group-hover/setter:scale-105 group-active/setter:scale-95">
                                    {setter.image ? (
                                        <img
                                            src={setter.image}
                                            alt={setter.name}
                                            className="h-14 w-14 rounded-full border-2 border-white object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-blue-950 text-sm font-bold uppercase text-white">
                                            {setter.name.slice(0, 2)}
                                        </span>
                                    )}
                                </span>
                                <span className="w-full truncate text-center text-xs font-medium text-slate-600 group-hover/setter:text-blue-950 transition-colors">
                                    {setter.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Today's Proj — the top-ranked climb right now */}
            {spotlight && (
                <div className="mb-10 animate-rise-in">
                    <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-blue-950">
                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                        Today&apos;s Proj
                        <span className="h-px flex-1 bg-slate-200" />
                    </div>
                    <FeaturedProblemCard
                        {...spotlight}
                        likesCount={spotlight.likesCount}
                        commentsCount={spotlight.commentsCount}
                        hasLiked={spotlight.hasLiked}
                        isLoggedIn={isLoggedIn}
                    />
                </div>
            )}

            {/* Masonry: route photos are portrait shots of walls — keep their
                natural shape and pack columns instead of forcing one crop. */}
            <div className="columns-1 sm:columns-2 xl:columns-3 gap-6">
                {gridProblems.map((prob, index) => (
                    <div
                        key={prob.id}
                        className="mb-6 break-inside-avoid animate-rise-in"
                        style={{ animationDelay: `${(index % 12) * 45}ms` }}
                    >
                        <ProblemCard
                            {...prob}
                            natural
                            initialLikesCount={prob.likesCount}
                            initialHasLiked={prob.hasLiked}
                            initialHasSaved={prob.hasSaved}
                            isLoggedIn={isLoggedIn}
                        />
                    </div>
                ))}
            </div>

            {filteredProblems.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-16 text-center text-slate-500">
                    No climbs match these filters yet.
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
