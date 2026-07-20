// Build: 06_events_interventions.pptx — "Interventions & Events Domains"
// Bootcamp Module 06. Concept deck for AE (Day 5) and CM/EX (Day 6).
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "Clinical Programming Bootcamp";
p.title = "Interventions & Events Domains";

const INK = "0F2E3D", TEAL = "0E7C86", SEA = "1FA8A0", MINT = "6FC8B4",
      ACCENT = "E8833A", WHITE = "FFFFFF", PAPER = "F3F7F8",
      MUTED = "5A7682", LINE = "CFDEE1", CODEBG = "13323F";
const HFONT = "Cambria", BFONT = "Calibri", MONO = "Courier New";

function shadow() { return { type: "outer", color: "8AA0A8", blur: 8, offset: 3, angle: 90, opacity: 0.35 }; }
function bg(s, c) { s.background = { color: c }; }
function circle(s, x, y, d, fill, txt, txtColor, size) {
  s.addShape(p.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill }, line: { type: "none" } });
  s.addText(txt, { x, y, w: d, h: d, align: "center", valign: "middle",
    fontFace: BFONT, fontSize: size || 18, bold: true, color: txtColor || WHITE, margin: 0 });
}
function header(s, eyebrow, title) {
  s.addText(eyebrow.toUpperCase(), { x: 0.6, y: 0.42, w: 12, h: 0.3,
    fontFace: BFONT, fontSize: 12, bold: true, color: TEAL, charSpacing: 2, margin: 0 });
  s.addText(title, { x: 0.6, y: 0.72, w: 12.1, h: 0.8,
    fontFace: HFONT, fontSize: 30, bold: true, color: INK, margin: 0 });
}
function headerDark(s, eyebrow, title) {
  s.addText(eyebrow.toUpperCase(), { x: 0.7, y: 0.55, w: 12, h: 0.3,
    fontFace: BFONT, fontSize: 12, bold: true, color: MINT, charSpacing: 2, margin: 0 });
  s.addText(title, { x: 0.66, y: 0.9, w: 12, h: 0.75,
    fontFace: HFONT, fontSize: 30, bold: true, color: WHITE, margin: 0 });
}
function card(s, x, y, w, h, fill) {
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.09,
    fill: { color: fill || WHITE }, line: { color: LINE, width: 1 }, shadow: shadow() });
}
const CODE_FS = 12, CODE_LS = 17;
function codeBox(s, x, y, w, lines, borderColor, label) {
  const n = lines.split("\n").length;
  const textH = n * (CODE_LS / 72) + 0.14;
  const h = 0.62 + textH;
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: CODEBG }, line: { color: borderColor, width: 1.5 } });
  if (label) s.addText(label, { x: x + 0.25, y: y + 0.1, w: 5, h: 0.35, fontFace: HFONT, bold: true, fontSize: 14, color: borderColor, margin: 0 });
  s.addText(lines, { x: x + 0.25, y: y + 0.5, w: w - 0.45, h: textH, fontFace: MONO, fontSize: CODE_FS, color: "DCEBEF", lineSpacing: CODE_LS, margin: 0, valign: "top" });
  return y + h;
}
let s;

// ============ 1. TITLE ============
s = p.addSlide(); bg(s, INK);
s.addShape(p.ShapeType.ellipse, { x: 9.7, y: -1.6, w: 5.2, h: 5.2, fill: { color: "133B4C" }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 10.7, y: -0.6, w: 3.2, h: 3.2, fill: { color: TEAL }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.45, y: 0.15, w: 1.7, h: 1.7, fill: { color: ACCENT }, line: { type: "none" } });
s.addText("CLINICAL PROGRAMMING BOOTCAMP  ·  MODULE 06", { x: 0.7, y: 2.0, w: 9, h: 0.4,
  fontFace: BFONT, fontSize: 14, bold: true, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Interventions\n& Events", { x: 0.66, y: 2.5, w: 9.6, h: 1.7,
  fontFace: HFONT, fontSize: 44, bold: true, color: WHITE, lineSpacing: 48, margin: 0 });
s.addText("AE, CM and EX — the general observation classes", { x: 0.7, y: 4.2, w: 9.6, h: 0.6,
  fontFace: HFONT, fontSize: 24, color: MINT, margin: 0 });
s.addText("DM was one row per subject. From here on, subjects have MANY records — which means sequence numbers, study days, and a lot more timing.",
  { x: 0.7, y: 5.0, w: 9.2, h: 0.9, fontFace: BFONT, fontSize: 16, color: "C7DCE0", margin: 0 });
