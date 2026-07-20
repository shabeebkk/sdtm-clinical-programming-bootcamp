# Notebook 04 (SAS) — Build the DM Domain — Walkthrough

**Module:** Building SDTM Domains I · **Pairs with:** `04_build_dm_domain_R.ipynb`
**Run the code in:** `04_build_dm_domain_SAS.sas`
**Spec:** `../../data/mapping_specification.md` §2 · **Target:** `../../data/sdtm/dm.csv`

Your first real domain. DM is a **Special Purpose** domain with two defining features:

- **One row per subject** — no exceptions, no duplicates
- **No `--SEQ` variable.** There is no `DMSEQ`; the subject *is* the record

---

## Where the data comes from

DM is assembled from **two** sources, which surprises people:

| Source | Provides |
|---|---|
| `dm_raw.csv` | Demographics: birth date, sex, race, ethnicity, country, arm, consent date |
| `ex_raw.csv` | **Reference dates** — `RFSTDTC` (first dose) and `RFENDTC` (last dose) |

`RFSTDTC` is the single most consequential variable you will derive: it defines
**Study Day 1** for every other domain in the study.

---

## Section 1 — Reference dates from EX

```sas
proc sql;
    create table ref_dates as
    select siteid, subjid,
           min(exstdtc) as rfstdtc length = 10,
           max(exendtc) as rfendtc length = 10
    from ex_raw
    group by siteid, subjid;
quit;
```

Two things worth noticing:

1. **`min` / `max` on ISO text works.** Because ISO 8601 (`YYYY-MM-DD`) sorts
   alphabetically in the same order it sorts chronologically, you can take the minimum of
   the character dates directly. This is one of the quiet benefits of the ISO format.
2. **Written to survive multiple dosing rows.** Our EX has one row per subject, so
   `min`/`max` looks like overkill — but real studies have several dosing periods per
   subject, and this code already handles that.

---

## Section 2 — Building DM

### 2a. `USUBJID`
```sas
usubjid = catx("-", studyid, siteid, subjid);
```
`catx` joins with a separator and skips missing pieces. Because we read `SITEID` and
`SUBJID` as **character** (Notebook 03), the leading zeros are intact and we get
`ABC-01-01-001`. If they had been read as numbers you would get `ABC-01-1-1` — wrong for
every subject.

### 2b. `AGE` — the interesting derivation
```sas
age = intck("year", input(brthdtc, yymmdd10.), input(rficdtc, yymmdd10.), "C");
```
- `input(brthdtc, yymmdd10.)` converts the ISO **text** into a SAS **date number**
- `intck("year", from, to, "C")` counts intervals; `"C"` means **continuous**, i.e.
  *completed* years rather than calendar-year boundaries crossed

> **The edge case that catches everyone.** Subject 01/001 was born 1969-05-14 and
> consented 2024-02-20. Simple year subtraction (2024 − 1969) gives **55**. The correct
> answer is **54**, because her birthday had not yet occurred in 2024. Without the `"C"`
> argument `intck` would count the calendar boundary and give you 55.

`AGE` is derived **at informed consent** in this study. Exercise 1 explores what changes
if you use first dose instead — one subject's age shifts by a year.

### 2c. Controlled Terminology
```sas
if      sex = "1" then sex = "M";
else if sex = "2" then sex = "F";
else                   sex = "";

race   = upcase(strip(race));
ethnic = upcase(strip(ethnic));
```
`SEX` is an EDC code (1 = Male, 2 = Female) — you need the data dictionary to know that.

`strip()` removes leading/trailing blanks and `upcase()` normalises case, which is enough
to land on valid CT for *this* study's values.

> ⚠️ **Do not ship this pattern to production.** Blind normalisation passes anything
> through: a site entering "Caucasian" would produce `CAUCASIAN`, which is not valid CT,
> and nothing would complain. Real mapping code uses an explicit lookup and **fails loudly**
> on unrecognised values. Exercise 2 builds exactly that check.

### 2d. `ARM` and `ARMCD`
```sas
if      arm = "Drug A"  then armcd = "A";
else if arm = "Placebo" then armcd = "P";
actarm   = arm;
actarmcd = armcd;
```
`ARM` is the descriptive name; `ARMCD` is the short code (max 20 characters, no spaces).

`ACTARM` / `ACTARMCD` are the **actual** arm — what the subject really received, versus
what they were planned to receive. Here they are identical because nobody was mis-dosed.
They differ in real studies (e.g. a subject randomised to Drug A who receives placebo by
error) and both pairs are **Required** in SDTMIG v3.3.

### 2e. Reference and disposition dates
```sas
rfxstdtc = rfstdtc;   /* first study-treatment exposure */
rfxendtc = rfendtc;   /* last  study-treatment exposure */
rfpendtc = eosdtc;    /* end of participation           */
dthdtc = "";  dthfl = "";   /* no deaths in this study */
```

---

## Section 3 — Variable order

```sas
data dm;
    retain studyid domain usubjid subjid rfstdtc ... country;
    set dm;
run;
```
A `RETAIN` statement listing variables before the `SET` fixes their **position** in the
dataset. SDTM expects a defined variable order, and reviewers (and Define-XML) rely on it.
This is a common trick — the statement is not doing anything to the *values* here, only
the column order.

---

## Section 4 — Checking your work

| Check | Expected |
|---|---|
| Row count | 8 |
| Distinct `USUBJID` | 8 |
| Missing `USUBJID`/`SEX`/`ARMCD`/`COUNTRY` | 0 (all Required) |
| `SEX` values | `M`, `F` only |
| `RACE` values | 3 valid CT terms |

Exercise 4 goes further and uses `PROC COMPARE` against the reference dataset — the
definitive check. The reference implementation matches `data/sdtm/dm.csv` exactly, so
yours should too.

---

## The pattern to carry forward

Every domain you build from here follows the same shape:

1. **Read** the raw data with controlled types
2. **Join** anything you need from another source (here, reference dates from EX)
3. **Derive** identifiers (`USUBJID`, later `--SEQ`)
4. **Convert** dates to ISO 8601
5. **Apply** Controlled Terminology
6. **Order** the variables and **check** the result

DM is the gentlest version — one row per subject, no sequence numbers, no timing
variables to speak of. AE and the Findings domains add `--SEQ`, `--DY`, and (for VS) a
transpose.

---

## Exercises
Four tasks at the bottom of the `.sas` file. Solutions:
`../../answer-keys/04_build_dm_answers.md`.
