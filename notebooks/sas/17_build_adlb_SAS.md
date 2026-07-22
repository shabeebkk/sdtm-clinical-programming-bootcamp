# Notebook 17 (SAS) — Build ADLB — Walkthrough

**Module:** Analysis of Lab Data · **Run the code in:** `17_build_adlb_SAS.sas`
**Spec:** `../../data/adam_specification.md` §4 · **Target:** `../../data/adam/adlb.csv`

ADLB is BDS — the same skeleton you built in Notebook 16. If sections 2 and 4 of this notebook
feel like re-reading yesterday's code, that is the point: **learn the shape once, use it
everywhere.**

What is new is everything that follows from a lab test having a **normal range**, plus one fact
that has nothing to do with labs at all and decides every percentage in the notebook.

---

## Section 1 — The denominator, before you write any code

ADSL has **8** subjects. ADLB has **4**. Four subjects had no labs drawn.

So any percentage computed from ADLB's own subject count is wrong. In ABC-01, one subject has a
post-baseline abnormal result, and the answer depends entirely on what you divide by:

| Denominator | Drug A | What it claims |
|---|---|---|
| Safety population from ADSL (4 per arm) | **25.0%** | correct |
| Subjects present in ADLB (3 in Drug A) | 33.3% | wrong |

Neither number looks alarming. Neither triggers a warning. The wrong one is simply wrong, and
the only way to catch it is to know the rule before you write the code:

> **Denominators come from ADSL, filtered by the population flag the table calls for.**

Never from the analysis dataset you happen to be summarising. This is the most common ADaM error
in practice precisely because the wrong answer is always plausible.

The notebook opens by printing both numbers side by side, before deriving anything, so the
difference is the first thing you see.

---

## Section 2 — The BDS shape again, plus `PARCAT1`

Identical to ADVS, with one addition. Lab tests come in **panels** — `HEMATOLOGY` and
`CHEMISTRY` — and lab tables are almost always broken out by panel, so the category has to be on
the row:

```sas
parcat1 = lbcat;
```

Note the visit dates: `WEEK 4` is study day **28** for three subjects and **29** for
`ABC-01-01-002`. Two different actual days, one analysis visit. That is what `AVISIT` is for, and
Exercise 4 asks you to rewrite the derivation as a genuine window on `ADY`.

---

## Section 3 — Derive `ANRIND`, then check the source agrees

LB already carries `LBNRIND`. We derive `ANRIND` ourselves and then compare:

```sas
if      aval < anrlo then anrind = 'LOW';
else if aval > anrhi then anrind = 'HIGH';
else                      anrind = 'NORMAL';
```

```sas
title 'ANRIND cross-check against the LB source flag - MUST be empty';
proc print data = adlb_ind noobs;  where anrind ne lbnrind;  ...
```

**Why derive this one when Notebook 15 deliberately did *not* re-derive `TRTEMFL`?**

That looks inconsistent, and the distinction is worth getting right:

| | `TRTEMFL` (Notebook 15) | `ANRIND` (here) |
|---|---|---|
| What it encodes | a study **decision**, documented upstream | pure **arithmetic** |
| Inputs | dates, plus a rule about partial dates | three numbers on this same row |
| If we re-derive it | our copy can drift from the documented rule | it cannot drift — it is a comparison |
| So we | **read it** | **derive it, and verify** |

A reference range indicator is arithmetic we can check, and a disagreement between our arithmetic
and the lab's reported flag is worth surfacing — it usually means the range stored on the record
is not the range the flag was computed against. Copying hides that; deriving and comparing finds
it. Exercise 5 asks you to write the general rule and test it against three more flags.

---

## Section 4 — Baseline, for the third time

Identical to Notebook 16, with one extra thing carried out of the baseline record:

```sas
bl_ind = anrind;      /* becomes BNRIND on every row of the parameter */
```

`BNRIND` is the baseline's reference range indicator, carried to **every** row of that subject
and parameter — same two-different-scopes pattern as `BASE`. A shift needs to know where it
started, so both ends have to sit on the same row.

---

## Section 5 — Shift and criterion

### `SHIFT1` is a shift table in one column

```sas
if ablfl ne 'Y' and bnrind ne '' and anrind ne '' then
    shift1 = catx(' ', strip(bnrind), 'to', strip(anrind));
```

A shift table is a cross-tabulation of `BNRIND` by `ANRIND`, and it is only possible because both
ends are on the same row. `SHIFT1` is **blank at baseline** — a baseline has not shifted from
anywhere.

ABC-01's entire shift table:

| From → To | n |
|---|---|
| NORMAL → NORMAL | 23 |
| **NORMAL → HIGH** | **1** |

That single off-diagonal cell is `ABC-01-01-003`'s ALT rising from 24 to 72 U/L against an upper
limit of 56. It is the whole clinical content of this study's lab data.

### `CRIT1FL` is blank where the criterion does not apply

```sas
if paramcd = 'ALT' then do;
    crit1 = 'ALT > ULN';
    if aval > anrhi then crit1fl = 'Y'; else crit1fl = 'N';
end;
```

Three rules, and the third is the one people get wrong:

1. `CRIT1` states the question **in words**, on the row, so the flag is never ambiguous six
   months later when nobody remembers what criterion 1 was.
2. The flag is populated **only** on rows the criterion can apply to — here, `ALT`.
3. On every other row it is **blank, not `'N'`**.

`'N'` asserts *"this record was evaluated against the criterion and did not meet it."* For a
creatinine record that is simply false — creatinine was never evaluated against an ALT criterion.
Blank says *"not evaluated"*, which is true.

The cost of getting it wrong is arithmetic. In ABC-01, 8 records are ALT and 1 meets the
criterion: **1 of 8 = 12.5%**. Mark all 48 records `'N'` and the same event becomes
**1 of 48 = 2.1%** — the rate collapses by a factor of six, because 40 records that were never
evaluated have been counted as evaluated-and-negative. Exercise 2 makes you produce both numbers.

---

## What you built

| | |
|---|---|
| Rows | 48 — one per lab result |
| Subjects | **4 of 8** — the denominator lesson |
| Parameters | 6, in two panels |
| Baseline records | 24 = 4 subjects × 6 parameters |
| Off-diagonal shifts | 1 (`NORMAL → HIGH`) |
| `CRIT1FL = 'Y'` | 1 record, of 8 evaluated |

Next: **Notebook 18**, where ADTTE keeps every subject — including the ones nothing happened to —
and a flag that runs backwards from every other flag in ADaM.
