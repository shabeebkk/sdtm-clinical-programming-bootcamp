# Clinical Programming Bootcamp — Curriculum

**Study:** ABC-01 (synthetic) · **Standards baseline:** SDTMIG v3.3 (SDTM v1.7), current CDISC Controlled Terminology
**Last updated:** 2026-07-19

**Audience:** freshers with mixed backgrounds — some from clinical/life sciences with little coding, some coders new to clinical trials. No prior knowledge of either domain or programming assumed.

**Design principles:** every acronym defined on first use · concrete examples over theory · decks carry concepts, notebooks carry practice · every notebook has an instructor answer key · **all data is synthetic** — no real patient data anywhere.

**Format:** 10 teaching days (2 weeks). A compressed 1-week track is at the end.

---

## Build status

**All 10 days are complete.** DM · DS · AE · SUPPAE · CM · EX · VS · LB built and verified on ABC-01; a second study (DEF-01) built for the capstone.

| | Built | Remaining |
|---|---|---|
| Decks | **13** (01–13) | — |
| SAS notebooks | **12** (01, 03–12) + capstone | — |
| Answer keys | **12** | — |
| Domains built | DM, **DS**, AE, SUPPAE, CM, EX, VS, LB | — |

**Verification.** Days 1–7's SAS was executed on SAS OnDemand for Academics
(SAS 9.04.01M8P022223) with **all 7 domains reproducing the reference datasets exactly** —
zero errors, zero warnings. Days 8–9's notebooks (10–12) and the capstone pass static checks and are queued for the next ODA run. The capstone study DEF-01 has its own 63-check audit (`capstone/data/def01_audit.py`). Three automated checkers run over the corpus:

| Checker | What it guards |
|---|---|
| `data/audit_consistency.py` | 216 checks — raw ↔ SDTM ↔ specs ↔ CRF ↔ notebooks ↔ docs all agree |
| `notebooks/sas/check_sas_static.py` | 149 checks — SAS syntax, informat widths, rename collisions, join-key leaks |
| `presentations/check_deck_layout.py` | deck geometry — hidden text, content running off-slide |

---

## Language policy (updated 2026-07-18)

Notebooks are **SAS-only by default**. R versions are built on request.

**Already built in both languages** (kept as-is, still valid):
Notebook 01 Basics · Notebook 03 Importing Raw Data · Notebook 04 Build DM.

**Unaffected:** Deck 03 (*Your Toolkit: SAS & R*) and its Rosetta Stone cheat sheet stay —
trainees benefit from seeing how the two languages express the same operations, even if they
only *practise* in SAS.

---

## Day-by-day

### WEEK 1 — Foundations, tooling, and the first domains

**Day 1 — CDISC & SDTM foundations** ✅
- Deck 01 · *Introduction to CDISC & SDTM Foundations* (23 slides)
- Deck 02 · *Clinical Trials 101: How a Trial Produces Data* (18 slides)
- Trace the data path CRF/EDC → SDTM → ADaM → submission; name the roles; state why regulators require SDTM.
- Concept day, no coding.

**Day 2 — Your toolkit: SAS and R** ✅
- Deck 03 · *Your Toolkit: SAS & R for Clinical Programming* (16 slides)
- Notebook 01 · *SAS Basics* — libraries, DATA step, PROC PRINT/SORT/FREQ, formats.
- Notebook 02 · *SAS Functions* — the ~25 functions that do the work: STRIP/UPCASE/SCAN/SUBSTR/CATX, ROUND/SUM, date functions, **INPUT vs PUT**, MISSING/COALESCE. **Self-contained** (uses DATALINES — no data files, runs anywhere).
- *(R equivalent `01_r_basics_R.ipynb` exists but is optional under the SAS-only policy.)*

**Day 3 — Reading raw clinical data** ✅
- Deck 04 · *Reading & Understanding Raw Clinical Data* (13 slides)
- Notebook 03 · *Importing Raw Data* — read the ABC-01 raw CSVs with controlled types, spot the mapping problems.
- **Key idea: raw data is never ISO 8601.** The CRF collects `DD-MMM-YYYY`; AE and CM deliberately mix `DD/MM/YYYY` with `DD-Mon-YYYY` in one column.

**Day 4 — Building the DM domain** ✅
- Deck 05 · *Building SDTM Domains I: Special Purpose & DM* (13 slides)
- **Excel mapping exercise first** — `data/DM_Mapping_Exercise.xlsx`. Trainees map 7 subjects × 23 variables **by hand**, with live self-check formulas, *before* writing any code.
- Notebook 04 · *Build the DM Domain* — USUBJID, AGE from birth date, CT for SEX/RACE/ETHNIC, reference dates from EX and DS.
- Also covers **DS** (Disposition), which supplies `RFPENDTC`.

**Day 5 — Events: the AE domain** ✅
- Deck 06 · *Interventions & Events Domains* (13 slides)
- Notebook 05 · *Build the AE Domain* — mixed date parsing, four flavours of CT, `AEOUT` code decode, `AESEQ`, `AESTDY`/`AEENDY`.
- Also builds **SUPPAE** with `AETRTEM` — the first supplemental qualifiers dataset, and the rule that you never add a non-standard column to a standard domain.

