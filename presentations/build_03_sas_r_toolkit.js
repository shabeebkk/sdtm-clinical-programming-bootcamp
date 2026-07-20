// Build: 03_sas_r_toolkit.pptx — "Your Toolkit: SAS & R for Clinical Programming"
// Bootcamp Module 03. Equal-weight SAS/R orientation before the hands-on notebooks.
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "Clinical Programming Bootcamp";
p.title = "Your Toolkit: SAS & R for Clinical Programming";

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
// Side-by-side code comparison block. Height is derived from the longest
// snippet so code can never overflow its panel. Returns the y position
// directly below the block (including caption) for positioning what follows.
const CODE_FS = 12;     // pt
const CODE_LS = 17;     // pt line spacing
function codePair(s, y, sasLines, rLines, caption) {
  const nLines = Math.max(sasLines.split("\n").length, rLines.split("\n").length);
  const textH = nLines * (CODE_LS / 72) + 0.14;
  const h = 0.62 + textH;
  // SAS panel
  s.addShape(p.ShapeType.roundRect, { x: 0.7, y, w: 5.9, h, rectRadius: 0.08, fill: { color: CODEBG }, line: { color: TEAL, width: 1.5 } });
  s.addText("SAS", { x: 0.95, y: y + 0.1, w: 1.2, h: 0.35, fontFace: HFONT, bold: true, fontSize: 16, color: TEAL, margin: 0 });
  s.addText(sasLines, { x: 0.95, y: y + 0.5, w: 5.45, h: textH, fontFace: MONO, fontSize: CODE_FS, color: "DCEBEF", lineSpacing: CODE_LS, margin: 0, valign: "top" });
  // R panel
  s.addShape(p.ShapeType.roundRect, { x: 6.8, y, w: 5.9, h, rectRadius: 0.08, fill: { color: CODEBG }, line: { color: ACCENT, width: 1.5 } });
  s.addText("R", { x: 7.05, y: y + 0.1, w: 1.2, h: 0.35, fontFace: HFONT, bold: true, fontSize: 16, color: ACCENT, margin: 0 });
  s.addText(rLines, { x: 7.05, y: y + 0.5, w: 5.45, h: textH, fontFace: MONO, fontSize: CODE_FS, color: "DCEBEF", lineSpacing: CODE_LS, margin: 0, valign: "top" });
  let end = y + h;
  if (caption) {
    s.addText(caption, { x: 0.7, y: end + 0.12, w: 12.0, h: 0.42, fontFace: BFONT, italic: true, fontSize: 13, color: TEAL, margin: 0 });
    end += 0.54;
  }
  return end;
}
let s;

// ============ 1. TITLE ============
s = p.addSlide(); bg(s, INK);
s.addShape(p.ShapeType.ellipse, { x: 9.7, y: -1.6, w: 5.2, h: 5.2, fill: { color: "133B4C" }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 10.7, y: -0.6, w: 3.2, h: 3.2, fill: { color: TEAL }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.45, y: 0.15, w: 1.7, h: 1.7, fill: { color: ACCENT }, line: { type: "none" } });
s.addText("CLINICAL PROGRAMMING BOOTCAMP  ·  MODULE 03", { x: 0.7, y: 2.0, w: 9, h: 0.4,
  fontFace: BFONT, fontSize: 14, bold: true, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Your Toolkit", { x: 0.66, y: 2.5, w: 9.6, h: 1.0,
  fontFace: HFONT, fontSize: 46, bold: true, color: WHITE, margin: 0 });
s.addText("SAS & R for clinical programming", { x: 0.7, y: 3.5, w: 9.6, h: 0.7,
  fontFace: HFONT, fontSize: 28, color: MINT, margin: 0 });
s.addText("Two languages, one job. Everything you build in this bootcamp, you'll build twice — and see how each language gets there.",
  { x: 0.7, y: 4.5, w: 9.2, h: 1.0, fontFace: BFONT, fontSize: 16, color: "C7DCE0", margin: 0 });
s.addText("No programming experience assumed.",
  { x: 0.7, y: 6.5, w: 12, h: 0.4, fontFace: BFONT, fontSize: 12, italic: true, color: MUTED, margin: 0 });
s.addNotes("Module 03. This is the orientation before the hands-on notebooks. Key message: SAS and R are treated as equal partners here. Some trainees will already know one; nobody is expected to know both. By the end they should be able to read a simple program in either language and recognise the same seven operations.");

