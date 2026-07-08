import { ProblemCard } from "@/components/problem-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params
    const { userId: currentUserId } = await auth()
    const data = await prisma.user.findFirst({
        where: { username },
        include: { 
            problems: {
                include: {
                    _count: { select: { likes: true } }
                }
            }
        }
    })

    if (!data) {
        notFound()
    }

    // Map to UI format
    // Fetch liked problem IDs for the current viewer
    let likedProblemIds = new Set<string>();
    if (currentUserId && data.problems.length > 0) {
        const userLikes = await prisma.like.findMany({
            where: {
                userId: currentUserId,
                problemId: { in: data.problems.map(p => p.id) }
            },
            select: { problemId: true }
        });
        likedProblemIds = new Set(userLikes.map(l => l.problemId));
    }

    const user = {
        username: data.username,
        image: data.image,
        bio: data.bio || "No bio yet.",
        stats: {
            posted: data.problems.length,
            likes: data.problems.reduce((sum, p) => sum + p._count.likes, 0),
        },
        climbs: data.problems.map(p => ({
            id: p.id,
            name: p.name,
            grade: p.grade,
            gym: p.gym,
            locationAddress: p.locationAddress,
            latitude: p.latitude,
            longitude: p.longitude,
            image: p.image,
            type: p.type,
            initialLikesCount: p._count.likes,
            initialHasLiked: likedProblemIds.has(p.id)
        }))
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage src={user.image ?? undefined} alt={user.username ?? "Climber"} />
                    <AvatarFallback>{(user.username || "U").substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">@{user.username}</h1>
                    <p className="text-slate-600 mt-1">{user.bio}</p>
                </div>

                {/* Stats — quiet inline row, same as /me */}
                <div className="flex items-center gap-8">
                    {[
                        { label: "Posts", value: user.stats.posted },
                        { label: "Likes", value: user.stats.likes },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-xl md:text-2xl font-bold text-slate-900 tabular-nums leading-none">{stat.value}</div>
                            <div className="text-xs md:text-sm font-medium text-slate-500 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Posted climbs
                    <span className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="columns-1 sm:columns-2 xl:columns-3 gap-6">
                    {user.climbs.map((prob, index) => (
                        <div
                            key={prob.id}
                            className="mb-6 break-inside-avoid animate-rise-in"
                            style={{ animationDelay: `${(index % 12) * 45}ms` }}
                        >
                            <ProblemCard {...prob} natural isLoggedIn={!!currentUserId} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
