/* eslint-disable react-refresh/only-export-components */
import React, { useEffect } from 'react';
import { create } from 'zustand';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  variant: 'info' | 'success' | 'warning' | 'danger';
}

interface ToastStore {
  toasts: ToastItem[];
  push: (t: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id }] }));
    // Alerts stay ~2x longer so users can actually read them
    const ttl = t.variant === 'danger' ? 10000 : 5000;
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
    }, ttl);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export const toast = {
  info: (title: string, message?: string) => useToastStore.getState().push({ title, message, variant: 'info' }),
  success: (title: string, message?: string) => useToastStore.getState().push({ title, message, variant: 'success' }),
  warning: (title: string, message?: string) => useToastStore.getState().push({ title, message, variant: 'warning' }),
  danger: (title: string, message?: string) => useToastStore.getState().push({ title, message, variant: 'danger' }),
};

const ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertTriangle,
};

const STYLES = {
  info: 'border-nivara-accent-primary/40 bg-nivara-bg-secondary',
  success: 'border-nivara-success/40 bg-nivara-bg-secondary',
  warning: 'border-nivara-warning/40 bg-nivara-bg-secondary',
  danger: 'border-nivara-danger/50 bg-nivara-bg-secondary',
};

const ICON_COLORS = {
  info: 'text-nivara-accent-primary',
  success: 'text-nivara-success',
  warning: 'text-nivara-warning',
  danger: 'text-nivara-danger',
};

export const ToastHost: React.FC = () => {
  const { toasts, dismiss } = useToastStore();

  useEffect(() => {
    // no-op: keeps component stable for AnimatePresence keys
  }, []);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.variant];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              className={`pointer-events-auto glass-panel border ${STYLES[t.variant]} rounded-2xl p-4 flex items-start gap-3 shadow-2xl`}
            >
              <Icon size={20} className={`${ICON_COLORS[t.variant]} shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{t.title}</p>
                {t.message && <p className="text-xs text-nivara-text-secondary mt-0.5 line-clamp-2">{t.message}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="p-1 rounded-full hover:bg-nivara-bg-glass">
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastHost;
