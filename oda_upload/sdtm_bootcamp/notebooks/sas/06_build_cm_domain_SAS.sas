/*===========================================================================*
 |  NOTEBOOK 06 (SAS)  -  BUILD THE CM DOMAIN                                 |
 |  Clinical Programming Bootcamp  -  Module: Interventions & Events          |
 |---------------------------------------------------------------------------|
 |  GOAL: turn cm_raw.csv into a compliant SDTM CM dataset.                   |
 |                                                                            |
 |  CM is an INTERVENTIONS domain. Structurally it is the twin of AE - same   |
 |  skeleton, same --SEQ and --DY derivations - so most of your Notebook 05   |
 |  code transfers directly. Three things are genuinely different:            |
 |     1. the topic variable is CMTRT (what was GIVEN), not CMTERM            |
 |     2. a VARIABLE RENAME: raw CMFREQ  ->  SDTM CMDOSFRQ                    |
 |     3. medications can start LONG BEFORE the study - expect NEGATIVE --DY  |
 |                                                                            |
 |  Spec       : ../../data/mapping_specification.md   (section 5)            |
 |  Target     : ../../data/sdtm/cm.csv                                       |
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
 | 0. READ THE RAW DATA                                                       |
 *---------------------------------------------------------------------------*/
data cm_raw;
    infile "&datapath/cm_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 cmtrt $40 cmindc $40
           cmstdt $12 cmendt $12 cmdose 8 cmdosu $10 cmroute $15 cmfreq $10;
    input studyid $ siteid $ subjid $ cmtrt $ cmindc $ cmstdt $ cmendt $
          cmdose cmdosu $ cmroute $ cmfreq $;
run;

/* Same reference date as AE: first dose, from EX. */
data ex_raw;
    infile "&datapath/ex_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 extrt $20 exdose 8 exdosu $10
           exfreq $10 exroute $15 exstdtc $11 exendtc $11 exintp $1;
    input studyid $ siteid $ subjid $ extrt $ exdose exdosu $ exfreq $
          exroute $ exstdtc $ exendtc $ exintp $;
run;

proc sql;
    create table ref_dates as
    select siteid, subjid,
           min(input(exstdtc, date11.)) as rfstdtc_n
    from ex_raw
    group by siteid, subjid;
quit;


/*---------------------------------------------------------------------------*
 | 1. THE SAME DATE PARSER AS AE                                              |
 |    CM has the identical mixed-format problem: DD/MM/YYYY and DD-Mon-YYYY   |
 |    in the same column. Reuse the logic - do not reinvent it.               |
 *---------------------------------------------------------------------------*/
%macro parse_raw_date(src, out);
    if missing(&src) then &out = .;
    else if index(&src, "/") then &out = input(&src, ddmmyy10.);
    else                          &out = input(&src, date11.);
%mend;


/*---------------------------------------------------------------------------*
 | 2. BUILD CM                                                                |
 *---------------------------------------------------------------------------*/
proc sort data = cm_raw;    by siteid subjid; run;
proc sort data = ref_dates; by siteid subjid; run;

data cm_work;
    merge cm_raw (in = a) ref_dates;
    by siteid subjid;
    if a;

    length usubjid $20 domain $2 cmdecod $40 cmstdtc $10 cmendtc $10
           cmdosfrq $10;
    domain = "CM";

    /* --- 2a. identifiers ------------------------------------------------ */
    usubjid = catx("-", studyid, siteid, subjid);

    /* --- 2b. dates ------------------------------------------------------ */
    %parse_raw_date(cmstdt, _stdt)
    %parse_raw_date(cmendt, _endt)
    if not missing(_stdt) then cmstdtc = put(_stdt, yymmdd10.);
    if not missing(_endt) then cmendtc = put(_endt, yymmdd10.);   /* blank = ongoing */

    /* --- 2c. study day -------------------------------------------------- */
    /*  A medication started years before the study gives a large NEGATIVE   */
    /*  study day. That is CORRECT, not an error - see the checks below.     */
    if not missing(_stdt) and not missing(rfstdtc_n) then do;
        if _stdt >= rfstdtc_n then cmstdy = _stdt - rfstdtc_n + 1;
        else                       cmstdy = _stdt - rfstdtc_n;
    end;
    if not missing(_endt) and not missing(rfstdtc_n) then do;
        if _endt >= rfstdtc_n then cmendy = _endt - rfstdtc_n + 1;
        else                       cmendy = _endt - rfstdtc_n;
    end;

    /* --- 2d. THE RENAME -------------------------------------------------- */
    /*  The CRF field is called "Freq" and the extract column is CMFREQ,      */
    /*  but the SDTM variable is CMDOSFRQ. Renames like this are common -     */
    /*  always map by MEANING, never assume the names line up.                */
    cmdosfrq = cmfreq;

    /* --- 2e. dictionary term --------------------------------------------- */
    /*  ILLUSTRATIVE ONLY. Real CMDECOD comes from WHODrug coding against a   */
    /*  licensed dictionary - it is not derivable in code.                    */
    select (strip(cmtrt));
        when ("Paracetamol")          cmdecod = "PARACETAMOL";
        when ("Vitamin D")            cmdecod = "COLECALCIFEROL";
        when ("Lisinopril")           cmdecod = "LISINOPRIL";
        when ("Amlodipine")           cmdecod = "AMLODIPINE";
        when ("Aspirin")              cmdecod = "ACETYLSALICYLIC ACID";
        when ("Ondansetron")          cmdecod = "ONDANSETRON";
        when ("Hydrocortisone cream") cmdecod = "HYDROCORTISONE";
        when ("Metformin")            cmdecod = "METFORMIN";
        otherwise                     cmdecod = "";
    end;
