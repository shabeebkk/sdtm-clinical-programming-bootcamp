#!/usr/bin/env python3
"""
build_subject_data.py — assemble the per-subject journey that powers the
Subject Journey dashboard.

For each of the 8 ABC-01 subjects it stitches every domain together on the
study-day axis: demographics + milestones (DM), how they left (DS), dosing (EX),
adverse events with their treatment-emergent flag (AE + SUPPAE), con meds (CM),
and findings over visits (VS, LB) with reference ranges. All real ABC-01 values.

Output: interactive/subjects.json
"""

import csv
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
SDTM = os.path.join(HERE, "sdtm")
OUT = os.path.join(os.path.dirname(HERE), "interactive", "subjects.json")
os.makedirs(os.path.dirname(OUT), exist_ok=True)


def read(name):
    with open(os.path.join(SDTM, name + ".csv")) as f:
        return list(csv.DictReader(f))


def num(x):
    x = (x or "").strip()
    if x in ("", "."):
        return None
    try:
        return int(x) if x.lstrip("-").isdigit() else float(x)
    except ValueError:
        return None


def by_subject(rows):
    d = {}
    for r in rows:
        d.setdefault(r["USUBJID"], []).append(r)
    return d


def main():
    dm = read("dm")
    ds = by_subject(read("ds"))
    ex = by_subject(read("ex"))
    ae = by_subject(read("ae"))
    cm = by_subject(read("cm"))
    vs = by_subject(read("vs"))
    lb = by_subject(read("lb"))

    # AETRTEM lives in SUPPAE keyed by AESEQ
    trtem = {}
    for r in read("suppae"):
        if r["QNAM"] == "AETRTEM":
            trtem[(r["USUBJID"], r["IDVARVAL"])] = r["QVAL"]

    subjects = []
    for d in dm:
        u = d["USUBJID"]
        days = []          # collect every study day seen, to size the axis

        def add(*vals):
            for v in vals:
                if isinstance(v, (int, float)):
                    days.append(v)

        dosing = []
        for r in sorted(ex.get(u, []), key=lambda r: num(r["EXSTDY"]) or 0):
            s, e = num(r["EXSTDY"]), num(r["EXENDY"])
            add(s, e)
            dosing.append({"trt": r["EXTRT"], "dose": num(r["EXDOSE"]), "unit": r["EXDOSU"],
                           "freq": r["EXDOSFRQ"], "route": r["EXROUTE"],
                           "startDtc": r["EXSTDTC"], "endDtc": r["EXENDTC"],
                           "startDy": s, "endDy": e})

        aes = []
        for r in sorted(ae.get(u, []), key=lambda r: num(r["AESTDY"]) or 0):
            s, e = num(r["AESTDY"]), num(r["AEENDY"])
            add(s, e)
            aes.append({"seq": r["AESEQ"], "term": r["AETERM"], "decod": r["AEDECOD"],
                        "sev": r["AESEV"], "ser": r["AESER"], "rel": r["AEREL"], "out": r["AEOUT"],
                        "startDtc": r["AESTDTC"], "endDtc": r["AEENDTC"], "startDy": s, "endDy": e,
                        "trtem": trtem.get((u, r["AESEQ"]), "")})

        cms = []
        for r in sorted(cm.get(u, []), key=lambda r: num(r["CMSTDY"]) or 0):
            s, e = num(r["CMSTDY"]), num(r["CMENDY"])
            add(s, e)
            cms.append({"trt": r["CMTRT"], "decod": r["CMDECOD"], "indc": r["CMINDC"],
                        "dose": r["CMDOSE"], "unit": r["CMDOSU"], "route": r["CMROUTE"],
                        "startDtc": r["CMSTDTC"], "endDtc": r["CMENDTC"], "startDy": s, "endDy": e})

        def findings(rows, pre):
            out = []
            for r in rows:
                dy = num(r[pre + "DY"])
                add(dy)
                item = {"testcd": r[pre + "TESTCD"], "test": r[pre + "TEST"],
                        "visit": r["VISIT"], "visitnum": num(r["VISITNUM"]),
                        "dtc": r[pre + "DTC"], "dy": dy,
                        "res": r[pre + "ORRES"], "num": num(r[pre + "STRESN"]),
                        "unit": r[pre + "STRESU"], "blfl": r.get(pre + "BLFL", "")}
                if pre == "LB":
                    item.update({"lo": num(r["LBSTNRLO"]), "hi": num(r["LBSTNRHI"]),
                                 "nrind": r["LBNRIND"]})
                out.append(item)
            return out

        vss = findings(sorted(vs.get(u, []), key=lambda r: (num(r["VISITNUM"]) or 0, r["VSTESTCD"])), "VS")
        lbs = findings(sorted(lb.get(u, []), key=lambda r: (num(r["VISITNUM"]) or 0, r["LBTESTCD"])), "LB")

        # visit markers: one per VISITNUM, with its study day (from whichever finding has it)
        visits = {}
        for it in vss + lbs:
            if it["visitnum"] is not None and it["visitnum"] not in visits:
                visits[it["visitnum"]] = {"visitnum": it["visitnum"], "visit": it["visit"], "dy": it["dy"]}
        visits = sorted(visits.values(), key=lambda v: v["visitnum"])

        # disposition
        disp = None
        for r in ds.get(u, []):
            if r["DSCAT"] == "DISPOSITION EVENT":
                disp = {"decod": r["DSDECOD"], "term": r["DSTERM"],
                        "dtc": r["DSSTDTC"], "dy": num(r["DSSTDY"])}
                add(disp["dy"])
        milestones = {"consent": d["RFICDTC"], "firstDose": d["RFSTDTC"],
                      "lastDose": d["RFENDTC"], "endPart": d["RFPENDTC"],
                      "death": d["DTHDTC"]}

        lo = min(days) if days else -7
        hi = max(days) if days else 30
        subjects.append({
            "usubjid": u, "site": d["SITEID"], "subjid": d["SUBJID"],
            "age": num(d["AGE"]), "ageu": d["AGEU"], "sex": d["SEX"], "race": d["RACE"],
            "ethnic": d["ETHNIC"], "country": d["COUNTRY"],
            "arm": d["ARM"], "armcd": d["ARMCD"], "actarm": d["ACTARM"],
            "milestones": milestones, "disposition": disp,
            "dayRange": {"min": lo, "max": hi},
            "dosing": dosing, "ae": aes, "cm": cms, "visits": visits, "vs": vss, "lb": lbs,
        })

    data = {"study": "ABC-01", "subjects": subjects}
    with open(OUT, "w") as f:
        json.dump(data, f, indent=1)

    print(f"wrote {OUT}  ({len(subjects)} subjects)")
    for s in subjects:
        st = (s["disposition"] or {}).get("decod", "?")
        print(f"  {s['usubjid']}  {s['arm']:<8} day {s['dayRange']['min']:>3}..{s['dayRange']['max']:<3}  "
              f"AE={len(s['ae'])} CM={len(s['cm'])} EX={len(s['dosing'])} "
              f"VS={len(s['vs'])} LB={len(s['lb'])}  -> {st}")


if __name__ == "__main__":
    main()
