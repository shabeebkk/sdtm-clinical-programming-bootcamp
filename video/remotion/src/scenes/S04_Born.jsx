import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C, HFONT, BFONT, MONO } from "../theme.js";
import { SceneFade, Kicker, Title, Caption, Card, springIn, rise } from "../components.jsx";

// patient -> CRF/EDC -> raw data cell
export const S04_Born = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(frame, fps, 24, { damping: 15 });
  const edc = springIn(frame, fps, 54, { damping: 15 });
  const travel = interpolate(frame, [70, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cell = springIn(frame, fps, 108, { damping: 13 });
  return (
    <SceneFade>
      <Kicker>STEP 1 · COLLECTION</Kicker>
      <Title lines={["The data is born"]} size={72} top={210} />

      {/* patient */}
      <div style={{ position: "absolute", left: 200, top: 400, textAlign: "center", opacity: p, transform: `scale(${p})` }}>
        <div style={{ fontSize: 120 }}>🧑‍⚕️</div>
        <div style={{ fontFamily: BFONT, fontSize: 26, color: C.subtle }}>nurse records<br />BP 120/78</div>
      </div>

      <Arrow x={470} y={470} on={frame > 50} />

      {/* EDC system */}
      <div style={{ position: "absolute", left: 640, top: 400, textAlign: "center", opacity: edc, transform: `scale(${edc})` }}>
        <div style={{ width: 200, height: 150, borderRadius: 18, backgroundColor: C.panel, border: `3px solid ${C.teal}`, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 70 }}>💻</div>
        <div style={{ fontFamily: BFONT, fontWeight: 700, fontSize: 26, color: C.white, marginTop: 12 }}>EDC system</div>
        <div style={{ fontFamily: BFONT, fontSize: 22, color: C.muted }}>Electronic Data Capture</div>
      </div>

      <Arrow x={900} y={470} on={frame > 90} />

      {/* raw cell */}
      <div style={{ position: "absolute", left: 1080, top: 420, opacity: cell, transform: `scale(${cell})` }}>
        <Card x={0} y={0} w={640} h={120} fill={C.ink2} radius={14} style={{ border: `2px solid ${C.line}` }}>
          <div style={{ fontFamily: MONO, fontSize: 26, color: C.subtle, padding: "18px 24px" }}>
            SUBJID,VSTEST,RESULT<br />
            <span style={{ color: C.accent }}>001,SYSBP,120</span>
          </div>
        </Card>
        <div style={{ fontFamily: BFONT, fontWeight: 700, fontSize: 26, color: C.mint, marginTop: 16 }}>raw data</div>
      </div>

      <Caption>
        At a clinic, a measurement is entered into an EDC — Electronic Data Capture — system.
        This is <span style={{ color: C.mint, fontWeight: 700 }}>raw data</span>: exactly as collected.
      </Caption>
    </SceneFade>
  );
};

const Arrow = ({ x, y, on }) => (
  <div style={{ position: "absolute", left: x, top: y, fontSize: 44, color: C.accent, opacity: on ? 1 : 0.15, transition: "opacity 0.2s" }}>▶</div>
);
