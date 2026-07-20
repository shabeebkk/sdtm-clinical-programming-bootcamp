import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C, HFONT, BFONT } from "../theme.js";
import { SceneFade, Kicker, Title, Caption, Card, springIn } from "../components.jsx";

const PKG = ["SDTM datasets", "ADaM datasets", "Define-XML", "TLF reports", "Reviewer's Guide"];

export const S10_Submit = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const move = interpolate(frame, [55, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stamp = spring({ frame: frame - 120, fps, config: { damping: 9, mass: 0.8 } });
  return (
    <SceneFade>
      <Kicker>STEP 6 · SUBMISSION</Kicker>
      <Title lines={["Package it — send it to the regulators"]} size={60} top={210} />

      {/* the package */}
      <div style={{ position: "absolute", left: 150 + move * 250, top: 430 }}>
        <div style={{ fontFamily: BFONT, fontWeight: 700, fontSize: 26, color: C.mint, marginBottom: 14 }}>Submission package</div>
        {PKG.map((t, i) => {
          const s = springIn(frame, fps, 24 + i * 9, { damping: 14 });
          return (
            <Card key={i} x={0} y={i * 66} w={520} h={54} fill={C.ink2} radius={10} style={{ border: `2px solid ${C.line}`, opacity: s, transform: `translateX(${(1 - s) * -30}px)`, display: "flex", alignItems: "center", paddingLeft: 22 }}>
              <span style={{ fontFamily: BFONT, fontSize: 26, color: C.subtle }}>📄 {t}</span>
            </Card>
          );
        })}
      </div>

      {/* arrow */}
      <div style={{ position: "absolute", left: 950, top: 560, fontSize: 60, color: C.accent, opacity: move }}>▶</div>

      {/* regulator building */}
      <div style={{ position: "absolute", left: 1200, top: 400, textAlign: "center", opacity: interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        <div style={{ fontSize: 150 }}>🏛️</div>
        <div style={{ fontFamily: HFONT, fontWeight: 700, fontSize: 40, color: C.white }}>FDA · PMDA</div>
        <div style={{ fontFamily: BFONT, fontSize: 24, color: C.muted }}>the regulators</div>
        {/* APPROVED stamp — sits across the building, above the FDA·PMDA label */}
        <div style={{ position: "absolute", left: 30, top: 18, transform: `scale(${stamp}) rotate(-12deg)`, opacity: stamp > 0.05 ? 1 : 0, border: `5px solid ${C.mint}`, color: C.mint, borderRadius: 14, padding: "10px 30px", fontFamily: HFONT, fontWeight: 800, fontSize: 46, letterSpacing: 3, backgroundColor: `${C.ink}CC` }}>
          APPROVED
        </div>
      </div>

      <Caption>
        Datasets, Define-XML and reports are packaged and submitted. Regulators review the
        evidence — and, if it holds up, the medicine is <span style={{ color: C.mint, fontWeight: 700 }}>approved</span>.
      </Caption>
    </SceneFade>
  );
};
