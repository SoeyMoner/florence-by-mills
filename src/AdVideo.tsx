import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from "remotion";
import type { AdVideoProps } from "./schema";
import { GlowParticles } from "./components/GlowParticles";
import { ProductReveal } from "./components/ProductReveal";
import { LogoSpring } from "./components/LogoSpring";

type SceneData = AdVideoProps["scenes"][number];
type AudioSpec = NonNullable<AdVideoProps["audio"]>;
type AudioTrack = AudioSpec["tracks"][number];

const audioSrc = (src: string) =>
  /^(https?:|data:audio\/)/i.test(src) ? src : staticFile(src);

const AudioLayer: React.FC<{ audio?: AudioSpec }> = ({ audio }) => {
  const { fps } = useVideoConfig();
  if (!audio?.enabled || audio.tracks.length === 0) return null;
  return (
    <>
      {audio.tracks.map((track: AudioTrack) => {
        const from = Math.round((track.startSecond ?? 0) * fps);
        const dur = track.durationSecond
          ? Math.round(track.durationSecond * fps)
          : undefined;
        const el = <Audio src={audioSrc(track.src)} volume={track.volume ?? 0.85} loop={track.loop ?? false} />;
        return dur ? (
          <Sequence key={track.id} from={from} durationInFrames={dur}>{el}</Sequence>
        ) : (
          <Sequence key={track.id} from={from}>{el}</Sequence>
        );
      })}
    </>
  );
};

const AnimatedHeadline: React.FC<{ text: string; isFirst: boolean }> = ({ text, isFirst }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!isFirst || !text.includes("\n")) {
    const s = spring({ frame, fps, config: { damping: 10, stiffness: 80 } });
    return (
      <h1
        style={{
          color: "#FFFFFF",
          fontFamily: "Cera Pro, Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: 68,
          fontWeight: 800,
          lineHeight: 1.08,
          margin: 0,
          opacity: s,
          padding: "0 8px",
          textShadow: "0 2px 24px rgba(0,0,0,0.5)",
          transform: `translateY(${(1 - s) * 24}px)`,
          whiteSpace: "pre-line"
        }}
      >
        {text}
      </h1>
    );
  }

  const lines = text.split("\n");
  return (
    <h1
      style={{
        color: "#FFFFFF",
        fontFamily: "Cera Pro, Inter, ui-sans-serif, system-ui, sans-serif",
        fontSize: 68,
        fontWeight: 800,
        lineHeight: 1.08,
        margin: 0,
        padding: "0 8px",
        textShadow: "0 2px 24px rgba(0,0,0,0.5)"
      }}
    >
      {lines.map((line, i) => {
        const s = spring({
          frame,
          fps,
          config: { damping: 12, stiffness: 90 },
          delay: i * 5
        });
        return (
          <span
            key={i}
            style={{
              display: "block",
              opacity: s,
              transform: `translateY(${(1 - s) * 18}px)`
            }}
          >
            {line}
          </span>
        );
      })}
    </h1>
  );
};

