import { ProblemCard } from "@/components/problem-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function UserProfilePage({ params }: { params: { username: string } }) {
    const data = await prisma.user.findUnique({
        where: { username: params.username },
        include: { setProblems: true }
    })

    if (!data) {
        notFound()
    }

    // Map to UI format
    const user = {
        username: data.username,
        bio: data.bio || "No bio yet.",
        stats: { posted: data.setProblems.length, likes: 0 },
        climbs: data.setProblems.map(p => ({
            id: p.id,
            name: p.name,
            grade: p.grade,
            gym: p.gym,
            image: p.image,
            type: p.type
        }))
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">@{user.username}</h1>
                    <p className="text-slate-600 mt-1">{user.bio}</p>
                </div>

                {/* Stats */}
                <div className="flex gap-8 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div>
                        <div className="text-xl font-bold text-blue-950">{user.stats.posted}</div>
                        <div className="text-xs text-slate-500 uppercase font-medium">Problems</div>
                    </div>
                    <div>
                        <div className="text-xl font-bold text-blue-950">{user.stats.likes}</div>
                        <div className="text-xs text-slate-500 uppercase font-medium">Likes</div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 px-1">Posted Problems</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {user.climbs.map((prob) => (
                        <ProblemCard key={prob.id} {...prob} />
                    ))}
                </div>
            </div>
        </div>
    )
}
