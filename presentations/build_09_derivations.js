// Build: 09_derivations.pptx — "Derivations: Study Day, --SEQ and Timing"
// Bootcamp Module 09. Concept deck for Day 8.
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "Clinical Programming Bootcamp";
p.title = "Derivations: Study Day, --SEQ and Timing";

const INK = "0F2E3D", TEAL = "0E7C86", SEA = "1FA8A0", MINT = "6FC8B4",
      ACCENT = "E8833A", WHITE = "FFFFFF", PAPER = "F3F7F8",
      MUTED = "5A7682", LINE = "CFDEE1", CODEBG = "13323F",
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
s.addShape(p.ShapeType.ellipse, { x: 10.7, y: -0.6, w: 3.2, h: 3.2, fill: { color: TEAL }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.45, y: 0.15, w: 1.7, h: 1.7, fill: { color: MINT }, line: { type: "none" } });
s.addText("CLINICAL PROGRAMMING BOOTCAMP  ·  MODULE 09", { x: 0.7, y: 2.0, w: 9, h: 0.4,
  fontFace: BFONT, fontSize: 14, bold: true, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Derivations", { x: 0.66, y: 2.5, w: 9.6, h: 1.1,
  fontFace: HFONT, fontSize: 44, bold: true, color: WHITE, margin: 0 });
s.addText("Study day, --SEQ, and the shape of study time", { x: 0.7, y: 3.7, w: 9.6, h: 0.6,
  fontFace: HFONT, fontSize: 22, color: MINT, margin: 0 });
s.addText("You have derived --DY and --SEQ in six domains already. This module turns six separate habits into one rule you can apply anywhere.",
  { x: 0.7, y: 4.5, w: 9.2, h: 0.9, fontFace: BFONT, fontSize: 16, color: "C7DCE0", margin: 0 });
s.addText("Hands-on: Notebook 11 · Deriving --DY and --SEQ (SAS)",
  { x: 0.7, y: 6.5, w: 12, h: 0.4, fontFace: BFONT, fontSize: 12, italic: true, color: MUTED, margin: 0 });
s.addNotes("Module 09. This is a consolidation module, not new material — every derivation here has been used already. The value is in seeing that AE, CM, VS, LB, DS and EX all used ONE formula, and in the edge cases the tidy mock data has not shown them.");

// ============ 2. THE ANCHOR ============
s = _add(); bg(s, WHITE);
header(s, "Everything hangs off one date", "RFSTDTC — the reference start date");
s.addShape(p.ShapeType.roundRect, { x: 4.5, y: 1.75, w: 4.4, h: 0.85, rectRadius: 0.1, fill: { color: INK }, line: { type: "none" } });
s.addText("EX.EXSTDTC  (first dose)", { x: 4.5, y: 1.75, w: 4.4, h: 0.85, align: "center", valign: "middle",
  fontFace: MONO, bold: true, fontSize: 14, color: WHITE, margin: 0 });
s.addText("▼", { x: 6.35, y: 2.62, w: 0.7, h: 0.3, align: "center", fontSize: 14, color: TEAL, margin: 0 });
s.addShape(p.ShapeType.roundRect, { x: 4.5, y: 2.92, w: 4.4, h: 0.85, rectRadius: 0.1, fill: { color: TEAL }, line: { type: "none" } });
s.addText("DM.RFSTDTC", { x: 4.5, y: 2.92, w: 4.4, h: 0.85, align: "center", valign: "middle",
  fontFace: MONO, bold: true, fontSize: 16, color: WHITE, margin: 0 });
