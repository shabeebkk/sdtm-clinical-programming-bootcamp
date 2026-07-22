// Build: 16_bds_advs.pptx — "Basic Data Structure: One Row per Subject per Parameter per Visit"
// Bootcamp Module 16. Third deck of the ADaM track. Concept deck for ADVS and BDS.
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "Clinical Programming Bootcamp";
p.title = "Basic Data Structure: One Row per Subject per Parameter per Visit";

const INK = "0F2E3D", TEAL = "0E7C86", SEA = "1FA8A0", MINT = "6FC8B4",
      ACCENT = "E8833A", WHITE = "FFFFFF", PAPER = "F3F7F8",
      MUTED = "5A7682", LINE = "CFDEE1", CODEBG = "13323F", WARN = "C4442E";
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
s.addText("CLINICAL PROGRAMMING BOOTCAMP  ·  MODULE 16", { x: 0.7, y: 2.0, w: 9, h: 0.4,
  fontFace: BFONT, fontSize: 14, bold: true, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Basic Data\nStructure", { x: 0.66, y: 2.5, w: 9.6, h: 1.7,
  fontFace: HFONT, fontSize: 44, bold: true, color: WHITE, lineSpacing: 48, margin: 0 });
s.addText("One row per subject per parameter per visit", { x: 0.7, y: 4.15, w: 9.6, h: 0.6,
  fontFace: HFONT, fontSize: 24, color: MINT, margin: 0 });
s.addText("The shape behind nearly every efficacy dataset you will ever build.",
  { x: 0.7, y: 5.0, w: 9.2, h: 0.8, fontFace: BFONT, fontSize: 16, color: "C7DCE0", margin: 0 });
s.addText("Hands-on: Notebook 16 (SAS) — Build ADVS",
  { x: 0.7, y: 6.5, w: 12, h: 0.4, fontFace: BFONT, fontSize: 12, italic: true, color: MUTED, margin: 0 });
s.addNotes("Module 16. Learn this skeleton properly and ADLB tomorrow is the same thing plus three columns. Emphasise that BDS is the workhorse — if they only remember one ADaM structure after the course, it should be this one.");

