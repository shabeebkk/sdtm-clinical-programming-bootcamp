// Build: 17_lab_analysis.pptx — "Analysis of Lab Data: Ranges, Shifts and Criterion Flags"
// Bootcamp Module 17. Fourth deck of the ADaM track. Concept deck for ADLB.
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "Clinical Programming Bootcamp";
p.title = "Analysis of Lab Data: Ranges, Shifts and Criterion Flags";

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
s.addText("CLINICAL PROGRAMMING BOOTCAMP  ·  MODULE 17", { x: 0.7, y: 2.0, w: 9, h: 0.4,
  fontFace: BFONT, fontSize: 14, bold: true, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Analysis of\nLab Data", { x: 0.66, y: 2.5, w: 9.6, h: 1.7,
  fontFace: HFONT, fontSize: 44, bold: true, color: WHITE, lineSpacing: 48, margin: 0 });
s.addText("Ranges, shifts and criterion flags", { x: 0.7, y: 4.15, w: 9.6, h: 0.6,
  fontFace: HFONT, fontSize: 26, color: MINT, margin: 0 });
s.addText("The same BDS skeleton as ADVS — and the number that decides every percentage in it.",
  { x: 0.7, y: 5.0, w: 9.2, h: 0.8, fontFace: BFONT, fontSize: 16, color: "C7DCE0", margin: 0 });
s.addText("Hands-on: Notebook 17 (SAS) — Build ADLB",
  { x: 0.7, y: 6.5, w: 12, h: 0.4, fontFace: BFONT, fontSize: 12, italic: true, color: MUTED, margin: 0 });
s.addNotes("Module 17. Open by saying the structure is yesterday's — that is deliberate and reassuring. The new material is what a normal range makes possible, plus the denominator lesson, which is the single most valuable thing in the ADaM track for real-world work.");

// ============ 2. THE DENOMINATOR ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Before any code", "ADSL has 8 subjects. ADLB has 4.");
s.addText("Four subjects had no labs drawn. One subject has a post-baseline abnormal result. What percentage is that?",
  { x: 0.7, y: 1.55, w: 12, h: 0.4, fontFace: BFONT, fontSize: 14.5, color: MUTED, margin: 0 });

card(s, 0.7, 2.1, 5.9, 2.35, "E8F4F1");
s.addShape(p.ShapeType.rect, { x: 0.7, y: 2.1, w: 0.09, h: 2.35, fill: { color: SEA }, line: { type: "none" } });
s.addText("Denominator from ADSL", { x: 1.05, y: 2.28, w: 5.3, h: 0.4, fontFace: HFONT, bold: true, fontSize: 17, color: SEA, margin: 0 });
s.addText("Drug A    1 / 4  =  25.0%\nPlacebo   0 / 4  =   0.0%",
  { x: 1.05, y: 2.78, w: 5.3, h: 0.8, fontFace: MONO, fontSize: 14, color: INK, lineSpacing: 22, margin: 0 });
s.addText("Correct. Every dosed subject was at risk, whether or not a sample was taken.",
  { x: 1.05, y: 3.7, w: 5.3, h: 0.6, fontFace: BFONT, italic: true, fontSize: 12.5, color: MUTED, lineSpacing: 17, margin: 0 });

card(s, 6.9, 2.1, 5.8, 2.35, "FBEAE4");
s.addShape(p.ShapeType.rect, { x: 6.9, y: 2.1, w: 0.09, h: 2.35, fill: { color: WARN }, line: { type: "none" } });
s.addText("Denominator from ADLB", { x: 7.25, y: 2.28, w: 5.2, h: 0.4, fontFace: HFONT, bold: true, fontSize: 17, color: WARN, margin: 0 });
s.addText("Drug A    1 / 3  =  33.3%\nPlacebo   0 / 1  =   0.0%",
  { x: 7.25, y: 2.78, w: 5.2, h: 0.8, fontFace: MONO, fontSize: 14, color: INK, lineSpacing: 22, margin: 0 });
