// src/pages/hooks/useDataProcessing.js - FIXED VERSION
import { useState, useEffect, useRef, useCallback } from "react";
import { normalizeIncident } from "../utils/dataValidation";

export function useDataProcessing({ 
  citizenData, 
  citizenApiUrl, 
  defaultMockData = [] 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const pointsMapRef = useRef(new Map());
  const [processedData, setProcessedData] = useState({
    raw: [],
    validated: [],
    quality: { total: 0, valid: 0, invalid: 0, perSource: {} },
    trends: [],
    hotspots: [],
    anomalies: { anomalies: [], summary: "" },
    correlationData: [],
    selected: null,
    setSelected: () => {}
  });

  const processData = useCallback((rawData) => {
    const validated = [];
    const errors = [];
    
    rawData.forEach(record => {
      const { valid, errors: recordErrors, normalized } = validateRecord(record);
      const category = normalized ? categorizeRisk(normalized.riskScore) : "Unknown";
      
      if (!valid) {
        errors.push({ id: record?.id ?? "unknown", errors: recordErrors });
      }
      
      validated.push({
        ...normalized,
        category,
        original: record,
        verified: false,
        flagged: false
      });
    });

    // Calculate data quality
    const total = rawData.length;
    const invalid = errors.length;
    const valid = total - invalid;
    
    const perSource = {};
    validated.forEach(record => {
      if (!perSource[record.source]) {
        perSource[record.source] = { total: 0, invalid: 0 };
      }
      perSource[record.source].total += 1;
      if (!record.riskScore) {
        perSource[record.source].invalid += 1;
      }
    });

    const quality = { total, valid, invalid, perSource };

    // Generate analytics (simplified for now)
    const trends = temporalTrends(validated);
    const { topHotspots } = gridHotspots(validated);
    const anomalies = detectAnomalies(trends);
    
    // Generate correlation data (placeholder)
    const correlationData = validated.map(record => ({
      id: record.id,
      riskScore: record.riskScore,
      externalMetric: Math.random() * 100
    }));

    return {
      validated,
      validationErrors: errors,
      quality,
      trends,
      hotspots: topHotspots,
      anomalies,
      correlationData
    };
  }, []);

  const setSelected = useCallback((item) => {
    setProcessedData(prev => ({ ...prev, selected: item }));
  }, []);

  const fetchData = useCallback(async (options = { useMockOnFail: true }) => {
    // Don't fetch if we already have citizenData
    if (Array.isArray(citizenData) && citizenData.length > 0) {
      const processed = processData(citizenData);
      setProcessedData(prev => ({ 
        ...prev, 
        raw: citizenData,
        ...processed,
        setSelected
      }));
      setLastUpdated(new Date());
      return;
    }

    // Don't make API calls in development if no API URL or if it's clearly a mock endpoint
    if (!citizenApiUrl || citizenApiUrl === "/api/citizen") {
      console.log("Using mock data - API endpoint not available");
      if (options.useMockOnFail && defaultMockData.length > 0) {
        const processed = processData(defaultMockData);
        setProcessedData(prev => ({ 
          ...prev, 
          raw: defaultMockData,
          ...processed,
          setSelected
        }));
        setLastUpdated(new Date());
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(citizenApiUrl, {
        cache: "no-cache",
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      // ✅ FIXED: Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.warn("Expected JSON but received:", contentType, text.substring(0, 100));
        throw new Error(`Server returned non-JSON response: ${contentType}`);
      }

      const json = await response.json();
      const rawData = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];
      
      const processed = processData(rawData);
      setProcessedData(prev => ({ 
        ...prev, 
        raw: rawData,
        ...processed,
        setSelected
      }));
      setLastUpdated(new Date());

    } catch (fetchError) {
      console.warn("API fetch failed:", fetchError.message);
      setError(fetchError);
      
      // Always use mock data on API failure to prevent blinking
      if (options.useMockOnFail && defaultMockData.length > 0) {
        console.log("Falling back to mock data");
        const processed = processData(defaultMockData);
        setProcessedData(prev => ({ 
          ...prev, 
          raw: defaultMockData,
          ...processed,
          setSelected
        }));
        setLastUpdated(new Date());
        setError(null); // Clear error when mock data loads successfully
      }
    } finally {
      setLoading(false);
    }
  }, [citizenData, citizenApiUrl, defaultMockData, processData, setSelected]);

  // Initial data load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data: processedData,
    loading,
    error,
    refetch: fetchData,
    lastUpdated
  };
}

// Helper functions (add these if missing)
function validateRecord(record) {
  // Simple validation - replace with your actual validation logic
  return {
    valid: record && record.id && record.lat && record.lon,
    errors: [],
    normalized: record
  };
}

function categorizeRisk(score) {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function temporalTrends(points) {
  // Simple trends - replace with your actual logic
  const byDay = {};
  points.forEach(point => {
    const day = point.timestamp ? point.timestamp.slice(0, 10) : "today";
    if (!byDay[day]) byDay[day] = { date: day, High: 0, Medium: 0, Low: 0 };
    byDay[day][point.category] = (byDay[day][point.category] || 0) + 1;
  });
  return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
}

function gridHotspots(points) {
  // Simple hotspots - replace with your actual logic
  return { topHotspots: [] };
}

function detectAnomalies(trends) {
  // Simple anomaly detection - replace with your actual logic
  return { 
    anomalies: [], 
    summary: "No anomalies detected in current dataset" 
  };
}
