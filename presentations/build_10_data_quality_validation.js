// Build: 10_data_quality_validation.pptx — "Data Quality "Findings Domains" Validation"
// Bootcamp Module 10. Concept deck for Day 9.
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "Clinical Programming Bootcamp";
p.title = "Data Quality & Validation";

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
s.addShape(p.ShapeType.ellipse, { x: 10.7, y: -0.6, w: 3.2, h: 3.2, fill: { color: ROSE }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.45, y: 0.15, w: 1.7, h: 1.7, fill: { color: TEAL }, line: { type: "none" } });
s.addText("CLINICAL PROGRAMMING BOOTCAMP  ·  MODULE 10", { x: 0.7, y: 2.0, w: 9, h: 0.4,
  fontFace: BFONT, fontSize: 14, bold: true, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Data Quality\n& Validation", { x: 0.66, y: 2.5, w: 9.6, h: 1.7,
  fontFace: HFONT, fontSize: 44, bold: true, color: WHITE, lineSpacing: 48, margin: 0 });
s.addText("Would this submission survive Pinnacle 21?", { x: 0.7, y: 4.25, w: 9.6, h: 0.6,
  fontFace: HFONT, fontSize: 22, color: MINT, margin: 0 });
s.addText("You have built seven domains. Now look at them the way a regulator's validation tool does — as one package that must hold together.",
  { x: 0.7, y: 5.0, w: 9.2, h: 0.9, fontFace: BFONT, fontSize: 16, color: "C7DCE0", margin: 0 });
s.addText("Hands-on: Notebook 12 · QC & Validation Checks (SAS)",
  { x: 0.7, y: 6.5, w: 12, h: 0.4, fontFace: BFONT, fontSize: 12, italic: true, color: MUTEDDK, margin: 0 });
s.addNotes("Module 10 opens the last content day. The framing: everything so far built data; this module judges it. The single idea to land is that a conformance check is just a query expecting zero rows — demystify Pinnacle 21 from the start.");

