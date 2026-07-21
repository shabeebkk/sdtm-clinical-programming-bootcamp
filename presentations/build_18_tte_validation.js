// Build: 18_tte_validation.pptx — "Time-to-Event, ADaM Validation, and the Payoff"
// Bootcamp Module 18. Final deck of the ADaM track. Covers ADTTE, conformance, and Notebook 19.
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "Clinical Programming Bootcamp";
p.title = "Time-to-Event, ADaM Validation, and the Payoff";

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
s.addText("CLINICAL PROGRAMMING BOOTCAMP  ·  MODULE 18", { x: 0.7, y: 2.0, w: 9, h: 0.4,
  fontFace: BFONT, fontSize: 14, bold: true, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Time-to-Event,\nand the Payoff", { x: 0.66, y: 2.5, w: 9.6, h: 1.7,
  fontFace: HFONT, fontSize: 42, bold: true, color: WHITE, lineSpacing: 46, margin: 0 });
s.addText("Censoring · ADaM validation · one real table", { x: 0.7, y: 4.15, w: 9.6, h: 0.6,
  fontFace: HFONT, fontSize: 24, color: MINT, margin: 0 });
s.addText("The last day. Two subjects nothing happened to, and why they matter most.",
  { x: 0.7, y: 5.0, w: 9.2, h: 0.8, fontFace: BFONT, fontSize: 16, color: "C7DCE0", margin: 0 });
s.addText("Hands-on: Notebook 18 (ADTTE) and Notebook 19 (from ADaM to a table)",
  { x: 0.7, y: 6.5, w: 12, h: 0.4, fontFace: BFONT, fontSize: 12, italic: true, color: MUTED, margin: 0 });
s.addNotes("Module 18 closes the ADaM track. Two halves: ADTTE in the morning, then the payoff notebook which is deliberately the shortest in the course. Save time for the last slide — the traceability chain is the thing you want them to leave with.");

// ============ 2. WHAT ADTTE ANSWERS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "A different question", "Not whether — how long");
const qs = [
  ["ADAE asks", "Did this subject have an event?", "Y / N", TEAL],
  ["ADTTE asks", "How long until they did — and what about the ones who never did?", "days + a censoring flag", ACCENT],
];
let qy = 1.85;
qs.forEach((q) => {
  card(s, 0.7, qy, 12.0, 1.5, WHITE);
  s.addShape(p.ShapeType.rect, { x: 0.7, y: qy, w: 0.09, h: 1.5, fill: { color: q[3] }, line: { type: "none" } });
  s.addText(q[0], { x: 1.05, y: qy + 0.18, w: 2.4, h: 0.4, fontFace: HFONT, bold: true, fontSize: 18, color: q[3], margin: 0 });
  s.addText(q[1], { x: 3.6, y: qy + 0.15, w: 6.2, h: 0.75, fontFace: BFONT, fontSize: 15, color: INK, lineSpacing: 20, margin: 0 });
  s.addText(q[2], { x: 3.6, y: qy + 0.95, w: 6.2, h: 0.4, fontFace: MONO, fontSize: 13, color: MUTED, margin: 0 });
  qy += 1.65;
});
card(s, 0.7, 5.3, 12.0, 1.5, INK);
s.addText("One row per subject per parameter — EVERY safety subject, event or not.",
  { x: 1.05, y: 5.5, w: 11.4, h: 0.45, fontFace: HFONT, bold: true, fontSize: 19, color: WHITE, margin: 0 });
s.addText("ABC-01: 8 rows.  6 events.  2 censored.   If you built 6 rows, you dropped the censored subjects — and that is the mistake this whole module exists to prevent.",
  { x: 1.05, y: 6.0, w: 11.4, h: 0.65, fontFace: BFONT, fontSize: 14, color: "C7DCE0", lineSpacing: 20, margin: 0 });
s.addNotes("ADTTE is built on ADAE, which is built on AE. Point out that the notebook reads adam/adae.csv, not sdtm/ae.csv — each layer trusts the one below, and TRTEMFL still means the one thing SDTM documented, three layers up.");

