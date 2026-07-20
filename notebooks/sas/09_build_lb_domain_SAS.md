# Notebook 09 (SAS) — Build the LB Domain — Walkthrough

**Module:** Findings · **Run the code in:** `09_build_lb_domain_SAS.sas`
**Spec:** `../../data/mapping_specification.md` §7
**Target:** `../../data/sdtm/lb.csv`

LB is the second Findings domain, and it is **not** harder than VS — it is *different*. The
structural work is already done for you; the work here is lookups and derivation.

| | VS | LB |
|---|---|---|
| Raw shape | wide — needs a transpose | **already tall** |
| Rows | 24 → 128 | 48 → **48** |
| Main challenge | the transpose | CT lookups + reference ranges |
| Baseline flag | 40 | 24 |

---

## The row count nobody predicts

```
4 subjects × 6 tests × 2 visits  =  48
```

**Four**, not eight. Only half the enrolled subjects have labs at all:
`ABC-01-01-001`, `-002`, `-003` and `ABC-01-02-001`.

A subject who appears in DM but not in LB is **normal and correct** — the same thing happened
in AE, where two subjects had no adverse events. Never manufacture rows to "complete" a domain;
absence of a record is itself information.

---

## Section 1a — The CT lookup, and the one that catches everyone

```sas
when ("White Blood Cells") do; lbtestcd = "WBC"; lbtest_ = "Leukocytes"; ... end;
```

| Raw `LBTEST` (from the lab) | `LBTESTCD` | SDTM `LBTEST` (CDISC CT) | same? |
|---|---|---|---|
| Hemoglobin | HGB | Hemoglobin | yes |
| Hematocrit | HCT | Hematocrit | yes |
| **White Blood Cells** | **WBC** | **Leukocytes** | **NO — renamed** |
| Platelets | PLAT | Platelets | yes |
| Alanine Aminotransferase | ALT | Alanine Aminotransferase | yes |
| Creatinine | CREAT | Creatinine | yes |

**Five of six pass straight through.** That is exactly what makes it dangerous: a programmer
who spot-checks two rows concludes the column maps 1-to-1 and ships the sixth wrong.

Two rules:

1. **`LBTESTCD` and `LBTEST` are a paired codelist.** You cannot combine a code from the list
   with a name of your own. Look both up together.
2. **When a codelist exists, look up every value, every time.** Spot-checking is how the one
   exception survives to production.

> `LBTESTCD` is capped at **8 characters** with no spaces — which is why WBC and PLAT are
> abbreviated while ALT already fits.

### The `otherwise` branch writes an ERROR

```sas
otherwise do;
    lbtestcd = ""; ...
    put "ERROR: unmapped lab test >" lbtest "< for " usubjid=;
end;
```

Contrast this with the `AEOUT` decode in Notebook 05, which blanked unknown values silently.
**Blanking bad data is the worst outcome**: the dataset looks clean and the information is
gone. A new lab test appearing in the extract is a *spec change*, and the program should say so
loudly rather than absorb it.

---

## Section 1d — Why the standardised range matters more than the standardised result

```sas
lbstnrlo = lbornrlo;
lbstnrhi = lbornrhi;
```

In ABC-01 these are identical to the original values, because one lab reported everything in
standard units. In a real multi-site study they are not — and the **range** is the reason.

> Different laboratories use **different reference ranges for the same test**, based on their
> own equipment and population. Two hemoglobin values of 13.5 g/dL can be normal at one lab and
> low at another. `LBSTNRLO`/`LBSTNRHI` are what make results comparable across labs, and they
> are what `LBNRIND` must be derived from.

### `input(..., ?? best.)`

The `??` suppresses the log note when a value isn't numeric. Lab results are **character** in
SDTM precisely because some are not numbers — `"NEGATIVE"`, `"<0.1"`, `"TRACE"`. Those land in
`LBSTRESC` and leave `LBSTRESN` null, which is correct.

---

## Section 1e — `LBNRIND` is derived, never collected

```sas
if      lbstresn < _lo then lbnrind = "LOW";
else if lbstresn > _hi then lbnrind = "HIGH";
else                        lbnrind = "NORMAL";
```

Because it is derived, it must be **reproducible from the range and the result**. Check 5 in
the notebook re-derives it and looks for disagreement — a standard validation rule, and one of
the few checks that can be written with complete confidence about what the right answer is.

Note the missing-value guard first. A null result must give a null indicator, not `NORMAL`.

---

## Section 2 — Baseline flag: identical rules to VS

The same three conditions:

1. `LBDY <= 1` — on or before first dose (**not** `< 1`; the baseline draw is on Day 1, pre-dose)
2. the **latest** such visit, per subject per test
3. only for tests with a post-dose result

Here condition 3 excludes nothing — every test is drawn at both visits — whereas in VS it
excluded `HEIGHT`. The code is unchanged; only the data differs. That is what reusable
derivation logic is supposed to look like.

```
24 flags = 4 subjects × 6 tests
```

---

## Checking your work

| Check | Expected |
|---|---|
| 1 · rows / subjects | **48 / 4** |
| 2 · unmapped tests | 0 |
| 3 · baseline flags | **24, all at BASELINE** |
| 4 · the CT rename | `WBC` → `Leukocytes` |
| 5 · `LBNRIND` vs the range | no disagreements |
| 6 · abnormal results | **exactly 1** |
| 7 · completeness per subject | 6 tests × 2 visits for everyone present |

---

## The one abnormal result

```
ABC-01-01-003   ALT   BASELINE   24   (7–56)   NORMAL   Day 1
ABC-01-01-003   ALT   WEEK 4     72   (7–56)   HIGH     Day 28
```

Subject `ABC-01-01-003`'s ALT — a liver enzyme — rose from 24 to 72, above the upper limit of 56.

**And there is no adverse event for it in ABC-01.** That is not a gap in the data:

> `LBNRIND = "HIGH"` is a **range comparison**, nothing more. Whether an abnormal lab is
> *clinically significant* is the investigator's judgement, and only if they judge it so does it
> become an adverse event. You derive `LBNRIND`. You do **not** decide clinical significance,
> and you never create an AE because a lab value looks bad — that would be fabricating a safety
> finding.

---

## Exercises
Seven tasks at the bottom of the `.sas` file. Solutions:
`../../answer-keys/09_build_lb_answers.md`.
