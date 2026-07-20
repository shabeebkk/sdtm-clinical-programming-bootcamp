// Build: 08_controlled_terminology.pptx — "Controlled Terminology in Practice"
// Bootcamp Module 08. Concept deck for Day 8.
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "Clinical Programming Bootcamp";
p.title = "Controlled Terminology in Practice";

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
s.addShape(p.ShapeType.ellipse, { x: 10.7, y: -0.6, w: 3.2, h: 3.2, fill: { color: ACCENT }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.45, y: 0.15, w: 1.7, h: 1.7, fill: { color: SEA }, line: { type: "none" } });
s.addText("CLINICAL PROGRAMMING BOOTCAMP  ·  MODULE 08", { x: 0.7, y: 2.0, w: 9, h: 0.4,
  fontFace: BFONT, fontSize: 14, bold: true, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Controlled\nTerminology", { x: 0.66, y: 2.5, w: 9.6, h: 1.7,
  fontFace: HFONT, fontSize: 44, bold: true, color: WHITE, lineSpacing: 48, margin: 0 });
s.addText("Making every study say the same thing the same way", { x: 0.7, y: 4.25, w: 9.6, h: 0.6,
  fontFace: HFONT, fontSize: 22, color: MINT, margin: 0 });
s.addText("You have already applied CT in five domains. This module explains what you were actually doing — and how it works when there are 200 values instead of 6.",
  { x: 0.7, y: 5.0, w: 9.2, h: 0.9, fontFace: BFONT, fontSize: 16, color: "C7DCE0", margin: 0 });
s.addText("Hands-on: Notebook 10 · Applying Controlled Terminology (SAS)",
  { x: 0.7, y: 6.5, w: 12, h: 0.4, fontFace: BFONT, fontSize: 12, italic: true, color: MUTED, margin: 0 });
s.addNotes("Module 08. Trainees have met CT piecemeal since Day 4 — SEX in DM, four flavours in AE, LBTEST in LB. This module names the thing and gives them the general method. The framing that lands: CT is what makes a reviewer able to pool YOUR study with fifty others.");

// ============ 2. GOALS ============
s = _add(); bg(s, WHITE);
header(s, "Module goals", "By the end of this module you can…");
const goals08 = [
  ["Say what a codelist is", "and where the authoritative version comes from."],
  ["Tell extensible from non-extensible", "and know which one you may add a value to."],
  ["Recognise the four kinds of CT work", "decode, normalise, rename, derive — you have done all four already."],
  ["Write mapping code that fails loudly", "instead of silently blanking what it does not recognise."],
  ["Explain CT versioning", "why a study pins a dated release and never drifts."],
];
let gy08 = 1.75;
goals08.forEach((g, i) => {
  card(s, 0.7, gy08, 12.0, 1.02, i % 2 ? PAPER : WHITE);
  circle(s, 0.95, gy08 + 0.21, 0.6, [TEAL, SEA, ACCENT, INK, TEAL][i], String(i + 1), WHITE, 17);
  s.addText([{ text: g[0] + "  ", options: { bold: true, fontSize: 16, color: INK } },
             { text: g[1], options: { fontSize: 13.5, color: MUTED } }],
    { x: 1.75, y: gy08 + 0.16, w: 10.6, h: 0.7, fontFace: BFONT, valign: "middle", margin: 0 });
  gy08 += 1.1;
});
s.addNotes("Goal 4 is the one with professional consequences. Every mapping SELECT they have written so far ends with an otherwise branch that blanks the value — fine for a teaching dataset, dangerous in production. Notebook 10 has them fix it.");

// ============ 3. WHY CT EXISTS ============
s = _add(); bg(s, WHITE);
header(s, "The problem", "Six sites, one concept, six spellings");
card(s, 0.7, 1.8, 5.9, 3.4, "FDF1E7");
s.addText("Without controlled terminology", { x: 1.0, y: 1.98, w: 5.3, h: 0.4, fontFace: HFONT, bold: true, fontSize: 17, color: RUST, margin: 0 });
["\"Mild\"", "\"mild\"", "\"MILD\"", "\"1 - Mild\"", "\"Grade 1\"", "\"leichte\""].forEach((v, i) => {
  s.addText(v, { x: 1.15, y: 2.5 + i * 0.42, w: 4.9, h: 0.38, fontFace: MONO, fontSize: 13, color: INK, valign: "middle", margin: 0 });
});
s.addText("Six values. One concept. No way to count them together.",
  { x: 1.0, y: 5.05, w: 5.3, h: 0.4, fontFace: BFONT, italic: true, fontSize: 12.5, color: RUST, margin: 0 });

