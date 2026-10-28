import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAlertStore } from '../../store/useAlertStore';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Marker Creator
const createCustomIcon = (severity: number) => {
  const color = severity >= 8 ? '#FF5A5F' : severity >= 5 ? '#FFB020' : '#38BDF8';
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px ${color}; animation: pinPulse 2s infinite;"></div>`,
    className: 'custom-pin',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const CoastalMap: React.FC = () => {
  const { alerts } = useAlertStore();
  const indiaCenter: [number, number] = [20.5937, 78.9629];

  return (
    <MapContainer
      center={indiaCenter}
      zoom={5}
      className="w-full h-full z-0"
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {alerts.map((alert) => (
        <Marker
          key={alert.id || alert._id}
          position={[alert.location.coordinates[1], alert.location.coordinates[0]]}
          icon={createCustomIcon(alert.severity)}
        >
          <Popup className="custom-popup">
            <div className="p-2">
              <h3 className="font-bold text-nivara-bg-primary">{alert.title}</h3>
              <p className="text-sm text-gray-600">
                {alert.location.coordinates[1].toFixed(2)}°N, {alert.location.coordinates[0].toFixed(2)}°E
              </p>
              <div className="mt-2 font-bold text-nivara-accent-secondary">
                Severity: {alert.severity}/10
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default CoastalMap;
