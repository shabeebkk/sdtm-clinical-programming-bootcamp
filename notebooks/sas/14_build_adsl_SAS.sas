/*===========================================================================*
 |  NOTEBOOK 14 (SAS)  -  BUILD ADSL                                          |
 |  Clinical Programming Bootcamp  -  Module: Why ADaM, and ADSL              |
 |---------------------------------------------------------------------------|
 |  GOAL: turn the SDTM datasets DM, DS and VS into ADSL - the Subject-Level  |
 |  Analysis Dataset.                                                         |
 |                                                                            |
 |  ADSL is ONE ROW PER SUBJECT and it is the single source of subject-level  |
 |  truth for the whole study. Every other analysis dataset COPIES its        |
 |  treatment variables, population flags and treatment dates from here.      |
 |  If ADSL is wrong, everything downstream is wrong in the same way.         |
 |                                                                            |
 |  You will:                                                                 |
 |     1. read the SDTM datasets you built in the SDTM course                 |
 |     2. derive the treatment variables (TRT01P / TRT01PN / TRT01A)          |
 |     3. convert SDTM character dates into NUMERIC ADaM dates                |
 |     4. derive disposition (EOSSTT, DCSREAS) from DS                        |
 |     5. derive the population flags (SAFFL, ITTFL, COMPLFL)                 |
 |     6. derive baseline HEIGHT, WEIGHT and BMI - the hard part              |
 |     7. assemble, label, and check against the reference                    |
 |                                                                            |
 |  Spec      : ../../data/adam_specification.md      (section 1)             |
 |  Target    : ../../data/adam/adsl.csv              (the finished answer)   |
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

    %local nm pa rc;
    %if %sysfunc(fileexist(&outpath)) = 0 %then %do;
        %let nm = %scan(&outpath, -1, %str(/));
        %let pa = %substr(&outpath, 1, %eval(%length(&outpath) - %length(&nm) - 1));
        %let rc = %sysfunc(dcreate(&nm, &pa));
    %end;

    /*  ADAM is where YOUR analysis datasets are saved. It gets its OWN
        subfolder, &outpath/adam, so the ADAM library shows only the datasets
        you built here - never the SDTM domains, which the SDTM notebooks write
        to &outpath itself. (A libref does not recurse into subfolders.)
        It is also deliberately NOT data/adam - that holds the REFERENCE
        answers, and writing over them would destroy what you check against. */
    %if %sysfunc(fileexist(&outpath/adam)) = 0 %then
        %let rc = %sysfunc(dcreate(adam, &outpath));
    %if %sysfunc(libref(adam)) ne 0 %then %do;
        libname adam "&outpath/adam";
    %end;

    %put NOTE: datapath = &datapath;
    %put NOTE: outpath  = &outpath/adam   (libref ADAM);
%mend;
%_setpath;

options nosyntaxcheck;   /* one bad step must not silently skip everything after it */


/*---------------------------------------------------------------------------*
 | 0. READ THE SDTM DATASETS                                                  |
 |                                                                            |
 | We read the REFERENCE SDTM here, not the SDTM you built in the earlier     |
 | notebooks. That is deliberate: a mistake made on Day 4 should not make     |
 | Day 11 unsolvable. In a real study you would read your own SDTM.           |
 *---------------------------------------------------------------------------*/
data dm;
    infile "&datapath/sdtm/dm.csv" dsd firstobs = 2 truncover;
    length studyid $10 domain $2 usubjid $20 subjid $5
           rfstdtc rfendtc rfxstdtc rfxendtc rficdtc rfpendtc dthdtc $10
           dthfl $1 siteid $3 age 8 ageu $10 sex $1 race $40 ethnic $30
           armcd $8 arm $20 actarmcd $8 actarm $20 country $3;
    input studyid $ domain $ usubjid $ subjid $ rfstdtc $ rfendtc $
          rfxstdtc $ rfxendtc $ rficdtc $ rfpendtc $ dthdtc $ dthfl $
          siteid $ age ageu $ sex $ race $ ethnic $ armcd $ arm $
          actarmcd $ actarm $ country $;
