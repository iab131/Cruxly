"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getGradeBadgeStyle } from "@/lib/climbing-utils"
import { X, ZoomIn, ZoomOut, Maximize, RotateCcw, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProblemHeroImageProps {
    image?: string
    name: string
    grade: string
    tags: string[]
}

export function ProblemHeroImage({ image, name, grade, tags }: ProblemHeroImageProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [scale, setScale] = useState(1)
    
    const toggleZoom = () => {
        if (scale > 1) {
            setScale(1)
        } else {
            setScale(2.5)
        }
    }

    // Reset zoom when closing
    const close = () => {
        setIsOpen(false)
        setScale(1)
    }

    if (!image) {
        return (
             <div className="w-full h-[40vh] md:h-[50vh] bg-slate-100 relative overflow-hidden flex items-center justify-center">
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
                className="w-full h-[40vh] md:h-[50vh] bg-slate-100 relative overflow-hidden cursor-pointer group"
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

            {/* Lightbox Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between p-4 text-white z-10 sticky top-0 bg-gradient-to-b from-black/50 to-transparent">
                        <div className="text-sm opacity-80 pl-2">{name}</div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-white hover:bg-white/10" 
                                onClick={(e) => { e.stopPropagation(); setScale(Math.max(0.5, scale - 0.5)); }}
                            >
                                <ZoomOut className="w-5 h-5" />
                            </Button>
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-white hover:bg-white/10" 
                                onClick={(e) => { e.stopPropagation(); setScale(1); }}
                                title="Reset Zoom"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-white hover:bg-white/10" 
                                onClick={(e) => { e.stopPropagation(); setScale(scale + 0.5); }}
                            >
                                <ZoomIn className="w-5 h-5" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-white hover:bg-white/10 ml-2 rounded-full h-10 w-10 bg-white/10 hover:bg-white/20 border border-white/10" 
                                onClick={(e) => { e.stopPropagation(); close(); }}
                            >
                                <X className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>

                    {/* Image Area - Scrollable if zoomed */}
                    <div 
                        className="flex-1 overflow-auto flex items-center justify-center p-4 cursor-grab active:cursor-grabbing"
                        onClick={toggleZoom}
                    >
                         <img 
                            src={image} 
                            alt={name} 
                            style={{ 
                                transform: `scale(${scale})`,
                                transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                                transformOrigin: 'center center'
                            }}
                            className={cn(
                                "max-w-full max-h-[85vh] object-contain shadow-2xl",
                                scale > 1 ? "" : "w-auto h-auto"
                            )}
                            onClick={(e) => e.stopPropagation()} 
                         />
                    </div>
                    
                    <div className="p-4 text-center text-white/50 text-xs pb-6">
                        Click image to expand • Use controls to zoom
                    </div>
                </div>
            )}
        </>
    )
}
