#!/usr/bin/env python3
"""
audit_adam.py — consistency sweep of the ABC-01 ADaM layer.

Checks that ADSL, ADAE, ADVS, ADLB and ADTTE agree with the SDTM datasets they
were derived from, with each other, and with the rules in adam_specification.md.

Every derivation is RE-DERIVED here independently of build_adam_reference.py,
from the SDTM source, so that a bug in the builder does not simply reproduce
itself in the audit.

Run after ANY change to the ADaM model:  python3 audit_adam.py
Exit code 0 = clean, 1 = at least one FAIL.
"""

import csv, os, re, sys
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)

FAILS, WARNS = [], []
NCHECK = 0


def hdr(t):
    print(f"\n{'=' * 78}\n{t}\n{'=' * 78}")


def ok(msg):
    print(f"  PASS  {msg}")


def fail(msg):
    print(f"  FAIL  {msg}")
    FAILS.append(msg)


def warn(msg):
    print(f"  WARN  {msg}")
    WARNS.append(msg)


def check(cond, good, bad):
    global NCHECK
    NCHECK += 1
    ok(good) if cond else fail(bad)


def read(p):
    with open(p) as f:
        return list(csv.DictReader(f))


def cols(p):
    with open(p) as f:
        return next(csv.reader(f))


def num(v):
    if v is None or v == "":
        return None
    try:
        return float(v)
    except ValueError:
        return None


def d(iso_s):
    if not iso_s or len(iso_s) < 10:
        return None
    return date(int(iso_s[0:4]), int(iso_s[5:7]), int(iso_s[8:10]))


def sday(dt, ref):
    if dt is None or ref is None:
        return None
    delta = (dt - ref).days
    return delta + 1 if delta >= 0 else delta


def fmt(x):
    """Numeric rendering used by the reference (82.0 IS 82)."""
    if x is None:
        return ""
    return str(int(x)) if x == int(x) else str(x)


# ------------------------------------------------------------------ load
SDTM = {n: read(f"sdtm/{n}.csv") for n in
        ["dm", "ds", "ex", "ae", "suppae", "vs", "lb"]}

for n in ["adsl", "adae", "advs", "adlb", "adtte"]:
    if not os.path.exists(f"adam/{n}.csv"):
        print(f"FATAL: adam/{n}.csv is missing. Run build_adam_reference.py first.")
        sys.exit(1)

ADSL = read("adam/adsl.csv")
ADAE = read("adam/adae.csv")
ADVS = read("adam/advs.csv")
ADLB = read("adam/adlb.csv")
ADTTE = read("adam/adtte.csv")

BY_SUBJ = {r["USUBJID"]: r for r in ADSL}

# ============================================================ 1. ADSL
hdr("1. ADSL — one row per subject, and the subject-level truth")

dm_subj = [r["USUBJID"] for r in SDTM["dm"]]
check(len(ADSL) == len(dm_subj), f"ADSL has {len(ADSL)} rows, one per DM subject",
      f"ADSL has {len(ADSL)} rows but DM has {len(dm_subj)} subjects")
check(len({r['USUBJID'] for r in ADSL}) == len(ADSL),
      "USUBJID is unique in ADSL", "USUBJID is DUPLICATED in ADSL")
check(sorted({r["USUBJID"] for r in ADSL}) == sorted(dm_subj),
      "ADSL subject set == DM subject set", "ADSL and DM disagree on the subject set")

# Required ADaM identifiers must never be blank.
for v in ["STUDYID", "USUBJID", "TRT01P", "SAFFL", "ITTFL"]:
    miss = [r["USUBJID"] for r in ADSL if not r[v]]
    check(not miss, f"{v} is populated for every subject",
          f"{v} is blank for {miss}")

