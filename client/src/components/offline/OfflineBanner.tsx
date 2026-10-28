import React from 'react';
import { WifiOff, AlertCircle } from 'lucide-react';
import { useOfflineStore } from '../../store/useOfflineStore';
import { motion, AnimatePresence } from 'framer-motion';

const OfflineBanner: React.FC = () => {
  const { isOffline, queue } = useOfflineStore();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-20 left-0 right-0 z-[60] px-6"
        >
          <div className="max-w-xl mx-auto bg-nivara-warning/90 backdrop-blur-md text-nivara-bg-primary px-6 py-3 rounded-2xl flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-3">
              <WifiOff size={20} />
              <div>
                <p className="font-bold text-sm">Working Offline</p>
                <p className="text-xs opacity-80">Reports will be saved and synced later. {queue.length > 0 && `(${queue.length} in queue)`}</p>
              </div>
            </div>
            <div className="bg-black/10 p-1.5 rounded-full">
              <AlertCircle size={16} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
