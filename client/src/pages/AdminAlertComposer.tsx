import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Send,
  Eye,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  ChevronLeft,
  Smartphone,
  BellRing,
} from 'lucide-react';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import { toast } from '../components/ui/Toast';
import type { ApiAlert, EventCategory, AlertSeverity } from '../types';
import { EVENT_CATEGORIES, regionForPoint, INDIA_MAP_CENTER } from '@samudra/shared';

const TEMPLATES: Record<string, { title: string; message: string; category?: EventCategory }> = {
  flood: {
    title: 'Flood Warning',
    message:
      'Water levels are rising above the danger mark. Residents in low-lying areas should move to safer ground and follow relief-camp instructions.',
    category: 'Flood',
  },
  heatWave: {
    title: 'Heat Wave Advisory',
    message:
      'Severe heat expected. Avoid outdoor activity between 12–4 pm, stay hydrated, and check on elderly neighbours.',
    category: 'Heat Wave',
  },
  aqi: {
    title: 'Air Quality Alert',
    message:
      'Air quality has deteriorated to severe levels. Sensitive groups should stay indoors; N95 masks recommended outdoors.',
    category: 'Air Quality',
  },
  power: {
    title: 'Power Outage Notice',
    message:
      'A power outage has been reported due to grid maintenance/failure. Estimated restoration is being updated; charge essential devices.',
    category: 'Power Outage',
  },
  water: {
    title: 'Water Supply Notice',
    message:
      'Water supply will be disrupted/contaminated in your area. Store drinking water and boil water before use until further notice.',
    category: 'Water Supply',
  },
  custom: { title: '', message: '' },
};

