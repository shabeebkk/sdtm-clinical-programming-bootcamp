// Build: day1_a_day_in_the_life.pptx — "A Day in the Life of a Clinical Programmer"
//
// Day 1 opener. Deliberately a DIFFERENT template from modules 01-18:
//   - warm greige paper instead of the navy/teal house style
//   - Georgia + Trebuchet MS instead of Cambria + Calibri
//   - no cards; big time numerals, full-bleed images, generous whitespace
//   - the accent colour TRACKS THE TIME OF DAY, dawn blue -> dusk violet, so the
//     deck visibly warms and cools as the day passes. The structure is the day.
//
// Images come from build_day1_assets.py — run that first.
// Rebuild: NODE_PATH=$(npm root -g) node build_day1_a_day_in_the_life.js

const pptxgen = require("pptxgenjs");
const path = require("path");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "Clinical Programming Bootcamp";
p.title = "A Day in the Life of a Clinical Programmer";

// ---- palette: the day's arc -------------------------------------------------
const PAPER = "EFEDE8", INK = "1A1A1A", MUTE = "6E6A62", RULE = "D3CFC7", WHITE = "FFFFFF";
//  Two tiers on purpose. The bright values are for FILLS — dots, rules, bars,
//  the images — where nothing has to be read. Small text needs more contrast
//  than a decorative fill does, so anything set as TYPE on the paper ground uses
//  the darker twin. Measured on #EFEDE8: the bright amber is 2.07:1, which fails
//  WCAG AA outright; its text twin is 4.64:1.
const DAWN = "3D5A80", GREEN = "5B8C5A", AMBER = "C9A227",
      CLAY = "D97742", ROSE = "B5485D", DUSK = "7B4B94";
const DAWN_T = "3D5A80", GREEN_T = "4A7249", AMBER_T = "806718",
      CLAY_T = "9C552F", ROSE_T = "B1465B", DUSK_T = "7B4B94";

const DISPLAY = "Georgia", BODY = "Trebuchet MS", DATA = "Courier New";
const ASSETS = path.join(__dirname, "assets_day1");
const img = (f) => path.join(ASSETS, f);

// the six moments — the deck's spine
const DAY = [
  { t: "08:45", c: DAWN,  ct: DAWN_T  },
  { t: "10:15", c: GREEN, ct: GREEN_T },
  { t: "11:30", c: AMBER, ct: AMBER_T },
  { t: "13:30", c: CLAY,  ct: CLAY_T  },
  { t: "15:00", c: ROSE,  ct: ROSE_T  },
  { t: "16:45", c: DUSK,  ct: DUSK_T  },
];

let s;
function slide(bg) { s = p.addSlide(); s.background = { color: bg || PAPER }; return s; }

//  The rail: six dots across the foot of the slide, the current moment filled
//  and labelled. It is the only recurring furniture, and it says one true thing —
//  how far through the day we are.
function rail(activeIdx) {
  const y = 6.92, x0 = 1.0, x1 = 12.33;
  s.addShape(p.ShapeType.line, { x: x0, y: y, w: x1 - x0, h: 0,
    line: { color: RULE, width: 1 } });
  DAY.forEach((m, i) => {
    const x = x0 + (x1 - x0) * (i / (DAY.length - 1));
    const on = i === activeIdx;
    const d = on ? 0.17 : 0.09;
    s.addShape(p.ShapeType.ellipse, { x: x - d / 2, y: y - d / 2, w: d, h: d,
      fill: { color: on ? m.c : RULE }, line: { type: "none" } });
    if (on) {
      s.addText(m.t, { x: x - 0.6, y: y + 0.14, w: 1.2, h: 0.26, align: "center",
        fontFace: DATA, fontSize: 11, bold: true, color: m.ct, margin: 0 });
    }
  });
}

