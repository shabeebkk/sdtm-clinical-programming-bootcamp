// generate_voiceover.mjs — create per-scene narration MP3s with ElevenLabs.
//
//   1. Put your key in .env  ->  ELEVENLABS_API_KEY=sk_...
//   2. node generate_voiceover.mjs
//
// Writes public/scene01.mp3 ... scene11.mp3 and src/voiceover.js (durations).
// The key is read from .env and never printed.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { execSync } from "child_process";

// ---- Voice (American): swap this ID for another from your account ----
//  XrExE9yKIg1WjnnlVkGX  Matilda — Knowledgeable, Professional (default, female american)
//  EXAVITQu4vr4xnSDxMaL  Sarah   — Mature, Reassuring, Confident (female american)
//  SAz9YHcvj6GT2YYXdXww  River   — Relaxed, Neutral, Informative (neutral american)
//  CwhRBWXzGAHq8TQ4Fs17  Roger   — Laid-Back, Casual, Resonant (male american)
//  bIHbv24MWmeRgasZH58o  Will    — Relaxed Optimist (male american)
const VOICE_ID = "XrExE9yKIg1WjnnlVkGX";
const MODEL_ID = "eleven_multilingual_v2";

// ---- Narration: one spoken line per scene (matches the on-screen captions) ----
const SCRIPT = [
  ["scene01", "Every approved medicine begins with data — mountains of it. To understand the whole journey, let's follow just one number: a single blood-pressure reading, from a patient's bedside all the way to the F D A."],
  ["scene02", "This is the work of the clinical statistical programmer. They sit between two worlds — medicine and data — turning thousands of messy measurements into clean, standardized evidence that regulators can trust."],
  ["scene03", "Every new medicine is tested in phases, starting with a handful of volunteers and growing to thousands of patients. Our data point is born here, in a large Phase 3 trial, where the evidence for approval is built."],
  ["scene04", "It begins at the clinic. A nurse measures a patient's blood pressure and enters it into an electronic data capture system. At this moment, our number is raw data — exactly as collected."],
  ["scene05", "But raw data is messy. Every site and every form records things a little differently — dates in different formats, codes instead of words, free text in mixed case. Before anyone can analyze it, this data must be cleaned and made consistent."],
  ["scene06", "So the programmers extract the raw data out of the capture system and into their tools — SAS and R — where it can finally be shaped."],
  ["scene07", "First comes standardization. Using a model called S D T M, every value snaps into a standard variable. Now our one-twenty is V S O R R E S, in the vital signs domain — instantly recognizable to any reviewer, on any study."],
  ["scene08", "Next, analysis. The ADaM model adds what statisticians need — a baseline, the change from that baseline, and the treatment group. Our reading is now part of a story: down two points by week four."],
  ["scene09", "Those numbers become the tables, listings, and figures — the reports that tell the trial's story. Here, Drug A lowered blood pressure more than placebo."],
  ["scene10", "Finally, everything is packaged — the datasets, the define file, and the reports — and submitted to regulators like the F D A, and Japan's P M D A. They review the evidence. And if it holds up, the medicine is approved."],
  ["scene11", "From a single data point, to a new medicine. That's clinical statistical programming — turning data into evidence, and evidence into treatments that reach patients."],
];

// ---- read key from .env ----
function loadKey() {
  if (!existsSync(".env")) throw new Error(".env not found");
  const m = readFileSync(".env", "utf8").match(/ELEVENLABS_API_KEY=(.+)/);
  const key = m && m[1].trim();
  if (!key || key === "REPLACE_WITH_YOUR_KEY") throw new Error("Set ELEVENLABS_API_KEY in .env");
  return key;
}

async function tts(key, text, outfile) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
    }),
  });
  if (!res.ok) throw new Error(`TTS ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(outfile, buf);
  return buf.length;
}

function durationSec(file) {
  const out = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${file}"`).toString().trim();
  return Math.round(parseFloat(out) * 100) / 100;
}

const key = loadKey();
if (!existsSync("public")) mkdirSync("public");

const durations = {};
for (const [id, text] of SCRIPT) {
  const file = `public/${id}.mp3`;
  process.stdout.write(`  ${id} … `);
  const bytes = await tts(key, text, file);
  const d = durationSec(file);
  durations[id] = d;
  console.log(`${(bytes / 1024).toFixed(0)} KB · ${d.toFixed(1)}s`);
}

// write durations module consumed by Story.jsx
const js =
  "// Auto-generated by generate_voiceover.mjs — narration durations in seconds.\n" +
  "export const VO = " + JSON.stringify(durations, null, 2) + ";\n";
writeFileSync("src/voiceover.js", js);

const total = Object.values(durations).reduce((a, b) => a + b, 0);
console.log(`\nDone. ${SCRIPT.length} clips, ${total.toFixed(1)}s of narration. Wrote src/voiceover.js`);
console.log("Now re-render:  npx remotion render src/index.jsx ClinStatStory out/clinical_stat_programming.mp4");
