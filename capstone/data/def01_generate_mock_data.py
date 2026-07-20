#!/usr/bin/env python3
"""
def01_generate_mock_data.py — Mock raw (EDC-style) data for the CAPSTONE study DEF-01.

ALL DATA IS SYNTHETIC. No real patients, sites, or products.

DEF-01 is a Phase 2 study of Drug X vs placebo in Type 2 diabetes, 6 subjects at
2 sites. It is the capstone: trainees map it end to end with NO worked notebook in
front of them. So it is STRUCTURALLY like the teaching study ABC-01 (same raw
quirks — mixed date formats, coded values, wide VS) but carries four DELIBERATE
differences that defeat blind copy-paste from ABC-01:

  TRAP 1 · UNIT CONVERSION      site 02 (US) collects WEIGHT in lb and TEMP in °F.
                                VSORRES keeps the collected value+unit; VSSTRESN
                                must convert to kg / °C. ABC-01 never exercised this
                                because every result was already in standard units.

  TRAP 2 · DOSING INTERRUPTION  subject 02/003 stops dosing for a week (a
                                hypoglycaemia event), so EX has TWO records for that
                                subject — EXSEQ 1 and 2 with a gap. The gap IS the
                                interruption; there is no flag for it.

  TRAP 3 · PARTIAL DATE         subject 02/001 reports a screening AE that started
                                "FEB-2024" — month and year, no day. AESTDTC keeps
                                the partial "2024-02"; AESTDY is NULL (never impute a
                                day). AETRTEM is still "N" because all of February is
                                before that subject's March first dose.

  TRAP 4 · ABNORMAL LAB, NO AE  subject 02/003 has a HIGH ALT at Week 12 with no
                                corresponding adverse event. You derive LBNRIND=HIGH;
                                you do NOT invent an AE. (The professional boundary.)

See def01_data_dictionary.md for the full field-by-field description.

Run:  python3 def01_generate_mock_data.py
Writes: dm_raw.csv, ex_raw.csv, ae_raw.csv, vs_raw.csv, lb_raw.csv
"""

import csv
import os
from datetime import datetime, timedelta

STUDYID = "DEF-01"
OUT = os.path.dirname(os.path.abspath(__file__))


# ---------------------------------------------------------------------------
# date helpers
# ---------------------------------------------------------------------------
def iso(d):
    return d.strftime("%Y-%m-%d")


def d(s):
    return datetime.strptime(s, "%Y-%m-%d")


def plus(base, days):
    """base (ISO string) + days -> datetime."""
    return d(base) + timedelta(days=days)


def crf(dt):
    """CRF standard date: DD-MMM-YYYY uppercase, e.g. 04-MAR-2024.
    Used by dm, ex, vs, lb — the forms with a single date control.
    (RAW DATA IS NEVER ISO 8601. ISO is the SDTM target.)"""
    if not dt:
        return ""
    return dt.strftime("%d-%b-%Y").upper()


def ae_slash(dt):
    """DD/MM/YYYY — one of the two formats the AE form mixes."""
    return dt.strftime("%d/%m/%Y")


def ae_mon(dt):
    """DD-Mon-YYYY (mixed case) — the other AE format."""
    return dt.strftime("%d-%b-%Y")


def write(name, header, rows):
    path = os.path.join(OUT, name)
    with open(path, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)
    print(f"wrote {name:16s} {len(rows):3d} rows")


