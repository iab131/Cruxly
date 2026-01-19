import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET() {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Sync user to DB if not exists (or update)
        const dbUser = await prisma.user.upsert({
            where: { id: userId },
            update: {
                username: user.username || user.firstName || "Climber",
                image: user.imageUrl,
            },
            create: {
                id: userId,
                username: user.username || user.firstName || "Climber",
                image: user.imageUrl,
            },
            include: {
                problems: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        return NextResponse.json(dbUser);
    } catch (error) {
        console.error('Error fetching/syncing user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
