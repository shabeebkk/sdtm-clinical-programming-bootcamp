# Notebook 06 (SAS) — Build the CM Domain — Walkthrough

**Module:** Interventions & Events · **Run the code in:** `06_build_cm_domain_SAS.sas`
**Spec:** `../../data/mapping_specification.md` §5
**Target:** `../../data/sdtm/cm.csv`

CM (Concomitant Medications) is the domain to build **right after AE**, because most of your
AE code transfers unchanged. That is the point of the exercise: SDTM domains within the same
observation class share a skeleton, and once you have built one Interventions domain you have
built most of them.

---

## AE and CM side by side

| | AE (Events) | CM (Interventions) |
|---|---|---|
| Topic variable | `AETERM` — what **happened** | `CMTRT` — what was **given** |
| Dictionary | MedDRA → `AEDECOD` | WHODrug → `CMDECOD` |
| `--SEQ` | same derivation | same derivation |
| `--DY` | same derivation | same derivation |
| Mixed raw date formats | yes | yes |
| Typical `--STDY` sign | positive | **often negative** |

The last row is the one genuinely new idea in this notebook.

---

## Section 1 — The date parser (reused verbatim)

`cm_raw.csv` has the same two formats mixed in one column that `ae_raw.csv` did:

| Raw value | Format | Informat |
|---|---|---|
| `15/03/2024` | DD/MM/YYYY | `ddmmyy10.` |
| `10-Dec-2023` | DD-Mon-YYYY | `date11.` |

```sas
%macro parse_raw_date(src, out);
    if missing(&src) then &out = .;
    else if index(&src, "/") then &out = input(&src, ddmmyy10.);
    else                          &out = input(&src, date11.);
%mend;
```

**In ABC-01:** 5 medications use `DD/MM/YYYY`, 3 use `DD-Mon-YYYY`.

> Copying a working macro between programs is normal and good. What is *not* good is copying
> it and forgetting to check that the new dataset has the same two formats — always look at
> the raw values before you assume.

---

## Section 2 — Two things AE didn't teach you

### 2d — The rename: `CMFREQ` → `CMDOSFRQ`

```sas
cmdosfrq = cmfreq;
```

The CRF field is labelled *Freq*, the EDC extract column is `CMFREQ`, and the SDTM variable is
`CMDOSFRQ`. Three different names for one concept.

> **This is the single most common mapping bug in real work.** Programmers see `CMFREQ` in the
> raw data, see a frequency variable in the domain, and assume the names match. They don't.
> **Map by meaning, using the spec — never by name similarity.** Note that AE had no such
> rename, so a copy-paste from Notebook 05 will silently drop this variable.

### 2c — Negative study days are *correct* here

```sas
if _stdt >= rfstdtc_n then cmstdy = _stdt - rfstdtc_n + 1;
else                       cmstdy = _stdt - rfstdtc_n;
```

The formula is identical to AE's. What differs is the **data**: concomitant medications are
collected as a medical history going back well before the study, so four of the eight records
start *before* first dose.

| Medication | `CMSTDTC` | `CMSTDY` |
|---|---|---|
| Metformin | 2023-12-10 | **−96** |
| Amlodipine | 2024-01-05 | **−61** |
| Vitamin D | 2024-01-01 | **−60** |
| Lisinopril | 2024-02-01 | **−32** |

> **Do not "fix" these.** A negative `--DY` in CM is expected and clinically meaningful — it is
> exactly how a reviewer distinguishes a **prior** medication from a **concomitant** one. In
> AE a large negative value would be worth questioning; in CM it is the norm.
>
> Notice Metformin at −96 and Amlodipine at −61 belong to *different subjects* with different
> first-dose dates. `--DY` is always relative to **that subject's** `RFSTDTC`, never to a
> study-wide date.

### 2e — The dictionary term

```sas
when ("Aspirin") cmdecod = "ACETYLSALICYLIC ACID";
```

> ⚠️ **ILLUSTRATIVE ONLY**, exactly as with `AEDECOD`. Real `CMDECOD` comes from **WHODrug**
> coding by trained coders against a licensed dictionary. Note that the coded term is often
> *not* the trade or common name — Aspirin codes to its active ingredient. That is why you
> cannot derive it with string manipulation.

`CMTRT` keeps the verbatim text as recorded. Never tidy it.

---

## Section 3 — CMSEQ

Identical to `AESEQ`, including the deterministic sort:

```sas
proc sort data = cm_work; by usubjid cmstdtc cmtrt; run;
...
if first.usubjid then cmseq = 1;
else                  cmseq + 1;
```

Because we sort by start date, subject `ABC-01-01-001`'s **Vitamin D** (2024-01-01) becomes
`CMSEQ = 1` and **Paracetamol** (2024-03-15) becomes `CMSEQ = 2` — even though the raw file
lists Paracetamol first. `--SEQ` reflects your chosen sort order, not the collection order,
and that is fine as long as the order is **deterministic**.

---

## Section 4 — Checking your work

| Check | Expected |
|---|---|
| Row count | 8 |
| `USUBJID` + `CMSEQ` unique | yes |
| Any `CMSTDY` = 0 | **none** |
| Negative `CMSTDY` | **4** — and correct |
| Ongoing medications (null `CMENDTC`) | **4** |
| `CMDOSFRQ` populated | all 8 rows |

Note that ongoing and prior are the *same four records* here: long-term maintenance therapies
(diabetes, hypertension, a supplement) that started before the study and continue through it.
The four short-course medications — all started during treatment for a specific complaint —
each have an end date.

---

## The cross-domain story

Three CM records pair directly with an adverse event in the same subject:

```
ABC-01-01-001  AE "bad headache"  Day 15   ←→  CM Paracetamol   Day 15
ABC-01-02-002  AE "vomiting"      Day 9    ←→  CM Ondansetron   Day 9
ABC-01-02-003  AE "rash..."       Day 12   ←→  CM Hydrocortisone Day 12
```

**This is the Interventions/Events relationship from Deck 06 made concrete:** the event is what
happened to the subject, the intervention is what was done about it. SDTM keeps them in separate
domains — and `USUBJID` plus the study day is what lets a reviewer reconnect them.

---

## Exercises
Five tasks at the bottom of the `.sas` file. Solutions:
`../../answer-keys/06_build_cm_answers.md`.