dm_by = {r["USUBJID"]: r for r in SDTM["dm"]}
for r in ADSL:
    u = r["USUBJID"]
    s = dm_by[u]
    # Treatment dates trace straight back to DM. ADaM must not invent them.
    if r["TRTSDT"] != s["RFXSTDTC"] or r["TRTEDT"] != s["RFXENDTC"]:
        fail(f"{u}: TRTSDT/TRTEDT do not match DM RFXSTDTC/RFXENDTC")
        break
else:
    ok("TRTSDT/TRTEDT trace to DM.RFXSTDTC/RFXENDTC for all subjects")
NCHECK += 1

bad = [r["USUBJID"] for r in ADSL
       if num(r["TRTDURD"]) != (d(r["TRTEDT"]) - d(r["TRTSDT"])).days + 1]
check(not bad, "TRTDURD == TRTEDT - TRTSDT + 1 for all subjects",
      f"TRTDURD is wrong for {bad}")

bad = [r["USUBJID"] for r in ADSL
       if (r["AGEGR1"] == "<65") != (num(r["AGE"]) < 65)]
check(not bad, "AGEGR1 agrees with AGE for all subjects", f"AGEGR1 wrong for {bad}")
bad = [r["USUBJID"] for r in ADSL
       if (r["AGEGR1"] == "<65") != (r["AGEGR1N"] == "1")]
check(not bad, "AGEGR1N agrees with AGEGR1", f"AGEGR1N wrong for {bad}")

# Disposition must agree with DS, which is its only source.
disp = {r["USUBJID"]: r for r in SDTM["ds"] if r["DSCAT"] == "DISPOSITION EVENT"}
check(set(disp) == set(BY_SUBJ),
      "every subject has exactly one DS disposition event",
      "DS disposition events do not cover every subject")
bad = []
for r in ADSL:
    completed = disp[r["USUBJID"]]["DSDECOD"] == "COMPLETED"
    if (r["EOSSTT"] == "COMPLETED") != completed:
        bad.append(r["USUBJID"])
    if (r["COMPLFL"] == "Y") != completed:
        bad.append(r["USUBJID"])
    if completed and r["DCSREAS"]:
        bad.append(r["USUBJID"])
    if not completed and r["DCSREAS"] != disp[r["USUBJID"]]["DSDECOD"]:
        bad.append(r["USUBJID"])
check(not bad, "EOSSTT / COMPLFL / DCSREAS all agree with DS",
      f"disposition disagrees with DS for {sorted(set(bad))}")

# The discontinuation is a deliberate teaching case; assert it survives.
disc = [r for r in ADSL if r["COMPLFL"] == "N"]
check(len(disc) == 1 and disc[0]["USUBJID"] == "ABC-01-01-004"
      and disc[0]["DCSREAS"] == "ADVERSE EVENT" and disc[0]["TRTDURD"] == "20",
      "the AE discontinuation (ABC-01-01-004, day 20) is intact",
      "the AE discontinuation teaching case has changed")

# Baseline height/weight/BMI — re-derived from VS by the date rule, not VSBLFL.
def vs_baseline(u, testcd, trtsdt):
    best, best_dt = None, None
    for r in SDTM["vs"]:
        if r["USUBJID"] != u or r["VSTESTCD"] != testcd:
            continue
        dt, val = d(r["VSDTC"]), num(r["VSSTRESN"])
        if dt is None or val is None or dt > trtsdt:
            continue
        if best_dt is None or dt > best_dt:
            best, best_dt = val, dt
    return best


badh, badw, badb = [], [], []
for r in ADSL:
    t = d(r["TRTSDT"])
    h = vs_baseline(r["USUBJID"], "HEIGHT", t)
    w = vs_baseline(r["USUBJID"], "WEIGHT", t)
    if r["HEIGHTBL"] != fmt(h):
        badh.append(r["USUBJID"])
    if r["WEIGHTBL"] != fmt(w):
        badw.append(r["USUBJID"])
    if h and w and r["BMIBL"] != fmt(round(w / (h / 100.0) ** 2, 2)):
        badb.append(r["USUBJID"])