s.addText("Wrong. And the Placebo denominator is ONE — a single abnormal there would read as 100%.",
  { x: 7.25, y: 3.7, w: 5.2, h: 0.6, fontFace: BFONT, italic: true, fontSize: 12.5, color: WARN, lineSpacing: 17, margin: 0 });

card(s, 0.7, 4.75, 12.0, 2.0, INK);
s.addText("Denominators come from ADSL, filtered by the population flag the table calls for.",
  { x: 1.05, y: 4.95, w: 11.4, h: 0.45, fontFace: HFONT, bold: true, fontSize: 19, color: WHITE, margin: 0 });
s.addText([
  { text: "Never from the dataset you happen to be summarising. " },
  { text: "Missing data must not shrink a denominator — that silently converts “we did not measure this” into “this did not happen”.\n", options: { color: MINT } },
  { text: "One of the four missing subjects is ABC-01-01-004, who discontinued for an adverse event on day 20. Exactly the subject whose absence biases a safety result in the sponsor's favour.",
    options: { color: "C7DCE0" } },
], { x: 1.05, y: 5.5, w: 11.4, h: 1.1, fontFace: BFONT, fontSize: 13.5, lineSpacing: 20, margin: 0 });
s.addNotes("This is the most common ADaM error in practice and it is invisible — 33.3% is a perfectly plausible number. The Placebo column is the one to dwell on: a denominator of 1. Ask the room what happens if that single subject has an abnormal result. Answer: 100% of the placebo arm, from an n of one.");

// ============ 3. WHAT A RANGE MAKES POSSIBLE ============
s = p.addSlide(); bg(s, WHITE);
header(s, "New variables", "Everything a normal range makes possible");
const vars = [
  ["ANRLO / ANRHI", "the range itself, on every row", TEAL],
  ["ANRIND", "where THIS result sits: LOW · NORMAL · HIGH", TEAL],
  ["BNRIND", "where the BASELINE sat — carried to every row", SEA],
  ["SHIFT1", "the two together: “NORMAL to HIGH”", ACCENT],
  ["CRIT1 / CRIT1FL", "one prespecified yes/no question", ACCENT],
];
// 5 cards at 0.88 pitch end at 5.30 + 0.80 = 6.10, clearing the footer card at 6.25.
// Spacing them any wider paints the last card under the footer — caught by
// check_deck_layout.py as 26% hidden text.
let vy = 1.78;
vars.forEach((v) => {
  card(s, 0.7, vy, 12.0, 0.80, WHITE);
  s.addShape(p.ShapeType.rect, { x: 0.7, y: vy, w: 0.09, h: 0.80, fill: { color: v[2] }, line: { type: "none" } });
  s.addText(v[0], { x: 1.05, y: vy + 0.03, w: 3.6, h: 0.74, valign: "middle", fontFace: MONO, bold: true, fontSize: 14, color: v[2], margin: 0 });
  s.addText(v[1], { x: 4.8, y: vy + 0.03, w: 7.7, h: 0.74, valign: "middle", fontFace: BFONT, fontSize: 14, color: INK, margin: 0 });
  vy += 0.88;
});
card(s, 0.7, 6.25, 12.0, 0.85, PAPER);
s.addText([
  { text: "BNRIND is carried to EVERY row of the parameter, like BASE. ", options: { bold: true } },
  { text: "A shift needs to know where it started — so both ends must sit on the same row.", options: { color: MUTED } },
], { x: 1.0, y: 6.42, w: 11.4, h: 0.6, fontFace: BFONT, fontSize: 13.5, color: INK, margin: 0 });
s.addNotes("The BNRIND scope point is the same two-different-scopes pattern as BASE in Notebook 16, and trainees who struggled there will struggle here. Say it explicitly: ABLFL marks one row, BASE and BNRIND belong to all of them.");

