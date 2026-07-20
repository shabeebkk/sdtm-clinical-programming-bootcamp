import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C, HFONT, BFONT, MONO } from "../theme.js";
import { SceneFade, Kicker, Title, Caption, Card, springIn } from "../components.jsx";

// messy scattered chips snap into a tidy standardized row
const SNAP = [
  { from: [180, 430], to: [150, 470], text: "120", std: "VSORRES" },
  { from: [520, 400], to: [430, 470], text: "mmHg", std: "VSORRESU" },
  { from: [340, 620], to: [710, 470], text: "SYSBP", std: "VSTESTCD" },
  { from: [700, 640], to: [990, 470], text: "VS", std: "DOMAIN" },
];

export const S07_SDTM = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const snapT = interpolate(frame, [40, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", });
  const labels = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <SceneFade>
      <Kicker>STEP 3 · STANDARDIZATION</Kicker>
      <Title lines={["Give every study the same shape — SDTM"]} size={58} top={210} />

      {/* tidy target frame */}
      <Card x={120} y={430} w={1120} h={210} fill="transparent" radius={16} style={{ border: `2px dashed ${C.line}`, opacity: interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />

      {SNAP.map((s, i) => {
        const x = s.from[0] + (s.to[0] - s.from[0]) * snapT;
        const y = s.from[1] + (s.to[1] - s.from[1]) * snapT;
        return (
          <div key={i}>
            <div style={{ position: "absolute", left: x, top: y, padding: "18px 26px", borderRadius: 14, backgroundColor: C.ink2, border: `2px solid ${C.accent}`, fontFamily: BFONT, fontWeight: 800, fontSize: 40, color: C.accent }}>
              {s.text}
            </div>
            <div style={{ position: "absolute", left: s.to[0], top: s.to[1] + 92, fontFamily: MONO, fontSize: 22, color: C.mint, opacity: labels }}>{s.std}</div>
          </div>
        );
      })}

      <div style={{ position: "absolute", left: 1290, top: 470, width: 500, fontFamily: BFONT, fontSize: 30, color: C.subtle, opacity: labels, lineHeight: 1.4 }}>
        <span style={{ color: C.white, fontWeight: 700 }}>SDTM</span> = Study Data Tabulation Model.
        One row = one observation. The same structure for every study, every sponsor.
      </div>

      <Caption>
        The cleaned values snap into standard variables. Now <span style={{ color: C.accent, fontWeight: 700 }}>120</span> is
        VSORRES in the VS domain — instantly recognizable to any reviewer.
      </Caption>
    </SceneFade>
  );
};
