import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C, HFONT, BFONT } from "../theme.js";
import { SceneFade, Kicker, Title, Caption, springIn } from "../components.jsx";

const PHASES = [
  { n: "1", label: "Safety", who: "20–80 healthy volunteers", dots: 6, color: C.teal },
  { n: "2", label: "Efficacy & dose", who: "~100–300 patients", dots: 12, color: C.sea },
  { n: "3", label: "Confirm", who: "1,000s of patients", dots: 24, color: C.mint },
  { n: "4", label: "Post-marketing", who: "after approval", dots: 16, color: C.accent },
];

const PhaseCol = ({ p, x, frame, fps, delay }) => {
  const s = springIn(frame, fps, delay, { damping: 15 });
  const cols = 6;
  return (
    <div style={{ position: "absolute", left: x, top: 360, width: 380, opacity: s, transform: `translateY(${(1 - s) * 40}px)` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <div style={{ fontFamily: HFONT, fontWeight: 700, fontSize: 30, color: p.color }}>PHASE</div>
        <div style={{ fontFamily: HFONT, fontWeight: 700, fontSize: 66, color: p.color }}>{p.n}</div>
      </div>
      <div style={{ fontFamily: BFONT, fontWeight: 700, fontSize: 30, color: C.white, marginTop: 4 }}>{p.label}</div>
      <div style={{ fontFamily: BFONT, fontSize: 23, color: C.subtle, marginTop: 4 }}>{p.who}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 9, width: 240, marginTop: 22 }}>
        {Array.from({ length: p.dots }).map((_, i) => {
          const ds = springIn(frame, fps, delay + 8 + i * 1.4, { damping: 12, mass: 0.5 });
          return <div key={i} style={{ width: 26, height: 26, borderRadius: "50%", backgroundColor: p.color, opacity: ds, transform: `scale(${ds})` }} />;
        })}
      </div>
    </div>
  );
};

export const S03_Phases = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const highlight = interpolate(frame, [120, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <SceneFade>
      <Kicker>BEFORE THE DATA — THE TRIAL</Kicker>
      <Title lines={["Every medicine is tested in phases"]} size={68} top={210} />
      {PHASES.map((p, i) => (
        <PhaseCol key={i} p={p} x={130 + i * 430} frame={frame} fps={fps} delay={26 + i * 16} />
      ))}
      {/* arrow spanning phases */}
      <div style={{ position: "absolute", left: 150, top: 690, width: 1620, height: 4, backgroundColor: C.line }} />
      <div style={{ position: "absolute", left: 1740, top: 680, color: C.line, fontSize: 30 }}>▶</div>
      <Caption>
        Trials grow from a handful of volunteers to thousands of patients. Our data point is
        born in a <span style={{ color: C.mint, fontWeight: 700 }}>Phase 3</span> trial —
        <span style={{ opacity: highlight }}> where the evidence for approval is built.</span>
      </Caption>
    </SceneFade>
  );
};
