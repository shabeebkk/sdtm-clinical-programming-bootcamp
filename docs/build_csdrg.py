#!/usr/bin/env python3
"""
build_csdrg.py — draft Clinical Study Data Reviewer's Guide (cSDRG) for ABC-01.

The cSDRG is the NARRATIVE part of a submission package. define.xml says WHAT the
data is; the cSDRG explains the things metadata cannot express — why a domain is
absent, why a conformance rule fires and is acceptable, what a reviewer should
know before opening the data.

Follows the PHUSE cSDRG template section structure.

⚠️  This is a TEACHING DRAFT for a synthetic study. A real cSDRG is written by the
study team and reviewed; it is not generated. The dataset inventory here IS read
from the actual built data, so the numbers are true.

Run:  python3 build_csdrg.py
Writes: cSDRG_ABC-01.pdf
"""

import csv
import os

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, PageBreak)

HERE = os.path.dirname(os.path.abspath(__file__))
SDTM = os.path.normpath(os.path.join(HERE, "..", "data", "sdtm"))
OUT = os.path.join(HERE, "cSDRG_ABC-01.pdf")

INK = colors.HexColor("#0F2E3D")
TEAL = colors.HexColor("#0E7C86")
LINE = colors.HexColor("#CFDEE1")
PAPER = colors.HexColor("#F3F7F8")

DOMAIN_INFO = {
    "dm":     ("DM", "Demographics", "Special Purpose", "One record per subject"),
    "ds":     ("DS", "Disposition", "Events", "One record per disposition event per subject"),
    "ex":     ("EX", "Exposure", "Interventions", "One record per dosing period per subject"),
    "ae":     ("AE", "Adverse Events", "Events", "One record per event per subject"),
    "suppae": ("SUPPAE", "Supplemental Qualifiers for AE", "Relationship",
               "One record per qualifier per parent record"),
    "cm":     ("CM", "Concomitant Medications", "Interventions",
               "One record per medication per subject"),
    "vs":     ("VS", "Vital Signs", "Findings", "One record per test per visit per subject"),
    "lb":     ("LB", "Laboratory Test Results", "Findings",
               "One record per test per visit per subject"),
}


def dataset_facts():
    """Read the ACTUAL built datasets so the inventory is true, not asserted."""
    out = []
    for key, (name, label, cls, structure) in DOMAIN_INFO.items():
        path = os.path.join(SDTM, f"{key}.csv")
        if not os.path.exists(path):
            continue
        with open(path, newline="") as f:
            rows = list(csv.DictReader(f))
        nvar = len(rows[0]) if rows else 0
        out.append((name, label, cls, structure, str(len(rows)), str(nvar)))
    return out


