/*===========================================================================*
 |  NOTEBOOK 17 (SAS)  -  BUILD ADLB                                          |
 |  Clinical Programming Bootcamp  -  Module: Analysis of Lab Data            |
 |---------------------------------------------------------------------------|
 |  GOAL: turn SDTM LB + ADSL into ADLB - the laboratory analysis dataset.    |
 |                                                                            |
 |  ADLB is BDS, exactly like ADVS. The skeleton is the same. What is new is  |
 |  everything that comes from a lab having a NORMAL RANGE:                   |
 |     ANRLO / ANRHI   the range itself                                       |
 |     ANRIND          where this result sits in it                           |
 |     BNRIND          where the BASELINE sat in it                           |
 |     SHIFT1          the two together - the shift table in one column       |
 |     CRIT1 / CRIT1FL a prespecified yes/no question                         |
 |                                                                            |
 |  And one thing that is not about labs at all: only 4 of the 8 subjects     |
 |  have any lab data. That fact decides every percentage in this notebook.   |
 |                                                                            |
 |  Spec      : ../../data/adam_specification.md      (section 4)             |
 |  Target    : ../../data/adam/adlb.csv              (the finished answer)   |
 |  Needs     : Notebook 16 (ADVS) - this is the same skeleton                |
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
 | 0. READ THE SOURCES                                                        |
 *---------------------------------------------------------------------------*/
data lb;
    infile "&datapath/sdtm/lb.csv" dsd firstobs = 2 truncover;
    length studyid $10 domain $2 usubjid $20 lbseq 8 lbtestcd $8 lbtest $40
           lbcat $20 lborres $20 lborresu $20 lbornrlo $20 lbornrhi $20
           lbstresc $20 lbstresn 8 lbstresu $20 lbstnrlo 8 lbstnrhi 8
           lbnrind $10 lbblfl $1 visitnum 8 visit $20 lbdtc $10 lbdy 8;
    input studyid $ domain $ usubjid $ lbseq lbtestcd $ lbtest $ lbcat $
          lborres $ lborresu $ lbornrlo $ lbornrhi $ lbstresc $ lbstresn
          lbstresu $ lbstnrlo lbstnrhi lbnrind $ lbblfl $ visitnum
          visit $ lbdtc $ lbdy;
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
         age agegr1 agegr1n sex race saffl ittfl trtsdt trtedt;
run;

proc sort data = lb;       by usubjid; run;
proc sort data = ref_adsl; by usubjid; run;


/*---------------------------------------------------------------------------*
 | 1. THE DENOMINATOR - LOOK AT THIS BEFORE YOU WRITE ANY CODE                |
 |                                                                            |
 | ADSL has 8 subjects. LB has 4. Four subjects had no labs drawn at all.     |
 |                                                                            |
 | So ANY percentage computed from ADLB's own subject count is WRONG. If two  |
 | subjects have an abnormal result, that is 2/8 = 25% of the study, NOT      |
 | 2/4 = 50%. The denominator ALWAYS comes from ADSL, filtered by the         |
 | population flag the table calls for.                                       |
 |                                                                            |
 | This is the most common ADaM error in practice, and it is invisible:       |
 | 50% is a perfectly plausible number. Nothing warns you.                    |
 *---------------------------------------------------------------------------*/
proc sql;
    title 'The denominator problem - these two numbers are NOT the same';
    select (select count(distinct usubjid) from ref_adsl where saffl = 'Y')
               as subjects_in_safety_population,
           (select count(distinct usubjid) from lb)
               as subjects_with_any_lab_data;
    title;
quit;


/*---------------------------------------------------------------------------*
 | 2. MAP LB INTO THE BDS SHAPE                                               |
 |                                                                            |
 | Identical to Notebook 16, plus PARCAT1. Lab tests come in panels -         |
 | HEMATOLOGY and CHEMISTRY - and tables are almost always broken out by      |
 | panel, so the category has to be on the row.                               |
 *---------------------------------------------------------------------------*/
