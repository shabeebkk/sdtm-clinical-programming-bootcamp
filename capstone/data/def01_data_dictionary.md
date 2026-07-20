# Raw Data Dictionary — Capstone Study DEF-01 (synthetic)

> **All data is synthetic.** No real patients, sites, investigators, or products.
> These are **raw, pre-SDTM, EDC-style extracts** — one file per case report form (CRF).
> In the capstone you map them into SDTM **with no worked notebook in front of you**.

## The study in one paragraph
DEF-01 is a small, synthetic **Phase 2 study of Drug X 50 mg once daily vs placebo** in
**Type 2 diabetes**, taken orally for **12 weeks**. **6 subjects** are enrolled across
**2 sites**: site **01 is in Canada** (collects metric units) and site **02 is in the USA**
(collects US customary units — pounds and °F). Each subject is consented, randomized,
dosed, and followed through Screening, Baseline and a Week 12 visit. One subject (site 02,
subject 003) has a **dosing interruption** after a severe hypoglycaemia event.

## Files
| File | CRF / content | Shape | Rows |
|---|---|---|---|
| `dm_raw.csv` | Demographics / enrolment | one row per subject | 6 |
| `ex_raw.csv` | Study-drug exposure | one row per **dosing period** | 7 |
| `ae_raw.csv` | Adverse events | one row per event | 7 |
| `vs_raw.csv` | Vital signs | **wide**: one row per subject per visit | 18 |
| `lb_raw.csv` | Laboratory results | **tall**: one row per test | 32 |

> Disposition (DS) and Concomitant Medications (CM) are **out of scope** for the capstone.
> You will build DM, EX, AE (+ SUPPAE), VS and LB — one domain from every observation class.

## How the files relate
- Every file has `STUDYID` (always `DEF-01`), `SITEID`, and `SUBJID`.
- **`SUBJID` is only unique *within* a site.** SUBJID `001` exists at both sites — different
  people. Combine site + subject → **USUBJID** (e.g. `DEF-01-02-001`).
- The **first dose date** in `ex_raw.csv` is the reference start date `RFSTDTC`, from which
  every **study day (`--DY`)** is derived.

> **No raw date is ISO 8601.** The forms export `DD-MMM-YYYY` (dm, ex, vs, lb) and the AE
> form mixes `DD/MM/YYYY` with `DD-Mon-YYYY`. ISO `YYYY-MM-DD` is the SDTM **target**.

---

## ⚠️ Four things that are different from the teaching study (ABC-01)

Your ABC-01 programs are a good starting point, but **blind copy-paste will fail** at four
specific points. Each is realistic and each tests something you learned but never exercised
on ABC-01.

1. **Units are collected per site (VS).** Site 02 records **weight in lb** and **temperature
   in °F**. The raw carries the collected unit in `WEIGHTU` and `TEMPU`. `VSORRES`/`VSORRESU`
   keep the value *as collected*; `VSSTRESN`/`VSSTRESU` must **convert** to kg / °C. On
   ABC-01 every unit was already standard, so this never came up.

2. **Two dosing periods for one subject (EX).** Subject `02/003` appears **twice** in
   `ex_raw.csv` — dosing was interrupted. Each period is its own EX record (`EXSEQ` 1 and 2);
   the gap between them *is* the interruption. `RFSTDTC` is still the **first** dose;
   `RFENDTC` is the **last**.

