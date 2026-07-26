// Build: 14_why_adam_adsl.pptx — "From Tabulation to Analysis: Why ADaM Exists"
// Bootcamp Module 14. First deck of the ADaM track. Concept deck for ADSL.
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "Clinical Programming Bootcamp";
p.title = "From Tabulation to Analysis: Why ADaM Exists";

const INK = "0F2E3D", TEAL = "0E7C86", SEA = "1FA8A0", MINT = "6FC8B4",
      ACCENT = "E8833A", WHITE = "FFFFFF", PAPER = "F3F7F8",
      MUTED = "5A7682", MUTEDDK = "8FAEB8", LINE = "CFDEE1", CODEBG = "13323F", WARN = "C4442E";
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
  if (label) s.addText(label, { x: x + 0.25, y: y + 0.1, w: 6, h: 0.35, fontFace: HFONT, bold: true, fontSize: 14, color: borderColor, margin: 0 });
  s.addText(lines, { x: x + 0.25, y: y + 0.5, w: w - 0.45, h: textH, fontFace: MONO, fontSize: CODE_FS, color: "DCEBEF", lineSpacing: CODE_LS, margin: 0, valign: "top" });
  return y + h;
}
let s;

// ============ 1. TITLE ============
s = p.addSlide(); bg(s, INK);
s.addShape(p.ShapeType.ellipse, { x: 9.7, y: -1.6, w: 5.2, h: 5.2, fill: { color: "133B4C" }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 10.7, y: -0.6, w: 3.2, h: 3.2, fill: { color: TEAL }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.45, y: 0.15, w: 1.7, h: 1.7, fill: { color: ACCENT }, line: { type: "none" } });
s.addText("CLINICAL PROGRAMMING BOOTCAMP  ·  MODULE 14", { x: 0.7, y: 2.0, w: 9, h: 0.4,
  fontFace: BFONT, fontSize: 14, bold: true, color: MINT, charSpacing: 2, margin: 0 });
s.addText("From Tabulation\nto Analysis", { x: 0.66, y: 2.5, w: 9.6, h: 1.7,
  fontFace: HFONT, fontSize: 44, bold: true, color: WHITE, lineSpacing: 48, margin: 0 });
s.addText("Why ADaM exists — and building ADSL", { x: 0.7, y: 4.15, w: 9.6, h: 0.6,
  fontFace: HFONT, fontSize: 26, color: MINT, margin: 0 });
s.addText("You have spent ten days making data faithful. Now you make it answerable.",
  { x: 0.7, y: 5.0, w: 9.2, h: 0.8, fontFace: BFONT, fontSize: 16, color: "C7DCE0", margin: 0 });
s.addText("Hands-on: Notebook 14 (SAS) — Build ADSL",
  { x: 0.7, y: 6.5, w: 12, h: 0.4, fontFace: BFONT, fontSize: 12, italic: true, color: MUTEDDK, margin: 0 });
s.addNotes("Module 14 opens the ADaM track. The audience has just spent ten days learning that SDTM must not derive anything it did not collect. ADaM inverts that instruction, and it is worth naming the whiplash explicitly or they will think one of the two rules is wrong. Both are right; they serve different readers.");

// ============ 2. GOALS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Module goals", "By the end of this module you can…");
const goals = [
  ["Say why ADaM exists", "in one sentence, without using the word 'analysis-ready' as if it explained itself."],
  ["Name the three dataset classes", "ADSL, BDS and OCCDS — and say which to reach for."],
  ["Build ADSL end to end", "treatment variables, population flags, disposition, baseline measurements."],
  ["Apply the ADaM baseline rule", "and say why copying VSBLFL breaks silently."],
  ["Defend traceability", "explain how a regulator gets from a number in a table back to a CRF page."],
];
let gy = 1.75;
goals.forEach((g, i) => {
  card(s, 0.7, gy, 12.0, 1.02, i % 2 ? PAPER : WHITE);
  circle(s, 0.95, gy + 0.21, 0.6, [TEAL, SEA, ACCENT, INK, TEAL][i], String(i + 1), WHITE, 17);
  s.addText([{ text: g[0] + "  ", options: { bold: true, fontSize: 16, color: INK } },
             { text: g[1], options: { fontSize: 13.5, color: MUTED } }],
    { x: 1.75, y: gy + 0.16, w: 10.7, h: 0.7, fontFace: BFONT, valign: "middle", margin: 0 });
  gy += 1.12;
});
s.addNotes("Goal 4 is the one they will actually be tested by in the notebook. Goal 1 is the one they will be asked in an interview.");

