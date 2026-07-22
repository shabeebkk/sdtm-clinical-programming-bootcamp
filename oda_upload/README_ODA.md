# Running the bootcamp on SAS OnDemand for Academics

Everything in `sdtm_bootcamp/` is ready to upload — both the SDTM track (notebooks 01–12b) and
the ADaM track (notebooks 14–19). Follow these five steps.

---

## 1. Find your SAS user ID

Log in to SAS OnDemand for Academics and open **SAS Studio**. In the code editor, submit:

```sas
%put &=sysuserid;
```

The log prints something like `SYSUSERID=u63012345`. **That is your user ID** — it is not your
email address. Your home directory is `/home/<that value>`.

---

## 2. Upload the folder

In SAS Studio's left-hand **Files and Folders** pane, expand **Files (Home)**, then upload so
you end up with exactly this structure:

```
/home/<youruserid>/sdtm_bootcamp/
├── data/
│   ├── ae_raw.csv  cm_raw.csv  dm_raw.csv  ds_raw.csv
│   ├── ex_raw.csv  lb_raw.csv  vs_raw.csv          (7 files)
│   ├── sdtm/
│   │   └── ae.csv cm.csv dm.csv ds.csv ex.csv lb.csv suppae.csv vs.csv  (8 files)
│   └── adam/
│       └── adsl.csv adae.csv advs.csv adlb.csv adtte.csv               (5 files)
├── output/          <-- created automatically; YOUR built datasets land here
└── notebooks/
    └── sas/
        └── 00_setup.sas … 12b_submission_package_SAS.sas   (SDTM, 16 files)
            14_build_adsl_SAS.sas … 19_adam_to_table_SAS.sas (ADaM, 6 files)
            run_all.sas, verify_against_reference.sas       (22 files total)
```

SAS Studio's upload button takes multiple files at once but **not folders**, so create
`sdtm_bootcamp`, `data`, `data/sdtm`, `data/adam`, `notebooks` and `notebooks/sas` first
(right-click → *New* → *Folder*), then upload into each.

> The `data/sdtm/` and `data/adam/` reference files are what let you check your work. Without
> them the notebooks still run, but nothing can verify the answers.
>
> **`data/adam/` is required, not optional, for notebooks 14–19.** Those notebooks read the
> reference ADSL to merge subject-level variables from, as well as for their `PROC COMPARE`
> step — so without the folder they fail immediately on the first `INFILE`.

---

## 3. Edit one file

Open **`00_setup.sas`** and change the three paths near the top — replace `YOURUSERID` with the
value from step 1:

```sas
%let codepath = /home/u63012345/sdtm_bootcamp/notebooks/sas;
%let datapath = /home/u63012345/sdtm_bootcamp/data;
%let outpath  = /home/u63012345/sdtm_bootcamp/output;
```

`outpath` is where **your** built domains are saved, via the `SDTM` libref. The folder is
created for you if it does not exist. It is deliberately **not** `data/sdtm` — that one holds
the reference answers, and writing over it would destroy what you check your work against.

Submit it. It checks both folders exist and all 15 CSVs are present, and tells you exactly
what is missing if not. You should see:

```
  PASS  all 7 raw CSVs found
  PASS  all 8 reference SDTM CSVs found
  PASS  output folder exists
  PASS  libref SDTM assigned to /home/u63012345/sdtm_bootcamp/output

  SETUP OK - you can now run any notebook, or run_all.sas
```

**Run this once per SAS Studio session.** Macro variables live for the whole session, so you
don't repeat it before every notebook. If you log out and back in, run it again.

---

## 4. Smoke-test everything

Open **`run_all.sas`** and submit. It runs notebooks 01 and 03–09 in order and prints one
summary table:

| Notebook | Domain | Result | Detail |
|---|---|---|---|
| 04_build_dm_domain_SAS.sas | dm | PASS | 8 rows, as expected |
| 05_build_ae_domain_SAS.sas | ae | PASS | 10 rows, as expected |
| … | | | |

Then open **`verify_against_reference.sas`** and submit. This compares every value your
programs produced against the reference datasets and reports `MATCH` or `FAIL` per domain.

---

## 5. Send the results back

`verify_against_reference.sas` writes everything needed into one file:

```
/home/<youruserid>/sdtm_bootcamp/data/verify_report.txt
```

It contains your SAS version and platform, the per-domain summary, and **every** differing line
(the on-screen listing only shows the first 5 per domain).

