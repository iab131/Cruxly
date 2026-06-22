import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from 'uuid';

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

export async function uploadToR2(file: File, folder: string = 'uploads'): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop();
    const key = `${folder}/${uuidv4()}.${ext}`;

    if (!isR2Configured()) {
        const uploadPath = path.join(process.cwd(), "public", "uploads", key);
        await mkdir(path.dirname(uploadPath), { recursive: true });
        await writeFile(uploadPath, buffer);
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

    const publicUrl = process.env.R2_PUBLIC_URL;
    if (isConfigured(publicUrl)) {
        return `${publicUrl}/${key}`;
    }

    return key;
}