// ============ 3. CNSR RUNS BACKWARDS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "The trap", "CNSR runs backwards from every other flag in ADaM");
card(s, 0.7, 1.8, 5.9, 1.6, "E8F4F1");
s.addText("CNSR = 0", { x: 1.05, y: 2.0, w: 5.3, h: 0.5, fontFace: MONO, bold: true, fontSize: 24, color: SEA, margin: 0 });
s.addText("the event HAPPENED", { x: 1.05, y: 2.6, w: 5.3, h: 0.4, fontFace: BFONT, bold: true, fontSize: 16, color: INK, margin: 0 });
card(s, 6.9, 1.8, 5.8, 1.6, "FBEAE4");
s.addText("CNSR = 1", { x: 7.25, y: 2.0, w: 5.2, h: 0.5, fontFace: MONO, bold: true, fontSize: 24, color: WARN, margin: 0 });
s.addText("CENSORED — it had not happened when we stopped looking",
  { x: 7.25, y: 2.55, w: 5.2, h: 0.7, fontFace: BFONT, bold: true, fontSize: 15, color: INK, lineSpacing: 19, margin: 0 });

s.addText("Everywhere else in ADaM, 1 and 'Y' mean “yes, this is true”. Read it twice, every time.",
  { x: 0.7, y: 3.6, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 14.5, color: TEAL, margin: 0 });

codeBox(s, 0.7, 4.15, 12.0,
  "proc lifetest data = adtte;\n    time aval * cnsr(1);      /* <- \"1 means censored\" */\n    strata trtp;\nrun;",
  TEAL, "AND IT APPEARS AGAIN HERE");

card(s, 0.7, 6.05, 12.0, 1.1, "FBEAE4");
s.addShape(p.ShapeType.rect, { x: 0.7, y: 6.05, w: 0.09, h: 1.1, fill: { color: WARN }, line: { type: "none" } });
s.addText([
  { text: "Write cnsr(0) and every event becomes censored, every censored subject becomes an event. ", options: { bold: true } },
  { text: "No error. No warning. A curve that is exactly backwards, and a median SAS reports as “not estimable”.", options: { color: MUTED } },
], { x: 1.05, y: 6.25, w: 11.4, h: 0.75, fontFace: BFONT, fontSize: 13.5, color: INK, lineSpacing: 19, margin: 0 });
s.addNotes("Exercise 1 makes them run cnsr(0). The one-sentence answer for a non-statistician: that curve describes a study in which the only thing that ever happened was that two people finished, and the six who actually had an event are counted as having quietly walked away without one. Same class of bug as everything else in this course — correct-looking output from incorrect code.");

// ============ 4. THREE ANSWERS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Why censoring is not a nuisance", "Three ways to answer “how long?” — two are wrong");
const ans = [
  ["Mean among subjects\nWHO HAD an event", "10.17", "n = 6", "biased DOWN — excludes the long event-free times precisely because they were long", WARN],
  ["Mean over EVERYONE,\nignoring censoring", "14.62", "n = 8", "biased UP — asserts two events that never happened", WARN],
  ["Kaplan-Meier\nmedian", "12", "n = 8", "uses what each subject actually contributes", SEA],
];
let ax = 0.7;
ans.forEach((a) => {
  card(s, ax, 1.8, 3.95, 3.5, WHITE);
  s.addShape(p.ShapeType.rect, { x: ax, y: 1.8, w: 3.95, h: 0.12, fill: { color: a[4] }, line: { type: "none" } });
  s.addText(a[0], { x: ax + 0.28, y: 2.05, w: 3.4, h: 0.8, fontFace: BFONT, bold: true, fontSize: 14, color: INK, lineSpacing: 19, margin: 0 });
  s.addText(a[1], { x: ax + 0.28, y: 2.95, w: 3.4, h: 0.7, fontFace: HFONT, bold: true, fontSize: 34, color: a[4], margin: 0 });
  s.addText("days   " + a[2], { x: ax + 0.28, y: 3.65, w: 3.4, h: 0.35, fontFace: MONO, fontSize: 12, color: MUTED, margin: 0 });
  s.addText(a[3], { x: ax + 0.28, y: 4.1, w: 3.4, h: 1.05, fontFace: BFONT, fontSize: 12.5, color: MUTED, lineSpacing: 17, margin: 0 });
  ax += 4.15;
});
card(s, 0.7, 5.55, 12.0, 1.3, PAPER);
s.addText([
  { text: "“Assume the event happened” is NOT the conservative choice. ", options: { bold: true, color: WARN } },
  { text: "For time to an adverse event, longer looks safer — so inflating the time flatters the drug. And it fabricates data: a censored subject is one about whom we know one true thing, that they went 28 days event-free. Assigning them an event replaces that truth with a falsehood.",
    options: { color: MUTED } },
], { x: 1.0, y: 5.72, w: 11.4, h: 1.0, fontFace: BFONT, fontSize: 13.5, color: INK, lineSpacing: 19, margin: 0 });
s.addNotes("All three numbers computed from ABC-01. The censored subjects sit in the risk set for all 28 days — making each real event a smaller proportional drop — then leave without causing a drop. That IS the mechanism: contribute the information you have, and nothing you do not.");