const pinIcon = L.divIcon({
  html: `<div style="background:#FF5A5F;width:20px;height:20px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 10px #FF5A5F;"></div>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function AreaPicker({
  center,
  radiusKm,
  onPick,
}: {
  center: [number, number];
  radiusKm: number;
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return (
    <>
      <Marker position={center} icon={pinIcon} />
      <Circle center={center} radius={radiusKm * 1000} color="#FF5A5F" fillColor="#FF5A5F" fillOpacity={0.12} weight={2} />
    </>
  );
}

const AdminAlertComposer: React.FC = () => {
  const navigate = useNavigate();
  const [template, setTemplate] = useState('custom');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertSeverity>('medium');
  const [category, setCategory] = useState<EventCategory>('Flood');
  const [center, setCenter] = useState<[number, number]>([INDIA_MAP_CENTER[0], INDIA_MAP_CENTER[1]]);
  const [radiusKm, setRadiusKm] = useState(50);
  const [push, setPush] = useState(true);
  const [preview, setPreview] = useState(false);

  const { data: alerts, refetch } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data } = await api.get<ApiAlert[]>('/alerts?limit=20');
      return data;
    },
  });

  const send = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/alerts', {
        title,
        message,
        severity,
        category,
        targetArea: { lat: center[0], lng: center[1], radiusKm },
        channels: push ? ['inapp', 'push'] : ['inapp'],
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success('Alert broadcast', `Push delivered: ${data.deliveryStats?.pushSent ?? 0}`);
      refetch();
      setTitle('');
      setMessage('');
      setPreview(false);
    },
    onError: () => toast.danger('Broadcast failed', 'Check your permissions and try again.'),
  });

  const applyTemplate = (key: string) => {
    setTemplate(key);
    if (TEMPLATES[key]) {
      setTitle(TEMPLATES[key].title);
      setMessage(TEMPLATES[key].message);
      if (TEMPLATES[key].category) setCategory(TEMPLATES[key].category!);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-5 pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-nivara-text-muted text-sm font-bold pt-2">
        <ChevronLeft size={18} /> Back
      </button>

      <header className="flex items-center gap-3">
        <div className="p-2.5 bg-nivara-danger/10 border border-nivara-danger/25 rounded-xl text-nivara-danger">
          <ShieldAlert size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-manrope font-extrabold">Alert Composer</h1>
          <p className="text-xs text-nivara-text-muted">Broadcast to connected citizens in the target area</p>
        </div>
      </header>

      {/* Form */}
      <div className="glass-card p-5 space-y-4">
        <div>
          <label className="text-xs font-bold uppercase text-nivara-text-muted">Template</label>
          <select className="input-field w-full mt-1" value={template} onChange={(e) => applyTemplate(e.target.value)}>
            <option value="custom">Custom message</option>
            <option value="flood">Flood warning</option>
            <option value="heatWave">Heat wave advisory</option>
            <option value="aqi">Air quality alert</option>
            <option value="power">Power outage notice</option>
            <option value="water">Water supply notice</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-nivara-text-muted">Title</label>
          <input className="input-field w-full mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Alert title" />
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-nivara-text-muted">Message</label>
          <textarea className="input-field w-full min-h-[90px] resize-none mt-1" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What should citizens do?" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase text-nivara-text-muted">Severity</label>
            <select className="input-field w-full mt-1" value={severity} onChange={(e) => setSeverity(e.target.value as AlertSeverity)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-nivara-text-muted">Category</label>
            <select className="input-field w-full mt-1" value={category} onChange={(e) => setCategory(e.target.value as EventCategory)}>
              {EVENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-nivara-text-muted">Target area</label>
          <div className="h-56 rounded-2xl overflow-hidden border border-nivara-border mt-1 relative">
            <MapContainer center={center} zoom={7} className="absolute inset-0 h-full w-full">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap &copy; CARTO'
              />
              <AreaPicker
                center={center}
                radiusKm={radiusKm}
                onPick={(lat, lng) => {
                  setCenter([lat, lng]);
                }}
              />
            </MapContainer>
          </div>
          <p className="text-[10px] text-nivara-text-muted mt-1 flex items-center gap-1">
            <MapPin size={11} /> {regionForPoint(center[0], center[1])} · tap map to move the zone
          </p>
          <div className="flex items-center gap-3 mt-2">
            <input
              type="range"
              min={1}
              max={300}
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseInt(e.target.value, 10))}
              className="flex-1"
            />
            <span className="text-sm font-bold text-nivara-accent-cyan w-16 text-right">{radiusKm} km</span>
          </div>
        </div>

        <label className="flex items-center gap-3 p-3 rounded-xl bg-nivara-bg-glass border border-nivara-border cursor-pointer">
          <input type="checkbox" checked={push} onChange={(e) => setPush(e.target.checked)} className="accent-nivara-accent-primary" />
          <Smartphone size={18} className="text-nivara-accent-primary" />
          <span className="text-sm font-bold flex-1">Also send push notifications</span>
          <BellRing size={16} className="text-nivara-text-muted" />
        </label>

        {preview && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-nivara-danger/40 bg-nivara-bg-secondary p-4">
            <p className="text-[10px] uppercase font-bold text-nivara-danger mb-1">Preview · {severity}</p>
            <p className="font-bold text-sm">{title || '(no title)'}</p>
            <p className="text-xs text-nivara-text-secondary mt-1">{message || '(no message)'}</p>
          </motion.div>
        )}

        <div className="flex gap-2">
          <button onClick={() => setPreview((p) => !p)} className="btn-secondary flex-1 !py-3 flex items-center justify-center gap-2 text-sm">
            <Eye size={16} /> Preview
          </button>
          <button
            onClick={() => send.mutate()}
            disabled={!title.trim() || !message.trim() || send.isPending}
            className="btn-primary flex-1 !py-3 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {send.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
            Broadcast
          </button>
        </div>
      </div>

      {/* Recent alerts */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-nivara-border bg-nivara-bg-glass">
          <h2 className="font-bold text-sm">Recent broadcasts</h2>
        </div>
        <div className="divide-y divide-nivara-border">
          {!alerts?.length ? (
            <p className="p-6 text-center text-sm text-nivara-text-muted">No alerts sent yet.</p>
          ) : (
            alerts.map((a) => (
              <div key={a._id} className="p-4 flex items-start gap-3">
                <CheckCircle2 size={16} className="text-nivara-success mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{a.title}</p>
                  <p className="text-[11px] text-nivara-text-muted">
                    {new Date(a.createdAt).toLocaleString()} · {a.severity} · push sent {a.deliveryStats?.pushSent ?? 0}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAlertComposer;
