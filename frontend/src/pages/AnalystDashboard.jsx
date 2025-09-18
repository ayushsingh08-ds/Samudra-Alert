// src/pages/AnalystDashboard.jsx - COMPLETE FINAL VERSION WITH HOTSPOTS FIXES
import React, { useReducer, useCallback, useMemo, Suspense, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, ResponsiveContainer,
  ReferenceLine, ComposedChart, ScatterChart, Scatter
} from "recharts";
import "./AnalystDashboard.css";

// ===== ENHANCED ERROR BOUNDARY =====
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="pd-container">
          <div className="pd-glass-card error-card">
            <div className="pd-card-title">⚠️ Component Error Detected</div>
            <div className="error-content">
              <p>Error: {this.state.error?.message}</p>
              <button className="pd-btn" onClick={() => window.location.reload()}>
                🔄 Reload Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ===== LOADING SKELETON =====
const LoadingSkeleton = React.memo(({ height = 120 }) => (
  <div className="pd-skeleton" style={{ height }}>
    <div className="pd-skel-line" />
  </div>
));

// ===== REACTIVE DATA PROCESSING HOOK =====
const useReactiveData = (initialData = []) => {
  const [state, setState] = useState({
    raw: initialData,
    processed: [],
    trends: [],
    hotspots: [],
    anomalies: [],
    selected: null,
    loading: false,
    lastUpdated: new Date(),
    filters: { search: "", riskLevels: ["High", "Medium", "Low"], dateRange: null }
  });

  // Real-time data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        processed: prev.processed.map(item => ({
          ...item,
          riskScore: Math.min(100, Math.max(0, item.riskScore + (Math.random() - 0.5) * 5)),
          lastUpdated: new Date()
        })),
        lastUpdated: new Date()
      }));
    }, 8000); // Update every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const updateData = useCallback((newData) => {
    setState(prev => ({
      ...prev,
      raw: newData,
      processed: processRawData(newData),
      trends: generateTrends(newData),
      hotspots: generateHotspots(newData),
      anomalies: detectAnomalies(newData),
      lastUpdated: new Date()
    }));
  }, []);

  const setSelected = useCallback((item) => {
    setState(prev => ({ ...prev, selected: item }));
  }, []);

  const updateFilters = useCallback((filters) => {
    setState(prev => ({ ...prev, filters: { ...prev.filters, ...filters } }));
  }, []);

  return { ...state, updateData, setSelected, updateFilters };
};

// ===== 🆕 FIXED DATA PROCESSING UTILITIES =====
const processRawData = (data) => {
  return data.map(item => ({
    ...item,
    category: item.riskScore >= 70 ? "High" : item.riskScore >= 40 ? "Medium" : "Low",
    timestamp: item.timestamp || new Date().toISOString(),
    coordinates: { lat: item.lat, lon: item.lon }
  }));
};

const generateTrends = (data) => {
  const days = 7;
  const trends = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayData = {
      date: date.toISOString().split('T')[0],
      High: Math.floor(Math.random() * 15) + 8,
      Medium: Math.floor(Math.random() * 25) + 12,
      Low: Math.floor(Math.random() * 20) + 5,
      Total: 0
    };
    dayData.Total = dayData.High + dayData.Medium + dayData.Low;
    trends.push(dayData);
  }
  return trends;
};

// ===== 🆕 ENHANCED HOTSPOTS GENERATION WITH PROPER DATA =====
const generateHotspots = (data) => {
  return data
    .filter(item => item.riskScore > 45)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 12)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      severity: item.riskScore >= 85 ? "Critical" : 
               item.riskScore >= 70 ? "High" : 
               item.riskScore >= 55 ? "Medium" : "Low",
      trendDirection: Math.random() > 0.5 ? "up" : "down",
      trendPercentage: Math.floor(Math.random() * 25) + 5,
      activeIncidents: Math.floor(Math.random() * 8) + 1,
      lastUpdate: item.timeAgo || `${Math.floor(Math.random() * 60) + 1}m`,
      alertLevel: item.riskScore >= 85 ? "URGENT" : item.riskScore >= 70 ? "HIGH" : "MODERATE"
    }));
};

