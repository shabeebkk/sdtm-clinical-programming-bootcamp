# Notebook 15 (SAS) — Build ADAE — Walkthrough

**Module:** Occurrence Data · **Run the code in:** `15_build_adae_SAS.sas`
**Spec:** `../../data/adam_specification.md` §2 · **Target:** `../../data/adam/adae.csv`

Your second analysis dataset, and the first one with a different **shape**. ADSL had one row
per subject. ADAE has one row per *event* — and a subject can have none, one, or five.

ADAE is an **occurrence** dataset (OCCDS). The defining feature is that its records either
happened or did not. There is no visit structure, no baseline, and no change from baseline —
which is exactly what makes it a different class from ADVS and ADLB.

---

## Picking the class by shape, not by topic

| Question about the data | Class | Example |
|---|---|---|
| Does it repeat over visits? | BDS | blood pressure, haemoglobin |
| Did it either occur or not? | OCCDS | adverse event, concomitant medication |
| Is it one fact about the subject? | ADSL | treatment arm, age group |

A vital sign measured only once is still BDS. An adverse event is still OCCDS even though it
has dates. The shape decides, not the subject matter.

---

## Where the data comes from

| Source | Provides |
|---|---|
| `sdtm/ae.csv` | the events — term, severity, causality, outcome, dates |
| `sdtm/suppae.csv` | `AETRTEM` — the treatment-emergent flag, already derived |
| `data/adam/adsl.csv` | every subject-level variable, copied |

---

## Section 1 — Merging ADSL onto the events

```sas
merge ae (in = a) ref_adsl (in = b);
by usubjid;
if a;
```

`if a;` means **AE defines the rows**; ADSL only decorates them. A subject with no events
contributes no rows to ADAE — and that is correct. They still exist in the study, and they still
count in the denominator, because the denominator comes from ADSL.

Every subject-level variable is **copied**. If you ever find yourself computing `SAFFL` inside
ADAE, stop: the study now has two answers to *who was dosed*, and no way to tell which is right.

Note that safety tables group on `TRTA` (**actual** treatment), not `TRTP` (planned). A safety
table reports what a body received, not what a randomisation list intended. In ABC-01 the two
are identical for every subject; in a study with a dosing error they are not, and the
distinction is the whole reason both variables exist.

---

## Section 2 — Analysis dates and the ongoing event

```sas
if not missing(aeendtc) then aendt = input(aeendtc, yymmdd10.);
```

Two of the ten events are **ongoing** — the subject still had them when the study ended, so
`AEENDTC` is blank. The guard matters: converting a blank string gives a missing date, and
subtracting a missing date silently propagates missingness into `AENDY` and `ADURN`.

```sas
if astdt > . and aendt > . then adurn = aendt - astdt + 1;
```

`ADURN` is **missing** for an ongoing event, not 0. A zero would enter a mean-duration summary
and drag it toward zero, understating how long events actually last. Exercise 3 makes you
measure how far apart the two answers are.

Study day uses the same no-Day-0 rule as SDTM `--DY`, but anchored on `ADSL.TRTSDT` rather than
`DM.RFSTDTC`. Here they are the same date. In a study where the treatment period begins later
than the reference start date they are not, and ADaM always uses `TRTSDT`.

---

## Section 3 — Analysis severity and causality

`AESEV` and `AEREL` are kept exactly as collected. `ASEVN` and `AREL` are the **analysis**
versions, and they exist because tables need them:

- `ASEVN` gives severity a **sort order**, so Severe prints below Moderate rather than
  alphabetically above Mild. Without it, every severity table is in the wrong order.
- `AREL` collapses four collected causality values into the yes/no that a "treatment-related
  adverse events" table actually reports.

```sas
if aerel in ('RELATED', 'POSSIBLY RELATED') then arel = 'Y';
else                                             arel = 'N';
```