const fan = [["AE", "AESTDY"], ["CM", "CMSTDY"], ["EX", "EXSTDY"], ["VS", "VSDY"], ["LB", "LBDY"], ["DS", "DSSTDY"]];
fan.forEach((f, i) => {
  const x = 0.75 + i * 2.05;
  s.addShape(p.ShapeType.roundRect, { x, y: 4.5, w: 1.85, h: 0.95, rectRadius: 0.08, fill: { color: PAPER }, line: { color: SEA, width: 1.5 } });
  s.addText(f[0], { x, y: 4.6, w: 1.85, h: 0.35, align: "center", fontFace: HFONT, bold: true, fontSize: 15, color: INK, margin: 0 });
  s.addText(f[1], { x, y: 4.98, w: 1.85, h: 0.35, align: "center", fontFace: MONO, fontSize: 11.5, color: SEA, margin: 0 });
});
s.addText("▼   ▼   ▼   ▼   ▼   ▼", { x: 0.7, y: 4.05, w: 12.0, h: 0.35, align: "center", fontSize: 13, color: SEA, charSpacing: 28, margin: 0 });
card(s, 0.7, 5.75, 12.0, 1.15, "FDF1E7");
s.addText([{ text: "One date, 226 derived values.  ", options: { bold: true, color: RUST } },
           { text: "In ABC-01 there are 226 --DY values across six domains, and every one is measured from that subject's own RFSTDTC. An EX date that is wrong by a day shifts the entire study timeline — and shifts it CONSISTENTLY, so no within-domain check will ever catch it.", options: { color: INK } }],
  { x: 1.0, y: 5.9, w: 11.4, h: 0.9, fontFace: BFONT, fontSize: 13, valign: "middle", margin: 0 });
s.addNotes("226 is the real count from the study data: AE 10, CM 8, EX 8, VS 128, LB 48, DS 24. The consistency point is the important one — a wrong RFSTDTC produces a study that is internally perfectly consistent and globally wrong, which is why cross-domain checks exist as their own validation category.");

// ============ 3. THE FORMULA ============
s = _add(); bg(s, INK);
headerDark(s, "The rule", "One formula, two branches, no Day 0");
codeBox(s, 0.7, 1.8, 12.0,
`if  --DTC >= RFSTDTC   then   --DY = (--DTC - RFSTDTC) + 1;    /* on or after */
else                          --DY = (--DTC - RFSTDTC);        /* before      */`, MINT, "The only study-day rule you need");
s.addText("Why the asymmetry? Because Day 0 does not exist.", { x: 0.7, y: 3.5, w: 12, h: 0.4,
  fontFace: HFONT, bold: true, fontSize: 18, color: WHITE, margin: 0 });
const tl = [["−3", "−2", "−1", "1", "2", "3"], ["", "", "day before", "FIRST DOSE", "", ""]];
tl[0].forEach((d, i) => {
  const on = d === "1";
  const x = 1.6 + i * 1.75;
  s.addShape(p.ShapeType.roundRect, { x, y: 4.15, w: 1.5, h: 0.95, rectRadius: 0.08,
    fill: { color: on ? MINT : "1A4152" }, line: { color: on ? MINT : "24576B", width: on ? 2 : 1 } });
  s.addText(d, { x, y: 4.15, w: 1.5, h: 0.95, align: "center", valign: "middle",
    fontFace: MONO, bold: true, fontSize: 20, color: on ? INK : WHITE, margin: 0 });
  if (tl[1][i]) s.addText(tl[1][i], { x: x - 0.2, y: 5.15, w: 1.9, h: 0.3, align: "center",
    fontFace: BFONT, bold: on, fontSize: 10.5, color: on ? MINT : "AFCBD3", margin: 0 });
});
s.addText("There is no box between −1 and 1.", { x: 0.7, y: 5.6, w: 12, h: 0.35, align: "center",
  fontFace: BFONT, bold: true, fontSize: 14, color: ACCENT, margin: 0 });
card(s, 0.7, 6.05, 12.0, 1.15, "1A4152");
s.addText("Proof from your own data", { x: 1.0, y: 6.18, w: 11.4, h: 0.3, fontFace: HFONT, bold: true, fontSize: 14, color: MINT, margin: 0 });
s.addText("Across all 226 --DY values in ABC-01 — including 61 negative ones — there is not a single zero. That is not luck: the \"+ 1\" on one branch only is what enforces it. If a 0 ever appears in your output, one branch is missing its + 1.",
  { x: 1.0, y: 6.5, w: 11.4, h: 0.6, fontFace: BFONT, fontSize: 12.5, color: "DCEBEF", margin: 0 });
s.addNotes("61 negatives and 0 zeros are the real counts. Walk the arithmetic: if the dates are equal, diff is 0 and the +1 makes Day 1. The day before gives diff -1 and no +1, so Day -1. The gap is structural. Make them write the formula from memory before showing it.");

