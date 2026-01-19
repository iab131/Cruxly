import { prisma } from "@/lib/prisma"
import { ProblemCard } from "@/components/problem-card"
import { Button } from "@/components/ui/button"
import { auth } from "@clerk/nextjs/server"
import { SignInButton } from "@clerk/nextjs"

export default async function FeedPage() {
  const { userId } = await auth();
  const problems = await prisma.problem.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-950 tracking-tight">Discovery Feed</h1>
        <Button variant="outline" className="hidden md:flex border-slate-200 text-slate-700 hover:text-blue-950 hover:bg-slate-50">Filter Problems</Button>
      </div>

      {!userId && (
        <div className="bg-blue-950 rounded-xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-blue-900/20">
            <div>
                <h2 className="text-xl font-bold mb-1">Join the Cruxly Community</h2>
                <p className="text-blue-200">Share your sends, track your progress, and find new projects.</p>
            </div>
            <SignInButton mode="modal">
                <Button variant="secondary" size="lg" className="font-bold">Sign In to Post</Button>
            </SignInButton>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {problems.map((prob) => (
          <ProblemCard
            key={prob.id}
            {...prob}
            builder={prob.user?.username || "Unknown"}
          />
        ))}
      </div>

      <div className="flex justify-center py-8">
        <Button variant="ghost" className="text-slate-500 hover:text-blue-950">Load More</Button>
      </div>
    </div>
  )
}
