import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MapPin, Siren, BellRing, CheckCircle2 } from 'lucide-react';

const ONBOARDING_KEY = 'nivara.onboarded';

/**
 * First-launch onboarding — Welcome + 3 carousel steps.
 * Shown once; sets the existing onboarding flag in localStorage on completion.
 */

function RadarArt({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* concentric rings */}
      <div className="absolute inset-0 rounded-full border border-nivara-border" />
      <div className="absolute inset-6 rounded-full border border-nivara-border" />
      <div className="absolute inset-12 rounded-full border border-nivara-border/80" />
      {/* crosshair */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-nivara-border/70" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-nivara-border/70" />
      {/* orange ticks */}
      <div className="absolute -left-1 top-1/2 w-2 h-2 bg-nivara-danger" />
      <div className="absolute -right-1 top-1/3 w-2 h-2 bg-nivara-warning" />
      <div className="absolute left-1/2 -top-1 w-2 h-2 bg-nivara-danger/70" />
      {/* center medallion */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-28 h-28 rounded-full bg-nivara-bg-card border border-nivara-border shadow-sm flex items-center justify-center">
          {children ?? <span className="brand-mark text-xl">S.</span>}
        </div>
      </div>
    </div>
  );
}

const SLIDES = [
  {
    num: '01',
    title: 'Real-Time\nCity Safety',
    body: 'Get instant alerts about hazards across your city and nearby areas.',
    art: <RadarArt />,
  },
  {
    num: '02',
    title: 'Report\nand Share',
    body: 'Help your community by reporting hazards quickly with photos and location.',
    art: (
      <div className="relative w-64 h-64 mx-auto">
        <div className="absolute inset-8 rounded-3xl border border-nivara-border rotate-6" />
        <div className="absolute inset-8 rounded-3xl border border-nivara-border -rotate-6" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-nivara-accent-primary text-white flex items-center justify-center shadow-lg shadow-black/15">
            <span className="text-3xl">＋</span>
          </div>
        </div>
        <div className="absolute top-10 left-10 w-2 h-2 bg-nivara-danger" />
        <div className="absolute bottom-12 right-10 w-2 h-2 bg-nivara-warning" />
      </div>
    ),
  },
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [locState, setLocState] = useState<'idle' | 'asking' | 'granted' | 'denied'>('idle');

  const finish = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    navigate('/', { replace: true });
  };

  const enableLocation = async () => {
    setLocState('asking');
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 12000 }),
      );
      localStorage.setItem('lastCoords', JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
      setLocState('granted');
      setTimeout(finish, 700);
    } catch {
      setLocState('denied');
      // stay on step — user can retry or skip
    }
  };

  return (
    <div className="min-h-[100dvh] bg-nivara-bg-primary flex flex-col px-6 py-10 max-w-md mx-auto">
      {/* top row */}
      <div className="flex items-center justify-between h-10">
        <span className="brand-mark text-lg text-nivara-text-primary">Samudra-Alert</span>
        {step > 0 && step < 3 && (
          <button onClick={finish} className="text-xs font-bold tracking-widest uppercase text-nivara-text-muted">
            Skip
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-10">
              <div className="text-left space-y-1">
                <h1 className="brand-mark text-4xl text-nivara-text-primary">Samudra-Alert</h1>
                <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-nivara-text-muted leading-relaxed pt-1">
                  Safer Cities<br />Stronger Communities
                </p>
              </div>
              <RadarArt>
                <div className="w-16 h-16 rounded-full bg-nivara-accent-primary flex items-center justify-center">
                  <Siren className="text-white" size={28} />
                </div>
              </RadarArt>
              <div className="text-left">
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-nivara-text-muted leading-relaxed">
                  General<br />Hazard<br />Alerts<br />
                  <span className="text-nivara-danger">Across</span> Your City
                </p>
              </div>
            </motion.div>
          )}

          {step > 0 && step < 3 && (
            <motion.div
              key={`slide-${step}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              className="space-y-8"
            >
              <span className="text-xs font-bold text-nivara-text-muted">{SLIDES[step - 1].num}</span>
              <h2 className="text-3xl font-manrope font-extrabold whitespace-pre-line leading-tight">
                {SLIDES[step - 1].title}
              </h2>
              <p className="text-sm text-nivara-text-secondary leading-relaxed max-w-[16rem]">{SLIDES[step - 1].body}</p>
              <div className="py-4">{SLIDES[step - 1].art}</div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="location" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="text-center relative py-6">
                <div className="absolute inset-x-16 top-0 bottom-0 mx-auto rounded-full border border-nivara-border" />
                <div className="absolute inset-x-24 top-4 bottom-4 mx-auto rounded-full border border-nivara-border/70" />
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-nivara-accent-primary text-white shadow-lg shadow-black/15">
                  <MapPin size={36} />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-manrope font-extrabold tracking-wide uppercase">Enable Location</h2>
                <p className="text-sm text-nivara-text-secondary">Get accurate alerts for your area and nearby regions.</p>
              </div>
              <div className="space-y-2">
                {[
                  { icon: MapPin, label: 'Location-based alerts' },
                  { icon: Siren, label: 'Relevant nearby hazards' },
                  { icon: BellRing, label: 'Faster emergency response' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 p-4 rounded-xl border border-nivara-border bg-nivara-bg-card">
                    <span className="w-9 h-9 rounded-lg bg-nivara-bg-glass flex items-center justify-center text-nivara-text-primary">
                      <Icon size={18} />
                    </span>
                    <span className="text-sm font-semibold">{label}</span>
                  </div>
                ))}
              </div>
              {locState === 'denied' && (
                <p className="text-xs text-nivara-danger text-center">
                  Permission denied — you can enable location later in settings.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* bottom controls */}
      <div className="space-y-6">
        {step === 0 && (
          <button onClick={() => setStep(1)} className="btn-primary w-full flex items-center justify-center gap-2 !py-4">
            Get Started <ArrowRight size={18} />
          </button>
        )}

        {step > 0 && step < 3 && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {[1, 2, 3].map((d) => (
                  <span key={d} className={`w-1.5 h-1.5 rounded-full ${d === step ? 'bg-nivara-text-primary' : 'bg-nivara-border'}`} />
                ))}
              </div>
              <button onClick={() => setStep((s) => s + 1)} className="flex items-center gap-1.5 text-sm font-bold">
                Next <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <button
              onClick={enableLocation}
              disabled={locState === 'asking' || locState === 'granted'}
              className="btn-primary w-full flex items-center justify-center gap-2 !py-4"
            >
              {locState === 'granted' ? (
                <>
                  <CheckCircle2 size={18} /> Location enabled
                </>
              ) : locState === 'asking' ? (
                'Requesting…'
              ) : (
                <>
                  Enable Location <ArrowRight size={18} />
                </>
              )}
            </button>
            <button onClick={finish} className="w-full text-center text-sm font-semibold text-nivara-text-muted py-2">
              Not now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
