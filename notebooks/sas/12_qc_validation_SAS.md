# Notebook 12 (SAS) — QC & Validation Checks — Walkthrough

**Module:** Data Quality & Validation · **Run the code in:** `12_qc_validation_SAS.sas`
**Deck:** `../../presentations/10_data_quality_validation.pptx`

**Pinnacle 21** is the tool the industry runs before a submission: it reads your SDTM datasets
against thousands of published rules and produces a findings report. You will not install it
here — but you will **write the core checks it runs**, so you understand what it is actually
doing behind the report.

> **Prerequisite:** run `00_setup.sas` then `run_all.sas` (or notebooks 04–09) so the SDTM
> library holds the built domains. The notebook aborts with a clear message if `SDTM.DM` or
> `SDTM.AE` is missing.

---

## The one idea behind every conformance check

> **A conformance check is a query that should return zero rows.** If it returns any, that is a
> finding.

That is the whole model. A validation engine is not magic — it is a library of "this must never
happen" queries, each run against a dataset, each expecting nothing back. Once you see that, you
can write your own, and you can read Pinnacle 21's output critically instead of treating it as an
oracle.

---

## Section 1 — The check engine

```sas
%macro qc_check(ruleid, severity, domain, where, message);
    proc sql noprint;
        select count(*) into :n trimmed
        from sdtm.&domain
        where &where;                 /* &where DESCRIBES a violation */
    quit;
    ... record ruleid, severity, nfound = &n, message ...
%mend;
```

One macro runs *any* "expect zero rows" rule: pass it a `WHERE` clause that **describes a
violation**, and it counts and records. Every check in the suite is one call. This is exactly how
a real engine is structured — rule + dataset → count.

> Note the `WHERE` describes the **bad** state, not the good one. `aestdy = 0` finds the
> violations; a clean dataset returns 0.

---

## Section 2 — The suite, in four categories

The checks a reviewer cares about fall into four buckets, and the notebook has at least one of
each:

| Category | Example rule | What it protects |
|---|---|---|
| **Key integrity** | no `--DY` may be 0 | records are addressable and time is coherent |
| **Required data** | `USUBJID`, `ARMCD`, `SEX` populated | the submission is complete |
| **Controlled terms** | `SEX ∈ {M,F,U}`, `AESER ∈ {Y,N}` | values are poolable across studies |
| **Value logic** | end date ≥ start date; `--BLFL ∈ {Y, null}` | the data makes clinical sense |

On the clean library **every rule returns 0** — which is the correct and slightly anticlimactic
result. A QC suite that passes is doing its job; the point of Section 5 is to show what failure
looks like.

---

## Section 3 — Cross-domain checks (the valuable ones)

```sas
/* EX first-dose date must equal DM.RFSTDTC */
select e.usubjid from sdtm.ex as e
    inner join sdtm.dm as d on e.usubjid = d.usubjid
    where e.exseq = 1 and e.exstdtc ne d.rfstdtc
```

These need **two datasets**, so they do not fit the single-domain macro — and they are the most
important checks in the suite. **Each domain can be internally perfect while the set of them is
incoherent.** The three here:

- every domain subject exists in DM (no orphans);
- every `SUPPAE` row points at a real AE record;
- **EX's first dose equals `DM.RFSTDTC`** — the anchor for every `--DY` in the study.

The third is the one to remember. If EX and DM disagree about first dose, every study day in
every domain is measured from the wrong date — and because they all shift *consistently*, no
single-domain check will ever notice. See Exercise 4.

---

## Section 4 — The findings report

Presented the way Pinnacle 21 presents it: one row per rule, worst first, with a `PASS`/`FAIL`
and a count. The header line summarises errors and warnings. On the clean library it is all
`PASS`.

**Severity is not decoration.** An `ERROR` blocks a submission; a `WARNING` does not. Which one a
rule gets is a real judgement — see Exercise 5.

---

## Section 5 — Break it on purpose

A suite that only ever passes teaches nothing. The notebook copies the domains into `WORK` (the
real datasets are never touched), injects four classic defects, and re-runs:

| Defect | Injected | Rule that catches it | Category |
|---|---|---|---|
| 1 | blank `ARMCD` for one subject | SD0002 | required data |
| 2 | `VSBLFL = "N"` | SD0004 | value logic / CT |
| 3 | `AESTDY = 0` | SD0001 | key integrity |
| 4 | `SUPPAE.IDVARVAL = "99"` (no such AE) | SD0011 | cross-domain |

All four light up. Defect 4 is the instructive one: the `SUPPAE` row is still perfectly
well-formed *on its own* — correct structure, valid values — and only the **cross**-domain check
reveals that it points at nothing. That is the class of bug an unstable `--SEQ` sort creates
(Notebook 11), which is why the two notebooks reinforce each other.

---

## How this relates to `audit_consistency.py`

You may notice the instructor harness `data/audit_consistency.py` checks many of the same things.
The difference is the point of Exercise 6: an **instructor consistency harness** proves the
*teaching materials* agree with each other; a **submission validation tool** proves the
*datasets* conform to a published standard. They overlap, but they answer to different masters —
one to the course author, one to the regulator — and both need to exist.

---

## Exercises
Six tasks at the bottom of the `.sas` file. Solutions:
`../../answer-keys/12_qc_validation_answers.md`.
