// src/components/Map/utils/mapHelpers.js
export const safeNum = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export function normalizeIncident(raw) {
  if (!raw) return null;

  // Extract coordinates from various possible formats
  const lat = safeNum(
    raw.lat ?? 
    raw.latitude ?? 
    raw.location?.lat ?? 
    raw.latLng?.lat
  );
  
  const lon = safeNum(
    raw.lon ?? 
    raw.longitude ?? 
    raw.location?.lon ?? 
    raw.latLng?.lng ?? 
    raw.location?.lng
  );

  if (lat == null || lon == null) return null;

  // Normalize severity
  const rawSeverity = (raw.severity ?? raw.category ?? "").toLowerCase();
  const severityMap = { 
    high: "High", 
    h: "High", 
    "3": "High", 
    medium: "Medium", 
    m: "Medium",
    "2": "Medium", 
    low: "Low",
    l: "Low",
    "1": "Low"
  };
  
  let severity = severityMap[rawSeverity];
  
  // Fallback to risk score
  if (!severity && raw.riskScore != null) {
    const score = safeNum(raw.riskScore);
    severity = score >= 70 ? "High" : score >= 40 ? "Medium" : "Low";
  }
  
  severity = severity || "Unknown";

  // Normalize timestamp
  const timestamp = raw.timestamp 
    ? new Date(raw.timestamp) 
    : raw.time 
      ? new Date(raw.time) 
      : null;

  // Generate ID if missing
  const id = raw.id ?? 
    raw._id ?? 
    `${lat}-${lon}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    lat,
    lon,
    riskScore: safeNum(raw.riskScore ?? raw.score) ?? null,
    severity,
    title: raw.title ?? raw.type ?? raw.event ?? "Incident",
    details: raw.details ?? raw.props ?? {},
    timestamp: timestamp ? timestamp.toISOString() : raw.timestamp ?? null,
    source: raw.source ?? raw.sourceId ?? "unknown",
    raw
  };
}

export function calculateMapCenter(points) {
  if (!points || points.length === 0) {
    return [20.5937, 78.9629]; // Default: Center of India
  }

  const validPoints = points.filter(p => p.lat != null && p.lon != null);
  
  if (validPoints.length === 0) {
    return [20.5937, 78.9629];
  }

  const sum = validPoints.reduce(
    (acc, point) => ({
      lat: acc.lat + point.lat,
      lon: acc.lon + point.lon
    }),
    { lat: 0, lon: 0 }
  );

  return [
    sum.lat / validPoints.length,
    sum.lon / validPoints.length
  ];
}

export const colorForSeverity = (severity) => {
  switch (severity) {
    case "High": return "#f472b6";
    case "Medium": return "#a78bfa";
    case "Low": return "#7c3aed";
    default: return "#64748b";
  }
};
