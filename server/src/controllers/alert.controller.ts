import { Request, Response } from 'express';
import Alert from '../models/Alert.model';
import DeviceToken from '../models/DeviceToken.model';
import { alertSchema } from '@samudra/shared';
import { asyncHandler } from '../utils/asyncHandler';
import { emitAlertBroadcast } from '../services/realtime.service';
import { sendToRegion } from '../services/notifications.service';
import { regionForPoint } from '@samudra/shared';

/**
 * Create + broadcast an alert (admin only).
 * Pipeline: persist -> socket rooms -> FCM fan-out -> delivery stats.
 */
export const createAlert = asyncHandler(async (req: Request, res: Response) => {
  const data = alertSchema.parse(req.body);
  const userId = (req as any).user.id as string;

  const alert = await Alert.create({
    ...data,
    targetArea: data.targetArea
      ? {
          center: {
            type: 'Point',
            coordinates: [data.targetArea.lng, data.targetArea.lat],
          },
          radiusKm: data.targetArea.radiusKm,
        }
      : null,
    sentBy: userId,
  });

  // 1) Real-time socket broadcast
  emitAlertBroadcast(alert.toJSON());

  // 2) Push fan-out (if requested)
  let deliveryStats = { pushSent: 0, pushFailed: 0 };
  if (data.channels.includes('push')) {
    const regions = data.targetArea
      ? [regionForPoint(data.targetArea.lat, data.targetArea.lng)]
      : await DeviceToken.distinct('region');

    const results = await Promise.all(
      regions.map((region) =>
        sendToRegion(region, {
          title: alert.title,
          body: alert.message,
          data: {
            alertId: String(alert._id),
            severity: alert.severity,
            category: alert.category,
          },
        }),
      ),
    );
    deliveryStats = results.reduce(
      (acc, r) => ({ pushSent: acc.pushSent + r.sent, pushFailed: acc.pushFailed + r.failed }),
      { pushSent: 0, pushFailed: 0 },
    );
    await Alert.findByIdAndUpdate(alert._id, { deliveryStats });
  }

  res.status(201).json({ ...alert.toJSON(), deliveryStats });
});

/** Public list of alerts, newest first. */
export const getAlerts = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 50, severity } = req.query;
  const query: any = { status: 'sent' };
  if (severity && severity !== 'All') query.severity = severity;

  const alerts = await Alert.find(query)
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit), 100))
    .populate('sentBy', 'name');

  res.json(alerts);
});
