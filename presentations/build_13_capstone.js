// Build: 13_capstone.pptx — "Capstone & Bootcamp Wrap-up"
// Bootcamp Module 13. Capstone briefing + course wrap-up (Day 10).
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "Clinical Programming Bootcamp";
p.title = "Capstone & Bootcamp Wrap-up";

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
s.addShape(p.ShapeType.ellipse, { x: 9.5, y: -1.7, w: 5.6, h: 5.6, fill: { color: "133B4C" }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 10.6, y: -0.7, w: 3.4, h: 3.4, fill: { color: ACCENT }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.5, y: 0.2, w: 1.8, h: 1.8, fill: { color: TEAL }, line: { type: "none" } });
s.addText("CLINICAL PROGRAMMING BOOTCAMP  ·  MODULE 13  ·  CAPSTONE", { x: 0.7, y: 2.0, w: 10, h: 0.4,
  fontFace: BFONT, fontSize: 14, bold: true, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Map it yourself", { x: 0.66, y: 2.5, w: 10, h: 1.1,
  fontFace: HFONT, fontSize: 46, bold: true, color: WHITE, margin: 0 });
s.addText("A study you have never seen — DEF-01 — from raw to SDTM, on your own", { x: 0.7, y: 3.75, w: 10, h: 0.6,
  fontFace: HFONT, fontSize: 22, color: MINT, margin: 0 });
s.addText("Everything you have built so far had a worked notebook beside it. This one does not. That is the point: mapping data you have never seen is the actual job.",
  { x: 0.7, y: 4.55, w: 9.4, h: 0.9, fontFace: BFONT, fontSize: 16, color: "C7DCE0", margin: 0 });
s.addText("Deliverable: 13_capstone_DEF01_SKELETON.sas  →  six SDTM domains  →  verify_capstone.sas",
  { x: 0.7, y: 6.5, w: 12, h: 0.4, fontFace: BFONT, fontSize: 12, italic: true, color: MUTED, margin: 0 });
s.addNotes("Module 13, the final day. Frame this as graduation, not a test: they have every skill needed. The one new thing is the absence of a scaffold. Reassure them their ABC-01 notebooks are the right starting point — the work is in adapting, not starting over.");

