// Build: 11_relationships_trialdesign.pptx — "Relationships & Trial Design"
// Bootcamp Module 11. Concept deck for Day 9.
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "Clinical Programming Bootcamp";
p.title = "Relationships & Trial Design";

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
s.addShape(p.ShapeType.ellipse, { x: 10.7, y: -0.6, w: 3.2, h: 3.2, fill: { color: SEA }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.45, y: 0.15, w: 1.7, h: 1.7, fill: { color: MINT }, line: { type: "none" } });
s.addText("CLINICAL PROGRAMMING BOOTCAMP  ·  MODULE 11", { x: 0.7, y: 2.0, w: 9, h: 0.4,
  fontFace: BFONT, fontSize: 14, bold: true, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Relationships\n& Trial Design", { x: 0.66, y: 2.5, w: 9.6, h: 1.7,
  fontFace: HFONT, fontSize: 42, bold: true, color: WHITE, lineSpacing: 46, margin: 0 });
s.addText("How datasets point at each other, and where the protocol lives", { x: 0.7, y: 4.25, w: 9.6, h: 0.6,
  fontFace: HFONT, fontSize: 20, color: MINT, margin: 0 });
s.addText("Two loose ends from earlier: the SUPPQUAL you already built, and the trial-design datasets that describe the study itself rather than its subjects.",
  { x: 0.7, y: 5.0, w: 9.2, h: 0.9, fontFace: BFONT, fontSize: 16, color: "C7DCE0", margin: 0 });
s.addText("Concept module — lighter treatment; no new notebook.",
  { x: 0.7, y: 6.5, w: 12, h: 0.4, fontFace: BFONT, fontSize: 12, italic: true, color: MUTED, margin: 0 });
s.addNotes("Module 11 is the lightest of Day 9 and the natural one to compress in a one-week track. It ties off two threads: SUPPQUAL (met in Day 5 as SUPPAE) generalised, and the Trial Design model, which trainees have not seen because it describes the study, not the subjects.");

// ============ 2. TWO KINDS OF RELATIONSHIP ============
s = _add(); bg(s, WHITE);
header(s, "Linking data", "Two mechanisms, two jobs");
card(s, 0.7, 1.85, 5.9, 4.5, "E7F4F2");
s.addText("SUPPQUAL", { x: 1.0, y: 2.05, w: 5.3, h: 0.5, fontFace: HFONT, bold: true, fontSize: 22, color: TEAL, margin: 0 });
s.addText("Attach EXTRA information to a record.", { x: 1.0, y: 2.6, w: 5.3, h: 0.4, fontFace: BFONT, bold: true, fontSize: 14, color: INK, margin: 0 });
s.addText("A standard domain has a fixed set of variables. When you must carry a value that has no standard home, it goes in a Supplemental Qualifiers dataset — NOT a new column.",
  { x: 1.0, y: 3.05, w: 5.3, h: 1.05, fontFace: BFONT, fontSize: 12.5, color: MUTED, margin: 0 });
s.addText("You already built one", { x: 1.0, y: 4.15, w: 5.3, h: 0.35, fontFace: BFONT, bold: true, fontSize: 12.5, color: TEAL, margin: 0 });
s.addText("SUPPAE, carrying AETRTEM — the treatment-emergent flag that is not a standard AE variable.",
  { x: 1.0, y: 4.5, w: 5.3, h: 0.7, fontFace: BFONT, fontSize: 12.5, color: INK, margin: 0 });
s.addText("SUPP-- links to its parent by\nUSUBJID + RDOMAIN + IDVAR + IDVARVAL", { x: 1.0, y: 5.35, w: 5.3, h: 0.8, fontFace: MONO, fontSize: 11.5, color: TEAL, margin: 0 });

card(s, 6.8, 1.85, 5.9, 4.5, "FDF1E7");
s.addText("RELREC", { x: 7.1, y: 2.05, w: 5.3, h: 0.5, fontFace: HFONT, bold: true, fontSize: 22, color: RUST, margin: 0 });
s.addText("Relate one RECORD to another RECORD.", { x: 7.1, y: 2.6, w: 5.3, h: 0.4, fontFace: BFONT, bold: true, fontSize: 14, color: INK, margin: 0 });
s.addText("When two records in DIFFERENT domains describe the same clinical event, RELREC records the link — formally, so a reviewer does not have to infer it.",
  { x: 7.1, y: 3.05, w: 5.3, h: 1.05, fontFace: BFONT, fontSize: 12.5, color: MUTED, margin: 0 });
