import { Request, Response } from 'express';
import { z } from 'zod';
import { presignReportImage, confirmUpload, publicUrlFor } from '../services/uploads.service';
import { asyncHandler } from '../utils/asyncHandler';

const presignSchema = z.object({
  contentType: z.string().regex(/^image\/(jpeg|png|webp)$/, 'Only jpeg/png/webp allowed'),
  hint: z.string().max(40).optional(),
});

const confirmSchema = z.object({
  key: z.string().min(4),
});

export const presign = asyncHandler(async (req: Request, res: Response) => {
  const { contentType, hint } = presignSchema.parse(req.body);
  const result = await presignReportImage(contentType, hint);
  res.json(result);
});

export const confirm = asyncHandler(async (req: Request, res: Response) => {
  const { key } = confirmSchema.parse(req.body);
  const ok = await confirmUpload(key);
  if (!ok) {
    return res.status(404).json({ message: 'Object not found in storage' });
  }
  res.json({ ok: true, url: publicUrlFor(key) });
});