// ============ 2. WHY TWO LANGUAGES ============
s = p.addSlide(); bg(s, WHITE);
header(s, "The industry reality", "Why you'll learn both");
card(s, 0.7, 1.85, 5.9, 4.5, PAPER);
s.addText("SAS", { x: 1.0, y: 2.1, w: 5.3, h: 0.6, fontFace: HFONT, bold: true, fontSize: 30, color: TEAL, margin: 0 });
s.addText("The established standard", { x: 1.0, y: 2.72, w: 5.3, h: 0.35, fontFace: BFONT, bold: true, italic: true, fontSize: 13.5, color: MUTED, margin: 0 });
[
  "Decades of use in regulatory submissions",
  "Commercial, licensed, formally validated",
  "Still the default at many sponsors and CROs",
  "Submission datasets are shipped as SAS transport files",
].forEach((t, i) => {
  s.addText(t, { x: 1.15, y: 3.2 + i * 0.72, w: 5.1, h: 0.65, fontFace: BFONT, fontSize: 13.5, color: INK, bullet: { code: "2022", indent: 14 }, margin: 0 });
});
card(s, 6.8, 1.85, 5.9, 4.5, INK);
s.addText("R", { x: 7.1, y: 2.1, w: 5.3, h: 0.6, fontFace: HFONT, bold: true, fontSize: 30, color: ACCENT, margin: 0 });
s.addText("The fast-growing challenger", { x: 7.1, y: 2.72, w: 5.3, h: 0.35, fontFace: BFONT, bold: true, italic: true, fontSize: 13.5, color: "9FC0C6", margin: 0 });
[
  "Free and open source",
  "Huge package ecosystem for analysis and graphics",
  "Increasingly accepted by regulators",
  "Growing use for exploration, figures, and Shiny apps",
].forEach((t, i) => {
  s.addText(t, { x: 7.25, y: 3.2 + i * 0.72, w: 5.1, h: 0.65, fontFace: BFONT, fontSize: 13.5, color: "E7F0F1", bullet: { code: "2022", indent: 14 }, margin: 0 });
});
s.addText("Most teams today use both. Being fluent in either makes you far more employable — and helps you check your own work.",
  { x: 0.7, y: 6.55, w: 12, h: 0.45, fontFace: BFONT, italic: true, fontSize: 13.5, color: TEAL, align: "center", margin: 0 });
s.addNotes("Be balanced and honest. SAS dominates historically because of validation and regulatory familiarity, and because submission datasets go as SAS transport (.xpt) files. R has grown rapidly, is free, and is increasingly used and accepted; industry groups have worked to demonstrate R-based submissions. Do not tell trainees one is 'better' — the honest answer is that teams use both, and knowing both is a career advantage. Double-programming (independent checks in the other language) is a real QC practice.");

// ============ 3. THE SAME 7 THINGS ============
s = p.addSlide(); bg(s, INK);
headerDark(s, "The mental model", "Every data task is the same seven moves");
const moves = [
  ["Read", "get data in", TEAL],
  ["Inspect", "see what you have", SEA],
  ["Filter", "keep some rows", MINT],
  ["Select", "keep some columns", ACCENT],
  ["Derive", "create new variables", TEAL],
  ["Sort", "put rows in order", SEA],
  ["Summarize", "count and aggregate", MINT],
];
let mx = 0.7;
moves.forEach((m, i) => {
  card(s, mx, 2.4, 1.68, 2.5, "16404F");
  circle(s, mx + 0.49, 2.65, 0.7, m[2], String(i + 1), m[2] === MINT ? INK : (m[2] === ACCENT ? INK : WHITE), 17);
  s.addText(m[0], { x: mx + 0.05, y: 3.45, w: 1.58, h: 0.4, align: "center", fontFace: HFONT, bold: true, fontSize: 15, color: WHITE, margin: 0 });
  s.addText(m[1], { x: mx + 0.1, y: 3.9, w: 1.48, h: 0.85, align: "center", fontFace: BFONT, fontSize: 11, color: "C7DCE0", margin: 0 });
  mx += 1.75;
});
s.addText("Learn these seven once. Then you only have to learn how each language spells them.",
  { x: 0.7, y: 5.4, w: 12, h: 0.5, fontFace: HFONT, italic: true, fontSize: 18, color: MINT, align: "center", margin: 0 });
s.addText("Building an SDTM domain is these moves, combined and repeated.",
  { x: 0.7, y: 6.1, w: 12, h: 0.4, fontFace: BFONT, fontSize: 14, color: "9FC0C6", align: "center", margin: 0 });
