// Build: 12_define_xml_submission.pptx — "Define-XML & the Submission Package"
// Bootcamp Module 12. Concept deck for Day 9.
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "Clinical Programming Bootcamp";
p.title = "Define-XML & the Submission Package";

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
s.addShape(p.ShapeType.ellipse, { x: 10.7, y: -0.6, w: 3.2, h: 3.2, fill: { color: ACCENT }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.45, y: 0.15, w: 1.7, h: 1.7, fill: { color: MINT }, line: { type: "none" } });
s.addText("CLINICAL PROGRAMMING BOOTCAMP  ·  MODULE 12", { x: 0.7, y: 2.0, w: 9, h: 0.4,
  fontFace: BFONT, fontSize: 14, bold: true, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Define-XML\n& Submission", { x: 0.66, y: 2.5, w: 9.6, h: 1.7,
  fontFace: HFONT, fontSize: 44, bold: true, color: WHITE, lineSpacing: 48, margin: 0 });
s.addText("What actually goes to the FDA — and in what format", { x: 0.7, y: 4.25, w: 9.6, h: 0.6,
  fontFace: HFONT, fontSize: 22, color: MINT, margin: 0 });
s.addText("Your datasets are only part of the package. This module covers the metadata that describes them, and the file format the regulator actually accepts.",
  { x: 0.7, y: 5.0, w: 9.2, h: 0.9, fontFace: BFONT, fontSize: 16, color: "C7DCE0", margin: 0 });
s.addText("Concept module — closes the submission story.",
  { x: 0.7, y: 6.5, w: 12, h: 0.4, fontFace: BFONT, fontSize: 12, italic: true, color: MUTEDDK, margin: 0 });
s.addNotes("Module 12 is where several loose threads from the whole course finally get their explanation — the 8-character variable names, the character dates, the codelist references. All of them exist because of the two things this module covers: XPT v5 and define.xml.");

// ============ 2. THE PACKAGE ============
s = _add(); bg(s, WHITE);
header(s, "What a submission contains", "Datasets are one of five things");
const parts = [
  ["SDTM datasets", "the tabulation data you built — as XPT v5 files", TEAL, "dm.xpt · ae.xpt · vs.xpt · …"],
  ["ADaM datasets", "analysis-ready data, derived FROM SDTM (a later course)", SEA, "adsl.xpt · adae.xpt"],
  ["define.xml", "the machine-readable metadata describing every dataset and variable", ACCENT, "define.xml"],
  ["Annotated CRF", "the blank CRF marked up with the SDTM variable each field maps to", MINT, "acrf.pdf"],
  ["Reviewer's Guides", "cSDRG and ADRG — the human explanation of the data", "C0455B", "csdrg.pdf"],
];
let py2 = 1.85;
parts.forEach((r) => {
  card(s, 0.7, py2, 12.0, 0.95, PAPER);
  s.addShape(p.ShapeType.rect, { x: 0.7, y: py2, w: 0.09, h: 0.95, fill: { color: r[2] }, line: { type: "none" } });
  s.addText(r[0], { x: 1.0, y: py2 + 0.16, w: 3.3, h: 0.4, fontFace: HFONT, bold: true, fontSize: 15, color: r[2], margin: 0 });
  s.addText(r[1], { x: 1.0, y: py2 + 0.56, w: 8.0, h: 0.32, fontFace: BFONT, fontSize: 11.5, color: MUTED, margin: 0 });
  s.addText(r[3], { x: 9.2, y: py2 + 0.28, w: 3.3, h: 0.42, fontFace: MONO, fontSize: 11.5, color: INK, valign: "middle", margin: 0 });
  py2 += 1.03;
});
s.addText("You built the first box. This module is about the middle three — the metadata and format that make the datasets usable by someone who has never seen your study.",
  { x: 0.7, y: 7.05, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 12, color: TEAL, margin: 0 });
s.addNotes("Set expectations: ADaM is a whole separate course, mentioned so they know SDTM is not the end. The aCRF they have actually seen — it is in the data folder. The point is that a submission is a documented PACKAGE, and undocumented datasets are nearly useless to a reviewer.");

// ============ 3. XPT V5 ============
s = _add(); bg(s, INK);
headerDark(s, "The file format", "SAS Transport v5 — and the constraints it forces");
s.addText("The FDA does not accept .sas7bdat. It accepts XPORT version 5 (XPT) — an open, decades-old format any system can read. That longevity is the point: a submission must be readable in 25 years.",
  { x: 0.7, y: 1.75, w: 12, h: 0.55, fontFace: BFONT, fontSize: 13.5, color: "AFCBD3", margin: 0 });