s.addText("The ABC-01 example you have seen", { x: 7.1, y: 4.15, w: 5.3, h: 0.35, fontFace: BFONT, bold: true, fontSize: 12.5, color: RUST, margin: 0 });
s.addText("The AE \"bad headache\" and the CM \"Paracetamol\" taken for it — event and treatment, one clinical story, two domains.",
  { x: 7.1, y: 4.5, w: 5.3, h: 0.8, fontFace: BFONT, fontSize: 12.5, color: INK, margin: 0 });
s.addText("RELREC links by\nUSUBJID + RDOMAIN + IDVAR + IDVARVAL + RELID", { x: 7.1, y: 5.35, w: 5.3, h: 0.8, fontFace: MONO, fontSize: 11.5, color: RUST, margin: 0 });
s.addText("SUPPQUAL adds a QUALIFIER to a record; RELREC connects a RECORD to another record. Different jobs, similar machinery.",
  { x: 0.7, y: 6.55, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 12.5, color: INK, margin: 0 });
s.addNotes("SUPPAE is the anchor — they built it, so SUPPQUAL is not abstract. RELREC is new but rare in routine work; the AE/CM pair from Day 6 makes it concrete. Note RELREC is OPTIONAL and often not used for obvious pairs; over-using it clutters the submission.");

// ============ 3. SUPPQUAL SHAPE ============
s = _add(); bg(s, WHITE);
header(s, "The shape you already know", "Every SUPP-- dataset has the same eight-ish columns");
grid(s, 0.7, 1.85, [2.1, 4.4, 5.5], [
  ["Variable", "Holds", "In SUPPAE"],
  ["STUDYID", "the study", "ABC-01"],
  ["RDOMAIN", "which domain this qualifies", "AE"],
  ["USUBJID", "which subject", "ABC-01-01-002"],
  ["IDVAR", "how we point at the parent", "AESEQ"],
  ["IDVARVAL", "which record specifically", "1"],
  ["QNAM", "the qualifier's name", "AETRTEM"],
  ["QLABEL", "its human-readable label", "Treatment Emergent Flag"],
  ["QVAL", "the value", "N"],
  ["QORIG / QEVAL", "where it came from / who assessed", "DERIVED / (blank)"],
], { fontSize: 11.5, rowH: 0.4, highlight: (r, c) => (r === 4 || r === 5) && c > 0 ? TEAL : null });
card(s, 0.7, 6.15, 12.0, 0.85, "E7F4F2");
s.addText([{ text: "IDVAR + IDVARVAL is the key.  ", options: { bold: true, color: TEAL } },
           { text: "IDVAR names the parent variable (AESEQ), IDVARVAL gives its value (1). Together they say \"this qualifier belongs to AE record AESEQ=1 for this subject\" — which is exactly the link an unstable --SEQ sort would break.", options: { color: INK } }],
  { x: 1.0, y: 6.27, w: 11.4, h: 0.65, fontFace: BFONT, fontSize: 12.5, valign: "middle", margin: 0 });
s.addNotes("This is revision, not new material — pull it up from Day 5. The callback to the unstable-sort danger (Notebook 11) closes the loop: now they see exactly what IDVARVAL is, they understand why a moving AESEQ silently re-points the flag. The vertical structure is why SUPP scales to any qualifier without touching the parent domain.");

// ============ 4. WHY NOT JUST ADD A COLUMN ============
s = _add(); bg(s, INK);
headerDark(s, "The question everyone asks", "Why not just add AETRTEM as a column in AE?");
card(s, 0.7, 1.95, 5.85, 4.5, "3A2530");
s.addText("If you added a column…", { x: 1.0, y: 2.15, w: 5.2, h: 0.4, fontFace: HFONT, bold: true, fontSize: 16, color: "FF9DAE", margin: 0 });
s.addText("AE would no longer match the standard AE domain. A validation tool compares your AE against the published SDTMIG structure and flags every non-standard variable as an ERROR.\n\nWorse, a reviewer's tools expect AE to have exactly the standard columns. An extra one breaks the automation they rely on to read fifty submissions the same way.",
  { x: 1.0, y: 2.6, w: 5.2, h: 3.6, fontFace: BFONT, fontSize: 12.5, color: "F0D6DB", lineSpacing: 16, margin: 0 });
