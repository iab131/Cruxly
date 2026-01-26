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

export async function PATCH(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { bio } = body;

        // Ensure bio is a string if present
        if (bio !== undefined && typeof bio !== 'string') {
             return NextResponse.json({ error: 'Invalid bio format' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { bio },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
