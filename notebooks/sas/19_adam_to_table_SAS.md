# Notebook 19 (SAS) — From ADaM to a Table — Walkthrough

**Module:** The payoff · **Run the code in:** `19_adam_to_table_SAS.sas`
**Needs:** Notebooks 14 (ADSL) and 15 (ADAE)

**This notebook is short on purpose.** It is the shortest in the course, and it produces two of
the tables that appear in every clinical study report.

That is the point. You have spent four days deriving variables. This is why.

---

## The test, from Module 14

> A table, listing or figure can be produced by subsetting and summarising **one dataset**, with
> no further merging and no further derivation.

This notebook is that test, run for real. Two tables, two datasets, `PROC FREQ` and `PROC MEANS`.
Scroll through the code and count the joins: **there are none**. Count the derivations: **none** —
only three macro variables that read subject counts out of ADSL.

If you ever find yourself needing a join to produce a table, the analysis dataset was built
wrong. Fix the dataset, not the table program.

---

## Table 14.1.1 — Demographics

```sas
proc means data = adsl n mean std median min max maxdec = 1;
    where saffl = 'Y';
    class trt01a;
    var age heightbl weightbl bmibl trtdurd;
run;
```

Every one of those five variables is already on the ADSL row. `BMIBL` was computed in Notebook 14
from a baseline height that required the ADaM baseline rule to find. `TRTDURD` needed two dates
and the `+ 1`. None of that work is repeated here — it was done once, and this program simply
reads it.

```sas
tables (agegr1 sex race ethnic) * trt01a / nopercent norow nocol;
```

`AGEGR1` was derived in ADSL, not here. That matters more than it looks: **every** table in the
submission that reports age groups now uses the same grouping, because there is only one place
the grouping exists. A study that derives age bands inside each table program will eventually
ship two tables that disagree.

---

## Table 14.3.1 — Adverse events

The flags do all the work.

```sas
where aoccfl = 'Y';     /* line 1: subjects with at least one TEAE */
```

`AOCCFL` marks exactly one row per subject, so counting **flagged rows** counts **subjects**.
That is the entire reason the flag exists, and it is why this line is a one-line `PROC FREQ`
rather than a `COUNT(DISTINCT ...)` with a subquery.

```sas
where aoccpfl = 'Y';    /* by preferred term */
```

One row per subject *per term*, so a subject with two headaches counts once in the Headache row
and the column still adds up to subjects rather than events.

```sas
tables asevn * trta;    /* severity, in clinical order */
```

`ASEVN` exists so severity prints Mild, Moderate, Severe. Sort on `AESEV` instead and you get
Mild, Moderate, Severe by luck of the alphabet — until a study adds `LIFE THREATENING`, which
sorts second.

---

## Where every hard decision lives

| Decision | Made once, in |
|---|---|
| which subjects count | `SAFFL` — ADSL |
| which events count | `TRTEMFL` — ADAE (read from SUPPAE) |
| how to count a subject once | `AOCCFL` / `AOCCPFL` — ADAE |
| what "related" means | `AREL` — ADAE |
| what order severity prints | `ASEVN` — ADAE |
| which age grouping | `AGEGR1` — ADSL |
| what counts as baseline | `ABLFL` — ADVS / ADLB |

Each is documented in define.xml and checked by `audit_adam.py`. If those decisions lived in the
table programs instead, every table would re-implement them — and sooner or later two tables in
the same submission would disagree, with no error raised and no way to tell which was right.

**That is what ADaM is for.** Not tidiness, and not a standard for its own sake: a single place
for every decision, so that a reviewer who disagrees with one of them knows exactly which number
to recompute and where.

---

## A closing note on the denominator

The macro variables in section 1 come from **ADSL**, not from the dataset being summarised:

```sas
select count(*) into : n_drug trimmed from adsl where saffl = 'Y' and trt01a = 'Drug A';
```

Two subjects have no adverse events and therefore no rows in ADAE at all. They are still in the
denominator, because they were still at risk. Notebook 17 showed what happens when a denominator
comes from the wrong place; Exercise 2 here makes you break it deliberately one last time, so the
lesson is the last thing you do in the course.
