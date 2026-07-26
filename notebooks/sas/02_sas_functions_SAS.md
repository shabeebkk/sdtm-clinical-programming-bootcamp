# Notebook 02 (SAS) — SAS Functions: The Basics — Walkthrough

**Module:** Tooling · **Run the code in:** `02_sas_functions_SAS.sas`
**Before:** Notebook 01 (SAS Basics) · **After:** Notebook 03 (Importing Raw Data)

Notebook 01 taught you the **shape** of a SAS program — the DATA step, `PROC SORT`,
`PROC FREQ`. This one teaches the **tools you use inside it**.

> **No data files needed.** Everything is typed into the program with `DATALINES`, so it runs
> in a fresh SAS session with nothing uploaded. Open it and submit.

---

## What a function is

```
      upcase( "mild" )   ---->   "MILD"
      ^^^^^^   ^^^^^^             ^^^^^^
      name     argument           result
```

A function takes something **in** and hands something **out**. You use the result — assign it
to a variable, or test it in an `IF`.

**A function never changes its argument.** `upcase(sev)` does not modify `sev`; it returns a new
value. If you want to keep it, you must assign it somewhere.

---

## The six groups

### 1. Character — cleaning up text

Collected text is never tidy: stray spaces, inconsistent capitals.

| Function | Does | Note |
|---|---|---|
| `STRIP` | removes spaces at **both** ends | **the one you want**, almost always |
| `TRIM` | trailing spaces only | |
| `LEFT` | leading spaces only | |
| `COMPRESS` | removes **all** spaces, including the middle | `"a b"` → `"ab"` — careful |
| `UPCASE` / `LOWCASE` / `PROPCASE` | change case | SDTM CT is nearly always UPPER |
| `SUBSTR(t, start, n)` | pull out by **position** | positions start at **1**, not 0 |
| `SCAN(t, n, delim)` | pull out the **n-th word** | safer than SUBSTR when lengths vary |
| `INDEX(hay, needle)` | **where** does it appear? | returns `0` if not found |
| `CATX(sep, …)` | join with a separator, stripping each piece | how `USUBJID` is built |
| `CATS(…)` | join with no separator, stripping | |
| `LENGTH` / `LENGTHN` | how many characters | see the trap below |

**SCAN vs SUBSTR.** `SUBSTR` needs to know the position, so it breaks the moment a name is a
different length. `SCAN` finds the n-th piece however long the pieces are. Prefer `SCAN` unless
the layout is genuinely fixed-width.

> **The `LENGTH` trap.** For a blank value, `LENGTH` returns **1**, not 0 — it never returns
> zero. `LENGTHN` returns 0. So `if length(x) = 0` is never true; use `if missing(x)`.

### 2. Numeric

`ROUND(x, 0.01)` · `INT` (chops decimals) · `ABS` · `MIN` · `MAX` · `SUM` · `MEAN`

> **Why `SUM(a,b,c)` beats `a + b + c`.** The `+` operator gives up if **any** value is missing —
> the whole result becomes missing. `SUM()` ignores missing values. Clinical data is full of
> gaps, so this matters constantly.

### 3. Dates — the key idea

**To SAS, a date is just a number**: days since 1 January 1960. So `01JAN1960` = 0 and today is
about 24,000. That is why you can *subtract two dates to get days between them*. A **format** is
only what makes that number readable.

| Function | Does |
|---|---|
| `"01MAR2024"d` | a **date literal** — the `d` makes it a date |
| `YEAR` / `MONTH` / `DAY` | pull pieces out |
| `MDY(m, d, y)` | build a date from pieces |
| `INTCK("year", a, b, "C")` | count **completed** intervals — this is how you get **age** |
| `INTNX("month", d, 0, "end")` | shift a date; `"end"` = end of that period |

The `"C"` in `INTCK` means **continuous** — count only intervals actually completed. Without it
you get calendar-boundary counting, which reports the wrong age for someone whose birthday
hasn't happened yet this year.

### 4. Conversion — `INPUT` and `PUT`

**The most confused pair in SAS.** Learn the direction once:

```
INPUT( character, informat )  ->  NUMBER       "read text IN to a number"
PUT  ( number,    format   )  ->  CHARACTER    "PUT a number OUT as text"
```

The two you will use every single day in this course:

```sas
real_date = input(raw_date,  date11.);     /* "01-MAR-2024" -> a real date */
iso_date  = put(real_date, yymmdd10.);     /* that date     -> "2024-03-01" */
```

> **Informat width matters.** `date11.` reads 11 characters — enough for `01-MAR-2024` *including
> the dashes*. `date9.` would read only `01-MAR-20` and hand you the year **2020**, silently.

### 5. Missing values

SAS writes a missing **number** as `.` and a missing **text** value as `""`.

- `MISSING(x)` — works for **both** types. The safe test.
- `COALESCE(...)` — first non-missing **number**; `COALESCEC(...)` for **character** (note the `C`).

> **The trap that catches everyone.** A missing number is **smaller than every real number**. So
> `where age < 18` quietly includes subjects whose age is *missing*. Always write
> `where not missing(age) and age < 18`.

### 6. Putting it together

The last section cleans the messy demo data using everything above:

```sas
usubjid   = catx("-", "ABC-01", "01", subjid);
sev_ct    = upcase(strip(sev));
firstname = scan(name, 1, "_");
dose      = input(dose_c, best.);
iso_dt    = put(input(visit_dt, date11.), yymmdd10.);
```

Those five lines are, in miniature, **exactly what the rest of this bootcamp does**: build
`USUBJID`, normalise text to controlled terminology, convert collected dates to ISO 8601. The
domains get bigger; the tools stay these.

---

## Two bugs worth meeting early

Both appear in the notebook deliberately, because both are silent — no error, no warning.

**1. A variable's length is set by its first assignment.**
```sas
note = "strip -> both ends";        /* note becomes $19 */
note = "compress -> ALL spaces";    /* 22 chars -> chopped to 19 */
```
Declare it: `length note $30;`. This is the single most common beginner bug in SAS.

**2. `SUBSTR` into a too-short variable truncates.**
`substr("John_Smith", 1, 4)` returns 4 characters. Into a `$3` variable you get `Joh`.

Both are the same underlying lesson: **SAS truncates quietly.** It will not tell you.

---

## PROC SQL — SAS's other language

Section 7 exists because **notebook 03 opens with a `PROC SQL` block**, and until now
nothing had told you SAS has two languages.

|  | DATA step | PROC SQL |
|---|---|---|
| works | row by row | a whole table at once |
| you say | "for each record, do this" | "give me the answer to this" |
| best for | **building** records — most of SDTM mapping | **asking** about a table — most of QC |

Neither is better. You will use both, often in the same program.

The section covers exactly the SQL this bootcamp uses and nothing more: `SELECT`/`FROM`,
naming a result with `as`, `count(*)` versus `count(distinct x)`, `UNION ALL` for stacking
results, a `NOT IN (subquery)` orphan check, and `GROUP BY`.

Three things that catch people out:

1. **`PROC SQL` ends with `QUIT`, not `RUN`.** It stays open until you quit it.
2. **Missing is still smaller than every number** — the same trap as section 5. `where dose < 100` is true for a row with no dose.
3. **SQL rarely errors; it returns something.** Always check the row count is what you expected.

> The `count(distinct ...)` example is the one to remember. "Is this identifier as unique as
> I think it is?" is the question behind `USUBJID`, and notebook 03 uses this exact query to
> prove `SUBJID` is unique only within a site.

## Exercises
Six tasks at the bottom of the `.sas` file. Solutions:
`../../answer-keys/02_functions_answers.md`.
