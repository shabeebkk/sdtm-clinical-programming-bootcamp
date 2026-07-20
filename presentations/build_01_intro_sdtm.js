// Build: 01_intro_sdtm.pptx — "Introduction to CDISC & SDTM Foundations"
// Bootcamp Phase 1 deck. Grounded in SDTMIG v3.3 / SDTM v1.7.
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
p.author = "Clinical Programming Bootcamp";
p.title = "Introduction to CDISC & SDTM Foundations";

// ---- Palette (medical teal) ----
const INK   = "0F2E3D"; // dark navy-teal
const TEAL  = "0E7C86"; // primary
const SEA   = "1FA8A0"; // seafoam
const MINT  = "6FC8B4"; // light mint
const ACCENT= "E8833A"; // warm orange pop
const WHITE = "FFFFFF";
const PAPER = "F3F7F8"; // card tint on white
const CARD2 = "E7F0F1"; // deeper tint
const MUTED = "5A7682"; // muted text
const LINE  = "CFDEE1"; // hairline

const HFONT = "Cambria";      // serif headers
const BFONT = "Calibri";      // sans body

const W = 13.33, H = 7.5;

function shadow() { return { type: "outer", color: "8AA0A8", blur: 8, offset: 3, angle: 90, opacity: 0.35 }; }

// Slide background helper
function bg(slide, color) { slide.background = { color }; }

// Colored circle with number or short label
function circle(slide, x, y, d, fill, txt, txtColor, size) {
  slide.addShape(p.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill }, line: { type: "none" } });
  slide.addText(txt, { x, y, w: d, h: d, align: "center", valign: "middle",
    fontFace: BFONT, fontSize: size || 18, bold: true, color: txtColor || WHITE, margin: 0 });
}

// Section eyebrow + title block for content slides
function header(slide, eyebrow, title, titleColor) {
  slide.addText(eyebrow.toUpperCase(), { x: 0.6, y: 0.42, w: 12, h: 0.3,
    fontFace: BFONT, fontSize: 12, bold: true, color: TEAL, charSpacing: 2, margin: 0 });
  slide.addText(title, { x: 0.6, y: 0.72, w: 12.1, h: 0.75,
    fontFace: HFONT, fontSize: 30, bold: true, color: titleColor || INK, margin: 0 });
}

// Rounded card
function card(slide, x, y, w, h, fill) {
  slide.addShape(p.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.09,
    fill: { color: fill || WHITE }, line: { color: LINE, width: 1 }, shadow: shadow() });
}

// ============================================================
// SLIDE 1 — TITLE (dark)
// ============================================================
let s = p.addSlide(); bg(s, INK);
// decorative concentric rings motif (top-right)
s.addShape(p.ShapeType.ellipse, { x: 9.7, y: -1.6, w: 5.2, h: 5.2, fill: { color: "133B4C" }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 10.7, y: -0.6, w: 3.2, h: 3.2, fill: { color: TEAL }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.45, y: 0.15, w: 1.7, h: 1.7, fill: { color: ACCENT }, line: { type: "none" } });
s.addText("CLINICAL PROGRAMMING BOOTCAMP  ·  MODULE 01", { x: 0.7, y: 2.0, w: 9, h: 0.4,
  fontFace: BFONT, fontSize: 14, bold: true, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Introduction to CDISC\n& SDTM Foundations", { x: 0.66, y: 2.5, w: 9.6, h: 2.2,
  fontFace: HFONT, fontSize: 46, bold: true, color: WHITE, lineSpacing: 50, margin: 0 });
s.addText("How clinical trial data becomes a standardized, submission-ready dataset — from raw case report forms to a regulatory package.",
  { x: 0.7, y: 4.75, w: 9.2, h: 0.9, fontFace: BFONT, fontSize: 16, color: "C7DCE0", margin: 0 });
s.addText("CDISC · CDASH · SDTM · ADaM · Controlled Terminology · Define-XML",
  { x: 0.7, y: 6.5, w: 12, h: 0.4, fontFace: BFONT, fontSize: 12, italic: true, color: MUTED, margin: 0 });
s.addNotes("Welcome. This module is the foundation for the whole bootcamp. Goal: by the end you can explain what CDISC and SDTM are, why regulators require them, and how raw collected data becomes a standardized submission dataset. No prior clinical or programming knowledge assumed — we define every acronym as we go. CDISC = Clinical Data Interchange Standards Consortium. SDTM = Study Data Tabulation Model.");

// ============================================================
// SLIDE 2 — The pre-CDISC problem
// ============================================================
s = p.addSlide(); bg(s, WHITE);
header(s, "Why standards exist", "Before standards: every study spoke a different language");
// left: the problem list
const probs = [
  ["Same idea, different names", "One study calls a subject SUBJID, another PATIENT, another PT_NO — for the exact same thing."],
  ["Different structures", "Adverse events stored one-row-per-event here, one-column-per-event there."],
  ["Different codes", "Sex recorded as M/F, 1/2, Male/Female, or Homme/Femme across studies."],
  ["Re-learning every time", "A reviewer opening a new submission had to decode the data from scratch."],
];
let yy = 1.75;
probs.forEach((row, i) => {
  circle(s, 0.7, yy, 0.5, i % 2 ? SEA : TEAL, "✕", WHITE, 18);
  s.addText([{ text: row[0] + "\n", options: { bold: true, fontSize: 15, color: INK } },
             { text: row[1], options: { fontSize: 12.5, color: MUTED } }],
    { x: 1.4, y: yy - 0.06, w: 5.5, h: 0.95, fontFace: BFONT, valign: "top", margin: 0 });
  yy += 1.16;
});
// right: illustrative "three studies, three formats" cards
card(s, 7.3, 1.7, 5.4, 4.9, PAPER);
s.addText("The reviewer's nightmare", { x: 7.6, y: 1.9, w: 4.8, h: 0.4, fontFace: BFONT, bold: true, fontSize: 14, color: TEAL, margin: 0 });
const mini = [
  ["Study A", "SUBJID | SEX=1 | AE in wide format"],
  ["Study B", "PATIENT | SEX=M | AE one row per event"],
  ["Study C", "PT_NO | SEX=Male | AE free-text notes"],
];
let my = 2.4;
mini.forEach(m => {
  card(s, 7.6, my, 4.8, 0.92, WHITE);
  s.addText([{ text: m[0] + "  ", options: { bold: true, color: INK, fontSize: 13 } },
             { text: m[1], options: { color: MUTED, fontSize: 11.5, fontFace: "Courier New" } }],
    { x: 7.8, y: my + 0.12, w: 4.5, h: 0.7, fontFace: BFONT, valign: "middle", margin: 0 });
  my += 1.08;
});
s.addText("Every submission = a new puzzle for the FDA reviewer.",
  { x: 7.6, y: 5.75, w: 4.8, h: 0.6, fontFace: BFONT, italic: true, fontSize: 12.5, color: INK, margin: 0 });
s.addNotes("Set the scene. A pharma company runs dozens of studies over a drug's life; regulators receive submissions from hundreds of companies. Before standards, each dataset was shaped and named however the programmer chose. Reviewers wasted enormous time just understanding the data before they could review the science. FDA = US Food and Drug Administration. This is the pain CDISC was created to remove.");

