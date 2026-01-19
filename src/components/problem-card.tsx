import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getGradeBadgeStyle } from "@/lib/climbing-utils"

interface ProblemCardProps {
    id: string
    name: string
    grade: string
    gym: string
    image: string
    type?: string
    builder?: string
    tags?: string[]
}

export function ProblemCard({ id, name, grade, gym, image, type, builder, tags }: ProblemCardProps) {
    return (
        <Link href={`/p/${id}`} className="block h-full">
            <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer bg-white h-full flex flex-col">
                <div className="aspect-[4/3] relative bg-slate-100 overflow-hidden">
                    <img
                        src={image}
                        alt={name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className={cn("absolute top-2 right-2 border-0 shadow-md transition-colors", getGradeBadgeStyle(grade))}>
                        {grade}
                    </Badge>
                </div>
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg font-bold text-slate-900 line-clamp-1">{name || "Untitled Climb"}</CardTitle>
                    {builder && <p className="text-xs text-muted-foreground font-normal">by {builder}</p>}
                </CardHeader>
                <CardContent className="p-4 pt-0 mt-auto space-y-3">
                    {/* Tags Row */}
                    {tags && tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {tags.map(tag => (
                                <span key={tag} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100/80 text-slate-500 border border-slate-200">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                
                    <div className="text-sm font-medium text-blue-950 flex items-center justify-between pt-1">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            {gym}
                        </span>
                        {type && <span className="text-xs text-muted-foreground font-normal">{type}</span>}
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
