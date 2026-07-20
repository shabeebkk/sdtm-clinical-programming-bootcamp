/*===========================================================================*
 |  NOTEBOOK 01 (SAS)  -  SAS BASICS FOR CLINICAL PROGRAMMING                 |
 |  Clinical Programming Bootcamp  -  Module: Tooling                         |
 |---------------------------------------------------------------------------|
 |  GOAL: get comfortable running SAS and doing the handful of operations     |
 |  you will use in every SDTM exercise: read a CSV, look at it, create a     |
 |  new dataset, make new variables, subset, sort, and summarize.             |
 |                                                                            |
 |  No prior SAS knowledge assumed. Read the comments top to bottom and run   |
 |  one section at a time. The matching walkthrough (01_sas_basics_SAS.md)    |
 |  explains each concept in plain English. Exercises are at the bottom.      |
 |                                                                            |
 |  DATA: synthetic study ABC-01 (see ../../data/raw_data_dictionary.md)      |
 *===========================================================================*/

/*---------------------------------------------------------------------------*
 | 0. TELL SAS WHERE THE DATA IS                                             |
 |    A "library" is just a nickname for a folder of datasets.               |
 |    Edit the path below to point at the bootcamp's /data folder.           |
 |    (Use a full path if the relative one does not resolve on your system.) |
 *---------------------------------------------------------------------------*/
/*  WHERE IS THE DATA?
    Run 00_setup.sas first and this notebook uses the path you set there.
    Run this notebook on its own and it falls back to the local default below.
    On SAS OnDemand for Academics, edit 00_setup.sas - not this line.        */
%macro _setpath;
    %global datapath outpath;
    %if %superq(datapath) = %then
        %let datapath = /Volumes/D Drive/SDTM Training/Bootcamp/data;     /* local default */
    %if %superq(outpath) = %then
        %let outpath  = /Volumes/D Drive/SDTM Training/Bootcamp/output;   /* local default */

    /*  Create the output folder if it is missing. DCREATE takes the new
        folder's NAME and its PARENT separately, so we split the path.    */
    %if %sysfunc(fileexist(&outpath)) = 0 %then %do;
        %local nm pa rc;
        %let nm = %scan(&outpath, -1, %str(/));
        %let pa = %substr(&outpath, 1, %eval(%length(&outpath) - %length(&nm) - 1));
        %let rc = %sysfunc(dcreate(&nm, &pa));
    %end;

    /*  Assign SDTM only if it is not already assigned, so running 00_setup.sas
        first always wins over this fallback.                              */
    %if %sysfunc(libref(sdtm)) ne 0 %then %do;
        libname sdtm "&outpath";
    %end;

    %put NOTE: datapath = &datapath;
    %put NOTE: outpath  = &outpath   (libref SDTM);
%mend;
%_setpath;

/* A libname points a nickname (here: RAW) at a folder of SAS datasets.
   We are reading CSVs, so we mostly use the raw text path via PROC IMPORT,
   but we define RAW too so you see what a library looks like.               */
libname raw "&datapath";


/*---------------------------------------------------------------------------*
 | 1. READ A CSV FILE  ->  PROC IMPORT                                        |
 |    This creates a SAS dataset called DM in the temporary WORK library.     |
 |    WORK is scratch space that is wiped when SAS closes.                     |
 *---------------------------------------------------------------------------*/
proc import
        datafile = "&datapath/dm_raw.csv"
        out      = work.dm            /* dataset name = WORK.DM               */
        dbms     = csv
        replace;
    getnames = yes;                   /* first row holds the column names     */
    guessingrows = max;               /* scan all rows to guess column types  */
run;

/* NOTE: PROC IMPORT guesses types. SUBJID like "001" may come in as the
   number 1 (losing the leading zeros). That is a real-world gotcha; the
   domain-building notebooks read such ID columns as text on purpose.        */


/*---------------------------------------------------------------------------*
 | 2. LOOK AT THE DATA                                                        |
 |    PROC CONTENTS = the "shape": variables, types, lengths.                 |
 |    PROC PRINT    = the actual rows.                                        |
 *---------------------------------------------------------------------------*/
proc contents data = work.dm;
run;

proc print data = work.dm (obs = 5);   /* first 5 rows only                  */
    title "DM raw - first 5 rows";
run;


