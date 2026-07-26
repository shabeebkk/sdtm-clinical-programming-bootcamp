// Build: 07_findings_domains.pptx — "Findings Domains"
// Bootcamp Module 07. Concept deck for VS and LB (Day 7).
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "Clinical Programming Bootcamp";
p.title = "Findings Domains";

const INK = "0F2E3D", TEAL = "0E7C86", SEA = "1FA8A0", MINT = "6FC8B4",
      ACCENT = "E8833A", WHITE = "FFFFFF", PAPER = "F3F7F8",
      MUTED = "5A7682", MUTEDDK = "8FAEB8", LINE = "CFDEE1", CODEBG = "13323F",
      RUST = "B5651A", ROSE = "C0455B";
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
  fits("card", x, y, w, h);
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.09,
    fill: { color: fill || WHITE }, line: { color: LINE, width: 1 }, shadow: shadow() });
}
const CODE_FS = 12, CODE_LS = 17;
function codeBox(s, x, y, w, lines, borderColor, label) {
  const n = lines.split("\n").length;
  const textH = n * (CODE_LS / 72) + 0.14;
  const h = 0.62 + textH;
  fits("code box", x, y, w, h);
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: CODEBG }, line: { color: borderColor, width: 1.5 } });
  if (label) s.addText(label, { x: x + 0.25, y: y + 0.1, w: 6, h: 0.35, fontFace: HFONT, bold: true, fontSize: 14, color: borderColor, margin: 0 });
  s.addText(lines, { x: x + 0.25, y: y + 0.5, w: w - 0.45, h: textH, fontFace: MONO, fontSize: CODE_FS, color: "DCEBEF", lineSpacing: CODE_LS, margin: 0, valign: "top" });
  return y + h;
}
// LAYOUT_WIDE is 13.33 x 7.5 in. Anything crossing those edges is clipped in the
// render, so fail the BUILD rather than ship a slide that has to be caught by eye.
const SLIDE_W = 13.33, SLIDE_H = 7.5, MARGIN = 0.1;
let slideNo = 0;
function fits(what, x, y, w, h) {
  if (x + w > SLIDE_W - MARGIN + 1e-9)
    throw new Error(`slide ${slideNo}: ${what} overflows RIGHT edge — ends at ${(x + w).toFixed(2)}", limit ${(SLIDE_W - MARGIN).toFixed(2)}"`);
  if (y + h > SLIDE_H - MARGIN + 1e-9)
    throw new Error(`slide ${slideNo}: ${what} overflows BOTTOM edge — ends at ${(y + h).toFixed(2)}", limit ${(SLIDE_H - MARGIN).toFixed(2)}"`);
}

// Simple data grid. Returns the y coordinate just below the table.
function grid(s, x, y, colW, rows, opt) {
  opt = opt || {};
  fits("table", x, y, colW.reduce((a, b) => a + b, 0), rows.length * (opt.rowH || 0.34));
  const rh = opt.rowH || 0.34, fs = opt.fontSize || 11.5;
  rows.forEach((row, r) => {
    let cx = x;
    row.forEach((cell, c) => {
      const head = r === 0;
      s.addShape(p.ShapeType.rect, { x: cx, y: y + r * rh, w: colW[c], h: rh,
        fill: { color: head ? (opt.headFill || INK) : (r % 2 ? (opt.altFill || PAPER) : WHITE) },
        line: { color: LINE, width: 0.75 } });
      const hi = opt.highlight && opt.highlight(r, c);
      s.addText(String(cell), { x: cx + 0.06, y: y + r * rh, w: colW[c] - 0.12, h: rh,
        fontFace: opt.mono ? MONO : BFONT, fontSize: fs,
        bold: head || !!hi, color: head ? WHITE : (hi || INK),
        align: opt.align && opt.align[c] ? opt.align[c] : "left", valign: "middle", margin: 0 });
      cx += colW[c];
    });
  });
  return y + rows.length * rh;
}
let s;
const _add = () => { slideNo++; return p.addSlide(); };

// ============ 1. TITLE ============
s = _add(); bg(s, INK);
s.addShape(p.ShapeType.ellipse, { x: 9.7, y: -1.6, w: 5.2, h: 5.2, fill: { color: "133B4C" }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 10.7, y: -0.6, w: 3.2, h: 3.2, fill: { color: SEA }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.45, y: 0.15, w: 1.7, h: 1.7, fill: { color: ACCENT }, line: { type: "none" } });
s.addText("CLINICAL PROGRAMMING BOOTCAMP  ·  MODULE 07", { x: 0.7, y: 2.0, w: 9, h: 0.4,
  fontFace: BFONT, fontSize: 14, bold: true, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Findings", { x: 0.66, y: 2.5, w: 9.6, h: 1.1,
  fontFace: HFONT, fontSize: 44, bold: true, color: WHITE, margin: 0 });
s.addText("VS and LB — the third observation class", { x: 0.7, y: 3.7, w: 9.6, h: 0.6,
  fontFace: HFONT, fontSize: 24, color: MINT, margin: 0 });
s.addText("The class that holds MEASUREMENTS. It brings the biggest structural change in the whole course: the raw data must be turned on its side.",
  { x: 0.7, y: 4.5, w: 9.2, h: 0.9, fontFace: BFONT, fontSize: 16, color: "C7DCE0", margin: 0 });