codeBox(s, 0.7, 2.4, 12.0,
`libname xptout xport "&outpath/dm.xpt";   /* the XPORT engine */
data xptout.dm;
    set sdtm.dm;
run;
libname xptout clear;`, MINT, "SAS  ·  writing an XPT v5 file");
const cons = [
  ["Dataset & variable names", "≤ 8 characters, uppercase", "why AESEQ, LBTESTCD, not a long name"],
  ["Variable labels", "≤ 40 characters", "the short QLABEL you have been writing"],
  ["Character values", "≤ 200 bytes", "long text must be split across --TESTCD groups"],
  ["Numeric dates", "not allowed — dates are CHARACTER ISO 8601", "why every --DTC is a string, never a SAS date"],
];
let cy3 = 4.15;
cons.forEach((c) => {
  s.addShape(p.ShapeType.roundRect, { x: 0.7, y: cy3, w: 12.0, h: 0.7, rectRadius: 0.07, fill: { color: "163B4B" }, line: { color: ACCENT, width: 1 } });
  s.addText(c[0], { x: 1.0, y: cy3 + 0.16, w: 3.6, h: 0.4, fontFace: BFONT, bold: true, fontSize: 12.5, color: WHITE, valign: "middle", margin: 0 });
  s.addText(c[1], { x: 4.7, y: cy3 + 0.16, w: 3.3, h: 0.4, fontFace: MONO, fontSize: 11.5, color: MINT, valign: "middle", margin: 0 });
  s.addText(c[2], { x: 8.1, y: cy3 + 0.16, w: 4.4, h: 0.4, fontFace: BFONT, italic: true, fontSize: 11, color: "AFCBD3", valign: "middle", margin: 0 });
  cy3 += 0.78;
});
s.addText("Every one of these explains a design choice you already met. XPT v5 is WHY SDTM looks the way it does.",
  { x: 0.7, y: 7.15, w: 12, h: 0.35, fontFace: BFONT, italic: true, fontSize: 12.5, color: MINT, margin: 0 });
s.addNotes("This is the slide that retro-justifies half the course. The 8-char names, the character dates, the short labels — trainees have followed these rules for two weeks without knowing why. The answer is a 1980s file format the FDA still mandates for its permanence. Have them run the XPT export against their SDTM library as an optional extension of Notebook 12.");

