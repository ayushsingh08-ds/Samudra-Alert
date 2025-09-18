// src/pages/components/Header.jsx
import React from "react";

const Header = React.memo(({ 
  loading, 
  lastUpdated, 
  searchInput, 
  onSearchChange, 
  onRefresh, 
  onExport 
}) => (
  <div className="pd-header">
    <div className="pd-header-left">
      <h1 className="pd-title">Analyst Dashboard Pro</h1>
      <p className="pd-sub">Real-time risk analysis & insights</p>
    </div>
    <div className="pd-actions">
      <div className="pd-controls">
        <div className="pd-search-row">
          <input
            className="pd-input"
            type="text"
            placeholder="Search by ID, source, details..."
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <button 
        className="pd-action-refresh" 
        onClick={onRefresh} 
        disabled={loading}
      >
        {loading ? "🔄 Loading..." : "🔄 Refresh Data"}
      </button>
      <button 
        className="pd-action-finalize" 
        onClick={onExport}
      >
        📊 Export Report
      </button>
    </div>
    {lastUpdated && (
      <div className="pd-last-updated">
        <small>Last updated: {lastUpdated.toLocaleTimeString()}</small>
      </div>
    )}
  </div>
));

export default Header;