check(not badh, "HEIGHTBL == last VS height on or before TRTSDT", f"HEIGHTBL wrong for {badh}")
check(not badw, "WEIGHTBL == last VS weight on or before TRTSDT", f"WEIGHTBL wrong for {badw}")
check(not badb, "BMIBL == WEIGHTBL / (HEIGHTBL/100)^2, rounded to 0.01", f"BMIBL wrong for {badb}")

# The lesson: the ADaM baseline rule is NOT a copy of VSBLFL.
vsblfl_h = [r for r in SDTM["vs"] if r["VSTESTCD"] == "HEIGHT" and r["VSBLFL"] == "Y"]
check(not vsblfl_h and all(r["HEIGHTBL"] for r in ADSL),
      "HEIGHTBL is populated although NO height record has VSBLFL='Y' "
      "(the baseline rule is not a VSBLFL copy)",
      "the HEIGHTBL/VSBLFL teaching contrast has been lost")

# ============================================================ 2. ADAE
hdr("2. ADAE — occurrence data structure")

check(len(ADAE) == len(SDTM["ae"]),
      f"ADAE has {len(ADAE)} rows, one per AE record",
      f"ADAE has {len(ADAE)} rows but AE has {len(SDTM['ae'])}")
orphan = {r["USUBJID"] for r in ADAE} - set(BY_SUBJ)
check(not orphan, "every ADAE subject exists in ADSL", f"ADAE subjects not in ADSL: {orphan}")

# TRTEMFL must come FROM SUPPAE, not be re-derived. Verify it matches.
trtem = {(r["USUBJID"], r["IDVARVAL"]): r["QVAL"]
         for r in SDTM["suppae"] if r["QNAM"] == "AETRTEM"}
bad = [(r["USUBJID"], r["AESEQ"]) for r in ADAE
       if r["TRTEMFL"] != trtem.get((r["USUBJID"], r["AESEQ"]), "")]
check(not bad, "TRTEMFL matches SUPPAE.AETRTEM for every event",
      f"TRTEMFL disagrees with SUPPAE for {bad}")

# ...and independently: a treatment-emergent event starts on or after first dose.
bad = []
for r in ADAE:
    t = d(BY_SUBJ[r["USUBJID"]]["TRTSDT"])
    st = d(r["ASTDT"])
    if st and ((st >= t) != (r["TRTEMFL"] == "Y")):
        bad.append((r["USUBJID"], r["AESEQ"]))
check(not bad, "TRTEMFL agrees with 'start date on or after TRTSDT'",
      f"TRTEMFL inconsistent with dates for {bad}")

# The pre-dose AE is a deliberate teaching case.
pre = [r for r in ADAE if r["TRTEMFL"] == "N"]
check(len(pre) == 1 and pre[0]["USUBJID"] == "ABC-01-01-002" and pre[0]["ASTDY"] == "-5",
      "the pre-dose AE (ABC-01-01-002, day -5, TRTEMFL='N') is intact",
      "the pre-dose AE teaching case has changed")

bad = []
for r in ADAE:
    t = d(BY_SUBJ[r["USUBJID"]]["TRTSDT"])
    if r["ASTDT"] and r["ASTDY"] != str(sday(d(r["ASTDT"]), t)):
        bad.append((r["USUBJID"], r["AESEQ"]))
    if r["AENDT"] and r["AENDY"] != str(sday(d(r["AENDT"]), t)):
        bad.append((r["USUBJID"], r["AESEQ"]))
check(not bad, "ASTDY / AENDY are correct relative to TRTSDT (no Day 0)",
      f"study day wrong for {sorted(set(bad))}")

bad = [(r["USUBJID"], r["AESEQ"]) for r in ADAE
       if r["AENDT"] and r["ADURN"] != str((d(r["AENDT"]) - d(r["ASTDT"])).days + 1)]
check(not bad, "ADURN == AENDT - ASTDT + 1 where the event has ended", f"ADURN wrong for {bad}")
ongoing = [r for r in ADAE if not r["AENDT"]]
check(all(r["ADURN"] == "" for r in ongoing),
      f"ADURN is missing (not 0) for the {len(ongoing)} ongoing events",
      "an ongoing event has a duration")

