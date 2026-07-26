/*===========================================================================*
 |  NOTEBOOK 04 (SAS)  -  BUILD THE DM DOMAIN                                 |
 |  Clinical Programming Bootcamp  -  Module: Building SDTM Domains I         |
 |---------------------------------------------------------------------------|
 |  GOAL: turn dm_raw.csv (+ ex_raw.csv + ds_raw.csv) into a compliant SDTM   |
 |  DM dataset.                                                               |
 |  DM is a SPECIAL PURPOSE domain: ONE ROW PER SUBJECT, and it has no --SEQ. |
 |                                                                            |
 |  You will:                                                                 |
 |     1. build USUBJID                                                       |
 |     2. derive AGE from the birth date                                      |
 |     3. apply Controlled Terminology to SEX, RACE, ETHNIC                   |
 |     4. derive ARMCD from ARM                                               |
 |     5. bring RFSTDTC / RFENDTC from EX and RFPENDTC from DS                |
 |     6. assemble the variables in SDTM order and check your work            |
 |                                                                            |
 |  Spec       : ../../data/mapping_specification.md   (section 2)            |
 |  Target      : ../../data/sdtm/dm.csv               (the finished answer)  |
 |  Pairs with : 04_build_dm_domain_R.ipynb                                   |
 |  ATTEMPT IT FIRST, then compare against the target.                        |
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
 | 0. READ THE RAW DATA (controlled types - see Notebook 03)                  |
 *---------------------------------------------------------------------------*/
data dm_raw;
    infile "&datapath/dm_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 brthdtc $11 sex $1
           race $40 ethnic $30 country $3 arm $20
           rficdtc $11 randdtc $11;
    input studyid $ siteid $ subjid $ brthdtc $ sex $ race $ ethnic $
          country $ arm $ rficdtc $ randdtc $;
run;

/* End-of-study comes from the DISPOSITION form, not from demographics.
   Demographics is completed at screening; disposition when the subject leaves. */
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


/*---------------------------------------------------------------------------*
 | 1. REFERENCE DATES FROM EX                                                 |
 |    RFSTDTC = date of FIRST dose  -> this defines Study Day 1 everywhere.   |
 |    RFENDTC = date of LAST dose.                                            |
 |    Our EX has exactly one row per subject, so min/max is trivial - but     |
 |    written this way it still works if a subject has several dosing rows.   |
 *---------------------------------------------------------------------------*/
proc sql;
    create table ref_dates as
    select siteid,
           subjid,
           /* NOTE: DD-MMM-YYYY text does NOT sort chronologically, so we
              convert to a SAS date first, take min/max, then format back. */
           /*  Named with an _R suffix because these still hold the RAW
               DD-MMM-YYYY text (11 chars). The SDTM variables RFSTDTC and
               RFENDTC are ISO 8601 and only 10 chars - keeping the two
               apart lets us declare each at its correct length.          */
           put(min(input(exstdtc, date11.)), date11.) as rfstdtc_r length = 11,
           put(max(input(exendtc, date11.)), date11.) as rfendtc_r length = 11
    from ex_raw
    group by siteid, subjid;
quit;


/*---------------------------------------------------------------------------*
 | 2. BUILD DM                                                                |
 *---------------------------------------------------------------------------*/
proc sort data = dm_raw;    by siteid subjid; run;
proc sort data = ref_dates; by siteid subjid; run;
proc sort data = ds_raw;    by siteid subjid; run;

