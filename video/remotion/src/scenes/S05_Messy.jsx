import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C, HFONT, BFONT, MONO } from "../theme.js";
import { SceneFade, Kicker, Title, Caption, Card, springIn } from "../components.jsx";

const ROWS = [
  ["001", "bad headache", "15/03/2024", "2", "moderate"],
  ["002", "Nausea", "10-Mar-2024", "1", "MILD"],
  ["001", "dizziness", "20/03/2024", "F", "Moderate"],
];
const HEAD = ["SUBJID", "AETERM", "DATE", "SEX", "SEVERITY"];
const WIDTHS = [120, 250, 210, 80, 210]; // fixed column widths so cells never collide
const FLAGS = [
  { x: 1180, y: 470, text: "mixed date formats" },
  { x: 1180, y: 560, text: "codes vs. letters (2 / F)" },
  { x: 1180, y: 650, text: "free text, mixed case" },
];

export const S05_Messy = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <SceneFade>
      <Kicker color={C.accent}>THE PROBLEM</Kicker>
      <Title lines={["Raw data is messy"]} size={72} top={210} />

      {/* messy table */}
      <Card x={130} y={400} w={960} h={320} fill={C.ink2} radius={16} style={{ border: `2px solid ${C.line}` }}>
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex" }}>
            {HEAD.map((h, i) => (
              <div key={i} style={{ width: WIDTHS[i], flex: "none", fontFamily: MONO, fontWeight: 700, fontSize: 24, color: C.mint }}>{h}</div>
            ))}
          </div>
          {ROWS.map((r, ri) => {
            const s = springIn(frame, fps, 26 + ri * 12, { damping: 14 });
            return (
              <div key={ri} style={{ display: "flex", marginTop: 18, opacity: s, transform: `translateX(${(1 - s) * -30}px)` }}>
                {r.map((c, ci) => (
                  <div key={ci} style={{ width: WIDTHS[ci], flex: "none", fontFamily: MONO, fontSize: 24, color: [2, 3, 4].includes(ci) ? C.accent : C.subtle }}>{c}</div>
                ))}
              </div>
            );
          })}
        </div>
      </Card>

      {/* callout flags */}
      {FLAGS.map((f, i) => {
        const s = springIn(frame, fps, 70 + i * 14, { damping: 13 });
        return (
          <div key={i} style={{ position: "absolute", left: f.x, top: f.y, display: "flex", alignItems: "center", gap: 14, opacity: s, transform: `translateX(${(1 - s) * 26}px)` }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: C.accent, color: C.ink, fontWeight: 800, fontFamily: BFONT, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>!</div>
            <div style={{ fontFamily: BFONT, fontSize: 28, color: C.white }}>{f.text}</div>
          </div>
        );
      })}

      <Caption>
        Every site and every form records things a little differently. Before anyone can
        analyze it, this data must be cleaned and made consistent.
      </Caption>
    </SceneFade>
  );
};
