# Notebook 14 (SAS) — Build ADSL — Walkthrough

**Module:** Why ADaM, and ADSL · **Run the code in:** `14_build_adsl_SAS.sas`
**Spec:** `../../data/adam_specification.md` §1 · **Target:** `../../data/adam/adsl.csv`

Your first analysis dataset. ADSL has two defining features:

- **One row per subject** — like DM, and for the same reason
- **It is the source of truth.** Every other analysis dataset copies its treatment variables,
  population flags and treatment dates from here. Nothing re-derives them.

That second point is what makes ADSL different from DM. DM is one domain among eight. ADSL is
the spine of the study: if `SAFFL` is wrong here, it is wrong in ADAE, ADVS, ADLB and ADTTE
too, and every safety table in the submission counts the wrong people.

---

## What changes when you cross from SDTM to ADaM

| | SDTM | ADaM |
|---|---|---|
| Organised for | the regulator — faithful to what was collected | the analysis — everything a table needs is on the row |
| Derived data | avoided | the entire point |
| Dates | character ISO 8601 (`RFXSTDTC`) | **numeric** SAS dates (`TRTSDT`) |
| Test of correctness | does it match the CRF? | can a table be produced by subsetting this one dataset? |

That last row is worth memorising. A dataset is ADaM when a table, listing or figure can be
produced from it by subsetting and summarising **with no further merging or derivation**. If
you find yourself needing a join at the analysis step, the analysis dataset was built wrong.

---

## Where the data comes from

| Source | Provides |
|---|---|
| `sdtm/dm.csv` | demographics, treatment arms, treatment dates, consent date |
| `sdtm/ds.csv` | randomisation date, and how the subject left the study |
| `sdtm/vs.csv` | baseline height and weight — and the hardest derivation here |

We read the **reference** SDTM rather than the SDTM you built earlier in the course. That is
deliberate: a mistake made on Day 4 should not make Day 11 unsolvable. In a real study you read
your own SDTM.

---

## Section 1 — Treatment variables and the type change

```sas
trtsdt = input(rfxstdtc, yymmdd10.);
trtedt = input(rfxendtc, yymmdd10.);
trtdurd = trtedt - trtsdt + 1;
format trtsdt trtedt date9.;
```

In SDTM, `RFXSTDTC` is the **character** string `"2024-03-01"`. In ADaM, `TRTSDT` is the
**number** 23436, displayed as `01MAR2024` by the `DATE9.` format. The conversion is what makes
`trtedt - trtsdt` possible at all — you cannot subtract two strings.

`INPUT()` converts character → numeric. `PUT()` goes numeric → character. Getting these two
backwards is the most common SAS error in this course; Notebook 02 covers it in full.

**Why `+ 1`?** A subject dosed on 1 March and again on 28 March was on treatment for 28 days,
not 27. Both endpoints count. A subject dosed on one single day has a duration of 1, not 0.

```sas
if . < age < 65 then do; agegr1 = '<65'; agegr1n = 1; end;
```

The `. <` guard is not decoration. In SAS a missing value is **smaller than every number**, so
a bare `if age < 65` silently files every subject with no age under `<65`. Nothing warns you.

`TRT01PN` is a **display order**, not a dose. Placebo is 1 so that it sorts into the first
column of every table, where readers expect the reference arm.

---

## Section 2 — Randomisation and disposition, both from DS

DS carries three records per subject: two `PROTOCOL MILESTONE`s (consent, randomisation) and
one `DISPOSITION EVENT` saying how the subject left. They are pulled out separately because
they answer different questions — *when did the subject enter?* and *how did they leave?*

```sas
create table disp as
    select usubjid, dsdecod as eos_decod, dsterm as eos_term
    from ds where dscat = 'DISPOSITION EVENT';
```

Seven subjects completed. One did not: `ABC-01-01-004` discontinued on day 20 for an adverse
event, which gives `EOSSTT = 'DISCONTINUED'`, `DCSREAS = 'ADVERSE EVENT'`, `COMPLFL = 'N'` and
a `TRTDURD` of 20 rather than 28.

Note that a completer's `DCSREAS` is **blank**, not `'COMPLETED'`. The variable means *reason
for discontinuation*; a subject who did not discontinue has no reason to give. Filling it in
would make "discontinued for reason X" impossible to count.

---

## Section 3 — Baseline height and weight — read this twice

