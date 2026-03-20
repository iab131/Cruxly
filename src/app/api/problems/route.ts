import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToR2 } from '@/lib/r2';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    try {
        const problems = await prisma.$queryRaw`
      SELECT * FROM problems
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

        return NextResponse.json(problems);
    } catch (error) {
        console.error('Error fetching problems:', error);
        return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Sync user to DB if not exists
        const existingUser = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
        const safeUsername = user.username || existingUser?.username || `${user.firstName || "Climber"}_${userId.slice(-4)}`;

        const dbUser = await prisma.user.upsert({
            where: { id: userId },
            update: {
                username: safeUsername,
                image: user.imageUrl,
            },
            create: {
                id: userId,
                username: safeUsername,
                image: user.imageUrl,
            },
        });

        const formData = await request.formData();
        const name = formData.get('name') as string;
        const grade = formData.get('grade') as string;
        const gym = formData.get('gym') as string;
        const type = formData.get('type') as string || 'boulder'; // Default to boulder if missing
        const description = formData.get('description') as string;
        const image = formData.get('image') as File;
        const tagsJson = formData.get('tags') as string;
        
        let tags: string[] = [];
        try {
            tags = tagsJson ? JSON.parse(tagsJson) : [];
        } catch (e) {
            console.warn("Failed to parse tags", e);
        }

        if (!name || !grade || !gym || !image) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validation
        if (image.size > 5 * 1024 * 1024) { // 5MB limit
            return NextResponse.json({ error: 'Image size too large (max 5MB)' }, { status: 400 });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(image.type)) {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        }

        // Upload to R2
        let imageUrl: string | null = null;
        try {
             imageUrl = await uploadToR2(image, 'problems');
        } catch (uploadError) {
             console.error("R2 Upload Error:", uploadError);
             return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
        }

        if (!imageUrl) {
             return NextResponse.json({ error: 'Failed to generate image URL' }, { status: 500 });
        }

        // Insert into DB
        const newProblem = await prisma.problem.create({
            data: {
                name,
                grade,
                gym,
                type,
                description,
                image: imageUrl,
                userId: dbUser.id,
                tags: tags, // Start server restart required to enable this
            }
        });

        return NextResponse.json(newProblem, { status: 201 });
    } catch (error) {
        console.error('Error creating problem:', error);
        return NextResponse.json({ error: 'Failed to create problem' }, { status: 500 });
    }
}
