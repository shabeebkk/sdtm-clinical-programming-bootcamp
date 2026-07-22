#!/usr/bin/env python3
"""
build_adam_reference.py — derive the TARGET ADaM datasets from the ABC-01 SDTM datasets.

ALL DATA IS SYNTHETIC. This is the reference ("answer key") implementation of the
derivations documented in adam_specification.md. Trainees build these by hand in
SAS; this script produces the expected result to check against.

Reads  : sdtm/dm.csv, sdtm/ds.csv, sdtm/ex.csv, sdtm/ae.csv, sdtm/suppae.csv,
         sdtm/vs.csv, sdtm/lb.csv
Writes : adam/adsl.csv, adam/adae.csv, adam/advs.csv, adam/adlb.csv, adam/adtte.csv

Structured to mirror ADaMIG v1.2 (with OCCDS v1.0 for ADAE and the ADaM TTE
spec for ADTTE). Coded terms that would come from a licensed dictionary
(MedDRA for AE) are ILLUSTRATIVE ONLY — see the spec.

TWO CONVENTIONS THAT MATTER, because they are where SAS and this script could
silently disagree:

  1. ADaM --DT variables are NUMERIC SAS dates, not the character ISO 8601 --DTC
     of SDTM. A CSV cannot carry "numeric date", so this reference writes the ISO
     text and the SAS comparison applies PUT(var, YYMMDD10.) before comparing.
     The variable is still numeric in the dataset trainees build.

  2. Floating point is not associative and SAS and Python round differently at
     the last bit. Every derived non-integer is therefore ROUNDED EXPLICITLY, to
     a precision the spec names, in both implementations. 70.2 - 70.5 is
     -0.29999999999999716 in both languages; only the rounding makes it -0.3.
"""

import csv, os
from datetime import date

STUDYID = "ABC-01"
HERE = os.path.dirname(os.path.abspath(__file__))
SDTM = os.path.join(HERE, "sdtm")
OUTDIR = os.path.join(HERE, "adam")

# Rounding precision, mirrored exactly in the SAS notebooks. See module docstring.
PREC_CHG = 4        # round(CHG, 0.0001)  — kills float noise, keeps real precision
PREC_PCHG = 4       # round(PCHG, 0.0001)
PREC_BMI = 2        # round(BMI, 0.01)

# ---------------------------------------------------------------- utilities


def numtext(v):
    """Render a value the way a NUMERIC ADaM variable would.

    A number has no trailing zero: 82.0 IS 82. Writing "82.0" into a numeric
    variable's reference column would make the reference disagree with SAS.
    Character variables (AVALC, PARAM, ...) never go through this.
    """
    if v is None or v == "":
        return ""
    try:
        f = float(v)
    except (TypeError, ValueError):
        return ""
    return str(int(f)) if f == int(f) else str(f)


def num(v):
    """Parse an SDTM numeric-as-text value, or None when it is missing."""
    if v is None or v == "":
        return None
    try:
        return float(v)
    except ValueError:
        return None


def d(iso):
    """Parse a complete ISO 8601 date. Partial or missing dates give None."""
    if not iso or len(iso) < 10:
        return None
    return date(int(iso[0:4]), int(iso[5:7]), int(iso[8:10]))


def iso(dt):
    return dt.isoformat() if dt else ""


def study_day(dt, trtsdt):
    """ADaM --DY relative to treatment start. There is no Day 0: the day before
    Day 1 is Day -1. Identical rule to SDTM --DY, but anchored on TRTSDT."""
    if dt is None or trtsdt is None:
        return None
    delta = (dt - trtsdt).days
    return delta + 1 if delta >= 0 else delta


def read(name):
    with open(os.path.join(SDTM, name)) as f:
        return list(csv.DictReader(f))


def write(name, header, rows):
    os.makedirs(OUTDIR, exist_ok=True)
    path = os.path.join(OUTDIR, name)
    with open(path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=header, extrasaction="raise")
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in header})
    print(f"  {name:<12} {len(rows):>4} rows")