run;

data ds;
    infile "&datapath/sdtm/ds.csv" dsd firstobs = 2 truncover;
    length studyid $10 domain $2 usubjid $20 dsseq 8 dsterm $60
           dsdecod $40 dscat $30 dsstdtc $10 dsstdy 8;
    input studyid $ domain $ usubjid $ dsseq dsterm $ dsdecod $ dscat $
          dsstdtc $ dsstdy;
run;

data vs;
    infile "&datapath/sdtm/vs.csv" dsd firstobs = 2 truncover;
    length studyid $10 domain $2 usubjid $20 vsseq 8 vstestcd $8 vstest $40
           vsorres $20 vsorresu $20 vsstresc $20 vsstresn 8 vsstresu $20
           vsblfl $1 visitnum 8 visit $20 vsdtc $10 vsdy 8;
    input studyid $ domain $ usubjid $ vsseq vstestcd $ vstest $ vsorres $
          vsorresu $ vsstresc $ vsstresn vsstresu $ vsblfl $ visitnum
          visit $ vsdtc $ vsdy;
run;


/*---------------------------------------------------------------------------*
 | 1. TREATMENT VARIABLES AND DATES                                           |
 |                                                                            |
 | THE BIG TYPE CHANGE. In SDTM a date is a CHARACTER ISO 8601 string:        |
 |     RFXSTDTC = "2024-03-01"                                                |
 | In ADaM it is a NUMERIC SAS date, so that you can subtract it:             |
 |     TRTSDT   = 23436   displayed as 01MAR2024 by the DATE9. format         |
 |                                                                            |
 | INPUT() converts character to numeric. PUT() goes the other way. Getting   |
 | these two backwards is the single most common SAS error in this course -   |
 | see Notebook 02.                                                           |
 |                                                                            |
 | TRT01PN is a DISPLAY ORDER, not a dose. Placebo is 1 so it sorts first as  |
 | the reference column in every table.                                       |
 *---------------------------------------------------------------------------*/
data adsl_dm;
    set dm;
    length trt01p trt01a $20 agegr1 $5;

    trt01p = arm;
    trt01a = actarm;

    if      arm = 'Placebo' then trt01pn = 1;
    else if arm = 'Drug A'  then trt01pn = 2;

    if      actarm = 'Placebo' then trt01an = 1;
    else if actarm = 'Drug A'  then trt01an = 2;

    trtsdt = input(rfxstdtc, yymmdd10.);      /* first dose - DEFINES Day 1 */
    trtedt = input(rfxendtc, yymmdd10.);      /* last dose                  */
    rficdt = input(rficdtc,  yymmdd10.);      /* informed consent           */

    trtdurd = trtedt - trtsdt + 1;            /* inclusive of both endpoints */

    /*  ". < age" guards the missing case. In SAS a missing value is SMALLER
        than every number, so a bare "if age < 65" would quietly classify a
        subject with no age as <65.                                          */
    if . < age < 65 then do;
        agegr1  = '<65';
        agegr1n = 1;
    end;
    else if age >= 65 then do;
        agegr1  = '>=65';
        agegr1n = 2;
    end;

    format trtsdt trtedt rficdt date9.;
run;


/*---------------------------------------------------------------------------*
 | 2. RANDOMISATION AND DISPOSITION - both from DS                            |
 |                                                                            |
 | DS carries three records per subject. Two are PROTOCOL MILESTONEs (consent |
 | and randomisation) and one is the DISPOSITION EVENT that says how the      |
 | subject left the study. They are pulled out separately because they answer |
 | different questions.                                                       |
 *---------------------------------------------------------------------------*/
proc sql;
    create table randdt as
        select usubjid,
               input(dsstdtc, yymmdd10.) as randdt format = date9. label = 'Date of Randomization'
        from ds
        where dsdecod = 'RANDOMIZED'
        order by usubjid;

    create table disp as
        select usubjid,
               dsdecod as eos_decod length = 40,
               dsterm  as eos_term  length = 60
        from ds
        where dscat = 'DISPOSITION EVENT'
        order by usubjid;
