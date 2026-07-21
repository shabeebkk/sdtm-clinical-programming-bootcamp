/*===========================================================================*
 |  NOTEBOOK 18 (SAS)  -  BUILD ADTTE                                         |
 |  Clinical Programming Bootcamp  -  Module: Time-to-Event Data              |
 |---------------------------------------------------------------------------|
 |  GOAL: turn ADAE + ADSL into ADTTE - time to the first treatment-emergent  |
 |  adverse event.                                                            |
 |                                                                            |
 |  ADTTE answers a question the other datasets cannot: not WHETHER an event  |
 |  happened, but HOW LONG until it did - and what to do about the subjects   |
 |  it never happened to.                                                     |
 |                                                                            |
 |  ONE ROW PER SUBJECT PER PARAMETER. Every safety subject gets a row,       |
 |  event or not. A time-to-event dataset that drops its censored subjects    |
 |  biases every estimate it feeds.                                           |
 |                                                                            |
 |  You will:                                                                 |
 |     1. find each subject's FIRST treatment-emergent event                  |
 |     2. give the subjects who had none a CENSORING date                     |
 |     3. derive AVAL, CNSR, EVNTDESC and CNSDTDSC                            |
 |     4. see what censoring actually does, with PROC LIFETEST                 |
 |                                                                            |
 |  Spec      : ../../data/adam_specification.md      (section 5)             |
 |  Target    : ../../data/adam/adtte.csv             (the finished answer)   |
 |  Needs     : Notebooks 14 (ADSL) and 15 (ADAE)                             |
 |  ATTEMPT IT FIRST, then compare against the target.                        |
 *===========================================================================*/

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

    /*  ADAM gets its OWN subfolder, &outpath/adam, so the ADAM library shows
        only the datasets you build here - never the SDTM domains, which go to
        &outpath itself. A libref does not recurse into subfolders.           */
    %if %sysfunc(fileexist(&outpath/adam)) = 0 %then
        %let rc = %sysfunc(dcreate(adam, &outpath));
    %if %sysfunc(libref(adam)) ne 0 %then %do;
        libname adam "&outpath/adam";
    %end;

    %put NOTE: datapath = &datapath;
    %put NOTE: outpath  = &outpath/adam   (libref ADAM);
%mend;
%_setpath;

options nosyntaxcheck;


/*---------------------------------------------------------------------------*
 | 0. READ ADSL AND ADAE                                                      |
 |                                                                            |
 | Note what we are reading: the ANALYSIS datasets, not SDTM. ADTTE is built  |
 | on top of ADAE, which was built on top of AE. Each layer trusts the one    |
 | below it, and each layer's derivation lives in exactly one place.          |
 *---------------------------------------------------------------------------*/
data ref_adsl;
    infile "&datapath/adam/adsl.csv" dsd firstobs = 2 truncover;
    length studyid $10 usubjid $20 subjid $5 siteid $3 country $3
           arm actarm trt01p $20 trt01pn 8 trt01a $20 trt01an 8
           age 8 ageu $10 agegr1 $5 agegr1n 8 sex $1 race $40 ethnic $30
           c_rficdt c_randdt c_trtsdt c_trtedt $10 trtdurd 8
           eosstt $12 dcsreas $40 dcsreasp $60 saffl ittfl complfl $1
           heightbl 8 weightbl 8 bmibl 8;
    input studyid $ usubjid $ subjid $ siteid $ country $ arm $ actarm $
          trt01p $ trt01pn trt01a $ trt01an age ageu $ agegr1 $ agegr1n
          sex $ race $ ethnic $ c_rficdt $ c_randdt $ c_trtsdt $ c_trtedt $
          trtdurd eosstt $ dcsreas $ dcsreasp $ saffl $ ittfl $ complfl $
          heightbl weightbl bmibl;

    trtsdt = input(c_trtsdt, yymmdd10.);
    trtedt = input(c_trtedt, yymmdd10.);
    format trtsdt trtedt date9.;
    keep studyid usubjid subjid siteid trt01p trt01pn trt01a trt01an
         age agegr1 sex race saffl ittfl trtsdt trtedt;
run;

