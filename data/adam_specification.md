# ADaM Specification — Study ABC-01

**Standards baseline:** ADaMIG v1.2 (ADaM v2.1) · OCCDS v1.0 for ADAE · ADaM TTE v1.0 for ADTTE
**Source:** the ABC-01 SDTM datasets in `sdtm/` — see `mapping_specification.md`
**Reference implementation:** `build_adam_reference.py` → `adam/*.csv`
**Checked by:** `audit_adam.py` (85 checks)

> All data is synthetic. Coded terms that would come from a licensed dictionary
> (MedDRA for `AEDECOD`) are illustrative only.

---

## 0. Rules that apply to every dataset

**ADaM is analysis-ready.** The test is: a table, listing or figure can be produced by
subsetting and summarising one dataset, with no further merging or derivation. Everything a
table needs must already be on the row.

**ADSL is the single source of subject-level truth.** Treatment variables, population flags and
treatment dates are *copied* into every other dataset, never re-derived there. If `SAFFL`
disagrees between ADSL and ADAE, the study has two answers to "who was dosed", and neither can
be defended.

**Traceability runs backwards to SDTM.** Every observed record carries `SRCDOM`/`SRCVAR`/`SRCSEQ`
naming the SDTM record it came from. A derived record that has no single source leaves them null
— that absence is information, not an omission.

### Dates are numeric

| | SDTM | ADaM |
|---|---|---|
| Variable | `--DTC` | `--DT` |
| Type | character | **numeric** |
| Example | `"2024-03-01"` | `23436` formatted `DATE9.` |

ADaM date variables are numeric SAS dates so they can be subtracted. The reference CSVs write
ISO text because a CSV cannot carry "numeric date"; the comparison step applies
`PUT(var, YYMMDD10.)` before comparing. **In the dataset you build, they are numeric.**

### Rounding is specified, not incidental

Floating point is not associative, and SAS and Python differ in the last bit. `70.2 - 70.5` is
`-0.29999999999999716` in both languages — only rounding makes it `-0.3`. So every derived
non-integer is rounded explicitly, to a precision named here, in both implementations:

| Variable | Precision | SAS |
|---|---|---|
| `CHG` | 0.0001 | `round(aval - base, 0.0001)` |
| `PCHG` | 0.0001 | `round(100 * chg / base, 0.0001)` |
| `BMI`, `BMIBL` | 0.01 | `round(w / (h/100)**2, 0.01)` |

`PCHG` must guard its denominator: when `BASE` is 0, `PCHG` is **missing**, not an error.

---

## 1. ADSL — Subject-Level Analysis Dataset

**Structure:** one row per subject. 8 rows. No `--SEQ`.
**Sources:** DM (demographics, treatment dates), DS (randomisation, disposition), VS (baseline
height and weight).

| Variable | Type | Derivation |
|---|---|---|
| `STUDYID` `USUBJID` `SUBJID` `SITEID` `COUNTRY` | Char | Copy from DM |
| `ARM` `ACTARM` | Char | Copy from DM |
| `TRT01P` | Char | `= ARM` — planned treatment, period 1 |
| `TRT01PN` | Num | `Placebo → 1`, `Drug A → 2`. Display order, **not a dose** |
| `TRT01A` `TRT01AN` | | `= ACTARM` and its code. Identical to planned here; they diverge in real studies when a subject is dosed off-protocol |
| `AGE` `AGEU` `SEX` `RACE` `ETHNIC` | | Copy from DM |
| `AGEGR1` | Char | `AGE < 65 → "<65"`, else `">=65"` |
| `AGEGR1N` | Num | `1` / `2`, matching `AGEGR1` |
| `RFICDT` | Num date | From `DM.RFICDTC` |
| `RANDDT` | Num date | `DS.DSSTDTC` where `DSDECOD = "RANDOMIZED"` |
| `TRTSDT` | Num date | From `DM.RFXSTDTC` — first dose. **Defines Day 1** |
| `TRTEDT` | Num date | From `DM.RFXENDTC` — last dose |
| `TRTDURD` | Num | `TRTEDT - TRTSDT + 1` |
| `EOSSTT` | Char | `COMPLETED` if the DS disposition event is `COMPLETED`, else `DISCONTINUED` |
| `DCSREAS` | Char | Null if completed; else `DSDECOD` of the disposition event |
| `DCSREASP` | Char | Null if completed; else the verbatim `DSTERM` |
| `SAFFL` | Char | `Y` if the subject took at least one dose (`TRTSDT` non-missing) |
| `ITTFL` | Char | `Y` if the subject was randomised (`RANDDT` non-missing) |
| `COMPLFL` | Char | `Y` if `EOSSTT = "COMPLETED"` |
| `HEIGHTBL` | Num | Baseline height (cm) — see the baseline rule below |
| `WEIGHTBL` | Num | Baseline weight (kg) |
| `BMIBL` | Num | `WEIGHTBL / (HEIGHTBL/100)**2`, rounded to 0.01 |