data dm;
    /*  LENGTH MUST COME FIRST - before MERGE.
        A variable's length is fixed the moment SAS first meets it. If MERGE
        runs first, the incoming lengths win, your LENGTH statement is
        ignored, and SAS writes:
            WARNING: Length of character variable rfstdtc has already been
                     set. Use the LENGTH statement as the very first
                     statement in the DATA STEP...
        The program still runs, so it is easy to ignore - but the submitted
        variable then has the wrong length, which matters in a real XPT.

        Note this is exactly why the raw dates arrive as RFSTDTC_R, not
        RFSTDTC: declaring the SDTM variable as $10 and then merging an
        11-character DD-MMM-YYYY value into it would TRUNCATE it to
        "01-MAR-202" and every date derived from it would be wrong.      */
    length studyid $10 domain $2 usubjid $20 subjid $5
           rfstdtc rfendtc rfxstdtc rfxendtc rficdtc rfpendtc $10
           dthdtc $10 dthfl $1 siteid $3 age 8 ageu $10 sex $1
           race $40 ethnic $30 armcd $20 arm $20 actarmcd $20 actarm $20
           country $3;

    merge dm_raw (in = a rename = (rficdtc = rficdtc_r))
          ref_dates
          ds_raw (keep = siteid subjid eosdt);
    by siteid subjid;
    if a;                                  /* keep every DM subject */

    domain = "DM";

    /* --- 2a. USUBJID: unique across the WHOLE study --------------------- */
    usubjid = catx("-", studyid, siteid, subjid);

    /* --- 2b. AGE: completed years from birth date to informed consent ---
       The RAW dates are DD-MMM-YYYY (e.g. 14-MAY-1969) = 11 CHARACTERS.
       Use DATE11. -- the informat width must cover the separators. DATE9.
       would read only "14-MAY-19" and silently give you 2019 instead of 1969.
       intck("year", a, b, "C") counts COMPLETED years ("C" = continuous),
       which correctly handles a birthday that has not yet occurred.        */
    if brthdtc ne "" and rficdtc_r ne "" then
        age = intck("year", input(brthdtc, date11.), input(rficdtc_r, date11.), "C");
    ageu = "YEARS";

    /* --- 2c. Controlled Terminology ------------------------------------- */
    /*  THIS IS YOUR FIRST CONTROLLED TERMINOLOGY DECISION, and you are making
        it before the rules have been taught. That is deliberate: you will
        apply CT in five domains over the next four days, and DAY 8 (deck 08
        and notebook 10) is where codelists, extensible versus non-extensible,
        which version is authoritative, and how to map SAFELY are covered.

        For now: follow the mapping specification, and do not invent values.

        One thing to notice as you go - the ELSE below sets SEX to blank when
        the code is neither 1 nor 2. Any value nobody anticipated disappears
        SILENTLY: no error, no warning, no row count change. It is the right
        shape of code for today and the wrong shape for a real study, and
        undoing exactly that habit is what Day 8 is for. Watch for the same
        pattern in the domains you build between now and then.             */
    /* SEX is an EDC code: 1 = Male, 2 = Female                             */
    if      sex = "1" then sex = "M";
    else if sex = "2" then sex = "F";
    else                   sex = "";     /* <- the silent blank. See Day 8. */

    /* RACE / ETHNIC arrive as free text in mixed case.
       strip() removes leading/trailing blanks, upcase() normalises case.   */
    race   = upcase(strip(race));
    ethnic = upcase(strip(ethnic));
    /* After normalising, these already match CDISC CT values for this study.
       In a real study you would map each value explicitly and FAIL LOUDLY
       on anything unexpected - see the exercise at the end.                */

    /* --- 2d. ARM / ARMCD ------------------------------------------------ */
    /* ARMCD is the short code: max 20 chars, no spaces.                    */
    if      arm = "Drug A"  then armcd = "A";
    else if arm = "Placebo" then armcd = "P";
    /* Actual arm = planned arm here: every subject received their assignment */
    actarm   = arm;
    actarmcd = armcd;

    /* --- 2e. Reference dates --------------------------------------------
       The raw dates are DD-MMM-YYYY (11 chars). SDTM --DTC variables must be
       ISO 8601 CHARACTER, so read with date11. and write out with yymmdd10. */
    rfstdtc  = put(input(rfstdtc_r, date11.), yymmdd10.);
    rfendtc  = put(input(rfendtc_r, date11.), yymmdd10.);
    rficdtc  = put(input(rficdtc_r, date11.), yymmdd10.);
    rfxstdtc = rfstdtc;      /* first study-treatment exposure */
    rfxendtc = rfendtc;      /* last  study-treatment exposure */
    if eosdt ne "" then rfpendtc = put(input(eosdt, date11.), yymmdd10.);
    dthdtc = "";             /* no deaths in this study        */
    dthfl  = "";

    keep studyid domain usubjid subjid rfstdtc rfendtc rfxstdtc rfxendtc
         rficdtc rfpendtc dthdtc dthfl siteid age ageu sex race ethnic
         armcd arm actarmcd actarm country;
