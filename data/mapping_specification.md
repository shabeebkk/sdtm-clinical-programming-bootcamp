# SDTM Mapping Specification — Study ABC-01 (synthetic)

> **All data is synthetic.** This document specifies how the raw (EDC-style) CSVs in
> `/data` map to the SDTM datasets in `/data/sdtm`. It is the worked example for the
> bootcamp: **raw in, SDTM out, every rule written down.**
>
> Structured to follow **SDTMIG v3.3**. Two standing caveats, both flagged again where
> they apply:
> - ⚠️ **Core designations** (Req/Exp/Perm) below follow SDTMIG v3.3. Always verify
>   against the IG domain tables for a real study — they change between versions.
> - ⚠️ **Dictionary coding is illustrative.** Real `AEDECOD` requires licensed **MedDRA**;
>   real `CMDECOD` requires licensed **WHODrug**. The coded values here are plausible
>   stand-ins so the exercise is runnable — they are *not* authoritative dictionary output.

## Files

| Raw (input) | → | SDTM (output) | Rows |
|---|---|---|---|
| `dm_raw.csv` + `ex_raw.csv` + `ds_raw.csv` | → | `sdtm/dm.csv` | 8 |
| `dm_raw.csv` + `ds_raw.csv` | → | `sdtm/ds.csv` | 24 |
| `ex_raw.csv` | → | `sdtm/ex.csv` | 8 |
| `ae_raw.csv` | → | `sdtm/ae.csv` | 10 |
| `sdtm/ae.csv` (derived) | → | `sdtm/suppae.csv` | 10 |
| `cm_raw.csv` | → | `sdtm/cm.csv` | 8 |
| `vs_raw.csv` (wide, 24 rows) | → | `sdtm/vs.csv` (tall) | 128 |
| `lb_raw.csv` | → | `sdtm/lb.csv` | 48 |

Regenerate everything with `python3 build_sdtm_reference.py`.

---

# 1. Global conventions

These apply to **every** domain. Get them right once and most of the mapping follows.

### 1.1 USUBJID — Unique Subject Identifier
`SUBJID` in the raw data is unique only **within a site** (subject `001` exists at both
site 01 and site 02 — different people). SDTM requires an identifier unique across the
whole study, identical for that subject in every domain.

```
USUBJID = STUDYID || "-" || SITEID || "-" || SUBJID
        = "ABC-01" + "-" + "01" + "-" + "001"   →   ABC-01-01-001
```
Keep `SITEID`/`SUBJID` as **character** when reading, or leading zeros are lost
(`001` → `1`). Core: **Required**.

### 1.2 Dates — ISO 8601
All SDTM date variables end in `DTC` and are **character** in ISO 8601 format
`YYYY-MM-DD`. The raw files use mixed formats:

**No raw date is ISO.** Every one must be converted.

| Raw format | Where | Example | → ISO |
|---|---|---|---|
| `DD-MMM-YYYY` (the CRF standard) | dm, ds, ex, vs, lb | `14-MAY-1969` | `1969-05-14` |
| `DD/MM/YYYY` | ae, cm | `15/03/2024` | `2024-03-15` |
| `DD-Mon-YYYY` | ae, cm | `10-Mar-2024` | `2024-03-10` |

Parse with `date9.` (SAS) or `as.Date(x, "%d-%b-%Y")` (R). **Watch out:** `DD-MMM-YYYY`
text does *not* sort chronologically, so convert to a real date **before** taking a
`min()`/`max()` — for example when deriving `RFSTDTC` from several dosing records.

A blank end date means **ongoing** — leave the SDTM value null. Never invent a date.

### 1.3 `--SEQ` — Sequence Number
Numbers a subject's records **within a domain** so every row is uniquely identifiable.
`USUBJID + --SEQ` must be unique. Assign sequentially (1, 2, 3 …) per subject after
sorting the rows into a deterministic order. Core: **Required**.

Sort orders used here: AE/CM by start date then term; VS/LB by visit then test order.

### 1.4 `--DY` — Study Day
Study day is relative to the **reference start date** `RFSTDTC` (in DM), which for this
study is the **date of first dose** (from EX).

