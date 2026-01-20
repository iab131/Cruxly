import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "12");
        const offset = (page - 1) * limit;

        const { userId } = await auth();

        // Raw SQL for weighted scoring
        // Mapped table names: "users", "likes", "comments", "problems"
        // Mapped column names: problem_id, user_id, created_at, image_url, etc.
        
        const problems = await prisma.$queryRaw`
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
                (
                    (SELECT COUNT(*) FROM "likes" l WHERE l.problem_id = p.id) * 2 +
                    (SELECT COUNT(*) FROM "comments" c WHERE c.problem_id = p.id) * 3 -
                    (EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600) * 0.1
                ) as score
            FROM "problems" p
            JOIN "users" u ON p.user_id = u.id
            ORDER BY score DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        // Check if there are more results
        const nextOffset = offset + limit;
        // Optimization: Instead of separate count query, we could fetch limit + 1
        // But for now, we'll just check if we got full "limit" results, suggesting maybe more exists.
        // A standard approach is returning null if < limit items returned.
        const hasNextPage = Array.isArray(problems) && problems.length === limit;

        const sanitizedProblems = (problems as any[]).map(p => ({
            ...p,
            likesCount: Number(p.likesCount),
            commentsCount: Number(p.commentsCount),
            score: Number(p.score), 
        }));

        return NextResponse.json({
            problems: sanitizedProblems,
            pagination: {
                page,
                limit,
                hasNextPage
            }
        });

    } catch (error) {
        console.error("Feed fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
