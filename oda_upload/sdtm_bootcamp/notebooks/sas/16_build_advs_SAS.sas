/*===========================================================================*
 |  NOTEBOOK 16 (SAS)  -  BUILD ADVS                                          |
 |  Clinical Programming Bootcamp  -  Module: Basic Data Structure            |
 |---------------------------------------------------------------------------|
 |  GOAL: turn SDTM VS + ADSL into ADVS - the vital signs analysis dataset.   |
 |                                                                            |
 |  ADVS is a BASIC DATA STRUCTURE (BDS) dataset:                             |
 |         ONE ROW PER SUBJECT PER PARAMETER PER VISIT                        |
 |                                                                            |
 |  Nearly every efficacy dataset you will ever build is BDS. Learn the shape |
 |  here and ADLB tomorrow is the same skeleton with three extra columns.     |
 |                                                                            |
 |  You will:                                                                 |
 |     1. map VS into the BDS shape (PARAMCD / PARAM / PARAMN / AVAL)         |
 |     2. derive the ANALYSIS visit - which is not the collected visit        |
 |     3. add BMI as a DERIVED PARAMETER that exists in no SDTM domain        |
 |     4. derive ABLFL by the ADaM baseline rule, then BASE                   |
 |     5. derive CHG and PCHG - post-baseline only, and rounded on purpose    |
 |     6. set ANL01FL, and understand why DTYPE stays empty                   |
 |                                                                            |
 |  Spec      : ../../data/adam_specification.md      (section 3)             |
 |  Target    : ../../data/adam/advs.csv              (the finished answer)   |
 |  Needs     : Notebook 14 (ADSL) - the baseline rule especially             |
 |  ATTEMPT IT FIRST, then compare against the target.                        |
 *===========================================================================*/

%macro _setpath;
    %global datapath outpath;
    %if %superq(datapath) = %then
        %let datapath = /Volumes/D Drive/SDTM Training/Bootcamp/data;     /* local default */
    %if %superq(outpath) = %then
        %let outpath  = /Volumes/D Drive/SDTM Training/Bootcamp/output;   /* local default */

    %if %sysfunc(fileexist(&outpath)) = 0 %then %do;
        %local nm pa rc;
        %let nm = %scan(&outpath, -1, %str(/));
        %let pa = %substr(&outpath, 1, %eval(%length(&outpath) - %length(&nm) - 1));
        %let rc = %sysfunc(dcreate(&nm, &pa));
    %end;

    %if %sysfunc(libref(adam)) ne 0 %then %do;
        libname adam "&outpath";
    %end;

    %put NOTE: datapath = &datapath;
    %put NOTE: outpath  = &outpath   (libref ADAM);
%mend;
%_setpath;

options nosyntaxcheck;


/*---------------------------------------------------------------------------*
 | 0. READ THE SOURCES                                                        |
 *---------------------------------------------------------------------------*/
data vs;
    infile "&datapath/sdtm/vs.csv" dsd firstobs = 2 truncover;
    length studyid $10 domain $2 usubjid $20 vsseq 8 vstestcd $8 vstest $40
           vsorres $20 vsorresu $20 vsstresc $20 vsstresn 8 vsstresu $20
           vsblfl $1 visitnum 8 visit $20 vsdtc $10 vsdy 8;
    input studyid $ domain $ usubjid $ vsseq vstestcd $ vstest $ vsorres $
          vsorresu $ vsstresc $ vsstresn vsstresu $ vsblfl $ visitnum
          visit $ vsdtc $ vsdy;
run;

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
    keep usubjid subjid siteid trt01p trt01pn trt01a trt01an
         age agegr1 agegr1n sex race saffl ittfl trtsdt trtedt heightbl;
run;

proc sort data = vs;       by usubjid; run;
proc sort data = ref_adsl; by usubjid; run;


