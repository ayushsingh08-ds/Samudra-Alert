import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import { env, firebaseConfigured, isTest } from '../config/env';
import DeviceToken, { IDeviceToken } from '../models/DeviceToken.model';

let messaging: Messaging | null = null;

function getMessagingClient(): Messaging | null {
  if (isTest) return null;
  if (!firebaseConfigured) return null;

  if (!messaging) {
    try {
      const serviceAccount = JSON.parse(
        Buffer.from(env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf-8'),
      );
      const app = getApps().length ? getApp() : initializeApp({ credential: cert(serviceAccount) });
      messaging = getMessaging(app);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize Firebase Admin:', err);
      return null;
    }
  }
  return messaging;
}

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Fan out a push to all device tokens registered for a region.
 * Prunes tokens FCM reports as dead/invalid.
 */
export async function sendToRegion(
  region: string,
  payload: PushPayload,
): Promise<{ sent: number; failed: number }> {
  const m = getMessagingClient();
  if (!m) return { sent: 0, failed: 0 };

  const devices = (await DeviceToken.find({ region }).lean()) as unknown as IDeviceToken[];
  if (devices.length === 0) return { sent: 0, failed: 0 };

  const tokens = devices.map((d) => d.token);
  const dead: string[] = [];
  let sent = 0;
  let failed = 0;

  // FCM multicast supports up to 500 per call
  for (let i = 0; i < tokens.length; i += 500) {
    const chunk = tokens.slice(i, i + 500);
    const message = {
      notification: { title: payload.title, body: payload.body },
      data: payload.data ?? {},
      tokens: chunk,
    };

    try {
      const batchResponse = await m.sendEachForMulticast(message);
      batchResponse.responses.forEach((r, idx) => {
        if (r.success) {
          sent += 1;
        } else {
          failed += 1;
          const code = r.error?.code ?? '';
          if (code.includes('registration-token-not-registered') || code.includes('invalid')) {
            dead.push(chunk[idx]);
          }
        }
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('FCM batch error:', err);
      failed += chunk.length;
    }
  }

  if (dead.length > 0) {
    await DeviceToken.deleteMany({ token: { $in: dead } });
  }

  return { sent, failed };
}