SEVN = {"MILD": "1", "MODERATE": "2", "SEVERE": "3"}
bad = [r["USUBJID"] for r in ADAE if r["ASEVN"] != SEVN.get(r["AESEV"], "")]
check(not bad, "ASEVN matches AESEV", f"ASEVN wrong for {bad}")
REL_Y = {"RELATED", "POSSIBLY RELATED"}
bad = [r["USUBJID"] for r in ADAE if (r["AREL"] == "Y") != (r["AEREL"] in REL_Y)]
check(not bad, "AREL collapses AEREL correctly", f"AREL wrong for {bad}")

# Occurrence flags must mark exactly one row, so counting them counts subjects.
teae_subj = {r["USUBJID"] for r in ADAE if r["TRTEMFL"] == "Y"}
n_occ = sum(1 for r in ADAE if r["AOCCFL"] == "Y")
check(n_occ == len(teae_subj),
      f"AOCCFL='Y' appears once per subject with a TEAE ({n_occ} = {len(teae_subj)} subjects)",
      f"AOCCFL='Y' on {n_occ} rows but {len(teae_subj)} subjects have a TEAE")
teae_pt = {(r["USUBJID"], r["AEDECOD"]) for r in ADAE if r["TRTEMFL"] == "Y"}
n_occp = sum(1 for r in ADAE if r["AOCCPFL"] == "Y")
check(n_occp == len(teae_pt),
      f"AOCCPFL='Y' appears once per subject+term ({n_occp} = {len(teae_pt)} pairs)",
      f"AOCCPFL='Y' on {n_occp} rows but there are {len(teae_pt)} subject+term pairs")
bad = [r["USUBJID"] for r in ADAE
       if r["TRTEMFL"] != "Y" and (r["AOCCFL"] or r["AOCCPFL"])]
check(not bad, "no occurrence flag is set on a non-treatment-emergent event",
      f"occurrence flag set on a non-TEAE for {bad}")

# ============================================================ 3. BDS shared
hdr("3. ADVS / ADLB — basic data structure rules")

