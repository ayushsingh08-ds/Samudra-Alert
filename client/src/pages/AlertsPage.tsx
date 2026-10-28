import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BellRing, ShieldAlert, Info } from 'lucide-react';
import type { ApiAlert, AlertSeverity } from '../types';
import api from '../services/api';

const SEVERITY_STYLE: Record<AlertSeverity, string> = {
  critical: 'bg-nivara-danger/15 border-nivara-danger/40 text-nivara-danger',
  high: 'bg-nivara-danger/10 border-nivara-danger/30 text-nivara-danger',
  medium: 'bg-nivara-warning/10 border-nivara-warning/30 text-nivara-warning',
  low: 'bg-nivara-accent-primary/10 border-nivara-accent-primary/30 text-nivara-accent-primary',
};

const AlertsPage: React.FC = () => {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data } = await api.get<ApiAlert[]>('/alerts');
      return data;
    },
    refetchInterval: 60_000,
  });

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4 pb-8">
      <header className="flex items-center gap-3 pt-2">
        <div className="p-2.5 bg-nivara-accent-primary/10 rounded-xl text-nivara-accent-primary">
          <BellRing size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-manrope font-extrabold">Alerts</h1>
          <p className="text-xs text-nivara-text-muted">Official broadcasts from the response team</p>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-28 animate-pulse" />
          ))}
        </div>
      ) : !alerts?.length ? (
        <div className="glass-card p-10 text-center flex flex-col items-center gap-3">
          <Info size={36} className="text-nivara-text-muted" />
          <p className="text-nivara-text-muted text-sm">No alerts yet. You'll be notified here when authorities broadcast one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <motion.div
              key={alert._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.25) }}
              className={`glass-card p-4 border ${
                alert.severity === 'critical' ? 'border-nivara-danger/40' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl border ${SEVERITY_STYLE[alert.severity]} shrink-0`}>
                  <ShieldAlert size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${SEVERITY_STYLE[alert.severity]}`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-nivara-text-muted">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm leading-snug">{alert.title}</h3>
                  <p className="text-xs text-nivara-text-secondary mt-1 leading-relaxed">{alert.message}</p>
                  {alert.targetArea && (
                    <p className="text-[10px] text-nivara-text-muted mt-2">
                      📍 {alert.targetArea.radiusKm} km around {alert.targetArea.center.coordinates[1].toFixed(2)}°N, {alert.targetArea.center.coordinates[0].toFixed(2)}°E
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
