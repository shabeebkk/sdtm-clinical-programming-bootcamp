import React from "react";
import { AbsoluteFill, Series, Audio, staticFile } from "remotion";
import { StoryBackdrop } from "./components.jsx";
import { VO } from "./voiceover.js";
import { S01_Hook } from "./scenes/S01_Hook.jsx";
import { S02_Role } from "./scenes/S02_Role.jsx";
import { S03_Phases } from "./scenes/S03_Phases.jsx";
import { S04_Born } from "./scenes/S04_Born.jsx";
import { S05_Messy } from "./scenes/S05_Messy.jsx";
import { S06_Extract } from "./scenes/S06_Extract.jsx";
import { S07_SDTM } from "./scenes/S07_SDTM.jsx";
import { S08_ADaM } from "./scenes/S08_ADaM.jsx";
import { S09_Report } from "./scenes/S09_Report.jsx";
import { S10_Submit } from "./scenes/S10_Submit.jsx";
import { S11_Close } from "./scenes/S11_Close.jsx";

const FPS = 30;
const TAIL = 22;   // frames of breathing room after narration ends (~0.7s)
const MIN = 90;    // minimum visual duration per scene (~3s)

// id must match the MP3 basename in public/ and the VO keys.
const RAW = [
  { id: "scene01", C: S01_Hook },
  { id: "scene02", C: S02_Role },
  { id: "scene03", C: S03_Phases },
  { id: "scene04", C: S04_Born },
  { id: "scene05", C: S05_Messy },
  { id: "scene06", C: S06_Extract },
  { id: "scene07", C: S07_SDTM },
  { id: "scene08", C: S08_ADaM },
  { id: "scene09", C: S09_Report },
  { id: "scene10", C: S10_Submit },
  { id: "scene11", C: S11_Close },
];

// Scene length = narration length + tail, floored at MIN.
export const SCENES = RAW.map((s) => ({
  ...s,
  d: Math.max(MIN, Math.round((VO[s.id] || 6) * FPS) + TAIL),
}));

export const STORY_TOTAL = SCENES.reduce((a, s) => a + s.d, 0);

export const Story = () => (
  <AbsoluteFill>
    <StoryBackdrop />
    <Series>
      {SCENES.map((s) => (
        <Series.Sequence key={s.id} durationInFrames={s.d}>
          <s.C />
          <Audio src={staticFile(`${s.id}.mp3`)} />
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
