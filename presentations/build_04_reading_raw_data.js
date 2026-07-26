// Build: 04_reading_raw_data.pptx — "Reading & Understanding Raw Clinical Data"
// Bootcamp Module 04. Prepares trainees to import the ABC-01 raw CSVs.
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "Clinical Programming Bootcamp";
p.title = "Reading & Understanding Raw Clinical Data";

const INK = "0F2E3D", TEAL = "0E7C86", SEA = "1FA8A0", MINT = "6FC8B4",
      ACCENT = "E8833A", WHITE = "FFFFFF", PAPER = "F3F7F8",
      MUTED = "5A7682", MUTEDDK = "8FAEB8", LINE = "CFDEE1", CODEBG = "13323F";
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
  if (label) s.addText(label, { x: x + 0.25, y: y + 0.1, w: 3, h: 0.35, fontFace: HFONT, bold: true, fontSize: 15, color: borderColor, margin: 0 });
  s.addText(lines, { x: x + 0.25, y: y + 0.5, w: w - 0.45, h: textH, fontFace: MONO, fontSize: CODE_FS, color: "DCEBEF", lineSpacing: CODE_LS, margin: 0, valign: "top" });
  return y + h;
}
let s;

// ============ 1. TITLE ============
s = p.addSlide(); bg(s, INK);
s.addShape(p.ShapeType.ellipse, { x: 9.7, y: -1.6, w: 5.2, h: 5.2, fill: { color: "133B4C" }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 10.7, y: -0.6, w: 3.2, h: 3.2, fill: { color: TEAL }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.45, y: 0.15, w: 1.7, h: 1.7, fill: { color: ACCENT }, line: { type: "none" } });
s.addText("CLINICAL PROGRAMMING BOOTCAMP  ·  MODULE 04", { x: 0.7, y: 2.0, w: 9, h: 0.4,
  fontFace: BFONT, fontSize: 14, bold: true, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Reading Raw\nClinical Data", { x: 0.66, y: 2.5, w: 9.6, h: 1.7,
  fontFace: HFONT, fontSize: 44, bold: true, color: WHITE, lineSpacing: 48, margin: 0 });
s.addText("Before you can map anything, you have to get the data in — with the right types, the right dates, and your eyes open for what's wrong with it.",
  { x: 0.7, y: 4.5, w: 9.2, h: 1.0, fontFace: BFONT, fontSize: 16, color: "C7DCE0", margin: 0 });
s.addText("Hands-on: Notebook 03 · Importing Raw Data (SAS & R)",
  { x: 0.7, y: 6.5, w: 12, h: 0.4, fontFace: BFONT, fontSize: 12, italic: true, color: MUTEDDK, margin: 0 });
s.addNotes("Module 04. This is the first module where trainees touch the real study data. The theme: importing is not a formality — the choices you make when reading a file determine whether your mapping can succeed. Pair this deck with Notebook 03.");