# ---------------------------------------------------------------------------
# SUBJECTS  —  the spine everything else hangs off
# ---------------------------------------------------------------------------
# site 01 = Canada (metric, kg/°C).   site 02 = USA (customary, lb/°F).
# dose1 is the BASELINE / first-dose date; every other date is derived from it.
SUBJECTS = [
    # site subj arm        country brth        sex race                        ethnic                    consent      dose1        screen_off
    ("01", "001", "Drug X",  "CAN", "1965-07-12", "1", "White",                    "Not Hispanic or Latino", "2024-02-19", "2024-03-04", -12),
    ("01", "002", "Placebo", "CAN", "1958-11-30", "2", "white ",                   "Not Hispanic or Latino", "2024-02-21", "2024-03-06", -11),
    ("01", "003", "Drug X",  "CAN", "1971-03-05", "2", "Asian",                    "Not Hispanic or Latino", "2024-02-26", "2024-03-11", -12),
    ("02", "001", "Drug X",  "USA", "1962-09-18", "1", "Black or African American","Hispanic or Latino",     "2024-02-28", "2024-03-13", -12),
    ("02", "002", "Placebo", "USA", "1969-01-25", "2", "White",                    "Not Hispanic or Latino", "2024-03-04", "2024-03-18", -12),
    ("02", "003", "Drug X",  "USA", "1955-06-08", "1", "White",                    "Unknown",                "2024-03-06", "2024-03-20", -12),
]

WEEK12_OFFSET = 84   # study day 85 = first dose + 84


def usubjid(site, subj):
    return f"{STUDYID}-{site}-{subj}"


# ---------------------------------------------------------------------------
# DM  —  demographics (one row per subject)
# ---------------------------------------------------------------------------
dm_header = ["STUDYID", "SITEID", "SUBJID", "BRTHDTC", "SEX", "RACE",
             "ETHNIC", "COUNTRY", "ARM", "RFICDTC", "RANDDTC"]
dm_rows = []
for site, subj, arm, country, brth, sex, race, ethnic, consent, dose1, soff in SUBJECTS:
    rand = iso(plus(dose1, -1))          # randomised the day before first dose
    dm_rows.append([STUDYID, site, subj, crf(d(brth)), sex, race, ethnic,
                    country, arm, crf(d(consent)), crf(d(rand))])
write("dm_raw.csv", dm_header, dm_rows)


# ---------------------------------------------------------------------------
# EX  —  exposure.  TRAP 2 lives here: 02/003 has two dosing periods.
# ---------------------------------------------------------------------------
ex_header = ["STUDYID", "SITEID", "SUBJID", "EXTRT", "EXDOSE", "EXDOSU",
             "EXFREQ", "EXROUTE", "EXSTDTC", "EXENDTC", "EXINTP"]
ex_rows = []
for site, subj, arm, country, brth, sex, race, ethnic, consent, dose1, soff in SUBJECTS:
    dose = "50" if arm == "Drug X" else "0"
    if (site, subj) == ("02", "003"):
        # TRAP 2: dosing interrupted after a hypoglycaemia event on day 18.
        #   period 1: day 1..20, then a gap (day 21..27), then period 2: day 28..84.
        #   EXINTP="Y" is collected but is NOT an SDTM variable - it is dropped.
        ex_rows.append([STUDYID, site, subj, arm, dose, "mg", "QD", "ORAL",
                        crf(d(dose1)), crf(plus(dose1, 19)), "Y"])
        ex_rows.append([STUDYID, site, subj, arm, dose, "mg", "QD", "ORAL",
                        crf(plus(dose1, 27)), crf(plus(dose1, WEEK12_OFFSET)), "Y"])
    else:
        ex_rows.append([STUDYID, site, subj, arm, dose, "mg", "QD", "ORAL",
                        crf(d(dose1)), crf(plus(dose1, WEEK12_OFFSET)), "N"])
write("ex_raw.csv", ex_header, ex_rows)