def build():
    ss = getSampleStyleSheet()
    h1 = ParagraphStyle("h1", parent=ss["Heading1"], fontName="Helvetica-Bold",
                        fontSize=15, textColor=INK, spaceBefore=16, spaceAfter=8)
    h2 = ParagraphStyle("h2", parent=ss["Heading2"], fontName="Helvetica-Bold",
                        fontSize=11.5, textColor=TEAL, spaceBefore=12, spaceAfter=5)
    body = ParagraphStyle("body", parent=ss["BodyText"], fontName="Helvetica",
                          fontSize=9.5, leading=13.5, alignment=TA_JUSTIFY, spaceAfter=7)
    small = ParagraphStyle("small", parent=body, fontSize=8.5, textColor=colors.HexColor("#5A7682"))
    title = ParagraphStyle("title", parent=ss["Title"], fontName="Helvetica-Bold",
                           fontSize=20, textColor=INK, spaceAfter=4)

    doc = SimpleDocTemplate(OUT, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm,
                            leftMargin=2.2*cm, rightMargin=2.2*cm,
                            title="cSDRG - Study ABC-01", author="Clinical Programming Bootcamp")
    S = []

    #  Cell text MUST be wrapped in Paragraph objects. A plain string in a
    #  reportlab table cell does NOT wrap - it overflows the column and prints
    #  straight over the next one, which is exactly what happened in 3.4 and 4.2
    #  ("per subjec24", "Supplemental Qualifiers forAElationship"). Column widths
    #  are irrelevant until the content can actually wrap.
    cell = ParagraphStyle("cell", fontName="Helvetica", fontSize=8.5, leading=11.2)
    cellhead = ParagraphStyle("cellhead", fontName="Helvetica-Bold", fontSize=8.5,
                              leading=11.2, textColor=colors.white)

    def tbl(data, widths, head=True):
        wrapped = []
        for i, row in enumerate(data):
            st = cellhead if (head and i == 0) else cell
            wrapped.append([c if hasattr(c, "wrap") else Paragraph(str(c), st) for c in row])
        t = Table(wrapped, colWidths=widths, repeatRows=1 if head else 0)
        style = [
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("GRID", (0, 0), (-1, -1), 0.5, LINE),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]
        if head:
            style += [("BACKGROUND", (0, 0), (-1, 0), INK)]
            style += [("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PAPER])]
        t.setStyle(TableStyle(style))
        return t

    # ---------------- title block ----------------
    S.append(Paragraph("Clinical Study Data Reviewer's Guide", title))
    S.append(Paragraph("Study ABC-01", ParagraphStyle(
        "sub", parent=ss["Title"], fontSize=13, textColor=TEAL, spaceAfter=14)))
    S.append(tbl([
        ["Protocol", "ABC-01"],
        ["Title", "A Phase 2 Study of Drug A versus Placebo"],
        ["Standard", "SDTMIG v3.3 (SDTM v1.7)"],
        ["Define-XML", "v2.0"],
        ["Prepared", "2026-07-20"],
        ["Status", "DRAFT - synthetic training data"],
    ], [4*cm, 12*cm], head=False))
    S.append(Spacer(1, 10))
    S.append(Paragraph(
        "<b>All data in this study is synthetic.</b> No real patients, sites, investigators, "
        "sponsors or products are represented. This document is a teaching artifact produced "
        "for a clinical programming course and is not a regulatory submission.", small))

    # ---------------- 1. Introduction ----------------
    S.append(Paragraph("1. Introduction", h1))
    S.append(Paragraph("1.1 Purpose", h2))
    S.append(Paragraph(
        "This Clinical Study Data Reviewer's Guide (cSDRG) describes the SDTM datasets submitted "
        "for study ABC-01. It is intended to help a reviewer locate and understand the data "
        "without needing to contact the study team. It complements, and does not repeat, the "
        "machine-readable metadata in define.xml: where define.xml states <i>what</i> each "
        "variable is, this guide explains <i>why</i> the data looks the way it does.", body))

    S.append(Paragraph("1.2 Acronyms", h2))
    S.append(tbl([
        ["Acronym", "Meaning"],
        ["aCRF", "Annotated Case Report Form"],
        ["CDISC", "Clinical Data Interchange Standards Consortium"],
        ["CT", "Controlled Terminology"],
        ["cSDRG", "Clinical Study Data Reviewer's Guide"],
        ["MedDRA", "Medical Dictionary for Regulatory Activities"],
        ["SDTM", "Study Data Tabulation Model"],
        ["SDTMIG", "SDTM Implementation Guide"],
        ["WHODrug", "World Health Organization Drug Dictionary"],
    ], [3.2*cm, 12.8*cm]))

    S.append(Paragraph("1.3 Study Data Standards and Dictionary Inventory", h2))
    S.append(tbl([
        ["Standard / Dictionary", "Version"],
        ["SDTM", "1.7"],
        ["SDTM Implementation Guide", "3.3"],
        ["CDISC Controlled Terminology", "current at time of preparation"],
        ["Define-XML", "2.0"],
        ["MedDRA", "ILLUSTRATIVE ONLY - see section 3.3"],
        ["WHODrug", "ILLUSTRATIVE ONLY - see section 3.3"],
    ], [8*cm, 8*cm]))

    # ---------------- 2. Protocol Description ----------------
    S.append(Paragraph("2. Protocol Description", h1))
    S.append(Paragraph("2.1 Protocol Number and Title", h2))
    S.append(Paragraph(
        "<b>ABC-01</b> - A Phase 2 Study of Drug A versus Placebo.", body))

    S.append(Paragraph("2.2 Study Design", h2))
    S.append(Paragraph(
        "ABC-01 is a randomised, double-blind, placebo-controlled Phase 2 study. Eight subjects "
        "were enrolled at two sites (01 and 02) and randomised 1:1 to Drug A 50 mg or matching "
        "placebo, taken orally once daily for approximately four weeks. Subjects were assessed "
        "at Screening, Baseline and Week 4. Seven subjects completed; one subject "
        "(ABC-01-01-004) discontinued early due to an adverse event.", body))

    S.append(Paragraph("2.3 Study Design in Relation to SDTM", h2))
    S.append(Paragraph(
        "The design maps to SDTM without special handling. There is a single treatment period "
        "and no crossover, so each subject has one dosing record in EX and a single set of "
        "reference dates in DM. Trial Design domains (TS, TA, TE, TV) are outside the scope of "
        "this training submission and are not included.", body))

    # ---------------- 3. Subject Data Description ----------------
    S.append(PageBreak())
    S.append(Paragraph("3. Subject Data Description", h1))

    S.append(Paragraph("3.1 Overview", h2))
    S.append(Paragraph(
        "Eight subjects are represented in DM. All subject-level datasets use USUBJID as the "
        "unique key, constructed as STUDYID-SITEID-SUBJID (for example ABC-01-01-001), because "
        "SUBJID is only unique within a site.", body))

    S.append(Paragraph("3.2 Annotated CRF", h2))
    S.append(Paragraph(
        "The annotated CRF (ABC-01_Sample_CRF.pdf) is submitted alongside the datasets and is "
        "linked from define.xml. It annotates all 62 collected fields with their SDTM "
        "destinations. Fields that are collected but not submitted are annotated as such - see "
        "section 3.5.", body))

    S.append(Paragraph("3.3 Dictionary Coding", h2))
    S.append(Paragraph(
        "<b>Coded terms in this study are illustrative and are not the output of a licensed "
        "dictionary.</b> AEDECOD values resemble MedDRA Preferred Terms and CMDECOD values "
        "resemble WHODrug preferred names, but they were assigned for teaching purposes. In a "
        "real submission these are produced by trained coders against licensed dictionary "
        "versions, which would be stated in section 1.3.", body))

    S.append(Paragraph("3.4 Subject Data Tabulation Datasets", h2))
    rows = [["Dataset", "Label", "Class", "Structure", "Records", "Variables"]]
    rows += list(dataset_facts())
    S.append(tbl(rows, [1.7*cm, 3.2*cm, 2.2*cm, 5.1*cm, 1.9*cm, 1.9*cm]))
    S.append(Spacer(1, 4))
    S.append(Paragraph("Record counts are read directly from the submitted datasets.", small))

    S.append(Paragraph("3.5 Collected but Not Submitted", h2))
    S.append(Paragraph(
        "Three CRF fields are collected for site workflow and have no SDTM destination. They are "
        "annotated on the aCRF as not submitted:", body))
    S.append(tbl([
        ["CRF field", "Form", "Why it is not submitted"],
        ["EXINTP", "Drug Accountability",
         "Dosing interruption is represented structurally, by splitting exposure into "
         "separate EX records with a gap - not by a flag."],
        ["VSND", "Vital Signs",
         "'Not done' is represented by the absence of a record in a tall structure."],
        ["EOSOTH", "Disposition", "Free-text 'other' detail not required for tabulation."],
    ], [2.5*cm, 3.0*cm, 10.5*cm]))

    S.append(Paragraph("3.6 Data Relationships", h2))
    S.append(Paragraph(
        "SUPPAE holds one supplemental qualifier, AETRTEM (Treatment Emergent Flag), linked to "
        "its parent AE record by USUBJID and IDVAR/IDVARVAL (AESEQ). AETRTEM is derived as "
        "AESTDY &gt;= 1, that is, the event started on or after the date of first dose. "
        "Nine of ten events are treatment emergent; one event (ABC-01-01-002, AESEQ 1) began "
        "during screening and is flagged N.", body))
    S.append(Paragraph(
        "No RELREC dataset is submitted; there are no formally asserted record-level "
        "relationships beyond SUPPAE.", body))

    # ---------------- 4. Conformance ----------------
    S.append(Paragraph("4. Data Conformance Summary", h1))

    S.append(Paragraph("4.1 Conformance Inputs", h2))
    S.append(tbl([
        ["Input", "Detail"],
        ["Validation tool", "Not run - see note below"],
        ["SDTM IG version", "3.3"],
        ["Define-XML", "v2.0, generated from the study mapping specification"],
    ], [5*cm, 11*cm]))
    S.append(Spacer(1, 4))
    S.append(Paragraph(
        "<b>Note.</b> A real submission would report the validation tool and rule-set version "
        "here (for example Pinnacle 21 with the FDA rule set) together with every finding. This "
        "training study has not been run through a commercial validator. The datasets were "
        "instead checked with a purpose-written conformance suite covering key integrity, "
        "required-variable completeness, controlled terminology and value logic, plus a "
        "value-level comparison against a known reference.", small))

    S.append(Paragraph("4.2 Issues Summary", h2))
    S.append(Paragraph(
        "No unresolved conformance issues. The following are expected characteristics of this "
        "study that a reviewer might otherwise query:", body))
    S.append(tbl([
        ["Observation", "Explanation"],
        ["Two subjects have no AE records",
         "Subjects ABC-01-01-003 and ABC-01-02-004 reported no adverse events. Absence of a "
         "record is correct; no empty rows are created."],
        ["Four subjects have no LB records",
         "Laboratory samples were drawn for a subset of subjects per protocol."],
        ["VISITNUM 3 is not used",
         "The protocol visit schedule includes a visit at which no vital signs or laboratory "
         "samples are taken. Visit numbers follow the protocol and are not renumbered."],
        ["Negative study days in CM and DS",
         "Concomitant medications started before first dose, and informed consent and "
         "randomisation precede first dose. Negative --DY values are correct; there is no Day 0."],
        ["RFPENDTC populated from DS",
         "End of participation is taken from the disposition form, not demographics."],
        ["One abnormal laboratory result",
         "Subject ABC-01-01-003 has an elevated ALT at Week 4 (72 U/L, reference 7-56). No "
         "corresponding adverse event was reported by the investigator. LBNRIND reflects the "
         "reference range comparison only and does not imply clinical significance."],
    ], [4.5*cm, 11.5*cm]))

    # ---------------- 5. Appendix ----------------
    S.append(Paragraph("5. Appendix - Submission Contents", h1))
    S.append(tbl([
        ["Component", "File(s)"],
        ["Tabulation datasets", "dm.xpt, ds.xpt, ex.xpt, ae.xpt, suppae.xpt, cm.xpt, vs.xpt, lb.xpt"],
        ["Metadata", "define.xml (with define2-0-0.xsl stylesheet)"],
        ["Annotated CRF", "ABC-01_Sample_CRF.pdf"],
        ["Reviewer's guide", "cSDRG_ABC-01.pdf (this document)"],
    ], [4.5*cm, 11.5*cm]))
    S.append(Spacer(1, 14))
    S.append(Paragraph(
        "End of document. Synthetic training data - not for regulatory use.", small))

    doc.build(S)
    print(f"wrote {os.path.basename(OUT)}")


if __name__ == "__main__":
    build()
