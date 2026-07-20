# Notebook 05 (SAS) — Build the AE Domain — Walkthrough

**Module:** Interventions & Events · **Run the code in:** `05_build_ae_domain_SAS.sas`
**Spec:** `../../data/mapping_specification.md` §4 and §4b
**Target:** `../../data/sdtm/ae.csv` + `../../data/sdtm/suppae.csv`

This is the hardest domain in the bootcamp. DM was one row per subject with no timing;
AE is **many rows per subject**, with mixed date formats, four controlled-terminology
mappings, a coded value to decode, and two derived variables DM never needed.

---

## What makes AE harder than DM

| | DM | AE |
|---|---|---|
| Rows per subject | exactly 1 | 0, 1 or many |
| `--SEQ` | none | **AESEQ**, derived per subject |
| `--DY` | none | **AESTDY / AEENDY**, derived from `RFSTDTC` |
| Date formats in one column | one | **two** |
| Coded source values | `SEX` | `AEOUT` |

Two of the eight subjects have **no** adverse events at all. That is normal and correct —
they appear in DM but not in AE.

---

## Section 0 — Reading the raw data

Every date is read as **character**. We convert them ourselves, because SAS cannot guess
which of the two formats a given value uses.

AE also needs `RFSTDTC` (first dose) to compute study day. That lives in DM, which got it
from EX — so we read EX and derive it the same way Notebook 04 did:

```sas
min(input(exstdtc, date11.)) as rfstdtc_n
```

> **`date11.`, not `date9.`** — `01-MAR-2024` is **11 characters**. SAS reads only as many
> characters as the informat width allows, so `date9.` would read `01-MAR-20` and hand you
> the year **2020**. Silent, and completely wrong. The informat width must cover the
> separators.

---

## Section 1 — The date parser (the hard part)

One column, two formats:

| Raw value | Format | Informat |
|---|---|---|
| `15/03/2024` | DD/MM/YYYY | `ddmmyy10.` |
| `10-Mar-2024` | DD-Mon-YYYY | `date11.` |

```sas
%macro parse_raw_date(src, out);
    if missing(&src) then &out = .;
    else if index(&src, "/") then &out = input(&src, ddmmyy10.);
    else                          &out = input(&src, date11.);
%mend;
```

We test each **value** for a slash and pick the informat accordingly.

> **Why not `ANYDTDTE`, which auto-detects?** Because `15/03/2024` is genuinely
> **ambiguous** — 15 March, or month 15? `ANYDTDTE` resolves that using the `DATESTYLE`
> system option, so the same program can give different answers on a differently
> configured machine. Explicit informats are safer and self-documenting. In our data
> `15/03/2024` is unambiguous only because the data dictionary tells us it is DD/MM.

**In ABC-01:** 5 events use `DD/MM/YYYY`, 5 use `DD-Mon-YYYY`.

---

## Section 2 — Building AE

### 2b — Dates out to ISO
```sas
if not missing(_stdt) then aestdtc = put(_stdt, yymmdd10.);
if not missing(_endt) then aeendtc = put(_endt, yymmdd10.);
```
Parse to a SAS date number, then format back out as ISO 8601 **character**. The `if not
missing` guard is what keeps ongoing events null — see below.

### 2c — Study day
```sas
if _stdt >= rfstdtc_n then aestdy = _stdt - rfstdtc_n + 1;
else                       aestdy = _stdt - rfstdtc_n;
```
**There is no Day 0.** On or after first dose, add 1; before it, don't. If your output
ever contains a 0, the `+ 1` is missing from one branch.

### 2d — Controlled Terminology, four different flavours

| Variable | Raw | Handling |
|---|---|---|
| `AESEV` | `moderate`, `Mild`, `severe` | `upcase(strip(...))` — free text, inconsistent case |
| `AESER` | `No`, `N`, `Yes` | explicit `IN` test → `N` / `Y` |
| `AEREL` | `Possibly related` | `upcase(strip(...))` — sponsor-defined codelist |
| `AEOUT` | `1`, `2`, `3` | **`SELECT` decode** — the CRF stores a number |

`AEOUT` is the one that catches people. The raw value is a **dropdown code**, not text:

```
1 → RECOVERED/RESOLVED          2 → RECOVERING/RESOLVING
3 → NOT RECOVERED/NOT RESOLVED  4 → FATAL           5 → UNKNOWN
```

Never pass the number through to SDTM.

### 2e — The dictionary term

```sas
select (strip(aeterm));
    when ("bad headache") aedecod = "Headache";
    ...
```

> ⚠️ **This lookup is ILLUSTRATIVE ONLY.** Real `AEDECOD` comes from **MedDRA** coding
> performed by trained coders against a licensed dictionary. You cannot derive it with a
> `SELECT` statement — we hard-code it purely so the exercise runs end to end.