**That collapse is a decision, not a fact.** Nothing in the data says `POSSIBLY RELATED` counts
as related. The Statistical Analysis Plan says so, and a different study could reasonably say
otherwise. Exercise 4 makes you re-derive it the stricter way and count how many events move —
the answer is uncomfortable, which is the point.

---

## Section 4 — Treatment-emergent: bring it across, do not re-derive it

The flag already exists. The SDTM course derived it as `SUPPAE.AETRTEM`, and ADaM **reads** it:

```sas
aeseq   = input(idvarval, best8.);   /* SUPPAE stores it as CHARACTER */
trtemfl = qval;
```

**Why not just recompute it?** Because a rule that lives in two places is a rule that will
eventually disagree with itself. If someone later refines the SDTM definition — say, to handle a
partial start date — and ADaM still uses its own copy, the two drift apart. Nothing errors. The
tabulation package and the analysis package simply disagree about which events were
treatment-emergent, and a reviewer finds it before you do.

One derivation, one home. That is what traceability means in practice.

**But trust is not the same as verification.** The notebook cross-checks the flag against the
dates independently:

```sas
where (astdt >= trtsdt and trtemfl ne 'Y')
   or (astdt <  trtsdt and trtemfl  = 'Y');
```

This must print **zero rows**. Reading a derived flag from upstream is right; assuming it is
correct without ever testing it is not.

### The row that decides the safety tables

| USUBJID | AESEQ | AEDECOD | ASTDY | TRTEMFL |
|---|---|---|---|---|
| `ABC-01-01-002` | 1 | Oropharyngeal pain | **−5** | **N** |

This subject's first event started **five days before first dose**. It is a real event, reported
by a real investigator, and it **stays in the dataset**. But it is not treatment-emergent, so it
appears in no safety table and carries no occurrence flag.

Deleting it instead of flagging it would be much worse than it sounds — Exercise 2 walks through
exactly what it destroys.

---

## Section 5 — Occurrence flags, and why they exist

The first line of every AE table is *subjects with at least one treatment-emergent event*. A
subject with three events must contribute **1** to that number, not 3.

`AOCCFL` solves this by marking exactly **one row per subject**, so that counting flagged rows
counts subjects:

```sas
proc sort data = teae out = t_subj; by usubjid astdt aeseq; run;
data occ_subj;
    set t_subj;
    by usubjid;
    if first.usubjid;
    aoccfl = 'Y';
run;
```

`AOCCPFL` does the same per subject **per preferred term**, for the by-term rows of the same
table. Both are restricted to `TRTEMFL = 'Y'` — a flag on a non-emergent event would put it
back into the table the flag was designed to keep it out of.

**Why sort by `ASTDT` *then* `AESEQ`?** Because `ASTDT` alone does not break ties. If two of a
subject's events share a start date, the flagged row would depend on whatever order the data
happened to arrive in — and a result that changes when you re-sort the input is not
reproducible. Exercise 5 makes you demonstrate this, because "it works on my machine" is not a
defence a reviewer accepts.

The notebook proves the arithmetic:

```sas
select (select count(*) from adae where aoccfl = 'Y')          as flagged_rows,
       (select count(distinct usubjid) from adae
        where trtemfl = 'Y')                                   as subjects_with_teae;
```

Both are **6**.

---

## What you built

| | |
|---|---|
| Rows | 10 — one per adverse event |
| Treatment-emergent | 9 (`TRTEMFL = 'Y'`) |
| Not treatment-emergent | 1 — the day −5 event, retained |
| Subjects with ≥1 TEAE | 6 of 8 |
| `AOCCFL = 'Y'` rows | 6 — matching, by construction |
| Ongoing events | 2, with missing `ADURN` |

Two subjects (`ABC-01-01-003`, `ABC-01-02-004`) had no events at all. They appear nowhere in
ADAE — and they still count in every denominator, because denominators come from ADSL. That
point returns with force in Notebook 17, where only half the study has lab data.

Next: **Notebook 16**, where the shape changes again — one row per subject *per parameter per
visit* — and you meet baseline, change, and a parameter that exists in no SDTM domain.