card(s, 6.8, 1.8, 5.9, 3.4, "E7F4F2");
s.addText("With controlled terminology", { x: 7.1, y: 1.98, w: 5.3, h: 0.4, fontFace: HFONT, bold: true, fontSize: 17, color: TEAL, margin: 0 });
s.addText("MILD", { x: 7.25, y: 2.7, w: 5.0, h: 0.7, fontFace: MONO, bold: true, fontSize: 26, color: INK, valign: "middle", margin: 0 });
s.addText("One submission value, defined by CDISC, spelled and cased exactly this way in every study, by every sponsor, worldwide.",
  { x: 7.1, y: 3.6, w: 5.3, h: 1.0, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });

card(s, 0.7, 5.5, 12.0, 1.4, PAPER);
s.addText("Why a regulator cares", { x: 1.0, y: 5.65, w: 11.4, h: 0.35, fontFace: HFONT, bold: true, fontSize: 16, color: INK, margin: 0 });
s.addText("A reviewer assessing a safety signal wants every severe event across every study of this drug class — dozens of submissions from different sponsors. That query only works if all of them wrote SEVERE the same way. CT is what makes your study POOLABLE with everyone else's.",
  { x: 1.0, y: 6.05, w: 11.4, h: 0.75, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
s.addNotes("The German 'leichte' is not a joke — multinational trials really do get local-language free text when a field is not constrained at entry. Emphasise the poolability argument: CT is not tidiness for its own sake, it is what lets a reviewer ask one question across fifty studies.");

// ============ 4. EVERY CODED VALUE IN ABC-01 ============
s = _add(); bg(s, WHITE);
header(s, "You have already done this", "Every coded variable in ABC-01 — and all eight changed");
grid(s, 0.7, 1.8, [1.5, 1.0, 4.3, 3.5, 1.7], [
  ["Variable", "Domain", "Raw values as collected", "SDTM submission values", "Kind"],
  ["SEX", "DM", "1 · 2", "M · F", "decode"],
  ["RACE", "DM", "White · asian · 'White '", "WHITE · ASIAN · …", "normalise"],
  ["ETHNIC", "DM", "Not Hispanic or Latino", "NOT HISPANIC OR LATINO", "normalise"],
  ["AESEV", "AE", "mild · Mild · severe", "MILD · MODERATE · SEVERE", "normalise"],
  ["AESER", "AE", "No · N · Yes", "N · Y", "decode"],
  ["AEREL", "AE", "Possibly related", "POSSIBLY RELATED", "normalise"],
  ["AEOUT", "AE", "1 · 2 · 3", "RECOVERED/RESOLVED · …", "decode"],
  ["LBTEST", "LB", "White Blood Cells", "Leukocytes", "RENAME"],
], { fontSize: 11, rowH: 0.36,
     highlight: (r, c) => r === 8 ? (c >= 2 ? "C0455B" : INK) : null });
card(s, 0.7, 5.35, 12.0, 1.55, "E7F4F2");
s.addText("Not one of the eight passes through unchanged.", { x: 1.0, y: 5.5, w: 11.4, h: 0.35, fontFace: HFONT, bold: true, fontSize: 16, color: TEAL, margin: 0 });
s.addText("That is the normal state of affairs: raw data is what the site could type, SDTM is what the standard requires. The last row is the one that bites — five of six lab tests map to themselves, so a programmer who spot-checks two rows concludes the column needs no mapping at all, and ships \"White Blood Cells\" into a submission.",
  { x: 1.0, y: 5.9, w: 11.4, h: 0.95, fontFace: BFONT, fontSize: 13, color: INK, margin: 0 });
s.addNotes("This slide is the payoff for four days of domain building — it collects everything they have already done into one picture and names the pattern. Ask which they think was hardest to catch; the answer is LBTEST, precisely because it mostly worked.");

// ============ 5. ANATOMY OF A CODELIST ============
s = _add(); bg(s, INK);
headerDark(s, "What a codelist actually is", "Four things, and only one of them goes in your dataset");
const anat = [
  ["NCI code", "C66731", "The permanent identifier for the CODELIST itself. Never changes, even if the name does.", MINT],
  ["Submission value", "MILD", "The string you put IN THE DATASET. Exact spelling, exact case.", ACCENT],
  ["Preferred term", "Mild Adverse Event", "The human-readable name. Documentation only — never submitted.", SEA],
  ["Definition", "\"An adverse event…\"", "What the term means. Settles arguments about which value applies.", TEAL],
];
let ay = 2.05;
anat.forEach((r) => {
  s.addShape(p.ShapeType.roundRect, { x: 0.7, y: ay, w: 12.0, h: 1.05, rectRadius: 0.08,
    fill: { color: r[3] === ACCENT ? "1A4152" : "163B4B" }, line: { color: r[3], width: r[3] === ACCENT ? 2 : 1 } });
  s.addText(r[0], { x: 1.0, y: ay + 0.14, w: 2.9, h: 0.35, fontFace: HFONT, bold: true, fontSize: 15, color: r[3], margin: 0 });
  s.addText(r[1], { x: 1.0, y: ay + 0.52, w: 2.9, h: 0.4, fontFace: MONO, fontSize: 13, color: WHITE, margin: 0 });
  s.addText(r[2], { x: 4.2, y: ay + 0.25, w: 8.2, h: 0.6, fontFace: BFONT, fontSize: 12.5, color: "DCEBEF", valign: "middle", margin: 0 });
  ay += 1.15;
});
s.addText("Only the SUBMISSION VALUE goes in the dataset. The rest is metadata — it lives in define.xml, which is how a reviewer knows which codelist a variable draws from.",
  { x: 0.7, y: 6.75, w: 12.0, h: 0.55, fontFace: BFONT, italic: true, fontSize: 13, color: MINT, margin: 0 });
s.addNotes("Trainees often assume the NCI code goes in the data. It does not — the dataset carries the submission value only. The codelist identity travels in define.xml. Mention that C66731 is the real NCI code for the Severity codelist, so they can look it up.");

// ============ 6. EXTENSIBLE vs NON-EXTENSIBLE ============
s = _add(); bg(s, WHITE);
header(s, "The rule that catches people", "May you add a value of your own?");
card(s, 0.7, 1.8, 5.9, 4.1, "FDECEE");
s.addShape(p.ShapeType.rect, { x: 0.7, y: 1.8, w: 0.09, h: 4.1, fill: { color: ROSE }, line: { type: "none" } });
s.addText("NON-EXTENSIBLE", { x: 1.0, y: 2.0, w: 5.3, h: 0.45, fontFace: HFONT, bold: true, fontSize: 19, color: ROSE, margin: 0 });
s.addText("The list is CLOSED. You may use only the values CDISC published.", { x: 1.0, y: 2.5, w: 5.3, h: 0.6, fontFace: BFONT, bold: true, fontSize: 13.5, color: INK, margin: 0 });
s.addText("Examples in ABC-01", { x: 1.0, y: 3.15, w: 5.3, h: 0.3, fontFace: BFONT, bold: true, fontSize: 11, color: MUTED, charSpacing: 1, margin: 0 });
[["SEX", "M · F · U · UNDIFFERENTIATED"], ["NY (AESER)", "N · Y · NA · U"], ["AESEV", "MILD · MODERATE · SEVERE"]].forEach((v, i) => {
  s.addText([{ text: v[0] + "   ", options: { fontFace: MONO, bold: true, fontSize: 12.5, color: ROSE } },
             { text: v[1], options: { fontFace: MONO, fontSize: 11.5, color: MUTED } }],
    { x: 1.0, y: 3.5 + i * 0.42, w: 5.3, h: 0.38, fontFace: BFONT, valign: "middle", margin: 0 });
});
s.addText("A value outside the list is a CONFORMANCE ERROR. There is no \"our study uses Grade 1\" — you map to MILD or you fail validation.",
  { x: 1.0, y: 4.9, w: 5.3, h: 0.85, fontFace: BFONT, fontSize: 12.5, color: ROSE, margin: 0 });

card(s, 6.8, 1.8, 5.9, 4.1, "E7F4F2");
s.addShape(p.ShapeType.rect, { x: 6.8, y: 1.8, w: 0.09, h: 4.1, fill: { color: TEAL }, line: { type: "none" } });
s.addText("EXTENSIBLE", { x: 7.1, y: 2.0, w: 5.3, h: 0.45, fontFace: HFONT, bold: true, fontSize: 19, color: TEAL, margin: 0 });
s.addText("The list is a STARTING POINT. You may add a study-specific value.", { x: 7.1, y: 2.5, w: 5.3, h: 0.6, fontFace: BFONT, bold: true, fontSize: 13.5, color: INK, margin: 0 });
s.addText("Examples in ABC-01", { x: 7.1, y: 3.15, w: 5.3, h: 0.3, fontFace: BFONT, bold: true, fontSize: 11, color: MUTED, charSpacing: 1, margin: 0 });
[["RACE", "WHITE · ASIAN · …"], ["LBTEST", "hundreds of tests"], ["UNIT", "mg · kg · % · IU"]].forEach((v, i) => {
  s.addText([{ text: v[0] + "   ", options: { fontFace: MONO, bold: true, fontSize: 12.5, color: TEAL } },
             { text: v[1], options: { fontFace: MONO, fontSize: 11.5, color: MUTED } }],
    { x: 7.1, y: 3.5 + i * 0.42, w: 5.3, h: 0.38, fontFace: BFONT, valign: "middle", margin: 0 });
});
s.addText("But adding is a LAST RESORT. Search the published list properly first — most \"we need a new value\" turns out to be a term that already exists under a different name.",
  { x: 7.1, y: 4.9, w: 5.3, h: 0.9, fontFace: BFONT, fontSize: 12.5, color: TEAL, margin: 0 });

s.addText("How do you know which one a codelist is? The CT release says so, and define.xml records it per variable. Never guess — check.",
  { x: 0.7, y: 6.15, w: 12, h: 0.5, fontFace: BFONT, italic: true, fontSize: 13, color: INK, margin: 0 });
s.addNotes("The commonest real-world mistake is extending a NON-extensible codelist because the data 'needed' it — that is a guaranteed Pinnacle 21 finding. The second commonest is extending an extensible one lazily, creating a synonym for a term that already exists, which quietly breaks poolability. Both come from not reading the published list.");

// ============ 7. THE FOUR KINDS OF CT WORK ============
s = _add(); bg(s, INK);
headerDark(s, "Four kinds of work", "Every CT mapping you will ever write is one of these");
const kinds = [
  ["DECODE", "A code stands for a term", "SEX 1 -> M      AEOUT 3 -> NOT RECOVERED/NOT RESOLVED",
   "The raw value is meaningless on its own. You NEED the data dictionary.", ACCENT],
  ["NORMALISE", "Right term, wrong shape", "'mild' -> MILD      'White ' -> WHITE",
   "Trim and upper-case. Easy — and the easiest to do carelessly.", SEA],
  ["RENAME", "Different term entirely", "'White Blood Cells' -> Leukocytes",
   "Only a lookup finds these. No string rule will ever produce them.", ROSE],
  ["DERIVE", "Not collected at all", "AESTDY >= 1 -> AETRTEM = Y",
   "The value is computed from other variables, not mapped from one.", MINT],
];
let ky = 2.0;
kinds.forEach((k) => {
  s.addShape(p.ShapeType.roundRect, { x: 0.7, y: ky, w: 12.0, h: 1.12, rectRadius: 0.08,
    fill: { color: "163B4B" }, line: { color: k[4], width: 1.3 } });
  s.addText(k[0], { x: 1.0, y: ky + 0.16, w: 2.3, h: 0.38, fontFace: HFONT, bold: true, fontSize: 16, color: k[4], margin: 0 });
  s.addText(k[1], { x: 1.0, y: ky + 0.58, w: 2.5, h: 0.35, fontFace: BFONT, fontSize: 11.5, color: "AFCBD3", margin: 0 });
  s.addText(k[2], { x: 3.7, y: ky + 0.14, w: 8.7, h: 0.4, fontFace: MONO, fontSize: 12, color: WHITE, valign: "middle", margin: 0 });
  s.addText(k[3], { x: 3.7, y: ky + 0.58, w: 8.7, h: 0.42, fontFace: BFONT, fontSize: 12, color: "AFCBD3", valign: "middle", margin: 0 });
  ky += 1.22;
});
s.addText("The danger rises down the list. NORMALISE looks trivial, so people stop checking — and RENAME hides inside a column that mostly normalises cleanly.",
  { x: 0.7, y: 6.9, w: 12.0, h: 0.5, fontFace: BFONT, italic: true, fontSize: 13, color: MINT, margin: 0 });
s.addNotes("Have them map each of the eight ABC-01 variables from slide 4 onto one of these four. AEOUT and SEX are decode; RACE/ETHNIC/AESEV/AEREL are normalise; LBTEST is rename; AETRTEM and all the --DY variables are derive. The point of the closing line: LBTEST sits in a column where five of six values normalise perfectly.");

// ============ 8. FAIL LOUDLY ============
s = _add(); bg(s, WHITE);
header(s, "The habit that matters most", "What does your code do with a value it has never seen?");
let cy8 = codeBox(s, 0.7, 1.75, 5.9,
`select (strip(aeout));
    when ("1") aeout_c = "RECOVERED/RESOLVED";
    when ("2") aeout_c = "RECOVERING/RESOLVING";
    ...
    otherwise  aeout_c = "";
end;`, ROSE, "What you have been writing");
codeBox(s, 6.8, 1.75, 5.9,
`select (strip(aeout));
    when ("1") aeout_c = "RECOVERED/RESOLVED";
    when ("2") aeout_c = "RECOVERING/RESOLVING";
    ...
    otherwise do;
        aeout_c = "";
        put "ERROR: unmapped AEOUT >" aeout
            "< for " usubjid=;
    end;
end;`, TEAL, "What production code writes");

card(s, 0.7, 4.45, 5.9, 2.15, "FDECEE");
s.addText("Silent blanking", { x: 1.0, y: 4.6, w: 5.3, h: 0.35, fontFace: HFONT, bold: true, fontSize: 16, color: ROSE, margin: 0 });
s.addText("A new code 6 appears in next month's extract. Your program turns it into a blank and reports success. The dataset looks CLEANER than one with a visible problem — and the information is gone.\n\nWorst of both worlds.",
  { x: 1.0, y: 5.0, w: 5.3, h: 1.45, fontFace: BFONT, fontSize: 12.5, color: INK, lineSpacing: 16, margin: 0 });
card(s, 6.8, 4.45, 5.9, 2.15, "E7F4F2");
s.addText("Failing loudly", { x: 7.1, y: 4.6, w: 5.3, h: 0.35, fontFace: HFONT, bold: true, fontSize: 16, color: TEAL, margin: 0 });
s.addText("The same code 6 writes ERROR to the log with the subject id. Someone reads it, asks the data manager, and finds out the CRF gained an option nobody told you about.\n\nA new value is a SPEC CHANGE, not something a mapping program should absorb.",
  { x: 7.1, y: 5.0, w: 5.3, h: 1.5, fontFace: BFONT, fontSize: 12.5, color: INK, lineSpacing: 16, margin: 0 });
s.addNotes("This is the single most transferable habit in the module. The notebooks so far all use the silent form because it keeps the teaching example short — say that explicitly so nobody thinks it is the model. Notebook 10 has them convert it. In LB the otherwise branch already writes an ERROR; point at it as the pattern to copy.");

// ============ 9. VERSIONING ============
s = _add(); bg(s, WHITE);
header(s, "CT has a date", "The standard moves; your study must not");
s.addText("CDISC publishes Controlled Terminology QUARTERLY. Terms are added, definitions clarified, occasionally a term is retired.",
  { x: 0.7, y: 1.72, w: 12, h: 0.4, fontFace: BFONT, fontSize: 14, color: MUTED, margin: 0 });
const rel = ["2023-12-15", "2024-03-29", "2024-06-28", "2024-09-27"];
rel.forEach((r, i) => {
  const on = i === 1;
  s.addShape(p.ShapeType.roundRect, { x: 0.7 + i * 3.1, y: 2.3, w: 2.85, h: 1.15, rectRadius: 0.08,
    fill: { color: on ? "E7F4F2" : PAPER }, line: { color: on ? TEAL : LINE, width: on ? 2.5 : 1 } });
  s.addText(r, { x: 0.7 + i * 3.1, y: 2.5, w: 2.85, h: 0.4, align: "center",
    fontFace: MONO, bold: true, fontSize: 15, color: on ? TEAL : INK, margin: 0 });
  s.addText(on ? "◄ ABC-01 pins this" : "release", { x: 0.7 + i * 3.1, y: 2.95, w: 2.85, h: 0.35, align: "center",
    fontFace: BFONT, bold: on, fontSize: on ? 12 : 11, color: on ? TEAL : MUTED, margin: 0 });
});
card(s, 0.7, 3.75, 12.0, 1.4, PAPER);
s.addText("A study pins ONE dated release and uses it for the study's whole life.", { x: 1.0, y: 3.9, w: 11.4, h: 0.35, fontFace: HFONT, bold: true, fontSize: 16, color: INK, margin: 0 });
s.addText("The version is recorded in define.xml. A trial that ran for four years was mapped against the CT release chosen at the start — not whatever came out last quarter. Changing mid-study would make early and late data incomparable, which is exactly what CT exists to prevent.",
  { x: 1.0, y: 4.3, w: 11.4, h: 0.75, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
card(s, 0.7, 5.4, 12.0, 1.5, "FDF1E7");
s.addText("Where the authoritative list lives", { x: 1.0, y: 5.55, w: 11.4, h: 0.35, fontFace: HFONT, bold: true, fontSize: 16, color: RUST, margin: 0 });
s.addText("NCI Enterprise Vocabulary Services (NCI-EVS) publishes CDISC CT as downloadable files — text, Excel and OWL. That download is the source of truth. Not a colleague's spreadsheet, not last study's format catalogue, and not this deck: those are all copies, and copies go stale.",
  { x: 1.0, y: 5.95, w: 11.4, h: 0.85, fontFace: BFONT, fontSize: 13, color: INK, margin: 0 });
s.addNotes("The dates shown are illustrative of the quarterly cadence — check the current NCI-EVS release list for real ones rather than quoting these. The pinning rule is the point: trainees assume 'use the latest', which is wrong mid-study. Also stress that this deck is itself a copy and will go stale; the NCI-EVS download is authoritative.");

// ============ 10. HOW YOU APPLY IT AT SCALE ============
s = _add(); bg(s, INK);
headerDark(s, "Six values versus two hundred", "The method has to change");
card(s, 0.7, 1.95, 5.85, 2.2, "163B4B");
s.addText("What you have done so far", { x: 1.0, y: 2.1, w: 5.2, h: 0.35, fontFace: HFONT, bold: true, fontSize: 15, color: MINT, margin: 0 });
s.addText("A hard-coded SELECT with one WHEN per value.\n\nPerfectly fine for 6 values. Unreadable and unmaintainable at 200, and impossible to reconcile against a published list.",
  { x: 1.0, y: 2.5, w: 5.2, h: 1.5, fontFace: BFONT, fontSize: 12.5, color: "DCEBEF", lineSpacing: 16, margin: 0 });
card(s, 6.85, 1.95, 5.85, 2.2, "1A4152");
s.addText("What production does", { x: 7.15, y: 2.1, w: 5.2, h: 0.35, fontFace: HFONT, bold: true, fontSize: 15, color: ACCENT, margin: 0 });
s.addText("Keep the mapping as DATA, not code — a lookup dataset with one row per raw value.\n\nThen join. The mapping becomes something you can print, review, diff and sign off.",
  { x: 7.15, y: 2.5, w: 5.2, h: 1.5, fontFace: BFONT, fontSize: 12.5, color: "DCEBEF", lineSpacing: 16, margin: 0 });
codeBox(s, 0.7, 4.35, 12.0,
`/* the mapping is a DATASET, not a hundred WHEN clauses */
proc format cntlin = ct_lookup;   /* formats built from the list */
run;
aesev = put(strip(upcase(aesev_raw)), $sevmap.);
/* anything the lookup missed is REPORTED, never blanked */
proc sql;
    select distinct aesev_raw from raw
    where put(strip(upcase(aesev_raw)), $sevmap.) = "";  /* 0 rows */
quit;`, ACCENT, "SAS  ·  data-driven CT");
s.addNotes("PROC FORMAT with CNTLIN is the classic SAS answer and is what Notebook 10 builds. The deeper point is the shift from code to data: a lookup table can be reviewed by a non-programmer, diffed between CT versions, and attached to the spec. A SELECT block can only be read by someone who reads SAS.");

// ============ 11. SPONSOR-DEFINED ============
s = _add(); bg(s, WHITE);
header(s, "When there is no CDISC codelist", "Sponsor-defined terminology");
card(s, 0.7, 1.85, 12.0, 1.5, PAPER);
s.addText("AEREL is the example sitting in your own data.", { x: 1.0, y: 2.0, w: 11.4, h: 0.35, fontFace: HFONT, bold: true, fontSize: 16, color: INK, margin: 0 });
s.addText("CDISC does not publish a relationship-to-study-treatment codelist, because sponsors genuinely differ: some use 2 categories, some 4, some 5. ABC-01 uses four — RELATED, POSSIBLY RELATED, UNLIKELY RELATED, NOT RELATED — and that choice comes from the PROTOCOL, not from CDISC.",
  { x: 1.0, y: 2.4, w: 11.4, h: 0.85, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
grid(s, 0.7, 3.6, [3.0, 4.5, 4.5], [
  ["", "CDISC codelist", "Sponsor-defined"],
  ["Who decides the values", "CDISC / NCI-EVS", "the sponsor, in the protocol"],
  ["Where it is documented", "the CT release", "**define.xml** — you must publish it"],
  ["May you invent a value", "only if extensible", "yes, but define it up front"],
  ["Validation checks it", "yes, automatically", "only against your own define.xml"],
], { fontSize: 12, rowH: 0.42 });
card(s, 0.7, 5.85, 12.0, 1.05, "E7F4F2");
s.addText([{ text: "The obligation is the same.  ", options: { bold: true, color: TEAL } },
           { text: "Sponsor-defined does not mean informal. The list must be fixed before data comes in, applied consistently, and published in define.xml — otherwise a reviewer has no way to know what \"UNLIKELY RELATED\" meant in your study.", options: { color: INK } }],
  { x: 1.0, y: 5.98, w: 11.4, h: 0.8, fontFace: BFONT, fontSize: 13, valign: "middle", margin: 0 });
s.addNotes("Trainees assume everything coded is CDISC-controlled. AEREL is the counter-example in their own dataset. The takeaway: 'sponsor-defined' is a documentation obligation, not a licence to be loose. This also foreshadows Deck 12, where define.xml is covered properly.");

// ============ 12. MISTAKES ============
s = _add(); bg(s, INK);
headerDark(s, "Before Notebook 10", "The five that cost the most");
const m08 = [
  ["Spot-checking a column", "Five of six lab tests map to themselves. The sixth is Leukocytes.", "check every value, every time"],
  ["Blanking the unrecognised", "A new code becomes a blank and the run reports success.", "write ERROR to the log"],
  ["Extending a closed codelist", "\"Our study needs Grade 1\" — SEX, AESEV and NY are non-extensible.", "map to the published value"],
  ["Using the latest CT mid-study", "Early and late data stop being comparable.", "pin the dated release"],
  ["Copying a format catalogue", "Last study's catalogue was built from an older CT release.", "rebuild from the NCI-EVS download"],
];
let my8 = 2.0;
m08.forEach((m, i) => {
  s.addShape(p.ShapeType.roundRect, { x: 0.7, y: my8, w: 12.0, h: 0.94, rectRadius: 0.08,
    fill: { color: i % 2 ? "163B4B" : "1A4152" }, line: { color: "24576B", width: 1 } });
  circle(s, 0.95, my8 + 0.2, 0.54, [ROSE, ACCENT, SEA, TEAL, MINT][i], String(i + 1), i === 4 ? INK : WHITE, 15);
  s.addText(m[0], { x: 1.68, y: my8 + 0.12, w: 4.0, h: 0.38, fontFace: BFONT, bold: true, fontSize: 13.5, color: WHITE, margin: 0 });
  s.addText(m[1], { x: 1.68, y: my8 + 0.5, w: 7.2, h: 0.38, fontFace: BFONT, fontSize: 11.5, color: "AFCBD3", margin: 0 });
  s.addText("→ " + m[2], { x: 9.1, y: my8 + 0.28, w: 3.4, h: 0.42, fontFace: BFONT, italic: true, fontSize: 11.5, color: MINT, valign: "middle", margin: 0 });
  my8 += 1.02;
});
s.addText("Next:  Notebook 10 · Applying Controlled Terminology   →   Deck 09 · Derivations",
  { x: 0.7, y: 6.85, w: 12, h: 0.4, fontFace: BFONT, bold: true, fontSize: 13, color: MINT, margin: 0 });
s.addNotes("Mistake 5 is the one that surprises experienced people — inheriting a format catalogue feels efficient and quietly imports an old CT version. Send them into Notebook 10 with mistakes 1 and 2 as the things to fix in code.");

p.writeFile({ fileName: "/Volumes/D Drive/SDTM Training/Bootcamp/presentations/08_controlled_terminology.pptx" })
  .then(f => console.log("WROTE", f));
