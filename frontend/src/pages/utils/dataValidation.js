// src/pages/utils/dataValidation.js
export const DEFAULT_THRESHOLDS = { 
  high: 70, 
  medium: 40, 
  alertHighPct: 50, 
  hotspotHighCount: 5 
};

export function safeNum(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function categorizeRisk(score, thresholds = DEFAULT_THRESHOLDS) {
  if (score == null) return "Unknown";
  if (score >= thresholds.high) return "High";
  if (score >= thresholds.medium) return "Medium";
  return "Low";
}

export function validateRecord(record = {}) {
  const errors = [];
  if (!record) {
    errors.push("empty record");
    return { valid: false, errors, normalized: null };
  }

  const normalized = { ...record };

  // Validate ID
  if (record.id == null) errors.push("missing id");

  // Validate coordinates
  const lat = safeNum(record.lat ?? record.latitude);
  const lon = safeNum(record.lon ?? record.longitude);
  if (lat == null || lon == null) {
    errors.push("missing/invalid coordinates");
  } else {
    if (lat < -90 || lat > 90) errors.push("lat out of range");
    if (lon < -180 || lon > 180) errors.push("lon out of range");
    normalized.lat = lat;
    normalized.lon = lon;
  }

  // Validate risk score
  let score = safeNum(record.riskScore);
  if (score == null && record.risk != null) {
    const riskMap = { high: 85, medium: 55, low: 20 };
    score = riskMap[String(record.risk).toLowerCase()] ?? null;
  }
  if (score == null) errors.push("invalid or missing riskScore");
  normalized.riskScore = score;

  // Validate timestamp
  const timeStr = record.timestamp || record.time;
  if (timeStr) {
    const timestamp = new Date(timeStr);
    normalized.timestamp = Number.isNaN(timestamp.getTime()) 
      ? null 
      : timestamp.toISOString();
    if (!normalized.timestamp) errors.push("invalid timestamp");
  }

  // Set defaults
  normalized.source = record.source || record.sourceId || "unknown";
  normalized.details = record.details || record.meta || null;

  return { 
    valid: errors.length === 0, 
    errors, 
    normalized 
  };
}