s.addNotes("This is the most important slide in the module. Freshers panic about syntax; reframe it as seven concepts with two spellings. Every notebook in the bootcamp is these moves in some order. Ask trainees to name which move they'd use to answer a simple question (e.g. 'how many subjects per arm?' → summarize).");

// ============ 4. ANATOMY OF A SAS PROGRAM ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Anatomy · SAS", "A SAS program is DATA steps and PROC steps");
card(s, 0.7, 1.8, 5.85, 2.15, PAPER);
s.addText("DATA step", { x: 1.0, y: 2.0, w: 5.2, h: 0.4, fontFace: HFONT, bold: true, fontSize: 20, color: TEAL, margin: 0 });
s.addText("Creates or changes a dataset. Reads one row at a time, applies your logic, writes rows out. This is where variables are built.",
  { x: 1.0, y: 2.5, w: 5.3, h: 1.3, fontFace: BFONT, fontSize: 13.5, color: INK, margin: 0 });
card(s, 6.8, 1.8, 5.9, 2.15, PAPER);
s.addText("PROC step", { x: 7.1, y: 2.0, w: 5.2, h: 0.4, fontFace: HFONT, bold: true, fontSize: 20, color: SEA, margin: 0 });
s.addText("Calls a ready-made procedure to do something with a dataset: print it, sort it, count it, summarize it.",
  { x: 7.1, y: 2.5, w: 5.3, h: 1.3, fontFace: BFONT, fontSize: 13.5, color: INK, margin: 0 });
s.addShape(p.ShapeType.roundRect, { x: 0.7, y: 4.15, w: 12.0, h: 2.35, rectRadius: 0.08, fill: { color: CODEBG }, line: { color: TEAL, width: 1.5 } });
s.addText([
  { text: "data vs_clean;                      ", options: { color: MINT } }, { text: "/* DATA step: build a dataset */\n", options: { color: "7E9AA5" } },
  { text: "    set work.vs;                    ", options: { color: "DCEBEF" } }, { text: "/* read every row of WORK.VS  */\n", options: { color: "7E9AA5" } },
  { text: "    if sysbp > 140 then flag = \"HIGH\";\n", options: { color: "DCEBEF" } },
  { text: "run;\n\n", options: { color: MINT } },
  { text: "proc freq data = vs_clean;          ", options: { color: MINT } }, { text: "/* PROC step: count it       */\n", options: { color: "7E9AA5" } },
  { text: "    tables flag;\n", options: { color: "DCEBEF" } },
  { text: "run;", options: { color: MINT } },
], { x: 1.0, y: 4.35, w: 11.5, h: 2.0, fontFace: MONO, fontSize: 13, lineSpacing: 21, margin: 0, valign: "top" });
s.addText("Every statement ends with a semicolon ;  and every step ends with run;",
  { x: 0.7, y: 6.65, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 13, color: TEAL, margin: 0 });
s.addNotes("Two building blocks. The DATA step is procedural — it loops row by row, which is unfamiliar to people from other languages but powerful. PROC steps are pre-written procedures you configure. The missing semicolon is the single most common beginner error in SAS; the log will usually point at it. Note comments are /* ... */.");

// ============ 5. ANATOMY OF AN R SCRIPT ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Anatomy · R", "An R script is a pipeline of verbs");
card(s, 0.7, 1.8, 5.85, 2.15, PAPER);
s.addText("Functions & verbs", { x: 1.0, y: 2.0, w: 5.2, h: 0.4, fontFace: HFONT, bold: true, fontSize: 20, color: ACCENT, margin: 0 });
s.addText("Each action is a function: filter(), select(), mutate(). They take a table and return a new table.",
  { x: 1.0, y: 2.5, w: 5.3, h: 1.3, fontFace: BFONT, fontSize: 13.5, color: INK, margin: 0 });
card(s, 6.8, 1.8, 5.9, 2.15, PAPER);
s.addText("The pipe  |>", { x: 7.1, y: 2.0, w: 5.2, h: 0.4, fontFace: HFONT, bold: true, fontSize: 20, color: SEA, margin: 0 });
s.addText("Sends the result on the left into the function on the right. Read it as the word “then”.",
  { x: 7.1, y: 2.5, w: 5.3, h: 1.3, fontFace: BFONT, fontSize: 13.5, color: INK, margin: 0 });
