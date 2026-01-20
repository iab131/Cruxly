import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/s3";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { filename, contentType, size } = body;

    // Validation
    if (!filename || !contentType || !size) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate File Type
    const isImage = contentType.startsWith("image/");
    const isVideo = contentType.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Validate Size
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

    if (isImage && size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Image too large (max 10MB)" }, { status: 400 });
    }
    if (isVideo && size > MAX_VIDEO_SIZE) {
      return NextResponse.json({ error: "Video too large (max 50MB)" }, { status: 400 });
    }

    // Generate unique filename
    const ext = filename.split(".").pop();
    const uniqueFilename = `${uuidv4()}.${ext}`;
    const key = `comments/${userId}/${uniqueFilename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      ContentLength: size,
    });

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