`AETERM` keeps the verbatim text exactly as the investigator wrote it. Never tidy it.

---

## Section 3 — Deriving AESEQ

```sas
proc sort data = ae_work;
    by usubjid aestdtc aeterm;      /* deterministic! */
run;

data ae;
    set ae_work;
    by usubjid;
    retain aeseq;
    if first.usubjid then aeseq = 1;
    else                  aeseq + 1;
run;
```

Two things matter here:

1. **`first.usubjid` resets the counter.** `AESEQ` restarts at 1 for every subject — it is
   not a row number for the dataset. `by usubjid` is what creates `first.usubjid`.
2. **Sort deterministically.** We sort by start date *then term* so that two events on the
   same day always number the same way. Without a tiebreaker the same program can produce
   different `AESEQ` values on different runs, which shows up as spurious differences when
   anyone compares datasets.

Self-check: each subject's event count must equal their highest `AESEQ`.

---

## Section 4 — SUPPAE and the treatment-emergent flag

**You may never add a non-standard column to a standard domain.** `AETRTEM` is not an SDTM
AE variable, so it goes into a supplemental qualifiers dataset with a fixed generic shape:

| Variable | Value here | Meaning |
|---|---|---|
| `RDOMAIN` | `AE` | which domain this qualifies |
| `IDVAR` | `AESEQ` | how we point at the parent record |
| `IDVARVAL` | the AESEQ value | which record specifically |
| `QNAM` | `AETRTEM` | the qualifier's name |
| `QLABEL` | `Treatment Emergent Flag` | its label |
| `QVAL` | `Y` / `N` | the value |
| `QORIG` | `DERIVED` | where it came from |

**Treatment-emergent** means the event started **on or after first dose**. `AESTDY` already
encodes exactly that, so the derivation is simply `AESTDY >= 1`.

**In ABC-01: 9 × `Y`, 1 × `N`.** Look at subject `ABC-01-01-002`, who has both:

| `AESEQ` | `AETERM` | `AESTDTC` | `AESTDY` | `AETRTEM` |
|---|---|---|---|---|
| 1 | sore throat | 2024-02-28 | **−5** | **N** |
| 2 | mild dizziness | 2024-03-10 | 7 | **Y** |

One subject, one domain, opposite flags. The sore throat began five days *before* that
subject's first dose, so it cannot have been caused by the treatment — and note it is also
`AEREL = NOT RELATED`, which is the investigator saying the same thing independently.

> **Why events exist before Day 1 at all.** Adverse events are collected from **informed
> consent** onward, not from first dose. Subject 01-002 consented on 22-Feb and first dosed
> on 04-Mar, so anything in that 11-day screening window is legitimately collected and
> legitimately non-treatment-emergent. Safety summaries are normally restricted to
> treatment-emergent events, and `AETRTEM` is what makes that filter possible.

---

## Section 5 — Checking your work

| Check | Expected |
|---|---|
| Row count | 10 |
| `USUBJID` + `AESEQ` unique | yes |
| Any `AESTDY` = 0 | **none** |
| Ongoing events (null `AEENDTC`) | **2** — Nausea and fatigue |
| `AETRTEM` | **9 `Y`, 1 `N`** |
| `AESTDY` range | **−5 to 20** |
| Coded values | all CT terms, no raw `1`/`2`/`3` left |
| SUPPAE orphans | 0 |

---

## The shape of the finished domain

```
USUBJID        SEQ TERM                    DECOD              SEV      SER OUT                        STDY ENDY
ABC-01-01-001   1  bad headache            Headache           MODERATE N   RECOVERED/RESOLVED           15   16
ABC-01-01-001   2  Nausea                  Nausea             MILD     N   NOT RECOVERED/NOT RESOLVED   20    .
ABC-01-01-002   1  sore throat             Oropharyngeal pain MILD     N   RECOVERED/RESOLVED           -5   -2
ABC-01-01-004   2  worsening hypertension  Hypertension       SEVERE   Y   RECOVERED/RESOLVED           17   20
```

Note `sore throat` → `Oropharyngeal pain`: the verbatim and coded terms share **no words**.
No string-manipulation rule would ever produce it — a coder looked it up in MedDRA. Same
lesson as `White Blood Cells` → `Leukocytes` in LB.

That third row is the study's one **serious** event — trace it into `sdtm/ds.csv` and you
will find the same subject discontinued for `ADVERSE EVENT` on 2024-03-25.

---

## Exercises
Six tasks at the bottom of the `.sas` file. Solutions:
`../../answer-keys/05_build_ae_answers.md`.
