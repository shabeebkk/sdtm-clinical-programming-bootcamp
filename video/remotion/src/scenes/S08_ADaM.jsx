import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C, HFONT, BFONT, MONO } from "../theme.js";
import { SceneFade, Kicker, Title, Caption, Card, springIn } from "../components.jsx";

const COLS = [
  { k: "USUBJID", v: "ABC-01-001", c: C.subtle },
  { k: "PARAM", v: "Systolic BP", c: C.subtle },
  { k: "AVAL", v: "118", c: C.white },
  { k: "BASE", v: "120", c: C.white },
  { k: "CHG", v: "-2", c: C.accent },
  { k: "TRTP", v: "Drug A", c: C.mint },
];

export const S08_ADaM = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <SceneFade>
      <Kicker>STEP 4 · ANALYSIS</Kicker>
      <Title lines={["Add what statisticians need — ADaM"]} size={62} top={210} />

      {/* derived analysis row */}
      <div style={{ position: "absolute", left: 150, top: 440, display: "flex", gap: 20 }}>
        {COLS.map((col, i) => {
          const s = springIn(frame, fps, 30 + i * 10, { damping: 14 });
          return (
            <div key={i} style={{ opacity: s, transform: `translateY(${(1 - s) * 30}px) scale(${s})` }}>
              <div style={{ fontFamily: MONO, fontSize: 22, color: C.mint, marginBottom: 8 }}>{col.k}</div>
              <Card x={0} y={0} w={col.k === "USUBJID" ? 250 : 190} h={96} fill={C.ink2} radius={12} style={{ border: `2px solid ${col.k === "CHG" ? C.accent : C.line}`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: BFONT, fontWeight: 700, fontSize: col.k === "CHG" ? 44 : 30, color: col.c }}>{col.v}</span>
              </Card>
            </div>
          );
        })}
      </div>

      <div style={{ position: "absolute", left: 150, top: 640, width: 1620, fontFamily: BFONT, fontSize: 30, color: C.subtle, opacity: interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), lineHeight: 1.4 }}>
        <span style={{ color: C.white, fontWeight: 700 }}>ADaM</span> = Analysis Data Model. It derives new values —
        here, baseline 120 and a <span style={{ color: C.accent, fontWeight: 700 }}>change of −2</span> at Week 4 — and always traces back to SDTM.
      </div>

      <Caption>
        Analysis datasets add derivations: baseline, change-from-baseline, and treatment
        groups — the building blocks of every statistical result.
      </Caption>
    </SceneFade>
  );
};