s.addText("Hands-on: Notebook 05 · Build the AE Domain (SAS)",
  { x: 0.7, y: 6.5, w: 12, h: 0.4, fontFace: BFONT, fontSize: 12, italic: true, color: MUTED, margin: 0 });
s.addNotes("Module 06. This deck covers the shape shared by Interventions and Events, then goes deep on AE because it is the domain trainees will build next. CM and EX follow the same pattern on Day 6. The headline change from DM: multiple records per subject, so --SEQ and --DY appear for the first time.");

// ============ 2. GOALS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Module goals", "By the end of this module you can…");
const goals = [
  ["Tell Interventions from Events", "and know which domains fall into each class."],
  ["Read the general-observation structure", "topic, qualifiers and timing — the pattern every non-Special-Purpose domain follows."],
  ["Explain AETERM vs AEDECOD", "and why a submission keeps both the verbatim and the coded term."],
  ["Distinguish severity from seriousness", "the single most confused pair in the whole standard."],
  ["Derive --SEQ and --DY", "the two variables DM never needed."],
];
let gy = 1.75;
goals.forEach((g, i) => {
  card(s, 0.7, gy, 12.0, 1.02, i % 2 ? PAPER : WHITE);
  circle(s, 0.95, gy + 0.21, 0.6, [TEAL, SEA, ACCENT, INK, TEAL][i], String(i + 1), WHITE, 17);
  s.addText([{ text: g[0] + "  ", options: { bold: true, fontSize: 16, color: INK } },
             { text: g[1], options: { fontSize: 13.5, color: MUTED } }],
    { x: 1.75, y: gy + 0.16, w: 10.6, h: 0.7, fontFace: BFONT, valign: "middle", margin: 0 });
  gy += 1.1;
});
s.addNotes("Goal 4 is the one that matters most clinically — a mild event can be serious, and a severe event can be non-serious. Getting that wrong in a real study is a safety-reporting failure, not just a data error.");

// ============ 3. INTERVENTIONS vs EVENTS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "The distinction", "Done TO the subject, or happened TO the subject?");
card(s, 0.7, 1.85, 5.9, 4.4, PAPER);
s.addText("INTERVENTIONS", { x: 1.0, y: 2.05, w: 5.3, h: 0.5, fontFace: HFONT, bold: true, fontSize: 22, color: TEAL, margin: 0 });
s.addText("Something given to, or done to, the subject — deliberately.", { x: 1.0, y: 2.6, w: 5.3, h: 0.6, fontFace: BFONT, bold: true, fontSize: 14, color: INK, margin: 0 });
[["EX", "Exposure — the study drug itself"],
 ["CM", "Concomitant medications — everything else they took"],
 ["PR", "Procedures"]].forEach((d, i) => {
  s.addText([{ text: d[0] + "   ", options: { fontFace: MONO, bold: true, fontSize: 14, color: TEAL } },
             { text: d[1], options: { fontSize: 12.5, color: MUTED } }],
    { x: 1.0, y: 3.35 + i * 0.55, w: 5.3, h: 0.45, fontFace: BFONT, valign: "middle", margin: 0 });
});
s.addText("Topic variable: --TRT  (what was given)", { x: 1.0, y: 5.35, w: 5.3, h: 0.4, fontFace: MONO, bold: true, fontSize: 12.5, color: TEAL, margin: 0 });
s.addText("EXTRT · CMTRT", { x: 1.0, y: 5.72, w: 5.3, h: 0.35, fontFace: MONO, fontSize: 12, color: MUTED, margin: 0 });

card(s, 6.8, 1.85, 5.9, 4.4, "FDF1E7");
s.addText("EVENTS", { x: 7.1, y: 2.05, w: 5.3, h: 0.5, fontFace: HFONT, bold: true, fontSize: 22, color: "B5651A", margin: 0 });
s.addText("Something that happened to the subject — not planned.", { x: 7.1, y: 2.6, w: 5.3, h: 0.6, fontFace: BFONT, bold: true, fontSize: 14, color: INK, margin: 0 });
[["AE", "Adverse events — the safety backbone"],
 ["MH", "Medical history — conditions before the study"],
 ["DS", "Disposition — milestones and how they left"]].forEach((d, i) => {
  s.addText([{ text: d[0] + "   ", options: { fontFace: MONO, bold: true, fontSize: 14, color: "B5651A" } },
             { text: d[1], options: { fontSize: 12.5, color: MUTED } }],
    { x: 7.1, y: 3.35 + i * 0.55, w: 5.3, h: 0.45, fontFace: BFONT, valign: "middle", margin: 0 });
});
s.addText("Topic variable: --TERM  (what happened)", { x: 7.1, y: 5.35, w: 5.3, h: 0.4, fontFace: MONO, bold: true, fontSize: 12.5, color: "B5651A", margin: 0 });
s.addText("AETERM · MHTERM · DSTERM", { x: 7.1, y: 5.72, w: 5.3, h: 0.35, fontFace: MONO, fontSize: 12, color: MUTED, margin: 0 });

