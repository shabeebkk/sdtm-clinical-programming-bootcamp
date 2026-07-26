# Independent review — findings

Reviewer: Codex (`gpt-5.2-codex`), read-only, no prior knowledge of this course and not told
what the harnesses check. Every finding below was then **verified against the actual files and
data** before being recorded. Findings that did not survive verification are listed too, with
the reason — a review you only hear the hits from is not a review.

Passes run so far: **1 (SAS execution semantics)** and **3b (presentations: copy + design)**.
Passes 2, 4, 5, 6, 7 outstanding.

---

## CONFIRMED — worth fixing

### C1 · Slide states nine adverse events; there are ten
`presentations/build_06_events_interventions.js:290` (deck 06, slide 10)
> "Two of the **nine** ABC-01 adverse events had not resolved…"

`data/sdtm/ae.csv` has **10** rows. (The "two unresolved" half is correct — exactly 2 rows have
a blank `AEENDTC`.) A stale count that survived the AE domain growing.
**Fix:** nine → ten.

### C2 · "Two dangers" followed by three dangers
`presentations/build_04_reading_raw_data.js:194` (deck 04, slide 12)
Headline says "Two dangers." then enumerates `(1)` ambiguous date format, `(2)` blank means
ongoing, `(3)` `DD-MMM-YYYY` does not sort chronologically.
**Fix:** "Three dangers."

### C3 · Deck contradicts the course's own define.xml on CNSDTDSC
`presentations/build_18_tte_validation.js:154` (deck 18, slide 5)
> "…which is why **the standard requires** the variable."

The course's own `data/define/define_adam.xml` declares `CNSDTDSC` as `Mandatory="No"`. The
deck asserts a requirement the project's own metadata denies.
**Fix:** state it as a study choice — "this study includes CNSDTDSC to document why a subject
was censored" — not a standard-level requirement.

### C4 · Muted text on the dark ground fails WCAG contrast
Recurring: `#5A7682` on the `#0F2E3D` ground, e.g. deck 01 slide 1 footer at 12 pt.
Measured contrast **2.94 : 1** — fails AA for normal text (needs 4.5) *and* for large text
(needs 3.0). By comparison `#C7DCE0` on the same ground is 9.97 : 1 and `#6FC8B4` is 7.17 : 1,
so the palette already contains compliant options.
**Fix:** reserve `#5A7682` for light grounds; use `#AFCBD3`/`#C7DCE0` for small text on dark.
Not caught by `check_deck_layout.py`, which tests position and hidden text but not contrast.

### C5 · QC pattern miscounts negative study days when a date is partial
`notebooks/sas/11_deriving_dy_seq_SAS.sas:154-159`
```sas
sum(aestdy < 0) as negative
```
In SAS a missing value is smaller than every number, so a **null** `--DY` is counted as
negative. Harmless on ABC-01 (no `--DY` is missing) — but the **capstone deliberately creates a
null `AESTDY`** via the partial-date trap. Run this QC pattern on DEF-01 and it reports
**1 negative study day where the truth is 0**.

A QC check that miscounts is worse than no check, and the defect is exactly the trap the course
teaches in notebook 02.
**Fix:** `sum(. < aestdy < 0)`, matching the guard the course already uses in ADSL.

### C6 · Baseline-flag selection does not guard the missing case
`notebooks/sas/08_build_vs_domain_SAS.sas:223,238` ·
`notebooks/sas/09_build_lb_domain_SAS.sas:200,213` ·
`capstone/notebooks/13_capstone_DEF01_SOLUTION.sas:429,440,521,532`
```sas
where vsdy <= 1        /* missing <= 1 is TRUE in SAS */
```
**Not currently triggered** — every `--DY` is populated in both studies (verified: 0 missing
across VS and LB in ABC-01 and DEF-01). So no shipped value is wrong.

It is still worth fixing, because the course is *modelling practice*: `14_build_adsl_SAS.sas:140`
guards the identical hazard with `if . < age < 65` **and comments on why**, while these do not.
Teaching the trap in one file and ignoring it in four others is the inconsistency.
**Fix:** `where . < vsdy <= 1`.

---

## Judgement calls — overstated claims (my assessment: mostly fair)

Codex flagged a cluster where the decks state a **sponsor convention or a simplification as an
absolute rule**. Some simplification is pedagogically right; the test applied here is *would a
trainee repeat this in an interview and be wrong?*

| Where | Claim | Assessment |
|---|---|---|
| 10, slide 3 | "ERROR — **blocks the submission**" | **Fair hit.** P21 errors are routinely explained rather than fixed. Overstated. |
| 11, slide 4 | "reviewer's tools expect AE to have **exactly** the standard columns" | **Fair hit.** Contradicts Required/Expected/Permissible, which the course teaches elsewhere. |
| 11, slide 6 | "**every** real submission" ships TS | Fair — depends on submission type. |
| 10, slide 2 | "Sponsors run it before **every** submission; the FDA runs **its own copy**" | Fair — conflates a commercial tool with regulatory validation. |
| 01, slides 3/7 | "REQUIRED BY FDA & PMDA" | Partly fair — true for specified submission types, with date/version caveats. Softening advised. |
| 06, slides 6/12 | AETERM is "the **legal** record", "fix nothing" | Fair — the intent is right, "legal record" is not an SDTMIG concept. |
| 13, slide 5 | "raw data is **never** ISO" | Fair — raw extracts often are ISO. |
| 02, slide 13 | database locked "**only** when the study is complete" | Fair — ignores interim/soft locks. |
| 16, slide 6 | zero-substitution bias is "**ALWAYS** toward the null" | **Strongest of these.** Not mathematically true in general. |
| 09, slide 6 | date-then-term is "a tiebreaker that **cannot** tie" | Fair — two records can share subject+date+term. |