**Day 6 — Interventions: CM and EX** ✅
- (continues Deck 06)
- Notebook 06 · *Build the CM Domain* — the `CMFREQ` → `CMDOSFRQ` rename; **negative `--DY` is correct** for prior medications.
- Notebook 07 · *Build the EX Domain* — `EXINTP` is collected but **not submitted**; `EXSTDY` is 1 for everyone, and why that tautology is a useful check.

**Day 7 — Findings: VS and LB** ✅
- Deck 07 · *Findings Domains* (14 slides)
- Notebook 08 · *Build the VS Domain* — the **wide → tall transpose**, 24 raw rows → 128 SDTM rows; the baseline flag.
- Notebook 09 · *Build the LB Domain* — already tall; `LBTESTCD`/`LBTEST` CT lookups (`White Blood Cells` → `Leukocytes`), reference ranges, `LBNRIND`.

### WEEK 2 — Terminology, derivations, quality, capstone

**Day 8 — Controlled Terminology & core derivations** ✅
- Deck 08 · *Controlled Terminology in Practice* — codelists, extensible vs non-extensible, NCI-EVS, versioning.
- Deck 09 · *Derivations: `--DY`, `--SEQ`, EPOCH & timing* — `RFSTDTC` reference; **no Day 0**; `--SEQ` uniqueness.
- Notebook 10 · *Applying Controlled Terminology* — build and apply lookup maps; fail loudly on unrecognised values.
- Notebook 11 · *Deriving `--DY` and `--SEQ`* — consolidates what Days 4–7 applied domain by domain.

**Day 9 — Data quality, validation & the submission package** ✅
- Deck 10 · *Data Quality & Validation: Pinnacle 21 concepts*
- Deck 11 · *Relationships & Trial Design* — SUPPQUAL, RELREC; TS/TA/TE/TV (lighter treatment)
- Deck 12 · *Define-XML & the Submission Package* — metadata, aCRF, cSDRG, define.xml
- Notebook 12 · *QC & Validation Checks* — duplicates, missing Required variables, invalid CT, key uniqueness.

**Day 10 — Capstone** ✅
- Deck 13 · *Capstone Briefing & Wrap-up* (7 slides)
- Capstone · *Study DEF-01* — a fresh Phase 2 diabetes study (6 subjects) mapped end to end with four deliberate traps (unit conversion, dosing interruption, partial date, abnormal-lab boundary). Student skeleton + instructor solution + `verify_capstone.sas`. Lives in `capstone/`.

---

## Assets

**Presentations** (`presentations/`) — 01 Intro ✅ · 02 Clinical Trials 101 ✅ · 03 SAS & R Toolkit ✅ · 04 Reading Raw Data ✅ · 05 DM & Special Purpose ✅ · 06 Interventions & Events ✅ · 07 Findings ✅ · 08 Controlled Terminology ✅ · 09 Derivations ✅ · 10 Quality & Validation ✅ · 11 Relationships & Trial Design ✅ · 12 Define-XML & Submission ✅ · 13 Capstone ✅

**Notebooks** (`notebooks/sas/`) — each is a `.sas` program plus a `.md` walkthrough:
01 SAS Basics ✅ · 02 SAS Functions ✅ · 03 Importing Raw Data ✅ · 04 Build DM ✅ · 05 Build AE ✅ · 06 Build CM ✅ · 07 Build EX ✅ · 08 Build VS ✅ · 09 Build LB ✅ · 10 Applying CT ✅ · 11 Deriving --DY/--SEQ ✅ · 12 QC & Validation ✅ · 13 Capstone (DEF-01) ✅

Plus the run harness: `00_setup.sas` (paths) · `run_all.sas` (smoke test) · `verify_against_reference.sas` (value-level check).

**Mock data** (`data/`)

| File | Contents |
|---|---|
| 7 raw CSVs | `dm` `ds` `ex` `ae` `cm` `vs` `lb` — EDC-style, one per CRF form |
| `sdtm/` | 8 reference datasets: `dm` `ds` `ex` `ae` `suppae` `cm` `vs` `lb` |
| `DM_Mapping_Exercise.xlsx` | the by-hand mapping exercise (Day 4) |
| `SDTM_Mapping_Specification.xlsx` | full 13-sheet spec, one sheet per domain |
| `blankcrf.pdf` · `acrf.pdf` | the CRF, split as a submission does: blank forms, and the same forms SDTM-annotated |
| `mapping_specification.md` · `raw_data_dictionary.md` | narrative spec and dictionary |

**Answer keys** (`answer-keys/`) — instructor-only, one per built notebook.

**Running on SAS OnDemand for Academics:** see `README_ODA.md` and `sdtm_bootcamp_oda.zip`.

---

## Row counts (useful for checking work)

| Domain | Rows | Note |
|---|---|---|
| DM | 8 | one per subject |
| DS | 24 | 3 milestones per subject |
| EX | 8 | one dosing period each |
| AE | 10 | 2 subjects have none; 1 is a screening event |
| SUPPAE | 10 | `AETRTEM` — 9 `Y`, 1 `N` |
| CM | 8 | 4 are prior medications |
| VS | 128 | from 24 raw rows — the transpose |
| LB | 48 | only 4 subjects have labs |

---

## Compressed 1-week track

Days 1–2 → one "Foundations + Tooling" day. Merge CM/EX into one session and VS/LB into one.
Drop Deck 11 to a hand-out. Capstone becomes a half-day. Net: 5 days covering DM, AE, one
Interventions domain, one Findings domain, CT, `--DY`/`--SEQ`, and a lighter capstone.