// ============ 3. THE SAME SUBJECT, TWICE ============
s = p.addSlide(); bg(s, WHITE);
header(s, "The core idea", "The same subject, told two different ways");
s.addText("Subject ABC-01-01-004 wants to appear in a table of mean treatment duration by arm.",
  { x: 0.7, y: 1.55, w: 12, h: 0.4, fontFace: BFONT, fontSize: 14.5, color: MUTED, margin: 0 });

card(s, 0.7, 2.1, 5.9, 3.5, PAPER);
s.addText("SDTM asks: what happened?", { x: 0.95, y: 2.28, w: 5.4, h: 0.4,
  fontFace: HFONT, bold: true, fontSize: 17, color: INK, margin: 0 });
s.addText([
  { text: "DM", options: { bold: true, color: TEAL } }, { text: "  →  RFXSTDTC, RFXENDTC (text)\n" },
  { text: "DS", options: { bold: true, color: TEAL } }, { text: "  →  disposition, why they left\n" },
  { text: "EX", options: { bold: true, color: TEAL } }, { text: "  →  what was actually given\n\n" },
  { text: "Three domains. Nothing derived.\nTo get the duration you must join\nthem and compute it yourself —\nevery time, in every program.",
    options: { color: MUTED, italic: true } },
], { x: 0.95, y: 2.75, w: 5.4, h: 2.7, fontFace: BFONT, fontSize: 13.5, color: INK, lineSpacing: 19, margin: 0 });

card(s, 6.9, 2.1, 5.8, 3.5, WHITE);
s.addText("ADaM asks: what do I report?", { x: 7.15, y: 2.28, w: 5.3, h: 0.4,
  fontFace: HFONT, bold: true, fontSize: 17, color: INK, margin: 0 });
s.addText([
  { text: "ADSL", options: { bold: true, color: ACCENT } }, { text: "  →  one row, everything on it\n\n" },
  { text: "TRT01P  = Placebo\nTRTSDT  = 06MAR2024\nTRTEDT  = 25MAR2024\nTRTDURD = 20\nSAFFL   = Y\n",
    options: { fontFace: MONO, fontSize: 12, color: INK } },
  { text: "\nOne dataset. PROC MEANS. Done.", options: { color: MUTED, italic: true } },
], { x: 7.15, y: 2.75, w: 5.3, h: 2.7, fontFace: BFONT, fontSize: 13.5, color: INK, lineSpacing: 19, margin: 0 });

s.addText("Same subject. Same truth. Different organising principle — because they have different readers.",
  { x: 0.7, y: 5.85, w: 12, h: 0.5, fontFace: BFONT, italic: true, fontSize: 14.5, color: TEAL, margin: 0 });
s.addNotes("Do not rush this slide — it is the whole module. The point is not that ADaM is 'better'. SDTM is organised for a reviewer who asks 'is this faithful to what was collected?'. ADaM is organised for a statistician who asks 'what does this study show?'. Both questions are legitimate and neither dataset answers the other one well.");

// ============ 4. THE TEST ============
s = p.addSlide(); bg(s, INK);
s.addText("THE TEST A DATASET MUST PASS", { x: 0.7, y: 1.5, w: 11, h: 0.35,
  fontFace: BFONT, bold: true, fontSize: 13, color: MINT, charSpacing: 2, margin: 0 });
