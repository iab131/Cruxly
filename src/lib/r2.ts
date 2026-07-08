import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

function isConfigured(value: string | undefined) {
    return Boolean(value && !value.includes("your_") && !value.includes("<"));
}

function getR2Endpoint() {
    if (isConfigured(process.env.R2_ENDPOINT)) {
        return process.env.R2_ENDPOINT;
    }

    if (isConfigured(process.env.R2_ACCOUNT_ID)) {
        return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    }

    return undefined;
}

function isR2Configured() {
    return Boolean(
        getR2Endpoint() &&
        isConfigured(process.env.R2_ACCESS_KEY_ID) &&
        isConfigured(process.env.R2_SECRET_ACCESS_KEY) &&
        isConfigured(process.env.R2_BUCKET_NAME) &&
        isConfigured(process.env.R2_PUBLIC_URL)
    );
}

export const r2 = new S3Client({
    region: "auto",
    endpoint: getR2Endpoint(),
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
});

/**
 * Uploads a file and returns its public URL.
 *
 * When Cloudflare R2 is configured, the file is stored in the bucket.
 * Otherwise (e.g. local development without R2 credentials) it falls back to
 * writing into `public/uploads/<folder>/` and returns a same-origin `/uploads/...`
 * path — so uploads work out of the box without any cloud setup.
 */
export async function uploadToR2(file: File, folder: string = 'uploads'): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
    const filename = `${uuidv4()}.${ext}`;
    const key = `${folder}/${filename}`;

    // Local filesystem fallback for development when R2 isn't configured.
    if (!isR2Configured()) {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);
        return `/uploads/${key}`;
    }

    await r2.send(
        new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        })
    );

    return `${process.env.R2_PUBLIC_URL}/${key}`;
}
