// src/pages/utils/analytics.js
export function gridHotspots(points = [], gridSize = 18) {
  if (!points || points.length === 0) {
    return { cellsMap: {}, topHotspots: [] };
  }

  // Find bounds
  let minLat = Infinity, maxLat = -Infinity;
  let minLon = Infinity, maxLon = -Infinity;
  
  points.forEach(point => {
    if (point.lat != null && point.lon != null) {
      minLat = Math.min(minLat, point.lat);
      maxLat = Math.max(maxLat, point.lat);
      minLon = Math.min(minLon, point.lon);
      maxLon = Math.max(maxLon, point.lon);
    }
  });

  if (!isFinite(minLat)) {
    return { cellsMap: {}, topHotspots: [] };
  }

  // Add padding
  const latPad = (maxLat - minLat) * 0.02 || 0.001;
  const lonPad = (maxLon - minLon) * 0.02 || 0.001;
  minLat -= latPad; maxLat += latPad;
  minLon -= lonPad; maxLon += lonPad;

  // Create grid
  const rows = gridSize;
  const cols = gridSize;
  const cells = {};

  points.forEach(point => {
    if (point.lat == null || point.lon == null) return;

    let rx = Math.floor(((point.lon - minLon) / (maxLon - minLon)) * cols);
    let ry = Math.floor(((point.lat - minLat) / (maxLat - minLat)) * rows);
    
    rx = Math.max(0, Math.min(cols - 1, rx));
    ry = Math.max(0, Math.min(rows - 1, ry));
    
    const key = `${rx}-${ry}`;
    
    if (!cells[key]) {
      cells[key] = {
        xIdx: rx,
        yIdx: ry,
        counts: { High: 0, Medium: 0, Low: 0, Unknown: 0 },
        points: []
      };
    }

    const category = point.category || point.severity || "Unknown";
    cells[key].counts[category] = (cells[key].counts[category] || 0) + 1;
    cells[key].points.push(point);
  });

  // Convert to hotspots
  const hotspots = Object.values(cells).map(cell => {
    const { points: cellPoints } = cell;
    
    // Calculate centroid
    const centroid = cellPoints.length 
      ? cellPoints.reduce(
          (acc, point) => {
            acc.lat += point.lat;
            acc.lon += point.lon;
            return acc;
          },
          { lat: 0, lon: 0 }
        )
      : { lat: 0, lon: 0 };

    if (cellPoints.length) {
      centroid.lat /= cellPoints.length;
      centroid.lon /= cellPoints.length;
    }

    return {
      cellKey: `${cell.xIdx}-${cell.yIdx}`,
      countHigh: cell.counts.High || 0,
      counts: cell.counts,
      centroid,
      points: cellPoints
    };
  });

  // Sort by high risk count, then medium
  hotspots.sort((a, b) => 
    b.countHigh - a.countHigh || (b.counts.Medium - a.counts.Medium)
  );

  return { cellsMap: cells, topHotspots: hotspots };
}

export function temporalTrends(points = []) {
  const byDay = {};
  
  points.forEach(point => {
    const day = point.timestamp 
      ? point.timestamp.slice(0, 10) 
      : "unknown";
    
    if (!byDay[day]) {
      byDay[day] = { 
        date: day, 
        High: 0, 
        Medium: 0, 
        Low: 0, 
        Unknown: 0 
      };
    }

    const category = point.category || point.severity || "Unknown";
    byDay[day][category] = (byDay[day][category] || 0) + 1;
  });

  return Object.values(byDay).sort((a, b) => 
    a.date.localeCompare(b.date)
  );
}

export function detectAnomalies(trendData = []) {
  if (!trendData || trendData.length < 3) {
    return { 
      anomalies: [], 
      summary: "Insufficient data for anomaly detection." 
    };
  }

  const anomalies = [];
  const highValues = trendData.map(d => d.High || 0);
  const length = highValues.length;

  // Recent vs previous window comparison
  const lastWindow = highValues.slice(Math.max(0, length - 3), length);
  const prevWindow = highValues.slice(
    Math.max(0, length - 6), 
    Math.max(0, length - 3)
  );

  const avgLast = lastWindow.reduce((sum, val) => sum + val, 0) / (lastWindow.length || 1);
  const avgPrev = prevWindow.length 
    ? prevWindow.reduce((sum, val) => sum + val, 0) / prevWindow.length 
    : 0;

  if (avgPrev > 0 && avgLast > avgPrev * 1.25) {
    anomalies.push({
      type: "spike",
      message: `Recent High average (${avgLast.toFixed(1)}) exceeds previous period (${avgPrev.toFixed(1)}) by >25%`
    });
  }

  // Z-score outliers
  const mean = highValues.reduce((sum, val) => sum + val, 0) / length;
  const variance = highValues.reduce((sum, val) => sum + (val - mean) ** 2, 0) / length;
  const stdDev = Math.sqrt(variance);

  if (stdDev > 0) {
    trendData.forEach(dataPoint => {
      const value = dataPoint.High || 0;
      const zScore = (value - mean) / stdDev;
      
      if (zScore > 2.5) {
        anomalies.push({
          type: "z-score",
          date: dataPoint.date,
          message: `High count ${value} on ${dataPoint.date} is a statistical outlier (z-score: ${zScore.toFixed(2)})`
        });
      }
    });
  }

  const summary = anomalies.length 
    ? `Detected ${anomalies.length} anomalies requiring attention.`
    : "No significant anomalies detected in current data.";

  return { anomalies, summary };
}