s.addText("A table, listing or figure can be produced\nby subsetting and summarising ONE dataset —\nwith no further merging and no further derivation.",
  { x: 0.66, y: 2.0, w: 12, h: 2.2, fontFace: HFONT, bold: true, fontSize: 30, color: WHITE, lineSpacing: 42, margin: 0 });
s.addShape(p.ShapeType.rect, { x: 0.7, y: 4.5, w: 0.08, h: 1.5, fill: { color: ACCENT }, line: { type: "none" } });
s.addText("If you need a join at the analysis step, the analysis dataset was built wrong.\n\nThat is not a style preference. It is the difference between a result a reviewer can reproduce and one they cannot.",
  { x: 1.05, y: 4.5, w: 11.3, h: 1.5, fontFace: BFONT, fontSize: 15.5, color: "C7DCE0", lineSpacing: 24, margin: 0 });
s.addNotes("This is the definition to memorise. Everything else in the ADaM track is downstream of it. When a trainee asks 'should this variable be in the dataset?', the answer is always 'does a table need it, and would you otherwise have to join to get it?'");

// ============ 5. THE THREE CLASSES ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Structure", "Three dataset classes — and how to choose");
const classes = [
  ["ADSL", "Subject-Level", "ONE row per subject", "The spine. Treatment, populations, key dates.\nEvery other dataset copies from it.", ACCENT],
  ["BDS", "Basic Data Structure", "One row per subject\nper parameter per visit", "Anything measured repeatedly:\nvitals, labs, scores. ADVS, ADLB.", TEAL],
  ["OCCDS", "Occurrence", "One row per event", "Things that either happened or did not:\nadverse events, medications. ADAE.", SEA],
];
let cx = 0.7;
classes.forEach((c) => {
  card(s, cx, 1.75, 3.95, 4.2, WHITE);
  s.addShape(p.ShapeType.rect, { x: cx, y: 1.75, w: 3.95, h: 0.13, fill: { color: c[4] }, line: { type: "none" } });
  s.addText(c[0], { x: cx + 0.3, y: 2.05, w: 3.4, h: 0.5, fontFace: HFONT, bold: true, fontSize: 26, color: c[4], margin: 0 });
  s.addText(c[1], { x: cx + 0.3, y: 2.6, w: 3.4, h: 0.35, fontFace: BFONT, fontSize: 12.5, color: MUTED, margin: 0 });
  s.addText(c[2], { x: cx + 0.3, y: 3.1, w: 3.4, h: 0.8, fontFace: BFONT, bold: true, fontSize: 14, color: INK, lineSpacing: 19, margin: 0 });
  s.addText(c[3], { x: cx + 0.3, y: 4.15, w: 3.4, h: 1.5, fontFace: BFONT, fontSize: 13, color: MUTED, lineSpacing: 18, margin: 0 });
  cx += 4.15;
});
s.addText("Pick by SHAPE, not by subject matter. A questionnaire score is BDS. A protocol deviation is OCCDS.",
  { x: 0.7, y: 6.2, w: 12, h: 0.5, fontFace: BFONT, italic: true, fontSize: 14, color: TEAL, margin: 0 });
s.addNotes("The common mistake is picking by topic — 'labs go in ADLB' — rather than by shape. Ask instead: does this thing repeat over visits (BDS), or did it either occur or not (OCCDS)? A vital sign measured once is still BDS. An AE is OCCDS even though it has dates.");

