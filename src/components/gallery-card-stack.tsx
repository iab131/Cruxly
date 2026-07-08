"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface GalleryCardStackProps {
    urls: string[]
    contents: string[]
    onImageClick: (idx: number) => void
}

export function GalleryCardStack({ urls, contents, onImageClick }: GalleryCardStackProps) {
    const [activeIndex, setActiveIndex] = useState(0)

    const handlePrev = () => {
        setActiveIndex((prev) => Math.max(0, prev - 1))
    }

    const handleNext = () => {
        setActiveIndex((prev) => Math.min(urls.length - 1, prev + 1))
    }

    const getCardStyles = (idx: number) => {
        const diff = idx - activeIndex
        const absDiff = Math.abs(diff)

        if (absDiff > 2) {
            return {
                transform: `translate3d(${diff > 0 ? 80 : -80}px, 12px, 0px) scale(0.7) rotate(${diff > 0 ? 12 : -12}deg)`,
                opacity: 0,
                zIndex: 0,
                pointerEvents: "none" as const,
            }
        }

        // Side stacking: translated left or right, tilted at an angle
        const xOffset = diff * 24 // shift cards on the side horizontally
        const yOffset = absDiff * 6 // slight vertical downward cascade for layering depth
        const scale = 1 - absDiff * 0.08 // scale down stack cards
        const rotation = diff * 5 // tilt at an angle: e.g. -5deg, 0deg, 5deg
        const opacity = 1 - absDiff * 0.25
        const zIndex = 30 - absDiff

        return {
            transform: `translate3d(${xOffset}px, ${yOffset}px, 0px) scale(${scale}) rotate(${rotation}deg)`,
            opacity,
            zIndex,
            pointerEvents: diff === 0 ? ("auto" as const) : ("none" as const),
        }
    }

    const showNavigation = urls.length > 1

    return (
        <div className="mt-3 space-y-4">
            <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                    Beta Guide
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {urls.length} step{urls.length !== 1 ? "s" : ""}
                </span>
            </div>

            <div className="flex items-center justify-center gap-2 sm:gap-4 py-4 select-none min-h-[300px] xs:min-h-[360px] sm:min-h-[420px]">
                {showNavigation && (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handlePrev}
                        disabled={activeIndex === 0}
                        className="h-8 w-8 rounded-full border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm shrink-0"
                        aria-label="Previous step"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}

                <div className="relative w-[190px] xs:w-[230px] sm:w-[260px] h-[260px] xs:h-[320px] sm:h-[370px] flex items-center justify-center">
                    {urls.map((url, idx) => {
                        const stepNote = contents[idx] || ""
                        const style = {
                            ...getCardStyles(idx),
                            transition: "transform 400ms cubic-bezier(0.25, 1, 0.5, 1), opacity 400ms ease, z-index 400ms ease",
                        }

                        return (
                            <div
                                key={idx}
                                style={style}
                                className="absolute w-full h-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-3 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.6)] flex flex-col gap-2.5 origin-center"
                            >
                                <div className="relative flex-1 rounded-xl overflow-hidden bg-slate-950 border border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        className="w-full h-full text-left cursor-pointer"
                                        onClick={() => onImageClick(idx)}
                                        title="View full image"
                                        disabled={idx !== activeIndex}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={url}
                                            alt={`Step ${idx + 1}`}
                                            className="w-full h-full object-contain select-none"
                                            draggable={false}
                                        />
                                    </button>
                                    <span className="glass-chip absolute top-2 left-2 text-white px-2 py-0.5 rounded-full text-[10px] font-bold select-none">
                                        Step {idx + 1} of {urls.length}
                                    </span>
                                </div>
                                <div className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-snug line-clamp-3 min-h-[44px] flex items-center justify-center text-center px-1 font-medium overflow-y-auto">
                                    {stepNote || <span className="text-slate-400 italic">No annotation note for this step.</span>}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {showNavigation && (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleNext}
                        disabled={activeIndex === urls.length - 1}
                        className="h-8 w-8 rounded-full border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm shrink-0"
                        aria-label="Next step"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                )}
            </div>
            
            {showNavigation && (
                <div className="flex items-center justify-center gap-1.5">
                    {urls.map((_, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveIndex(idx)}
                            aria-label={`Go to step ${idx + 1}`}
                            aria-current={idx === activeIndex}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300",
                                idx === activeIndex
                                    ? "w-5 bg-blue-700 dark:bg-blue-500"
                                    : "w-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600"
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
