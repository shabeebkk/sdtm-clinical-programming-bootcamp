# Raw Data Dictionary — Study ABC-01 (synthetic)

> **All data is synthetic.** No real patients, sites, investigators, or products.
> These are **raw, pre-SDTM, EDC-style extracts** — one file per case report form
> (CRF). The bootcamp notebooks map them into SDTM domains. The files intentionally
> contain the messy realities you must clean up on the way to SDTM.

## The study in one paragraph
ABC-01 is a small, synthetic Phase 2 study comparing **Drug A 50 mg** against
**Placebo**, both taken orally once daily for ~4 weeks. **8 subjects** are enrolled
across **2 sites** (01 and 02). Each subject is consented, randomized to an arm,
dosed, and followed through a Week 4 visit. One subject (site 01, subject 004)
discontinues early.

## Files
| File | CRF / content | Shape | Rows |
|---|---|---|---|
| `dm_raw.csv` | Demographics / enrolment (screening) | one row per subject | 8 |
| `ds_raw.csv` | Disposition / end of study | one row per subject | 8 |
| `ex_raw.csv` | Study-drug exposure | one row per subject | 8 |
| `ae_raw.csv` | Adverse events | one row per event | 10 |
| `cm_raw.csv` | Concomitant medications | one row per medication | 8 |
| `vs_raw.csv` | Vital signs | **wide**: one row per subject per visit | 24 |
| `lb_raw.csv` | Laboratory results | **tall**: one row per test | 48 |

> **Why Demographics and Disposition are separate files.** They are separate CRF forms
> completed at different times: demographics at **screening**, disposition at the **end**
> of the subject's participation. End-of-study status therefore never appears on the
> demographics form.

## How the files relate
- Every file has `STUDYID` (always `ABC-01`), `SITEID`, and `SUBJID`.
- **`SUBJID` is only unique *within* a site.** SUBJID `001` exists at both site 01 and
  site 02 — these are *different people*. You must combine site + subject to identify a
  subject uniquely. This is exactly why SDTM needs **USUBJID** (e.g. `ABC-01-01-001`).
- The **first dose date** in `ex_raw.csv` (`EXSTDTC`) is the study **reference start
  date** used to derive **study day (`--DY`)** in later exercises.

> **No raw date is in ISO 8601.** Every date field on the ABC-01 CRF is labelled
> `DD-MMM-YYYY`, and that is what the EDC exports. ISO `YYYY-MM-DD` is the **SDTM target**
> format — converting to it is one of the mapping jobs, not something the raw data gives
> you for free. AE and CM go further and contain a *mix* of formats in the same column.

---

## Deliberate "quirks" to map (this is the teaching content)
| Quirk | Where | What the notebook does |
|---|---|---|
| `SUBJID` not unique across sites | all files | Build `USUBJID` = STUDYID-SITEID-SUBJID |
| `SEX` stored as a code (`1`/`2`) | dm | Map to CT: 1→`M`, 2→`F` |
| `RACE` free text, mixed case/spaces | dm | Trim + map to CT race values |
| `ARM` as text | dm | Derive `ARMCD` (`A` / `P`) |
| Birth date, not age | dm | Derive `AGE` (+ `AGEU`) from BRTHDTC and RFICDTC |
| **No raw date is ISO** | all files | Every date must be converted to ISO 8601 `YYYY-MM-DD` |
| Standard CRF format `DD-MMM-YYYY` | dm, ds, ex, vs, lb | Parse with `date9.` (SAS) / `%d-%b-%Y` (R) |
| **Mixed** formats in one column (`DD/MM/YYYY` + `DD-Mon-YYYY`) | ae, cm | Detect the format per value, then convert |
| Blank end date = ongoing | ae, cm | Leave end date null; do not invent a value |
| Free-text severity / seriousness | ae | Map to CT (severity, `N`/`Y`) |
| **Coded** outcome (`AEOUT` = 1-5) | ae | Decode the number to its CT term |
| Frequency field renamed | ex, cm | Raw `EXFREQ`/`CMFREQ` → SDTM `EXDOSFRQ`/`CMDOSFRQ` |
| Collected but not submitted | ex, ds, vs | `EXINTP` drives record splitting; `EOSOTH` feeds a verbatim term; `VSND` would drive `VSSTAT`. None is an SDTM variable |
| Verbatim term only | ae, cm | Keep verbatim (`AETERM`/`CMTRT`); note where a coded term (MedDRA/WHODrug) would go |
| **Wide** measurements | vs | Transpose to tall `--TESTCD`/`--TEST`/`--ORRES` |
| Height at screening only | vs | Expect nulls at later visits (do not carry forward) |
| Original units, full test names | lb | Derive `LBTESTCD` from CT; standardize (`--STRESN`/`--STRESU`) |
| Abnormal lab value present | lb | (site 01 / subj 003, Week 4 ALT = 72 U/L, above range) |

---

## Column reference