run;

/* Put the variables in SDTM order (RETAIN sets variable position).          */
data dm;
    retain studyid domain usubjid subjid rfstdtc rfendtc rfxstdtc rfxendtc
           rficdtc rfpendtc dthdtc dthfl siteid age ageu sex race ethnic
           armcd arm actarmcd actarm country;
    set dm;
run;

proc sort data = dm; by usubjid; run;

proc print data = dm noobs;
    var usubjid subjid siteid age ageu sex race armcd arm country rfstdtc;
    title "SDTM DM - built from raw";
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
data sdtm.dm;
    set dm;
run;

%put NOTE: DM saved to &outpath (8 rows);


/*---------------------------------------------------------------------------*
 | 2b. BUILD DS  -  Disposition                                               |
 |                                                                            |
 |  DM gave you RFPENDTC from the disposition form. DS is that same form as    |
 |  its own domain, and it is where the study's MILESTONES live.               |
 |                                                                            |
 |  DS holds two different kinds of record, told apart by DSCAT:               |
 |     PROTOCOL MILESTONE  planned checkpoints every subject passes            |
 |                         -> informed consent, randomization                  |
 |     DISPOSITION EVENT   how the subject LEFT the study                      |
 |                         -> completed, or the reason they discontinued       |
 |                                                                            |
 |  So ONE subject produces THREE DS records from TWO raw files: two dates     |
 |  off the demographics form and one off the disposition form. That is the    |
 |  first time you build a domain whose rows are not a copy of raw rows -      |
 |  you are ASSEMBLING records from facts scattered across forms.              |
 |                                                                            |
 |  8 subjects x 3 records = 24 rows.                                          |
 *---------------------------------------------------------------------------*/
data ds_build;
    length studyid $10 domain $2 usubjid $20 dsterm $60 dsdecod $40
           dscat $20 dsstdtc $10;
    keep studyid domain usubjid dsterm dsdecod dscat dsstdtc dsstdy;
    merge dm_raw (in = a rename = (rficdtc = rficdtc_r))
          ref_dates
          ds_raw (keep = siteid subjid eosstat eosdt eosreas);
    by siteid subjid;
    if a;

    domain  = "DS";
    usubjid = catx("-", studyid, siteid, subjid);
    _rfst   = input(rfstdtc_r, date11.);       /* numeric first-dose, for --DY */

    /*  Record 1 - informed consent (a protocol milestone) */
    dscat = "PROTOCOL MILESTONE";
    dsterm = "Informed consent obtained";  dsdecod = "INFORMED CONSENT OBTAINED";
    _dt = input(rficdtc_r, date11.);
    link emit;

    /*  Record 2 - randomization (a protocol milestone) */
    dscat = "PROTOCOL MILESTONE";
    dsterm = "Randomized";  dsdecod = "RANDOMIZED";
    _dt = input(randdtc, date11.);
    link emit;

    /*  Record 3 - how the subject left the study (a disposition event).
        DSTERM keeps the descriptive text; DSDECOD is the CT term.        */
    dscat = "DISPOSITION EVENT";
    if upcase(strip(eosstat)) = "COMPLETED" then do;
        dsterm = "Completed study";  dsdecod = "COMPLETED";
    end;
    else do;
        dsterm  = catx(": ", "Discontinued", strip(eosreas));
        dsdecod = upcase(strip(eosreas));      /* e.g. ADVERSE EVENT */
    end;
    _dt = input(eosdt, date11.);
    link emit;
    return;