s.addText("The test: was it deliberate (Intervention) or did it just happen (Event)? Aspirin taken for a headache is an Intervention; the headache is an Event.",
  { x: 0.7, y: 6.45, w: 12, h: 0.5, fontFace: BFONT, italic: true, fontSize: 13.5, color: TEAL, margin: 0 });
s.addNotes("The classification decides the topic variable and therefore the whole shape of the domain. Give the aspirin/headache pair as the memorable test — one subject event can generate a row in BOTH domains, and in our ABC-01 data it does: subject 01-001's 'bad headache' is an AE, and the Paracetamol they took for it is a CM.");

// ============ 4. THE SHARED STRUCTURE ============
s = p.addSlide(); bg(s, INK);
headerDark(s, "The pattern", "Every general-observation domain has the same skeleton");
const skel = [
  ["IDENTIFIERS", "Who and which record", "STUDYID · DOMAIN · USUBJID · --SEQ", TEAL],
  ["TOPIC", "What the record is about", "AETERM · CMTRT · EXTRT", ACCENT],
  ["QUALIFIERS", "Everything describing the topic", "AESEV · AESER · AEREL · AEOUT · AEDECOD", MINT],
  ["TIMING", "When it happened", "AESTDTC · AEENDTC · AESTDY · AEENDY", SEA],
];
let sy = 2.05;
skel.forEach((r, i) => {
  card(s, 0.7, sy, 12.0, 0.95, "16404F");
  circle(s, 1.0, sy + 0.18, 0.6, r[3], String(i + 1), (r[3] === MINT || r[3] === ACCENT) ? INK : WHITE, 16);
  s.addText(r[0], { x: 1.85, y: sy + 0.11, w: 2.6, h: 0.4, fontFace: HFONT, bold: true, fontSize: 16, color: r[3] === MINT ? MINT : (r[3] === ACCENT ? "F0B27A" : "9FC0C6"), margin: 0 });
  s.addText(r[1], { x: 1.85, y: sy + 0.52, w: 3.2, h: 0.4, fontFace: BFONT, fontSize: 12, color: "9FC0C6", margin: 0 });
  s.addText(r[2], { x: 5.3, y: sy + 0.25, w: 7.1, h: 0.5, fontFace: MONO, fontSize: 12.5, color: "E7F0F1", valign: "middle", margin: 0 });
  sy += 1.02;
});
card(s, 0.7, 6.25, 12.0, 1.0, "16404F");
s.addText([
  { text: "This is what DM did NOT have.  ", options: { bold: true, color: MINT, fontSize: 14.5 } },
  { text: "DM is Special Purpose — no topic variable, no --SEQ. From here on every domain follows the skeleton above, which is why learning it once pays off six times.", options: { color: "C7DCE0", fontSize: 13.5 } },
], { x: 1.0, y: 6.4, w: 11.4, h: 0.75, fontFace: BFONT, valign: "middle", lineSpacing: 20, margin: 0 });
s.addNotes("The payoff slide of the module. Once trainees see that AE, CM, EX, VS and LB all share this skeleton, each new domain is just a question of which variables fill each slot. Contrast explicitly with DM from Module 05.");

// ============ 5. AE ANATOMY ============
s = p.addSlide(); bg(s, WHITE);
header(s, "The domain in focus", "Anatomy of an AE record");
const aeHdr = ["USUBJID", "AESEQ", "AETERM", "AEDECOD", "AESEV", "AESER", "AESTDTC", "AEENDTC", "AESTDY"];
const aeRow = ["ABC-01-01-001", "1", "bad headache", "Headache", "MODERATE", "N", "2024-03-15", "2024-03-16", "15"];
const t = [aeHdr.map(h => ({ text: h, options: { bold: true, color: WHITE, fill: { color: INK }, align: "center", fontFace: MONO, fontSize: 10 } })),
           aeRow.map(v => ({ text: v, options: { color: INK, fill: { color: PAPER }, align: "center", fontFace: MONO, fontSize: 10 } }))];
s.addTable(t, { x: 0.6, y: 1.75, w: 12.15, colW: [1.95, 0.85, 1.7, 1.4, 1.35, 0.8, 1.45, 1.45, 1.2], rowH: 0.5,
  border: { type: "solid", color: LINE, pt: 1 }, valign: "middle", margin: [2, 3, 2, 3] });