data adlb_map;
    merge lb (in = a) ref_adsl (in = b);
    by usubjid;
    if a;

    length paramcd $8 param $40 parcat1 $20 avalu $20 avisit $20
           trtp trta $20 anrind bnrind $10 shift1 $24
           crit1 $40 crit1fl $1 dtype $8 anl01fl $1 srcdom srcvar $8;

    paramcd = lbtestcd;
    if      lbtestcd = 'HGB'   then do; param = 'Hemoglobin (g/dL)';               paramn = 1; end;
    else if lbtestcd = 'HCT'   then do; param = 'Hematocrit (%)';                  paramn = 2; end;
    else if lbtestcd = 'WBC'   then do; param = 'Leukocytes (10^9/L)';             paramn = 3; end;
    else if lbtestcd = 'PLAT'  then do; param = 'Platelets (10^9/L)';              paramn = 4; end;
    else if lbtestcd = 'ALT'   then do; param = 'Alanine Aminotransferase (U/L)';  paramn = 5; end;
    else if lbtestcd = 'CREAT' then do; param = 'Creatinine (mg/dL)';              paramn = 6; end;
    else put "ERROR: unmapped LBTESTCD " lbtestcd= " - the lookup is incomplete";

    parcat1 = lbcat;
    aval    = lbstresn;
    avalu   = lbstresu;
    anrlo   = lbstnrlo;
    anrhi   = lbstnrhi;

    /*  ANALYSIS visit. Note that WEEK 4 is collected on study day 28 for
        three subjects and day 29 for ABC-01-01-002. Two different actual
        days, ONE analysis visit - which is exactly what AVISIT is for.       */
    if      visit = 'SCREENING' then do; avisit = 'Screening'; avisitn = 0; end;
    else if visit = 'BASELINE'  then do; avisit = 'Baseline';  avisitn = 1; end;
    else if visit = 'WEEK 4'    then do; avisit = 'Week 4';    avisitn = 4; end;
    else put "ERROR: unmapped VISIT " visit= " - the lookup is incomplete";

    adt = input(lbdtc, yymmdd10.);
    if adt > . then do;
        if adt >= trtsdt then ady = adt - trtsdt + 1;
        else                  ady = adt - trtsdt;
    end;

    trtp = trt01p;  trtpn = trt01pn;
    trta = trt01a;  trtan = trt01an;

    srcdom = 'LB';
    srcvar = 'LBSTRESN';
    srcseq = lbseq;

    format adt date9.;
    keep studyid usubjid subjid siteid trtp trtpn trta trtan
         age agegr1 agegr1n sex race saffl ittfl trtsdt trtedt
         paramcd param paramn parcat1 aval avalu avisit avisitn
         visit visitnum adt ady anrlo anrhi lbnrind
         srcdom srcvar srcseq;
run;


/*---------------------------------------------------------------------------*
 | 3. ANRIND - DERIVE IT, THEN CHECK THE SOURCE AGREES                        |
 |                                                                            |
 | LB already carries LBNRIND. We derive ANRIND ourselves from AVAL against   |
 | the range, and THEN compare the two.                                       |
 |                                                                            |
 | Why not just copy it? Because a reference range indicator is arithmetic we |
 | can verify, and a disagreement between our arithmetic and the lab's        |
 | reported flag is worth knowing about - it usually means the range on the   |
 | record is not the range the flag was computed against. Copying hides that; |
 | deriving and comparing surfaces it.                                        |
 |                                                                            |
 | Contrast with TRTEMFL in Notebook 15, which we did NOT re-derive. The      |
 | difference: TRTEMFL encodes a study DECISION documented upstream; ANRIND   |
 | is pure arithmetic on values sitting on the same row.                      |
 *---------------------------------------------------------------------------*/
