import { Request, Response } from 'express';
import DeviceToken from '../models/DeviceToken.model';
import { deviceSchema } from '@samudra/shared';
import { asyncHandler } from '../utils/asyncHandler';

/** Register or refresh a push device token for the current user. */
export const registerDevice = asyncHandler(async (req: Request, res: Response) => {
  const data = deviceSchema.parse(req.body);
  const userId = (req as any).user.id as string;

  const device = await DeviceToken.findOneAndUpdate(
    { token: data.token },
    {
      $set: {
        token: data.token,
        platform: data.platform,
        user: userId,
        region: data.region ?? 'Unknown',
        lastSeen: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  res.status(201).json({ ok: true, deviceId: device._id });
});

/** Remove a device token (called on logout). */
export const removeDevice = asyncHandler(async (req: Request, res: Response) => {
  await DeviceToken.deleteOne({ token: req.params.token, user: (req as any).user.id });
  res.json({ ok: true });
});
