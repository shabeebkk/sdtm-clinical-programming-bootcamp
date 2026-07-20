import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { C, HFONT, BFONT } from "./theme.js";

// Persistent ink background with a faint, slowly-drifting ring motif (deck echo).
export const StoryBackdrop = () => {
  const frame = useCurrentFrame();
  const d = Math.sin(frame / 90) * 14;
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, overflow: "hidden" }}>
      <div style={ring(1420, -260 + d, 720, C.ink2, 0.6)} />
      <div style={ring(1560, -120 + d * 0.6, 440, "#0c2733", 0.7)} />
      <div style={ring(-220, 760 - d, 520, C.ink2, 0.5)} />
    </AbsoluteFill>
  );
};

const ring = (x, y, s, color, op) => ({
  position: "absolute",
  left: x,
  top: y,
  width: s,
  height: s,
  borderRadius: "50%",
  backgroundColor: color,
  opacity: op,
});

// Fades scene content in at the start and out at the end of its sequence.
export const SceneFade = ({ children, hold = 12 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = interpolate(
    frame,
    [0, hold, durationInFrames - hold, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// Rise-and-fade helper for staggered element entrances.
export const rise = (frame, delay, dist = 46, dur = 24) => {
  const t = interpolate(frame, [delay, delay + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return { opacity: t, transform: `translateY(${(1 - t) * dist}px)` };
};

export const springIn = (frame, fps, delay, cfg) =>
  spring({ frame: frame - delay, fps, config: cfg || { damping: 14, mass: 0.8 } });

// Small uppercase kicker/eyebrow.
export const Kicker = ({ children, color = C.mint, delay = 4, left = 150, top = 150 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        color,
        fontFamily: BFONT,
        fontWeight: 700,
        fontSize: 26,
        letterSpacing: 3 + t * 5,
        opacity: t,
      }}
    >
      {children}
    </div>
  );
};

// Big serif scene title (supports multiple lines via array).
export const Title = ({ lines, left = 150, top = 210, size = 84, color = C.white, delay = 16 }) => {
  const frame = useCurrentFrame();
  const arr = Array.isArray(lines) ? lines : [lines];
  return (
    <div style={{ position: "absolute", left, top, fontFamily: HFONT, fontWeight: 700, fontSize: size, lineHeight: 1.1, color }}>
      {arr.map((l, i) => (
        <div key={i} style={rise(frame, delay + i * 10)}>
          {l}
        </div>
      ))}
    </div>
  );
};

// Bottom narration caption (voiceover-ready). Fades independently.
export const Caption = ({ children, delay = 24, color = C.subtle }) => {
  const frame = useCurrentFrame();
  const s = rise(frame, delay, 26, 22);
  return (
    <div
      style={{
        position: "absolute",
        left: 150,
        right: 150,
        bottom: 110,
        fontFamily: BFONT,
        fontSize: 34,
        lineHeight: 1.4,
        color,
        ...s,
      }}
    >
      {children}
    </div>
  );
};

// Rounded card.
export const Card = ({ x, y, w, h, fill = C.panel, radius = 18, style, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      backgroundColor: fill,
      borderRadius: radius,
      ...style,
    }}
  >
    {children}
  </div>
);

// The recurring "data point" chip that threads through the whole story.
export const DataChip = ({ x, y, label = "120", unit = "mmHg", scale = 1, glow = true, color = C.accent }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `scale(${scale})`,
      transformOrigin: "left center",
      display: "flex",
      alignItems: "baseline",
      gap: 10,
      padding: "14px 26px",
      borderRadius: 16,
      backgroundColor: C.ink2,
      border: `2px solid ${color}`,
      boxShadow: glow ? `0 0 34px ${color}66` : "none",
      fontFamily: BFONT,
    }}
  >
    <span style={{ color, fontWeight: 800, fontSize: 46 }}>{label}</span>
    <span style={{ color: C.subtle, fontWeight: 600, fontSize: 24 }}>{unit}</span>
  </div>
);

// Small pipeline pill used in intro/closing.
export const Pill = ({ children, active, x, y }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      padding: "10px 24px",
      borderRadius: 999,
      border: `2px solid ${active ? C.accent : C.line}`,
      color: active ? C.accent : C.muted,
      fontWeight: active ? 800 : 500,
      fontFamily: BFONT,
      fontSize: 24,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);
