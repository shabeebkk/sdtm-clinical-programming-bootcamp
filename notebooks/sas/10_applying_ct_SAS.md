# Notebook 10 (SAS) — Applying Controlled Terminology — Walkthrough

**Module:** Controlled Terminology · **Run the code in:** `10_applying_ct_SAS.sas`
**Deck:** `../../presentations/08_controlled_terminology.pptx`
**Spec:** `../../data/mapping_specification.md` §1.5

This notebook builds **no new domain**. It changes *how* you apply CT — from a hard-coded
`SELECT` block to a **data-driven, fail-loud** approach that scales from 6 values to 600.

---

## Why change what already works?

Every mapping you have written since Day 4 looks like this:

```sas
select (strip(aeout));
    when ("1") aeout_c = "RECOVERED/RESOLVED";
    ...
    otherwise  aeout_c = "";          /* <-- silent */
end;
```

That is fine for a teaching dataset. It has two problems in a real study:

1. **It does not scale.** A lab-test codelist has hundreds of entries. Nobody can read, review
   or diff a `SELECT` block that long.
2. **It fails silently.** The `otherwise` branch turns anything unexpected into a blank, and the
   program reports success. A dataset that quietly dropped a value looks *cleaner* than one that
   flagged a problem — which is exactly backwards.

---

## Section 1 — The mapping as **data**

```sas
data ct_map;
    length fmtname $10 start $40 label $40;
    ...
    datalines;
sexmap|1|M
sevmap|MILD|MILD
outmap|1|RECOVERED/RESOLVED
...
```

The whole idea of the notebook is here: **the mapping is a dataset, not code.** One row per raw
value, three columns:

| Column | Meaning |
|---|---|
| `FMTNAME` | which format this row belongs to |
| `START` | the raw value (upper-cased, so lookup is case-blind) |
| `LABEL` | the SDTM submission value |

A table like this can be **printed, reviewed by a data manager, diffed between CT releases,
attached to the spec, and signed off**. A `SELECT` block can be none of those things. In a real
study you would *read* it from the NCI-EVS download plus a study mapping sheet — the shape is
identical.

### The catch-all row and `HLO`

```sas
if last.fmtname then do;
    hlo   = "O";              /* O = Other: the catch-all */
    label = "!!UNMAPPED!!";
    output;
end;
```

`HLO` ("High, Low, Other") is a **`PROC FORMAT` CNTLIN convention**, not something you invent. A
row with `HLO = "O"` is the catch-all, and its `LABEL` is what *any* unrecognised value maps to.

> Setting `START = "**OTHER**"` does **not** work — that would just map the literal string
> `**OTHER**`. The catch-all must be declared through `HLO`.

By making the catch-all `"!!UNMAPPED!!"` instead of blank, an unrecognised value becomes
**findable** rather than invisible. That single choice is the whole point of Section 4.

---

## Section 2 — Data → formats with CNTLIN

```sas
proc format cntlin = ct_map;
run;
```

`CNTLIN` = "control input": build formats *from* a dataset. It needs the variables `FMTNAME`,
`START` and `LABEL` — which is why we named them that. **One call builds all four formats at
once.** `PROC FORMAT ... FMTLIB` then prints them back so you can see what SAS constructed.

The `$` prefix (`$sexmap`) means a **character** format; `PROC FORMAT` infers it because `START`
is character.

---

## Section 3 — Apply with `PUT`

```sas
aesev_ct = put(upcase(strip(aesev)), $sevmap.);
```

`put(value, $fmtname.)` replaces the entire `SELECT` block. Note `upcase(strip(...))`: the lookup
keys are upper-case, so normalising the input **once, here** makes the mapping case- and
space-blind — instead of scattering `upcase` calls through the code.

---

## Section 4 — Fail loudly (the habit that matters)

```sas
create table ct_problems as
    select "AEOUT" as variable, aeout as raw_value
    from ae_ct where aeout_ct = "!!UNMAPPED!!"
    ...
```

Because unmapped values became `"!!UNMAPPED!!"` rather than blank, they are now searchable. The
notebook counts them and, if any exist, **prints them and writes `ERROR:` to the log**.

> **A new value is a spec change, not something a mapping program should absorb.** When a code
> `6` appears in next month's extract, you want the program to stop and someone to ask the data
> manager why the CRF gained an option — not to silently produce a blank and pass.

This is the single most transferable habit in the module. Compare it to the LB notebook, whose
`otherwise` branch already writes an `ERROR` — that was the pattern to copy all along.

---

## Section 5 — Audit the whole study in one pass

`%ct_inventory` lists every distinct value of every coded variable across your built SDTM
datasets, so you can eyeball the study's terminology on one page. It reads from the **SDTM
library**, so run `run_all.sas` (or notebooks 04–09) first; if the library is empty it says so
plainly rather than auditing the wrong thing.

---

## The four kinds of CT work — where each variable lands

| Variable | Kind | Why |
|---|---|---|
| `SEX`, `AEOUT` | **decode** | a code stands for a term — you need the dictionary |
| `RACE`, `ETHNIC`, `AESEV`, `AEREL` | **normalise** | right term, wrong case/spacing |
| `LBTEST` | **rename** | `White Blood Cells` → `Leukocytes`; only a lookup finds it |
| `AETRTEM`, every `--DY` | **derive** | computed, not mapped (that is Notebook 11) |

The danger rises down that list: normalise *looks* trivial, so people stop checking — and rename
hides inside a column where five of six values normalise perfectly.

---

## Exercises
Six tasks at the bottom of the `.sas` file. Solutions:
`../../answer-keys/10_applying_ct_answers.md`.
