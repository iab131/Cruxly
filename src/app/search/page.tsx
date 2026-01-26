"use client"

import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { ProblemCard } from "@/components/problem-card"
import _ from "lodash" // Assuming lodash is installed for debounce, if not we can write a simple one

interface SearchPageProps {
    // any server props if needed
}

export default function SearchPage() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<any[]>([])
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
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <div className="space-y-4">
                <h1 className="text-3xl font-bold">Explore</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input 
                        placeholder="Search climbs by name, gym, or setter..." 
                        className="pl-10 h-12 text-lg bg-white shadow-sm"
                        value={query}
                        onChange={handleInput}
                        autoFocus
                    />
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                     <div className="text-center py-12 text-slate-400">
                         Searching...
                     </div>
                ) : hasSearched ? (
                    results.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {results.map(prob => (
                                <ProblemCard 
                                    key={prob.id} 
                                    {...prob} 
                                    // For search results, we might not have 'hasLiked' perfectly synced unless we do a complex query, 
                                    // simpler to default false or fetch. Assuming API returns basic data.
                                    // If we need auth state here, we'll need useUser().
                                    isLoggedIn={true} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            No climbs found matching &quot;{query}&quot;
                        </div>
                    )
                ) : (
                    // Empty State / Suggestions
                    <div className="text-center py-20 text-slate-400">
                        <p>Type to find specific climbs or gyms.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
