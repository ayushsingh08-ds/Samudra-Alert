// src/pages/components/LoadingSkeleton.jsx
import React from "react";

const LoadingSkeleton = React.memo(({ height = 120, className = "" }) => (
  <div className={`pd-skeleton ${className}`} style={{ height }}>
    <div className="pd-skel-line" />
  </div>
));

export default LoadingSkeleton;
