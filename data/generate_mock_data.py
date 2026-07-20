#!/usr/bin/env python3
"""
generate_mock_data.py — Mock raw (EDC-style) data for training study ABC-01.

ALL DATA IS SYNTHETIC. No real patients, sites, or products.

This produces the raw, *pre-SDTM* CSVs that the bootcamp notebooks map into
SDTM domains. The data deliberately contains realistic "quirks" that mapping
must fix (mixed date formats, coded values, free text, wide vs. tall shapes,
inconsistent casing). See raw_data_dictionary.md for the full description.

Run:  python3 generate_mock_data.py
Writes: dm_raw.csv, ex_raw.csv, ae_raw.csv, cm_raw.csv, vs_raw.csv, lb_raw.csv
"""

import csv
import os
from datetime import datetime

STUDYID = "ABC-01"
OUT = os.path.dirname(os.path.abspath(__file__))


def crf(d):
    """Render an ISO date the way the CRF collects it: DD-MMM-YYYY (e.g. 14-MAY-1969).

    RAW DATA IS NEVER IN ISO 8601. ISO is the SDTM *target* format — converting to it
    is a core mapping task. The EDC exports dates the way the form captured them, and
    every date field on the ABC-01 CRF is labelled DD-MMM-YYYY.
    (AE and CM deliberately keep a MIX of formats — see those sections.)
    """
    if not d:
        return ""
    return datetime.strptime(d, "%Y-%m-%d").strftime("%d-%b-%Y").upper()


def write(name, header, rows):
    path = os.path.join(OUT, name)
    with open(path, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)
    print(f"wrote {name:16s} {len(rows):3d} rows")


# ----------------------------------------------------------------------------
# Canonical subject table (drives DM + EX; other domains reference SITEID/SUBJID)
# SEX is stored as an EDC code: 1 = Male, 2 = Female  (forces a CT lookup)
# RACE is free text with inconsistent casing / trailing spaces (forces cleanup)
# Note: SITEID + SUBJID together are unique; SUBJID alone is NOT (repeats across sites)
# ----------------------------------------------------------------------------
SUBJECTS = [
    # site, subj, arm,       sexcode, race,                          ethnic,                   country, birth,        consent,      random,       firstdose,    lastdose,     completion,      eos
    ("01", "001", "Drug A",  "2", "White",                        "Not Hispanic or Latino", "USA", "1969-05-14", "2024-02-20", "2024-03-01", "2024-03-01", "2024-03-28", "COMPLETED",     "2024-03-28"),
    ("01", "002", "Placebo", "1", "Asian",                        "Not Hispanic or Latino", "JPN", "1963-11-02", "2024-02-22", "2024-03-04", "2024-03-04", "2024-03-31", "COMPLETED",     "2024-03-31"),
    ("01", "003", "Drug A",  "2", "black or african american",    "Not Hispanic or Latino", "USA", "1977-08-30", "2024-02-25", "2024-03-05", "2024-03-05", "2024-04-01", "COMPLETED",     "2024-04-01"),
    ("01", "004", "Placebo", "1", "White",                        "Hispanic or Latino",     "USA", "1958-02-19", "2024-02-26", "2024-03-06", "2024-03-06", "2024-03-25", "DISCONTINUED",  "2024-03-25"),
    ("02", "001", "Drug A",  "1", "White",                        "Not Hispanic or Latino", "GBR", "1972-07-07", "2024-03-01", "2024-03-11", "2024-03-11", "2024-04-07", "COMPLETED",     "2024-04-07"),
    ("02", "002", "Placebo", "2", "asian",                        "Not Hispanic or Latino", "JPN", "1980-12-25", "2024-03-02", "2024-03-12", "2024-03-12", "2024-04-08", "COMPLETED",     "2024-04-08"),
    ("02", "003", "Drug A",  "2", "White ",                       "Not Hispanic or Latino", "USA", "1966-03-11", "2024-03-04", "2024-03-14", "2024-03-14", "2024-04-10", "COMPLETED",     "2024-04-10"),
    ("02", "004", "Placebo", "1", "Black or African American",    "Unknown",                "USA", "1955-09-23", "2024-03-05", "2024-03-15", "2024-03-15", "2024-04-11", "COMPLETED",     "2024-04-11"),
]

# ---- DM (Demographics) -----------------------------------------------------
# Raw demographics/enrolment form, completed at SCREENING.
# Dates are DD-MMM-YYYY, exactly as the CRF collects them — NOT ISO.
# NOTE: end-of-study status does NOT belong here — it is collected at the end of the
# study on the separate Disposition form (ds_raw.csv).
dm_header = ["STUDYID", "SITEID", "SUBJID", "BRTHDTC", "SEX", "RACE", "ETHNIC",
             "COUNTRY", "ARM", "RFICDTC", "RANDDTC"]