# ---------------------------------------------------------------------------
# AE  —  adverse events.  Mixed date formats; TRAP 3 (partial date) lives here.
# ---------------------------------------------------------------------------
# Each event: (site, subj, verbatim, start_off, dur_or_None, sev, ser, rel, out, fmt)
#   start_off = days from that subject's first dose (negative = screening)
#   dur       = days to resolution, or None = ongoing (blank end date)
#   fmt       = "slash" | "mon"   (which raw format this row uses)
#   out codes: 1 recovered  2 recovering  3 not recovered
AE_EVENTS = [
    ("01", "001", "feeling sick",       9,  3,   "mild",     "No",  "Possibly related", "1", "slash"),
    ("01", "002", "headache",          14,  1,   "mild",     "No",  "Not related",      "1", "mon"),
    ("01", "003", "low blood sugar",   16,  1,   "moderate", "No",  "Related",          "1", "slash"),
    ("02", "001", "sinus congestion", None, None, "mild",    "No",  "Not related",      "3", "partial"),  # TRAP 3
    ("02", "001", "headache",           8,  2,   "mild",     "No",  "Possibly related", "1", "mon"),
    ("02", "003", "low blood sugar",   18,  2,   "severe",   "No",  "Related",          "1", "slash"),
    ("02", "003", "nausea",            30, None, "mild",     "No",  "Possibly related", "3", "mon"),
]

# verbatim -> illustrative MedDRA Preferred Term (NOTE the British spellings and
# the verbatim/coded mismatches — AEDECOD can never be derived by string rules).
AEDECOD = {
    "feeling sick":     "Nausea",
    "headache":         "Headache",
    "low blood sugar":  "Hypoglycaemia",
    "sinus congestion": "Sinus congestion",
    "nausea":           "Nausea",
}

DOSE1 = {(s, j): dz for s, j, a, c, b, x, r, e, cn, dz, so in SUBJECTS}

ae_header = ["STUDYID", "SITEID", "SUBJID", "AETERM", "AESTDT", "AEENDT",
             "AESEV", "AESER", "AEREL", "AEOUT"]
ae_rows = []
for site, subj, term, soff, dur, sev, ser, rel, out, fmt in AE_EVENTS:
    if fmt == "partial":
        # TRAP 3: a screening AE the subject dates only to a month.
        st_raw = "FEB-2024"       # month + year, no day
        en_raw = ""               # ongoing at the timepoints collected
    else:
        fn = ae_slash if fmt == "slash" else ae_mon
        st = plus(DOSE1[(site, subj)], soff)
        st_raw = fn(st)
        en_raw = fn(plus(DOSE1[(site, subj)], soff + dur)) if dur is not None else ""
    ae_rows.append([STUDYID, site, subj, term, st_raw, en_raw, sev, ser, rel, out])
write("ae_raw.csv", ae_header, ae_rows)


# ---------------------------------------------------------------------------
# VS  —  vital signs (WIDE).  TRAP 1 lives here: per-row collected units.
# ---------------------------------------------------------------------------
# Site 01 collects metric (kg, °C); site 02 collects US customary (lb, °F).
# The raw carries the COLLECTED unit per measurement so the mapping can convert.
# Height is measured once at SCREENING only (cm everywhere).
vs_header = ["STUDYID", "SITEID", "SUBJID", "VISIT", "VSDT",
             "SYSBP", "DIABP", "PULSE", "TEMP", "TEMPU",
             "HEIGHT", "WEIGHT", "WEIGHTU", "VSND"]

# per subject: (screening tuple, baseline tuple, week12 tuple)
#   each tuple = (sysbp, diabp, pulse, temp, height_or_blank, weight)
#   values are already in the site's COLLECTED units.
VS_DATA = {
    ("01", "001"): [(138, 84, 74, 36.7, 172, 91.5), (136, 82, 72, 36.6, "", 90.8), (132, 80, 70, 36.6, "", 88.4)],
    ("01", "002"): [(142, 88, 78, 36.8, 165, 84.0), (140, 86, 76, 36.7, "", 83.6), (141, 87, 77, 36.8, "", 84.1)],
    ("01", "003"): [(129, 79, 68, 36.5, 160, 72.3), (128, 78, 70, 36.6, "", 71.6), (126, 76, 69, 36.5, "", 69.9)],
    # site 02 — lb and °F
    ("02", "001"): [(145, 90, 80, 98.2, 178, 205.0), (144, 88, 78, 98.1, "", 203.5), (139, 85, 74, 98.0, "", 198.4)],
    ("02", "002"): [(136, 85, 76, 98.4, 170, 189.6), (135, 84, 75, 98.3, "", 190.0), (137, 86, 77, 98.4, "", 189.2)],
    ("02", "003"): [(150, 92, 82, 98.6, 175, 220.5), (148, 90, 80, 98.5, "", 218.9), (143, 86, 76, 98.2, "", 213.8)],
}
VISITS = ["SCREENING", "BASELINE", "WEEK 12"]

