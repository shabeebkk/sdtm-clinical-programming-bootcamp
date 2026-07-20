import React from "react";
import { AbsoluteFill } from "remotion";
import { C, HFONT, BFONT } from "./theme.js";

// Static 1920x1080 LinkedIn video cover. Center kept clear for LinkedIn's
// play-button overlay; content weighted to top-left and bottom.
const ring = (x, y, s, color, op) => ({
  position: "absolute", left: x, top: y, width: s, height: s,
  borderRadius: "50%", backgroundColor: color, opacity: op,
});

const Step = ({ label, accent }) => (
  <div style={{
    padding: "12px 26px", borderRadius: 999,
    border: `2px solid ${accent ? C.accent : C.line}`,
    color: accent ? C.accent : C.subtle,
    fontFamily: BFONT, fontWeight: 700, fontSize: 26, whiteSpace: "nowrap",
    backgroundColor: accent ? `${C.accent}14` : "transparent",
  }}>{label}</div>
);

export const Thumbnail = () => {
  const steps = ["Raw data", "SDTM", "ADaM", "Reports", "FDA"];
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, overflow: "hidden" }}>
      {/* ring motif */}
      <div style={ring(1430, -240, 720, C.ink2, 0.7)} />
      <div style={ring(1580, -110, 430, C.teal, 0.55)} />
      <div style={ring(1690, -20, 250, C.accent, 0.9)} />
      <div style={ring(-260, 720, 560, C.ink2, 0.5)} />

      {/* top-right video tag */}
      <div style={{
        position: "absolute", top: 70, right: 90, display: "flex", alignItems: "center", gap: 12,
        padding: "12px 24px", borderRadius: 999, backgroundColor: `${C.ink}CC`,
        border: `2px solid ${C.line}`, fontFamily: BFONT, fontWeight: 700, fontSize: 24, color: C.mint,
      }}>
        ▶ 2-min explainer
      </div>

      {/* eyebrow */}
      <div style={{
        position: "absolute", left: 120, top: 236, color: C.mint,
        fontFamily: BFONT, fontWeight: 700, fontSize: 30, letterSpacing: 6,
      }}>CLINICAL STATISTICAL PROGRAMMING</div>

      {/* headline — two lines */}
      <div style={{
        position: "absolute", left: 116, top: 300, width: 1400,
        fontFamily: HFONT, fontWeight: 700, fontSize: 96, lineHeight: 1.08, color: C.white,
      }}>
        From a patient's bedside<br />to <span style={{ color: C.mint }}>FDA approval</span>
      </div>

      {/* subline */}
      <div style={{
        position: "absolute", left: 120, top: 560, width: 1050,
        fontFamily: BFONT, fontSize: 40, color: C.subtle, lineHeight: 1.35,
      }}>
        The journey of a single data point — and the programmers who make it count.
      </div>

      {/* glowing data chip */}
      <div style={{
        position: "absolute", left: 120, top: 720,
        display: "flex", alignItems: "baseline", gap: 12,
        padding: "16px 30px", borderRadius: 18, backgroundColor: C.ink2,
        border: `2px solid ${C.accent}`, boxShadow: `0 0 40px ${C.accent}55`, fontFamily: BFONT,
      }}>
        <span style={{ color: C.accent, fontWeight: 800, fontSize: 54 }}>120</span>
        <span style={{ color: C.subtle, fontWeight: 600, fontSize: 28 }}>mmHg</span>
      </div>

      {/* bottom pipeline */}
      <div style={{
        position: "absolute", left: 120, bottom: 70, display: "flex", alignItems: "center", gap: 18,
      }}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <Step label={s} accent={i === steps.length - 1} />
            {i < steps.length - 1 && <span style={{ color: C.muted, fontSize: 30 }}>›</span>}
          </React.Fragment>
        ))}
      </div>
    </AbsoluteFill>
  );
};