// ============ 6. ADSL IS THE SOURCE OF TRUTH ============
s = p.addSlide(); bg(s, WHITE);
header(s, "ADSL", "One dataset defines the study's subject-level truth");
circle(s, 5.9, 1.9, 1.5, ACCENT, "ADSL", WHITE, 20);
const spokes = [["ADAE", 2.0, 4.3], ["ADVS", 4.6, 4.3], ["ADLB", 7.2, 4.3], ["ADTTE", 9.8, 4.3]];
spokes.forEach((sp) => {
  s.addShape(p.ShapeType.line, { x: 6.65, y: 3.4, w: sp[1] + 0.75 - 6.65, h: 0.9,
    line: { color: LINE, width: 2 } });
});
spokes.forEach((sp) => {
  card(s, sp[1], sp[2], 1.5, 0.75, PAPER);
  s.addText(sp[0], { x: sp[1], y: sp[2], w: 1.5, h: 0.75, align: "center", valign: "middle",
    fontFace: BFONT, bold: true, fontSize: 15, color: INK, margin: 0 });
});
s.addText("TRT01P · TRT01A · SAFFL · ITTFL · TRTSDT · TRTEDT · AGEGR1",
  { x: 0.7, y: 5.35, w: 12, h: 0.4, align: "center", fontFace: MONO, fontSize: 13, color: TEAL, margin: 0 });
s.addText("These are COPIED downstream — never re-derived. Re-deriving invites the two to drift, and nothing tells you when they do.",
  { x: 0.7, y: 5.85, w: 12, h: 0.5, align: "center", fontFace: BFONT, italic: true, fontSize: 14, color: MUTED, margin: 0 });
s.addNotes("Emphasise the failure mode: if SAFFL is derived independently in ADAE and in ADSL, and someone later changes the definition in one place, the study now has two answers to 'who was dosed'. Neither can be defended, and no error is raised. One derivation, one home.");

// ============ 7. DATES BECOME NUMBERS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "The type change", "In ADaM, a date is a number");
let dy = codeBox(s, 0.7, 1.7, 5.9,
  'RFXSTDTC = "2024-03-01"\n\nCHARACTER. ISO 8601.\nFaithful, readable, sortable.\n\nYou cannot subtract it.',
  TEAL, "SDTM");
codeBox(s, 6.9, 1.7, 5.8,
  'TRTSDT = 23436\n         (01MAR2024)\n\nNUMERIC SAS date.\n\nTRTEDT - TRTSDT + 1 = 28',
  ACCENT, "ADaM");
card(s, 0.7, 4.5, 12.0, 1.55, PAPER);
s.addText([
  { text: "INPUT() ", options: { fontFace: MONO, bold: true, color: TEAL } },
  { text: "converts character → numeric.    " },
  { text: "PUT() ", options: { fontFace: MONO, bold: true, color: ACCENT } },
  { text: "converts numeric → character.\n" },
  { text: "Getting these backwards is the most common SAS error in this course. It does not always fail loudly.",
    options: { italic: true, color: MUTED } },
], { x: 1.0, y: 4.75, w: 11.4, h: 1.1, fontFace: BFONT, fontSize: 14.5, color: INK, lineSpacing: 22, margin: 0 });
s.addText("Why the change? Because a table needs arithmetic, and arithmetic needs numbers.",
  { x: 0.7, y: 6.25, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 14, color: TEAL, margin: 0 });
s.addNotes("Notebook 02 covered INPUT vs PUT. This is where it stops being an exercise. Mention that the reference CSVs store dates as ISO text because a CSV cannot carry a numeric date, so the PROC COMPARE step renders the numeric back to text — for the comparison only.");

// ============ 8. THE BASELINE RULE ============
s = p.addSlide(); bg(s, WHITE);
header(s, "The hard part", "Baseline is a question about time, not about a visit");
card(s, 0.7, 1.7, 12.0, 0.9, INK);
s.addText("Baseline = the LAST non-missing value on or before the date of first dose.",
  { x: 0.95, y: 1.7, w: 11.5, h: 0.9, valign: "middle", fontFace: HFONT, bold: true, fontSize: 20, color: WHITE, margin: 0 });