data ref_adae;
    infile "&datapath/adam/adae.csv" dsd firstobs = 2 truncover;
    length studyid $10 usubjid $20 subjid $5 siteid $3 trta $20 trtan 8
           age 8 agegr1 $5 agegr1n 8 sex $1 race $40 saffl $1
           c_trtsdt c_trtedt $10 aeseq 8 aeterm $60 aedecod $60
           aesev $10 asevn 8 aeser $1 aerel $20 arel $1 aeout $30
           c_astdt c_aendt $10 astdy 8 aendy 8 adurn 8
           trtemfl aoccfl aoccpfl $1;
    input studyid $ usubjid $ subjid $ siteid $ trta $ trtan age agegr1 $
          agegr1n sex $ race $ saffl $ c_trtsdt $ c_trtedt $ aeseq aeterm $
          aedecod $ aesev $ asevn aeser $ aerel $ arel $ aeout $
          c_astdt $ c_aendt $ astdy aendy adurn trtemfl $ aoccfl $ aoccpfl $;

    if not missing(c_astdt) then astdt = input(c_astdt, yymmdd10.);
    format astdt date9.;
    keep usubjid aeseq aedecod astdt trtemfl aoccfl;
run;


/*---------------------------------------------------------------------------*
 | 1. THE FIRST EVENT                                                         |
 |                                                                            |
 | Notebook 15 already found it. AOCCFL = 'Y' marks the FIRST treatment-      |
 | emergent event per subject - which is exactly what a time-to-FIRST-event   |
 | analysis needs.                                                            |
 |                                                                            |
 | That is not a coincidence. AOCCFL was built with a deterministic sort      |
 | (ASTDT then AESEQ) precisely so that "the first event" means the same      |
 | thing in every program that asks for it.                                   |
 *---------------------------------------------------------------------------*/
/*  Assign the carrying variables directly rather than RENAME-ing onto them.
    RENAME onto a name that already exists in the step is only a WARNING in
    SAS - it keeps the ORIGINAL value and strands the derived one. That bug
    cost this course a whole domain once; see TROUBLESHOOTING.md. Plain
    assignment cannot fail that way.                                          */
data first_ae;
    set ref_adae;
    where aoccfl = 'Y';           /* one row per subject, by construction */
    length ev_term $60;
    ev_dt   = astdt;
    ev_term = aedecod;
    format ev_dt date9.;
    keep usubjid ev_dt ev_term;
run;

proc sort data = first_ae;  by usubjid; run;
proc sort data = ref_adsl;  by usubjid; run;


/*---------------------------------------------------------------------------*
 | 2. EVENT OR CENSORED                                                       |
 |                                                                            |
 | THE RULE THAT CATCHES EVERYONE:                                            |
 |                                                                            |
 |     CNSR = 0   the event HAPPENED                                          |
 |     CNSR = 1   CENSORED - the event had not happened when we stopped       |
 |                looking                                                     |
 |                                                                            |
 | Everywhere else in ADaM, 1 and 'Y' mean "yes, this is true". CNSR runs     |
 | the other way. It is defined this way in the ADaM TTE spec because the     |
 | value is used arithmetically downstream. Read it twice, every time.        |
 |                                                                            |
 | CENSORED SUBJECTS MUST BE KEPT. Two subjects here had no treatment-        |
 | emergent event at all. Drop them and the dataset answers "how fast did     |
 | events happen AMONG PEOPLE WHO HAD EVENTS" - a question nobody asked, and  |
 | one whose answer is always more alarming than the truth.                   |
 |                                                                            |
 | A censored row is not missing data. It is the positive statement:          |
 | "this subject was followed for N days and the event did not occur."        |
 *---------------------------------------------------------------------------*/