vs_rows = []
for site, subj, arm, country, brth, sex, race, ethnic, consent, dose1, soff in SUBJECTS:
    tempu = "C" if site == "01" else "F"
    wtu = "kg" if site == "01" else "lb"
    for vi, visit in enumerate(VISITS):
        if visit == "SCREENING":
            vdt = plus(dose1, soff)
        elif visit == "BASELINE":
            vdt = d(dose1)
        else:
            vdt = plus(dose1, WEEK12_OFFSET)
        sysbp, diabp, pulse, temp, height, weight = VS_DATA[(site, subj)][vi]
        vs_rows.append([STUDYID, site, subj, visit, crf(vdt),
                        sysbp, diabp, pulse, temp, tempu, height, weight, wtu, "N"])
write("vs_raw.csv", vs_header, vs_rows)


# ---------------------------------------------------------------------------
# LB  —  laboratory (TALL).  TRAP 4 lives here: 02/003 high ALT, no AE.
# ---------------------------------------------------------------------------
# Four tests, two visits (BASELINE, WEEK 12), four subjects have labs.
# LBTEST carries the LAB's name; the SDTM LBTEST/LBTESTCD come from CDISC CT
# (HbA1c -> Hemoglobin A1C, Fasting Glucose -> Glucose).
lb_header = ["STUDYID", "SITEID", "SUBJID", "VISIT", "LBDT",
             "LBTEST", "LBORRES", "LBORRESU", "LBORNRLO", "LBORNRHI"]

# test -> (unit, low, high)
LB_TESTS = {
    "HbA1c":            ("%",     "4.0", "5.6"),
    "Fasting Glucose":  ("mg/dL", "70",  "99"),
    "Creatinine":       ("mg/dL", "0.6", "1.3"),
    "ALT":              ("U/L",   "7",   "56"),
}
# per subject per visit: HbA1c, Glucose, Creatinine, ALT
#   Drug X subjects improve HbA1c/glucose from baseline to week 12; placebo flat.
#   02/003 has a HIGH ALT at week 12 (72) with NO adverse event -> TRAP 4.
LB_DATA = {
    ("01", "001"): {"BASELINE": ("7.9", "156", "0.9", "28"), "WEEK 12": ("6.8", "132", "0.9", "31")},
    ("01", "003"): {"BASELINE": ("8.2", "168", "0.8", "24"), "WEEK 12": ("7.1", "140", "0.8", "26")},
    ("02", "001"): {"BASELINE": ("8.5", "175", "1.1", "30"), "WEEK 12": ("7.3", "149", "1.1", "33")},
    ("02", "003"): {"BASELINE": ("8.8", "182", "1.0", "27"), "WEEK 12": ("7.6", "151", "1.2", "72")},  # ALT high
}
LB_VISITS = ["BASELINE", "WEEK 12"]

lb_rows = []
for site, subj, arm, country, brth, sex, race, ethnic, consent, dose1, soff in SUBJECTS:
    if (site, subj) not in LB_DATA:
        continue
    for visit in LB_VISITS:
        vdt = d(dose1) if visit == "BASELINE" else plus(dose1, WEEK12_OFFSET)
        vals = LB_DATA[(site, subj)][visit]
        for test, res in zip(["HbA1c", "Fasting Glucose", "Creatinine", "ALT"], vals):
            unit, lo, hi = LB_TESTS[test]
            lb_rows.append([STUDYID, site, subj, visit, crf(vdt),
                            test, res, unit, lo, hi])
write("lb_raw.csv", lb_header, lb_rows)

print("\nAll mock raw files generated for capstone study DEF-01")