# ---------------------------------------------------------------- read SDTM

dm = read("dm.csv")
ds = read("ds.csv")
ex = read("ex.csv")
ae = read("ae.csv")
suppae = read("suppae.csv")
vs = read("vs.csv")
lb = read("lb.csv")

# ---------------------------------------------------------------- ADSL

# Treatment decodes. Placebo is 1 so it sorts first as the reference arm in
# every table; Drug A is 2. TRTxxPN is display order, not a dose.
TRTN = {"Placebo": 1, "Drug A": 2}

# Disposition: one DISPOSITION EVENT record per subject carries the outcome.
disp = {r["USUBJID"]: r for r in ds if r["DSCAT"] == "DISPOSITION EVENT"}
rand = {r["USUBJID"]: r for r in ds if r["DSDECOD"] == "RANDOMIZED"}


def baseline_vs(usubjid, testcd, trtsdt):
    """ADaM baseline: the LAST non-missing result on or before first dose.

    This is NOT a copy of VSBLFL. VSBLFL is 'Y' at the BASELINE visit only, and
    HEIGHT is collected only at SCREENING — so a straight copy would leave every
    subject with no baseline height and therefore no BMI. The date rule picks
    BASELINE for the parameters measured there and SCREENING for height.
    """
    best, best_dt = None, None
    for r in vs:
        if r["USUBJID"] != usubjid or r["VSTESTCD"] != testcd:
            continue
        dt, val = d(r["VSDTC"]), num(r["VSSTRESN"])
        if dt is None or val is None or trtsdt is None or dt > trtsdt:
            continue
        if best_dt is None or dt > best_dt:
            best, best_dt = val, dt
    return best


adsl_rows = []
for r in dm:
    u = r["USUBJID"]
    trtsdt, trtedt = d(r["RFXSTDTC"]), d(r["RFXENDTC"])
    dsr = disp.get(u)
    completed = bool(dsr) and dsr["DSDECOD"] == "COMPLETED"
    age = num(r["AGE"])

    heightbl = baseline_vs(u, "HEIGHT", trtsdt)
    weightbl = baseline_vs(u, "WEIGHT", trtsdt)
    bmibl = None
    if heightbl and weightbl:
        bmibl = round(weightbl / (heightbl / 100.0) ** 2, PREC_BMI)

    adsl_rows.append({
        "STUDYID": r["STUDYID"], "USUBJID": u, "SUBJID": r["SUBJID"],
        "SITEID": r["SITEID"], "COUNTRY": r["COUNTRY"],
        "ARM": r["ARM"], "ACTARM": r["ACTARM"],
        "TRT01P": r["ARM"], "TRT01PN": TRTN.get(r["ARM"], ""),
        "TRT01A": r["ACTARM"], "TRT01AN": TRTN.get(r["ACTARM"], ""),
        "AGE": numtext(r["AGE"]), "AGEU": r["AGEU"],
        "AGEGR1": "<65" if age is not None and age < 65 else ">=65",
        "AGEGR1N": 1 if age is not None and age < 65 else 2,
        "SEX": r["SEX"], "RACE": r["RACE"], "ETHNIC": r["ETHNIC"],
        "RFICDT": r["RFICDTC"],
        "RANDDT": rand[u]["DSSTDTC"] if u in rand else "",
        "TRTSDT": iso(trtsdt), "TRTEDT": iso(trtedt),
        "TRTDURD": (trtedt - trtsdt).days + 1 if trtsdt and trtedt else "",
        "EOSSTT": "COMPLETED" if completed else "DISCONTINUED",
        "DCSREAS": "" if completed else (dsr["DSDECOD"] if dsr else ""),
        "DCSREASP": "" if completed else (dsr["DSTERM"] if dsr else ""),
        # Safety = took at least one dose. ITT = was randomised. Both are 'Y'
        # for all 8 here, but they are different questions and real studies
        # separate them; the notebook makes trainees derive each on its own rule.
        "SAFFL": "Y" if trtsdt else "N",
        "ITTFL": "Y" if u in rand else "N",
        "COMPLFL": "Y" if completed else "N",
        "HEIGHTBL": numtext(heightbl), "WEIGHTBL": numtext(weightbl),
        "BMIBL": numtext(bmibl),
    })

