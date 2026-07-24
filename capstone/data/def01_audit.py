#!/usr/bin/env python3
"""
def01_audit.py — consistency + correctness sweep for the CAPSTONE study DEF-01.

Independently re-derives the tricky values (unit conversions, study days, baseline
flags, LBNRIND, AETRTEM including the partial-date case) and checks structural
integrity. Because it re-derives rather than re-reads, it is also the cross-validation
of def01_build_sdtm_reference.py.

Run (after the generator + builder):  python3 def01_audit.py
Exit 0 = clean, 1 = at least one FAIL.
"""

import csv, os, sys, calendar
from datetime import datetime
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
FAILS = []
MONTHS = {m.upper(): i for i, m in enumerate(calendar.month_abbr) if m}


def rd(p):
    with open(os.path.join(HERE, p), newline="") as f:
        return list(csv.DictReader(f))


def cols(p):
    with open(os.path.join(HERE, p), newline="") as f:
        return next(csv.reader(f))


def _isnum(x):
    try:
        float(x); return True
    except (TypeError, ValueError):
        return False


def hdr(t):
    print(f"\n{'='*70}\n{t}\n{'='*70}")


def check(cond, good, bad):
    if cond:
        print(f"  PASS  {good}")
    else:
        print(f"  FAIL  {bad}")
        FAILS.append(bad)


SDTM = {n: f"sdtm/{n}.csv" for n in ("dm", "ex", "ae", "suppae", "vs", "lb")}
RFST = {r["USUBJID"]: datetime.strptime(r["RFSTDTC"], "%Y-%m-%d") for r in rd(SDTM["dm"])}


# ---------------------------------------------------------------- 1. inventory
hdr("1. INVENTORY & ROW COUNTS")
expected = {"dm": 6, "ex": 7, "ae": 7, "suppae": 7, "vs": 96, "lb": 32}
for n, exp in expected.items():
    got = len(rd(SDTM[n]))
    check(got == exp, f"{n.upper()}: {got} rows", f"{n.upper()}: {got} rows, expected {exp}")


# ------------------------------------------------------- 2. structural integrity
hdr("2. STRUCTURAL INTEGRITY")
dm_ids = {r["USUBJID"] for r in rd(SDTM["dm"])}
check(len(dm_ids) == len(rd(SDTM["dm"])), "DM USUBJID unique", "DM USUBJID not unique")
for n in ("ex", "ae", "vs", "lb"):
    rows = rd(SDTM[n])
    seqv = n.upper() + "SEQ"
    keys = [(r["USUBJID"], r[seqv]) for r in rows]
    check(len(keys) == len(set(keys)), f"{n.upper()}: USUBJID+{seqv} unique",
          f"{n.upper()}: duplicate USUBJID+{seqv}")
    # --SEQ contiguous 1..n per subject
    bysub = {}
    for r in rows:
        bysub.setdefault(r["USUBJID"], []).append(int(r[seqv]))
    bad = {u: s for u, s in bysub.items() if sorted(s) != list(range(1, len(s) + 1))}
    check(not bad, f"{n.upper()}: {seqv} runs 1..n per subject", f"{n.upper()}: {seqv} not contiguous {bad}")
    # orphans
    orph = {r["USUBJID"] for r in rows} - dm_ids
    check(not orph, f"{n.upper()}: no orphan subjects", f"{n.upper()}: orphans {orph}")


# ------------------------------------------------------ 2b. SUPPAE linkage
hdr("2b. SUPPAE")
supp = rd(SDTM["suppae"])
check(cols(SDTM["suppae"]) == ["STUDYID", "RDOMAIN", "USUBJID", "IDVAR", "IDVARVAL",
      "QNAM", "QLABEL", "QVAL", "QORIG", "QEVAL"], "SUPPAE has standard structure", "SUPPAE structure wrong")
ae_keys = {(r["USUBJID"], r["AESEQ"]) for r in rd(SDTM["ae"])}
orphan = [(r["USUBJID"], r["IDVARVAL"]) for r in supp if (r["USUBJID"], r["IDVARVAL"]) not in ae_keys]
check(not orphan, "SUPPAE every row links to a real AE record", f"SUPPAE orphans {orphan}")
check(all(r["QNAM"] == "AETRTEM" for r in supp), "SUPPAE QNAM all AETRTEM", "SUPPAE unexpected QNAM")
check(all(r["QVAL"] in ("Y", "N") for r in supp), "SUPPAE QVAL all Y/N", "SUPPAE bad QVAL")


