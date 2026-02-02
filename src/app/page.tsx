import { prisma } from "@/lib/prisma"
import { Feed } from "@/components/feed"
import { Button } from "@/components/ui/button"
import { auth } from "@clerk/nextjs/server"
import { SignInButton } from "@clerk/nextjs"

export default async function FeedPage() {
  const { userId } = await auth();

  // Initial Fetch (Server Side) matching the API logic
  // We double-check for null/empty checks in SQL to avoid errors if strict
  const initialLimit = 12;
  const initialProblems = await prisma.$queryRaw`
    SELECT
        p.id,
        p.image_url as "image",
        p.name as "name",
        p.grade,
        p.gym as "gym",
        p.created_at as "createdAt",
        p.tags,
        u.username as builder,
        u.image as "builderImage",
        (SELECT COUNT(*)::int FROM "likes" l WHERE l.problem_id = p.id) as "likesCount",
        (SELECT COUNT(*)::int FROM "comments" c WHERE c.problem_id = p.id) as "commentsCount",
        EXISTS(SELECT 1 FROM "likes" l WHERE l.problem_id = p.id AND l.user_id = ${userId || '00000000-0000-0000-0000-000000000000'}) as "hasLiked",
        EXISTS(SELECT 1 FROM "saves" s WHERE s.problem_id = p.id AND s.user_id = ${userId || '00000000-0000-0000-0000-000000000000'}) as "hasSaved",
        (
            (SELECT COUNT(*) FROM "likes" l WHERE l.problem_id = p.id) * 2 +
            (SELECT COUNT(*) FROM "comments" c WHERE c.problem_id = p.id) * 3 -
            (EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600) * 0.1
        ) as score
    FROM "problems" p
    JOIN "users" u ON p.user_id = u.id
    ORDER BY score DESC
    LIMIT ${initialLimit}
  `;

  // Fix serialization for Client Component (Decimal/BigInt to number/string)
  const sanitizedProblems = (initialProblems as any[]).map(p => ({
    ...p,
    likesCount: Number(p.likesCount),
    commentsCount: Number(p.commentsCount),
    score: Number(p.score),
    // Ensure dates are strings if needed, though Date objects usually pass to Client components in recent Next.js versions (but mostly as JSON string). 
    // Prisma returns Date objects. Next.js server->client serialization handles Date, but not Decimal.
  }));

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

      {/* @ts-ignore - sanitized */}
      <Feed initialProblems={sanitizedProblems} isLoggedIn={!!userId} />
    </div>
  )
}