ADSL_HDR = ["STUDYID", "USUBJID", "SUBJID", "SITEID", "COUNTRY",
            "ARM", "ACTARM", "TRT01P", "TRT01PN", "TRT01A", "TRT01AN",
            "AGE", "AGEU", "AGEGR1", "AGEGR1N", "SEX", "RACE", "ETHNIC",
            "RFICDT", "RANDDT", "TRTSDT", "TRTEDT", "TRTDURD",
            "EOSSTT", "DCSREAS", "DCSREASP", "SAFFL", "ITTFL", "COMPLFL",
            "HEIGHTBL", "WEIGHTBL", "BMIBL"]

# Subject-level lookup every other dataset merges from. ADSL is the ONLY source
# of population flags and treatment variables — never re-derive them downstream.
ADSL = {r["USUBJID"]: r for r in adsl_rows}

# ---------------------------------------------------------------- ADAE

SEVN = {"MILD": 1, "MODERATE": 2, "SEVERE": 3}
# Causality collapsed to a yes/no analysis flag. The four collected values are
# kept in AEREL; AREL is what the tables actually group on.
REL_Y = {"RELATED", "POSSIBLY RELATED"}

# Treatment-emergent flag is NOT re-derived here — it is read from SUPPAE, where
# the SDTM course already derived it as AETRTEM. That is traceability: one
# derivation, one home, and ADaM points back at it.
trtem = {(r["USUBJID"], r["IDVARVAL"]): r["QVAL"]
         for r in suppae if r["QNAM"] == "AETRTEM"}

adae_rows = []
for r in ae:
    u = r["USUBJID"]
    s = ADSL[u]
    trtsdt = d(s["TRTSDT"])
    astdt, aendt = d(r["AESTDTC"]), d(r["AEENDTC"])
    adae_rows.append({
        "STUDYID": r["STUDYID"], "USUBJID": u, "SUBJID": s["SUBJID"],
        "SITEID": s["SITEID"],
        "TRTA": s["TRT01A"], "TRTAN": s["TRT01AN"],
        "AGE": s["AGE"], "AGEGR1": s["AGEGR1"], "AGEGR1N": s["AGEGR1N"],
        "SEX": s["SEX"], "RACE": s["RACE"], "SAFFL": s["SAFFL"],
        "TRTSDT": s["TRTSDT"], "TRTEDT": s["TRTEDT"],
        "AESEQ": r["AESEQ"], "AETERM": r["AETERM"], "AEDECOD": r["AEDECOD"],
        "AESEV": r["AESEV"], "ASEVN": SEVN.get(r["AESEV"], ""),
        "AESER": r["AESER"], "AEREL": r["AEREL"],
        "AREL": "Y" if r["AEREL"] in REL_Y else "N",
        "AEOUT": r["AEOUT"],
        "ASTDT": iso(astdt), "AENDT": iso(aendt),
        "ASTDY": study_day(astdt, trtsdt) if astdt else "",
        "AENDY": study_day(aendt, trtsdt) if aendt else "",
        # An ongoing AE has no end date, so no duration. Missing, not zero.
        "ADURN": (aendt - astdt).days + 1 if astdt and aendt else "",
        "TRTEMFL": trtem.get((u, r["AESEQ"]), ""),
    })

# Occurrence flags. Both are restricted to treatment-emergent events, and both
# mark exactly ONE row so that a count of the flag is a count of subjects.
# Order events by start date, then AESEQ, so the flag is deterministic.
adae_rows.sort(key=lambda x: (x["USUBJID"], x["ASTDT"], int(x["AESEQ"])))
seen_subj, seen_pt = set(), set()
for x in adae_rows:
    if x["TRTEMFL"] != "Y":
        x["AOCCFL"] = ""
        x["AOCCPFL"] = ""
        continue
    u, pt = x["USUBJID"], x["AEDECOD"]
    x["AOCCFL"] = "" if u in seen_subj else "Y"
    x["AOCCPFL"] = "" if (u, pt) in seen_pt else "Y"
    seen_subj.add(u)
    seen_pt.add((u, pt))

