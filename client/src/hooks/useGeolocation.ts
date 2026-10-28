import { useCallback, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export interface Coords {
  lat: number;
  lng: number;
  accuracy?: number;
}

interface GeoState {
  coords: Coords | null;
  loading: boolean;
  error: string | null;
}

/**
 * Cross-platform location: Capacitor Geolocation on native (proper permission flow),
 * browser geolocation API on web.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ coords: null, loading: true, error: null });

  const refresh = useCallback(async (): Promise<Coords | null> => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      let lat: number, lng: number, accuracy: number | undefined;

      if (Capacitor.isNativePlatform()) {
        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 12000 });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        accuracy = pos.coords.accuracy;
      } else {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 12000,
            maximumAge: 60000,
          });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        accuracy = pos.coords.accuracy;
      }

      const coords = { lat, lng, accuracy };
      setState({ coords, loading: false, error: null });
      localStorage.setItem('lastCoords', JSON.stringify(coords));
      return coords;
    } catch (err: unknown) {
      const e = err as { message?: string; code?: number };
      const msg =
        e?.message === 'Permission denied' || e?.code === 1
          ? 'Location permission denied — enable it in app settings to auto-fill location.'
          : 'Could not determine your location.';
      setState({ coords: null, loading: false, error: msg });
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}
