import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ShieldCheck, ChevronRight, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ApiReport } from '../../types';

interface AlertCardProps {
  report: ApiReport;
  onClick?: () => void;
}

function severityLabel(sev: number): 'High' | 'Medium' | 'Low' {
  if (sev >= 8) return 'High';
  if (sev >= 5) return 'Medium';
  return 'Low';
}

function pillClass(sev: number): string {
  if (sev >= 8) return 'pill pill-high';
  if (sev >= 5) return 'pill pill-medium';
  return 'pill pill-low';
}

const AlertCard: React.FC<AlertCardProps> = ({ report, onClick }) => {
  const navigate = useNavigate();

  const timeAgo = (iso: string) => {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? 's' : ''} ago`;
  };

  return (
    <motion.div
      whileTap={{ scale: 0.985 }}
      onClick={() => (onClick ? onClick() : navigate(`/report/${report._id}`))}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onClick) onClick();
          else navigate(`/report/${report._id}`);
        }
      }}
      aria-label={`${report.title} — ${severityLabel(report.severity)} severity`}
      className="glass-card p-4 flex items-center gap-3 cursor-pointer transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-nivara-accent-primary/30"
    >
      {/* Severity dot */}
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          report.severity >= 8 ? 'bg-nivara-danger' : report.severity >= 5 ? 'bg-nivara-warning' : 'bg-nivara-warning/60'
        }`}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={pillClass(report.severity)}>{severityLabel(report.severity)}</span>
          {report.status === 'verified' && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-nivara-success">
              <ShieldCheck size={11} /> Verified
            </span>
          )}
          {report.images && report.images.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-nivara-text-muted">
              <ImageIcon size={11} /> {report.images.length}
            </span>
          )}
        </div>
        <h3 className="font-bold text-sm leading-snug truncate">{report.title}</h3>
        <p className="text-xs text-nivara-text-muted mt-0.5 flex items-center gap-1">
          <MapPin size={11} />
          {report.region ?? 'India'} · {timeAgo(report.createdAt)}
        </p>
      </div>

      {report.images?.[0] && (
        <img
          src={report.images[0]}
          alt=""
          className="w-14 h-14 rounded-xl object-cover border border-nivara-border shrink-0"
          loading="lazy"
        />
      )}

      <ChevronRight size={16} className="text-nivara-text-muted shrink-0" />
    </motion.div>
  );
};

export default AlertCard;
