# Notebook 08 (SAS) — Build the VS Domain — Walkthrough

**Module:** Findings · **Run the code in:** `08_build_vs_domain_SAS.sas`
**Spec:** `../../data/mapping_specification.md` §6
**Target:** `../../data/sdtm/vs.csv`

This is the notebook where the *shape* of the data changes. Everything before this was one
raw row in, one SDTM row out. VS breaks that, and it is the skill that transfers to most of
SDTM — Findings is the largest observation class.

```
   RAW (wide)                          SDTM (tall)
   1 row per visit                     1 row per subject × visit × test
   6 measurement columns               6 values of VSTESTCD

   24 rows        ── transpose ──►     128 rows
```

---

## Work out 128 before you run anything

```
  8 subjects × 3 visits × 5 repeated tests   = 120
+ 8 subjects × 1 HEIGHT (screening only)     =   8
                                               ───
                                               128
```

Knowing the answer in advance turns Check 1 into a real test. Two wrong answers are
diagnostic:

| You got | What you did |
|---|---|
| **24** | `OUTPUT` is after the loop instead of inside it |
| **144** | you emitted HEIGHT rows at all three visits |

---

## Section 1 — The transpose

Four arrays, matched **by position**:

```sas
array vals {6}     sysbp diabp pulse temp height weight;
array cds  {6} $8  ("SYSBP" "DIABP" "PULSE" "TEMP" "HEIGHT" "WEIGHT");
array nms  {6} $40 ("Systolic Blood Pressure" ... );
array uns  {6} $12 ("mmHg" "mmHg" "beats/min" "C" "cm" "kg");

do i = 1 to 6;
    if not missing(vals{i}) then do;
        vstestcd = cds{i};
        ...
        output;              /* INSIDE the loop */
    end;
end;
```

Three things to understand:

1. **`OUTPUT` inside the loop.** Each iteration writes one row. Move it after the `end;` and
   you get one row per visit carrying only the last test — a wrong answer that *looks*
   plausible, which is the expensive kind.
2. **The arrays must stay in the same order.** They are paired by index, not by name. Reorder
   one and every pulse is labelled a temperature — with no error message.
3. **`if not missing(...)`** is what keeps HEIGHT honest. Height is measured once at screening;
   in tall structure a value that wasn't measured simply produces **no row**. Wide data has to
   store a blank; tall data doesn't have to store anything.

### Read the measurements as CHARACTER

```sas
length ... sysbp $10 diabp $10 pulse $10 temp $10 height $10 weight $10 ...;
...
vsorres  = strip(vals{i});                 /* exactly as collected  */
vsstresn = input(vals{i}, ?? best.);       /* the numeric version   */
```

`--ORRES` is a **character** variable holding the result **exactly as collected**, so read the
raw column as character and copy it straight across.

> **Why not read it as numeric and convert back?** Because that destroys precision. Subject
> `ABC-01-01-002` weighs **`82.0` kg**. Read through a numeric and `put(..., best.)` gives you
> back `"82"` — the trailing zero is gone.
>
> That is not cosmetic. **`82.0` kg asserts precision to a tenth of a kilogram; `82` kg does
> not.** The site recorded a significant figure and the mapping silently threw it away. In lab
> data the same bug changes what a result *means*.
>
> This one is easy to miss because it only shows up on values that happen to end in zero — in
> ABC-01 that is 6 of the 24 weights and 1 temperature. Every other value round-trips
> perfectly, so a spot check passes.

**`VSSTRESN` is where the number belongs.** It is numeric, so `82.0` and `82` are the same
value and no trailing zero survives — a numeric variable has no such concept. That is the
whole point of storing the result twice: `--ORRES` preserves what was *written*, `--STRESN`
carries what can be *calculated*.

`??` suppresses the log note if a result is not numeric (`"NEGATIVE"`, `"<0.1"`), leaving
`--STRESN` null — which is correct.

---

## Section 2 — The baseline flag (the part that catches people)

Three conditions, **all** required:

### 1. `VSDY <= 1`, not `< 1`