card(s, 6.85, 1.95, 5.85, 4.5, "1A4152");
s.addText("So SUPPQUAL exists", { x: 7.15, y: 2.15, w: 5.2, h: 0.4, fontFace: HFONT, bold: true, fontSize: 16, color: MINT, margin: 0 });
s.addText("The standard domains stay EXACTLY as published — same columns, every study, every sponsor. Anything extra goes in a SUPP-- dataset with a fixed generic shape.\n\nThe cost is that a qualifier lives in a separate dataset and must be merged back. That is a price worth paying for domains that are identical across the entire industry.",
  { x: 7.15, y: 2.6, w: 5.2, h: 3.6, fontFace: BFONT, fontSize: 12.5, color: "DCEBEF", lineSpacing: 16, margin: 0 });
s.addText("The rule, one more time: never add a non-standard variable to a standard domain.",
  { x: 0.7, y: 6.65, w: 12, h: 0.4, align: "center", fontFace: BFONT, bold: true, fontSize: 14, color: MINT, margin: 0 });
s.addNotes("This is the single most important rule about SUPPQUAL and it was stated in Day 5; here it gets its full justification. The poolability argument is the same one from the CT deck — standard structure is what lets one reviewer tool read every submission. That is worth the merge-back cost.");

// ============ 5. TRIAL DESIGN INTRO ============
s = _add(); bg(s, WHITE);
header(s, "A different kind of dataset", "Trial Design describes the STUDY, not the subjects");
card(s, 0.7, 1.8, 12.0, 1.5, PAPER);
s.addText("Everything you have built is subject data. Trial Design is not.", { x: 1.0, y: 1.95, w: 11.4, h: 0.4, fontFace: HFONT, bold: true, fontSize: 17, color: INK, margin: 0 });
s.addText("DM, AE, VS and the rest have one thing in common: a row is about a SUBJECT. The Trial Design datasets describe the PROTOCOL itself — the planned arms, the planned visits, the study's parameters. There is no USUBJID, because these are facts about the study, true before a single subject enrolled.",
  { x: 1.0, y: 2.35, w: 11.4, h: 0.9, fontFace: BFONT, fontSize: 13, color: MUTED, margin: 0 });
const td = [["TA", "Trial Arms", "the planned treatment arms and the sequence of elements in each", TEAL],
            ["TE", "Trial Elements", "the building-block periods an arm is made of (Screen, Treatment, Follow-up)", SEA],
            ["TV", "Trial Visits", "the planned visit schedule — the source of VISITNUM", ACCENT],
            ["TS", "Trial Summary", "one-row-per-parameter facts about the study: phase, indication, objectives", MINT]];
let ty = 3.5;
td.forEach((t) => {
  card(s, 0.7, ty, 12.0, 0.82, WHITE);
  s.addShape(p.ShapeType.rect, { x: 0.7, y: ty, w: 0.09, h: 0.82, fill: { color: t[3] }, line: { type: "none" } });
  s.addText(t[0], { x: 1.0, y: ty + 0.2, w: 1.0, h: 0.42, fontFace: MONO, bold: true, fontSize: 17, color: t[3], margin: 0 });
  s.addText(t[1], { x: 2.1, y: ty + 0.22, w: 2.7, h: 0.4, fontFace: BFONT, bold: true, fontSize: 13.5, color: INK, valign: "middle", margin: 0 });
  s.addText(t[2], { x: 4.9, y: ty + 0.2, w: 7.5, h: 0.45, fontFace: BFONT, fontSize: 12, color: MUTED, valign: "middle", margin: 0 });
  ty += 0.9;
});
s.addNotes("The 'no USUBJID' point is the key distinction and the one trainees find surprising. TV is the tie-back to something they know: VISITNUM in VS and LB came from the protocol's visit schedule, which IS TV. TS is the odd one — one row per parameter, the study's metadata.");