3. **A partial date (AE).** Subject `02/001` reports a screening AE dated only to a month:
   `FEB-2024` — no day. Keep the partial in `AESTDTC` as `2024-02`; **do not invent a day**.
   `AESTDY` is therefore **null**. (You can still reason that `AETRTEM = N`, because the whole
   of February is before that subject's March first dose.)

4. **Abnormal labs are not adverse events (LB).** Every enrolled subject is **HIGH on HbA1c
   and glucose** — that is the diabetes they were enrolled with, not a finding. One subject
   also has a **HIGH ALT** at Week 12. You derive `LBNRIND`; you do **not** create an AE for
   any of them. Whether an abnormal lab is clinically significant is the investigator's call,
   recorded on the AE form — not yours to infer.

---

## `dm_raw.csv` — Demographics (6 rows)
| Field | Type | Notes |
|---|---|---|
| `STUDYID` | char | `DEF-01` |
| `SITEID` | char | `01` (Canada) or `02` (USA). **Keep as character** — leading zeros. |
| `SUBJID` | char | site-local id; not unique across sites |
| `BRTHDTC` | char | birth date, `DD-MMM-YYYY`. Source for AGE. |
| `SEX` | char | EDC code: `1` = Male, `2` = Female |
| `RACE` | char | free text, mixed case, a stray trailing space — normalise to CT |
| `ETHNIC` | char | `Hispanic or Latino` / `Not Hispanic or Latino` / `Unknown` |
| `COUNTRY` | char | already ISO 3166 alpha-3 (`CAN`, `USA`) |
| `ARM` | char | `Drug X` or `Placebo`. Derive `ARMCD` (`X` / `P`). |
| `RFICDTC` | char | informed consent date, `DD-MMM-YYYY`. Reference for AGE. |
| `RANDDTC` | char | randomization date (the day before first dose here) |

> There is **no end-of-study date** in this pack (no DS form in scope). `RFPENDTC` is
> therefore **null** — you cannot derive it from what you were given, and you must not
> invent it.

## `ex_raw.csv` — Exposure (7 rows — note: not 6)
| Field | Type | Notes |
|---|---|---|
| `STUDYID`,`SITEID`,`SUBJID` | char | keys |
| `EXTRT` | char | `Drug X` or `Placebo` |
| `EXDOSE` | num | `50` for Drug X, `0` for Placebo (0 is a value, not missing) |
| `EXDOSU` | char | `mg` |
| `EXFREQ` | char | `QD`. **Renames to `EXDOSFRQ`** in SDTM. |
| `EXROUTE` | char | `ORAL` |
| `EXSTDTC` | char | dosing-period start, `DD-MMM-YYYY` |
| `EXENDTC` | char | dosing-period end, `DD-MMM-YYYY` |
| `EXINTP` | char | "was dosing interrupted?" — **collected, not submitted**. Drop it. |

> **`02/003` has two rows** (a dosing interruption). `RFSTDTC` = earliest `EXSTDTC`;
> `RFENDTC` = latest `EXENDTC`.

## `ae_raw.csv` — Adverse events (7 rows)
| Field | Type | Notes |
|---|---|---|
| `STUDYID`,`SITEID`,`SUBJID` | char | keys |
| `AETERM` | char | verbatim, exactly as recorded — never tidy it |
| `AESTDT` | char | start date. **Mixed formats**: `DD/MM/YYYY`, `DD-Mon-YYYY`, and one **partial** `MON-YYYY`. |
| `AEENDT` | char | end date; blank = ongoing |
| `AESEV` | char | `mild`/`Mild`/`moderate`/`severe` — normalise to CT |
| `AESER` | char | `No`/`Yes` (and `N`/`Y`) → CT `N`/`Y` |
| `AEREL` | char | sponsor-defined: `Not related`/`Possibly related`/`Related` |
| `AEOUT` | char | **code 1–5**: 1 recovered, 2 recovering, 3 not recovered, 4 fatal, 5 unknown. Decode it. |

> Illustrative coded term `AEDECOD` (verbatim → MedDRA PT): note `low blood sugar` →
> **Hypoglycaemia** and `feeling sick` → **Nausea** — the coded term shares no words with
> the verbatim, so it can never be derived by string rules.

## `vs_raw.csv` — Vital signs (18 rows, **wide**)
| Field | Type | Notes |
|---|---|---|
| `STUDYID`,`SITEID`,`SUBJID` | char | keys |
| `VISIT` | char | `SCREENING` / `BASELINE` / `WEEK 12` |
| `VSDT` | char | visit date, `DD-MMM-YYYY` |
| `SYSBP`,`DIABP` | num | blood pressure, always **mmHg** |
| `PULSE` | num | always **beats/min** |
| `TEMP` | num | temperature — **unit in `TEMPU`** (`C` at site 01, `F` at site 02) |
| `TEMPU` | char | collected temperature unit |
| `HEIGHT` | num | cm; **collected at SCREENING only** (blank otherwise) |
| `WEIGHT` | num | weight — **unit in `WEIGHTU`** (`kg` at site 01, `lb` at site 02) |
| `WEIGHTU` | char | collected weight unit |
| `VSND` | char | "not done" flag — **collected, not submitted**. Drop it. |

> **Transpose wide → tall** (one row per subject × visit × test), and for WEIGHT/TEMP take
> the unit from its column. `VSORRES`/`VSORRESU` = as collected; `VSSTRESN`/`VSSTRESU` =
> standard (**kg / °C**), converting the site-02 values.

## `lb_raw.csv` — Laboratory (32 rows, **tall**)
| Field | Type | Notes |
|---|---|---|
| `STUDYID`,`SITEID`,`SUBJID` | char | keys |
| `VISIT` | char | `BASELINE` / `WEEK 12` (no screening draw in this protocol) |
| `LBDT` | char | visit date, `DD-MMM-YYYY` |
| `LBTEST` | char | the **lab's** test name — map to CDISC `LBTESTCD`/`LBTEST` (e.g. `HbA1c` → `HBA1C` / `Hemoglobin A1C`; `Fasting Glucose` → `GLUC` / `Glucose`) |
| `LBORRES` | char | result as collected |
| `LBORRESU` | char | unit (`%`, `mg/dL`, `U/L`) — already standard, no conversion |
| `LBORNRLO`,`LBORNRHI` | char | reference range low / high (from the lab) |

> Four subjects have labs (a subset, which is normal). Derive `LBNRIND` from the result vs
> the range. Many values are **HIGH** — that is the disease, not a defect (see trap 4).

---

## Reference answers
The finished SDTM datasets are in `sdtm/`. Build your own first, then compare — that is the
whole point of the capstone. Consistency and correctness are checked by `def01_audit.py`.
