#!/usr/bin/env python3
"""
build_sdtm_reference.py — derive the TARGET SDTM datasets from the raw ABC-01 CSVs.

ALL DATA IS SYNTHETIC. This is the reference ("answer key") implementation of the
mappings documented in mapping_specification.md. Trainees build these by hand in
SAS and R; this script produces the expected result to check against.

Reads  : dm_raw.csv, ex_raw.csv, ae_raw.csv, cm_raw.csv, vs_raw.csv, lb_raw.csv
Writes : sdtm/dm.csv, sdtm/ex.csv, sdtm/ae.csv, sdtm/cm.csv, sdtm/vs.csv, sdtm/lb.csv

Structured to mirror SDTMIG v3.3. Coded terms that would come from a licensed
dictionary (MedDRA for AE, WHODrug for CM) are ILLUSTRATIVE ONLY — see the
mapping spec. Verify all Core designations against the SDTMIG for real work.
"""

import csv, os, re
from datetime import datetime

STUDYID = "ABC-01"
HERE = os.path.dirname(os.path.abspath(__file__))
OUTDIR = os.path.join(HERE, "sdtm")

# ---------------------------------------------------------------- utilities

def numtext(v):
    """Render a collected result the way a NUMERIC SDTM variable would.

    --ORRES and --STRESC are CHARACTER and keep the collected text exactly
    ("82.0" stays "82.0" - the trailing zero is a significant figure).
    --STRESN is NUMERIC, and a number has no trailing zero: 82.0 IS 82.
    Writing the raw string into --STRESN implied a precision the variable
    cannot carry, and made the reference disagree with what SAS produces.
    """
    if v is None or v == "":
        return ""
    try:
        f = float(v)
    except ValueError:
        return ""                     # non-numeric result -> --STRESN is null
    return str(int(f)) if f == int(f) else str(f)


def read(name):
    with open(os.path.join(HERE, name)) as f:
        return list(csv.DictReader(f))

