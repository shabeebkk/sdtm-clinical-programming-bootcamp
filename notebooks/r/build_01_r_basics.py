#!/usr/bin/env python3
"""Generate 01_r_basics_R.ipynb (R kernel). Run: python3 build_01_r_basics.py"""
import json, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "01_r_basics_R.ipynb")

def md(*lines):
    return {"cell_type": "markdown", "metadata": {}, "source": _src(lines)}

def code(*lines):
    return {"cell_type": "code", "metadata": {}, "execution_count": None,
            "outputs": [], "source": _src(lines)}

def _src(lines):
    # join with newlines; nbformat wants a list of strings each ending in \n
    text = "\n".join(lines)
    parts = text.split("\n")
    return [p + ("\n" if i < len(parts) - 1 else "") for i, p in enumerate(parts)]

cells = [
md("# Notebook 01 (R) — R & tidyverse Basics",
   "",
   "**Module:** Tooling · **Pairs with:** `01_sas_basics_SAS.sas` (same skills in SAS)",
   "",
   "Goal: get comfortable with the handful of R operations you'll use in every SDTM",
   "exercise — read a CSV, look at it, build new columns, subset, sort, and summarize.",
   "No prior R knowledge assumed; every term is defined on first use.",
   "",
   "> **What is R?** R is a free programming language for working with data. The",
   "> **tidyverse** is a popular collection of R packages that share a clean, readable",
   "> style. In clinical trials R is increasingly used alongside SAS — so we learn both.",
   "",
   "> **How to run this notebook.** It needs R plus the Jupyter **IRkernel** (`install.packages(\"IRkernel\"); IRkernel::installspec()`).",
   "> Run one cell at a time with **Shift+Enter**. You can also copy the code into any R console."),

md("## 0. Load packages and point at the data",
   "",
   "A **package** is a bundle of ready-made functions. We load the tidyverse pieces we",
   "need. (`library(tidyverse)` loads all of them at once if you have the meta-package.)",
   "",
   "A **data frame** / **tibble** is R's word for a table: columns are **variables**,",
   "rows are **observations** — the same 'one row = one observation' idea as SDTM."),
code("# If a package is missing, install once with e.g. install.packages(\"readr\")",
     "library(readr)   # read_csv(): read CSV files",
     "library(dplyr)   # select/filter/mutate/arrange/summarise: the core 'verbs'",
     "library(tidyr)   # reshaping (used more in later notebooks)",
     "",
     "# Edit this path if your data folder is elsewhere:",
     "datapath <- \"/Volumes/D Drive/SDTM Training/Bootcamp/data\"   # <-- EDIT if needed"),

md("## 1. Read a CSV (`read_csv`)",
   "",
   "`read_csv()` reads a comma-separated text file into a tibble.",
   "",
   "We read `SITEID` and `SUBJID` as **character** on purpose: an id like `001` looks",
   "numeric, and if R guesses 'number' it becomes `1` and the leading zeros are lost.",
   "Telling R they are text keeps `01` and `001` intact — we need that to build IDs."),
code("dm <- read_csv(",
     "  file.path(datapath, \"dm_raw.csv\"),",
     "  col_types = cols(SITEID = col_character(), SUBJID = col_character(), .default = col_guess())",
     ")",
     "",
     "dm"),

md("## 2. Look at the data (`glimpse`, `head`)",
   "",
   "- `glimpse()` shows the **structure**: every column, its type, and sample values.",
   "- `head(n)` shows the first `n` rows.",
   "",
   "Types you'll see: `<chr>` character (text), `<dbl>` double (number), `<date>` a date."),
code("glimpse(dm)"),
code("head(dm, 5)"),

md("## 3. Pick columns and rows (`select`, `filter`)",
   "",
   "The tidyverse **pipe** `|>` sends the thing on its left into the function on its",
   "right as the first argument. Read `dm |> filter(...)` as *\"take dm, then filter it.\"*",
   "It lets you chain steps left-to-right, top-to-bottom.",
   "",
   "- `select()` picks **columns**.",
   "- `filter()` keeps **rows** matching a condition (`==` means 'is equal to')."),
code("# columns: just the ones we want",
     "dm |> select(SITEID, SUBJID, SEX, RACE, ARM)"),
code("# rows: only subjects on Drug A",
     "dm |> filter(ARM == \"Drug A\")"),

md("## 4. Build new columns (`mutate`, `case_when`)",
   "",
   "`mutate()` adds or changes columns. We:",
   "- build `USUBJID`, unique across the whole study, with `paste(..., sep = \"-\")`;",
   "- decode the `SEX` code (1/2) into a letter using `case_when()` (R's multi-way",
   "  if/else). The final `TRUE ~ NA_character_` catches anything unexpected."),
code("dm2 <- dm |>",
     "  mutate(",
     "    USUBJID = paste(STUDYID, SITEID, SUBJID, sep = \"-\"),",
     "    SEX_C = case_when(",
     "      SEX == 1 ~ \"M\",",
     "      SEX == 2 ~ \"F\",",
     "      TRUE     ~ NA_character_",
     "    )",
     "  ) |>",
     "  select(STUDYID, SITEID, SUBJID, USUBJID, SEX, SEX_C, RACE, ARM)",
     "",
     "dm2"),

md("## 5. Sort rows (`arrange`)",
   "",
   "`arrange()` orders rows by one or more columns (use `desc()` for descending)."),
code("dm2 |> arrange(SITEID, SUBJID)"),

md("## 6. Count and summarize (`count`, `group_by` + `summarise`)",
   "",
   "- `count()` tallies categories — like SAS `PROC FREQ`.",
   "- `group_by()` + `summarise()` computes numbers per group — like `PROC MEANS`.",
   "",
   "We'll read the wide vital-signs file and average weight and systolic BP per visit."),
code("# categories",
     "dm2 |> count(ARM)",
     "dm2 |> count(ARM, SEX_C)   # cross-tab as a tidy table"),
code("vs <- read_csv(",
     "  file.path(datapath, \"vs_raw.csv\"),",
     "  col_types = cols(SITEID = col_character(), SUBJID = col_character(), .default = col_guess())",
     ")",
     "",
     "vs |>",
     "  group_by(VISIT) |>",
     "  summarise(",
     "    n         = n(),",
     "    mean_wt   = round(mean(WEIGHT,  na.rm = TRUE), 1),",
     "    mean_sysbp= round(mean(SYSBP,   na.rm = TRUE), 1),",
     "    .groups = \"drop\"",
     "  )"),

md("## The mental model to carry forward",
   "",
   "| You want to… | tidyverse | (SAS equivalent) |",
   "|---|---|---|",
   "| Read a CSV | `read_csv()` | `PROC IMPORT` |",
   "| See structure | `glimpse()` | `PROC CONTENTS` |",
   "| See rows | `head()` / print | `PROC PRINT` |",
   "| Pick columns | `select()` | `keep` |",
   "| Keep rows | `filter()` | `where` / `if` |",
   "| Build columns | `mutate()` + `case_when()` | DATA step `if/then` |",
   "| Sort | `arrange()` | `PROC SORT` |",
   "| Count categories | `count()` | `PROC FREQ` |",
   "| Summarize numbers | `group_by()`+`summarise()` | `PROC MEANS` |",
   "",
   "Every SDTM domain you build is these verbs combined. Next (Notebook 03) you apply",
   "them to turn raw files into your first real domain."),

md("## YOUR TURN — exercises",
   "",
   "Write your code in the empty cells. Solutions: `../../answer-keys/01_basics_answers.md`.",
   "",
   "**Exercise 1.** From `dm`, show only the subjects at **site 02**.",
   "",
   "**Exercise 2.** Add a column `COUNTRY_GRP` that is `\"US\"` when `COUNTRY == \"USA\"`",
   "and `\"NON-US\"` otherwise. Show `SUBJID`, `COUNTRY`, `COUNTRY_GRP`.",
   "",
   "**Exercise 3.** Using `vs`, find the average `PULSE` and `TEMP` at the **SCREENING**",
   "visit only.",
   "",
   "**Exercise 4 (stretch).** Count subjects per `ARM`. Which site has more Drug A subjects?"),
code("# Exercise 1"),
code("# Exercise 2"),
code("# Exercise 3"),
code("# Exercise 4 (stretch)"),
]

nb = {
    "cells": cells,
    "metadata": {
        "kernelspec": {"display_name": "R", "language": "R", "name": "ir"},
        "language_info": {"name": "R", "version": "4.5.2", "file_extension": ".r",
                          "mimetype": "text/x-r-source", "codemirror_mode": "r",
                          "pygments_lexer": "r"},
    },
    "nbformat": 4,
    "nbformat_minor": 5,
}

with open(OUT, "w") as f:
    json.dump(nb, f, indent=1)
print("wrote", OUT, "-", len(cells), "cells")
