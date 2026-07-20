import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C, HFONT, BFONT } from "../theme.js";
import { SceneFade, Kicker, Title, Caption, Card, rise, springIn } from "../components.jsx";

const Side = ({ x, frame, delay, icon, title, sub, color }) => {
  const s = rise(frame, delay, 40, 22);
  return (
    <div style={{ position: "absolute", left: x, top: 340, width: 470, textAlign: "center", ...s }}>
      <div style={{ width: 150, height: 150, borderRadius: "50%", backgroundColor: color, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 74 }}>
        {icon}
      </div>
      <div style={{ fontFamily: HFONT, fontWeight: 700, fontSize: 40, color: C.white, marginTop: 26 }}>{title}</div>
      <div style={{ fontFamily: BFONT, fontSize: 26, color: C.subtle, marginTop: 10, lineHeight: 1.35 }}>{sub}</div>
    </div>
  );
};

export const S02_Role = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // bridge draw-in
  const bridge = springIn(frame, fps, 46, { damping: 16 });
  const flow = interpolate(frame, [70, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <SceneFade>
      <Kicker>THE ROLE</Kicker>
      <Title lines={["Meet the clinical statistical programmer"]} size={70} top={210} />
      <Side x={130} frame={frame} delay={30} icon="🩺" title="Medicine" sub="Patients, doctors, trials, measurements" color={C.teal} />
      <Side x={1320} frame={frame} delay={40} icon="📊" title="Evidence" sub="Standardized data, statistics, reports" color={C.accent} />

      {/* the bridge in the middle */}
      <Card x={640} y={470} w={640} h={14} fill={C.line} radius={8} style={{ transform: `scaleX(${bridge})`, transformOrigin: "left center" }} />
      <div style={{ position: "absolute", left: 640, top: 430, width: 640, textAlign: "center", fontFamily: BFONT, fontWeight: 800, fontSize: 26, color: C.mint, opacity: bridge }}>
        THE BRIDGE
      </div>
      {/* travelling dot along the bridge */}
      <div style={{ position: "absolute", left: 640 + flow * 620, top: 468, width: 22, height: 22, borderRadius: "50%", backgroundColor: C.accent, boxShadow: `0 0 24px ${C.accent}`, opacity: flow > 0 && flow < 1 ? 1 : 0 }} />

      <Caption>
        A clinical statistical programmer turns thousands of messy measurements into clean,
        standardized evidence that regulators can trust.
      </Caption>
    </SceneFade>
  );
};
