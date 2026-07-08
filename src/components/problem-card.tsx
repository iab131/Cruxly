import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getGradeBadgeStyle } from "@/lib/climbing-utils"
import { MapPin, MessageCircle } from "lucide-react"
import { LocationDistance } from "@/components/location-distance"
import { LikeButton } from "./LikeButton"

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
    builder?: string | null
    builderImage?: string | null
    tags?: string[]
    commentsCount?: number
    hideAuthor?: boolean
    initialHasLiked?: boolean
    initialLikesCount?: number
    initialHasSaved?: boolean
    isLoggedIn?: boolean
    /** Keep the photo's natural aspect ratio (for masonry feeds) instead of the uniform 4:5 crop. */
    natural?: boolean
}

export function ProblemCard({
    id,
    name,
    grade,
    gym,
    locationAddress,
    latitude,
    longitude,
    image,
    builder,
    builderImage,
    commentsCount,
    hideAuthor = false,
    initialHasLiked = false,
    initialLikesCount = 0,
    natural = false,
}: ProblemCardProps) {
    const hasBuilder = !hideAuthor && Boolean(builder && builder !== "Unknown")

    return (
        <div className={cn(
            "group relative isolate w-full transform-gpu overflow-hidden rounded-4xl bg-slate-900 shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5",
            !natural && "h-full"
        )}>
            {/* 1. Background Image */}
            <div className={cn("relative w-full bg-slate-800", !natural && "h-full aspect-[4/5]")}>
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        loading="lazy"
                        className={cn(
                            "w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-95 group-hover:opacity-100",
                            // Natural mode: follow the route photo's own shape, clamped
                            // so one extreme pano or sliver can't wreck the column rhythm.
                            natural ? "h-auto min-h-[300px] max-h-[640px]" : "h-full"
                        )}
                    />
                ) : (
                    <div className={cn(
                        "h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-500 p-8 text-center",
                        natural && "aspect-[4/5]"
                    )}>
                        <div className="w-12 h-12 rounded-full bg-slate-700/50 mb-3" />
                        <span className="text-xs font-medium">No Preview</span>
                    </div>
                )}

                {/* 2. Gradient Overlays for Text Contrast */}
                <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/95 via-black/55 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/45 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors pointer-events-none" />
            </div>

            {/* 3. Main Link (Clickable Area) - Covers everything */}
            <Link href={`/p/${id}`} className="absolute inset-0 z-10" aria-label={`View ${name || "climb"}`} />

            {/* 4. Author chip (top-left) — social identity */}
            {hasBuilder && (
                <Link
                    href={`/u/${builder}`}
                    className="glass-chip absolute top-4 left-4 z-20 flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-white/25"
                >
                    {builderImage ? (
                        <img
                            src={builderImage}
                            alt={builder ?? "Setter"}
                            className="h-6 w-6 rounded-full object-cover ring-1 ring-white/30"
                        />
                    ) : (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/90 text-[10px] font-bold uppercase text-white ring-1 ring-white/30">
                            {builder?.slice(0, 2)}
                        </span>
                    )}
                    <span className="max-w-[7rem] truncate text-xs font-semibold text-white text-shadow">
                        {builder}
                    </span>
                </Link>
            )}

            {/* 5. Grade badge (top-right) */}
            <div className="absolute top-4 right-4 z-20 pointer-events-none">
                <Badge className={cn("backdrop-blur-md border-white/10 shadow-lg px-3 py-1 text-sm font-extrabold tracking-tight", getGradeBadgeStyle(grade))}>
                    {grade}
                </Badge>
            </div>

            {/* 6. Bottom Content Layer */}
            <div className="absolute bottom-0 inset-x-0 z-20 p-4 pointer-events-none">
                <div className="min-w-0 space-y-1.5">
                    <h3 className="font-bold text-2xl md:text-xl leading-tight text-white group-hover:text-blue-200 transition-colors line-clamp-2 text-shadow-lg">
                        {name || "Untitled Climb"}
                    </h3>

                    <div className="space-y-1 text-sm font-medium text-slate-200/90 text-shadow">
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

                {/* Engagement row — like + comments as matched liquid-glass pills */}
                <div className="mt-3 flex items-center gap-2.5">
                    <div className="pointer-events-auto">
                        <LikeButton
                            problemId={id}
                            initialHasLiked={initialHasLiked}
                            initialLikesCount={initialLikesCount}
                            isLoggedIn={true}
                            variant="card"
                            className="glass-chip h-9 rounded-full hover:bg-white/25 transition-colors"
                        />
                    </div>
                    {typeof commentsCount === "number" && (
                        <div className="glass-chip pointer-events-none flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-white">
                            <MessageCircle className="h-5 w-5 text-white/90" />
                            <span className="tabular-nums">{commentsCount}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