// ============ 4. DERIVE OR READ? ============
s = p.addSlide(); bg(s, PAPER);
header(s, "An apparent contradiction", "We READ TRTEMFL. We DERIVE ANRIND. Why?");
const cmp = [
  ["", "TRTEMFL  (Notebook 15)", "ANRIND  (today)"],
  ["What it encodes", "a study DECISION", "pure ARITHMETIC"],
  ["Inputs", "dates + a rule for partial dates", "three numbers on this row"],
  ["Can it drift?", "yes — the rule lives elsewhere", "no — it is a comparison"],
  ["So we", "READ it, cross-check it", "DERIVE it, reconcile it"],
];
let ty = 1.8;
cmp.forEach((r, ri) => {
  const isHdr = ri === 0;
  s.addShape(p.ShapeType.rect, { x: 0.7, y: ty, w: 11.9, h: isHdr ? 0.55 : 0.72,
    fill: { color: isHdr ? INK : (ri % 2 ? WHITE : PAPER) }, line: { color: LINE, width: 0.5 } });
  s.addText(r[0], { x: 0.95, y: ty, w: 3.0, h: isHdr ? 0.55 : 0.72, valign: "middle",
    fontFace: BFONT, bold: true, fontSize: 13.5, color: isHdr ? WHITE : INK, margin: 0 });
  s.addText(r[1], { x: 4.1, y: ty, w: 4.3, h: isHdr ? 0.55 : 0.72, valign: "middle",
    fontFace: isHdr ? MONO : BFONT, bold: isHdr, fontSize: 13.5, color: isHdr ? MINT : MUTED, margin: 0 });
  s.addText(r[2], { x: 8.6, y: ty, w: 3.9, h: isHdr ? 0.55 : 0.72, valign: "middle",
    fontFace: isHdr ? MONO : BFONT, bold: isHdr, fontSize: 13.5, color: isHdr ? ACCENT : MUTED, margin: 0 });
  ty += isHdr ? 0.55 : 0.72;
});
card(s, 0.7, 5.4, 12.0, 1.4, INK);
s.addText("Read a DECISION. Derive a COMPUTATION. Verify either way.",
  { x: 1.05, y: 5.58, w: 11.4, h: 0.45, fontFace: HFONT, bold: true, fontSize: 19, color: WHITE, margin: 0 });
s.addText("Recalculating a decision does not verify it — it forks it. The instinct to “just recompute it so I know it's right” is a programming instinct, and in clinical data it is wrong more often than right.",
  { x: 1.05, y: 6.05, w: 11.4, h: 0.65, fontFace: BFONT, fontSize: 13.5, color: "C7DCE0", lineSpacing: 19, margin: 0 });
s.addNotes("Exercise 5 extends this to LBBLFL, AESEV and DM.AGE. LBBLFL is the interesting one — it looks like a computation but encodes the decision 'which visit is baseline', and it is the WRONG decision for ADaM, as Notebook 14 showed. Three of those five are decisions, which is the point: clinical data is mostly judgement encoded as values.");

// ============ 5. THE SHIFT TABLE ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Shifts", "The whole clinical content of this study's lab data");
s.addText("24 post-baseline analysis records. One cell is off the diagonal.",
  { x: 0.7, y: 1.55, w: 12, h: 0.4, fontFace: BFONT, fontSize: 14.5, color: MUTED, margin: 0 });