quit;


/*---------------------------------------------------------------------------*
 | 3. BASELINE HEIGHT AND WEIGHT - READ THIS SECTION TWICE                    |
 |                                                                            |
 | THE ADaM BASELINE RULE:                                                    |
 |     baseline = the LAST non-missing value on or before the date of         |
 |                first dose                                                  |
 |                                                                            |
 | It is tempting to just copy VS.VSBLFL = 'Y'. Do not. Run the step below    |
 | and look at the log: ZERO height records carry VSBLFL = 'Y', because in    |
 | this study height is collected only at SCREENING and VSBLFL marks the      |
 | BASELINE visit. Copy the flag and all 8 subjects lose their baseline       |
 | height - and therefore their BMI - with no error and no warning.           |
 |                                                                            |
 | This is what "a clean-looking run is not a correct run" means in ADaM.     |
 *---------------------------------------------------------------------------*/
proc sql noprint;
    select count(*) into : n_ht_blfl trimmed
    from vs
    where vstestcd = 'HEIGHT' and vsblfl = 'Y';
quit;
%put NOTE: height records with VSBLFL='Y' = &n_ht_blfl  (this is why we do NOT copy VSBLFL);

/*  The rule, done properly. Keep every non-missing result dated on or before
    first dose, then take the LAST one per subject per test.                 */
proc sql;
    create table vs_pre as
        select v.usubjid,
               v.vstestcd,
               v.vsstresn,
               input(v.vsdtc, yymmdd10.) as vdt
        from vs as v
             inner join adsl_dm as a
             on v.usubjid = a.usubjid
        where v.vsstresn is not null
          and input(v.vsdtc, yymmdd10.) <= a.trtsdt
        order by usubjid, vstestcd, vdt;
quit;

data vs_base;
    set vs_pre;
    by usubjid vstestcd vdt;
    if last.vstestcd;          /* the LAST record on or before first dose */
run;

/*  One row per subject with a column per test. HEIGHT resolves to the
    SCREENING value; WEIGHT resolves to the BASELINE value. Different visits,
    same rule - because the rule asks a question about TIME, not about a
    visit label.                                                             */
proc transpose data = vs_base out = vs_wide(drop = _name_);
    by usubjid;
    id vstestcd;
    var vsstresn;
run;


/*---------------------------------------------------------------------------*
 | 4. ASSEMBLE ADSL                                                           |
 *---------------------------------------------------------------------------*/