### `dm_raw.csv`
| Column | Meaning | Notes / values |
|---|---|---|
| STUDYID | Study id | `ABC-01` |
| SITEID | Site number | `01`, `02` |
| SUBJID | Subject number **within site** | not unique across sites |
| BRTHDTC | Date of birth | `DD-MMM-YYYY` (e.g. `14-MAY-1969`) |
| SEX | Sex **code** | `1` = Male, `2` = Female |
| RACE | Race (free text) | inconsistent casing / trailing spaces |
| ETHNIC | Ethnicity (free text) | `Not Hispanic or Latino`, `Hispanic or Latino`, `Unknown` |
| COUNTRY | Country | `USA`, `JPN`, `GBR` (already ISO 3166 alpha-3) |
| ARM | Planned treatment arm | `Drug A`, `Placebo` |
| RFICDTC | Informed consent date | `DD-MMM-YYYY`; the reference for AGE |
| RANDDTC | Randomization date | `DD-MMM-YYYY`; becomes a DS protocol milestone |

### `ds_raw.csv`
The **Study Completion / Disposition** form, completed when the subject leaves the study.

| Column | Meaning | Notes / values |
|---|---|---|
| EOSSTAT | End-of-study status | `Completed`, `Discontinued` — title case, needs CT mapping |
| EOSDT | End-of-study date | `DD-MMM-YYYY` |
| EOSREAS | Reason, if discontinued | free text (`Adverse event`); blank when completed |
| EOSOTH | "If Other, specify" free text | Blank for everyone here. **Not submitted** — would feed the verbatim `DSTERM` |

One subject (site 01, subject 004) discontinued early. Cross-reference `ae_raw.csv`:
that subject had a **severe, serious** "worsening hypertension" event — the story is
consistent across domains.

### `ex_raw.csv`
| Column | Meaning | Notes |
|---|---|---|
| EXTRT | Treatment given | `Drug A`, `Placebo` |
| EXDOSE | Dose per administration | `50` for Drug A, `0` for Placebo |
| EXDOSU | Dose unit | `mg` |
| EXFREQ | Dosing frequency | `QD` (once daily) — maps to SDTM **`EXDOSFRQ`** (note the rename) |
| EXROUTE | Route | `ORAL` |
| EXSTDTC | First dose date | `DD-MMM-YYYY` — **reference start date (RFSTDTC)** |
| EXENDTC | Last dose date | `DD-MMM-YYYY` |
| EXINTP | Was dosing interrupted or modified? | `Y`/`N`. **Not submitted.** A `Y` means the subject needs one EX record per continuous dosing period (EXSEQ 1, 2, 3…). All `N` here |

### `ae_raw.csv`
| Column | Meaning | Notes |
|---|---|---|
| AETERM | Verbatim adverse-event term | free text |
| AESTDT / AEENDT | Start / end date | **mixed formats**; blank AEENDT = ongoing |
| AESEV | Severity | `mild`/`moderate`/`severe` (mixed case) → CT |
| AESER | Serious? | `No`/`N`/`Yes` → CT `N`/`Y` |
| AEREL | Relationship to study drug | `Related`/`Not related`/`Possibly related`/`Unlikely related` |
| AEOUT | Outcome | **numeric code** from the CRF dropdown → decode to CT (see below) |

**AEOUT codes** (as printed on the AE CRF form):
`1` = Recovered/Resolved · `2` = Recovering/Resolving · `3` = Not recovered/Not resolved
· `4` = Fatal · `5` = Unknown

### `cm_raw.csv`
| Column | Meaning | Notes |
|---|---|---|
| CMTRT | Medication name (verbatim) | free text |
| CMINDC | Indication | free text |
| CMSTDT / CMENDT | Start / end date | **mixed formats**; blank CMENDT = ongoing |
| CMDOSE / CMDOSU | Dose / unit | e.g. `500` / `mg` |
| CMROUTE | Route | `ORAL`, `TOPICAL` |
| CMFREQ | Frequency | `QD`, `BID`, `PRN` |

### `vs_raw.csv` (wide)
| Column | Meaning | Notes |
|---|---|---|
| VISIT | Visit name | `SCREENING`, `BASELINE`, `WEEK 4` |
| VSDT | Visit date | `DD-MMM-YYYY` |
| SYSBP / DIABP | Systolic / diastolic blood pressure | mmHg |
| PULSE | Pulse rate | beats/min |
| TEMP | Temperature | **Celsius** |
| HEIGHT | Height | cm — **screening only** (blank later) |
| WEIGHT | Weight | kg |
| VSND | Were any assessments not performed? | `Y`/`N` — `N` for all. **Not submitted**; a `Y` would drive `VSSTAT = NOT DONE` and `VSREASND` |

### `lb_raw.csv` (tall)
| Column | Meaning | Notes |
|---|---|---|
| VISIT | Visit name | `BASELINE`, `WEEK 4` |
| LBDT | Collection date | `DD-MMM-YYYY` |
| LBTEST | Test name (full) | derive `LBTESTCD` from CT |
| LBORRES | Result as collected | original result |
| LBORRESU | Original unit | e.g. `g/dL`, `10^9/L`, `mg/dL` |
| LBORNRLO / LBORNRHI | Reference range low / high | as collected |

**Tests present:** Hemoglobin, Hematocrit, White Blood Cells, Platelets,
Alanine Aminotransferase, Creatinine. Only 4 subjects (01/001, 01/002, 01/003,
02/001) have labs, at 2 visits each.

---

## Regenerating
`python3 generate_mock_data.py` recreates all seven CSVs deterministically.
Edit the `SUBJECTS` table and the per-domain row lists to extend the study
(e.g. for the capstone's separate mini-study).