ADAE_HDR = ["STUDYID", "USUBJID", "SUBJID", "SITEID", "TRTA", "TRTAN",
            "AGE", "AGEGR1", "AGEGR1N", "SEX", "RACE", "SAFFL",
            "TRTSDT", "TRTEDT", "AESEQ", "AETERM", "AEDECOD",
            "AESEV", "ASEVN", "AESER", "AEREL", "AREL", "AEOUT",
            "ASTDT", "AENDT", "ASTDY", "AENDY", "ADURN",
            "TRTEMFL", "AOCCFL", "AOCCPFL"]

# ---------------------------------------------------------------- BDS shared

# AVISIT is an ANALYSIS visit, not a collected one. Here the mapping is 1:1, but
# the two are still different columns with different jobs: AVISITN drives sort
# order and column order in every table, and analysis visits can merge, window
# or drop collected ones.
AVISIT = {"SCREENING": ("Screening", 0),
          "BASELINE": ("Baseline", 1),
          "WEEK 4": ("Week 4", 4)}


def bds_derive(rows):
    """Shared BDS post-processing: ABLFL, BASE, CHG, PCHG, ANL01FL.

    `rows` must already carry USUBJID, PARAMCD, AVAL, ADT and AVISITN.
    Mutates in place and returns the list, sorted for output.
    """
    # ABLFL — last non-missing value on or before TRTSDT, per subject+parameter.
    by_key = {}
    for x in rows:
        if x["AVAL"] == "" or not x["_ADT"] or not x["_TRTSDT"]:
            continue
        if x["_ADT"] > x["_TRTSDT"]:
            continue
        k = (x["USUBJID"], x["PARAMCD"])
        cur = by_key.get(k)
        if cur is None or x["_ADT"] > cur["_ADT"]:
            by_key[k] = x
    for x in rows:
        x["ABLFL"] = ""
    for x in by_key.values():
        x["ABLFL"] = "Y"

    base = {k: float(x["AVAL"]) for k, x in by_key.items()}

    for x in rows:
        k = (x["USUBJID"], x["PARAMCD"])
        b = base.get(k)
        x["BASE"] = numtext(b)
        aval = num(x["AVAL"])
        # CHG and PCHG are POST-baseline only. The baseline record's own change
        # is not 0 — it is undefined, and leaving it blank keeps it out of the
        # mean change column where a spurious 0 would drag the average.
        post = b is not None and aval is not None and x["ABLFL"] != "Y" \
            and x["_ADT"] and x["_TRTSDT"] and x["_ADT"] >= x["_TRTSDT"]
        if post:
            chg = round(aval - b, PREC_CHG)
            x["CHG"] = numtext(chg)
            # Guard the denominator. Nothing here has a baseline of 0, but a
            # lab value can, and PCHG must be missing rather than a crash.
            x["PCHG"] = numtext(round(100.0 * chg / b, PREC_PCHG)) if b else ""
        else:
            x["CHG"] = ""
            x["PCHG"] = ""
        # ANL01FL marks the records the primary analysis uses: the baseline and
        # the on-treatment visits. Screening results that are not the baseline
        # are real data, kept, but not analysed — that is why the flag exists
        # rather than deleting the rows.
        x["ANL01FL"] = "Y" if (x["ABLFL"] == "Y" or post) else ""
        # DTYPE identifies a DERIVED record within a parameter (LOCF, an average
        # of replicates). Every record here is an observed result, so DTYPE is
        # null throughout — which is itself the thing to notice.
        x["DTYPE"] = ""

    rows.sort(key=lambda x: (x["USUBJID"], x["PARAMN"], x["AVISITN"]))
    for x in rows:
        del x["_ADT"], x["_TRTSDT"]
    return rows