dm_rows = []
for (site, subj, arm, sexc, race, ethnic, country, birth, consent, rand,
     firstdose, lastdose, completion, eos) in SUBJECTS:
    dm_rows.append([STUDYID, site, subj, crf(birth), sexc, race, ethnic,
                    country, arm, crf(consent), crf(rand)])
write("dm_raw.csv", dm_header, dm_rows)

# ---- DS (Disposition / End of Study) ---------------------------------------
# Separate "Study Completion" CRF form, completed when the subject leaves the study.
# Status is title case and the reason is free text -> both need CT mapping.
# EOSOTH = the CRF's "If Other, specify" box. Only completed when the reason is
#          "Other"; blank for everyone here. NOT submitted as its own SDTM variable —
#          it would feed the verbatim DSTERM.
ds_header = ["STUDYID", "SITEID", "SUBJID", "EOSSTAT", "EOSDT", "EOSREAS", "EOSOTH"]
ds_rows = []
for (site, subj, arm, sexc, race, ethnic, country, birth, consent, rand,
     firstdose, lastdose, completion, eos) in SUBJECTS:
    if completion == "COMPLETED":
        ds_rows.append([STUDYID, site, subj, "Completed", crf(eos), "", ""])
    else:
        ds_rows.append([STUDYID, site, subj, "Discontinued", crf(eos), "Adverse event", ""])
write("ds_raw.csv", ds_header, ds_rows)

# ---- EX (Exposure) ---------------------------------------------------------
# One dosing record per subject. First dose date = reference start (RFSTDTC),
# used later to derive study day (--DY). Placebo dose recorded as 0 mg.
# EXFREQ  = dosing frequency as collected on the CRF.
# EXINTP  = "was dosing interrupted or modified?" (Y/N). It is NOT submitted as an
#           SDTM variable: a "Y" means the subject needs MULTIPLE EX records, one
#           per continuous dosing period. All "N" here, so one record each.
ex_header = ["STUDYID", "SITEID", "SUBJID", "EXTRT", "EXDOSE", "EXDOSU",
             "EXFREQ", "EXROUTE", "EXSTDTC", "EXENDTC", "EXINTP"]
ex_rows = []
for (site, subj, arm, sexc, race, ethnic, country, birth, consent, rand,
     firstdose, lastdose, completion, eos) in SUBJECTS:
    dose = "50" if arm == "Drug A" else "0"
    ex_rows.append([STUDYID, site, subj, arm, dose, "mg", "QD", "ORAL",
                    crf(firstdose), crf(lastdose), "N"])
write("ex_raw.csv", ex_header, ex_rows)

# ---- AE (Adverse Events) ---------------------------------------------------
# Verbatim terms (free text), MIXED date formats (DD/MM/YYYY and DD-Mon-YYYY).
# Deliberate mix of collection styles, matching the AE CRF form:
#   AESEV  free text, inconsistent case  -> needs trim/upcase + CT
#   AESER  Y/N but entered inconsistently ("No" vs "N")
#   AEREL  free-text relationship (sponsor-defined codelist)
#   AEOUT  NUMERIC CODE from the CRF dropdown -> needs a code->CT lookup
#          1 = Recovered/Resolved          2 = Recovering/Resolving
#          3 = Not recovered/Not resolved  4 = Fatal            5 = Unknown
# Blank AEENDT = ongoing.
ae_header = ["STUDYID", "SITEID", "SUBJID", "AETERM", "AESTDT", "AEENDT",
             "AESEV", "AESER", "AEREL", "AEOUT"]
