import React, { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import * as L from "leaflet";

interface WaveParticle {
  id: number;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  phase: number;
  amplitude: number;
  frequency: number;
  speed: number;
  opacity: number;
  size: number;
  color: string;
  direction: number;
}

interface WaveAnimationProps {
  enabled?: boolean;
  particleCount?: number;
  waveSpeed?: number;
  waveAmplitude?: number;
  particleOpacity?: number;
  colors?: string[];
  onToggle?: (enabled: boolean) => void;
}

const WaveAnimation: React.FC<WaveAnimationProps> = ({
  enabled = true,
  particleCount = 150,
  waveSpeed = 0.02,
  waveAmplitude = 20,
  particleOpacity = 0.6,
  colors = ["#4FC3F7", "#29B6F6", "#03A9F4", "#039BE5", "#0288D1"],
}) => {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<WaveParticle[]>([]);
  const timeRef = useRef<number>(0);
  const [isAnimating, setIsAnimating] = useState(enabled);

  // Initialize particles
  const initializeParticles = React.useCallback(
    (mapBounds: L.LatLngBounds, canvasWidth: number, canvasHeight: number) => {
      const particles: WaveParticle[] = [];

      for (let i = 0; i < particleCount; i++) {
        // Random position within map bounds
        const lat =
          mapBounds.getSouth() +
          Math.random() * (mapBounds.getNorth() - mapBounds.getSouth());
        const lng =
          mapBounds.getWest() +
          Math.random() * (mapBounds.getEast() - mapBounds.getWest());
        const point = map.latLngToContainerPoint([lat, lng]);

        // Skip particles that are outside canvas bounds
        if (
          point.x < 0 ||
          point.x > canvasWidth ||
          point.y < 0 ||
          point.y > canvasHeight
        ) {
          continue;
        }

        particles.push({
          id: i,
          x: point.x,
          y: point.y,
          baseX: point.x,
          baseY: point.y,
          phase: Math.random() * Math.PI * 2,
          amplitude: waveAmplitude * (0.5 + Math.random() * 0.5),
          frequency: 0.01 + Math.random() * 0.02,
          speed: waveSpeed * (0.8 + Math.random() * 0.4),
          opacity: particleOpacity * (0.3 + Math.random() * 0.7),
          size: 2 + Math.random() * 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          direction: Math.random() * Math.PI * 2,
        });
      }

      particlesRef.current = particles;
    },
    [map, particleCount, waveAmplitude, waveSpeed, colors]
  );

  // Update particle positions with wave motion
  const updateParticles = React.useCallback(
    (time: number) => {
      particlesRef.current.forEach((particle) => {
        // Primary wave motion (horizontal)
        const waveX =
          Math.sin(time * particle.speed + particle.phase) * particle.amplitude;
        const waveY =
          Math.cos(time * particle.speed * 0.7 + particle.phase * 1.3) *
          particle.amplitude *
          0.5;

        // Secondary wave motion (vertical)
        const secondaryWaveX =
          Math.sin(time * particle.speed * 1.5 + particle.phase + Math.PI / 4) *
          particle.amplitude *
          0.3;
        const secondaryWaveY =
          Math.cos(time * particle.speed * 0.9 + particle.phase * 0.8) *
          particle.amplitude *
          0.7;

        // Combine waves for more realistic motion
        particle.x = particle.baseX + waveX + secondaryWaveX;
        particle.y = particle.baseY + waveY + secondaryWaveY;

        // Add slow drift to simulate current
        particle.baseX += Math.cos(particle.direction) * 0.1;
        particle.baseY += Math.sin(particle.direction) * 0.1;

        // Vary opacity with wave motion for shimmer effect
        const baseOpacity = particleOpacity * (0.3 + Math.random() * 0.7);
        particle.opacity = Math.max(
          0.1,
          Math.min(
            1.0,
            baseOpacity + Math.sin(time * 0.005 + particle.phase) * 0.2
          )
        );

        // Wrap particles around screen edges
        const canvas = canvasRef.current;
        if (canvas) {
          if (particle.baseX > canvas.width + 50) particle.baseX = -50;
          if (particle.baseX < -50) particle.baseX = canvas.width + 50;
          if (particle.baseY > canvas.height + 50) particle.baseY = -50;
          if (particle.baseY < -50) particle.baseY = canvas.height + 50;
        }
      });
    },
    [particleOpacity]
  );

  // Render particles
  const renderParticles = React.useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    particlesRef.current.forEach((particle) => {
      // Create gradient for particle
      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.size * 2
      );

      const alphaHex1 = Math.max(
        0,
        Math.min(255, Math.floor(particle.opacity * 255))
      )
        .toString(16)
        .padStart(2, "0");
      const alphaHex2 = Math.max(
        0,
        Math.min(255, Math.floor(particle.opacity * 180))
      )
        .toString(16)
        .padStart(2, "0");

      gradient.addColorStop(0, `${particle.color}${alphaHex1}`);
      gradient.addColorStop(0.5, `${particle.color}${alphaHex2}`);
      gradient.addColorStop(1, `${particle.color}00`);

      ctx.fillStyle = gradient;

      // Draw particle with glow effect
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      // Add trailing effect
      const trailLength = 5;
      for (let i = 1; i <= trailLength; i++) {
        const trailX = particle.x - Math.cos(particle.direction) * i * 2;
        const trailY = particle.y - Math.sin(particle.direction) * i * 2;
        const trailOpacity = particle.opacity * (1 - i / trailLength) * 0.5;
        const trailSize = particle.size * (1 - (i / trailLength) * 0.5);

        const trailAlphaHex = Math.max(
          0,
          Math.min(255, Math.floor(trailOpacity * 255))
        )
          .toString(16)
          .padStart(2, "0");

        ctx.fillStyle = `${particle.color}${trailAlphaHex}`;
        ctx.beginPath();
        ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, []);

  // Animation loop
  const animate = React.useCallback(() => {
    if (!isAnimating || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    timeRef.current += 1;

    updateParticles(timeRef.current);
    renderParticles(ctx);

    animationRef.current = requestAnimationFrame(animate);
  }, [isAnimating, updateParticles, renderParticles]);

  // Handle map events
  useEffect(() => {
    if (!map || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const mapContainer = map.getContainer();

    // Position canvas overlay
    const positionCanvas = () => {
      const mapSize = map.getSize();
      canvas.width = mapSize.x;
      canvas.height = mapSize.y;
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "400";

      // Initialize particles when canvas is ready
      initializeParticles(map.getBounds(), mapSize.x, mapSize.y);
    };

    positionCanvas();

    // Handle map events
    const handleMapMove = () => {
      if (canvasRef.current) {
        const mapSize = map.getSize();
        initializeParticles(map.getBounds(), mapSize.x, mapSize.y);
      }
    };

    const handleMapResize = () => {
      positionCanvas();
    };

    map.on("move", handleMapMove);
    map.on("zoom", handleMapMove);
    map.on("resize", handleMapResize);

    // Append canvas to map container
    mapContainer.appendChild(canvas);

    return () => {
      map.off("move", handleMapMove);
      map.off("zoom", handleMapMove);
      map.off("resize", handleMapResize);

      if (mapContainer.contains(canvas)) {
        mapContainer.removeChild(canvas);
      }
    };
  }, [map, particleCount, waveAmplitude, waveSpeed]);

  // Handle animation state
  useEffect(() => {
    setIsAnimating(enabled);
  }, [enabled]);

  useEffect(() => {
    if (isAnimating) {
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 400,
        }}
      />
    </>
  );
};

export default WaveAnimation;
