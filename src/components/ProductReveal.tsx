import React from "react";
import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

type ProductRevealProps = {
  src: string;
  alt?: string;
};

export const ProductReveal: React.FC<ProductRevealProps> = ({
  src,
  alt = ""
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideUp = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80 },
    delay: 4
  });

  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 60 },
    delay: 2
  });

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        overflow: "hidden",
        width: "100%"
      }}
    >
      <Img
        src={staticFile(src)}
        alt={alt}
        style={{
          borderRadius: 12,
          height: "auto",
          maxHeight: "72%",
          maxWidth: "90%",
          objectFit: "contain",
          transform: `translateY(${(1 - slideUp) * 60}px) scale(${0.88 + scale * 0.12})`,
          width: "auto"
        }}
      />
    </div>
  );
};