ae_rows = [
    [STUDYID, "01", "001", "bad headache",           "15/03/2024", "16/03/2024", "moderate", "No",  "Related",          "1"],
    [STUDYID, "01", "001", "Nausea",                 "20/03/2024", "",           "mild",     "N",   "Possibly related", "3"],
    # SCREENING-PERIOD EVENT. Started 28-Feb, five days BEFORE this subject's
    # first dose on 04-Mar, so AESTDY = -5 and AETRTEM = "N" (not treatment
    # emergent). Deliberately given to a subject who ALSO has a post-dose event,
    # so one subject demonstrates both flag values. AEs are collected from
    # informed consent (22-Feb here) onward, which is why a screening event is
    # legitimate rather than a data error.
    # "sore throat" -> MedDRA PT "Oropharyngeal pain": a verbatim term whose
    # coded term is nothing like it, same lesson as Leukocytes in LB.
    [STUDYID, "01", "002", "sore throat",            "28-Feb-2024","02-Mar-2024","Mild",     "No",  "Not related",      "1"],
    [STUDYID, "01", "002", "mild dizziness",         "10-Mar-2024","12-Mar-2024","Mild",     "No",  "Not related",      "1"],
    [STUDYID, "01", "004", "worsening hypertension", "22/03/2024", "25/03/2024", "severe",   "Yes", "Related",          "1"],
    [STUDYID, "01", "004", "fatigue",                "18/03/2024", "",           "Moderate", "No",  "Possibly related", "3"],
    [STUDYID, "02", "001", "Headache",               "15-Mar-2024","15-Mar-2024","mild",     "No",  "Related",          "1"],
    [STUDYID, "02", "001", "insomnia",               "18-Mar-2024","22-Mar-2024","mild",     "No",  "Unlikely related", "1"],
    [STUDYID, "02", "002", "vomiting",               "20/03/2024", "21/03/2024", "moderate", "No",  "Related",          "2"],
    [STUDYID, "02", "003", "rash on both arms",      "25-Mar-2024","30/03/2024", "mild",     "No",  "Related",          "1"],
]
write("ae_raw.csv", ae_header, ae_rows)

# ---- CM (Concomitant Medications) ------------------------------------------
# Free-text drug names + indications, mixed date formats, dose/unit/route/freq.
# Blank CMENDT = ongoing.
cm_header = ["STUDYID", "SITEID", "SUBJID", "CMTRT", "CMINDC", "CMSTDT",
             "CMENDT", "CMDOSE", "CMDOSU", "CMROUTE", "CMFREQ"]
cm_rows = [
    [STUDYID, "01", "001", "Paracetamol",          "headache",           "15/03/2024", "16/03/2024", "500",  "mg", "ORAL",    "PRN"],
    [STUDYID, "01", "001", "Vitamin D",            "supplementation",    "01/01/2024", "",           "1000", "IU", "ORAL",    "QD"],
    [STUDYID, "01", "002", "Lisinopril",           "hypertension",       "01-Feb-2024","",           "10",   "mg", "ORAL",    "QD"],
    [STUDYID, "01", "004", "Amlodipine",           "high blood pressure","05-Jan-2024","",           "5",    "mg", "ORAL",    "QD"],
    [STUDYID, "02", "001", "Aspirin",              "headache",           "15/03/2024", "15/03/2024", "100",  "mg", "ORAL",    "PRN"],
    [STUDYID, "02", "002", "Ondansetron",          "vomiting",           "20/03/2024", "21/03/2024", "4",    "mg", "ORAL",    "PRN"],
    [STUDYID, "02", "003", "Hydrocortisone cream", "rash",               "25/03/2024", "30/03/2024", "1",    "%",  "TOPICAL", "BID"],
    [STUDYID, "02", "004", "Metformin",            "type 2 diabetes",    "10-Dec-2023","",           "500",  "mg", "ORAL",    "BID"],
]
write("cm_raw.csv", cm_header, cm_rows)

# ---- VS (Vital Signs) ------------------------------------------------------
# WIDE format: one row per subject per visit, one COLUMN per measurement.
# The VS exercise transposes this to the tall SDTM Findings structure.
# HEIGHT collected at SCREENING only (blank at later visits). TEMP in Celsius.
vs_header = ["STUDYID", "SITEID", "SUBJID", "VISIT", "VSDT",
             "SYSBP", "DIABP", "PULSE", "TEMP", "HEIGHT", "WEIGHT", "VSND"]
