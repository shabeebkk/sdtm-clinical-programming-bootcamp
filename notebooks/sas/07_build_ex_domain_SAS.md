# Notebook 07 (SAS) — Build the EX Domain — Walkthrough

**Module:** Interventions & Events · **Run the code in:** `07_build_ex_domain_SAS.sas`
**Spec:** `../../data/mapping_specification.md` §3
**Target:** `../../data/sdtm/ex.csv`

EX (Exposure) records **the study treatment itself** — what the protocol gave the subject, as
opposed to CM, which records everything else they happened to be taking.

It is the easiest domain in the bootcamp to build and the most consequential to get right.

---

## Why EX matters more than its size suggests

```
      EX.EXSTDTC (first dose)
              │
              ▼
      DM.RFSTDTC  ── the study's reference start date
              │
              ├──► AE.AESTDY / AEENDY
              ├──► CM.CMSTDY / CMENDY
              ├──► VS.VSDY
              ├──► LB.LBDY
              └──► DS.DSSTDY
```

Every study day in the entire submission is measured from a date that comes out of this
domain. An EX date that is off by one day shifts **every `--DY` in every other domain** by one
day. Eight rows, and the whole submission's timeline hangs off them.

---

## What's different from CM

| | CM | EX |
|---|---|---|
| Raw date formats | two, mixed | **one** — `DD-MMM-YYYY` |
| Rows per subject | 0 to many | exactly 1 (this study) |
| `--STDY` | often negative | **always 1** |
| A collected field that is dropped | none | **`EXINTP`** |

### One date format, but still check

```sas
_stdt = input(exstdtc, date11.);
```

No per-value detection here — the drug-accountability page uses a single date control, so every
value arrives as `01-MAR-2024`. **Confirm this by looking at the raw file**, though; the reason
we needed the parser macro in AE and CM is that two *different* CRF pages fed those columns.

> `date11.` again — `01-MAR-2024` is 11 characters. `date9.` would silently read `01-MAR-20`
> and give you the year **2020**. In EX this mistake is especially costly, because that wrong
> date becomes `RFSTDTC` and corrupts every study day in the study.

### The rename, again: `EXFREQ` → `EXDOSFRQ`

```sas
exdosfrq = exfreq;
```

Same trap as `CMFREQ` → `CMDOSFRQ`. The Interventions class uses `--DOSFRQ` consistently; EDC
extracts rarely do.

### `EXINTP` — collected, but **not submitted**

The CRF asks *"Was dosing interrupted?"* because the site must answer it. There is **no SDTM
`EX` variable for it**, so it is dropped.

> **You may not invent a variable to hold it.** The two legitimate options are to drop it, or —
> if the sponsor needs it — to put it in `SUPPEX` as a supplemental qualifier, the same way
> `AETRTEM` went into `SUPPAE`. What you must never do is add an `EXINTP` column to the EX
> dataset.
>
> **Collected ≠ submitted.** Every CRF has fields that exist for site workflow, monitoring or
> data cleaning and never reach the submission. `VSND` and `EOSOTH` are the other two in this
> study. Identifying them is part of reading the spec, not something you can infer from the
> data.

And note *how* a real interruption is represented: by **splitting the exposure into multiple EX
records** with a gap between them, not by a flag. See Exercise 4.

---

## Section 3 — EXSEQ

Same derivation as `AESEQ` and `CMSEQ`. Every subject has exactly one record, so every `EXSEQ`
is 1 — but write the general derivation anyway. Multi-period or multi-arm studies have several
EX records per subject, and code that hardcodes `exseq = 1` breaks the moment the protocol has
a dose titration.

---

## Section 4 — Checking your work

| Check | Expected |
|---|---|
| Row count | 8 — one per subject |
| `EXSTDY` ≠ 1 | **none** |
| End date before start date | none |
| `EXINTP` present in EX | **no** — must be dropped |
| Dose by arm | Drug A = 50 mg, Placebo = 0 mg |

### The one result worth staring at

**Every `EXSTDY` is 1.** This is not a coincidence and not a bug — it is a *tautology*.
`RFSTDTC` is *defined* as the first dose date, and `EXSTDY` measures the first dose date
against `RFSTDTC`. A value of 1 is the only possible answer.

That makes it a genuinely useful check: if any `EXSTDY` comes out as something other than 1,
your `RFSTDTC` derivation and your EX dates disagree, and you have a real problem. Some
programmers dismiss the check as trivial for exactly the reason that makes it valuable.

---

## The cross-domain story

`EXENDY` shows seven subjects dosed for 28 days. One did not:

```
ABC-01-01-004   Placebo   EXSTDY 1   EXENDY 20
```

Trace that subject:

| Domain | Record |
|---|---|
| AE | `worsening hypertension`, **SEVERE**, `AESER = Y`, Day 17 |
| EX | dosing stopped Day 20 (2024-03-25) |
| DS | `DSDECOD = ADVERSE EVENT`, 2024-03-25 |

**One subject, three domains, one coherent narrative** — a serious adverse event on Day 17 led
to withdrawal and the end of dosing on Day 20. Reconstructing this is exactly what a medical
reviewer at a regulatory agency does, and it works only because `USUBJID` is identical across
every domain and every `--DY` is measured from the same `RFSTDTC`.

---

## Exercises
Six tasks at the bottom of the `.sas` file. Solutions:
`../../answer-keys/07_build_ex_answers.md`.