/*---------------------------------------------------------------------------*
 | 1. MAP VS INTO THE BDS SHAPE                                               |
 |                                                                            |
 | PARAMCD / PARAM / PARAMN must be ONE-TO-ONE. A PARAMCD that maps to two    |
 | different PARAM strings is a conformance failure, and it happens when      |
 | someone edits one lookup and forgets the other.                            |
 |                                                                            |
 | PARAM carries the UNIT, because PARAM is what prints as the row label in   |
 | the table. "Weight" tells a reader nothing; "Weight (kg)" does.            |
 |                                                                            |
 | PARAMN exists to control ORDER. Without it, parameters print alphabetically |
 | and Diastolic sorts above Systolic, which no clinician expects.            |
 *---------------------------------------------------------------------------*/
data advs_vs;
    merge vs (in = a) ref_adsl (in = b);
    by usubjid;
    if a;

    length paramcd $8 param $40 avalu $20 avisit $20 trtp trta $20;

    /*  The parameter lookup. In a real study this comes from the metadata,
        not from hard-coded IF statements - but seeing it explicitly once is
        worth more than seeing a macro that hides it.                         */
    paramcd = vstestcd;
    if      vstestcd = 'SYSBP'  then do; param = 'Systolic Blood Pressure (mmHg)';  paramn = 1; end;
    else if vstestcd = 'DIABP'  then do; param = 'Diastolic Blood Pressure (mmHg)'; paramn = 2; end;
    else if vstestcd = 'PULSE'  then do; param = 'Pulse Rate (beats/min)';          paramn = 3; end;
    else if vstestcd = 'TEMP'   then do; param = 'Temperature (C)';                 paramn = 4; end;
    else if vstestcd = 'WEIGHT' then do; param = 'Weight (kg)';                     paramn = 5; end;
    else if vstestcd = 'HEIGHT' then do; param = 'Height (cm)';                     paramn = 6; end;
    else put "ERROR: unmapped VSTESTCD " vstestcd= " - the lookup is incomplete";

    aval  = vsstresn;
    avalu = vsstresu;

    /*  ANALYSIS visit. Note AVISITN is NOT VISITNUM: the collected visits are
        numbered 1, 2, 4 and the analysis visits are 0, 1, 4. AVISITN drives
        sort order and column order in every table, so it is chosen to suit
        the table - here, Baseline is analysis visit 1 and Screening is 0.    */
    if      visit = 'SCREENING' then do; avisit = 'Screening'; avisitn = 0; end;
    else if visit = 'BASELINE'  then do; avisit = 'Baseline';  avisitn = 1; end;
    else if visit = 'WEEK 4'    then do; avisit = 'Week 4';    avisitn = 4; end;
    else put "ERROR: unmapped VISIT " visit= " - the lookup is incomplete";

    adt = input(vsdtc, yymmdd10.);
    if adt > . then do;
        if adt >= trtsdt then ady = adt - trtsdt + 1;
        else                  ady = adt - trtsdt;
    end;

    trtp = trt01p;  trtpn = trt01pn;
    trta = trt01a;  trtan = trt01an;

    /*  Traceability: name the SDTM record this row came from.                */
    length srcdom $8 srcvar $8;
    srcdom = 'VS';
    srcvar = 'VSSTRESN';
    srcseq = vsseq;

    format adt date9.;
    keep studyid usubjid subjid siteid trtp trtpn trta trtan
         age agegr1 agegr1n sex race saffl ittfl trtsdt trtedt
         paramcd param paramn aval avalu avisit avisitn visit visitnum
         adt ady srcdom srcvar srcseq heightbl;
run;


/*---------------------------------------------------------------------------*
 | 2. BMI - A DERIVED PARAMETER                                               |
 |                                                                            |
 | BMI appears in NO SDTM domain. It is a new PARAMCD, computed from the      |
 | visit's weight and the subject's BASELINE height - because height is       |
 | measured once and does not change over four weeks.                        |
 |                                                                            |
 | TWO THINGS THAT LOOK WRONG AND ARE NOT:                                    |
 |                                                                            |
 |   DTYPE stays EMPTY. DTYPE identifies a derived RECORD WITHIN a parameter  |
 |   - a LOCF carry-forward, an average of replicates. A whole new parameter  |
 |   is not that. Setting DTYPE here would tell a reviewer these rows were    |
 |   imputed, which they were not.                                            |
 |                                                                            |
 |   SRCDOM / SRCVAR / SRCSEQ stay EMPTY. There is no single SDTM record to   |
 |   point at - BMI comes from a weight record AND a height record AND ADSL.  |
 |   Naming just the weight row would be a false trail. The blank is          |
 |   information: "this was computed, see the derivation in define.xml".      |
 *---------------------------------------------------------------------------*/
