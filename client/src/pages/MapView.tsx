import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, X, ShieldCheck, Clock } from 'lucide-react';
import { useAlertStore } from '../store/useAlertStore';
import { useGeolocation } from '../hooks/useGeolocation';
import type { ApiReport } from '../types';
import api from '../services/api';

// Leaflet default icon fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const severityIcon = (severity: number) => {
  const color = severity >= 8 ? '#FF5A5F' : severity >= 5 ? '#FFB020' : '#14C38E';
  return L.divIcon({
    html: `<div style="background:${color};width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 10px ${color};"></div>`,
    className: 'custom-pin',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

function Recentre({ coords }: { coords: { lat: number; lng: number } | null }) {
  const map = useMap();
  React.useEffect(() => {
    if (coords) map.flyTo([coords.lat, coords.lng], 12, { duration: 0.8 });
  }, [coords, map]);
  return null;
}

const INDIA_CENTER: [number, number] = [22.5, 79.0];
const INDIA_ZOOM = 5;

const MapView: React.FC = () => {
  const navigate = useNavigate();
  const { filters } = useAlertStore();
  const { coords, refresh, loading: geoLoading } = useGeolocation();
  const [selected, setSelected] = useState<ApiReport | null>(null);

  const { data } = useQuery({
    queryKey: ['reports', 'map', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('status', 'verified');
      params.set('limit', '200');
      if (filters.severity !== 'All') params.set('severity', filters.severity);
      const { data } = await api.get(`/reports?${params}`);
      return data;
    },
  });

  const reports: ApiReport[] = useMemo(() => data?.reports ?? [], [data]);

  const userPos = useMemo<[number, number] | null>(
    () => (coords ? [coords.lat, coords.lng] : null),
    [coords],
  );

  return (
    <div className="relative h-[calc(100dvh-3.5rem)] w-full overflow-hidden md:h-[100dvh]">
      <MapContainer
        center={userPos ?? INDIA_CENTER}
        zoom={userPos ? 12 : INDIA_ZOOM}
        className="absolute inset-0 w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />
        <Recentre coords={coords} />

        {reports.map((r) => (
          <Marker
            key={r._id}
            position={[r.location.coordinates[1], r.location.coordinates[0]]}
            icon={severityIcon(r.severity)}
            eventHandlers={{ click: () => setSelected(r) }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <strong>{r.title}</strong>
                <p className="text-xs my-1">Severity {r.severity}/10 · {r.region}</p>
                <button
                  onClick={() => navigate(`/report/${r._id}`)}
                  className="text-xs font-bold underline"
                >
                  View details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {userPos && (
          <Marker position={userPos}>
            <Popup>You are here</Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Recenter button */}
      <button
        onClick={() => refresh()}
        className="absolute top-4 right-4 z-[40] glass-panel p-3 rounded-xl shadow-lg active:scale-95 transition-transform"
        aria-label="Recenter map"
      >
        <Navigation size={20} className={geoLoading ? 'animate-spin' : ''} />
      </button>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[40] glass-panel px-3 py-2 rounded-xl flex items-center gap-3 text-[10px] font-bold shadow-lg">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-nivara-danger" /> CRITICAL</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-nivara-warning" /> MODERATE</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-nivara-success" /> LOW</span>
      </div>

      {/* Bottom sheet on marker select */}
      {selected && (
        <>
          <div
            className="absolute inset-0 z-[45] bg-black/30"
            onClick={() => setSelected(null)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 z-[50] glass-panel rounded-t-3xl border-t border-white/10 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] max-h-[60dvh] overflow-y-auto md:left-24 md:right-auto md:bottom-4 md:w-96 md:rounded-3xl"
            style={{ animation: 'fadeUp 0.25s ease-out' }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  selected.severity >= 8 ? 'bg-nivara-danger/15 border-nivara-danger/30 text-nivara-danger' : 'bg-nivara-warning/15 border-nivara-warning/30 text-nivara-warning'
                }`}>
                  SEVERITY {selected.severity}/10
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-nivara-success/10 border-nivara-success/20 text-nivara-success">
                  {selected.status.toUpperCase()}
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-nivara-bg-glass rounded-full">
                <X size={18} />
              </button>
            </div>

            <h2 className="text-xl font-manrope font-extrabold leading-snug">{selected.title}</h2>
            <p className="text-sm text-nivara-text-muted mt-1 flex items-center gap-1">
              <MapPin size={14} className="text-nivara-accent-primary" />
              {selected.region} · {selected.location.coordinates[1].toFixed(3)}°N, {selected.location.coordinates[0].toFixed(3)}°E
            </p>

            {selected.images?.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {selected.images.map((src) => (
                  <img key={src} src={src} alt="" className="h-20 w-28 rounded-xl object-cover border border-nivara-border" />
                ))}
              </div>
            )}

            <p className="text-sm text-nivara-text-secondary mt-3 line-clamp-3">{selected.description}</p>

            <div className="flex items-center gap-3 text-[11px] text-nivara-text-muted mt-3">
              <span className="flex items-center gap-1"><Clock size={12} /> {new Date(selected.createdAt).toLocaleString()}</span>
              {selected.createdBy?.name && (
                <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-nivara-success" /> {selected.createdBy.name}</span>
              )}
            </div>

            <button
              onClick={() => navigate(`/report/${selected._id}`)}
              className="btn-primary w-full mt-4 !py-3 text-sm"
            >
              View Full Details
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MapView;