//  A moment: the big time numeral, the headline, and the one-line thesis.
function moment(idx, headline, thesis) {
  const m = DAY[idx];
  s.addText(m.t, { x: 0.95, y: 0.55, w: 3.2, h: 0.9,
    fontFace: DATA, fontSize: 40, bold: true, color: m.ct, margin: 0 });
  s.addText(headline, { x: 0.95, y: 1.45, w: 11.4, h: 0.85,
    fontFace: DISPLAY, fontSize: 32, bold: true, color: INK, margin: 0 });
  if (thesis) {
    s.addText(thesis, { x: 0.95, y: 2.3, w: 10.6, h: 0.6,
      fontFace: BODY, fontSize: 16, color: MUTE, lineSpacing: 23, margin: 0 });
  }
  rail(idx);
  return m;
}

function picture(file, opts) {
  s.addImage({ path: img(file), ...opts });
}

// ============================================================ 1. TITLE
slide(PAPER);
s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 0.28, h: 7.5,
  fill: { color: DAWN }, line: { type: "none" } });
s.addText("CLINICAL PROGRAMMING BOOTCAMP  ·  DAY 1", { x: 0.95, y: 0.75, w: 10, h: 0.35,
  fontFace: BODY, fontSize: 13, bold: true, color: CLAY_T, charSpacing: 3, margin: 0 });
s.addText("A day in the life", { x: 0.92, y: 1.25, w: 11, h: 1.15,
  fontFace: DISPLAY, fontSize: 54, bold: true, color: INK, margin: 0 });
s.addText("What a clinical programmer actually does, hour by hour", { x: 0.95, y: 2.45, w: 11, h: 0.55,
  fontFace: DISPLAY, fontSize: 23, italic: true, color: MUTE, margin: 0 });
picture("dayarc.png", { x: 4.05, y: 3.30, w: 5.2, h: 2.69 });
s.addText("Before we open a single dataset — this is the job you are training for.",
  { x: 0.95, y: 6.35, w: 11.4, h: 0.4, fontFace: BODY, fontSize: 14, color: MUTE, margin: 0 });
s.addNotes("Open the day with this. The point is orientation, not content — they should leave this deck able to picture the work, not perform it. Adjust the hours and tasks to match your own routine; the shape is what matters. Everything shown later uses the real ABC-01 study data they will build in this course.");

// ============================================================ 2. THE JOB
slide(PAPER);
s.addText("The whole job, in one sentence", { x: 0.95, y: 0.8, w: 11.4, h: 0.7,
  fontFace: DISPLAY, fontSize: 34, bold: true, color: INK, margin: 0 });
s.addShape(p.ShapeType.rect, { x: 0.95, y: 2.0, w: 0.06, h: 2.4,
  fill: { color: AMBER }, line: { type: "none" } });
s.addText("Take the messy data a hospital actually recorded, and turn it into something a regulator on the other side of the world can read without asking you a single question.",
  { x: 1.35, y: 2.0, w: 10.4, h: 2.4, fontFace: DISPLAY, fontSize: 30,
    color: INK, lineSpacing: 44, margin: 0 });
s.addText("Everything else — the standards, the code, the checks — exists to make that sentence true.",
  { x: 1.35, y: 4.75, w: 10.4, h: 0.5, fontFace: BODY, fontSize: 16, color: MUTE, margin: 0 });
s.addNotes("Let this sit for a moment. Freshers usually arrive thinking the job is SAS. It is not — SAS is the tool. The job is making data legible to someone who was never in the room. Ask them: who is the reader? Answer: a reviewer who cannot phone you.");

// ============================================================ 3. THE PIPELINE
slide(PAPER);
s.addText("You are one link in a long chain", { x: 0.95, y: 0.6, w: 11.4, h: 0.7,
  fontFace: DISPLAY, fontSize: 32, bold: true, color: INK, margin: 0 });
picture("pipeline.png", { x: 0.75, y: 1.75, w: 11.9, h: 2.40 });
s.addText("A nurse writes on a form. Years later a reviewer decides whether a medicine reaches patients. Your datasets are what connects those two people.",
  { x: 0.95, y: 4.6, w: 11.2, h: 0.8, fontFace: BODY, fontSize: 16, color: INK, lineSpacing: 24, margin: 0 });
