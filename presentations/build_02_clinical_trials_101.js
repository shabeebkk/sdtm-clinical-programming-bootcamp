// Build: 02_clinical_trials_101.pptx — "Clinical Trials 101: How a Trial Produces Data"
// Bootcamp Module 02. Context deck for trainees with no clinical background.
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
p.author = "Clinical Programming Bootcamp";
p.title = "Clinical Trials 101: How a Trial Produces Data";

// ---- Palette (shared with Deck 01) ----
const INK = "0F2E3D", TEAL = "0E7C86", SEA = "1FA8A0", MINT = "6FC8B4",
      ACCENT = "E8833A", WHITE = "FFFFFF", PAPER = "F3F7F8",
      MUTED = "5A7682", MUTEDDK = "8FAEB8", LINE = "CFDEE1";
const HFONT = "Cambria", BFONT = "Calibri";

function shadow() { return { type: "outer", color: "8AA0A8", blur: 8, offset: 3, angle: 90, opacity: 0.35 }; }
function bg(s, c) { s.background = { color: c }; }
function circle(s, x, y, d, fill, txt, txtColor, size) {
  s.addShape(p.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill }, line: { type: "none" } });
  s.addText(txt, { x, y, w: d, h: d, align: "center", valign: "middle",
    fontFace: BFONT, fontSize: size || 18, bold: true, color: txtColor || WHITE, margin: 0 });
}
function header(s, eyebrow, title, titleColor) {
  s.addText(eyebrow.toUpperCase(), { x: 0.6, y: 0.42, w: 12, h: 0.3,
    fontFace: BFONT, fontSize: 12, bold: true, color: TEAL, charSpacing: 2, margin: 0 });
  s.addText(title, { x: 0.6, y: 0.72, w: 12.1, h: 0.8,
    fontFace: HFONT, fontSize: 30, bold: true, color: titleColor || INK, margin: 0 });
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
let s;

// ============ 1. TITLE ============
s = p.addSlide(); bg(s, INK);
s.addShape(p.ShapeType.ellipse, { x: 9.7, y: -1.6, w: 5.2, h: 5.2, fill: { color: "133B4C" }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 10.7, y: -0.6, w: 3.2, h: 3.2, fill: { color: TEAL }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.45, y: 0.15, w: 1.7, h: 1.7, fill: { color: ACCENT }, line: { type: "none" } });
s.addText("CLINICAL PROGRAMMING BOOTCAMP  ·  MODULE 02", { x: 0.7, y: 2.0, w: 9, h: 0.4,
  fontFace: BFONT, fontSize: 14, bold: true, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Clinical Trials 101", { x: 0.66, y: 2.5, w: 9.6, h: 1.1,
  fontFace: HFONT, fontSize: 46, bold: true, color: WHITE, margin: 0 });
s.addText("How a trial produces data", { x: 0.7, y: 3.6, w: 9.6, h: 0.7,
  fontFace: HFONT, fontSize: 30, color: MINT, margin: 0 });
s.addText("Before you can map clinical data, you need to know where it comes from — who runs a trial, what happens to a patient, and how every measurement gets recorded.",
  { x: 0.7, y: 4.6, w: 9.2, h: 1.0, fontFace: BFONT, fontSize: 16, color: "C7DCE0", margin: 0 });
s.addText("No clinical background assumed. Every term defined on first use.",
  { x: 0.7, y: 6.5, w: 12, h: 0.4, fontFace: BFONT, fontSize: 12, italic: true, color: MUTEDDK, margin: 0 });
s.addNotes("Module 02. This deck is the clinical context for people who can code but have never seen a trial — and a refresher for those from a life-sciences background. Goal: by the end, everyone shares the same vocabulary (protocol, site, subject, visit, arm, CRF) so the SDTM mapping modules make sense. Emphasize: you do not need to become a clinician, but you must understand what the data represents.");

// ============ 2. WHAT YOU'LL BE ABLE TO DO ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Module goals", "By the end of this module you can…");
const goals = [
  ["Explain what a clinical trial is", "and why medicines must be tested in people before approval."],
  ["Name the phases", "and say what each phase is trying to find out."],
  ["Identify who does what", "sponsor, CRO, investigator, site staff, ethics committee, regulator."],
  ["Follow a subject's journey", "from screening and consent through treatment to end of study."],
  ["Point to where data is born", "the visit, the CRF, and the EDC system."],
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
s.addNotes("Set expectations. This is a context module — no programming yet. Tell trainees they will be quizzed informally on the vocabulary because every later module assumes it. The five goals map to the next sections of the deck.");

// ============ 3. WHAT IS A CLINICAL TRIAL ============
s = p.addSlide(); bg(s, WHITE);
header(s, "The basics", "What is a clinical trial?");
card(s, 0.7, 1.8, 6.2, 4.7, PAPER);
s.addText("A research study in people", { x: 1.0, y: 2.1, w: 5.6, h: 0.5, fontFace: HFONT, bold: true, fontSize: 22, color: TEAL, margin: 0 });
s.addText([
  { text: "A clinical trial is a carefully controlled study that tests whether a medical treatment is safe and whether it works", options: { bold: true, color: INK } },
  { text: " — in human volunteers, following a written plan agreed in advance.", options: { color: MUTED } },
], { x: 1.0, y: 2.7, w: 5.6, h: 1.6, fontFace: BFONT, fontSize: 15, valign: "top", lineSpacing: 22, margin: 0 });
s.addText("Nothing is decided casually: who can join, what is measured, when it is measured, and how results are analyzed are all fixed before the first patient enrolls.",
  { x: 1.0, y: 4.5, w: 5.6, h: 1.8, fontFace: BFONT, fontSize: 14.5, italic: true, color: INK, lineSpacing: 21, margin: 0 });
const qs = [
  ["Is it safe?", "What side effects occur, how often, how serious?", TEAL],
  ["Does it work?", "Does it improve the outcome it is meant to improve?", SEA],
  ["At what dose?", "How much, how often, for how long?", ACCENT],
  ["For whom?", "Which patients benefit — and which should avoid it?", INK],
];
let qy = 1.9;
qs.forEach(q => {
  card(s, 7.15, qy, 5.55, 1.09, WHITE);
  s.addText(q[0], { x: 7.45, y: qy + 0.13, w: 4.9, h: 0.4, fontFace: HFONT, bold: true, fontSize: 17, color: q[2] === INK ? INK : q[2], margin: 0 });
  s.addText(q[1], { x: 7.45, y: qy + 0.55, w: 5.0, h: 0.45, fontFace: BFONT, fontSize: 12.5, color: MUTED, margin: 0 });
  qy += 1.2;
});
s.addNotes("Definition to anchor on: a controlled research study in humans, run to a pre-agreed written plan (the protocol). The four questions on the right are what every trial is ultimately trying to answer. Stress the 'decided in advance' point — it is the reason data standards and pre-specified analyses matter, and why we cannot simply change our minds about what to measure after seeing the data.");

// ============ 4. DRUG DEVELOPMENT TIMELINE ============
s = p.addSlide(); bg(s, INK);
headerDark(s, "The bigger picture", "A trial is one step in a long road");
const road = [
  ["Discovery", "Find a promising compound", "3–6 yrs", TEAL],
  ["Preclinical", "Lab and animal testing for safety", "1–2 yrs", SEA],
  ["Clinical trials", "Phases 1–3 in human volunteers", "6–7 yrs", MINT],
  ["Review", "Regulators assess the submission", "1–2 yrs", ACCENT],
];
let rx = 0.7;
road.forEach((r, i) => {
  card(s, rx, 2.15, 2.85, 3.5, "16404F");
  circle(s, rx + 1.02, 2.42, 0.8, r[3], String(i + 1), i === 2 ? INK : (r[3] === ACCENT ? INK : WHITE), 20);
  s.addText(r[0], { x: rx + 0.1, y: 3.35, w: 2.65, h: 0.4, align: "center", fontFace: HFONT, bold: true, fontSize: 19, color: r[3] === MINT ? MINT : r[3], margin: 0 });
  s.addText(r[1], { x: rx + 0.22, y: 3.82, w: 2.4, h: 1.0, align: "center", fontFace: BFONT, fontSize: 12, color: "C7DCE0", margin: 0 });
  s.addText(r[2], { x: rx + 0.1, y: 5.05, w: 2.65, h: 0.4, align: "center", fontFace: BFONT, bold: true, fontSize: 14, color: WHITE, margin: 0 });
  rx += 3.05;
});
[3.62, 6.67, 9.72].forEach(ax => s.addText("▶", { x: ax, y: 3.6, w: 0.35, h: 0.5, align: "center", fontSize: 18, color: MINT, margin: 0 }));
s.addText("Typically 10–15 years and a very high failure rate — most compounds never reach patients. Durations shown are typical, not rules.",
  { x: 0.7, y: 6.0, w: 12, h: 0.5, fontFace: BFONT, italic: true, fontSize: 13.5, color: "9FC0C6", margin: 0 });
s.addNotes("Context for why trial data is so valuable and so heavily regulated. Typical end-to-end development is 10–15 years; the large majority of candidate compounds fail somewhere along the way. Flag clearly that these durations are typical industry figures, not fixed rules — they vary hugely by therapeutic area (oncology and rare disease differ a lot). Our work as programmers sits in the 'Clinical trials' and 'Review' boxes.");

// ============ 5. THE PHASES ============
s = p.addSlide(); bg(s, WHITE);
header(s, "How trials are staged", "The four phases");
const ph = [
  ["PHASE 1", "Is it safe?", "20–100", "Usually healthy volunteers. First time in humans. Focus: safety, dose range, how the body handles the drug.", TEAL],
  ["PHASE 2", "Does it work?", "100–300", "Patients with the disease. Focus: early efficacy signal and the right dose.", SEA],
  ["PHASE 3", "Confirm it", "300–3,000+", "Large, often multi-country. Confirms efficacy and safety. This is the evidence base for approval.", ACCENT],
  ["PHASE 4", "After approval", "varies", "Post-marketing studies. Long-term safety and real-world use.", INK],
];
let px = 0.7;
ph.forEach(q => {
  card(s, px, 1.8, 2.98, 4.75, PAPER);
  s.addShape(p.ShapeType.roundRect, { x: px, y: 1.8, w: 2.98, h: 0.75, rectRadius: 0.09, fill: { color: q[4] }, line: { type: "none" } });
  s.addText(q[0], { x: px, y: 1.93, w: 2.98, h: 0.5, align: "center", fontFace: HFONT, bold: true, fontSize: 18, color: q[4] === ACCENT ? INK : WHITE, margin: 0 });
  s.addText(q[1], { x: px + 0.2, y: 2.7, w: 2.6, h: 0.4, align: "center", fontFace: BFONT, bold: true, fontSize: 15, color: INK, margin: 0 });
  s.addText(q[2], { x: px + 0.2, y: 3.15, w: 2.6, h: 0.55, align: "center", fontFace: HFONT, bold: true, fontSize: 24, color: q[4], margin: 0 });
  s.addText("participants", { x: px + 0.2, y: 3.68, w: 2.6, h: 0.3, align: "center", fontFace: BFONT, fontSize: 11, color: MUTED, margin: 0 });
  s.addText(q[3], { x: px + 0.22, y: 4.05, w: 2.55, h: 2.3, fontFace: BFONT, fontSize: 12, color: MUTED, margin: 0 });
  px += 3.1;
});
s.addText("Participant numbers are typical ranges and vary widely by therapeutic area.",
  { x: 0.7, y: 6.75, w: 12, h: 0.35, fontFace: BFONT, italic: true, fontSize: 12, color: TEAL, margin: 0 });
s.addNotes("Each phase answers a different question, with more people at each step. Phase 1 is usually healthy volunteers — a key exception is oncology, where Phase 1 enrolls patients because the drugs are too toxic for healthy people. Phase 3 is where most of the data we will work with comes from: large, multi-site, often multi-country. Phase 4 happens after approval. Be explicit that the participant counts are typical ranges, not regulatory requirements.");

// ============ 6. THE PROTOCOL ============
s = p.addSlide(); bg(s, WHITE);
header(s, "The rulebook", "The protocol: the study's single source of truth");
s.addText("Every trial is run according to a protocol — a formal written document approved before enrollment starts. If you ever wonder “why is the data like this?”, the answer is usually in the protocol.",
  { x: 0.6, y: 1.5, w: 12.2, h: 0.6, fontFace: BFONT, fontSize: 14.5, color: MUTED, margin: 0 });
const proto = [
  ["Objectives", "What the study is trying to find out"],
  ["Design", "Randomized? Blinded? How many arms? How long?"],
  ["Eligibility", "Inclusion / exclusion criteria — who may join"],
  ["Schedule of assessments", "Which measurements happen at which visit"],
  ["Endpoints", "The primary and secondary outcomes that decide success"],
  ["Statistical methods", "How the results will be analyzed — fixed in advance"],
];
proto.forEach((t, i) => {
  const x = 0.7 + (i % 2) * 6.1, y = 2.25 + Math.floor(i / 2) * 1.5;
  card(s, x, y, 5.9, 1.35, i % 2 ? WHITE : PAPER);
  circle(s, x + 0.25, y + 0.37, 0.6, [TEAL, SEA, ACCENT, INK, TEAL, SEA][i], String(i + 1), WHITE, 16);
  s.addText([{ text: t[0] + "\n", options: { bold: true, fontSize: 15.5, color: INK } },
             { text: t[1], options: { fontSize: 12.5, color: MUTED } }],
    { x: x + 1.05, y: y + 0.18, w: 4.6, h: 1.0, fontFace: BFONT, valign: "middle", margin: 0 });
});
s.addText("The Schedule of Assessments is a programmer's best friend — it tells you exactly what data to expect, and when.",
  { x: 0.7, y: 6.85, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 13, color: TEAL, margin: 0 });
s.addNotes("The protocol governs everything. Programmers read it constantly — especially the Schedule of Assessments (sometimes called the SoA or visit matrix), which is a grid of visits versus assessments. It tells you which domains you should expect data in and at which visits. Endpoints matter because they drive the analysis datasets later. Changes to the protocol are formal 'amendments' — they can explain odd patterns in the data (e.g. a test added halfway through).");

// ============ 7. WHO'S WHO ============
s = p.addSlide(); bg(s, INK);
headerDark(s, "The people", "Who's who in a clinical trial");
const who = [
  ["Sponsor", "Owns and funds the trial — usually a pharma or biotech company.", TEAL],
  ["CRO", "Contract Research Organization — hired by the sponsor to run parts of the trial.", SEA],
  ["Investigator (PI)", "The doctor responsible for the trial at a site. PI = Principal Investigator.", MINT],
  ["Site staff", "Study coordinators and nurses who see subjects and enter the data.", ACCENT],
  ["Ethics committee", "IRB / IEC — independent board that protects participants' rights and safety.", TEAL],
  ["Regulator", "FDA, EMA, PMDA — approves trials and reviews the final submission.", SEA],
];
who.forEach((w, i) => {
  const x = 0.7 + (i % 3) * 4.1, y = 2.1 + Math.floor(i / 3) * 2.3;
  card(s, x, y, 3.9, 2.05, "16404F");
  circle(s, x + 0.25, y + 0.25, 0.6, w[2], String(i + 1), w[2] === MINT ? INK : (w[2] === ACCENT ? INK : WHITE), 16);
  s.addText(w[0], { x: x + 1.0, y: y + 0.3, w: 2.8, h: 0.5, fontFace: HFONT, bold: true, fontSize: 17, color: WHITE, valign: "middle", margin: 0 });
  s.addText(w[1], { x: x + 0.28, y: y + 1.0, w: 3.4, h: 0.95, fontFace: BFONT, fontSize: 12.5, color: "C7DCE0", margin: 0 });
});
s.addText("Clinical programmers usually sit with the sponsor or the CRO — downstream of the site, upstream of the regulator.",
  { x: 0.7, y: 6.8, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 13, color: MINT, margin: 0 });
s.addNotes("Define each acronym aloud. CRO = Contract Research Organization; many trainees will be employed by one. PI = Principal Investigator, the responsible physician at a site. IRB = Institutional Review Board (US term); IEC = Independent Ethics Committee (EU term) — same protective function. EMA = European Medicines Agency. Point out where the trainees themselves will sit: sponsor or CRO, receiving data from sites and preparing it for regulators.");

// ============ 8. SITES & SUBJECTS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Where it happens", "Sites and subjects");
card(s, 0.7, 1.85, 5.9, 4.6, PAPER);
s.addText("Site", { x: 1.0, y: 2.1, w: 5.3, h: 0.5, fontFace: HFONT, bold: true, fontSize: 24, color: TEAL, margin: 0 });
s.addText([
  { text: "A hospital or clinic where the trial is actually carried out.\n\n", options: { color: INK, bold: true } },
  { text: "One trial usually runs at many sites, often in several countries. Each site has an ID (e.g. 01, 02) and its own staff.\n\nMore sites = faster enrollment, but more variation in how data gets recorded.", options: { color: MUTED } },
], { x: 1.0, y: 2.7, w: 5.3, h: 3.4, fontFace: BFONT, fontSize: 14, valign: "top", lineSpacing: 21, margin: 0 });
card(s, 6.9, 1.85, 5.8, 4.6, INK);
s.addText("Subject", { x: 7.2, y: 2.1, w: 5.2, h: 0.5, fontFace: HFONT, bold: true, fontSize: 24, color: MINT, margin: 0 });
s.addText([
  { text: "One participant in the trial. Also called a patient or participant.\n\n", options: { color: WHITE, bold: true } },
  { text: "Each subject gets a number that is unique within their site — which is exactly why SDTM needs USUBJID, an identifier unique across the whole study.", options: { color: "C7DCE0" } },
], { x: 7.2, y: 2.7, w: 5.2, h: 2.4, fontFace: BFONT, fontSize: 14, valign: "top", lineSpacing: 21, margin: 0 });
s.addText("Subject 001 at Site 01  ≠  Subject 001 at Site 02", { x: 7.2, y: 5.35, w: 5.2, h: 0.5,
  fontFace: "Courier New", bold: true, fontSize: 14, color: ACCENT, margin: 0 });
s.addText("Two different people. This is the #1 identifier trap.", { x: 7.2, y: 5.8, w: 5.2, h: 0.4,
  fontFace: BFONT, italic: true, fontSize: 12.5, color: "9FC0C6", margin: 0 });
s.addNotes("This slide plants the seed for USUBJID. Subject numbering is site-local: site 01 and site 02 can both have a subject 001, and they are different people. In our mock study ABC-01 this is exactly the case — trainees will build USUBJID to resolve it. Also mention subject vs. patient terminology: 'subject' is the regulatory term used in SDTM.");

// ============ 9. THE SUBJECT JOURNEY ============
s = p.addSlide(); bg(s, WHITE);
header(s, "The subject journey", "What actually happens to a participant");
const journey = [
  ["Screening", "Checked against eligibility criteria. Consent signed first.", TEAL],
  ["Baseline", "Measurements taken before treatment starts — the comparison point.", SEA],
  ["Randomization", "Assigned to a treatment arm, usually by chance.", ACCENT],
  ["Treatment", "Takes the study drug; returns for scheduled visits.", INK],
  ["Follow-up", "Monitored after treatment ends.", TEAL],
  ["End of study", "Completed — or discontinued early, with a reason recorded.", SEA],
];
let jx = 0.62;
journey.forEach((j, i) => {
  card(s, jx, 1.95, 1.98, 3.6, i % 2 ? PAPER : WHITE);
  circle(s, jx + 0.64, 2.2, 0.7, j[2], String(i + 1), j[2] === ACCENT ? INK : WHITE, 17);
  s.addText(j[0], { x: jx + 0.08, y: 3.05, w: 1.82, h: 0.55, align: "center", fontFace: HFONT, bold: true, fontSize: 15, color: INK, margin: 0 });
  s.addText(j[1], { x: jx + 0.14, y: 3.65, w: 1.7, h: 1.75, align: "center", fontFace: BFONT, fontSize: 11, color: MUTED, margin: 0 });
  jx += 2.06;
});
card(s, 0.7, 5.85, 12.0, 1.0, INK);
s.addText([
  { text: "Informed consent comes first.  ", options: { bold: true, color: MINT, fontSize: 15 } },
  { text: "Nothing may be done for research purposes until the subject has voluntarily agreed, in writing, after being told what the study involves.", options: { color: "C7DCE0", fontSize: 13 } },
], { x: 1.0, y: 6.0, w: 11.4, h: 0.75, fontFace: BFONT, valign: "middle", margin: 0 });
s.addNotes("Walk the journey left to right; this maps directly onto domains later: screening/eligibility, DM demographics, EX exposure during treatment, DS disposition at end of study. Baseline is critical — it is the 'before' value that analysis compares against, and ADaM's change-from-baseline depends on it. Informed consent is both an ethical cornerstone (ICH GCP — Good Clinical Practice) and a data point: the consent date appears in DM as RFICDTC. Discontinuations must always have a recorded reason.");

// ============ 10. RANDOMIZATION & BLINDING ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Removing bias", "Randomization, control, and blinding");
const rb = [
  ["Randomization", "Subjects are assigned to treatment groups by chance, not by choice.", "Stops conscious or unconscious selection from skewing the groups.", TEAL],
  ["Control arm", "A comparison group — placebo (an inactive look-alike) or an existing standard treatment.", "Without a comparison you cannot tell whether the drug caused the change.", SEA],
  ["Blinding", "Hiding who got what. Single-blind: subject doesn't know. Double-blind: subject and investigator don't know.", "Expectations change how people report and assess symptoms.", ACCENT],
];
let ry = 1.9;
rb.forEach(r => {
  card(s, 0.7, ry, 12.0, 1.5, PAPER);
  s.addText(r[0], { x: 1.0, y: ry + 0.2, w: 2.9, h: 0.5, fontFace: HFONT, bold: true, fontSize: 20, color: r[3] === ACCENT ? "B5651A" : r[3], margin: 0 });
  s.addText(r[1], { x: 1.0, y: ry + 0.72, w: 5.4, h: 0.65, fontFace: BFONT, fontSize: 12.5, color: INK, margin: 0 });
  s.addShape(p.ShapeType.line, { x: 6.7, y: ry + 0.25, w: 0, h: 1.0, line: { color: LINE, width: 1 } });
  s.addText([{ text: "Why it matters:  ", options: { italic: true, color: MUTED } }, { text: r[2], options: { color: INK } }],
    { x: 6.95, y: ry + 0.3, w: 5.5, h: 0.95, fontFace: BFONT, fontSize: 13, valign: "middle", margin: 0 });
  ry += 1.6;
});
s.addText("“Arm” = one treatment group. In our mock study ABC-01 there are two arms: Drug A and Placebo.",
  { x: 0.7, y: 6.75, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 13, color: TEAL, margin: 0 });
s.addNotes("These three ideas are why trial data can support a causal claim. Randomization balances known and unknown differences between groups. A control arm gives you the counterfactual. Blinding protects against expectation effects on both reporting and assessment. Introduce the word 'arm' explicitly — it appears in DM as ARM and ARMCD. Note open-label trials exist too (nobody is blinded), common in early phase.");

// ============ 11. WHAT GETS COLLECTED ============
s = p.addSlide(); bg(s, WHITE);
header(s, "The data", "What actually gets collected");
s.addText("At each visit, specific things are measured or asked. Each becomes a category of data — and later, an SDTM domain.",
  { x: 0.6, y: 1.5, w: 12.2, h: 0.4, fontFace: BFONT, fontSize: 14, color: MUTED, margin: 0 });
const collected = [
  ["Who the subject is", "Age, sex, race, country, treatment arm", "DM", TEAL],
  ["What happened to them", "Side effects and medical problems", "AE, MH", ACCENT],
  ["What they were given", "Study drug doses; other medications taken", "EX, CM", SEA],
  ["What was measured", "Blood pressure, labs, ECGs, physical exam", "VS, LB, EG, PE", INK],
  ["How the study ended", "Completed or withdrew, and why", "DS", TEAL],
];
let cy = 2.0;
collected.forEach((c, i) => {
  card(s, 0.7, cy, 12.0, 0.88, i % 2 ? PAPER : WHITE);
  s.addText(c[0], { x: 1.0, y: cy + 0.09, w: 3.9, h: 0.7, fontFace: BFONT, bold: true, fontSize: 15, color: INK, valign: "middle", margin: 0 });
  s.addText(c[1], { x: 5.0, y: cy + 0.09, w: 5.3, h: 0.7, fontFace: BFONT, fontSize: 13, color: MUTED, valign: "middle", margin: 0 });
  s.addShape(p.ShapeType.roundRect, { x: 10.5, y: cy + 0.17, w: 1.95, h: 0.54, rectRadius: 0.07, fill: { color: c[3] }, line: { type: "none" } });
  s.addText(c[2], { x: 10.5, y: cy + 0.17, w: 1.95, h: 0.54, align: "center", valign: "middle", fontFace: "Courier New", bold: true, fontSize: 12.5, color: c[3] === ACCENT ? INK : WHITE, margin: 0 });
  cy += 0.96;
});
s.addText("You already met these two-letter codes in Module 01 — this is where they come from.",
  { x: 0.7, y: 6.95, w: 12, h: 0.35, fontFace: BFONT, italic: true, fontSize: 12.5, color: TEAL, margin: 0 });
s.addNotes("This slide is the bridge from clinical reality to SDTM domains. Every category of collected data maps to one or more domains. Do not ask them to memorize the codes — just to see that domains are not arbitrary; they mirror what is actually collected at a visit. Reference Module 01's cheat sheet.");

// ============ 12. THE CRF ============
s = p.addSlide(); bg(s, WHITE);
header(s, "The instrument", "The CRF: how a measurement becomes data");
card(s, 0.7, 1.85, 6.0, 4.6, PAPER);
s.addText("Case Report Form (CRF)", { x: 1.0, y: 2.1, w: 5.4, h: 0.5, fontFace: HFONT, bold: true, fontSize: 21, color: TEAL, margin: 0 });
s.addText([
  { text: "The form used to record the information the protocol requires for each subject.\n\n", options: { color: INK, bold: true } },
  { text: "One form per topic — a demographics form, an adverse event form, a vital signs form. Historically paper; today almost always electronic (eCRF) inside an EDC system.", options: { color: MUTED } },
], { x: 1.0, y: 2.7, w: 5.4, h: 2.6, fontFace: BFONT, fontSize: 14, valign: "top", lineSpacing: 21, margin: 0 });
s.addText("One CRF form usually becomes one raw dataset — which you then map to a domain.",
  { x: 1.0, y: 5.5, w: 5.4, h: 0.8, fontFace: BFONT, fontSize: 13.5, italic: true, color: INK, margin: 0 });
// mock CRF
card(s, 7.0, 1.85, 5.7, 4.6, WHITE);
s.addText("VITAL SIGNS", { x: 7.3, y: 2.05, w: 5.1, h: 0.35, fontFace: BFONT, bold: true, fontSize: 13, color: TEAL, charSpacing: 1, margin: 0 });
s.addShape(p.ShapeType.line, { x: 7.3, y: 2.45, w: 5.1, h: 0, line: { color: LINE, width: 1 } });
const fields = [["Visit", "SCREENING"], ["Date", "20-FEB-2024"], ["Systolic BP", "122  mmHg"], ["Diastolic BP", "80  mmHg"], ["Pulse", "68  beats/min"], ["Temperature", "36.7  °C"], ["Weight", "70.5  kg"]];
let fy = 2.62;
fields.forEach(f => {
  s.addText(f[0], { x: 7.35, y: fy, w: 2.0, h: 0.35, fontFace: BFONT, fontSize: 12.5, color: MUTED, valign: "middle", margin: 0 });
  s.addShape(p.ShapeType.roundRect, { x: 9.4, y: fy, w: 2.9, h: 0.35, rectRadius: 0.04, fill: { color: PAPER }, line: { color: LINE, width: 1 } });
  s.addText(f[1], { x: 9.5, y: fy, w: 2.7, h: 0.35, fontFace: "Courier New", fontSize: 11.5, color: INK, valign: "middle", margin: 0 });
  fy += 0.52;
});
s.addNotes("The CRF is the instrument that turns a clinical observation into a data field. Show that the mock vital-signs form matches the columns of vs_raw.csv the trainees already have. Key idea: one CRF form → one raw dataset → (after mapping) one SDTM domain. Mention the annotated CRF (aCRF) from Module 01 — it is this same form marked up with the SDTM variable names, and it ships with the submission.");

// ============ 13. CRF -> EDC ============
s = p.addSlide(); bg(s, INK);
headerDark(s, "Capture", "From form to database: EDC");
card(s, 0.7, 2.1, 3.6, 3.4, "16404F");
s.addText("1", { x: 0.7, y: 2.3, w: 3.6, h: 0.6, align: "center", fontFace: HFONT, bold: true, fontSize: 34, color: TEAL, margin: 0 });
s.addText("Site enters data", { x: 0.9, y: 3.0, w: 3.2, h: 0.4, align: "center", fontFace: BFONT, bold: true, fontSize: 16, color: WHITE, margin: 0 });
s.addText("A coordinator types the visit results into the eCRF, often days after the visit.", { x: 0.95, y: 3.5, w: 3.1, h: 1.6, align: "center", fontFace: BFONT, fontSize: 12.5, color: "C7DCE0", margin: 0 });
card(s, 4.85, 2.1, 3.6, 3.4, "16404F");
s.addText("2", { x: 4.85, y: 2.3, w: 3.6, h: 0.6, align: "center", fontFace: HFONT, bold: true, fontSize: 34, color: SEA, margin: 0 });
s.addText("Checks run", { x: 5.05, y: 3.0, w: 3.2, h: 0.4, align: "center", fontFace: BFONT, bold: true, fontSize: 16, color: WHITE, margin: 0 });
s.addText("The EDC flags impossible or missing values. Queries go back to the site to fix.", { x: 5.1, y: 3.5, w: 3.1, h: 1.6, align: "center", fontFace: BFONT, fontSize: 12.5, color: "C7DCE0", margin: 0 });
card(s, 9.0, 2.1, 3.7, 3.4, "16404F");
s.addText("3", { x: 9.0, y: 2.3, w: 3.7, h: 0.6, align: "center", fontFace: HFONT, bold: true, fontSize: 34, color: ACCENT, margin: 0 });
s.addText("Data extracted", { x: 9.2, y: 3.0, w: 3.3, h: 0.4, align: "center", fontFace: BFONT, bold: true, fontSize: 16, color: WHITE, margin: 0 });
s.addText("Programmers pull the raw data out as CSV or SAS files — where your work begins.", { x: 9.25, y: 3.5, w: 3.2, h: 1.6, align: "center", fontFace: BFONT, fontSize: 12.5, color: "C7DCE0", margin: 0 });
[4.42, 8.57].forEach(ax => s.addText("▶", { x: ax, y: 3.55, w: 0.35, h: 0.5, align: "center", fontSize: 20, color: MINT, margin: 0 }));
s.addText("EDC = Electronic Data Capture. Data cleaning is continuous — the database is “locked” only when the study is complete.",
  { x: 0.7, y: 5.9, w: 12, h: 0.5, fontFace: BFONT, italic: true, fontSize: 13.5, color: "9FC0C6", margin: 0 });
s.addNotes("Explain the lifecycle. Data entry happens at the site, not by us. Automated edit checks raise 'queries' — questions back to the site, e.g. a systolic BP of 1200. Data management chases these until clean. 'Database lock' is the formal freeze after which no more changes are made; final analyses run on locked data. As programmers we often work with interim extracts long before lock, which is why our programs must be re-runnable.");

// ============ 14. VOCABULARY ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Speak the language", "Trial vocabulary you'll hear daily");
const vocab = [
  ["Protocol", "The study's written plan"],
  ["Site", "A hospital/clinic running the trial"],
  ["Subject", "One participant"],
  ["Arm", "A treatment group (e.g. Drug A)"],
  ["Visit", "A scheduled appointment"],
  ["Baseline", "The pre-treatment reference value"],
  ["Endpoint", "The outcome that decides success"],
  ["Adverse event", "Any untoward medical occurrence"],
  ["Eligibility", "Inclusion / exclusion criteria"],
  ["Query", "A question raised about a data value"],
  ["Database lock", "The final freeze of the data"],
  ["GCP", "Good Clinical Practice — the ethical standard"],
];
vocab.forEach((v, i) => {
  const x = 0.7 + (i % 3) * 4.1, y = 1.8 + Math.floor(i / 3) * 1.28;
  card(s, x, y, 3.9, 1.13, i % 2 ? PAPER : WHITE);
  s.addText(v[0], { x: x + 0.25, y: y + 0.13, w: 3.4, h: 0.35, fontFace: BFONT, bold: true, fontSize: 15, color: TEAL, margin: 0 });
  s.addText(v[1], { x: x + 0.25, y: y + 0.52, w: 3.45, h: 0.5, fontFace: BFONT, fontSize: 12.5, color: MUTED, margin: 0 });
});
s.addNotes("A quick-reference vocabulary slide. Read a few aloud and ask trainees to give examples from the mock study. GCP = Good Clinical Practice, defined in the ICH E6 guideline — the international ethical and scientific quality standard for running trials. Encourage them to keep this slide open during later modules.");

// ============ 15. WHERE DATA GOES (recap link to Deck 01) ============
s = p.addSlide(); bg(s, INK);
headerDark(s, "Joining the dots", "From the visit to the regulator");
const flow = [
  ["Visit", "A measurement is taken", TEAL],
  ["CRF / EDC", "It is recorded as raw data", SEA],
  ["SDTM", "It is standardized", MINT],
  ["ADaM", "It is made analysis-ready", ACCENT],
  ["TLFs", "It becomes a result", TEAL],
  ["Submission", "It is reviewed by regulators", SEA],
];
let fx = 0.7;
flow.forEach((f, i) => {
  card(s, fx, 2.3, 1.85, 2.9, "16404F");
  circle(s, fx + 0.6, 2.55, 0.65, f[2], String(i + 1), f[2] === MINT ? INK : WHITE, 16);
  s.addText(f[0], { x: fx + 0.05, y: 3.35, w: 1.75, h: 0.45, align: "center", fontFace: HFONT, bold: true, fontSize: 15, color: WHITE, margin: 0 });
  s.addText(f[1], { x: fx + 0.12, y: 3.85, w: 1.6, h: 1.2, align: "center", fontFace: BFONT, fontSize: 11, color: "C7DCE0", margin: 0 });
  fx += 2.03;
});
s.addText("Module 01 showed you the standards. Module 02 showed you where the data comes from. From Module 03 on, you build it yourself.",
  { x: 0.7, y: 5.7, w: 12, h: 0.5, fontFace: BFONT, italic: true, fontSize: 14, color: MINT, margin: 0 });
s.addNotes("Tie the two context modules together. This is the same journey as the Module 01 pipeline slide, but now every step has real-world meaning: they know what a visit is, who records it, and what a CRF looks like. From here the bootcamp becomes hands-on.");

// ============ 16. PITFALLS / MISCONCEPTIONS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Clear these up now", "Common misconceptions");
const mis = [
  ["“The data arrives clean.”", "It doesn't. Sites differ, formats differ, and queries are still open when you start."],
  ["“Subject numbers are unique.”", "Only within a site. Study-wide uniqueness is something you construct."],
  ["“Missing means zero.”", "Missing means not collected or not done. Never invent a value to fill a gap."],
  ["“We can change what we measure.”", "The protocol fixes it in advance. Deviations are documented, not silently fixed."],
  ["“Baseline is just the first record.”", "Baseline is defined by the protocol — usually the last value before first dose."],
  ["“Programmers don't need clinical knowledge.”", "You must know what a value means to judge whether your mapping is right."],
];
mis.forEach((m, i) => {
  const x = 0.7 + (i % 2) * 6.1, y = 1.85 + Math.floor(i / 2) * 1.6;
  card(s, x, y, 5.9, 1.45, i % 2 ? WHITE : PAPER);
  circle(s, x + 0.25, y + 0.42, 0.6, ACCENT, "✕", INK, 16);
  s.addText([{ text: m[0] + "\n", options: { bold: true, fontSize: 14, color: INK } },
             { text: m[1], options: { fontSize: 11.8, color: MUTED } }],
    { x: x + 1.05, y: y + 0.18, w: 4.7, h: 1.1, fontFace: BFONT, valign: "middle", margin: 0 });
});
s.addNotes("Pre-empt the assumptions that cause mapping errors. The baseline point is subtle and worth dwelling on — it is protocol-defined, commonly the last non-missing measurement before first dose, not simply the earliest row. The missing-data point is a compliance issue too: fabricating values is never acceptable.");

// ============ 17. GLOSSARY ============
s = p.addSlide(); bg(s, INK);
s.addText("QUICK REFERENCE", { x: 0.7, y: 0.5, w: 10, h: 0.3, fontFace: BFONT, bold: true, fontSize: 12, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Glossary of acronyms", { x: 0.66, y: 0.85, w: 12, h: 0.7, fontFace: HFONT, bold: true, fontSize: 30, color: WHITE, margin: 0 });
const gl = [
  ["CRO", "Contract Research Organization"],
  ["PI", "Principal Investigator"],
  ["IRB / IEC", "Institutional Review Board / Independent Ethics Committee"],
  ["GCP", "Good Clinical Practice (ICH E6)"],
  ["ICH", "International Council for Harmonisation"],
  ["CRF / eCRF", "Case Report Form (electronic)"],
  ["EDC", "Electronic Data Capture"],
  ["SoA", "Schedule of Assessments"],
  ["AE", "Adverse Event"],
  ["FDA / EMA / PMDA", "US / European / Japanese regulators"],
  ["TLF", "Tables, Listings and Figures"],
  ["Database lock", "Final freeze of the trial data"],
];
gl.forEach((g, i) => {
  const x = 0.7 + (i % 2) * 6.1, y = 1.75 + Math.floor(i / 2) * 0.87;
  card(s, x, y, 5.9, 0.76, "16404F");
  s.addText(g[0], { x: x + 0.2, y: y + 0.06, w: 2.05, h: 0.64, fontFace: "Courier New", bold: true, fontSize: 12, color: MINT, valign: "middle", margin: 0 });
  s.addShape(p.ShapeType.line, { x: x + 2.3, y: y + 0.14, w: 0, h: 0.48, line: { color: "2A5566", width: 1 } });
  s.addText(g[1], { x: x + 2.45, y: y + 0.06, w: 3.35, h: 0.64, fontFace: BFONT, fontSize: 11, color: "E7F0F1", valign: "middle", margin: 0 });
});
s.addNotes("Leave up during Q&A. ICH = International Council for Harmonisation, the body that publishes GCP (guideline E6) and other standards adopted by regulators worldwide.");

// ============ 18. WHAT'S NEXT ============
s = p.addSlide(); bg(s, INK);
s.addShape(p.ShapeType.ellipse, { x: 10.2, y: 4.6, w: 5.0, h: 5.0, fill: { color: "133B4C" }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.2, y: 5.6, w: 3.0, h: 3.0, fill: { color: TEAL }, line: { type: "none" } });
s.addText("WHAT'S NEXT", { x: 0.7, y: 1.4, w: 11, h: 0.35, fontFace: BFONT, bold: true, fontSize: 13, color: MINT, charSpacing: 2, margin: 0 });
s.addText("You know the story — now learn the tools", { x: 0.66, y: 1.8, w: 11.5, h: 0.8, fontFace: HFONT, bold: true, fontSize: 32, color: WHITE, margin: 0 });
const nx = [
  ["Module 03", "Your toolkit: SAS & R side by side"],
  ["Notebook 01", "SAS basics — DATA steps and PROCs"],
  ["Notebook 01 (R)", "R & tidyverse basics — the same skills"],
  ["Then", "Reading the raw ABC-01 data and building your first domain"],
];
let ny = 3.0;
nx.forEach((n, i) => {
  circle(s, 0.7, ny, 0.62, [TEAL, SEA, MINT, ACCENT][i], String(i + 1), i >= 2 ? INK : WHITE, 17);
  s.addText([{ text: n[0] + "   ", options: { bold: true, fontSize: 17, color: WHITE } },
             { text: n[1], options: { fontSize: 14, color: "C7DCE0" } }],
    { x: 1.55, y: ny - 0.02, w: 10.8, h: 0.66, fontFace: BFONT, valign: "middle", margin: 0 });
  ny += 0.95;
});
s.addText("Keep the mock study ABC-01 open — from here on, everything you build uses it.",
  { x: 0.7, y: 6.6, w: 11.5, h: 0.5, fontFace: BFONT, italic: true, fontSize: 14, color: MINT, margin: 0 });
s.addNotes("Close by pointing forward. The next module is tooling, then the hands-on notebooks. Remind trainees that the mock study ABC-01 they now understand clinically is the same data they will program against for the rest of the bootcamp. End of Module 02.");

p.writeFile({ fileName: "/Volumes/D Drive/SDTM Training/Bootcamp/presentations/02_clinical_trials_101.pptx" })
  .then(f => console.log("WROTE", f))
  .catch(e => { console.error(e); process.exit(1); });