for name, rows, src in [("ADVS", ADVS, "vs"), ("ADLB", ADLB, "lb")]:
    orphan = {r["USUBJID"] for r in rows} - set(BY_SUBJ)
    check(not orphan, f"{name}: every subject exists in ADSL", f"{name}: subjects not in ADSL: {orphan}")

    # One and only one baseline per subject+parameter.
    from collections import Counter
    bl = Counter((r["USUBJID"], r["PARAMCD"]) for r in rows if r["ABLFL"] == "Y")
    params = {(r["USUBJID"], r["PARAMCD"]) for r in rows}
    dupes = [k for k, v in bl.items() if v > 1]
    check(not dupes, f"{name}: ABLFL='Y' at most once per subject+parameter",
          f"{name}: multiple baselines for {dupes}")
    check(set(bl) == params,
          f"{name}: every subject+parameter has a baseline ({len(bl)} combinations)",
          f"{name}: {len(params - set(bl))} subject+parameter combinations have no baseline")

    # BASE must equal the AVAL of that subject+parameter's baseline row.
    base_val = {(r["USUBJID"], r["PARAMCD"]): r["AVAL"] for r in rows if r["ABLFL"] == "Y"}
    bad = [(r["USUBJID"], r["PARAMCD"]) for r in rows
           if r["BASE"] != base_val.get((r["USUBJID"], r["PARAMCD"]), "")]
    check(not bad, f"{name}: BASE == AVAL of the ABLFL='Y' record",
          f"{name}: BASE wrong for {sorted(set(bad))[:5]}")

    # CHG arithmetic, at the precision the spec fixes.
    bad = []
    for r in rows:
        a, b = num(r["AVAL"]), num(r["BASE"])
        if r["CHG"] == "":
            continue
        if r["CHG"] != fmt(round(a - b, 4)):
            bad.append((r["USUBJID"], r["PARAMCD"], r["AVISIT"]))
        if b and r["PCHG"] != fmt(round(100.0 * round(a - b, 4) / b, 4)):
            bad.append((r["USUBJID"], r["PARAMCD"], r["AVISIT"]))
    check(not bad, f"{name}: CHG and PCHG are correct to the specified precision",
          f"{name}: CHG/PCHG wrong for {sorted(set(bad))[:5]}")

    # CHG must be blank at baseline and pre-baseline — not 0.
    bad = [(r["USUBJID"], r["PARAMCD"]) for r in rows
           if r["ABLFL"] == "Y" and (r["CHG"] != "" or r["PCHG"] != "")]
    check(not bad, f"{name}: CHG/PCHG are missing on the baseline record (not 0)",
          f"{name}: baseline record carries a change value for {bad}")

    # ANL01FL marks baseline + on-treatment records only.
    bad = []
    for r in rows:
        t = d(BY_SUBJ[r["USUBJID"]]["TRTSDT"])
        post = d(r["ADT"]) and d(r["ADT"]) >= t and r["ABLFL"] != "Y"
        want = "Y" if (r["ABLFL"] == "Y" or post) else ""
        if r["ANL01FL"] != want:
            bad.append((r["USUBJID"], r["PARAMCD"], r["AVISIT"]))
    check(not bad, f"{name}: ANL01FL marks baseline and on-treatment records",
          f"{name}: ANL01FL wrong for {sorted(set(bad))[:5]}")

    # ADY arithmetic.
    bad = [(r["USUBJID"], r["PARAMCD"]) for r in rows
           if r["ADT"] and r["ADY"] != str(sday(d(r["ADT"]), d(BY_SUBJ[r["USUBJID"]]["TRTSDT"])))]
    check(not bad, f"{name}: ADY is correct relative to TRTSDT", f"{name}: ADY wrong for {bad[:5]}")

    # PARAM and PARAMCD are 1:1 — a classic conformance failure when they drift.
    pairs = {(r["PARAMCD"], r["PARAM"]) for r in rows}
    check(len({p[0] for p in pairs}) == len(pairs),
          f"{name}: PARAMCD and PARAM are one-to-one",
          f"{name}: a PARAMCD maps to more than one PARAM")
    pairs_n = {(r["PARAMCD"], r["PARAMN"]) for r in rows}
    check(len({p[0] for p in pairs_n}) == len(pairs_n),
          f"{name}: PARAMCD and PARAMN are one-to-one",
          f"{name}: a PARAMCD maps to more than one PARAMN")

    # Population flags are COPIED from ADSL, never re-derived.
    bad = [r["USUBJID"] for r in rows
           if r["SAFFL"] != BY_SUBJ[r["USUBJID"]]["SAFFL"]
           or r["ITTFL"] != BY_SUBJ[r["USUBJID"]]["ITTFL"]
           or r["TRTSDT"] != BY_SUBJ[r["USUBJID"]]["TRTSDT"]]
    check(not bad, f"{name}: population flags and TRTSDT match ADSL exactly",
          f"{name}: ADSL variables disagree for {sorted(set(bad))}")

# ============================================================ 4. ADVS specifics
hdr("4. ADVS — the derived BMI parameter")

n_vs, n_bmi = len(SDTM["vs"]), sum(1 for r in ADVS if r["PARAMCD"] == "BMI")
check(len(ADVS) == n_vs + n_bmi,
      f"ADVS has {len(ADVS)} rows = {n_vs} VS records + {n_bmi} derived BMI records",
      f"ADVS row count {len(ADVS)} != {n_vs} + {n_bmi}")

n_wt = sum(1 for r in SDTM["vs"] if r["VSTESTCD"] == "WEIGHT")
check(n_bmi == n_wt, f"one BMI record per weight measurement ({n_bmi})",
      f"{n_bmi} BMI records but {n_wt} weight measurements")