# ------------------------------------------------------- 3. dates & study day
hdr("3. DATES & STUDY DAY (no Day 0; ISO or partial)")
import re
iso_full = re.compile(r"^\d{4}-\d{2}-\d{2}$")
iso_part = re.compile(r"^\d{4}-\d{2}$")
for n, dycol, dtccols in (("ae", "AESTDY", ["AESTDTC", "AEENDTC"]),
                          ("ex", "EXSTDY", ["EXSTDTC", "EXENDTC"]),
                          ("vs", "VSDY", ["VSDTC"]), ("lb", "LBDY", ["LBDTC"])):
    rows = rd(SDTM[n])
    zeros = sum(1 for r in rows if r[dycol] == "0")
    check(zeros == 0, f"{n.upper()}: no {dycol} = 0", f"{n.upper()}: {zeros} rows with {dycol}=0")
    bad = []
    for r in rows:
        for c in dtccols:
            v = r[c]
            if v and not iso_full.match(v) and not iso_part.match(v):
                bad.append(f"{c}={v}")
    check(not bad, f"{n.upper()}: all --DTC ISO (full or partial)", f"{n.upper()}: non-ISO {bad[:3]}")

# independently re-derive every --DY and compare
def sday(dt, ref):
    if dt is None:
        return ""
    diff = (dt - ref).days
    return str(diff + 1 if dt >= ref else diff)

def pdate(s):
    if not s:
        return None
    if iso_part.match(s):
        return None                       # partial -> no computable day
    return datetime.strptime(s, "%Y-%m-%d")

mism = 0
for n, dtc, dy in (("ae", "AESTDTC", "AESTDY"), ("ex", "EXSTDTC", "EXSTDY"),
                   ("vs", "VSDTC", "VSDY"), ("lb", "LBDTC", "LBDY")):
    for r in rd(SDTM[n]):
        want = sday(pdate(r[dtc]), RFST[r["USUBJID"]])
        if r[dy] != want:
            mism += 1
            if mism <= 5:
                print(f"        {n} {r['USUBJID']} {dtc}={r[dtc]} {dy}={r[dy]} want {want!r}")
check(mism == 0, "every --STDY re-derives from RFSTDTC", f"{mism} --STDY mismatches")


# ------------------------------------------------- 4. TRAP 1: unit conversion
hdr("4. TRAP 1 — VS UNIT CONVERSION")
vs = rd(SDTM["vs"])
# ORRESU must be the collected unit; STRESU must be standard (kg/C for weight/temp)
bad_u = [r for r in vs if r["VSTESTCD"] == "WEIGHT" and r["VSSTRESU"] != "kg"]
check(not bad_u, "WEIGHT VSSTRESU always kg", f"WEIGHT bad STRESU {len(bad_u)}")
bad_t = [r for r in vs if r["VSTESTCD"] == "TEMP" and r["VSSTRESU"] != "C"]
check(not bad_t, "TEMP VSSTRESU always C", f"TEMP bad STRESU {len(bad_t)}")
# re-derive the conversion for every imperial row
conv = 0
for r in vs:
    if r["VSTESTCD"] == "WEIGHT" and r["VSORRESU"] == "lb":
        want = round(float(r["VSORRES"]) * 0.45359237, 1)
        got = float(r["VSSTRESN"])
        if abs(got - want) > 0.05:
            conv += 1
    if r["VSTESTCD"] == "TEMP" and r["VSORRESU"] == "F":
        want = round((float(r["VSORRES"]) - 32) * 5 / 9, 1)
        got = float(r["VSSTRESN"])
        if abs(got - want) > 0.05:
            conv += 1
check(conv == 0, "every lb->kg and F->C conversion is correct", f"{conv} conversion errors")
# metric rows must pass through unchanged
passthru = [r for r in vs if r["VSTESTCD"] in ("WEIGHT", "TEMP") and r["VSORRESU"] in ("kg", "C")
            and r["VSORRES"] != r["VSSTRESC"]]