// ============ 2. WHAT PINNACLE 21 IS ============
s = _add(); bg(s, WHITE);
header(s, "The tool everyone runs", "Pinnacle 21 — what it actually does");
card(s, 0.7, 1.8, 12.0, 1.35, PAPER);
s.addText("It is not magic. It is a library of rules.", { x: 1.0, y: 1.95, w: 11.4, h: 0.4, fontFace: HFONT, bold: true, fontSize: 17, color: INK, margin: 0 });
s.addText("Pinnacle 21 (Community and Enterprise) reads your SDTM/ADaM datasets and define.xml, runs thousands of published CDISC conformance rules against them, and produces a report. Sponsors run it before every submission; the FDA runs its own copy when the package arrives.",
  { x: 1.0, y: 2.35, w: 11.4, h: 0.75, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
const flow = [["YOUR DATASETS", "dm.xpt · ae.xpt · …", SEA], ["+ RULES", "CDISC conformance library", ACCENT], ["= REPORT", "errors · warnings · notices", ROSE]];
flow.forEach((f, i) => {
  const x = 0.7 + i * 4.15;
  s.addShape(p.ShapeType.roundRect, { x, y: 3.5, w: 3.85, h: 1.5, rectRadius: 0.1, fill: { color: PAPER }, line: { color: f[2], width: 2 } });
  s.addText(f[0], { x, y: 3.75, w: 3.85, h: 0.5, align: "center", fontFace: HFONT, bold: true, fontSize: 18, color: f[2], margin: 0 });
  s.addText(f[1], { x: x + 0.2, y: 4.3, w: 3.45, h: 0.5, align: "center", fontFace: MONO, fontSize: 12, color: MUTED, margin: 0 });
  if (i < 2) s.addText("▶", { x: x + 3.72, y: 4.05, w: 0.5, h: 0.4, align: "center", fontSize: 18, color: INK, margin: 0 });
});
card(s, 0.7, 5.3, 12.0, 1.6, "E7F4F2");
s.addText("The one sentence to remember", { x: 1.0, y: 5.45, w: 11.4, h: 0.35, fontFace: HFONT, bold: true, fontSize: 16, color: TEAL, margin: 0 });
s.addText([{ text: "A conformance check is a query that should return zero rows.  ", options: { bold: true, color: INK } },
           { text: "If it returns any, that is a finding. Thousands of rules, one shape. Once you see that, Pinnacle 21 stops being a black box and becomes something you could write yourself — which is exactly what Notebook 12 has you do.", options: { color: INK } }],
  { x: 1.0, y: 5.85, w: 11.4, h: 0.95, fontFace: BFONT, fontSize: 13, valign: "middle", margin: 0 });
s.addNotes("Community edition is free and widely used; Enterprise adds workflow and more checks. The zero-rows framing is the thesis of the whole module. Stress that the FDA runs its OWN validation — you are not trying to fool your own tool, you are previewing what the regulator will see.");

// ============ 3. THE THREE SEVERITIES ============
s = _add(); bg(s, WHITE);
header(s, "Not all findings are equal", "Error, Warning, Notice");
const sev = [
  ["ERROR", "Blocks the submission", "A rule the data MUST satisfy. An error means the package is not fit to send until it is fixed or formally explained.", "SEX outside {M,F,U} · a missing Required variable · an orphan record", ROSE],
  ["WARNING", "Explain or fix", "Probably wrong, but the record is still usable. You fix it, or you justify it in the reviewer's guide.", "an unexpected severity value · a study day that looks extreme", ACCENT],
  ["NOTICE", "For your awareness", "Informational. Often expected given the study design. You confirm it is intended.", "a domain with no records · a permissible variable left null", SEA],
];
let sy = 1.85;
sev.forEach((r) => {
  card(s, 0.7, sy, 12.0, 1.55, PAPER);
  s.addShape(p.ShapeType.rect, { x: 0.7, y: sy, w: 0.09, h: 1.55, fill: { color: r[4] }, line: { type: "none" } });
  s.addText(r[0], { x: 1.0, y: sy + 0.16, w: 2.4, h: 0.42, fontFace: HFONT, bold: true, fontSize: 19, color: r[4], margin: 0 });
  s.addText(r[1], { x: 1.0, y: sy + 0.62, w: 2.5, h: 0.6, fontFace: BFONT, bold: true, fontSize: 12, color: INK, margin: 0 });
  s.addText(r[2], { x: 3.7, y: sy + 0.2, w: 5.0, h: 1.2, fontFace: BFONT, fontSize: 12.5, color: MUTED, valign: "middle", margin: 0 });
  s.addText(r[3], { x: 8.9, y: sy + 0.2, w: 3.6, h: 1.2, fontFace: BFONT, italic: true, fontSize: 11.5, color: r[4], valign: "middle", margin: 0 });
  sy += 1.67;
});
s.addText("Severity is a JUDGEMENT about impact, not a fixed label. A sponsor re-classifies findings based on what the study is trying to prove — an unexpected AESEV is a warning in most studies and an error in one whose endpoint is severity-based.",
  { x: 0.7, y: 6.9, w: 12, h: 0.5, fontFace: BFONT, italic: true, fontSize: 12.5, color: TEAL, margin: 0 });
s.addNotes("The re-classification point is the sophisticated one and is Exercise 5 in Notebook 12. Trainees assume the tool's severity is authoritative; it is a sensible default that the sponsor owns. 'It's only a warning' is never a reason to ignore something.");

// ============ 4. THE FOUR CATEGORIES ============
s = _add(); bg(s, INK);
headerDark(s, "What the rules check", "Four questions, asked thousands of ways");
const cats = [
  ["KEY INTEGRITY", "Is every record uniquely identifiable, and does everything link?", "USUBJID + --SEQ unique · no orphan subjects · SUPP points at a real parent", TEAL],
  ["REQUIRED DATA", "Is everything the standard demands actually present?", "Required variables populated · expected domains exist", MINT],
  ["CONTROLLED TERMS", "Does every coded value come from its codelist?", "SEX in {M,F,U} · AESER in {Y,N} · units from the UNIT codelist", ACCENT],
  ["VALUE LOGIC", "Do the values make clinical and temporal sense?", "no Day 0 · end date >= start date · --BLFL is Y-or-null · result within plausible range", SEA],
];
let cy2 = 2.0;
cats.forEach((c) => {
  s.addShape(p.ShapeType.roundRect, { x: 0.7, y: cy2, w: 12.0, h: 1.15, rectRadius: 0.08, fill: { color: "163B4B" }, line: { color: c[3], width: 1.3 } });
  s.addText(c[0], { x: 1.0, y: cy2 + 0.16, w: 3.2, h: 0.4, fontFace: HFONT, bold: true, fontSize: 15, color: c[3], margin: 0 });
  s.addText(c[1], { x: 1.0, y: cy2 + 0.58, w: 3.3, h: 0.5, fontFace: BFONT, italic: true, fontSize: 11, color: "AFCBD3", margin: 0 });
  s.addText(c[2], { x: 4.5, y: cy2 + 0.28, w: 8.0, h: 0.65, fontFace: MONO, fontSize: 11.5, color: "DCEBEF", valign: "middle", margin: 0 });
  cy2 += 1.27;
});
s.addText("Notebook 12 writes at least one real check in every category — and the whole ABC-01 library passes all of them, because you built it correctly.",
  { x: 0.7, y: 7.0, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 12.5, color: MINT, margin: 0 });
s.addNotes("These four buckets are the mental model for the entire rule library. Every one of the thousands of Pinnacle 21 rules is a specific instance of one of these four questions. Map the checks the trainees already wrote (no Day 0, --BLFL Y-or-null) onto the categories.");

// ============ 5. CROSS-DOMAIN ============
s = _add(); bg(s, WHITE);
header(s, "The checks that matter most", "A domain can be perfect and still be wrong");
card(s, 0.7, 1.8, 12.0, 1.3, "FDF1E7");
s.addText("Internal consistency is not correctness.", { x: 1.0, y: 1.95, w: 11.4, h: 0.4, fontFace: HFONT, bold: true, fontSize: 17, color: RUST, margin: 0 });
s.addText("Every single-domain rule can pass while the SET of datasets is incoherent. These cross-domain checks are the only ones that catch it — and they are the ones a beginner forgets, because each dataset looks fine on its own.",
  { x: 1.0, y: 2.35, w: 11.4, h: 0.7, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
grid(s, 0.7, 3.35, [3.7, 5.0, 3.3], [
  ["Cross-check", "What it compares", "If it fails"],
  ["No orphan subjects", "every domain USUBJID vs DM", "a subject with data but no demographics"],
  ["SUPP linkage", "SUPPAE.IDVARVAL vs AE.AESEQ", "a qualifier pointing at nothing"],
  ["RFSTDTC agreement", "EX first dose vs DM.RFSTDTC", "every study day measured from a wrong clock"],
], { fontSize: 12, rowH: 0.46, highlight: (r, c) => r === 3 ? "C0455B" : null });
card(s, 0.7, 5.5, 12.0, 1.4, "E7F4F2");
s.addText("Why RFSTDTC agreement is the deepest check in the suite", { x: 1.0, y: 5.63, w: 11.4, h: 0.35, fontFace: HFONT, bold: true, fontSize: 15, color: TEAL, margin: 0 });
s.addText("If EX and DM disagree about first dose, every --DY shifts — and shifts CONSISTENTLY, so no within-domain check notices. The error is only visible by comparing two independent records of the same fact. That is the whole reason a submission is validated as a package, never one file at a time.",
  { x: 1.0, y: 6.0, w: 11.4, h: 0.85, fontFace: BFONT, fontSize: 12.5, color: INK, margin: 0 });
s.addNotes("This slide is the intellectual core of the module and Exercise 4 in Notebook 12. The 'both wrong by the same amount' scenario is the killer: internal checks compare a value to another value derived from the same source, so a shared error is invisible. Only cross-source comparison finds it.");

// ============ 6. READING A REPORT ============
s = _add(); bg(s, INK);
headerDark(s, "Reading the report", "What a findings table looks like — and how to read it");
grid(s, 0.7, 1.95, [1.3, 1.5, 1.5, 6.9, 0.8], [
  ["Result", "Severity", "Rule", "Finding", "Rows"],
  ["FAIL", "ERROR", "SD0002", "ARMCD is Required and must be populated", "1"],
  ["FAIL", "ERROR", "SD0001", "AESTDY must never be 0 - there is no Day 0", "1"],
  ["FAIL", "ERROR", "SD0011", "SUPPAE row with no matching AE parent", "1"],
  ["FAIL", "ERROR", "SD0004", "VSBLFL must be Y or null - never N", "1"],
  ["PASS", "ERROR", "SD0012", "EX first dose disagrees with DM.RFSTDTC", "0"],
  ["PASS", "WARNING", "CT0002", "AESEV outside expected severity codelist", "0"],
], { fontSize: 11, rowH: 0.42, headFill: "0E2A38",
     highlight: (r, c) => (r <= 4 && r >= 1 && c === 0) ? "C0455B" : ((r >= 5) && c === 0 ? "1FA8A0" : null) });
s.addText("This is the injected-defect run from Notebook 12 — four planted errors, all caught.",
  { x: 0.7, y: 4.85, w: 12, h: 0.35, fontFace: BFONT, italic: true, fontSize: 12, color: MINT, margin: 0 });
card(s, 0.7, 5.35, 5.85, 1.55, "1A4152");
s.addText("How a reviewer reads it", { x: 1.0, y: 5.5, w: 5.2, h: 0.35, fontFace: HFONT, bold: true, fontSize: 15, color: MINT, margin: 0 });
s.addText("Errors first, worst domain first. Each finding names a RULE (traceable to CDISC), a COUNT, and enough to locate it. Zero rows is a pass — an empty report is the goal.",
  { x: 1.0, y: 5.9, w: 5.2, h: 1.0, fontFace: BFONT, fontSize: 12, color: "DCEBEF", lineSpacing: 15, margin: 0 });
card(s, 6.85, 5.35, 5.85, 1.55, "3A2530");
s.addText("What you must NOT do", { x: 7.15, y: 5.5, w: 5.2, h: 0.35, fontFace: HFONT, bold: true, fontSize: 15, color: "FF9DAE", margin: 0 });
s.addText("Do not \"fix\" a finding by deleting the record or blanking the value. A finding is a QUESTION about the data. You resolve it by correcting the source or explaining it — never by hiding it.",
  { x: 7.15, y: 5.9, w: 5.2, h: 1.0, fontFace: BFONT, fontSize: 12, color: "F0D6DB", lineSpacing: 15, margin: 0 });
s.addNotes("The 'do not hide it' point is the professional-ethics beat of the module, echoing the LB abnormal-lab slide from Day 7. A validation finding is data, not an obstacle. Deleting the orphan SUPPAE row makes the report clean and the submission wrong.");

// ============ 7. THE REVIEWER'S GUIDE ============
s = _add(); bg(s, WHITE);
header(s, "When a finding is expected", "The Reviewer's Guide (cSDRG)");
card(s, 0.7, 1.85, 12.0, 1.6, PAPER);
s.addText("Not every finding is a defect. Some are consequences of how the study was designed.", { x: 1.0, y: 2.0, w: 11.4, h: 0.4, fontFace: HFONT, bold: true, fontSize: 16, color: INK, margin: 0 });
s.addText("ABC-01 would raise a NOTICE that only 4 of 8 subjects appear in LB. That is not an error — this protocol collects labs on a subset. But the validation tool cannot know that, so it flags it, and YOU must tell the reviewer it is intended.",
  { x: 1.0, y: 2.45, w: 11.4, h: 0.9, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
s.addText("That explanation lives in the cSDRG — the clinical Study Data Reviewer's Guide", { x: 0.7, y: 3.7, w: 12, h: 0.35, fontFace: BFONT, bold: true, fontSize: 13, color: TEAL, margin: 0 });
[["What it is", "A document submitted alongside the datasets that explains the study's data to a reviewer."],
 ["What it holds", "Design decisions, known validation findings and why each is acceptable, deviations from the standard."],
 ["Why it matters", "It turns a flagged-but-intended finding from a red mark into a documented, defensible choice."]].forEach((r, i) => {
  card(s, 0.7 + i * 4.1, 4.15, 3.85, 2.3, i === 2 ? "E7F4F2" : WHITE);
  s.addText(r[0], { x: 0.95 + i * 4.1, y: 4.32, w: 3.4, h: 0.4, fontFace: HFONT, bold: true, fontSize: 15, color: TEAL, margin: 0 });
  s.addText(r[1], { x: 0.95 + i * 4.1, y: 4.78, w: 3.4, h: 1.5, fontFace: BFONT, fontSize: 12.5, color: MUTED, margin: 0 });
});
s.addText("A submission is datasets PLUS documentation. A clean-but-unexplained package and a flagged-but-fully-explained one — the reviewer trusts the second.",
  { x: 0.7, y: 6.6, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 12.5, color: INK, margin: 0 });
s.addNotes("cSDRG is covered lightly here and again in Deck 12. The 4-of-8-in-LB example is real to ABC-01 and concrete. The takeaway: the goal is not zero findings at any cost, it is that every finding is either fixed or explained. An unexplained clean report can hide suppressed problems.");

// ============ 8. MISTAKES ============
s = _add(); bg(s, INK);
headerDark(s, "Before Notebook 12", "Five ways QC goes wrong");
const m10 = [
  ["Writing the check for the GOOD state", "A conformance check finds VIOLATIONS. The WHERE describes what must never happen.", "expect zero rows"],
  ["Only checking one domain at a time", "The worst errors live BETWEEN datasets, not inside them.", "compare EX to DM, SUPP to parent"],
  ["Treating a clean report as correct", "It proves conformance, not truth. Both can be wrong together.", "conformance is not correctness"],
  ["Hiding a finding", "Deleting the record makes the report clean and the submission wrong.", "fix the source or explain it"],
  ["Assuming every finding blocks", "Severity is a judgement. A WARNING is explained, not necessarily fixed.", "read severity, use the cSDRG"],
];
let my10 = 2.0;
m10.forEach((m, i) => {
  s.addShape(p.ShapeType.roundRect, { x: 0.7, y: my10, w: 12.0, h: 0.94, rectRadius: 0.08, fill: { color: i % 2 ? "163B4B" : "1A4152" }, line: { color: "24576B", width: 1 } });
  circle(s, 0.95, my10 + 0.2, 0.54, [ROSE, ACCENT, SEA, TEAL, MINT][i], String(i + 1), i === 4 ? INK : WHITE, 15);
  s.addText(m[0], { x: 1.68, y: my10 + 0.12, w: 4.6, h: 0.38, fontFace: BFONT, bold: true, fontSize: 13, color: WHITE, margin: 0 });
  s.addText(m[1], { x: 1.68, y: my10 + 0.5, w: 6.7, h: 0.38, fontFace: BFONT, fontSize: 11, color: "AFCBD3", margin: 0 });
  s.addText("→ " + m[2], { x: 8.5, y: my10 + 0.28, w: 4.0, h: 0.42, fontFace: BFONT, italic: true, fontSize: 11, color: MINT, valign: "middle", margin: 0 });
  my10 += 1.02;
});
s.addText("Next:  Notebook 12 · QC & Validation Checks   →   Deck 11 · Relationships & Trial Design",
  { x: 0.7, y: 6.85, w: 12, h: 0.4, fontFace: BFONT, bold: true, fontSize: 13, color: MINT, margin: 0 });
s.addNotes("Send them into Notebook 12 with mistake 1 as the mechanical thing to get right and mistakes 3-4 as the professional judgement to carry. The notebook makes all five concrete.");

p.writeFile({ fileName: "/Volumes/D Drive/SDTM Training/Bootcamp/presentations/10_data_quality_validation.pptx" })
  .then(f => console.log("WROTE", f));
