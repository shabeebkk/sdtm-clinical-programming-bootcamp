# Notebook 16 (SAS) — Build ADVS — Walkthrough

**Module:** Basic Data Structure · **Run the code in:** `16_build_advs_SAS.sas`
**Spec:** `../../data/adam_specification.md` §3 · **Target:** `../../data/adam/advs.csv`

The third shape, and the one you will use most. ADSL was one row per subject. ADAE was one row
per event. ADVS is:

> **one row per subject per parameter per visit**

Nearly every efficacy dataset you will ever build is BDS. Learn the skeleton here and ADLB
tomorrow is the same thing with three extra columns.

---

## Section 1 — The BDS shape

Three variables carry the parameter, and they must be **one-to-one**:

| | Job |
|---|---|
| `PARAMCD` | the short key you subset on — `WHERE PARAMCD = 'SYSBP'` |
| `PARAM` | what prints as the row label in the table |
| `PARAMN` | what controls the **order** parameters print in |

`PARAM` carries the unit, because it is what a reader sees. "Weight" tells them nothing;
"Weight (kg)" does. `PARAMN` exists because without it parameters print alphabetically, and
Diastolic sorts above Systolic — which no clinician expects. The notebook checks the one-to-one
property explicitly, because it breaks when someone edits one lookup and forgets the other.

### `AVISIT` is not `VISIT`

```sas
if      visit = 'SCREENING' then do; avisit = 'Screening'; avisitn = 0; end;
else if visit = 'BASELINE'  then do; avisit = 'Baseline';  avisitn = 1; end;
else if visit = 'WEEK 4'    then do; avisit = 'Week 4';    avisitn = 4; end;
```

The collected visits are numbered **1, 2, 4**. The analysis visits are **0, 1, 4**. They are
deliberately different numbers, and both are kept.

`VISIT`/`VISITNUM` record what the CRF collected. `AVISIT`/`AVISITN` say how the analysis groups
it — and `AVISITN` drives sort order and column order in every table.

**The label is one visit; the actual days are not.** In ABC-01:

| `AVISIT` | Actual study days (`ADY`) |
|---|---|
| Screening | −9, −10, −11 |
| Baseline | 1 |
| Week 4 | **20, 28, 29** |

Day 20 is `ABC-01-01-004`, who discontinued early — their final visit happened eight days ahead
of schedule, and it still reports as Week 4. That is precisely what `AVISIT` is for: several
different actual days collapsing into one analysis visit, one column in the table. Keeping both
columns means a reviewer can always see what was collected *and* how it was analysed.

---

## Section 2 — BMI, a derived parameter

BMI appears in **no SDTM domain**. It is a new `PARAMCD`, computed from the visit's weight and
the subject's **baseline** height — height is measured once and does not change over four weeks.

```sas
aval = round(aval / ((heightbl / 100) ** 2), 0.01);
```

Two things about these rows look wrong and are not.

**`DTYPE` stays empty.** `DTYPE` identifies a derived *record within* a parameter — a LOCF
carry-forward, an average of replicates. A whole new parameter is not that. Populating `DTYPE`
here would tell a reviewer these rows were imputed, which they were not. Exercise 5 makes you
write the reply to a colleague who argues otherwise.

**`SRCDOM` / `SRCVAR` / `SRCSEQ` stay empty.** There is no single SDTM record to point at — BMI
comes from a weight record *and* a height record *and* ADSL. Naming just the weight row would be
a false trail. The blank is information: *this was computed; see the derivation in define.xml*.

---

## Section 3 — `ABLFL`, the baseline rule again

Same rule as Notebook 14: **the last non-missing value on or before first dose**, applied per
subject **per parameter**. Because it is per parameter, it resolves to different visits for
different parameters — and it does:

| Parameter | Baselines at |
|---|---|
| `HEIGHT` | Screening |
| everything else | Baseline |

The notebook proves this with a `PROC FREQ` of `PARAMCD * AVISIT` where `ABLFL = 'Y'`. If your
output shows all seven parameters baselining at Baseline, you used `VSBLFL` and lost every
height.

### Two merges, because the two variables have different scope

```sas
merge advs_all (in = a) bl_pick (keep = usubjid paramcd avisitn ablfl);
by usubjid paramcd avisitn;      /* ABLFL belongs to ONE row       */
...
merge advs_flagged (in = a) bl_base;
by usubjid paramcd;              /* BASE belongs to EVERY row      */
```

This trips people up. `ABLFL` marks a single record; `BASE` has to be on *every* record of that
subject and parameter, because every post-baseline row needs to subtract from it. Merging both
by the same key gives you `BASE` on the baseline row only, and a `CHG` column that is entirely
missing.

---

## Section 4 — Change, and two rules that matter

### `CHG` is blank at baseline — not zero

A baseline record's change from baseline is **undefined**, not zero. Writing 0 puts it into the
mean-change column and drags the average toward zero.

For `WEIGHT` in ABC-01 the correct mean change is **−0.3375 kg**. Set the baselines to 0 and it
becomes **−0.1688 kg** — exactly half, because there are as many baseline records as
post-baseline ones. Exercise 1 makes you show why the bias always points the same way.

### Rounding is specified, not incidental

```sas
chg = round(aval - base, 0.0001);
```

`69.8 − 70.2` is `-0.4000000000000057` in SAS and in Python alike. Only an explicit `ROUND` to a
precision the spec names makes two implementations agree. Skip it and `PROC COMPARE` reports
differences of `5.7E-15` — which are not disagreements about the data at all, but about how a
number is stored. Exercise 2 makes you generate exactly that output, because you will meet it in
QC and need to recognise it instantly.

### `ANL01FL` keeps rows without analysing them

```sas
if ablfl = 'Y' or post then anl01fl = 'Y';
```

A Screening result that is not the baseline is real data. It is **kept** and simply not analysed.
That is why the flag exists instead of deleting the rows — the same principle as `TRTEMFL` in
ADAE. Keep the row, flag it, subset at analysis time.

Exercise 4 shows what happens when you delete instead, and that the *order* of operations decides
whether it is harmless or catastrophic.

---

## What you built

| | |
|---|---|
| Rows | 152 = 128 observed + 24 derived BMI |
| Parameters | 7 — six observed, one derived |
| Baseline records | 56 = 8 subjects × 7 parameters |
| `HEIGHT` rows | 8, all at Screening, all `ABLFL = 'Y'`, no `CHG` anywhere |
| `DTYPE` | empty on every row |

`HEIGHT` having no change anywhere is **correct**, not missing data. It has one record, that
record is its baseline, and a baseline has nothing to change from.

Next: **Notebook 17**, where ADLB reuses this entire skeleton and adds reference ranges, shift
variables and criterion flags — and where only half the study has data at all.
