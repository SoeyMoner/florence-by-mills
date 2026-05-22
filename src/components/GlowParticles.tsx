import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

type Particle = {
  cx: number;
  cy: number;
  r: number;
  delay: number;
  speed: number;
  opacity: number;
};

const PARTICLE_COUNT = 18;

export const GlowParticles: React.FC<{ color?: string }> = ({
  color = "#7069BC"
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const particles = useMemo<Particle[]>(() => {
    const list: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      list.push({
        cx: Math.random() * width,
        cy: Math.random() * height,
        r: 4 + Math.random() * 14,
        delay: Math.random() * 3,
        speed: 0.15 + Math.random() * 0.35,
        opacity: 0.12 + Math.random() * 0.22
      });
    }
    return list;
  }, [width, height]);

  return (
    <svg
      style={{
        height: "100%",
        left: 0,
        pointerEvents: "none",
        position: "absolute",
        top: 0,
        width: "100%"
      }}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <radialGradient id="glow-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity={0.6} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      {particles.map((p, i) => {
        const t = (frame / fps - p.delay) * p.speed;
        const alpha = interpolate(
          Math.sin(t * Math.PI * 2),
          [-1, 1],
          [p.opacity * 0.3, p.opacity]
        );
        const driftY = interpolate(
          Math.sin(t * 1.4),
          [-1, 1],
          [-18, 18]
        );
        return (
          <circle
            key={i}
            cx={p.cx}
            cy={p.cy + driftY}
            r={p.r}
            fill="url(#glow-grad)"
            opacity={Math.max(0, alpha)}
          />
        );
      })}
    </svg>
  );
};
