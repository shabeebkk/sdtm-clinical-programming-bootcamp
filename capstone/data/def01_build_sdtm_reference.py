#!/usr/bin/env python3
"""
def01_build_sdtm_reference.py — the REFERENCE SDTM datasets for capstone study DEF-01.

This is the instructor's worked answer. Trainees build the same domains from the raw
CSVs in Notebook 13; verify_against_reference compares their output to these files.

Produces sdtm/{dm,ex,ae,suppae,vs,lb}.csv from the raw CSVs.

Dictionary coding (AEDECOD, LBTEST) is ILLUSTRATIVE — real coding needs licensed
MedDRA / CDISC CT. See def01_data_dictionary.md.

Run (after def01_generate_mock_data.py):  python3 def01_build_sdtm_reference.py
"""

import csv
import os
import calendar
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
SDTM = os.path.join(HERE, "sdtm")
os.makedirs(SDTM, exist_ok=True)
STUDYID = "DEF-01"

MONTHS = {m.upper(): i for i, m in enumerate(calendar.month_abbr) if m}


def rd(name):
    with open(os.path.join(HERE, name), newline="") as f:
        return list(csv.DictReader(f))


def wr(name, header, rows):
    with open(os.path.join(SDTM, name), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(header)
        for r in rows:
            w.writerow([r.get(c, "") for c in header])
    print(f"wrote sdtm/{name:12s} {len(rows):3d} rows")


# ---------------------------------------------------------------------------
# date parsing
# ---------------------------------------------------------------------------
def parse_crf(s):
    """DD-MMM-YYYY -> datetime."""
    return datetime.strptime(s, "%d-%b-%Y")


def parse_ae(s):
    """AE dates: DD/MM/YYYY, DD-Mon-YYYY, or a PARTIAL 'MON-YYYY' (no day).
    Returns (datetime_or_None, iso_string, is_partial)."""
    s = s.strip()
    if not s:
        return None, "", False
    if "/" in s:
        dt = datetime.strptime(s, "%d/%m/%Y")
        return dt, dt.strftime("%Y-%m-%d"), False
    parts = s.split("-")
    if len(parts) == 2:                      # PARTIAL: MON-YYYY, no day
        mon, yyyy = parts
        m = MONTHS[mon.upper()]
        return None, f"{yyyy}-{m:02d}", True
    dt = datetime.strptime(s, "%d-%b-%Y")
    return dt, dt.strftime("%Y-%m-%d"), False


def study_day(dtc_dt, ref_dt):
    """--DY from two datetimes. No Day 0. None if either is missing."""
    if dtc_dt is None or ref_dt is None:
        return ""
    diff = (dtc_dt - ref_dt).days
    return str(diff + 1 if dtc_dt >= ref_dt else diff)


def usub(site, subj):
    return f"{STUDYID}-{site}-{subj}"


# ===========================================================================
# reference dates from EX (first/last dose), handling the 02/003 interruption
# ===========================================================================
ex_raw = rd("ex_raw.csv")
ref = {}   # (site,subj) -> {first: dt, last: dt}
for r in ex_raw:
    k = (r["SITEID"], r["SUBJID"])
    st, en = parse_crf(r["EXSTDTC"]), parse_crf(r["EXENDTC"])
    d = ref.setdefault(k, {"first": st, "last": en})
    d["first"] = min(d["first"], st)     # first dose = earliest start
    d["last"] = max(d["last"], en)       # last dose  = latest end
RFST = {k: v["first"] for k, v in ref.items()}


# ===========================================================================
# DM
# ===========================================================================
dm_cols = ["STUDYID", "DOMAIN", "USUBJID", "SUBJID", "RFSTDTC", "RFENDTC",
           "RFXSTDTC", "RFXENDTC", "RFICDTC", "RFPENDTC", "DTHDTC", "DTHFL",
           "SITEID", "AGE", "AGEU", "SEX", "RACE", "ETHNIC", "ARMCD", "ARM",
           "ACTARMCD", "ACTARM", "COUNTRY"]
RACE_CT = {"WHITE": "WHITE", "ASIAN": "ASIAN",
           "BLACK OR AFRICAN AMERICAN": "BLACK OR AFRICAN AMERICAN"}
dm_rows = []
for r in rd("dm_raw.csv"):
    k = (r["SITEID"], r["SUBJID"])
    brth = parse_crf(r["BRTHDTC"])
    ic = parse_crf(r["RFICDTC"])
    age = ic.year - brth.year - ((ic.month, ic.day) < (brth.month, brth.day))
    armcd = "X" if r["ARM"] == "Drug X" else "P"
    rfst = RFST[k]
    rfen = ref[k]["last"]
    dm_rows.append({
        "STUDYID": STUDYID, "DOMAIN": "DM", "USUBJID": usub(*k),
        "SUBJID": r["SUBJID"],
        "RFSTDTC": rfst.strftime("%Y-%m-%d"), "RFENDTC": rfen.strftime("%Y-%m-%d"),
        "RFXSTDTC": rfst.strftime("%Y-%m-%d"), "RFXENDTC": rfen.strftime("%Y-%m-%d"),
        "RFICDTC": ic.strftime("%Y-%m-%d"),
        "RFPENDTC": "",          # no DS in capstone scope -> end of participation not collected
        "DTHDTC": "", "DTHFL": "",
        "SITEID": r["SITEID"], "AGE": str(age), "AGEU": "YEARS",
        "SEX": {"1": "M", "2": "F"}[r["SEX"]],
        "RACE": RACE_CT[r["RACE"].strip().upper()],
        "ETHNIC": r["ETHNIC"].strip().upper(),
        "ARMCD": armcd, "ARM": r["ARM"], "ACTARMCD": armcd, "ACTARM": r["ARM"],
        "COUNTRY": r["COUNTRY"],
    })
wr("dm.csv", dm_cols, dm_rows)


# ===========================================================================
# EX  (TRAP 2: 02/003 -> two records, EXSEQ 1 and 2)
# ===========================================================================
ex_cols = ["STUDYID", "DOMAIN", "USUBJID", "EXSEQ", "EXTRT", "EXDOSE", "EXDOSU",
           "EXDOSFRQ", "EXROUTE", "EXSTDTC", "EXENDTC", "EXSTDY", "EXENDY"]
ex_tmp = []
for r in ex_raw:
    k = (r["SITEID"], r["SUBJID"])
    st, en = parse_crf(r["EXSTDTC"]), parse_crf(r["EXENDTC"])
    ex_tmp.append({
        "USUBJID": usub(*k), "_st": st,
        "STUDYID": STUDYID, "DOMAIN": "EX",
        "EXTRT": r["EXTRT"], "EXDOSE": r["EXDOSE"], "EXDOSU": r["EXDOSU"],
        "EXDOSFRQ": r["EXFREQ"], "EXROUTE": r["EXROUTE"],   # EXFREQ -> EXDOSFRQ; EXINTP dropped
        "EXSTDTC": st.strftime("%Y-%m-%d"), "EXENDTC": en.strftime("%Y-%m-%d"),
        "EXSTDY": study_day(st, RFST[k]), "EXENDY": study_day(en, RFST[k]),
    })
ex_tmp.sort(key=lambda x: (x["USUBJID"], x["_st"]))
seq, prev = 0, None
ex_rows = []
for x in ex_tmp:
    seq = 1 if x["USUBJID"] != prev else seq + 1
    x["EXSEQ"], prev = str(seq), x["USUBJID"]
    ex_rows.append(x)
wr("ex.csv", ex_cols, ex_rows)


# ===========================================================================
# AE + SUPPAE  (TRAP 3: partial date -> AESTDY null, AETRTEM still N)
# ===========================================================================
ae_cols = ["STUDYID", "DOMAIN", "USUBJID", "AESEQ", "AETERM", "AEDECOD",
           "AESEV", "AESER", "AEREL", "AEOUT", "AESTDTC", "AEENDTC",
           "AESTDY", "AEENDY"]
AEDECOD = {"feeling sick": "Nausea", "headache": "Headache",
           "low blood sugar": "Hypoglycaemia", "sinus congestion": "Sinus congestion",
           "nausea": "Nausea"}
AEOUT = {"1": "RECOVERED/RESOLVED", "2": "RECOVERING/RESOLVING",
         "3": "NOT RECOVERED/NOT RESOLVED", "4": "FATAL", "5": "UNKNOWN"}
ae_tmp = []
for r in rd("ae_raw.csv"):
    k = (r["SITEID"], r["SUBJID"])
    rfst = RFST[k]
    st_dt, st_iso, st_partial = parse_ae(r["AESTDT"])
    en_dt, en_iso, en_partial = parse_ae(r["AEENDT"])
    aestdy = study_day(st_dt, rfst)
    aeendy = study_day(en_dt, rfst)

    # AETRTEM (goes to SUPPAE): treatment-emergent = started on/after first dose.
    if st_dt is not None:
        trtem = "Y" if aestdy != "" and int(aestdy) >= 1 else "N"
    else:
        # PARTIAL date: use the LATEST possible day of the partial window. If even
        # that is before first dose, the event cannot be treatment-emergent -> N.
        yyyy, mm = map(int, st_iso.split("-"))
        last_day = datetime(yyyy, mm, calendar.monthrange(yyyy, mm)[1])
        trtem = "N" if last_day < rfst else "Y"

    ae_tmp.append({
        "USUBJID": usub(*k), "_sortdt": st_iso, "_trtem": trtem,
        "STUDYID": STUDYID, "DOMAIN": "AE", "AETERM": r["AETERM"],
        "AEDECOD": AEDECOD[r["AETERM"]],
        "AESEV": r["AESEV"].strip().upper(),
        "AESER": "Y" if r["AESER"].strip().upper() in ("Y", "YES") else "N",
        "AEREL": r["AEREL"].strip().upper(), "AEOUT": AEOUT[r["AEOUT"]],
        "AESTDTC": st_iso, "AEENDTC": en_iso,
        "AESTDY": aestdy, "AEENDY": aeendy,
    })
ae_tmp.sort(key=lambda x: (x["USUBJID"], x["_sortdt"], x["AETERM"]))
seq, prev = 0, None
ae_rows = []
for x in ae_tmp:
    seq = 1 if x["USUBJID"] != prev else seq + 1
    x["AESEQ"], prev = str(seq), x["USUBJID"]
    ae_rows.append(x)
wr("ae.csv", ae_cols, ae_rows)

# SUPPAE — one AETRTEM per AE record
supp_cols = ["STUDYID", "RDOMAIN", "USUBJID", "IDVAR", "IDVARVAL",
             "QNAM", "QLABEL", "QVAL", "QORIG", "QEVAL"]
supp_rows = [{
    "STUDYID": STUDYID, "RDOMAIN": "AE", "USUBJID": x["USUBJID"],
    "IDVAR": "AESEQ", "IDVARVAL": x["AESEQ"], "QNAM": "AETRTEM",
    "QLABEL": "Treatment Emergent Flag", "QVAL": x["_trtem"],
    "QORIG": "DERIVED", "QEVAL": "",
} for x in ae_rows]
wr("suppae.csv", supp_cols, supp_rows)


# ===========================================================================
# VS  (TRAP 1: transpose + unit conversion for site 02)
# ===========================================================================
vs_cols = ["STUDYID", "DOMAIN", "USUBJID", "VSSEQ", "VSTESTCD", "VSTEST",
           "VSORRES", "VSORRESU", "VSSTRESC", "VSSTRESN", "VSSTRESU",
           "VSBLFL", "VISITNUM", "VISIT", "VSDTC", "VSDY"]
VISNUM = {"SCREENING": 1, "BASELINE": 2, "WEEK 12": 3}
# test -> (VSTESTCD, VSTEST, fixed_unit_or_None)   None = unit comes from a raw column
VSTESTS = [
    ("SYSBP",  "Systolic Blood Pressure",  "mmHg"),
    ("DIABP",  "Diastolic Blood Pressure", "mmHg"),
    ("PULSE",  "Pulse Rate",               "beats/min"),
    ("TEMP",   "Temperature",              None),   # unit from TEMPU
    ("HEIGHT", "Height",                   "cm"),
    ("WEIGHT", "Weight",                   None),   # unit from WEIGHTU
]
RAWCOL = {"SYSBP": "SYSBP", "DIABP": "DIABP", "PULSE": "PULSE",
          "TEMP": "TEMP", "HEIGHT": "HEIGHT", "WEIGHT": "WEIGHT"}
ORD = {t[0]: i for i, t in enumerate(VSTESTS, 1)}


def lb_to_kg(v):
    return round(v * 0.45359237, 1)


def f_to_c(v):
    return round((v - 32) * 5 / 9, 1)


def numtext(x):
    """Render a float without a spurious trailing zero problem: 93.0 -> '93',
    36.8 -> '36.8'. Matches how a numeric prints (STRESN is numeric)."""
    if x == int(x):
        return str(int(x))
    return str(x)


vs_tmp = []
for r in rd("vs_raw.csv"):
    k = (r["SITEID"], r["SUBJID"])
    visit = r["VISIT"]
    vdt = parse_crf(r["VSDT"])
    vsdtc = vdt.strftime("%Y-%m-%d")
    vsdy = study_day(vdt, RFST[k])
    for cd, nm, fixed in VSTESTS:
        raw = r[RAWCOL[cd]]
        if raw == "":
            continue                          # not measured (e.g. HEIGHT after screening)
        orres = raw                           # as collected
        if fixed is not None:
            orresu = fixed
            stresc = orres
            stresn = numtext(float(orres))
            stresu = fixed
        elif cd == "WEIGHT":
            orresu = r["WEIGHTU"]              # kg or lb, as collected
            if orresu == "lb":
                kg = lb_to_kg(float(orres))
                stresc, stresn, stresu = numtext(kg), numtext(kg), "kg"
            else:
                stresc, stresn, stresu = orres, numtext(float(orres)), "kg"
        else:  # TEMP
            orresu = r["TEMPU"]               # C or F, as collected
            if orresu == "F":
                c = f_to_c(float(orres))
                stresc, stresn, stresu = numtext(c), numtext(c), "C"
            else:
                stresc, stresn, stresu = orres, numtext(float(orres)), "C"
        vs_tmp.append({
            "USUBJID": usub(*k), "_ord": ORD[cd], "_vnum": VISNUM[visit],
            "STUDYID": STUDYID, "DOMAIN": "VS", "VSTESTCD": cd, "VSTEST": nm,
            "VSORRES": orres, "VSORRESU": orresu, "VSSTRESC": stresc,
            "VSSTRESN": stresn, "VSSTRESU": stresu, "VSBLFL": "",
            "VISITNUM": str(VISNUM[visit]), "VISIT": visit,
            "VSDTC": vsdtc, "VSDY": vsdy,
        })

# baseline flag: latest pre-dose (VSDY<=1) per subject+test, only if a post-dose value exists
haspost = {(x["USUBJID"], x["VSTESTCD"]) for x in vs_tmp if x["VSDY"] != "" and int(x["VSDY"]) > 1}
maxpre = {}
for x in vs_tmp:
    key = (x["USUBJID"], x["VSTESTCD"])
    if x["VSDY"] != "" and int(x["VSDY"]) <= 1 and key in haspost:
        maxpre[key] = max(maxpre.get(key, -10**9), int(x["VISITNUM"]))
for x in vs_tmp:
    key = (x["USUBJID"], x["VSTESTCD"])
    if x["VSDY"] != "" and int(x["VSDY"]) <= 1 and maxpre.get(key) == int(x["VISITNUM"]):
        x["VSBLFL"] = "Y"

vs_tmp.sort(key=lambda x: (x["USUBJID"], x["_vnum"], x["_ord"]))
seq, prev = 0, None
vs_rows = []
for x in vs_tmp:
    seq = 1 if x["USUBJID"] != prev else seq + 1
    x["VSSEQ"], prev = str(seq), x["USUBJID"]
    vs_rows.append(x)
wr("vs.csv", vs_cols, vs_rows)


# ===========================================================================
# LB  (TRAP 4: high ALT for 02/003 at Week 12, no AE)
# ===========================================================================
lb_cols = ["STUDYID", "DOMAIN", "USUBJID", "LBSEQ", "LBTESTCD", "LBTEST", "LBCAT",
           "LBORRES", "LBORRESU", "LBORNRLO", "LBORNRHI", "LBSTRESC", "LBSTRESN",
           "LBSTRESU", "LBSTNRLO", "LBSTNRHI", "LBNRIND", "LBBLFL",
           "VISITNUM", "VISIT", "LBDTC", "LBDY"]
# raw LBTEST -> (LBTESTCD, SDTM LBTEST, LBCAT, order)
LBMAP = {
    "HbA1c":           ("HBA1C", "Hemoglobin A1C",           "CHEMISTRY",  1),
    "Fasting Glucose": ("GLUC",  "Glucose",                  "CHEMISTRY",  2),
    "Creatinine":      ("CREAT", "Creatinine",               "CHEMISTRY",  3),
    "ALT":             ("ALT",   "Alanine Aminotransferase", "CHEMISTRY",  4),
}
LBVISNUM = {"BASELINE": 2, "WEEK 12": 3}


def num(s):
    try:
        return float(s)
    except (ValueError, TypeError):
        return None


lb_tmp = []
for r in rd("lb_raw.csv"):
    k = (r["SITEID"], r["SUBJID"])
    cd, nm, cat, order = LBMAP[r["LBTEST"]]
    vdt = parse_crf(r["LBDT"])
    res, lo, hi = num(r["LBORRES"]), num(r["LBORNRLO"]), num(r["LBORNRHI"])
    if res is None or lo is None or hi is None:
        nrind = ""
    elif res < lo:
        nrind = "LOW"
    elif res > hi:
        nrind = "HIGH"
    else:
        nrind = "NORMAL"
    lb_tmp.append({
        "USUBJID": usub(*k), "_ord": order, "_vnum": LBVISNUM[r["VISIT"]],
        "STUDYID": STUDYID, "DOMAIN": "LB", "LBTESTCD": cd, "LBTEST": nm,
        "LBCAT": cat, "LBORRES": r["LBORRES"], "LBORRESU": r["LBORRESU"],
        "LBORNRLO": r["LBORNRLO"], "LBORNRHI": r["LBORNRHI"],
        "LBSTRESC": r["LBORRES"],
        # LBSTRESN is NUMERIC: it cannot carry a trailing zero. Writing the raw
        # string would put "1.0" in a numeric column, which SAS renders as "1".
        "LBSTRESN": numtext(res) if res is not None else "",
        "LBSTRESU": r["LBORRESU"],
        "LBSTNRLO": r["LBORNRLO"], "LBSTNRHI": r["LBORNRHI"],
        "LBNRIND": nrind, "LBBLFL": "",
        "VISITNUM": str(LBVISNUM[r["VISIT"]]), "VISIT": r["VISIT"],
        "LBDTC": vdt.strftime("%Y-%m-%d"), "LBDY": study_day(vdt, RFST[k]),
    })

haspost = {(x["USUBJID"], x["LBTESTCD"]) for x in lb_tmp if int(x["LBDY"]) > 1}
maxpre = {}
for x in lb_tmp:
    key = (x["USUBJID"], x["LBTESTCD"])
    if int(x["LBDY"]) <= 1 and key in haspost:
        maxpre[key] = max(maxpre.get(key, -10**9), int(x["VISITNUM"]))
for x in lb_tmp:
    key = (x["USUBJID"], x["LBTESTCD"])
    if int(x["LBDY"]) <= 1 and maxpre.get(key) == int(x["VISITNUM"]):
        x["LBBLFL"] = "Y"

lb_tmp.sort(key=lambda x: (x["USUBJID"], x["_vnum"], x["_ord"]))
seq, prev = 0, None
lb_rows = []
for x in lb_tmp:
    seq = 1 if x["USUBJID"] != prev else seq + 1
    x["LBSEQ"], prev = str(seq), x["USUBJID"]
    lb_rows.append(x)
wr("lb.csv", lb_cols, lb_rows)

print("\nReference SDTM built for capstone study DEF-01")