s.addText("Hands-on: Notebook 08 · Build VS   ·   Notebook 09 · Build LB   (SAS)",
  { x: 0.7, y: 6.5, w: 12, h: 0.4, fontFace: BFONT, fontSize: 12, italic: true, color: MUTEDDK, margin: 0 });
s.addNotes("Module 07. Findings is the third and largest general observation class. Two things make it feel harder than AE/CM/EX: the test/result paradigm, and the wide-to-tall transpose. Reassure the group that the SKELETON is the same one they already know — identifiers, topic, qualifiers, timing. What changes is that the topic is now a TEST, and the raw data arrives in the wrong shape.");

// ============ 2. GOALS ============
s = _add(); bg(s, WHITE);
header(s, "Module goals", "By the end of this module you can…");
const goals = [
  ["Recognise a Findings domain", "and name the topic variable that makes it one."],
  ["Transpose wide raw data to tall SDTM", "the single biggest structural change you will make."],
  ["Explain --ORRES vs --STRESC vs --STRESN", "why one result is stored three times, and what each is for."],
  ["Derive --BLFL correctly", "the baseline flag that every efficacy and safety analysis depends on."],
  ["Read a reference range", "and derive --NRIND from it."],
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
s.addNotes("Goal 2 is where most of the class time goes. Goal 3 is the one people think they understand and don't — press on it. Goal 4 is deceptively simple to state and easy to get wrong in a real study with unscheduled visits.");

// ============ 3. THE THIRD CLASS ============
s = _add(); bg(s, WHITE);
header(s, "Where Findings fits", "Three classes, three kinds of sentence");
const classes = [
  ["INTERVENTIONS", "Something was GIVEN", "--TRT", "EX · CM · PR", TEAL,
   "“Subject 001 was given Drug A, 50 mg, orally, once daily.”"],
  ["EVENTS", "Something HAPPENED", "--TERM", "AE · MH · DS", RUST,
   "“Subject 001 had a bad headache on 15 March.”"],
  ["FINDINGS", "Something was MEASURED", "--TESTCD / --TEST", "VS · LB · EG · PE", SEA,
   "“Subject 001’s systolic blood pressure was 120 mmHg at Baseline.”"],
];
let cy = 1.8;
classes.forEach((c, i) => {
  const on = i === 2;
  card(s, 0.7, cy, 12.0, 1.42, on ? "E7F4F2" : PAPER);
  if (on) s.addShape(p.ShapeType.rect, { x: 0.7, y: cy, w: 0.09, h: 1.42, fill: { color: c[4] }, line: { type: "none" } });
  s.addText(c[0], { x: 1.0, y: cy + 0.14, w: 3.1, h: 0.4, fontFace: HFONT, bold: true, fontSize: 18, color: c[4], margin: 0 });
  s.addText(c[1], { x: 1.0, y: cy + 0.56, w: 3.1, h: 0.35, fontFace: BFONT, fontSize: 12.5, color: MUTED, margin: 0 });
  s.addText(c[2], { x: 4.15, y: cy + 0.2, w: 2.5, h: 0.4, fontFace: MONO, bold: true, fontSize: 13, color: INK, margin: 0 });
  s.addText("topic variable", { x: 4.15, y: cy + 0.58, w: 2.5, h: 0.3, fontFace: BFONT, fontSize: 10.5, color: MUTED, margin: 0 });
  s.addText(c[3], { x: 6.7, y: cy + 0.2, w: 2.0, h: 0.4, fontFace: MONO, fontSize: 12.5, color: INK, margin: 0 });
  s.addText(c[5], { x: 8.8, y: cy + 0.18, w: 3.75, h: 1.0, fontFace: BFONT, italic: true, fontSize: 11.5, color: on ? INK : MUTED, valign: "middle", margin: 0 });
  cy += 1.55;
});
s.addText("Findings is by far the LARGEST class — most SDTM domains, and most rows in a typical submission, are Findings.",
  { x: 0.7, y: 6.5, w: 12, h: 0.5, fontFace: BFONT, italic: true, fontSize: 13.5, color: TEAL, margin: 0 });
s.addNotes("Ask the group to classify a few things out loud before revealing: an ECG (Findings), a surgical procedure (Interventions), a fall (Events). The sentence test on the right is the fastest way to decide. Emphasise the scale point at the bottom — in a real oncology submission LB alone can be millions of rows.");

// ============ 4. THE FINDINGS SKELETON ============
s = _add(); bg(s, INK);
headerDark(s, "The pattern", "Same skeleton you already know — one part changes");
const skel = [
  ["IDENTIFIERS", "Who and which record", "STUDYID · DOMAIN · USUBJID · VSSEQ", TEAL, false],
  ["TOPIC", "WHICH TEST was performed", "VSTESTCD · VSTEST", ACCENT, true],
  ["RESULT", "WHAT THE TEST RETURNED", "VSORRES · VSSTRESC · VSSTRESN · VSORRESU", ROSE, true],
  ["QUALIFIERS", "Everything else describing it", "VSBLFL · VSPOS · LBNRIND · LBCAT", MINT, false],
  ["TIMING", "When it was measured", "VISITNUM · VISIT · VSDTC · VSDY", SEA, false],
];
let sy = 2.0;
skel.forEach((r) => {
  s.addShape(p.ShapeType.roundRect, { x: 0.7, y: sy, w: 12.0, h: 0.86, rectRadius: 0.08,
    fill: { color: r[4] ? "1A4152" : "163B4B" }, line: { color: r[3], width: r[4] ? 2 : 1 } });
  s.addText(r[0], { x: 1.0, y: sy + 0.1, w: 2.7, h: 0.35, fontFace: HFONT, bold: true, fontSize: 15, color: r[3], margin: 0 });
  s.addText(r[1], { x: 1.0, y: sy + 0.46, w: 3.3, h: 0.3, fontFace: BFONT, fontSize: 11.5, color: "AFCBD3", margin: 0 });
  s.addText(r[2], { x: 4.5, y: sy + 0.22, w: 8.0, h: 0.45, fontFace: MONO, fontSize: 13, color: WHITE, valign: "middle", margin: 0 });
  sy += 0.96;
});
s.addText("The two highlighted rows are what's new. In AE the topic was WHAT HAPPENED and the answer was the same variable. In Findings the topic is the QUESTION and the result is a SEPARATE set of variables.",
  { x: 0.7, y: 6.75, w: 12.0, h: 0.55, fontFace: BFONT, italic: true, fontSize: 13, color: MINT, margin: 0 });
s.addNotes("Draw the parallel explicitly: AETERM 'bad headache' was self-contained — the topic WAS the information. VSTESTCD 'SYSBP' tells you nothing on its own; it is a question, and VSORRES holds the answer. That split is the whole idea of the test/result paradigm, and it is what makes the transpose necessary.");

// ============ 5. WIDE vs TALL — THE BIG IDEA ============
s = _add(); bg(s, WHITE);
header(s, "The structural change", "Raw data is WIDE. SDTM is TALL.");
s.addText("RAW  —  vs_raw.csv  ·  one row per VISIT, one column per measurement", { x: 0.7, y: 1.72, w: 12, h: 0.32,
  fontFace: BFONT, bold: true, fontSize: 12.5, color: RUST, margin: 0 });
grid(s, 0.7, 2.08, [1.55, 1.25, 0.85, 0.85, 0.85, 0.75, 0.9, 0.95], [
  ["SUBJID", "VISIT", "SYSBP", "DIABP", "PULSE", "TEMP", "HEIGHT", "WEIGHT"],
  ["001", "SCREENING", "122", "80", "68", "36.7", "165", "70.5"],
  ["001", "BASELINE", "120", "78", "66", "36.8", "", "70.2"],
], { mono: true, fontSize: 11, align: [null, null, "center", "center", "center", "center", "center", "center"] });
s.addText("1 subject × 2 visits  =  2 rows", { x: 8.85, y: 2.42, w: 3.9, h: 0.4,
  fontFace: BFONT, bold: true, fontSize: 13, color: RUST, margin: 0 });
s.addText("Add a new test → add a new COLUMN.\nThe structure changes every time the protocol does.",
  { x: 8.85, y: 2.75, w: 3.9, h: 0.7, fontFace: BFONT, fontSize: 11.5, color: MUTED, margin: 0 });

circle(s, 6.3, 3.35, 0.62, SEA, "▼", WHITE, 20);
s.addText("TRANSPOSE", { x: 6.95, y: 3.48, w: 2.2, h: 0.36, fontFace: BFONT, bold: true, fontSize: 12.5, color: SEA, margin: 0 });

s.addText("SDTM  —  VS  ·  one row per SUBJECT × VISIT × TEST", { x: 0.7, y: 4.12, w: 12, h: 0.32,
  fontFace: BFONT, bold: true, fontSize: 12.5, color: TEAL, margin: 0 });
grid(s, 0.7, 4.48, [1.9, 1.35, 1.2, 1.15, 1.2], [
  ["USUBJID", "VISIT", "VSTESTCD", "VSORRES", "VSORRESU"],
  ["ABC-01-01-001", "SCREENING", "SYSBP", "122", "mmHg"],
  ["ABC-01-01-001", "SCREENING", "DIABP", "80", "mmHg"],
  ["ABC-01-01-001", "SCREENING", "PULSE", "68", "beats/min"],
  ["ABC-01-01-001", "SCREENING", "…", "…", "…"],
], { mono: true, fontSize: 11, align: [null, null, null, "center", null] });
s.addText("1 subject × 2 visits × 6 tests  =  up to 12 rows", { x: 7.6, y: 4.82, w: 5.1, h: 0.4,
  fontFace: BFONT, bold: true, fontSize: 13, color: TEAL, margin: 0 });
s.addText("Add a new test → add new ROWS.\nThe STRUCTURE never changes. That is the point.",
  { x: 7.6, y: 5.15, w: 5.1, h: 0.7, fontFace: BFONT, fontSize: 11.5, color: MUTED, margin: 0 });

card(s, 0.7, 6.28, 12.0, 0.8, "E7F4F2");
s.addText([{ text: "Why bother?  ", options: { bold: true, color: INK } },
           { text: "A reviewer can write ONE program that reads every Findings domain in every study — because they all have the same columns. A wide dataset needs a new program for every protocol.", options: { color: INK } }],
  { x: 1.0, y: 6.36, w: 11.4, h: 0.64, fontFace: BFONT, fontSize: 13, valign: "middle", margin: 0 });
s.addNotes("This is THE slide of the module. Spend time here. The killer argument for tall structure is not elegance, it is reusability: FDA reviewers have standard tools that work across every submission because the shape is fixed. Point out the empty HEIGHT cell in the BASELINE raw row — height is measured once at screening. In tall form that missing value simply produces no row, which is another advantage: wide data forces you to store a blank, tall data just omits it.");

// ============ 6. THE TRANSPOSE IN CODE ============
s = _add(); bg(s, INK);
headerDark(s, "Doing it", "Six output rows from one input row");
s.addText("The array-and-loop method — one OUTPUT per test, skipping what wasn't measured",
  { x: 0.7, y: 1.75, w: 12, h: 0.35, fontFace: BFONT, fontSize: 13, color: "AFCBD3", margin: 0 });
codeBox(s, 0.7, 2.2, 12.0,
`array vals{6}  sysbp diabp pulse temp height weight;
array cds {6} $8 ('SYSBP' 'DIABP' 'PULSE' 'TEMP' 'HEIGHT' 'WEIGHT');

do i = 1 to 6;
    if not missing(vals{i}) then do;     /* no result -> no row */
        vstestcd = cds{i};
        vsorres  = put(vals{i}, best.);
        output;                          /* <-- one row per test */
    end;
end;`, SEA, "SAS  ·  wide → tall");
card(s, 0.7, 5.35, 5.85, 1.55, "1A4152");
s.addText("The three moving parts", { x: 1.0, y: 5.5, w: 5.2, h: 0.35, fontFace: HFONT, bold: true, fontSize: 15, color: MINT, margin: 0 });
s.addText("1.  an array of the VALUE columns\n2.  a parallel array of TEST CODES\n3.  OUTPUT inside the loop, not after it",
  { x: 1.0, y: 5.88, w: 5.2, h: 0.9, fontFace: BFONT, fontSize: 12.5, color: "DCEBEF", lineSpacing: 17, margin: 0 });
card(s, 6.85, 5.35, 5.85, 1.55, "3A2530");
s.addText("⚠  The classic bug", { x: 7.15, y: 5.5, w: 5.2, h: 0.35, fontFace: HFONT, bold: true, fontSize: 15, color: "FF9DAE", margin: 0 });
s.addText("OUTPUT placed AFTER the loop instead of inside it.\nYou get one row per visit carrying only the LAST test — and it looks plausible enough to ship.",
  { x: 7.15, y: 5.88, w: 5.2, h: 0.95, fontFace: BFONT, fontSize: 12, color: "F0D6DB", lineSpacing: 15, margin: 0 });
s.addNotes("Walk the loop by hand for one visit. The two arrays must be in the SAME ORDER — that pairing is the whole trick, and a mismatched pair silently labels every pulse as a temperature. The missing-value test is what stops HEIGHT generating empty rows at BASELINE and WEEK 4. Mention that PROC TRANSPOSE can also do this but the array method is clearer and easier to control when tests have different units.");

// ============ 7. ORRES vs STRESC vs STRESN ============
s = _add(); bg(s, WHITE);
header(s, "One result, three variables", "Why SDTM stores the same number three times");
const res = [
  ["--ORRES", "ORIGINAL result, exactly as collected", "CHARACTER", "“120”", TEAL,
   "Never modified. This is the audit trail back to the CRF."],
  ["--STRESC", "STANDARDISED result, as character", "CHARACTER", "“120”", ACCENT,
   "Converted to the study's standard unit. Holds results that are NOT numbers, e.g. “POSITIVE”."],
  ["--STRESN", "STANDARDISED result, as a number", "NUMERIC", "120", ROSE,
   "The only one you can average. Empty when the result isn't numeric."],
];
let ry = 1.8;
res.forEach((r) => {
  card(s, 0.7, ry, 12.0, 1.45, PAPER);
  s.addShape(p.ShapeType.rect, { x: 0.7, y: ry, w: 0.09, h: 1.45, fill: { color: r[4] }, line: { type: "none" } });
  s.addText(r[0], { x: 1.0, y: ry + 0.16, w: 2.3, h: 0.4, fontFace: MONO, bold: true, fontSize: 16, color: r[4], margin: 0 });
  s.addText(r[2], { x: 1.0, y: ry + 0.62, w: 2.3, h: 0.3, fontFace: BFONT, bold: true, fontSize: 10, color: MUTED, charSpacing: 1, margin: 0 });
  s.addText(r[1], { x: 3.4, y: ry + 0.18, w: 4.6, h: 0.5, fontFace: BFONT, bold: true, fontSize: 13.5, color: INK, margin: 0 });
  s.addText(r[5], { x: 3.4, y: ry + 0.68, w: 6.9, h: 0.6, fontFace: BFONT, fontSize: 12, color: MUTED, margin: 0 });
  s.addShape(p.ShapeType.roundRect, { x: 10.6, y: ry + 0.32, w: 1.85, h: 0.72, rectRadius: 0.06,
    fill: { color: CODEBG }, line: { color: r[4], width: 1.2 } });
  s.addText(r[3], { x: 10.6, y: ry + 0.32, w: 1.85, h: 0.72, fontFace: MONO, fontSize: 15, bold: true,
    color: "DCEBEF", align: "center", valign: "middle", margin: 0 });
  ry += 1.58;
});
card(s, 0.7, 6.55, 12.0, 0.72, "FDF1E7");
s.addText([{ text: "In ABC-01 all three look identical  ", options: { bold: true, color: RUST } },
           { text: "— because the sites already collect in standard units. That is a property of THIS study, not a rule. A site reporting weight in pounds would give ORRES 155 lb and STRESN 70.3 kg.", options: { color: INK } }],
  { x: 1.0, y: 6.63, w: 11.4, h: 0.56, fontFace: BFONT, fontSize: 12.5, valign: "middle", margin: 0 });
s.addNotes("The most common trainee reaction is 'this is redundant'. Answer with the two cases that break the illusion: (1) unit conversion — a US site sends pounds, a European site sends kilograms, and STRESN is what makes them comparable; (2) non-numeric results — a pregnancy test is POSITIVE, which lives happily in STRESC and must be null in STRESN. Then point at the orange box: in our mock study they DO all match, so trainees must not learn the wrong lesson from the data in front of them.");

// ============ 8. BASELINE FLAG ============
s = _add(); bg(s, WHITE);
header(s, "The baseline flag", "--BLFL: the variable every analysis leans on");
card(s, 0.7, 1.8, 7.4, 2.35, PAPER);
s.addText("What it means", { x: 1.0, y: 1.95, w: 6.8, h: 0.4, fontFace: HFONT, bold: true, fontSize: 18, color: INK, margin: 0 });
s.addText("“This is the LAST measurement taken before the subject was first treated.”",
  { x: 1.0, y: 2.4, w: 6.8, h: 0.5, fontFace: BFONT, italic: true, fontSize: 14, color: TEAL, margin: 0 });
s.addText("Almost every efficacy analysis is a CHANGE FROM BASELINE. If the flag is wrong, every treatment effect in the study is computed against the wrong starting point.",
  { x: 1.0, y: 2.95, w: 6.8, h: 0.9, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
card(s, 8.35, 1.8, 4.35, 2.35, "E7F4F2");
s.addText("Values", { x: 8.65, y: 1.95, w: 3.8, h: 0.35, fontFace: HFONT, bold: true, fontSize: 16, color: TEAL, margin: 0 });
s.addText([{ text: "“Y”", options: { fontFace: MONO, bold: true, fontSize: 15, color: INK } },
           { text: "   this record is the baseline", options: { fontSize: 12.5, color: MUTED } }],
  { x: 8.65, y: 2.42, w: 3.8, h: 0.4, fontFace: BFONT, valign: "middle", margin: 0 });
s.addText([{ text: "null", options: { fontFace: MONO, bold: true, fontSize: 15, color: INK } },
           { text: "   it is not", options: { fontSize: 12.5, color: MUTED } }],
  { x: 8.65, y: 2.88, w: 3.8, h: 0.4, fontFace: BFONT, valign: "middle", margin: 0 });
s.addText("⚠  There is no “N”. The flag is Y-or-blank, and a stray “N” is a conformance finding.",
  { x: 8.65, y: 3.35, w: 3.8, h: 0.7, fontFace: BFONT, bold: true, fontSize: 11.5, color: RUST, margin: 0 });

s.addText("In ABC-01 — the flag lands on BASELINE, never on SCREENING", { x: 0.7, y: 4.32, w: 12, h: 0.35,
  fontFace: BFONT, bold: true, fontSize: 12.5, color: TEAL, margin: 0 });
grid(s, 0.7, 4.7, [1.5, 1.5, 1.35, 1.25, 1.3, 1.3], [
  ["VISIT", "VSDTC", "VSDY", "SYSBP", "VSBLFL", "why"],
  ["SCREENING", "2024-02-20", "−10", "122", "(null)", "before, but not the last"],
  ["BASELINE", "2024-03-01", "1", "120", "Y", "last before first dose"],
  ["WEEK 4", "2024-03-28", "28", "118", "(null)", "after treatment started"],
], { fontSize: 11.5, align: [null, null, "center", "center", "center", null],
     highlight: (r, c) => r === 2 && c === 4 ? TEAL : null });
s.addText("Both SCREENING and BASELINE precede first dose — but only ONE record can carry the flag. It is the LAST one before treatment, not simply any earlier one.",
  { x: 0.7, y: 6.15, w: 12, h: 0.5, fontFace: BFONT, italic: true, fontSize: 13, color: INK, margin: 0 });
s.addText("40 of the 128 VS records carry VSBLFL = “Y” — 8 subjects × 5 tests at BASELINE (height isn't repeated).",
  { x: 0.7, y: 6.62, w: 12, h: 0.4, fontFace: BFONT, fontSize: 12, color: MUTED, margin: 0 });
s.addNotes("The trap: trainees flag everything before first dose, or flag SCREENING because it comes first. Emphasise LAST-before-treatment. In this tidy study the answer is always the BASELINE visit, which is exactly why they must learn the RULE rather than the shortcut — in real studies with unscheduled visits, repeated assessments and early dosing, the last pre-dose record is frequently NOT the visit labelled 'Baseline'. Note the flag is per subject PER TEST: 8 subjects x 5 tests = 40.");

// ============ 9. VISIT AND VISITNUM ============
s = _add(); bg(s, WHITE);
header(s, "Timing", "Two ways of saying when — and why you need both");
card(s, 0.7, 1.85, 5.9, 2.5, PAPER);
s.addText("VISIT", { x: 1.0, y: 2.02, w: 5.3, h: 0.45, fontFace: MONO, bold: true, fontSize: 20, color: TEAL, margin: 0 });
s.addText("The visit NAME, as the protocol calls it.", { x: 1.0, y: 2.5, w: 5.3, h: 0.35, fontFace: BFONT, bold: true, fontSize: 13, color: INK, margin: 0 });
s.addText("“SCREENING” · “BASELINE” · “WEEK 4”", { x: 1.0, y: 2.9, w: 5.3, h: 0.35, fontFace: MONO, fontSize: 12.5, color: MUTED, margin: 0 });
s.addText("Readable, but it sorts ALPHABETICALLY — which puts WEEK 4 before other weeks and BASELINE first by accident.",
  { x: 1.0, y: 3.32, w: 5.3, h: 0.85, fontFace: BFONT, fontSize: 12, color: RUST, margin: 0 });
card(s, 6.8, 1.85, 5.9, 2.5, "E7F4F2");
s.addText("VISITNUM", { x: 7.1, y: 2.02, w: 5.3, h: 0.45, fontFace: MONO, bold: true, fontSize: 20, color: SEA, margin: 0 });
s.addText("The visit's NUMBER in protocol order.", { x: 7.1, y: 2.5, w: 5.3, h: 0.35, fontFace: BFONT, bold: true, fontSize: 13, color: INK, margin: 0 });
s.addText("1 · 2 · 4", { x: 7.1, y: 2.9, w: 5.3, h: 0.35, fontFace: MONO, fontSize: 12.5, color: MUTED, margin: 0 });
s.addText("Numeric, so it sorts CHRONOLOGICALLY. This is what every analysis actually orders and groups by.",
  { x: 7.1, y: 3.32, w: 5.3, h: 0.85, fontFace: BFONT, fontSize: 12, color: TEAL, margin: 0 });
s.addText("The mapping is a lookup from the protocol — it is not derivable from the data", { x: 0.7, y: 4.5, w: 12, h: 0.35,
  fontFace: BFONT, bold: true, fontSize: 12.5, color: INK, margin: 0 });
grid(s, 0.7, 4.88, [2.6, 1.9, 7.5], [
  ["VISIT", "VISITNUM", "note"],
  ["SCREENING", "1", "up to 28 days before first dose"],
  ["BASELINE", "2", "day of first dose — carries VSBLFL"],
  ["WEEK 4", "4", "VISITNUM 3 is not used in VS or LB"],
], { fontSize: 11.5, align: [null, "center", null] });
s.addText("VISITNUM 3 is deliberately absent. Gaps are normal — the numbers come from the protocol's visit schedule, which may include visits where no vital signs or labs are taken. Never renumber them to close a gap.",
  { x: 0.7, y: 6.35, w: 12, h: 0.6, fontFace: BFONT, italic: true, fontSize: 12.5, color: TEAL, margin: 0 });
s.addNotes("The gap at 3 is a deliberate teaching device in our mock data — trainees WILL ask about it, and the answer is that VISITNUM belongs to the protocol schedule, not to this dataset. Renumbering to 1,2,3 would break comparability with every other domain in the study. Also stress that VISITNUM cannot be derived by sorting dates: an early or late visit still keeps its protocol number.");

// ============ 10. LB — WHAT'S EXTRA ============
s = _add(); bg(s, INK);
headerDark(s, "Lab data", "LB is VS plus reference ranges");
s.addText("LB raw arrives ALREADY TALL — one row per test — so there is no transpose. What it adds instead is the machinery for deciding whether a result is normal.",
  { x: 0.7, y: 1.75, w: 12, h: 0.5, fontFace: BFONT, fontSize: 13.5, color: "AFCBD3", margin: 0 });
const lbx = [
  ["LBCAT", "The panel the test belongs to", "HEMATOLOGY · CHEMISTRY", MINT],
  ["LBORNRLO / LBORNRHI", "Reference range low and high, in the ORIGINAL units", "12.0  …  17.0", SEA],
  ["LBSTNRLO / LBSTNRHI", "The same range in STANDARD units", "12.0  …  17.0", SEA],
  ["LBNRIND", "Where the result falls: derived, not collected", "NORMAL · LOW · HIGH", ACCENT],
];
let ly = 2.35;
lbx.forEach((r) => {
  s.addShape(p.ShapeType.roundRect, { x: 0.7, y: ly, w: 12.0, h: 0.85, rectRadius: 0.08,
    fill: { color: "163B4B" }, line: { color: r[3], width: 1.2 } });
  s.addText(r[0], { x: 1.0, y: ly + 0.2, w: 3.5, h: 0.45, fontFace: MONO, bold: true, fontSize: 13.5, color: r[3], valign: "middle", margin: 0 });
  s.addText(r[1], { x: 4.7, y: ly + 0.2, w: 5.2, h: 0.45, fontFace: BFONT, fontSize: 12.5, color: "DCEBEF", valign: "middle", margin: 0 });
  s.addText(r[2], { x: 10.0, y: ly + 0.2, w: 2.5, h: 0.45, fontFace: MONO, fontSize: 12, color: "AFCBD3", valign: "middle", margin: 0 });
  ly += 0.95;
});
codeBox(s, 0.7, 6.15, 12.0,
`if lbstresn < lbstnrlo then lbnrind = "LOW";
else if lbstresn > lbstnrhi then lbnrind = "HIGH";  else lbnrind = "NORMAL";`, ACCENT, "Deriving LBNRIND");
s.addNotes("Key framing: LB is NOT harder than VS, it is different — no transpose, but more qualifiers. Reference ranges come from the LAB, not the protocol, and in a multi-lab study they differ BY LAB, which is precisely why the standardised range exists. Note LBNRIND is derived, so it must be reproducible from the range and the result — a mismatch between them is a standard validation check.");

// ============ 11. THE ONE ABNORMAL RESULT ============
s = _add(); bg(s, WHITE);
header(s, "Reading a lab result", "47 normal results, and one that isn't");
grid(s, 0.7, 1.85, [2.15, 1.3, 1.2, 1.1, 1.15, 1.15, 1.25, 1.35, 1.35], [
  ["USUBJID", "VISIT", "TESTCD", "ORRES", "NRLO", "NRHI", "NRIND", "LBCAT", "LBDY"],
  ["ABC-01-01-003", "BASELINE", "ALT", "24", "7", "56", "NORMAL", "CHEMISTRY", "1"],
  ["ABC-01-01-003", "WEEK 4", "ALT", "72", "7", "56", "HIGH", "CHEMISTRY", "28"],
], { mono: true, fontSize: 11, align: [null, null, null, "center", "center", "center", "center", null, "center"],
     highlight: (r, c) => r === 2 && (c === 3 || c === 6) ? "C0455B" : null });
card(s, 0.7, 3.15, 5.9, 2.05, PAPER);
s.addText("What the data says", { x: 1.0, y: 3.3, w: 5.3, h: 0.35, fontFace: HFONT, bold: true, fontSize: 16, color: INK, margin: 0 });
s.addText("Subject ABC-01-01-003's ALT (a liver enzyme) was 24 at Baseline — comfortably normal — and 72 at Week 4, above the upper limit of 56.\n\nLBNRIND is HIGH because the result exceeds LBSTNRHI. That is arithmetic, not judgement.",
  { x: 1.0, y: 3.68, w: 5.3, h: 1.4, fontFace: BFONT, fontSize: 12.5, color: MUTED, lineSpacing: 16, margin: 0 });
card(s, 6.8, 3.15, 5.9, 2.05, "FDF1E7");
s.addText("What the data does NOT say", { x: 7.1, y: 3.3, w: 5.3, h: 0.35, fontFace: HFONT, bold: true, fontSize: 16, color: RUST, margin: 0 });
s.addText("That the subject was harmed. “HIGH” is a range comparison, nothing more.\n\nWhether an abnormal lab is CLINICALLY SIGNIFICANT is a physician's judgement, recorded separately — and if it is, it becomes an adverse event in AE.",
  { x: 7.1, y: 3.68, w: 5.3, h: 1.45, fontFace: BFONT, fontSize: 12.5, color: INK, lineSpacing: 16, margin: 0 });
card(s, 0.7, 5.4, 12.0, 1.55, "E7F4F2");
s.addText("The programmer's line", { x: 1.0, y: 5.55, w: 11.4, h: 0.35, fontFace: HFONT, bold: true, fontSize: 16, color: TEAL, margin: 0 });
s.addText("You derive LBNRIND. You do NOT decide clinical significance, and you never create an adverse event because a lab value looks bad. That subject has no ALT-related AE in ABC-01 — and inventing one to “make the data consistent” would be fabricating a safety finding.",
  { x: 1.0, y: 5.95, w: 11.4, h: 0.9, fontFace: BFONT, fontSize: 13, color: INK, margin: 0 });
s.addNotes("This slide does double duty: it teaches the NRIND derivation and it draws a professional boundary. Trainees from a clinical background often want to interpret; trainees from a coding background often want to 'fix' the inconsistency between a HIGH lab and no matching AE. Both instincts are wrong. State plainly: the investigator decides clinical significance, and if it is significant they raise an AE. Absence of an AE here is a legitimate outcome, not missing data.");

// ============ 12. THE RENAME TRAP ============
s = _add(); bg(s, WHITE);
header(s, "Controlled terminology", "The lab test name you were sent is not the one you submit");
grid(s, 0.7, 1.9, [3.7, 1.6, 3.6, 3.1], [
  ["RAW LBTEST (from the lab)", "LBTESTCD", "SDTM LBTEST (CDISC CT)", "same?"],
  ["Hemoglobin", "HGB", "Hemoglobin", "yes"],
  ["Hematocrit", "HCT", "Hematocrit", "yes"],
  ["White Blood Cells", "WBC", "Leukocytes", "NO — renamed"],
  ["Platelets", "PLAT", "Platelets", "yes"],
  ["Alanine Aminotransferase", "ALT", "Alanine Aminotransferase", "yes"],
  ["Creatinine", "CREAT", "Creatinine", "yes"],
], { fontSize: 11.5, align: [null, "center", null, "center"],
     highlight: (r, c) => r === 3 ? (c === 2 || c === 3 ? "C0455B" : INK) : null });
card(s, 0.7, 4.55, 12.0, 1.15, "FDF1E7");
s.addText([{ text: "“White Blood Cells” is what the lab calls it. “Leukocytes” is what CDISC calls it. ", options: { bold: true, color: INK } },
           { text: "Five of six pass straight through, so a programmer who spot-checks two rows concludes the column maps 1-to-1 — and ships the sixth wrong.", options: { color: INK } }],
  { x: 1.0, y: 4.68, w: 11.4, h: 0.9, fontFace: BFONT, fontSize: 13, valign: "middle", margin: 0 });
s.addText("Both columns are controlled terminology — check both", { x: 0.7, y: 5.95, w: 12, h: 0.35,
  fontFace: BFONT, bold: true, fontSize: 13, color: TEAL, margin: 0 });
s.addText("LBTESTCD is the short code (max 8 characters, no spaces) and LBTEST is the full name. Both come from the CDISC LBTESTCD/LBTEST codelists, and they are PAIRED — you cannot mix a code from the list with a name of your own. Look every test up; never translate by eye.",
  { x: 0.7, y: 6.32, w: 12, h: 0.75, fontFace: BFONT, fontSize: 12.5, color: MUTED, margin: 0 });
s.addNotes("This is the CT lesson that sticks, because the failure mode is so ordinary: the mapping mostly works. Tell them the general rule — when a codelist exists, LOOK IT UP, every value, every time. Spot-checking is how the one exception survives to production. Also flag the 8-character limit on --TESTCD: it is why WBC and PLAT are abbreviated while ALT already fits.");

// ============ 13. VS vs LB SIDE BY SIDE ============
s = _add(); bg(s, WHITE);
header(s, "The two you're about to build", "Same class, different challenges");
grid(s, 0.7, 1.9, [3.1, 4.45, 4.45], [
  ["", "VS  ·  Notebook 08", "LB  ·  Notebook 09"],
  ["Raw shape", "WIDE — 1 row per visit, 6 value columns", "TALL — already 1 row per test"],
  ["Main challenge", "the transpose", "reference ranges and CT lookups"],
  ["Raw rows", "24", "48"],
  ["SDTM rows", "128", "48"],
  ["Tests", "6 (height only at screening)", "6 across 2 panels"],
  ["Visits", "SCREENING, BASELINE, WEEK 4", "BASELINE, WEEK 4"],
  ["Baseline flags", "40", "24"],
  ["Derived qualifier", "VSBLFL", "LBBLFL, LBCAT, LBNRIND"],
  ["Watch out for", "OUTPUT inside the loop; height's missing values", "“White Blood Cells” → Leukocytes"],
], { fontSize: 11.5, rowH: 0.42,
     highlight: (r, c) => (r === 4 || r === 9) && c > 0 ? TEAL : null });
s.addText("Note the row counts: VS goes from 24 raw rows to 128 SDTM rows, while LB stays at 48. That difference IS the transpose.",
  { x: 0.7, y: 6.5, w: 12, h: 0.5, fontFace: BFONT, italic: true, fontSize: 13.5, color: TEAL, margin: 0 });
s.addNotes("Use this as the bridge into the notebooks. The 24 -> 128 vs 48 -> 48 contrast is the cleanest single number that captures what the transpose does. Work out 128 with them: 8 subjects x 3 visits x 5 repeated tests = 120, plus 8 height records collected once at screening = 128. If a trainee's VS comes out at 144 they flagged height at every visit; at 24 they put OUTPUT outside the loop.");

// ============ 14. MISTAKES ============
s = _add(); bg(s, INK);
headerDark(s, "Before you start", "The five that cost the most time");
const mistakes = [
  ["OUTPUT after the loop", "You get 1 row per visit instead of 6. The dataset looks fine until you count it.", "count your rows first, always"],
  ["Arrays out of order", "The value array and the test-code array must line up exactly, or every pulse is labelled a temperature.", "read the two ARRAY statements side by side"],
  ["Rows for values that weren't measured", "Height is collected once. Emitting a blank HEIGHT row at every visit inflates the domain with nothing.", "test NOT MISSING before OUTPUT"],
  ["Flagging baseline on SCREENING", "--BLFL is the LAST record before first dose, not the first record in the study.", "check it lands on exactly one record per subject per test"],
  ["Translating test names by eye", "Five of six lab tests map straight through. The sixth does not.", "look up every value in the codelist"],
];
let my = 1.95;
mistakes.forEach((m, i) => {
  s.addShape(p.ShapeType.roundRect, { x: 0.7, y: my, w: 12.0, h: 0.94, rectRadius: 0.08,
    fill: { color: i % 2 ? "163B4B" : "1A4152" }, line: { color: "24576B", width: 1 } });
  circle(s, 0.95, my + 0.2, 0.54, [ROSE, ACCENT, SEA, TEAL, MINT][i], String(i + 1), i === 4 ? INK : WHITE, 15);
  s.addText(m[0], { x: 1.68, y: my + 0.12, w: 3.9, h: 0.38, fontFace: BFONT, bold: true, fontSize: 13.5, color: WHITE, margin: 0 });
  s.addText(m[1], { x: 1.68, y: my + 0.5, w: 7.3, h: 0.38, fontFace: BFONT, fontSize: 11.5, color: "AFCBD3", margin: 0 });
  s.addText("→ " + m[2], { x: 9.2, y: my + 0.28, w: 3.3, h: 0.42, fontFace: BFONT, italic: true, fontSize: 11.5, color: MINT, valign: "middle", margin: 0 });
  my += 1.02;
});
s.addText("Next:  Notebook 08 · Build the VS Domain   →   Notebook 09 · Build the LB Domain",
  { x: 0.7, y: 6.85, w: 12, h: 0.4, fontFace: BFONT, bold: true, fontSize: 13, color: MINT, margin: 0 });
s.addNotes("Send them into the notebook with mistake 1 ringing in their ears — it is the one that produces a plausible-looking wrong answer, which is always the most expensive kind. The right-hand column is a checklist they can run against their own output before comparing to the reference.");

p.writeFile({ fileName: "/Volumes/D Drive/SDTM Training/Bootcamp/presentations/07_findings_domains.pptx" })
  .then(f => console.log("WROTE", f));
