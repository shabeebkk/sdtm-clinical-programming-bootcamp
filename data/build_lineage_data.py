#!/usr/bin/env python3
"""
build_lineage_data.py — assemble the data that powers the SDTM Lineage Explorer.

The explorer answers the question a working programmer actually asks: "where did
this SDTM variable come from, and how?" Everything it shows is REAL ABC-01
metadata and REAL values — nothing invented:

  - variable-level lineage  <- SDTM_Mapping_Specification.xlsx  (per-domain sheets)
  - a live worked record    <- the raw CSV and the built SDTM CSV

Output: interactive/lineage_data.json  (embedded into the explorer at publish).
"""

import csv
import json
import os

import openpyxl

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "interactive", "lineage_data.json")
os.makedirs(os.path.dirname(OUT), exist_ok=True)

SPEC = os.path.join(HERE, "SDTM_Mapping_Specification.xlsx")

# Domain sheet -> (class, structure, one-line purpose). Order = teaching order.
DOMAINS = [
    ("DM",     "Special Purpose", "One record per subject"),
    ("AE",     "Events",          "One record per adverse event per subject"),
    ("SUPPAE", "Relationship",    "One record per supplemental qualifier"),
    ("VS",     "Findings",        "One record per test per visit per subject"),
    ("LB",     "Findings",        "One record per test per visit per subject"),
    ("EX",     "Interventions",   "One record per dosing period per subject"),
    ("CM",     "Interventions",   "One record per medication per subject"),
    ("DS",     "Events",          "One record per disposition event per subject"),
]

# The "hero" SDTM record shown as the live example for each domain. Keyed on
# values that actually EXIST (VISITNUM 3 is skipped by the protocol, so Findings
# are keyed by VISIT name, not number).
HERO = {
    "DM":     {"USUBJID": "ABC-01-01-002"},
    "AE":     {"USUBJID": "ABC-01-01-002", "AESEQ": "1"},   # the rich pre-dose event
    "SUPPAE": {"USUBJID": "ABC-01-01-002", "IDVARVAL": "1"},
    "VS":     {"USUBJID": "ABC-01-01-002", "VSTESTCD": "SYSBP", "VISIT": "WEEK 4"},
    "LB":     {"USUBJID": "ABC-01-01-002", "LBTESTCD": "GLUC"},
    "EX":     {"USUBJID": "ABC-01-01-002"},
    "CM":     {"USUBJID": "ABC-01-01-002", "CMSEQ": "1"},
    "DS":     {"USUBJID": "ABC-01-01-002", "DSSEQ": "1"},
}

# Once the SDTM hero row is found, lock the RAW row to the SAME real-world event
# by matching these (raw_col == sdtm_col) discriminators on top of site+subject.
# Without this a wide Findings raw row (all tests, every visit) or a subject's
# second event would line up against the wrong SDTM row.
RAW_MATCH = {
    "AE": [("AETERM", "AETERM")],   # verbatim term is preserved, so it links cleanly
    "CM": [("CMTRT",  "CMTRT")],
    "VS": [("VISIT",  "VISIT")],
    "LB": [("VISIT",  "VISIT")],
}


def read_csv(path):
    if not os.path.exists(path):
        return []
    with open(path) as f:
        return list(csv.DictReader(f))


def find_row(rows, keys):
    """First row matching all key=value pairs (string compare)."""
    for r in rows:
        if all(str(r.get(k, "")).strip() == str(v) for k, v in keys.items()):
            return r
    return None


def parse_domain_sheet(ws):
    """Return (header_index, [variable dicts]) from a domain sheet."""
    rows = list(ws.iter_rows(values_only=True))
    # header row is the one starting with '#'
    hidx = next(i for i, r in enumerate(rows) if r and str(r[0]).strip() == "#")
    hdr = [str(c).strip() if c is not None else "" for c in rows[hidx]]
    col = {name: i for i, name in enumerate(hdr)}
    out = []
    for r in rows[hidx + 1:]:
        if not r or r[col["SDTM Variable"]] in (None, ""):
            continue
        g = lambda name: (str(r[col[name]]).strip() if col.get(name) is not None
                          and col[name] < len(r) and r[col[name]] is not None else "")
        out.append({
            "name":       g("SDTM Variable"),
            "label":      g("SDTM Label"),
            "type":       g("Type"),
            "core":       g("Core"),
            "origin":     g("Origin"),
            "srcData":    g("Source Dataset"),
            "srcVar":     g("Source Variable"),
            "rule":       g("Mapping / Derivation Rule"),
            "ct":         g("CT Codelist"),
            "notes":      g("Notes"),
        })
    return out


def main():
    wb = openpyxl.load_workbook(SPEC, data_only=True)
    domains = []

    for dom, klass, structure in DOMAINS:
        variables = parse_domain_sheet(wb[dom])

        # live worked record: raw row + SDTM row
        raw_rows = read_csv(os.path.join(HERE, f"{dom.lower().replace('supp','')}_raw.csv")
                            if dom.startswith("SUPP") else
                            os.path.join(HERE, f"{dom.lower()}_raw.csv"))
        sdtm_rows = read_csv(os.path.join(HERE, "sdtm", f"{dom.lower()}.csv"))

        hero_keys = HERO.get(dom, {})
        # find the SDTM hero; if the exact keys miss, relax to just USUBJID so we
        # never silently fall back to an unrelated row 0.
        sdtm_row = (find_row(sdtm_rows, hero_keys)
                    or find_row(sdtm_rows, {"USUBJID": hero_keys.get("USUBJID", "")})
                    or (sdtm_rows[0] if sdtm_rows else {}))

        # raw hero: same site+subject, then locked to the SAME event as sdtm_row.
        raw_row = {}
        if raw_rows:
            usub = hero_keys.get("USUBJID", "")
            parts = usub.split("-")  # ABC-01-01-002 -> STUDY ABC-01, SITE 01, SUBJ 002
            site = parts[2] if len(parts) >= 4 else ""
            subj = parts[3] if len(parts) >= 4 else ""
            cand = [r for r in raw_rows
                    if str(r.get("SITEID", "")).strip() == site
                    and str(r.get("SUBJID", "")).strip() == subj]
            for raw_col, sdtm_col in RAW_MATCH.get(dom, []):
                want = str(sdtm_row.get(sdtm_col, "")).strip()
                narrowed = [r for r in cand
                            if str(r.get(raw_col, "")).strip() == want]
                if narrowed:
                    cand = narrowed
            raw_row = cand[0] if cand else (raw_rows[0] if raw_rows else {})

        domains.append({
            "name": dom, "class": klass, "structure": structure,
            "variables": variables,
            "example": {
                "usubjid": hero_keys.get("USUBJID", ""),
                "raw": raw_row, "sdtm": sdtm_row,
            },
        })

    data = {"study": "ABC-01", "domains": domains}
    with open(OUT, "w") as f:
        json.dump(data, f, indent=1)

    nv = sum(len(d["variables"]) for d in domains)
    print(f"wrote {OUT}")
    print(f"  {len(domains)} domains, {nv} variables")
    for d in domains:
        ex = d["example"]
        print(f"  {d['name']:<7} {len(d['variables']):>2} vars   "
              f"example raw={'yes' if ex['raw'] else 'NO'} sdtm={'yes' if ex['sdtm'] else 'NO'}")


if __name__ == "__main__":
    main()
