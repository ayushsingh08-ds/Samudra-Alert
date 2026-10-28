import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, Trash2, Database, AlertCircle, Loader2, Wifi, WifiOff, CheckCircle2 } from 'lucide-react';
import { useOfflineStore } from '../store/useOfflineStore';

const OfflineQueue: React.FC = () => {
  const { queue, isOffline, syncing, syncQueue, loadQueue, removeFromQueue } = useOfflineStore();

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4 pb-8">
      <header className="flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-nivara-accent-primary/10 rounded-xl text-nivara-accent-primary">
            {isOffline ? <WifiOff className="text-nivara-danger" size={22} /> : <Wifi className="text-nivara-success" size={22} />}
          </div>
          <div>
            <h1 className="text-2xl font-manrope font-extrabold">Offline Queue</h1>
            <p className="text-xs text-nivara-text-muted">{queue.length} report(s) waiting to sync</p>
          </div>
        </div>
        {!isOffline && queue.length > 0 && (
          <button onClick={syncQueue} disabled={syncing} className="btn-primary !py-2.5 !px-4 flex items-center gap-2 text-sm">
            <RefreshCcw size={16} className={syncing ? 'animate-spin' : ''} /> Sync
          </button>
        )}
      </header>

      {queue.length === 0 ? (
        <div className="glass-card p-10 text-center flex flex-col items-center gap-3">
          <div className="p-4 bg-nivara-bg-glass rounded-full text-nivara-text-muted">
            <Database size={40} />
          </div>
          <h3 className="font-bold">Queue is empty</h3>
          <p className="text-sm text-nivara-text-muted max-w-xs">
            Reports made without connection are stored here and upload automatically once you're back online.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {queue.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -16 }}
                className="glass-card p-4"
              >
                <div className="flex items-start gap-3">
                  {report.images?.[0] ? (
                    <img src={report.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover border border-nivara-border" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-nivara-bg-glass border border-nivara-border flex items-center justify-center text-nivara-accent-primary">
                      <Database size={20} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm truncate flex-1">{report.title}</h3>
                      {report.status === 'syncing' && <Loader2 size={14} className="animate-spin text-nivara-accent-primary shrink-0" />}
                      {report.status === 'queued' && <span className="text-[10px] font-bold uppercase text-nivara-text-muted shrink-0">Queued</span>}
                      {report.status === 'failed' && <AlertCircle size={14} className="text-nivara-danger shrink-0" />}
                    </div>
                    <p className="text-xs text-nivara-text-muted mt-0.5">
                      {report.category} · SEV {report.severity} · {new Date(report.timestamp).toLocaleString()}
                    </p>
                    {report.error && <p className="text-[11px] text-nivara-danger mt-1">{report.error}</p>}
                    {report.images && report.images.length > 1 && (
                      <p className="text-[10px] text-nivara-text-muted mt-1">+{report.images.length - 1} more photo(s)</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromQueue(report.id)}
                    className="p-2 bg-nivara-bg-glass hover:bg-nivara-danger/20 text-nivara-text-muted hover:text-nivara-danger rounded-xl transition-all shrink-0"
                    aria-label="Delete queued report"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!isOffline && queue.length === 0 && (
        <div className="bg-nivara-success/10 border border-nivara-success/25 p-4 rounded-2xl flex items-center gap-3">
          <CheckCircle2 size={22} className="text-nivara-success shrink-0" />
          <div>
            <h4 className="font-bold text-sm text-nivara-success">All synced</h4>
            <p className="text-xs text-nivara-text-secondary">This device is fully synchronized with the network.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineQueue;
