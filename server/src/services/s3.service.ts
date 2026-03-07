import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  ...(process.env.AWS_ACCESS_KEY_ID && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  }),
});

const BUCKET = process.env.S3_BUCKET_NAME || "mikesconeyisland-gallery";
const CDN_BASE = process.env.CDN_BASE_URL || "";
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

export async function uploadImage(
  buffer: Buffer,
  contentType: string
): Promise<{ key: string; url: string }> {
  const key = `cdn/gallery/${randomUUID()}.webp`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  const url = CDN_BASE
    ? `${CDN_BASE}/${key}`
    : `https://${BUCKET}.s3.amazonaws.com/${key}`;

  return { key, url };
}

export async function uploadFile(
  buffer: Buffer,
  contentType: string,
  prefix: string,
  ext: string
): Promise<{ key: string; url: string }> {
  const key = `cdn/${prefix}/${randomUUID()}.${ext}`;

  // Try S3 first
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    const url = CDN_BASE
      ? `${CDN_BASE}/${key}`
      : `https://${BUCKET}.s3.amazonaws.com/${key}`;

    return { key, url };
  } catch (s3Err) {
    // Fallback: save locally and serve via /uploads/
    console.warn("[s3] S3 upload failed, saving locally:", (s3Err as Error).message);
    const dir = path.join(UPLOADS_DIR, prefix);
    await mkdir(dir, { recursive: true });
    const filePath = path.join(UPLOADS_DIR, key);
    await writeFile(filePath, buffer);
    return { key, url: `/uploads/${key}` };
  }
}

export async function deleteImage(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}