const shiftHdr = ["", "→ NORMAL", "→ HIGH", "→ LOW"];
const shiftRows = [["NORMAL →", "23", "1", "0"], ["HIGH →", "0", "0", "0"], ["LOW →", "0", "0", "0"]];
const sx = [1.4, 4.2, 6.6, 9.0], sw = [2.6, 2.2, 2.2, 2.2];
s.addShape(p.ShapeType.rect, { x: 1.4, y: 2.1, w: 9.8, h: 0.55, fill: { color: INK }, line: { type: "none" } });
shiftHdr.forEach((h, i) => {
  s.addText(h, { x: sx[i], y: 2.1, w: sw[i], h: 0.55, valign: "middle", align: i ? "center" : "left",
    fontFace: MONO, bold: true, fontSize: 13, color: WHITE, margin: 0 });
});
let shy = 2.65;
shiftRows.forEach((r) => {
  s.addShape(p.ShapeType.rect, { x: 1.4, y: shy, w: 9.8, h: 0.6, fill: { color: WHITE }, line: { color: LINE, width: 0.5 } });
  r.forEach((v, i) => {
    const hot = (i === 2 && v === "1");
    s.addText(v, { x: sx[i], y: shy, w: sw[i], h: 0.6, valign: "middle", align: i ? "center" : "left",
      fontFace: MONO, bold: i === 0 || hot, fontSize: hot ? 17 : 13.5, color: hot ? WARN : INK, margin: 0 });
  });
  shy += 0.6;
});

card(s, 0.7, 4.7, 12.0, 1.05, "FBEAE4");
s.addText([
  { text: "ABC-01-01-003  ·  ALT  24 → 72 U/L  (range 7–56)  ·  Drug A", options: { fontFace: MONO, bold: true, color: INK } },
  { text: "\nA liver enzyme crossing the upper limit on active treatment — exactly the signal a hepatotoxicity review exists to find.",
    options: { color: MUTED } },
], { x: 1.0, y: 4.87, w: 11.4, h: 0.75, fontFace: BFONT, fontSize: 13.5, lineSpacing: 19, margin: 0 });

card(s, 0.7, 5.95, 12.0, 1.0, PAPER);
s.addText([
  { text: "The diagonal means “stayed in the same category”. Off-diagonal means the result CROSSED A CLINICAL BOUNDARY ", options: { bold: true } },
  { text: "— the point at which a number stops being reassuring and starts requiring explanation.", options: { color: MUTED } },
], { x: 1.0, y: 6.12, w: 11.4, h: 0.7, fontFace: BFONT, fontSize: 13.5, color: INK, lineSpacing: 19, margin: 0 });
s.addNotes("A shift table needs both ends on one row — which is the analysis-ready test from Module 14 applied concretely. If producing this table required joining baseline records to post-baseline ones, the dataset would not be analysis-ready, and every table program would re-implement that join slightly differently.");

// ============ 6. BLANK IS NOT 'N' ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Criterion flags", "Blank is not 'N'");
codeBox(s, 0.7, 1.65, 12.0,
  "if paramcd = 'ALT' then do;\n    crit1 = 'ALT > ULN';\n    if aval > anrhi then crit1fl = 'Y'; else crit1fl = 'N';\nend;\n                       /* every other parameter: BLANK */",
  TEAL, "THE CRITERION");

card(s, 0.7, 3.5, 5.9, 1.5, "E8F4F1");
s.addText("Correct — blank off-parameter", { x: 1.0, y: 3.66, w: 5.3, h: 0.35, fontFace: HFONT, bold: true, fontSize: 15, color: SEA, margin: 0 });
s.addText("1 of 8 evaluated  =  12.5%", { x: 1.0, y: 4.05, w: 5.3, h: 0.45, fontFace: MONO, bold: true, fontSize: 17, color: INK, margin: 0 });
s.addText("Only ALT records were evaluated.", { x: 1.0, y: 4.55, w: 5.3, h: 0.35, fontFace: BFONT, italic: true, fontSize: 12.5, color: MUTED, margin: 0 });

card(s, 6.9, 3.5, 5.8, 1.5, "FBEAE4");
s.addText("Wrong — 'N' everywhere", { x: 7.2, y: 3.66, w: 5.2, h: 0.35, fontFace: HFONT, bold: true, fontSize: 15, color: WARN, margin: 0 });
s.addText("1 of 48 evaluated  =  2.1%", { x: 7.2, y: 4.05, w: 5.2, h: 0.45, fontFace: MONO, bold: true, fontSize: 17, color: INK, margin: 0 });
s.addText("The rate collapses by a factor of six.", { x: 7.2, y: 4.55, w: 5.2, h: 0.35, fontFace: BFONT, italic: true, fontSize: 12.5, color: WARN, margin: 0 });