data advs_bmi;
    set advs_vs;
    where paramcd = 'WEIGHT' and aval > . and heightbl > .;

    paramcd = 'BMI';
    param   = 'Body Mass Index (kg/m2)';
    paramn  = 7;
    aval    = round(aval / ((heightbl / 100) ** 2), 0.01);
    avalu   = 'kg/m2';

    /*  No source record to name - see the note above.                        */
    srcdom = '';
    srcvar = '';
    srcseq = .;
run;

data advs_all;
    set advs_vs advs_bmi;
    drop heightbl;
run;


/*---------------------------------------------------------------------------*
 | 3. ABLFL - THE BASELINE RULE, AGAIN                                        |
 |                                                                            |
 | Same rule as ADSL: the LAST non-missing value ON OR BEFORE first dose.     |
 | Applied per subject PER PARAMETER, so it can resolve to different visits   |
 | for different parameters - and it does. HEIGHT baselines at Screening,     |
 | everything else at Baseline.                                               |
 |                                                                            |
 | Do NOT use VSBLFL. See Notebook 14 if you need reminding why.              |
 *---------------------------------------------------------------------------*/
data bl_cand;
    set advs_all;
    where aval > . and adt > . and adt <= trtsdt;
run;

proc sort data = bl_cand; by usubjid paramcd adt; run;

data bl_pick;
    set bl_cand;
    by usubjid paramcd adt;
    if last.paramcd;                 /* the LAST one on or before first dose */
    length ablfl $1;
    ablfl = 'Y';
    base  = aval;
    keep usubjid paramcd avisitn ablfl base;
run;

/*  Two different merges, because the two variables have different scope:
    ABLFL belongs to ONE ROW; BASE belongs to EVERY row of that parameter.    */
data bl_base;
    set bl_pick;
    keep usubjid paramcd base;
run;

proc sort data = advs_all; by usubjid paramcd avisitn; run;
proc sort data = bl_pick;  by usubjid paramcd avisitn; run;

data advs_flagged;
    merge advs_all (in = a) bl_pick (keep = usubjid paramcd avisitn ablfl);
    by usubjid paramcd avisitn;
    if a;
run;

proc sort data = advs_flagged; by usubjid paramcd; run;
proc sort data = bl_base;      by usubjid paramcd; run;

data advs_based;
    merge advs_flagged (in = a) bl_base;
    by usubjid paramcd;
    if a;
run;


/*---------------------------------------------------------------------------*
 | 4. CHG, PCHG, ANL01FL, DTYPE                                               |
 |                                                                            |
 | CHG IS BLANK AT BASELINE - NOT ZERO. A baseline record's change is         |
 | UNDEFINED, not zero. Writing 0 puts it into the mean-change column and     |
 | drags the average toward zero. That is a real, silent bias, and it is one  |
 | of the most common ADaM bugs there is.                                     |
 |                                                                            |
 | ROUNDING IS SPECIFIED, NOT INCIDENTAL. 70.2 - 70.5 is -0.29999999999999716 |
 | in SAS and in Python alike. Only an explicit ROUND to a precision the spec |
 | names makes two implementations agree. Do not skip it because the numbers  |
 | "look fine" - they look fine right up until PROC COMPARE says otherwise.   |
 *---------------------------------------------------------------------------*/