### The baseline rule — and why it is not `VSBLFL`

> **Baseline = the last non-missing value on or before the date of first dose.**

It is tempting to copy `VS.VSBLFL = "Y"`. Do not. In ABC-01, height is collected **only at
Screening**, so no height record has `VSBLFL = "Y"`. A copy leaves every subject with no
baseline height and therefore no BMI — for all 8 subjects, silently.

The date rule resolves correctly per parameter, because it asks a question about time rather
than about a visit label:

| Parameter | Baseline comes from | Why |
|---|---|---|
| `HEIGHT` | Screening | the only record, and it precedes first dose |
| `WEIGHT`, `SYSBP`, … | Baseline visit | later than Screening, still on or before first dose |

`SAFFL` and `ITTFL` are both `Y` for all 8 subjects here. They are still derived from different
rules, because they answer different questions — dosed, versus randomised — and in a study with
a screen failure or a randomised-but-never-dosed subject they diverge.

---

## 2. ADAE — Adverse Events (OCCDS)

**Structure:** one row per adverse event. 10 rows.
**Sources:** AE, SUPPAE, ADSL.

Carried from ADSL: `SUBJID` `SITEID` `TRTA` `TRTAN` `AGE` `AGEGR1` `AGEGR1N` `SEX` `RACE`
`SAFFL` `TRTSDT` `TRTEDT`.

| Variable | Derivation |
|---|---|
| `AESEQ` `AETERM` `AEDECOD` `AESEV` `AESER` `AEREL` `AEOUT` | Copy from AE |
| `ASTDT` `AENDT` | Numeric dates from `AESTDTC` / `AEENDTC` |
| `ASTDY` `AENDY` | Study day relative to `TRTSDT`. **No Day 0** |
| `ADURN` | `AENDT - ASTDT + 1`. **Missing** when the event is ongoing — not 0 |
| `ASEVN` | `MILD → 1`, `MODERATE → 2`, `SEVERE → 3` |
| `AREL` | `Y` if `AEREL ∈ {RELATED, POSSIBLY RELATED}`, else `N` |
| `TRTEMFL` | **From `SUPPAE.AETRTEM`** — not re-derived |
| `AOCCFL` | `Y` on the first treatment-emergent event per subject |
| `AOCCPFL` | `Y` on the first treatment-emergent event per subject **per preferred term** |

### Treatment-emergent, and why it comes from SUPPAE

`ABC-01-01-002` has an AE starting on study day **−5**, before first dose. It is a real event
and stays in the dataset, but it is not treatment-emergent: `TRTEMFL = "N"`. Every safety table
in the study is built on `TRTEMFL = "Y"`, so this one row is the difference between a defensible
AE summary and an indefensible one.

The flag was already derived in SDTM as `SUPPAE.AETRTEM`. ADaM **reads it** rather than
recomputing it. One derivation, one home — recomputing invites the two to drift.

### Occurrence flags mark exactly one row

`AOCCFL` exists so that *counting rows where the flag is `Y`* gives *the number of subjects with
at least one event* — the number every AE table's first line reports. It is set on exactly one
row per subject, so it cannot double-count a subject with three events. `AOCCPFL` does the same
per preferred term, for the by-term rows of the same table.

