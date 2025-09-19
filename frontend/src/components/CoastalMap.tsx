import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Utility function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapProps {
  alerts: Array<{
    id: string;
    type: "information" | "warning" | "danger";
    title: string;
    lat: number;
    lng: number;
  }>;
  userLocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null;
}

const CoastalMap: React.FC<MapProps> = ({ alerts, userLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize map - center on user location if available, otherwise Mumbai coast
    const initialCenter: [number, number] = userLocation
      ? [userLocation.latitude, userLocation.longitude]
      : [19.076, 72.8777];

    const map = L.map(mapRef.current).setView(initialCenter, 12);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Handle user location updates
  useEffect(() => {
    if (!mapInstance.current || !userLocation) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      mapInstance.current.removeLayer(userMarkerRef.current);
    }

    // Create user location marker with custom icon
    const userIcon = L.divIcon({
      className: "user-location-marker",
      html: `<div style="
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #007bff;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,123,255,0.5);
        position: relative;
      ">
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0,123,255,0.2);
          position: absolute;
          top: -8px;
          left: -8px;
          animation: pulse 2s infinite;
        "></div>
      </div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    // Add user marker
    userMarkerRef.current = L.marker(
      [userLocation.latitude, userLocation.longitude],
      {
        icon: userIcon,
      }
    ).addTo(mapInstance.current).bindPopup(`
        <div style="padding: 8px;">
          <h4 style="margin: 0 0 8px 0; color: #007bff;">Your Location</h4>
          <p style="margin: 0; font-size: 12px; color: #666;">
            ${
              userLocation.accuracy
                ? `Accuracy: ${Math.round(userLocation.accuracy)}m`
                : "Current position"
            }
          </p>
        </div>
      `);

    // Center map on user location
    mapInstance.current.setView(
      [userLocation.latitude, userLocation.longitude],
      13
    );
  }, [userLocation]);

  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear existing markers
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstance.current!.removeLayer(layer);
      }
    });

    // Add alert markers
    alerts.forEach((alert) => {
      const color =
        alert.type === "danger"
          ? "red"
          : alert.type === "warning"
          ? "orange"
          : "blue";

      // Calculate distance from user location if available
      let distanceText = "";
      if (userLocation) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          alert.lat,
          alert.lng
        );
        distanceText =
          distance < 1
            ? `${Math.round(distance * 1000)}m away`
            : `${distance.toFixed(1)}km away`;
      }

      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${color};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          animation: pulse 2s infinite;
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([alert.lat, alert.lng], { icon: customIcon }).addTo(
        mapInstance.current!
      ).bindPopup(`
          <div style="padding: 8px;">
            <h4 style="margin: 0 0 8px 0; color: ${color};">${alert.title}</h4>
            <p style="margin: 0; font-size: 12px; color: #666;">
              Type: ${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
            </p>
            ${
              distanceText
                ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #007bff; font-weight: 500;">${distanceText}</p>`
                : ""
            }
          </div>
        `);
    });
  }, [alerts]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "400px",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    />
  );
};

export default CoastalMap;