// ============ 2. GOALS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Module goals", "By the end of this module you can…");
const goals = [
  ["Import a raw CSV correctly", "in both SAS and R, with the types you intended."],
  ["Recognise the four data types", "character, numeric, date, and missing — and tell them apart."],
  ["Spot the classic traps", "leading zeros, mixed date formats, blanks, wide structures."],
  ["Inspect before you map", "run a standard checklist on any unfamiliar dataset."],
  ["Plan a mapping", "list exactly what must change to reach SDTM."],
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
s.addNotes("Set expectations. This module is deliberately unglamorous — it is about discipline. Emphasise goal 5: the output of good inspection is a mapping plan, which is what Module 05 executes for DM.");

// ============ 3. WHAT ARRIVES ============
s = p.addSlide(); bg(s, WHITE);
header(s, "The starting point", "What a raw extract actually looks like");
s.addText("One file per CRF form — note Demographics and Disposition are separate forms, completed at different times.",
  { x: 0.6, y: 1.5, w: 12.2, h: 0.4, fontFace: BFONT, fontSize: 14, color: MUTED, margin: 0 });
const files = [
  ["dm_raw.csv", "Demographics (screening)", "one row per subject", "8", TEAL],
  ["ds_raw.csv", "Disposition / end of study", "one row per subject", "8", TEAL],
  ["ex_raw.csv", "Study drug exposure", "one row per subject", "8", SEA],
  ["ae_raw.csv", "Adverse events", "one row per event", "9", ACCENT],
  ["cm_raw.csv", "Concomitant meds", "one row per medication", "8", INK],
  ["vs_raw.csv", "Vital signs", "WIDE — one row per visit", "24", TEAL],
  ["lb_raw.csv", "Laboratory", "tall — one row per test", "48", SEA],
];
const tbl = [[
  { text: "File", options: { bold: true, color: WHITE, fill: { color: INK }, fontFace: BFONT, fontSize: 13 } },
  { text: "CRF form", options: { bold: true, color: WHITE, fill: { color: INK }, fontFace: BFONT, fontSize: 13 } },
  { text: "Structure", options: { bold: true, color: WHITE, fill: { color: INK }, fontFace: BFONT, fontSize: 13 } },
  { text: "Rows", options: { bold: true, color: WHITE, fill: { color: INK }, align: "center", fontFace: BFONT, fontSize: 13 } },
]];
files.forEach((f, i) => {
  const fill = i % 2 ? PAPER : WHITE;
  tbl.push([
    { text: f[0], options: { color: f[4], fill: { color: fill }, fontFace: MONO, fontSize: 13, bold: true } },
    { text: f[1], options: { color: INK, fill: { color: fill }, fontFace: BFONT, fontSize: 12.5, bold: true } },
    { text: f[2], options: { color: MUTED, fill: { color: fill }, fontFace: BFONT, fontSize: 12.5 } },
    { text: f[3], options: { color: INK, fill: { color: fill }, align: "center", fontFace: MONO, fontSize: 12.5 } },
  ]);
});
s.addTable(tbl, { x: 0.7, y: 2.05, w: 12.0, colW: [3.0, 3.4, 4.4, 1.2], rowH: 0.46,
  border: { type: "solid", color: LINE, pt: 1 }, valign: "middle", margin: [2, 8, 2, 8] });
s.addText("Note vs_raw.csv is WIDE and lb_raw.csv is TALL — the same clinical idea, two different shapes. You'll handle both.",
  { x: 0.7, y: 6.45, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 13, color: TEAL, margin: 0 });
s.addNotes("Orient trainees in the data folder. Every file has STUDYID, SITEID, SUBJID. Point out the row counts so they can check their imports landed correctly — an import that produces the wrong number of rows is the first thing to catch. Flag the wide/tall difference now; it becomes a whole exercise in Module 07.");

// ============ 4. THE THREE TYPES ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Fundamentals", "Everything is one of three types (plus missing)");
const types = [
  ["Character", "Text. Anything you don't do arithmetic on.", '"ABC-01"  "F"  "bad headache"\nIDs, codes, names, ISO dates', TEAL],
  ["Numeric", "Numbers you can calculate with.", "50   36.7   122\nDoses, results, ages", SEA],
  ["Date", "A calendar point. Stored as a number internally, but SDTM wants ISO text.", "2024-03-01\n(character in SDTM!)", ACCENT],
];
let tx = 0.7;
types.forEach(t => {
  card(s, tx, 1.85, 3.95, 3.1, PAPER);
  s.addShape(p.ShapeType.roundRect, { x: tx, y: 1.85, w: 3.95, h: 0.75, rectRadius: 0.09, fill: { color: t[3] }, line: { type: "none" } });
  s.addText(t[0], { x: tx, y: 1.98, w: 3.95, h: 0.5, align: "center", fontFace: HFONT, bold: true, fontSize: 20, color: t[3] === ACCENT ? INK : WHITE, margin: 0 });
  s.addText(t[1], { x: tx + 0.25, y: 2.75, w: 3.45, h: 1.0, fontFace: BFONT, fontSize: 13, color: INK, margin: 0 });
  s.addText(t[2], { x: tx + 0.25, y: 3.85, w: 3.45, h: 0.95, fontFace: MONO, fontSize: 11.5, color: t[3] === ACCENT ? "B5651A" : t[3], margin: 0 });
  tx += 4.1;
});
card(s, 0.7, 5.2, 12.0, 1.5, INK);
s.addText([
  { text: "The fourth state: MISSING.  ", options: { bold: true, color: MINT, fontSize: 15 } },
  { text: "A value that was not collected. In SAS a missing number is ", options: { color: "C7DCE0", fontSize: 13.5 } },
  { text: ".", options: { fontFace: MONO, color: WHITE, fontSize: 13.5 } },
  { text: " and missing text is ", options: { color: "C7DCE0", fontSize: 13.5 } },
  { text: '""', options: { fontFace: MONO, color: WHITE, fontSize: 13.5 } },
  { text: "; in R both are ", options: { color: "C7DCE0", fontSize: 13.5 } },
  { text: "NA", options: { fontFace: MONO, color: WHITE, fontSize: 13.5 } },
  { text: ". Missing is never the same as zero or an empty answer.", options: { color: "C7DCE0", fontSize: 13.5 } },
], { x: 1.0, y: 5.4, w: 11.4, h: 1.1, fontFace: BFONT, valign: "middle", lineSpacing: 21, margin: 0 });
s.addNotes("Types drive everything downstream. The key surprise for beginners: SDTM dates are CHARACTER, not date-typed — ISO 8601 strings. Internally both languages have date types you use for arithmetic (like study day), but what you store in a --DTC variable is text. Missing is the fourth state and deserves its own emphasis.");

// ============ 5. TRAP 1 — LEADING ZEROS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Trap 1", "Type guessing can destroy IDs");
s.addText("Readers guess column types from the values. An ID made only of digits looks like a number — and different tools make different guesses on the SAME file.",
  { x: 0.6, y: 1.5, w: 12.2, h: 0.45, fontFace: BFONT, fontSize: 14, color: MUTED, margin: 0 });
// three-way comparison
const guesses = [
  ["In the file", "SITEID = 01\nSUBJID = 001", PAPER, INK, TEAL],
  ["SAS PROC IMPORT\nbase R read.csv()", "SITEID = 1\nSUBJID = 1", "FDF1E7", "B5651A", ACCENT],
  ["readr read_csv()", "SITEID = \"01\"\nSUBJID = \"001\"", "EAF5F0", "0E7C86", TEAL],
];
let gx = 0.7;
guesses.forEach(g => {
  card(s, gx, 2.1, 3.95, 1.9, g[2]);
  s.addText(g[0], { x: gx + 0.25, y: 2.25, w: 3.45, h: 0.6, fontFace: BFONT, bold: true, fontSize: 13.5, color: g[4], margin: 0 });
  s.addText(g[1], { x: gx + 0.25, y: 2.95, w: 3.45, h: 0.9, fontFace: MONO, fontSize: 15, color: g[3], lineSpacing: 20, margin: 0 });
  gx += 4.1;
});
s.addText("→ If the zeros are lost, USUBJID becomes ABC-01-1-1 instead of ABC-01-01-001 — wrong for every subject, in every domain.",
  { x: 0.7, y: 4.15, w: 12, h: 0.4, fontFace: BFONT, bold: true, italic: true, fontSize: 14, color: ACCENT, align: "center", margin: 0 });
codeBox(s, 0.7, 4.7, 5.9,
  '/* control the types yourself */\ndata dm_raw;\n  infile "dm_raw.csv" dsd firstobs=2;\n  length siteid $3 subjid $5;\n  input studyid $ siteid $ subjid $ ...;\nrun;', TEAL, "SAS");
codeBox(s, 6.8, 4.7, 5.9,
  '# declare intent, never rely on luck\nread_csv("dm_raw.csv",\n  col_types = cols(\n    SITEID = col_character(),\n    SUBJID = col_character(),\n    .default = col_guess()))', ACCENT, "R");
s.addNotes("Be precise here — the tools genuinely differ. SAS PROC IMPORT guesses numeric for all-digit IDs and loses the zeros (guessingrows=max makes it scan every row but does not change that choice). Base R's read.csv() does the same. Modern readr::read_csv() is smarter: it detects the leading zeros and keeps the column as character, so it survives. The lesson is NOT 'R is better' — it is 'declare your types explicitly'. Relying on a good guess is fragile: if a future extract has site 10 with no leading zero, the guess flips to numeric and your IDs break. Notebook 03 demonstrates all three behaviours on the real file.");

// ============ 6. TRAP 2 — DATES ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Trap 2", "No raw date is ISO — convert every one");
const dates = [
  ["14-MAY-1969", "DD-MMM-YYYY — the CRF standard", "dm, ds, ex, vs, lb", TEAL],
  ["15/03/2024", "DD/MM/YYYY", "ae, cm", ACCENT],
  ["10-Mar-2024", "DD-Mon-YYYY", "ae, cm", ACCENT],
];
let dy = 1.85;
dates.forEach(d => {
  card(s, 0.7, dy, 12.0, 1.15, PAPER);
  s.addText(d[0], { x: 1.0, y: dy + 0.3, w: 3.0, h: 0.55, fontFace: MONO, bold: true, fontSize: 20, color: d[3] === ACCENT ? "B5651A" : d[3], valign: "middle", margin: 0 });
  s.addText(d[1], { x: 4.2, y: dy + 0.3, w: 4.2, h: 0.55, fontFace: BFONT, fontSize: 14.5, color: INK, valign: "middle", margin: 0 });
  s.addText("found in " + d[2], { x: 8.6, y: dy + 0.3, w: 3.8, h: 0.55, fontFace: BFONT, italic: true, fontSize: 12.5, color: MUTED, valign: "middle", margin: 0 });
  dy += 1.25;
});
card(s, 0.7, 5.7, 12.0, 1.15, INK);
s.addText([
  { text: "Three dangers.  ", options: { bold: true, color: MINT, fontSize: 15 } },
  { text: "(1) ", options: { color: WHITE, fontSize: 13.5, bold: true } },
  { text: "01/03/2024 is ambiguous — 1 March or 3 January? Check the data dictionary, never guess.  ", options: { color: "C7DCE0", fontSize: 13.5 } },
  { text: "(2) ", options: { color: WHITE, fontSize: 13.5, bold: true } },
  { text: "A blank date means ongoing or not done — leave it null, never substitute today's date.  ", options: { color: "C7DCE0", fontSize: 13.5 } },
  { text: "(3) ", options: { color: WHITE, fontSize: 13.5, bold: true } },
  { text: "DD-MMM-YYYY text does NOT sort chronologically — convert before any min/max.", options: { color: "C7DCE0", fontSize: 13.5 } },
], { x: 1.0, y: 5.85, w: 11.4, h: 0.9, fontFace: BFONT, valign: "middle", lineSpacing: 20, margin: 0 });
s.addNotes("Our raw data mixes formats deliberately because real extracts do. The ambiguity point is critical and genuinely dangerous: 01/03/2024 cannot be resolved from the value alone — you need the data dictionary or the source system's convention. For ABC-01 the dictionary states DD/MM/YYYY. The blank-date rule is a compliance point as much as a technical one.");

// ============ 7. TRAP 3 — MISSING ============
s = p.addSlide(); bg(s, INK);
headerDark(s, "Trap 3", "Blank does not mean zero");
const miss = [
  ["Not collected", "The test wasn't done at this visit.", "HEIGHT is blank at BASELINE and WEEK 4 — height is measured once, at screening."],
  ["Still ongoing", "The event or medication hasn't ended.", "AEENDT is blank for the Nausea event — it was still ongoing at the end of the study."],
  ["Genuinely unknown", "It was asked but the answer isn't known.", "ETHNIC = 'Unknown' for one subject — that is a real recorded value, not a blank."],
];
let my = 2.15;
miss.forEach((m, i) => {
  card(s, 0.7, my, 12.0, 1.35, "16404F");
  circle(s, 1.0, my + 0.35, 0.65, [TEAL, ACCENT, SEA][i], String(i + 1), i === 1 ? INK : WHITE, 16);
  s.addText(m[0], { x: 1.95, y: my + 0.18, w: 3.4, h: 0.45, fontFace: HFONT, bold: true, fontSize: 18, color: WHITE, margin: 0 });
  s.addText(m[1], { x: 1.95, y: my + 0.68, w: 3.6, h: 0.5, fontFace: BFONT, fontSize: 12.5, color: "9FC0C6", margin: 0 });
  s.addShape(p.ShapeType.line, { x: 5.8, y: my + 0.25, w: 0, h: 0.85, line: { color: "2A5566", width: 1 } });
  s.addText(m[2], { x: 6.05, y: my + 0.3, w: 6.4, h: 0.8, fontFace: BFONT, fontSize: 13, color: "E7F0F1", valign: "middle", margin: 0 });
  my += 1.45;
});
s.addText("Different reasons, same appearance in the file. Understanding which one you're looking at is a clinical question, not a technical one.",
  { x: 0.7, y: 6.5, w: 12, h: 0.45, fontFace: BFONT, italic: true, fontSize: 13.5, color: MINT, margin: 0 });
s.addNotes("A blank cell has several possible meanings and they map differently. Not-collected stays null. Ongoing stays null (and may drive a flag elsewhere). 'Unknown' recorded as a value is NOT missing — it maps to a CT term like UNKNOWN. The message: ask what the blank means before deciding how to handle it, and never fill it with a guess or a zero.");

// ============ 8. TRAP 4 — SHAPE ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Trap 4", "Wide and tall are both “normal”");
card(s, 0.7, 1.8, 5.9, 2.5, PAPER);
s.addText("WIDE — vs_raw.csv", { x: 1.0, y: 1.95, w: 5.3, h: 0.4, fontFace: BFONT, bold: true, fontSize: 15, color: TEAL, margin: 0 });
s.addText("SUBJID VISIT     SYSBP DIABP PULSE\n001    SCREENING  122    80    68\n001    BASELINE   120    78    66",
  { x: 1.0, y: 2.45, w: 5.4, h: 1.1, fontFace: MONO, fontSize: 11.5, color: INK, lineSpacing: 18, margin: 0 });
s.addText("One row per visit · one column per measurement", { x: 1.0, y: 3.75, w: 5.4, h: 0.4, fontFace: BFONT, italic: true, fontSize: 12, color: MUTED, margin: 0 });
card(s, 6.8, 1.8, 5.9, 2.5, "F0F7F4");
s.addText("TALL — lb_raw.csv", { x: 7.1, y: 1.95, w: 5.3, h: 0.4, fontFace: BFONT, bold: true, fontSize: 15, color: SEA, margin: 0 });
s.addText("SUBJID VISIT     LBTEST      LBORRES\n001    BASELINE  Hemoglobin  14.2\n001    BASELINE  Hematocrit  42",
  { x: 7.1, y: 2.45, w: 5.4, h: 1.1, fontFace: MONO, fontSize: 11.5, color: INK, lineSpacing: 18, margin: 0 });
s.addText("One row per measurement · a test-name column", { x: 7.1, y: 3.75, w: 5.4, h: 0.4, fontFace: BFONT, italic: true, fontSize: 12, color: MUTED, margin: 0 });
s.addShape(p.ShapeType.roundRect, { x: 0.7, y: 4.55, w: 12.0, h: 0.85, rectRadius: 0.08, fill: { color: ACCENT }, line: { type: "none" } });
s.addText("SDTM Findings domains are always TALL — so wide data must be transposed on the way in.",
  { x: 0.7, y: 4.55, w: 12.0, h: 0.85, align: "center", valign: "middle", fontFace: BFONT, bold: true, fontSize: 16, color: INK, margin: 0 });
s.addText("Recognising the shape is the first decision you make about a Findings file: does it need transposing, or is it already in the right form?",
  { x: 0.7, y: 5.65, w: 12, h: 0.5, fontFace: BFONT, fontSize: 14, color: MUTED, margin: 0 });
s.addText("VS needs transposing (24 rows → 128).      LB does not (48 rows → 48).",
  { x: 0.7, y: 6.2, w: 12, h: 0.4, fontFace: MONO, bold: true, fontSize: 13.5, color: TEAL, margin: 0 });
s.addNotes("Neither shape is wrong — they reflect how the CRF was built. A vital signs form has boxes for BP, pulse and temperature on one page, so the extract is wide. A lab result feed comes back one analyte at a time, so it is tall. Since SDTM Findings are tall, wide files need a transpose. Give the concrete numbers: VS 24 rows becomes 128; LB 48 stays 48.");

// ============ 9. TRAP 5 — FREE TEXT & CODES ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Trap 5", "The same idea, spelled many ways");
const inconsist = [
  ["Coded numbers", "SEX = 1 / 2", "You need the dictionary to know 1=Male, 2=Female"],
  ["Inconsistent case", "White / white / 'White '", "Trim and upper-case before matching"],
  ["Free text", "'bad headache' / 'Headache'", "Requires dictionary coding (MedDRA) — not a simple lookup"],
  ["Synonyms", "'No' / 'N'", "Both mean the same; map both to CT 'N'"],
];
inconsist.forEach((r, i) => {
  const y = 1.85 + i * 1.2;
  card(s, 0.7, y, 12.0, 1.05, i % 2 ? PAPER : WHITE);
  circle(s, 0.98, y + 0.22, 0.6, [TEAL, SEA, ACCENT, INK][i], "!", i === 2 ? INK : WHITE, 16);
  s.addText(r[0], { x: 1.8, y: y + 0.15, w: 2.6, h: 0.75, fontFace: BFONT, bold: true, fontSize: 14.5, color: INK, valign: "middle", margin: 0 });
  s.addText(r[1], { x: 4.5, y: y + 0.15, w: 3.4, h: 0.75, fontFace: MONO, fontSize: 12.5, color: ACCENT, valign: "middle", margin: 0 });
  s.addText(r[2], { x: 8.0, y: y + 0.15, w: 4.4, h: 0.75, fontFace: BFONT, fontSize: 12.5, color: MUTED, valign: "middle", margin: 0 });
});
s.addText("Cleaning these is Controlled Terminology work — Module 08. For now, just learn to spot them.",
  { x: 0.7, y: 6.75, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 13, color: TEAL, margin: 0 });
s.addNotes("A survey of what makes raw values messy. Note the important distinction on row 3: free-text medical terms cannot be resolved with a lookup table — they need dictionary coding by trained coders using MedDRA or WHODrug. Everything else here is a straightforward mapping table. We flag which is which so trainees don't think they can code adverse events with a CASE statement.");

// ============ 10. THE INSPECTION CHECKLIST ============
s = p.addSlide(); bg(s, INK);
headerDark(s, "Discipline", "The inspection checklist");
s.addText("Run this on every unfamiliar dataset, every time. It takes two minutes and saves hours.",
  { x: 0.7, y: 1.75, w: 12, h: 0.4, fontFace: BFONT, fontSize: 14, color: "9FC0C6", margin: 0 });
const checks = [
  ["1", "How many rows and columns?", "Does the row count match what you expected?"],
  ["2", "What type is every column?", "Especially the IDs — check the leading zeros survived."],
  ["3", "How many distinct subjects?", "Compare against DM. Any subject not in DM is a problem."],
  ["4", "Which columns have blanks?", "And what does each blank mean?"],
  ["5", "What are the distinct values?", "For any column you'll map to CT — look at every value."],
  ["6", "What date formats appear?", "Check for more than one format in the same column."],
];
checks.forEach((c, i) => {
  const x = 0.7 + (i % 2) * 6.1, y = 2.3 + Math.floor(i / 2) * 1.42;
  card(s, x, y, 5.9, 1.27, "16404F");
  circle(s, x + 0.25, y + 0.33, 0.6, [TEAL, SEA, MINT, ACCENT, TEAL, SEA][i], c[0], (i === 2 || i === 3) ? INK : WHITE, 16);
  s.addText(c[1], { x: x + 1.02, y: y + 0.17, w: 4.7, h: 0.42, fontFace: BFONT, bold: true, fontSize: 14.5, color: WHITE, margin: 0 });
  s.addText(c[2], { x: x + 1.02, y: y + 0.62, w: 4.7, h: 0.5, fontFace: BFONT, fontSize: 12, color: "9FC0C6", margin: 0 });
});
s.addNotes("Make this a habit. Notebook 03 walks through all six checks on all six ABC-01 files, in both languages. Check 3 is a genuine data-integrity check — a subject appearing in AE but not DM means something is wrong with the extract, and Pinnacle 21 will flag it later. Check 5 is how you build a CT mapping table: you cannot map values you have not looked at.");

// ============ 11. GAP ANALYSIS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "The output of inspection", "Gap analysis: ABC-01 raw → SDTM");
s.addText("Inspection produces a to-do list. Here is the real one for our study.",
  { x: 0.6, y: 1.5, w: 12.2, h: 0.4, fontFace: BFONT, fontSize: 14, color: MUTED, margin: 0 });
const gaps = [
  ["SUBJID not unique study-wide", "Build USUBJID", "all"],
  ["SEX stored as 1 / 2", "Apply CT → M / F", "DM"],
  ["RACE free text, mixed case", "Trim, upper-case, map to CT", "DM"],
  ["Birth date, no age", "Derive AGE and AGEU", "DM"],
  ["Dates in 3 formats", "Convert all to ISO 8601", "AE, CM"],
  ["No study day anywhere", "Derive --DY from RFSTDTC", "all"],
  ["No record sequence", "Derive --SEQ", "all"],
  ["VS is wide", "Transpose to --TESTCD / --TEST", "VS"],
];
const gt = [[
  { text: "What's wrong in the raw data", options: { bold: true, color: WHITE, fill: { color: ACCENT }, fontFace: BFONT, fontSize: 13 } },
  { text: "What you must do", options: { bold: true, color: WHITE, fill: { color: TEAL }, fontFace: BFONT, fontSize: 13 } },
  { text: "Affects", options: { bold: true, color: WHITE, fill: { color: INK }, align: "center", fontFace: BFONT, fontSize: 13 } },
]];
gaps.forEach((g, i) => {
  const fill = i % 2 ? PAPER : WHITE;
  gt.push([
    { text: g[0], options: { color: INK, fill: { color: fill }, fontFace: BFONT, fontSize: 12.5 } },
    { text: g[1], options: { color: TEAL, fill: { color: fill }, fontFace: BFONT, fontSize: 12.5, bold: true } },
    { text: g[2], options: { color: MUTED, fill: { color: fill }, align: "center", fontFace: MONO, fontSize: 12 } },
  ]);
});
s.addTable(gt, { x: 0.7, y: 2.05, w: 12.0, colW: [5.2, 5.0, 1.8], rowH: 0.48,
  border: { type: "solid", color: LINE, pt: 1 }, valign: "middle", margin: [2, 8, 2, 8] });
s.addText("Every one of these is documented in data/mapping_specification.md — your reference for the rest of the bootcamp.",
  { x: 0.7, y: 6.6, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 13, color: TEAL, margin: 0 });
s.addNotes("This is the payoff slide. Inspection is not academic — it produces this concrete list, and the list is the work plan for Modules 05 onward. Point trainees at mapping_specification.md, which documents each of these rules in full, and at data/sdtm/ which holds the finished result they are working towards.");

// ============ 12. IMPORT MISTAKES ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Avoid these", "Import mistakes that cost hours");
const mistakes = [
  ["Not checking the row count", "If you imported 23 rows from a 24-row file, something was silently dropped."],
  ["Letting IDs become numbers", "Leading zeros vanish and your USUBJID is wrong for every subject."],
  ["Assuming one date format", "Check every date column for more than one pattern."],
  ["Treating blanks as zero", "A missing weight is not a weight of 0 kg."],
  ["Editing the raw file", "Never. Fix it in code so the step is documented and repeatable."],
  ["Skipping the dictionary", "The data dictionary tells you what 1/2 and DD/MM mean. Read it first."],
];
mistakes.forEach((m, i) => {
  const x = 0.7 + (i % 2) * 6.1, y = 1.85 + Math.floor(i / 2) * 1.6;
  card(s, x, y, 5.9, 1.45, i % 2 ? WHITE : PAPER);
  circle(s, x + 0.25, y + 0.42, 0.6, ACCENT, "✕", INK, 16);
  s.addText([{ text: m[0] + "\n", options: { bold: true, fontSize: 14, color: INK } },
             { text: m[1], options: { fontSize: 11.8, color: MUTED } }],
    { x: x + 1.05, y: y + 0.18, w: 4.7, h: 1.1, fontFace: BFONT, valign: "middle", margin: 0 });
});
s.addNotes("The 'never edit the raw file' rule is worth dwelling on — it is a regulatory as well as a practical point. Every transformation must be reproducible from the source data by running a program. If you hand-edit a CSV, nobody can reproduce your dataset and you have broken traceability.");

// ============ 13. WHAT'S NEXT ============
s = p.addSlide(); bg(s, INK);
s.addShape(p.ShapeType.ellipse, { x: 10.2, y: 4.6, w: 5.0, h: 5.0, fill: { color: "133B4C" }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.2, y: 5.6, w: 3.0, h: 3.0, fill: { color: TEAL }, line: { type: "none" } });
s.addText("WHAT'S NEXT", { x: 0.7, y: 1.5, w: 11, h: 0.35, fontFace: BFONT, bold: true, fontSize: 13, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Get the data in, then build your first domain", { x: 0.66, y: 1.9, w: 11.5, h: 0.8, fontFace: HFONT, bold: true, fontSize: 32, color: WHITE, margin: 0 });
const nn = [
  ["Notebook 03", "Importing Raw Data — read all six files, run the checklist (SAS & R)"],
  ["Module 05", "Building the DM domain — Special Purpose, one row per subject"],
  ["Notebook 04", "Build DM end to end and check it against the reference dataset"],
];
let ny = 3.2;
nn.forEach((n, i) => {
  circle(s, 0.7, ny, 0.62, [TEAL, SEA, ACCENT][i], String(i + 1), i === 2 ? INK : WHITE, 17);
  s.addText([{ text: n[0] + "   ", options: { bold: true, fontSize: 17, color: WHITE } },
             { text: n[1], options: { fontSize: 14, color: "C7DCE0" } }],
    { x: 1.55, y: ny - 0.02, w: 10.8, h: 0.66, fontFace: BFONT, valign: "middle", margin: 0 });
  ny += 1.0;
});
s.addText("You now have the finished answer in data/sdtm/ — but build it yourself first, then compare.",
  { x: 0.7, y: 6.6, w: 11.5, h: 0.5, fontFace: BFONT, italic: true, fontSize: 14, color: MINT, margin: 0 });
s.addNotes("Close by pointing at the notebooks. Mention that the reference SDTM datasets exist in data/sdtm/ so trainees can self-check — but insist they attempt the mapping before opening the answer. End of Module 04.");

p.writeFile({ fileName: "/Volumes/D Drive/SDTM Training/Bootcamp/presentations/04_reading_raw_data.pptx" })
  .then(f => console.log("WROTE", f))
  .catch(e => { console.error(e); process.exit(1); });