// ============ 2. THE STUDY ============
s = _add(); bg(s, WHITE);
header(s, "Your assignment", "DEF-01 — a Phase 2 study in Type 2 diabetes");
card(s, 0.7, 1.8, 12.0, 1.35, PAPER);
s.addText("Drug X 50 mg once daily vs placebo · 6 subjects · 2 sites · 12 weeks", { x: 1.0, y: 1.96, w: 11.4, h: 0.4, fontFace: HFONT, bold: true, fontSize: 17, color: INK, margin: 0 });
s.addText("Site 01 is in Canada (metric); site 02 is in the USA (US customary units). Each subject is screened, dosed at Baseline, and followed to a Week 12 visit. The raw data is five EDC-style CSVs — one per form — with the same messy realities you have been cleaning up all course.",
  { x: 1.0, y: 2.38, w: 11.4, h: 0.7, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
s.addText("Build one domain from every observation class", { x: 0.7, y: 3.4, w: 12, h: 0.35, fontFace: BFONT, bold: true, fontSize: 13, color: TEAL, margin: 0 });
const doms = [["DM", "Special Purpose", "demographics + reference dates", TEAL],
              ["EX", "Interventions", "study-drug exposure", SEA],
              ["AE + SUPPAE", "Events", "adverse events + AETRTEM", ACCENT],
              ["VS · LB", "Findings", "vital signs + labs", MINT]];
let dy2 = 3.85;
doms.forEach((d) => {
  card(s, 0.7, dy2, 12.0, 0.72, WHITE);
  s.addShape(p.ShapeType.rect, { x: 0.7, y: dy2, w: 0.09, h: 0.72, fill: { color: d[3] }, line: { type: "none" } });
  s.addText(d[0], { x: 1.0, y: dy2 + 0.16, w: 2.6, h: 0.42, fontFace: MONO, bold: true, fontSize: 15, color: d[3], valign: "middle", margin: 0 });
  s.addText(d[1], { x: 3.7, y: dy2 + 0.16, w: 3.2, h: 0.42, fontFace: BFONT, bold: true, fontSize: 12.5, color: INK, valign: "middle", margin: 0 });
  s.addText(d[2], { x: 7.0, y: dy2 + 0.16, w: 5.4, h: 0.42, fontFace: BFONT, fontSize: 12, color: MUTED, valign: "middle", margin: 0 });
  dy2 += 0.8;
});
s.addText("Disposition and Concomitant Medications are out of scope — five domains is a full end-to-end pass without being a slog.",
  { x: 0.7, y: 7.05, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 12, color: TEAL, margin: 0 });
s.addNotes("Every observation class is represented, so nothing they learned goes untested. Point them at def01_data_dictionary.md as the first thing to read — it describes every raw field and, crucially, the four traps.");

// ============ 3. THE FOUR TRAPS ============
s = _add(); bg(s, INK);
headerDark(s, "Four things that will break a blind copy-paste", "Your ABC-01 code is the start — but not the finish");
const traps = [
  ["1 · UNIT CONVERSION", "VS", "Site 02 collects weight in lb and temperature in °F. Keep the collected value in --ORRES; CONVERT to kg / °C in --STRESN.", ACCENT],
  ["2 · DOSING INTERRUPTION", "EX", "Subject 02/003 has two dosing periods. Keep both records; the gap is the interruption. RFSTDTC = first dose, RFENDTC = last.", SEA],
  ["3 · PARTIAL DATE", "AE", "One screening AE is dated to a month only (2024-02). Keep the partial; AESTDY is null; never impute a day. AETRTEM is still N.", MINT],
  ["4 · ABNORMAL LABS", "LB", "Many labs are HIGH — that is the diabetes, plus one ALT signal. Derive LBNRIND. Do NOT invent adverse events for them.", ROSE],
];
let ty = 2.0;
traps.forEach((t) => {
  s.addShape(p.ShapeType.roundRect, { x: 0.7, y: ty, w: 12.0, h: 1.14, rectRadius: 0.08, fill: { color: "163B4B" }, line: { color: t[3], width: 1.4 } });
  s.addText(t[0], { x: 1.0, y: ty + 0.16, w: 4.0, h: 0.38, fontFace: HFONT, bold: true, fontSize: 15, color: t[3], margin: 0 });
  s.addShape(p.ShapeType.roundRect, { x: 10.9, y: ty + 0.16, w: 1.5, h: 0.4, rectRadius: 0.05, fill: { color: t[3] }, line: { type: "none" } });
  s.addText(t[1], { x: 10.9, y: ty + 0.16, w: 1.5, h: 0.4, align: "center", valign: "middle", fontFace: MONO, bold: true, fontSize: 13, color: INK, margin: 0 });
  s.addText(t[2], { x: 1.0, y: ty + 0.56, w: 9.6, h: 0.5, fontFace: BFONT, fontSize: 12, color: "DCEBEF", valign: "middle", margin: 0 });
  ty += 1.24;
});
s.addText("None of these is a curveball — each is a realistic situation you have the tools for. They are here because ABC-01 never happened to contain them.",
  { x: 0.7, y: 6.95, w: 12, h: 0.45, fontFace: BFONT, italic: true, fontSize: 12.5, color: MINT, margin: 0 });
s.addNotes("Tell them plainly that the traps are named up front on purpose — the difficulty is in the DOING, not in spotting them. Each maps to a principle they met but ABC-01 did not exercise: unit conversion (the three result variables), interruption (one record per constant-exposure period), partial dates (no imputation), the lab/AE boundary.");

// ============ 4. HOW TO WORK & SELF-CHECK ============
s = _add(); bg(s, WHITE);
header(s, "How to work", "Attempt first, then verify — the whole course in one loop");
const steps = [
  ["Read the dictionary", "def01_data_dictionary.md describes every raw field and every trap. Start here, not in the code."],
  ["Fill in the skeleton", "13_capstone_DEF01_SKELETON.sas gives you the raw reads and a TODO per domain. Write the mapping."],
  ["Check your row counts", "DM 6 · EX 7 · AE 7 · SUPPAE 7 · VS 96 · LB 32. A wrong count localises the problem fast."],
  ["Run verify_capstone.sas", "It compares every value to the reference and reports MATCH or FAIL per domain. Aim for six MATCHes."],
  ["Fix and re-verify", "A FAIL shows the first differing lines. Read them, fix the mapping, run again — exactly how real QC works."],
];
let sy = 1.8;
steps.forEach((st, i) => {
  card(s, 0.7, sy, 12.0, 0.98, i % 2 ? PAPER : WHITE);
  circle(s, 0.95, sy + 0.2, 0.58, [TEAL, SEA, ACCENT, INK, TEAL][i], String(i + 1), WHITE, 16);
  s.addText([{ text: st[0] + "  ", options: { bold: true, fontSize: 15, color: INK } },
             { text: st[1], options: { fontSize: 12.5, color: MUTED } }],
    { x: 1.75, y: sy + 0.16, w: 10.6, h: 0.66, fontFace: BFONT, valign: "middle", margin: 0 });
  sy += 1.06;
});
s.addText("There is no worked notebook — but there IS a reference. \"Attempt first, then compare\" is how you have learned every domain; now it is the whole task.",
  { x: 0.7, y: 7.05, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 12.5, color: TEAL, margin: 0 });
s.addNotes("The loop is the deliverable, not just the datasets. A trainee who reaches six MATCHes by iterating against verify has done exactly what a working programmer does: build, validate, fix, revalidate. Encourage them to diff their FAILs rather than guess.");

// ============ 5. WHAT YOU HAVE LEARNED ============
s = _add(); bg(s, INK);
headerDark(s, "Look how far you have come", "Ten days, from zero to a full SDTM package");
const learned = [
  ["Foundations", "what a trial is, why CDISC exists, the CRF→SDTM→ADaM→submission path"],
  ["The raw truth", "raw data is never ISO; mixed formats, codes, free text, wide vs tall"],
  ["Every domain", "DM, DS, AE, SUPPAE, CM, EX, VS, LB — one from every observation class"],
  ["The cross-cutting skills", "USUBJID, --DY (no Day 0), --SEQ, Controlled Terminology, the transpose"],
  ["Quality & submission", "conformance checks, SUPPQUAL & RELREC, define.xml, XPT v5, traceability"],
  ["And now — transfer", "a study you have never seen, mapped end to end, on your own"],
];
let ly = 2.0;
learned.forEach((l, i) => {
  const last = i === 5;
  s.addShape(p.ShapeType.roundRect, { x: 0.7, y: ly, w: 12.0, h: 0.8, rectRadius: 0.07,
    fill: { color: last ? "1A4152" : "163B4B" }, line: { color: last ? ACCENT : "24576B", width: last ? 2 : 1 } });
  s.addText(l[0], { x: 1.0, y: ly + 0.18, w: 3.6, h: 0.44, fontFace: HFONT, bold: true, fontSize: 14, color: last ? ACCENT : MINT, valign: "middle", margin: 0 });
  s.addText(l[1], { x: 4.7, y: ly + 0.18, w: 7.7, h: 0.44, fontFace: BFONT, fontSize: 12, color: "DCEBEF", valign: "middle", margin: 0 });
  ly += 0.88;
});
s.addNotes("A genuine victory-lap slide. Ten days ago many of them had never seen a DATA step or heard of a domain. Now they can map a novel study. Read the rows aloud — the arc from 'what is a trial' to 'transfer' is the story of the course.");

// ============ 6. WHERE SDTM SITS ============
s = _add(); bg(s, WHITE);
header(s, "This is not the end of the pipeline", "Where SDTM sits, and what comes after");
const pipe = [["CRF / EDC", "the site collects data", MUTED, false],
              ["SDTM", "tabulation — what you now build", TEAL, true],
              ["ADaM", "analysis-ready datasets, derived from SDTM", SEA, false],
              ["TLFs", "the tables, listings & figures in the study report", ACCENT, false],
              ["Submission", "define.xml + datasets + guides → the regulator", INK, false]];
let px = 0.6;
const pw = 2.0;
pipe.forEach((p2, i) => {
  s.addShape(p.ShapeType.roundRect, { x: px, y: 2.0, w: pw, h: 1.6, rectRadius: 0.1,
    fill: { color: p2[3] ? "E7F4F2" : PAPER }, line: { color: p2[2], width: p2[3] ? 2.5 : 1 } });
  s.addText(p2[0], { x: px, y: 2.2, w: pw, h: 0.5, align: "center", fontFace: HFONT, bold: true, fontSize: 14, color: p2[2], margin: 0 });
  s.addText(p2[1], { x: px + 0.12, y: 2.72, w: pw - 0.24, h: 0.8, align: "center", fontFace: BFONT, fontSize: 10.5, color: MUTED, margin: 0 });
  if (i < 4) s.addText("▶", { x: px + pw - 0.06, y: 2.6, w: 0.4, h: 0.4, align: "center", fontSize: 15, color: INK, margin: 0 });
  px += pw + 0.35;
});
card(s, 0.7, 4.1, 12.0, 1.4, PAPER);
s.addText("You are here — and it is the foundation everything downstream stands on.", { x: 1.0, y: 4.25, w: 11.4, h: 0.4, fontFace: HFONT, bold: true, fontSize: 16, color: TEAL, margin: 0 });
s.addText("ADaM is built FROM SDTM; the analysis tables are built from ADaM; the submission wraps it all in define.xml. Every layer above depends on the tabulation data being right — which is why so much of this course was about getting it right and proving it.",
  { x: 1.0, y: 4.65, w: 11.4, h: 0.8, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
card(s, 0.7, 5.7, 12.0, 1.25, "FDF1E7");
s.addText("The natural next step: ADaM", { x: 1.0, y: 5.83, w: 11.4, h: 0.35, fontFace: HFONT, bold: true, fontSize: 15, color: RUST, margin: 0 });
s.addText("ADaM (Analysis Data Model) takes your SDTM and adds the derivations analysis needs — treatment-emergent flags applied, change-from-baseline computed, one analysis-ready row per record. If SDTM is \"what happened\", ADaM is \"what the statistician analyses\". It is the obvious place to go next.",
  { x: 1.0, y: 6.18, w: 11.4, h: 0.75, fontFace: BFONT, fontSize: 12.5, color: INK, margin: 0 });
s.addNotes("Place SDTM in the bigger pipeline so they see it is a foundation, not an endpoint. ADaM is the sequel course; mention that AETRTEM and change-from-baseline — which they touched — are exactly where ADaM begins. The dependency direction is the key idea: everything above needs SDTM correct.");

// ============ 7. WHERE TO GO NEXT / CLOSE ============
s = _add(); bg(s, INK);
headerDark(s, "Where to go from here", "The map, now that you can read it");
const next = [
  ["The real standards", "CDISC.org for the SDTMIG; NCI-EVS for Controlled Terminology. What you learned maps directly onto the published documents — they will now read as familiar.", MINT],
  ["The real tools", "Pinnacle 21 Community (free) to validate; real MedDRA and WHODrug for coding. You wrote the checks by hand — now you know what the tools do.", SEA],
  ["The next standard", "ADaM for analysis datasets, then TLFs. SDTM is the foundation; these are the floors above it.", ACCENT],
  ["Keep the instincts", "attempt then verify · fail loudly · never invent data · trace every value back. Those outlast any one standard.", ROSE],
];
let ny = 1.95;
next.forEach((n) => {
  s.addShape(p.ShapeType.roundRect, { x: 0.7, y: ny, w: 12.0, h: 1.12, rectRadius: 0.08, fill: { color: "163B4B" }, line: { color: n[2], width: 1.2 } });
  s.addText(n[0], { x: 1.0, y: ny + 0.16, w: 3.6, h: 0.5, fontFace: HFONT, bold: true, fontSize: 15, color: n[2], valign: "middle", margin: 0 });
  s.addText(n[1], { x: 4.7, y: ny + 0.16, w: 7.7, h: 0.82, fontFace: BFONT, fontSize: 12, color: "DCEBEF", valign: "middle", margin: 0 });
  ny += 1.2;
});
s.addText("You started ten days ago not knowing what a domain was. You can now map a clinical study to SDTM and prove it. Go build DEF-01 — and welcome to clinical programming.",
  { x: 0.7, y: 6.85, w: 12, h: 0.5, align: "center", fontFace: HFONT, italic: true, fontSize: 14, color: MINT, margin: 0 });
s.addNotes("The closing slide. The four instincts in the last box are the real curriculum — standards and tools change, but attempt-then-verify, fail-loudly, never-invent-data, and trace-everything-back are permanent. End on the send-off: they are clinical programmers now. Then set them loose on DEF-01.");

p.writeFile({ fileName: "/Volumes/D Drive/SDTM Training/Bootcamp/presentations/13_capstone.pptx" })
  .then(f => console.log("WROTE", f));