// ============ 4. WHERE NEGATIVES ARE NORMAL ============
s = _add(); bg(s, WHITE);
header(s, "Negative is not an error", "It depends entirely on what the domain collects");
grid(s, 0.7, 1.85, [1.5, 1.5, 2.1, 1.4, 5.5], [
  ["Domain", "Variable", "Range in ABC-01", "Negative", "Why"],
  ["EX", "EXSTDY", "1 … 1", "0", "dosing defines Day 1 — it cannot precede itself"],
  ["LB", "LBDY", "1 … 29", "0", "no screening blood draw in this protocol"],
  ["AE", "AESTDY", "−5 … 20", "1", "collected from consent — one screening event"],
  ["CM", "CMSTDY", "−96 … 15", "4", "prior medications go back months"],
  ["DS", "DSSTDY", "−11 … 28", "8", "informed consent precedes dosing for everyone"],
  ["VS", "VSDY", "−11 … 29", "48", "screening visit vitals for all 8 subjects"],
], { fontSize: 11.5, rowH: 0.38,
     highlight: (r, c) => (r === 4 || r === 6) && c === 3 ? "C0455B" : null });
card(s, 0.7, 4.85, 5.9, 2.0, "E7F4F2");
s.addText("Expect negatives", { x: 1.0, y: 5.0, w: 5.3, h: 0.35, fontFace: HFONT, bold: true, fontSize: 16, color: TEAL, margin: 0 });
s.addText("CM · prior medications, often months before\nVS · screening assessments\nDS · the informed-consent milestone\nAE · screening-period events",
  { x: 1.0, y: 5.4, w: 5.3, h: 1.3, fontFace: BFONT, fontSize: 12.5, color: INK, lineSpacing: 17, margin: 0 });
card(s, 6.8, 4.85, 5.9, 2.0, "FDECEE");
s.addText("Question a negative", { x: 7.1, y: 5.0, w: 5.3, h: 0.35, fontFace: HFONT, bold: true, fontSize: 16, color: ROSE, margin: 0 });
s.addText("EX · a dose before first dose is impossible\nLB · only if the protocol has no screening draw\n\nA rule that flags EVERY negative --DY as an error would fire on 61 perfectly valid records here.",
  { x: 7.1, y: 5.4, w: 5.3, h: 1.4, fontFace: BFONT, fontSize: 12.5, color: INK, lineSpacing: 17, margin: 0 });
s.addNotes("Every number on this slide is real. The teaching point is that 'is a negative study day wrong?' has no universal answer — it depends on what the CRF collects, which you learn from the protocol and the spec, not from the data. CM at -96 is a diabetes medication started three months before screening.");