s.addShape(p.ShapeType.roundRect, { x: 0.7, y: 4.15, w: 12.0, h: 2.35, rectRadius: 0.08, fill: { color: CODEBG }, line: { color: ACCENT, width: 1.5 } });
s.addText([
  { text: "vs_clean <- vs |>                   ", options: { color: MINT } }, { text: "# take vs, THEN\n", options: { color: "7E9AA5" } },
  { text: "  mutate(\n", options: { color: "DCEBEF" } },
  { text: "    flag = if_else(SYSBP > 140, \"HIGH\", NA_character_)\n", options: { color: "DCEBEF" } },
  { text: "  )\n\n", options: { color: "DCEBEF" } },
  { text: "vs_clean |> count(flag)             ", options: { color: MINT } }, { text: "# then count it\n", options: { color: "7E9AA5" } },
], { x: 1.0, y: 4.35, w: 11.5, h: 2.0, fontFace: MONO, fontSize: 13, lineSpacing: 21, margin: 0, valign: "top" });
s.addText("<- assigns a result to a name.  # starts a comment.  No semicolons needed.",
  { x: 0.7, y: 6.65, w: 12, h: 0.4, fontFace: BFONT, italic: true, fontSize: 13, color: ACCENT, margin: 0 });
s.addNotes("R reads left to right, top to bottom through the pipe. Say 'then' aloud when reading a pipe: take vs, THEN mutate, THEN count. Note the assignment arrow <- (= also works but <- is conventional). NA_character_ is R's typed missing value for text — introduce it lightly here; the missing-values slide covers it. Mention |> is base R's pipe (R 4.1+); older code uses %>% from magrittr — they behave the same for our purposes.");

// ============ 6. SIDE BY SIDE: READ ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Side by side · 1", "Read a CSV file");
let e6 = codePair(s, 1.75,
  'proc import\n    datafile = "dm_raw.csv"\n    out  = work.dm\n    dbms = csv replace;\n    getnames = yes;\nrun;',
  'dm <- read_csv(\n  "dm_raw.csv",\n  col_types = cols(\n    SITEID = col_character()\n  )\n)',
  "Both read the same file. R lets you declare column types inline; in SAS you often fix types afterwards.");
card(s, 0.7, e6 + 0.35, 12.0, 1.5, PAPER);
s.addText([
  { text: "Watch out:  ", options: { bold: true, color: ACCENT, fontSize: 14 } },
  { text: "an ID like ", options: { color: INK, fontSize: 13.5 } },
  { text: "001", options: { fontFace: MONO, color: INK, fontSize: 13.5 } },
  { text: " looks numeric. If either tool guesses “number”, you lose the leading zeros and get ", options: { color: INK, fontSize: 13.5 } },
  { text: "1", options: { fontFace: MONO, color: INK, fontSize: 13.5 } },
  { text: ". Always check your types after reading — PROC CONTENTS in SAS, glimpse() in R.", options: { color: INK, fontSize: 13.5 } },
], { x: 1.0, y: e6 + 0.5, w: 11.4, h: 1.2, fontFace: BFONT, valign: "middle", lineSpacing: 21, margin: 0 });
s.addNotes("First of the seven moves. The key teaching point is type guessing. In SAS, PROC IMPORT scans rows and guesses; guessingrows=max makes it scan everything. In R, read_csv guesses too but col_types lets you be explicit up front. Leading-zero IDs are the classic clinical-data trap and appear immediately in our ABC-01 data.");

// ============ 7. SIDE BY SIDE: INSPECT ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Side by side · 2", "Look at what you have");
const e7 = codePair(s, 1.75,
  '/* structure: types & lengths */\nproc contents data = work.dm;\nrun;\n\n/* the rows */\nproc print data = work.dm (obs=5);\nrun;',
  '# structure: types & sample values\nglimpse(dm)\n\n# the rows\nhead(dm, 5)',
  "Always look before you map. Half of all mapping bugs are visible in the first five rows.");
const insp = [
  ["How many rows and columns?", TEAL],
  ["Which columns are text vs numbers vs dates?", SEA],
  ["Are there missing values?", ACCENT],
  ["Do the values look like what the CRF asked for?", INK],
];
let iy = e7 + 0.35;
insp.forEach((q, i) => {
  card(s, 0.7 + (i % 2) * 6.1, iy + Math.floor(i / 2) * 1.05, 5.9, 0.9, i % 2 ? WHITE : PAPER);
  circle(s, 0.95 + (i % 2) * 6.1, iy + Math.floor(i / 2) * 1.05 + 0.19, 0.52, q[1], "?", q[1] === ACCENT ? INK : WHITE, 15);
  s.addText(q[0], { x: 1.65 + (i % 2) * 6.1, y: iy + Math.floor(i / 2) * 1.05 + 0.1, w: 4.8, h: 0.7, fontFace: BFONT, fontSize: 13.5, color: INK, valign: "middle", margin: 0 });
});
s.addNotes("Inspection is a habit, not a step to skip. The four questions are what to ask every time you open an unfamiliar dataset. PROC CONTENTS and glimpse() are the direct equivalents. Encourage trainees to run these before writing any mapping code.");

