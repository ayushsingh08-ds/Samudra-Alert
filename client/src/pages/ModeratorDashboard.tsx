import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  AlertCircle,
  Inbox,
  TrendingUp,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { ApiReport, AdminStats } from '../types';

const ModeratorDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const { data: pending, isLoading } = useQuery({
    queryKey: ['pending-reports'],
    queryFn: async () => {
      const { data } = await api.get<ApiReport[]>('/admin/reports/pending');
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get<AdminStats>('/admin/stats');
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      return api.patch(`/reports/${id}/status`, { status, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setRejecting(null);
      setReason('');
    },
  });

  const verify = (id: string) => updateStatus.mutate({ id, status: 'verified' });
  const reject = (id: string) => {
    if (!reason.trim()) return;
    updateStatus.mutate({ id, status: 'rejected', reason });
  };

  const statCards = [
    { label: 'Pending', value: pending?.length ?? 0, icon: Clock, color: 'text-nivara-warning' },
    { label: 'Verified', value: stats?.byStatus?.verified ?? 0, icon: CheckCircle2, color: 'text-nivara-success' },
    { label: 'Rejected', value: stats?.byStatus?.rejected ?? 0, icon: XCircle, color: 'text-nivara-danger' },
    { label: 'Avg verify', value: `${stats?.avgVerificationMinutes ?? 0}m`, icon: TrendingUp, color: 'text-nivara-accent-primary' },
  ];

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-5 pb-8">
      <header className="pt-2">
        <div className="flex items-center gap-2 text-nivara-accent-cyan font-bold tracking-widest text-[11px] uppercase mb-1">
          <ShieldCheck size={16} /> Verification Center
        </div>
        <h1 className="text-2xl font-manrope font-extrabold">Moderator Dashboard</h1>
        <p className="text-sm text-nivara-text-muted">Review community reports and keep the coast informed.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-nivara-bg-glass ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-[10px] text-nivara-text-muted font-bold uppercase">{label}</p>
              <p className="text-xl font-manrope font-extrabold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {stats && stats.trend.length > 0 && (
        <div className="glass-card p-4">
          <p className="text-xs font-bold text-nivara-text-muted uppercase mb-3">Reports — last 7 days</p>
          <div className="flex items-end gap-2 h-24">
            {stats.trend.map((t) => {
              const max = Math.max(...stats.trend.map((x) => x.count), 1);
              return (
                <div key={t.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-nivara-accent-primary/60"
                    style={{ height: `${(t.count / max) * 100}%`, minHeight: 4 }}
                  />
                  <span className="text-[9px] text-nivara-text-muted">{t.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Queue */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-nivara-border flex items-center justify-between bg-nivara-bg-glass">
          <h2 className="font-bold text-sm flex items-center gap-2">
            <AlertCircle size={16} className="text-nivara-warning" /> Verification Queue
          </h2>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-nivara-warning/10 border-nivara-warning/20 text-nivara-warning">
            {pending?.length ?? 0} awaiting
          </span>
        </div>

        <div className="divide-y divide-nivara-border">
          {isLoading ? (
            <div className="p-8 text-center text-nivara-text-muted text-sm">Loading…</div>
          ) : !pending?.length ? (
            <div className="p-10 text-center flex flex-col items-center gap-3 text-nivara-text-muted">
              <Inbox size={36} />
              <p className="text-sm">Queue is empty. Good job!</p>
            </div>
          ) : (
            pending.map((report) => (
              <motion.div key={report._id} layout className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        report.severity >= 8 ? 'bg-nivara-danger/10 border-nivara-danger/25 text-nivara-danger' : 'bg-nivara-warning/10 border-nivara-warning/25 text-nivara-warning'
                      }`}>
                        SEV {report.severity}
                      </span>
                      <span className="text-[10px] text-nivara-text-muted">
                        {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm leading-snug">{report.title}</h3>
                    <p className="text-xs text-nivara-text-muted mt-0.5">
                      {report.category} · by {report.createdBy?.name ?? 'community'}
                    </p>
                    {report.images?.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {report.images.slice(0, 3).map((src) => (
                          <img key={src} src={src} alt="" className="w-12 h-12 rounded-lg object-cover border border-nivara-border" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-nivara-text-secondary mt-2 line-clamp-2">{report.description}</p>
                <p className="text-[10px] text-nivara-text-muted mt-1 flex items-center gap-1">
                  <MapPin size={11} /> {report.region} · {report.location.coordinates[1].toFixed(3)}, {report.location.coordinates[0].toFixed(3)}
                </p>

                {rejecting === report._id ? (
                  <div className="mt-3 flex gap-2">
                    <input
                      className="input-field flex-1 !py-2 text-xs"
                      placeholder="Reason for rejection…"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      autoFocus
                    />
                    <button onClick={() => reject(report._id)} className="btn-primary !py-2 !px-4 text-xs" disabled={!reason.trim()}>
                      Confirm
                    </button>
                    <button onClick={() => { setRejecting(null); setReason(''); }} className="btn-secondary !py-2 !px-3 text-xs">
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => verify(report._id)}
                      disabled={updateStatus.isPending}
                      className="flex-1 !py-2.5 rounded-xl text-xs font-bold bg-nivara-success/15 border border-nivara-success/30 text-nivara-success flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                    >
                      <CheckCircle2 size={15} /> Verify
                    </button>
                    <button
                      onClick={() => setRejecting(report._id)}
                      disabled={updateStatus.isPending}
                      className="flex-1 !py-2.5 rounded-xl text-xs font-bold bg-nivara-danger/10 border border-nivara-danger/30 text-nivara-danger flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                    >
                      <XCircle size={15} /> Reject
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