/*---------------------------------------------------------------------------*
 | 3. THE DATA STEP: MAKE A NEW DATASET FROM AN OLD ONE                       |
 |    A DATA step reads one row at a time, top to bottom, and writes rows     |
 |    out. Here we:                                                           |
 |      - build USUBJID (unique across the whole study)                        |
 |      - turn the SEX code (1/2) into a letter (M/F)                          |
 |      - keep only the columns we care about                                 |
 *---------------------------------------------------------------------------*/
data dm2;
    set work.dm;                       /* read every row of WORK.DM           */

    length usubjid $20 sex_c $1;       /* declare text length BEFORE using    */

    /* catx joins pieces with a separator, skipping missing values.
       PROC IMPORT reads SITEID and SUBJID as NUMBERS (their values are all
       digits), so put(..., z2./z3.) turns them back into zero-padded TEXT:
       1 -> "01", 1 -> "001". Result: "ABC-01-01-001".                        */
    usubjid = catx("-", studyid, put(siteid, z2.), put(subjid, z3.));

    /* Recode the SEX code into a letter using IF/THEN/ELSE.                  */
    if sex = 1 then sex_c = "M";
    else if sex = 2 then sex_c = "F";
    else sex_c = "";                   /* unknown / missing                    */

    keep studyid siteid subjid usubjid sex sex_c race arm;
run;

proc print data = dm2;
    title "DM2 - with USUBJID and decoded sex";
run;


/*---------------------------------------------------------------------------*
 | 4. SUBSET ROWS  ->  WHERE                                                  |
 |    Keep only the subjects on Drug A.                                       |
 *---------------------------------------------------------------------------*/
data drugA;
    set dm2;
    where arm = "Drug A";
run;

proc print data = drugA;
    title "Subjects on Drug A only";
run;


/*---------------------------------------------------------------------------*
 | 5. SORT ROWS  ->  PROC SORT                                               |
 |    Order by site then subject. Sorting matters later for merges and --SEQ. |
 *---------------------------------------------------------------------------*/
proc sort data = dm2 out = dm_sorted;
    by siteid subjid;
run;

proc print data = dm_sorted;
    title "DM2 sorted by site and subject";
run;


/*---------------------------------------------------------------------------*
 | 6. COUNT AND SUMMARIZE  ->  PROC FREQ, PROC MEANS                          |
 *---------------------------------------------------------------------------*/
proc freq data = dm2;
    tables arm sex_c arm*sex_c;        /* frequencies + a cross-tab           */
    title "Counts by arm and sex";
run;

/* PROC MEANS needs a NUMERIC variable. Let's read vital signs and average
   weight. First import the wide vital-signs file.                           */
proc import
        datafile = "&datapath/vs_raw.csv"
        out      = work.vs
        dbms     = csv
        replace;
    getnames = yes;
    guessingrows = max;
run;

proc means data = work.vs n mean min max maxdec = 1;
    class visit;                        /* one summary row per visit           */
    var weight sysbp;                   /* numeric columns to summarize        */
    title "Average weight and systolic BP by visit";
run;

title;   /* clear the title */


/*===========================================================================*
 |  YOUR TURN  -  exercises                                                   |
 |  Write your code below each task. Solutions: ../../answer-keys/            |
 |  01_basics_answers.md                                                      |
 *===========================================================================*/

/* EXERCISE 1 -------------------------------------------------------------- *
 | From WORK.DM, print only the subjects at SITE 02.                          |
 | Hint: a WHERE statement in PROC PRINT, or a DATA step.                     |
 *------------------------------------------------------------------------- */



/* EXERCISE 2 -------------------------------------------------------------- *
 | In a DATA step, create a variable COUNTRY_GRP that is "US" when COUNTRY    |
 | = "USA" and "NON-US" otherwise. Print USUBJID-less is fine; show          |
 | SUBJID, COUNTRY, COUNTRY_GRP.                                              |
 *------------------------------------------------------------------------- */



/* EXERCISE 3 -------------------------------------------------------------- *
 | Using WORK.VS, produce the average PULSE and TEMP at the SCREENING visit   |
 | only. Hint: WHERE + PROC MEANS.                                           |
 *------------------------------------------------------------------------- */



/* EXERCISE 4 (stretch) ---------------------------------------------------- *
 | How many subjects are there per ARM? Produce a one-line-per-arm count,     |
 | and note: does site 01 or site 02 have more Drug A subjects?               |
 *------------------------------------------------------------------------- */
