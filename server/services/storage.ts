import "server-only";

import crypto from "crypto";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/* ===========================================================================
   S3 uploads.

   The browser uploads DIRECTLY to S3 using a short-lived presigned URL. The
   file never passes through Next.js — so a 20MB photo can't blow up the EC2
   box's memory or block the event loop.
   =========================================================================== */

export const S3_ENABLED = Boolean(
  process.env.AWS_S3_BUCKET &&
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
);

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
];

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

let client: S3Client | null = null;

function s3() {
  if (!S3_ENABLED) throw new Error("S3 is not configured");
  if (client) return client;

  client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  return client;
}

/** Public URL for a stored object (CloudFront if set, else the bucket URL). */
export function publicUrl(key: string) {
  const cdn = process.env.AWS_CLOUDFRONT_URL?.replace(/\/$/, "");
  if (cdn) return `${cdn}/${key}`;

  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export type PresignResult =
  | { ok: true; uploadUrl: string; publicUrl: string; key: string }
  | { ok: false; message: string };

/**
 * Creates a one-shot upload URL. Validation happens here (server-side) — the
 * content-type and size are baked into the signature, so the browser can't
 * upload something else.
 */
export async function createUploadUrl(
  fileName: string,
  contentType: string,
  size: number,
  folder = "uploads"
): Promise<PresignResult> {
  if (!S3_ENABLED) {
    return {
      ok: false,
      message:
        "S3 isn't configured. Add AWS_S3_BUCKET, AWS_REGION and keys to .env.",
    };
  }
  if (!ALLOWED_TYPES.includes(contentType)) {
    return { ok: false, message: "Only JPG, PNG, WebP, AVIF or SVG images." };
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_BYTES) {
    return { ok: false, message: "Images must be under 10MB." };
  }

  // Random prefix stops collisions and stops anyone guessing object keys.
  const ext = (fileName.split(".").pop() ?? "jpg").toLowerCase().slice(0, 5);
  const key = `${folder}/${crypto.randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ContentType: contentType,
    ContentLength: size,
    CacheControl: "public, max-age=31536000, immutable",
  });

  const uploadUrl = await getSignedUrl(s3(), command, { expiresIn: 60 });

  return { ok: true, uploadUrl, publicUrl: publicUrl(key), key };
}

export async function deleteObject(key: string) {
  if (!S3_ENABLED) return;
  await s3().send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    })
  );
}
