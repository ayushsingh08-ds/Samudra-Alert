// src/components/Map/MarkersLayer.jsx
import React, { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import { createIncidentMarker } from "../utils/markerUtils";

const MarkersLayer = React.memo(({ 
  points = [], 
  onMarkerClick, 
  selectedPoint 
}) => {
  const map = useMap();
  const clusterGroupRef = useRef(null);
  const markersMapRef = useRef(new Map());

  useEffect(() => {
    if (!clusterGroupRef.current) {
      clusterGroupRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: false,
        showCoverageOnHover: false,
        maxClusterRadius: 50
      });
      map.addLayer(clusterGroupRef.current);
    }

    const clusterGroup = clusterGroupRef.current;
    const markersMap = markersMapRef.current;

    // Remove markers that no longer exist
    markersMap.forEach((marker, pointId) => {
      if (!points.find(p => p.id === pointId)) {
        clusterGroup.removeLayer(marker);
        markersMap.delete(pointId);
      }
    });

    // Add/update markers
    points.forEach(point => {
      if (!point || point.lat == null || point.lon == null) return;

      let marker = markersMap.get(point.id);
      
      if (!marker) {
        marker = createIncidentMarker(point);
        marker.on('click', () => onMarkerClick(point));
        markersMap.set(point.id, marker);
        clusterGroup.addLayer(marker);
      }

      // Update marker style if it's selected
      if (selectedPoint && selectedPoint.id === point.id) {
        marker.setStyle({ 
          weight: 3, 
          color: '#fff',
          fillOpacity: 1 
        });
      } else {
        marker.setStyle({ 
          weight: 1.25, 
          color: '#111',
          fillOpacity: 0.95 
        });
      }
    });

    return () => {
      if (clusterGroup) {
        clusterGroup.clearLayers();
        markersMap.clear();
      }
    };
  }, [points, map, onMarkerClick, selectedPoint]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
        markersMapRef.current.clear();
      }
    };
  }, [map]);

  return null;
});

export default MarkersLayer;