The BASELINE visit happens **on** the first dosing day, so its `VSDY` is `1` — and the vitals
are taken **before** the dose that morning. So a Day 1 assessment *is* pre-dose.

> `where vsdy < 1` looks obviously right, and is wrong. It excludes BASELINE entirely and
> flags SCREENING instead. This is the single easiest way to get VS wrong, and nothing in the
> output looks broken — you still get exactly 40 flags, just on the wrong visit.

Be clear about what this relies on: the CRF collects a **date but no time**, so nothing in the
data proves the measurement preceded the dose. That comes from the protocol's visit schedule.
When a study collects times, use them instead of trusting the schedule.

### 2. The **latest** qualifying record, per subject **per test**

Both SCREENING and BASELINE precede first dose. Only the last one is the baseline.

We express it as "latest pre-dose visit" rather than testing `VISIT = "BASELINE"`, so the code
still works when a subject has an unscheduled pre-dose visit — which real studies have.

### 3. The test must have a **post-dose** result

A baseline exists to anchor a change-from-baseline analysis. A test measured once and never
repeated has nothing to anchor, so it gets no flag. In ABC-01 that excludes `HEIGHT`:

```
40 flags  =  8 subjects × 5 repeated tests        (not 48)
```

> ⚠️ **This third condition is sponsor-dependent.** SDTMIG defines `--BLFL` as the baseline
> indicator but does not settle whether a single, never-repeated measurement is its own
> baseline. Some sponsors would flag it and report 48. **This study's spec specifies the rule
> above** — don't carry the choice to another study without checking.

### The value is `Y` or blank

There is no `"N"`. A populated `"N"` is a conformance finding.

---

## Section 3 — VSSEQ

Sorted by `usubjid`, `visitnum`, then **collection order** (`_ord`), not alphabetically. The
sequence follows the order the tests appear on the CRF, which is what a reviewer expects to
see. Any deterministic order is defensible; an *un*determined one is not.

---

## Section 4 — VISITNUM

```sas
when ("WEEK 4") visitnum = 4;   /* 3 is unused — do NOT renumber */
```

`VISITNUM` is a **lookup from the protocol**, not something you derive by sorting dates. The
gap at 3 is real: the protocol's visit schedule includes a visit where no vital signs are
taken. Renumbering 1-2-3 to close the gap would break comparability with every other domain.

---

## Checking your work

| Check | Expected | If it fails |
|---|---|---|
| 1 · row count | **128** | 24 → `OUTPUT` outside the loop · 144 → HEIGHT emitted everywhere |
| 2 · rows per test | HEIGHT 8, all others 24 | the missing-value test isn't working |
| 3 · `USUBJID`+`VSSEQ` unique | yes | `--SEQ` didn't reset per subject |
| 4 · baseline flags | **40, all at BASELINE** | flags at SCREENING → you used `< 1` |
| 5 · ≤ 1 flag per subject per test | no rows returned | you flagged every pre-dose record |
| 6 · any `VSDY` = 0 | none | there is no Day 0 |
| 7 · units consistent within test | no rows returned | the unit array is out of step |

Check 4 is the one that earns its keep: **both** the count and the visit must be right. A
`< 1` bug still gives you 40 — on the wrong visit.

---

## What the finished domain looks like

```
USUBJID        SEQ TESTCD ORRES ORRESU    BLFL VISITNUM VISIT      VSDTC       VSDY
ABC-01-01-001   1  SYSBP   122  mmHg           1        SCREENING  2024-02-20   -10
ABC-01-01-001   5  HEIGHT  165  cm             1        SCREENING  2024-02-20   -10
ABC-01-01-001   7  SYSBP   120  mmHg      Y    2        BASELINE   2024-03-01     1
ABC-01-01-001  12  SYSBP   118  mmHg           4        WEEK 4     2024-03-28    28
```

One subject's systolic blood pressure across the study is now three rows rather than three
columns — and adding a seventh vital sign to the protocol would add rows, not change the
structure. That is the entire point.

---

## Exercises
Seven tasks at the bottom of the `.sas` file. Solutions:
`../../answer-keys/08_build_vs_answers.md`.
