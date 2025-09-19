import React from "react";
import { Waves, Play, Pause } from "lucide-react";
import "./WaveControls.css";

interface WaveControlsProps {
  enabled: boolean;
  particleCount: number;
  waveSpeed: number;
  waveAmplitude: number;
  particleOpacity: number;
  onToggle: (enabled: boolean) => void;
  onParticleCountChange: (count: number) => void;
  onWaveSpeedChange: (speed: number) => void;
  onWaveAmplitudeChange: (amplitude: number) => void;
  onParticleOpacityChange: (opacity: number) => void;
}

const WaveControls: React.FC<WaveControlsProps> = ({
  enabled,
  particleCount,
  waveSpeed,
  waveAmplitude,
  particleOpacity,
  onToggle,
  onParticleCountChange,
  onWaveSpeedChange,
  onWaveAmplitudeChange,
  onParticleOpacityChange,
}) => {
  return (
    <div className="wave-controls">
      {enabled && <div className="wave-animation-indicator" />}

      <div className="wave-controls-header">
        <div className="wave-controls-title">
          <Waves size={14} />
          Wave Flow
        </div>
        <button
          className={`wave-toggle-btn ${enabled ? "active" : ""}`}
          onClick={() => onToggle(!enabled)}
          title={enabled ? "Pause Wave Animation" : "Play Wave Animation"}
        >
          {enabled ? <Pause size={12} /> : <Play size={12} />}
        </button>
      </div>

      <div className="wave-controls-content">
        <div className="wave-control-item">
          <div className="wave-control-label">
            <span>Density</span>
            <span className="wave-control-value">{particleCount}</span>
          </div>
          <input
            type="range"
            min="50"
            max="300"
            value={particleCount}
            onChange={(e) => onParticleCountChange(Number(e.target.value))}
            className="wave-control-slider"
          />
        </div>

        <div className="wave-control-item">
          <div className="wave-control-label">
            <span>Speed</span>
            <span className="wave-control-value">
              {Math.round(waveSpeed * 1000)}
            </span>
          </div>
          <input
            type="range"
            min="0.005"
            max="0.05"
            step="0.001"
            value={waveSpeed}
            onChange={(e) => onWaveSpeedChange(Number(e.target.value))}
            className="wave-control-slider"
          />
        </div>

        <div className="wave-control-item">
          <div className="wave-control-label">
            <span>Amplitude</span>
            <span className="wave-control-value">
              {Math.round(waveAmplitude)}
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            value={waveAmplitude}
            onChange={(e) => onWaveAmplitudeChange(Number(e.target.value))}
            className="wave-control-slider"
          />
        </div>

        <div className="wave-control-item">
          <div className="wave-control-label">
            <span>Opacity</span>
            <span className="wave-control-value">
              {Math.round(particleOpacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={particleOpacity}
            onChange={(e) => onParticleOpacityChange(Number(e.target.value))}
            className="wave-control-slider"
          />
        </div>
      </div>
    </div>
  );
};

export default WaveControls;
