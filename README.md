# Clinical Programming Bootcamp — SDTM and ADaM

A hands-on training course that takes someone with **no clinical and no programming background**
all the way from raw clinical trial data to a submission table, in SAS.

**Two courses, run back to back:**

| | Days | Covers | Curriculum |
|---|---|---|---|
| **SDTM** | 10 | raw CRF data → CDISC SDTM domains | [`CURRICULUM.md`](CURRICULUM.md) |
| **ADaM** | 5 | SDTM domains → analysis datasets → a table | [`ADAM_CURRICULUM.md`](ADAM_CURRICULUM.md) |

Built around two complete synthetic studies: **ABC-01** for teaching and **DEF-01** as a capstone.

> **All data is synthetic.** No real patients, sites, investigators or products appear anywhere
> in this repository.

---

## What's here

| Folder | Contents |
|---|---|
| `presentations/` | 18 decks (`.pptx` + build scripts + rendered PDFs) — 13 SDTM, 5 ADaM |
| `notebooks/sas/` | 18 SAS programs, each with a `.md` walkthrough, plus the run harness |
| `data/` | Study ABC-01 — 7 raw CSVs, 8 SDTM and 5 ADaM reference datasets, specs, CRF/aCRF |
| `capstone/` | Study DEF-01 — a second study trainees map end to end |
| `interactive/` | Three self-contained HTML explorers over the ABC-01 data (see below) |
| `oda_upload/` | Ready-to-upload bundle for SAS OnDemand for Academics |
| `video/` | Remotion source for an animated explainer on clinical programming |

**SDTM domains covered:** DM · DS · AE (+SUPPAE) · CM · EX · VS · LB, plus controlled
terminology, `--DY`/`--SEQ` derivations, QC/validation, Define-XML concepts and a capstone.

**ADaM datasets covered:** ADSL · ADAE (OCCDS) · ADVS · ADLB (BDS) · ADTTE, plus the baseline
rule, occurrence flags, derived parameters, shift and criterion flags, censoring, and one
notebook that produces two real submission tables with no joins and no derivations.

---

## Verified, not just written

**Both tracks have been executed on SAS OnDemand for Academics** (SAS 9.04.01M8P022223) and
reproduce their reference datasets exactly, zero errors:

- **SDTM** — 8 domains for ABC-01, 6 for DEF-01 (`run_all.sas` → `verify_against_reference.sas`).
- **ADaM** — ADSL, ADAE, ADVS, ADLB, ADTTE, each matching its reference via the notebook's own
  `PROC COMPARE` (`run_all_adam.sas`).

**That execution mattered, on both tracks.** The SDTM run found 11 defects (see below); the first
ADaM run found two more — a `PROC SQL` subquery SAS rejects in a FROM-less `SELECT`, and a
`PROC PRINT` naming a variable the final keep list had dropped. Both were pure SAS *execution*
semantics: the static checker and the independent Python audit passed them, and only a real run
surfaced them. A clean static pass is not a correct run — which is the thing this course teaches.

Four checkers guard the corpus and run on every change. Counts grow as material is added — run a
checker to see its current total:

| Checker | Guards |
|---|---|
| `data/audit_consistency.py` | raw ↔ SDTM ↔ specs ↔ CRF ↔ notebooks ↔ docs agree |
| `notebooks/sas/check_sas_static.py` | SAS syntax, informat widths, rename collisions, macro quoting |
| `data/audit_adam.py` | ADaM re-derived independently from SDTM; mutation-tested |
| `capstone/data/def01_audit.py` | the capstone study and its four deliberate traps |

A fifth, `presentations/check_deck_layout.py`, checks deck geometry on the built `.pptx` files.

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
# SDTM — raw data, then the reference domains, then the audit
cd data && python3 generate_mock_data.py && python3 build_sdtm_reference.py && python3 audit_consistency.py

# ADaM — derived from the SDTM datasets above, so run it after them
cd data && python3 build_adam_reference.py && python3 audit_adam.py

