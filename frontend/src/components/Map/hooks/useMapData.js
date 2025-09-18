// src/components/Map/hooks/useMapData.js
import { useState, useEffect, useRef, useCallback } from "react";
import { normalizeIncident } from "../utils/mapHelpers";

export function useMapData({ 
  apiUrl, 
  wsUrl, 
  pollingInterval = 15000, 
  onDataUpdate 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const pointsMapRef = useRef(new Map());

  const updatePoints = useCallback((newIncidents) => {
    const normalized = newIncidents
      .map(normalizeIncident)
      .filter(Boolean);

    normalized.forEach(incident => {
      pointsMapRef.current.set(incident.id, incident);
    });

    const allPoints = Array.from(pointsMapRef.current.values());
    onDataUpdate(allPoints);
  }, [onDataUpdate]);

  // REST API Polling
  useEffect(() => {
    if (!apiUrl) return;

    let cancelled = false;

    const fetchData = async () => {
      if (cancelled) return;
      
      setLoading(true);
      setError(null);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(apiUrl, {
          signal: controller.signal,
          cache: "no-cache"
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const incidents = Array.isArray(data) 
          ? data 
          : Array.isArray(data.data) 
            ? data.data 
            : [];

        if (!cancelled) {
          updatePoints(incidents);
        }
      } catch (fetchError) {
        if (!cancelled && fetchError.name !== 'AbortError') {
          console.warn("Map data fetch failed:", fetchError);
          setError(fetchError);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    const intervalId = setInterval(fetchData, pollingInterval);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [apiUrl, pollingInterval, updatePoints]);

  // WebSocket Connection
  useEffect(() => {
    if (!wsUrl) return;

    let ws;
    
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;
    } catch (wsError) {
      console.warn("WebSocket initialization failed:", wsError);
      return;
    }

    ws.onopen = () => {
      console.info("Map WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const incidents = Array.isArray(data) ? data : [data];
        updatePoints(incidents);
      } catch (parseError) {
        console.warn("Invalid WebSocket message:", parseError);
      }
    };

    ws.onerror = (wsError) => {
      console.warn("Map WebSocket error:", wsError);
      setError(new Error("WebSocket connection failed"));
    };

    ws.onclose = (event) => {
      console.info("Map WebSocket closed:", event.code);
      wsRef.current = null;
    };

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.close();
        } catch (closeError) {
          console.warn("Error closing WebSocket:", closeError);
        }
      }
      wsRef.current = null;
    };
  }, [wsUrl, updatePoints]);

  return { loading, error };
}
