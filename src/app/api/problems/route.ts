import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToR2 } from '@/lib/r2';

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
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const grade = formData.get('grade') as string;
        const image = formData.get('image') as File;

        if (!title || !grade || !image) {
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
        const imageUrl = await uploadToR2(image, 'problems');

        // Insert into DB
        const result = await prisma.$queryRaw`
      INSERT INTO problems (title, grade, image_url, created_at)
      VALUES (${title}, ${grade}, ${imageUrl}, NOW())
      RETURNING *
    `;

        // prisma.$queryRaw returns an array, we want the first item
        const newProblem = Array.isArray(result) ? result[0] : result;

        return NextResponse.json(newProblem, { status: 201 });
    } catch (error) {
        console.error('Error creating problem:', error);
        return NextResponse.json({ error: 'Failed to create problem' }, { status: 500 });
    }
}