# BMI re-derived from the weight of the visit and the subject's BASELINE height.
wt = {(r["USUBJID"], r["VISIT"]): num(r["VSSTRESN"])
      for r in SDTM["vs"] if r["VSTESTCD"] == "WEIGHT"}
bad = []
for r in ADVS:
    if r["PARAMCD"] != "BMI":
        continue
    h = num(BY_SUBJ[r["USUBJID"]]["HEIGHTBL"])
    w = wt.get((r["USUBJID"], r["VISIT"]))
    if r["AVAL"] != fmt(round(w / (h / 100.0) ** 2, 2)):
        bad.append((r["USUBJID"], r["AVISIT"]))
check(not bad, "BMI == visit weight / (baseline height/100)^2, rounded to 0.01",
      f"BMI wrong for {bad}")

# A derived PARAMETER is not a derived RECORD: DTYPE stays null.
check(all(r["DTYPE"] == "" for r in ADVS),
      "DTYPE is null throughout ADVS (no imputed or derived records)",
      "DTYPE is populated somewhere in ADVS")
check(all(not r["SRCDOM"] for r in ADVS if r["PARAMCD"] == "BMI"),
      "the derived BMI parameter has no SRCDOM/SRCSEQ (no single source record)",
      "a derived BMI record points at a source record")
check(all(r["SRCDOM"] == "VS" for r in ADVS if r["PARAMCD"] != "BMI"),
      "every observed ADVS record traces back to VS via SRCDOM/SRCSEQ",
      "an observed ADVS record has lost its traceability variables")

# HEIGHT has only a baseline, so it can have no change.
ht = [r for r in ADVS if r["PARAMCD"] == "HEIGHT"]
check(all(r["CHG"] == "" for r in ht) and all(r["AVISIT"] == "Screening" for r in ht),
      "HEIGHT exists only at Screening and therefore has no CHG",
      "HEIGHT has post-baseline records or a change value")

# ============================================================ 5. ADLB specifics
hdr("5. ADLB — reference ranges, shifts and criterion flags")

check(len(ADLB) == len(SDTM["lb"]),
      f"ADLB has {len(ADLB)} rows, one per LB record",
      f"ADLB has {len(ADLB)} rows but LB has {len(SDTM['lb'])}")

n_sub_lb = len({r["USUBJID"] for r in ADLB})
check(n_sub_lb == 4 and len(ADSL) == 8,
      f"only {n_sub_lb} of {len(ADSL)} subjects have labs "
      "(analysis populations come from ADSL, not from the BDS dataset)",
      "the partial-lab-coverage teaching case has changed")

# ANRIND traces to LB. BNRIND is the baseline record's ANRIND.
bad = [(r["USUBJID"], r["PARAMCD"]) for r in ADLB
       if not (num(r["ANRLO"]) is not None and num(r["ANRHI"]) is not None)]
check(not bad, "ANRLO/ANRHI are populated on every ADLB record",
      f"reference range missing for {bad[:5]}")
bad = []
for r in ADLB:
    a, lo, hi = num(r["AVAL"]), num(r["ANRLO"]), num(r["ANRHI"])
    want = "LOW" if a < lo else "HIGH" if a > hi else "NORMAL"
    if r["ANRIND"] != want:
        bad.append((r["USUBJID"], r["PARAMCD"], r["AVISIT"]))
check(not bad, "ANRIND agrees with AVAL against ANRLO/ANRHI",
      f"ANRIND wrong for {bad[:5]}")

bl_ind = {(r["USUBJID"], r["PARAMCD"]): r["ANRIND"] for r in ADLB if r["ABLFL"] == "Y"}
bad = [(r["USUBJID"], r["PARAMCD"]) for r in ADLB
       if r["BNRIND"] != bl_ind.get((r["USUBJID"], r["PARAMCD"]), "")]
check(not bad, "BNRIND == ANRIND of the baseline record", f"BNRIND wrong for {bad[:5]}")