card(s, 0.7, 2.85, 5.9, 2.5, "FBEAE4");
s.addShape(p.ShapeType.rect, { x: 0.7, y: 2.85, w: 0.09, h: 2.5, fill: { color: WARN }, line: { type: "none" } });
s.addText("The tempting shortcut", { x: 1.05, y: 3.0, w: 5.3, h: 0.35, fontFace: HFONT, bold: true, fontSize: 16, color: WARN, margin: 0 });
s.addText([
  { text: "if vsblfl = 'Y';\n\n", options: { fontFace: MONO, fontSize: 12.5 } },
  { text: "HEIGHT is collected only at SCREENING.\nVSBLFL marks the BASELINE visit.\n\n" },
  { text: "Zero height records carry VSBLFL='Y'.\nAll 8 subjects lose baseline height —\nand their BMI. No error. No warning.",
    options: { bold: true } },
], { x: 1.05, y: 3.4, w: 5.3, h: 1.8, fontFace: BFONT, fontSize: 13, color: INK, lineSpacing: 18, margin: 0 });

card(s, 6.9, 2.85, 5.8, 2.5, "E8F4F1");
s.addShape(p.ShapeType.rect, { x: 6.9, y: 2.85, w: 0.09, h: 2.5, fill: { color: SEA }, line: { type: "none" } });
s.addText("The rule, done properly", { x: 7.25, y: 3.0, w: 5.2, h: 0.35, fontFace: HFONT, bold: true, fontSize: 16, color: TEAL, margin: 0 });
s.addText([
  { text: "where vsdtc <= trtsdt\n... if last.vstestcd;\n\n", options: { fontFace: MONO, fontSize: 12.5 } },
  { text: "HEIGHT  → resolves to Screening\nWEIGHT  → resolves to Baseline\n\n" },
  { text: "Same rule. Different visits.\nBecause it asks about TIME.", options: { bold: true } },
], { x: 7.25, y: 3.4, w: 5.2, h: 1.8, fontFace: BFONT, fontSize: 13, color: INK, lineSpacing: 18, margin: 0 });

s.addText("A rule written in terms of visit labels breaks the moment a parameter is collected on a different schedule.",
  { x: 0.7, y: 5.65, w: 12, h: 0.5, fontFace: BFONT, italic: true, fontSize: 14.5, color: TEAL, margin: 0 });
s.addNotes("This is the slide the notebook is built around, and Exercise 1 makes them do it the wrong way on purpose. The pedagogical point is bigger than height: it is that a silent wrong answer is more dangerous than a crash, and that the only defence is knowing what the number SHOULD look like before you run the code.");

// ============ 9. POPULATION FLAGS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Population flags", "Different questions that happen to have the same answer");
const flags = [
  ["SAFFL", "Safety", "Did the subject take at least one dose?", "TRTSDT is not missing", TEAL],
  ["ITTFL", "Intent-to-treat", "Was the subject randomised?", "RANDDT is not missing", SEA],
  ["COMPLFL", "Completers", "Did the subject finish the study?", "DS disposition = COMPLETED", ACCENT],
];
let fy = 1.8;
flags.forEach((f) => {
  card(s, 0.7, fy, 12.0, 1.15, WHITE);
  s.addShape(p.ShapeType.rect, { x: 0.7, y: fy, w: 0.09, h: 1.15, fill: { color: f[4] }, line: { type: "none" } });
  s.addText(f[0], { x: 1.05, y: fy + 0.14, w: 2.0, h: 0.45, fontFace: MONO, bold: true, fontSize: 16, color: f[4], margin: 0 });
  s.addText(f[1], { x: 1.05, y: fy + 0.6, w: 2.0, h: 0.35, fontFace: BFONT, fontSize: 12, color: MUTED, margin: 0 });
  s.addText(f[2], { x: 3.3, y: fy + 0.14, w: 5.4, h: 0.5, fontFace: BFONT, fontSize: 14.5, color: INK, margin: 0 });
  s.addText(f[3], { x: 3.3, y: fy + 0.62, w: 5.4, h: 0.4, fontFace: MONO, fontSize: 12, color: MUTED, margin: 0 });
  s.addText("Y for all 8", { x: 9.0, y: fy + 0.3, w: 3.4, h: 0.5, fontFace: BFONT, italic: true, fontSize: 13.5, color: MUTED, margin: 0 });
  fy += 1.28;
});
s.addText("All three are 'Y' for every ABC-01 subject — and all three are still derived from different rules.",
  { x: 0.7, y: 5.85, w: 12, h: 0.4, fontFace: BFONT, bold: true, fontSize: 15, color: INK, margin: 0 });