def adsl_carry(s):
    """The ADSL variables every BDS dataset carries. Copied, never re-derived."""
    return {"SUBJID": s["SUBJID"], "SITEID": s["SITEID"],
            "TRTP": s["TRT01P"], "TRTPN": s["TRT01PN"],
            "TRTA": s["TRT01A"], "TRTAN": s["TRT01AN"],
            "AGE": s["AGE"], "AGEGR1": s["AGEGR1"], "AGEGR1N": s["AGEGR1N"],
            "SEX": s["SEX"], "RACE": s["RACE"],
            "SAFFL": s["SAFFL"], "ITTFL": s["ITTFL"],
            "TRTSDT": s["TRTSDT"], "TRTEDT": s["TRTEDT"]}


# ---------------------------------------------------------------- ADVS

VS_PARAM = {
    "SYSBP":  ("Systolic Blood Pressure (mmHg)", 1),
    "DIABP":  ("Diastolic Blood Pressure (mmHg)", 2),
    "PULSE":  ("Pulse Rate (beats/min)", 3),
    "TEMP":   ("Temperature (C)", 4),
    "WEIGHT": ("Weight (kg)", 5),
    "HEIGHT": ("Height (cm)", 6),
    "BMI":    ("Body Mass Index (kg/m2)", 7),
}

advs_rows = []
for r in vs:
    u = r["USUBJID"]
    s = ADSL[u]
    trtsdt = d(s["TRTSDT"])
    adt = d(r["VSDTC"])
    avisit, avisitn = AVISIT[r["VISIT"]]
    param, paramn = VS_PARAM[r["VSTESTCD"]]
    row = {"STUDYID": r["STUDYID"], "USUBJID": u}
    row.update(adsl_carry(s))
    row.update({
        "PARAMCD": r["VSTESTCD"], "PARAM": param, "PARAMN": paramn,
        "AVAL": numtext(r["VSSTRESN"]), "AVALU": r["VSSTRESU"],
        "AVISIT": avisit, "AVISITN": avisitn,
        "VISIT": r["VISIT"], "VISITNUM": r["VISITNUM"],
        "ADT": iso(adt), "ADY": study_day(adt, trtsdt) if adt else "",
        "SRCDOM": "VS", "SRCVAR": "VSSTRESN", "SRCSEQ": r["VSSEQ"],
        "_ADT": adt, "_TRTSDT": trtsdt,
    })
    advs_rows.append(row)

# BMI is a DERIVED PARAMETER: a new PARAMCD that exists in no SDTM domain.
# It uses the subject's baseline height at every visit, because height is
# measured once. DTYPE stays null — DTYPE describes derived RECORDS within a
# parameter, not a derived parameter. SRCDOM/SRCSEQ are null for the same
# reason: there is no single source record to point at.
for r in vs:
    if r["VSTESTCD"] != "WEIGHT":
        continue
    u = r["USUBJID"]
    s = ADSL[u]
    h, w = num(s["HEIGHTBL"]), num(r["VSSTRESN"])
    if not h or w is None:
        continue
    trtsdt = d(s["TRTSDT"])
    adt = d(r["VSDTC"])
    avisit, avisitn = AVISIT[r["VISIT"]]
    param, paramn = VS_PARAM["BMI"]
    row = {"STUDYID": r["STUDYID"], "USUBJID": u}
    row.update(adsl_carry(s))
    row.update({
        "PARAMCD": "BMI", "PARAM": param, "PARAMN": paramn,
        "AVAL": numtext(round(w / (h / 100.0) ** 2, PREC_BMI)), "AVALU": "kg/m2",
        "AVISIT": avisit, "AVISITN": avisitn,
        "VISIT": r["VISIT"], "VISITNUM": r["VISITNUM"],
        "ADT": iso(adt), "ADY": study_day(adt, trtsdt) if adt else "",
        "SRCDOM": "", "SRCVAR": "", "SRCSEQ": "",
        "_ADT": adt, "_TRTSDT": trtsdt,
    })
    advs_rows.append(row)

