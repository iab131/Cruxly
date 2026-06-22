import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getGradeBadgeStyle } from "@/lib/climbing-utils"
import { MapPin } from "lucide-react"
import { LocationDistance } from "@/components/location-distance"

interface ProblemCardProps {
    id: string
    name: string
    grade: string
    gym: string
    locationAddress?: string | null
    latitude?: number | null
    longitude?: number | null
    image: string | null
    type?: string
    builder?: string
    tags?: string[]
    initialHasLiked?: boolean
    initialLikesCount?: number
    initialHasSaved?: boolean
    isLoggedIn?: boolean 
}

import { LikeButton } from "./LikeButton"

export function ProblemCard({ id, name, grade, gym, locationAddress, latitude, longitude, image, builder, initialHasLiked = false, initialLikesCount = 0 }: ProblemCardProps) {
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
            <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/95 via-black/55 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors pointer-events-none" />
            </div>

            {/* 3. Main Link (Clickable Area) - Covers everything */}
            <Link href={`/p/${id}`} className="absolute inset-0 z-10" />

            {/* 4. Top Badges (Grade) & Save Button */}
            <div className="absolute top-4 right-4 z-20 pointer-events-none">
                 <Badge className={cn("backdrop-blur-md border-white/10 shadow-lg px-3 py-1 text-sm font-extrabold tracking-tight", getGradeBadgeStyle(grade))}>
                    {grade}
                 </Badge>
            </div>
            {/* <div className="absolute top-4 left-4 z-20 pointer-events-auto">
                 <SaveButton 
                    problemId={id} 
                    initialHasSaved={initialHasSaved} 
                    isLoggedIn={true}
                    variant="card"
                    className="backdrop-blur-md bg-black/20 hover:bg-black/40 p-2 rounded-full transition-colors"
                 />
            </div> */}

            {/* 5. Bottom Content Layer */}
            <div className="absolute bottom-0 inset-x-0 z-20 p-4 md:p-5 pointer-events-none">
                 <div className="min-w-0 pr-14 space-y-1.5">
                        <h3 className="font-bold text-2xl md:text-xl leading-tight text-white group-hover:text-blue-200 transition-colors line-clamp-2 text-shadow">
                            {name || "Untitled Climb"}
                        </h3>

                        {builder && builder !== "Unknown" && (
                            <p className="truncate text-sm font-medium text-slate-300">
                                by {builder}
                            </p>
                        )}

                        <div className="space-y-1 text-sm font-medium text-slate-300">
                            <div className="flex min-w-0 items-center gap-1.5" title={locationAddress || gym}>
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-200" />
                                <span className="truncate">{gym}</span>
                            </div>
                            <LocationDistance
                                latitude={latitude}
                                longitude={longitude}
                                className="flex items-center gap-1.5 text-blue-100"
                            />
                        </div>
                 </div>

                 <div className="absolute bottom-4 right-4 pointer-events-auto">
                    <LikeButton 
                        problemId={id} 
                        initialHasLiked={initialHasLiked} 
                        initialLikesCount={initialLikesCount}
                        isLoggedIn={true}
                        variant="card"
                        className="rounded-full bg-black/35 px-2 py-1 backdrop-blur-md hover:bg-black/50"
                    />
                 </div>
            </div>
        </div>
    )
}
