import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/s3";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Fetch comment to verify ownership
        const comment = await prisma.comment.findUnique({
            where: { id },
            select: { userId: true, mediaUrl: true }
        });

        if (!comment) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        // Check ownership (TODO: Add admin check here later if needed)
        if (comment.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete media from R2 if exists
        if (comment.mediaUrl) {
            try {
                // Extract key from URL
                // Format: https://pub-[id].r2.dev/comments/[userId]/[uuid].[ext]
                // We stored key as: comments/[userId]/[uuid].[ext]
                const url = new URL(comment.mediaUrl);
                const fileKey = url.pathname.substring(1); // Remove leading slash

                if (fileKey) {
                    await r2.send(new DeleteObjectCommand({
                        Bucket: process.env.R2_BUCKET_NAME,
                        Key: fileKey,
                    }));
                }
            } catch (mediaError) {
                console.error("Failed to delete media from R2:", mediaError);
                // Continue to delete comment even if media deletion fails (avoid orphaned DB records)
            }
        }

        // Delete from Database
        await prisma.comment.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting comment:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
