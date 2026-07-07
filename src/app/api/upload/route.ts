import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { uploadToR2 } from "@/lib/r2";

// Max sizes: 10MB for images, 25MB for videos (must match next.config.ts body limit)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 25 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pre-check Content-Length before attempting to parse the body.
    // If the request is already too large, Next.js may reject it before we
    // can read formData(), so we catch that case early with a friendly error.
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { error: "File is too big. Maximum size is 25 MB for videos and 10 MB for images." },
        { status: 413 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Validate size
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      const limitMb = isImage ? "10 MB" : "25 MB";
      return NextResponse.json(
        { error: `File is too big. Maximum size for ${isImage ? "images" : "videos"} is ${limitMb}.` },
        { status: 413 }
      );
    }

    // Upload using our helper (which automatically falls back to local storage if R2 is not configured!)
    const publicUrl = await uploadToR2(file, "comments");

    return NextResponse.json({ publicUrl });
  } catch (error) {
    console.error("Upload error:", error);

    // Detect body-size errors thrown by Next.js / Node when the request body
    // exceeds the framework limit before we can read it.
    const message = error instanceof Error ? error.message : String(error);
    const isTooBig =
      message.toLowerCase().includes("too large") ||
      message.toLowerCase().includes("payload") ||
      message.toLowerCase().includes("limit") ||
      message.toLowerCase().includes("413");

    if (isTooBig) {
      return NextResponse.json(
        { error: "File is too big. Maximum size is 25 MB for videos and 10 MB for images." },
        { status: 413 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
