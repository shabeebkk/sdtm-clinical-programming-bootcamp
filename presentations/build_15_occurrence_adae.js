// Build: 15_occurrence_adae.pptx — "Occurrence Data: ADAE and the Safety Tables It Feeds"
// Bootcamp Module 15. Second deck of the ADaM track. Concept deck for ADAE.
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "Clinical Programming Bootcamp";
p.title = "Occurrence Data: ADAE and the Safety Tables It Feeds";

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
s.addText("CLINICAL PROGRAMMING BOOTCAMP  ·  MODULE 15", { x: 0.7, y: 2.0, w: 9, h: 0.4,
  fontFace: BFONT, fontSize: 14, bold: true, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Occurrence Data", { x: 0.66, y: 2.5, w: 9.6, h: 1.0,
  fontFace: HFONT, fontSize: 44, bold: true, color: WHITE, margin: 0 });
s.addText("ADAE and the safety tables it feeds", { x: 0.7, y: 3.6, w: 9.6, h: 0.6,
  fontFace: HFONT, fontSize: 26, color: MINT, margin: 0 });
s.addText("One row per event. One flag decides what every safety table in the study reports.",
  { x: 0.7, y: 4.6, w: 9.2, h: 0.8, fontFace: BFONT, fontSize: 16, color: "C7DCE0", margin: 0 });
s.addText("Hands-on: Notebook 15 (SAS) — Build ADAE",
  { x: 0.7, y: 6.5, w: 12, h: 0.4, fontFace: BFONT, fontSize: 12, italic: true, color: MUTEDDK, margin: 0 });
s.addNotes("Module 15. The shape changes: ADSL was one row per subject, ADAE is one row per event, and a subject can contribute zero rows or five. That variable row count is what makes counting subjects a real problem, and it is the reason occurrence flags exist.");

