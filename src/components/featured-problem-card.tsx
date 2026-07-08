import Link from "next/link"
import { MapPin, MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getGradeBadgeStyle } from "@/lib/climbing-utils"
import { LikeButton } from "./LikeButton"

interface FeaturedProblemCardProps {
    id: string
    name: string
    grade: string
    gym: string
    image: string | null
    builder?: string | null
    builderImage?: string | null
    likesCount?: number
    commentsCount?: number
    hasLiked?: boolean
    isLoggedIn?: boolean
}

/**
 * Cinematic full-width spotlight for the top-ranked climb of the feed
 * ("Today's Proj"). Same visual language as ProblemCard, wider stage.
 */
export function FeaturedProblemCard({
    id,
    name,
    grade,
    gym,
    image,
    builder,
    builderImage,
    likesCount = 0,
    commentsCount,
    hasLiked = false,
    isLoggedIn = false,
}: FeaturedProblemCardProps) {
    const hasBuilder = Boolean(builder && builder !== "Unknown")

    return (
        <div className="group relative isolate w-full transform-gpu overflow-hidden rounded-4xl bg-slate-900 shadow-md ring-1 ring-slate-900/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
            <div className="relative w-full aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/10] bg-slate-800">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-95 group-hover:opacity-100"
                    />
                ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-500 p-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-700/50 mb-3" />
                        <span className="text-xs font-medium">No Preview</span>
                    </div>
                )}

                <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/95 via-black/55 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/45 to-transparent pointer-events-none" />
            </div>

            <Link href={`/p/${id}`} className="absolute inset-0 z-10" aria-label={`View ${name || "climb"}`} />

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
                    <span className="max-w-[9rem] truncate text-xs font-semibold text-white text-shadow">
                        {builder}
                    </span>
                </Link>
            )}

            <div className="absolute top-4 right-4 z-20 pointer-events-none">
                <Badge className={cn("backdrop-blur-md border-white/10 shadow-lg px-3.5 py-1.5 text-base font-extrabold tracking-tight", getGradeBadgeStyle(grade))}>
                    {grade}
                </Badge>
            </div>

            <div className="absolute bottom-0 inset-x-0 z-20 p-4 sm:p-6 pointer-events-none">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0 space-y-1.5">
                        <h2 className="font-bold text-3xl sm:text-4xl leading-tight text-white group-hover:text-blue-200 transition-colors line-clamp-2 text-shadow-lg">
                            {name || "Untitled Climb"}
                        </h2>
                        <div className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-slate-200/90 text-shadow">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-200" />
                            <span className="truncate">{gym}</span>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2.5">
                        <div className="pointer-events-auto">
                            <LikeButton
                                problemId={id}
                                initialHasLiked={hasLiked}
                                initialLikesCount={likesCount}
                                isLoggedIn={isLoggedIn}
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
        </div>
    )
}
