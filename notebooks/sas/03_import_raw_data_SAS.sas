/*===========================================================================*
 |  NOTEBOOK 03 (SAS)  -  IMPORTING RAW CLINICAL DATA                         |
 |  Clinical Programming Bootcamp  -  Module: Reading Raw Data                |
 |---------------------------------------------------------------------------|
 |  GOAL: read all seven ABC-01 raw files, get the TYPES right, and run the     |
 |  six-point inspection checklist from Module 04 so you know exactly what    |
 |  must change before these can become SDTM.                                 |
 |                                                                            |
 |  Pairs with 03_import_raw_data_R.ipynb (same tasks in R).                  |
 |  Walkthrough: 03_import_raw_data_SAS.md                                    |
 |  Reference   : ../../data/raw_data_dictionary.md                           |
 *===========================================================================*/

/*---------------------------------------------------------------------------*
 | 0. SETUP                                                                   |
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


/*---------------------------------------------------------------------------*
 | 1. THE NAIVE IMPORT - AND WHY IT BREAKS IDs                                |
 |    PROC IMPORT guesses each column's type. SITEID "01" and SUBJID "001"    |
 |    are all digits, so it guesses NUMERIC and the leading zeros vanish.     |
 *---------------------------------------------------------------------------*/
proc import datafile = "&datapath/dm_raw.csv" out = dm_naive dbms = csv replace;
    getnames = yes;
    guessingrows = max;
run;

proc contents data = dm_naive varnum;
    title "1a. Naive import - check the TYPE column for SITEID and SUBJID";
run;

proc print data = dm_naive (obs = 3);
    var studyid siteid subjid brthdtc sex race arm;
    title "1b. Naive import - leading zeros are GONE (siteid=1, subjid=1)";
run;


/*---------------------------------------------------------------------------*
 | 2. THE CONTROLLED IMPORT                                                   |
 |    Read the file with a DATA step so WE decide the types.                  |
 |      $  = character      : = read until the delimiter                      |
 |      dsd = treat two commas in a row as a missing value                    |
 |      firstobs = 2 = skip the header row                                    |
 |      truncover = don't skip a row just because the last field is short     |
 *---------------------------------------------------------------------------*/
data dm_raw;
    infile "&datapath/dm_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 brthdtc $11 sex $1
           race $40 ethnic $30 country $3 arm $20
           rficdtc $11 randdtc $11;
    input studyid $ siteid $ subjid $ brthdtc $ sex $ race $ ethnic $
          country $ arm $ rficdtc $ randdtc $;
run;

proc print data = dm_raw (obs = 3);
    var studyid siteid subjid brthdtc sex race arm;
    title "2. Controlled import - siteid=01, subjid=001 preserved";
run;

/* Read the other six files the same way.                                     */
data ds_raw;
    infile "&datapath/ds_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 eosstat $15 eosdt $11 eosreas $40 eosoth $60;
    input studyid $ siteid $ subjid $ eosstat $ eosdt $ eosreas $ eosoth $;
run;

data ex_raw;
    infile "&datapath/ex_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 extrt $20 exdose 8 exdosu $10
           exfreq $10 exroute $15 exstdtc $11 exendtc $11 exintp $1;
    input studyid $ siteid $ subjid $ extrt $ exdose exdosu $ exfreq $
          exroute $ exstdtc $ exendtc $ exintp $;
run;

data ae_raw;
    infile "&datapath/ae_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 aeterm $60 aestdt $12 aeendt $12
           aesev $12 aeser $5 aerel $25 aeout $15;
    input studyid $ siteid $ subjid $ aeterm $ aestdt $ aeendt $
          aesev $ aeser $ aerel $ aeout $;
run;

data cm_raw;
    infile "&datapath/cm_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 cmtrt $40 cmindc $40
           cmstdt $12 cmendt $12 cmdose 8 cmdosu $10 cmroute $15 cmfreq $10;
    input studyid $ siteid $ subjid $ cmtrt $ cmindc $ cmstdt $ cmendt $
          cmdose cmdosu $ cmroute $ cmfreq $;
run;

data vs_raw;
    infile "&datapath/vs_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 visit $15 vsdt $11
           sysbp 8 diabp 8 pulse 8 temp 8 height 8 weight 8 vsnd $1;
    input studyid $ siteid $ subjid $ visit $ vsdt $
          sysbp diabp pulse temp height weight vsnd $;
run;

data lb_raw;
    infile "&datapath/lb_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 visit $15 lbdt $11
           lbtest $40 lborres 8 lborresu $15 lbornrlo 8 lbornrhi 8;
    input studyid $ siteid $ subjid $ visit $ lbdt $
          lbtest $ lborres lborresu $ lbornrlo lbornrhi;
run;


/*===========================================================================*
 |  THE SIX-POINT INSPECTION CHECKLIST  (Module 04)                          |
 *===========================================================================*/

/*---------------------------------------------------------------------------*
 | CHECK 1 - How many rows and columns?                                       |
 |    Expected: dm 8, ds 8, ex 8, ae 9, cm 8, vs 24, lb 48.                  |
 *---------------------------------------------------------------------------*/
