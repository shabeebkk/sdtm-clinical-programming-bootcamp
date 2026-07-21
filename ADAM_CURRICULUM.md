# Clinical Programming Bootcamp — ADaM Curriculum

**Study:** ABC-01 (synthetic) · **Standards baseline:** ADaMIG v1.2 (ADaM v2.1), OCCDS v1.0, ADaM TTE v1.0
**Prerequisite:** the SDTM course (`CURRICULUM.md`) — this builds directly on its output
**Last updated:** 2026-07-20

**Audience:** the same freshers who finished the SDTM track. They can now map raw data into SDTM
domains in SAS. They have never met an analysis dataset.

**Design principles:** unchanged from the SDTM course — every acronym defined on first use,
concrete examples over theory, decks carry concepts and notebooks carry practice, every notebook
has an instructor answer key, all data synthetic.

**Format:** 5 teaching days, following the 10 SDTM days. Numbering continues: decks 14–18,
notebooks 14–19.

---

## Build status

**All 5 days are complete.** ADSL · ADAE · ADVS · ADLB · ADTTE built from the ABC-01 SDTM
datasets, with 5 decks, 6 notebooks and 6 answer keys.

| | Built | Remaining |
|---|---|---|
| Reference data | **5 datasets** — ADSL, ADAE, ADVS, ADLB, ADTTE | — |
| Specification | `data/adam_specification.md` | — |
| Audit | `data/audit_adam.py` — **85 checks, all passing** | — |
| Decks | **14** (12) · **15** (9) · **16** (8) · **17** (7) · **18** (8 slides) | — |
| SAS notebooks | **14**–**19** (+ walkthroughs) | — |
| Answer keys | **14**–**19** | — |

The data layer is complete and self-checking. `build_adam_reference.py` derives all five datasets
from the ABC-01 SDTM datasets; `audit_adam.py` re-derives every rule *independently* from the SDTM
source and compares, so a bug in the builder cannot quietly reproduce itself in the audit.

**Not yet executed on SAS.** Per the course's standard, no ADaM material may be called verified
until it has run on SAS OnDemand for Academics and reproduced these reference datasets exactly.
The notebooks are queued for that run.

---

## Why ADaM exists — the one-sentence version

SDTM is organised for the **regulator**: faithful to what was collected, one domain per kind of
data, nothing derived that was not collected. ADaM is organised for the **analysis**: everything
a table needs is already on the row.

The test a dataset must pass to be ADaM: *a table, listing or figure can be produced by
subsetting and summarising this one dataset, with no further merging or derivation.*

---

## Day-by-day

### Day 11 — Why ADaM, and ADSL

- **Deck 14** · *From Tabulation to Analysis: Why ADaM Exists*
  SDTM vs ADaM side by side on the same subject; the three ADaM dataset classes (ADSL, BDS,
  OCCDS); analysis-ready as a testable property; traceability as a regulatory requirement, not a
  nicety; the CDISC document set and where each rule actually lives.
- **Notebook 14** · *Build ADSL* — one row per subject, treatment variables, population flags,
  treatment dates and duration, disposition, and baseline height/weight/BMI.

**The lesson that lands hardest:** the baseline rule is *last non-missing value on or before
first dose* — **not** a copy of `VSBLFL`. Height in ABC-01 is collected only at Screening, so no
height record carries `VSBLFL = "Y"`. Copy the flag and all 8 subjects lose their baseline height,
and with it their BMI — silently, with no error. Trainees are asked to write the copy version
first, see the empty column, and then fix it.

**Also:** `SAFFL` and `ITTFL` are both `Y` for all 8 subjects, and are still derived from
different rules, because they answer different questions.

### Day 12 — ADAE and the occurrence data structure

- **Deck 15** · *Occurrence Data: ADAE and the Safety Tables It Feeds*
  What a safety table actually reports; why every one of them starts from `TRTEMFL`; occurrence
  flags and subject-level counting; severity and causality as analysis variables.
- **Notebook 15** · *Build ADAE* — merge ADSL onto AE, derive the analysis dates and study days,
  read `TRTEMFL` from SUPPAE, and set `AOCCFL` / `AOCCPFL`.

**The teaching case:** `ABC-01-01-002`'s first AE starts on study day **−5**. It is real, it stays
in the dataset, and it is not treatment-emergent. That single row is the difference between a
defensible AE summary and an indefensible one.

**The traceability point:** `TRTEMFL` is *read from* `SUPPAE.AETRTEM`, which the SDTM course
already derived. One derivation, one home. Recomputing it in ADaM invites the two to drift, and
nothing will tell you when they do.

**The counting point:** `AOCCFL` marks exactly one row per subject, so that counting flagged rows
counts *subjects* — the number on the first line of every AE table. A subject with three events
must not be counted three times.

### Day 13 — ADVS and the basic data structure

