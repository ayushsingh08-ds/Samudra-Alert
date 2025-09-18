// src/components/Map/utils/markerUtils.js
import L from "leaflet";
import { colorForSeverity } from "./mapHelpers";

// Fix Leaflet default icons
export function fixLeafletIcons() {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });
}

export function markerRadiusForIncident(incident) {
  const baseRadius = 8;
  const riskScore = incident?.riskScore ?? 
    (incident?.severity === "High" ? 85 : 
     incident?.severity === "Medium" ? 55 : 25);
  
  const adjustment = Math.min(20, Math.max(0, (riskScore || 0) / 4));
  return Math.max(6, Math.min(30, Math.round(baseRadius + adjustment)));
}

export function createIncidentMarker(incident) {
  const color = colorForSeverity(incident.severity);
  const radius = markerRadiusForIncident(incident);

  const marker = L.circleMarker([incident.lat, incident.lon], {
    radius,
    color: "#111",
    fillColor: color,
    fillOpacity: 0.9,
    weight: 1.25,
    className: `incident-marker severity-${incident.severity?.toLowerCase()}`
  });

  // Enhanced tooltip
  const tooltipContent = `
    <div class="marker-tooltip">
      <div class="tooltip-title">${incident.title}</div>
      <div class="tooltip-details">
        <div class="tooltip-severity ${incident.severity?.toLowerCase()}">
          ${incident.severity || "Unknown"}
        </div>
        <div class="tooltip-score">
          ${incident.riskScore != null ? Math.round(incident.riskScore) : 0}%
        </div>
      </div>
      ${incident.source ? `<div class="tooltip-source">Source: ${incident.source}</div>` : ''}
    </div>
  `;

  marker.bindTooltip(tooltipContent, {
    className: "custom-tooltip",
    offset: [0, -radius - 10],
    direction: "top"
  });

  return marker;
}
