import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { pusherServer } from "@/lib/pusher"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth()
        const { id: problemId } = await params

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }



        // Check if problem exists
        const problem = await prisma.problem.findUnique({
            where: { id: problemId }
        })

        if (!problem) {
            return new NextResponse("Problem not found", { status: 404 })
        }

        // Sync user to DB if not exists (to avoid foreign key violation on Likes)
        const user = await currentUser();
        if (user) {
            const existingUser = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } });
            const safeUsername = user.username || existingUser?.username || `${user.firstName || "Climber"}_${userId.slice(-4)}`;
            await prisma.user.upsert({
                where: { id: userId },
                update: { username: safeUsername, image: user.imageUrl },
                create: { id: userId, username: safeUsername, image: user.imageUrl },
            });
        }

        // Check if user already liked
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_problemId: {
                    userId,
                    problemId
                }
            }
        })

        let hasLiked = false

        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: {
                    userId_problemId: {
                        userId,
                        problemId
                    }
                }
            })
            hasLiked = false
        } else {
            // Like
            await prisma.like.create({
                data: {
                    userId,
                    problemId
                }
            })
            hasLiked = true
        }

        // Get updated count
        const count = await prisma.like.count({
            where: { problemId }
        })

        // Real-time update
        await pusherServer.trigger(`problem-${problemId}`, "like:updated", {
            count
        })

        return NextResponse.json({
            count,
            hasLiked
        })

    } catch (error) {
        console.error("[LIKE_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