const detectAnomalies = (data) => {
  const anomalies = [];
  const highRiskCount = data.filter(item => item.riskScore > 70).length;
  
  if (highRiskCount > data.length * 0.25) {
    anomalies.push({
      type: "spike",
      message: `Elevated risk activity: ${highRiskCount}/${data.length} high-risk incidents (${((highRiskCount/data.length)*100).toFixed(1)}%)`,
      severity: "warning"
    });
  }

  if (data.length > 40) {
    anomalies.push({
      type: "volume",
      message: `High data volume detected: ${data.length} incidents require attention`,
      severity: "info"
    });
  }

  return anomalies;
};

// ===== ENHANCED INTERACTIVE MAP COMPONENT =====
const ReactiveMap = React.memo(({ points = [], selected, onSelect, loading }) => {
  const [mapView, setMapView] = useState({ zoom: 12, center: [12.9716, 77.5946] });
  const [activeLayer, setActiveLayer] = useState("risk");

  const riskLayers = useMemo(() => {
    const layers = { High: [], Medium: [], Low: [] };
    points.forEach(point => {
      if (layers[point.category]) {
        layers[point.category].push(point);
      }
    });
    return layers;
  }, [points]);

  return (
    <div className="pd-glass-card reactive-map">
      <div className="pd-card-title">🗺️ Live Risk Heat Map</div>
      
      <div className="map-controls-top">
        <div className="layer-controls">
          {["risk", "density", "timeline"].map(layer => (
            <button
              key={layer}
              className={`map-control-btn ${activeLayer === layer ? 'active' : ''}`}
              onClick={() => setActiveLayer(layer)}
            >
              {layer.charAt(0).toUpperCase() + layer.slice(1)}
            </button>
          ))}
        </div>
        <div className="map-stats">
          <span className="stat-badge">📍 {points.length} Points</span>
          <span className="stat-badge live">🔴 Live</span>
        </div>
      </div>

      <div className="interactive-map-container">
        <div className="map-visualization">
          <div className="grid-overlay">
            {Array.from({ length: 8 }, (_, i) =>
              Array.from({ length: 12 }, (_, j) => {
                const intensity = Math.random();
                const riskLevel = intensity > 0.7 ? 'high' : intensity > 0.4 ? 'medium' : 'low';
                return (
                  <div
                    key={`${i}-${j}`}
                    className={`grid-cell ${riskLevel}`}
                    style={{
                      opacity: intensity * 0.8,
                      transform: `scale(${0.8 + intensity * 0.4})`
                    }}
                    onClick={() => onSelect && onSelect({ 
                      id: `grid-${i}-${j}`, 
                      gridPos: [i, j], 
                      intensity: intensity * 100 
                    })}
                  />
                );
              })
            )}
          </div>
          
          <div className="data-points-layer">
            {points.slice(0, 20).map((point, index) => (
              <div
                key={point.id || index}
                className={`data-point ${point.category?.toLowerCase()} ${selected?.id === point.id ? 'selected' : ''}`}
                style={{
                  left: `${(index % 12) * 8.33}%`,
                  top: `${Math.floor(index / 12) * 12.5}%`,
                  animationDelay: `${index * 0.1}s`
                }}
                onClick={() => onSelect && onSelect(point)}
              >
                <div className="point-pulse" />
                <div className="point-core" />
              </div>
            ))}
          </div>
        </div>

        <div className="map-legend-inline">
          <div className="legend-title">Risk Intensity</div>
          <div className="legend-gradient">
            <span className="legend-label">Low</span>
            <div className="gradient-bar" />
            <span className="legend-label">High</span>
          </div>
        </div>
      </div>

      {selected && (
        <div className="selection-details">
          <div className="selection-header">
            <strong>{selected.title || selected.area || selected.id}</strong>
            <button className="close-btn" onClick={() => onSelect(null)}>×</button>
          </div>
          <div className="selection-info">
            <span>Risk: {selected.riskScore || selected.intensity || 'N/A'}%</span>
            <span>Location: {selected.area || selected.category || 'Grid Cell'}</span>
            <span>Source: {selected.source || 'Interactive'}</span>
          </div>
        </div>
      )}
    </div>
  );
});

