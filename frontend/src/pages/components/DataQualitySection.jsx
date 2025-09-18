// src/pages/components/DataQualitySection.jsx
import React from "react";
import LoadingSkeleton from "./LoadingSkeleton";

const DataQualitySection = React.memo(({ dataQuality = {}, loading }) => {
  if (loading && !dataQuality.total) {
    return (
      <div className="pd-glass-card">
        <LoadingSkeleton height={180} />
      </div>
    );
  }

  const validPercent = dataQuality.total > 0 
    ? ((dataQuality.valid / dataQuality.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="pd-glass-card">
      <div className="pd-card-title">📊 Data Quality</div>
      <div className="data-quality-content">
        <div className="dq-stats">
          <div className="dq-row">
            <span className="dq-label">Total Records:</span>
            <strong className="dq-value">{dataQuality.total ?? 0}</strong>
          </div>
          <div className="dq-row">
            <span className="dq-label">Valid:</span>
            <strong className="dq-value valid">{dataQuality.valid ?? 0}</strong>
          </div>
          <div className="dq-row">
            <span className="dq-label">Invalid:</span>
            <strong className="dq-value invalid">{dataQuality.invalid ?? 0}</strong>
          </div>
          <div className="dq-row">
            <span className="dq-label">Quality Score:</span>
            <strong className="dq-value">{validPercent}%</strong>
          </div>
        </div>
        
        <div className="dq-sources">
          <h4>Sources Breakdown:</h4>
          <ul className="sources-list">
            {Object.keys(dataQuality.perSource || {}).length === 0 ? (
              <li className="no-sources">No source data available</li>
            ) : (
              Object.entries(dataQuality.perSource || {})
                .slice(0, 6)
                .map(([source, stats]) => (
                  <li key={source} className="source-item">
                    <span className="source-name">{source}:</span>
                    <span className="source-stats">
                      {stats.total || 0} total 
                      {stats.invalid > 0 && (
                        <span className="invalid-count">
                          ({stats.invalid} invalid)
                        </span>
                      )}
                    </span>
                  </li>
                ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
});

export default DataQualitySection;
