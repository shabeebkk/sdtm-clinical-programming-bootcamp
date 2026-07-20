#!/usr/bin/env python3
"""
build_sample_crf_pdf.py — sample EDC-style Case Report Form for study ABC-01.

Produces ABC-01_Sample_CRF.pdf with two parts:
  PART 1  Blank CRF          — the forms as a site would see them in an EDC system
  PART 2  Annotated CRF (aCRF) — the same forms marked up with SDTM variable names

The layout follows the conventions common to modern EDC systems (form header block,
log vs. visit forms, coded single-select fields, DD-MMM-YYYY date entry, units shown
beside numeric fields). It is a SYNTHETIC TRAINING ARTIFACT and is not affiliated
with, endorsed by, or a reproduction of any EDC vendor's product.

Run: python3 build_sample_crf_pdf.py
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "ABC-01_Sample_CRF.pdf")

# ---- palette (matches the bootcamp decks) ----
INK    = HexColor("#0F2E3D")
TEAL   = HexColor("#0E7C86")
ACCENT = HexColor("#E8833A")   # SDTM annotations
PAPER  = HexColor("#F3F7F8")
LINE   = HexColor("#B9CDD3")
MUTED  = HexColor("#5A7682")
FIELD  = HexColor("#FBFDFD")

W, H = A4                       # 595 x 842 pt
ML, MR = 18 * mm, 18 * mm       # margins
CW = W - ML - MR                # content width

STUDY = "ABC-01"
PROTOCOL = "A Phase 2, Randomized, Double-Blind Study of Drug A vs Placebo"

c = canvas.Canvas(OUT, pagesize=A4)
c.setTitle("ABC-01 Sample Case Report Form (synthetic training artifact)")
c.setAuthor("Clinical Programming Bootcamp")
c.setSubject("Sample EDC-style CRF with SDTM annotations")

state = {"page": 0, "annotated": False}


# ---------------------------------------------------------------- chrome
def page_header(form_name, form_id, visit_line):
    """Top banner + subject/visit identification block present on every EDC form."""
    y = H - 14 * mm
    # banner
    c.setFillColor(INK)
    c.rect(ML, y - 9 * mm, CW, 9 * mm, stroke=0, fill=1)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(ML + 3 * mm, y - 6 * mm, f"{STUDY}  ·  ELECTRONIC CASE REPORT FORM")
    c.setFont("Helvetica", 8)
    label = "ANNOTATED (aCRF)" if state["annotated"] else "BLANK CRF"
    c.drawRightString(ML + CW - 3 * mm, y - 6 * mm, label)

    # form title strip
    y -= 9 * mm
    c.setFillColor(PAPER)
    c.rect(ML, y - 10 * mm, CW, 10 * mm, stroke=0, fill=1)
    c.setStrokeColor(LINE); c.setLineWidth(0.6)
    c.rect(ML, y - 10 * mm, CW, 10 * mm, stroke=1, fill=0)
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 12)
    c.drawString(ML + 3 * mm, y - 7 * mm, form_name)
    c.setFillColor(MUTED); c.setFont("Helvetica", 7.5)
    c.drawRightString(ML + CW - 3 * mm, y - 7 * mm, f"Form ID: {form_id}   |   Version 1.0")

    # subject identification block
    y -= 10 * mm
    bh = 12 * mm
    c.setStrokeColor(LINE); c.rect(ML, y - bh, CW, bh, stroke=1, fill=0)
    cells = [("Site No.", "___ ___"), ("Subject No.", "___ ___ ___"),
             ("Subject Initials", "___ ___ ___"), ("Visit", visit_line)]
    cw = CW / len(cells)
    for i, (lab, val) in enumerate(cells):
        x = ML + i * cw
        if i:
            c.setStrokeColor(LINE); c.line(x, y - bh, x, y)
        c.setFillColor(MUTED); c.setFont("Helvetica", 7)
        c.drawString(x + 2.5 * mm, y - 4.5 * mm, lab.upper())
        # auto-fit: shrink the value until it fits inside its cell (visit names get long)
        avail = cw - 5 * mm
        size = 9
        while size > 5.5 and c.stringWidth(val, "Helvetica-Bold", size) > avail:
            size -= 0.5
        c.setFillColor(INK); c.setFont("Helvetica-Bold", size)
        c.drawString(x + 2.5 * mm, y - 9 * mm, val)
    y -= bh
    # annotate the identification block — these fields appear on EVERY form and are
    # what USUBJID is built from, so a real aCRF marks them up once per page.
    if state["annotated"]:
        c.setFillColor(HexColor("#FDF1E7")); c.setStrokeColor(ACCENT); c.setLineWidth(0.6)
        c.rect(ML, y - 5 * mm, CW, 5 * mm, stroke=1, fill=1)
        c.setFillColor(HexColor("#B5651A")); c.setFont("Helvetica-Bold", 6.5)
        anns = ["DM.SITEID", "DM.SUBJID  ➜  builds USUBJID", "(not submitted)", "VISIT / VISITNUM"]
        for i, a in enumerate(anns):
            c.drawString(ML + i * cw + 2.5 * mm, y - 3.4 * mm, a)
        y -= 5 * mm
    return y - 7 * mm


def page_footer(note=None):
    state["page"] += 1
    # annotation note sits ABOVE the footer rule so it can never collide with it
    if note:
        c.setFillColor(ACCENT); c.setFont("Helvetica-Oblique", 7)
        c.drawRightString(ML + CW, 18 * mm, note)
    c.setStrokeColor(LINE); c.setLineWidth(0.5)
    c.line(ML, 15 * mm, ML + CW, 15 * mm)
    c.setFillColor(MUTED); c.setFont("Helvetica", 6.5)
    c.drawString(ML, 11 * mm, "SYNTHETIC TRAINING ARTIFACT — not affiliated with or produced by any EDC vendor. "
                              "Contains no real patient data.")
    c.drawString(ML, 8 * mm, f"{STUDY}  ·  {PROTOCOL}")
    c.drawRightString(ML + CW, 11 * mm, f"Page {state['page']}")
    c.showPage()


# ---------------------------------------------------------------- widgets
def annot(x, y, text, w=None):
    """SDTM annotation bubble (only drawn on aCRF pages)."""
    if not state["annotated"] or not text:
        return
    c.setFont("Helvetica-Bold", 6.8)
    tw = c.stringWidth(text, "Helvetica-Bold", 6.8) + 4 * mm
    w = w or tw
    c.setFillColor(HexColor("#FDF1E7")); c.setStrokeColor(ACCENT); c.setLineWidth(0.6)
    c.roundRect(x, y - 1.2 * mm, w, 4.6 * mm, 1.2 * mm, stroke=1, fill=1)
    c.setFillColor(HexColor("#B5651A"))
    c.drawString(x + 2 * mm, y + 0.2 * mm, text)


def field(x, y, label, width, hint="", sdtm="", boxh=6.5 * mm):
    """Labelled entry box. Returns the y below the field."""
    c.setFillColor(INK); c.setFont("Helvetica", 8)
    c.drawString(x, y, label)
    by = y - boxh - 1.5 * mm
    c.setFillColor(FIELD); c.setStrokeColor(LINE); c.setLineWidth(0.7)
    c.rect(x, by, width, boxh, stroke=1, fill=1)
    if hint:
        c.setFillColor(HexColor("#9FB4BB")); c.setFont("Helvetica-Oblique", 7)
        c.drawString(x + 2 * mm, by + 2.2 * mm, hint)
    annot(x + width + 2.5 * mm, by + 1.2 * mm, sdtm)
    return by


def choices(x, y, label, options, sdtm="", per_row=None, codes=False):
    """Single-select radio group, EDC style.
    codes=True shows the [n] value under each option — use ONLY where the raw
    extract actually stores the code rather than the label."""
    c.setFillColor(INK); c.setFont("Helvetica", 8)
    c.drawString(x, y, label)
    yy = y - 6 * mm
    xx = x
    per_row = per_row or len(options)
    widest = 0
    for i, (code, text) in enumerate(options):
        if i and i % per_row == 0:
            yy -= 6 * mm; xx = x
        c.setStrokeColor(LINE); c.setFillColor(white); c.setLineWidth(0.7)
        c.circle(xx + 1.6 * mm, yy + 1.1 * mm, 1.6 * mm, stroke=1, fill=1)
        c.setFillColor(INK); c.setFont("Helvetica", 8)
        lbl = f"{text}" if code is None else f"{text}"
        c.drawString(xx + 5 * mm, yy, lbl)
        if codes and code is not None:
            c.setFillColor(MUTED); c.setFont("Helvetica", 6.5)
            c.drawString(xx + 5 * mm, yy - 3 * mm, f"[{code}]")
        step = c.stringWidth(lbl, "Helvetica", 8) + 13 * mm
        widest = max(widest, xx + step - x)
        xx += step
    annot(x + widest + 2 * mm, yy, sdtm)
    # leave room for the [code] captions only when they are drawn
    return yy - (10 if codes else 7) * mm


def section(x, y, text):
    y -= 4 * mm                      # breathing room above every section heading
    c.setFillColor(TEAL); c.setFont("Helvetica-Bold", 8.5)
    c.drawString(x, y, text.upper())
    c.setStrokeColor(TEAL); c.setLineWidth(0.8)
    c.line(x, y - 1.8 * mm, x + CW, y - 1.8 * mm)
    return y - 8 * mm


def instruction(x, y, text):
    c.setFillColor(MUTED); c.setFont("Helvetica-Oblique", 7.5)
    c.drawString(x, y, text)
    return y - 5 * mm


def log_table(x, y, cols, nrows, sdtm_row=None, rowh=9 * mm):
    """Repeating 'log' grid used for AE / CM forms."""
    total = sum(w for _, w in cols)
    # header
    c.setFillColor(INK); c.rect(x, y - 7 * mm, total, 7 * mm, stroke=0, fill=1)
    cx = x
    for name, w in cols:
        c.setFillColor(white); c.setFont("Helvetica-Bold", 7)
        for j, line in enumerate(name.split("\n")):
            c.drawString(cx + 1.5 * mm, y - 3.2 * mm - j * 3 * mm, line)
        cx += w
    # SDTM annotation row directly under the header
    y -= 7 * mm
    if state["annotated"] and sdtm_row:
        c.setFillColor(HexColor("#FDF1E7")); c.rect(x, y - 5 * mm, total, 5 * mm, stroke=0, fill=1)
        cx = x
        for (name, w), ann in zip(cols, sdtm_row):
            if ann:
                c.setFillColor(HexColor("#B5651A")); c.setFont("Helvetica-Bold", 6.5)
                c.drawString(cx + 1.5 * mm, y - 3.4 * mm, ann)
            cx += w
        y -= 5 * mm
    # body rows
    for r in range(nrows):
        c.setFillColor(FIELD if r % 2 == 0 else white)
        c.rect(x, y - rowh, total, rowh, stroke=0, fill=1)
        c.setStrokeColor(LINE); c.setLineWidth(0.6)
        c.rect(x, y - rowh, total, rowh, stroke=1, fill=0)
        cx = x
        for i, (_, w) in enumerate(cols):
            if i:
                c.line(cx, y - rowh, cx, y)
            cx += w
        c.setFillColor(HexColor("#C6D6DB")); c.setFont("Helvetica", 7)
        c.drawString(x + 1.5 * mm, y - rowh + 3 * mm, str(r + 1))
        y -= rowh
    return y - 4 * mm


# ================================================================ COVER
def cover():
    c.setFillColor(INK); c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(HexColor("#133B4C")); c.circle(W - 20 * mm, H - 20 * mm, 45 * mm, stroke=0, fill=1)
    c.setFillColor(TEAL); c.circle(W - 12 * mm, H - 12 * mm, 24 * mm, stroke=0, fill=1)
    c.setFillColor(ACCENT); c.circle(W - 6 * mm, H - 6 * mm, 11 * mm, stroke=0, fill=1)

    c.setFillColor(HexColor("#6FC8B4")); c.setFont("Helvetica-Bold", 9)
    c.drawString(ML, H - 90 * mm, "CLINICAL PROGRAMMING BOOTCAMP  ·  SAMPLE ARTIFACT")
    c.setFillColor(white); c.setFont("Helvetica-Bold", 26)
    c.drawString(ML, H - 104 * mm, "Sample Case Report Form")
    c.setFillColor(HexColor("#6FC8B4")); c.setFont("Helvetica", 15)
    c.drawString(ML, H - 116 * mm, "and Annotated CRF (aCRF)")

    c.setFillColor(HexColor("#C7DCE0")); c.setFont("Helvetica", 10)
    c.drawString(ML, H - 132 * mm, f"Study {STUDY}")
    c.setFont("Helvetica", 9)
    c.drawString(ML, H - 139 * mm, PROTOCOL)

    y = H - 158 * mm
    c.setFillColor(white); c.setFont("Helvetica-Bold", 11)
    c.drawString(ML, y, "What's inside")
    y -= 8 * mm
    for n, (t, d) in enumerate([
        ("PART 1 — Blank CRF", "The forms as a site sees them: Demographics, Vital Signs, Study Drug, Adverse Events, Concomitant Meds, Laboratory, Disposition."),
        ("PART 2 — Annotated CRF (aCRF)", "The same forms marked up in orange with the SDTM variable each field maps to."),
    ], start=1):
        c.setFillColor(ACCENT); c.setFont("Helvetica-Bold", 9.5)
        c.drawString(ML, y, t)
        c.setFillColor(HexColor("#C7DCE0")); c.setFont("Helvetica", 8.5)
        for line in wrap(d, 95):
            y -= 5 * mm
            c.drawString(ML, y, line)
        y -= 9 * mm

    c.setFillColor(HexColor("#9FC0C6")); c.setFont("Helvetica", 8)
    y -= 2 * mm
    for line in wrap("The annotated CRF is a real submission deliverable: it ships alongside the datasets and "
                     "Define-XML so a reviewer can trace any SDTM variable back to the exact question that "
                     "collected it. Annotations here match data/mapping_specification.md.", 100):
        c.drawString(ML, y, line); y -= 4.6 * mm

    # disclaimer box
    c.setFillColor(HexColor("#16404F")); c.setStrokeColor(ACCENT); c.setLineWidth(1)
    c.roundRect(ML, 24 * mm, CW, 26 * mm, 2 * mm, stroke=1, fill=1)
    c.setFillColor(ACCENT); c.setFont("Helvetica-Bold", 8.5)
    c.drawString(ML + 4 * mm, 44 * mm, "SYNTHETIC TRAINING ARTIFACT")
    c.setFillColor(HexColor("#C7DCE0")); c.setFont("Helvetica", 7.5)
    yy = 39 * mm
    for line in wrap("All data, subjects, sites and products are fictional. This form illustrates layout "
                     "conventions common to modern EDC systems; it is not affiliated with, endorsed by, or a "
                     "reproduction of any vendor's product. Do not use for an actual clinical trial.", 108):
        c.drawString(ML + 4 * mm, yy, line); yy -= 4.2 * mm
    c.showPage(); state["page"] += 1


def wrap(text, n):
    words, lines, cur = text.split(), [], ""
    for w in words:
        if len(cur) + len(w) + 1 <= n:
            cur = f"{cur} {w}".strip()
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines


def part_divider(title, subtitle, body):
    c.setFillColor(INK); c.rect(0, H / 2 - 42 * mm, W, 84 * mm, stroke=0, fill=1)
    c.setFillColor(HexColor("#6FC8B4")); c.setFont("Helvetica-Bold", 10)
    c.drawString(ML, H / 2 + 22 * mm, title.upper())
    c.setFillColor(white); c.setFont("Helvetica-Bold", 22)
    c.drawString(ML, H / 2 + 8 * mm, subtitle)
    c.setFillColor(HexColor("#C7DCE0")); c.setFont("Helvetica", 9.5)
    y = H / 2 - 4 * mm
    for line in wrap(body, 92):
        c.drawString(ML, y, line); y -= 5.4 * mm
    # carry the disclaimer onto divider pages too, so every page of the PDF states it
    c.setFillColor(MUTED); c.setFont("Helvetica", 6.5)
    c.drawString(ML, 11 * mm, "SYNTHETIC TRAINING ARTIFACT — not affiliated with or produced by any EDC vendor. "
                              "Contains no real patient data.")
    c.showPage(); state["page"] += 1


# ================================================================ FORMS
def form_demographics():
    y = page_header("Demographics", "DM_01", "SCREENING")
    y = instruction(ML, y, "Complete at the Screening visit, after informed consent has been obtained.")
    y = section(ML, y, "Informed consent")
    y = field(ML, y, "Date informed consent signed", 45 * mm, "DD-MMM-YYYY",
              "DM.RFICDTC  ➜  also DS milestone (DSDECOD = INFORMED CONSENT OBTAINED)") - 8 * mm

    y = section(ML, y, "Subject characteristics")
    y = field(ML, y, "Date of birth", 45 * mm, "DD-MMM-YYYY", "DM.BRTHDTC → derive DM.AGE / DM.AGEU") - 8 * mm
    y = choices(ML, y, "Sex", [("1", "Male"), ("2", "Female")], "DM.SEX", codes=True)
    y = choices(ML, y, "Race", [("1", "White"), ("2", "Asian"), ("3", "Black or African American"),
                                ("4", "American Indian or Alaska Native"),
                                ("5", "Native Hawaiian or Other Pacific Islander"),
                                ("6", "Other")], "DM.RACE", per_row=2)
    y = choices(ML, y, "Ethnicity", [("1", "Hispanic or Latino"), ("2", "Not Hispanic or Latino"),
                                     ("3", "Unknown")], "DM.ETHNIC")
    y = field(ML, y, "Country of enrolment", 45 * mm, "ISO 3166 alpha-3", "DM.COUNTRY") - 8 * mm

    y = section(ML, y, "Randomization")
    y = field(ML, y, "Date of randomization", 45 * mm, "DD-MMM-YYYY",
              "DS.DSSTDTC  (DSDECOD = RANDOMIZED, DSCAT = PROTOCOL MILESTONE)") - 8 * mm
    y = choices(ML, y, "Treatment arm assigned", [("A", "Drug A 50 mg"), ("P", "Placebo")],
                "DM.ARM / DM.ARMCD  (also ACTARM / ACTARMCD)")

    y = instruction(ML, y, "End-of-study information is NOT collected here — it is recorded on the "
                           "Disposition form when the subject leaves the study.")
    page_footer("DM.RFSTDTC / RFENDTC come from the Study Drug form; DM.RFPENDTC from the Disposition form"
                if state["annotated"] else None)


def form_disposition():
    y = page_header("Disposition / Study Completion", "DS_01", "END OF STUDY")
    y = instruction(ML, y, "Complete when the subject leaves the study, whether they completed it or not.")

    y = section(ML, y, "Study completion status")
    y = choices(ML, y, "Did the subject complete the study?",
                [("1", "Completed"), ("2", "Discontinued early")],
                "DS.DSTERM / DS.DSDECOD   (DSCAT = DISPOSITION EVENT)")
    y = field(ML, y, "Date of study completion / discontinuation", 55 * mm, "DD-MMM-YYYY",
              "DS.DSSTDTC → DS.DSSTDY  ·  also DM.RFPENDTC") - 8 * mm

    y = section(ML, y, "Primary reason for discontinuation")
    y = instruction(ML, y, "Complete only if the subject discontinued early. Select one primary reason.")
    y = choices(ML, y, "Reason", [("1", "Adverse event"), ("2", "Withdrawal by subject"),
                                  ("3", "Lack of efficacy"), ("4", "Lost to follow-up"),
                                  ("5", "Physician decision"), ("6", "Other")],
                "DS.DSDECOD", per_row=2)
    y = field(ML, y, "If Other, specify", 90 * mm, "", "DS.DSTERM (verbatim)") - 8 * mm

    y = section(ML, y, "Protocol milestones")
    y = instruction(ML, y, "For reference — these dates are captured on the Demographics form at enrolment.")
    if state["annotated"]:
        c.setFillColor(HexColor("#B5651A")); c.setFont("Helvetica-Oblique", 7.5)
        for line in wrap("Informed consent and randomization each become their OWN DS record with "
                         "DSCAT = PROTOCOL MILESTONE (DSDECOD = INFORMED CONSENT OBTAINED / RANDOMIZED). "
                         "So the consent date appears in BOTH DM.RFICDTC and DS — that is expected, not a duplicate.", 118):
            c.drawString(ML, y, line); y -= 4.4 * mm
    page_footer("3 DS records per subject: 2 milestones + 1 disposition event"
                if state["annotated"] else None)


def form_vitals():
    y = page_header("Vital Signs", "VS_01", "SCREENING / BASELINE / WEEK 4")
    y = instruction(ML, y, "Record after the subject has been seated and at rest for at least 5 minutes.")
    y = field(ML, y, "Date of assessment", 45 * mm, "DD-MMM-YYYY", "VS.VSDTC → derive VS.VSDY") - 10 * mm

    y = section(ML, y, "Measurements")
    if state["annotated"]:
        c.setFillColor(HexColor("#B5651A")); c.setFont("Helvetica-Oblique", 7)
        c.drawString(ML, y + 3 * mm, "Each row below becomes ONE ROW in SDTM VS "
                                     "(VSTESTCD / VSTEST / VSORRES / VSORRESU) — the wide-to-tall transpose.")
        y -= 3 * mm

    rows = [("Systolic blood pressure", "mmHg", "SYSBP", "Systolic Blood Pressure"),
            ("Diastolic blood pressure", "mmHg", "DIABP", "Diastolic Blood Pressure"),
            ("Pulse rate", "beats/min", "PULSE", "Pulse Rate"),
            ("Temperature", "C", "TEMP", "Temperature"),
            ("Height  (screening only)", "cm", "HEIGHT", "Height"),
            ("Weight", "kg", "WEIGHT", "Weight")]
    for lab, unit, tc, tn in rows:
        c.setFillColor(INK); c.setFont("Helvetica", 8.5)
        c.drawString(ML, y, lab)
        bx = ML + 62 * mm
        c.setFillColor(FIELD); c.setStrokeColor(LINE); c.setLineWidth(0.7)
        c.rect(bx, y - 2 * mm, 28 * mm, 6.5 * mm, stroke=1, fill=1)
        c.setFillColor(MUTED); c.setFont("Helvetica", 7.5)
        c.drawString(bx + 30 * mm, y, unit)
        annot(bx + 44 * mm, y - 0.8 * mm, f"VSTESTCD = {tc}")
        y -= 11 * mm

    y -= 2 * mm
    y = section(ML, y, "Not done")
    y = choices(ML, y, "Were any assessments not performed?",
                [("Y", "Yes — specify below"), ("N", "No")], "→ VS.VSSTAT / VSREASND", codes=True)
    page_footer("Blank rows are NOT zero — an unmeasured value stays null in SDTM"
                if state["annotated"] else None)


def form_exposure():
    y = page_header("Study Drug Administration", "EX_01", "TREATMENT PERIOD")
    y = instruction(ML, y, "Record the study drug actually administered. One record per continuous dosing period.")
    y = section(ML, y, "Study treatment")
    y = choices(ML, y, "Study drug administered", [("A", "Drug A 50 mg"), ("P", "Placebo")], "EX.EXTRT")
    y -= 2 * mm

    c.setFillColor(INK); c.setFont("Helvetica", 8)
    c.drawString(ML, y, "Dose per administration")
    c.setFillColor(FIELD); c.setStrokeColor(LINE); c.rect(ML + 55 * mm, y - 2 * mm, 22 * mm, 6.5 * mm, stroke=1, fill=1)
    c.setFillColor(MUTED); c.setFont("Helvetica", 7.5); c.drawString(ML + 79 * mm, y, "mg")
    annot(ML + 88 * mm, y - 0.8 * mm, "EX.EXDOSE / EX.EXDOSU")
    y -= 12 * mm

    y = choices(ML, y, "Route", [("1", "Oral"), ("2", "Intravenous"), ("3", "Other")], "EX.EXROUTE")
    y = choices(ML, y, "Frequency", [("QD", "Once daily (QD)"), ("BID", "Twice daily (BID)"), ("PRN", "As needed (PRN)")],
                "EX.EXDOSFRQ", codes=True)

    y = section(ML, y, "Dosing period")
    y = field(ML, y, "Date of first dose", 45 * mm, "DD-MMM-YYYY",
              "EX.EXSTDTC → EX.EXSTDY  ·  also DM.RFSTDTC (defines Study Day 1)") - 8 * mm
    y = field(ML, y, "Date of last dose", 45 * mm, "DD-MMM-YYYY",
              "EX.EXENDTC → EX.EXENDY  ·  also DM.RFENDTC") - 8 * mm

    y = section(ML, y, "Interruptions")
    y = choices(ML, y, "Was dosing interrupted or modified?",
                [("Y", "Yes — complete a new record"), ("N", "No")],
                "not submitted — drives EXSEQ (one record per dosing period)", codes=True)
    page_footer("This form drives Study Day for the ENTIRE study" if state["annotated"] else None)


def form_ae():
    y = page_header("Adverse Events", "AE_01", "LOG FORM — ALL VISITS")
    y = instruction(ML, y, "Record all adverse events from informed consent to end of study. One row per event.")
    y = instruction(ML, y, "Record the event term as reported by the investigator — do not abbreviate or code.")
    y -= 2 * mm
    cols = [("No.", 10 * mm), ("Adverse event term\n(verbatim)", 45 * mm),
            ("Start date\nDD-MMM-YYYY", 27 * mm), ("End date\nDD-MMM-YYYY", 27 * mm),
            ("Severity\nMild/Mod/Severe", 25 * mm), ("Serious\nY/N", 15 * mm),
            ("Relationship\nto study drug", 22 * mm), ("Outcome\n(code 1-5)", 20 * mm)]
    ann = ["AESEQ", "AETERM → AEDECOD", "AESTDTC → AESTDY", "AEENDTC → AEENDY",
           "AESEV", "AESER", "AEREL", "code→AEOUT"]
    y = log_table(ML, y, cols, 8, sdtm_row=ann)

    y = section(ML, y, "Coding note")
    if state["annotated"]:
        c.setFillColor(HexColor("#B5651A")); c.setFont("Helvetica-Oblique", 7.5)
        for line in wrap("AETERM keeps the verbatim text exactly as written. AEDECOD is derived later by "
                         "coding that verbatim term against MedDRA — it is never typed on the CRF.", 118):
            c.drawString(ML, y, line); y -= 4.4 * mm
    else:
        y = instruction(ML, y, "Outcome codes: 1 = Recovered/Resolved   2 = Recovering/Resolving   "
                               "3 = Not recovered/Not resolved   4 = Fatal   5 = Unknown")
    y -= 4 * mm
    y = instruction(ML, y, "Leave the end date blank if the event is ongoing at the time of reporting.")
    page_footer("A blank end date = ongoing → AEENDTC stays NULL" if state["annotated"] else None)


def form_cm():
    y = page_header("Concomitant Medications", "CM_01", "LOG FORM — ALL VISITS")
    y = instruction(ML, y, "Record all medications other than study drug, including those started before the study.")
    y -= 2 * mm
    cols = [("No.", 10 * mm), ("Medication name\n(trade or generic)", 45 * mm),
            ("Indication", 33 * mm), ("Dose", 16 * mm), ("Unit", 14 * mm),
            ("Route", 18 * mm), ("Freq", 14 * mm),
            ("Start date", 22 * mm), ("End date", 22 * mm)]
    ann = ["CMSEQ", "CMTRT → CMDECOD", "CMINDC", "CMDOSE", "CMDOSU",
           "CMROUTE", "CMDOSFRQ", "CMSTDTC→STDY", "CMENDTC→ENDY"]
    y = log_table(ML, y, cols, 8, sdtm_row=ann)
    y = instruction(ML, y, "Frequency codes: QD = once daily   BID = twice daily   TID = three times daily   PRN = as needed")
    y = instruction(ML, y, "Leave the end date blank if the medication is ongoing.")
    y -= 3 * mm
    if state["annotated"]:
        c.setFillColor(HexColor("#B5651A")); c.setFont("Helvetica-Oblique", 7.5)
        for line in wrap("NOTE THE RENAME: the CRF field 'Freq' maps to SDTM CMDOSFRQ, not CMFREQ. "
                         "Medications starting before first dose give a NEGATIVE CMSTDY.", 118):
            c.drawString(ML, y, line); y -= 4.4 * mm
    page_footer("CMDECOD is derived by coding against WHODrug — not typed on the CRF"
                if state["annotated"] else None)


def form_lab():
    y = page_header("Laboratory Results", "LB_01", "BASELINE / WEEK 4")
    y = instruction(ML, y, "Central laboratory results. Transcribe exactly as reported, including units and ranges.")
    y = field(ML, y, "Date of specimen collection", 45 * mm, "DD-MMM-YYYY", "LB.LBDTC → derive LB.LBDY") - 10 * mm

    y = section(ML, y, "Haematology")
    cols = [("Test", 52 * mm), ("Result", 24 * mm), ("Unit", 24 * mm),
            ("Ref. low", 22 * mm), ("Ref. high", 22 * mm)]
    ann = ["LBTESTCD / LBTEST", "LBORRES", "LBORRESU", "LBORNRLO", "LBORNRHI"]
    tests_h = ["Haemoglobin", "Haematocrit", "White blood cells", "Platelets"]
    y = lab_grid(ML, y, cols, tests_h, ann)
    y -= 2 * mm
    y = section(ML, y, "Clinical chemistry")
    tests_c = ["Alanine aminotransferase (ALT)", "Creatinine"]
    y = lab_grid(ML, y, cols, tests_c, ann)

    y -= 2 * mm
    if state["annotated"]:
        c.setFillColor(HexColor("#B5651A")); c.setFont("Helvetica-Oblique", 7.5)
        for line in wrap("LBCAT is assigned from the section heading (HEMATOLOGY / CHEMISTRY). LBNRIND is DERIVED "
                         "by comparing the result to the reference range — it is not collected. Note CDISC CT "
                         "names 'White blood cells' as LBTEST = Leukocytes (LBTESTCD = WBC).", 118):
            c.drawString(ML, y, line); y -= 4.4 * mm
    else:
        y = instruction(ML, y, "Record the reference range printed on the laboratory report for each test.")
    page_footer("Results already tall — no transpose needed, unlike Vital Signs"
                if state["annotated"] else None)


def lab_grid(x, y, cols, tests, ann):
    total = sum(w for _, w in cols)
    c.setFillColor(INK); c.rect(x, y - 6 * mm, total, 6 * mm, stroke=0, fill=1)
    cx = x
    for name, w in cols:
        c.setFillColor(white); c.setFont("Helvetica-Bold", 7)
        c.drawString(cx + 1.5 * mm, y - 4 * mm, name)
        cx += w
    y -= 6 * mm
    if state["annotated"]:
        c.setFillColor(HexColor("#FDF1E7")); c.rect(x, y - 5 * mm, total, 5 * mm, stroke=0, fill=1)
        cx = x
        for (_, w), a in zip(cols, ann):
            c.setFillColor(HexColor("#B5651A")); c.setFont("Helvetica-Bold", 6.5)
            c.drawString(cx + 1.5 * mm, y - 3.4 * mm, a)
            cx += w
        y -= 5 * mm
    for i, t in enumerate(tests):
        rh = 8 * mm
        c.setFillColor(FIELD if i % 2 == 0 else white)
        c.rect(x, y - rh, total, rh, stroke=0, fill=1)
        c.setStrokeColor(LINE); c.setLineWidth(0.6); c.rect(x, y - rh, total, rh, stroke=1, fill=0)
        cx = x
        for j, (_, w) in enumerate(cols):
            if j:
                c.line(cx, y - rh, cx, y)
            cx += w
        c.setFillColor(INK); c.setFont("Helvetica", 8)
        c.drawString(x + 2 * mm, y - rh + 2.8 * mm, t)
        y -= rh
    return y - 3 * mm


FORMS = [form_demographics, form_vitals, form_exposure, form_ae, form_cm, form_lab, form_disposition]

# ================================================================ BUILD
cover()

part_divider("Part 1", "Blank CRF",
             "The seven forms as a site would see them in the EDC system. These are the questions that "
             "generate every raw dataset you work with: dm_raw, vs_raw, ex_raw, ae_raw, cm_raw, lb_raw and ds_raw. "
             "Read them the way a coordinator would — then look at Part 2 to see where each answer lands in SDTM.")
state["annotated"] = False
for f in FORMS:
    f()

part_divider("Part 2", "Annotated CRF (aCRF)",
             "The same seven forms, annotated in orange with the SDTM variable each field maps to. This is a real "
             "submission deliverable: it ships with the datasets and Define-XML so a reviewer can trace any SDTM "
             "value back to the exact question that collected it. Annotations match data/mapping_specification.md.")
state["annotated"] = True
for f in FORMS:
    f()

c.save()
print("wrote", OUT)
print("pages:", state["page"])
