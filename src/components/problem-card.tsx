import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface ProblemCardProps {
    id: string
    name: string
    grade: string
    gym: string
    image: string
    type?: string
    builder?: string
}

export function ProblemCard({ id, name, grade, gym, image, type, builder }: ProblemCardProps) {
    return (
        <Link href={`/p/${id}`} className="block h-full">
            <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer bg-white h-full flex flex-col">
                <div className="aspect-[4/3] relative bg-slate-100 overflow-hidden">
                    <img
                        src={image}
                        alt={name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-2 right-2 bg-blue-950/90 hover:bg-blue-950 text-white border-0 font-bold">
                        {grade}
                    </Badge>
                </div>
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg font-bold text-slate-900 line-clamp-1">{name || "Untitled Climb"}</CardTitle>
                    {builder && <p className="text-xs text-muted-foreground font-normal">by {builder}</p>}
                </CardHeader>
                <CardContent className="p-4 pt-0 mt-auto">
                    <p className="text-sm font-medium text-blue-950 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            {gym}
                        </span>
                        {type && <span className="text-xs text-muted-foreground font-normal">{type}</span>}
                    </p>
                </CardContent>
            </Card>
        </Link>
    )
}