// ============ 5. CNSDTDSC ============
s = p.addSlide(); bg(s, PAPER);
header(s, "Why CNSDTDSC exists", "CNSR says we stopped looking. It cannot say why.");
const rs = [
  ["LAST DOSE / DATA CUTOFF", "Non-informative", "the reason has nothing to do with the subject's risk — the KM assumption holds", SEA],
  ["LAST CONTACT (lost to follow-up)", "Possibly INFORMATIVE", "people who disappear from studies are sometimes people who felt unwell", WARN],
];
let ry = 1.85;
rs.forEach((r) => {
  card(s, 0.7, ry, 12.0, 1.5, WHITE);
  s.addShape(p.ShapeType.rect, { x: 0.7, y: ry, w: 0.09, h: 1.5, fill: { color: r[3] }, line: { type: "none" } });
  s.addText(r[0], { x: 1.05, y: ry + 0.16, w: 5.0, h: 0.45, fontFace: MONO, bold: true, fontSize: 14, color: INK, margin: 0 });
  s.addText(r[1], { x: 1.05, y: ry + 0.68, w: 5.0, h: 0.4, fontFace: BFONT, bold: true, fontSize: 14, color: r[3], margin: 0 });
  s.addText(r[2], { x: 6.4, y: ry + 0.3, w: 6.0, h: 0.9, valign: "middle", fontFace: BFONT, fontSize: 13.5, color: MUTED, lineSpacing: 18, margin: 0 });
  ry += 1.65;
});
card(s, 0.7, 5.2, 12.0, 1.6, INK);
s.addText("With only CNSR, both look identical — two subjects leaving the risk set.",
  { x: 1.05, y: 5.4, w: 11.4, h: 0.4, fontFace: HFONT, bold: true, fontSize: 18, color: WHITE, margin: 0 });
s.addText("With CNSDTDSC a reviewer can count them separately and judge whether the independent-censoring assumption is credible. That is a question about the VALIDITY OF THE ANALYSIS, not a detail of bookkeeping — which is why the standard requires the variable.",
  { x: 1.05, y: 5.88, w: 11.4, h: 0.8, fontFace: BFONT, fontSize: 13.5, color: "C7DCE0", lineSpacing: 19, margin: 0 });
s.addNotes("In ABC-01 both censorings are LAST DOSE on completers — the benign case. Exercise 4 asks for two more reasons. Worth mentioning competing risks briefly: death from an unrelated cause when the endpoint is not death needs more than simple censoring, and that is beyond this course.");