data adlb_ind;
    set adlb_map;
    length anrind $10;

    if aval > . and anrlo > . and anrhi > . then do;
        if      aval < anrlo then anrind = 'LOW';
        else if aval > anrhi then anrind = 'HIGH';
        else                      anrind = 'NORMAL';
    end;
run;

title 'ANRIND cross-check against the LB source flag - MUST be empty';
proc print data = adlb_ind noobs;
    where anrind ne lbnrind;
    var usubjid paramcd avisit aval anrlo anrhi anrind lbnrind;
run;
title;


/*---------------------------------------------------------------------------*
 | 4. BASELINE - THE SAME RULE, FOR THE THIRD TIME                            |
 *---------------------------------------------------------------------------*/
data bl_cand;
    set adlb_ind;
    where aval > . and adt > . and adt <= trtsdt;
run;

proc sort data = bl_cand; by usubjid paramcd adt; run;

data bl_pick;
    set bl_cand;
    by usubjid paramcd adt;
    if last.paramcd;
    length ablfl $1;
    ablfl = 'Y';
    base  = aval;
    /*  BNRIND is the baseline's ANRIND - carried to every row of the
        parameter, because a shift needs to know where it STARTED.           */
    bl_ind = anrind;
    keep usubjid paramcd avisitn ablfl base bl_ind;
run;

data bl_base;
    set bl_pick;
    keep usubjid paramcd base bl_ind;
run;

proc sort data = adlb_ind; by usubjid paramcd avisitn; run;
proc sort data = bl_pick;  by usubjid paramcd avisitn; run;

data adlb_flagged;
    merge adlb_ind (in = a) bl_pick (keep = usubjid paramcd avisitn ablfl);
    by usubjid paramcd avisitn;
    if a;
run;

proc sort data = adlb_flagged; by usubjid paramcd; run;
proc sort data = bl_base;      by usubjid paramcd; run;

data adlb_based;
    merge adlb_flagged (in = a) bl_base;
    by usubjid paramcd;
    if a;
run;


/*---------------------------------------------------------------------------*
 | 5. CHANGE, SHIFT AND THE CRITERION FLAG                                    |
 |                                                                            |
 | SHIFT1 is a shift table in one column: "where it started" to "where it is  |
 | now". A shift table is simply a cross-tabulation of BNRIND by ANRIND, and  |
 | that is only possible because both ends sit on the SAME ROW.               |
 |                                                                            |
 | SHIFT1 is BLANK at baseline. A baseline has not shifted from anywhere.     |
 |                                                                            |
 | CRIT1 / CRIT1FL answer ONE prespecified question. Three rules:             |
 |   - CRIT1 states the question IN WORDS, on the row, so the flag is never   |
 |     ambiguous six months later.                                            |
 |   - The flag is populated ONLY on rows the criterion can apply to.         |
 |   - On every other row it is BLANK, not 'N'. 'N' would assert "evaluated   |
 |     and did not meet", which for a creatinine record is simply false.      |
 |     Blank says "not evaluated". Conflating the two inflates the            |
 |     denominator of every criterion summary.                                |
 *---------------------------------------------------------------------------*/
