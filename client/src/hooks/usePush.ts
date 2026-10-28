import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import type { Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import api from '../services/api';

interface PushHandlers {
  onNotification?: (notification: PushNotificationSchema) => void;
  onAction?: (action: ActionPerformed) => void;
}

/**
 * Registers the device for FCM push on native platforms and posts the token
 * to the backend. No-ops on web (web push would need VAPID setup).
 */
export function usePush(handlers?: PushHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const cleanupFns: (() => void)[] = [];

    const setup = async () => {
      try {
        let status = await PushNotifications.checkPermissions();
        if (status.receive !== 'granted') {
          status = await PushNotifications.requestPermissions();
        }
        if (status.receive !== 'granted') return;

        await PushNotifications.register();

        const tokenSub = PushNotifications.addListener('registration', (t: Token) => {
          api
            .post('/devices', {
              token: t.value,
              platform: 'android',
              region: localStorage.getItem('userRegion') ?? 'Unknown',
            })
            .catch(() => undefined);
        });

        const errorSub = PushNotifications.addListener('registrationError', (err) => {
          console.warn('Push registration failed', err);
        });

        const notifSub = PushNotifications.addListener('pushNotificationReceived', (n) => {
          handlersRef.current?.onNotification?.(n);
        });

        const actionSub = PushNotifications.addListener('pushNotificationActionPerformed', (a) => {
          handlersRef.current?.onAction?.(a);
        });

        // Capacitor 6/7: addListener returns a Promise<PluginListenerHandle>
        cleanupFns.push(
          () => tokenSub.then((h) => h.remove()).catch(() => undefined),
          () => errorSub.then((h) => h.remove()).catch(() => undefined),
          () => notifSub.then((h) => h.remove()).catch(() => undefined),
          () => actionSub.then((h) => h.remove()).catch(() => undefined),
        );
      } catch (err) {
        console.warn('Push setup error', err);
      }
    };

    setup();

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, []);
}