check(not passthru, "metric VS rows pass through ORRES=STRESC", f"{len(passthru)} metric rows altered")
imperial = {r["USUBJID"] for r in vs if r["VSORRESU"] in ("lb", "F")}
check(imperial == {"DEF-01-02-001", "DEF-01-02-002", "DEF-01-02-003"},
      "only site 02 collected imperial units", f"imperial subjects unexpected: {imperial}")


# ------------------------------------------------- 5. TRAP 2: EX interruption
hdr("5. TRAP 2 — DOSING INTERRUPTION")
ex = rd(SDTM["ex"])
by = Counter(r["USUBJID"] for r in ex)
check(by["DEF-01-02-003"] == 2, "02/003 has two EX records", f"02/003 has {by['DEF-01-02-003']} EX records")
check(all(v == 1 for k, v in by.items() if k != "DEF-01-02-003"),
      "every other subject has exactly one EX record", "unexpected multi-record EX subject")
periods = sorted([r for r in ex if r["USUBJID"] == "DEF-01-02-003"], key=lambda r: int(r["EXSEQ"]))
gap_ok = periods[0]["EXENDTC"] < periods[1]["EXSTDTC"]
check(gap_ok, "02/003 period 1 ends before period 2 starts (a real gap)", "02/003 periods overlap")


# ------------------------------------------------- 6. TRAP 3: partial date
hdr("6. TRAP 3 — PARTIAL DATE")
ae = rd(SDTM["ae"])
partials = [r for r in ae if iso_part.match(r["AESTDTC"])]
check(len(partials) == 1, "exactly one partial AESTDTC", f"{len(partials)} partial dates")
if partials:
    pr = partials[0]
    check(pr["AESTDY"] == "", "partial-date AE has NULL AESTDY (no imputation)", "partial AE has a study day")
    supp_for = {(r["USUBJID"], r["IDVARVAL"]): r["QVAL"] for r in supp}
    trtem = supp_for.get((pr["USUBJID"], pr["AESEQ"]))
    check(trtem == "N", "partial screening AE is AETRTEM=N (whole month pre-dose)",
          f"partial AE AETRTEM={trtem}")
# the same subject also has a Y — both flags on one subject
sub = "DEF-01-02-001"
flags = {r["QVAL"] for r in supp if r["USUBJID"] == sub}
check(flags == {"N", "Y"}, "02/001 demonstrates BOTH AETRTEM values", f"02/001 flags {flags}")

# independently re-derive AETRTEM for every AE
def latest_day(part_iso):
    y, m = map(int, part_iso.split("-"))
    return datetime(y, m, calendar.monthrange(y, m)[1])

trtem_bad = 0
supp_map = {(r["USUBJID"], r["IDVARVAL"]): r["QVAL"] for r in supp}
for r in ae:
    ref = RFST[r["USUBJID"]]
    if iso_part.match(r["AESTDTC"]):
        want = "N" if latest_day(r["AESTDTC"]) < ref else "Y"
    else:
        dt = datetime.strptime(r["AESTDTC"], "%Y-%m-%d")
        want = "Y" if dt >= ref else "N"
    if supp_map[(r["USUBJID"], r["AESEQ"])] != want:
        trtem_bad += 1
check(trtem_bad == 0, "every AETRTEM re-derives correctly", f"{trtem_bad} AETRTEM mismatches")


# ------------------------------------------------- 7. TRAP 4: abnormal lab no AE
hdr("7. TRAP 4 — ABNORMAL LABS, NO AE")
lb = rd(SDTM["lb"])
# re-derive LBNRIND for every row
nr_bad = 0
for r in lb:
    v, lo, hi = float(r["LBORRES"]), float(r["LBORNRLO"]), float(r["LBORNRHI"])
    want = "LOW" if v < lo else "HIGH" if v > hi else "NORMAL"
    if r["LBNRIND"] != want:
        nr_bad += 1
check(nr_bad == 0, "every LBNRIND agrees with its range", f"{nr_bad} LBNRIND errors")

