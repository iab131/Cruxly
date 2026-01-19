import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

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

        return NextResponse.json({
            count,
            hasLiked
        })

    } catch (error) {
        console.error("[LIKE_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