## Design observations (lower priority)

- Decks **07 slide 5** and **08 slide 4** carry ~50–60 discrete text cells at 10–12 pt —
  unreadable at presentation distance. Split or move to a handout.
- **Type scale drifts** across the 18 decks: titles at 44/46 pt, slide titles at 28/30 pt, and
  one-off body sizes (11.5, 11.8, 12.5, 13.5, 14.5, 15.5, 17 pt) without a change in role.

---

## Pass 2 — derivations re-derived from the spec

**Headline result: zero value mismatches.** Codex independently derived `USUBJID`, every
`--DY`, `--SEQ`, `--BLFL`, `LBNRIND`, `AETRTEM`, the ISO date conversions, unit
standardisation, and on the ADaM side `ABLFL`/`BASE`/`CHG`/`PCHG`/`BMI`/`TRTEMFL`/
`TRTSDT`/`TRTEDT`/`TRTDURD`/`ADTTE`, working from the specification and data **without reading
any SAS code**, and found no shipped value that disagrees.

That is a genuine independent corroboration of the 529-value recomputation done separately —
two different methods, no shared code, same answer.

What it did find were **specification gaps**: places where the spec cannot, on its own, be the
single source of truth the course claims it is.

### C7 · `--SEQ` test ordering is not reproducible from the spec
The spec says only "VS/LB **by visit then test order**" and never defines *test order*. The
shipped order is `SYSBP, DIABP, PULSE, TEMP, HEIGHT, WEIGHT` (raw column order) and
`HGB, HCT, WBC, PLAT, ALT, CREAT` — not alphabetical, not CT order. A competent programmer
working from the spec alone cannot reproduce the shipped `VSSEQ`/`LBSEQ` assignment.

Affects all 128 VS and 48 LB records. Matters because the course's own thesis is that the spec
is the single source of truth — this is a case where it isn't.
**Fix:** state the test order explicitly in the spec (or specify "raw column order").

### C8 · `EVNTDESC` / `CNSDTDSC` values are undefined
The ADaM spec gives their *meaning* ("What ADT represents", "Why censored") but no codelist,
literal, or construction rule. Shipped values are `First treatment-emergent adverse event`,
`Censored at last dose`, `LAST DOSE`. `FIRST TEAE` would be equally conforming.
**Fix:** pin the literals in the spec.

### Observation · the capstone has no formal mapping spec
DEF-01 ships a data dictionary, not an `.xlsx` mapping specification, and the ABC-01 workbook
does not apply to it (different study, drug, visits, tests, units). This is defensible — the
capstone is *meant* to be harder — but worth being deliberate about, since the course elsewhere
insists a spec is the single source of truth.

---

## DISMISSED — did not survive verification

### D1 · "`if . < age < 65` classifies everyone as <65" — **FALSE POSITIVE**
`notebooks/sas/14_build_adsl_SAS.sas:140`. Codex rated this *major, high confidence*, claiming
SAS evaluates the chain left-to-right as `(. < age) < 65` so the condition is always true, and
that subjects aged 66 and 68 are misclassified.

**Disproved directly by the shipped data:** `data/adam/adsl.csv` gives `ABC-01-01-004` (66) and
`ABC-01-02-004` (68) `AGEGR1='>=65'`, `AGEGR1N=2` — exactly as intended.

The claim imports C/Python semantics into SAS. **SAS supports compound comparisons natively**:
`. < age < 65` means "greater than missing AND less than 65", and is the idiomatic SAS guard
against missing. The code is correct, and its comment already explains the intent.

Kept as the clearest illustration of why every finding gets verified: a confident,
severity-rated claim about language semantics, wrong at the root.

### D2 · "Capstone unit conversion has no specified factors or rounding" — **FALSE POSITIVE**
Codex reported the lb→kg and °F→°C conversions as unspecified. They are specified, in
`capstone/notebooks/13_capstone_DEF01_SKELETON.sas:153`:
> `VSSTRESN/VSSTRESU (lb*0.45359237 ; (F-32)*5/9), rounded to 0.1`

— i.e. in the file the trainee actually works in, with the exact factors and the rounding.
Verified against the data: every shipped value matches those factors at 1 dp.

**Cause of the false positive was my own instruction**, not the course: this pass explicitly
barred Codex from reading `.sas` files so it could derive values independently, and the rule
lives in a `.sas` file. Recorded because it shows the method's blind spot, which matters for
interpreting the rest of the pass.

### D3 · "Capstone partial-date rule is unspecified" — **OVERSTATED**
`capstone/data/def01_data_dictionary.md:55-56` states it plainly: *"Keep the partial in
`AESTDTC` as `2024-02`; **do not invent a day**."* `README_capstone.md` additionally gives the
null `AESTDY` and `AETRTEM = N`. Codex's claim that no rule exists is wrong; what is true is
only that the rule lives in the dictionary rather than a formal mapping spec.

---

## Status

| Pass | State |
|---|---|
| 1 · SAS execution semantics | done — 2 confirmed (C5, C6), 1 dismissed (D1) |
| 2 · Derivations from spec | done — 0 mismatches, 2 spec gaps (C7, C8), 2 dismissed (D2, D3) |
| 3b · Presentations, copy + design | done — 4 confirmed (C1–C4), 10 overstatements, 2 design |
| 4 · Capstone integrity | **not run** |
| 5 · Submission artifacts | **not run** |
| 6 · Cross-media consistency | **not run** |
| 7 · Sequencing and pedagogy | **not run** |

Tally so far: **8 confirmed defects**, 10 overstated claims, 2 design issues, **3 false
positives caught and dismissed** (1 of them caused by this review's own method constraint).
