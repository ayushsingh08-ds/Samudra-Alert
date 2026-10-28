import api from './api';

export interface PresignResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
}

/**
 * Upload an image (dataURL or Blob) to R2 via server presigned PUT.
 * Returns the canonical public URL to store on the report.
 */
export async function uploadImageToR2(
  source: Blob | string,
  hint = 'img',
): Promise<string> {
  const blob = typeof source === 'string' ? dataUrlToBlob(source) : source;

  const contentType = blob.type || 'image/jpeg';
  if (!/^image\/(jpeg|png|webp)$/.test(contentType)) {
    throw new Error('Only JPEG/PNG/WebP images are supported');
  }
  if (blob.size > 5 * 1024 * 1024) {
    throw new Error('Image too large (max 5 MB)');
  }

  const { data: presign } = await api.post<PresignResponse>('/uploads/presign', {
    contentType,
    hint,
  });

  const put = await fetch(presign.uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': contentType },
  });
  if (!put.ok) throw new Error(`Upload failed (${put.status})`);

  await api.post('/uploads/confirm', { key: presign.key });

  return presign.publicUrl;
}

/** Base64 dataURL -> Blob (used for offline-queued camera photos). */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(',');
  const mime = meta.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
