import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { pusherServer } from "@/lib/pusher"
import { uploadToR2 } from "@/lib/r2"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const formData = await request.formData()
        const content = String(formData.get("content") || "").trim()
        const image = formData.get("image")

        if (content.length > 500) {
            return NextResponse.json({ error: "Content exceeds 500 characters" }, { status: 400 })
        }

        if (!(image instanceof File) && !content) {
            return NextResponse.json({ error: "Beta must have text or an annotated image" }, { status: 400 })
        }

        const problem = await prisma.problem.findUnique({ where: { id } })
        if (!problem) {
            return NextResponse.json({ error: "Problem not found" }, { status: 404 })
        }

        const user = await currentUser()
        if (user) {
            const existingUser = await prisma.user.findUnique({ where: { id: userId }, select: { username: true } })
            const safeUsername = user.username || existingUser?.username || `${user.firstName || "Climber"}_${userId.slice(-4)}`
            await prisma.user.upsert({
                where: { id: userId },
                update: { username: safeUsername, image: user.imageUrl },
                create: { id: userId, username: safeUsername, image: user.imageUrl },
            })
        }

        let mediaUrl: string | null = null
        if (image instanceof File) {
            if (!image.type.startsWith("image/")) {
                return NextResponse.json({ error: "Annotated beta must be an image" }, { status: 400 })
            }

            if (image.size > 10 * 1024 * 1024) {
                return NextResponse.json({ error: "Annotated image must be under 10MB" }, { status: 400 })
            }

            mediaUrl = await uploadToR2(image, "beta")
        }

        const comment = await prisma.comment.create({
            data: {
                content: content || null,
                mediaUrl,
                mediaType: mediaUrl ? "image" : null,
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
        })

        await pusherServer.trigger(`problem-${id}`, "comment:created", { comment })

        return NextResponse.json(comment, { status: 201 })
    } catch (error) {
        console.error("Error creating annotated beta:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
