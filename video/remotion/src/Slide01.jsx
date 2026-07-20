import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// ---- Palette: identical to the pptx deck ----
const INK = "#0F2E3D";
const RING_DK = "#133B4C";
const TEAL = "#0E7C86";
const MINT = "#6FC8B4";
const ACCENT = "#E8833A";
const SUBTLE = "#C7DCE0";
const MUTED = "#5A7682";

// Slide is authored in inches (13.33 x 7.5) -> scale to 1920x1080 (144 px/in)
const IN = 144;

const HFONT = "'Cambria', 'Georgia', serif";
const BFONT = "'Calibri', 'Helvetica Neue', Arial, sans-serif";

export const Slide01 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Rings: spring-scale in, staggered, then a slow breathing drift ---
  const ringIn = (delay) =>
    spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.9 } });
  const drift = Math.sin(frame / 55) * 8; // gentle float, px

  // --- Eyebrow: fade + letter-spacing expands ---
  const eyebrowT = interpolate(frame, [25, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // --- Title lines: rise + fade, staggered ---
  const lineIn = (delay) => {
    const t = interpolate(frame, [delay, delay + 26], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    return { opacity: t, transform: `translateY(${(1 - t) * 55}px)` };
  };

  // --- Subtitle underline-free fade ---
  const subT = interpolate(frame, [105, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // --- Footer standards chips: staggered pop ---
  const chips = ["CDISC", "CDASH", "SDTM", "ADaM", "Controlled Terminology", "Define-XML"];
  const chipIn = (i) =>
    spring({ frame: frame - (135 + i * 6), fps, config: { damping: 13, mass: 0.6 } });

  return (
    <AbsoluteFill style={{ backgroundColor: INK, fontFamily: BFONT, overflow: "hidden" }}>
      {/* Concentric ring motif, top-right — same geometry as the deck */}
      <Ring x={9.7} y={-1.6} d={5.2} color={RING_DK} scale={ringIn(0)} drift={drift * 0.4} />
      <Ring x={10.7} y={-0.6} d={3.2} color={TEAL} scale={ringIn(8)} drift={drift * 0.7} />
      <Ring x={11.45} y={0.15} d={1.7} color={ACCENT} scale={ringIn(16)} drift={drift} />

      {/* Eyebrow */}
      <div
        style={{
          position: "absolute",
          left: 0.7 * IN,
          top: 2.0 * IN,
          color: MINT,
          fontWeight: 700,
          fontSize: 27,
          letterSpacing: 2 + eyebrowT * 6,
          opacity: eyebrowT,
        }}
      >
        CLINICAL PROGRAMMING BOOTCAMP&nbsp;&nbsp;·&nbsp;&nbsp;MODULE 01
      </div>

      {/* Title — two lines, staggered rise */}
      <div
        style={{
          position: "absolute",
          left: 0.66 * IN,
          top: 2.5 * IN,
          fontFamily: HFONT,
          fontWeight: 700,
          fontSize: 92,
          lineHeight: 1.08,
          color: "white",
        }}
      >
        <div style={lineIn(55)}>Introduction to CDISC</div>
        <div style={lineIn(72)}>&amp; SDTM Foundations</div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          left: 0.7 * IN,
          top: 4.85 * IN,
          width: 9.2 * IN,
          fontSize: 32,
          lineHeight: 1.35,
          color: SUBTLE,
          opacity: subT,
          transform: `translateY(${(1 - subT) * 24}px)`,
        }}
      >
        How clinical trial data becomes a standardized, submission-ready dataset —
        from raw case report forms to a regulatory package.
      </div>

      {/* Standards chips (animated version of the footer line) */}
      <div
        style={{
          position: "absolute",
          left: 0.7 * IN,
          top: 6.45 * IN,
          display: "flex",
          gap: 18,
        }}
      >
        {chips.map((c, i) => {
          const s = chipIn(i);
          return (
            <div
              key={c}
              style={{
                transform: `scale(${s})`,
                opacity: s,
                border: `2px solid ${i === 2 ? ACCENT : "#2A5566"}`,
                color: i === 2 ? ACCENT : MUTED,
                fontWeight: i === 2 ? 700 : 400,
                fontStyle: "italic",
                borderRadius: 999,
                padding: "8px 22px",
                fontSize: 22,
              }}
            >
              {c}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Circle positioned in slide inches, spring-scaled around its center
const Ring = ({ x, y, d, color, scale, drift }) => (
  <div
    style={{
      position: "absolute",
      left: x * IN,
      top: y * IN + drift,
      width: d * IN,
      height: d * IN,
      borderRadius: "50%",
      backgroundColor: color,
      transform: `scale(${scale})`,
    }}
  />
);
