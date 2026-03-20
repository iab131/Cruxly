import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { id } = await params

        const problem = await prisma.problem.findUnique({
            where: { id }
        })

        if (!problem) {
            return new NextResponse("Problem not found", { status: 404 })
        }

        // Sync user to DB if not exists (to avoid foreign key violation on Saves)
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

        const existingSave = await prisma.save.findUnique({
            where: {
                userId_problemId: {
                    userId,
                    problemId: id
                }
            }
        })

        let hasSaved = false
        
        if (existingSave) {
            await prisma.save.delete({
                where: {
                    userId_problemId: {
                        userId,
                        problemId: id
                    }
                }
            })
            hasSaved = false
        } else {
            await prisma.save.create({
                data: {
                    userId,
                    problemId: id
                }
            })
            hasSaved = true
        }

        return NextResponse.json({ hasSaved })

    } catch (error) {
        console.error("[PROBLEM_SAVE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