run;


/*---------------------------------------------------------------------------*
 | 3. DERIVE CMSEQ  (identical pattern to AESEQ)                              |
 *---------------------------------------------------------------------------*/
proc sort data = cm_work;
    by usubjid cmstdtc cmtrt;
run;

data cm;
    set cm_work;
    by usubjid;
    retain cmseq;
    if first.usubjid then cmseq = 1;
    else                  cmseq + 1;
    drop cmstdt cmendt cmfreq _stdt _endt rfstdtc_n siteid subjid;
run;

data cm;
    retain studyid domain usubjid cmseq cmtrt cmdecod cmindc cmdose cmdosu
           cmdosfrq cmroute cmstdtc cmendtc cmstdy cmendy;
    set cm;
run;

proc print data = cm noobs;
    var usubjid cmseq cmtrt cmdecod cmindc cmdose cmdosu cmdosfrq cmstdtc cmstdy;
    title "SDTM CM - built from raw";
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
data sdtm.cm;
    set cm;
run;

%put NOTE: CM saved to &outpath (8 rows);


/*---------------------------------------------------------------------------*
 | 4. CHECK YOUR WORK                                                         |
 *---------------------------------------------------------------------------*/
proc sql;
    title "Check 1 - 8 rows, USUBJID+CMSEQ unique";
    select count(*) as n_rows,
           count(distinct catx("-", usubjid, put(cmseq, 8.))) as n_keys
    from cm;

    title "Check 2 - no CMSTDY equal to 0 (there is no Day 0)";
    select sum(cmstdy = 0) as day_zero from cm;

    title "Check 3 - PRIOR medications: negative study day is CORRECT here";
    select usubjid, cmtrt, cmstdtc, cmstdy
    from cm where cmstdy < 0 order by cmstdy;

    title "Check 4 - ongoing medications keep a NULL end date";
    select usubjid, cmtrt, cmstdtc, cmendtc from cm where missing(cmendtc);
quit;

proc freq data = cm;
    tables cmdosfrq cmroute cmdosu / nocum nopercent;
    title "Check 5 - coded values";
run;

title;


/*===========================================================================*
 |  YOUR TURN  -  exercises                                                   |
 |  Solutions: ../../answer-keys/06_build_cm_answers.md                      |
 *===========================================================================*/

/* EXERCISE 1 -------------------------------------------------------------- *
 | Which medication started EARLIEST relative to the study, and what is its   |
 | CMSTDY? Explain in one sentence why a large negative number is correct.    |
 *------------------------------------------------------------------------- */



/* EXERCISE 2 -------------------------------------------------------------- *
 | Subject 01/001 took Paracetamol for a headache. Find that subject's        |
 | matching ADVERSE EVENT in sdtm/ae.csv. Do the dates line up?               |
 | (This is the Intervention/Event pair from Deck 06.)                        |
 *------------------------------------------------------------------------- */



/* EXERCISE 3 -------------------------------------------------------------- *
 | How many medications are ONGOING (no end date)? List them with their       |
 | indication. Would you expect prior medications to be ongoing? Why?         |
 *------------------------------------------------------------------------- */



/* EXERCISE 4 (stretch) ---------------------------------------------------- *
 | CMDOSU contains a value that is not a mass unit. Find it and explain why   |
 | it is still valid. (Hint: look at the topical medication.)                 |
 *------------------------------------------------------------------------- */



/* EXERCISE 5 (stretch) ---------------------------------------------------- *
 | Compare your CM against ../../data/sdtm/cm.csv with PROC COMPARE.          |
 *------------------------------------------------------------------------- */
