/*===========================================================================*
 |  NOTEBOOK 07 (SAS)  -  BUILD THE EX DOMAIN                                 |
 |  Clinical Programming Bootcamp  -  Module: Interventions & Events          |
 |---------------------------------------------------------------------------|
 |  GOAL: turn ex_raw.csv into a compliant SDTM EX dataset.                   |
 |                                                                            |
 |  EX (Exposure) records the STUDY TREATMENT itself. It is the simplest      |
 |  Interventions domain to build - and the most important one in the study,  |
 |  because almost every other domain depends on it:                          |
 |                                                                            |
 |      EX  -->  RFSTDTC in DM  -->  --DY in AE, CM, VS, LB, DS               |
 |                                                                            |
 |  Get EX wrong and every study day in the submission is wrong.              |
 |                                                                            |
 |  Three things to watch for:                                                |
 |     1. another RENAME: raw EXFREQ  ->  SDTM EXDOSFRQ                       |
 |     2. EXINTP is COLLECTED BUT NOT SUBMITTED - it is dropped               |
 |     3. EXSTDY is 1 for everyone. Understand WHY before moving on.          |
 |                                                                            |
 |  Spec       : ../../data/mapping_specification.md   (section 3)            |
 |  Target     : ../../data/sdtm/ex.csv                                       |
 *===========================================================================*/

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
 | 0. READ THE RAW DATA                                                       |
 *---------------------------------------------------------------------------*/
data ex_raw;
    infile "&datapath/ex_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 extrt $20 exdose 8 exdosu $10
           exfreq $10 exroute $15 exstdtc $11 exendtc $11 exintp $1;
    input studyid $ siteid $ subjid $ extrt $ exdose exdosu $ exfreq $
          exroute $ exstdtc $ exendtc $ exintp $;
run;

/*  NOTE: unlike AE and CM, every EX date uses ONE format - DD-MMM-YYYY.
    The dosing dates come from the drug-accountability page, which uses a
    single date control, so no per-value format detection is needed here.
    Always confirm this by looking at the raw file rather than assuming.     */


/*---------------------------------------------------------------------------*
 | 1. DERIVE THE REFERENCE START DATE                                         |
 |    RFSTDTC = the subject's FIRST dose. In this study each subject has      |
 |    exactly one EX record, but write it as a MIN so the code still works    |
 |    when a subject has several dosing periods.                              |
 *---------------------------------------------------------------------------*/
proc sql;
    create table ref_dates as
    select siteid, subjid,
           min(input(exstdtc, date11.)) as rfstdtc_n
    from ex_raw
    group by siteid, subjid;
quit;


/*---------------------------------------------------------------------------*
 | 2. BUILD EX                                                                |
 *---------------------------------------------------------------------------*/
proc sort data = ex_raw;    by siteid subjid; run;
proc sort data = ref_dates; by siteid subjid; run;

data ex_work;
    merge ex_raw (in = a) ref_dates;
    by siteid subjid;
    if a;

    length usubjid $20 domain $2 exdosfrq $10 _stdtc $10 _endtc $10;
    domain = "EX";

    /* --- 2a. identifiers ------------------------------------------------ */
    usubjid = catx("-", studyid, siteid, subjid);

    /* --- 2b. dates to ISO 8601 ------------------------------------------ */
    _stdt = input(exstdtc, date11.);
    _endt = input(exendtc, date11.);
    if not missing(_stdt) then _stdtc = put(_stdt, yymmdd10.);
    if not missing(_endt) then _endtc = put(_endt, yymmdd10.);

    /* --- 2c. study day --------------------------------------------------- */
    if not missing(_stdt) and not missing(rfstdtc_n) then do;
        if _stdt >= rfstdtc_n then exstdy = _stdt - rfstdtc_n + 1;
        else                       exstdy = _stdt - rfstdtc_n;
    end;
    if not missing(_endt) and not missing(rfstdtc_n) then do;
        if _endt >= rfstdtc_n then exendy = _endt - rfstdtc_n + 1;
        else                       exendy = _endt - rfstdtc_n;
    end;

    /* --- 2d. THE RENAME (again) ------------------------------------------ */
    exdosfrq = exfreq;

    /* --- 2e. EXINTP IS NOT SUBMITTED ------------------------------------- */
    /*  "Was dosing interrupted?" is collected on the CRF because the site    */
    /*  needs to answer it, but there is no SDTM EX variable for it and we    */
    /*  do not invent one. A real interruption would be represented by        */
    /*  SPLITTING the exposure into multiple EX records with a gap between    */
    /*  them - EXSEQ 1 and EXSEQ 2 - not by a flag.                           */
    /*  It is simply dropped below. Collected != submitted.                   */

    drop exstdtc exendtc;          /* the RAW character versions */
