// src/components/Map/hooks/useGeolocation.js
import { useState, useCallback } from "react";

export function useGeolocation() {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const locate = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      setLoading(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          
          setUserLocation(location);
          setLoading(false);
          resolve(location);
        },
        (error) => {
          setLoading(false);
          let errorMessage = "Unknown geolocation error";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }, []);

  return { userLocation, loading, locate };
}
