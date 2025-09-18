// src/pages/AnalystDashboard.jsx
import React, { useReducer, useCallback, useMemo, Suspense } from "react";
import PropTypes from "prop-types";
import "./AnalystDashboard.css";

// Components
import Header from "./components/Header";
import DataQualitySection from "./components/DataQualitySection";
import TrendsChart from "./components/TrendsChart";
import RiskDistribution from "./components/RiskDistribution";
import HotspotsList from "./components/HotspotsList";
import MapWrapper from "./components/MapWrapper";
import InsightsPanel from "./components/InsightsPanel";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSkeleton from "./components/LoadingSkeleton";

// Hooks
import { useDataProcessing } from "./hooks/useDataProcessing";
import { useFilters } from "./hooks/useFilters";
import { useExport } from "./hooks/useExport";

// Utils
import { validateRecord, categorizeRisk, DEFAULT_THRESHOLDS } from "./utils/dataValidation";
import { gridHotspots, temporalTrends, detectAnomalies } from "./utils/analytics";

// Main Dashboard Component
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
  const { 
    data, 
    loading, 
    error, 
    refetch,
    lastUpdated 
  } = useDataProcessing({ 
    citizenData, 
    citizenApiUrl,
    defaultMockData: generateMockData()
  });

  const { 
    filtered, 
    filters, 
    updateFilters,
    searchInput,
    setSearchInput 
  } = useFilters(data.validated);

  const { handleExport } = useExport();

  const exportData = useMemo(() => ({
    summary: { 
      totalRecords: data.raw?.length || 0, 
      valid: data.quality?.valid || 0, 
      invalid: data.quality?.invalid || 0, 
      anomalySummary: data.anomalies?.summary || "" 
    },
    insights: (data.anomalies?.anomalies || []).map(a => ({ text: a.message })),
    topHotspots: data.hotspots || [],
    trendData: data.trends || [],
  }), [data]);

  const mapProps = useMemo(() => ({
    points: filtered,
    selected: data.selected,
    onPointSelect: data.setSelected,
    mapApiUrl,
    mapWsUrl,
    zonesUrl
  }), [filtered, data.selected, data.setSelected, mapApiUrl, mapWsUrl, zonesUrl]);

  if (error && !data.raw?.length) {
    return <ErrorFallback error={error} retry={refetch} />;
  }

  return (
    <ErrorBoundary>
      <div className="pd-container">
        <div className="pd-dashboard-root">
          <Header 
            loading={loading}
            lastUpdated={lastUpdated}
            searchInput={searchInput}
            onSearchChange={setSearchInput}
            onRefresh={refetch}
            onExport={() => handleExport(exportData)}
            filters={filters}
            onFiltersChange={updateFilters}
          />

          <div className="pd-main">
            <div className="pd-left">
              <Suspense fallback={<LoadingSkeleton height={180} />}>
                <DataQualitySection 
                  dataQuality={data.quality} 
                  loading={loading}
                />
              </Suspense>

              <Suspense fallback={<LoadingSkeleton height={300} />}>
                <TrendsChart 
                  data={data.trends} 
                  loading={loading}
                  anomalies={data.anomalies?.anomalies || []}
                />
              </Suspense>

              <Suspense fallback={<LoadingSkeleton height={420} />}>
                <MapWrapper {...mapProps} loading={loading} />
              </Suspense>
            </div>

            <div className="pd-right">
              <Suspense fallback={<LoadingSkeleton height={300} />}>
                <RiskDistribution 
                  data={filtered} 
                  loading={loading}
                />
              </Suspense>

              <Suspense fallback={<LoadingSkeleton height={250} />}>
                <HotspotsList 
                  hotspots={data.hotspots} 
                  onInspect={data.setSelected}
                  loading={loading}
                />
              </Suspense>

              <Suspense fallback={<LoadingSkeleton height={200} />}>
                <InsightsPanel 
                  anomalies={data.anomalies?.anomalies || []}
                  summary={data.anomalies?.summary || ""}
                  correlationData={data.correlationData || []}
                  loading={loading}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
});

// Helper function for mock data
function generateMockData() {
  const now = new Date();
  return [
    { 
      id: "mock-1", 
      lat: 12.9716, 
      lon: 77.5946, 
      riskScore: 85, 
      source: "citizen", 
      timestamp: now.toISOString(), 
      details: { note: "High risk area reported by citizen" } 
    },
    { 
      id: "mock-2", 
      lat: 12.975, 
      lon: 77.59, 
      riskScore: 55, 
      source: "sensor", 
      timestamp: new Date(now.getTime() - 3600*1000).toISOString(), 
      details: { sensorId: "S001", reading: 55.2 } 
    },
    { 
      id: "mock-3", 
      lat: 12.968, 
      lon: 77.599, 
      riskScore: 25, 
      source: "social", 
      timestamp: new Date(now.getTime() - 7200*1000).toISOString(), 
      details: { platform: "twitter", confidence: 0.8 } 
    },
    { 
      id: "mock-4", 
      lat: 12.973, 
      lon: 77.592, 
      riskScore: 72, 
      source: "patrol", 
      timestamp: new Date(now.getTime() - 1800*1000).toISOString(), 
      details: { officerId: "P123", verified: true } 
    },
    { 
      id: "mock-5", 
      lat: 12.969, 
      lon: 77.595, 
      riskScore: 38, 
      source: "camera", 
      timestamp: new Date(now.getTime() - 5400*1000).toISOString(), 
      details: { cameraId: "CAM_045", aiConfidence: 0.72 } 
    },
  ];
}

// Error Fallback Component
const ErrorFallback = React.memo(({ error, retry }) => (
  <div className="pd-container">
    <div className="pd-glass-card error-card">
      <div className="pd-card-title">⚠️ Dashboard Error</div>
      <div className="error-content">
        <p className="error-message">{error?.message || "An unexpected error occurred"}</p>
        <div className="error-actions">
          <button className="pd-btn" onClick={retry}>
            🔄 Retry Loading
          </button>
          <button 
            className="pd-btn" 
            onClick={() => window.location.reload()}
          >
            🔃 Refresh Page
          </button>
        </div>
      </div>
    </div>
  </div>
));

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