// ============ 4. WHAT DEFINE.XML IS ============
s = _add(); bg(s, WHITE);
header(s, "The most important file in the package", "define.xml — the data's instruction manual");
card(s, 0.7, 1.8, 12.0, 1.5, "E7F4F2");
s.addText("Without it, your datasets are a pile of columns with cryptic names.", { x: 1.0, y: 1.95, w: 11.4, h: 0.4, fontFace: HFONT, bold: true, fontSize: 16, color: TEAL, margin: 0 });
s.addText("define.xml is machine-readable metadata that describes EVERY dataset and EVERY variable: its label, type, length, the codelist it draws from, where it came from, and how it was derived. A reviewer opens define.xml FIRST, and their tools read it to make sense of everything else.",
  { x: 1.0, y: 2.35, w: 11.4, h: 0.9, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
s.addText("For every variable, define.xml records:", { x: 0.7, y: 3.55, w: 12, h: 0.35, fontFace: BFONT, bold: true, fontSize: 13, color: INK, margin: 0 });
grid(s, 0.7, 3.95, [3.0, 4.0, 5.0], [
  ["Metadata", "For AEOUT, say", "Why the reviewer needs it"],
  ["Label & type", "\"Outcome of AE\", text", "to read the column at all"],
  ["Codelist", "→ the AEOUT codelist", "to know the allowed values"],
  ["Origin", "CRF / DERIVED / ASSIGNED", "to trust where it came from"],
  ["Derivation", "\"decoded from raw code 1-5\"", "to reproduce or audit it"],
], { fontSize: 11.5, rowH: 0.42 });
card(s, 0.7, 6.15, 12.0, 0.85, "FDF1E7");
s.addText([{ text: "Origin is the one people underestimate.  ", options: { bold: true, color: RUST } },
           { text: "It tells the reviewer whether a value was collected on the CRF, derived by a program, or assigned by the sponsor. AETRTEM is DERIVED; AETERM is CRF. That provenance is what makes the data auditable.", options: { color: INK } }],
  { x: 1.0, y: 6.27, w: 11.4, h: 0.65, fontFace: BFONT, fontSize: 12.5, valign: "middle", margin: 0 });
s.addNotes("define.xml is generated by tools (including Pinnacle 21), not hand-written — but the programmer supplies the metadata it is built from, which is exactly the mapping spec they have been maintaining all course. The Origin concept ties back to QORIG in SUPPAE, which they have already populated with DERIVED.");

// ============ 5. IT ALL TRACES BACK ============
s = _add(); bg(s, INK);
headerDark(s, "One chain of traceability", "From the reviewer's question back to the CRF");
const chain = [
  ["A value in ae.xpt", "AEOUT = RECOVERED/RESOLVED", TEAL],
  ["define.xml says", "origin CRF, decoded via the AEOUT codelist from a 1-5 code", ACCENT],
  ["The annotated CRF shows", "the exact CRF field, tagged AEOUT", MINT],
  ["The mapping spec records", "how raw code 1 became the CT term", SEA],
  ["The blank CRF proves", "what the site was actually asked", "C0455B"],
];
let hy = 1.95;
chain.forEach((c, i) => {
  s.addShape(p.ShapeType.roundRect, { x: 1.4, y: hy, w: 10.6, h: 0.72, rectRadius: 0.08, fill: { color: "163B4B" }, line: { color: c[2], width: 1.3 } });
  s.addText(c[0], { x: 1.7, y: hy + 0.15, w: 3.5, h: 0.42, fontFace: HFONT, bold: true, fontSize: 13, color: c[2], valign: "middle", margin: 0 });
  s.addText(c[1], { x: 5.3, y: hy + 0.15, w: 6.4, h: 0.42, fontFace: BFONT, fontSize: 11.5, color: "DCEBEF", valign: "middle", margin: 0 });
  if (i < 4) s.addText("▼", { x: 6.4, y: hy + 0.7, w: 0.5, h: 0.28, align: "center", fontSize: 13, color: MUTEDDK, margin: 0 });
  hy += 0.94;
});
s.addText("A reviewer can start at any submitted value and trace it all the way back to the question the site answered. That chain — value → metadata → aCRF → spec → CRF — is what makes clinical data TRUSTWORTHY, not just tidy.",
  { x: 0.7, y: 6.95, w: 12, h: 0.45, align: "center", fontFace: BFONT, italic: true, fontSize: 12, color: MINT, margin: 0 });
s.addNotes("This is the thesis of the entire bootcamp, delivered on the second-to-last content slide. Every artefact they have built or seen — the datasets, the aCRF in the data folder, the mapping spec, the CRF PDF — is one link in this chain. SDTM is not paperwork; it is traceability, and traceability is what a regulator is actually buying.");

// ============ 6. WRAP / MISTAKES ============
s = _add(); bg(s, WHITE);
header(s, "The submission mindset", "What to carry out of Day 9");
const w12 = [
  ["Datasets alone are not a submission", "define.xml, the aCRF and the reviewer's guides are not optional extras — they are what make the data usable.", TEAL],
  ["The format shapes the standard", "8-char names, character dates, short labels — XPT v5 is why SDTM looks the way it does.", ACCENT],
  ["Origin is provenance", "every value is CRF, DERIVED or ASSIGNED, and define.xml records which. That is what makes it auditable.", SEA],
  ["Everything must trace back", "value → define.xml → aCRF → spec → CRF. If a value cannot be traced to a question, it cannot be trusted.", MINT],
];
let wy = 1.9;
w12.forEach((r, i) => {
  card(s, 0.7, wy, 12.0, 1.2, i % 2 ? PAPER : WHITE);
  s.addShape(p.ShapeType.rect, { x: 0.7, y: wy, w: 0.09, h: 1.2, fill: { color: r[2] }, line: { type: "none" } });
  s.addText(r[0], { x: 1.0, y: wy + 0.18, w: 11.4, h: 0.4, fontFace: HFONT, bold: true, fontSize: 16, color: r[2], margin: 0 });
  s.addText(r[1], { x: 1.0, y: wy + 0.62, w: 11.4, h: 0.5, fontFace: BFONT, fontSize: 12.5, color: MUTED, margin: 0 });
  wy += 1.28;
});
s.addText("Next:  Day 10 · Capstone — map a fresh study end to end",
  { x: 0.7, y: 7.05, w: 12, h: 0.4, fontFace: BFONT, bold: true, fontSize: 13, color: TEAL, margin: 0 });
s.addNotes("Close Day 9 by pulling the four ideas together: a submission is a documented, traceable package in a permanent format. The capstone then asks them to produce a slice of one themselves. This is the last concept slide of the course proper.");

p.writeFile({ fileName: "/Volumes/D Drive/SDTM Training/Bootcamp/presentations/12_define_xml_submission.pptx" })
  .then(f => console.log("WROTE", f));
