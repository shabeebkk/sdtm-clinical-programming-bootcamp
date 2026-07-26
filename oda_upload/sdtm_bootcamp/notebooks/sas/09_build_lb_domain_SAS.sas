/*===========================================================================*
 |  NOTEBOOK 09 (SAS)  -  BUILD THE LB DOMAIN                                 |
 |  Clinical Programming Bootcamp  -  Module: Findings                        |
 |---------------------------------------------------------------------------|
 |  GOAL: turn lb_raw.csv into a compliant SDTM LB dataset.                   |
 |                                                                            |
 |  Good news: lb_raw.csv is ALREADY TALL - one row per test - so there is    |
 |  NO TRANSPOSE. 48 raw rows in, 48 SDTM rows out.                           |
 |                                                                            |
 |  What LB adds instead:                                                     |
 |     1. LBTESTCD / LBTEST  - a CT lookup, and one test is RENAMED           |
 |     2. LBCAT              - which lab panel the test belongs to            |
 |     3. reference ranges   - LBORNRLO/HI and LBSTNRLO/HI                    |
 |     4. LBNRIND            - DERIVED from the result and the range          |
 |                                                                            |
 |  The baseline flag works exactly as it did in VS - reuse that logic.       |
 |                                                                            |
 |  Spec       : ../../data/mapping_specification.md   (section 7)            |
 |  Target     : ../../data/sdtm/lb.csv                                       |
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
data lb_raw;
    infile "&datapath/lb_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 visit $20 lbdt $11 lbtest $40
           lborres $20 lborresu $12 lbornrlo $12 lbornrhi $12;
    input studyid $ siteid $ subjid $ visit $ lbdt $ lbtest $
          lborres $ lborresu $ lbornrlo $ lbornrhi $;
run;

data ex_raw;
    infile "&datapath/ex_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 extrt $20 exdose 8 exdosu $10
           exfreq $10 exroute $15 exstdtc $11 exendtc $11 exintp $1;
    input studyid $ siteid $ subjid $ extrt $ exdose exdosu $ exfreq $
          exroute $ exstdtc $ exendtc $ exintp $;
run;

proc sql;
    create table ref_dates as
    select siteid, subjid, min(input(exstdtc, date11.)) as rfstdtc_n
    from ex_raw group by siteid, subjid;
quit;


/*---------------------------------------------------------------------------*
 | 1. MAP THE TESTS                                                           |
 |                                                                            |
 |  *** LOOK CLOSELY AT THE THIRD ONE. ***                                    |
 |                                                                            |
 |  Five of the six lab names pass straight through to LBTEST. One does not:  |
 |  the lab reports "White Blood Cells", but the CDISC controlled term is     |
 |  "Leukocytes". A programmer who spot-checks two rows concludes the column  |
 |  maps 1-to-1 and ships the sixth wrong.                                    |
 |                                                                            |
 |  BOTH LBTESTCD and LBTEST are controlled terminology, and they are PAIRED  |
 |  - you cannot combine a code from the list with a name of your own.        |
 |  Look every value up. Never translate by eye.                              |
 |                                                                            |
 |  LBTESTCD is limited to 8 characters and may not contain spaces, which is  |
 |  why WBC and PLAT are abbreviated while ALT already fits.                  |
 *---------------------------------------------------------------------------*/
proc sort data = lb_raw;    by siteid subjid; run;
proc sort data = ref_dates; by siteid subjid; run;