bad = [(r["USUBJID"], r["PARAMCD"]) for r in ADLB
       if r["ABLFL"] != "Y" and r["SHIFT1"] != f"{r['BNRIND']} to {r['ANRIND']}"]
check(not bad, "SHIFT1 == 'BNRIND to ANRIND' on post-baseline records",
      f"SHIFT1 wrong for {bad[:5]}")
check(all(r["SHIFT1"] == "" for r in ADLB if r["ABLFL"] == "Y"),
      "SHIFT1 is blank on the baseline record (a baseline has not shifted)",
      "SHIFT1 is populated at baseline")

# The criterion flag is populated ONLY where the criterion applies.
bad = [r["USUBJID"] for r in ADLB if r["PARAMCD"] != "ALT" and (r["CRIT1"] or r["CRIT1FL"])]
check(not bad, "CRIT1/CRIT1FL are blank on parameters the criterion does not apply to "
      "('not evaluated' never reads as 'did not meet')",
      f"criterion flag populated off-parameter for {bad}")
bad = []
for r in ADLB:
    if r["PARAMCD"] != "ALT":
        continue
    want = "Y" if num(r["AVAL"]) > num(r["ANRHI"]) else "N"
    if r["CRIT1FL"] != want or r["CRIT1"] != "ALT > ULN":
        bad.append((r["USUBJID"], r["AVISIT"]))
check(not bad, "CRIT1FL is correct on every ALT record", f"CRIT1FL wrong for {bad}")

hi = [r for r in ADLB if r["CRIT1FL"] == "Y"]
check(len(hi) == 1 and hi[0]["USUBJID"] == "ABC-01-01-003"
      and hi[0]["AVAL"] == "72" and hi[0]["SHIFT1"] == "NORMAL to HIGH",
      "the ALT abnormal (ABC-01-01-003, 72 U/L, NORMAL to HIGH) is intact",
      "the ALT abnormal teaching case has changed")

# ============================================================ 6. ADTTE
hdr("6. ADTTE — time to first treatment-emergent AE")

saf = [r for r in ADSL if r["SAFFL"] == "Y"]
check(len(ADTTE) == len(saf),
      f"ADTTE has {len(ADTTE)} rows, one per safety subject — censored subjects are kept",
      f"ADTTE has {len(ADTTE)} rows but {len(saf)} subjects are in the safety population")
check(len({r["USUBJID"] for r in ADTTE}) == len(ADTTE),
      "one row per subject per parameter in ADTTE", "ADTTE has duplicate subject rows")

check(all(r["CNSR"] in ("0", "1") for r in ADTTE),
      "CNSR is 0 or 1 everywhere", "CNSR has a value other than 0/1")
bad = [r["USUBJID"] for r in ADTTE
       if r["AVAL"] != str(sday(d(r["ADT"]), d(r["STARTDT"])))]
check(not bad, "AVAL == ADT - STARTDT + 1", f"AVAL wrong for {bad}")
bad = [r["USUBJID"] for r in ADTTE if r["STARTDT"] != BY_SUBJ[r["USUBJID"]]["TRTSDT"]]
check(not bad, "STARTDT == TRTSDT for every subject", f"STARTDT wrong for {bad}")

# Re-derive the event date from ADAE, independently.
first = {}
for r in ADAE:
    if r["TRTEMFL"] != "Y" or not r["ASTDT"]:
        continue
    u = r["USUBJID"]
    if u not in first or r["ASTDT"] < first[u]:
        first[u] = r["ASTDT"]
bad = []
for r in ADTTE:
    u = r["USUBJID"]
    if u in first:
        if r["CNSR"] != "0" or r["ADT"] != first[u]:
            bad.append(u)
    else:
        if r["CNSR"] != "1" or r["ADT"] != BY_SUBJ[u]["TRTEDT"]:
            bad.append(u)
check(not bad, "events are dated at the first TEAE; subjects without one are censored at TRTEDT",
      f"ADTTE event/censor derivation wrong for {bad}")

