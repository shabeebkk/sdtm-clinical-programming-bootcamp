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

---

# Passes 4–7

## Pass 4 — capstone integrity

**Clean on the things that matter most:** solvability from notebooks 01–12b, the solution
reproducing all six reference datasets, trap detection, and every stated number.

### C9 · `verify_capstone.sas` can grade stale output (false pass)
`capstone/notebooks/verify_capstone.sas:37`. It prefers `SDTM.&dom` over `WORK.&dom` — which is
**correct**, since the skeleton tells trainees to write to `sdtm.<dom>`. The defect is narrower
than reported: **nothing ever clears the SDTM library** (the solution kills `WORK` only, at
line 48). So if attempt 1 builds `SDTM.VS` successfully and attempt 2 fails partway, the
verifier silently grades attempt 1's surviving dataset and reports MATCH.

Exactly the "clean-looking run is not a correct run" failure the course exists to teach.
**Fix:** stamp the build, or have verify warn when a graded dataset predates the session.

### C10 · Text compare is blind to type and format
Consequence of a deliberate design choice (the header explains text compare sidesteps
`PROC IMPORT` type guessing). Two real edges: a **character** `VSSTRESN="93"` exports
identically to numeric and passes; and a trainee who applies `format 8.1` exports `93.0`
against a reference `93` and fails for a formatting reason unrelated to mapping. Worth
documenting as a known limit rather than re-engineering.

### C11 · Stale audit-check count
`capstone/answer-keys/13_capstone_answers.md:7` claims 63 checks; the shipped script now prints
**69**. Same stale-number class as C1.

## Pass 5 — submission artifacts

Clean: define-vs-data in both directions, blankcrf carrying no annotations, and the cSDRG.

### C12 · The aCRF link in define.xml is broken
`data/define/define.xml`, `def:leaf[@ID='LF.acrf']` declares `xlink:href="acrf.pdf"`. define.xml
lives in `data/define/`, so that resolves to `data/define/acrf.pdf` — **which does not exist**.
The file is at `data/acrf.pdf`. A reviewer clicking the annotated-CRF link gets nothing, in the
one artifact whose job is to point at everything else.
**Fix:** `xlink:href="../acrf.pdf"`, or move the leaf target.

### C13 · 14 value-level derivation methods are orphaned in define_adam.xml
113 MethodDefs, 99 referenced, **14 never referenced** (7 ADVS AVAL, 6 ADLB AVAL, 1 ADTTE).
Verified they are genuinely unreachable: the 3 `ValueListDef`s contain 14 `ItemRef`s and **not
one carries `def:MethodOID`**. The value-level metadata is half-wired — parameters and
derivations both exist, nothing connects them. A reviewer sees the parameters with no
derivation for each AVAL.

### C14 · The XPT gate reports violations but does not stop the export
`notebooks/sas/12b_submission_package_SAS.sas`, `%xpt_gate`: when `&n_issues > 0` it prints an
error and execution continues into every `%to_xpt`. A dataset violating the transport-v5
constraints the course teaches is exported anyway.

## Pass 6 — cross-media consistency

### C15 · README and CURRICULUM contradict each other on execution status
`README.md:45` — "**Both tracks have been executed** on SAS OnDemand for Academics".
`CURRICULUM.md:30` — notebooks 10–12 and the capstone "pass static checks and are **queued for
the next ODA run**". The README is current; CURRICULUM is stale. It also repeats the obsolete
"63-check audit".

### C16 · The regeneration commands do not work if followed literally
`README.md:98-106`. Three consecutive `bash` blocks: the first ends inside `data/`, the second
opens with `cd data` (→ `data/data`, fails), the third with `cd capstone/data` (resolved from
the wrong directory). Anyone pasting these in one shell fails at step two.

### C17 · The deck-rebuild instructions assume a global install with no install step
`README.md:109-113` runs `NODE_PATH=$(npm root -g) node build_*.js` but never says to
`npm install -g pptxgenjs`. On a clean machine this fails with "Cannot find module" — which is
exactly what happened when this review tried to rebuild the decks.

