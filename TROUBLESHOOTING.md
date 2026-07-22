# Troubleshooting — when your SAS looks right but isn't

> **Every entry below is a real defect found in this course's own code**, by running it on SAS
> OnDemand for Academics. Not invented examples — actual bugs, with the actual log messages.
>
> **Eight of the thirteen produced no error at all** — four raised only a `WARNING`, four raised
> nothing whatsoever — and in every one the program reported success and the output was wrong.
> The other five failed loudly with an `ERROR`: still bugs, but ones that at least told you where
> to look. (The last two, from the ADaM track, are that loud kind.)

**The one habit this whole page is trying to build:**

> A clean log is not a correct program. Read the log, then check the numbers.

---

## Start here: three questions, in this order

1. **Did it error?** Search the log for `ERROR:`. The **first** one is the real cause; later
   ones are usually knock-on effects.
2. **Did it warn?** Search for `WARNING:`. This is the step people skip, and it is where most
   of the bugs below were hiding.
3. **Are the numbers right?** Row counts, then values. A program can run perfectly and produce
   the wrong data.

---

## By symptom

### "It ran clean, but a column has the RAW values in it"

```
WARNING: Variable aesev_c cannot be renamed to aesev because aesev already exists.
```

**Cause.** You renamed a derived variable onto a name that is still occupied by the original.
SAS refuses, warns, and **keeps the original** — so all your careful mapping sits stranded in the
`_c` columns and never reaches the domain.

**Fix.** Drop the raw variables in the same step. `DROP` is applied before `RENAME`, so this is
legal and is the standard idiom:

```sas
drop aesev aeser aerel aeout;                       /* the raw values     */
rename aesev_c = aesev  aeser_c = aeser  ... ;      /* now the names are free */
```

**Why it hid.** Only a WARNING. Every row count is correct; only the *contents* are wrong.

---

### "My variable is too short / text is being cut off"

```
WARNING: Length of character variable rfstdtc has already been set.
```

**Cause.** Your `LENGTH` statement came **after** `SET` or `MERGE`. The incoming length wins and
your declaration is ignored.

**Fix.** `LENGTH` must be the **first** statement in the DATA step.

> ⚠️ **Careful:** if the incoming variable is *longer* than the length you want, simply moving
> `LENGTH` up will now **truncate** it. Read the raw value in under a different name
> (`RFSTDTC_R`) and convert into the correctly-sized SDTM variable.

**Related, with no warning at all:** a character variable created by *assignment* takes its
length from the **first value assigned**.

```sas
note = "strip -> both ends";       /* note is now $19        */
note = "compress -> ALL spaces";   /* 22 chars -> chopped to 19 */
```

Declare it. This is the most common beginner bug in SAS and it is completely silent.

---

### "A number lost its decimal — 82.0 became 82"

**Cause.** You read a collected result through a **numeric** variable. `--ORRES` and `--STRESC`
are CHARACTER precisely so they can preserve what the site recorded.

**Fix.** Read the raw column as character and copy it straight across. Derive the numeric
version into `--STRESN`, where it belongs.

```sas
length ... weight $10 ... ;              /* character */
vsorres  = strip(weight);                /* exactly as collected  */
vsstresn = input(weight, ?? best.);      /* the number            */
```

**A related one:** when **no unit conversion happened**, `--STRESC` should copy `--ORRES`
verbatim. Re-rendering it through `put(x, best.)` turns `"84.0"` into `"84"` and drops a
significant figure. Only *converted* values should be rendered from the number.

**Why it hid.** It only bites values that end in zero — 7 rows out of 128. Every other value
round-trips perfectly, so a spot check passes.

---

### "My dataset has extra columns"

**Cause.** Join keys (`SITEID`, `SUBJID`) used to build `USUBJID` were never removed.

**Fix.** Drop them, or use a `KEEP` list.

**Why it hid.** No error, no warning, nothing. The domain simply ships with two extra columns.

