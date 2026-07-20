// Build: 05_dm_domain.pptx — "Building SDTM Domains I: Special Purpose & DM"
// Bootcamp Module 05. Concept deck for the first real domain build.
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "Clinical Programming Bootcamp";
p.title = "Building SDTM Domains I: Special Purpose & DM";

const INK = "0F2E3D", TEAL = "0E7C86", SEA = "1FA8A0", MINT = "6FC8B4",
      ACCENT = "E8833A", WHITE = "FFFFFF", PAPER = "F3F7F8",
      MUTED = "5A7682", LINE = "CFDEE1", CODEBG = "13323F";
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
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.09,
    fill: { color: fill || WHITE }, line: { color: LINE, width: 1 }, shadow: shadow() });
}
const CODE_FS = 12, CODE_LS = 17;
function codeBox(s, x, y, w, lines, borderColor, label) {
  const n = lines.split("\n").length;
  const textH = n * (CODE_LS / 72) + 0.14;
  const h = 0.62 + textH;
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: CODEBG }, line: { color: borderColor, width: 1.5 } });
  if (label) s.addText(label, { x: x + 0.25, y: y + 0.1, w: 4, h: 0.35, fontFace: HFONT, bold: true, fontSize: 14, color: borderColor, margin: 0 });
  s.addText(lines, { x: x + 0.25, y: y + 0.5, w: w - 0.45, h: textH, fontFace: MONO, fontSize: CODE_FS, color: "DCEBEF", lineSpacing: CODE_LS, margin: 0, valign: "top" });
  return y + h;
}
let s;

// ============ 1. TITLE ============
s = p.addSlide(); bg(s, INK);
s.addShape(p.ShapeType.ellipse, { x: 9.7, y: -1.6, w: 5.2, h: 5.2, fill: { color: "133B4C" }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 10.7, y: -0.6, w: 3.2, h: 3.2, fill: { color: TEAL }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.45, y: 0.15, w: 1.7, h: 1.7, fill: { color: ACCENT }, line: { type: "none" } });
s.addText("CLINICAL PROGRAMMING BOOTCAMP  ·  MODULE 05", { x: 0.7, y: 2.0, w: 9, h: 0.4,
  fontFace: BFONT, fontSize: 14, bold: true, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Building SDTM\nDomains I", { x: 0.66, y: 2.5, w: 9.6, h: 1.7,
  fontFace: HFONT, fontSize: 44, bold: true, color: WHITE, lineSpacing: 48, margin: 0 });
s.addText("Special Purpose domains and DM", { x: 0.7, y: 4.15, w: 9.6, h: 0.6,
  fontFace: HFONT, fontSize: 26, color: MINT, margin: 0 });
s.addText("Your first real domain. One row per subject — and three different CRF forms feeding it.",
  { x: 0.7, y: 5.0, w: 9.2, h: 0.8, fontFace: BFONT, fontSize: 16, color: "C7DCE0", margin: 0 });
s.addText("Hands-on: the Excel mapping exercise, then Notebook 04 (SAS)",
  { x: 0.7, y: 6.5, w: 12, h: 0.4, fontFace: BFONT, fontSize: 12, italic: true, color: MUTED, margin: 0 });
s.addNotes("Module 05. The first domain trainees build end to end. Two things make DM a good starting point: it is one row per subject (no --SEQ to derive) and it has no timing variables to speak of. But it is not trivial — it pulls from three separate CRF forms and needs a derived AGE and several CT lookups. Pair with the Excel exercise first, then Notebook 04.");