// ============ 2. GOALS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Module goals", "By the end of this module you can…");
const goals = [
  ["Recognise an occurrence dataset", "and pick OCCDS vs BDS by SHAPE, not by subject matter."],
  ["Derive the analysis variables", "ASTDY, ADURN, ASEVN, AREL — and know why each exists."],
  ["Explain treatment-emergent", "and why ADAE reads the flag rather than recomputing it."],
  ["Set occurrence flags correctly", "so that counting flagged rows counts subjects."],
  ["Defend a causality definition", "and say who decides it and when."],
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
s.addNotes("Goal 3 is the traceability lesson and goal 4 is the arithmetic lesson. Goal 5 is the one that separates a programmer from a clinical programmer.");

// ============ 3. PICK BY SHAPE ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Choosing a structure", "Pick by shape, not by subject matter");
const rows = [
  ["Does it repeat over visits?", "BDS", "blood pressure · haemoglobin · a questionnaire score", TEAL],
  ["Did it either occur, or not?", "OCCDS", "adverse event · concomitant medication · protocol deviation", ACCENT],
  ["Is it one fact about the subject?", "ADSL", "treatment arm · age group · date of first dose", SEA],
];
let ry = 1.9;
rows.forEach((r) => {
  card(s, 0.7, ry, 12.0, 1.25, WHITE);
  s.addShape(p.ShapeType.rect, { x: 0.7, y: ry, w: 0.09, h: 1.25, fill: { color: r[3] }, line: { type: "none" } });
  s.addText(r[0], { x: 1.05, y: ry + 0.15, w: 5.3, h: 0.5, fontFace: BFONT, bold: true, fontSize: 15.5, color: INK, margin: 0 });
  s.addText(r[2], { x: 1.05, y: ry + 0.68, w: 8.0, h: 0.45, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
  s.addText(r[1], { x: 9.9, y: ry + 0.3, w: 2.5, h: 0.6, align: "center", fontFace: HFONT, bold: true, fontSize: 24, color: r[3], margin: 0 });
  ry += 1.4;
});
card(s, 0.7, 6.15, 12.0, 0.85, PAPER);
s.addText([
  { text: "A vital sign measured only once is still BDS. ", options: { bold: true } },
  { text: "An adverse event is still OCCDS even though it has dates. The shape decides.", options: { color: MUTED } },
], { x: 1.0, y: 6.3, w: 11.4, h: 0.6, fontFace: BFONT, fontSize: 14, color: INK, margin: 0 });
s.addNotes("The common mistake is picking by topic. Push back on 'labs go in ADLB' — ask instead whether the thing repeats over visits or simply occurred. Protocol deviations catch people out: they feel like findings, but they either happened or did not, so they are OCCDS.");

// ============ 4. THE ROW THAT DECIDES EVERYTHING ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Treatment-emergent", "One row decides what every safety table reports");
card(s, 0.7, 1.7, 12.0, 1.5, "FBEAE4");
s.addShape(p.ShapeType.rect, { x: 0.7, y: 1.7, w: 0.09, h: 1.5, fill: { color: WARN }, line: { type: "none" } });
s.addText("ABC-01-01-002 · AESEQ 1 · Oropharyngeal pain", { x: 1.05, y: 1.85, w: 8.0, h: 0.4,
  fontFace: MONO, bold: true, fontSize: 15, color: INK, margin: 0 });
s.addText("Started study day −5. Five days BEFORE the first dose.", { x: 1.05, y: 2.3, w: 8.0, h: 0.4,
  fontFace: BFONT, fontSize: 15, color: WARN, margin: 0 });
s.addText("A real event, reported by a real investigator.", { x: 1.05, y: 2.72, w: 8.0, h: 0.35,
  fontFace: BFONT, italic: true, fontSize: 13.5, color: MUTED, margin: 0 });
s.addText("TRTEMFL = 'N'", { x: 9.4, y: 2.15, w: 3.0, h: 0.6, align: "center",
  fontFace: MONO, bold: true, fontSize: 20, color: WARN, margin: 0 });

const cols = [
  ["It STAYS in the dataset", "Deleting it breaks reconciliation with SDTM AE, and destroys every non-safety use of the data.", SEA],
  ["It appears in NO safety table", "Every safety table subsets on TRTEMFL = 'Y'. The drug cannot have caused what preceded it.", TEAL],
  ["It carries NO occurrence flag", "AOCCFL and AOCCPFL are restricted to emergent events, or the flag would undo its own purpose.", ACCENT],
];
let cx = 0.7;
cols.forEach((c) => {
  card(s, cx, 3.5, 3.95, 2.3, WHITE);
  s.addShape(p.ShapeType.rect, { x: cx, y: 3.5, w: 3.95, h: 0.11, fill: { color: c[2] }, line: { type: "none" } });
  s.addText(c[0], { x: cx + 0.28, y: 3.75, w: 3.4, h: 0.75, fontFace: BFONT, bold: true, fontSize: 14.5, color: INK, lineSpacing: 19, margin: 0 });
  s.addText(c[1], { x: cx + 0.28, y: 4.55, w: 3.4, h: 1.15, fontFace: BFONT, fontSize: 12.5, color: MUTED, lineSpacing: 17, margin: 0 });
  cx += 4.15;
});
s.addText("Keep the row. Flag it. Subset at analysis time. That sentence is most of what ADaM is.",
  { x: 0.7, y: 6.05, w: 12, h: 0.5, fontFace: BFONT, italic: true, fontSize: 15, color: TEAL, margin: 0 });
s.addNotes("Exercise 2 has them delete the row instead and discover that NO number in the safety summary changes — which is exactly what makes the mistake dangerous. The deliverable looks identical, so table QC cannot catch it. What breaks is reconciliation against SDTM and every question a medical monitor might ask about pre-existing conditions.");

// ============ 5. ONE DERIVATION, ONE HOME ============
s = p.addSlide(); bg(s, PAPER);
header(s, "Traceability", "The flag already exists — read it, do not rebuild it");
card(s, 0.7, 1.8, 5.9, 2.1, WHITE);
s.addText("SDTM did this already", { x: 1.0, y: 2.0, w: 5.3, h: 0.4, fontFace: HFONT, bold: true, fontSize: 17, color: TEAL, margin: 0 });
s.addText("SUPPAE.AETRTEM\n\nDerived once, in the tabulation\npackage, where it is documented\nand where a reviewer can find it.",
  { x: 1.0, y: 2.5, w: 5.3, h: 1.3, fontFace: BFONT, fontSize: 13.5, color: INK, lineSpacing: 19, margin: 0 });

card(s, 6.9, 1.8, 5.8, 2.1, WHITE);
s.addText("ADaM reads it", { x: 7.2, y: 2.0, w: 5.2, h: 0.4, fontFace: HFONT, bold: true, fontSize: 17, color: ACCENT, margin: 0 });
s.addText("trtemfl = qval;\n\nOne derivation. One home.\nIf SDTM's rule is later refined,\nADaM inherits the refinement.",
  { x: 7.2, y: 2.5, w: 5.2, h: 1.3, fontFace: BFONT, fontSize: 13.5, color: INK, lineSpacing: 19, margin: 0 });

card(s, 0.7, 4.2, 12.0, 1.35, "FBEAE4");
s.addShape(p.ShapeType.rect, { x: 0.7, y: 4.2, w: 0.09, h: 1.35, fill: { color: WARN }, line: { type: "none" } });
s.addText([
  { text: "Recompute it in ADaM and the two WILL eventually disagree. ", options: { bold: true } },
  { text: "Someone refines the SDTM rule for partial dates; ADaM keeps its own copy. Nothing errors. The tabulation and analysis packages simply disagree about which events were emergent — and a reviewer finds it before you do.",
    options: { color: MUTED } },
], { x: 1.05, y: 4.4, w: 11.4, h: 1.0, fontFace: BFONT, fontSize: 13.5, color: INK, lineSpacing: 19, margin: 0 });

card(s, 0.7, 5.85, 12.0, 0.95, WHITE);
s.addText([
  { text: "But trust is not verification. ", options: { bold: true, color: TEAL } },
  { text: "The notebook independently cross-checks the flag against the dates and requires zero mismatches. Reading a derived flag is right; assuming it is correct without ever testing it is not.",
    options: { color: MUTED } },
], { x: 1.0, y: 6.02, w: 11.4, h: 0.7, fontFace: BFONT, fontSize: 13.5, color: INK, lineSpacing: 19, margin: 0 });
s.addNotes("This is the traceability principle made concrete. It generalises well beyond TRTEMFL: any time you are about to re-derive something an upstream dataset already computed, ask where the rule is documented and what happens when it changes.");

// ============ 6. OCCURRENCE FLAGS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Counting", "Why AOCCFL exists");
s.addText("The first line of every AE table is “subjects with at least one treatment-emergent event”.",
  { x: 0.7, y: 1.55, w: 12, h: 0.4, fontFace: BFONT, fontSize: 15, color: MUTED, margin: 0 });
s.addText("A subject with three events must contribute 1 to that number — not 3.",
  { x: 0.7, y: 1.95, w: 12, h: 0.4, fontFace: BFONT, bold: true, fontSize: 15.5, color: INK, margin: 0 });

const counts = [
  ["Count DISTINCT subjects\nwhere TRTEMFL = 'Y'", "3 / 3", SEA, "correct"],
  ["Count ROWS\nwhere AOCCFL = 'Y'", "3 / 3", TEAL, "correct — by construction"],
  ["Count ALL rows\nwhere TRTEMFL = 'Y'", "5 / 4", WARN, "wrong — 125% of the arm"],
];
let qx = 0.7;
counts.forEach((c) => {
  card(s, qx, 2.6, 3.95, 2.5, WHITE);
  s.addShape(p.ShapeType.rect, { x: qx, y: 2.6, w: 3.95, h: 0.11, fill: { color: c[2] }, line: { type: "none" } });
  s.addText(c[0], { x: qx + 0.28, y: 2.85, w: 3.4, h: 0.85, fontFace: MONO, fontSize: 12.5, color: INK, lineSpacing: 17, margin: 0 });
  s.addText(c[1], { x: qx + 0.28, y: 3.8, w: 3.4, h: 0.6, fontFace: HFONT, bold: true, fontSize: 28, color: c[2], margin: 0 });
  s.addText(c[3], { x: qx + 0.28, y: 4.45, w: 3.4, h: 0.5, fontFace: BFONT, italic: true, fontSize: 12.5, color: MUTED, margin: 0 });
  qx += 4.15;
});
s.addText("Drug A / Placebo. Four subjects per arm.", { x: 0.7, y: 5.2, w: 12, h: 0.35,
  fontFace: BFONT, italic: true, fontSize: 12.5, color: MUTED, margin: 0 });

card(s, 0.7, 5.7, 12.0, 1.1, PAPER);
s.addText([
  { text: "Count subjects with a flag. Count events with a row. ", options: { bold: true } },
  { text: "Never let one stand in for the other. A percentage over 100 announces itself — the dangerous version is a study large enough that the inflated number still looks plausible.",
    options: { color: MUTED } },
], { x: 1.0, y: 5.88, w: 11.4, h: 0.8, fontFace: BFONT, fontSize: 13.5, color: INK, lineSpacing: 19, margin: 0 });
s.addNotes("The 125% figure is real — computed from ABC-01. Four subjects have more than one treatment-emergent event, so counting rows double-counts three of them. Worth writing the arithmetic on the board.");

// ============ 7. DETERMINISM ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Reproducibility", "Which row gets flagged must not depend on luck");
codeBox(s, 0.7, 1.7, 5.9, "by usubjid astdt;\n\nTies unresolved.\nThe flagged row depends on\nwhatever order the data\nhappened to arrive in.", WARN, "FRAGILE");
codeBox(s, 6.9, 1.7, 5.8, "by usubjid astdt aeseq;\n\nTies broken deterministically.\nSame answer every run,\non every machine,\nin every order.", SEA, "CORRECT");
card(s, 0.7, 4.4, 12.0, 2.15, PAPER);
s.addText("Why this is a regulatory concern, not tidiness", { x: 1.0, y: 4.58, w: 11.4, h: 0.4,
  fontFace: HFONT, bold: true, fontSize: 16, color: INK, margin: 0 });
s.addText([
  { text: "1.  Reproducibility IS the deliverable. ", options: { bold: true } },
  { text: "A result that changes with dataset order cannot be reproduced — and an irreproducible result is treated as unreliable whether or not it was right.\n" },
  { text: "2.  It breaks silently and intermittently. ", options: { bold: true } },
  { text: "Most damagingly between the run that made the tables and the run that made the QC check.\n" },
  { text: "3.  The flagged row supplies reported values. ", options: { bold: true } },
  { text: "In some shells the flagged event's severity is what prints. A non-deterministic flag changes reported severities, not just row selection." },
], { x: 1.0, y: 5.05, w: 11.4, h: 1.4, fontFace: BFONT, fontSize: 13, color: MUTED, lineSpacing: 18, margin: 0 });
s.addText("No ABC-01 subject has two events on one date — so this code would pass today and fail on the next study.",
  { x: 0.7, y: 6.7, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 13.5, color: TEAL, margin: 0 });
s.addNotes("The last line is the real lesson: the code is wrong even when the data does not expose it. This is the same class of error as the SDTM track's RENAME collision — correct-looking output from incorrect code. Any 'if first.X' needs a sort key that is unique within the by-group, which is precisely why SDTM gives occurrence datasets an --SEQ.");

// ============ 8. A DECISION, NOT A FACT ============
s = p.addSlide(); bg(s, INK);
s.addText("CAUSALITY", { x: 0.7, y: 1.3, w: 11, h: 0.35, fontFace: BFONT, bold: true, fontSize: 13, color: MINT, charSpacing: 2, margin: 0 });
s.addText("AREL collapses four collected values into two.\nThat collapse is a decision, not a fact.",
  { x: 0.66, y: 1.7, w: 12, h: 1.4, fontFace: HFONT, bold: true, fontSize: 28, color: WHITE, lineSpacing: 40, margin: 0 });

const defs = [
  ["RELATED or POSSIBLY RELATED", "7 of 9", "the conservative reading — and the usual default", MINT],
  ["RELATED only", "5 of 9", "22% of treatment-emergent events reclassified", ACCENT],
];
let dy2 = 3.3;
defs.forEach((d) => {
  s.addShape(p.ShapeType.roundRect, { x: 0.7, y: dy2, w: 12.0, h: 1.15, rectRadius: 0.09,
    fill: { color: "133B4C" }, line: { color: "1E4A5C", width: 1 } });
  s.addText(d[0], { x: 1.05, y: dy2 + 0.14, w: 6.2, h: 0.45, fontFace: MONO, bold: true, fontSize: 14.5, color: WHITE, margin: 0 });
  s.addText(d[2], { x: 1.05, y: dy2 + 0.62, w: 7.5, h: 0.4, fontFace: BFONT, fontSize: 13, color: "9FBAC2", margin: 0 });
  s.addText(d[1], { x: 9.6, y: dy2 + 0.28, w: 2.8, h: 0.6, align: "center", fontFace: HFONT, bold: true, fontSize: 26, color: d[3], margin: 0 });
  dy2 += 1.32;
});
s.addText("Same events. Same investigator assessments. A different reading rule — and the headline rate moves.",
  { x: 0.7, y: 6.05, w: 12, h: 0.4, fontFace: BFONT, fontSize: 14.5, color: "C7DCE0", margin: 0 });
s.addText("Decided in the SAP, before database lock, before anyone has seen unblinded results.",
  { x: 0.7, y: 6.5, w: 12, h: 0.4, fontFace: BFONT, bold: true, italic: true, fontSize: 14.5, color: MINT, margin: 0 });
s.addNotes("Make the ethical point explicitly: a study that picks the definition after seeing which one gives a nicer safety profile has produced a marketing document, not evidence. Note also that the conservative reading is the default because under-reporting a possible harm is the more dangerous error.");

// ============ 9. WHAT'S NEXT ============
s = p.addSlide(); bg(s, INK);
s.addShape(p.ShapeType.ellipse, { x: 10.2, y: 4.6, w: 5.0, h: 5.0, fill: { color: "133B4C" }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.2, y: 5.6, w: 3.0, h: 3.0, fill: { color: TEAL }, line: { type: "none" } });
s.addText("WHAT'S NEXT", { x: 0.7, y: 1.4, w: 11, h: 0.35, fontFace: BFONT, bold: true, fontSize: 13, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Ten rows, and one of them matters most", { x: 0.66, y: 1.8, w: 11.5, h: 0.8, fontFace: HFONT, bold: true, fontSize: 32, color: WHITE, margin: 0 });
const nn = [
  ["Step 1 · Notebook 15", "Build ADAE. Merge ADSL, derive the analysis variables, set the occurrence flags.", ACCENT],
  ["Step 2 · Exercise 2", "Delete the pre-dose event instead of flagging it. Watch nothing change — and understand why that is the problem.", TEAL],
  ["Step 3 · Check", "PROC COMPARE against data/adam/adae.csv, and prove the flag arithmetic.", MINT],
];
let ny = 3.0;
nn.forEach((n, i) => {
  circle(s, 0.7, ny, 0.62, n[2], String(i + 1), n[2] === TEAL ? WHITE : INK, 17);
  s.addText([{ text: n[0] + "   ", options: { bold: true, fontSize: 17, color: WHITE } },
             { text: n[1], options: { fontSize: 13.5, color: "C7DCE0" } }],
    { x: 1.55, y: ny - 0.02, w: 10.8, h: 0.9, fontFace: BFONT, valign: "middle", margin: 0 });
  ny += 1.1;
});
s.addText("Two subjects have no events at all — and they still count in every denominator. That idea returns with force in ADLB.",
  { x: 0.7, y: 6.5, w: 11.5, h: 0.6, fontFace: BFONT, italic: true, fontSize: 14, color: MINT, margin: 0 });
s.addNotes("Close by planting the denominator idea: ADAE has no rows for two subjects, and they are still in the safety population. In ADLB only half the study has data at all, and the same principle decides every percentage. End of Module 15.");

p.writeFile({ fileName: "/Volumes/D Drive/SDTM Training/Bootcamp/presentations/15_occurrence_adae.pptx" })
  .then(f => console.log("WROTE", f))
  .catch(e => { console.error(e); process.exit(1); });