n_ev = sum(1 for r in ADTTE if r["CNSR"] == "0")
check(n_ev == len(first),
      f"{n_ev} events and {len(ADTTE) - n_ev} censored, matching ADAE",
      f"{n_ev} events in ADTTE but {len(first)} subjects have a TEAE")
check(all(r["CNSDTDSC"] == "" for r in ADTTE if r["CNSR"] == "0")
      and all(r["CNSDTDSC"] for r in ADTTE if r["CNSR"] == "1"),
      "CNSDTDSC is populated for censored records only",
      "CNSDTDSC is set on an event record, or missing on a censored one")

# ============================================================ 7. Cross-dataset
hdr("7. Cross-dataset traceability")

for name, rows in [("ADAE", ADAE), ("ADVS", ADVS), ("ADLB", ADLB), ("ADTTE", ADTTE)]:
    bad = [r["USUBJID"] for r in rows
           if r.get("TRTA") and r["TRTA"] != BY_SUBJ[r["USUBJID"]]["TRT01A"]]
    check(not bad, f"{name}: TRTA matches ADSL.TRT01A", f"{name}: TRTA disagrees for {sorted(set(bad))}")

check(all(r["STUDYID"] == "ABC-01" for r in ADSL + ADAE + ADVS + ADLB + ADTTE),
      "STUDYID is ABC-01 on every record of every dataset",
      "a record carries the wrong STUDYID")

# No ADaM dataset may introduce a subject ADSL has never heard of.
allsub = set()
for rows in (ADAE, ADVS, ADLB, ADTTE):
    allsub |= {r["USUBJID"] for r in rows}
check(allsub <= set(BY_SUBJ),
      "no analysis dataset contains a subject missing from ADSL",
      f"subjects appear downstream but not in ADSL: {allsub - set(BY_SUBJ)}")

# ============================================================ 8. HARNESS
hdr("8. run_all_adam.sas — hardcoded row counts match the data")

# run_all_adam.sas smoke-tests each notebook against a row count typed into the
# harness. When the data model changes, that number silently goes stale and the
# smoke test starts asserting the wrong thing — the exact failure mode section
# 7c of audit_consistency.py guards for the SDTM run_all. Same guard here.
DATASETS = {"adsl": ADSL, "adae": ADAE, "advs": ADVS, "adlb": ADLB, "adtte": ADTTE}
runall = os.path.join(HERE, "..", "notebooks", "sas", "run_all_adam.sas")
if os.path.exists(runall):
    src = open(runall).read()
    found = dict(re.findall(r"ds\s*=\s*(\w+)\s*,\s*expect\s*=\s*(\d+)", src))
    check(bool(found), f"run_all_adam.sas declares expectations for {len(found)} datasets",
          "run_all_adam.sas: could not parse any ds=/expect= pairs")
    for ds, exp in sorted(found.items()):
        if ds not in DATASETS:
            fail(f"run_all_adam.sas expects dataset '{ds}' which has no reference")
            continue
        actual = len(DATASETS[ds])
        check(int(exp) == actual,
              f"run_all_adam.sas: {ds.upper()} expect={exp} matches the data ({actual})",
              f"run_all_adam.sas: {ds.upper()} expect={exp} but the dataset has {actual} rows")
else:
    warn("run_all_adam.sas not found — skipped the harness expectation check")

# ============================================================ SUMMARY
hdr("SUMMARY")
print(f"  {NCHECK} checks run")
if FAILS:
    print(f"  {len(FAILS)} FAILURE(S):")
    for f_ in FAILS:
        print(f"    - {f_}")
if WARNS:
    print(f"  {len(WARNS)} warning(s):")
    for w in WARNS:
        print(f"    - {w}")
if not FAILS:
    print("  ALL CHECKS PASSED — ADaM agrees with SDTM, with ADSL, and with the spec.")
sys.exit(1 if FAILS else 0)