proc sql;
    title "Check 1 - row counts (expect 8 / 8 / 8 / 9 / 8 / 24 / 48)";
    select "dm_raw" as dataset length=10, count(*) as n from dm_raw
    union all select "ds_raw", count(*) from ds_raw
    union all select "ex_raw", count(*) from ex_raw
    union all select "ae_raw", count(*) from ae_raw
    union all select "cm_raw", count(*) from cm_raw
    union all select "vs_raw", count(*) from vs_raw
    union all select "lb_raw", count(*) from lb_raw;
quit;

/*---------------------------------------------------------------------------*
 | CHECK 2 - What type is every column? (ID columns must be CHARACTER)        |
 *---------------------------------------------------------------------------*/
proc contents data = dm_raw varnum;
    title "Check 2 - types after the controlled import";
run;

/*---------------------------------------------------------------------------*
 | CHECK 3 - How many distinct subjects? Does every file agree with DM?       |
 |    SUBJID alone is NOT unique - subject 001 exists at BOTH sites.          |
 |    We build a temporary key SITEID||SUBJID to count real people.           |
 *---------------------------------------------------------------------------*/
proc sql;
    title "Check 3a - SUBJID alone (4) vs site+subject (8)";
    select count(distinct subjid)                as distinct_subjid,
           count(distinct catx("-", siteid, subjid)) as distinct_people
    from dm_raw;
quit;

/* Any subject in a child domain that is NOT in DM is a data-integrity error. */
proc sql;
    title "Check 3b - orphan subjects (should return ZERO rows)";
    select distinct "AE" as domain length=2, siteid, subjid from ae_raw
        where catx("-", siteid, subjid) not in
              (select catx("-", siteid, subjid) from dm_raw)
    union all
    select distinct "VS", siteid, subjid from vs_raw
        where catx("-", siteid, subjid) not in
              (select catx("-", siteid, subjid) from dm_raw);
quit;

/*---------------------------------------------------------------------------*
 | CHECK 4 - Which columns have blanks, and what does each blank mean?        |
 *---------------------------------------------------------------------------*/
proc sql;
    title "Check 4a - AE: blank end date = event still ongoing";
    select siteid, subjid, aeterm, aestdt, aeendt
    from ae_raw where aeendt = "";
quit;

proc means data = vs_raw n nmiss;
    var sysbp diabp pulse temp height weight;
    title "Check 4b - VS: HEIGHT has 16 missing (collected at SCREENING only)";
run;

/*---------------------------------------------------------------------------*
 | CHECK 5 - What are the DISTINCT values of every column you'll map to CT?   |
 |    You cannot map values you have not looked at.                           |
 *---------------------------------------------------------------------------*/
proc freq data = dm_raw;
    tables sex race ethnic country arm / nocum nopercent;
    title "Check 5a - DM values to map (note RACE case + trailing space)";
run;

proc freq data = ae_raw;
    tables aesev aeser aerel aeout / nocum nopercent;
    title "Check 5b - AE values to map (mixed case, No vs N)";
run;

/*---------------------------------------------------------------------------*
 | CHECK 6 - What date formats appear? More than one in the same column?      |
 |    A crude but effective test: does the value contain "/" or "-"?          |
 *---------------------------------------------------------------------------*/
data date_fmt;
    set ae_raw (keep = aestdt rename = (aestdt = rawdate));
    length source $10 fmt $15;
    source = "ae.AESTDT";
    if index(rawdate, "/") then fmt = "DD/MM/YYYY";
    else if anyalpha(rawdate) then fmt = "DD-Mon-YYYY";
    else if rawdate = "" then fmt = "(blank)";
    else fmt = "ISO or other";
run;

proc freq data = date_fmt;
    tables fmt / nocum nopercent;
    title "Check 6 - TWO different date formats in one column";
run;

title;


/*===========================================================================*
 |  YOUR TURN  -  exercises                                                   |
 |  Solutions: ../../answer-keys/03_import_answers.md                        |
 *===========================================================================*/

/* EXERCISE 1 -------------------------------------------------------------- *
 | Run the format check (Check 6) on cm_raw.CMSTDT instead of AE.            |
 | How many of each format are there?                                        |
 *------------------------------------------------------------------------- */



/* EXERCISE 2 -------------------------------------------------------------- *
 | How many DISTINCT subjects appear in lb_raw? Which subjects from DM are    |
 | missing lab data? (Hint: build the site+subject key on both sides.)        |
 *------------------------------------------------------------------------- */



/* EXERCISE 3 -------------------------------------------------------------- *
 | List every distinct LBTEST in lb_raw with how many records each has.       |
 | Do all tests appear the same number of times?                              |
 *------------------------------------------------------------------------- */



/* EXERCISE 4 (stretch) ---------------------------------------------------- *
 | vs_raw is WIDE. Without transposing it yet, work out how many ROWS a tall  |
 | SDTM VS dataset would have. Count the non-missing measurements across      |
 | SYSBP, DIABP, PULSE, TEMP, HEIGHT and WEIGHT.                              |
 | (The answer should be 128 - check against ../../data/sdtm/vs.csv)          |
 *------------------------------------------------------------------------- */
