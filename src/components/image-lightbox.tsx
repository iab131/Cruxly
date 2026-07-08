"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageLightboxProps {
    isOpen: boolean
    image: string
    alt: string
    title: ReactNode
    badge?: ReactNode
    note?: ReactNode
    primaryAction?: ReactNode
    activeIndex?: number
    total?: number
    onPrev?: () => void
    onNext?: () => void
    onClose: () => void
    children?: ReactNode
}

export function ImageLightbox({
    isOpen,
    image,
    alt,
    title,
    badge,
    note,
    primaryAction,
    activeIndex,
    total,
    onPrev,
    onNext,
    onClose,
    children,
}: ImageLightboxProps) {
    const [scale, setScale] = useState(1)
    const showNavigation = typeof activeIndex === "number" && !!total && total > 1

    useEffect(() => {
        if (!isOpen) {
            setScale(1)
            document.body.style.overflow = ""
            document.documentElement.style.overflow = ""
            return
        }

        document.body.style.overflow = "hidden"
        document.documentElement.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = ""
            document.documentElement.style.overflow = ""
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200" onClick={onClose}>
            <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between bg-gradient-to-b from-black/60 to-transparent p-4 pointer-events-none">
                <div className="flex items-center gap-2.5 min-w-0">
                    {badge}
                    <span className="truncate text-sm font-semibold text-white/90">
                        {title}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    aria-label="Close (Esc)"
                    title="Close (Esc)"
                    className="pointer-events-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/25 active:scale-90"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {children ? (
                <div className="flex min-h-0 flex-1 flex-col pt-14" onClick={(event) => event.stopPropagation()}>
                    {children}
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-auto flex items-center justify-center p-4 cursor-grab active:cursor-grabbing">
                        <img
                            src={image}
                            alt={alt}
                            style={{
                                transform: `scale(${scale})`,
                                transition: "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
                                transformOrigin: "center center",
                            }}
                            className={cn(
                                "max-w-full max-h-[75vh] object-contain shadow-2xl",
                                scale > 1 ? "" : "w-auto h-auto"
                            )}
                            onClick={(event) => {
                                event.stopPropagation()
                                setScale(scale > 1 ? 1 : 2.5)
                            }}
                        />
                    </div>

                    {note && (
                        <div className="absolute bottom-20 left-1/2 z-20 w-[min(calc(100vw-2rem),36rem)] -translate-x-1/2 rounded-2xl border border-white/15 bg-black/55 px-4 py-3 text-center text-sm font-medium text-white/85 shadow-2xl backdrop-blur-md" onClick={(event) => event.stopPropagation()}>
                            {note}
                        </div>
                    )}

                    <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/55 p-1.5 text-white shadow-2xl backdrop-blur-md" onClick={(event) => event.stopPropagation()}>
                        {primaryAction}
                        {primaryAction && <span className="h-5 w-px bg-white/15" />}
                        {showNavigation && (
                            <>
                                <button
                                    className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/15 active:scale-90 disabled:opacity-30"
                                    onClick={() => { onPrev?.(); setScale(1); }}
                                    disabled={activeIndex === 0}
                                    aria-label="Previous step"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/15 active:scale-90 disabled:opacity-30"
                                    onClick={() => { onNext?.(); setScale(1); }}
                                    disabled={activeIndex === (total ?? 0) - 1}
                                    aria-label="Next step"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                                <span className="h-5 w-px bg-white/15" />
                            </>
                        )}
                        <button
                            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/15 active:scale-90"
                            onClick={() => setScale(Math.max(0.5, scale - 0.5))}
                            aria-label="Zoom out"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <button
                            className="min-w-[3.5rem] rounded-full px-2 py-1.5 text-xs font-bold tabular-nums text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                            onClick={() => setScale(1)}
                            title="Reset zoom"
                        >
                            {Math.round(scale * 100)}%
                        </button>
                        <button
                            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/15 active:scale-90"
                            onClick={() => setScale(scale + 0.5)}
                            aria-label="Zoom in"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