emit:
    /*  --DY from RFSTDTC. There is no Day 0: consent lands on a NEGATIVE day. */
    if not missing(_dt) then do;
        dsstdtc = put(_dt, yymmdd10.);
        if _dt >= _rfst then dsstdy = _dt - _rfst + 1;
        else                 dsstdy = _dt - _rfst;
    end;
    else do; dsstdtc = ""; dsstdy = .; end;
    output;
return;
run;

/*  DSSEQ: sort into date order (then category as a tiebreaker) so the three
    records number 1, 2, 3 in the order they actually happened.            */
proc sort data = ds_build; by usubjid dsstdtc dscat; run;

data ds;
    set ds_build;
    by usubjid;
    retain dsseq;
    if first.usubjid then dsseq = 1; else dsseq + 1;
run;

data ds;
    retain studyid domain usubjid dsseq dsterm dsdecod dscat dsstdtc dsstdy;
    set ds;
run;

data sdtm.ds;
    set ds;
run;

%put NOTE: DS saved to &outpath (24 rows);

proc print data = ds (obs = 6) noobs;
    var usubjid dsseq dsterm dsdecod dscat dsstdtc dsstdy;
    title "SDTM DS - first 2 subjects (3 milestone records each)";
run;
title;


/*---------------------------------------------------------------------------*
 | 3. CHECK YOUR WORK                                                         |
 |    These are the same checks listed in mapping_specification.md section 9. |
 *---------------------------------------------------------------------------*/
proc sql;
    title "Check 1 - 8 rows, 8 distinct USUBJID";
    select count(*) as n_rows, count(distinct usubjid) as n_usubjid from dm;

    title "Check 2 - no missing Required variables (expect 0)";
    select sum(missing(usubjid)) as miss_usubjid,
           sum(missing(sex))     as miss_sex,
           sum(missing(armcd))   as miss_armcd,
           sum(missing(country)) as miss_country
    from dm;

    title "Check 3 - CT values only";
    select sex, count(*) as n from dm group by sex;
quit;

proc freq data = dm;
    tables race ethnic armcd / nocum nopercent;
    title "Check 4 - RACE / ETHNIC / ARMCD after mapping";
run;

title;


/*===========================================================================*
 |  YOUR TURN  -  exercises                                                   |
 |  Solutions: ../../answer-keys/04_build_dm_answers.md                      |
 *===========================================================================*/

/* EXERCISE 1 -------------------------------------------------------------- *
 | AGE is currently derived at INFORMED CONSENT. Some studies derive it at    |
 | first dose instead. Create AGE_ALT using RFSTDTC and compare - which       |
 | subjects (if any) get a different age, and why?                            |
 *------------------------------------------------------------------------- */



/* EXERCISE 2 -------------------------------------------------------------- *
 | Our code trusts that upcase(strip(race)) always lands on a valid CT value. |
 | That is fine here but dangerous in real life. Write a check that lists any  |
 | RACE value NOT in the allowed set:                                         |
 |    WHITE, ASIAN, BLACK OR AFRICAN AMERICAN,                                |
 |    AMERICAN INDIAN OR ALASKA NATIVE,                                       |
 |    NATIVE HAWAIIAN OR OTHER PACIFIC ISLANDER, OTHER, UNKNOWN, NOT REPORTED |
 | It should return zero rows for this study.                                 |
 *------------------------------------------------------------------------- */



/* EXERCISE 3 -------------------------------------------------------------- *
 | Subject 01/004 discontinued early. Using EOSSTAT and EOSDT from ds_raw,    |
 | list each subject with their completion status and how many days they were |
 | on treatment (RFENDTC - RFSTDTC + 1).                                      |
 *------------------------------------------------------------------------- */



/* EXERCISE 4 (stretch) ---------------------------------------------------- *
 | Compare your DM against the reference: ../../data/sdtm/dm.csv              |
 | Import it, then use PROC COMPARE to prove they match.                      |
 |    proc compare base=... compare=... ;  run;                              |
 | Any difference is a bug in your mapping - or a deliberate choice you       |
 | should be able to explain.                                                 |
 *------------------------------------------------------------------------- */
