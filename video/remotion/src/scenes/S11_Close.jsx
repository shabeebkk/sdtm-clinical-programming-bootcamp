import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C, HFONT, BFONT } from "../theme.js";
import { SceneFade, Title, springIn } from "../components.jsx";

const STEPS = ["Collect", "Extract", "SDTM", "ADaM", "Report", "Submit"];

export const S11_Close = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <SceneFade>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: HFONT, fontWeight: 700, fontSize: 78, color: C.white }}>
        <div style={rise(frame, 14)}>From one data point</div>
        <div style={rise(frame, 26)}>to a <span style={{ color: C.mint }}>new medicine</span></div>
      </div>

      {/* pipeline chips */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
        {STEPS.map((s, i) => {
          const sp = springIn(frame, fps, 50 + i * 10, { damping: 13, mass: 0.6 });
          return (
            <React.Fragment key={i}>
              <div style={{ opacity: sp, transform: `scale(${sp})`, padding: "14px 30px", borderRadius: 999, border: `2px solid ${i === STEPS.length - 1 ? C.accent : C.line}`, color: i === STEPS.length - 1 ? C.accent : C.subtle, fontFamily: BFONT, fontWeight: 700, fontSize: 30 }}>
                {s}
              </div>
              {i < STEPS.length - 1 && <div style={{ color: C.muted, fontSize: 30, opacity: sp }}>›</div>}
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 720, textAlign: "center", fontFamily: BFONT, fontSize: 34, color: C.subtle, opacity: interpolate(frame, [110, 135], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        That's clinical statistical programming — turning data into evidence,<br />and evidence into approved treatments.
      </div>
    </SceneFade>
  );
};

// local import to avoid circular dep churn
const rise = (frame, delay) => {
  const t = interpolate(frame, [delay, delay + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { opacity: t, transform: `translateY(${(1 - t) * 40}px)` };
};