```
if  --DTC >= RFSTDTC :   --DY = (--DTC − RFSTDTC) + 1
if  --DTC <  RFSTDTC :   --DY = (--DTC − RFSTDTC)        ← negative
```
**There is no Day 0.** Day 1 is the day of first dose; the day before is Day −1.
Core: **Permissible** (but almost always included).

### 1.5 Controlled Terminology
Coded variables must draw from the CDISC codelist exactly — right spelling, right case.
Free text is trimmed and normalised before lookup (the raw `RACE` has mixed case and a
trailing space).

---

# 2. DM — Demographics
**Structure:** one row per subject. Special Purpose domain (no `--SEQ`).

| SDTM variable | Core | Source | Derivation / rule |
|---|---|---|---|
| `STUDYID` | Req | `STUDYID` | Constant `ABC-01` |
| `DOMAIN` | Req | — | Literal `"DM"` |
| `USUBJID` | Req | `SITEID`,`SUBJID` | See §1.1 |
| `SUBJID` | Req | `SUBJID` | As collected (site-local id) |
| `SITEID` | Req | `SITEID` | As collected |
| `RFSTDTC` | Exp | `ex_raw.EXSTDTC` | **First dose date.** Drives all `--DY` |
| `RFENDTC` | Exp | `ex_raw.EXENDTC` | Last dose date |
| `RFXSTDTC` | Exp | `ex_raw.EXSTDTC` | First study-treatment exposure |
| `RFXENDTC` | Exp | `ex_raw.EXENDTC` | Last study-treatment exposure |
| `RFICDTC` | Exp | `RFICDTC` | Informed consent date → ISO. **Also becomes a DS protocol milestone** |
| `RFPENDTC` | Exp | `ds_raw.EOSDT` | End of participation — from the **Disposition** form, not demographics |
| `DTHDTC` | Exp | — | Null — no deaths in this study |
| `DTHFL` | Exp | — | Null — no deaths in this study |
| `AGE` | Exp | `BRTHDTC`,`RFICDTC` | **Derived:** completed years from birth date to informed consent |
| `AGEU` | Exp | — | Literal `"YEARS"` |
| `SEX` | Req | `SEX` | CT: `1`→`M`, `2`→`F` |
| `RACE` | Exp | `RACE` | Trim + upper-case → CT (see below) |
| `ETHNIC` | Perm | `ETHNIC` | Upper-case → CT |
| `ARMCD` | Req | `ARM` | `Drug A`→`A`, `Placebo`→`P` (≤20 chars, no spaces) |
| `ARM` | Req | `ARM` | As collected (`Drug A` / `Placebo`) |
| `ACTARMCD` | Req | `ARM` | Actual arm = planned arm here (nobody mis-dosed) |
| `ACTARM` | Req | `ARM` | As above |
| `COUNTRY` | Req | `COUNTRY` | Already ISO 3166-1 alpha-3 (`USA`,`JPN`,`GBR`) |

**RACE controlled terminology**
| Raw value | → SDTM |
|---|---|
| `White`, `White ` (trailing space) | `WHITE` |
| `Asian`, `asian` | `ASIAN` |
| `black or african american`, `Black or African American` | `BLACK OR AFRICAN AMERICAN` |

> **Teaching point — AGE is derived, not collected.** The raw file has a birth date. Age
> is completed years at a defined reference (here, informed consent). Watch the birthday
> edge case: born 1969-05-14, consented 2024-02-20 → **54**, not 55.

---

# 2b. DS — Disposition
**Structure:** one row per disposition record per subject (3 each here = 24 rows).
Events class.

DS holds two different kinds of record, distinguished by `DSCAT`:

| `DSCAT` | What it records | Our records |
|---|---|---|
| `PROTOCOL MILESTONE` | Planned checkpoints every subject passes | Informed consent obtained · Randomized |
| `DISPOSITION EVENT` | How the subject left the study | Completed · or the reason for discontinuation |