This is the section the whole notebook exists for.

> **The ADaM baseline rule: baseline is the last non-missing value on or before the date of
> first dose.**

It is tempting to copy `VS.VSBLFL = 'Y'`, which the SDTM course already derived. Run this and
look at the log:

```sas
select count(*) into : n_ht_blfl trimmed
from vs where vstestcd = 'HEIGHT' and vsblfl = 'Y';
```

The answer is **zero**. Height in ABC-01 is collected only at the SCREENING visit, and `VSBLFL`
marks the BASELINE visit. Copy the flag and all 8 subjects lose their baseline height, and with
it their BMI — with no error, no warning, and a column of blanks that looks like missing data
rather than a bug.

The date rule handles it correctly, because it asks a question about **time** rather than about
a visit label:

```sas
where v.vsstresn is not null
  and input(v.vsdtc, yymmdd10.) <= a.trtsdt
```

...then take the last record per subject per test:

```sas
data vs_base;
    set vs_pre;
    by usubjid vstestcd vdt;
    if last.vstestcd;
run;
```

| Parameter | Baseline resolves to | Why |
|---|---|---|
| `HEIGHT` | Screening | the only record, and it precedes first dose |
| `WEIGHT`, `SYSBP`, … | Baseline visit | later than Screening, still on or before first dose |

**Same rule, different visits.** That is the whole point. A rule expressed in terms of visit
labels breaks the moment a parameter is collected on a different schedule; a rule expressed in
terms of dates does not.

This is what *"a clean-looking run is not a correct run"* means in ADaM. Exercise 1 asks you to
make the mistake on purpose, so you recognise the symptom when you meet it in production.

---

## Section 4 — Assembling ADSL

```sas
merge adsl_dm (in = a) randdt disp vs_wide (keep = usubjid height weight);
by usubjid;
if a;
```

`if a;` means **DM defines the subject set**. No other dataset can add a subject. If VS somehow
contained a subject DM has never heard of, that subject must not silently appear in ADSL — it
is a data issue to raise, not to absorb.

```sas
if trtsdt > . then saffl = 'Y'; else saffl = 'N';
if randdt > . then ittfl = 'Y'; else ittfl = 'N';
```

Both flags are `'Y'` for all 8 subjects in ABC-01, and they are **still derived from different
rules**, because they answer different questions: *was the subject dosed* and *was the subject
randomised*. In a study with a screen failure, or a subject randomised but never dosed, the two
diverge — and the tables built on each diverge with them. Exercise 2 makes you construct those
subjects.

BMI is rounded explicitly:

```sas
bmibl = round(weightbl / ((heightbl / 100) ** 2), 0.01);
```

Rounding is **specified, not incidental**. Floating point is not associative, and SAS and the
Python reference implementation differ in the last bit. The spec names the precision — 0.01 for
BMI, 0.0001 for change variables — and both implementations apply it, so the two agree exactly
rather than almost.

---

## Section 5 — Checking your work

The duplicate check must return **zero rows**:

```sas
select usubjid, count(*) as n from adsl group by usubjid having count(*) > 1;
```

If it ever returns a row, stop. Every downstream dataset merges on `USUBJID`, and a duplicate
here multiplies rows everywhere else — quietly, and in a way that still produces plausible
numbers.

---

## Section 6 — Comparing against the reference

The reference CSV stores dates as ISO text, because a CSV cannot carry "numeric date". Your
`TRTSDT` is numeric. So the comparison renders yours back to ISO **for the comparison only**:

```sas
c_trtsdt = put(trtsdt, yymmdd10.);
```

This does not make your variable character. In the dataset you save to `adam.adsl`, `TRTSDT` is
numeric — which is what ADaM requires, and what makes it subtractable downstream.

`PROC COMPARE` should report no differences. Any difference is a bug in your derivation, or a
deliberate choice you should be able to defend out loud.

---

## What you built

| | |
|---|---|
| Rows | 8 — one per subject |
| Non-completers | 1 (`ABC-01-01-004`, adverse event, day 20) |
| Baseline height source | Screening, for all 8 subjects |
| Baseline weight source | Baseline visit, for all 8 subjects |
| `SAFFL` / `ITTFL` | `Y` for all 8 — from two different rules |

Next: **Notebook 15**, where ADAE merges these subject-level variables onto the adverse events,
and one row that starts five days before first dose decides what every safety table reports.