s.addText("A screen failure, or a subject randomised but never dosed, separates them. Then the tables built on each separate too.",
  { x: 0.7, y: 6.3, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 14, color: TEAL, margin: 0 });
s.addNotes("The teaching risk here is that ABC-01 cannot demonstrate the difference — every flag is Y. Say so explicitly rather than letting them conclude the flags are redundant. Exercise 2 asks them to invent the two subjects that WOULD tell the rules apart.");

// ============ 10. TRACEABILITY ============
s = p.addSlide(); bg(s, PAPER);
header(s, "Traceability", "A regulator must get from a table back to a CRF page");
const chain = [
  ["Table", "Mean duration\nby arm", MUTED],
  ["ADSL", "TRTDURD = 20", ACCENT],
  ["SDTM DM", "RFXSTDTC\nRFXENDTC", TEAL],
  ["SDTM EX", "EXSTDTC\nEXENDTC", TEAL],
  ["aCRF", "Dosing page,\nannotated", INK],
];
// Cards first, arrows second. Drawing an arrow inside this loop puts it UNDER
// the next iteration's filled card, which paints over it — caught by
// check_deck_layout.py as 56% hidden text.
chain.forEach((c, i) => {
  const tx = 0.7 + i * 2.53;
  card(s, tx, 2.1, 2.2, 1.9, WHITE);
  s.addText(c[0], { x: tx, y: 2.3, w: 2.2, h: 0.4, align: "center", fontFace: HFONT, bold: true, fontSize: 17, color: c[2], margin: 0 });
  s.addText(c[1], { x: tx, y: 2.8, w: 2.2, h: 0.9, align: "center", fontFace: MONO, fontSize: 11.5, color: MUTED, lineSpacing: 16, margin: 0 });
});
chain.slice(0, -1).forEach((c, i) => {
  s.addText("←", { x: 0.7 + i * 2.53 + 2.2, y: 2.75, w: 0.33, h: 0.5, align: "center",
    fontFace: BFONT, fontSize: 20, color: SEA, margin: 0 });
});
s.addText("Every link must be documented, and every derivation must be reproducible from the link below it.",
  { x: 0.7, y: 4.4, w: 12, h: 0.4, fontFace: BFONT, fontSize: 15, color: INK, margin: 0 });
card(s, 0.7, 5.0, 12.0, 1.35, WHITE);
s.addText([
  { text: "This is why ADaM carries SRCDOM / SRCVAR / SRCSEQ. ", options: { bold: true } },
  { text: "A record that names its source SDTM row can be checked. A derived record with no single source leaves them blank — and that blank is information, not an omission.",
    options: { color: MUTED } },
], { x: 1.0, y: 5.2, w: 11.4, h: 1.0, fontFace: BFONT, fontSize: 14, color: INK, lineSpacing: 21, margin: 0 });
s.addNotes("Traceability is a regulatory requirement, not a nicety — it is what lets a reviewer reproduce a result without the sponsor's programs. Point forward: in ADVS the derived BMI parameter has BLANK source variables, and that is correct, because there is no single source record to name.");