Both are restricted to `TRTEMFL = "Y"`. Order by `ASTDT` then `AESEQ` so the choice of row is
deterministic and reproducible.

---

## 3. ADVS — Vital Signs (BDS)

**Structure:** one row per subject per parameter per visit. 152 rows = 128 VS records + 24
derived BMI records.
**Sources:** VS, ADSL.

Carried from ADSL: `SUBJID` `SITEID` `TRTP` `TRTPN` `TRTA` `TRTAN` `AGE` `AGEGR1` `AGEGR1N`
`SEX` `RACE` `SAFFL` `ITTFL` `TRTSDT` `TRTEDT`.

| `PARAMCD` | `PARAM` | `PARAMN` |
|---|---|---|
| `SYSBP` | Systolic Blood Pressure (mmHg) | 1 |
| `DIABP` | Diastolic Blood Pressure (mmHg) | 2 |
| `PULSE` | Pulse Rate (beats/min) | 3 |
| `TEMP` | Temperature (C) | 4 |
| `WEIGHT` | Weight (kg) | 5 |
| `HEIGHT` | Height (cm) | 6 |
| `BMI` | Body Mass Index (kg/m2) | 7 — **derived parameter** |

`PARAMCD` ↔ `PARAM` ↔ `PARAMN` must be one-to-one. `PARAM` carries the unit, because it is what
prints as a table row label.

| Variable | Derivation |
|---|---|
| `AVAL` | `VS.VSSTRESN` |
| `AVISIT` `AVISITN` | `SCREENING → Screening/0`, `BASELINE → Baseline/1`, `WEEK 4 → Week 4/4` |
| `ADT` `ADY` | Numeric date from `VSDTC`; study day relative to `TRTSDT` |
| `ABLFL` | `Y` on the baseline record — the baseline rule of §1 |
| `BASE` | `AVAL` of that subject+parameter's `ABLFL = "Y"` record |
| `CHG` | `AVAL - BASE`, **post-baseline records only** |
| `PCHG` | `100 * CHG / BASE`, post-baseline only, missing when `BASE = 0` |
| `ANL01FL` | `Y` on the baseline record and on-treatment records |
| `DTYPE` | Null throughout — no imputed or derived *records* |
| `SRCDOM` `SRCVAR` `SRCSEQ` | `VS` / `VSSTRESN` / `VSSEQ`; **null on BMI records** |

### AVISIT is an analysis visit

`VISIT`/`VISITNUM` are what the CRF collected; `AVISIT`/`AVISITN` are what the analysis reports.
Here the mapping is 1:1, but they remain different columns with different jobs — `AVISITN`
drives sort and column order in every table, and analysis visits can window, merge or drop
collected ones.

### `CHG` is blank at baseline, not zero

A baseline record's change is *undefined*, not zero. A literal 0 would enter the mean-change
column and drag the average toward zero — a real, silent bias. Blank keeps it out.

### BMI is a derived parameter, not a derived record

BMI appears in no SDTM domain. It is added as a new `PARAMCD` using the visit's weight and the
subject's **baseline** height, because height is measured once.

`DTYPE` stays **null**. `DTYPE` identifies a derived *record within* a parameter — LOCF, an
average of replicates. A whole new parameter is not that. `SRCDOM`/`SRCSEQ` are null too: there
is no single source record to point at, and inventing one would be a false trail.

`HEIGHT` has only a Screening record, which is its own baseline, so it has no `CHG` anywhere —
correct, not missing data.

---

## 4. ADLB — Laboratory Results (BDS)

**Structure:** one row per subject per parameter per visit. 48 rows.
**Sources:** LB, ADSL. Same BDS variables as ADVS, plus the following.

