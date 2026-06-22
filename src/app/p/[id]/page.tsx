import { Button } from "@/components/ui/button"
import { Share2, MapPin } from "lucide-react"

import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"
import { LikeButton } from "@/components/LikeButton"
import { SaveButton } from "@/components/save-button"
import { CommentSection } from "@/components/comment-section"

import { ProblemHeroImage } from "@/components/problem-hero-image"
import { LocationDistance } from "@/components/location-distance"

export default async function ProblemDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { userId } = await auth();

    const data = await prisma.problem.findUnique({
        where: { id },
        include: { 
            user: true,
            _count: { select: { likes: true } }
        }
    })

    // Check if user liked
    let hasLiked = false
    if (userId && data) {
        const like = await prisma.like.findUnique({
            where: {
                userId_problemId: {
                    userId,
                    problemId: id
                }
            }
        })
        hasLiked = !!like
    }

    // Check if user saved
    let hasSaved = false
    if (userId && data) {
        const save = await prisma.save.findUnique({
            where: {
                userId_problemId: {
                    userId,
                    problemId: id
                }
            }
        })
        hasSaved = !!save
    }

    if (!data) {
        notFound()
    }

    // Map to UI format
    const problem = {
        name: data.name,
        grade: data.grade,
        gym: data.gym,
        locationAddress: data.locationAddress,
        latitude: data.latitude,
        longitude: data.longitude,
        builder: data.user?.username || "Unknown",
        image: data.image ?? undefined,
        description: data.description || "No description available.",
        tags: data.tags,
        stats: {
            likes: data._count.likes,
            attempts: 0,
            completionRate: "0%"
        }
    }

    return (
        <div className="pb-20">
            {/* Hero Image */}
            <ProblemHeroImage 
                problemId={id}
                image={problem.image}
                name={problem.name}
                grade={problem.grade}
                tags={problem.tags}
            />

            <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
                {/* Main Content Split Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
                    {/* Left Column: Actions and Description Stack */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Actions Row */}
                        <div className="flex items-center gap-4 min-h-[36px]">
                            <LikeButton
                                problemId={id}
                                initialHasLiked={hasLiked}
                                initialLikesCount={problem.stats.likes}
                                isLoggedIn={!!userId}
                                showLabel={true}
                                className="hover:opacity-85 transition-opacity"
                            />
                            <SaveButton
                                problemId={id}
                                initialHasSaved={hasSaved}
                                isLoggedIn={!!userId}
                                className="hover:opacity-85 transition-opacity"
                            />
                            <div className="ml-auto flex items-center gap-3">
                                <span className="text-xs md:text-sm font-semibold text-slate-500">
                                    Set by <span className="font-bold text-slate-900">{problem.builder}</span>
                                </span>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="gap-1.5 text-slate-500 hover:text-blue-950 font-semibold text-sm hover:bg-slate-100/50 rounded-lg h-9 px-3"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span>Share</span>
                                </Button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <h3 className="text-base md:text-lg font-bold text-slate-900">Description</h3>
                            <p className="text-sm md:text-base text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {problem.description}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Location Gym Info */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 min-h-[36px]">
                                <MapPin className="h-4 w-4 text-blue-700 shrink-0" />
                                <h4 className="text-sm md:text-base font-semibold text-slate-950 leading-none truncate">
                                    {problem.gym}
                                </h4>
                            </div>
                            {problem.locationAddress && (
                                <p className="text-xs text-slate-500 pl-6">
                                    <a
                                        href={
                                            problem.latitude != null && problem.longitude != null
                                                ? `https://www.google.com/maps/search/?api=1&query=${problem.latitude},${problem.longitude}`
                                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(problem.locationAddress)}`
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-blue-700 hover:underline transition-colors"
                                    >
                                        {problem.locationAddress}
                                    </a>
                                </p>
                            )}
                            <div className="pt-1 pl-6">
                                <LocationDistance
                                    latitude={problem.latitude}
                                    longitude={problem.longitude}
                                    className="inline-flex items-center gap-1 rounded-full bg-blue-50/70 border border-blue-100/50 px-2.5 py-0.5 text-[10px] md:text-xs font-semibold text-blue-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Beta & Comments Section */}
                <section className="py-2">
                    <CommentSection problemId={id} />
                </section>
            </div>
        </div>
    )
}