run;

data ex_work;
    set ex_work (rename = (_stdtc = exstdtc  _endtc = exendtc));
run;


/*---------------------------------------------------------------------------*
 | 3. DERIVE EXSEQ                                                            |
 *---------------------------------------------------------------------------*/
proc sort data = ex_work;
    by usubjid exstdtc extrt;
run;

data ex;
    set ex_work;
    by usubjid;
    retain exseq;
    if first.usubjid then exseq = 1;
    else                  exseq + 1;
    drop exfreq exintp _stdt _endt rfstdtc_n siteid subjid;
run;

data ex;
    retain studyid domain usubjid exseq extrt exdose exdosu exdosfrq exroute
           exstdtc exendtc exstdy exendy;
    set ex;
run;

proc print data = ex noobs;
    var usubjid exseq extrt exdose exdosu exdosfrq exroute exstdtc exendtc exstdy exendy;
    title "SDTM EX - built from raw";
run;


/*---------------------------------------------------------------------------*
 | SAVE THE FINISHED DOMAIN                                                   |
 |                                                                            |
 |  Everything above lives in WORK, which SAS DELETES when the session ends.  |
 |  Real SDTM datasets are permanent: they are written to a study library,    |
 |  and later exported to XPT v5 for submission.                              |
 |                                                                            |
 |  SDTM is the libref 00_setup.sas pointed at your output folder. Writing    |
 |  "sdtm.<domain>" instead of "<domain>" is the whole difference between a   |
 |  temporary dataset and a deliverable.                                      |
 *---------------------------------------------------------------------------*/
data sdtm.ex;
    set ex;
run;

%put NOTE: EX saved to &outpath (8 rows);


/*---------------------------------------------------------------------------*
 | 4. CHECK YOUR WORK                                                         |
 *---------------------------------------------------------------------------*/
proc sql;
    title "Check 1 - 8 rows, one per subject, USUBJID+EXSEQ unique";
    select count(*) as n_rows,
           count(distinct usubjid) as n_subjects,
           count(distinct catx("-", usubjid, put(exseq, 8.))) as n_keys
    from ex;

    title "Check 2 - EXSTDY must be 1 for EVERY subject (see Exercise 1)";
    select sum(exstdy ne 1) as not_day_one from ex;

    title "Check 3 - no end date before its start date";
    select usubjid, exstdtc, exendtc from ex where exendtc < exstdtc;

    title "Check 4 - treatment duration in days";
    select usubjid, extrt, exstdy, exendy, (exendy - exstdy + 1) as days_dosed
    from ex order by days_dosed;

    title "Check 5 - EXINTP must NOT have survived into EX";
    select name from dictionary.columns
    where libname = "WORK" and memname = "EX" and upcase(name) = "EXINTP";
quit;

proc freq data = ex;
    tables extrt * exdose / list nocum nopercent;
    title "Check 6 - dose by treatment arm";
run;

title;


/*===========================================================================*
 |  YOUR TURN  -  exercises                                                   |
 |  Solutions: ../../answer-keys/07_build_ex_answers.md                      |
 *===========================================================================*/

/* EXERCISE 1 -------------------------------------------------------------- *
 | Every EXSTDY equals 1. Explain WHY in one sentence - and say whether that  |
 | would still be true if RFSTDTC came from the informed-consent date         |
 | instead of first dose.                                                     |
 *------------------------------------------------------------------------- */



/* EXERCISE 2 -------------------------------------------------------------- *
 | One subject dosed for far fewer days than the others. Find them, then      |
 | look up the same USUBJID in sdtm/ds.csv and sdtm/ae.csv. Write the         |
 | subject's story in two sentences.                                          |
 *------------------------------------------------------------------------- */



/* EXERCISE 3 -------------------------------------------------------------- *
 | EXDOSE is 0 for every Placebo subject. Is that correct, or should it be    |
 | missing? Justify your answer.                                              |
 *------------------------------------------------------------------------- */



/* EXERCISE 4 (stretch) ---------------------------------------------------- *
 | Suppose subject ABC-01-01-001 had interrupted dosing from 10-MAR to        |
 | 14-MAR. Sketch the EX records you would submit. How many rows, and what    |
 | are their EXSEQ, EXSTDTC and EXENDTC values?                               |
 *------------------------------------------------------------------------- */



/* EXERCISE 5 (stretch) ---------------------------------------------------- *
 | Confirm that the RFSTDTC you derived here matches DM exactly. Why does     |
 | this check matter more than any other in the notebook?                     |
 *------------------------------------------------------------------------- */



/* EXERCISE 6 (stretch) ---------------------------------------------------- *
 | Compare your EX against ../../data/sdtm/ex.csv with PROC COMPARE.          |
 *------------------------------------------------------------------------- */
