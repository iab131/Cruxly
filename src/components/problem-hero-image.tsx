"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getGradeBadgeStyle } from "@/lib/climbing-utils"
import { Maximize, PenLine, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProblemImageAnnotator } from "@/components/problem-image-annotator"
import { ImageLightbox } from "@/components/image-lightbox"

interface ProblemHeroImageProps {
    problemId: string
    image?: string
    name: string
    grade: string
    tags: string[]
}

export function ProblemHeroImage({ problemId, image, name, grade, tags }: ProblemHeroImageProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    const close = () => {
        setIsOpen(false)
        setIsEditing(false)
    }

    useEffect(() => {
        function handleOpenAnnotator(event: Event) {
            const customEvent = event as CustomEvent<{ problemId: string }>
            if (customEvent.detail.problemId !== problemId || !image) return

            setIsOpen(true)
            setIsEditing(true)
        }

        window.addEventListener("open-route-annotator", handleOpenAnnotator)
        return () => window.removeEventListener("open-route-annotator", handleOpenAnnotator)
    }, [image, problemId])

    if (!image) {
        return (
             <div className="w-full h-[32vh] md:h-[40vh] bg-slate-100 relative overflow-hidden flex items-center justify-center">
                 {/* Back Button */}
                 <Button
  size="icon"
  className="absolute top-4 left-4 z-30 text-white/90 hover:text-white bg-black/20 hover:bg-black/40 rounded-full h-10 w-10 p-2 backdrop-blur-sm transition-all"
  onClick={() => router.back()}
>
  <ArrowLeft className="w-6 h-6" />
</Button>

                 <p className="text-slate-400 font-medium">No image available</p>
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                 <div className="absolute bottom-0 left-0 p-4 md:p-8 text-white w-full max-w-7xl mx-auto flex flex-col items-start gap-2">
                     <Badge className={cn("text-white font-extrabold text-lg px-4 py-1.5 shadow-lg mb-1", getGradeBadgeStyle(grade))}>
                         {grade}
                     </Badge>
                     <h1 className="text-3xl md:text-5xl font-bold">{name}</h1>
                     {tags && tags.length > 0 && (
                         <div className="flex flex-wrap gap-2 mt-2">
                             {tags.map(tag => (
                                 <span key={tag} className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 font-bold uppercase tracking-wider text-[10px] md:text-xs">
                                     {tag}
                                 </span>
                             ))}
                         </div>
                     )}
                 </div>
             </div>
        )
    }

    return (
        <>
            <div 
                className="w-full h-[32vh] md:h-[40vh] bg-slate-100 relative overflow-hidden cursor-pointer group"
                onClick={() => setIsOpen(true)}
            >
                {/* Back Button */}
                <Button 
                    size="icon" 
                    className="absolute top-4 left-4 z-30 text-white/90 hover:text-white bg-black/20 hover:bg-black/40 rounded-full h-10 w-10 p-2 backdrop-blur-sm transition-all"
                    onClick={(e) => {
                        e.stopPropagation()
                        router.back()
                    }}
                >
                    <ArrowLeft className="w-6 h-6" />
                </Button>

                <img 
                    src={image} 
                    alt={name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                
                {/* Overlay Hint */}
                <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                    <Maximize className="w-3 h-3" />
                    Click to expand
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 p-4 md:p-8 text-white w-full max-w-7xl mx-auto flex flex-col items-start gap-2 pointer-events-none">
                    <Badge className={cn("text-white font-extrabold text-lg px-4 py-1.5 shadow-lg mb-1", getGradeBadgeStyle(grade))}>
                        {grade}
                    </Badge>
                    <h1 className="text-3xl md:text-5xl font-bold">{name}</h1>
                    
                    {tags && tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {tags.map(tag => (
                                <span key={tag} className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 font-bold uppercase tracking-wider text-[10px] md:text-xs">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ImageLightbox
                isOpen={isOpen}
                image={image}
                alt={name}
                title={isEditing ? `Beta guide - ${name}` : name}
                badge={
                    <Badge className={cn("shrink-0 text-white font-extrabold px-2.5 py-0.5 shadow-lg", getGradeBadgeStyle(grade))}>
                        {grade}
                    </Badge>
                }
                primaryAction={
                    <button
                        className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold transition-colors hover:bg-blue-500 active:scale-95"
                        onClick={() => setIsEditing(true)}
                    >
                        <PenLine className="w-4 h-4" />
                        Annotate route
                    </button>
                }
                onClose={close}
            >
                {isEditing ? (
                    <ProblemImageAnnotator
                        problemId={problemId}
                        image={image}
                        name={name}
                        onCancel={() => setIsEditing(false)}
                        onPosted={close}
                    />
                ) : undefined}
            </ImageLightbox>
        </>
    )
}