const Scene: React.FC<{
  scene: SceneData;
  primaryColor: string;
  backgroundColor: string;
  softColor?: string;
  brandName: string;
  logoPath?: string;
  isFirst: boolean;
  isLast: boolean;
}> = ({ scene, primaryColor, backgroundColor, softColor, brandName, logoPath, isFirst, isLast }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const sceneFrames = Math.max(1, Math.round(scene.durationSecond * fps));
  const inDuration = Math.min(14, Math.round(sceneFrames * 0.2));
  const outDuration = Math.min(14, Math.round(sceneFrames * 0.2));

  const opacity = interpolate(
    frame,
    [0, inDuration, sceneFrames - outDuration, sceneFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const useBg = scene.useFullBg ?? false;
  const hasImage = !!(scene.localImage || scene.imageUrl);
  const isCta = scene.id === "cta";

  const ctaPulse = spring({
    frame: frame - Math.round(sceneFrames * 0.25),
    fps,
    config: { damping: 8, stiffness: 120 },
    delay: 0
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Background */}
      {useBg && hasImage ? (
        <Img
          src={scene.localImage ? staticFile(scene.localImage) : (scene.imageUrl ?? "")}
          style={{
            filter: isCta ? "brightness(0.25)" : "brightness(0.45)",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            width: "100%"
          }}
        />
      ) : (
        <div
          style={{
            background: isCta
              ? `linear-gradient(135deg, ${backgroundColor} 0%, ${primaryColor}44 50%, ${backgroundColor} 100%)`
              : `linear-gradient(160deg, ${backgroundColor} 0%, ${softColor ?? primaryColor}22 40%, ${backgroundColor} 100%)`,
            height: "100%",
            position: "absolute",
            width: "100%"
          }}
        />
      )}

      {/* Glow particles on non-CTA scenes */}
      {!isCta && <GlowParticles color={primaryColor} />}

      {/* Content */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: isCta ? "center" : "flex-end",
          padding: isCta ? 0 : "0 48px 120px 48px"
        }}
      >
        {/* Product image for non-full-bg scenes */}
        {!useBg && hasImage && (
          <ProductReveal
            src={scene.localImage ?? ""}
            alt={scene.headline}
          />
        )}

        {/* CTA specific layout */}
        {isCta && (
          <div
            style={{
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
              gap: 48,
              zIndex: 2
            }}
          >
            <LogoSpring delay={0}>
              <div
                style={{
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12
                }}
              >
                {logoPath ? (
                  <Img
                    src={staticFile(logoPath)}
                    style={{ height: 52, objectFit: "contain" }}
                  />
                ) : null}
                <span
                  style={{
                    color: primaryColor,
                    fontFamily: "Cera Pro, Inter, ui-sans-serif, system-ui, sans-serif",
                    fontSize: 32,
                    fontWeight: 700,
                    letterSpacing: 4,
                    textTransform: "uppercase"
                  }}
                >
                  {brandName}
                </span>
              </div>
            </LogoSpring>

            <LogoSpring delay={5} config={{ damping: 8, stiffness: 130 }}>
              <div
                style={{
                  background: primaryColor,
                  borderRadius: 999,
                  boxShadow: `0 0 48px ${primaryColor}66`,
                  color: "#fff",
                  fontSize: 38,
                  fontWeight: 800,
                  padding: "22px 56px",
                  transform: `scale(${0.95 + ctaPulse * 0.05})`,
                  transition: "transform 0.2s"
                }}
              >
                {scene.headline}
              </div>
            </LogoSpring>
          </div>
        )}

        {/* Text block for non-CTA scenes */}
        {!isCta && (
          <div
            style={{
              marginTop: hasImage ? 32 : 0,
              position: "relative",
              textAlign: "center",
              width: "100%",
              zIndex: 2
            }}
          >
            {scene.eyebrow && (
              <p
                style={{
                  color: primaryColor,
                  fontFamily: "Cera Pro, Inter, ui-sans-serif, system-ui, sans-serif",
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: 6,
                  margin: "0 0 12px 0",
                  textTransform: "uppercase"
                }}
              >
                {scene.eyebrow}
              </p>
            )}
            <AnimatedHeadline text={scene.headline} isFirst={isFirst} />
            {scene.body && (
              <p
                style={{
                  color: softColor ?? primaryColor,
                  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
                  fontSize: 30,
                  fontWeight: 500,
                  lineHeight: 1.25,
                  margin: "16px 0 0 0",
                  opacity: 0.9
                }}
              >
                {scene.body}
              </p>
            )}
            {scene.proof && (
              <p
                style={{
                  color: primaryColor,
                  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
                  fontSize: 24,
                  fontWeight: 600,
                  letterSpacing: 2,
                  margin: "14px 0 0 0",
                  opacity: 0.85,
                  textTransform: "uppercase"
                }}
              >
                {scene.proof}
              </p>
            )}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const AdVideo: React.FC<AdVideoProps> = (props) => {
  const { fps } = useVideoConfig();
  const softColor = props.softColor ?? props.primaryColor;

  return (
    <AbsoluteFill style={{ backgroundColor: props.backgroundColor }}>
      <AudioLayer audio={props.audio} />

      {props.scenes.map((scene, idx) => (
        <Sequence
          key={scene.id}
          from={Math.round(scene.startSecond * fps)}
          durationInFrames={Math.round(scene.durationSecond * fps)}
        >
          <Scene
            scene={scene}
            primaryColor={props.primaryColor}
            backgroundColor={props.backgroundColor}
            softColor={softColor}
            brandName={props.brandName}
            logoPath={props.logoPath}
            isFirst={idx === 0}
            isLast={idx === props.scenes.length - 1}
          />
        </Sequence>
      ))}

      {/* Bottom bar: offer + disclaimer */}
      <div
        style={{
          bottom: 36,
          color: "rgba(255,255,255,0.64)",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: 22,
          left: 48,
          position: "absolute",
          right: 48,
          textAlign: "center",
          zIndex: 10
        }}
      >
        {props.offer ? `${props.offer}  ·  ` : ""}
        {props.disclaimer ?? ""}
      </div>
    </AbsoluteFill>
  );
};