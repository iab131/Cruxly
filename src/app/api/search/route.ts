import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ problems: [] });
    }

    try {
        const problems = await prisma.problem.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { gym: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    // Join search for username roughly
                    { user: { username: { contains: query, mode: 'insensitive' } } }
                ]
            },
            include: {
                user: true,
                _count: {
                    select: { likes: true }
                }
            },
            take: 20,
            orderBy: {
                createdAt: 'desc'
            }
        });

        const formattedProblems = problems.map(p => ({
            id: p.id,
            name: p.name,
            grade: p.grade,
            gym: p.gym,
            image: p.image,
            type: p.type,
            builder: p.user?.username || "Unknown",
            tags: p.tags,
            likesCount: p._count.likes,
            // Optimization: In a real app we'd also check 'hasLiked' for the current user here
            // but for simple search this is fine.
            hasLiked: false 
        }));

        return NextResponse.json({ problems: formattedProblems });
    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
