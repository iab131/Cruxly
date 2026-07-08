import Link from "next/link"
import { MapPin } from "lucide-react"
import { ShareButton } from "@/components/share-button"

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
        builderImage: data.user?.image ?? null,
        image: data.image ?? undefined,
        description: data.description || "No description available.",
        tags: data.tags,
        type: data.type,
        stats: {
            likes: data._count.likes,
            attempts: 0,
            completionRate: "0%"
        }
    }

    const hasBuilder = problem.builder && problem.builder !== "Unknown"

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
                {/* Author + action bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        href={hasBuilder ? `/u/${problem.builder}` : "#"}
                        className="group flex items-center gap-3"
                    >
                        {problem.builderImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={problem.builderImage}
                                alt={problem.builder}
                                className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100"
                            />
                        ) : (
                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-950 text-sm font-bold uppercase text-white ring-2 ring-slate-100">
                                {problem.builder.slice(0, 2)}
                            </span>
                        )}
                        <div className="min-w-0">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Set by</div>
                            <div className="truncate text-sm md:text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                {problem.builder}
                            </div>
                        </div>
                    </Link>

                    <div className="glass-card flex items-center gap-1 rounded-full p-1.5 self-start sm:self-auto">
                        <LikeButton
                            problemId={id}
                            initialHasLiked={hasLiked}
                            initialLikesCount={problem.stats.likes}
                            isLoggedIn={!!userId}
                            className="rounded-full px-3 py-1.5 hover:bg-slate-100 transition-colors"
                        />
                        <span className="h-5 w-px bg-slate-200" />
                        <SaveButton
                            problemId={id}
                            initialHasSaved={hasSaved}
                            isLoggedIn={!!userId}
                            className="rounded-full px-3 py-1.5 hover:bg-slate-100 transition-colors"
                        />
                        <span className="h-5 w-px bg-slate-200" />
                        <ShareButton />
                    </div>
                </div>

                {/* Main Content Split Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
                    {/* Left Column: Description */}
                    <div className="md:col-span-2 space-y-3">
                        <h3 className="text-base md:text-lg font-bold text-slate-900">Description</h3>
                        <p className="text-sm md:text-base text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {problem.description}
                        </p>
                    </div>

                    {/* Right Column: Location — quiet inline row, no box */}
                    <a
                        href={
                            problem.latitude != null && problem.longitude != null
                                ? `https://www.google.com/maps/search/?api=1&query=${problem.latitude},${problem.longitude}`
                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(problem.locationAddress || problem.gym)}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block min-w-0 text-sm leading-snug text-slate-600 transition-colors md:justify-self-end md:text-right"
                    >
                        <span className="flex items-center gap-1.5 font-semibold text-slate-900 transition-colors group-hover:text-blue-700 md:justify-end">
                            <MapPin className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-blue-600" />
                            {problem.gym}
                        </span>
                        {problem.locationAddress && (
                            <span className="block text-xs text-slate-500">{problem.locationAddress}</span>
                        )}
                        <LocationDistance
                            latitude={problem.latitude}
                            longitude={problem.longitude}
                            className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-slate-400"
                        />
                    </a>
                </div>

                {/* Beta & Comments Section */}
                <section className="py-2">
                    <CommentSection problemId={id} />
                </section>
            </div>
        </div>
    )
}
