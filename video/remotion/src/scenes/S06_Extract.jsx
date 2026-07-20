import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C, HFONT, BFONT } from "../theme.js";
import { SceneFade, Kicker, Title, Caption, Card, springIn } from "../components.jsx";

export const S06_Extract = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const db = springIn(frame, fps, 24, { damping: 15 });
  const sas = springIn(frame, fps, 70, { damping: 14 });
  const r = springIn(frame, fps, 82, { damping: 14 });
  // packets flowing left->right
  const packets = [0, 1, 2, 3];
  return (
    <SceneFade>
      <Kicker>STEP 2 · EXTRACTION</Kicker>
      <Title lines={["Pull the data into the tools"]} size={68} top={210} />

      {/* EDC database cylinder */}
      <div style={{ position: "absolute", left: 220, top: 430, textAlign: "center", opacity: db, transform: `scale(${db})` }}>
        <Cylinder />
        <div style={{ fontFamily: BFONT, fontWeight: 700, fontSize: 28, color: C.white, marginTop: 18 }}>EDC database</div>
      </div>

      {/* flow packets */}
      {packets.map((i) => {
        const t = interpolate((frame - 40 - i * 12) % 60, [0, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const on = frame > 40 + i * 12;
        return (
          <div key={i} style={{ position: "absolute", left: 470 + t * 900, top: 520 + (i - 1.5) * 34, width: 18, height: 18, borderRadius: 4, backgroundColor: C.accent, opacity: on ? 0.85 : 0, boxShadow: `0 0 16px ${C.accent}` }} />
        );
      })}

      {/* SAS + R targets */}
      <div style={{ position: "absolute", left: 1380, top: 400, opacity: sas, transform: `scale(${sas})` }}>
        <ToolBox label="SAS" color={C.teal} />
      </div>
      <div style={{ position: "absolute", left: 1380, top: 590, opacity: r, transform: `scale(${r})` }}>
        <ToolBox label="R" color={C.sea} />
      </div>

      <Caption>
        Programmers extract the raw data out of the EDC into their tools —
        <span style={{ color: C.mint, fontWeight: 700 }}> SAS and R</span> — ready to be shaped.
      </Caption>
    </SceneFade>
  );
};

const Cylinder = () => (
  <div style={{ width: 190, margin: "0 auto" }}>
    <div style={{ height: 40, borderRadius: "50% / 100%", backgroundColor: C.teal }} />
    <div style={{ height: 130, backgroundColor: C.panel, borderLeft: `3px solid ${C.teal}`, borderRight: `3px solid ${C.teal}`, marginTop: -20 }} />
    <div style={{ height: 40, borderRadius: "50% / 100%", backgroundColor: C.teal, marginTop: -20 }} />
  </div>
);

const ToolBox = ({ label, color }) => (
  <div style={{ width: 300, height: 150, borderRadius: 18, backgroundColor: C.panel, border: `3px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HFONT, fontWeight: 700, fontSize: 54, color }}>
    {label}
  </div>
);