// ============ 6. VALIDATION ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Validating an ADaM package", "What gets checked, and by whom");
const val = [
  ["Conformance rules", "ADaM Conformance Rules v4.0 — structural and metadata rules, machine-checkable. Pinnacle 21 runs these.", TEAL],
  ["Define.xml for analysis data", "Every derivation documented, including value-level metadata for each PARAMCD.", SEA],
  ["Analysis Results Metadata", "Links a specific NUMBER in a specific table back to the dataset, the rows, and the code that made it.", ACCENT],
  ["Your own assertions", "The checks conformance rules cannot know: does AOCCFL count subjects? Is the baseline rule right?", INK],
];
let vy = 1.8;
val.forEach((v) => {
  card(s, 0.7, vy, 12.0, 1.15, WHITE);
  s.addShape(p.ShapeType.rect, { x: 0.7, y: vy, w: 0.09, h: 1.15, fill: { color: v[2] }, line: { type: "none" } });
  s.addText(v[0], { x: 1.05, y: vy + 0.12, w: 4.0, h: 0.45, fontFace: BFONT, bold: true, fontSize: 15, color: v[2], margin: 0 });
  s.addText(v[1], { x: 5.3, y: vy + 0.1, w: 7.2, h: 0.95, valign: "middle", fontFace: BFONT, fontSize: 13, color: MUTED, lineSpacing: 18, margin: 0 });
  vy += 1.28;
});
card(s, 0.7, 6.95, 12.0, 0.0, WHITE);
s.addText("A conformance check confirms the dataset is well-FORMED. It cannot confirm the derivations are RIGHT. That is on you.",
  { x: 0.7, y: 6.8, w: 12, h: 0.5, fontFace: BFONT, bold: true, italic: true, fontSize: 14, color: TEAL, margin: 0 });
s.addNotes("Pinnacle 21 would pass a dataset in which HEIGHTBL is missing for all 8 subjects — it is a valid numeric variable that happens to be null. Every silent bug in this course would pass conformance. Point at data/audit_adam.py: 85 checks, each re-deriving a rule independently from SDTM, and mutation-tested to prove they can fail.");

// ============ 7. THE PAYOFF ============
s = p.addSlide(); bg(s, INK);
s.addText("THE PAYOFF", { x: 0.7, y: 1.2, w: 11, h: 0.35, fontFace: BFONT, bold: true, fontSize: 13, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Notebook 19 is the shortest in the course.", { x: 0.66, y: 1.6, w: 12, h: 0.6,
  fontFace: HFONT, bold: true, fontSize: 30, color: WHITE, margin: 0 });
s.addText("Two tables that appear in every clinical study report. Two datasets. PROC FREQ and PROC MEANS.\nZero joins. Zero derivations.",
  { x: 0.7, y: 2.3, w: 12, h: 0.9, fontFace: BFONT, fontSize: 15, color: "C7DCE0", lineSpacing: 22, margin: 0 });

const dec = [
  ["which subjects count", "SAFFL", "ADSL"],
  ["which events count", "TRTEMFL", "ADAE"],
  ["how to count a subject once", "AOCCFL / AOCCPFL", "ADAE"],
  ["what “related” means", "AREL", "ADAE"],
  ["what order severity prints", "ASEVN", "ADAE"],
  ["what counts as baseline", "ABLFL", "ADVS / ADLB"],
];
let dy = 3.35;
dec.forEach((d, i) => {
  s.addShape(p.ShapeType.rect, { x: 0.7, y: dy, w: 12.0, h: 0.5,
    fill: { color: i % 2 ? "133B4C" : "0F2E3D" }, line: { type: "none" } });
  s.addText(d[0], { x: 1.0, y: dy, w: 5.2, h: 0.5, valign: "middle", fontFace: BFONT, fontSize: 13.5, color: "C7DCE0", margin: 0 });
  s.addText(d[1], { x: 6.4, y: dy, w: 3.6, h: 0.5, valign: "middle", fontFace: MONO, bold: true, fontSize: 13, color: MINT, margin: 0 });
  s.addText(d[2], { x: 10.2, y: dy, w: 2.3, h: 0.5, valign: "middle", fontFace: BFONT, fontSize: 13, color: ACCENT, margin: 0 });
  dy += 0.5;
});
s.addText("Every hard decision made ONCE, where it is documented and checked. If they lived in the table programs, two tables in the same submission would eventually disagree — with no error, and no way to tell which was right.",
  { x: 0.7, y: 6.5, w: 12, h: 0.75, fontFace: BFONT, italic: true, fontSize: 13.5, color: MINT, lineSpacing: 19, margin: 0 });
