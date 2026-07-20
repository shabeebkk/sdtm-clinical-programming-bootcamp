import React from "react";
import { Composition } from "remotion";
import { Slide01 } from "./Slide01.jsx";
import { Story, STORY_TOTAL } from "./Story.jsx";
import { Thumbnail } from "./Thumbnail.jsx";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Slide01"
        component={Slide01}
        durationInFrames={330} // 11 s @ 30 fps
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ClinStatStory"
        component={Story}
        durationInFrames={STORY_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Thumbnail"
        component={Thumbnail}
        durationInFrames={1}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