**To send it:** in the **Files and Folders** pane, right-click `verify_report.txt` → **Download**.
It lands in your Mac's `Downloads` folder. Then just say so — the file can be read from there
directly, no pasting needed.

### Also send the log from `run_all.sas`

The report only covers verification. If a notebook failed to *run*, the reason is in the log:
click the **Log** tab → the **download icon**, and send that too.

Pasting works fine as an alternative. If you paste rather than download, the parts that matter
are:

- every line starting `ERROR:` — the **first** one is the real cause; later ones are usually
  knock-on effects
- the two summary tables
- any `WARNING:` about uninitialized variables or invalid data

> **Note:** the report is written into `data/`, so it sits alongside the CSVs. It is overwritten
> each time you run the verifier — download it before re-running if you want to keep a copy.

---

## Status

### SDTM notebooks (01–12b): verified

**These programs have been run.** On 2026-07-19 the full set executed on SAS OnDemand for
Academics (SAS 9.04.01M8P022223, Linux x64) with **zero errors, zero warnings, and all 7
domains reproducing the reference datasets exactly**.

That first run mattered — it found four real defects that neither the static checker nor an
independent Python reimplementation could see, because all four were SAS *execution*
semantics rather than logic:

| Defect | Symptom | Why it hid |
|---|---|---|
| `RENAME` collision in AE | all four CT-mapped variables kept their RAW values | SAS only **warns**; the program "succeeds" |
| `LENGTH` after `MERGE` in DM | submitted variables had the wrong length | warning only |
| VS read results as numeric | a weight of `82.0` became `82` — a lost significant figure | only bites values ending in zero (7 of 128 rows) |
| `SITEID`/`SUBJID` left in LB | domain shipped with 2 extra columns | no error, no warning at all |

**Three of the four announced themselves as WARNINGs while the run reported success.** Read the
log, not just the exit status.

### ADaM notebooks (14–19): NOT yet run

The ADaM notebooks pass static checks and their reference datasets are independently audited,
but **they have not been executed on SAS**. Given that the SDTM run above found four defects
that no amount of static analysis could see, treat them as unproven until you have run them.

Run them in order — each builds on the last:

| Notebook | Builds | Expected |
|---|---|---|
| `14_build_adsl_SAS.sas` | ADSL | 8 rows, one per subject |
| `15_build_adae_SAS.sas` | ADAE | 10 rows; 9 treatment-emergent |
| `16_build_advs_SAS.sas` | ADVS | 152 rows = 128 observed + 24 derived BMI |
| `17_build_adlb_SAS.sas` | ADLB | 48 rows, 4 subjects only |
| `18_build_adtte_SAS.sas` | ADTTE | 8 rows; 6 events, 2 censored |
| `19_adam_to_table_SAS.sas` | two tables | no datasets — produces output only |

Or smoke-test the whole track at once: after `00_setup.sas`, open **`run_all_adam.sas`** and
submit. It runs 14–19 in order and prints one summary table with a PASS/FAIL per notebook — the
ADaM counterpart of `run_all.sas`. The two harnesses are independent; you do not have to run the
SDTM track first, because the ADaM notebooks read their inputs from the reference CSVs.

Each of 14–18 ends with a `PROC COMPARE` against its reference and should report **no
differences** (this is the value-level check — there is no separate `verify` step for ADaM, and
`run_all_adam.sas` surfaces these compares in its log). Notebook 19 builds nothing; it produces
the demographics and adverse-event tables from the datasets you have already built.

The places most likely to break on a first real run, based on where the SDTM defects clustered:

- the **two-merge baseline pattern** in notebooks 16 and 17 — `ABLFL` is merged by
  subject+parameter+visit while `BASE` is merged by subject+parameter, and getting both by the
  same key yields a `CHG` column that is entirely missing
- **`PROC LIFETEST`** in notebook 18 — the `cnsr(1)` argument, and whether the quartile output
  appears as expected
- **numeric formatting** — `CHG`/`PCHG` are rounded to 0.0001 and BMI to 0.01 by the spec; any
  `PROC COMPARE` difference around 1E-15 means a `ROUND()` was dropped somewhere

## Notes

- **Running a notebook on its own is fine.** Each one falls back to a default path if you
  haven't run `00_setup.sas`, but that default points at the author's laptop — so always run
  setup first on ODA.
- **ODA has a storage quota** (a few GB). This bundle is well under 1 MB.
- **Nothing here contains real patient data.** All 20 CSVs are synthetic mock data for study
  `ABC-01`, generated for training.