data adsl;
    merge adsl_dm  (in = a)
          randdt
          disp
          vs_wide  (keep = usubjid height weight);
    by usubjid;
    if a;                      /* DM defines the subject set. Nothing else adds a subject. */

    length agegr1n 8 eosstt $12 dcsreas $40 dcsreasp $60
           saffl ittfl complfl $1;

    heightbl = height;
    weightbl = weight;
    if heightbl > . and weightbl > . then
        bmibl = round(weightbl / ((heightbl / 100) ** 2), 0.01);

    /*  Disposition. COMPLETED or not - there is no third state here.        */
    if eos_decod = 'COMPLETED' then do;
        eosstt   = 'COMPLETED';
        complfl  = 'Y';
        dcsreas  = '';                 /* a completer has no reason to give  */
        dcsreasp = '';
    end;
    else do;
        eosstt   = 'DISCONTINUED';
        complfl  = 'N';
        dcsreas  = eos_decod;
        dcsreasp = eos_term;
    end;

    /*  Population flags. Both are 'Y' for all 8 subjects in ABC-01, and they
        are STILL derived from different rules, because they answer different
        questions: was the subject DOSED, and was the subject RANDOMISED.
        A screen failure, or a subject randomised but never dosed, separates
        them - and then the tables built on each differ too.                 */
    if trtsdt > . then saffl = 'Y'; else saffl = 'N';
    if randdt > . then ittfl = 'Y'; else ittfl = 'N';

    label
        usubjid  = 'Unique Subject Identifier'
        trt01p   = 'Planned Treatment for Period 01'
        trt01pn  = 'Planned Treatment for Period 01 (N)'
        trt01a   = 'Actual Treatment for Period 01'
        trt01an  = 'Actual Treatment for Period 01 (N)'
        agegr1   = 'Pooled Age Group 1'
        agegr1n  = 'Pooled Age Group 1 (N)'
        rficdt   = 'Date of Informed Consent'
        trtsdt   = 'Date of First Exposure to Treatment'
        trtedt   = 'Date of Last Exposure to Treatment'
        trtdurd  = 'Total Treatment Duration (Days)'
        eosstt   = 'End of Study Status'
        dcsreas  = 'Reason for Discontinuation from Study'
        dcsreasp = 'Reason Spec for Discont from Study'
        saffl    = 'Safety Population Flag'
        ittfl    = 'Intent-To-Treat Population Flag'
        complfl  = 'Completers Population Flag'
        heightbl = 'Baseline Height (cm)'
        weightbl = 'Baseline Weight (kg)'
        bmibl    = 'Baseline BMI (kg/m2)';

    keep studyid usubjid subjid siteid country arm actarm
         trt01p trt01pn trt01a trt01an
         age ageu agegr1 agegr1n sex race ethnic
         rficdt randdt trtsdt trtedt trtdurd
         eosstt dcsreas dcsreasp saffl ittfl complfl
         heightbl weightbl bmibl;
run;

proc sort data = adsl;
    by usubjid;
run;


/*---------------------------------------------------------------------------*
 | 5. CHECK YOUR WORK                                                         |
 *---------------------------------------------------------------------------*/
title 'ADSL - one row per subject';
proc print data = adsl noobs;
    var usubjid trt01p age agegr1 trtsdt trtedt trtdurd eosstt complfl;
run;

title 'ADSL - baseline body measurements';
proc print data = adsl noobs;
    var usubjid heightbl weightbl bmibl;
run;
title;

/*  ADSL must have exactly one row per subject. This returns zero rows if it
    does - and if it ever returns a row, stop and fix it before going on,
    because every downstream dataset merges on USUBJID.                      */
title 'Duplicate USUBJID check - MUST be empty';
proc sql;
    select usubjid, count(*) as n
    from adsl
    group by usubjid
    having count(*) > 1;
quit;
title;

/*  The discontinuation is real: subject 01-004 left on day 20 for an adverse
    event. TRTDURD is 20, not 28, and COMPLFL is 'N'.                        */
title 'Non-completers';
proc print data = adsl noobs;
    where complfl = 'N';
    var usubjid trtsdt trtedt trtdurd eosstt dcsreas dcsreasp;
run;
title;


/*---------------------------------------------------------------------------*
 | 6. COMPARE AGAINST THE REFERENCE                                           |
 |                                                                            |
 | The reference CSV stores dates as ISO text, because a CSV cannot carry     |
 | "numeric date". Your TRTSDT is numeric. So the comparison renders yours    |
 | back to ISO with PUT(..., YYMMDD10.) before comparing - it does NOT make   |
 | your variable character.                                                   |
 *---------------------------------------------------------------------------*/
data ref_adsl;
    infile "&datapath/adam/adsl.csv" dsd firstobs = 2 truncover;
    length studyid $10 usubjid $20 subjid $5 siteid $3 country $3
           arm actarm trt01p $20 trt01pn 8 trt01a $20 trt01an 8
           age 8 ageu $10 agegr1 $5 agegr1n 8 sex $1 race $40 ethnic $30
           rficdt randdt trtsdt trtedt $10 trtdurd 8
           eosstt $12 dcsreas $40 dcsreasp $60 saffl ittfl complfl $1
           heightbl 8 weightbl 8 bmibl 8;
    input studyid $ usubjid $ subjid $ siteid $ country $ arm $ actarm $
          trt01p $ trt01pn trt01a $ trt01an age ageu $ agegr1 $ agegr1n
          sex $ race $ ethnic $ rficdt $ randdt $ trtsdt $ trtedt $ trtdurd
          eosstt $ dcsreas $ dcsreasp $ saffl $ ittfl $ complfl $
          heightbl weightbl bmibl;