data adtte;
    merge ref_adsl (in = a) first_ae (in = b);
    by usubjid;
    if a and saffl = 'Y';         /* the SAFETY population defines the rows */

    length paramcd $8 param $60 evntdesc $60 cnsdtdsc $20
           trtp trta $20 srcdom srcvar $8;

    paramcd = 'TTFAE';
    param   = 'Time to First Treatment-Emergent Adverse Event (days)';
    paramn  = 1;

    trtp = trt01p;  trtpn = trt01pn;
    trta = trt01a;  trtan = trt01an;

    startdt = trtsdt;             /* the time origin */

    if b then do;                 /* the event occurred */
        adt      = ev_dt;
        cnsr     = 0;
        evntdesc = 'First treatment-emergent adverse event';
        cnsdtdsc = '';            /* nothing to explain - it happened */
        srcdom   = 'ADAE';
        srcvar   = 'ASTDT';
    end;
    else do;                      /* censored */
        adt      = trtedt;
        cnsr     = 1;
        evntdesc = 'Censored at last dose';
        cnsdtdsc = 'LAST DOSE';   /* WHY we stopped looking */
        srcdom   = 'ADSL';
        srcvar   = 'TRTEDT';
    end;

    /*  Same no-Day-0 rule as everywhere else. A subject whose event fell on
        the day of first dose has AVAL = 1, not 0.                            */
    if adt > . and startdt > . then do;
        if adt >= startdt then aval = adt - startdt + 1;
        else                   aval = adt - startdt;
    end;

    label
        paramcd  = 'Parameter Code'
        param    = 'Parameter'
        startdt  = 'Time to Event Origin Date'
        adt      = 'Analysis Date'
        aval     = 'Analysis Value (Days)'
        cnsr     = 'Censor'
        evntdesc = 'Event or Censoring Description'
        cnsdtdsc = 'Censor Date Description';

    format startdt adt date9.;

    keep studyid usubjid subjid siteid trtp trtpn trta trtan
         age agegr1 sex race saffl ittfl
         paramcd param paramn startdt adt aval cnsr evntdesc cnsdtdsc
         srcdom srcvar;
run;

proc sort data = adtte; by usubjid; run;


/*---------------------------------------------------------------------------*
 | 3. CHECK YOUR WORK                                                         |
 *---------------------------------------------------------------------------*/
title 'ADTTE - every safety subject, event or not';
proc print data = adtte noobs;
    var usubjid trtp startdt adt aval cnsr evntdesc cnsdtdsc;
run;
title;

/*  The row count is the whole point: 8 rows for 8 safety subjects, even
    though only 6 had an event. If you get 6 rows, you dropped the censored
    subjects - go back to section 2.                                          */
proc sql;
    title 'Row count check - these MUST be equal';
    select (select count(*) from adtte)                                as adtte_rows,
           (select count(*) from ref_adsl where saffl = 'Y')           as safety_subjects,
           (select count(*) from adtte where cnsr = 0)                 as events,
           (select count(*) from adtte where cnsr = 1)                 as censored;
    title;
quit;

/*  CNSDTDSC belongs on censored records ONLY. An event needs no explanation
    for why we stopped looking - we stopped because it happened.              */
title 'CNSDTDSC population - MUST be empty';
proc print data = adtte noobs;
    where (cnsr = 0 and cnsdtdsc ne '') or (cnsr = 1 and cnsdtdsc = '');
    var usubjid cnsr evntdesc cnsdtdsc;
run;
title;


/*---------------------------------------------------------------------------*
 | 4. WHAT CENSORING ACTUALLY DOES                                            |
 |                                                                            |
 | PROC LIFETEST estimates the Kaplan-Meier curve. The syntax says which      |
 | value of CNSR means CENSORED:                                              |
 |                                                                            |
 |     time aval * cnsr(1);                                                   |
 |                    ^^^                                                     |
 |                    "1 means censored"                                      |
 |                                                                            |
 | Get that number wrong - write cnsr(0) - and SAS treats every EVENT as      |
 | censored and every censored subject as an event. It runs without error     |
 | and produces a curve that is exactly backwards.                            |
 |                                                                            |
 | This is the payoff for keeping the censored rows: a censored subject       |
 | contributes to the RISK SET for as long as they were followed, and then    |
 | leaves it without causing a drop in the curve.                             |
 *---------------------------------------------------------------------------*/
ods select ProductLimitEstimates Quartiles;
title 'Kaplan-Meier: time to first treatment-emergent AE, by treatment';
proc lifetest data = adtte plots = none;
    time aval * cnsr(1);
    strata trtp;
run;
title;
ods select all;

/*  The naive alternative, for contrast: throw the censored subjects away and
    just average the event times. Run both and compare - Exercise 2.          */
title 'The naive answer - mean time among subjects who HAD an event';
proc means data = adtte mean n maxdec = 2;
    where cnsr = 0;
    var aval;