def write(name, header, rows):
    os.makedirs(OUTDIR, exist_ok=True)
    path = os.path.join(OUTDIR, name)
    with open(path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=header, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    print(f"wrote sdtm/{name:8s} {len(rows):3d} rows x {len(header):2d} vars")

def iso(d):
    """Parse the raw date formats into ISO 8601 (YYYY-MM-DD). Blank stays blank."""
    d = (d or "").strip()
    if not d:
        return ""
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%b-%Y"):
        try:
            return datetime.strptime(d, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    raise ValueError(f"Unrecognised date format: {d!r}")

def study_day(dtc, rfstdtc):
    """SDTM --DY. Day 1 = reference start date. There is NO day 0:
       on/after reference start -> diff + 1 ; before -> diff (negative)."""
    if not dtc or not rfstdtc:
        return ""
    d = datetime.strptime(dtc, "%Y-%m-%d")
    r = datetime.strptime(rfstdtc, "%Y-%m-%d")
    diff = (d - r).days
    return str(diff + 1 if diff >= 0 else diff)

def age_at(birth_iso, ref_iso):
    b = datetime.strptime(birth_iso, "%Y-%m-%d")
    r = datetime.strptime(ref_iso, "%Y-%m-%d")
    return str(r.year - b.year - ((r.month, r.day) < (b.month, b.day)))

def usubjid(site, subj):
    return f"{STUDYID}-{site}-{subj}"

def norm(v):
    """Trim and upper-case a free-text value for controlled-terminology lookup."""
    return re.sub(r"\s+", " ", (v or "").strip()).upper()

# ---------------------------------------------------------------- CT maps
SEX_CT = {"1": "M", "2": "F"}
RACE_CT = {
    "WHITE": "WHITE",
    "ASIAN": "ASIAN",
    "BLACK OR AFRICAN AMERICAN": "BLACK OR AFRICAN AMERICAN",
}
ETHNIC_CT = {
    "NOT HISPANIC OR LATINO": "NOT HISPANIC OR LATINO",
    "HISPANIC OR LATINO": "HISPANIC OR LATINO",
    "UNKNOWN": "UNKNOWN",
}
ARMCD_CT = {"Drug A": "A", "Placebo": "P"}
SEV_CT = {"MILD": "MILD", "MODERATE": "MODERATE", "SEVERE": "SEVERE"}
NY_CT = {"YES": "Y", "Y": "Y", "NO": "N", "N": "N"}
OUT_CT = {  # AEOUT arrives as the CRF's numeric code -> decode to CDISC codelist "OUT"
    "1": "RECOVERED/RESOLVED",
    "2": "RECOVERING/RESOLVING",
    "3": "NOT RECOVERED/NOT RESOLVED",
    "4": "FATAL",
    "5": "UNKNOWN",
}
REL_CT = {  # AEREL codelist is commonly sponsor-defined; upper-cased here
    "RELATED": "RELATED",
    "NOT RELATED": "NOT RELATED",
    "POSSIBLY RELATED": "POSSIBLY RELATED",
    "UNLIKELY RELATED": "UNLIKELY RELATED",
}
# ILLUSTRATIVE dictionary coding — real AEDECOD requires licensed MedDRA,
# real CMDECOD requires licensed WHODrug. See mapping_specification.md.
AEDECOD_MAP = {
    "bad headache": "Headache",
    "Headache": "Headache",
    "Nausea": "Nausea",
    "mild dizziness": "Dizziness",
    # verbatim and coded terms share no words — exactly why AEDECOD cannot be
    # derived by string manipulation and must come from a coder.
    "sore throat": "Oropharyngeal pain",
    "worsening hypertension": "Hypertension",
    "fatigue": "Fatigue",
    "insomnia": "Insomnia",
    "vomiting": "Vomiting",
    "rash on both arms": "Rash",
}
CMDECOD_MAP = {
    "Paracetamol": "PARACETAMOL",
    "Vitamin D": "COLECALCIFEROL",
    "Lisinopril": "LISINOPRIL",
    "Amlodipine": "AMLODIPINE",
    "Aspirin": "ACETYLSALICYLIC ACID",
    "Ondansetron": "ONDANSETRON",
    "Hydrocortisone cream": "HYDROCORTISONE",
    "Metformin": "METFORMIN",
}
VS_TESTS = {  # raw column -> (VSTESTCD, VSTEST, unit)
    "SYSBP":  ("SYSBP",  "Systolic Blood Pressure",  "mmHg"),
    "DIABP":  ("DIABP",  "Diastolic Blood Pressure", "mmHg"),
    "PULSE":  ("PULSE",  "Pulse Rate",               "beats/min"),
    "TEMP":   ("TEMP",   "Temperature",              "C"),
    "HEIGHT": ("HEIGHT", "Height",                   "cm"),
    "WEIGHT": ("WEIGHT", "Weight",                   "kg"),
}
VS_ORDER = ["SYSBP", "DIABP", "PULSE", "TEMP", "HEIGHT", "WEIGHT"]
LB_TESTS = {  # raw LBTEST -> (LBTESTCD, LBTEST per CDISC CT, LBCAT)
    "Hemoglobin":               ("HGB",   "Hemoglobin",               "HEMATOLOGY"),
    "Hematocrit":               ("HCT",   "Hematocrit",               "HEMATOLOGY"),
    "White Blood Cells":        ("WBC",   "Leukocytes",               "HEMATOLOGY"),
    "Platelets":                ("PLAT",  "Platelets",                "HEMATOLOGY"),
    "Alanine Aminotransferase": ("ALT",   "Alanine Aminotransferase", "CHEMISTRY"),
    "Creatinine":               ("CREAT", "Creatinine",               "CHEMISTRY"),
}
VISITNUM = {"SCREENING": 1, "BASELINE": 2, "WEEK 2": 3, "WEEK 4": 4}

# ---------------------------------------------------------------- load raw
dm_raw = read("dm_raw.csv")
ds_raw = read("ds_raw.csv")
ex_raw = read("ex_raw.csv")
ae_raw = read("ae_raw.csv")
cm_raw = read("cm_raw.csv")
vs_raw = read("vs_raw.csv")
lb_raw = read("lb_raw.csv")

# end-of-study comes from the Disposition form, not from demographics
eos = {(r["SITEID"], r["SUBJID"]): r for r in ds_raw}

# reference dates per subject: RFSTDTC = first dose, RFENDTC = last dose
ref = {}
for r in ex_raw:
    key = (r["SITEID"], r["SUBJID"])
    ref[key] = {"start": iso(r["EXSTDTC"]), "end": iso(r["EXENDTC"])}

def rfst(site, subj):
    return ref.get((site, subj), {}).get("start", "")

# ================================================================ DM
dm_cols = ["STUDYID", "DOMAIN", "USUBJID", "SUBJID", "RFSTDTC", "RFENDTC",
           "RFXSTDTC", "RFXENDTC", "RFICDTC", "RFPENDTC", "DTHDTC", "DTHFL",
           "SITEID", "AGE", "AGEU", "SEX", "RACE", "ETHNIC",
           "ARMCD", "ARM", "ACTARMCD", "ACTARM", "COUNTRY"]
dm_rows = []
for r in dm_raw:
    site, subj = r["SITEID"], r["SUBJID"]
    consent = iso(r["RFICDTC"])
    dm_rows.append({
        "STUDYID": STUDYID, "DOMAIN": "DM",
        "USUBJID": usubjid(site, subj), "SUBJID": subj,
        "RFSTDTC": rfst(site, subj), "RFENDTC": ref[(site, subj)]["end"],
        "RFXSTDTC": rfst(site, subj), "RFXENDTC": ref[(site, subj)]["end"],
        # RFPENDTC = end of participation — sourced from the DISPOSITION form
        "RFICDTC": consent, "RFPENDTC": iso(eos[(site, subj)]["EOSDT"]),
        "DTHDTC": "", "DTHFL": "",          # no deaths in this study
        "SITEID": site,
        "AGE": age_at(iso(r["BRTHDTC"]), consent), "AGEU": "YEARS",
        "SEX": SEX_CT[r["SEX"]],
        "RACE": RACE_CT[norm(r["RACE"])],
        "ETHNIC": ETHNIC_CT[norm(r["ETHNIC"])],
        "ARMCD": ARMCD_CT[r["ARM"]], "ARM": r["ARM"],
        "ACTARMCD": ARMCD_CT[r["ARM"]], "ACTARM": r["ARM"],  # as-treated = as-planned here
        "COUNTRY": r["COUNTRY"],
    })
dm_rows.sort(key=lambda x: x["USUBJID"])
write("dm.csv", dm_cols, dm_rows)

# ================================================================ DS
# Disposition. Two kinds of record per SDTMIG:
#   DSCAT = "PROTOCOL MILESTONE"  -> consent, randomization
#   DSCAT = "DISPOSITION EVENT"   -> how the subject left the study
ds_cols = ["STUDYID", "DOMAIN", "USUBJID", "DSSEQ", "DSTERM", "DSDECOD",
           "DSCAT", "DSSTDTC", "DSSTDY"]
EOS_CT = {  # free-text reason -> CT term for a disposition event
    "": "COMPLETED",
    "ADVERSE EVENT": "ADVERSE EVENT",
}
tmp = []
for r in dm_raw:
    site, subj = r["SITEID"], r["SUBJID"]
    u, rs = usubjid(site, subj), rfst(site, subj)
    d = eos[(site, subj)]
    # 1. protocol milestone — informed consent
    tmp.append({"STUDYID": STUDYID, "DOMAIN": "DS", "USUBJID": u,
                "DSTERM": "Informed consent obtained",
                "DSDECOD": "INFORMED CONSENT OBTAINED",
                "DSCAT": "PROTOCOL MILESTONE",
                "DSSTDTC": iso(r["RFICDTC"]),
                "DSSTDY": study_day(iso(r["RFICDTC"]), rs)})
    # 2. protocol milestone — randomization
    tmp.append({"STUDYID": STUDYID, "DOMAIN": "DS", "USUBJID": u,
                "DSTERM": "Randomized", "DSDECOD": "RANDOMIZED",
                "DSCAT": "PROTOCOL MILESTONE",
                "DSSTDTC": iso(r["RANDDTC"]),
                "DSSTDY": study_day(iso(r["RANDDTC"]), rs)})
    # 3. disposition event — how they left the study
    if norm(d["EOSSTAT"]) == "COMPLETED":
        term, decod = "Completed study", "COMPLETED"
    else:
        term = f"Discontinued: {d['EOSREAS']}"
        decod = EOS_CT[norm(d["EOSREAS"])]
    tmp.append({"STUDYID": STUDYID, "DOMAIN": "DS", "USUBJID": u,
                "DSTERM": term, "DSDECOD": decod,
                "DSCAT": "DISPOSITION EVENT",
                "DSSTDTC": iso(d["EOSDT"]),
                "DSSTDY": study_day(iso(d["EOSDT"]), rs)})
tmp.sort(key=lambda x: (x["USUBJID"], x["DSSTDTC"], x["DSCAT"]))
seq = {}
for row in tmp:
    seq[row["USUBJID"]] = seq.get(row["USUBJID"], 0) + 1
    row["DSSEQ"] = seq[row["USUBJID"]]
write("ds.csv", ds_cols, tmp)

# ================================================================ EX
ex_cols = ["STUDYID", "DOMAIN", "USUBJID", "EXSEQ", "EXTRT", "EXDOSE", "EXDOSU",
           "EXDOSFRQ", "EXROUTE", "EXSTDTC", "EXENDTC", "EXSTDY", "EXENDY"]
ex_rows = []
for r in ex_raw:
    site, subj = r["SITEID"], r["SUBJID"]
    u, rs = usubjid(site, subj), rfst(site, subj)
    st, en = iso(r["EXSTDTC"]), iso(r["EXENDTC"])
    # EXSEQ is 1 for everyone because EXINTP = "N" for every subject (no dosing
    # interruptions). A subject with EXINTP = "Y" would need one EX record per
    # continuous dosing period, numbered EXSEQ 1, 2, 3...
    ex_rows.append({
        "STUDYID": STUDYID, "DOMAIN": "EX", "USUBJID": u, "EXSEQ": 1,
        "EXTRT": r["EXTRT"], "EXDOSE": r["EXDOSE"], "EXDOSU": r["EXDOSU"],
        "EXDOSFRQ": r["EXFREQ"], "EXROUTE": r["EXROUTE"],
        "EXSTDTC": st, "EXENDTC": en,
        "EXSTDY": study_day(st, rs), "EXENDY": study_day(en, rs),
    })
ex_rows.sort(key=lambda x: x["USUBJID"])
write("ex.csv", ex_cols, ex_rows)

# ================================================================ AE
ae_cols = ["STUDYID", "DOMAIN", "USUBJID", "AESEQ", "AETERM", "AEDECOD",
           "AESEV", "AESER", "AEREL", "AEOUT", "AESTDTC", "AEENDTC",
           "AESTDY", "AEENDY"]
tmp = []
for r in ae_raw:
    site, subj = r["SITEID"], r["SUBJID"]
    u, rs = usubjid(site, subj), rfst(site, subj)
    st, en = iso(r["AESTDT"]), iso(r["AEENDT"])
    tmp.append({
        "STUDYID": STUDYID, "DOMAIN": "AE", "USUBJID": u,
        "AETERM": r["AETERM"], "AEDECOD": AEDECOD_MAP[r["AETERM"]],
        "AESEV": SEV_CT[norm(r["AESEV"])],
        "AESER": NY_CT[norm(r["AESER"])],
        "AEREL": REL_CT[norm(r["AEREL"])],
        "AEOUT": OUT_CT[norm(r["AEOUT"])],
        "AESTDTC": st, "AEENDTC": en,
        "AESTDY": study_day(st, rs), "AEENDY": study_day(en, rs),
    })
# --SEQ: sequential within subject, ordered by start date then term
tmp.sort(key=lambda x: (x["USUBJID"], x["AESTDTC"], x["AETERM"]))
seq = {}
for row in tmp:
    seq[row["USUBJID"]] = seq.get(row["USUBJID"], 0) + 1
    row["AESEQ"] = seq[row["USUBJID"]]
write("ae.csv", ae_cols, tmp)

# ================================================================ SUPPAE
# Supplemental Qualifiers for AE. This is where a variable that is NOT part of
# the standard AE domain goes -- you may never invent a new column in AE itself.
#
# AETRTEM = Treatment Emergent Flag. An adverse event is treatment-emergent if it
# started on or after the first dose of study treatment (RFXSTDTC). Events that
# begin between informed consent and first dose are collected but are NOT
# treatment-emergent, so safety summaries usually exclude them.
#
# Structure is fixed by the SDTMIG and is deliberately generic -- one row per
# qualifier value, identified by which parent record it belongs to:
#   RDOMAIN  = the related domain            ("AE")
#   IDVAR    = the variable that identifies the parent record  ("AESEQ")
#   IDVARVAL = that variable's value
#   QNAM/QLABEL/QVAL = the qualifier's name, label and value
suppae_cols = ["STUDYID", "RDOMAIN", "USUBJID", "IDVAR", "IDVARVAL",
               "QNAM", "QLABEL", "QVAL", "QORIG", "QEVAL"]
supp_rows = []
for r in tmp:                                   # tmp still holds the AE records
    # treatment-emergent: AE start on/after first dose. AESTDY already encodes this:
    # it is >= 1 on/after first dose and negative before it (there is no Day 0).
    trtem = "Y" if r["AESTDY"] != "" and int(r["AESTDY"]) >= 1 else "N"
    supp_rows.append({
        "STUDYID": STUDYID, "RDOMAIN": "AE", "USUBJID": r["USUBJID"],
        "IDVAR": "AESEQ", "IDVARVAL": r["AESEQ"],
        "QNAM": "AETRTEM", "QLABEL": "Treatment Emergent Flag",
        "QVAL": trtem, "QORIG": "DERIVED", "QEVAL": "",
    })
write("suppae.csv", suppae_cols, supp_rows)

# ================================================================ CM
cm_cols = ["STUDYID", "DOMAIN", "USUBJID", "CMSEQ", "CMTRT", "CMDECOD", "CMINDC",
           "CMDOSE", "CMDOSU", "CMDOSFRQ", "CMROUTE", "CMSTDTC", "CMENDTC",
           "CMSTDY", "CMENDY"]
tmp = []
for r in cm_raw:
    site, subj = r["SITEID"], r["SUBJID"]
    u, rs = usubjid(site, subj), rfst(site, subj)
    st, en = iso(r["CMSTDT"]), iso(r["CMENDT"])
    tmp.append({
        "STUDYID": STUDYID, "DOMAIN": "CM", "USUBJID": u,
        "CMTRT": r["CMTRT"], "CMDECOD": CMDECOD_MAP[r["CMTRT"]],
        "CMINDC": r["CMINDC"],
        "CMDOSE": r["CMDOSE"], "CMDOSU": r["CMDOSU"],
        "CMDOSFRQ": r["CMFREQ"], "CMROUTE": r["CMROUTE"],
        "CMSTDTC": st, "CMENDTC": en,
        "CMSTDY": study_day(st, rs), "CMENDY": study_day(en, rs),
    })
tmp.sort(key=lambda x: (x["USUBJID"], x["CMSTDTC"], x["CMTRT"]))
seq = {}
for row in tmp:
    seq[row["USUBJID"]] = seq.get(row["USUBJID"], 0) + 1
    row["CMSEQ"] = seq[row["USUBJID"]]
write("cm.csv", cm_cols, tmp)

# ================================================================ VS  (wide -> tall)
vs_cols = ["STUDYID", "DOMAIN", "USUBJID", "VSSEQ", "VSTESTCD", "VSTEST",
           "VSORRES", "VSORRESU", "VSSTRESC", "VSSTRESN", "VSSTRESU",
           "VSBLFL", "VISITNUM", "VISIT", "VSDTC", "VSDY"]
tmp = []
for r in vs_raw:
    site, subj = r["SITEID"], r["SUBJID"]
    u, rs = usubjid(site, subj), rfst(site, subj)
    dtc = iso(r["VSDT"])
    for col in VS_ORDER:
        val = (r.get(col) or "").strip()
        if val == "":
            continue                      # not collected at this visit (e.g. HEIGHT)
        tc, tn, unit = VS_TESTS[col]
        tmp.append({
            "STUDYID": STUDYID, "DOMAIN": "VS", "USUBJID": u,
            "VSTESTCD": tc, "VSTEST": tn,
            "VSORRES": val, "VSORRESU": unit,
            "VSSTRESC": val, "VSSTRESN": numtext(val), "VSSTRESU": unit,
            # baseline = last assessment on/before first dose; BASELINE visit is the day of first dose
            "VSBLFL": "Y" if r["VISIT"] == "BASELINE" else "",
            "VISITNUM": VISITNUM[r["VISIT"]], "VISIT": r["VISIT"],
            "VSDTC": dtc, "VSDY": study_day(dtc, rs),
        })
tmp.sort(key=lambda x: (x["USUBJID"], x["VISITNUM"], VS_ORDER.index(x["VSTESTCD"])))
seq = {}
for row in tmp:
    seq[row["USUBJID"]] = seq.get(row["USUBJID"], 0) + 1
    row["VSSEQ"] = seq[row["USUBJID"]]
write("vs.csv", vs_cols, tmp)

# ================================================================ LB
lb_cols = ["STUDYID", "DOMAIN", "USUBJID", "LBSEQ", "LBTESTCD", "LBTEST", "LBCAT",
           "LBORRES", "LBORRESU", "LBORNRLO", "LBORNRHI",
           "LBSTRESC", "LBSTRESN", "LBSTRESU", "LBSTNRLO", "LBSTNRHI",
           "LBNRIND", "LBBLFL", "VISITNUM", "VISIT", "LBDTC", "LBDY"]
tmp = []
for r in lb_raw:
    site, subj = r["SITEID"], r["SUBJID"]
    u, rs = usubjid(site, subj), rfst(site, subj)
    dtc = iso(r["LBDT"])
    tc, tn, cat = LB_TESTS[r["LBTEST"]]
    res, lo, hi = float(r["LBORRES"]), float(r["LBORNRLO"]), float(r["LBORNRHI"])
    nrind = "LOW" if res < lo else ("HIGH" if res > hi else "NORMAL")
    tmp.append({
        "STUDYID": STUDYID, "DOMAIN": "LB", "USUBJID": u,
        "LBTESTCD": tc, "LBTEST": tn, "LBCAT": cat,
        "LBORRES": r["LBORRES"], "LBORRESU": r["LBORRESU"],
        "LBORNRLO": r["LBORNRLO"], "LBORNRHI": r["LBORNRHI"],
        # collected units are already the standard units for this study -> no conversion
        "LBSTRESC": r["LBORRES"], "LBSTRESN": numtext(r["LBORRES"]), "LBSTRESU": r["LBORRESU"],
        "LBSTNRLO": r["LBORNRLO"], "LBSTNRHI": r["LBORNRHI"],
        "LBNRIND": nrind,
        "LBBLFL": "Y" if r["VISIT"] == "BASELINE" else "",
        "VISITNUM": VISITNUM[r["VISIT"]], "VISIT": r["VISIT"],
        "LBDTC": dtc, "LBDY": study_day(dtc, rs),
    })
LB_ORDER = ["HGB", "HCT", "WBC", "PLAT", "ALT", "CREAT"]
tmp.sort(key=lambda x: (x["USUBJID"], x["VISITNUM"], LB_ORDER.index(x["LBTESTCD"])))
seq = {}
for row in tmp:
    seq[row["USUBJID"]] = seq.get(row["USUBJID"], 0) + 1
    row["LBSEQ"] = seq[row["USUBJID"]]
write("lb.csv", lb_cols, tmp)

print("\nSDTM reference datasets written to", OUTDIR)
