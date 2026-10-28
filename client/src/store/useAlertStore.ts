import { create } from 'zustand';
import type { HazardAlert } from '../types';

interface AlertStore {
  alerts: HazardAlert[];
  filters: {
    category: string;
    severity: string;
    distance: string;
    time: string;
  };
  setFilters: (filters: Partial<AlertStore['filters']>) => void;
  setAlerts: (alerts: HazardAlert[]) => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  filters: {
    category: 'All',
    severity: 'All',
    distance: 'All',
    time: 'All',
  },
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  setAlerts: (alerts) => set({ alerts }),
}));
