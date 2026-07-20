import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C, HFONT, BFONT, MONO } from "../theme.js";
import { SceneFade, Kicker, Title, Caption, Card, springIn } from "../components.jsx";

export const S09_Report = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tbl = springIn(frame, fps, 30, { damping: 15 });
  // line chart progress
  const draw = interpolate(frame, [70, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const drugA = [[0, 120], [1, 119], [2, 118], [3, 116]];
  const placebo = [[0, 121], [1, 121], [2, 120], [3, 120]];
  const px = (pt) => [180 + pt[0] * 150, 300 - (pt[1] - 112) * 22];

  const polyline = (pts) =>
    pts.map(px).map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");

  return (
    <SceneFade>
      <Kicker>STEP 5 · REPORTING</Kicker>
      <Title lines={["Tables, Listings & Figures (TLFs)"]} size={62} top={210} />

      {/* results table */}
      <div style={{ position: "absolute", left: 150, top: 430, opacity: tbl, transform: `translateY(${(1 - tbl) * 30}px)` }}>
        <div style={{ fontFamily: BFONT, fontWeight: 700, fontSize: 26, color: C.mint, marginBottom: 14 }}>Table 14.1 — Mean Systolic BP change</div>
        <Card x={0} y={0} w={720} h={250} fill={C.ink2} radius={14} style={{ border: `2px solid ${C.line}` }}>
          <div style={{ padding: 26, fontFamily: MONO, fontSize: 25, color: C.subtle, lineHeight: 1.9 }}>
            <div style={{ color: C.mint, fontWeight: 700 }}>Group        Baseline   Week 4   Change</div>
            <div>Drug A        120.0     116.0    <span style={{ color: C.accent }}>-4.0</span></div>
            <div>Placebo       121.0     120.0    <span style={{ color: C.subtle }}>-1.0</span></div>
          </div>
        </Card>
      </div>

      {/* figure: line chart */}
      <div style={{ position: "absolute", left: 980, top: 410 }}>
        <div style={{ fontFamily: BFONT, fontWeight: 700, fontSize: 26, color: C.mint, marginBottom: 14 }}>Figure 2 — BP over time</div>
        <svg width="760" height="320" style={{ backgroundColor: C.ink2, borderRadius: 14, border: `2px solid ${C.line}` }}>
          {/* axes */}
          <line x1="120" y1="60" x2="120" y2="300" stroke={C.line} strokeWidth="2" />
          <line x1="120" y1="300" x2="700" y2="300" stroke={C.line} strokeWidth="2" />
          <path d={polyline(placebo)} fill="none" stroke={C.subtle} strokeWidth="4" strokeDasharray="1000" strokeDashoffset={1000 * (1 - draw)} />
          <path d={polyline(drugA)} fill="none" stroke={C.accent} strokeWidth="5" strokeDasharray="1000" strokeDashoffset={1000 * (1 - draw)} />
          {/* horizontal legend along the top band, above both lines (lines stay below y~100) */}
          <line x1="150" y1="42" x2="188" y2="42" stroke={C.accent} strokeWidth="5" opacity={draw} />
          <text x="198" y="49" fill={C.accent} fontFamily="Helvetica" fontSize="22" fontWeight="700" opacity={draw}>Drug A</text>
          <line x1="330" y1="42" x2="368" y2="42" stroke={C.subtle} strokeWidth="4" opacity={draw} />
          <text x="378" y="49" fill={C.subtle} fontFamily="Helvetica" fontSize="22" opacity={draw}>Placebo</text>
        </svg>
      </div>

      <Caption>
        The numbers become the trial's story: Drug A lowered blood pressure more than placebo —
        shown in the tables, listings and figures reviewers read.
      </Caption>
    </SceneFade>
  );
};