| `PARAMCD` | `PARAM` | `PARAMN` | `PARCAT1` |
|---|---|---|---|
| `HGB` | Hemoglobin (g/dL) | 1 | HEMATOLOGY |
| `HCT` | Hematocrit (%) | 2 | HEMATOLOGY |
| `WBC` | Leukocytes (10^9/L) | 3 | HEMATOLOGY |
| `PLAT` | Platelets (10^9/L) | 4 | HEMATOLOGY |
| `ALT` | Alanine Aminotransferase (U/L) | 5 | CHEMISTRY |
| `CREAT` | Creatinine (mg/dL) | 6 | CHEMISTRY |

| Variable | Derivation |
|---|---|
| `ANRLO` `ANRHI` | `LB.LBSTNRLO` / `LBSTNRHI` |
| `ANRIND` | `LOW` / `NORMAL` / `HIGH` by `AVAL` against `ANRLO`–`ANRHI` |
| `BNRIND` | `ANRIND` of the baseline record |
| `SHIFT1` | `"BNRIND to ANRIND"`, post-baseline only. Blank at baseline |
| `CRIT1` | `"ALT > ULN"` — populated on `ALT` records only |
| `CRIT1FL` | `Y` / `N` on `ALT` records; **blank elsewhere** |

### Only 4 of 8 subjects have labs

ADLB has 4 subjects; ADSL has 8. A percentage computed with ADLB's subject count as the
denominator is wrong. **Denominators come from ADSL**, always — that is what the population
flags are for. This is the single most common ADaM error in practice.

### A shift table needs both ends on one row

`SHIFT1` is a cross-tabulation of `BNRIND` by `ANRIND`, so the post-baseline row must know where
it started. `ABC-01-01-003` has ALT 24 U/L at baseline and 72 U/L at Week 4 against an upper
limit of 56 — `"NORMAL to HIGH"`, the study's one shift.

### A criterion flag is blank where it does not apply

`CRIT1FL` is populated only on `ALT` rows. On a `CREAT` row it is **blank**, not `N`, because
`N` would assert "creatinine was evaluated against the ALT criterion and did not meet it" —
which is false. Blank says "not evaluated". Conflating the two inflates the denominator of every
criterion summary.

---

## 5. ADTTE — Time to First Treatment-Emergent AE

**Structure:** one row per subject per parameter. 8 rows — every safety subject, event or not.
**Sources:** ADAE, ADSL.

| Variable | Derivation |
|---|---|
| `PARAMCD` `PARAM` | `TTFAE` / Time to First Treatment-Emergent Adverse Event (days) |
| `STARTDT` | `ADSL.TRTSDT` — the time origin |
| `ADT` | Event: `ASTDT` of the first `TRTEMFL = "Y"` event. Censored: `ADSL.TRTEDT` |
| `AVAL` | `ADT - STARTDT + 1` (days) |
| `CNSR` | `0` = event occurred · `1` = censored |
| `EVNTDESC` | What `ADT` represents in words |
| `CNSDTDSC` | Why censored. Populated on censored records **only** |

### `CNSR` runs backwards from every other flag

`0` means the event **happened**; `1` means censored. Everywhere else in ADaM, `Y`/`1` means
"yes, this thing is true". `CNSR` is defined this way in the ADaM TTE spec because the value is
used arithmetically downstream. It catches people out constantly — read it twice.

### Censored subjects must be kept

`ABC-01-01-003` and `ABC-01-02-004` had no treatment-emergent AE. They are censored at last
dose, not dropped. A time-to-event dataset that drops its censored subjects biases every
estimate it feeds — it answers "how fast did events happen among people who had events", which
is not a question anyone asked.

Result: 6 events, 2 censored. `ABC-01-01-002`'s event is its **day 7** AE, not the day −5
pre-dose one, because the pre-dose event is not treatment-emergent.

---

## 6. Row counts

| Dataset | Rows | Structure |
|---|---|---|
| ADSL | 8 | one per subject |
| ADAE | 10 | one per adverse event |
| ADVS | 152 | 128 observed + 24 derived BMI |
| ADLB | 48 | one per result; 4 subjects only |
| ADTTE | 8 | one per safety subject |

## 7. Regenerating and checking

```bash
cd data
python3 build_adam_reference.py   # writes adam/*.csv
python3 audit_adam.py             # 85 checks; exit 0 = clean
```
