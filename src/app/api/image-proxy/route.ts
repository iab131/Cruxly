import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url")

    if (!url) {
        return NextResponse.json({ error: "Missing image URL" }, { status: 400 })
    }

    let parsedUrl: URL
    try {
        parsedUrl = new URL(url)
    } catch {
        return NextResponse.json({ error: "Invalid image URL" }, { status: 400 })
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return NextResponse.json({ error: "Unsupported image URL" }, { status: 400 })
    }

    try {
        const response = await fetch(parsedUrl.toString())
        if (!response.ok) {
            return NextResponse.json({ error: "Image could not be loaded" }, { status: 502 })
        }

        const contentType = response.headers.get("content-type") || "application/octet-stream"
        if (!contentType.startsWith("image/")) {
            return NextResponse.json({ error: "URL is not an image" }, { status: 400 })
        }

        return new NextResponse(response.body, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600",
            },
        })
    } catch (error) {
        console.error("Image proxy failed:", error)
        return NextResponse.json({ error: "Image proxy failed" }, { status: 500 })
    }
}