data advs;
    set advs_based;
    length dtype $8 anl01fl $1;

    /*  Is this an on-treatment, post-baseline record?                        */
    post = (base > . and aval > . and ablfl ne 'Y' and adt > . and adt >= trtsdt);

    if post then do;
        chg = round(aval - base, 0.0001);
        /*  Guard the denominator. Nothing here has a baseline of 0, but a lab
            value can - and PCHG must then be MISSING, not a division error.  */
        if base ne 0 then pchg = round(100 * chg / base, 0.0001);
    end;

    /*  ANL01FL marks the records the primary analysis uses: the baseline and
        the on-treatment visits. A Screening result that is not the baseline
        is real data - it is KEPT, and simply not analysed. That is why the
        flag exists instead of deleting the rows.                             */
    if ablfl = 'Y' or post then anl01fl = 'Y';

    dtype = '';        /* every record here is OBSERVED - see section 2 */

    label
        paramcd = 'Parameter Code'
        param   = 'Parameter'
        paramn  = 'Parameter (N)'
        aval    = 'Analysis Value'
        avalu   = 'Analysis Value Unit'
        avisit  = 'Analysis Visit'
        avisitn = 'Analysis Visit (N)'
        adt     = 'Analysis Date'
        ady     = 'Analysis Relative Day'
        ablfl   = 'Baseline Record Flag'
        base    = 'Baseline Value'
        chg     = 'Change from Baseline'
        pchg    = 'Percent Change from Baseline'
        dtype   = 'Derivation Type'
        anl01fl = 'Analysis Flag 01'
        srcdom  = 'Source Domain'
        srcvar  = 'Source Variable'
        srcseq  = 'Source Sequence Number';

    keep studyid usubjid subjid siteid trtp trtpn trta trtan
         age agegr1 agegr1n sex race saffl ittfl trtsdt trtedt
         paramcd param paramn aval avalu avisit avisitn visit visitnum
         adt ady ablfl base chg pchg dtype anl01fl srcdom srcvar srcseq;
run;

proc sort data = advs; by usubjid paramn avisitn; run;


/*---------------------------------------------------------------------------*
 | 5. CHECK YOUR WORK                                                         |
 *---------------------------------------------------------------------------*/
title 'ADVS - one subject, all seven parameters';
proc print data = advs noobs;
    where usubjid = 'ABC-01-01-001';
    var paramcd avisit ady aval ablfl base chg pchg anl01fl;
run;
title;

/*  The baseline rule resolving to DIFFERENT visits for different parameters.
    This is the whole point of section 3.                                     */
title 'Which visit did each parameter baseline at?';
proc freq data = advs;
    where ablfl = 'Y';
    tables paramcd * avisit / nocol norow nopercent;
run;
title;

/*  Exactly ONE baseline per subject per parameter. MUST be empty.            */
title 'Multiple-baseline check - MUST be empty';
proc sql;
    select usubjid, paramcd, count(*) as n_baselines
    from advs where ablfl = 'Y'
    group by usubjid, paramcd
    having count(*) > 1;
quit;
title;

/*  PARAMCD must map to exactly one PARAM and one PARAMN. MUST be empty.      */
title 'PARAMCD one-to-one check - MUST be empty';
proc sql;
    select paramcd, count(distinct param) as n_param,
           count(distinct paramn) as n_paramn
    from advs
    group by paramcd
    having count(distinct param) > 1 or count(distinct paramn) > 1;
quit;
title;

/*  HEIGHT has only a Screening record, which IS its baseline - so it has no
    change anywhere. Correct, not missing data.                               */
title 'HEIGHT - baseline only, so no change';
proc print data = advs noobs;
    where paramcd = 'HEIGHT';
    var usubjid avisit aval ablfl base chg anl01fl;
run;
title;

title 'Mean change from baseline at Week 4, by treatment';
proc means data = advs mean std n maxdec = 2;
    where anl01fl = 'Y' and avisit = 'Week 4';
    class trta paramcd;
    var chg;
run;
title;


/*---------------------------------------------------------------------------*
 | 6. COMPARE AGAINST THE REFERENCE                                           |
 *---------------------------------------------------------------------------*/