// ============ 2. GOALS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Module goals", "By the end of this module you can…");
const goals = [
  ["Explain what Special Purpose means", "and why DM does not follow the three general observation classes."],
  ["Build USUBJID correctly", "and say why SUBJID alone is never enough."],
  ["Derive AGE from a birth date", "including the birthday edge case that catches everyone."],
  ["Apply CT to SEX, RACE and ETHNIC", "and know why blind upper-casing is dangerous in production."],
  ["Populate the reference dates", "and name which CRF form each one comes from."],
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
s.addNotes("Five concrete capabilities. Goal 5 is the one trainees most often get wrong — they assume every DM variable comes from the demographics form, when in fact the reference dates come from Exposure and Disposition.");

// ============ 3. WHAT IS SPECIAL PURPOSE ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Recap and place", "Where DM sits in the domain families");
const fams = [
  ["Interventions", "Something given to the subject", "CM · EX", TEAL],
  ["Events", "Something that happened", "AE · MH · DS", SEA],
  ["Findings", "Something measured", "VS · LB · EG", MINT],
  ["Special Purpose", "Its own fixed structure", "DM · CO · SE · SV", ACCENT],
];
let fx = 0.7;
fams.forEach((f, i) => {
  const hl = i === 3;
  card(s, fx, 1.9, 2.98, 2.6, hl ? "FDF1E7" : PAPER);
  if (hl) s.addShape(p.ShapeType.roundRect, { x: fx, y: 1.9, w: 2.98, h: 2.6, rectRadius: 0.09, fill: { type: "none" }, line: { color: ACCENT, width: 2.5 } });
  s.addText(f[0], { x: fx + 0.2, y: 2.1, w: 2.6, h: 0.5, fontFace: HFONT, bold: true, fontSize: 17, color: hl ? "B5651A" : f[3], margin: 0 });
  s.addText(f[1], { x: fx + 0.2, y: 2.68, w: 2.6, h: 0.8, fontFace: BFONT, fontSize: 12.5, color: MUTED, margin: 0 });
  s.addText(f[2], { x: fx + 0.2, y: 3.85, w: 2.6, h: 0.4, fontFace: MONO, bold: true, fontSize: 12.5, color: hl ? "B5651A" : f[3], margin: 0 });
  fx += 3.1;
});
card(s, 0.7, 4.85, 12.0, 1.85, INK);
s.addText("Special Purpose means: this domain has its own defined structure", { x: 1.0, y: 5.05, w: 11.4, h: 0.4, fontFace: BFONT, bold: true, fontSize: 16, color: MINT, margin: 0 });
s.addText("The three general observation classes share a common set of variables (a topic, timing variables, qualifiers, a --SEQ). Special Purpose domains do not follow that pattern — the SDTMIG defines their variables explicitly. DM is the one you will meet first and use most.",
  { x: 1.0, y: 5.5, w: 11.4, h: 1.0, fontFace: BFONT, fontSize: 13.5, color: "C7DCE0", margin: 0 });
s.addNotes("Recap from Module 01, now with a purpose. The key consequence of Special Purpose: do not go looking for a topic variable or a --SEQ in DM — they are not there. The IG simply lists the variables DM has. CO = Comments, SE = Subject Elements, SV = Subject Visits; we do not build those in this bootcamp.");

// ============ 4. WHAT MAKES DM DIFFERENT ============
s = p.addSlide(); bg(s, WHITE);
header(s, "The shape", "Two rules that define DM");
card(s, 0.7, 1.9, 5.9, 2.5, PAPER);
circle(s, 1.0, 2.15, 0.75, TEAL, "1", WHITE, 22);
s.addText("One row per subject", { x: 2.0, y: 2.2, w: 4.4, h: 0.5, fontFace: HFONT, bold: true, fontSize: 21, color: TEAL, valign: "middle", margin: 0 });
s.addText("8 subjects → exactly 8 rows. No subject appears twice, ever. This is the easiest domain to check: your row count must equal your subject count.",
  { x: 1.0, y: 3.05, w: 5.3, h: 1.2, fontFace: BFONT, fontSize: 13.5, color: INK, margin: 0 });
card(s, 6.8, 1.9, 5.9, 2.5, PAPER);
circle(s, 7.1, 2.15, 0.75, ACCENT, "2", INK, 22);
s.addText("No --SEQ variable", { x: 8.1, y: 2.2, w: 4.4, h: 0.5, fontFace: HFONT, bold: true, fontSize: 21, color: "B5651A", valign: "middle", margin: 0 });
s.addText("There is no DMSEQ. Sequence numbers exist to tell a subject's multiple records apart — DM has only one record per subject, so it needs none.",
  { x: 7.1, y: 3.05, w: 5.3, h: 1.2, fontFace: BFONT, fontSize: 13.5, color: INK, margin: 0 });
card(s, 0.7, 4.7, 12.0, 1.95, INK);
s.addText("DM is the spine of the study", { x: 1.0, y: 4.9, w: 11.4, h: 0.4, fontFace: BFONT, bold: true, fontSize: 16, color: MINT, margin: 0 });
s.addText("Every other domain joins back to DM on USUBJID. DM also carries the reference dates that every --DY calculation in every other domain depends on. Build DM first, and build it right — everything downstream inherits its mistakes.",
  { x: 1.0, y: 5.35, w: 11.4, h: 1.1, fontFace: BFONT, fontSize: 13.5, color: "C7DCE0", margin: 0 });
s.addNotes("Two rules worth memorising. The row-count check is the fastest sanity test in the whole bootcamp. The 'spine' framing matters: a wrong USUBJID or RFSTDTC in DM silently corrupts study day in every other domain, so DM errors are expensive. That is also why we build it first.");

// ============ 5. THREE FORMS FEED DM ============
s = p.addSlide(); bg(s, INK);
headerDark(s, "The surprise", "DM is built from THREE forms, not one");
const srcs = [
  ["Demographics", "dm_raw.csv", "Who the subject is: birth date, sex, race, ethnicity, country, arm, consent date, randomization date", TEAL],
  ["Exposure", "ex_raw.csv", "RFSTDTC / RFENDTC — first and last dose. These define Study Day 1 for the whole study", ACCENT],
  ["Disposition", "ds_raw.csv", "RFPENDTC — the date the subject's participation ended", MINT],
];
let sx = 0.7;
srcs.forEach((v, i) => {
  card(s, sx, 2.15, 3.95, 3.5, "16404F");
  circle(s, sx + 1.47, 2.4, 0.9, v[3], String(i + 1), v[3] === MINT ? INK : (v[3] === ACCENT ? INK : WHITE), 22);
  s.addText(v[0], { x: sx + 0.1, y: 3.45, w: 3.75, h: 0.4, align: "center", fontFace: HFONT, bold: true, fontSize: 19, color: WHITE, margin: 0 });
  s.addText(v[1], { x: sx + 0.1, y: 3.9, w: 3.75, h: 0.35, align: "center", fontFace: MONO, fontSize: 12.5, color: v[3] === MINT ? MINT : v[3], margin: 0 });
  s.addText(v[2], { x: sx + 0.28, y: 4.35, w: 3.4, h: 1.2, align: "center", fontFace: BFONT, fontSize: 12, color: "C7DCE0", margin: 0 });
  sx += 4.1;
});
s.addText("A common beginner assumption is that DM comes from the demographics form alone. It does not — and the reference dates it borrows are the most consequential values in the study.",
  { x: 0.7, y: 5.95, w: 12, h: 0.6, fontFace: BFONT, italic: true, fontSize: 14, color: MINT, margin: 0 });
s.addNotes("This is the slide that changes how trainees think about DM. Demographics gives you the person; Exposure gives you the timeline anchor; Disposition gives you the end point. If your DM has a blank RFSTDTC, you did not join EX. Reference the mapping specification section 2, which lists the source for every variable.");

// ============ 6. USUBJID ============
s = p.addSlide(); bg(s, WHITE);
header(s, "The most important variable", "Building USUBJID");
s.addText("SUBJID is only unique within a site. USUBJID must be unique across the whole study — and identical for that subject in every domain.",
  { x: 0.6, y: 1.5, w: 12.2, h: 0.45, fontFace: BFONT, fontSize: 14, color: MUTED, margin: 0 });
card(s, 0.7, 2.05, 5.9, 1.75, "FDF1E7");
s.addText("The problem", { x: 1.0, y: 2.2, w: 5.3, h: 0.35, fontFace: BFONT, bold: true, fontSize: 14, color: "B5651A", margin: 0 });
s.addText("Site 01, Subject 001\nSite 02, Subject 001", { x: 1.0, y: 2.6, w: 5.3, h: 1.0, fontFace: MONO, fontSize: 14, color: INK, lineSpacing: 20, margin: 0 });
s.addText("Two different people.", { x: 4.2, y: 2.95, w: 2.2, h: 0.4, fontFace: BFONT, bold: true, italic: true, fontSize: 12.5, color: "B5651A", margin: 0 });
card(s, 6.8, 2.05, 5.9, 1.75, "EAF5F0");
s.addText("The fix", { x: 7.1, y: 2.2, w: 5.3, h: 0.35, fontFace: BFONT, bold: true, fontSize: 14, color: TEAL, margin: 0 });
s.addText("ABC-01-01-001\nABC-01-02-001", { x: 7.1, y: 2.6, w: 5.3, h: 1.0, fontFace: MONO, bold: true, fontSize: 14, color: TEAL, lineSpacing: 20, margin: 0 });
s.addText("Unambiguous.", { x: 10.4, y: 2.95, w: 2.0, h: 0.4, fontFace: BFONT, bold: true, italic: true, fontSize: 12.5, color: TEAL, margin: 0 });
codeBox(s, 0.7, 4.0, 12.0,
  'USUBJID = STUDYID  ||  "-"  ||  SITEID  ||  "-"  ||  SUBJID\n'
  + '        = "ABC-01"    +      "01"     +      "001"      ->   ABC-01-01-001', TEAL, "The rule");
card(s, 0.7, 5.6, 12.0, 1.15, INK);
s.addText([
  { text: "Watch the leading zeros.  ", options: { bold: true, color: ACCENT, fontSize: 14.5 } },
  { text: "If SITEID or SUBJID is read as a number, ", options: { color: "C7DCE0", fontSize: 13.5 } },
  { text: "01", options: { fontFace: MONO, color: WHITE, fontSize: 13.5 } },
  { text: " becomes ", options: { color: "C7DCE0", fontSize: 13.5 } },
  { text: "1", options: { fontFace: MONO, color: WHITE, fontSize: 13.5 } },
  { text: " and you build ", options: { color: "C7DCE0", fontSize: 13.5 } },
  { text: "ABC-01-1-1", options: { fontFace: MONO, color: ACCENT, fontSize: 13.5 } },
  { text: " — wrong for every subject, in every domain.", options: { color: "C7DCE0", fontSize: 13.5 } },
], { x: 1.0, y: 5.78, w: 11.4, h: 0.85, fontFace: BFONT, valign: "middle", lineSpacing: 20, margin: 0 });
s.addNotes("Spend time here. USUBJID is the join key for the entire submission. The exact construction is a sponsor convention — some use STUDYID-SITEID-SUBJID, others just SITEID-SUBJID — but it must be consistent and unique study-wide. Remind trainees of Module 04: read the ID columns as character.");

// ============ 7. AGE ============
s = p.addSlide(); bg(s, WHITE);
header(s, "The derivation that catches everyone", "AGE is calculated, not collected");
s.addText("The CRF collects a birth date. SDTM wants completed years at a defined reference date — here, informed consent.",
  { x: 0.6, y: 1.5, w: 12.2, h: 0.45, fontFace: BFONT, fontSize: 14, color: MUTED, margin: 0 });
const ageRows = [
  ["Born", "1969-05-14", INK],
  ["Consented", "2024-02-20", INK],
  ["Simple year subtraction", "2024 − 1969 = 55", "B5651A"],
  ["Correct answer", "54", TEAL],
];
let ay = 2.1;
ageRows.forEach((r, i) => {
  const hl = i >= 2;
  card(s, 0.7, ay, 6.0, 0.95, i === 3 ? "EAF5F0" : (i === 2 ? "FDF1E7" : PAPER));
  s.addText(r[0], { x: 1.0, y: ay + 0.12, w: 3.2, h: 0.7, fontFace: BFONT, bold: hl, fontSize: 14, color: INK, valign: "middle", margin: 0 });
  s.addText(r[1], { x: 4.0, y: ay + 0.12, w: 2.6, h: 0.7, fontFace: MONO, bold: true, fontSize: hl ? 17 : 14, color: r[2], valign: "middle", margin: 0 });
  ay += 1.05;
});
card(s, 7.0, 2.1, 5.7, 4.0, INK);
s.addText("Why 54?", { x: 7.3, y: 2.3, w: 5.1, h: 0.4, fontFace: HFONT, bold: true, fontSize: 20, color: MINT, margin: 0 });
s.addText("Her birthday is 14 May. On 20 February 2024 it had not yet happened that year, so she had completed only 54 years.\n\nThe rule: subtract one if the birthday has not occurred by the reference date.",
  { x: 7.3, y: 2.85, w: 5.1, h: 2.0, fontFace: BFONT, fontSize: 13.5, color: "C7DCE0", lineSpacing: 20, margin: 0 });
s.addText("SAS:  intck(\"year\", birth, ref, \"C\")\nR:    completed-years helper", { x: 7.3, y: 5.05, w: 5.1, h: 0.8, fontFace: MONO, fontSize: 12, color: MINT, lineSpacing: 18, margin: 0 });
s.addText("Which reference date? The protocol decides — consent or first dose. Using first dose here would make one of our subjects a year older. Never leave it implicit.",
  { x: 0.7, y: 6.35, w: 12, h: 0.5, fontFace: BFONT, italic: true, fontSize: 13, color: TEAL, margin: 0 });
s.addNotes("The 'C' in SAS's intck means continuous — completed intervals rather than calendar boundaries crossed. Without it you get 55. In R you compare month-day strings. The closing line is important: subject ABC-01-02-003 is 57 at consent but 58 at first dose because her birthday falls in between. The spec must state the reference date; the exercise in Notebook 04 explores exactly this.");

// ============ 8. CONTROLLED TERMINOLOGY ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Standardizing values", "CT in DM: SEX, RACE, ETHNIC, ARM");
const ct = [
  ["SEX", "1 / 2", "M / F", "EDC stores a numeric code — you need the data dictionary to decode it", TEAL],
  ["RACE", "White · asian · 'White '", "WHITE · ASIAN", "Free text, mixed case, stray spaces — trim then normalise", SEA],
  ["ETHNIC", "Not Hispanic or Latino", "NOT HISPANIC OR LATINO", "Upper-case to match CT exactly", ACCENT],
  ["ARMCD", "Drug A / Placebo", "A / P", "Derived short code: max 20 chars, no spaces", INK],
];
// 4 rows at 1.02 high + 0.07 gap end at 6.07, so the warning card below can start
// at 6.20. The previous 1.15/1.22 spacing ran the ARM row to 6.66 — underneath the
// warning card, which is drawn later and painted straight over it. The row rendered
// as a blank strip with the warning sitting on top.
let cy = 1.78;
ct.forEach(r => {
  card(s, 0.7, cy, 12.0, 1.02, PAPER);
  s.addText(r[0], { x: 1.0, y: cy + 0.26, w: 1.5, h: 0.5, fontFace: MONO, bold: true, fontSize: 16, color: r[4] === INK ? INK : r[4], valign: "middle", margin: 0 });
  s.addText(r[1], { x: 2.6, y: cy + 0.26, w: 3.1, h: 0.5, fontFace: MONO, fontSize: 12, color: MUTED, valign: "middle", margin: 0 });
  s.addText("→", { x: 5.75, y: cy + 0.26, w: 0.4, h: 0.5, align: "center", fontSize: 16, bold: true, color: ACCENT, valign: "middle", margin: 0 });
  s.addText(r[2], { x: 6.25, y: cy + 0.26, w: 2.5, h: 0.5, fontFace: MONO, bold: true, fontSize: 13, color: INK, valign: "middle", margin: 0 });
  s.addText(r[3], { x: 8.9, y: cy + 0.21, w: 3.6, h: 0.6, fontFace: BFONT, fontSize: 11.5, color: MUTED, valign: "middle", margin: 0 });
  cy += 1.09;
});
card(s, 0.7, 6.20, 12.0, 0.95, "FDF1E7");
s.addText([
  { text: "Production warning.  ", options: { bold: true, color: "B5651A", fontSize: 14 } },
  { text: "Blindly upper-casing free text happens to produce valid CT for this study. It would also let a site's \"Caucasian\" through un-flagged. Real mapping code uses an explicit lookup and fails loudly on anything it does not recognise.", options: { color: INK, fontSize: 13 } },
], { x: 1.0, y: 6.33, w: 11.4, h: 0.72, fontFace: BFONT, valign: "middle", lineSpacing: 19, margin: 0 });
s.addNotes("Four different flavours of CT work in one domain: decode a numeric code (SEX), normalise free text (RACE, ETHNIC), and derive a short code (ARMCD). The production warning is the point trainees should carry into their jobs — the exercise in Notebook 04 has them write the validation check.");

// ============ 9. ARM vs ACTARM ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Planned versus actual", "ARM, ARMCD, ACTARM, ACTARMCD");
card(s, 0.7, 1.9, 5.9, 2.3, PAPER);
s.addText("ARM / ARMCD", { x: 1.0, y: 2.1, w: 5.3, h: 0.45, fontFace: HFONT, bold: true, fontSize: 20, color: TEAL, margin: 0 });
s.addText("PLANNED — the arm the subject was randomized to.", { x: 1.0, y: 2.6, w: 5.3, h: 0.5, fontFace: BFONT, bold: true, fontSize: 13.5, color: INK, margin: 0 });
s.addText("Comes from the randomization on the demographics form.", { x: 1.0, y: 3.2, w: 5.3, h: 0.8, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
card(s, 6.8, 1.9, 5.9, 2.3, PAPER);
s.addText("ACTARM / ACTARMCD", { x: 7.1, y: 2.1, w: 5.3, h: 0.45, fontFace: HFONT, bold: true, fontSize: 20, color: ACCENT, margin: 0 });
s.addText("ACTUAL — the arm the subject really received.", { x: 7.1, y: 2.6, w: 5.3, h: 0.5, fontFace: BFONT, bold: true, fontSize: 13.5, color: INK, margin: 0 });
s.addText("Determined from what was actually administered (EX).", { x: 7.1, y: 3.2, w: 5.3, h: 0.8, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
card(s, 0.7, 4.45, 12.0, 1.15, "EAF5F0");
s.addText([
  { text: "In ABC-01 they are identical  ", options: { bold: true, color: TEAL, fontSize: 14.5 } },
  { text: "— every subject received the treatment they were randomized to, so ACTARM = ARM for all 8. That is the normal case, and it is why the copy looks trivial.", options: { color: INK, fontSize: 13.5 } },
], { x: 1.0, y: 4.62, w: 11.4, h: 0.85, fontFace: BFONT, valign: "middle", lineSpacing: 20, margin: 0 });
card(s, 0.7, 5.8, 12.0, 1.2, INK);
s.addText([
  { text: "When would they differ?  ", options: { bold: true, color: MINT, fontSize: 14.5 } },
  { text: "A subject randomized to Drug A who is dispensed placebo by a pharmacy error has ARM = Drug A but ACTARM = Placebo. Safety analyses use the actual arm; efficacy analyses usually use the planned one. All four variables are Required in SDTMIG v3.3.", options: { color: "C7DCE0", fontSize: 13 } },
], { x: 1.0, y: 5.98, w: 11.4, h: 0.9, fontFace: BFONT, valign: "middle", lineSpacing: 19, margin: 0 });
s.addNotes("Trainees find the ARM/ACTARM duplication pointless until they see the mis-dosing case. Emphasise that both pairs are Required — you cannot omit ACTARM just because it equals ARM. The analysis-population distinction (safety uses as-treated, efficacy uses as-randomized) is worth mentioning as a preview of ADaM.");

// ============ 10. REFERENCE DATES ============
s = p.addSlide(); bg(s, INK);
headerDark(s, "Timing anchors", "The six reference dates — and where each comes from");
const refs = [
  ["RFSTDTC", "First dose", "ex_raw.EXSTDTC", "Defines Study Day 1 for the WHOLE study", ACCENT],
  ["RFENDTC", "Last dose", "ex_raw.EXENDTC", "", TEAL],
  ["RFXSTDTC", "First study treatment", "ex_raw.EXSTDTC", "", TEAL],
  ["RFXENDTC", "Last study treatment", "ex_raw.EXENDTC", "", TEAL],
  ["RFICDTC", "Informed consent", "dm_raw.RFICDTC", "Also becomes a DS protocol milestone", MINT],
  ["RFPENDTC", "End of participation", "ds_raw.EOSDT", "From the Disposition form", MINT],
];
const t = [[
  { text: "Variable", options: { bold: true, color: INK, fill: { color: MINT }, fontFace: BFONT, fontSize: 12.5 } },
  { text: "Meaning", options: { bold: true, color: WHITE, fill: { color: TEAL }, fontFace: BFONT, fontSize: 12.5 } },
  { text: "Source", options: { bold: true, color: WHITE, fill: { color: TEAL }, fontFace: BFONT, fontSize: 12.5 } },
  { text: "Note", options: { bold: true, color: WHITE, fill: { color: TEAL }, fontFace: BFONT, fontSize: 12.5 } },
]];
refs.forEach((r, i) => {
  const fill = i % 2 ? "16404F" : "13323F";
  t.push([
    { text: r[0], options: { color: r[4] === MINT ? MINT : (r[4] === ACCENT ? "F0B27A" : "9FC0C6"), fill: { color: fill }, fontFace: MONO, bold: true, fontSize: 12 } },
    { text: r[1], options: { color: WHITE, fill: { color: fill }, fontFace: BFONT, fontSize: 12 } },
    { text: r[2], options: { color: "C7DCE0", fill: { color: fill }, fontFace: MONO, fontSize: 11.5 } },
    { text: r[3], options: { color: r[3] ? "F0B27A" : "C7DCE0", fill: { color: fill }, fontFace: BFONT, fontSize: 11.5, italic: true } },
  ]);
});
s.addTable(t, { x: 0.7, y: 2.15, w: 12.0, colW: [2.1, 2.6, 3.0, 4.3], rowH: 0.5,
  border: { type: "solid", color: "2A5566", pt: 1 }, valign: "middle", margin: [2, 8, 2, 8] });
s.addText("Only two of the six come from the demographics form. Four are borrowed from other CRFs — which is why DM cannot be built in isolation.",
  { x: 0.7, y: 6.2, w: 12, h: 0.5, fontFace: BFONT, italic: true, fontSize: 14, color: MINT, margin: 0 });
s.addNotes("The table trainees should keep beside them while mapping. RFSTDTC is the one that matters most — every --DY in every domain is computed against it. Note RFSTDTC and RFXSTDTC are the same value here because the reference start IS first exposure in this study; that is common but not universal.");

// ============ 11. THE FINISHED ROW ============
s = p.addSlide(); bg(s, WHITE);
header(s, "The target", "One finished DM row");
const dmHdr = ["USUBJID", "SUBJID", "SITEID", "RFSTDTC", "RFICDTC", "AGE", "AGEU", "SEX", "RACE", "ARMCD", "ARM", "COUNTRY"];
const dmRow = ["ABC-01-01-001", "001", "01", "2024-03-01", "2024-02-20", "54", "YEARS", "F", "WHITE", "A", "Drug A", "USA"];
const dt = [dmHdr.map(h => ({ text: h, options: { bold: true, color: WHITE, fill: { color: INK }, align: "center", fontFace: MONO, fontSize: 9.5 } })),
            dmRow.map(v => ({ text: v, options: { color: INK, fill: { color: PAPER }, align: "center", fontFace: MONO, fontSize: 9.5 } }))];
s.addTable(dt, { x: 0.5, y: 1.75, w: 12.35, colW: [1.75, 0.8, 0.75, 1.25, 1.25, 0.6, 0.85, 0.6, 1.0, 0.85, 1.05, 0.95], rowH: 0.5,
  border: { type: "solid", color: LINE, pt: 1 }, valign: "middle", margin: [2, 3, 2, 3] });
s.addText("(23 variables in total — 12 shown)", { x: 0.5, y: 2.85, w: 12, h: 0.3, fontFace: BFONT, italic: true, fontSize: 11.5, color: MUTED, margin: 0 });
const traced = [
  ["Copied as collected", "SUBJID · SITEID · ARM · COUNTRY", TEAL],
  ["Derived", "USUBJID · AGE · ARMCD · ACTARMCD", ACCENT],
  ["Assigned", "STUDYID · DOMAIN · AGEU", SEA],
  ["Mapped to CT", "SEX · RACE · ETHNIC", INK],
  ["Borrowed from another form", "RFSTDTC · RFENDTC · RFXSTDTC · RFXENDTC · RFPENDTC", MINT],
];
let ty = 3.35;
traced.forEach((r, i) => {
  card(s, 0.7, ty, 12.0, 0.62, i % 2 ? PAPER : WHITE);
  s.addShape(p.ShapeType.roundRect, { x: 0.9, y: ty + 0.13, w: 0.14, h: 0.36, rectRadius: 0.05, fill: { color: r[2] }, line: { type: "none" } });
  s.addText(r[0], { x: 1.25, y: ty + 0.08, w: 3.6, h: 0.45, fontFace: BFONT, bold: true, fontSize: 13, color: INK, valign: "middle", margin: 0 });
  s.addText(r[1], { x: 4.9, y: ty + 0.08, w: 7.5, h: 0.45, fontFace: MONO, fontSize: 11.5, color: MUTED, valign: "middle", margin: 0 });
  ty += 0.7;
});
s.addText("Every DM variable is one of these five kinds. Classify each one before you write any code — that IS the mapping specification.",
  { x: 0.7, y: 6.95, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 13, color: TEAL, margin: 0 });
s.addNotes("The five-way classification is the mental model for the Excel exercise: for each target variable, ask which kind it is. Copied, derived, assigned, CT-mapped, or borrowed. Once classified, the code writes itself. This slide is the bridge into the hands-on work.");

// ============ 12. PITFALLS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Learn from these", "Common DM mistakes");
const pit = [
  ["Adding a DMSEQ", "DM has no sequence variable — one row per subject means nothing to sequence."],
  ["USUBJID from SUBJID alone", "Not unique across sites. Two subject 001s become one person."],
  ["Simple year subtraction for AGE", "Gives 55 instead of 54. Check whether the birthday has occurred."],
  ["Blank RFSTDTC", "You forgot to join EX. Every downstream --DY will be wrong or missing."],
  ["Omitting ACTARM / ACTARMCD", "Both are Required in SDTMIG v3.3, even when they equal ARM."],
  ["Looking for end-of-study in DM raw", "It is on the Disposition form — DM borrows RFPENDTC from it."],
];
pit.forEach((m, i) => {
  const x = 0.7 + (i % 2) * 6.1, y = 1.85 + Math.floor(i / 2) * 1.6;
  card(s, x, y, 5.9, 1.45, i % 2 ? WHITE : PAPER);
  circle(s, x + 0.25, y + 0.42, 0.6, ACCENT, "✕", INK, 16);
  s.addText([{ text: m[0] + "\n", options: { bold: true, fontSize: 14, color: INK } },
             { text: m[1], options: { fontSize: 11.8, color: MUTED } }],
    { x: x + 1.05, y: y + 0.18, w: 4.7, h: 1.1, fontFace: BFONT, valign: "middle", margin: 0 });
});
s.addNotes("All six are mistakes that show up in real submissions and that Pinnacle 21 would flag. The blank-RFSTDTC one is the most damaging because it fails silently — DM itself looks fine, but every other domain's study day is broken.");

// ============ 13. WHAT'S NEXT ============
s = p.addSlide(); bg(s, INK);
s.addShape(p.ShapeType.ellipse, { x: 10.2, y: 4.6, w: 5.0, h: 5.0, fill: { color: "133B4C" }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.2, y: 5.6, w: 3.0, h: 3.0, fill: { color: TEAL }, line: { type: "none" } });
s.addText("WHAT'S NEXT", { x: 0.7, y: 1.4, w: 11, h: 0.35, fontFace: BFONT, bold: true, fontSize: 13, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Map it by hand, then automate it", { x: 0.66, y: 1.8, w: 11.5, h: 0.8, fontFace: HFONT, bold: true, fontSize: 32, color: WHITE, margin: 0 });
const nn = [
  ["Step 1 · Excel", "Map all 8 subjects into DM by hand in the mapping workbook. No code — just the rules.", ACCENT],
  ["Step 2 · Notebook 04", "Build the same DM dataset in SAS. Compare it to what you did by hand.", TEAL],
  ["Step 3 · Check", "Compare against data/sdtm/dm.csv — the finished reference.", MINT],
];
let ny = 3.0;
nn.forEach((n, i) => {
  circle(s, 0.7, ny, 0.62, n[2], String(i + 1), n[2] === TEAL ? WHITE : INK, 17);
  s.addText([{ text: n[0] + "   ", options: { bold: true, fontSize: 17, color: WHITE } },
             { text: n[1], options: { fontSize: 13.5, color: "C7DCE0" } }],
    { x: 1.55, y: ny - 0.02, w: 10.8, h: 0.8, fontFace: BFONT, valign: "middle", margin: 0 });
  ny += 1.05;
});
s.addText("Doing it by hand first is deliberate: if you cannot map a row in a spreadsheet, you cannot write code that maps 800.",
  { x: 0.7, y: 6.5, w: 11.5, h: 0.6, fontFace: BFONT, italic: true, fontSize: 14, color: MINT, margin: 0 });
s.addNotes("Close by setting up the three-step sequence. The rationale for the manual step is worth saying out loud: spreadsheets force you to confront every value individually, which is exactly what builds the intuition. Then the code becomes an automation of something they already understand, rather than magic. End of Module 05.");

p.writeFile({ fileName: "/Volumes/D Drive/SDTM Training/Bootcamp/presentations/05_dm_domain.pptx" })
  .then(f => console.log("WROTE", f))
  .catch(e => { console.error(e); process.exit(1); });
