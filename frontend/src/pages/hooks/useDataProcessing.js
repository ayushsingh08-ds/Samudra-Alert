// src/pages/hooks/useDataProcessing.js
import { useReducer, useCallback, useEffect, useState } from "react";
import { validateRecord, categorizeRisk } from "../utils/dataValidation";
import { gridHotspots, temporalTrends, detectAnomalies } from "../utils/analytics";

const initialState = {
  raw: [],
  validated: [],
  validationErrors: [],
  quality: { total: 0, valid: 0, invalid: 0, perSource: {} },
  trends: [],
  hotspots: [],
  anomalies: { anomalies: [], summary: "" },
  correlationData: [],
  selected: null,
};

function dataReducer(state, action) {
  switch (action.type) {
    case 'SET_RAW_DATA':
      return { ...state, raw: action.payload };
    case 'SET_PROCESSED_DATA':
      return { ...state, ...action.payload };
    case 'SET_SELECTED':
      return { ...state, selected: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useDataProcessing({ citizenData, citizenApiUrl, defaultMockData = [] }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

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

    // Generate analytics
    const trends = temporalTrends(validated);
    const { topHotspots } = gridHotspots(validated);
    const anomalies = detectAnomalies(trends);
    
    // Generate correlation data (placeholder)
    const correlationData = validated.map(record => ({
      id: record.id,
      riskScore: record.riskScore,
      externalMetric: Math.random() * 100 // Placeholder for real correlation
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

  const fetchData = useCallback(async (options = { useMockOnFail: true }) => {
    setLoading(true);
    setError(null);

    try {
      // Use provided citizenData if available
      if (Array.isArray(citizenData) && citizenData.length > 0) {
        dispatch({ type: 'SET_RAW_DATA', payload: citizenData });
        const processed = processData(citizenData);
        dispatch({ type: 'SET_PROCESSED_DATA', payload: processed });
        setLastUpdated(new Date());
        return;
      }

      // Fetch from API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(citizenApiUrl, {
        cache: "no-cache",
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      const rawData = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];
      
      dispatch({ type: 'SET_RAW_DATA', payload: rawData });
      const processed = processData(rawData);
      dispatch({ type: 'SET_PROCESSED_DATA', payload: processed });
      setLastUpdated(new Date());

    } catch (fetchError) {
      console.warn("Data fetch failed:", fetchError);
      setError(fetchError);
      
      if (options.useMockOnFail && defaultMockData.length > 0) {
        console.log("Using mock data fallback");
        dispatch({ type: 'SET_RAW_DATA', payload: defaultMockData });
        const processed = processData(defaultMockData);
        dispatch({ type: 'SET_PROCESSED_DATA', payload: processed });
        setLastUpdated(new Date());
        setError(null); // Clear error when mock data loads successfully
      }
    } finally {
      setLoading(false);
    }
  }, [citizenData, citizenApiUrl, defaultMockData, processData]);

  const setSelected = useCallback((item) => {
    dispatch({ type: 'SET_SELECTED', payload: item });
  }, []);

  // Initial data load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data: { ...state, setSelected },
    loading,
    error,
    refetch: fetchData,
    lastUpdated
  };
}