s.addText("The ten days ahead cover the amber stretch — raw extract through to analysis-ready.",
  { x: 0.95, y: 5.5, w: 11.2, h: 0.4, fontFace: BODY, fontSize: 14, italic: true, color: MUTE, margin: 0 });
s.addNotes("Worth stressing the timescale: the gap between the nurse and the reviewer can be years, and by then nobody remembers what a value meant. That is the entire reason standards and define.xml exist.");

// ============================================================ 4. 08:45 — THE LOG
slide(PAPER);
moment(0, "The first thing I do is read yesterday's log",
  "Not the output. The log. Overnight the study data refreshed and every programme re-ran.");
picture("saslog.png", { x: 0.95, y: 2.85, w: 7.0, h: 3.73 });
s.addText("Why this comes first", { x: 8.25, y: 2.95, w: 4.05, h: 0.35,
  fontFace: BODY, fontSize: 13, bold: true, color: DAWN_T, charSpacing: 1, margin: 0 });
[["A programme can finish with no error and still be wrong.", DAWN_T],
 ["Three of the four worst bugs in this course announced themselves only as a WARNING.", DAWN_T],
 ["“It ran fine” is not a status. The log is the status.", DAWN_T]].forEach((r, i) => {
  s.addText(r[0], { x: 8.25, y: 3.40 + i * 1.05, w: 4.05, h: 0.95,
    fontFace: BODY, fontSize: 14, color: INK, lineSpacing: 20, margin: 0 });
});
s.addNotes("This is the single habit that separates a reliable programmer from an unreliable one, and it costs nothing. The log shown is a real pattern from this course: a length mismatch on USUBJID that truncates data while the run reports success.");

// ============================================================ 5. 10:15 — THE QUERY
slide(PAPER);
moment(1, "The data asks me a question I cannot answer",
  "Something in the data is not possible. I am not allowed to guess — so I ask the site.");
picture("query.png", { x: 0.95, y: 2.95, w: 6.2, h: 2.45 });
s.addText("The rule", { x: 7.6, y: 3.0, w: 4.7, h: 0.35,
  fontFace: BODY, fontSize: 13, bold: true, color: GREEN_T, charSpacing: 1, margin: 0 });
s.addText("A programmer never invents a value.", { x: 7.6, y: 3.4, w: 4.7, h: 0.5,
  fontFace: DISPLAY, fontSize: 20, bold: true, color: INK, margin: 0 });
s.addText("If a date is impossible, you do not repair it quietly. You raise a query, and the site — the people who saw the patient — answer it. That answer is part of the trial record.",
  { x: 7.6, y: 4.0, w: 4.7, h: 1.6, fontFace: BODY, fontSize: 14.5, color: INK, lineSpacing: 21, margin: 0 });
s.addText("Guessing is the one unforgivable habit in this job.",
  { x: 7.6, y: 5.6, w: 4.7, h: 0.5, fontFace: BODY, fontSize: 14, bold: true, color: GREEN_T, margin: 0 });
s.addNotes("This query is genuinely from ABC-01 — subject 01-002 has an adverse event starting five days before first dose. It is not an error; it is a screening event, and it is why AETRTEM exists. Trainees meet this exact record on Day 5.");

// ============================================================ 6. 11:30 — BUILD
slide(PAPER);
moment(2, "Now I build the thing I am paid to build",
  "One raw file in. One standard dataset out. This is the craft at the centre of the job.");
picture("transform.png", { x: 0.85, y: 2.72, w: 11.6, h: 4.07 });
s.addNotes("These are the real first rows of ABC-01. Point at three things: subject 001 exists at both sites so USUBJID has to be constructed; sex arrives as a numeric code and must be decoded; and date of birth is collected but never submitted — AGE is derived from it and the birth date stays behind. That last one usually surprises people.");

// ============================================================ 7. 13:30 — THE SPEC
slide(PAPER);
moment(3, "Half of this job is agreeing what a column means",
  "Afternoon: a spec review. Five people, one spreadsheet, one argument about a variable.");