## Pass 7 — sequencing

### C18 · `PROC SQL` is used before it is taught
`notebooks/sas/03_import_raw_data_SAS.sas` uses `SELECT`, `UNION ALL`, `COUNT(DISTINCT)` and a
subquery, and answer key 03 solves exercises 2 and 4 with SQL — but notebooks 01 and 02 teach
DATA steps, procedures and functions, never SQL. A fresher meets an unexplained language.

### C19 · Controlled terminology is applied four days before it is taught
Days 4–7 require CT decisions for DM, AE and LB; Day 8 first teaches codelists, extensibility
and fail-loud mapping. Deck 08 openly says trainees "have already applied CT in five domains"
and that earlier mappings silently blanked unknown values. Defensible as spiral teaching, but
it should be a stated choice, not an accident.

### Observation · the capstone difficulty step
Guided one/two-domain days, then six domains end-to-end in one day, on four cases ABC-01 never
exercised. Naming the traps and supplying the constants is not the same as prior guided
practice. Worth a deliberate decision, not necessarily a fix.

## Dismissed

### D4 · "README falsely claims answer keys are not in the repository"
`README.md:118` is accurate: `answer-keys/` is gitignored and **0 files are tracked**. Codex
read the author's local working tree, which is neither the repository nor the shared Drive copy
(also verified clean). Dismissed.

---

# Resolutions — all 7 action items

| # | Item | Decision | Commit |
|---|---|---|---|
| 1 | 14 orphaned value-level MethodDefs | Wired + rendered + guarded (audit 8e) | `9ee2f32` |
| 2 | verify_capstone can grade stale output | Warn: build provenance on every row | `8f196aa` |
| 3 | XPT gate reported but did not block | Now aborts; non-ASCII scan added | `75ae22e` |
| 4 | PROC SQL used before taught | Primer in notebook 02 (+ 3 stale counts, guard 8f) | `d9d014e` |
| 5 | CT applied before taught | Forward-reference at first use | `0aa9317` |
| 6 | Verifier blind to type / format | Separate type check + documented | `8faab14` |
| 7 | Capstone difficulty step | **Deferred to a pilot** — see below | — |

## Item 7 — open, deliberately

The guided days build one or two domains with a worked notebook open. Day 10 asks for six
domains end-to-end, no notebook, on four cases ABC-01 never exercised: real unit conversion,
interrupted dosing, a partial date, and the abnormal-lab boundary. A trainee has converted
zero units and handled zero partial dates before the graded attempt.

**Why nothing was changed.** Unlike items 1–6 this is not a verifiable defect. It is a claim
about a difficulty curve, and **no one has attempted the course yet**. Every available fix — a
warm-up exercise, graduated hints — is speculation. Acting now risks flattening a step that may
be exactly right; a capstone that only rehearses what you have already done is not an
assessment.

**Decide it with evidence from the first pilot. Watch for:**

1. **Where the first long stall happens.** Which domain, and is it the trap or the plumbing
   (paths, libnames, reading the dictionary)? A plumbing stall is a setup problem, not a
   difficulty problem, and has a completely different fix.
2. **Whether trainees find the traps or only find that a count is wrong.** `verify_capstone`
   says *which domain* differs, not *why*. If people know EX is wrong but cannot work out that
   it is the interruption, the gap is diagnosis, not difficulty.
3. **Unit conversion specifically** — the only trap requiring arithmetic the course never
   demonstrates. If this is where everyone stops, one worked conversion on Day 7 fixes it, and
   nothing else needs to change.
4. **Partial dates** — do they leave `AESTDY` null, or invent a day? Inventing one means the
   rule was read and not believed, which is a teaching problem in notebook 04, not a capstone
   problem.
5. **Time to first PASS on any domain.** If DM takes more than about an hour the whole day is
   mispaced regardless of the traps.
6. **Whether anyone gives up**, and at what point. That is the only measurement that settles
   whether the step is too big.

If the pilot shows the step is fine, delete this section. That is a legitimate outcome and the
most likely one.