s.addNotes("This is the slide the whole ADaM track has been building toward. Read the decision list aloud and let it land: none of these are in the table program. Ask the room what happens on the day someone changes the definition of 'related' — with ADaM, one variable and every table follows.");

// ============ 8. TRACEABILITY, END TO END ============
s = p.addSlide(); bg(s, WHITE);
header(s, "One last chain", "From a number in a table to a page a site filled in");
const chain = [
  ["Table 14.1.1", "mean BMIBL", MUTED, "SAP / shell"],
  ["ADSL", "BMIBL", ACCENT, "define.xml"],
  ["ADSL", "HEIGHTBL\nWEIGHTBL", ACCENT, "define.xml"],
  ["SDTM VS", "VSSTRESN", TEAL, "define.xml"],
  ["aCRF", "Vital Signs\npage", INK, "acrf.pdf"],
];
chain.forEach((c, i) => {
  const tx = 0.7 + i * 2.53;
  card(s, tx, 1.9, 2.2, 2.0, WHITE);
  s.addText(c[0], { x: tx, y: 2.08, w: 2.2, h: 0.4, align: "center", fontFace: HFONT, bold: true, fontSize: 15, color: c[2], margin: 0 });
  s.addText(c[1], { x: tx, y: 2.55, w: 2.2, h: 0.75, align: "center", fontFace: MONO, fontSize: 11, color: INK, lineSpacing: 15, margin: 0 });
  s.addText(c[3], { x: tx, y: 3.4, w: 2.2, h: 0.35, align: "center", fontFace: BFONT, italic: true, fontSize: 10.5, color: MUTED, margin: 0 });
});
chain.slice(0, -1).forEach((c, i) => {
  s.addText("←", { x: 0.7 + i * 2.53 + 2.2, y: 2.6, w: 0.33, h: 0.5, align: "center",
    fontFace: BFONT, fontSize: 20, color: SEA, margin: 0 });
});
card(s, 0.7, 4.25, 12.0, 1.35, PAPER);
s.addText([
  { text: "A regulator does not accept a number because a sponsor computed it. ", options: { bold: true } },
  { text: "They accept it because they can follow it back to a page a site completed, and recompute it at every step. Break one link — a derivation that exists only in a program, a baseline rule that lives in someone's head — and the chain fails there, however right the arithmetic was.",
    options: { color: MUTED } },
], { x: 1.0, y: 4.45, w: 11.4, h: 1.0, fontFace: BFONT, fontSize: 13.5, color: INK, lineSpacing: 19, margin: 0 });
card(s, 0.7, 5.8, 12.0, 1.2, WHITE);
s.addText([
  { text: "The one deliberate exception: ", options: { bold: true, color: TEAL } },
  { text: "the derived BMI parameter in ADVS has BLANK SRCDOM/SRCSEQ, because it has no single source record. Its traceability runs through define.xml's derivation text instead of through a pointer. A documented link, not a missing one — and being able to explain why is a good final question for this course.",
    options: { color: MUTED } },
], { x: 1.0, y: 5.98, w: 11.4, h: 0.95, fontFace: BFONT, fontSize: 13, color: INK, lineSpacing: 18, margin: 0 });
s.addNotes("End of the ADaM track. If they remember one thing, make it this slide: ADaM is not a standard for its own sake, it is a single documented place for every decision, so that a reviewer who disagrees with one of them knows exactly which number to recompute and where. Congratulate them — they have now taken raw CRF data all the way to a submission table.");

p.writeFile({ fileName: "/Volumes/D Drive/SDTM Training/Bootcamp/presentations/18_tte_validation.pptx" })
  .then(f => console.log("WROTE", f))
  .catch(e => { console.error(e); process.exit(1); });