| SDTM variable | Core | Source | Derivation / rule |
|---|---|---|---|
| `STUDYID`,`DOMAIN` | Req | — | `ABC-01`, `"DS"` |
| `USUBJID` | Req | `SITEID`,`SUBJID` | §1.1 |
| `DSSEQ` | Req | derived | §1.3, ordered by date then category |
| `DSTERM` | Req | various | Verbatim/descriptive term (e.g. `Discontinued: Adverse event`) |
| `DSDECOD` | Req | various | Standardized term → CT (see below) |
| `DSCAT` | Perm | derived | `PROTOCOL MILESTONE` or `DISPOSITION EVENT` |
| `DSSTDTC` | Exp | see below | → ISO |
| `DSSTDY` | Perm | derived | §1.4 |

**Record-by-record sources**
| Record | `DSDECOD` | `DSCAT` | `DSSTDTC` from |
|---|---|---|---|
| Informed consent | `INFORMED CONSENT OBTAINED` | PROTOCOL MILESTONE | `dm_raw.RFICDTC` |
| Randomization | `RANDOMIZED` | PROTOCOL MILESTONE | `dm_raw.RANDDTC` |
| End of study | `COMPLETED`, or the reason (`ADVERSE EVENT`) | DISPOSITION EVENT | `ds_raw.EOSDT` |

**Value-level mappings**
| Raw | → SDTM |
|---|---|
| `EOSSTAT = "Completed"` | `DSDECOD = COMPLETED` |
| `EOSSTAT = "Discontinued"` + `EOSREAS = "Adverse event"` | `DSDECOD = ADVERSE EVENT` |

> **Teaching point — why consent appears twice.** The consent date is both a **DM
> variable** (`RFICDTC`) and a **DS protocol milestone**. That is not duplication by
> mistake: DM records subject-level reference dates, while DS records the study
> milestones as dated events. Both are expected in a real submission.

> **Teaching point — end of study is not demographics.** `EOSSTAT`/`EOSDT` come from a
> separate Disposition CRF completed when the subject leaves the study, months after the
> demographics form was filled in at screening. Keeping them in separate raw datasets
> mirrors how the data is actually collected.

---

# 3. EX — Exposure
**Structure:** one row per subject per dosing period. Interventions class.

| SDTM variable | Core | Source | Derivation / rule |
|---|---|---|---|
| `STUDYID`,`DOMAIN` | Req | — | `ABC-01`, `"EX"` |
| `USUBJID` | Req | `SITEID`,`SUBJID` | §1.1 |
| `EXSEQ` | Req | — | 1 (single dosing period per subject) |
| `EXTRT` | Req | `EXTRT` | Treatment name (`Drug A` / `Placebo`) |
| `EXDOSE` | Exp | `EXDOSE` | Numeric dose (`50`, or `0` for placebo) |
| `EXDOSU` | Exp | `EXDOSU` | `mg` |
| `EXDOSFRQ` | Perm | `EXFREQ` | As collected (`QD`). **Note the rename:** raw `EXFREQ` → SDTM `EXDOSFRQ` |
| `EXROUTE` | Perm | `EXROUTE` | `ORAL` |
| `EXSTDTC` | Exp | `EXSTDTC` | → ISO |
| `EXENDTC` | Perm | `EXENDTC` | → ISO |
| `EXSTDY` | Perm | derived | §1.4 — always `1` (first dose defines Day 1) |
| `EXENDY` | Perm | derived | §1.4 |

> **Teaching point.** `EXSTDY = 1` for every subject is a useful self-check: if it isn't,
> your `RFSTDTC` or your study-day formula is wrong.

> **Three fields are collected but never submitted.** `EXINTP` (below), `ds_raw.EOSOTH`
> (the "If Other, specify" box — feeds the verbatim `DSTERM` when the reason is Other), and
> `vs_raw.VSND` ("were any assessments not performed?" — a `Y` would drive `VSSTAT = NOT DONE`
> and `VSREASND`). All three are blank/constant in ABC-01. **A field existing on the CRF does
> not guarantee it becomes an SDTM variable** — but it must still exist in the extract.