// ============ 11. WHAT GOES WRONG ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Failure modes", "Six ADSL mistakes, and what each one costs");
const errs = [
  ["Copying VSBLFL as baseline", "Every subject loses baseline height and BMI. No error.", WARN],
  ["Re-deriving SAFFL downstream", "Two answers to 'who was dosed'. Neither defensible.", WARN],
  ["DCSREAS filled for completers", "'Discontinued for reason X' becomes uncountable.", ACCENT],
  ["TRTDURD without the +1", "Every duration off by one; a one-day subject reads as zero.", ACCENT],
  ["Duplicate USUBJID", "Silently multiplies rows in every downstream merge.", WARN],
  ["Dates left as character", "Arithmetic impossible; study day cannot be derived.", ACCENT],
];
let ey = 1.75;
errs.forEach((e) => {
  card(s, 0.7, ey, 12.0, 0.78, WHITE);
  s.addShape(p.ShapeType.rect, { x: 0.7, y: ey, w: 0.09, h: 0.78, fill: { color: e[2] }, line: { type: "none" } });
  s.addText(e[0], { x: 1.05, y: ey + 0.06, w: 5.0, h: 0.66, valign: "middle", fontFace: BFONT, bold: true, fontSize: 14, color: INK, margin: 0 });
  s.addText(e[1], { x: 6.2, y: ey + 0.06, w: 6.3, h: 0.66, valign: "middle", fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
  ey += 0.86;
});
s.addText("Five of these six produce no error message. That is the recurring lesson of this course.",
  { x: 0.7, y: 6.95, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 14, color: TEAL, margin: 0 });
s.addNotes("Tie this back to the SDTM track's eleven real defects, eight of which raised no error. The pattern is identical in ADaM and the defence is the same: know what the answer should look like before you run the code, and check row counts and key uniqueness every single time.");

// ============ 12. WHAT'S NEXT ============
s = p.addSlide(); bg(s, INK);
s.addShape(p.ShapeType.ellipse, { x: 10.2, y: 4.6, w: 5.0, h: 5.0, fill: { color: "133B4C" }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.2, y: 5.6, w: 3.0, h: 3.0, fill: { color: TEAL }, line: { type: "none" } });
s.addText("WHAT'S NEXT", { x: 0.7, y: 1.4, w: 11, h: 0.35, fontFace: BFONT, bold: true, fontSize: 13, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Build the spine first", { x: 0.66, y: 1.8, w: 11.5, h: 0.8, fontFace: HFONT, bold: true, fontSize: 32, color: WHITE, margin: 0 });
const nn = [
  ["Step 1 · Notebook 14", "Build ADSL from DM, DS and VS. Eight rows, and one of them discontinued.", ACCENT],
  ["Step 2 · Exercise 1", "Do the baseline the WRONG way on purpose. Watch it fail silently.", TEAL],
  ["Step 3 · Check", "PROC COMPARE against data/adam/adsl.csv — the finished reference.", MINT],
];
let ny = 3.0;
nn.forEach((n, i) => {
  circle(s, 0.7, ny, 0.62, n[2], String(i + 1), n[2] === TEAL ? WHITE : INK, 17);
  s.addText([{ text: n[0] + "   ", options: { bold: true, fontSize: 17, color: WHITE } },
             { text: n[1], options: { fontSize: 13.5, color: "C7DCE0" } }],
    { x: 1.55, y: ny - 0.02, w: 10.8, h: 0.8, fontFace: BFONT, valign: "middle", margin: 0 });
  ny += 1.05;
});
s.addText("Everything in the next four days copies from what you build today. Get ADSL right and the rest is bookkeeping.",
  { x: 0.7, y: 6.5, w: 11.5, h: 0.6, fontFace: BFONT, italic: true, fontSize: 14, color: MINT, margin: 0 });
s.addNotes("Close on the dependency: ADSL is not just the first dataset, it is the one every other dataset trusts. End of Module 14.");

p.writeFile({ fileName: "/Volumes/D Drive/SDTM Training/Bootcamp/presentations/14_why_adam_adsl.pptx" })
  .then(f => console.log("WROTE", f))
  .catch(e => { console.error(e); process.exit(1); });