data lb_work;
    merge lb_raw (in = a) ref_dates;
    by siteid subjid;
    if a;

    length usubjid $20 domain $2 lbtestcd $8 lbtest_ $40 lbcat $20
           lbstresc $20 lbstresu $12 lbstnrlo $12 lbstnrhi $12
           lbnrind $8 lbblfl $1;
    domain = "LB";
    usubjid = catx("-", studyid, siteid, subjid);

    /* --- 1a. the CT lookup: raw name -> code + submission name + panel --- */
    select (strip(lbtest));
        when ("Hemoglobin")               do; lbtestcd = "HGB";   lbtest_ = "Hemoglobin";               lbcat = "HEMATOLOGY"; end;
        when ("Hematocrit")               do; lbtestcd = "HCT";   lbtest_ = "Hematocrit";               lbcat = "HEMATOLOGY"; end;
        when ("White Blood Cells")        do; lbtestcd = "WBC";   lbtest_ = "Leukocytes";               lbcat = "HEMATOLOGY"; end;   /* <-- RENAMED */
        when ("Platelets")                do; lbtestcd = "PLAT";  lbtest_ = "Platelets";                lbcat = "HEMATOLOGY"; end;
        when ("Alanine Aminotransferase") do; lbtestcd = "ALT";   lbtest_ = "Alanine Aminotransferase"; lbcat = "CHEMISTRY";  end;
        when ("Creatinine")               do; lbtestcd = "CREAT"; lbtest_ = "Creatinine";               lbcat = "CHEMISTRY";  end;
        otherwise do;
            /*  Do NOT silently blank an unrecognised test. Say so loudly:
                a new test appearing in the extract is a spec change, not
                something a mapping program should quietly absorb.          */
            lbtestcd = ""; lbtest_ = ""; lbcat = "";
            put "ERROR: unmapped lab test >" lbtest "< for " usubjid=;
        end;
    end;

    /* --- 1b. dates and study day --- */
    _dt = input(lbdt, date11.);
    if not missing(_dt) then lbdtc = put(_dt, yymmdd10.);
    if not missing(_dt) and not missing(rfstdtc_n) then do;
        if _dt >= rfstdtc_n then lbdy = _dt - rfstdtc_n + 1;
        else                     lbdy = _dt - rfstdtc_n;
    end;

    /* --- 1c. VISITNUM: protocol lookup. LB has no screening draw. --- */
    select (strip(visit));
        when ("BASELINE") visitnum = 2;
        when ("WEEK 4")   visitnum = 4;
        otherwise         visitnum = .;
    end;

    /* --- 1d. standardised result and range ---------------------------- *
     |  The sites already report in standard units, so the standardised    |
     |  values equal the original ones. In a multi-lab study THIS is where |
     |  you would convert, and the standardised RANGE matters even more    |
     |  than the standardised result: different labs use different ranges  |
     |  for the same test, so only LBSTNRLO/HI are comparable across them. |
     *------------------------------------------------------------------- */
    lbstresc = lborres;
    lbstresn = input(lborres, ?? best.);   /* ?? = no log note if non-numeric */
    lbstresu = lborresu;
    lbstnrlo = lbornrlo;
    lbstnrhi = lbornrhi;

    /* --- 1e. LBNRIND: DERIVED, never collected ------------------------- */
    _lo = input(lbstnrlo, ?? best.);
    _hi = input(lbstnrhi, ?? best.);
    if missing(lbstresn) or missing(_lo) or missing(_hi) then lbnrind = "";
    else if lbstresn < _lo then lbnrind = "LOW";
    else if lbstresn > _hi then lbnrind = "HIGH";
    else                        lbnrind = "NORMAL";

    /*  SITEID and SUBJID must go. They were needed to build USUBJID and to
        join to the reference dates, but they are NOT SDTM LB variables -
        USUBJID already carries that information. Leave them in and the
        domain ships with two extra columns and no error of any kind.

        Every other domain here drops them (CM, EX) or uses a KEEP list
        (VS, DM). LB was the one that did neither.                        */
    drop lbtest lbdt _lo _hi _dt rfstdtc_n siteid subjid;
    rename lbtest_ = lbtest;
run;


/*---------------------------------------------------------------------------*
 | 2. BASELINE FLAG  -  identical rules to VS                                 |
 |    (a) on or before first dose: LBDY <= 1                                  |
 |    (b) the LATEST such visit, per subject per test                         |
 |    (c) only for tests that have a post-dose result                         |
 |                                                                            |
 |    Every test is drawn at both BASELINE and WEEK 4, so condition (c)       |
 |    excludes nothing here (unlike VS, where it excluded HEIGHT).            |
 |                                                                            |
 |    Expected: 24 flags. Work out the arithmetic before you run Check 3 -    |
 |    and note it is NOT 8 subjects x 6 tests. Only FOUR of the eight         |
 |    enrolled subjects have labs at all:                                     |
 |                                                                            |
 |        4 subjects x 6 tests x 2 visits = 48 rows                           |
 |        4 subjects x 6 tests            = 24 baseline flags                 |
 |                                                                            |
 |    A subject appearing in DM but not in LB is normal and correct - the     |
 |    same thing happened in AE, where two subjects had no events. Never      |
 |    manufacture rows to "complete" a domain.                                |
 *---------------------------------------------------------------------------*/
proc sql;
    create table pre_dose as
    select usubjid, lbtestcd, max(visitnum) as maxpre
    from lb_work
    where . < lbdy <= 1
      and catx("|", usubjid, lbtestcd) in
          (select catx("|", usubjid, lbtestcd) from lb_work where lbdy > 1)
    group by usubjid, lbtestcd;
quit;

proc sort data = lb_work; by usubjid lbtestcd; run;
proc sort data = pre_dose; by usubjid lbtestcd; run;

data lb;
    merge lb_work (in = a) pre_dose;
    by usubjid lbtestcd;
    if a;
    if . < lbdy <= 1 and visitnum = maxpre then lbblfl = "Y";
    else                                    lbblfl = "";
    drop maxpre;
run;


/*---------------------------------------------------------------------------*
 | 3. LBSEQ                                                                   |
 *---------------------------------------------------------------------------*/
data lb;
    set lb;
    select (lbtestcd);
        when ("HGB")   _ord = 1;
        when ("HCT")   _ord = 2;
        when ("WBC")   _ord = 3;
        when ("PLAT")  _ord = 4;
        when ("ALT")   _ord = 5;
        when ("CREAT") _ord = 6;
        otherwise      _ord = 9;
    end;
