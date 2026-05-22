import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

type LogoSpringProps = {
  children: React.ReactNode;
  delay?: number;
  config?: { damping: number; stiffness: number };
};

export const LogoSpring: React.FC<LogoSpringProps> = ({
  children,
  delay = 0,
  config = { damping: 10, stiffness: 100 }
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({
    frame,
    fps,
    config,
    delay
  });

  return (
    <div
      style={{
        transform: `scale(${s})`,
        transformOrigin: "center center"
      }}
    >
      {children}
    </div>
  );
};