# Capstone study DEF-01
cd capstone/data && python3 def01_generate_mock_data.py && python3 def01_build_sdtm_reference.py && python3 def01_audit.py
```

Rebuilding a deck needs `pptxgenjs`, which is installed globally rather than vendored:

```bash
cd presentations && NODE_PATH=$(npm root -g) node build_14_why_adam_adsl.js
python3 check_deck_layout.py
```

---

## Not in this repository

- **Answer keys and the capstone solution** — excluded via `.gitignore` so the repo can be shared
  with trainees. They live alongside the course locally.
- **`node_modules/`** — run `npm install` in `video/remotion/`.
- **API keys** — the voiceover script reads `ELEVENLABS_API_KEY` from a gitignored `.env`.

---

## Interactive explorers

Three standalone pages in `interactive/`. Each is a single HTML file with its data inlined or
alongside as JSON — **open by double-click, no server, no network**. Useful on a projector when a
static slide isn't landing.

| Page | What it does |
|---|---|
| `subject_journey_dashboard.html` | one subject at a time, every domain laid on the study-day axis — dosing, AEs, con meds, visits, labs. Makes `--DY` and the pre-dose AE visible rather than abstract |
| `sdtm_lineage_explorer.html` | raw CRF field → SDTM variable for all 8 domains, with a real worked record per domain |
| `ae_mapper.html` | a practice widget: map one real AE record field by field and get graded, with feedback on the four traps (numeric-outcome decode, ISO date on a mixed-format field, negative study day, routing `AETRTEM` to SUPPAE) |

The two JSON files are **generated** from the SDTM datasets, so they can go stale if the study
data is regenerated and the builders are not re-run:

```bash
python3 data/build_subject_data.py && python3 data/build_lineage_data.py
```

Section 11 of `data/audit_consistency.py` guards exactly that: it re-derives the embedded facts —
demographics, per-subject record counts, the `AETRTEM` flags, each domain's worked example — from
the SDTM CSVs and fails if the JSON disagrees.

## Submission package

The course now produces the three things a regulator actually receives:

| Part | Artifact | Built by |
|---|---|---|
| Data (SDTM) | one `.xpt` per tabulation dataset (XPORT v5) | `notebooks/sas/12b_submission_package_SAS.sas` |
| Metadata (SDTM) | `data/define/define.xml` (Define-XML v2.0, SDTM-IG v3.3) | `data/build_define_xml.py` — **generated from `SDTM_Mapping_Specification.xlsx`** |
| Metadata (ADaM) | `data/define/define_adam.xml` (Define-XML v2.0, ADaM-IG v1.2, with value-level metadata) | `data/build_adam_define_xml.py` — **generated from `ADaM_Specification.xlsx`** |
| Narrative | `docs/cSDRG_ABC-01.pdf` | `docs/build_csdrg.py` |

Plus the CRF, split as a submission does: `data/blankcrf.pdf` (the forms as asked) and
`data/acrf.pdf` (the same forms annotated with SDTM variables), the latter linked from the define.

> Both defines are structurally correct and self-checked, but **not** schema-validated against
> `define2-0-0.xsd` — that needs Pinnacle 21. Treat them as teaching artifacts.

## Troubleshooting

`TROUBLESHOOTING.md` is a symptom-to-cause guide built from **thirteen real defects** found by
running this course on SAS OnDemand for Academics — eleven from the SDTM track, two from the ADaM
track. Eight produced no error at all. It is the fastest way to unstick a trainee whose program
"ran fine" but produced the wrong data.

---

## Licence

Dual-licensed (see `LICENSE`):

- **Course material** — [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/):
  share and adapt with attribution, non-commercial, share alike.
- **Code and generated data** — MIT.

**Teaching from this is encouraged** and is not a commercial use. Running paid training from it
is, and needs permission.

See `NOTICE.md` for terminology and standards attribution.