// ============ 8. SIDE BY SIDE: FILTER & SELECT ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Side by side · 3", "Keep the rows and columns you want");
const e8a = codePair(s, 1.7,
  '/* rows */\ndata drugA;\n    set dm;\n    where arm = "Drug A";\nrun;',
  '# rows\ndrugA <- dm |>\n  filter(ARM == "Drug A")',
  null);
codePair(s, e8a + 0.4,
  '/* columns */\ndata small;\n    set dm;\n    keep usubjid age sex;\nrun;',
  '# columns\nsmall <- dm |>\n  select(USUBJID, AGE, SEX)',
  "Rows: WHERE ↔ filter().   Columns: KEEP ↔ select().   Note R uses == to test equality, = to name arguments.");
s.addNotes("Two of the seven moves at once. Emphasise the == vs = distinction in R, a very common beginner error. In SAS, WHERE and IF can both subset in a DATA step; WHERE is usually preferable and also works on PROCs. In R, filter() and select() are separate verbs that chain with the pipe.");

// ============ 9. SIDE BY SIDE: DERIVE ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Side by side · 4", "Create new variables (the heart of mapping)");
const e9 = codePair(s, 1.7,
  'data dm2;\n    set dm;\n    length usubjid $20 sex_c $1;\n    usubjid = catx("-", studyid,\n              put(siteid, z2.),\n              put(subjid, z3.));\n    if sex = 1 then sex_c = "M";\n    else if sex = 2 then sex_c = "F";\nrun;',
  'dm2 <- dm |>\n  mutate(\n    USUBJID = paste(STUDYID, SITEID,\n                    SUBJID, sep = "-"),\n    SEX_C = case_when(\n      SEX == 1 ~ "M",\n      SEX == 2 ~ "F",\n      TRUE ~ NA_character_\n    )\n  )',
  "This is exactly what SDTM mapping is — read raw columns, write standardized ones.   IF/THEN/ELSE ↔ case_when()   ·   catx() ↔ paste()");
card(s, 0.7, e9 + 0.28, 12.0, 1.35, PAPER);
s.addText([
  { text: "Why declare length in SAS?  ", options: { bold: true, color: TEAL, fontSize: 14 } },
  { text: "If you assign text without a LENGTH statement, SAS fixes the width from the first value it sees and silently truncates longer ones. R has no such trap — character vectors size themselves.", options: { color: INK, fontSize: 13.5 } },
], { x: 1.0, y: e9 + 0.42, w: 11.4, h: 1.05, fontFace: BFONT, valign: "middle", lineSpacing: 21, margin: 0 });
s.addNotes("The most important comparison in the deck — every domain build is this pattern. Walk through both sides slowly. SAS: LENGTH first, then assignment, then IF/THEN/ELSE. R: one mutate() with several new columns, case_when() for multi-way logic with a TRUE catch-all. The silent truncation warning is a real bug source: a USUBJID declared too short gets cut off with no error.");

// ============ 10. SIDE BY SIDE: SORT & SUMMARIZE ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Side by side · 5", "Sort, count, and summarize");
const e10a = codePair(s, 1.7,
  'proc sort data = dm out = dm_s;\n    by siteid subjid;\nrun;',
  'dm_s <- dm |>\n  arrange(SITEID, SUBJID)',
  null);
codePair(s, e10a + 0.35,
  '/* counts */\nproc freq data = dm;\n    tables arm;\nrun;\n\n/* numbers */\nproc means data = vs mean;\n    class visit;\n    var weight;\nrun;',
  '# counts\ndm |> count(ARM)\n\n# numbers\nvs |>\n  group_by(VISIT) |>\n  summarise(\n    mean_wt = mean(WEIGHT)\n  )',
  "PROC FREQ is for categories; PROC MEANS is for numbers. In R, count() and group_by() + summarise() do the same jobs.");
s.addNotes("Sorting matters more in SAS than R: SAS MERGE requires sorted inputs, and --SEQ derivation depends on order. In R, joins do not require sorting. PROC FREQ vs PROC MEANS is a common early confusion — categories vs continuous numbers. group_by() + summarise() is the general R pattern for 'per group' calculations.");