card(s, 0.7, 5.25, 12.0, 1.6, PAPER);
s.addText("'N' on a creatinine record asserts something false:", { x: 1.0, y: 5.42, w: 11.4, h: 0.35,
  fontFace: BFONT, bold: true, fontSize: 14, color: INK, margin: 0 });
s.addText("“This record was evaluated against criterion 1 — ALT > ULN — and did not meet it.”",
  { x: 1.0, y: 5.8, w: 11.4, h: 0.35, fontFace: BFONT, italic: true, fontSize: 14, color: WARN, margin: 0 });
s.addText("ADaM needs THREE states — met (Y), evaluated and not met (N), not evaluated (blank). Collapsing the third into the second destroys it permanently: nothing distinguishes a real N from a manufactured one.",
  { x: 1.0, y: 6.2, w: 11.4, h: 0.55, fontFace: BFONT, fontSize: 13, color: MUTED, lineSpacing: 18, margin: 0 });
s.addNotes("Note the direction of the bias: the diluted rate makes the drug look safer. Same direction as zeroing CHG at baseline in Module 16, and not a coincidence — both errors work by quietly enlarging a denominator. That pattern is worth naming as a class of error rather than two separate mistakes.");

// ============ 7. WHAT'S NEXT ============
s = p.addSlide(); bg(s, INK);
s.addShape(p.ShapeType.ellipse, { x: 10.2, y: 4.6, w: 5.0, h: 5.0, fill: { color: "133B4C" }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.2, y: 5.6, w: 3.0, h: 3.0, fill: { color: TEAL }, line: { type: "none" } });
s.addText("WHAT'S NEXT", { x: 0.7, y: 1.4, w: 11, h: 0.35, fontFace: BFONT, bold: true, fontSize: 13, color: MINT, charSpacing: 2, margin: 0 });
s.addText("48 rows, 4 subjects, one abnormal", { x: 0.66, y: 1.8, w: 11.5, h: 0.8, fontFace: HFONT, bold: true, fontSize: 32, color: WHITE, margin: 0 });
const nn = [
  ["Step 1 · Notebook 17", "Build ADLB. The BDS skeleton from yesterday, plus ranges, shifts and the criterion flag.", ACCENT],
  ["Step 2 · Exercise 1", "Compute the same percentage with both denominators. 25.0% and 33.3% — one is defensible.", TEAL],
  ["Step 3 · Exercise 5", "Write the rule for when ADaM should re-derive an upstream flag and when it should read it.", MINT],
];
let ny = 3.0;
nn.forEach((n, i) => {
  circle(s, 0.7, ny, 0.62, n[2], String(i + 1), n[2] === TEAL ? WHITE : INK, 17);
  s.addText([{ text: n[0] + "   ", options: { bold: true, fontSize: 17, color: WHITE } },
             { text: n[1], options: { fontSize: 13.5, color: "C7DCE0" } }],
    { x: 1.55, y: ny - 0.02, w: 10.8, h: 0.9, fontFace: BFONT, valign: "middle", margin: 0 });
  ny += 1.1;
});
s.addText("Tomorrow: a dataset that keeps every subject — including the ones nothing happened to — and a flag that runs backwards.",
  { x: 0.7, y: 6.5, w: 11.5, h: 0.6, fontFace: BFONT, italic: true, fontSize: 14, color: MINT, margin: 0 });
s.addNotes("Close by planting ADTTE: censoring is the formal answer to the missing-data problem this module raised twice — subjects with no labs, and events that had not ended. End of Module 17.");

p.writeFile({ fileName: "/Volumes/D Drive/SDTM Training/Bootcamp/presentations/17_lab_analysis.pptx" })
  .then(f => console.log("WROTE", f))
  .catch(e => { console.error(e); process.exit(1); });
