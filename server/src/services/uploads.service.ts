import { randomUUID } from 'crypto';
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';

let s3: S3Client | null = null;

function client(): S3Client {
  if (!s3) {
    s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3;
}

export interface PresignedUpload {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

/** Presign a PUT for a single report image. */
export async function presignReportImage(
  mime: string,
  reportHint?: string,
): Promise<PresignedUpload> {
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
  const key = `reports/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${(reportHint || 'img')
    .slice(0, 24)
    .replace(/[^a-zA-Z0-9-_]/g, '')}.${ext}`;

  const cmd = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key,
    ContentType: mime,
    ContentLength: MAX_SIZE,
  });

  const uploadUrl = await getSignedUrl(client(), cmd, { expiresIn: 300 });

  return {
    uploadUrl,
    key,
    publicUrl: publicUrlFor(key),
    expiresIn: 300,
  };
}

/** Public CDN URL for an object key (R2 public bucket / custom domain). */
export function publicUrlFor(key: string): string {
  if (env.R2_PUBLIC_URL) {
    return `${env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
  }
  return `https://pub-${env.R2_ACCOUNT_ID}.r2.dev/${key}`;
}

/** Verify the object was actually uploaded (used at confirm step). */
export async function confirmUpload(key: string): Promise<boolean> {
  try {
    await client().send(new HeadObjectCommand({ Bucket: env.R2_BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

/** Delete an object (best-effort, used when reports are rejected). */
export async function deleteObject(key: string): Promise<void> {
  try {
    await client().send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET, Key: key }));
  } catch {
    // best-effort
  }
}

export const UPLOAD_MAX_SIZE = MAX_SIZE;