// ============ 11. SIDE BY SIDE: COMBINE ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Side by side · 6", "Combining datasets");
const e11 = codePair(s, 1.7,
  '/* must be sorted first! */\nproc sort data = dm;  by usubjid; run;\nproc sort data = ex;  by usubjid; run;\n\ndata dm_ex;\n    merge dm (in = a) ex;\n    by usubjid;\n    if a;              /* keep DM rows */\nrun;',
  '# no sorting required\ndm_ex <- dm |>\n  left_join(ex, by = "USUBJID")',
  "Same result, very different ceremony. SAS MERGE needs sorted inputs; R joins do not.");
card(s, 0.7, e11 + 0.3, 12.0, 1.65, INK);
s.addText("Joining is how a subject's data gets assembled", { x: 1.0, y: e11 + 0.45, w: 11.4, h: 0.4, fontFace: BFONT, bold: true, fontSize: 15, color: MINT, margin: 0 });
s.addText("You'll join constantly: attaching the reference start date from EX onto VS to compute study day, or pulling treatment arm from DM onto every other domain. USUBJID is almost always the key.",
  { x: 1.0, y: e11 + 0.85, w: 11.4, h: 1.0, fontFace: BFONT, fontSize: 13.5, color: "C7DCE0", margin: 0 });
s.addNotes("Joins deserve their own slide because they behave so differently. SAS MERGE with BY requires both datasets sorted by the key — forgetting this is a classic error (SAS will complain). The IN= dataset option flags which source contributed a row, used here to keep only DM rows, equivalent to a left join. R's left_join is declarative and needs no sorting. Preview the real use case: deriving study day needs the reference date joined on.");

// ============ 12. ROSETTA STONE ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Cheat sheet", "The Rosetta Stone");
const ros = [
  ["Read a CSV", "PROC IMPORT", "read_csv()"],
  ["See structure", "PROC CONTENTS", "glimpse()"],
  ["See rows", "PROC PRINT", "head() / print"],
  ["Keep rows", "WHERE / IF", "filter()"],
  ["Keep columns", "KEEP / DROP", "select()"],
  ["New variable", "DATA step assignment", "mutate()"],
  ["Multi-way logic", "IF / THEN / ELSE", "case_when()"],
  ["Sort", "PROC SORT", "arrange()"],
  ["Count categories", "PROC FREQ", "count()"],
  ["Summarize numbers", "PROC MEANS", "group_by() + summarise()"],
  ["Join datasets", "MERGE ... BY", "left_join()"],
  ["Stack datasets", "SET a b;", "bind_rows()"],
];
const tbl = [[
  { text: "You want to…", options: { bold: true, color: WHITE, fill: { color: INK }, fontFace: BFONT, fontSize: 13 } },
  { text: "SAS", options: { bold: true, color: WHITE, fill: { color: TEAL }, fontFace: BFONT, fontSize: 13 } },
  { text: "R (tidyverse)", options: { bold: true, color: WHITE, fill: { color: ACCENT }, fontFace: BFONT, fontSize: 13 } },
]];
ros.forEach((r, i) => {
  const fill = i % 2 ? PAPER : WHITE;
  tbl.push([
    { text: r[0], options: { color: INK, fill: { color: fill }, fontFace: BFONT, fontSize: 12.5, bold: true } },
    { text: r[1], options: { color: TEAL, fill: { color: fill }, fontFace: MONO, fontSize: 12 } },
    { text: r[2], options: { color: "B5651A", fill: { color: fill }, fontFace: MONO, fontSize: 12 } },
  ]);
});
s.addTable(tbl, { x: 0.7, y: 1.7, w: 12.0, colW: [4.0, 4.0, 4.0], rowH: 0.4,
  border: { type: "solid", color: LINE, pt: 1 }, valign: "middle", margin: [2, 8, 2, 8] });
s.addNotes("The keep-it-open reference. Do not read it aloud line by line; point out that it is the seven moves plus joins and stacking. Tell trainees this table is reproduced in both Notebook 01 walkthroughs so they always have it beside the code.");

