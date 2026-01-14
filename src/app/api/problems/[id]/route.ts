import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const problemId = parseInt(id);

    if (isNaN(problemId)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    try {
        const result = await prisma.$queryRaw`
      SELECT * FROM problems
      WHERE id = ${problemId}
    `;

        const problems = result as any[];

        if (problems.length === 0) {
            return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
        }

        return NextResponse.json(problems[0]);
    } catch (error) {
        console.error('Error fetching problem:', error);
        return NextResponse.json({ error: 'Failed to fetch problem' }, { status: 500 });
    }
}