// ============ 6. TS EXAMPLE ============
s = _add(); bg(s, WHITE);
header(s, "Trial Summary in the concrete", "What TS would say about ABC-01");
grid(s, 0.7, 1.9, [3.2, 3.6, 5.2], [
  ["TSPARMCD", "TSPARM", "TSVAL"],
  ["STUDYID", "Study Identifier", "ABC-01"],
  ["TITLE", "Trial Title", "A Phase 2 Study of Drug A vs Placebo"],
  ["PHASE", "Trial Phase", "PHASE II TRIAL"],
  ["TTYPE", "Trial Type", "TREATMENT"],
  ["TCNTRL", "Control Type", "PLACEBO"],
  ["INDIC", "Indication", "(the condition under study)"],
  ["ACTSUB", "Actual Number of Subjects", "8"],
], { fontSize: 11.5, rowH: 0.42 });
card(s, 0.7, 5.5, 12.0, 1.4, "E7F4F2");
s.addText("One row per parameter — a vertical structure again", { x: 1.0, y: 5.63, w: 11.4, h: 0.35, fontFace: HFONT, bold: true, fontSize: 15, color: TEAL, margin: 0 });
s.addText("TS is the same tall shape as a Findings domain: one fact per row, identified by a code (TSPARMCD) from a controlled list. It is how a reviewer — or an automated system — reads the study's headline facts without opening the protocol PDF. ABC-01 does not ship a TS in this bootcamp, but every real submission does.",
  { x: 1.0, y: 6.0, w: 11.4, h: 0.85, fontFace: BFONT, fontSize: 12.5, color: INK, margin: 0 });
s.addText("Values shown are illustrative of the ABC-01 design; TSPARMCD values come from the CDISC Trial Summary codelist.",
  { x: 0.7, y: 7.0, w: 12, h: 0.35, fontFace: BFONT, italic: true, fontSize: 10.5, color: MUTED, margin: 0 });
s.addNotes("Flag clearly that we do not ship a TS dataset — this is illustrative so trainees see the shape. The tie to earlier learning: TS is tall/vertical like Findings, and TSPARMCD is controlled terminology. Everything connects back. The registrational value: ClinicalTrials.gov and FDA systems read TS programmatically.");

// ============ 7. HOW IT ALL FITS ============
s = _add(); bg(s, INK);
headerDark(s, "The whole package", "Where everything you have built sits");
const pkg = [
  ["Special Purpose", "DM", "one row per subject — demographics and reference dates", TEAL],
  ["Interventions", "EX · CM", "what was given to the subject", SEA],
  ["Events", "AE · DS", "what happened to the subject", ACCENT],
  ["Findings", "VS · LB", "what was measured", MINT],
  ["Relationships", "SUPPAE · (RELREC)", "extra qualifiers and record links", "C0455B"],
  ["Trial Design", "TA · TE · TV · TS", "the protocol itself — no subjects", "B5651A"],
];
let py = 1.85;
pkg.forEach((r, i) => {
  const built = i < 5;
  s.addShape(p.ShapeType.roundRect, { x: 0.7, y: py, w: 12.0, h: 0.72, rectRadius: 0.07, fill: { color: "163B4B" }, line: { color: r[3], width: 1.2 } });
  s.addText(r[0], { x: 1.0, y: py + 0.17, w: 2.9, h: 0.4, fontFace: HFONT, bold: true, fontSize: 14, color: r[3], valign: "middle", margin: 0 });
  s.addText(r[1], { x: 4.0, y: py + 0.17, w: 3.0, h: 0.4, fontFace: MONO, fontSize: 12.5, color: "DCEBEF", valign: "middle", margin: 0 });
  s.addText(r[2], { x: 7.2, y: py + 0.17, w: 5.3, h: 0.4, fontFace: BFONT, fontSize: 11.5, color: "AFCBD3", valign: "middle", margin: 0 });
  py += 0.79;
});
s.addText("Five of the six you have built end to end. Trial Design and RELREC are the pieces this module named — you now know the whole SDTM package, not just the domains with subjects in them.",
  { x: 0.7, y: 6.72, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 12, color: MINT, margin: 0 });
s.addText("Next:  Deck 12 · Define-XML & the Submission Package",
  { x: 0.7, y: 7.12, w: 12, h: 0.3, fontFace: BFONT, bold: true, fontSize: 12, color: MUTED, margin: 0 });
s.addNotes("This is the map slide — everything they have built, placed in the full SDTM structure by observation class plus the two non-subject categories. It is the payoff of the whole course: they can now name where any dataset sits and why. Leads naturally into define.xml, which documents this entire package.");

p.writeFile({ fileName: "/Volumes/D Drive/SDTM Training/Bootcamp/presentations/11_relationships_trialdesign.pptx" })
  .then(f => console.log("WROTE", f));