// ============ 13. DATA STRUCTURES ============
s = p.addSlide(); bg(s, INK);
headerDark(s, "Same idea, different names", "Where your data lives");
const struct = [
  ["A table of data", "dataset", "data frame / tibble"],
  ["A place to store tables", "library (LIBNAME)", "your R environment / files"],
  ["Temporary scratch space", "WORK library", "objects in the session"],
  ["Add-on functionality", "SAS procedures (built in)", "packages (install.packages)"],
  ["A missing number", ".  (a single dot)", "NA"],
  ["A missing text value", '"" (empty string)', "NA_character_"],
];
const t2 = [[
  { text: "Concept", options: { bold: true, color: INK, fill: { color: MINT }, fontFace: BFONT, fontSize: 13 } },
  { text: "SAS", options: { bold: true, color: WHITE, fill: { color: TEAL }, fontFace: BFONT, fontSize: 13 } },
  { text: "R", options: { bold: true, color: WHITE, fill: { color: ACCENT }, fontFace: BFONT, fontSize: 13 } },
]];
struct.forEach((r, i) => {
  const fill = i % 2 ? "16404F" : "13323F";
  t2.push([
    { text: r[0], options: { color: WHITE, fill: { color: fill }, fontFace: BFONT, fontSize: 13, bold: true } },
    { text: r[1], options: { color: MINT, fill: { color: fill }, fontFace: MONO, fontSize: 12.5 } },
    { text: r[2], options: { color: "F0B27A", fill: { color: fill }, fontFace: MONO, fontSize: 12.5 } },
  ]);
});
s.addTable(t2, { x: 0.7, y: 2.15, w: 12.0, colW: [4.0, 4.0, 4.0], rowH: 0.62,
  border: { type: "solid", color: "2A5566", pt: 1 }, valign: "middle", margin: [2, 8, 2, 8] });
s.addText("Missing values are the #1 cross-language gotcha — never treat a missing value as zero or as blank text.",
  { x: 0.7, y: 6.5, w: 12, h: 0.45, fontFace: BFONT, italic: true, fontSize: 14, color: MINT, margin: 0 });
s.addNotes("Vocabulary mapping. Emphasise missing values: SAS uses a dot for missing numerics and an empty string for missing character values; R uses NA, with typed variants like NA_character_. In R, most calculations return NA if any input is NA unless you pass na.rm = TRUE — a frequent surprise. In SAS, a missing numeric sorts as smaller than any number, which can silently affect comparisons.");

// ============ 14. GOTCHAS ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Save yourself hours", "Cross-language gotchas");
const got = [
  ["Case sensitivity", "R is case-sensitive: AGE and age are different. SAS variable names are not."],
  ["Equality test", "R uses == to compare, = to name arguments. SAS uses = for both."],
  ["Missing in maths", "In R, mean(x) is NA if any value is missing — use na.rm = TRUE."],
  ["Sorting before merge", "SAS MERGE requires sorted inputs. R joins do not."],
  ["Text length", "SAS truncates text silently if LENGTH is too short. Declare it first."],
  ["Dates", "Both store dates as numbers under the hood, but SDTM wants ISO 8601 text."],
];
got.forEach((g, i) => {
  const x = 0.7 + (i % 2) * 6.1, y = 1.85 + Math.floor(i / 2) * 1.6;
  card(s, x, y, 5.9, 1.45, i % 2 ? WHITE : PAPER);
  circle(s, x + 0.25, y + 0.42, 0.6, ACCENT, "!", INK, 17);
  s.addText([{ text: g[0] + "\n", options: { bold: true, fontSize: 14.5, color: INK } },
             { text: g[1], options: { fontSize: 12, color: MUTED } }],
    { x: x + 1.05, y: y + 0.18, w: 4.7, h: 1.1, fontFace: BFONT, valign: "middle", margin: 0 });
});
s.addNotes("These six account for a large share of early frustration. The dates point is a preview: both languages have internal date types, but SDTM requires ISO 8601 character values (YYYY-MM-DD), so there is always a conversion step. We handle that properly in the domain-building notebooks.");