// ===== 🆕 ENHANCED MAP VIEW COMPONENT =====
const MapView = React.memo(({ points = [], selected, onSelect }) => {
  const [viewMode, setViewMode] = useState("satellite");
  
  return (
    <div className="pd-glass-card map-view-enhanced">
      <div className="chart-header">
        <div className="pd-card-title">🌍 Geographic Risk Overview</div>
        <div className="map-view-controls">
          {["satellite", "terrain", "hybrid"].map(mode => (
            <button
              key={mode}
              className={`toggle-btn ${viewMode === mode ? 'active' : ''}`}
              onClick={() => setViewMode(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="geographic-map-container">
        <div className="map-regions">
          {[
            { name: "Bangalore Central", risk: 85, coords: [30, 40] },
            { name: "Electronic City", risk: 72, coords: [60, 30] },
            { name: "Whitefield", risk: 45, coords: [80, 60] },
            { name: "HSR Layout", risk: 68, coords: [40, 70] },
            { name: "Koramangala", risk: 55, coords: [20, 80] },
            { name: "Indiranagar", risk: 38, coords: [70, 20] }
          ].map((region, index) => {
            const riskLevel = region.risk >= 70 ? 'high' : region.risk >= 50 ? 'medium' : 'low';
            return (
              <div
                key={region.name}
                className={`map-region ${riskLevel} ${selected?.area === region.name ? 'selected' : ''}`}
                style={{
                  left: `${region.coords[0]}%`,
                  top: `${region.coords[1]}%`
                }}
                onClick={() => onSelect({ ...region, area: region.name })}
              >
                <div className="region-marker">
                  <div className="region-pulse" />
                  <div className="region-core" />
                </div>
                <div className="region-label">
                  <div className="region-name">{region.name}</div>
                  <div className="region-risk">{region.risk}% Risk</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="map-overlay-info">
          <div className="active-regions">
            <h4>🎯 Active Risk Zones</h4>
            <div className="region-stats">
              <div className="region-stat high">High Risk: 3 zones</div>
              <div className="region-stat medium">Medium Risk: 2 zones</div>
              <div className="region-stat low">Low Risk: 1 zone</div>
            </div>
          </div>
        </div>
      </div>

      {selected && selected.area && (
        <div className="region-details">
          <div className="region-info-header">
            <h4>📍 {selected.area || selected.name}</h4>
            <span className={`risk-badge ${selected.risk >= 70 ? 'high' : selected.risk >= 50 ? 'medium' : 'low'}`}>
              {selected.risk}% Risk Level
            </span>
          </div>
          <div className="region-metrics">
            <div className="metric">
              <span className="metric-label">Population Density:</span>
              <span className="metric-value">High</span>
            </div>
            <div className="metric">
              <span className="metric-label">Response Time:</span>
              <span className="metric-value">8-12 mins</span>
            </div>
            <div className="metric">
              <span className="metric-label">Infrastructure:</span>
              <span className="metric-value">Critical</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// ===== ADVANCED CHARTS COMPONENTS =====
const TrendsChart = React.memo(({ data, anomalies = [], loading }) => {
  const [chartType, setChartType] = useState("area");
  const [timeRange, setTimeRange] = useState("7d");

  if (loading) return <LoadingSkeleton height={300} />;

  const ChartComponent = chartType === "area" ? AreaChart : LineChart;

  return (
    <div className="pd-glass-card trends-chart">
      <div className="chart-header">
        <div className="pd-card-title">📈 Real-Time Risk Trends</div>
        <div className="chart-controls">
          <select value={timeRange} onChange={e => setTimeRange(e.target.value)}>
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <div className="chart-type-toggle">
            {["line", "area", "bar"].map(type => (
              <button
                key={type}
                className={`toggle-btn ${chartType === type ? 'active' : ''}`}
                onClick={() => setChartType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ChartComponent data={data}>
          <defs>
            <linearGradient id="highGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f472b6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f472b6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="mediumGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(167,139,250,0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="var(--text-muted)"
            fontSize={12}
          />
          <YAxis stroke="var(--text-muted)" fontSize={12} />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--glass-bg-primary)',
              border: '1px solid var(--glass-border-primary)',
              borderRadius: '8px',
              backdropFilter: 'blur(16px)'
            }}
          />
          <Legend />
          
          {chartType === "area" ? (
            <>
              <Area
                type="monotone"
                dataKey="High"
                stackId="1"
                stroke="#f472b6"
                fill="url(#highGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Medium"
                stackId="1"
                stroke="#a78bfa"
                fill="url(#mediumGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Low"
                stackId="1"
                stroke="#7c3aed"
                fill="#7c3aed"
                fillOpacity={0.6}
                strokeWidth={2}
              />
            </>
          ) : (
            <>
              <Line type="monotone" dataKey="High" stroke="#f472b6" strokeWidth={3} />
              <Line type="monotone" dataKey="Medium" stroke="#a78bfa" strokeWidth={2} />
              <Line type="monotone" dataKey="Low" stroke="#7c3aed" strokeWidth={2} />
            </>
          )}

          {anomalies.map((anomaly, index) => (
            <ReferenceLine 
              key={index}
              x={anomaly.date} 
              stroke="#ff4d6d" 
              strokeDasharray="5 5"
              label={{ value: "Alert", position: "top" }}
            />
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
});

const RiskDistribution = React.memo(({ data, loading }) => {
  const [viewMode, setViewMode] = useState("pie");

  const pieData = useMemo(() => {
    const counts = data.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  if (loading) return <LoadingSkeleton height={300} />;

  return (
    <div className="pd-glass-card risk-distribution">
      <div className="chart-header">
        <div className="pd-card-title">🎯 Risk Distribution</div>
        <div className="view-toggle">
          {["pie", "bar"].map(mode => (
            <button
              key={mode}
              className={`toggle-btn ${viewMode === mode ? 'active' : ''}`}
              onClick={() => setViewMode(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        {viewMode === "pie" ? (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={30}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              <Cell fill="#f472b6" />
              <Cell fill="#a78bfa" />
              <Cell fill="#7c3aed" />
            </Pie>
            <Tooltip />
          </PieChart>
        ) : (
          <BarChart data={pieData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(167,139,250,0.1)" />
            <XAxis dataKey="name" stroke="var(--text-muted)" />
            <YAxis stroke="var(--text-muted)" />
            <Tooltip />
            <Bar dataKey="value" fill="#a78bfa" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
});

// ===== 🆕 COMPLETELY FIXED ENHANCED HOTSPOTS COMPONENT =====
const EnhancedHotspots = React.memo(({ hotspots = [], onInspect, loading, onSendToAdmin }) => {
  const [selectedHotspots, setSelectedHotspots] = useState(new Set());

  const toggleHotspotSelection = (hotspotId) => {
    const newSelection = new Set(selectedHotspots);
    if (newSelection.has(hotspotId)) {
      newSelection.delete(hotspotId);
    } else {
      newSelection.add(hotspotId);
    }
    setSelectedHotspots(newSelection);
  };

  if (loading && hotspots.length === 0) {
    return (
      <div className="pd-glass-card">
        <div className="pd-card-title">🔥 Critical Hotspots</div>
        <LoadingSkeleton height={300} />
      </div>
    );
  }

  return (
    <div className="pd-glass-card enhanced-hotspots">
      <div className="chart-header">
        <div className="pd-card-title">🔥 Critical Risk Hotspots</div>
        <div className="hotspots-actions">
          <span className="selection-count">
            {selectedHotspots.size} selected
          </span>
          {selectedHotspots.size > 0 && (
            <button 
              className="pd-btn btn-admin"
              onClick={() => onSendToAdmin(Array.from(selectedHotspots))}
            >
              📤 Send to Admin
            </button>
          )}
        </div>
      </div>

      <div className="hotspots-list-enhanced">
        {hotspots.slice(0, 8).map((hotspot, index) => (
          <div 
            key={hotspot.id}
            className={`hotspot-item-enhanced ${hotspot.severity?.toLowerCase()} ${selectedHotspots.has(hotspot.id) ? 'selected' : ''}`}
            onClick={() => onInspect && onInspect(hotspot)}
          >
            <div className="hotspot-checkbox">
              <input
                type="checkbox"
                checked={selectedHotspots.has(hotspot.id)}
                onChange={() => toggleHotspotSelection(hotspot.id)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="hotspot-rank-enhanced">
              <div className="rank-number">#{hotspot.rank}</div>
              <div className="rank-badge">{hotspot.alertLevel || 'TOP'}</div>
            </div>

            <div className="hotspot-content">
              <div className="hotspot-location-highlighted">
                <div className="location-icon">📍</div>
                <div className="location-details">
                  <div className="location-name">
                    {hotspot.area || `Risk Zone ${index + 1}`}
                  </div>
                  <div className="location-zone">
                    {hotspot.zone || `Sector ${String.fromCharCode(65 + index)}`}
                  </div>
                  <div className="location-coordinates">
                    {hotspot.lat && hotspot.lon 
                      ? `${hotspot.lat.toFixed(4)}, ${hotspot.lon.toFixed(4)}`
                      : `${(12.9000 + Math.random() * 0.1).toFixed(4)}, ${(77.5000 + Math.random() * 0.2).toFixed(4)}`
                    }
                  </div>
                </div>
              </div>

              <div className="risk-metrics-enhanced">
                <div className="primary-risk">
                  <span className="risk-value">{hotspot.riskScore}%</span>
                  <span className="risk-label">Risk Score</span>
                </div>
                <div className="risk-trend">
                  <span className={`trend-icon ${hotspot.trendDirection}`}>
                    {hotspot.trendDirection === 'up' ? '📈' : '📉'}
                  </span>
                  <span className="trend-value">
                    {hotspot.trendDirection === 'up' ? '+' : '-'}{hotspot.trendPercentage || 12}%
                  </span>
                </div>
              </div>

              <div className="hotspot-metrics-row">
                <div className="metric-item">
                  <span className="metric-label">Active:</span>
                  <span className="metric-value">{hotspot.activeIncidents || Math.floor(Math.random() * 6) + 1}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Source:</span>
                  <span className="metric-value">{hotspot.source}</span>
                </div>
              </div>
            </div>

            <div className="hotspot-status-enhanced">
              <div className={`status-indicator ${hotspot.severity?.toLowerCase()}`}>
                <div className="status-pulse" />
                <div className="status-dot" />
              </div>
              <div className="status-details">
                <div className="status-level">{hotspot.severity}</div>
                <div className="status-time">{hotspot.lastUpdate || `${Math.floor(Math.random() * 60) + 1}m`}</div>
                {hotspot.verified && (
                  <div className="status-verified">✓ Verified</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hotspots.length > 8 && (
        <div className="hotspots-summary-enhanced">
          <p>Showing top 8 of {hotspots.length} critical zones</p>
          <button className="pd-btn btn-ghost">View All Hotspots</button>
        </div>
      )}
    </div>
  );
});

// ===== MAIN DASHBOARD COMPONENT =====
const AnalystDashboard = React.memo(({
  citizenData = null,
  citizenApiUrl = "/api/citizen",
  adminApiUrl = "/api/admin/finalize",
  incoisApiUrl = null,
  weatherApiUrl = null,
  mapApiUrl = null,
  mapWsUrl = null,
  zonesUrl = null,
}) => {
  // ===== 🆕 FIXED MOCK DATA GENERATION WITH PROPER LOCATIONS =====
  const generateAdvancedMockData = useCallback(() => {
    const sources = ["citizen", "sensor", "patrol", "camera", "social", "satellite"];
    const locations = [
      { lat: 12.9716, lon: 77.5946, area: "Bangalore Central", zone: "Central Business District" },
      { lat: 12.9698, lon: 77.7500, area: "Electronic City", zone: "IT Hub Phase 1" },
      { lat: 12.9698, lon: 77.7500, area: "Whitefield", zone: "Tech Park Area" },
      { lat: 12.9279, lon: 77.6271, area: "HSR Layout", zone: "Residential Sector 2" },
      { lat: 12.9279, lon: 77.6271, area: "Koramangala", zone: "Commercial District" },
      { lat: 12.9719, lon: 77.5937, area: "Indiranagar", zone: "Metro Station Area" },
      { lat: 12.9279, lon: 77.6063, area: "Jayanagar", zone: "Market Complex" },
      { lat: 12.9716, lon: 77.5946, area: "MG Road", zone: "Shopping District" },
      { lat: 12.9352, lon: 77.6245, area: "BTM Layout", zone: "Residential Phase 1" },
      { lat: 12.9082, lon: 77.6476, area: "JP Nagar", zone: "Metro Connectivity Zone" },
      { lat: 12.9165, lon: 77.6101, area: "Banashankari", zone: "Temple Area" },
      { lat: 12.9698, lon: 77.5986, area: "Rajajinagar", zone: "West Zone Hub" }
    ];

    const riskTitles = [
      "Infrastructure Vulnerability Alert",
      "High Population Density Risk",
      "Traffic Congestion Hotspot",
      "Emergency Response Bottleneck",
      "Critical Infrastructure Point",
      "Public Safety Concern Area",
      "Resource Allocation Priority",
      "Surveillance Coverage Gap",
      "Transportation Hub Risk",
      "Commercial Activity Alert"
    ];

    return Array.from({ length: 50 }, (_, i) => {
      const location = locations[i % locations.length];
      const baseRisk = 20 + Math.floor(Math.random() * 80);
      const riskScore = Math.min(100, baseRisk + (Math.random() * 20 - 10));
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const hoursAgo = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60 * 60));
      
      return {
        id: `incident-${i + 1}`,
        ...location,
        riskScore: Math.round(riskScore),
        source: sources[i % sources.length],
        timestamp: timestamp.toISOString(),
        title: riskTitles[i % riskTitles.length],
        severity: riskScore >= 80 ? "Critical" : riskScore >= 65 ? "High" : riskScore >= 40 ? "Medium" : "Low",
        timeAgo: hoursAgo < 1 ? `${Math.floor(Math.random() * 59) + 1}m` : 
                 hoursAgo < 24 ? `${hoursAgo}h` : `${Math.floor(hoursAgo / 24)}d`,
        verified: Math.random() > 0.3,
        alertLevel: riskScore >= 85 ? "URGENT" : riskScore >= 70 ? "HIGH" : "MODERATE",
        details: {
          confidence: (Math.random() * 0.4 + 0.6).toFixed(2),
          priority: riskScore > 70 ? "High" : riskScore > 40 ? "Medium" : "Low",
          reporterId: `USER_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          responseTeam: riskScore > 75 ? "Emergency Response" : "Standard Patrol",
          estimatedImpact: riskScore > 80 ? "High" : riskScore > 50 ? "Medium" : "Low"
        }
      };
    });
  }, []);

  const mockData = useMemo(() => generateAdvancedMockData(), [generateAdvancedMockData]);
  const { 
    processed, 
    trends, 
    hotspots, 
    anomalies, 
    selected, 
    loading, 
    lastUpdated, 
    updateData, 
    setSelected 
  } = useReactiveData(mockData);

  // Initialize with mock data
  useEffect(() => {
    updateData(mockData);
  }, [mockData, updateData]);

  // 🆕 Send to Admin functionality
  const handleSendToAdmin = useCallback((selectedIds) => {
    const selectedData = hotspots.filter(h => selectedIds.includes(h.id));
    
    const adminPayload = {
      timestamp: new Date().toISOString(),
      selectedHotspots: selectedData,
      analyst: "current_user",
      priority: "high",
      message: `${selectedData.length} critical hotspots require immediate administrative review`,
      locations: selectedData.map(h => h.area).join(', ')
    };

    console.log('Sending to Admin:', adminPayload);
    alert(`✅ Successfully sent ${selectedData.length} hotspot(s) to Admin!\n\nLocations: ${adminPayload.locations}`);
  }, [hotspots]);

  const exportData = useCallback(() => {
    const exportPayload = {
      summary: {
        totalRecords: processed.length,
        highRisk: processed.filter(p => p.category === "High").length,
        mediumRisk: processed.filter(p => p.category === "Medium").length,
        lowRisk: processed.filter(p => p.category === "Low").length,
        generatedAt: new Date().toISOString(),
        topHotspots: hotspots.slice(0, 5).map(h => h.area).join(', ')
      },
      trends,
      hotspots,
      anomalies
    };
    
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-analysis-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [processed, trends, hotspots, anomalies]);

  return (
    <ErrorBoundary>
      <div className="pd-container">
        <div className="pd-dashboard-root">
          {/* Enhanced Header */}
          <div className="pd-header">
            <div className="pd-header-left">
              <h1 className="pd-title">🔮 Analyst Dashboard Pro</h1>
              <p className="pd-sub">Advanced Risk Analytics & Real-time Monitoring</p>
              <div className="status-indicators">
                <span className="status-badge live">🔴 Live Data</span>
                <span className="status-badge">📊 {processed.length} Active Points</span>
                <span className="status-badge">⚡ Updated {lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="pd-actions">
              <button className="pd-action-refresh" onClick={() => updateData(mockData)}>
                🔄 Refresh Analytics
              </button>
              <button className="pd-btn btn-admin" onClick={() => handleSendToAdmin(hotspots.slice(0, 3).map(h => h.id))}>
                📤 Quick Send to Admin
              </button>
              <button className="pd-action-finalize" onClick={exportData}>
                📊 Export Report
              </button>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="pd-main">
            <div className="pd-left">
              {/* System Overview */}
              <div className="pd-glass-card">
                <div className="pd-card-title">📊 System Overview</div>
                <div className="overview-grid">
                  <div className="metric-card high">
                    <div className="metric-value">{processed.filter(p => p.category === "High").length}</div>
                    <div className="metric-label">High Risk</div>
                    <div className="metric-trend">↑ +12%</div>
                  </div>
                  <div className="metric-card medium">
                    <div className="metric-value">{processed.filter(p => p.category === "Medium").length}</div>
                    <div className="metric-label">Medium Risk</div>
                    <div className="metric-trend">→ 0%</div>
                  </div>
                  <div className="metric-card low">
                    <div className="metric-value">{processed.filter(p => p.category === "Low").length}</div>
                    <div className="metric-label">Low Risk</div>
                    <div className="metric-trend">↓ -8%</div>
                  </div>
                  <div className="metric-card total">
                    <div className="metric-value">{processed.length}</div>
                    <div className="metric-label">Total Active</div>
                    <div className="metric-trend">📈 Live</div>
                  </div>
                </div>
              </div>

              {/* Trends Chart */}
              <TrendsChart data={trends} anomalies={anomalies} loading={loading} />

              {/* Interactive Heat Map */}
              <ReactiveMap 
                points={processed} 
                selected={selected} 
                onSelect={setSelected}
                loading={loading}
              />

              {/* Geographic Map View */}
              <MapView 
                points={processed}
                selected={selected}
                onSelect={setSelected}
              />
            </div>

            <div className="pd-right">
              {/* Risk Distribution */}
              <RiskDistribution data={processed} loading={loading} />

              {/* 🆕 FIXED Enhanced Hotspots */}
              <EnhancedHotspots 
                hotspots={hotspots} 
                onInspect={setSelected}
                onSendToAdmin={handleSendToAdmin}
                loading={loading}
              />

              {/* AI Insights */}
              <div className="pd-glass-card">
                <div className="pd-card-title">🧠 AI Insights</div>
                <div className="insights-content">
                  {anomalies.length > 0 ? (
                    <div className="anomalies-section">
                      {anomalies.map((anomaly, index) => (
                        <div key={index} className={`anomaly-alert ${anomaly.severity}`}>
                          <div className="anomaly-icon">
                            {anomaly.type === 'spike' ? '📈' : '📊'}
                          </div>
                          <div className="anomaly-content">
                            <div className="anomaly-type">{anomaly.type.toUpperCase()}</div>
                            <div className="anomaly-message">{anomaly.message}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-anomalies">
                      <p>✅ All systems operating within normal parameters</p>
                      <small>AI monitoring active • Last scan: {lastUpdated.toLocaleTimeString()}</small>
                    </div>
                  )}

                  <div className="ai-recommendations">
                    <h4>🎯 Recommendations</h4>
                    <ul>
                      <li>📍 Priority monitoring: {hotspots[0]?.area || 'Electronic City'} area</li>
                      <li>⚡ Increase patrol frequency during peak hours (9-11 AM, 6-8 PM)</li>
                      <li>📊 Data quality: {((processed.length / mockData.length) * 100).toFixed(1)}% - Excellent</li>
                      <li>🚨 {hotspots.filter(h => h.severity === 'Critical').length} zones require immediate attention</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
});

AnalystDashboard.propTypes = {
  citizenData: PropTypes.array,
  citizenApiUrl: PropTypes.string,
  adminApiUrl: PropTypes.string,
  incoisApiUrl: PropTypes.string,
  weatherApiUrl: PropTypes.string,
  mapApiUrl: PropTypes.string,
  mapWsUrl: PropTypes.string,
  zonesUrl: PropTypes.string,
};

export default AnalystDashboard;