const parts = [
  ["Identifiers", "USUBJID + AESEQ uniquely identify this row", TEAL],
  ["Topic", "AETERM — what the investigator reported, verbatim", ACCENT],
  ["Qualifiers", "AEDECOD, AESEV, AESER, AEREL, AEOUT describe it", MINT],
  ["Timing", "AESTDTC / AEENDTC in ISO, AESTDY / AEENDY as study days", SEA],
];
let py = 2.75;
parts.forEach((r, i) => {
  card(s, 0.7, py, 12.0, 0.88, i % 2 ? PAPER : WHITE);
  s.addShape(p.ShapeType.roundRect, { x: 0.9, y: py + 0.2, w: 0.14, h: 0.48, rectRadius: 0.05, fill: { color: r[2] }, line: { type: "none" } });
  s.addText(r[0], { x: 1.25, y: py + 0.18, w: 2.4, h: 0.5, fontFace: BFONT, bold: true, fontSize: 15, color: INK, valign: "middle", margin: 0 });
  s.addText(r[1], { x: 3.75, y: py + 0.18, w: 8.6, h: 0.5, fontFace: BFONT, fontSize: 13, color: MUTED, valign: "middle", margin: 0 });
  py += 0.96;
});
card(s, 0.7, 6.6, 12.0, 0.75, INK);
s.addText("One row per event, per subject. A subject with three adverse events gets three rows — AESEQ 1, 2, 3.",
  { x: 1.0, y: 6.72, w: 11.4, h: 0.5, fontFace: BFONT, fontSize: 14, color: MINT, valign: "middle", margin: 0 });
s.addNotes("Walk the row left to right and name each part against the skeleton from the previous slide. This is a real record from the ABC-01 data trainees will build in Notebook 05, so they will see this exact row again.");

// ============ 6. AETERM vs AEDECOD ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Two terms, both required", "AETERM and AEDECOD");
card(s, 0.7, 1.9, 5.9, 2.6, PAPER);
s.addText("AETERM", { x: 1.0, y: 2.1, w: 5.3, h: 0.5, fontFace: MONO, bold: true, fontSize: 22, color: TEAL, margin: 0 });
s.addText("VERBATIM — exactly what the investigator wrote.", { x: 1.0, y: 2.65, w: 5.3, h: 0.5, fontFace: BFONT, bold: true, fontSize: 13.5, color: INK, margin: 0 });
s.addText('"bad headache"', { x: 1.0, y: 3.2, w: 5.3, h: 0.5, fontFace: MONO, fontSize: 17, color: ACCENT, margin: 0 });
s.addText("Never cleaned, never corrected, never abbreviated. It is the legal record of what was reported.",
  { x: 1.0, y: 3.75, w: 5.3, h: 0.65, fontFace: BFONT, fontSize: 12.5, color: MUTED, margin: 0 });
card(s, 6.8, 1.9, 5.9, 2.6, PAPER);
s.addText("AEDECOD", { x: 7.1, y: 2.1, w: 5.3, h: 0.5, fontFace: MONO, bold: true, fontSize: 22, color: SEA, margin: 0 });
s.addText("CODED — the dictionary's preferred term.", { x: 7.1, y: 2.65, w: 5.3, h: 0.5, fontFace: BFONT, bold: true, fontSize: 13.5, color: INK, margin: 0 });
s.addText('"Headache"', { x: 7.1, y: 3.2, w: 5.3, h: 0.5, fontFace: MONO, fontSize: 17, color: SEA, margin: 0 });
s.addText("Assigned by trained coders using MedDRA. Lets you count how many subjects had headache across the whole study.",
  { x: 7.1, y: 3.75, w: 5.3, h: 0.65, fontFace: BFONT, fontSize: 12.5, color: MUTED, margin: 0 });
s.addText("→", { x: 6.35, y: 3.0, w: 0.5, h: 0.5, align: "center", fontSize: 26, bold: true, color: ACCENT, margin: 0 });
card(s, 0.7, 4.75, 12.0, 1.15, INK);
s.addText([
  { text: "Why keep both?  ", options: { bold: true, color: MINT, fontSize: 15 } },
  { text: "The verbatim preserves what actually happened; the coded term makes it countable. Three investigators writing \"bad headache\", \"headache\" and \"cephalalgia\" all code to one preferred term — and only then can you say how many subjects had it.", options: { color: "C7DCE0", fontSize: 13.5 } },
], { x: 1.0, y: 4.92, w: 11.4, h: 0.85, fontFace: BFONT, valign: "middle", lineSpacing: 20, margin: 0 });
card(s, 0.7, 6.05, 12.0, 1.1, "FDF1E7");
s.addText([
  { text: "⚠  Coding is not a lookup table.  ", options: { bold: true, color: "B5651A", fontSize: 14 } },
  { text: "MedDRA is a licensed dictionary applied by trained coders — you cannot derive AEDECOD with a CASE statement. In this bootcamp the coded values are ILLUSTRATIVE stand-ins so the exercise runs.", options: { color: INK, fontSize: 13 } },
], { x: 1.0, y: 6.2, w: 11.4, h: 0.8, fontFace: BFONT, valign: "middle", lineSpacing: 19, margin: 0 });
s.addNotes("MedDRA = Medical Dictionary for Regulatory Activities. It is hierarchical (preferred term, system organ class, and more) and licensed — trainees will not code AEs themselves. The honesty flag matters: our AEDECOD values are plausible stand-ins, not authoritative MedDRA output, and the mapping spec says so.");