# The SAFETY signal: ALT is HIGH exactly once, at 02/003 Week 12.
alt_high = [r for r in lb if r["LBTESTCD"] == "ALT" and r["LBNRIND"] == "HIGH"]
check(len(alt_high) == 1 and alt_high[0]["USUBJID"] == "DEF-01-02-003"
      and alt_high[0]["VISIT"] == "WEEK 12",
      "ALT is HIGH exactly once (02/003, Week 12) — the safety signal",
      f"unexpected ALT highs: {[(h['USUBJID'], h['VISIT']) for h in alt_high]}")

# The EXPECTED disease markers: enrolled diabetics are HIGH on HbA1c (above the
# non-diabetic reference range). That is correct, not a defect — and still not an AE.
hba1c_high = all(r["LBNRIND"] == "HIGH" for r in lb if r["LBTESTCD"] == "HBA1C")
check(hba1c_high, "HbA1c is HIGH for every enrolled subject (expected disease marker)",
      "some HbA1c not HIGH — check the reference ranges")

# THE BOUNDARY: no abnormal lab has spawned an AE. No hepatic AE for 02/003, and
# no hyperglycaemia AE anywhere despite every glucose/HbA1c being HIGH.
liver = [r for r in ae if r["USUBJID"] == "DEF-01-02-003"
         and ("alt" in r["AETERM"].lower() or "liver" in r["AETERM"].lower()
              or "hepat" in r["AEDECOD"].lower())]
check(not liver, "02/003 has NO liver/ALT adverse event (boundary holds)", f"unexpected liver AE {liver}")
hyperg = [r for r in ae if "hypergly" in r["AEDECOD"].lower() or "hypergly" in r["AETERM"].lower()]
check(not hyperg, "no hyperglycaemia AE despite HIGH glucose/HbA1c (disease != AE)",
      f"unexpected hyperglycaemia AE {hyperg}")


# ------------------------------------------------- 8. baseline flags
hdr("8. BASELINE FLAGS (VS & LB)")
for n, blfl, testv in (("vs", "VSBLFL", "VSTESTCD"), ("lb", "LBBLFL", "LBTESTCD")):
    rows = rd(SDTM[n])
    dyv = n.upper() + "DY"
    check({r[blfl] for r in rows} <= {"Y", ""}, f"{n.upper()}: {blfl} is Y-or-null", f"{n.upper()}: bad {blfl}")
    # re-derive: latest pre-dose (--DY<=1) per subject+test, only tests with a post-dose value
    haspost = {(r["USUBJID"], r[testv]) for r in rows if r[dyv] != "" and int(r[dyv]) > 1}
    maxpre = {}
    for r in rows:
        k = (r["USUBJID"], r[testv])
        if r[dyv] != "" and int(r[dyv]) <= 1 and k in haspost:
            maxpre[k] = max(maxpre.get(k, -10**9), int(r["VISITNUM"]))
    want = {(r["USUBJID"], r[testv], r["VISITNUM"]) for r in rows
            if r[dyv] != "" and int(r[dyv]) <= 1 and maxpre.get((r["USUBJID"], r[testv])) == int(r["VISITNUM"])}
    got = {(r["USUBJID"], r[testv], r["VISITNUM"]) for r in rows if r[blfl] == "Y"}
    check(want == got, f"{n.upper()}: {blfl} matches the derivation",
          f"{n.upper()}: {blfl} mismatch missing={sorted(want-got)[:2]} extra={sorted(got-want)[:2]}")
    visits = {r["VISIT"] for r in rows if r[blfl] == "Y"}
    check(visits == {"BASELINE"}, f"{n.upper()}: every {blfl}=Y at BASELINE", f"{n.upper()}: {blfl} at {visits}")


# ------------------------------------------------- 9. CT conformance
hdr("9. CONTROLLED TERMINOLOGY")
dm = rd(SDTM["dm"])
check(all(r["SEX"] in ("M", "F", "U") for r in dm), "SEX in {M,F,U}", "SEX outside codelist")
check(all(r["ARMCD"] in ("X", "P") for r in dm), "ARMCD in {X,P}", "ARMCD unexpected")
check(all(r["AESER"] in ("Y", "N") for r in ae), "AESER in {Y,N}", "AESER unexpected")
check(all(r["AESEV"] in ("MILD", "MODERATE", "SEVERE") for r in ae), "AESEV in severity codelist", "AESEV unexpected")
# LBTEST renames survived
lb_map = {(r["LBTESTCD"], r["LBTEST"]) for r in lb}
check(("HBA1C", "Hemoglobin A1C") in lb_map, "HbA1c -> Hemoglobin A1C rename applied", "HBA1C rename missing")
check(("GLUC", "Glucose") in lb_map, "Fasting Glucose -> Glucose rename applied", "GLUC rename missing")


