import { ProblemCard } from "@/components/problem-card"
import { Button } from "@/components/ui/button"

// Mock Data
const problems = [
  { id: "1", name: "The Slab", grade: "V3", gym: "Crux Climbing", image: "https://images.unsplash.com/photo-1598555845686-25f00e2a8627?auto=format&fit=crop&q=80&w=800", type: "Boulder", builder: "Alex H." },
  { id: "2", name: "Overhang Beast", grade: "V5", gym: "Vertical Limits", image: "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&q=80&w=800", type: "Boulder", builder: "Sarah J." },
  { id: "3", name: "Crimpy Boi", grade: "V4", gym: "Crux Climbing", image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&q=80&w=800", type: "Boulder", builder: "Mike R." },
  { id: "4", name: "Project X", grade: "V7", gym: "Boulders Inc", image: "https://images.unsplash.com/photo-1578306071477-0c7da0d2e5b7?auto=format&fit=crop&q=80&w=800", type: "Boulder", builder: "Unknown" },
  { id: "5", name: "Pink One in Corner", grade: "V2", gym: "Gravity Vault", image: "https://images.unsplash.com/photo-1601924582970-9238bcb495d9?auto=format&fit=crop&q=80&w=800", type: "Boulder", builder: "Staff" },
  { id: "6", name: "Cave Route", grade: "5.12b", gym: "Rock Spot", image: "https://images.unsplash.com/photo-1516592672327-c36ddab4cf2d?auto=format&fit=crop&q=80&w=800", type: "Sport", builder: "Chris S." },
]

export default function FeedPage() {
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-950 tracking-tight">Discovery Feed</h1>
        <Button variant="outline" className="hidden md:flex border-slate-200 text-slate-700 hover:text-blue-950 hover:bg-slate-50">Filter Problems</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {problems.map((prob) => (
          <ProblemCard key={prob.id} {...prob} />
        ))}
      </div>

      <div className="flex justify-center py-8">
        <Button variant="ghost" className="text-slate-500 hover:text-blue-950">Load More</Button>
      </div>
    </div>
  )
}