bds_derive(advs_rows)

ADVS_HDR = ["STUDYID", "USUBJID", "SUBJID", "SITEID",
            "TRTP", "TRTPN", "TRTA", "TRTAN",
            "AGE", "AGEGR1", "AGEGR1N", "SEX", "RACE", "SAFFL", "ITTFL",
            "TRTSDT", "TRTEDT",
            "PARAMCD", "PARAM", "PARAMN", "AVAL", "AVALU",
            "AVISIT", "AVISITN", "VISIT", "VISITNUM", "ADT", "ADY",
            "ABLFL", "BASE", "CHG", "PCHG", "DTYPE", "ANL01FL",
            "SRCDOM", "SRCVAR", "SRCSEQ"]

# ---------------------------------------------------------------- ADLB

LB_PARAM = {
    "HGB":   ("Hemoglobin (g/dL)", 1),
    "HCT":   ("Hematocrit (%)", 2),
    "WBC":   ("Leukocytes (10^9/L)", 3),
    "PLAT":  ("Platelets (10^9/L)", 4),
    "ALT":   ("Alanine Aminotransferase (U/L)", 5),
    "CREAT": ("Creatinine (mg/dL)", 6),
}

adlb_rows = []
for r in lb:
    u = r["USUBJID"]
    s = ADSL[u]
    trtsdt = d(s["TRTSDT"])
    adt = d(r["LBDTC"])
    avisit, avisitn = AVISIT[r["VISIT"]]
    param, paramn = LB_PARAM[r["LBTESTCD"]]
    row = {"STUDYID": r["STUDYID"], "USUBJID": u}
    row.update(adsl_carry(s))
    row.update({
        "PARAMCD": r["LBTESTCD"], "PARAM": param, "PARAMN": paramn,
        "PARCAT1": r["LBCAT"],
        "AVAL": numtext(r["LBSTRESN"]), "AVALU": r["LBSTRESU"],
        "AVISIT": avisit, "AVISITN": avisitn,
        "VISIT": r["VISIT"], "VISITNUM": r["VISITNUM"],
        "ADT": iso(adt), "ADY": study_day(adt, trtsdt) if adt else "",
        "ANRLO": numtext(r["LBSTNRLO"]), "ANRHI": numtext(r["LBSTNRHI"]),
        "ANRIND": r["LBNRIND"],
        "SRCDOM": "LB", "SRCVAR": "LBSTRESN", "SRCSEQ": r["LBSEQ"],
        "_ADT": adt, "_TRTSDT": trtsdt,
    })
    adlb_rows.append(row)

bds_derive(adlb_rows)

# Baseline reference range indicator, and the shift it defines. A shift table is
# just a cross-tabulation of BNRIND by ANRIND, which is why both must exist on
# the same row — the post-baseline row has to know where it started.
bnrind = {(x["USUBJID"], x["PARAMCD"]): x["ANRIND"]
          for x in adlb_rows if x["ABLFL"] == "Y"}
for x in adlb_rows:
    b = bnrind.get((x["USUBJID"], x["PARAMCD"]), "")
    x["BNRIND"] = b
    x["SHIFT1"] = f"{b} to {x['ANRIND']}" if b and x["ANRIND"] and x["ABLFL"] != "Y" else ""
    # A criterion flag answers one prespecified yes/no question. CRIT1 states the
    # question in words and is populated ONLY on the rows it can apply to, so
    # that "not evaluated" never reads as "did not meet".
    if x["PARAMCD"] == "ALT":
        aval, anrhi = num(x["AVAL"]), num(x["ANRHI"])
        x["CRIT1"] = "ALT > ULN"
        x["CRIT1FL"] = "Y" if aval is not None and anrhi is not None and aval > anrhi else "N"
    else:
        x["CRIT1"] = ""
        x["CRIT1FL"] = ""

