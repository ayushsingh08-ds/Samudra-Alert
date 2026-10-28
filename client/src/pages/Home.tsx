import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import AlertCard from '../components/alerts/AlertCard';
import { useAlertStore } from '../store/useAlertStore';
import { useOfflineStore } from '../store/useOfflineStore';
import type { ApiReport } from '../types';
import api from '../services/api';
import { EVENT_CATEGORIES, CATEGORY_ICONS } from '@samudra/shared';
import type { EventCategory } from '../types';const Home: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const filters = useAlertStore((s) => s.filters);
  const isOffline = useOfflineStore((s) => s.isOffline);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reports', filters, activeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeFilter !== 'All') params.set('category', activeFilter);
      if (filters.severity !== 'All') params.set('severity', filters.severity);
      // Public feed shows verified + resolved hazards
      params.set('status', 'verified');
      const { data } = await api.get(`/reports?${params}`);
      return data;
    },
    refetchInterval: 60_000,
  });

  const reports: ApiReport[] = data?.reports ?? [];

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-5 pb-8">
      <header className="pt-3 space-y-0.5">
        <h1 className="text-3xl font-manrope font-extrabold tracking-tight">City Alerts</h1>
        <p className="text-sm text-nivara-text-muted">Live updates from official & community sources</p>
      </header>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {(['All', ...EVENT_CATEGORIES] as ('All' | EventCategory)[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`chip ${activeFilter === cat ? 'chip-active' : ''}`}
          >
            {cat === 'All' ? cat : `${CATEGORY_ICONS[cat]} ${cat}`}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-16 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="glass-card p-10 text-center space-y-3">
          <Bell className="mx-auto text-nivara-danger" size={40} />
          <h2 className="text-lg font-bold">Failed to load alerts</h2>
          <p className="text-sm text-nivara-text-muted">Check your connection and try again.</p>
          <button onClick={() => refetch()} className="btn-secondary mx-auto flex items-center gap-2 !py-2 !px-4 text-sm">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      ) : reports.length === 0 ? (
        <div className="glass-card p-10 text-center flex flex-col items-center gap-3">
          <div className="p-4 bg-nivara-bg-glass rounded-full text-nivara-text-muted">
            <Bell size={32} />
          </div>
          <h2 className="font-bold">All clear right now</h2>
          <p className="text-sm text-nivara-text-muted max-w-xs">
            No active incidents{activeFilter !== 'All' ? ` in ${activeFilter}` : ' in your area'}. Spotted something? Help your city by reporting it.
          </p>
          <button onClick={() => navigate('/report')} className="btn-primary !py-2.5 !px-5 text-sm mt-1">
            Report an incident
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report, i) => (
            <motion.div
              key={report._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
            >
              <AlertCard report={report} />
            </motion.div>
          ))}
        </div>
      )}

      {isOffline && (
        <p className="text-center text-xs text-nivara-warning pt-2">
          You're offline — showing cached feed. New reports will be queued.
        </p>
      )}
    </div>
  );
};

export default Home;