const specRows = [
  ["What gets argued about", "Whether a value is 'derived' or 'collected'. Where a non-standard flag belongs. Which visit counts as baseline."],
  ["Why it matters more than the code", "The specification is the contract. Code that perfectly implements a wrong spec is wrong."],
  ["What you contribute", "You are the person who has actually looked at the data. That makes you the person who knows what is really in it."],
];
let sy = 3.0;
specRows.forEach((r, i) => {
  s.addShape(p.ShapeType.rect, { x: 0.95, y: sy, w: 0.05, h: 1.0,
    fill: { color: CLAY }, line: { type: "none" } });
  s.addText(r[0], { x: 1.3, y: sy, w: 3.5, h: 0.9,
    fontFace: BODY, fontSize: 15, bold: true, color: CLAY_T, lineSpacing: 20, margin: 0 });
  s.addText(r[1], { x: 5.0, y: sy, w: 7.3, h: 1.0,
    fontFace: BODY, fontSize: 15, color: INK, lineSpacing: 21, margin: 0 });
  sy += 1.15;
});
s.addNotes("Freshers assume seniority means writing harder code. It does not — it means being trusted in this meeting. Encourage them to speak up in spec reviews early; having read the data is a real qualification.");

// ============================================================ 8. 15:00 — QC
slide(PAPER);
moment(4, "Someone else writes my programme again, from scratch",
  "Double programming. Two people, one specification, no conversation — then the results are compared.");
s.addShape(p.ShapeType.rect, { x: 0.95, y: 3.0, w: 5.3, h: 1.5,
  fill: { color: WHITE }, line: { color: RULE, width: 1 } });
s.addText("You", { x: 1.2, y: 3.15, w: 4.8, h: 0.35, fontFace: BODY, fontSize: 13, bold: true, color: ROSE_T, margin: 0 });
s.addText("write dm.sas from the spec", { x: 1.2, y: 3.5, w: 4.8, h: 0.8,
  fontFace: BODY, fontSize: 15, color: INK, margin: 0 });
s.addShape(p.ShapeType.rect, { x: 7.0, y: 3.0, w: 5.3, h: 1.5,
  fill: { color: WHITE }, line: { color: RULE, width: 1 } });
s.addText("Your QC partner", { x: 7.25, y: 3.15, w: 4.8, h: 0.35, fontFace: BODY, fontSize: 13, bold: true, color: ROSE_T, margin: 0 });
s.addText("writes it again, never seeing your code", { x: 7.25, y: 3.5, w: 4.8, h: 0.8,
  fontFace: BODY, fontSize: 15, color: INK, margin: 0 });
s.addText("PROC COMPARE", { x: 0.95, y: 4.8, w: 11.35, h: 0.5, align: "center",
  fontFace: DATA, fontSize: 20, bold: true, color: ROSE_T, margin: 0 });
s.addText("If the two datasets differ by a single value, one of you is wrong — and the point is to find out which before a regulator does.",
  { x: 1.6, y: 5.4, w: 10.1, h: 0.8, align: "center", fontFace: BODY, fontSize: 15.5,
    color: INK, lineSpacing: 22, margin: 0 });
s.addNotes("Expect a reaction — it sounds wasteful. Explain the economics: a wrong number in a submission can cost a company a review cycle, or worse, mislead a safety decision. Two independent implementations is cheap by comparison. They will do this on Day 9.");

// ============================================================ 9. 16:45 — CHANGE
slide(PAPER);
moment(5, "And then something changes",
  "Late afternoon. The spec is updated, or the data refreshes, and work you finished is suddenly out of date.");
s.addText("“", { x: 0.85, y: 2.85, w: 1.0, h: 1.0,
  fontFace: DISPLAY, fontSize: 90, bold: true, color: DUSK, margin: 0 });
s.addText("This is not a sign that something went wrong. It is the normal condition of a live study.",
  { x: 1.75, y: 3.05, w: 10.3, h: 1.2, fontFace: DISPLAY, fontSize: 26, color: INK,
    lineSpacing: 38, margin: 0 });
