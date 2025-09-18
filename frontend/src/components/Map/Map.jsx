// src/components/Map/index.jsx
import React, { useReducer, useCallback, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";

// Components
import MapControls from "./MapControls";
import MapLegend from "./MapLegend";
import SelectedCard from "./SelectedCard";
import ZonesLayer from "./ZonesLayer";
import MarkersLayer from "./MarkersLayer";
import FitBoundsHandler from "./FitBoundsHandler";
import ErrorBoundary from "../ErrorBoundary";

// Hooks
import { useMapData } from "./hooks/useMapData";
import { useGeolocation } from "./hooks/useGeolocation";

// Utils
import { normalizeIncident, calculateMapCenter } from "./utils/mapHelpers";
import { fixLeafletIcons } from "./utils/markerUtils";

// Fix Leaflet default icons
fixLeafletIcons();

const initialState = {
  points: [],
  zones: null,
  selected: null,
  loading: false,
  error: null,
  userLocation: null
};

function mapReducer(state, action) {
  switch (action.type) {
    case 'SET_POINTS':
      return { ...state, points: action.payload };
    case 'SET_ZONES':
      return { ...state, zones: action.payload };
    case 'SET_SELECTED':
      return { ...state, selected: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_USER_LOCATION':
      return { ...state, userLocation: action.payload };
    default:
      return state;
  }
}

const Map = React.memo(({
  incidents = [],
  apiUrl = null,
  wsUrl = null,
  zonesGeoJson = null,
  zonesUrl = null,
  tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  tileAttribution = "&copy; OpenStreetMap contributors",
  pollingInterval = 15000,
  onSelect = () => {},
  mapLoadError = false,
}) => {
  const mapRef = useRef(null);
  const [state, dispatch] = useReducer(mapReducer, {
    ...initialState,
    points: incidents.map(normalizeIncident).filter(Boolean)
  });

  // Custom hooks
  const { loading: dataLoading, error: dataError } = useMapData({
    apiUrl,
    wsUrl,
    pollingInterval,
    onDataUpdate: (points) => dispatch({ type: 'SET_POINTS', payload: points })
  });

  const { userLocation, locate } = useGeolocation();

  // Memoized values
  const mapCenter = useMemo(() => 
    calculateMapCenter(state.points), 
    [state.points]
  );

  const mapBounds = useMemo(() => 
    state.points
      .filter(p => p.lat != null && p.lon != null)
      .map(p => [p.lat, p.lon]), 
    [state.points]
  );

  // Event handlers
  const handleMarkerSelect = useCallback((point) => {
    dispatch({ type: 'SET_SELECTED', payload: point });
    onSelect(point);
    
    // Dispatch custom event for cross-component communication
    try {
      window.dispatchEvent(new CustomEvent("analyst:inspect", { 
        detail: point 
      }));
    } catch (error) {
      console.warn("Failed to dispatch inspect event:", error);
    }
  }, [onSelect]);

  const handleFitBounds = useCallback(() => {
    if (mapRef.current && mapBounds.length > 0) {
      try {
        mapRef.current.fitBounds(mapBounds, { padding: [40, 40] });
      } catch (error) {
        console.warn("Failed to fit bounds:", error);
      }
    }
  }, [mapBounds]);

  const handleCenter = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setView(mapCenter, 12);
    }
  }, [mapCenter]);

  const handleLocate = useCallback(() => {
    locate()
      .then((location) => {
        dispatch({ type: 'SET_USER_LOCATION', payload: location });
        if (mapRef.current) {
          mapRef.current.setView([location.lat, location.lon], 13);
        }
      })
      .catch((error) => {
        console.warn("Geolocation failed:", error);
        alert("Unable to get your current location");
      });
  }, [locate]);

  // Error fallback
  if (mapLoadError || dataError) {
    return (
      <div className="pd-glass-card map-error">
        <div className="pd-card-title">🗺️ Map Unavailable</div>
        <div className="error-content">
          <p>{dataError?.message || "Map component failed to load"}</p>
          <button className="pd-btn" onClick={() => window.location.reload()}>
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="dr-map-wrapper">
        <div className="pd-card-title">🗺️ Interactive Risk Map</div>
        
        <div className="dr-map-container">
          <MapContainer
            center={mapCenter}
            zoom={12}
            scrollWheelZoom
            style={{ height: "100%", width: "100%" }}
            whenCreated={(mapInstance) => {
              mapRef.current = mapInstance;
            }}
          >
            <TileLayer 
              url={tileUrl} 
              attribution={tileAttribution} 
            />
            
            <FitBoundsHandler points={state.points} />
            
            <MarkersLayer
              points={state.points}
              onMarkerClick={handleMarkerSelect}
              selectedPoint={state.selected}
            />
            
            <ZonesLayer
              zones={state.zones}
              zonesGeoJson={zonesGeoJson}
              zonesUrl={zonesUrl}
              onZonesLoad={(zones) => dispatch({ type: 'SET_ZONES', payload: zones })}
            />
          </MapContainer>
        </div>

        <MapLegend />

        {state.selected && (
          <SelectedCard
            incident={state.selected}
            onInspect={handleMarkerSelect}
            onClose={() => dispatch({ type: 'SET_SELECTED', payload: null })}
          />
        )}

        <MapControls
          onFitBounds={handleFitBounds}
          onCenter={handleCenter}
          onLocate={handleLocate}
          loading={dataLoading}
          pointsCount={state.points.length}
        />

        {(dataLoading || state.loading) && (
          <div className="map-loading-overlay">
            <div className="loading-spinner">🔄</div>
            <span>Loading map data...</span>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
});

Map.propTypes = {
  incidents: PropTypes.arrayOf(PropTypes.object),
  apiUrl: PropTypes.string,
  wsUrl: PropTypes.string,
  zonesGeoJson: PropTypes.object,
  zonesUrl: PropTypes.string,
  tileUrl: PropTypes.string,
  tileAttribution: PropTypes.string,
  pollingInterval: PropTypes.number,
  onSelect: PropTypes.func,
  mapLoadError: PropTypes.bool,
};

export default Map;
