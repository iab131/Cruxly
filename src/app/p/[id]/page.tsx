import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Bookmark, Share2, MapPin } from "lucide-react"

import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function ProblemDetailPage({ params }: { params: { id: string } }) {
    const data = await prisma.problem.findUnique({
        where: { id: params.id },
        include: { setter: true }
    })

    if (!data) {
        notFound()
    }

    // Map to UI format
    const problem = {
        name: data.name,
        grade: data.grade,
        gym: data.gym,
        builder: data.setter?.username || "Unknown",
        image: data.image,
        description: data.description || "No description available.",
        stats: {
            likes: 0,
            attempts: 0,
            completionRate: "0%"
        }
    }

    return (
        <div className="pb-20">
            {/* Hero Image */}
            <div className="w-full h-[40vh] md:h-[50vh] bg-slate-100 relative overflow-hidden">
                <img src={problem.image} alt={problem.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 md:p-8 text-white w-full max-w-7xl mx-auto">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm font-bold text-lg px-3 py-1 mb-2">
                        {problem.grade}
                    </Badge>
                    <h1 className="text-3xl md:text-5xl font-bold mb-2">{problem.name}</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 md:p-8 -mt-6 relative z-10 bg-white md:bg-transparent md:mt-0 rounded-t-3xl md:rounded-none">
                <div className="grid md:grid-cols-[2fr_1fr] gap-8">
                    {/* Left Column: Details */}
                    <div className="space-y-8">
                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-4 items-center text-slate-600 mb-4">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                <span className="font-medium text-slate-900">{problem.gym}</span>
                            </div>
                            <div className="hidden md:block w-1 h-1 bg-slate-300 rounded-full" />
                            <div>
                                Set by <span className="font-medium text-slate-900">{problem.builder}</span>
                            </div>
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center gap-4 py-4 border-y border-slate-100">
                            <Button variant="outline" size="sm" className="gap-2 text-slate-700">
                                <Heart className="w-4 h-4" /> Like
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2 text-slate-700">
                                <Bookmark className="w-4 h-4" /> Save
                            </Button>
                            <Button variant="ghost" size="icon" className="ml-auto text-slate-500">
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Description</h2>
                            <p className="text-slate-600 leading-relaxed">
                                {problem.description}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Stats (Sidebar style on desktop) */}
                    <div className="space-y-6">
                        <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                            <h3 className="font-bold text-slate-900">Statistics</h3>
                            <div className="grid grid-cols-3 md:grid-cols-1 gap-4">
                                <div className="text-center md:text-left md:flex md:justify-between md:items-center">
                                    <span className="text-sm text-slate-500 block">Likes</span>
                                    <span className="font-bold text-slate-900 text-lg">{problem.stats.likes}</span>
                                </div>
                                <div className="text-center md:text-left md:flex md:justify-between md:items-center">
                                    <span className="text-sm text-slate-500 block">Attempts</span>
                                    <span className="font-bold text-slate-900 text-lg">{problem.stats.attempts}</span>
                                </div>
                                <div className="text-center md:text-left md:flex md:justify-between md:items-center">
                                    <span className="text-sm text-slate-500 block">Completion</span>
                                    <span className="font-bold text-green-600 text-lg">{problem.stats.completionRate}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