// ============ 5. --SEQ ============
s = _add(); bg(s, WHITE);
header(s, "The other derivation", "--SEQ: making every record addressable");
card(s, 0.7, 1.8, 12.0, 1.25, PAPER);
s.addText("What it is for", { x: 1.0, y: 1.92, w: 11.4, h: 0.35, fontFace: HFONT, bold: true, fontSize: 16, color: INK, margin: 0 });
s.addText("USUBJID identifies the subject. --SEQ identifies WHICH RECORD within that subject and domain. Together they are the key that lets anything else — SUPPQUAL, RELREC, a query, a reviewer's note — point at one specific row.",
  { x: 1.0, y: 2.3, w: 11.4, h: 0.65, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
grid(s, 0.7, 3.25, [1.6, 1.7, 1.9, 2.2, 4.6], [
  ["Domain", "Subjects", "Max --SEQ", "Rows per subject", "What --SEQ counts"],
  ["EX", "8", "1", "1", "one dosing period each"],
  ["AE", "6", "2", "1–2", "adverse events"],
  ["CM", "7", "2", "1–2", "medications"],
  ["DS", "8", "3", "3", "disposition milestones"],
  ["LB", "4", "12", "12", "6 tests × 2 visits"],
  ["VS", "8", "16", "16", "6 tests at screening + 5 × 2 later visits"],
], { fontSize: 11.5, rowH: 0.38 });
card(s, 0.7, 6.0, 12.0, 0.9, "E7F4F2");
s.addText([{ text: "--SEQ restarts at 1 for every subject.  ", options: { bold: true, color: TEAL } },
           { text: "It is not a row number for the dataset. Note only 4 subjects appear in LB and 6 in AE — a subject with no records in a domain simply is not there.", options: { color: INK } }],
  { x: 1.0, y: 6.12, w: 11.4, h: 0.7, fontFace: BFONT, fontSize: 13, valign: "middle", margin: 0 });
s.addNotes("All real counts. VS at 16 is the one to dwell on: 6 tests at screening plus 5 at each of two later visits. Ask them to compute it before revealing. The differing subject counts per domain reinforce that domains are not required to be complete across the study.");

// ============ 6. THE SORT IS THE DERIVATION ============
s = _add(); bg(s, INK);
headerDark(s, "The part people get wrong", "--SEQ is only as reproducible as your sort");
codeBox(s, 0.7, 1.8, 12.0,
`proc sort data = ae_work;
    by usubjid aestdtc aeterm;      /* <-- the TIEBREAKER is the point */
run;

data ae;
    set ae_work;
    by usubjid;
    retain aeseq;
    if first.usubjid then aeseq = 1;   /* restart for each subject */
    else                  aeseq + 1;
run;`, ACCENT, "The pattern used in every domain");
card(s, 0.7, 5.15, 5.9, 1.75, "3A2530");
s.addText("⚠  Sorting by date alone", { x: 1.0, y: 5.28, w: 5.3, h: 0.35, fontFace: HFONT, bold: true, fontSize: 15, color: "FF9DAE", margin: 0 });
s.addText("Two events on the same day have no defined order, so SAS may emit them either way. Re-run the program and AESEQ 1 and 2 can swap — and every SUPPQUAL row that pointed at AESEQ 1 now points at the other event.",
  { x: 1.0, y: 5.68, w: 5.3, h: 1.1, fontFace: BFONT, fontSize: 12, color: "F0D6DB", lineSpacing: 15, margin: 0 });
card(s, 6.8, 5.15, 5.9, 1.75, "1A4152");
s.addText("Deterministic sort", { x: 7.1, y: 5.28, w: 5.3, h: 0.35, fontFace: HFONT, bold: true, fontSize: 15, color: MINT, margin: 0 });
s.addText("Add a tiebreaker that cannot tie: date THEN term. Now the same input always gives the same --SEQ, on any machine, in any SAS version — which is what makes a re-run comparable to the original.",
  { x: 7.1, y: 5.68, w: 5.3, h: 1.1, fontFace: BFONT, fontSize: 12, color: "DCEBEF", lineSpacing: 15, margin: 0 });
s.addNotes("This is the subtlest idea in the module. The failure mode is horrible in practice: a QC programmer re-runs your code, gets different AESEQ values, and cannot tell whether the data changed or the program is unstable. Sort orders used in this study: AE/CM by start date then term; VS/LB by visit then the CRF's test order.");

// ============ 7. EPOCH ============
s = _add(); bg(s, WHITE);
header(s, "Naming the periods", "EPOCH — which phase of the trial a record belongs to");
s.addText("--DY tells you WHEN relative to first dose. EPOCH tells you WHICH PART of the trial that was.",
  { x: 0.7, y: 1.72, w: 12, h: 0.4, fontFace: BFONT, fontSize: 14, color: MUTED, margin: 0 });
const ep = [["SCREENING", "consent → first dose", "--DY < 1", "AE sore throat (−5) · VS screening (−11…−9)", SEA],
            ["TREATMENT", "first dose → last dose", "1 ≤ --DY ≤ end of dosing", "most of the study's records", TEAL],
            ["FOLLOW-UP", "after last dose", "--DY > end of dosing", "the Week 4 visit for some subjects", ACCENT]];
let ey = 2.25;
ep.forEach((e) => {
  card(s, 0.7, ey, 12.0, 1.3, PAPER);
  s.addShape(p.ShapeType.rect, { x: 0.7, y: ey, w: 0.09, h: 1.3, fill: { color: e[4] }, line: { type: "none" } });
  s.addText(e[0], { x: 1.0, y: ey + 0.18, w: 2.5, h: 0.4, fontFace: HFONT, bold: true, fontSize: 17, color: e[4], margin: 0 });
  s.addText(e[1], { x: 1.0, y: ey + 0.62, w: 2.6, h: 0.35, fontFace: BFONT, fontSize: 11.5, color: MUTED, margin: 0 });
  s.addText(e[2], { x: 3.8, y: ey + 0.3, w: 3.0, h: 0.5, fontFace: MONO, fontSize: 12.5, color: INK, valign: "middle", margin: 0 });
  s.addText(e[3], { x: 7.1, y: ey + 0.3, w: 5.3, h: 0.6, fontFace: BFONT, fontSize: 12, color: MUTED, valign: "middle", margin: 0 });
  ey += 1.42;
});
card(s, 0.7, 6.55, 12.0, 0.85, "FDF1E7");
s.addText([{ text: "ABC-01 does not populate EPOCH.  ", options: { bold: true, color: RUST } },
           { text: "It is Permissible, and this study is small enough not to need it. Know that it exists and that it is derived from the same reference dates — you will meet it the moment you work on a study with multiple treatment periods.", options: { color: INK } }],
  { x: 1.0, y: 6.65, w: 11.4, h: 0.65, fontFace: BFONT, fontSize: 12.5, valign: "middle", margin: 0 });
s.addNotes("Be honest that EPOCH is absent from our data rather than pretending otherwise — trainees will look for it. The reason it matters: in a crossover or multi-period study, --DY alone cannot tell you which treatment the subject was on when an event happened; EPOCH can.");

// ============ 8. MISTAKES ============
s = _add(); bg(s, INK);
headerDark(s, "Before Notebook 11", "Five ways to get timing wrong");
const m09 = [
  ["A study day of 0", "One branch is missing its + 1. There is no Day 0.", "check: no --DY equals 0"],
  ["Treating negatives as errors", "61 of the 226 --DY values here are legitimately negative.", "ask what the CRF collects"],
  ["--DY from a study-wide date", "Each subject has their own RFSTDTC. Screening ranges −11 to −9.", "always per subject"],
  ["--SEQ numbered across the dataset", "It restarts at 1 for every subject.", "by usubjid; if first.usubjid"],
  ["Sorting without a tiebreaker", "Same-day records can swap between runs, breaking every SUPP link.", "sort by date THEN term"],
];
let my9 = 2.0;
m09.forEach((m, i) => {
  s.addShape(p.ShapeType.roundRect, { x: 0.7, y: my9, w: 12.0, h: 0.94, rectRadius: 0.08,
    fill: { color: i % 2 ? "163B4B" : "1A4152" }, line: { color: "24576B", width: 1 } });
  circle(s, 0.95, my9 + 0.2, 0.54, [ROSE, ACCENT, SEA, TEAL, MINT][i], String(i + 1), i === 4 ? INK : WHITE, 15);
  s.addText(m[0], { x: 1.68, y: my9 + 0.12, w: 4.2, h: 0.38, fontFace: BFONT, bold: true, fontSize: 13.5, color: WHITE, margin: 0 });
  s.addText(m[1], { x: 1.68, y: my9 + 0.5, w: 7.0, h: 0.38, fontFace: BFONT, fontSize: 11.5, color: "AFCBD3", margin: 0 });
  s.addText("→ " + m[2], { x: 9.0, y: my9 + 0.28, w: 3.5, h: 0.42, fontFace: BFONT, italic: true, fontSize: 11.5, color: MINT, valign: "middle", margin: 0 });
  my9 += 1.02;
});
s.addText("Next:  Notebook 11 · Deriving --DY and --SEQ   →   Day 9 · Validation",
  { x: 0.7, y: 6.85, w: 12, h: 0.4, fontFace: BFONT, bold: true, fontSize: 13, color: MINT, margin: 0 });
s.addNotes("Mistake 5 is the one they have not met yet, because our sorts already include tiebreakers. Notebook 11 has them remove one and watch the sequence numbers move.");

p.writeFile({ fileName: "/Volumes/D Drive/SDTM Training/Bootcamp/presentations/09_derivations.pptx" })
  .then(f => console.log("WROTE", f));
