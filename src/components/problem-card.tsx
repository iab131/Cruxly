import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getGradeBadgeStyle } from "@/lib/climbing-utils"
import { MapPin } from "lucide-react"

interface ProblemCardProps {
    id: string
    name: string
    grade: string
    gym: string
    image: string | null
    type?: string
    builder?: string
    tags?: string[]
    initialHasLiked?: boolean
    initialLikesCount?: number
    isLoggedIn?: boolean 
}

import { LikeButton } from "./LikeButton"

export function ProblemCard({ id, name, grade, gym, image, type, builder, tags, initialHasLiked = false, initialLikesCount = 0 }: ProblemCardProps) {
    return (
        <div className="group relative w-full h-full overflow-hidden rounded-2xl bg-slate-900 shadow-sm transition-all hover:shadow-xl">
            {/* 1. Background Image */}
            <div className="relative h-full w-full aspect-[4/5] bg-slate-800">
                {image ? (
                     <img
                        src={image}
                        alt={name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    />
                ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-800 text-slate-500 p-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-700/50 mb-3" />
                         <span className="text-xs font-medium">No Preview</span>
                    </div>
                )}
                
                {/* 2. Gradient Overlay for Text Contrast */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors pointer-events-none" />
            </div>

            {/* 3. Main Link (Clickable Area) - Covers everything */}
            <Link href={`/p/${id}`} className="absolute inset-0 z-10" />

            {/* 4. Top Badges (Grade) */}
            <div className="absolute top-4 right-4 z-20 pointer-events-none">
                 <Badge className={cn("backdrop-blur-md border-white/10 shadow-lg px-3 py-1 text-sm font-extrabold tracking-tight", getGradeBadgeStyle(grade))}>
                    {grade}
                 </Badge>
            </div>

            {/* 5. Bottom Content Layer */}
            <div className="absolute bottom-0 inset-x-0 p-5 z-20 pointer-events-none flex flex-col justify-end gap-3">
                 {/* Content Group */}
                 <div className="flex items-end justify-between gap-4">
                     <div className="space-y-1.5 min-w-0 flex-1">
                        {tags && tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                {tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="text-[10px] uppercase font-bold tracking-wider text-white/90 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <h3 className="font-bold text-xl leading-tight text-white group-hover:text-blue-200 transition-colors line-clamp-2 text-shadow">
                            {name || "Untitled Climb"}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                            <span className="truncate max-w-[120px]">{builder}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-500/50" />
                            <div className="flex items-center gap-1 truncate text-slate-400">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate max-w-[120px]">{gym}</span>
                            </div>
                        </div>
                     </div>

                     {/* Like Button - Interactive */}
                     <div className="pointer-events-auto shrink-0 pb-1">
                        <LikeButton 
                            problemId={id} 
                            initialHasLiked={initialHasLiked} 
                            initialLikesCount={initialLikesCount}
                            isLoggedIn={true}
                            variant="card"
                        />
                     </div>
                 </div>
            </div>
        </div>
    )
}
