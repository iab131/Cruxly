import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const cursor = searchParams.get("cursor");
        const limit = Number(searchParams.get("limit")) || 20;

        const comments = await prisma.comment.findMany({
            where: { problemId: id },
            take: limit + 1, // Fetch one extra to determine if there are more
            cursor: cursor ? { id: cursor } : undefined,
            skip: cursor ? 1 : 0,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        image: true,
                    },
                },
            },
        });

        let nextCursor = undefined;
        if (comments.length > limit) {
            const nextItem = comments.pop();
            nextCursor = nextItem?.id;
        }

        return NextResponse.json({
            comments,
            nextCursor,
        });
    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { content, mediaUrl, mediaType } = body;

        // Validate basic requirement: Content OR Media must exist
        const hasContent = content && typeof content === "string" && content.trim().length > 0;
        const hasMedia = mediaUrl && typeof mediaUrl === "string" && mediaType && ["image", "video"].includes(mediaType);

        if (!hasContent && !hasMedia) {
            return NextResponse.json(
                { error: "Comment must have text or media" },
                { status: 400 }
            );
        }

        if (content && content.length > 500) {
            return NextResponse.json(
                { error: "Content exceeds 500 characters" },
                { status: 400 }
            );
        }

        // Verify problem exists
        const problem = await prisma.problem.findUnique({
            where: { id },
        });

        if (!problem) {
            return NextResponse.json(
                { error: "Problem not found" },
                { status: 404 }
            );
        }

        const comment = await prisma.comment.create({
            data: {
                content: hasContent ? content.trim() : null,
                mediaUrl: hasMedia ? mediaUrl : null,
                mediaType: hasMedia ? mediaType : null,
                userId,
                problemId: id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        image: true,
                    },
                },
            },
        });

        // Real-time update
        await pusherServer.trigger(`problem-${id}`, "comment:created", {
            comment
        })

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error("Error creating comment:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
