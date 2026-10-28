import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  MapPin,
  Clock,
  ShieldCheck,
  Share2,
  CheckCircle2,
  Circle,
  AlertCircle,
  ImageIcon,
} from 'lucide-react';
import type { ApiReport, ReportStatus } from '../types';
import api from '../services/api';

const STATUS_STEPS: ReportStatus[] = ['pending', 'verified', 'resolved'];

const ReportDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      const { data } = await api.get<ApiReport>(`/reports/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: report?.title, text: report?.description?.slice(0, 80), url });
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied!');
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 max-w-3xl mx-auto space-y-4">
        <div className="glass-card h-48 animate-pulse" />
        <div className="glass-card h-64 animate-pulse" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <div className="glass-card p-10 text-center">
          <AlertCircle className="mx-auto text-nivara-danger mb-3" size={40} />
          <h2 className="font-bold text-lg">Report not found</h2>
          <button onClick={() => navigate('/')} className="btn-secondary mt-4">Back to feed</button>
        </div>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(report.status);

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-5 pb-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-nivara-text-muted hover:text-nivara-text-primary text-sm font-bold pt-2"
      >
        <ChevronLeft size={18} /> Back
      </button>

      <header className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className={report.severity >= 8 ? 'pill pill-high' : report.severity >= 5 ? 'pill pill-medium' : 'pill pill-low'}>
            {report.severity >= 8 ? 'High' : report.severity >= 5 ? 'Medium' : 'Low'}
          </span>
          <span className="pill bg-nivara-success/10 text-nivara-success capitalize">{report.status}</span>
          <span className="pill bg-nivara-bg-glass text-nivara-text-secondary">{report.category}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-manrope font-extrabold leading-tight">{report.title}</h1>
        <div className="flex flex-wrap gap-3 text-xs text-nivara-text-muted">
          <span className="flex items-center gap-1"><MapPin size={14} className="text-nivara-accent-primary" /> {report.region}</span>
          <span className="flex items-center gap-1">
            <Clock size={14} className="text-nivara-accent-primary" />
            {new Date(report.createdAt).toLocaleString()}
          </span>
          {report.createdBy?.name && (
            <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-nivara-success" /> {report.createdBy.name}</span>
          )}
        </div>
      </header>

      {/* Gallery */}
      {report.images?.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {report.images.map((src) => (
            <img key={src} src={src} alt="" className="h-44 rounded-2xl object-cover border border-nivara-border" />
          ))}
        </div>
      ) : (
        <div className="glass-card h-32 flex flex-col items-center justify-center gap-2 text-nivara-text-muted">
          <ImageIcon size={28} />
          <span className="text-xs">No photos attached</span>
        </div>
      )}

      {/* Risk level — 5-segment bar */}
      <section className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold">Risk Level</h3>
          <span className="text-xs font-bold text-nivara-text-secondary">{report.severity}/10</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((seg) => (
            <div
              key={seg}
              className={`h-1.5 flex-1 rounded-full ${
                report.severity / 2 >= seg
                  ? report.severity >= 8
                    ? 'bg-nivara-danger'
                    : report.severity >= 5
                      ? 'bg-nivara-warning'
                      : 'bg-nivara-success'
                  : 'bg-nivara-border'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Description */}
      <section className="glass-card p-5">
        <h3 className="font-bold mb-2">Description</h3>
        <p className="text-sm text-nivara-text-secondary leading-relaxed">{report.description}</p>
        <p className="text-[11px] text-nivara-text-muted mt-3 font-mono">
          {report.location.coordinates[1].toFixed(4)}°N, {report.location.coordinates[0].toFixed(4)}°E
        </p>
      </section>

      {/* Timeline */}
      <section className="glass-card p-5">
        <h3 className="font-bold mb-5">Status Timeline</h3>
        <div className="space-y-5 relative">
          <div className="absolute left-[11px] top-1 bottom-1 w-0.5 bg-nivara-border" />
          {STATUS_STEPS.map((step, i) => {
            const entry = report.statusHistory?.find((h) => h.status === step);
            const done = report.status === step || (currentStep >= 0 && i <= currentStep) || report.status === 'resolved';
            return (
              <div key={step} className="flex gap-4 relative">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 shrink-0 bg-nivara-bg-card ${
                  done ? 'border-nivara-success text-nivara-success' : 'border-nivara-border text-nivara-text-muted'
                }`}>
                  {done ? <CheckCircle2 size={14} /> : <Circle size={8} />}
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-bold text-sm capitalize ${done ? '' : 'text-nivara-text-muted'}`}>{step}</h4>
                    {entry && (
                      <span className="text-[10px] text-nivara-text-muted">
                        {new Date(entry.updatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {entry?.reason && <p className="text-xs text-nivara-text-secondary mt-0.5">{entry.reason}</p>}
                  {entry?.updatedBy?.name && (
                    <p className="text-[10px] text-nivara-text-muted mt-0.5">by {entry.updatedBy.name}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex gap-2">
        <button onClick={share} className="btn-secondary flex-1 flex items-center justify-center gap-2 !py-3 text-sm">
          <Share2 size={16} /> Share
        </button>
        <button
          onClick={() => navigate('/map')}
          className="btn-primary flex-1 flex items-center justify-center gap-2 !py-3 text-sm"
        >
          <MapPin size={16} /> View on Map
        </button>
      </div>

      {/* Safety banner */}
      {report.severity >= 8 && report.status === 'verified' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-nivara-warning/10 border border-nivara-warning/25 p-4 rounded-2xl flex gap-3"
        >
          <AlertCircle size={20} className="text-nivara-warning shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-nivara-warning">Safety advisory</p>
            <ul className="text-nivara-text-secondary text-xs mt-1 space-y-1 list-disc list-inside">
              <li>Stay at least 100m from the tide line</li>
              <li>Do not swim or surf in this area</li>
              <li>Secure boats and fishing equipment</li>
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ReportDetail;