---

### "The row count is right but the values are from a different study"

```
WARNING: Data set WORK.EX was not replaced because this step was stopped.
```

**Cause.** A step **failed**, so SAS left the *previous* `WORK.EX` in place. The next step read
that stale dataset and copied it onward — with no error. If you ran a different study earlier in
the same session, you can end up writing its rows into your output.

**Fix.** Start standalone build programs from a clean slate:

```sas
proc datasets library = work kill nolist;
quit;
```

**Why it hid.** The knock-on steps succeed perfectly. Only the row count looks odd — and only if
you know what it should be.

---

### "PROC FORMAT says my ranges overlap"

```
ERROR: For format SEVMAP, this range is repeated, or values overlap: .-.
```

**Cause.** The `.` is the giveaway: SAS is showing you a **numeric** range for something you
meant to be text. In a `CNTLIN` dataset, formats are numeric by default, so `"MILD"`,
`"MODERATE"` and `"SEVERE"` all convert to missing and collide.

**Fix.** Add a `TYPE` variable:

```sas
length type $1;
type = "C";        /* these are CHARACTER formats */
```

(Or name the format `$sevmap` in `FMTNAME`. `TYPE="C"` is clearer.)

---

### "All positional parameters must precede keyword parameters"

```
ERROR: All positional parameters must precede keyword parameters.
```

**Cause.** A macro argument contains an `=`. SAS reads `aestdy = 0` as a *keyword parameter
named `aestdy`* and rejects everything after it.

**Fix.** Mask the `=`:

```sas
%qc_check(SD0001, ERROR, ae, %str(aestdy = 0), AESTDY must never be 0)
```

Or sidestep it with the `EQ` operator: `aestdy eq 0`.

---

### "My dates are all in January"

**Cause.** A variable built by `SCAN()` with no `LENGTH` gets SAS's default **200 characters** —
`"FEB"` plus 197 blanks. `INDEX()` then looks for that 200-character string inside a short
haystack, finds nothing, returns `0`, and the arithmetic quietly produces month 1.

**Fix.** `strip()` inside the lookup:

```sas
_pos = index("JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC", strip(_mon));
if _pos = 0 then put "ERROR: unrecognised month >" _mon "<";   /* fail loudly */
```

**Why it hid.** `2024-01` is a perfectly plausible date. Nothing looked wrong. **Every** month
would have become January — the data happened to contain only February.

---

### "A variable already exists on file"

```
ERROR: Variable exstdtc already exists on file WORK.EX_WORK.
```

**Cause.** You built an ISO version as `exstdtc2` and tried to rename it to `exstdtc`, but the
raw `exstdtc` is still in the dataset.

**Fix.** Drop the raw versions in the step that creates the new ones.

---

### "The dataset doesn't exist"

```
ERROR: File SDTM.DS does not exist.
```

**Cause.** Something references a domain that no program built. (In this course, `DS` was
specified, referenced and audited — but for a while nothing actually created it.)

**Fix.** Check what your build programs actually produce. `run_all.sas` prints the SDTM library
contents for exactly this reason.

---

### "A numeric variable is showing a trailing zero"

**Cause.** You wrote text into a numeric variable. `--STRESN` is numeric, so `1.0` **is** `1` —
a numeric cannot carry a trailing zero. If your reference says `1.0`, the reference is wrong.

**Fix.** Normalise the number when generating, and keep the collected text in `--STRESC`, which
is character.

---

### "Variable AESTDTC not found" — in a step reading a dataset that used to have it

```
ERROR: Variable AESTDTC not found.
```

**Cause.** The dataset the step reads was finished with a `keep` (or `KEEP=`) that does not list
the variable. In ADaM this bites often: the final ADAE keeps the **numeric** analysis date
`ASTDT`, not the **character** SDTM date `AESTDTC`, so a `PROC PRINT ... var ... aestdtc;` on the
finished dataset fails — even though an *earlier* intermediate step still had `AESTDTC`.