run;

/*  Render our numeric dates as ISO text so the two are comparable.          */
data mine_adsl;
    set adsl;
    length c_rficdt c_randdt c_trtsdt c_trtedt $10;
    c_rficdt = put(rficdt, yymmdd10.);
    c_randdt = put(randdt, yymmdd10.);
    c_trtsdt = put(trtsdt, yymmdd10.);
    c_trtedt = put(trtedt, yymmdd10.);
    drop rficdt randdt trtsdt trtedt;
    rename c_rficdt = rficdt  c_randdt = randdt
           c_trtsdt = trtsdt  c_trtedt = trtedt;
run;

proc sort data = mine_adsl; by usubjid; run;
proc sort data = ref_adsl;  by usubjid; run;

title 'PROC COMPARE - your ADSL vs the reference';
proc compare base = ref_adsl compare = mine_adsl listall;
    id usubjid;
run;
title;

/*  Save your ADSL. Every notebook from here on reads it.                    */
data adam.adsl;
    set adsl;
run;


/*===========================================================================*
 |  YOUR TURN  -  exercises                                                   |
 |  Solutions: ../../answer-keys/14_build_adsl_answers.md                     |
 *===========================================================================*/

/* EXERCISE 1 -------------------------------------------------------------- *
 | Do it the WRONG way on purpose, so you recognise the symptom later.        |
 | Derive HEIGHTBL by copying VS where VSBLFL = 'Y' instead of using the date |
 | rule. How many subjects end up with a baseline height? How many end up     |
 | with a BMI? Did SAS report an error, a warning, or nothing at all?          |
 *------------------------------------------------------------------------- */



/* EXERCISE 2 -------------------------------------------------------------- *
 | SAFFL and ITTFL are 'Y' for all 8 subjects here, so the two rules cannot   |
 | be told apart from the output. Invent the two subjects that WOULD tell     |
 | them apart: one who was randomised but never dosed, and one who was dosed  |
 | without being randomised. What are SAFFL and ITTFL for each, and which     |
 | tables would each subject appear in?                                       |
 *------------------------------------------------------------------------- */



/* EXERCISE 3 -------------------------------------------------------------- *
 | TRTDURD is TRTEDT - TRTSDT + 1. Why the "+ 1"? Work out the treatment      |
 | duration of a subject who was dosed once, on a single day, under both the  |
 | "+ 1" version and a plain subtraction. Which answer is right, and what     |
 | does the wrong one do to a mean-exposure summary?                          |
 *------------------------------------------------------------------------- */



/* EXERCISE 4 -------------------------------------------------------------- *
 | AGEGR1 is derived here from AGE, which SDTM derived from the birth date at |
 | informed consent. Some studies define the age group at first dose instead. |
 | Which subjects in ABC-01 are close enough to 65 that the choice could move |
 | them between groups? What would you need to check to be sure?              |
 *------------------------------------------------------------------------- */



/* EXERCISE 5 (stretch) ---------------------------------------------------- *
 | ADSL is the source of truth, so a bug in it is a bug everywhere. Write a   |
 | validation step that FAILS LOUDLY - use ABORT or a PUT to the log - if any |
 | of these is untrue:                                                        |
 |     - USUBJID is unique                                                    |
 |     - every subject has a non-missing TRT01P                               |
 |     - TRTEDT is never earlier than TRTSDT                                  |
 |     - TRTDURD equals TRTEDT - TRTSDT + 1 for every subject                 |
 | Why is failing loudly better than printing a table nobody reads?           |
 *------------------------------------------------------------------------- */