ADLB_HDR = ["STUDYID", "USUBJID", "SUBJID", "SITEID",
            "TRTP", "TRTPN", "TRTA", "TRTAN",
            "AGE", "AGEGR1", "AGEGR1N", "SEX", "RACE", "SAFFL", "ITTFL",
            "TRTSDT", "TRTEDT",
            "PARAMCD", "PARAM", "PARAMN", "PARCAT1", "AVAL", "AVALU",
            "AVISIT", "AVISITN", "VISIT", "VISITNUM", "ADT", "ADY",
            "ABLFL", "BASE", "CHG", "PCHG", "DTYPE", "ANL01FL",
            "ANRLO", "ANRHI", "ANRIND", "BNRIND", "SHIFT1",
            "CRIT1", "CRIT1FL", "SRCDOM", "SRCVAR", "SRCSEQ"]

# ---------------------------------------------------------------- ADTTE

# Time to first treatment-emergent AE. One row per subject in the safety
# population, event or not — a time-to-event dataset that dropped its censored
# subjects would bias every estimate it feeds.
#
# CNSR is backwards from every other flag in ADaM and it catches people out:
# 0 = the event happened, 1 = censored. It is defined that way in the ADaM TTE
# spec because the value is used arithmetically downstream.
first_teae = {}
for x in adae_rows:
    if x["TRTEMFL"] != "Y" or not x["ASTDT"]:
        continue
    u = x["USUBJID"]
    if u not in first_teae or x["ASTDT"] < first_teae[u]:
        first_teae[u] = x["ASTDT"]

adtte_rows = []
for s in adsl_rows:
    u = s["USUBJID"]
    if s["SAFFL"] != "Y":
        continue
    trtsdt, trtedt = d(s["TRTSDT"]), d(s["TRTEDT"])
    ev = d(first_teae.get(u, ""))
    if ev:
        adt, cnsr = ev, 0
        evntdesc, cnsdtdsc = "First treatment-emergent adverse event", ""
    else:
        adt, cnsr = trtedt, 1
        evntdesc, cnsdtdsc = "Censored at last dose", "LAST DOSE"
    adtte_rows.append({
        "STUDYID": s["STUDYID"], "USUBJID": u, "SUBJID": s["SUBJID"],
        "SITEID": s["SITEID"],
        "TRTP": s["TRT01P"], "TRTPN": s["TRT01PN"],
        "TRTA": s["TRT01A"], "TRTAN": s["TRT01AN"],
        "AGE": s["AGE"], "AGEGR1": s["AGEGR1"], "SEX": s["SEX"],
        "RACE": s["RACE"], "SAFFL": s["SAFFL"], "ITTFL": s["ITTFL"],
        "PARAMCD": "TTFAE",
        "PARAM": "Time to First Treatment-Emergent Adverse Event (days)",
        "PARAMN": 1,
        "STARTDT": iso(trtsdt), "ADT": iso(adt),
        "AVAL": study_day(adt, trtsdt) if adt else "",
        "CNSR": cnsr, "EVNTDESC": evntdesc, "CNSDTDSC": cnsdtdsc,
        "SRCDOM": "ADAE" if ev else "ADSL",
        "SRCVAR": "ASTDT" if ev else "TRTEDT",
    })

ADTTE_HDR = ["STUDYID", "USUBJID", "SUBJID", "SITEID",
             "TRTP", "TRTPN", "TRTA", "TRTAN",
             "AGE", "AGEGR1", "SEX", "RACE", "SAFFL", "ITTFL",
             "PARAMCD", "PARAM", "PARAMN", "STARTDT", "ADT", "AVAL",
             "CNSR", "EVNTDESC", "CNSDTDSC", "SRCDOM", "SRCVAR"]

# ---------------------------------------------------------------- write

print("Building ADaM reference datasets for ABC-01")
write("adsl.csv", ADSL_HDR, adsl_rows)
write("adae.csv", ADAE_HDR, adae_rows)
write("advs.csv", ADVS_HDR, advs_rows)
write("adlb.csv", ADLB_HDR, adlb_rows)
write("adtte.csv", ADTTE_HDR, adtte_rows)
print("Done.")
