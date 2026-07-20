import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C, HFONT, BFONT } from "../theme.js";
import { SceneFade, Kicker, rise, springIn, DataChip } from "../components.jsx";

export const S01_Hook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chip = springIn(frame, fps, 40, { damping: 12, mass: 0.9 });
  const pulse = 1 + Math.sin(frame / 12) * 0.02;
  return (
    <SceneFade>
      <Kicker top={330}>CLINICAL STATISTICAL PROGRAMMING</Kicker>
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 388,
          width: 1500,
          fontFamily: HFONT,
          fontWeight: 700,
          fontSize: 92,
          lineHeight: 1.08,
          color: C.white,
        }}
      >
        <div style={rise(frame, 18)}>How a single number</div>
        <div style={rise(frame, 30)}>
          helps <span style={{ color: C.mint }}>approve a medicine</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 150, top: 640, width: 1250, fontFamily: BFONT, fontSize: 34, lineHeight: 1.4, color: C.subtle, ...rise(frame, 52) }}>
        Follow one measurement on its journey — from a patient's bedside to the FDA.
      </div>
      <div style={{ opacity: chip, transform: `scale(${chip * pulse})`, transformOrigin: "left center" }}>
        <DataChip x={150} y={790} label="120" unit="mmHg" />
      </div>
      <div style={{ position: "absolute", left: 400, top: 812, fontFamily: BFONT, fontSize: 24, color: C.muted, opacity: interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        one blood-pressure reading · Subject ABC-01-001
      </div>
    </SceneFade>
  );
};