// ============ 2. GOALS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Module goals", "By the end of this module you can…");
const goals = [
  ["Build the BDS skeleton", "PARAMCD / PARAM / PARAMN, AVAL, AVISIT — and say what each is for."],
  ["Distinguish AVISIT from VISIT", "and explain why a study keeps both."],
  ["Add a derived parameter", "and know why DTYPE and SRCDOM stay empty on it."],
  ["Derive BASE, CHG and PCHG", "including the two rules that quietly bias results."],
  ["Use ANL01FL", "to exclude records without deleting them."],
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
s.addNotes("Goal 4 is where the silent bugs live. Goal 3 is the one that generates arguments in real teams.");

// ============ 3. THE SHAPE ============
s = p.addSlide(); bg(s, WHITE);
header(s, "The shape", "SDTM VS is already tall — BDS re-labels it for analysis");
s.addText("One subject, one parameter, three visits — and the columns a table needs, already on the row.",
  { x: 0.7, y: 1.55, w: 12, h: 0.4, fontFace: BFONT, fontSize: 14, color: MUTED, margin: 0 });

const hdrs = ["PARAMCD", "AVISIT", "ADY", "AVAL", "ABLFL", "BASE", "CHG", "ANL01FL"];
const dataRows = [
  ["SYSBP", "Screening", "-10", "122", "", "120", "", ""],
  ["SYSBP", "Baseline", "1", "120", "Y", "120", "", "Y"],
  ["SYSBP", "Week 4", "28", "118", "", "120", "-2", "Y"],
];
let colx = [0.7, 2.35, 4.15, 5.5, 6.75, 8.1, 9.4, 10.7];
let colw = [1.6, 1.75, 1.3, 1.2, 1.3, 1.25, 1.25, 1.9];
s.addShape(p.ShapeType.rect, { x: 0.7, y: 2.2, w: 11.9, h: 0.5, fill: { color: INK }, line: { type: "none" } });
hdrs.forEach((h, i) => {
  s.addText(h, { x: colx[i], y: 2.2, w: colw[i], h: 0.5, valign: "middle", align: "center",
    fontFace: MONO, bold: true, fontSize: 11.5, color: WHITE, margin: 0 });
});
let dry = 2.7;
dataRows.forEach((r, ri) => {
  s.addShape(p.ShapeType.rect, { x: 0.7, y: dry, w: 11.9, h: 0.52,
    fill: { color: ri === 1 ? "E8F4F1" : WHITE }, line: { color: LINE, width: 0.5 } });
  r.forEach((v, i) => {
    s.addText(v, { x: colx[i], y: dry, w: colw[i], h: 0.52, valign: "middle", align: "center",
      fontFace: MONO, fontSize: 11.5, bold: (i === 4 && v === "Y"), color: (i === 4 && v === "Y") ? TEAL : INK, margin: 0 });
  });
  dry += 0.52;
});
s.addText("Screening was collected and is KEPT — it is simply not flagged for analysis.",
  { x: 0.7, y: 4.45, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 13.5, color: MUTED, margin: 0 });

card(s, 0.7, 5.0, 12.0, 1.75, PAPER);
s.addText("Three variables carry the parameter — and they must be one-to-one", { x: 1.0, y: 5.16, w: 11.4, h: 0.4,
  fontFace: HFONT, bold: true, fontSize: 16, color: INK, margin: 0 });
s.addText([
  { text: "PARAMCD  ", options: { fontFace: MONO, bold: true, color: TEAL } },
  { text: "the short key you subset on\n" },
  { text: "PARAM    ", options: { fontFace: MONO, bold: true, color: TEAL } },
  { text: "what prints as the row label — so it carries the UNIT\n" },
  { text: "PARAMN   ", options: { fontFace: MONO, bold: true, color: TEAL } },
  { text: "what controls print ORDER — without it, Diastolic sorts above Systolic" },
], { x: 1.0, y: 5.6, w: 11.4, h: 1.1, fontFace: BFONT, fontSize: 13.5, color: MUTED, lineSpacing: 20, margin: 0 });
s.addNotes("Point at the BASE column on the Screening row: BASE is on EVERY row of the parameter, not just the baseline row. That two-different-scopes idea is what the notebook implements with two separate merges, and it is the single most common place trainees get stuck.");

// ============ 4. AVISIT vs VISIT ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Visits", "AVISIT is an analysis visit, not a collected one");
card(s, 0.7, 1.8, 5.9, 2.3, PAPER);
s.addText("What the CRF collected", { x: 1.0, y: 1.98, w: 5.3, h: 0.4, fontFace: HFONT, bold: true, fontSize: 17, color: MUTED, margin: 0 });
s.addText("VISIT      VISITNUM\nSCREENING      1\nBASELINE       2\nWEEK 4         4",
  { x: 1.0, y: 2.45, w: 5.3, h: 1.4, fontFace: MONO, fontSize: 13, color: INK, lineSpacing: 20, margin: 0 });

card(s, 6.9, 1.8, 5.8, 2.3, WHITE);
s.addText("What the analysis reports", { x: 7.2, y: 1.98, w: 5.2, h: 0.4, fontFace: HFONT, bold: true, fontSize: 17, color: ACCENT, margin: 0 });
s.addText("AVISIT     AVISITN\nScreening      0\nBaseline       1\nWeek 4         4",
  { x: 7.2, y: 2.45, w: 5.2, h: 1.4, fontFace: MONO, fontSize: 13, color: INK, lineSpacing: 20, margin: 0 });

s.addText("Deliberately different numbers. Both are kept.",
  { x: 0.7, y: 4.3, w: 12, h: 0.4, fontFace: BFONT, bold: true, fontSize: 15.5, color: INK, margin: 0 });
card(s, 0.7, 4.85, 12.0, 1.9, PAPER);
s.addText([
  { text: "AVISITN drives sort order and column order in every table. ", options: { bold: true } },
  { text: "It is chosen to suit the table, not the CRF.\n\n" },
  { text: "Analysis visits can also WINDOW (a Week 4 visit collected on day 26 or day 31 still reports as Week 4), MERGE, or DROP collected visits entirely. Keeping both columns means a reviewer can always see what was collected AND how it was analysed — which is the whole traceability argument in miniature.",
    options: { color: MUTED } },
], { x: 1.0, y: 5.05, w: 11.4, h: 1.55, fontFace: BFONT, fontSize: 13.5, color: INK, lineSpacing: 20, margin: 0 });
s.addNotes("Windowing IS present in ABC-01, and it is worth showing live: in ADVS the Week 4 visit falls on study day 28 for most subjects, day 29 for one, and day 20 for ABC-01-01-004 — who discontinued early, so their final visit happened eight days ahead of schedule. Screening spans days -9 to -11. All of them map to one AVISIT. That is exactly what AVISIT is for: three different actual days, one analysis visit, one column in the table.");

// ============ 5. DERIVED PARAMETER ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Derived parameters", "BMI exists in no SDTM domain");
codeBox(s, 0.7, 1.65, 12.0,
  "PARAMCD = 'BMI'\nAVAL    = round( weight / (HEIGHTBL/100)**2 , 0.01 )\n\nthe visit's weight  ·  the subject's BASELINE height  ·  height is measured once",
  ACCENT, "A NEW PARAMCD");

const two = [
  ["DTYPE stays EMPTY", "DTYPE identifies a derived RECORD WITHIN a parameter — LOCF, a replicate average. A whole new parameter is not that.", "Populate it and a reviewer concludes these rows were imputed. They were not.", SEA],
  ["SRCDOM / SRCSEQ stay EMPTY", "BMI comes from a weight record AND a height record AND ADSL. There is no single source row to name.", "Naming just the weight row would be a false trail. The blank is information.", TEAL],
];
let ty = 3.35;
two.forEach((t) => {
  card(s, 0.7, ty, 12.0, 1.55, WHITE);
  s.addShape(p.ShapeType.rect, { x: 0.7, y: ty, w: 0.09, h: 1.55, fill: { color: t[3] }, line: { type: "none" } });
  s.addText(t[0], { x: 1.05, y: ty + 0.14, w: 4.2, h: 0.45, fontFace: MONO, bold: true, fontSize: 14, color: t[3], margin: 0 });
  s.addText(t[1], { x: 1.05, y: ty + 0.62, w: 4.2, h: 0.8, fontFace: BFONT, fontSize: 12, color: MUTED, lineSpacing: 16, margin: 0 });
  s.addText(t[2], { x: 5.7, y: ty + 0.35, w: 6.7, h: 0.9, valign: "middle", fontFace: BFONT, italic: true, fontSize: 14, color: INK, lineSpacing: 19, margin: 0 });
  ty += 1.7;
});
s.addText("Derived PARAMETER (new PARAMCD, DTYPE null)  ≠  derived RECORD (existing PARAMCD, DTYPE populated).",
  { x: 0.7, y: 6.8, w: 12, h: 0.4, fontFace: BFONT, bold: true, fontSize: 13.5, color: TEAL, margin: 0 });
s.addNotes("Exercise 5 has them write the reply to a colleague who insists BMI is 'derived' so DTYPE should say so. The killer counter-argument: by that reading, CHG would make every post-baseline row a derived record too. The test is not 'was arithmetic involved' but 'is this row a substitute for an observation'.");

// ============ 6. TWO RULES THAT BIAS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Two rules", "Both quietly bias results if you get them wrong");

card(s, 0.7, 1.7, 12.0, 2.25, "FBEAE4");
s.addShape(p.ShapeType.rect, { x: 0.7, y: 1.7, w: 0.09, h: 2.25, fill: { color: WARN }, line: { type: "none" } });
s.addText("1 ·  CHG at baseline is BLANK, not zero", { x: 1.05, y: 1.88, w: 11.3, h: 0.4,
  fontFace: HFONT, bold: true, fontSize: 18, color: WARN, margin: 0 });
s.addText("A baseline record's change from baseline is UNDEFINED. Writing 0 puts it in the mean-change column.",
  { x: 1.05, y: 2.32, w: 11.3, h: 0.35, fontFace: BFONT, fontSize: 13.5, color: INK, margin: 0 });
s.addText([
  { text: "WEIGHT, mean change from baseline:   ", options: { fontFace: MONO, fontSize: 13 } },
  { text: "−0.3375 kg", options: { fontFace: MONO, bold: true, fontSize: 14, color: SEA } },
  { text: "  correct        ", options: { fontSize: 12, color: MUTED } },
  { text: "−0.1688 kg", options: { fontFace: MONO, bold: true, fontSize: 14, color: WARN } },
  { text: "  with zeros", options: { fontSize: 12, color: MUTED } },
], { x: 1.05, y: 2.75, w: 11.3, h: 0.4, fontFace: BFONT, color: INK, margin: 0 });
s.addText("Zeros add nothing to the numerator and increase the denominator — so the bias is ALWAYS toward the null. It never invents a signal; it only ever hides one.",
  { x: 1.05, y: 3.25, w: 11.3, h: 0.6, fontFace: BFONT, italic: true, fontSize: 13.5, color: MUTED, lineSpacing: 19, margin: 0 });

card(s, 0.7, 4.2, 12.0, 2.2, PAPER);
s.addShape(p.ShapeType.rect, { x: 0.7, y: 4.2, w: 0.09, h: 2.2, fill: { color: TEAL }, line: { type: "none" } });
s.addText("2 ·  Rounding is specified, not incidental", { x: 1.05, y: 4.38, w: 11.3, h: 0.4,
  fontFace: HFONT, bold: true, fontSize: 18, color: TEAL, margin: 0 });
s.addText([
  { text: "69.8 − 70.2  =  -0.4000000000000057", options: { fontFace: MONO, fontSize: 13.5, color: INK } },
  { text: "     in SAS and in Python alike", options: { fontSize: 12.5, color: MUTED } },
], { x: 1.05, y: 4.85, w: 11.3, h: 0.4, margin: 0 });
s.addText("The spec names the precision — ROUND(CHG, 0.0001) — and both implementations apply it, so PROC COMPARE is exactly clean rather than nearly clean.",
  { x: 1.05, y: 5.3, w: 11.3, h: 0.55, fontFace: BFONT, fontSize: 13.5, color: INK, lineSpacing: 19, margin: 0 });
s.addText("Tolerated numerical noise trains people to ignore PROC COMPARE — and then the run where a difference is 0.4 gets waved through too.",
  { x: 1.05, y: 5.85, w: 11.3, h: 0.45, fontFace: BFONT, italic: true, fontSize: 13, color: MUTED, margin: 0 });
s.addNotes("Both numbers on this slide were computed from ABC-01, not invented. The −0.3375 to −0.1688 shift is exactly half because the study has as many baseline records as post-baseline ones. The 'always toward the null' argument is the one worth having them repeat back.");

// ============ 7. FLAG, DO NOT FILTER ============
s = p.addSlide(); bg(s, PAPER);
header(s, "ANL01FL", "Exclude records without deleting them");
s.addText("Delete 48 Screening rows. Same count, two orders, two completely different outcomes.",
  { x: 0.7, y: 1.55, w: 12, h: 0.4, fontFace: BFONT, fontSize: 14.5, color: MUTED, margin: 0 });

card(s, 0.7, 2.1, 5.9, 2.6, WHITE);
s.addShape(p.ShapeType.rect, { x: 0.7, y: 2.1, w: 5.9, h: 0.12, fill: { color: SEA }, line: { type: "none" } });
s.addText("AFTER deriving ABLFL", { x: 1.0, y: 2.35, w: 5.3, h: 0.4, fontFace: HFONT, bold: true, fontSize: 16, color: SEA, margin: 0 });
s.addText("rows      152 → 104\nbaselines  56 →  56\nHEIGHT      8 →   8",
  { x: 1.0, y: 2.85, w: 5.3, h: 1.1, fontFace: MONO, fontSize: 13, color: INK, lineSpacing: 20, margin: 0 });
s.addText("Harmless — and pointless. ANL01FL already did this, without discarding data.",
  { x: 1.0, y: 4.0, w: 5.3, h: 0.6, fontFace: BFONT, italic: true, fontSize: 12.5, color: MUTED, lineSpacing: 17, margin: 0 });

card(s, 6.9, 2.1, 5.8, 2.6, WHITE);
s.addShape(p.ShapeType.rect, { x: 6.9, y: 2.1, w: 5.8, h: 0.12, fill: { color: WARN }, line: { type: "none" } });
s.addText("BEFORE deriving ABLFL", { x: 7.2, y: 2.35, w: 5.2, h: 0.4, fontFace: HFONT, bold: true, fontSize: 16, color: WARN, margin: 0 });
s.addText("rows      152 → 104\nbaselines  56 →  48\nHEIGHT      8 →   0",
  { x: 7.2, y: 2.85, w: 5.2, h: 1.1, fontFace: MONO, fontSize: 13, color: INK, lineSpacing: 20, margin: 0 });
s.addText("HEIGHT destroyed completely. No error. It looks like a study that never measured height.",
  { x: 7.2, y: 4.0, w: 5.2, h: 0.6, fontFace: BFONT, italic: true, fontSize: 12.5, color: WARN, lineSpacing: 17, margin: 0 });

card(s, 0.7, 5.0, 12.0, 1.75, WHITE);
s.addText("Why the order decides", { x: 1.0, y: 5.18, w: 11.4, h: 0.4, fontFace: HFONT, bold: true, fontSize: 16, color: INK, margin: 0 });
s.addText([
  { text: "The baseline rule is a statement about TIME, and it can only be evaluated against the full history. " },
  { text: "Filtering first throws away the evidence the rule needs — and the rule then reports, correctly and silently, that there is no baseline.\n" },
  { text: "Flagging is reversible and self-documenting. Filtering is destructive and silent. ", options: { bold: true, color: TEAL } },
  { text: "That is why ADaM is full of flags rather than filtered datasets.", options: { color: MUTED } },
], { x: 1.0, y: 5.6, w: 11.4, h: 1.05, fontFace: BFONT, fontSize: 13.5, color: MUTED, lineSpacing: 19, margin: 0 });
s.addNotes("Both columns of numbers come from actually running it. The 'before' case is the important one: 48 rows deleted either way, but one of them silently removes an entire parameter. Same lesson as TRTEMFL in ADAE — keep the row, flag it, subset at analysis time.");

// ============ 8. WHAT'S NEXT ============
s = p.addSlide(); bg(s, INK);
s.addShape(p.ShapeType.ellipse, { x: 10.2, y: 4.6, w: 5.0, h: 5.0, fill: { color: "133B4C" }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.2, y: 5.6, w: 3.0, h: 3.0, fill: { color: TEAL }, line: { type: "none" } });
s.addText("WHAT'S NEXT", { x: 0.7, y: 1.4, w: 11, h: 0.35, fontFace: BFONT, bold: true, fontSize: 13, color: MINT, charSpacing: 2, margin: 0 });
s.addText("152 rows, and one of them has no change", { x: 0.66, y: 1.8, w: 11.5, h: 0.8, fontFace: HFONT, bold: true, fontSize: 30, color: WHITE, margin: 0 });
const nn = [
  ["Step 1 · Notebook 16", "Build ADVS: 128 observed rows plus 24 derived BMI records.", ACCENT],
  ["Step 2 · Check the baselines", "PROC FREQ of PARAMCD × AVISIT where ABLFL='Y'. HEIGHT must show Screening.", TEAL],
  ["Step 3 · Exercise 4", "Delete the Screening rows twice, in two different orders. Watch HEIGHT vanish.", MINT],
];
let ny = 3.0;
nn.forEach((n, i) => {
  circle(s, 0.7, ny, 0.62, n[2], String(i + 1), n[2] === TEAL ? WHITE : INK, 17);
  s.addText([{ text: n[0] + "   ", options: { bold: true, fontSize: 17, color: WHITE } },
             { text: n[1], options: { fontSize: 13.5, color: "C7DCE0" } }],
    { x: 1.55, y: ny - 0.02, w: 10.8, h: 0.85, fontFace: BFONT, valign: "middle", margin: 0 });
  ny += 1.08;
});
s.addText("Tomorrow: the same skeleton, three more columns — and only half the study has any data at all.",
  { x: 0.7, y: 6.5, w: 11.5, h: 0.6, fontFace: BFONT, italic: true, fontSize: 14, color: MINT, margin: 0 });
s.addNotes("HEIGHT having no CHG anywhere is correct, not missing data — it has one record, that record is its baseline, and a baseline has nothing to change from. Trainees will flag it as a bug; let them, then walk it back. End of Module 16.");

p.writeFile({ fileName: "/Volumes/D Drive/SDTM Training/Bootcamp/presentations/16_bds_advs.pptx" })
  .then(f => console.log("WROTE", f))
  .catch(e => { console.error(e); process.exit(1); });
