import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapContainer = ({ 
  center = [19.0760, 72.8777], // Default to Mumbai
  zoom = 10,
  markers = [],
  alerts = [],
  height = '400px',
  onMapClick,
  showControls = true 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const alertsLayerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current);

    // Initialize layers
    markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    alertsLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);

    // Add map click handler
    if (onMapClick) {
      mapInstanceRef.current.on('click', (e) => {
        onMapClick(e.latlng);
      });
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [center, zoom, onMapClick]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    // Add report markers
    markers.forEach((marker) => {
      const markerIcon = getMarkerIcon(marker.type, marker.severity);
      
      const leafletMarker = L.marker([marker.lat, marker.lng], { icon: markerIcon })
        .bindPopup(createMarkerPopup(marker))
        .addTo(markersLayerRef.current);

      if (marker.onClick) {
        leafletMarker.on('click', () => marker.onClick(marker));
      }
    });
  }, [markers]);

  useEffect(() => {
    if (!mapInstanceRef.current || !alertsLayerRef.current) return;

    // Clear existing alert areas
    alertsLayerRef.current.clearLayers();

    // Add alert areas
    alerts.forEach((alert) => {
      if (alert.coordinates && alert.coordinates.radius) {
        L.circle(
          [alert.coordinates.lat, alert.coordinates.lng],
          {
            radius: alert.coordinates.radius * 1000, // Convert km to meters
            color: getAlertColor(alert.severity),
            fillColor: getAlertColor(alert.severity),
            fillOpacity: 0.2,
            weight: 2
          }
        )
        .bindPopup(createAlertPopup(alert))
        .addTo(alertsLayerRef.current);
      }
    });
  }, [alerts]);

  const getMarkerIcon = (type, severity) => {
    const colors = {
      flood: '#3B82F6',
      storm: '#F59E0B',
      tsunami: '#EF4444',
      pollution: '#10B981',
      default: '#6B7280'
    };

    const size = severity === 'high' ? 30 : severity === 'medium' ? 25 : 20;
    
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${colors[type] || colors.default};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  const getAlertColor = (severity) => {
    const colors = {
      critical: '#DC2626',
      high: '#F59E0B',
      medium: '#3B82F6',
      low: '#10B981'
    };
    return colors[severity] || colors.medium;
  };

  const createMarkerPopup = (marker) => {
    return `
      <div class="p-2">
        <h3 class="font-semibold text-gray-900">${marker.title}</h3>
        <p class="text-sm text-gray-600 mt-1">${marker.description || ''}</p>
        <div class="mt-2 text-xs text-gray-500">
          <div>Type: ${marker.type}</div>
          <div>Severity: ${marker.severity}</div>
          ${marker.reportedAt ? `<div>Reported: ${new Date(marker.reportedAt).toLocaleDateString()}</div>` : ''}
        </div>
      </div>
    `;
  };

  const createAlertPopup = (alert) => {
    return `
      <div class="p-2">
        <h3 class="font-semibold text-gray-900">${alert.title}</h3>
        <p class="text-sm text-gray-600 mt-1">${alert.message}</p>
        <div class="mt-2 text-xs text-gray-500">
          <div>Severity: ${alert.severity}</div>
          <div>Area: ${alert.area}</div>
          <div>Issued: ${new Date(alert.issuedAt).toLocaleDateString()}</div>
        </div>
      </div>
    `;
  };

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="rounded-lg overflow-hidden shadow-sm"
      />
      
      {showControls && (
        <div className="absolute top-2 right-2 bg-white rounded-md shadow-md p-2">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Flood</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Storm</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Tsunami</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Pollution</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapContainer;