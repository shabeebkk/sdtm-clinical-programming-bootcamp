# Capstone — Study DEF-01

**This is the final exercise.** There is no worked notebook. You get raw data, a data
dictionary and a skeleton program, and you build the SDTM datasets yourself — then check your
own work against a reference.

If you have worked through the main bootcamp (study ABC-01), you already know how to do all of
this. That is the point: **DEF-01 is deliberately similar in shape and different in detail.**

---

## The study

**DEF-01** — a Phase 2 study of **Drug X 50 mg once daily vs placebo** in **Type 2 diabetes**.
6 subjects, 2 sites, 12 weeks of treatment. Visits: Screening, Baseline, Week 12.

Site **01 is in Canada** (records metric units). Site **02 is in the USA** (records US customary
units). That difference matters — see the traps below.

## What you build

Six datasets, one from every observation class:

| Domain | Class | Expected rows |
|---|---|---|
| DM | Special Purpose | 6 |
| EX | Interventions | **7** (not 6 — see trap 2) |
| AE | Events | 7 |
| SUPPAE | Relationship | 7 |
| VS | Findings | 96 |
| LB | Findings | 32 |

DS and CM are out of scope for the capstone.

---

## Before you start

**Read `data/def01_data_dictionary.md` first.** It describes every field in every raw file and
names the four things that are different from ABC-01. It is not optional reading — it is the
spec you are working from, exactly as you would get in a real study.

---

## Setup

1. Upload the `capstone` folder to SAS OnDemand (or use it locally).
2. Open **`notebooks/00_setup_capstone.sas`** and edit the three paths at the top, replacing
   `YOURUSERID` with your own SAS OnDemand user ID. Find it by submitting:
   ```sas
   %put &=sysuserid;
   ```
3. Submit `00_setup_capstone.sas`. You should see:
   ```
   PASS  all 5 raw CSVs found
   PASS  all 6 reference SDTM CSVs found
   PASS  libref SDTM -> .../output
   SETUP OK
   ```
   Run this **once per SAS session** — it sets the paths and the output library for everything
   else.

## Build

Open **`notebooks/13_capstone_DEF01_SKELETON.sas`** and fill in each `***TODO***`. The skeleton
gives you the structure and the order; the mapping decisions are yours.

Save each finished domain into the `SDTM` library (`data sdtm.dm; ...`), which is what the
verification step reads.

## Check your work

Submit **`notebooks/verify_capstone.sas`**. It compares every value you produced against the
reference in `data/sdtm/` and reports per domain:

| Result | Meaning |
|---|---|
| `MATCH` | you reproduced the reference exactly |
| `HEADER` | the data matches; only the header letter-case differs — **this counts as a pass** |
| `FAIL` | at least one value differs; the first few differing lines are printed |

**Aim for six MATCHes.** When something fails, read the printed lines — they show the reference
value beside yours, which is usually enough to see the cause.

---

## The four things that are different from ABC-01

You were told these in the data dictionary; they are repeated here because they are the whole
point of the exercise. Copying your ABC-01 programs without thinking will fail at each one.

**1 · Units are collected per site (VS).**
Site 02 records **weight in pounds** and **temperature in °F**. The raw data carries the
collected unit in `WEIGHTU` and `TEMPU`. `VSORRES`/`VSORRESU` keep the value *as collected*;
`VSSTRESN`/`VSSTRESU` must convert to **kg / °C**. On ABC-01 every unit was already standard,
so this never came up.

**2 · One subject has two dosing periods (EX).**
Subject `02/003` appears **twice** in `ex_raw.csv` — dosing was interrupted after a severe
hypoglycaemia event and restarted a week later. Each period is its own EX record (`EXSEQ` 1 and
2); the gap between them *is* the interruption. `RFSTDTC` is still the **first** dose and
`RFENDTC` the **last**. That is why EX has 7 rows for 6 subjects.

**3 · One adverse event has a partial date (AE).**
Subject `02/001` reports a screening AE dated only to a month: `FEB-2024`, with no day. Keep
the partial in `AESTDTC` as `2024-02` and **do not invent a day**. `AESTDY` is therefore
**null**. You can still conclude `AETRTEM = N`, because the whole of February is before that
subject's March first dose.

**4 · Abnormal labs are not adverse events (LB).**
Every enrolled subject is **HIGH on HbA1c and glucose** — that is the diabetes they were
enrolled with, not a finding. One subject also has a **HIGH ALT** at Week 12. Derive `LBNRIND`
from the reference range; create **no** adverse events for any of them. Whether an abnormal lab
is clinically significant is the investigator's judgement, recorded on the AE form — not
something a programmer infers.

---

## If you get stuck

- **`TROUBLESHOOTING.md`** (in the bootcamp root) is a symptom-to-cause guide built from real
  defects found running this course. Start there if your program "ran fine" but the numbers are
  wrong.
- **Read the log, not just the output.** Most of the bugs that guide documents produced a
  `WARNING` or nothing at all while the program reported success.
- **Work out the expected row count before you run.** If VS does not come out at 96, the count
  itself tells you which mistake you made.

---

## A note on the reference data

`data/sdtm/` holds the finished answer. It is there so you can check yourself, not so you can
copy — reading it first will teach you nothing, and the mapping decisions are the entire
exercise. Build first, compare second.

**All data is synthetic.** No real patients, sites, investigators or products.
