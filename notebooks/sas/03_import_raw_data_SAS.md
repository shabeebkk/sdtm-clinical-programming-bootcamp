# Notebook 03 (SAS) — Importing Raw Clinical Data — Walkthrough

**Module:** Reading Raw Data · **Pairs with:** `03_import_raw_data_R.ipynb`
**Run the code in:** `03_import_raw_data_SAS.sas`

Goal: read all six ABC-01 raw files with the **types you intended**, then run the
six-point inspection checklist so you know exactly what must change before these
can become SDTM.

---

## Section 1 — The naive import, and why it breaks IDs

```sas
proc import datafile="&datapath/dm_raw.csv" out=dm_naive dbms=csv replace;
    getnames = yes;
    guessingrows = max;
run;
```

`PROC IMPORT` **guesses** each column's type from the values. `SITEID` (`01`) and
`SUBJID` (`001`) are all digits, so it guesses **numeric** — and the leading zeros
are gone: `01` → `1`, `001` → `1`.

`guessingrows = max` tells SAS to scan every row before guessing (better than the
default, which peeks at only a few). But it does **not** fix this case: an all-digit
column will still be read as a number.

> **Why it matters.** `USUBJID` would become `ABC-01-1-1` instead of `ABC-01-01-001` —
> wrong for every subject, in every domain.

> **Cross-language note.** The tools genuinely differ on this exact file:
> SAS `PROC IMPORT` and base R `read.csv()` both lose the zeros; modern
> `readr::read_csv()` detects them and keeps the column as text. The lesson is not
> "one tool is better" — it is **declare your types explicitly** rather than relying
> on a guess that could flip when the data changes.

---

## Section 2 — The controlled import

Read the file with a **DATA step** so *you* decide the types.

```sas
data dm_raw;
    infile "&datapath/dm_raw.csv" dsd firstobs=2 truncover;
    length studyid $10 siteid $3 subjid $5 ... ;
    input studyid $ siteid $ subjid $ ... ;
run;
```

| Option | What it does |
|---|---|
| `infile` | Points at the external text file |
| `dsd` | Delimiter-sensitive: two commas in a row = a missing value, and quoted fields are handled |
| `firstobs = 2` | Skip the header row |
| `truncover` | Don't discard a row just because the last field is short — essential when trailing values are blank |
| `length ... $n` | Declares each variable's type and width **before** it is read |
| `input ... $` | The `$` marks a variable as character |

Declare `length` **before** `input`, and make the widths generous enough for the
longest value — SAS silently truncates text that doesn't fit.

---

## The six-point inspection checklist

### Check 1 — How many rows and columns?
```sas
proc sql;
    select "dm_raw" as dataset, count(*) as n from dm_raw
    union all select "ex_raw", count(*) from ex_raw ... ;
quit;
```
Expected: **dm 8 · ex 8 · ae 9 · cm 8 · vs 24 · lb 48**. If you imported 23 rows from a
24-row file, something was silently dropped — find out what before going further.

### Check 2 — What type is every column?
`PROC CONTENTS data=dm_raw varnum;` — `varnum` lists variables in dataset order rather
than alphabetically. Confirm the ID columns are **Char**, not Num.

### Check 3 — How many distinct subjects?
```sas
select count(distinct subjid)                    as distinct_subjid,   /* 4  — misleading */
       count(distinct catx("-", siteid, subjid)) as distinct_people    /* 8  — correct    */
from dm_raw;
```
`SUBJID` alone counts **4** because subject `001` exists at both sites. Combining site
and subject gives the true **8**. This is precisely why SDTM needs `USUBJID`.

The second query looks for **orphans** — subjects present in a child domain but not in
DM. That is a data-integrity error and should return **zero rows**.

### Check 4 — Which columns have blanks, and what does each blank mean?
Two different blanks in this study, meaning two different things:

| Where | Blank means |
|---|---|
| `ae_raw.AEENDT` (2 rows) | The event was still **ongoing** — leave null |
| `vs_raw.HEIGHT` (16 rows) | **Not collected** — height is measured at screening only |

`PROC MEANS ... n nmiss;` gives the non-missing and missing counts side by side.

### Check 5 — What are the distinct values?
```sas
proc freq data=dm_raw;
    tables sex race ethnic country arm / nocum nopercent;
run;
```
You cannot map values you have not looked at. `PROC FREQ` on every column destined for
Controlled Terminology *is* how you build the mapping table. Note `RACE` arrives in
mixed case (`White`, `asian`, `black or african american`).

> **A note on the trailing space.** The file also contains `"White "` with a trailing
> space. In SAS this is largely invisible: character variables are blank-padded to their
> declared length, so `"White "` and `"White"` compare as equal. You still normalise
> case explicitly — and `strip()`/`compress()` are there when you need them.

### Check 6 — What date formats appear?
```sas
if index(rawdate, "/")   then fmt = "DD/MM/YYYY";
else if anyalpha(rawdate) then fmt = "DD-Mon-YYYY";
```
`AESTDT` contains **two** formats: 5 values as `DD/MM/YYYY` and 4 as `DD-Mon-YYYY`.

> ⚠️ **Ambiguity warning.** `01/03/2024` could be 1 March or 3 January — you cannot tell
> from the value alone. `raw_data_dictionary.md` states these are `DD/MM/YYYY`.
> Never guess a date convention.

---

## What you now know

| Finding | What it means for mapping |
|---|---|
| `SUBJID` repeats across sites | must build `USUBJID` |
| `SEX` is 1/2 | apply Controlled Terminology |
| `RACE` has mixed case | normalise before mapping |
| Two date formats in AE/CM | convert everything to ISO 8601 |
| Blank `AEENDT` | ongoing — leave null |
| `HEIGHT` missing after screening | not collected — leave null |
| VS is wide (24 rows → 128) | must be transposed for SDTM |

That list is the gap analysis from Module 04 — and the work plan for the modules ahead.

---

## Exercises
Four tasks are at the bottom of the `.sas` file. Solutions:
`../../answer-keys/03_import_answers.md`.