// ============================================================
// SLIDE 3 — Cost of chaos → value of standards (stat callouts)
// ============================================================
s = p.addSlide(); bg(s, INK);
s.addText("WHY STANDARDS EXIST", { x: 0.7, y: 0.55, w: 10, h: 0.3, fontFace: BFONT, bold: true, fontSize: 12, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Standards turn re-work into re-use", { x: 0.66, y: 0.9, w: 11.5, h: 0.7, fontFace: HFONT, bold: true, fontSize: 30, color: WHITE, margin: 0 });
const stats = [
  ["1", "shared structure", "Learn the data model once, apply it to every study and every sponsor."],
  ["100%", "required by FDA & PMDA", "Standardized study data is mandatory for regulatory submissions."],
  ["Faster", "review & reuse", "Reviewers, tools, and analysis programs all know what to expect."],
];
let sx = 0.7;
stats.forEach(st => {
  card(s, sx, 2.1, 3.9, 3.9, "16404F");
  s.addText(st[0], { x: sx, y: 2.45, w: 3.9, h: 1.1, align: "center", fontFace: HFONT, bold: true, fontSize: 54, color: ACCENT, margin: 0 });
  s.addText(st[1].toUpperCase(), { x: sx + 0.3, y: 3.65, w: 3.3, h: 0.4, align: "center", fontFace: BFONT, bold: true, fontSize: 14, color: MINT, charSpacing: 1, margin: 0 });
  s.addText(st[2], { x: sx + 0.35, y: 4.15, w: 3.2, h: 1.5, align: "center", fontFace: BFONT, fontSize: 13, color: "C7DCE0", margin: 0 });
  sx += 4.13;
});
s.addText("A data standard is a shared agreement on structure, names, and codes — so data means the same thing everywhere.",
  { x: 0.7, y: 6.4, w: 12, h: 0.5, fontFace: BFONT, italic: true, fontSize: 14, color: "9FC0C6", margin: 0 });
s.addNotes("The payoff of standards. PMDA = Pharmaceuticals and Medical Devices Agency, Japan's regulator — like FDA, it requires CDISC-standard data. Key message: standardization is not bureaucratic box-ticking; it makes data reusable by people and by software. Automated validation, analysis templates, and reviewer tools all depend on the data being in a predictable shape.");

// ============================================================
// SLIDE 4 — What is CDISC
// ============================================================
s = p.addSlide(); bg(s, WHITE);
header(s, "The organization", "What is CDISC?");
card(s, 0.7, 1.8, 6.0, 4.7, PAPER);
s.addText("Clinical Data Interchange\nStandards Consortium", { x: 1.0, y: 2.1, w: 5.4, h: 1.0, fontFace: HFONT, bold: true, fontSize: 22, color: TEAL, lineSpacing: 24, margin: 0 });
s.addText([
  { text: "A global, non-profit organization\n", options: { bold: true, color: INK } },
  { text: "founded in 1997. It brings together industry, regulators, and technology providers to develop and maintain open data standards for clinical research.", options: { color: MUTED } },
], { x: 1.0, y: 3.25, w: 5.4, h: 1.3, fontFace: BFONT, fontSize: 14, valign: "top", margin: 0 });
s.addText("Its standards are vendor-neutral, freely published, and used worldwide across the drug-development lifecycle.",
  { x: 1.0, y: 4.75, w: 5.4, h: 1.4, fontFace: BFONT, fontSize: 14, italic: true, color: INK, margin: 0 });
// right: what CDISC gives you
const gives = [
  ["Common structure", "How datasets and variables are organized"],
  ["Common naming", "What each variable is called"],
  ["Common codelists", "The allowed values (Controlled Terminology)"],
  ["Common metadata", "How the data is described to reviewers"],
];
let gy = 1.9;
gives.forEach((g, i) => {
  card(s, 7.0, gy, 5.7, 1.05, WHITE);
  circle(s, 7.25, gy + 0.22, 0.6, [TEAL, SEA, ACCENT, INK][i], "✓", WHITE, 18);
  s.addText([{ text: g[0] + "\n", options: { bold: true, fontSize: 15, color: INK } },
             { text: g[1], options: { fontSize: 12.5, color: MUTED } }],
    { x: 8.0, y: gy + 0.14, w: 4.5, h: 0.8, fontFace: BFONT, valign: "middle", margin: 0 });
  gy += 1.16;
});
s.addNotes("CDISC the organization vs. CDISC the standards. Founded 1997, non-profit, consensus-based — sponsors, CROs, regulators and tool vendors all participate. CRO = Contract Research Organization, a company that runs trials on a sponsor's behalf. The standards are free to download from cdisc.org. Emphasize the four 'commons': structure, naming, codelists, metadata. Every downstream benefit flows from these.");

// ============================================================
// SLIDE 5 — The standards family
// ============================================================
s = p.addSlide(); bg(s, WHITE);
header(s, "The standards family", "One family, one lifecycle");
const fam = [
  ["CDASH", "Collection", "Standard for how data is captured on case report forms (CRFs).", TEAL],
  ["SDTM", "Tabulation", "Organizes collected data into standard domains for submission.", SEA],
  ["ADaM", "Analysis", "Analysis-ready datasets derived from SDTM, traceable to it.", ACCENT],
];
let fx = 0.7;
fam.forEach(f => {
  card(s, fx, 1.85, 3.7, 3.3, PAPER);
  s.addText(f[1].toUpperCase(), { x: fx + 0.25, y: 2.1, w: 3.2, h: 0.3, fontFace: BFONT, bold: true, fontSize: 12, color: MUTED, charSpacing: 1, margin: 0 });
  s.addText(f[0], { x: fx + 0.25, y: 2.42, w: 3.2, h: 0.6, fontFace: HFONT, bold: true, fontSize: 26, color: f[3], margin: 0 });
  s.addText(f[2], { x: fx + 0.25, y: 3.2, w: 3.25, h: 1.7, fontFace: BFONT, fontSize: 13.5, color: INK, margin: 0 });
  fx += 3.93;
});
// arrows between the three
s.addText("▶", { x: 4.42, y: 3.25, w: 0.4, h: 0.5, align: "center", fontSize: 20, color: MUTED, margin: 0 });
s.addText("▶", { x: 8.35, y: 3.25, w: 0.4, h: 0.5, align: "center", fontSize: 20, color: MUTED, margin: 0 });
// bottom band: two cross-cutting standards
card(s, 0.7, 5.45, 12.0, 1.35, INK);
s.addText([
  { text: "Controlled Terminology  ", options: { bold: true, color: MINT, fontSize: 15 } },
  { text: "— the standardized codelists (allowed values) used across all of the above.\n", options: { color: "C7DCE0", fontSize: 13 } },
  { text: "Define-XML  ", options: { bold: true, color: MINT, fontSize: 15 } },
  { text: "— the machine-readable “data dictionary” that describes every dataset and variable to the regulator.", options: { color: "C7DCE0", fontSize: 13 } },
], { x: 1.0, y: 5.6, w: 11.4, h: 1.05, fontFace: BFONT, valign: "middle", lineSpacing: 20, margin: 0 });
s.addNotes("The CDISC family maps to the stages of a study. CDASH = Clinical Data Acquisition Standards Harmonization (collection). SDTM (tabulation). ADaM = Analysis Data Model (analysis). CRF = Case Report Form, the form used to record trial data for each subject. Two standards cut across all stages: Controlled Terminology (the shared codelists) and Define-XML (the metadata/data dictionary). This deck focuses on SDTM, but you must know where it sits.");

// ============================================================
// SLIDE 6 — The clinical data journey (process flow)
// ============================================================
s = p.addSlide(); bg(s, INK);
s.addText("THE CLINICAL DATA JOURNEY", { x: 0.7, y: 0.55, w: 10, h: 0.3, fontFace: BFONT, bold: true, fontSize: 12, color: MINT, charSpacing: 2, margin: 0 });
s.addText("From patient visit to regulatory submission", { x: 0.66, y: 0.9, w: 12, h: 0.7, fontFace: HFONT, bold: true, fontSize: 30, color: WHITE, margin: 0 });
const journey = [
  ["01", "COLLECTION", "CDASH", "Data captured at sites on CRFs / EDC systems.", TEAL],
  ["02", "TABULATION", "SDTM", "Raw data mapped into standard submission domains.", SEA],
  ["03", "ANALYSIS", "ADaM", "Analysis datasets derived; tables & figures produced.", MINT],
  ["04", "SUBMISSION", "eCTD", "Package sent to regulators (FDA / PMDA) for review.", ACCENT],
];
let jx = 0.7;
journey.forEach((j, i) => {
  card(s, jx, 2.15, 2.85, 3.9, "16404F");
  circle(s, jx + 1.02, 2.45, 0.8, j[4], j[0], i === 2 ? INK : WHITE, 20);
  s.addText(j[1], { x: jx + 0.1, y: 3.4, w: 2.65, h: 0.35, align: "center", fontFace: BFONT, bold: true, fontSize: 14, color: WHITE, charSpacing: 1, margin: 0 });
  s.addText(j[2], { x: jx + 0.1, y: 3.78, w: 2.65, h: 0.5, align: "center", fontFace: HFONT, bold: true, fontSize: 20, color: j[4], margin: 0 });
  s.addText(j[3], { x: jx + 0.25, y: 4.45, w: 2.35, h: 1.4, align: "center", fontFace: BFONT, fontSize: 12, color: "C7DCE0", margin: 0 });
  jx += 3.05;
});
[3.62, 6.67, 9.72].forEach(ax => s.addText("▶", { x: ax, y: 3.85, w: 0.35, h: 0.5, align: "center", fontSize: 18, color: MINT, margin: 0 }));
s.addText("SDTM is the bridge: it standardizes collected data so analysis and regulatory review can build on a common foundation.",
  { x: 0.7, y: 6.35, w: 12, h: 0.5, fontFace: BFONT, italic: true, fontSize: 14, color: "9FC0C6", margin: 0 });
s.addNotes("The end-to-end pipeline. EDC = Electronic Data Capture, the software sites use to enter CRF data. eCTD = electronic Common Technical Document, the standardized submission format regulators require. Walk left to right. Emphasize SDTM's role as the bridge between raw collection and analysis. ADaM is always traceable back to SDTM — that traceability is a regulatory expectation.");

// ============================================================
// SLIDE 7 — What is SDTM & why it matters
// ============================================================
s = p.addSlide(); bg(s, WHITE);
header(s, "The standard in focus", "What is SDTM — and why it matters");
card(s, 0.7, 1.85, 6.2, 4.75, PAPER);
s.addText("Study Data Tabulation Model", { x: 1.0, y: 2.1, w: 5.6, h: 0.5, fontFace: HFONT, bold: true, fontSize: 22, color: TEAL, margin: 0 });
s.addText([
  { text: "SDTM defines a standard structure for organizing and formatting the data collected in a clinical trial", options: { color: INK, bold: true } },
  { text: " — so that the ", options: { color: MUTED } },
  { text: "tabulations", options: { color: INK, italic: true } },
  { text: " (the observed, as-collected data) are consistent across studies and sponsors.", options: { color: MUTED } },
], { x: 1.0, y: 2.75, w: 5.6, h: 1.5, fontFace: BFONT, fontSize: 15, valign: "top", lineSpacing: 22, margin: 0 });
s.addText("Think of SDTM as a set of labeled, standard-shaped boxes. Whatever the study, the same kind of data goes in the same box, with the same label.",
  { x: 1.0, y: 4.55, w: 5.6, h: 1.9, fontFace: BFONT, fontSize: 15, italic: true, color: INK, lineSpacing: 22, margin: 0 });
const why = [
  ["Required for submission", "FDA and Japan's PMDA mandate SDTM-formatted study data."],
  ["Consistency", "Every study is organized the same way — easy to combine and compare."],
  ["Enables automation", "Validation tools and review software rely on the predictable structure."],
  ["Traceability", "A clear starting point that analysis (ADaM) datasets trace back to."],
];
let wy = 1.9;
why.forEach((wv, i) => {
  card(s, 7.15, wy, 5.55, 1.09, WHITE);
  circle(s, 7.4, wy + 0.24, 0.6, [TEAL, SEA, ACCENT, INK][i], "★", WHITE, 16);
  s.addText([{ text: wv[0] + "\n", options: { bold: true, fontSize: 15, color: INK } },
             { text: wv[1], options: { fontSize: 12.5, color: MUTED } }],
    { x: 8.15, y: wy + 0.14, w: 4.4, h: 0.85, fontFace: BFONT, valign: "middle", margin: 0 });
  wy += 1.2;
});
s.addNotes("Definition to memorize: SDTM is a standard STRUCTURE for organizing observed clinical trial data. 'Tabulation' means the data as collected/observed — not analysis-derived results. The box analogy works well for freshers. Why it matters: it's a regulatory requirement (not optional), it makes data consistent and combinable, it enables automated checks, and it's the traceable source for ADaM.");

// ============================================================
// SLIDE 8 — SDTM Model vs SDTMIG
// ============================================================
s = p.addSlide(); bg(s, WHITE);
header(s, "Foundational documents", "SDTM Model vs. SDTMIG");
// two comparison columns
card(s, 0.7, 1.9, 5.85, 4.5, PAPER);
s.addText("SDTM (the Model)", { x: 1.0, y: 2.15, w: 5.2, h: 0.5, fontFace: HFONT, bold: true, fontSize: 22, color: TEAL, margin: 0 });
s.addText("The general framework", { x: 1.0, y: 2.68, w: 5.2, h: 0.3, fontFace: BFONT, bold: true, italic: true, fontSize: 13, color: MUTED, margin: 0 });
[
  "Defines the underlying concepts and rules",
  "Introduces the General Observation Classes",
  "Lists the variable roles (Identifier, Topic, Timing, Qualifier)",
  "Standard-wide — not tied to any one domain",
].forEach((t, i) => {
  s.addText(t, { x: 1.15, y: 3.15 + i * 0.72, w: 5.1, h: 0.65, fontFace: BFONT, fontSize: 13.5, color: INK, bullet: { code: "2022", indent: 14 }, margin: 0 });
});
card(s, 6.8, 1.9, 5.85, 4.5, INK);
s.addText("SDTMIG (the Guide)", { x: 7.1, y: 2.15, w: 5.2, h: 0.5, fontFace: HFONT, bold: true, fontSize: 22, color: MINT, margin: 0 });
s.addText("Implementation Guide — how to actually do it", { x: 7.1, y: 2.68, w: 5.2, h: 0.3, fontFace: BFONT, bold: true, italic: true, fontSize: 13, color: "9FC0C6", margin: 0 });
[
  "Turns the model into concrete, buildable domains",
  "Specifies exact variables for DM, AE, VS, LB, …",
  "Gives assumptions, examples, and business rules",
  "This is the book programmers open every day",
].forEach((t, i) => {
  s.addText(t, { x: 7.25, y: 3.15 + i * 0.72, w: 5.1, h: 0.65, fontFace: BFONT, fontSize: 13.5, color: "E7F0F1", bullet: { code: "2022", indent: 14 }, margin: 0 });
});
s.addText("Model = the rules of the game.   SDTMIG = the detailed playbook.   We use SDTMIG v3.3 throughout this bootcamp.",
  { x: 0.7, y: 6.6, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 13.5, color: TEAL, align: "center", margin: 0 });
s.addNotes("A distinction freshers must get right. The SDTM Model is the abstract framework (concepts, observation classes, variable roles). The SDTMIG — Implementation Guide — is the practical document that tells you exactly which variables belong in each domain and how to populate them. Analogy: model = grammar rules; IG = the phrasebook. We standardize on SDTMIG v3.3 (built on SDTM v1.7). Always cite the version — rules change between versions.");

// ============================================================
// SLIDE 9 — 3 General Observation Classes
// ============================================================
s = p.addSlide(); bg(s, WHITE);
header(s, "The core idea", "Everything is an observation");
s.addText("Almost all trial data fits one of three General Observation Classes. The class determines the shape of the domain.",
  { x: 0.6, y: 1.5, w: 12, h: 0.5, fontFace: BFONT, fontSize: 14.5, color: MUTED, margin: 0 });
const goc = [
  ["INTERVENTIONS", "Something given to or done to the subject", "Treatments, therapies, procedures — investigational or not.", "Examples: CM (concomitant meds), EX (exposure)", TEAL],
  ["EVENTS", "Something that happened to the subject", "Occurrences and milestones during the trial.", "Examples: AE (adverse events), MH (medical history), DS (disposition)", SEA],
  ["FINDINGS", "Something measured or assessed", "The result of an observation or test.", "Examples: VS (vital signs), LB (labs), EG (ECG)", ACCENT],
];
let gx = 0.7;
goc.forEach(g => {
  card(s, gx, 2.15, 3.95, 4.35, PAPER);
  s.addShape(p.ShapeType.roundRect, { x: gx, y: 2.15, w: 3.95, h: 0.85, rectRadius: 0.09, fill: { color: g[4] }, line: { type: "none" } });
  s.addText(g[0], { x: gx, y: 2.3, w: 3.95, h: 0.55, align: "center", fontFace: HFONT, bold: true, fontSize: 20, color: g[4] === ACCENT ? INK : WHITE, margin: 0 });
  s.addText(g[1], { x: gx + 0.28, y: 3.2, w: 3.4, h: 0.7, fontFace: BFONT, bold: true, fontSize: 14, color: INK, margin: 0 });
  s.addText(g[2], { x: gx + 0.28, y: 3.95, w: 3.4, h: 1.0, fontFace: BFONT, fontSize: 12.5, color: MUTED, margin: 0 });
  s.addText(g[3], { x: gx + 0.28, y: 5.55, w: 3.4, h: 0.85, fontFace: BFONT, italic: true, fontSize: 12, color: g[4] === ACCENT ? "B5651A" : g[4], margin: 0 });
  gx += 4.1;
});
s.addNotes("The single most important concept in SDTM. Ask for each data point: was it DONE to the subject (Intervention), did it HAPPEN to the subject (Event), or was it MEASURED (Finding)? This three-way split determines which standard variables the domain gets. A fourth 'shape' — Special Purpose domains like DM — doesn't follow these classes; we cover that next. Give quick quiz examples: blood pressure? Finding. Headache? Event. Aspirin taken? Intervention.");

// ============================================================
// SLIDE 10 — Domain categories
// ============================================================
s = p.addSlide(); bg(s, WHITE);
header(s, "How domains are grouped", "The domain categories");
const cats = [
  ["Special Purpose", "Unique structure, don't follow the 3 classes.", "DM · CO · SE · SV", TEAL],
  ["Interventions", "Treatments & procedures given to the subject.", "CM · EX · EC · PR · SU", SEA],
  ["Events", "Things that happened to the subject.", "AE · MH · DS · CE", ACCENT],
  ["Findings", "Measurements & assessments.", "VS · LB · EG · PE · QS", INK],
  ["Trial Design", "Describe the study itself, not subjects.", "TA · TE · TS · TV", TEAL],
  ["Relationships", "Link records across domains.", "RELREC · SUPPQUAL", MUTED],
];
let cx = 0.7, cyy = 1.85;
cats.forEach((c, i) => {
  const col = i % 3, rowi = Math.floor(i / 3);
  const x = 0.7 + col * 4.1, y = 1.85 + rowi * 2.45;
  card(s, x, y, 3.9, 2.25, i % 2 ? PAPER : WHITE);
  circle(s, x + 0.25, y + 0.25, 0.55, c[3], String(i + 1), c[3] === "5A7682" ? WHITE : (c[3] === INK ? WHITE : WHITE), 16);
  s.addText(c[0], { x: x + 0.95, y: y + 0.28, w: 2.85, h: 0.55, fontFace: HFONT, bold: true, fontSize: 16.5, color: INK, valign: "middle", margin: 0 });
  s.addText(c[1], { x: x + 0.28, y: y + 0.95, w: 3.4, h: 0.75, fontFace: BFONT, fontSize: 12.5, color: MUTED, margin: 0 });
  s.addText(c[2], { x: x + 0.28, y: y + 1.68, w: 3.4, h: 0.4, fontFace: "Courier New", bold: true, fontSize: 12.5, color: c[3] === "5A7682" ? INK : c[3], margin: 0 });
});
s.addNotes("Six groupings. Three map directly to the observation classes (Interventions, Events, Findings). Special Purpose domains have their own fixed structure — DM (Demographics), CO (Comments), SE (Subject Elements), SV (Subject Visits). Trial Design domains describe the study skeleton itself (arms, elements, visits, summary) and have no subject-level observations in the usual sense. Relationship datasets — RELREC and SUPPQUAL — connect records and hold non-standard variables. Don't memorize all codes now; recognize the categories.");

// ============================================================
// SLIDE 11 — Common domains cheat sheet (table)
// ============================================================
s = p.addSlide(); bg(s, WHITE);
header(s, "Reference", "Common domains cheat sheet");
const rows = [
  ["DM", "Demographics", "Special Purpose", "One row per subject: age, sex, race, arm"],
  ["AE", "Adverse Events", "Events", "Untoward medical occurrences"],
  ["CM", "Concomitant Meds", "Interventions", "Other medications the subject took"],
  ["EX", "Exposure", "Interventions", "Study treatment actually administered"],
  ["LB", "Laboratory", "Findings", "Lab test results (chemistry, hematology…)"],
  ["VS", "Vital Signs", "Findings", "BP, pulse, temperature, weight, height"],
  ["MH", "Medical History", "Events", "Relevant prior/ongoing conditions"],
  ["DS", "Disposition", "Events", "Subject's status / completion / withdrawal"],
  ["EG", "ECG", "Findings", "Electrocardiogram results"],
  ["PE", "Physical Exam", "Findings", "Physical examination findings"],
];
const catColor = { "Special Purpose": TEAL, "Events": ACCENT, "Interventions": SEA, "Findings": INK };
const tbl = [[
  { text: "Domain", options: { bold: true, color: WHITE, fill: { color: TEAL }, align: "center", fontFace: BFONT, fontSize: 13 } },
  { text: "Name", options: { bold: true, color: WHITE, fill: { color: TEAL }, fontFace: BFONT, fontSize: 13 } },
  { text: "Class / Category", options: { bold: true, color: WHITE, fill: { color: TEAL }, fontFace: BFONT, fontSize: 13 } },
  { text: "What it holds", options: { bold: true, color: WHITE, fill: { color: TEAL }, fontFace: BFONT, fontSize: 13 } },
]];
rows.forEach((r, i) => {
  const fill = i % 2 ? PAPER : WHITE;
  tbl.push([
    { text: r[0], options: { bold: true, color: TEAL, align: "center", fill: { color: fill }, fontFace: "Courier New", fontSize: 13 } },
    { text: r[1], options: { color: INK, fill: { color: fill }, fontFace: BFONT, fontSize: 12.5, bold: true } },
    { text: r[2], options: { color: catColor[r[2]] || MUTED, fill: { color: fill }, fontFace: BFONT, fontSize: 12, bold: true } },
    { text: r[3], options: { color: MUTED, fill: { color: fill }, fontFace: BFONT, fontSize: 12 } },
  ]);
});
s.addTable(tbl, { x: 0.7, y: 1.75, w: 12.0, colW: [1.4, 2.7, 2.6, 5.3], rowH: 0.44,
  border: { type: "solid", color: LINE, pt: 1 }, valign: "middle", margin: [2, 6, 2, 6] });
s.addText("These 10 cover the backbone of most studies — you'll build several of them by hand in this bootcamp.",
  { x: 0.7, y: 6.95, w: 12, h: 0.35, fontFace: BFONT, italic: true, fontSize: 12.5, color: TEAL, margin: 0 });
s.addNotes("A keep-it-handy reference. Don't read every row aloud; highlight that domains are named with 2-letter codes and each belongs to a class. Note DM is special-purpose (one row per subject) while AE/LB/VS have many rows per subject. Students will build DM, AE, CM, EX, VS, and LB later in the course. Point out the color coding matches the observation classes from earlier.");

// ============================================================
// SLIDE 12 — Anatomy of a domain (DM example, one row = one obs)
// ============================================================
s = p.addSlide(); bg(s, WHITE);
header(s, "Anatomy of a dataset", "One row = one observation (DM example)");
s.addText("In Demographics (DM), the observation is the subject — so there is exactly one row per subject.",
  { x: 0.6, y: 1.5, w: 12, h: 0.4, fontFace: BFONT, fontSize: 14, color: MUTED, margin: 0 });
const dmHdr = ["STUDYID", "DOMAIN", "USUBJID", "SUBJID", "AGE", "AGEU", "SEX", "RACE", "ARMCD", "ARM", "COUNTRY"];
const dmRows = [
  ["ABC-01", "DM", "ABC-01-01-001", "001", "54", "YEARS", "F", "WHITE", "A", "Drug A", "USA"],
  ["ABC-01", "DM", "ABC-01-01-002", "002", "60", "YEARS", "M", "ASIAN", "P", "Placebo", "JPN"],
  ["ABC-01", "DM", "ABC-01-01-003", "003", "46", "YEARS", "F", "BLACK OR AFRICAN AMERICAN", "A", "Drug A", "USA"],
];
const dmTbl = [dmHdr.map(h => ({ text: h, options: { bold: true, color: WHITE, fill: { color: INK }, align: "center", fontFace: "Courier New", fontSize: 9.5 } }))];
dmRows.forEach((r, i) => {
  dmTbl.push(r.map(c => ({ text: c, options: { color: INK, fill: { color: i % 2 ? PAPER : WHITE }, align: "center", fontFace: "Courier New", fontSize: 9 } })));
});
s.addTable(dmTbl, { x: 0.5, y: 2.05, w: 12.35, colW: [1.05, 0.85, 1.85, 0.8, 0.6, 0.9, 0.6, 1.75, 0.85, 1.1, 1.0], rowH: 0.52,
  border: { type: "solid", color: LINE, pt: 1 }, valign: "middle", margin: [2, 3, 2, 3] });
// callouts
card(s, 0.7, 4.7, 3.85, 1.95, PAPER);
s.addText("Rows = observations", { x: 0.95, y: 4.9, w: 3.4, h: 0.4, fontFace: BFONT, bold: true, fontSize: 15, color: TEAL, margin: 0 });
s.addText("Each row is one subject. Three subjects → three rows. No subject appears twice in DM.",
  { x: 0.95, y: 5.3, w: 3.4, h: 1.2, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
card(s, 4.75, 4.7, 3.85, 1.95, PAPER);
s.addText("Columns = variables", { x: 5.0, y: 4.9, w: 3.4, h: 0.4, fontFace: BFONT, bold: true, fontSize: 15, color: SEA, margin: 0 });
s.addText("Each column is one standardized variable with a fixed name (STUDYID, AGE, SEX…).",
  { x: 5.0, y: 5.3, w: 3.4, h: 1.2, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
card(s, 8.8, 4.7, 3.9, 1.95, PAPER);
s.addText("Values follow rules", { x: 9.05, y: 4.9, w: 3.4, h: 0.4, fontFace: BFONT, bold: true, fontSize: 15, color: ACCENT, margin: 0 });
s.addText("SEX = F/M and RACE values come from Controlled Terminology — not free text.",
  { x: 9.05, y: 5.3, w: 3.5, h: 1.2, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
s.addNotes("Read a real DM dataset. USUBJID (Unique Subject Identifier) must be unique across the WHOLE study — it typically concatenates study + site + subject. SUBJID is the site-local id. AGEU = Age Units. ARMCD is the short planned-arm code (<=20 chars, no spaces), ARM is the long text. Note RACE 'BLACK OR AFRICAN AMERICAN' is the exact Controlled Terminology value. Three callouts: rows=observations, columns=variables, values obey CT. This 'one row = one observation' idea generalizes to every domain — only the definition of 'observation' changes.");

// ============================================================
// SLIDE 13 — Variable roles
// ============================================================
s = p.addSlide(); bg(s, INK);
s.addText("STRUCTURE OF A DOMAIN", { x: 0.7, y: 0.55, w: 10, h: 0.3, fontFace: BFONT, bold: true, fontSize: 12, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Four variable roles", { x: 0.66, y: 0.9, w: 12, h: 0.7, fontFace: HFONT, bold: true, fontSize: 30, color: WHITE, margin: 0 });
const roles = [
  ["IDENTIFIER", "Who & which record", "Identifies the study, domain, subject, and record.", "STUDYID · DOMAIN · USUBJID · AESEQ", TEAL],
  ["TOPIC", "What the observation is about", "The focus of the row — the thing observed.", "AETERM · LBTESTCD · CMTRT", SEA],
  ["TIMING", "When it happened", "Dates, times, and study day of the observation.", "AESTDTC · VSDY · VISIT", MINT],
  ["QUALIFIER", "Describes / adds detail", "Everything that characterizes the topic value.", "AESEV · LBORRES · VSORRESU", ACCENT],
];
let rx = 0.7;
roles.forEach(r => {
  card(s, rx, 2.1, 2.95, 4.35, "16404F");
  s.addText(r[0], { x: rx + 0.1, y: 2.35, w: 2.75, h: 0.45, align: "center", fontFace: HFONT, bold: true, fontSize: 18, color: r[4] === MINT ? MINT : r[4], margin: 0 });
  s.addShape(p.ShapeType.line, { x: rx + 0.6, y: 2.95, w: 1.75, h: 0, line: { color: "2A5566", width: 1 } });
  s.addText(r[1], { x: rx + 0.22, y: 3.1, w: 2.5, h: 0.7, align: "center", fontFace: BFONT, bold: true, fontSize: 13.5, color: WHITE, margin: 0 });
  s.addText(r[2], { x: rx + 0.22, y: 3.85, w: 2.5, h: 1.3, align: "center", fontFace: BFONT, fontSize: 12, color: "C7DCE0", margin: 0 });
  s.addText(r[3], { x: rx + 0.2, y: 5.5, w: 2.55, h: 0.85, align: "center", fontFace: "Courier New", fontSize: 10.5, color: r[4] === MINT ? MINT : r[4], margin: 0 });
  rx += 3.05;
});
s.addText("Every SDTM variable plays exactly one role. Most variables are Qualifiers.",
  { x: 0.7, y: 6.65, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 13.5, color: "9FC0C6", margin: 0 });
s.addNotes("The four roles classify every variable by its job. Identifiers say who/which record. Topic is the subject of the observation (the term, the test code, the treatment). Timing is when. Qualifiers describe the topic — and there are several sub-types (grouping, result, variable, record, synonym, variable qualifiers) which we'll meet later. The '--' prefix (e.g., --SEQ) is a placeholder for the 2-letter domain code: AESEQ in AE, VSSEQ in VS. Point out most columns are qualifiers.");

// ============================================================
// SLIDE 14 — Core designations
// ============================================================
s = p.addSlide(); bg(s, WHITE);
header(s, "Which variables must you include?", "Core: Required / Expected / Permissible");
const core = [
  ["Required", "Req", "Must always be present, and must be populated — never left blank.", "STUDYID, DOMAIN, USUBJID, --SEQ, and the topic variable.", TEAL],
  ["Expected", "Exp", "Must be present, but a value may be missing if genuinely not collected.", "AETERM's timing (AESTDTC), VSORRES, etc.", SEA],
  ["Permissible", "Perm", "Include only if collected / relevant to the study. Optional.", "Extra qualifiers like AESER, VSPOS.", ACCENT],
];
let coy = 1.9;
core.forEach(c => {
  card(s, 0.7, coy, 12.0, 1.5, PAPER);
  circle(s, 1.0, coy + 0.35, 0.8, c[4], c[1], c[4] === ACCENT ? INK : WHITE, 15);
  s.addText(c[0], { x: 2.1, y: coy + 0.22, w: 3.0, h: 0.5, fontFace: HFONT, bold: true, fontSize: 22, color: c[4] === ACCENT ? "B5651A" : c[4], margin: 0 });
  s.addText(c[2], { x: 2.1, y: coy + 0.78, w: 6.5, h: 0.6, fontFace: BFONT, fontSize: 13, color: INK, margin: 0 });
  s.addShape(p.ShapeType.line, { x: 9.0, y: coy + 0.25, w: 0, h: 1.0, line: { color: LINE, width: 1 } });
  s.addText([{ text: "e.g.  ", options: { italic: true, color: MUTED } }, { text: c[3], options: { color: INK } }],
    { x: 9.25, y: coy + 0.3, w: 3.25, h: 0.9, fontFace: BFONT, fontSize: 12, valign: "middle", margin: 0 });
  coy += 1.6;
});
s.addText("The SDTMIG marks every variable Req / Exp / Perm. Start every domain by including all Required and Expected variables.",
  { x: 0.7, y: 6.75, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 13, color: TEAL, margin: 0 });
s.addNotes("Core designation tells you whether a variable is mandatory. Required = must exist AND be populated (a value on every row). Expected = the column must exist, but individual values can be null if not collected. Permissible = optional; include only when relevant. Common beginner mistake: dropping an Expected variable because some values are blank — the column must still be there. The SDTMIG domain tables have a 'Core' column with Req/Exp/Perm for each variable.");

// ============================================================
// SLIDE 15 — Key identifiers
// ============================================================
s = p.addSlide(); bg(s, WHITE);
header(s, "The four you'll use constantly", "Key identifier variables");
const ids = [
  ["STUDYID", "Study Identifier", "The unique id of the study. Same value on every row of every domain.", "ABC-01", TEAL],
  ["DOMAIN", "Domain Abbreviation", "The 2-letter domain code. Constant within a dataset.", "DM · AE · VS", SEA],
  ["USUBJID", "Unique Subject Identifier", "Unique per subject across the WHOLE study. Links a subject across all domains.", "ABC-01-01-001", ACCENT],
  ["--SEQ", "Sequence Number", "Numbers a subject's records within a domain so each row is uniquely identifiable.", "AESEQ = 1, 2, 3 …", INK],
];
ids.forEach((d, i) => {
  const x = 0.7 + (i % 2) * 6.1, y = 1.9 + Math.floor(i / 2) * 2.35;
  card(s, x, y, 5.9, 2.15, i % 2 ? WHITE : PAPER);
  s.addText(d[0], { x: x + 0.3, y: y + 0.25, w: 3.6, h: 0.55, fontFace: "Courier New", bold: true, fontSize: 22, color: d[4] === INK ? INK : d[4], margin: 0 });
  s.addText(d[1], { x: x + 0.3, y: y + 0.85, w: 5.3, h: 0.35, fontFace: BFONT, bold: true, italic: true, fontSize: 13, color: MUTED, margin: 0 });
  s.addText(d[2], { x: x + 0.3, y: y + 1.22, w: 5.3, h: 0.7, fontFace: BFONT, fontSize: 12.5, color: INK, margin: 0 });
  s.addShape(p.ShapeType.roundRect, { x: x + 4.1, y: y + 0.25, w: 1.5, h: 0.5, rectRadius: 0.06, fill: { color: d[4] === INK ? INK : d[4] }, line: { type: "none" } });
  s.addText(d[3].split(" · ")[0], { x: x + 4.1, y: y + 0.25, w: 1.5, h: 0.5, align: "center", valign: "middle", fontFace: "Courier New", bold: true, fontSize: 11, color: d[4] === ACCENT ? INK : WHITE, margin: 0 });
});
s.addText("USUBJID is the thread that stitches a subject's data together across DM, AE, VS, LB and every other domain.",
  { x: 0.7, y: 6.7, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 13.5, color: TEAL, align: "center", margin: 0 });
s.addNotes("These four appear in essentially every domain. STUDYID and DOMAIN are constants within a dataset. USUBJID is the critical join key — it must be globally unique in the study and identical for the same person in every domain; that's how you assemble a subject's full record. --SEQ (AESEQ, VSSEQ…) uniquely numbers records within subject+domain, since a subject has many AEs or vital signs. Together USUBJID + --SEQ uniquely identify any observation row.");

// ============================================================
// SLIDE 16 — Findings vertical structure (VS example)
// ============================================================
s = p.addSlide(); bg(s, WHITE);
header(s, "The Findings shape", "--TESTCD / --TEST: the vertical structure");
s.addText("Findings domains are tall & narrow: one row per test result. The test is named in --TESTCD/--TEST; the result goes in --ORRES.",
  { x: 0.6, y: 1.5, w: 12.2, h: 0.55, fontFace: BFONT, fontSize: 14, color: MUTED, margin: 0 });
const vsHdr = ["USUBJID", "VSSEQ", "VSTESTCD", "VSTEST", "VSORRES", "VSORRESU", "VSSTRESN", "VISIT"];
const vsRows = [
  ["ABC-01-01-001", "1", "SYSBP", "Systolic Blood Pressure", "120", "mmHg", "120", "BASELINE"],
  ["ABC-01-01-001", "2", "DIABP", "Diastolic Blood Pressure", "78", "mmHg", "78", "BASELINE"],
  ["ABC-01-01-001", "3", "PULSE", "Pulse Rate", "66", "beats/min", "66", "BASELINE"],
  ["ABC-01-01-001", "4", "TEMP", "Temperature", "36.8", "C", "36.8", "BASELINE"],
  ["ABC-01-01-001", "5", "SYSBP", "Systolic Blood Pressure", "118", "mmHg", "118", "WEEK 2"],
];
const vsTbl = [vsHdr.map(h => ({ text: h, options: { bold: true, color: WHITE, fill: { color: TEAL }, align: "center", fontFace: "Courier New", fontSize: 10 } }))];
vsRows.forEach((r, i) => {
  vsTbl.push(r.map((c, ci) => ({ text: c, options: {
    color: ci === 2 || ci === 3 ? INK : (ci === 4 ? "B5651A" : MUTED),
    bold: ci === 2 || ci === 4,
    fill: { color: i % 2 ? PAPER : WHITE }, align: ci <= 1 ? "center" : "left", fontFace: "Courier New", fontSize: 9.5 } })));
});
s.addTable(vsTbl, { x: 0.55, y: 2.2, w: 12.25, colW: [1.9, 0.8, 1.3, 2.75, 1.1, 1.2, 1.3, 1.7], rowH: 0.5,
  border: { type: "solid", color: LINE, pt: 1 }, valign: "middle", margin: [2, 4, 2, 4] });
card(s, 0.7, 5.55, 5.85, 1.35, PAPER);
s.addText([{ text: "Why “tall”? ", options: { bold: true, color: TEAL } },
  { text: "Adding a new test (e.g., HEIGHT) means adding rows, not new columns. The structure never changes.", options: { color: INK } }],
  { x: 0.95, y: 5.7, w: 5.4, h: 1.05, fontFace: BFONT, fontSize: 13, valign: "middle", margin: 0 });
card(s, 6.8, 5.55, 5.9, 1.35, INK);
s.addText([{ text: "ORRES vs STRESN.  ", options: { bold: true, color: MINT } },
  { text: "VSORRES is the original result as collected; VSSTRESN is the standardized numeric result for analysis.", options: { color: "E7F0F1" } }],
  { x: 7.05, y: 5.7, w: 5.4, h: 1.05, fontFace: BFONT, fontSize: 13, valign: "middle", margin: 0 });
s.addNotes("The Findings 'vertical' or 'normalized' structure is the hardest shape for beginners. Instead of a column per measurement, each measurement is its own ROW, identified by VSTESTCD (short code, e.g. SYSBP) and VSTEST (label). The result is in VSORRES. Note the same subject has 5 rows here — 4 tests at baseline plus a repeat SYSBP at Week 2. Key qualifier pairs: --ORRES/--ORRESU (original result + unit) vs --STRESC/--STRESN/--STRESU (standardized). LB and EG follow the identical pattern. This normalized shape is why Findings domains scale to any number of tests.");

// ============================================================
// SLIDE 17 — Controlled Terminology
// ============================================================
s = p.addSlide(); bg(s, WHITE);
header(s, "Speaking one language", "Controlled Terminology (CT)");
card(s, 0.7, 1.85, 5.9, 4.7, PAPER);
s.addText("The allowed-values dictionary", { x: 1.0, y: 2.1, w: 5.3, h: 0.45, fontFace: HFONT, bold: true, fontSize: 19, color: TEAL, margin: 0 });
s.addText([
  { text: "CT is the set of standardized codelists that define the permitted values for coded SDTM variables.", options: { color: INK, bold: true } },
  { text: "\n\nMaintained by CDISC with NCI-EVS and updated quarterly. It removes ambiguity: one concept, one value, everywhere.", options: { color: MUTED } },
], { x: 1.0, y: 2.65, w: 5.35, h: 2.2, fontFace: BFONT, fontSize: 14, valign: "top", lineSpacing: 21, margin: 0 });
s.addText("Examples of coded variables: SEX, RACE, AESEV, AESER, VSTESTCD, units.",
  { x: 1.0, y: 5.6, w: 5.35, h: 0.8, fontFace: BFONT, italic: true, fontSize: 13, color: INK, margin: 0 });
// right: before/after mapping
s.addText("Free text  →  Controlled value", { x: 7.0, y: 1.9, w: 5.7, h: 0.4, fontFace: BFONT, bold: true, fontSize: 15, color: INK, margin: 0 });
const ctmap = [
  ["“Female”, “F”, “2”", "F", "SEX"],
  ["“severe”, “Sev”, “3”", "SEVERE", "AESEV"],
  ["“mild”, “Mild”, “1”", "MILD", "AESEV"],
  ["“bpm”, “beats per min”", "beats/min", "VSORRESU"],
];
let cty = 2.45;
ctmap.forEach(m => {
  card(s, 7.0, cty, 5.7, 0.92, WHITE);
  s.addText(m[0], { x: 7.2, y: cty + 0.12, w: 2.5, h: 0.68, fontFace: BFONT, italic: true, fontSize: 12.5, color: MUTED, valign: "middle", margin: 0 });
  s.addText("→", { x: 9.65, y: cty + 0.12, w: 0.5, h: 0.68, align: "center", fontSize: 18, bold: true, color: ACCENT, valign: "middle", margin: 0 });
  s.addText([{ text: m[1], options: { bold: true, color: TEAL, fontFace: "Courier New", fontSize: 14 } },
             { text: "\n" + m[2], options: { color: MUTED, fontSize: 10, fontFace: "Courier New" } }],
    { x: 10.2, y: cty + 0.1, w: 2.35, h: 0.72, valign: "middle", margin: 0 });
  cty += 1.02;
});
s.addNotes("Controlled Terminology is what makes coded values consistent. It's maintained jointly by CDISC and NCI-EVS (National Cancer Institute — Enterprise Vocabulary Services) and published quarterly, so always work from a specific CT version. Coded variables must draw from their assigned codelist. The right panel shows the core job of a mapping programmer: collapse messy source values into the one approved term. Note some codelists are 'extensible' (you may add terms) and some are not — we'll cover that in the CT module.");

// ============================================================
// SLIDE 18 — Define-XML & submission package
// ============================================================
s = p.addSlide(); bg(s, INK);
s.addText("THE SUBMISSION PACKAGE", { x: 0.7, y: 0.55, w: 10, h: 0.3, fontFace: BFONT, bold: true, fontSize: 12, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Define-XML: the map that ships with the data", { x: 0.66, y: 0.9, w: 12, h: 0.7, fontFace: HFONT, bold: true, fontSize: 28, color: WHITE, margin: 0 });
card(s, 0.7, 2.05, 5.85, 4.4, "16404F");
s.addText("What Define-XML is", { x: 1.0, y: 2.3, w: 5.2, h: 0.4, fontFace: BFONT, bold: true, fontSize: 16, color: MINT, margin: 0 });
s.addText([
  { text: "A machine-readable metadata file (the “data definition”) that describes every dataset, variable, codelist, and derivation in the submission.\n\n", options: { color: "E7F0F1" } },
  { text: "It is the reviewer's map to your data", options: { color: WHITE, bold: true } },
  { text: " — arguably as important as the datasets themselves.", options: { color: "E7F0F1" } },
], { x: 1.0, y: 2.8, w: 5.25, h: 3.4, fontFace: BFONT, fontSize: 14, valign: "top", lineSpacing: 21, margin: 0 });
// right: package contents
s.addText("A typical SDTM submission package", { x: 7.0, y: 2.2, w: 5.7, h: 0.4, fontFace: BFONT, bold: true, fontSize: 15, color: WHITE, margin: 0 });
const pkg = [
  ["SDTM datasets", "The domains themselves (SAS XPORT .xpt files)"],
  ["Define-XML", "Metadata describing all datasets & variables"],
  ["cSDRG", "Study Data Reviewer's Guide — narrative context"],
  ["annotated CRF", "Blank CRF marked with the SDTM variable names"],
];
let py = 2.7;
pkg.forEach((pk, i) => {
  card(s, 7.0, py, 5.7, 0.9, "16404F");
  circle(s, 7.2, py + 0.2, 0.5, [TEAL, ACCENT, SEA, MINT][i], String(i + 1), i === 3 ? INK : WHITE, 14);
  s.addText([{ text: pk[0] + "\n", options: { bold: true, color: WHITE, fontSize: 13.5 } },
             { text: pk[1], options: { color: "9FC0C6", fontSize: 11.5 } }],
    { x: 7.85, y: py + 0.1, w: 4.7, h: 0.7, fontFace: BFONT, valign: "middle", margin: 0 });
  py += 0.98;
});
s.addNotes("The data doesn't travel alone. Define-XML (currently v2.x) is a standardized XML metadata document — it tells the reviewer what every dataset and variable means, which codelists apply, and how derived values were computed. Without it, standardized data is far less useful. The package also includes the datasets as SAS Transport (.xpt) files, the cSDRG (clinical Study Data Reviewer's Guide, a human-readable narrative), and the annotated CRF (aCRF) that shows where each SDTM variable came from on the form. Pinnacle 21 and similar tools validate this whole package.");

// ============================================================
// SLIDE 19 — Worked example: raw AE
// ============================================================
s = p.addSlide(); bg(s, WHITE);
header(s, "Worked mini example  ·  1 of 2", "Raw adverse-event data (as collected)");
s.addText("This is how an adverse event might look in the raw EDC extract — human-friendly, but not standardized.",
  { x: 0.6, y: 1.5, w: 12, h: 0.4, fontFace: BFONT, fontSize: 14, color: MUTED, margin: 0 });
const rawHdr = ["Subject", "AE Term", "Start Date", "End Date", "Severity", "Serious?", "Outcome (code)"];
const rawRows = [
  ["001", "bad headache", "15/03/2024", "16/03/2024", "moderate", "No", "1"],
  ["002", "mild dizziness", "10-Mar-2024", "12-Mar-2024", "Mild", "N", "1"],
];
const rawTbl = [rawHdr.map(h => ({ text: h, options: { bold: true, color: WHITE, fill: { color: MUTED }, align: "center", fontFace: BFONT, fontSize: 12 } }))];
rawRows.forEach((r, i) => {
  rawTbl.push(r.map(c => ({ text: c, options: { color: INK, fill: { color: i % 2 ? PAPER : WHITE }, align: "center", fontFace: BFONT, fontSize: 12 } })));
});
s.addTable(rawTbl, { x: 0.7, y: 2.15, w: 12.0, colW: [1.3, 2.5, 1.9, 1.9, 1.6, 1.4, 1.4], rowH: 0.6,
  border: { type: "solid", color: LINE, pt: 1 }, valign: "middle", margin: [2, 5, 2, 5] });
s.addText("What's “wrong” for SDTM?", { x: 0.7, y: 4.05, w: 8, h: 0.4, fontFace: BFONT, bold: true, fontSize: 16, color: ACCENT, margin: 0 });
const issues = [
  "Inconsistent dates: DD/MM/YYYY vs DD-Mon-YYYY — SDTM needs ISO 8601 (YYYY-MM-DD).",
  "Free-text terms: “bad headache” must be coded (e.g., via MedDRA) and split into reported vs. dictionary terms.",
  "Severity as free text: must map to Controlled Terminology (MILD / MODERATE / SEVERE).",
  "Serious as No / N: must become standard N / Y in AESER.",
  "Outcome is a CODE (1-5): must be decoded to its CT term, e.g. 1 → RECOVERED/RESOLVED.",
  "Subject “001” isn't unique study-wide — subject 001 exists at BOTH sites. Needs a full USUBJID.",
];
// 6 bullets at 0.50 spacing from 4.40 put the last at 6.90-7.38, inside the 7.5in
// slide. The previous 4.55/0.55 spacing ran bullet 6 to 7.76 — clipped off the
// bottom edge, so the USUBJID point (the punchline of the slide) was invisible.
let iy = 4.40;
issues.forEach((t, i) => {
  circle(s, 0.75, iy, 0.4, i % 2 ? SEA : TEAL, "!", WHITE, 13);
  s.addText(t, { x: 1.3, y: iy - 0.04, w: 11.3, h: 0.48, fontFace: BFONT, fontSize: 13, color: INK, valign: "middle", margin: 0 });
  iy += 0.50;
});
s.addNotes("The setup for the mapping. Show that raw data is readable but non-standard. Walk through each problem: date formats vary and SDTM requires ISO 8601 character dates; AE terms are free text and must be coded with MedDRA (Medical Dictionary for Regulatory Activities) yielding a reported term (AETERM) and a dictionary-derived preferred term (AEDECOD); severity and seriousness need CT; and the local subject number must be expanded to a study-unique USUBJID. Next slide shows the mapped result.");

// ============================================================
// SLIDE 20 — Worked example: mapped AE
// ============================================================
s = p.addSlide(); bg(s, WHITE);
header(s, "Worked mini example  ·  2 of 2", "The same data, mapped to SDTM AE");
const aeHdr = ["STUDYID", "DOMAIN", "USUBJID", "AESEQ", "AETERM", "AEDECOD", "AESTDTC", "AEENDTC", "AESEV", "AESER"];
const aeRows = [
  ["ABC-01", "AE", "ABC-01-01-001", "1", "bad headache", "Headache", "2024-03-15", "2024-03-16", "MODERATE", "N"],
  ["ABC-01", "AE", "ABC-01-01-002", "1", "mild dizziness", "Dizziness", "2024-03-10", "2024-03-12", "MILD", "N"],
];
const aeTbl = [aeHdr.map(h => ({ text: h, options: { bold: true, color: WHITE, fill: { color: INK }, align: "center", fontFace: "Courier New", fontSize: 9.5 } }))];
aeRows.forEach((r, i) => {
  aeTbl.push(r.map((c, ci) => ({ text: c, options: {
    color: ci === 5 || ci === 8 || ci === 6 ? "0E7C86" : INK, bold: ci === 5 || ci === 8,
    fill: { color: i % 2 ? PAPER : WHITE }, align: "center", fontFace: "Courier New", fontSize: 9 } })));
});
s.addTable(aeTbl, { x: 0.5, y: 1.8, w: 12.35, colW: [1.15, 0.9, 1.55, 0.8, 1.5, 1.35, 1.25, 1.25, 1.25, 0.85], rowH: 0.56,
  border: { type: "solid", color: LINE, pt: 1 }, valign: "middle", margin: [2, 3, 2, 3] });
// mapping arrows summary
const maps = [
  ["Dates → ISO 8601", "15/03/2024 → 2024-03-15", TEAL],
  ["Term coded (MedDRA)", "bad headache → AEDECOD Headache", SEA],
  ["Severity → CT", "moderate → MODERATE", ACCENT],
  ["Outcome code → CT", "1 → RECOVERED/RESOLVED", ACCENT],
  ["Serious → CT", "No / N → N", INK],
  ["Subject → USUBJID", "site 01 + 001 → ABC-01-01-001", TEAL],
  ["Record numbered", "AESEQ assigned per subject", SEA],
];
maps.forEach((m, i) => {
  const x = 0.7 + (i % 3) * 4.1, y = 3.7 + Math.floor(i / 3) * 1.32;
  card(s, x, y, 3.9, 1.15, PAPER);
  s.addText(m[0], { x: x + 0.25, y: y + 0.15, w: 3.4, h: 0.4, fontFace: BFONT, bold: true, fontSize: 13.5, color: m[2] === INK ? INK : m[2], margin: 0 });
  s.addText(m[1], { x: x + 0.25, y: y + 0.58, w: 3.45, h: 0.55, fontFace: "Courier New", fontSize: 10.5, color: MUTED, margin: 0 });
});
s.addText("AETERM keeps the verbatim term; AEDECOD holds the coded term. Both matter — SDTM preserves what was collected and adds standardization.",
  { x: 0.7, y: 6.65, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 12.5, color: TEAL, margin: 0 });
s.addNotes("The payoff slide. Same two events, now standardized: STUDYID/DOMAIN/USUBJID/AESEQ identifiers added; AETERM keeps the verbatim ('bad headache') while AEDECOD carries the MedDRA-coded term ('Headache'); dates are ISO 8601; AESEV and AESER use CT. Emphasize SDTM preserves the original AND adds the standardized version — nothing collected is thrown away. This raw-to-SDTM mapping is exactly what students will do by hand for DM, AE, VS, and LB in later modules.");

// ============================================================
// SLIDE 21 — Common beginner pitfalls
// ============================================================
s = p.addSlide(); bg(s, WHITE);
header(s, "Learn from these early", "Common beginner pitfalls");
const pit = [
  ["Inventing variable names", "Use the SDTMIG's exact names. No custom columns in standard domains — use SUPPQUAL for extras."],
  ["Wrong date format", "All SDTM dates are ISO 8601 character (YYYY-MM-DD). Never store dates as free text or numbers."],
  ["Dropping Expected variables", "Expected columns stay in the dataset even if some values are blank."],
  ["Ignoring Controlled Terminology", "Coded values must match the CT codelist exactly, including spelling and case."],
  ["Non-unique USUBJID", "USUBJID must be unique study-wide and identical across all domains for one subject."],
  ["Confusing ORRES and STRESN", "ORRES = original as collected; STRESN/STRESC = standardized for analysis."],
];
pit.forEach((pt, i) => {
  const x = 0.7 + (i % 2) * 6.1, y = 1.85 + Math.floor(i / 2) * 1.6;
  card(s, x, y, 5.9, 1.45, i % 2 ? WHITE : PAPER);
  circle(s, x + 0.25, y + 0.42, 0.6, ACCENT, "✕", INK, 16);
  s.addText([{ text: pt[0] + "\n", options: { bold: true, fontSize: 14, color: INK } },
             { text: pt[1], options: { fontSize: 11.8, color: MUTED } }],
    { x: x + 1.05, y: y + 0.18, w: 4.7, h: 1.1, fontFace: BFONT, valign: "middle", margin: 0 });
});
s.addNotes("Pre-empt the mistakes graders see most. (1) Don't invent names — the IG is prescriptive; non-standard variables go to SUPPQUAL (Supplemental Qualifiers). (2) ISO 8601 character dates always. (3) Keep Expected variables even when partly blank. (4) CT values must match exactly. (5) USUBJID uniqueness and consistency. (6) ORRES vs STRESN. We'll reinforce each of these in the hands-on notebooks.");

// ============================================================
// SLIDE 22 — Glossary
// ============================================================
s = p.addSlide(); bg(s, INK);
s.addText("QUICK REFERENCE", { x: 0.7, y: 0.5, w: 10, h: 0.3, fontFace: BFONT, bold: true, fontSize: 12, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Glossary of acronyms", { x: 0.66, y: 0.85, w: 12, h: 0.7, fontFace: HFONT, bold: true, fontSize: 30, color: WHITE, margin: 0 });
const gloss = [
  ["CDISC", "Clinical Data Interchange Standards Consortium"],
  ["CDASH", "Clinical Data Acquisition Standards Harmonization"],
  ["SDTM", "Study Data Tabulation Model"],
  ["SDTMIG", "SDTM Implementation Guide"],
  ["ADaM", "Analysis Data Model"],
  ["CT", "Controlled Terminology"],
  ["CRF / eCRF", "Case Report Form (electronic)"],
  ["EDC", "Electronic Data Capture"],
  ["MedDRA", "Medical Dictionary for Regulatory Activities"],
  ["USUBJID", "Unique Subject Identifier"],
  ["FDA / PMDA", "US / Japan regulatory agencies"],
  ["cSDRG", "clinical Study Data Reviewer's Guide"],
];
gloss.forEach((g, i) => {
  const x = 0.7 + (i % 2) * 6.1, y = 1.75 + Math.floor(i / 2) * 0.87;
  card(s, x, y, 5.9, 0.76, "16404F");
  s.addText(g[0], { x: x + 0.2, y: y + 0.06, w: 1.85, h: 0.64, fontFace: "Courier New", bold: true, fontSize: 13, color: MINT, valign: "middle", margin: 0 });
  s.addShape(p.ShapeType.line, { x: x + 2.05, y: y + 0.14, w: 0, h: 0.48, line: { color: "2A5566", width: 1 } });
  s.addText(g[1], { x: x + 2.2, y: y + 0.06, w: 3.6, h: 0.64, fontFace: BFONT, fontSize: 11.8, color: "E7F0F1", valign: "middle", margin: 0 });
});
s.addNotes("Leave this up as a reference during Q&A. These are the acronyms students will hear constantly. Encourage them to screenshot it. Every term here was defined in context on an earlier slide.");

// ============================================================
// SLIDE 23 — What's next (closing)
// ============================================================
s = p.addSlide(); bg(s, INK);
s.addShape(p.ShapeType.ellipse, { x: 10.2, y: 4.6, w: 5.0, h: 5.0, fill: { color: "133B4C" }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.2, y: 5.6, w: 3.0, h: 3.0, fill: { color: TEAL }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: -1.2, y: -1.4, w: 3.4, h: 3.4, fill: { color: "133B4C" }, line: { type: "none" } });
s.addText("WHAT'S NEXT IN THE BOOTCAMP", { x: 0.7, y: 0.9, w: 11, h: 0.35, fontFace: BFONT, bold: true, fontSize: 13, color: MINT, charSpacing: 2, margin: 0 });
s.addText("From concepts to building domains", { x: 0.66, y: 1.3, w: 11.5, h: 0.7, fontFace: HFONT, bold: true, fontSize: 32, color: WHITE, margin: 0 });
const next = [
  ["Tooling", "SAS and R environments & language basics — set up to code in both."],
  ["Importing data", "Reading raw EDC/CRF CSV files into SAS and R."],
  ["Building domains", "Map raw data into DM, AE, CM, EX, VS & LB — step by step, in both languages."],
  ["Deriving & checking", "Study day (--DY), --SEQ, Controlled Terminology, and Pinnacle 21-style validation."],
  ["Capstone", "Map a small mock study to several SDTM domains, end to end."],
];
let ny = 2.5;
next.forEach((n, i) => {
  circle(s, 0.7, ny, 0.62, [TEAL, SEA, MINT, ACCENT, WHITE][i], String(i + 1), i >= 2 ? INK : WHITE, 17);
  s.addText([{ text: n[0] + "   ", options: { bold: true, fontSize: 16, color: WHITE } },
             { text: n[1], options: { fontSize: 13.5, color: "C7DCE0" } }],
    { x: 1.55, y: ny - 0.02, w: 10.8, h: 0.66, fontFace: BFONT, valign: "middle", margin: 0 });
  ny += 0.82;
});
s.addText("Every hands-on exercise is provided in both SAS and R — you'll build the same domain twice and see how each language does it.",
  { x: 0.7, y: 6.75, w: 11.5, h: 0.5, fontFace: BFONT, italic: true, fontSize: 13.5, color: MINT, margin: 0 });
s.addNotes("Close by mapping the road ahead so students see how today's concepts become skills. Reiterate the dual-language promise: SAS and R are equal-weight; every domain is built in both. Then open the floor for questions using the glossary slide. End of Module 01.");

p.writeFile({ fileName: "/Volumes/D Drive/SDTM Training/Bootcamp/presentations/01_intro_sdtm.pptx" })
  .then(f => console.log("WROTE", f))
  .catch(e => { console.error(e); process.exit(1); });