// ============ 15. HOW YOU'LL RUN IT ============
s = p.addSlide(); bg(s, WHITE);
header(s, "Setup", "How you'll run each language");
card(s, 0.7, 1.9, 5.9, 4.3, PAPER);
s.addText("SAS", { x: 1.0, y: 2.15, w: 5.3, h: 0.55, fontFace: HFONT, bold: true, fontSize: 26, color: TEAL, margin: 0 });
[
  ["Where", "SAS Studio / SAS OnDemand for Academics, or an installed SAS session at your company."],
  ["You write", "a .sas program file"],
  ["You get", "a LOG (messages and errors) and OUTPUT (results). Read the log first — always."],
].forEach((t, i) => {
  s.addText([{ text: t[0] + "  ", options: { bold: true, color: TEAL, fontSize: 13.5 } }, { text: t[1], options: { color: INK, fontSize: 13 } }],
    { x: 1.0, y: 2.85 + i * 1.05, w: 5.3, h: 0.95, fontFace: BFONT, valign: "top", lineSpacing: 20, margin: 0 });
});
card(s, 6.8, 1.9, 5.9, 4.3, INK);
s.addText("R", { x: 7.1, y: 2.15, w: 5.3, h: 0.55, fontFace: HFONT, bold: true, fontSize: 26, color: ACCENT, margin: 0 });
[
  ["Where", "RStudio or a Jupyter notebook with the R kernel."],
  ["You write", "an .R script or an .ipynb notebook"],
  ["You get", "results printed in the console or under each cell. Errors appear in red."],
].forEach((t, i) => {
  s.addText([{ text: t[0] + "  ", options: { bold: true, color: ACCENT, fontSize: 13.5 } }, { text: t[1], options: { color: "E7F0F1", fontSize: 13 } }],
    { x: 7.1, y: 2.85 + i * 1.05, w: 5.3, h: 0.95, fontFace: BFONT, valign: "top", lineSpacing: 20, margin: 0 });
});
s.addText("In this bootcamp: SAS exercises are .sas scripts with a written walkthrough; R exercises are Jupyter notebooks.",
  { x: 0.7, y: 6.4, w: 12, h: 0.45, fontFace: BFONT, italic: true, fontSize: 13.5, color: TEAL, align: "center", margin: 0 });
s.addNotes("Practical setup. Stress reading the SAS log: SAS often produces output even when something went wrong, so the log is the source of truth — look for ERROR, WARNING, and NOTE lines, especially notes about uninitialized variables or truncation. In R, errors stop execution and print in red. Tell trainees which environment your organisation provides so they can follow along.");

// ============ 16. WHAT'S NEXT ============
s = p.addSlide(); bg(s, INK);
s.addShape(p.ShapeType.ellipse, { x: 10.2, y: 4.6, w: 5.0, h: 5.0, fill: { color: "133B4C" }, line: { type: "none" } });
s.addShape(p.ShapeType.ellipse, { x: 11.2, y: 5.6, w: 3.0, h: 3.0, fill: { color: TEAL }, line: { type: "none" } });
s.addText("WHAT'S NEXT", { x: 0.7, y: 1.5, w: 11, h: 0.35, fontFace: BFONT, bold: true, fontSize: 13, color: MINT, charSpacing: 2, margin: 0 });
s.addText("Time to write some code", { x: 0.66, y: 1.9, w: 11.5, h: 0.8, fontFace: HFONT, bold: true, fontSize: 34, color: WHITE, margin: 0 });
const nn = [
  ["Notebook 01 · SAS", "SAS basics — libraries, DATA step, PROC PRINT/SORT/FREQ/MEANS"],
  ["Notebook 01 · R", "R & tidyverse basics — the same seven moves"],
  ["Both use", "the ABC-01 mock data you already have in /data"],
  ["Then Module 04", "Reading raw clinical data properly — and your first domain"],
];
let nyy = 3.1;
nn.forEach((n, i) => {
  circle(s, 0.7, nyy, 0.62, [TEAL, ACCENT, MINT, SEA][i], String(i + 1), i === 2 ? INK : (i === 1 ? INK : WHITE), 17);
  s.addText([{ text: n[0] + "   ", options: { bold: true, fontSize: 16, color: WHITE } },
             { text: n[1], options: { fontSize: 13.5, color: "C7DCE0" } }],
    { x: 1.55, y: nyy - 0.02, w: 10.8, h: 0.66, fontFace: BFONT, valign: "middle", margin: 0 });
  nyy += 0.9;
});
s.addText("Do both. Even if you already know one language, writing the other version is the fastest way to really learn it.",
  { x: 0.7, y: 6.7, w: 11.5, h: 0.5, fontFace: BFONT, italic: true, fontSize: 14, color: MINT, margin: 0 });
s.addNotes("Close and hand off to the notebooks. Encourage trainees who already know SAS to do the R notebook properly, and vice versa — the parallel structure is designed so the familiar language teaches them the unfamiliar one. End of Module 03.");

p.writeFile({ fileName: "/Volumes/D Drive/SDTM Training/Bootcamp/presentations/03_sas_r_toolkit.pptx" })
  .then(f => console.log("WROTE", f))
  .catch(e => { console.error(e); process.exit(1); });
