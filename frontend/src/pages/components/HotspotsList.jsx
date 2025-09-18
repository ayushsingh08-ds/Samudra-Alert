// src/pages/components/HotspotsList.jsx
import React from "react";
import LoadingSkeleton from "./LoadingSkeleton";

const HotspotsList = React.memo(({ hotspots = [], onInspect, loading }) => {
  if (loading && hotspots.length === 0) {
    return (
      <div className="pd-glass-card">
        <div className="pd-card-title">🔥 Top Hotspots</div>
        <LoadingSkeleton height={250} />
      </div>
    );
  }

  if (!hotspots || hotspots.length === 0) {
    return (
      <div className="pd-glass-card">
        <div className="pd-card-title">🔥 Top Hotspots</div>
        <div className="no-hotspots">
          <p>🗺️ No hotspots detected</p>
          <small>Hotspot analysis will appear when sufficient data is available</small>
        </div>
      </div>
    );
  }

  return (
    <div className="pd-glass-card">
      <div className="pd-card-title">🔥 Top Risk Hotspots</div>
      <div className="hotspots-content">
        <ol className="hotspots-list">
          {hotspots.slice(0, 8).map((hotspot, index) => {
            const { centroid, countHigh, points, counts } = hotspot;
            const totalPoints = points?.length || 0;
            const hasValidCoords = isFinite(centroid?.lat) && isFinite(centroid?.lon);
            
            return (
              <li key={hotspot.cellKey || index} className="hotspot-item">
                <div className="hotspot-header">
                  <div className="hotspot-rank">#{index + 1}</div>
                  <div className="hotspot-location">
                    {hasValidCoords 
                      ? `${centroid.lat.toFixed(4)}, ${centroid.lon.toFixed(4)}`
                      : "Location unavailable"
                    }
                  </div>
                </div>
                
                <div className="hotspot-stats">
                  <div className="stat-item high">
                    <span className="stat-label">High Risk:</span>
                    <span className="stat-value">{countHigh}</span>
                  </div>
                  <div className="stat-item medium">
                    <span className="stat-label">Medium:</span>
                    <span className="stat-value">{counts?.Medium || 0}</span>
                  </div>
                  <div className="stat-item low">
                    <span className="stat-label">Low:</span>
                    <span className="stat-value">{counts?.Low || 0}</span>
                  </div>
                  <div className="stat-item total">
                    <span className="stat-label">Total:</span>
                    <span className="stat-value">{totalPoints}</span>
                  </div>
                </div>
                
                {points && points.length > 0 && (
                  <div className="hotspot-actions">
                    <button 
                      className="pd-btn btn-sm"
                      onClick={() => onInspect && onInspect(points[0])}
                    >
                      🔍 Inspect Sample
                    </button>
                    <button 
                      className="pd-btn btn-sm btn-ghost"
                      onClick={() => onInspect && onInspect({ 
                        ...points[0], 
                        isHotspotCenter: true,
                        hotspotData: { countHigh, totalPoints, counts }
                      })}
                    >
                      📍 View on Map
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        
        {hotspots.length > 8 && (
          <div className="hotspots-summary">
            <small>Showing top 8 of {hotspots.length} hotspots detected</small>
          </div>
        )}
      </div>
    </div>
  );
});

export default HotspotsList;