> **Teaching point — collected but not submitted.** `EXINTP` ("was dosing interrupted or
> modified?") is on the CRF but is **not** an SDTM variable. It controls the *structure* of
> the output: a subject answering `Y` needs one EX record per continuous dosing period
> (`EXSEQ` 1, 2, 3…), splitting on the interruption. Every subject here answered `N`, so
> each gets a single record. Not every collected field becomes a variable — some decide
> how many rows you create.

---

# 4. AE — Adverse Events
**Structure:** one row per event per subject. Events class.

| SDTM variable | Core | Source | Derivation / rule |
|---|---|---|---|
| `STUDYID`,`DOMAIN` | Req | — | `ABC-01`, `"AE"` |
| `USUBJID` | Req | `SITEID`,`SUBJID` | §1.1 |
| `AESEQ` | Req | derived | §1.3, ordered by start date then term |
| `AETERM` | Req | `AETERM` | **Verbatim, exactly as reported** — never cleaned |
| `AEDECOD` | Req | `AETERM` | ⚠️ Dictionary-derived preferred term (**MedDRA** in reality) |
| `AESEV` | Perm | `AESEV` | Upper-case → CT `MILD`/`MODERATE`/`SEVERE` |
| `AESER` | Exp | `AESER` | `No`/`N`→`N`, `Yes`→`Y` |
| `AEREL` | Exp | `AEREL` | Upper-cased. ⚠️ `AEREL` codelist is commonly **sponsor-defined** |
| `AEOUT` | Perm | `AEOUT` | **Numeric code (1-5) → CT term.** Do not pass the code through |
| `AESTDTC` | Exp | `AESTDT` | Mixed formats → ISO |
| `AEENDTC` | Perm | `AEENDT` | → ISO; **blank = ongoing, leave null** |
| `AESTDY`,`AEENDY` | Perm | derived | §1.4 |

**Value-level mappings**
| Raw | → SDTM | Variable |
|---|---|---|
| `bad headache` | `Headache` | `AEDECOD` (verbatim kept in `AETERM`) |
| `moderate`, `Moderate` | `MODERATE` | `AESEV` |
| `No`, `N` | `N` | `AESER` |
| `1` | `RECOVERED/RESOLVED` | `AEOUT` |
| `2` | `RECOVERING/RESOLVING` | `AEOUT` |
| `3` | `NOT RECOVERED/NOT RESOLVED` | `AEOUT` |
| `4` | `FATAL` | `AEOUT` |
| `5` | `UNKNOWN` | `AEOUT` |

> **Teaching point — keep both terms.** `AETERM` preserves what the investigator wrote
> ("bad headache"); `AEDECOD` carries the standardized term ("Headache"). SDTM never
> throws away the original.

---

# 4b. SUPPAE — Supplemental Qualifiers for AE
**Structure:** one row per qualifier value per parent record. Not a domain in its own
right — a companion to AE.

### Why SUPPQUAL exists
You may **never add a non-standard column to a standard domain.** If a study collects or
derives something SDTM has no variable for, it goes into a `SUPP--` dataset, which has a
fixed generic shape:

| Variable | Meaning |
|---|---|
| `RDOMAIN` | The related domain — `AE` |
| `IDVAR` | The variable identifying the parent record — `AESEQ` |
| `IDVARVAL` | That variable's value |
| `QNAM` | The qualifier's short name — `AETRTEM` |
| `QLABEL` | Its label — `Treatment Emergent Flag` |
| `QVAL` | The value — `Y` / `N` |
| `QORIG` | Where it came from — `DERIVED` |
| `QEVAL` | Who assessed it (blank when derived, not assessed) |

`USUBJID` + `RDOMAIN` + `IDVAR` + `IDVARVAL` is what joins a SUPP row back to its parent.

### AETRTEM — Treatment Emergent Flag
| Rule | |
|---|---|
| Definition | An AE is **treatment-emergent** if it started **on or after the first dose** of study treatment |
| Derivation | `AESTDY >= 1`  →  `Y`, otherwise `N` |
| Source | Derived from `AE.AESTDTC` and `DM.RFXSTDTC` |
| `QORIG` | `DERIVED` |

> **Teaching point — why the flag matters.** Adverse events are collected from **informed
> consent** onward, so a study can contain events that began during screening, before any
> drug was taken. Those cannot have been caused by the treatment, so safety summaries are
> normally restricted to treatment-emergent events. The flag is what makes that filter
> possible.

**In ABC-01: 9 × `Y` and 1 × `N`.** The single `N` is subject `ABC-01-01-002`'s *sore throat*,
which started on 2024-02-28 — five days before that subject's first dose, so `AESTDY = −5`.

That subject is deliberately the one to look at, because they have **both**:

| `AESEQ` | `AETERM` | `AESTDTC` | `AESTDY` | `AETRTEM` |
|---|---|---|---|---|
| 1 | sore throat | 2024-02-28 | **−5** | **N** |
| 2 | mild dizziness | 2024-03-10 | 7 | **Y** |

Same subject, same domain, opposite flags — which is the clearest way to see that the flag
depends on *timing relative to first dose*, not on the event itself. Note the screening event
is also `AEREL = NOT RELATED`: an event that predates the first dose cannot have been caused
by it.

---

# 5. CM — Concomitant Medications
**Structure:** one row per medication per subject. Interventions class.

| SDTM variable | Core | Source | Derivation / rule |
|---|---|---|---|
| `STUDYID`,`DOMAIN` | Req | — | `ABC-01`, `"CM"` |
| `USUBJID` | Req | `SITEID`,`SUBJID` | §1.1 |
| `CMSEQ` | Req | derived | §1.3 |
| `CMTRT` | Req | `CMTRT` | **Verbatim** medication name |
| `CMDECOD` | Perm | `CMTRT` | ⚠️ Dictionary term (**WHODrug** in reality) |
| `CMINDC` | Perm | `CMINDC` | Indication, as collected |
| `CMDOSE` | Perm | `CMDOSE` | Numeric dose |
| `CMDOSU` | Perm | `CMDOSU` | `mg`, `IU`, `%` |
| `CMDOSFRQ` | Perm | `CMFREQ` | **Note the rename:** raw `CMFREQ` → SDTM `CMDOSFRQ` (`QD`,`BID`,`PRN`) |
| `CMROUTE` | Perm | `CMROUTE` | `ORAL`, `TOPICAL` |
| `CMSTDTC` | Exp | `CMSTDT` | Mixed formats → ISO |
| `CMENDTC` | Perm | `CMENDT` | → ISO; blank = ongoing |
| `CMSTDY`,`CMENDY` | Perm | derived | §1.4 — **negative for meds started before first dose** |

> **Teaching point.** Metformin started 2023-12-10 and first dose was 2024-03-15, so
> `CMSTDY = −96`. Negative study days are correct and expected for prior medications.

---

# 6. VS — Vital Signs  *(the wide → tall transpose)*
**Structure:** one row per **test result**. Findings class. This is the biggest
structural change in the whole example.

Raw is **wide** — one row per subject per visit, one *column* per measurement:
```
SUBJID VISIT      SYSBP DIABP PULSE TEMP HEIGHT WEIGHT
001    SCREENING   122    80    68  36.7   165    70.5
```
SDTM is **tall** — one row per measurement, the test named in `VSTESTCD`/`VSTEST`:
```
USUBJID        VSTESTCD VSTEST                     VSORRES VSORRESU
ABC-01-01-001  SYSBP    Systolic Blood Pressure    122     mmHg
ABC-01-01-001  DIABP    Diastolic Blood Pressure   80      mmHg
...
```

| SDTM variable | Core | Source | Derivation / rule |
|---|---|---|---|
| `STUDYID`,`DOMAIN` | Req | — | `ABC-01`, `"VS"` |
| `USUBJID` | Req | `SITEID`,`SUBJID` | §1.1 |
| `VSSEQ` | Req | derived | §1.3, ordered by visit then test |
| `VSTESTCD` | Req | column name | `SYSBP`,`DIABP`,`PULSE`,`TEMP`,`HEIGHT`,`WEIGHT` (CT) |
| `VSTEST` | Req | column name | Long name from CT (e.g. `Systolic Blood Pressure`) |
| `VSORRES` | Exp | cell value | Result **as collected** (character) |
| `VSORRESU` | Exp | protocol | Unit of the original result (`mmHg`,`beats/min`,`C`,`cm`,`kg`) |
| `VSSTRESC` | Exp | `VSORRES` | Standardized result, character |
| `VSSTRESN` | Exp | `VSORRES` | Standardized result, **numeric** |
| `VSSTRESU` | Exp | `VSORRESU` | Standardized unit — **no conversion needed here** (collected units are already standard) |
| `VSBLFL` | Perm | derived | `Y` on the last assessment **on or before** first dose, per subject **per test** — see baseline rules below |
| `VISITNUM` | Exp | `VISIT` | `SCREENING`=1, `BASELINE`=2, `WEEK 4`=4 |
| `VISIT` | Perm | `VISIT` | As collected |
| `VSDTC` | Exp | `VSDT` | → ISO |
| `VSDY` | Perm | derived | §1.4 |

**Transpose rules**
- Skip empty cells — do **not** create a row. `HEIGHT` is collected only at SCREENING,
  so it produces 8 rows in total, not 24.
- Row count: 8 subjects × (6 tests at screening + 5 at baseline + 5 at week 4) = **128**.

**Baseline flag rules (`VSBLFL`)** — three conditions, all required:
1. **On or before first dose**, i.e. `VSDY <= 1` — *not* `< 1`. The BASELINE visit occurs on
   Day 1 and its vitals are taken **pre-dose**, so Day 1 records are eligible. Using `< 1`
   silently excludes BASELINE and flags SCREENING instead.
   *Note:* the CRF collects a date but no time, so the pre-dose ordering comes from the
   protocol's visit schedule, not from the data.
2. **The latest** such record, per subject **per test** — both SCREENING and BASELINE precede
   first dose, but only the last one is flagged.
3. **The test must have at least one post-dose result.** A baseline exists to anchor a
   change-from-baseline analysis; a test measured once has nothing to anchor. This excludes
   `HEIGHT`, giving **40** flagged records (8 subjects × 5 repeated tests), not 48.

> ⚠️ **Condition 3 is sponsor-dependent.** SDTMIG defines `--BLFL` as the baseline indicator
> but does not settle whether a single, never-repeated measurement is its own baseline. Some
> sponsors would flag it and report 48. **This study specifies the rule above**; do not carry
> the choice to another study without checking its spec.

Values are `Y` or **null**. There is no `"N"` — a populated `"N"` is a conformance finding.
The same three rules and the same `Y`-or-null convention apply to `LBBLFL`.

> **Teaching point.** Adding a new measurement to a Findings domain adds *rows*, never
> columns. That is why this structure scales to any panel of tests.

---

# 7. LB — Laboratory
**Structure:** one row per test per visit. Findings class (raw is already tall).

| SDTM variable | Core | Source | Derivation / rule |
|---|---|---|---|
| `STUDYID`,`DOMAIN` | Req | — | `ABC-01`, `"LB"` |
| `USUBJID` | Req | `SITEID`,`SUBJID` | §1.1 |
| `LBSEQ` | Req | derived | §1.3 |
| `LBTESTCD` | Req | `LBTEST` | CT short code (see below) |
| `LBTEST` | Req | `LBTEST` | CT long name — **note `White Blood Cells` → `Leukocytes`** |
| `LBCAT` | Perm | `LBTEST` | `HEMATOLOGY` or `CHEMISTRY` |
| `LBORRES` | Exp | `LBORRES` | Result as collected |
| `LBORRESU` | Exp | `LBORRESU` | Original unit |
| `LBORNRLO`/`LBORNRHI` | Perm | as collected | Original reference range |
| `LBSTRESC` | Exp | `LBORRES` | Standardized, character |
| `LBSTRESN` | Exp | `LBORRES` | Standardized, numeric |
| `LBSTRESU` | Exp | `LBORRESU` | ⚠️ **No conversion in this study** — collected units are already the standard units. In real studies sites report different units and you must convert (e.g. creatinine mg/dL → µmol/L × 88.42) |
| `LBSTNRLO`/`LBSTNRHI` | Perm | as collected | Reference range in standard units |
| `LBNRIND` | Perm | derived | `LOW` if result < low, `HIGH` if > high, else `NORMAL` |
| `LBBLFL` | Perm | `VISIT` | `Y` at `BASELINE` |
| `VISITNUM`,`VISIT` | Exp/Perm | `VISIT` | `BASELINE`=2, `WEEK 4`=4 |
| `LBDTC` | Exp | `LBDT` | → ISO |
| `LBDY` | Perm | derived | §1.4 |

**Test controlled terminology**
| Raw `LBTEST` | `LBTESTCD` | `LBTEST` (CT) | `LBCAT` |
|---|---|---|---|
| Hemoglobin | `HGB` | Hemoglobin | HEMATOLOGY |
| Hematocrit | `HCT` | Hematocrit | HEMATOLOGY |
| White Blood Cells | `WBC` | **Leukocytes** | HEMATOLOGY |
| Platelets | `PLAT` | Platelets | HEMATOLOGY |
| Alanine Aminotransferase | `ALT` | Alanine Aminotransferase | CHEMISTRY |
| Creatinine | `CREAT` | Creatinine | CHEMISTRY |

> **Teaching point.** The collected name is not always the CT name. "White Blood Cells"
> is coded `WBC` with the CT test name **Leukocytes** — you must look values up, not
> assume them. One deliberate abnormal result exists: subject `ABC-01-01-003` at Week 4
> has ALT 72 U/L against a 7–56 range → `LBNRIND = HIGH`.

---

# 8. Worked example — one subject end to end

Subject **site 01 / subject 001** → `USUBJID = ABC-01-01-001`, Drug A, female, born 1969-05-14,
consented 2024-02-20, first dose 2024-03-01.

**DM** (1 row)
```
USUBJID=ABC-01-01-001  AGE=54  SEX=F  RACE=WHITE  ARMCD=A  ARM=Drug A
RFSTDTC=2024-03-01  RFICDTC=2024-02-20  COUNTRY=USA
```

**EX** (1 row) — `EXTRT=Drug A, EXDOSE=50 mg, EXSTDTC=2024-03-01, EXSTDY=1`

**AE** (2 rows)
```
AESEQ=1  AETERM="bad headache"  AEDECOD=Headache  AESEV=MODERATE  AESER=N
         AESTDTC=2024-03-15  AEENDTC=2024-03-16  AESTDY=15  AEOUT=RECOVERED/RESOLVED
AESEQ=2  AETERM="Nausea"       AEDECOD=Nausea    AESEV=MILD      AESER=N
         AESTDTC=2024-03-20  AEENDTC=(null)      AESTDY=20  AEOUT=NOT RECOVERED/NOT RESOLVED
```
Note the ongoing event: `AEENDTC` and `AEENDY` stay null.

**VS** — 16 rows (6 at screening incl. height, 5 at baseline, 5 at week 4). The screening
systolic BP becomes:
```
VSSEQ=1  VSTESTCD=SYSBP  VSTEST=Systolic Blood Pressure  VSORRES=122  VSORRESU=mmHg
         VISIT=SCREENING  VSDTC=2024-02-20  VSDY=-10  VSBLFL=(null)
```
`VSDY = −10` because screening was 10 days before first dose — and there is no Day 0.

---

# 9. How to check your work

Run these against your own output; the reference datasets pass all of them.

| Check | Expected |
|---|---|
| `USUBJID` unique in DM | 8 rows, 8 distinct |
| `USUBJID` + `--SEQ` unique | true in every domain |
| Any `--DY` equal to 0 | **none** (there is no Day 0) |
| `EXSTDY` | `1` for every subject |
| All `*DTC` values | match `YYYY-MM-DD` |
| SCREENING `VSDY` | negative |
| BASELINE `VSDY` | `1` |
| `HEIGHT` records | SCREENING only (8 rows) |
| VS row count | 128 |
| `LBNRIND = HIGH` | exactly 1 (subject `ABC-01-01-003`, Week 4, ALT) |
| Ongoing AEs with null `AEENDTC` | 2 |

---

## Summary of flagged uncertainties
1. **Core designations** follow SDTMIG v3.3 — verify against the IG for real work.
2. **`AEDECOD` / `CMDECOD`** are illustrative; real coding needs licensed MedDRA / WHODrug.
3. **`AEREL`** codelist is commonly sponsor-defined rather than fixed CDISC CT.
4. **LB standard units** equal original units *in this study only*; real studies usually
   require unit conversion into `--STRESU`.
