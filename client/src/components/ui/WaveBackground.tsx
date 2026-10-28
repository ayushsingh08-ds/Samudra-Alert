import React from 'react';

/**
 * Light "technical blueprint" background — thin gray guide lines,
 * a faint dot grid, and small orange accent squares. Pure CSS, subtle.
 */
const WaveBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-nivara-bg-primary" aria-hidden>
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: 'radial-gradient(#E4E3DF 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />

      {/* Thin guide lines */}
      <div className="absolute top-24 left-0 right-0 h-px bg-nivara-border/70" />
      <div className="absolute bottom-40 left-0 right-0 h-px bg-nivara-border/70" />
      <div className="absolute top-0 bottom-0 left-6 w-px bg-nivara-border/50" />
      <div className="absolute top-0 bottom-0 right-6 w-px bg-nivara-border/50" />

      {/* Orange accent squares */}
      <div className="absolute top-24 left-6 w-1.5 h-1.5 bg-nivara-danger" />
      <div className="absolute bottom-40 right-6 w-1.5 h-1.5 bg-nivara-danger" />
      <div className="absolute top-24 right-6 w-1.5 h-1.5 bg-nivara-warning/70" />
    </div>
  );
};

export default WaveBackground;
