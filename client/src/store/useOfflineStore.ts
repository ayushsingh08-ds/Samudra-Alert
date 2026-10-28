import { create } from 'zustand';
import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { EventCategory } from '@samudra/shared';
import api from '../services/api';
import { uploadImageToR2, dataUrlToBlob } from '../services/uploads';

export interface OfflineReport {
  id: string;
  title: string;
  category: EventCategory;
  severity: number;
  location: [number, number]; // [lng, lat]
  description: string;
  images: string[]; // dataURLs while offline, uploaded on sync
  timestamp: string;
  status: 'queued' | 'syncing' | 'synced' | 'failed';
  error?: string;
}

interface OfflineDB extends DBSchema {
  report_queue: {
    key: string;
    value: OfflineReport;
  };
}

const DB_NAME = 'nivara_db';
const DB_VERSION = 2;
const STORE_NAME = 'report_queue';

async function getDB(): Promise<IDBPDatabase<OfflineDB>> {
  return openDB<OfflineDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

interface OfflineStore {
  queue: OfflineReport[];
  isOffline: boolean;
  syncing: boolean;
  setOffline: (status: boolean) => void;
  addToQueue: (report: Omit<OfflineReport, 'id' | 'status' | 'error'>) => Promise<void>;
  removeFromQueue: (id: string) => Promise<void>;
  clearSynced: () => Promise<void>;
  syncQueue: () => Promise<void>;
  loadQueue: () => Promise<void>;
}

export const useOfflineStore = create<OfflineStore>((set, get) => ({
  queue: [],
  isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  syncing: false,

  setOffline: (status) => set({ isOffline: status }),

  addToQueue: async (reportData) => {
    const db = await getDB();
    const report: OfflineReport = {
      ...reportData,
      id: crypto.randomUUID(),
      status: 'queued',
    };

    if (!get().isOffline) {
      // Try direct submit (upload images first)
      try {
        const imageUrls: string[] = [];
        for (const img of report.images ?? []) {
          imageUrls.push(await uploadImageToR2(img, report.category));
        }
        await api.post('/reports', {
          title: report.title,
          description: report.description,
          category: report.category,
          severity: report.severity,
          images: imageUrls,
          location: { lng: report.location[0], lat: report.location[1] },
        });
        return; // success, nothing queued
      } catch {
        // fall through to queue
      }
    }

    await db.put(STORE_NAME, report);
    set((state) => ({ queue: [...state.queue, report] }));
  },

  removeFromQueue: async (id) => {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
    set((state) => ({ queue: state.queue.filter((r) => r.id !== id) }));
  },

  clearSynced: async () => {
    set((state) => ({ queue: state.queue.filter((r) => r.status !== 'synced') }));
  },

  loadQueue: async () => {
    const db = await getDB();
    const all = await db.getAll(STORE_NAME);
    set({ queue: all });
  },

  syncQueue: async () => {
    const { queue, isOffline, syncing } = get();
    if (syncing || isOffline || queue.length === 0) return;

    set({ syncing: true });
    set((state) => ({
      queue: state.queue.map((r) => ({ ...r, status: 'syncing' as const })),
    }));

    for (const report of queue) {
      try {
        // 1) Upload images
        const imageUrls: string[] = [];
        for (const img of report.images ?? []) {
          const blob = img.startsWith('data:') ? dataUrlToBlob(img) : await fetch(img).then((r) => r.blob());
          imageUrls.push(await uploadImageToR2(blob, report.category));
        }

        // 2) Create report
        await api.post('/reports', {
          title: report.title,
          description: report.description,
          category: report.category,
          severity: report.severity,
          images: imageUrls,
          location: { lng: report.location[0], lat: report.location[1] },
        });

        await get().removeFromQueue(report.id);
        set((state) => ({ queue: state.queue.filter((r) => r.id !== report.id) }));
      } catch (err: unknown) {
        set((state) => ({
          queue: state.queue.map((r) =>
            r.id === report.id ? { ...r, status: 'failed' as const, error: (err as Error)?.message } : r,
          ),
        }));
      }
    }

    set({ syncing: false });
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useOfflineStore.getState().setOffline(false);
    useOfflineStore.getState().syncQueue();
  });
  window.addEventListener('offline', () => useOfflineStore.getState().setOffline(true));
}