data adlb;
    set adlb_based;
    length dtype $8 anl01fl $1 bnrind $10 shift1 $24 crit1 $40 crit1fl $1;

    bnrind = bl_ind;

    post = (base > . and aval > . and ablfl ne 'Y' and adt > . and adt >= trtsdt);

    if post then do;
        chg = round(aval - base, 0.0001);
        if base ne 0 then pchg = round(100 * chg / base, 0.0001);
    end;

    if ablfl = 'Y' or post then anl01fl = 'Y';

    /*  The shift, on post-baseline records only.                            */
    if ablfl ne 'Y' and bnrind ne '' and anrind ne '' then
        shift1 = catx(' ', strip(bnrind), 'to', strip(anrind));

    /*  The prespecified criterion. ALT only - see the note above.           */
    if paramcd = 'ALT' then do;
        crit1 = 'ALT > ULN';
        if aval > . and anrhi > . and aval > anrhi then crit1fl = 'Y';
        else                                            crit1fl = 'N';
    end;

    dtype = '';

    label
        parcat1 = 'Parameter Category 1'
        anrlo   = 'Analysis Normal Range Lower Limit'
        anrhi   = 'Analysis Normal Range Upper Limit'
        anrind  = 'Analysis Reference Range Indicator'
        bnrind  = 'Baseline Reference Range Indicator'
        shift1  = 'Shift 1'
        crit1   = 'Analysis Criterion 1'
        crit1fl = 'Criterion 1 Evaluation Result Flag';

    keep studyid usubjid subjid siteid trtp trtpn trta trtan
         age agegr1 agegr1n sex race saffl ittfl trtsdt trtedt
         paramcd param paramn parcat1 aval avalu avisit avisitn
         visit visitnum adt ady ablfl base chg pchg dtype anl01fl
         anrlo anrhi anrind bnrind shift1 crit1 crit1fl
         srcdom srcvar srcseq;
run;

proc sort data = adlb; by usubjid paramn avisitn; run;


/*---------------------------------------------------------------------------*
 | 6. CHECK YOUR WORK                                                         |
 *---------------------------------------------------------------------------*/
title 'ADLB - the study abnormal';
proc print data = adlb noobs;
    where usubjid = 'ABC-01-01-003' and paramcd = 'ALT';
    var avisit ady aval anrlo anrhi anrind bnrind shift1 crit1 crit1fl;
run;
title;

/*  The shift table. One cell is not on the diagonal - that is the whole
    clinical content of this study's lab data.                               */
title 'Shift table - baseline vs Week 4, all parameters';
proc freq data = adlb;
    where anl01fl = 'Y' and ablfl ne 'Y';
    tables bnrind * anrind / nocol norow nopercent;
run;
title;

/*  CRIT1FL must be blank - not 'N' - wherever the criterion does not apply.  */
title 'Criterion flag population - blank OFF parameter, Y/N ON it';
proc freq data = adlb;
    tables paramcd * crit1fl / missing nocol norow nopercent;
run;
title;

/*  THE DENOMINATOR, DONE CORRECTLY. The percentage divides by the SAFETY
    POPULATION from ADSL, not by the number of subjects who had labs.        */
proc sql;
    title 'Subjects with ALT > ULN - correct vs wrong denominator';
    select (select count(distinct usubjid) from adlb where crit1fl = 'Y')
               as subjects_meeting_criterion,
           (select count(distinct usubjid) from ref_adsl where saffl = 'Y')
               as correct_denominator_from_adsl,
           (select count(distinct usubjid) from adlb)
               as wrong_denominator_from_adlb;
    title;
quit;

title 'Multiple-baseline check - MUST be empty';
proc sql;
    select usubjid, paramcd, count(*) as n_baselines
    from adlb where ablfl = 'Y'
    group by usubjid, paramcd
    having count(*) > 1;
quit;
title;


/*---------------------------------------------------------------------------*
 | 7. COMPARE AGAINST THE REFERENCE                                           |
 *---------------------------------------------------------------------------*/
data ref_adlb;
    infile "&datapath/adam/adlb.csv" dsd firstobs = 2 truncover;
    length studyid $10 usubjid $20 subjid $5 siteid $3
           trtp $20 trtpn 8 trta $20 trtan 8
           age 8 agegr1 $5 agegr1n 8 sex $1 race $40 saffl ittfl $1
           trtsdt trtedt $10
           paramcd $8 param $40 paramn 8 parcat1 $20 aval 8 avalu $20
           avisit $20 avisitn 8 visit $20 visitnum 8 adt $10 ady 8
           ablfl $1 base 8 chg 8 pchg 8 dtype $8 anl01fl $1
           anrlo 8 anrhi 8 anrind $10 bnrind $10 shift1 $24
           crit1 $40 crit1fl $1 srcdom $8 srcvar $8 srcseq 8;
    input studyid $ usubjid $ subjid $ siteid $ trtp $ trtpn trta $ trtan
          age agegr1 $ agegr1n sex $ race $ saffl $ ittfl $
          trtsdt $ trtedt $ paramcd $ param $ paramn parcat1 $ aval avalu $
          avisit $ avisitn visit $ visitnum adt $ ady
          ablfl $ base chg pchg dtype $ anl01fl $
          anrlo anrhi anrind $ bnrind $ shift1 $ crit1 $ crit1fl $
          srcdom $ srcvar $ srcseq;