**Fix.** Reference the variable the dataset actually carries — here `ASTDT` (formatted `date9.`,
so it still prints as a date). If you genuinely need the character source date downstream, add it
to the `keep` list on purpose.

**Why it hid.** The static checker validates syntax but cannot know which variables a `keep` list
drops, and the Python audit checks the reference CSVs, not the notebooks' display code. Only
running the step surfaces it.

---

### A `PROC SQL` "select (select …) as …" fails with a syntax error

```
ERROR 22-322: Syntax error, expecting one of the following: a quoted string, ',', AS,
              FORMAT, INFORMAT, INTO, LABEL, LEN, LENGTH, TRANSCODE.
ERROR 76-322: Syntax error, statement will be ignored.
```

**Cause.** A `SELECT` with **no `FROM` clause** cannot carry a subquery in its column list. SAS
rejects the tempting "show two counts side by side" shortcut:

```sas
proc sql;
    select (select count(*) from adae where aoccfl = 'Y')          as flagged_rows,
           (select count(distinct usubjid) from adae where trtemfl = 'Y') as subjects;
quit;
```

**Fix.** Count each into a macro variable — every query then has its own `FROM` — then print a
one-row table:

```sas
proc sql noprint;
    select count(*)                into :flagged trimmed from adae where aoccfl = 'Y';
    select count(distinct usubjid) into :nsubj   trimmed from adae where trtemfl = 'Y';
quit;
data _check; flagged_rows = &flagged; subjects = &nsubj; run;
proc print data = _check noobs; run;
```

**Why it hid.** `check_sas_static.py` validates syntax structurally but does not evaluate SQL
semantics, and the audit checks the reference CSVs, not the notebooks' check code. It ran clean
everywhere except real SAS.

---

## The log messages worth knowing

| Message | Usually means |
|---|---|
| `WARNING: ... cannot be renamed ... already exists` | your derived values never landed |
| `WARNING: Length of character variable ... already been set` | `LENGTH` came after `SET`/`MERGE` |
| `WARNING: ... was not replaced because this step was stopped` | downstream steps are reading **stale** data |
| `WARNING: The variable ... in the DROP, KEEP, or RENAME list has never been referenced` | usually knock-on from an earlier failure |
| `NOTE: Character values have been converted to numeric` | an implicit conversion — make it explicit |
| `NOTE: Invalid data for ...` | an informat did not match the value; you now have a missing |
| `NOTE: MERGE statement has more than one data set with repeats of BY values` | a many-to-many join, almost always a bug |
| `ERROR: Variable ... not found` | you named a variable a `keep`/`KEEP=` list dropped upstream |
| `ERROR 22-322: Syntax error, expecting ... AS, FORMAT, INTO ...` | a subquery in a `SELECT` that has no `FROM` clause |

> `NOTE:` lines are easy to scroll past. Two of the entries above are NOTEs.

---

## Checks worth running every time

```sas
/* 1. Did the row count come out as you predicted BEFORE running? */
proc sql; select count(*) from sdtm.vs; quit;      /* expect 128 */

/* 2. Is the key unique? */
proc sql;
    select count(*) as rows, count(distinct catx("-", usubjid, put(vsseq, 8.))) as keys
    from sdtm.vs;
quit;

/* 3. Any study day of zero? There is no Day 0. */
proc sql; select sum(vsdy = 0) from sdtm.vs; quit;  /* expect 0 */

/* 4. What actually persisted? */
proc sql;
    select memname, nobs, nvar from dictionary.tables where libname = "SDTM";
quit;
```

And when a reference dataset exists, **compare values** — not just counts. `verify_against_reference.sas`
caught a single wrong character in a plausible-looking date across 96 rows. Nothing else would have.

---

*Compiled from defects found running this course on SAS OnDemand for Academics (SAS 9.4M8).*