s.addText("Which is why everything you will learn here is built to be RE-RUN, not hand-edited:",
  { x: 1.75, y: 4.5, w: 10.3, h: 0.45, fontFace: BODY, fontSize: 15.5, bold: true, color: INK, margin: 0 });
[["a programme, not a spreadsheet edit", "so the change is repeatable"],
 ["a specification, not a memory", "so the reason survives the person"],
 ["a check that fails loudly", "so a stale result cannot pass quietly"]].forEach((r, i) => {
  s.addText([{ text: r[0] + "  —  ", options: { bold: true, color: DUSK_T } },
             { text: r[1], options: { color: MUTE } }],
    { x: 1.95, y: 5.05 + i * 0.42, w: 10.1, h: 0.38, fontFace: BODY, fontSize: 14.5, margin: 0 });
});
s.addNotes("This slide quietly justifies the whole course design — why we generate rather than hand-write, and why every check gets tested by breaking it on purpose. If they take one working habit away, make it this one.");

// ============================================================ 10. TIME SPLIT
slide(PAPER);
picture("timesplit.png", { x: 0.7, y: 1.35, w: 11.9, h: 2.97 });
s.addText("If you only remember one slide from today, remember this one.",
  { x: 0.95, y: 4.7, w: 11.4, h: 0.5, fontFace: DISPLAY, fontSize: 22, bold: true, color: INK, margin: 0 });
s.addText("You will spend far more time reading — code, logs, specifications, other people's programmes — than writing. Being fast at typing is worth very little. Being careful when reading is worth almost everything.",
  { x: 0.95, y: 5.3, w: 11.4, h: 1.0, fontFace: BODY, fontSize: 16, color: INK, lineSpacing: 24, margin: 0 });
s.addNotes("Adjust these proportions to your own experience before presenting — they are indicative of a typical study week, not a timesheet. The teaching point holds regardless: this is a reading job more than a writing job.");

// ============================================================ 11. WHO IS GOOD AT THIS
slide(PAPER);
s.addText("What actually makes someone good at this", { x: 0.95, y: 0.7, w: 11.4, h: 0.7,
  fontFace: DISPLAY, fontSize: 32, bold: true, color: INK, margin: 0 });
s.addText("None of these is about how much SAS you know on your first day.",
  { x: 0.95, y: 1.45, w: 11.4, h: 0.4, fontFace: BODY, fontSize: 16, color: MUTE, margin: 0 });
const traits = [
  ["Suspicion", "You assume a clean-looking result is hiding something, and you go and check.", DAWN],
  ["Precision about words", "You notice that 'severe' and 'serious' are different, and that the difference matters.", GREEN],
  ["Comfort asking", "You raise the query rather than quietly making the data look tidy.", AMBER],
  ["Leaving a trail", "Someone can pick up your work in two years and see why every value is what it is.", CLAY],
];
let ty = 2.25;
traits.forEach((t) => {
  s.addShape(p.ShapeType.ellipse, { x: 0.95, y: ty + 0.14, w: 0.22, h: 0.22,
    fill: { color: t[2] }, line: { type: "none" } });
  s.addText(t[0], { x: 1.45, y: ty, w: 3.3, h: 0.5,
    fontFace: DISPLAY, fontSize: 21, bold: true, color: INK, margin: 0 });
  s.addText(t[1], { x: 4.9, y: ty + 0.03, w: 7.4, h: 0.9,
    fontFace: BODY, fontSize: 15.5, color: INK, lineSpacing: 22, margin: 0 });
  ty += 1.08;
});
s.addText("All four are learnable. That is the good news.",
  { x: 0.95, y: 6.7, w: 11.4, h: 0.4, fontFace: BODY, fontSize: 15, italic: true, color: MUTE, margin: 0 });
s.addNotes("Say plainly that people from a clinical background and people from a coding background both do well here, for different reasons, and both have a gap to close. Nobody in the room is starting behind.");

