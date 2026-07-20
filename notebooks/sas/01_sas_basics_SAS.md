# Notebook 01 (SAS) — SAS Basics — Walkthrough

**Module:** Tooling · **Pairs with:** `01_r_basics_R.ipynb` (same skills in R)
**Run the code in:** `01_sas_basics_SAS.sas`

This walkthrough explains, in plain English, every section of the SAS script.
Keep them side by side: read a section here, then run that section in the `.sas`
file. No prior SAS knowledge is assumed — every term is defined on first use.

> **What is SAS?** SAS is a programming language and software system widely used
> in clinical trials to manage and analyze data. You write a *program* (a `.sas`
> file), submit it, and SAS produces a *log* (messages, warnings, errors) and
> *output* (tables). Clinical submissions to the FDA are still very SAS-centric,
> which is why we learn it alongside R.

---

## How SAS is organized: DATA steps and PROC steps
Almost every SAS program is made of two kinds of "steps":

- **DATA step** — *creates or changes a dataset*. It reads rows one at a time and
  writes rows out. This is where you build variables and apply logic.
- **PROC step** ("procedure") — *does something with a dataset*: print it, sort it,
  count it, summarize it. You call a ready-made procedure like `PROC PRINT`.

Every step ends with a `RUN;`. A statement ends with a semicolon `;` — forgetting
the semicolon is the #1 beginner error.

> **Dataset vs. variable vs. observation.** A **dataset** is a table. A **variable**
> is a column. An **observation** is a row. (In SDTM we say "one row = one
> observation" — same idea.)

---

## Section 0 — Telling SAS where the data is (`%let`, `libname`)
```sas
%let datapath = /Volumes/.../data;
libname raw "&datapath";
```
- `%let` creates a **macro variable** — a text shortcut. We store the data folder
  path once, then reuse it as `&datapath`. Change it in one place if your path
  differs.
- `libname` gives a **library** a nickname. A *library* is just a reference to a
  folder where SAS datasets live. Here `RAW` points at the data folder.
- **`WORK`** is a special library that always exists: it is scratch space wiped
  when SAS closes. Datasets you don't explicitly save go here.

---

## Section 1 — Reading a CSV (`PROC IMPORT`)
```sas
proc import datafile="&datapath/dm_raw.csv" out=work.dm dbms=csv replace;
    getnames=yes;
    guessingrows=max;
run;
```
- `PROC IMPORT` reads an external file (here a **CSV** = comma-separated values
  text file) into a SAS dataset.
- `out=work.dm` names the result `WORK.DM`.
- `getnames=yes` uses the first CSV row as column names.
- `guessingrows=max` tells SAS to scan *all* rows before guessing each column's
  type — safer than the default (which peeks at only a few rows).

> **Real-world gotcha:** PROC IMPORT *guesses* types. An ID like `001` can be read
> as the number `1`, losing the leading zeros. That is why the domain-building
> notebooks read ID columns as **character** on purpose. For now, just be aware.

---

## Section 2 — Looking at data (`PROC CONTENTS`, `PROC PRINT`)
- `PROC CONTENTS` shows the dataset's **structure**: each variable's name, type
  (character or numeric), and length. Always your first look at unfamiliar data.
- `PROC PRINT data=work.dm (obs=5)` prints the first 5 **rows**. The `(obs=5)`
  dataset option limits how many rows are read.
- `title "..."` sets a heading that appears on the output until you change or
  clear it with a bare `title;`.

---

## Section 3 — The DATA step: building new variables
```sas
data dm2;
    set work.dm;
    length usubjid $20 sex_c $1;
    usubjid = catx("-", studyid, put(siteid, z2.), put(subjid, z3.));
    if sex = 1 then sex_c = "M";
    else if sex = 2 then sex_c = "F";
    else sex_c = "";
    keep studyid siteid subjid usubjid sex sex_c race arm;
run;
```
- `data dm2;` starts a new dataset `WORK.DM2`.
- `set work.dm;` reads every row of `WORK.DM` — the input.
- `length usubjid $20 sex_c $1;` declares two **character** variables and their
  maximum lengths (the `$` means text). *Declare length before you assign text*,
  or SAS fixes the length to the first value it sees and silently truncates.
- **`catx("-", a, b, c)`** concatenates values with a separator (`-`), skipping
  missing pieces. `put(siteid, z2.)` converts a number to text with leading zeros
  (`z2.` = 2 digits, `z3.` = 3 digits) so we get `ABC-01-01-001`.
- `IF / THEN / ELSE` is conditional logic: recode the numeric `SEX` code into a
  letter. `sex_c = ""` handles anything unexpected.
- `keep ...` lists the columns to *keep* in the output (drop the rest).

This is the heart of SDTM mapping: read raw rows, derive standardized variables.

---

## Section 4 — Subsetting rows (`WHERE`)
```sas
data drugA;
    set dm2;
    where arm = "Drug A";
run;
```
`WHERE` keeps only rows that match a condition. (In a DATA step you can also use
`IF condition;` to subset; `WHERE` is generally faster and also works on PROCs.)

---

## Section 5 — Sorting (`PROC SORT`)
```sas
proc sort data=dm2 out=dm_sorted;
    by siteid subjid;
run;
```
Orders rows `by` one or more variables. Sorting matters later: SAS **merges** two
datasets by a key that must be sorted first, and sequence numbers (`--SEQ`) are
assigned in sorted order.

---

## Section 6 — Counting and summarizing (`PROC FREQ`, `PROC MEANS`)
- `PROC FREQ` counts **categories**. `tables arm sex_c arm*sex_c;` gives counts of
  arm, of sex, and a **cross-tabulation** (arm by sex).
- `PROC MEANS` summarizes **numeric** variables: `n mean min max`. `class visit;`
  produces one summary row per visit; `var weight sysbp;` picks the numbers to
  summarize; `maxdec=1` rounds to 1 decimal.

> `PROC FREQ` is for categories (arm, sex); `PROC MEANS` is for numbers (weight,
> blood pressure). Using the wrong one is a common early mix-up.

---

## The mental model to carry forward
| You want to… | Use |
|---|---|
| Read a CSV | `PROC IMPORT` |
| See structure (columns/types) | `PROC CONTENTS` |
| See rows | `PROC PRINT` |
| Build / change variables, subset | **DATA step** (`set`, `length`, `if/then`, `keep`, `where`) |
| Order rows | `PROC SORT` |
| Count categories | `PROC FREQ` |
| Summarize numbers | `PROC MEANS` |

Every SDTM domain you build is these pieces combined. Next up (Notebook 03) you
apply them to turn raw files into your first real domain.

---

## Exercises
Four tasks are at the bottom of the `.sas` file. Attempt them before checking
`../../answer-keys/01_basics_answers.md`.
