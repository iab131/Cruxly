"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { ProblemCard } from "@/components/problem-card"
import _ from "lodash"

export default function SearchPage() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<React.ComponentProps<typeof ProblemCard>[]>([])
    const [loading, setLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    // Debounced search function
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        _.debounce(async (searchTerm: string) => {
            if (!searchTerm.trim()) {
                setResults([])
                setHasSearched(false)
                setLoading(false)
                return
            }

            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`)
                const data = await res.json()
                setResults(data.problems || [])
                setHasSearched(true)
            } catch (error) {
                console.error("Search error:", error)
            } finally {
                setLoading(false)
            }
        }, 500),
        []
    )

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setQuery(val)
        
        if (val.trim()) {
            setLoading(true)
            debouncedSearch(val)
        } else {
            setResults([])
            setHasSearched(false)
            setLoading(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto px-4 pt-4 md:pt-6 pb-20">
            {/* Sticky liquid-glass island, same language as the feed's Discovery bar */}
            <div className="glass-panel sticky top-3 z-30 mb-8 rounded-3xl border border-white/50 px-4 py-3 md:px-5">
                <h1 className="mb-3 text-2xl md:text-3xl font-bold text-blue-950 tracking-tight">Explore</h1>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                        placeholder="Search climbs by name, gym, or setter..."
                        className="h-12 rounded-full border-white/60 bg-white/45 pl-11 text-base backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] placeholder:text-slate-400"
                        value={query}
                        onChange={handleInput}
                        autoFocus
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-16 text-center text-slate-400">Searching...</div>
            ) : hasSearched ? (
                results.length > 0 ? (
                    <div className="columns-1 sm:columns-2 xl:columns-3 gap-6">
                        {results.map((prob, index) => (
                            <div
                                key={prob.id}
                                className="mb-6 break-inside-avoid animate-rise-in"
                                style={{ animationDelay: `${(index % 12) * 45}ms` }}
                            >
                                <ProblemCard {...prob} natural isLoggedIn={true} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center text-slate-500">
                        No climbs found matching &quot;{query}&quot;
                    </div>
                )
            ) : (
                <div className="py-20 text-center text-slate-400">
                    <p>Type to find specific climbs or gyms.</p>
                </div>
            )}
        </div>
    )
}