// ============================================================ 12. THE TEN DAYS
slide(PAPER);
s.addText("What the next ten days look like", { x: 0.95, y: 0.7, w: 11.4, h: 0.7,
  fontFace: DISPLAY, fontSize: 32, bold: true, color: INK, margin: 0 });
s.addText("You will build a complete study — then do it again on your own.",
  { x: 0.95, y: 1.45, w: 11.4, h: 0.4, fontFace: BODY, fontSize: 16, color: MUTE, margin: 0 });
const days = [
  ["Days 1–3", "The ground", "trials, the toolkit, and getting raw data in without breaking it", DAWN_T],
  ["Days 4–7", "The domains", "DM, AE, CM, EX, VS, LB — one observation class at a time", GREEN_T],
  ["Days 8–9", "The rigour", "controlled terminology, derivations, QC, and the submission package", AMBER_T],
  ["Day 10", "On your own", "a second study, no worked notebook, four traps nobody solves for you", CLAY_T],
];
let dy = 2.3;
days.forEach((d) => {
  s.addShape(p.ShapeType.rect, { x: 0.95, y: dy, w: 11.35, h: 0.03,
    fill: { color: RULE }, line: { type: "none" } });
  s.addText(d[0], { x: 0.95, y: dy + 0.2, w: 1.9, h: 0.5,
    fontFace: DATA, fontSize: 16, bold: true, color: d[3], margin: 0 });
  s.addText(d[1], { x: 3.0, y: dy + 0.16, w: 3.0, h: 0.5,
    fontFace: DISPLAY, fontSize: 21, bold: true, color: INK, margin: 0 });
  s.addText(d[2], { x: 6.1, y: dy + 0.22, w: 6.2, h: 0.6,
    fontFace: BODY, fontSize: 14.5, color: MUTE, lineSpacing: 20, margin: 0 });
  dy += 1.05;
});
s.addShape(p.ShapeType.rect, { x: 0.95, y: dy, w: 11.35, h: 0.03,
  fill: { color: RULE }, line: { type: "none" } });
s.addText("By Day 10 you will have built two studies, and read a lot more code than you wrote.",
  { x: 0.95, y: dy + 0.35, w: 11.4, h: 0.4, fontFace: BODY, fontSize: 15, italic: true, color: MUTE, margin: 0 });
s.addNotes("Set the expectation that Day 10 is unguided on purpose. They get a data dictionary and a skeleton, and the four hard cases are named but not solved. That is the closest thing here to a real first week on a study.");

// ============================================================ 13. CLOSE
slide(INK);
s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 0.28, h: 7.5,
  fill: { color: DUSK }, line: { type: "none" } });
s.addText("One thing to carry into tomorrow", { x: 0.95, y: 1.9, w: 11, h: 0.45,
  fontFace: BODY, fontSize: 14, bold: true, color: "C9B9D6", charSpacing: 2, margin: 0 });
s.addText("A clean-looking run is not a correct run.", { x: 0.92, y: 2.5, w: 11.3, h: 1.5,
  fontFace: DISPLAY, fontSize: 44, bold: true, color: WHITE, lineSpacing: 56, margin: 0 });
s.addText("Everything in the next ten days is a way of proving that a result is right, rather than hoping it is. Bring the suspicion. We will supply the rest.",
  { x: 0.95, y: 4.3, w: 10.4, h: 1.0, fontFace: BODY, fontSize: 17, color: "DCD6E4", lineSpacing: 26, margin: 0 });
s.addText("Tomorrow: Module 01 · Introduction to CDISC & SDTM Foundations",
  { x: 0.95, y: 6.3, w: 11.4, h: 0.4, fontFace: BODY, fontSize: 14, italic: true, color: "AFA6BC", margin: 0 });
s.addNotes("Close on the sentence, not on logistics. It is the thread running through every module, and it is the habit that will make them trusted.");

p.writeFile({ fileName: path.join(__dirname, "day1_a_day_in_the_life.pptx") })
  .then((f) => console.log("wrote " + f));