# ------------------------------------------- 10. --STRESN / --STRESC integrity
# Two bug classes found by running this on real SAS:
#   (a) --STRESN is NUMERIC, so it can never carry a trailing zero. Writing the
#       raw text "1.0" into it makes the reference disagree with any real SAS
#       run, which renders it "1".
#   (b) --STRESC is CHARACTER and should keep the COLLECTED text when no unit
#       conversion happened ("84.0" stays "84.0"). Re-rendering it through a
#       numeric format silently drops a significant figure.
hdr("10. --STRESN NUMERIC-CLEAN, --STRESC PRESERVES COLLECTED TEXT")
for dom, pre in (("vs", "VS"), ("lb", "LB")):
    rows = rd(SDTM[dom])
    bad_n = [r for r in rows
             if r[pre + "STRESN"] and _isnum(r[pre + "STRESN"])
             and float(r[pre + "STRESN"]) == int(float(r[pre + "STRESN"]))
             and r[pre + "STRESN"] != str(int(float(r[pre + "STRESN"])))]
    check(not bad_n, f"{pre}: every {pre}STRESN is a normalised number",
          f"{pre}: {len(bad_n)} {pre}STRESN values a NUMERIC cannot hold, "
          f"e.g. {[b[pre+'STRESN'] for b in bad_n[:3]]}")


# ================================================ SOLUTION CONTAINMENT
#  A zip carrying 13_capstone_DEF01_SOLUTION.sas hands trainees the answer. Such a
#  bundle is legitimate for the INSTRUCTOR (re-validating on ODA needs the solution
#  to run), but the FILENAME must say so, so it can never be handed out by mistake.
#  Rule: any bundle without "INSTRUCTOR" in its name must be solution-free.
hdr("SOLUTION CONTAINMENT IN SHIPPABLE BUNDLES")
import glob as _glob, zipfile as _zip
_BOOT = os.path.dirname(os.path.dirname(HERE))          # capstone/data -> Bootcamp
_zips = sorted(_glob.glob(os.path.join(_BOOT, "**", "*.zip"), recursive=True))
check(bool(_zips), f"found {len(_zips)} bundle(s) to inspect",
      "no .zip bundles found - this check inspected nothing")
for _z in _zips:
    _name = os.path.basename(_z)
    try:
        _inside = _zip.ZipFile(_z).namelist()
    except Exception as _e:
        check(False, "", f"{_name}: cannot be read ({_e})")
        continue
    _leak = [n for n in _inside if "SOLUTION" in n.upper() or "answer" in n.lower()]
    _flagged = "INSTRUCTOR" in _name.upper()
    check(not _leak or _flagged,
          (f"{_name}: carries the solution, correctly marked INSTRUCTOR" if _leak
           else f"{_name}: solution-free, safe to hand out"),
          f"{_name}: carries {_leak} but is NOT marked INSTRUCTOR - a trainee could be given this")

# VS specifically: unconverted rows must keep ORRES verbatim in STRESC
unconv = [r for r in rd(SDTM["vs"]) if r["VSORRESU"] == r["VSSTRESU"]]
drift = [r for r in unconv if r["VSORRES"] != r["VSSTRESC"]]
check(not drift, f"VS: all {len(unconv)} unconverted rows keep VSORRES in VSSTRESC",
      f"VS: {len(drift)} unconverted rows lost their collected text, "
      f"e.g. {[(d['VSORRES'], d['VSSTRESC']) for d in drift[:3]]}")


print("\n" + "=" * 70)
if FAILS:
    print(f"{len(FAILS)} FAILURE(S)")
    for f in FAILS:
        print("  -", f)
    sys.exit(1)
print("ALL DEF-01 CHECKS PASSED — raw, SDTM and the four traps are consistent.")
sys.exit(0)