// ============ 7. SEVERITY vs SERIOUSNESS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "The classic confusion", "Severity is NOT seriousness");
card(s, 0.7, 1.85, 5.9, 2.3, PAPER);
s.addText("AESEV — Severity", { x: 1.0, y: 2.05, w: 5.3, h: 0.5, fontFace: HFONT, bold: true, fontSize: 20, color: TEAL, margin: 0 });
s.addText("How BAD did it feel?", { x: 1.0, y: 2.6, w: 5.3, h: 0.4, fontFace: BFONT, bold: true, fontSize: 14, color: INK, margin: 0 });
s.addText("MILD · MODERATE · SEVERE\n\nA clinical judgement of intensity.", { x: 1.0, y: 3.05, w: 5.3, h: 1.0, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
card(s, 6.8, 1.85, 5.9, 2.3, "FDF1E7");
s.addText("AESER — Seriousness", { x: 7.1, y: 2.05, w: 5.3, h: 0.5, fontFace: HFONT, bold: true, fontSize: 20, color: "B5651A", margin: 0 });
s.addText("Did it meet a REGULATORY threshold?", { x: 7.1, y: 2.6, w: 5.3, h: 0.4, fontFace: BFONT, bold: true, fontSize: 14, color: INK, margin: 0 });
s.addText("Y / N\n\nDeath, life-threatening, hospitalisation, disability,\ncongenital anomaly, or medically important.", { x: 7.1, y: 3.05, w: 5.3, h: 1.0, fontFace: BFONT, fontSize: 12.5, color: MUTED, margin: 0 });
const combos = [
  ["A mild rash that required hospitalisation", "MILD", "Y", "Serious but not severe"],
  ["Severe pain, resolved at home", "SEVERE", "N", "Severe but not serious"],
  ["Worsening hypertension, subject withdrawn", "SEVERE", "Y", "Both — our ABC-01 case"],
];
let cy = 4.35;
combos.forEach((c, i) => {
  card(s, 0.7, cy, 12.0, 0.82, i === 2 ? "EAF5F0" : WHITE);
  s.addText(c[0], { x: 1.0, y: cy + 0.16, w: 5.2, h: 0.5, fontFace: BFONT, fontSize: 13, color: INK, valign: "middle", margin: 0 });
  s.addText(c[1], { x: 6.4, y: cy + 0.16, w: 1.6, h: 0.5, fontFace: MONO, bold: true, fontSize: 13, color: TEAL, valign: "middle", margin: 0 });
  s.addText(c[2], { x: 8.1, y: cy + 0.16, w: 0.8, h: 0.5, fontFace: MONO, bold: true, fontSize: 13, color: "B5651A", valign: "middle", margin: 0 });
  s.addText(c[3], { x: 9.0, y: cy + 0.16, w: 3.4, h: 0.5, fontFace: BFONT, italic: true, fontSize: 12, color: MUTED, valign: "middle", margin: 0 });
  cy += 0.86;
});
s.addText("They are independent. Never derive one from the other — a serious event is not automatically severe, and vice versa.",
  { x: 0.7, y: 7.02, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 12.5, color: ACCENT, margin: 0 });
s.addNotes("The most important safety concept in the deck. Seriousness has a formal regulatory definition (ICH E2A): death, life-threatening, requires or prolongs hospitalisation, persistent or significant disability, congenital anomaly, or other medically important event. Severity is just intensity. Mixing them up leads to under-reporting of serious events, which is a regulatory failure. Our subject 01-004 is both severe AND serious, and it led to discontinuation — trace it through AE and DS.");

// ============ 8. --SEQ ============
s = p.addSlide(); bg(s, WHITE);
header(s, "New in this module", "--SEQ: numbering a subject's records");
s.addText("DM never needed this. Now that a subject can have many rows in one domain, every row needs a unique number within that subject.",
  { x: 0.6, y: 1.5, w: 12.2, h: 0.45, fontFace: BFONT, fontSize: 14, color: MUTED, margin: 0 });
const seqHdr = ["USUBJID", "AESEQ", "AETERM", "AESTDTC"];
const seqRows = [
  ["ABC-01-01-001", "1", "bad headache", "2024-03-15"],
  ["ABC-01-01-001", "2", "Nausea", "2024-03-20"],
  ["ABC-01-01-004", "1", "fatigue", "2024-03-18"],
  ["ABC-01-01-004", "2", "worsening hypertension", "2024-03-22"],
];
const st = [seqHdr.map(h => ({ text: h, options: { bold: true, color: WHITE, fill: { color: INK }, align: "center", fontFace: MONO, fontSize: 11 } }))];
seqRows.forEach((r, i) => st.push(r.map((v, j) => ({ text: v, options: {
  color: j === 1 ? ACCENT : INK, bold: j === 1,
  fill: { color: i < 2 ? PAPER : WHITE }, align: j === 1 ? "center" : "left", fontFace: MONO, fontSize: 11 } }))));
s.addTable(st, { x: 1.6, y: 2.1, w: 9.0, colW: [2.6, 1.2, 3.2, 2.0], rowH: 0.48,
  border: { type: "solid", color: LINE, pt: 1 }, valign: "middle", margin: [2, 6, 2, 6] });
card(s, 0.7, 4.5, 5.9, 1.6, PAPER);
s.addText("The rule", { x: 1.0, y: 4.65, w: 5.3, h: 0.35, fontFace: BFONT, bold: true, fontSize: 14, color: TEAL, margin: 0 });
s.addText("Sequential 1, 2, 3… WITHIN each subject. It restarts at 1 for the next subject — it is not a row number for the whole dataset.",
  { x: 1.0, y: 5.05, w: 5.3, h: 0.95, fontFace: BFONT, fontSize: 13, color: INK, margin: 0 });
card(s, 6.8, 4.5, 5.9, 1.6, "EAF5F0");
s.addText("The test", { x: 7.1, y: 4.65, w: 5.3, h: 0.35, fontFace: BFONT, bold: true, fontSize: 14, color: TEAL, margin: 0 });
s.addText("USUBJID + AESEQ must be UNIQUE. That pair is what identifies any single observation in the study.",
  { x: 7.1, y: 5.05, w: 5.3, h: 0.95, fontFace: BFONT, fontSize: 13, color: INK, margin: 0 });
s.addText("Sort deterministically before you number — otherwise the same program gives different --SEQ values on different runs.",
  { x: 0.7, y: 6.3, w: 12, h: 0.45, fontFace: BFONT, italic: true, fontSize: 13.5, color: ACCENT, margin: 0 });
s.addNotes("Notice AESEQ restarts at 1 for subject 004. The determinism point is practical: if you sort by start date and two events share a date, add a tiebreaker (we use the term) so the numbering is reproducible. Reviewers and validation tools compare datasets across runs, and unstable --SEQ shows up as spurious differences.");

// ============ 9. --DY ============
s = p.addSlide(); bg(s, INK);
headerDark(s, "New in this module", "--DY: study day, and the missing Day 0");
codeBox(s, 0.7, 2.05, 12.0,
  'if  --DTC >= RFSTDTC :   --DY = (--DTC - RFSTDTC) + 1        <- on/after first dose\n'
  + 'if  --DTC <  RFSTDTC :   --DY = (--DTC - RFSTDTC)            <- before, stays negative',
  MINT, "The rule");
const dyEx = [
  ["First dose", "2024-03-01", "Day 1", MINT],
  ["Headache starts", "2024-03-15", "Day 15", WHITE],
  ["Screening visit", "2024-02-20", "Day −10", ACCENT],
];
let dy = 4.0;
dyEx.forEach(r => {
  card(s, 1.8, dy, 8.6, 0.78, "16404F");
  s.addText(r[0], { x: 2.1, y: dy + 0.14, w: 3.4, h: 0.5, fontFace: BFONT, fontSize: 14, color: "C7DCE0", valign: "middle", margin: 0 });
  s.addText(r[1], { x: 5.6, y: dy + 0.14, w: 2.2, h: 0.5, fontFace: MONO, fontSize: 13, color: "9FC0C6", valign: "middle", margin: 0 });
  s.addText(r[2], { x: 8.0, y: dy + 0.14, w: 2.2, h: 0.5, fontFace: MONO, bold: true, fontSize: 15, color: r[3], valign: "middle", margin: 0 });
  dy += 0.88;
});
card(s, 0.7, 6.35, 12.0, 0.85, "16404F");
s.addText([
  { text: "There is no Day 0.  ", options: { bold: true, color: ACCENT, fontSize: 15 } },
  { text: "The day before first dose is Day −1. If your code ever produces a 0, the +1 is missing on one branch.", options: { color: "C7DCE0", fontSize: 13.5 } },
], { x: 1.0, y: 6.48, w: 11.4, h: 0.6, fontFace: BFONT, valign: "middle", margin: 0 });
s.addNotes("RFSTDTC comes from DM, which got it from EX — so DM must be built before any --DY can be derived. That dependency is why we built DM first. The no-Day-0 rule catches most people once; the audit script checks for it explicitly.");

// ============ 10. ONGOING EVENTS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "A blank is information", "Ongoing events");
s.addText("Two of the nine ABC-01 adverse events had not resolved when the data was collected. Their end date is blank — and it must stay blank.",
  { x: 0.6, y: 1.5, w: 12.2, h: 0.45, fontFace: BFONT, fontSize: 14, color: MUTED, margin: 0 });
const ong = [
  ["AEENDTC", "Leave NULL", "Do not substitute today's date, the last visit, or the study end.", TEAL],
  ["AEENDY", "Leave NULL", "No end date means no end study day. Deriving one invents data.", TEAL],
  ["AEOUT", "NOT RECOVERED/NOT RESOLVED", "The outcome carries the information that it is ongoing.", ACCENT],
];
let oy = 2.15;
ong.forEach(r => {
  card(s, 0.7, oy, 12.0, 1.15, PAPER);
  s.addText(r[0], { x: 1.0, y: oy + 0.32, w: 1.9, h: 0.5, fontFace: MONO, bold: true, fontSize: 15, color: INK, valign: "middle", margin: 0 });
  s.addText(r[1], { x: 3.0, y: oy + 0.32, w: 3.5, h: 0.5, fontFace: MONO, bold: true, fontSize: 13, color: r[3] === ACCENT ? "B5651A" : TEAL, valign: "middle", margin: 0 });
  s.addText(r[2], { x: 6.7, y: oy + 0.32, w: 5.7, h: 0.5, fontFace: BFONT, fontSize: 12.5, color: MUTED, valign: "middle", margin: 0 });
  oy += 1.25;
});
card(s, 0.7, 5.95, 12.0, 1.15, INK);
s.addText([
  { text: "Why this matters.  ", options: { bold: true, color: MINT, fontSize: 15 } },
  { text: "Inventing an end date would make an unresolved event look resolved. In a safety review that is the difference between an ongoing problem and a closed one — which is exactly the kind of thing a regulator is looking for.", options: { color: "C7DCE0", fontSize: 13.5 } },
], { x: 1.0, y: 6.12, w: 11.4, h: 0.85, fontFace: BFONT, valign: "middle", lineSpacing: 20, margin: 0 });
s.addNotes("Ties back to Module 04's 'blank does not mean zero'. Here a blank is genuinely meaningful — the event is ongoing. SDTM has partial-date conventions for cases where only part of a date is known, which we mention but do not use in this study.");

// ============ 11. THE MAPPING ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Putting it together", "raw AE → SDTM AE");
const maps = [
  ["AETERM", "verbatim, unchanged", "bad headache → bad headache", TEAL],
  ["AEDECOD", "dictionary coded (MedDRA)", "bad headache → Headache", SEA],
  ["AESTDTC", "MIXED formats → ISO 8601", "15/03/2024 → 2024-03-15", ACCENT],
  ["AESEV", "trim + upper-case → CT", "moderate → MODERATE", INK],
  ["AESER", "normalise → N / Y", "No, N → N", TEAL],
  ["AEOUT", "DECODE the number → CT", "1 → RECOVERED/RESOLVED", SEA],
  ["AESEQ", "derive per subject", "1, 2, 3 …", ACCENT],
  ["AESTDY", "derive from RFSTDTC", "2024-03-15 → 15", INK],
];
maps.forEach((r, i) => {
  const x = 0.7 + (i % 2) * 6.1, y = 1.85 + Math.floor(i / 2) * 1.28;
  card(s, x, y, 5.9, 1.12, i % 2 ? WHITE : PAPER);
  s.addText(r[0], { x: x + 0.25, y: y + 0.12, w: 1.9, h: 0.4, fontFace: MONO, bold: true, fontSize: 14, color: r[3] === INK ? INK : r[3], margin: 0 });
  s.addText(r[1], { x: x + 2.15, y: y + 0.14, w: 3.5, h: 0.35, fontFace: BFONT, fontSize: 12, color: MUTED, margin: 0 });
  s.addText(r[2], { x: x + 0.25, y: y + 0.58, w: 5.4, h: 0.4, fontFace: MONO, fontSize: 11.5, color: INK, margin: 0 });
});
s.addText("The AE date conversion is the hardest in the study: ONE column contains two different formats. You must detect the format per value.",
  { x: 0.7, y: 7.0, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 13, color: ACCENT, margin: 0 });
s.addNotes("This is the work plan for Notebook 05. The mixed-date column is the standout challenge — in SAS you test for a slash and pick ddmmyy10. or date11. accordingly. Remind them the informat WIDTH must cover the whole value, separators included.");

// ============ 12. PITFALLS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Learn from these", "Common AE mistakes");
const pit = [
  ["Cleaning up AETERM", "The verbatim term is a legal record. Fix nothing — not spelling, not capitalisation."],
  ["Deriving AEDECOD in code", "MedDRA coding is done by trained coders with a licensed dictionary."],
  ["Confusing severity and seriousness", "They are independent. A mild event can be serious."],
  ["Assuming one date format", "AESTDT holds BOTH DD/MM/YYYY and DD-Mon-YYYY. Detect per value."],
  ["Filling in a blank end date", "Ongoing means ongoing. Null AEENDTC and null AEENDY."],
  ["Numbering --SEQ across subjects", "AESEQ restarts at 1 for each subject; it is not a row number."],
];
pit.forEach((m, i) => {
  const x = 0.7 + (i % 2) * 6.1, y = 1.85 + Math.floor(i / 2) * 1.6;
  card(s, x, y, 5.9, 1.45, i % 2 ? WHITE : PAPER);
  circle(s, x + 0.25, y + 0.42, 0.6, ACCENT, "✕", INK, 16);
  s.addText([{ text: m[0] + "\n", options: { bold: true, fontSize: 14, color: INK } },
             { text: m[1], options: { fontSize: 11.8, color: MUTED } }],
    { x: x + 1.05, y: y + 0.18, w: 4.7, h: 1.1, fontFace: BFONT, valign: "middle", margin: 0 });
});
s.addNotes("All six appear in Notebook 05 either as something the code must handle or as an exercise. The AETERM point is worth emphasising — trainees instinctively want to tidy 'bad headache', and they must not.");

// ============ 13. WHAT'S NEXT ============
s = p.addSlide(); bg(s, INK);
s.addShape(p.ShapeType.ellipse, { x: 10.2, y: 4.6, w: 5.0, h: 5.0, fill: { color: "133B4C" }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.2, y: 5.6, w: 3.0, h: 3.0, fill: { color: TEAL }, line: { type: "none" } });
s.addText("WHAT'S NEXT", { x: 0.7, y: 1.5, w: 11, h: 0.35, fontFace: BFONT, bold: true, fontSize: 13, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Build AE, then the Interventions", { x: 0.66, y: 1.9, w: 11.5, h: 0.8, fontFace: HFONT, bold: true, fontSize: 32, color: WHITE, margin: 0 });
const nn = [
  ["Notebook 05 · AE", "Mixed dates, CT, the AEOUT code decode, AESEQ and AESTDY — in SAS.", ACCENT],
  ["Day 6 · CM and EX", "Same skeleton, Interventions instead of Events. Much of your AE code transfers.", TEAL],
  ["Then Findings", "VS and LB — where the structure changes shape again.", MINT],
];
let ny = 3.1;
nn.forEach((n, i) => {
  circle(s, 0.7, ny, 0.62, n[2], String(i + 1), n[2] === TEAL ? WHITE : INK, 17);
  s.addText([{ text: n[0] + "   ", options: { bold: true, fontSize: 17, color: WHITE } },
             { text: n[1], options: { fontSize: 13.5, color: "C7DCE0" } }],
    { x: 1.55, y: ny - 0.02, w: 10.8, h: 0.8, fontFace: BFONT, valign: "middle", margin: 0 });
  ny += 1.05;
});
s.addText("AE is the hardest domain you will build. Everything after it reuses what you learn here.",
  { x: 0.7, y: 6.5, w: 11.5, h: 0.6, fontFace: BFONT, italic: true, fontSize: 14, color: MINT, margin: 0 });
s.addNotes("Close by framing AE as the peak of difficulty — mixed dates, four CT mappings, a code decode, plus --SEQ and --DY. CM and EX reuse nearly all of it. End of Module 06.");

p.writeFile({ fileName: "/Volumes/D Drive/SDTM Training/Bootcamp/presentations/06_events_interventions.pptx" })
  .then(f => console.log("WROTE", f))
  .catch(e => { console.error(e); process.exit(1); });