data ref_advs;
    infile "&datapath/adam/advs.csv" dsd firstobs = 2 truncover;
    length studyid $10 usubjid $20 subjid $5 siteid $3
           trtp $20 trtpn 8 trta $20 trtan 8
           age 8 agegr1 $5 agegr1n 8 sex $1 race $40 saffl ittfl $1
           trtsdt trtedt $10
           paramcd $8 param $40 paramn 8 aval 8 avalu $20
           avisit $20 avisitn 8 visit $20 visitnum 8 adt $10 ady 8
           ablfl $1 base 8 chg 8 pchg 8 dtype $8 anl01fl $1
           srcdom $8 srcvar $8 srcseq 8;
    input studyid $ usubjid $ subjid $ siteid $ trtp $ trtpn trta $ trtan
          age agegr1 $ agegr1n sex $ race $ saffl $ ittfl $
          trtsdt $ trtedt $ paramcd $ param $ paramn aval avalu $
          avisit $ avisitn visit $ visitnum adt $ ady
          ablfl $ base chg pchg dtype $ anl01fl $ srcdom $ srcvar $ srcseq;
run;

data mine_advs;
    set advs;
    length c_trtsdt c_trtedt c_adt $10;
    c_trtsdt = put(trtsdt, yymmdd10.);
    c_trtedt = put(trtedt, yymmdd10.);
    if adt > . then c_adt = put(adt, yymmdd10.);
    drop trtsdt trtedt adt;
    rename c_trtsdt = trtsdt  c_trtedt = trtedt  c_adt = adt;
run;

proc sort data = mine_advs; by usubjid paramcd avisitn; run;
proc sort data = ref_advs;  by usubjid paramcd avisitn; run;

title 'PROC COMPARE - your ADVS vs the reference';
proc compare base = ref_advs compare = mine_advs listall;
    id usubjid paramcd avisitn;
run;
title;

data adam.advs;
    set advs;
run;


/*===========================================================================*
 |  YOUR TURN  -  exercises                                                   |
 |  Solutions: ../../answer-keys/16_build_advs_answers.md                     |
 *===========================================================================*/

/* EXERCISE 1 -------------------------------------------------------------- *
 | Set CHG = 0 on every baseline record instead of leaving it missing, then   |
 | recompute the mean change from baseline for WEIGHT across all visits and   |
 | all subjects. How far does the mean move, and in which direction? Now      |
 | explain why the bias always points the same way, whatever the data.        |
 *------------------------------------------------------------------------- */



/* EXERCISE 2 -------------------------------------------------------------- *
 | Remove the ROUND() from CHG and PCHG and re-run the PROC COMPARE against   |
 | the reference. How many variables differ, and by how much? Look at the     |
 | actual reported difference - is it a real disagreement about the data, or  |
 | about how a number is stored? Which would you rather find in QC?           |
 *------------------------------------------------------------------------- */



/* EXERCISE 3 -------------------------------------------------------------- *
 | ADVS has 152 rows: 128 from VS and 24 derived BMI records. Prove both      |
 | numbers from the data rather than trusting them - count the VS records,    |
 | count the weight measurements, and show the arithmetic. Then explain why   |
 | there are 24 BMI rows and not 8, and not 32.                               |
 *------------------------------------------------------------------------- */



/* EXERCISE 4 -------------------------------------------------------------- *
 | Screening records that are not the baseline have ANL01FL blank - kept, but |
 | not analysed. Try deleting them instead, at two different points:          |
 |    (a) AFTER  deriving ABLFL - drop rows where AVISIT='Screening' and      |
 |        ABLFL ne 'Y'                                                        |
 |    (b) BEFORE deriving ABLFL - drop every Screening row up front, then run |
 |        section 3 as written                                                |
 | Count the rows and the baselines in each. One is harmless; the other       |
 | destroys a parameter completely. Which, and why does the ORDER decide it?  |
 *------------------------------------------------------------------------- */



/* EXERCISE 5 (stretch) ---------------------------------------------------- *
 | The reference sets DTYPE to blank on the BMI rows. Suppose a colleague     |
 | argues BMI is "derived" so DTYPE should say so. Read the ADaMIG definition |
 | of DTYPE, then write the two-sentence reply you would send. Include what   |
 | a reviewer would WRONGLY conclude if DTYPE were populated on those rows.   |
 *------------------------------------------------------------------------- */
