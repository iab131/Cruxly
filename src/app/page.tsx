import { prisma } from "@/lib/prisma"
import { ProblemCard } from "@/components/problem-card"
import { Button } from "@/components/ui/button"

export default async function FeedPage() {
  const problems = await prisma.problem.findMany({
    include: { setter: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-950 tracking-tight">Discovery Feed</h1>
        <Button variant="outline" className="hidden md:flex border-slate-200 text-slate-700 hover:text-blue-950 hover:bg-slate-50">Filter Problems</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {problems.map((prob) => (
          <ProblemCard
            key={prob.id}
            {...prob}
            builder={prob.setter?.username || "Unknown"}
          />
        ))}
      </div>

      <div className="flex justify-center py-8">
        <Button variant="ghost" className="text-slate-500 hover:text-blue-950">Load More</Button>
      </div>
    </div>
  )
}
