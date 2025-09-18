// src/pages/components/MapWrapper.jsx
import React, { useState, useEffect, useMemo } from "react";
import LoadingSkeleton from "./LoadingSkeleton";

const MapWrapper = React.memo(({ 
  points = [], 
  selected, 
  onPointSelect, 
  loading = false,
  mapApiUrl,
  mapWsUrl,
  zonesUrl,
  ...otherProps 
}) => {
  const isClient = typeof window !== "undefined";
  const [MapComponent, setMapComponent] = useState(null);
  const [mapLoadError, setMapLoadError] = useState(false);

  useEffect(() => {
    if (!isClient) return;

    let mounted = true;

    const loadMapComponent = async () => {
      try {
        // Try to import the Map component
        const mapModule = await import("../../components/Map");
        if (!mounted) return;

        const Component = mapModule?.default || mapModule?.Map;
        if (Component) {
          setMapComponent(() => Component);
        } else {
          throw new Error("Map component not found in module");
        }
      } catch (error) {
        console.warn("Failed to load map component:", error);
        if (!mounted) return;
        
        setMapLoadError(true);
        // Set a fallback placeholder component
        setMapComponent(() => MapPlaceholder);
      }
    };

    loadMapComponent();
    return () => { mounted = false; };
  }, [isClient]);

  const mapProps = useMemo(() => ({
    incidents: points,
    apiUrl: mapApiUrl,
    wsUrl: mapWsUrl,
    zonesUrl: zonesUrl,
    onSelect: onPointSelect,
    mapLoadError,
    ...otherProps
  }), [points, mapApiUrl, mapWsUrl, zonesUrl, onPointSelect, mapLoadError, otherProps]);

  // Server-side rendering fallback
  if (!isClient) {
    return (
      <div className="pd-glass-card">
        <div className="pd-card-title">🗺️ Interactive Map</div>
        <div className="map-placeholder">
          <p>Map will load in browser environment</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !MapComponent) {
    return (
      <div className="pd-glass-card">
        <div className="pd-card-title">🗺️ Interactive Map</div>
        <LoadingSkeleton height={420} />
        <div className="pd-card-note">Loading map component...</div>
      </div>
    );
  }

  // Component not loaded yet
  if (!MapComponent) {
    return (
      <div className="pd-glass-card">
        <div className="pd-card-title">🗺️ Interactive Map</div>
        <LoadingSkeleton height={420} />
      </div>
    );
  }

  // Render the actual map component
  return (
    <div className="pd-glass-card">
      <MapComponent {...mapProps} />
    </div>
  );
});

// Placeholder component when map fails to load
const MapPlaceholder = React.memo(() => (
  <>
    <div className="pd-card-title">🗺️ Map Unavailable</div>
    <div className="map-placeholder">
      <div className="placeholder-content">
        <p>📍 Map component could not be loaded</p>
        <small>Please ensure Map.jsx exists in src/components/ directory</small>
        <div className="placeholder-actions">
          <button 
            className="pd-btn btn-sm"
            onClick={() => window.location.reload()}
          >
            🔄 Retry
          </button>
        </div>
      </div>
    </div>
  </>
));

MapWrapper.displayName = 'MapWrapper';

export default MapWrapper;
