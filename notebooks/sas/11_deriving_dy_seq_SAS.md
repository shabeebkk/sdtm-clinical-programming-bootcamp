# Notebook 11 (SAS) — Deriving `--DY` and `--SEQ` — Walkthrough

**Module:** Derivations · **Run the code in:** `11_deriving_dy_seq_SAS.sas`
**Deck:** `../../presentations/09_derivations.pptx`
**Spec:** `../../data/mapping_specification.md` §1.3, §1.4

You have derived `--DY` and `--SEQ` in six domains. This notebook turns those six habits into
**two reusable macros**, proves them against the whole study, then **breaks them on purpose** so
you can see how they fail.

> **Prerequisite:** the SDTM library must hold the built domains. Run `00_setup.sas` then
> `run_all.sas` (or notebooks 04–09) in the same session. The notebook aborts with a clear
> message if `SDTM.AE` is missing.

---

## Section 1 — The study-day macro

```sas
%macro study_day(dtc, ref, out);
    if missing(&dtc) or missing(&ref) then &out = .;
    else if &dtc >= &ref then &out = &dtc - &ref + 1;   /* on/after: +1 */
    else                      &out = &dtc - &ref;       /* before: no +1 */
%mend;
```

One formula, two branches, no Day 0 — written once, used everywhere.

Both arguments are **SAS date numbers**, not character `--DTC` strings. Keeping the conversion
*outside* the macro is deliberate: the macro does date arithmetic and nothing else, which makes
it trivial to reason about and reuse. (Exercise 5 asks you to try it the other way and see why
this is better.)

---

## Section 2 — Prove it against all 226 values

The real test of a derivation macro is that it **reproduces what is already there**. The notebook
re-derives `--DY` for all six domains from `RFSTDTC` and the `--DTC` values, then diffs against
the stored values:

```
Domain  Variable  Result  Detail
AE      AESTDY    MATCH   10 values re-derived identically
CM      CMSTDY    MATCH   8 values ...
EX      EXSTDY    MATCH   8 ...
VS      VSDY      MATCH   128 ...
LB      LBDY      MATCH   48 ...
DS      DSSTDY    MATCH   24 ...
```

226 values, one macro, every one reproduced. If any row said `FAIL`, the macro and the stored
data would disagree — which is exactly what Exercise 1 makes happen.

---

## Section 3 — The two properties that must hold everywhere

**Property 1 — no `--DY` equals zero.** Across all 226 values there is not a single 0. That is
*structural*, not luck: the `+ 1` on one branch only is what enforces it. A 0 in your output
means one branch lost its `+ 1`.

**Property 2 — where negatives live:**

| Domain | Range | Negative | Why |
|---|---|---|---|
| EX | 1 … 1 | 0 | dosing *defines* Day 1 |
| LB | 1 … 29 | 0 | no screening blood draw in this protocol |
| AE | −5 … 20 | 1 | collected from consent — one screening event |
| CM | −96 … 15 | 4 | prior medications go back months |
| DS | −11 … 28 | 8 | informed consent precedes dosing for everyone |
| VS | −11 … 29 | 48 | screening-visit vitals for all 8 subjects |

**61 of the 226 values are legitimately negative.** A validation rule that flagged *every*
negative `--DY` as an error would fire on all 61. Whether a negative is right depends on **what
the domain collects**, which you learn from the protocol and spec — not from the data.

---

## Section 4 — The `--SEQ` macro

```sas
%macro derive_seq(indata, outdata, seqvar, sortby);
    proc sort data = &indata out = _sorted;
        by usubjid &sortby;      /* sortby MUST include a tiebreaker */
    run;
    data &outdata;
        set _sorted;
        by usubjid;
        retain &seqvar;
        if first.usubjid then &seqvar = 1;
        else                  &seqvar + 1;
    run;
%mend;
```

The counter is trivial. **The sort is the derivation** — and choosing a *deterministic* order is
the part that takes judgement. Re-deriving `AESEQ` with `by aestdtc aeterm` reproduces the stored
values exactly.

---

## Section 5 — Break it on purpose

```sas
%derive_seq(sdtm.ae, ae_badseq, aeseq_bad, aesev)   /* severity is NOT unique */
```

Sorting by `AESEV` — a non-unique key — moves the sequence numbers. **Two records swap**, both
for subject `ABC-01-01-001` (its "bad headache" and "Nausea"). The notebook prints the
mismatches side by side.

> **Why an unstable sort is worse than an error.** A QC programmer re-runs your code and gets
> *different* `AESEQ` values. They cannot tell whether the data changed or your program is
> non-deterministic — and every `SUPPAE` row keyed on `AESEQ` now points at a different event.
> An error stops you; an unstable sort ships.

That last point is Exercise 4: `SUPPAE.IDVARVAL` holds the `AESEQ` value, so if `AESEQ` 1 and 2
swap, the `AETRTEM` flag follows the number, not the event.

---

## Section 6 — Save the macros for reuse

In production, `%study_day` and `%derive_seq` live in an **autocall library** or a `%INCLUDE`
file that every program calls, so each derivation is defined **once**. If the definition of study
day ever changed, you would edit one file — not six notebooks. That is the real payoff of turning
a habit into a macro.

---

## Exercises
Six tasks at the bottom of the `.sas` file. Solutions:
`../../answer-keys/11_deriving_dy_seq_answers.md`.