# (visit, days_from_consent) — SCREENING at consent, BASELINE at first dose, WEEK 4 ~28d
vs_plan = [
    # site, subj, [ (VISIT, date, sysbp, diabp, pulse, temp, height, weight) ... ]
    ("01", "001", [("SCREENING","2024-02-20",122,80,68,36.7,165,70.5),
                   ("BASELINE","2024-03-01",120,78,66,36.8,"",70.2),
                   ("WEEK 4","2024-03-28",118,76,70,36.6,"",69.8)]),
    ("01", "002", [("SCREENING","2024-02-22",134,86,72,36.9,178,82.0),
                   ("BASELINE","2024-03-04",132,84,70,37.0,"",81.5),
                   ("WEEK 4","2024-04-01",130,82,74,36.7,"",81.0)]),
    ("01", "003", [("SCREENING","2024-02-25",118,74,64,36.5,160,58.3),
                   ("BASELINE","2024-03-05",116,72,66,36.6,"",58.0),
                   ("WEEK 4","2024-04-01",115,70,62,36.5,"",57.6)]),
    ("01", "004", [("SCREENING","2024-02-26",140,90,78,36.8,175,90.1),
                   ("BASELINE","2024-03-06",142,92,80,36.9,"",90.4),
                   ("WEEK 4","2024-03-25",158,98,84,37.0,"",91.0)]),
    ("02", "001", [("SCREENING","2024-03-01",126,82,70,36.6,182,88.7),
                   ("BASELINE","2024-03-11",124,80,68,36.7,"",88.3),
                   ("WEEK 4","2024-04-07",122,78,66,36.6,"",87.9)]),
    ("02", "002", [("SCREENING","2024-03-02",119,76,74,36.8,158,55.2),
                   ("BASELINE","2024-03-12",121,78,72,36.9,"",55.5),
                   ("WEEK 4","2024-04-08",120,77,70,36.7,"",55.0)]),
    ("02", "003", [("SCREENING","2024-03-04",128,84,76,37.1,170,72.4),
                   ("BASELINE","2024-03-14",127,83,74,37.0,"",72.0),
                   ("WEEK 4","2024-04-10",125,80,72,36.8,"",71.6)]),
    ("02", "004", [("SCREENING","2024-03-05",136,88,80,36.9,168,79.9),
                   ("BASELINE","2024-03-15",138,90,82,37.0,"",80.2),
                   ("WEEK 4","2024-04-11",135,86,78,36.8,"",79.5)]),
]
vs_rows = []
for site, subj, visits in vs_plan:
    for (visit, dt, sys, dia, pul, temp, ht, wt) in visits:
        # VSND = "were any assessments not performed?" — N for everyone here.
        # A "Y" would drive VSSTAT = "NOT DONE" and VSREASND in SDTM.
        vs_rows.append([STUDYID, site, subj, visit, crf(dt), sys, dia, pul, temp, ht, wt, "N"])
write("vs_raw.csv", vs_header, vs_rows)

# ---- LB (Laboratory) -------------------------------------------------------
# TALL format already (one row per test). Full test NAMES given; the LB exercise
# derives LBTESTCD from Controlled Terminology and standardizes units (STRESN).
# Original units kept as collected. A few deliberately abnormal values included.
lb_header = ["STUDYID", "SITEID", "SUBJID", "VISIT", "LBDT",
             "LBTEST", "LBORRES", "LBORRESU", "LBORNRLO", "LBORNRHI"]
# test catalog: (name, unit, low, high)
LB_TESTS = [
    ("Hemoglobin",                 "g/dL",   "12.0", "17.0"),
    ("Hematocrit",                 "%",      "37",   "50"),
    ("White Blood Cells",          "10^9/L", "4.0",  "11.0"),
    ("Platelets",                  "10^9/L", "150",  "400"),
    ("Alanine Aminotransferase",   "U/L",    "7",    "56"),
    ("Creatinine",                 "mg/dL",  "0.6",  "1.3"),
]
# per subject/visit result values, indexed to LB_TESTS order
lb_values = {
    ("01","001","BASELINE"): ["14.2","42","6.5","250","28","0.9"],
    ("01","001","WEEK 4"):    ["14.0","41","6.8","255","31","0.9"],
    ("01","002","BASELINE"): ["15.1","45","7.2","310","35","1.1"],
    ("01","002","WEEK 4"):    ["15.0","44","7.0","305","33","1.0"],
    ("01","003","BASELINE"): ["12.8","38","5.9","220","24","0.7"],
    ("01","003","WEEK 4"):    ["12.6","37","6.1","215","72","0.8"],  # ALT elevated (>56)
    ("02","001","BASELINE"): ["13.9","41","8.0","280","30","1.0"],
    ("02","001","WEEK 4"):    ["13.7","40","8.3","275","29","1.1"],
}
lb_dates = {  # BASELINE = first dose, WEEK 4 = end of treatment (per subject)
    ("01","001"): ("2024-03-01","2024-03-28"),
    ("01","002"): ("2024-03-04","2024-04-01"),
    ("01","003"): ("2024-03-05","2024-04-01"),
    ("02","001"): ("2024-03-11","2024-04-07"),
}
lb_rows = []
for (site, subj) in [("01","001"), ("01","002"), ("01","003"), ("02","001")]:
    for vi, visit in enumerate(["BASELINE", "WEEK 4"]):
        dt = lb_dates[(site, subj)][vi]
        vals = lb_values[(site, subj, visit)]
        for ti, (name, unit, lo, hi) in enumerate(LB_TESTS):
            lb_rows.append([STUDYID, site, subj, visit, crf(dt), name, vals[ti], unit, lo, hi])
write("lb_raw.csv", lb_header, lb_rows)

print("\nAll mock raw files generated for study", STUDYID)
