import { useState, useEffect } from 'react';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: number | null;
  isLoading: boolean;
  error: string | null;
}

interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export const useGeolocation = (enableHighAccuracy: boolean = true) => {
  const [locationState, setLocationState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
    isLoading: true,
    error: null
  });

  const getCurrentLocation = (): Promise<LocationCoordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      setLocationState(prev => ({ ...prev, isLoading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };

          setLocationState({
            ...coords,
            isLoading: false,
            error: null
          });

          resolve(coords);
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }

          setLocationState(prev => ({
            ...prev,
            isLoading: false,
            error: errorMessage
          }));

          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  useEffect(() => {
    getCurrentLocation().catch(console.error);
  }, []);

  return {
    ...locationState,
    getCurrentLocation,
    hasLocation: locationState.latitude !== null && locationState.longitude !== null
  };
};