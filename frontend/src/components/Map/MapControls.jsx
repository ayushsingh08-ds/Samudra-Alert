// src/components/Map/MapControls.jsx
import React from "react";

const MapControls = React.memo(({ 
  onFitBounds, 
  onCenter, 
  onLocate, 
  loading, 
  pointsCount 
}) => (
  <div className="map-controls">
    <button 
      className="btn map-btn" 
      onClick={onFitBounds}
      disabled={pointsCount === 0}
      title="Fit all markers in view"
    >
      📍 Fit Bounds
    </button>
    
    <button 
      className="btn map-btn" 
      onClick={onCenter}
      title="Center map on data"
    >
      🎯 Center
    </button>
    
    <button 
      className="btn map-btn" 
      onClick={onLocate}
      disabled={loading}
      title="Find my location"
    >
      {loading ? "🔄" : "📍"} My Location
    </button>
    
    {pointsCount > 0 && (
      <div className="map-conn-status">
        {pointsCount} incidents loaded
      </div>
    )}
  </div>
));

export default MapControls;