run;

proc sort data = lb;
    by usubjid visitnum _ord;
run;

data lb;
    set lb;
    by usubjid;
    retain lbseq;
    if first.usubjid then lbseq = 1;
    else                  lbseq + 1;
    drop _ord;
run;

data lb;
    retain studyid domain usubjid lbseq lbtestcd lbtest lbcat lborres lborresu
           lbornrlo lbornrhi lbstresc lbstresn lbstresu lbstnrlo lbstnrhi
           lbnrind lbblfl visitnum visit lbdtc lbdy;
    set lb;
run;

proc print data = lb (obs = 12) noobs;
    var usubjid lbseq lbtestcd lbtest lbcat lborres lbnrind lbblfl visit lbdy;
    title "SDTM LB - first 12 rows";
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
data sdtm.lb;
    set lb;
run;

%put NOTE: LB saved to &outpath (48 rows);


/*---------------------------------------------------------------------------*
 | 4. CHECK YOUR WORK                                                         |
 *---------------------------------------------------------------------------*/
proc sql;
    title "Check 1 - 48 rows in, 48 rows out (no transpose here), 4 subjects";
    select count(*) as n_rows, count(distinct usubjid) as n_subjects from lb;

    title "Check 2 - every test mapped: no blank LBTESTCD";
    select count(*) as unmapped from lb where lbtestcd = "";

    title "Check 3 - baseline flags: expect 24, all at BASELINE";
    select visit, count(*) as n_flagged from lb where lbblfl = "Y" group by visit;

    title "Check 4 - the CT rename survived";
    select distinct lbtestcd, lbtest from lb where lbtestcd = "WBC";

    title "Check 5 - LBNRIND agrees with the range (expect zero rows)";
    select usubjid, lbtestcd, lbstresn, lbstnrlo, lbstnrhi, lbnrind
    from lb
    where (lbnrind = "NORMAL" and (lbstresn < input(lbstnrlo, best.) or
                                   lbstresn > input(lbstnrhi, best.)))
       or (lbnrind = "LOW"    and  lbstresn >= input(lbstnrlo, best.))
       or (lbnrind = "HIGH"   and  lbstresn <= input(lbstnrhi, best.));

    title "Check 6 - the abnormal results";
    select usubjid, lbtestcd, visit, lborres, lbornrlo, lbornrhi, lbnrind, lbdy
    from lb where lbnrind ne "NORMAL";

    title "Check 7 - every subject PRESENT has 6 tests at each of 2 visits";
    /*  Only 4 of the 8 enrolled subjects have labs. This checks the ones
        that ARE here are complete - it does not demand all 8 appear.      */
    select usubjid, visit, count(*) as n_tests
    from lb group by usubjid, visit having count(*) ne 6;
quit;

proc freq data = lb;
    tables lbcat * lbtestcd / list nocum nopercent;
    title "Check 8 - panel membership";
run;

title;


/*===========================================================================*
 |  YOUR TURN  -  exercises                                                   |
 |  Solutions: ../../answer-keys/09_build_lb_answers.md                      |
 *===========================================================================*/

/* EXERCISE 1 -------------------------------------------------------------- *
 | Find every lab result that is not NORMAL. For each, state the subject,     |
 | the test, the value, the range it broke, and the visit.                    |
 *------------------------------------------------------------------------- */



/* EXERCISE 2 -------------------------------------------------------------- *
 | Look up that subject in sdtm/ae.csv. Is there an adverse event matching    |
 | the abnormal lab? Should you create one? Justify your answer.              |
 *------------------------------------------------------------------------- */



/* EXERCISE 3 -------------------------------------------------------------- *
 | Which raw LBTEST value does NOT equal its SDTM LBTEST? Write both, and     |
 | explain how you would catch this on a study with 200 lab tests instead     |
 | of 6.                                                                      |
 *------------------------------------------------------------------------- */



/* EXERCISE 4 -------------------------------------------------------------- *
 | LB has 24 baseline flags and VS has 40, yet LB has fewer rows per subject  |
 | at baseline than VS does. Explain both numbers.                            |
 *------------------------------------------------------------------------- */



/* EXERCISE 5 (stretch) ---------------------------------------------------- *
 | VS has a SCREENING visit; LB does not. What does that tell you about the   |
 | protocol, and what would LBDY have been for a screening draw?              |
 *------------------------------------------------------------------------- */



/* EXERCISE 6 (stretch) ---------------------------------------------------- *
 | Why does LBSTNRLO/HI exist when it is identical to LBORNRLO/HI in every    |
 | row of this study? Describe a study where they would differ.               |
 *------------------------------------------------------------------------- */



/* EXERCISE 7 (stretch) ---------------------------------------------------- *
 | Compare your LB against ../../data/sdtm/lb.csv with PROC COMPARE.          |
 *------------------------------------------------------------------------- */