- **Deck 16** · *Basic Data Structure: One Row per Subject per Parameter per Visit*
  The BDS shape and why nearly every efficacy dataset uses it; `PARAMCD`/`PARAM`/`PARAMN`;
  `AVISIT` as an *analysis* visit; `AVAL` vs `AVALC`; baseline, change, percent change; what
  `DTYPE` and `ANL01FL` are for.
- **Notebook 16** · *Build ADVS* — the BDS transpose from VS, baseline and change derivation, and
  BMI as a **derived parameter**.

**Two distinctions that matter:**

*A derived parameter is not a derived record.* BMI is a new `PARAMCD` that exists in no SDTM
domain. `DTYPE` stays null, because `DTYPE` identifies a derived *record within* a parameter —
LOCF, an average of replicates. `SRCDOM`/`SRCSEQ` stay null too: there is no single source record
to point at, and inventing one is a false trail.

*`CHG` at baseline is blank, not zero.* A baseline record's change is undefined. A literal 0 enters
the mean-change column and drags the average toward zero — a real, silent bias.

**Also:** rounding is specified, not incidental. `70.2 - 70.5` is `-0.29999999999999716` in both SAS
and Python; only an explicit `round(..., 0.0001)` in both implementations makes them agree.

### Day 14 — ADLB, reference ranges and shifts

- **Deck 17** · *Analysis of Lab Data: Ranges, Shifts and Criterion Flags*
  Reference ranges as analysis variables; the shift table; criterion flags and prespecification;
  where analysis populations come from.
- **Notebook 17** · *Build ADLB* — the same BDS skeleton as ADVS, plus `ANRIND`, `BNRIND`,
  `SHIFT1`, `CRIT1`/`CRIT1FL`.

**The denominator lesson.** ADLB has 4 subjects; ADSL has 8. Any percentage computed from ADLB's
own subject count is wrong. Denominators come from ADSL, always. This is the most common ADaM
error in practice, and it is invisible — the number looks plausible.

**The blank-vs-N lesson.** `CRIT1FL` is populated only on `ALT` rows. On a `CREAT` row it is
**blank**, not `N`, because `N` asserts "evaluated against this criterion and did not meet it",
which is false. Blank says "not evaluated". Conflating them inflates the denominator of every
criterion summary.

### Day 15 — ADTTE, validation, and one real table

- **Deck 18** · *Time-to-Event Data, ADaM Validation, and Analysis Results Metadata*
  Events and censoring; why censored subjects are kept; ADaM conformance rules and what Pinnacle
  21 checks on an ADaM package; define.xml for analysis datasets and Analysis Results Metadata.
- **Notebook 18** · *Build ADTTE* — one row per safety subject, event or censored.
- **Notebook 19** · *From ADaM to a table* — produce a demographics table and a treatment-emergent
  AE summary from ADSL and ADAE with `PROC FREQ` and `PROC MEANS`, and nothing else.

**`CNSR` runs backwards.** `0` = the event happened, `1` = censored. Everywhere else in ADaM,
`Y`/`1` means "yes, this is true". Read it twice, every time.

**Censored subjects stay.** Two subjects had no treatment-emergent AE. Dropping them would answer
"how fast did events happen among people who had events" — a question nobody asked.

**Notebook 19 is the payoff.** It is short by design. The whole point of four days of derivation
is that the table falls out of one `PROC FREQ` against one dataset, with no merging and no
derivation at the analysis step. If a trainee finds themselves needing a join to produce the
table, the ADaM dataset was built wrong — and that is the closing lesson of the course.

---

## Assets

**Reference data** (`data/adam/`) — `adsl.csv` `adae.csv` `advs.csv` `adlb.csv` `adtte.csv`,
built by `data/build_adam_reference.py`.

**Specification** — `data/adam_specification.md`, the full derivation spec with the rationale for
each rule. This is what the notebooks teach from.

**Audit** — `data/audit_adam.py`. 85 checks covering row counts and structure, every derivation
re-derived independently from SDTM, cross-dataset agreement with ADSL, and assertions that each
deliberate teaching case is still intact (the pre-dose AE, the AE discontinuation, the ALT
abnormal, the screening-only height, the partial lab coverage). It is mutation-tested: breaking
the height baseline the way a trainee would trips three separate checks.

---

## Row counts (useful for checking work)

| Dataset | Rows | Note |
|---|---|---|
| ADSL | 8 | one per subject |
| ADAE | 10 | one per AE; 9 are treatment-emergent |
| ADVS | 152 | 128 observed + 24 derived BMI |
| ADLB | 48 | 4 subjects only — the denominator lesson |
| ADTTE | 8 | 6 events, 2 censored |

---

## Compressed 3-day track

Day 11 unchanged (ADSL is not compressible — everything downstream copies from it). Merge Days 13
and 14 into one BDS day using ADVS only, with ADLB's shift and criterion flags demonstrated rather
than built. Drop ADTTE to a hand-out and keep Notebook 19, because the payoff table is what makes
the preceding work make sense. Net: 3 days covering ADSL, ADAE, one BDS dataset, and one table.
