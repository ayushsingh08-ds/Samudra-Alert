import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  WMSTileLayer,
  Marker,
  Popup,
  LayersControl,
  useMap,
} from "react-leaflet";
import { divIcon, Map as LeafletMap } from "leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./AnalystMap.css";
import WaveAnimation from "./WaveAnimation";
import WaveControls from "./WaveControls";

// TypeScript interfaces for props
interface MapReport {
  id: string;
  hazardType: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  severity: "low" | "medium" | "high" | "critical";
  verificationStatus: "pending" | "verified" | "rejected";
  description: string;
  reportTime: Date;
  aiConfidence: number;
  mediaFiles?: any[];
}

interface AnalystMapProps {
  reports?: MapReport[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (report: MapReport) => void;
  onMapReady?: (map: LeafletMap) => void;
  className?: string;
  showReportStats?: boolean;
  showWMSControls?: boolean;
}

// Custom marker icons for different report types
const createCustomIcon = (severity: string, hazardType: string) => {
  const getIconColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "#ff0000";
      case "high":
        return "#ff6600";
      case "medium":
        return "#ffaa00";
      case "low":
        return "#00aa00";
      default:
        return "#666666";
    }
  };

  const getHazardEmoji = (hazardType: string) => {
    if (hazardType.includes("Oil Spill")) return "🛢️";
    if (hazardType.includes("Pollution")) return "☠️";
    if (hazardType.includes("Accident")) return "⚓";
    if (hazardType.includes("Fishing")) return "🎣";
    if (hazardType.includes("Wildlife")) return "🐋";
    return "🌊";
  };

  const color = getIconColor(severity);
  const emoji = getHazardEmoji(hazardType);

  return divIcon({
    html: `
      <div style="
        background: ${color}; 
        border: 3px solid white; 
        border-radius: 50%; 
        width: 40px; 
        height: 40px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-size: 18px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        position: relative;
      ">
        ${emoji}
      </div>
    `,
    className: "custom-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// WMS Layer Control Component
const WMSLayerController = ({ map }: { map: LeafletMap | null }) => {
  const [wmsVisible, setWmsVisible] = useState(true);
  const [wmsOpacity, setWmsOpacity] = useState(0.7);
  const wmsLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    // Create INCOIS WMS layer
    const wmsLayer = L.tileLayer.wms(
      "https://las.incois.gov.in/thredds/wms/las/id-d791105ec5/data_home_las_datasets_amsr2_amsr2_3day.nc.jnl",
      {
        layers: "sst", // Sea Surface Temperature layer
        format: "image/png",
        transparent: true,
        version: "1.3.0",
        crs: L.CRS.EPSG4326,
        opacity: wmsOpacity,
        attribution:
          "© INCOIS (Indian National Centre for Ocean Information Services)",
      }
    );

    wmsLayerRef.current = wmsLayer;

    if (wmsVisible) {
      map.addLayer(wmsLayer);
    }

    return () => {
      if (map.hasLayer(wmsLayer)) {
        map.removeLayer(wmsLayer);
      }
    };
  }, [map, wmsVisible, wmsOpacity]);

  const toggleWMS = useCallback(() => {
    if (!map || !wmsLayerRef.current) return;

    if (wmsVisible) {
      map.removeLayer(wmsLayerRef.current);
    } else {
      map.addLayer(wmsLayerRef.current);
    }
    setWmsVisible(!wmsVisible);
  }, [map, wmsVisible]);

  const handleOpacityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newOpacity = parseFloat(e.target.value);
      setWmsOpacity(newOpacity);

      if (wmsLayerRef.current) {
        wmsLayerRef.current.setOpacity(newOpacity);
      }
    },
    []
  );

  return (
    <div className="wms-controls">
      <div className="wms-toggle">
        <label>
          <input type="checkbox" checked={wmsVisible} onChange={toggleWMS} />
          INCOIS Sea Surface Temperature
        </label>
      </div>
      {wmsVisible && (
        <div className="wms-opacity">
          <label>
            Opacity: {Math.round(wmsOpacity * 100)}%
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={wmsOpacity}
              onChange={handleOpacityChange}
            />
          </label>
        </div>
      )}
    </div>
  );
};