run;
title;


/*---------------------------------------------------------------------------*
 | 5. COMPARE AGAINST THE REFERENCE                                           |
 *---------------------------------------------------------------------------*/
data ref_adtte;
    infile "&datapath/adam/adtte.csv" dsd firstobs = 2 truncover;
    length studyid $10 usubjid $20 subjid $5 siteid $3
           trtp $20 trtpn 8 trta $20 trtan 8
           age 8 agegr1 $5 sex $1 race $40 saffl ittfl $1
           paramcd $8 param $60 paramn 8 startdt adt $10 aval 8
           cnsr 8 evntdesc $60 cnsdtdsc $20 srcdom $8 srcvar $8;
    input studyid $ usubjid $ subjid $ siteid $ trtp $ trtpn trta $ trtan
          age agegr1 $ sex $ race $ saffl $ ittfl $
          paramcd $ param $ paramn startdt $ adt $ aval
          cnsr evntdesc $ cnsdtdsc $ srcdom $ srcvar $;
run;

data mine_adtte;
    set adtte;
    length c_startdt c_adt $10;
    c_startdt = put(startdt, yymmdd10.);
    if adt > . then c_adt = put(adt, yymmdd10.);
    drop startdt adt;
    rename c_startdt = startdt  c_adt = adt;
run;

proc sort data = mine_adtte; by usubjid; run;
proc sort data = ref_adtte;  by usubjid; run;

title 'PROC COMPARE - your ADTTE vs the reference';
proc compare base = ref_adtte compare = mine_adtte listall;
    id usubjid;
run;
title;

data adam.adtte;
    set adtte;
run;


/*===========================================================================*
 |  YOUR TURN  -  exercises                                                   |
 |  Solutions: ../../answer-keys/18_build_adtte_answers.md                    |
 *===========================================================================*/

/* EXERCISE 1 -------------------------------------------------------------- *
 | Change the LIFETEST statement from cnsr(1) to cnsr(0) and re-run. Does     |
 | SAS complain? Compare the two sets of quartiles. Explain, in one sentence  |
 | a non-statistician would understand, what the second curve is actually     |
 | describing.                                                                |
 *------------------------------------------------------------------------- */



/* EXERCISE 2 -------------------------------------------------------------- *
 | Compute the "time to first AE" three ways:                                 |
 |    (a) mean AVAL among subjects with CNSR = 0    (drop the censored)       |
 |    (b) mean AVAL over ALL subjects               (treat censored as event) |
 |    (c) the Kaplan-Meier median from PROC LIFETEST                          |
 | Report all three. Which two are wrong, and in which DIRECTION does each    |
 | one err? Why is (b) not a safe "conservative" choice?                      |
 *------------------------------------------------------------------------- */



/* EXERCISE 3 -------------------------------------------------------------- *
 | ABC-01-01-002's first ADAE record is the day -5 event, but ADTTE uses      |
 | their day 7 event. Trace exactly which flag caused that, and confirm it    |
 | by listing all of that subject's ADAE rows with TRTEMFL and AOCCFL. What   |
 | would ADTTE's AVAL have been if we had taken min(ASTDT) instead?           |
 *------------------------------------------------------------------------- */



/* EXERCISE 4 -------------------------------------------------------------- *
 | Both censored subjects are censored at TRTEDT with CNSDTDSC = 'LAST DOSE'. |
 | Name two OTHER censoring reasons a real study would need, and say what     |
 | ADT would be for each. Then explain why CNSDTDSC exists at all - what      |
 | question can a reviewer answer with it that CNSR alone cannot?             |
 *------------------------------------------------------------------------- */



/* EXERCISE 5 (stretch) ---------------------------------------------------- *
 | ABC-01-01-004 discontinued on day 20 for an adverse event, and their AVAL  |
 | is 13 with CNSR = 0. Now consider a subject who discontinued on day 20 for |
 | an unrelated reason having had NO adverse event. They would be censored at |
 | day 20 while a completer is censored at day 28. Explain why that is the    |
 | right answer and not a bias - and what would go wrong if we censored       |
 | everyone at day 28 for consistency.                                        |
 *------------------------------------------------------------------------- */
