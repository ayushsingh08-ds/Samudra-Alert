import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  CheckCircle2,
  Camera,
  Trash2,
  Crosshair,
  Upload,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Camera as CameraPlugin, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useOfflineStore } from '../store/useOfflineStore';
import { useGeolocation } from '../hooks/useGeolocation';
import { toast } from '../components/ui/Toast';
import type { EventCategory } from '../types';
import { EVENT_CATEGORIES, CATEGORY_ICONS } from '@samudra/shared';

const pinIcon = L.divIcon({
  html: `<div style="background:#38BDF8;width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4);"></div>`,
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

function LocationPicker({
  value,
  onChange,
}: {
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lng, e.latlng.lat]);
    },
  });
  return <Marker position={[value[1], value[0]]} icon={pinIcon} />;
}

const ReportHazard: React.FC = () => {
  const navigate = useNavigate();
  const addToQueue = useOfflineStore((s) => s.addToQueue);
  const isOffline = useOfflineStore((s) => s.isOffline);
  const { coords, refresh: refreshLocation, loading: geoLoading, error: geoError } = useGeolocation();

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<EventCategory | ''>('');
  const [severity, setSeverity] = useState(5);
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]); // dataURLs
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill location from GPS once available
  useMemo(() => {
    if (coords && !location) {
      setLocation([coords.lng, coords.lat]);
    }
  }, [coords, location]);

  const takePhoto = async (source: CameraSource) => {
    try {
      const photo = await CameraPlugin.getPhoto({
        resultType: CameraResultType.DataUrl,
        source,
        quality: 70,
        width: 1600,
        height: 1600,
        correctOrientation: true,
      });
      if (photo.dataUrl) {
        setPhotos((p) => (p.length >= 5 ? p : [...p, photo.dataUrl!]));
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
      }
    } catch {
      // user cancelled
    }
  };

  const handleSubmit = async () => {
    if (!location || !category) return;
    setIsSubmitting(true);
    try {
      await addToQueue({
        title: title.trim() || `${category} reported`,
        category,
        severity,
        location,
        description,
        images: photos,
        timestamp: new Date().toISOString(),
      });
      Haptics.impact({ style: ImpactStyle.Medium }).catch(() => undefined);
      setStep(5);
    } catch {
      toast.danger('Could not submit', 'Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto flex flex-col min-h-[calc(100dvh-3.5rem-4.5rem)]">
      <header className="text-center py-4 space-y-3">
        <h1 className="text-2xl font-manrope font-extrabold">Report a Hazard</h1>
        <p className="text-sm text-nivara-text-muted -mt-2">Help make your city safer</p>
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1 w-8 rounded-full transition-all ${step >= i ? 'bg-nivara-accent-primary' : 'bg-nivara-border'}`}
            />
          ))}
        </div>
      </header>

      <div className="glass-card p-5 flex-1 flex flex-col mb-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="flex-1 flex flex-col">
              <h2 className="text-lg font-bold mb-1">Select category</h2>
              <p className="text-sm text-nivara-text-muted mb-4">What are you observing?</p>
              <div className="grid grid-cols-2 gap-3 flex-1 content-start overflow-y-auto">
                {EVENT_CATEGORIES.map((cat) => {
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setCategory(cat);
                        setStep(2);
                      }}
                      className={`p-4 rounded-2xl border bg-nivara-bg-card flex flex-col items-center gap-2 transition-all active:scale-95 hover:border-nivara-text-muted ${
                        category === cat ? 'border-nivara-accent-primary ring-1 ring-nivara-accent-primary' : 'border-nivara-border'
                      }`}
                    >
                      <span className="text-2xl leading-none">{CATEGORY_ICONS[cat]}</span>
                      <span className="text-xs font-bold text-center">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="flex-1 flex flex-col">
              <h2 className="text-lg font-bold">How severe?</h2>
              <p className="text-sm text-nivara-text-muted mb-6">{category}</p>
              <div className="flex-1 flex flex-col justify-center gap-8">
                <div className="relative h-2.5 bg-nivara-bg-glass rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-nivara-warning to-nivara-danger rounded-full"
                    style={{ width: `${severity * 10}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(parseInt(e.target.value, 10))}
                  className="w-full"
                />
                <div className="text-center">
                  <span className="text-5xl font-manrope font-extrabold">{severity}</span>
                  <span className="text-nivara-text-muted text-lg">/10</span>
                  <p className="text-xs text-nivara-text-muted mt-1">
                    {severity >= 8 ? 'Extreme — immediate danger' : severity >= 5 ? 'Moderate — caution advised' : 'Mild — be aware'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold">Confirm location</h2>
                  <p className="text-sm text-nivara-text-muted">Tap the map to adjust the pin.</p>
                </div>
                <button
                  onClick={() => refreshLocation()}
                  className="btn-secondary !p-2.5 !rounded-xl shrink-0"
                  aria-label="Use GPS"
                >
                  <Crosshair size={18} className={geoLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="h-64 rounded-2xl overflow-hidden border border-nivara-border mt-4 relative">
                {location ? (
                  <MapContainer center={[location[1], location[0]]} zoom={13} className="absolute inset-0 h-full w-full">
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      attribution='&copy; OpenStreetMap &copy; CARTO'
                    />
                    <LocationPicker value={location} onChange={setLocation} />
                  </MapContainer>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-nivara-text-muted text-sm">
                    <div className="text-center">
                      <MapPin size={32} className="mx-auto mb-2 animate-bounce text-nivara-accent-primary" />
                      {geoLoading ? 'Locating…' : geoError ?? 'Location unavailable — tap retry'}
                    </div>
                  </div>
                )}
              </div>
              {location && (
                <p className="text-xs text-nivara-text-muted mt-2 text-center font-mono">
                  {location[1].toFixed(4)}°N, {location[0].toFixed(4)}°E
                </p>
              )}

              <div className="mt-4">
                <label className="text-sm font-bold">Title</label>
                <input
                  className="input-field w-full mt-1"
                  placeholder={`e.g. ${category} in my area`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="flex-1 flex flex-col">
              <h2 className="text-lg font-bold">Photos & details</h2>
              <p className="text-sm text-nivara-text-muted mb-4">Evidence helps moderators verify faster.</p>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {photos.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-nivara-border">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 p-1 bg-black/60 rounded-full"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <>
                    <button
                      onClick={() => takePhoto(CameraSource.Camera)}
                      className="aspect-square rounded-xl border border-dashed border-nivara-accent-primary/50 flex flex-col items-center justify-center gap-1 text-nivara-accent-primary active:scale-95 bg-nivara-bg-card"
                    >
                      <Camera size={22} />
                      <span className="text-[10px] font-bold">Camera</span>
                    </button>
                    <button
                      onClick={() => takePhoto(CameraSource.Photos)}
                      className="aspect-square rounded-xl border border-dashed border-nivara-border flex flex-col items-center justify-center gap-1 text-nivara-text-muted active:scale-95 bg-nivara-bg-card"
                    >
                      <Upload size={22} />
                      <span className="text-[10px] font-bold">Gallery</span>
                    </button>
                  </>
                )}
              </div>

              <label className="text-sm font-bold">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is happening, people affected, nearby landmarks…"
                className="input-field w-full min-h-[100px] resize-none mt-1 flex-1"
              />
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="s5" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center gap-5 py-8">
              <div className="w-20 h-20 bg-nivara-success/10 rounded-full flex items-center justify-center">
                <CheckCircle2 size={44} className="text-nivara-success" />
              </div>
              <div>
                <h2 className="text-2xl font-manrope font-extrabold">{isOffline ? 'Queued offline!' : 'Report submitted!'}</h2>
                <p className="text-sm text-nivara-text-muted mt-2 max-w-xs">
                  {isOffline
                    ? 'Saved on this device. It will upload automatically when you are back online.'
                    : 'Moderators will verify your report shortly. Thank you for keeping your community safe.'}
                </p>
              </div>
              <button onClick={() => navigate('/')} className="btn-primary px-10">
                Back to Feed
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {step < 5 && (
          <div className="pt-4 mt-4 flex items-center justify-between border-t border-nivara-border">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className={`flex items-center gap-1 font-bold text-sm px-4 py-2 rounded-xl ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-nivara-text-muted hover:text-nivara-text-primary'}`}
            >
              <ChevronLeft size={18} /> Back
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 ? !category : step === 3 ? !location || title.trim().length < 3 : false}
                className="btn-primary flex items-center gap-1 !py-2.5 !px-5 text-sm"
              >
                Continue <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || description.trim().length < 10}
                className="btn-primary flex items-center gap-2 !py-2.5 !px-6 text-sm"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isOffline ? 'Queue' : 'Submit'} <Upload size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportHazard;