// Map Event Handler Component
const MapEventHandler = ({
  onMapReady,
  onMarkerClick,
}: {
  onMapReady: (map: LeafletMap) => void;
  onMarkerClick: (latlng: any) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  useEffect(() => {
    if (!map) return;

    const handleClick = (e: any) => {
      if (onMarkerClick) {
        onMarkerClick(e.latlng);
      }
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, onMarkerClick]);

  return null;
};

// Report Statistics Panel
const ReportStatsPanel = ({
  reports,
  selectedLocation,
}: {
  reports: MapReport[];
  selectedLocation: any;
}) => {
  const stats = React.useMemo(() => {
    const filtered = selectedLocation
      ? reports.filter(
          (r: MapReport) =>
            Math.abs(r.location.lat - selectedLocation.lat) < 0.1 &&
            Math.abs(r.location.lng - selectedLocation.lng) < 0.1
        )
      : reports;

    return {
      total: filtered.length,
      critical: filtered.filter((r: MapReport) => r.severity === "critical")
        .length,
      high: filtered.filter((r: MapReport) => r.severity === "high").length,
      medium: filtered.filter((r: MapReport) => r.severity === "medium").length,
      low: filtered.filter((r: MapReport) => r.severity === "low").length,
      pending: filtered.filter(
        (r: MapReport) => r.verificationStatus === "pending"
      ).length,
      verified: filtered.filter(
        (r: MapReport) => r.verificationStatus === "verified"
      ).length,
    };
  }, [reports, selectedLocation]);

  return (
    <div className="report-stats-panel">
      <div className="stats-header">
        <h3>📊 Report Statistics</h3>
        {selectedLocation && (
          <span className="location-filter">📍 Filtered by Location</span>
        )}
      </div>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Reports</span>
        </div>
        <div className="stat-item critical">
          <span className="stat-value">{stats.critical}</span>
          <span className="stat-label">Critical</span>
        </div>
        <div className="stat-item high">
          <span className="stat-value">{stats.high}</span>
          <span className="stat-label">High Priority</span>
        </div>
        <div className="stat-item medium">
          <span className="stat-value">{stats.medium}</span>
          <span className="stat-label">Medium</span>
        </div>
        <div className="stat-item low">
          <span className="stat-value">{stats.low}</span>
          <span className="stat-label">Low</span>
        </div>
        <div className="stat-item pending">
          <span className="stat-value">{stats.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-item verified">
          <span className="stat-value">{stats.verified}</span>
          <span className="stat-label">Verified</span>
        </div>
      </div>
    </div>
  );
};

// Main Analyst Map Component
const AnalystMap: React.FC<AnalystMapProps> = ({
  reports = [],
  center = [20.0, 77.0],
  zoom = 5,
  height = "600px",
  onMarkerClick,
  onMapReady,
  className = "",
  showReportStats = true,
  showWMSControls = true,
}) => {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Wave Animation State
  const [waveEnabled, setWaveEnabled] = useState(true);
  const [waveParticleCount, setWaveParticleCount] = useState(150);
  const [waveSpeed, setWaveSpeed] = useState(0.02);
  const [waveAmplitude, setWaveAmplitude] = useState(20);
  const [waveOpacity, setWaveOpacity] = useState(0.6);

  const handleMapReady = useCallback(
    (mapInstance: LeafletMap) => {
      setMap(mapInstance);
      setLoading(false);
      if (onMapReady) {
        onMapReady(mapInstance);
      }
    },
    [onMapReady]
  );

  const handleMarkerClick = useCallback(
    (report: MapReport) => {
      setSelectedLocation(report.location);
      if (onMarkerClick) {
        onMarkerClick(report);
      }
    },
    [onMarkerClick]
  );

  const handleMapClick = useCallback((latlng: any) => {
    setSelectedLocation(latlng);
  }, []);

  return (
    <div className={`analyst-map-container ${className}`}>
      {loading && (
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <p>Loading INCOIS Marine Data...</p>
        </div>
      )}

      <div className="map-wrapper" style={{ height }}>
        <MapContainer
          center={center as [number, number]}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          className="analyst-leaflet-map"
        >
          <MapEventHandler
            onMapReady={handleMapReady}
            onMarkerClick={handleMapClick}
          />

          <LayersControl position="topright">
            {/* Base Layers */}
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Ocean">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri'
              />
            </LayersControl.BaseLayer>

            {/* WMS Overlay Layer */}
            <LayersControl.Overlay
              checked
              name="INCOIS Sea Surface Temperature"
            >
              <WMSTileLayer
                url="https://las.incois.gov.in/thredds/wms/las/id-d791105ec5/data_home_las_datasets_amsr2_amsr2_3day.nc.jnl"
                layers="sst"
                format="image/png"
                transparent={true}
                version="1.3.0"
                crs={L.CRS.EPSG4326}
                opacity={0.7}
                attribution="© INCOIS (Indian National Centre for Ocean Information Services)"
              />
            </LayersControl.Overlay>
          </LayersControl>

          {/* Wave Animation Overlay */}
          {waveEnabled && (
            <WaveAnimation
              enabled={waveEnabled}
              particleCount={waveParticleCount}
              waveSpeed={waveSpeed}
              waveAmplitude={waveAmplitude}
              particleOpacity={waveOpacity}
            />
          )}

          {/* Report Markers */}
          {reports.map((report: any) => (
            <Marker
              key={report.id}
              position={[report.location.lat, report.location.lng]}
              icon={createCustomIcon(report.severity, report.hazardType)}
              eventHandlers={{
                click: () => handleMarkerClick(report),
              }}
            >
              <Popup maxWidth={300} className="analyst-popup">
                <div className="report-popup">
                  <div className="popup-header">
                    <span className="hazard-type">{report.hazardType}</span>
                    <span className={`severity-badge ${report.severity}`}>
                      {report.severity.toUpperCase()}
                    </span>
                  </div>

                  <div className="popup-content">
                    <div className="location-info">
                      <strong>📍 Location:</strong>
                      <div className="coordinates">
                        {report.location.lat.toFixed(4)},{" "}
                        {report.location.lng.toFixed(4)}
                      </div>
                      <div className="address">{report.location.address}</div>
                    </div>

                    <div className="description">
                      <strong>📝 Description:</strong>
                      <p>{report.description.substring(0, 150)}...</p>
                    </div>

                    <div className="metadata">
                      <div className="meta-item">
                        <strong>🤖 AI Confidence:</strong> {report.aiConfidence}
                        %
                      </div>
                      <div className="meta-item">
                        <strong>⏰ Reported:</strong>{" "}
                        {report.reportTime.toLocaleString()}
                      </div>
                      <div className="meta-item">
                        <strong>✅ Status:</strong>
                        <span
                          className={`status-badge ${report.verificationStatus}`}
                        >
                          {report.verificationStatus}
                        </span>
                      </div>
                    </div>

                    {report.mediaFiles && report.mediaFiles.length > 0 && (
                      <div className="media-info">
                        <strong>📎 Attachments:</strong>{" "}
                        {report.mediaFiles.length} files
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* WMS Controls */}
      {showWMSControls && map && (
        <div className="map-controls">
          <WMSLayerController map={map} />
        </div>
      )}

      {/* Report Statistics Panel */}
      {showReportStats && (
        <ReportStatsPanel
          reports={reports}
          selectedLocation={selectedLocation}
        />
      )}

      {/* Map Legend */}
      <div className="map-legend">
        <div className="legend-header">
          <h4>🏷️ Legend</h4>
        </div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-marker critical"></div>
            <span>Critical Incidents</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker high"></div>
            <span>High Priority</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker medium"></div>
            <span>Medium Priority</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker low"></div>
            <span>Low Priority</span>
          </div>
          <div className="legend-item">
            <div className="legend-wms"></div>
            <span>INCOIS SST Data</span>
          </div>
        </div>
      </div>

      {/* Wave Animation Controls */}
      <WaveControls
        enabled={waveEnabled}
        particleCount={waveParticleCount}
        waveSpeed={waveSpeed}
        waveAmplitude={waveAmplitude}
        particleOpacity={waveOpacity}
        onToggle={setWaveEnabled}
        onParticleCountChange={setWaveParticleCount}
        onWaveSpeedChange={setWaveSpeed}
        onWaveAmplitudeChange={setWaveAmplitude}
        onParticleOpacityChange={setWaveOpacity}
      />
    </div>
  );
};

export default AnalystMap;
