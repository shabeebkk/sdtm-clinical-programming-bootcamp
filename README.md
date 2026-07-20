# Clinical Programming Bootcamp — SDTM

A 10-day, hands-on training course that takes someone with **no clinical and no programming
background** to mapping raw clinical trial data into **CDISC SDTM** domains in SAS.

Built around two complete synthetic studies: **ABC-01** for teaching and **DEF-01** as a capstone.

> **All data is synthetic.** No real patients, sites, investigators or products appear anywhere
> in this repository.

---

## What's here

| Folder | Contents |
|---|---|
| `presentations/` | 13 decks (`.pptx` + build scripts + rendered PDFs) |
| `notebooks/sas/` | 12 SAS programs, each with a `.md` walkthrough, plus the run harness |
| `data/` | Study ABC-01 — 7 raw CSVs, 8 reference SDTM datasets, specs, sample CRF/aCRF |
| `capstone/` | Study DEF-01 — a second study trainees map end to end |
| `oda_upload/` | Ready-to-upload bundle for SAS OnDemand for Academics |
| `video/` | Remotion source for an animated explainer on clinical programming |

Domains covered: **DM · DS · AE (+SUPPAE) · CM · EX · VS · LB**, plus controlled terminology,
`--DY`/`--SEQ` derivations, QC/validation, Define-XML concepts and a capstone.

---

## Verified, not just written

Every SAS program has been **executed on SAS OnDemand for Academics** (SAS 9.04.01M8P022223)
and reproduces its reference datasets exactly — 8 domains for ABC-01, 6 for DEF-01, zero errors.

Three checkers guard the corpus and run on every change:

| Checker | Guards |
|---|---|
| `data/audit_consistency.py` | 221 checks — raw ↔ SDTM ↔ specs ↔ CRF ↔ notebooks ↔ docs agree |
| `notebooks/sas/check_sas_static.py` | 151 checks — SAS syntax, informat widths, rename collisions, macro quoting |
| `capstone/data/def01_audit.py` | 65 checks — the capstone study and its four deliberate traps |

**That execution mattered.** Running the code on real SAS surfaced **11 defects** that neither
static analysis nor an independent Python reimplementation could see, because all of them were
SAS *execution* semantics rather than logic — and most raised no error at all. A few examples:

- a `RENAME` collision that silently kept raw values, so every controlled-terminology mapping
  in AE failed while the program reported success;
- a failed step leaving a stale `WORK` dataset that let one study's data flow into another's
  output, with no error;
- `84.0` kg quietly becoming `84` — one row in 96, a dropped significant figure;
- a partial date `FEB-2024` parsing as January, because an unstripped `SCAN()` result broke
  `INDEX()`. **Every** month would have become January.

That experience is itself taught in the QC module: *a clean-looking run is not a correct run.*

---

## Running it

Everything runs on the free **SAS OnDemand for Academics** tier — no local SAS licence needed.

1. Upload `oda_upload/sdtm_bootcamp/` to SAS Studio (see `oda_upload/README_ODA.md`).
2. Edit the three paths in `00_setup.sas` and submit it.
3. Run `run_all.sas` (smoke test), then `verify_against_reference.sas` (value-level check).

Trainees work through the notebooks one at a time; `run_all.sas` is an instructor smoke test.

## Regenerating the data

```bash
cd data     && python3 generate_mock_data.py && python3 build_sdtm_reference.py && python3 audit_consistency.py
cd capstone/data && python3 def01_generate_mock_data.py && python3 def01_build_sdtm_reference.py && python3 def01_audit.py
```

---

## Not in this repository

- **Answer keys and the capstone solution** — excluded via `.gitignore` so the repo can be shared
  with trainees. They live alongside the course locally.
- **`node_modules/`** — run `npm install` in `video/remotion/`.
- **API keys** — the voiceover script reads `ELEVENLABS_API_KEY` from a gitignored `.env`.

See `NOTICE.md` for terminology and standards attribution.
