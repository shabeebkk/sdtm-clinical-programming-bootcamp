# Notebook 18 (SAS) — Build ADTTE — Walkthrough

**Module:** Time-to-Event Data · **Run the code in:** `18_build_adtte_SAS.sas`
**Spec:** `../../data/adam_specification.md` §5 · **Target:** `../../data/adam/adtte.csv`

ADTTE answers a question none of the other datasets can. ADAE says *whether* an event happened.
ADTTE says **how long until it did** — and, crucially, what to do about the subjects it never
happened to.

Structure: **one row per subject per parameter**. Every safety subject gets a row, event or not.

---

## Built on ADaM, not on SDTM

Read the input step again: this notebook reads `adam/adsl.csv` and `adam/adae.csv`. Not `AE`.

ADTTE sits on top of ADAE, which sits on top of AE. Each layer trusts the one below it, and each
derivation lives in exactly one place. That is why `TRTEMFL` was read from SUPPAE rather than
recomputed in Notebook 15 — so that here, three layers up, "treatment-emergent" still means the
one thing the study documented.

---

## Section 1 — The first event was already found

```sas
where aoccfl = 'Y';           /* one row per subject, by construction */
```

`AOCCFL` marks the first treatment-emergent event per subject. A time-to-**first**-event analysis
needs exactly that, so no new derivation is required.

That is not a happy accident. `AOCCFL` was built in Notebook 15 with a deterministic sort —
`ASTDT` then `AESEQ` — precisely so that *"the first event"* means the same thing in every program
that asks for it. Exercise 5 of Notebook 15 argued this mattered; here is the payoff.

Note also the code assigns `ev_dt` and `ev_term` rather than using `RENAME`. `RENAME` onto a name
that already exists in the step is only a **warning** in SAS: it keeps the original value and
strands the derived one. That bug cost this course an entire domain once — see
`TROUBLESHOOTING.md`. Plain assignment cannot fail that way.

---

## Section 2 — Event or censored

### `CNSR` runs backwards

| Value | Meaning |
|---|---|
| **0** | the event **happened** |
| **1** | **censored** — the event had not happened when we stopped looking |

Everywhere else in ADaM, `1` and `'Y'` mean *"yes, this is true"*. `CNSR` is the exception. It is
defined this way in the ADaM TTE spec because the value is used arithmetically downstream. Read
it twice, every time.

### Censored subjects must be kept

```sas
if a and saffl = 'Y';         /* the SAFETY population defines the rows */
```

Two subjects — `ABC-01-01-003` and `ABC-01-02-004` — had no treatment-emergent event at all. They
get a row, censored at last dose.

Drop them and the dataset answers *"how fast did events happen among people who had events"* — a
question nobody asked, and one whose answer is always more alarming than the truth. In ABC-01 the
gap is large: see the walkthrough of Exercise 2 below.

**A censored row is not missing data.** It is a positive statement: *this subject was followed for
28 days and the event did not occur.* That information is what makes the estimate honest.

### `CNSDTDSC` explains *why* we stopped looking

Populated on censored records only. An event needs no explanation — we stopped looking because it
happened. A censored record does: was the subject lost to follow-up, did they complete, did the
study end? `CNSR` alone cannot distinguish those, and they have different implications. Exercise 4
asks you to name two more censoring reasons a real study needs.

---

## Section 4 — What censoring actually does

```sas
proc lifetest data = adtte plots = none;
    time aval * cnsr(1);
    strata trtp;
run;
```

The `(1)` tells SAS **which value means censored**. Get it wrong — write `cnsr(0)` — and every
event becomes censored and every censored subject becomes an event. It runs without error and
produces a curve that is exactly backwards. Exercise 1 makes you do it.

### The Kaplan-Meier estimate for ABC-01

Combined, all 8 subjects:

| Time (days) | At risk | Events | S(t) |
|---|---|---|---|
| 5 | 8 | 1 | 0.8750 |
| 7 | 7 | 1 | 0.7500 |
| 9 | 6 | 1 | 0.6250 |
| **12** | 5 | 1 | **0.5000** |
| 13 | 4 | 1 | 0.3750 |
| 15 | 3 | 1 | 0.2500 |

**Median time to first TEAE: 12 days.** By arm: Drug A **12 days**, Placebo **9 days**.

Watch what the two censored subjects do. Both were followed to day 28 without an event, so they
sit in the **risk set** — the "At risk" column — for the whole table, making each event a smaller
proportional drop. Then at day 28 they leave without causing a drop at all. That is the entire
mechanism: censored subjects contribute the information they have (they survived event-free this
long) and nothing they do not (what would have happened later).

---

## What you built

| | |
|---|---|
| Rows | **8** — one per safety subject |
| Events (`CNSR = 0`) | 6 |
| Censored (`CNSR = 1`) | 2, both at last dose |
| KM median, all subjects | 12 days |

If you got **6** rows, you dropped the censored subjects. Go back to section 2 — that is the
mistake this whole notebook exists to prevent.

Next: **Notebook 19**, which is deliberately short, and which is the reason for all of this.