run;

data mine_adlb;
    set adlb;
    length c_trtsdt c_trtedt c_adt $10;
    c_trtsdt = put(trtsdt, yymmdd10.);
    c_trtedt = put(trtedt, yymmdd10.);
    if adt > . then c_adt = put(adt, yymmdd10.);
    drop trtsdt trtedt adt;
    rename c_trtsdt = trtsdt  c_trtedt = trtedt  c_adt = adt;
run;

proc sort data = mine_adlb; by usubjid paramcd avisitn; run;
proc sort data = ref_adlb;  by usubjid paramcd avisitn; run;

title 'PROC COMPARE - your ADLB vs the reference';
proc compare base = ref_adlb compare = mine_adlb listall;
    id usubjid paramcd avisitn;
run;
title;

data adam.adlb;
    set adlb;
run;


/*===========================================================================*
 |  YOUR TURN  -  exercises                                                   |
 |  Solutions: ../../answer-keys/17_build_adlb_answers.md                     |
 *===========================================================================*/

/* EXERCISE 1 -------------------------------------------------------------- *
 | Produce the line "Subjects with any post-baseline abnormal lab result,     |
 | n (%)" by treatment - twice. Once dividing by the safety population from   |
 | ADSL, once dividing by the subjects present in ADLB. Report both           |
 | percentages. Which subjects are missing from the second denominator, and   |
 | why does their absence make that number meaningless?                       |
 *------------------------------------------------------------------------- */



/* EXERCISE 2 -------------------------------------------------------------- *
 | Set CRIT1FL = 'N' on every non-ALT record instead of leaving it blank.     |
 | Now count "records evaluated against criterion 1" and "records meeting     |
 | criterion 1" both ways. What happens to the percentage meeting the         |
 | criterion, and what exactly is the false statement you have made about     |
 | the creatinine records?                                                    |
 *------------------------------------------------------------------------- */



/* EXERCISE 3 -------------------------------------------------------------- *
 | Build the shift table as a real table: BNRIND down the side, ANRIND        |
 | across the top, restricted to post-baseline analysis records. How many     |
 | cells are off the diagonal, and what does an off-diagonal cell mean        |
 | clinically? Then explain why a shift table needs BOTH ends on one row      |
 | rather than joining baseline records to post-baseline ones at run time.    |
 *------------------------------------------------------------------------- */



/* EXERCISE 4 -------------------------------------------------------------- *
 | The Week 4 visit is study day 28 for three subjects and day 29 for         |
 | ABC-01-01-002, yet all four map to AVISIT = 'Week 4'. Find the records.    |
 | Now suppose the protocol defined the Week 4 window as days 26-30. Write    |
 | the AVISIT derivation as a WINDOW on ADY rather than a lookup on VISIT,    |
 | and say which approach you would trust more in a study where sites are     |
 | inconsistent about visit labels.                                           |
 *------------------------------------------------------------------------- */



/* EXERCISE 5 (stretch) ---------------------------------------------------- *
 | We DERIVED ANRIND but READ TRTEMFL from SUPPAE. Both are flags that        |
 | already existed upstream. Write the rule you would apply to decide, for    |
 | any upstream flag, whether ADaM should re-derive it or read it - then      |
 | test your rule against three more: LBBLFL, AESEV, and DM.AGE.              |
 *------------------------------------------------------------------------- */
