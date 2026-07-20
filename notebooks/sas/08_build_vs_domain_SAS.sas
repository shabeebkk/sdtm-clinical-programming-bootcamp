/*===========================================================================*
 |  NOTEBOOK 08 (SAS)  -  BUILD THE VS DOMAIN                                 |
 |  Clinical Programming Bootcamp  -  Module: Findings                        |
 |---------------------------------------------------------------------------|
 |  GOAL: turn vs_raw.csv into a compliant SDTM VS dataset.                   |
 |                                                                            |
 |  This is the biggest STRUCTURAL change in the whole bootcamp.              |
 |  Everything so far has been one raw row -> one SDTM row. Not here.         |
 |                                                                            |
 |      RAW   is WIDE:  1 row per VISIT,  6 measurement COLUMNS               |
 |      SDTM  is TALL:  1 row per SUBJECT x VISIT x TEST                      |
 |                                                                            |
 |      24 raw rows  ------ transpose ------>  128 SDTM rows                  |
 |                                                                            |
 |  Work out that 128 before you run anything:                                |
 |      8 subjects x 3 visits x 5 repeated tests    = 120                     |
 |    + 8 subjects x 1 HEIGHT (screening only)      =   8                     |
 |                                                    -----                   |
 |                                                     128                    |
 |  If your answer isn't 128, the checks at the bottom will tell you which    |
 |  of the two classic mistakes you made.                                     |
 |                                                                            |
 |  Spec       : ../../data/mapping_specification.md   (section 6)            |
 |  Target     : ../../data/sdtm/vs.csv                                       |
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
 |    Note the shape: SYSBP, DIABP, PULSE, TEMP, HEIGHT and WEIGHT are six    |
 |    separate COLUMNS. In SDTM they will become six values of VSTESTCD.      |
 *---------------------------------------------------------------------------*/
data vs_raw;
    infile "&datapath/vs_raw.csv" dsd firstobs = 2 truncover;
    /*  READ THE MEASUREMENTS AS CHARACTER, NOT NUMERIC.
        VSORRES is a CHARACTER variable holding the result EXACTLY as
        collected, and reading through a numeric loses the collected
        precision: a weight recorded as "82.0" becomes 82, which prints as
        "82" and silently drops a significant figure. "82.0 kg" asserts
        precision to a tenth of a kilogram; "82 kg" does not.
        The numeric version is derived later, into VSSTRESN, where it
        belongs.                                                          */
    length studyid $10 siteid $3 subjid $5 visit $20 vsdt $11
           sysbp $10 diabp $10 pulse $10 temp $10 height $10 weight $10 vsnd $1;
    input studyid $ siteid $ subjid $ visit $ vsdt $
          sysbp $ diabp $ pulse $ temp $ height $ weight $ vsnd $;
run;

/* Reference start date (first dose) - same source as every other domain. */
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
 | 1. THE TRANSPOSE                                                           |
 |                                                                            |
 |    Three moving parts, and they must agree:                                |
 |      - an array of the six VALUE columns                                   |
 |      - parallel arrays of TEST CODES, TEST NAMES and UNITS                 |
 |      - OUTPUT *inside* the loop                                            |
 |                                                                            |
 |    The arrays are matched BY POSITION. If you reorder one you must         |
 |    reorder all of them, or every pulse gets labelled a temperature.        |
 *---------------------------------------------------------------------------*/
proc sort data = vs_raw;    by siteid subjid; run;
proc sort data = ref_dates; by siteid subjid; run;

data vs_tall;
    merge vs_raw (in = a) ref_dates;
    by siteid subjid;
    if a;

    length usubjid $20 domain $2 vstestcd $8 vstest $40 vsorres $20
           vsorresu $12 vsstresc $20 vsstresu $12 vsblfl $1;
    domain = "VS";
    usubjid = catx("-", studyid, siteid, subjid);

    /* --- dates and study day --- */
    _dt = input(vsdt, date11.);
    if not missing(_dt) then vsdtc = put(_dt, yymmdd10.);
    if not missing(_dt) and not missing(rfstdtc_n) then do;
        if _dt >= rfstdtc_n then vsdy = _dt - rfstdtc_n + 1;
        else                     vsdy = _dt - rfstdtc_n;
    end;

    /* --- VISITNUM: a protocol lookup, NOT derivable from the data --- */
    select (strip(visit));
        when ("SCREENING") visitnum = 1;
        when ("BASELINE")  visitnum = 2;
        when ("WEEK 4")    visitnum = 4;   /* 3 is unused - do NOT renumber */
        otherwise          visitnum = .;
    end;

    /* --- the four parallel arrays --- */
    array vals {6} $10 sysbp diabp pulse temp height weight;   /* CHARACTER */
    array cds  {6} $8  ("SYSBP" "DIABP" "PULSE" "TEMP" "HEIGHT" "WEIGHT");
    array nms  {6} $40 ("Systolic Blood Pressure" "Diastolic Blood Pressure"
                        "Pulse Rate" "Temperature" "Height" "Weight");
    array uns  {6} $12 ("mmHg" "mmHg" "beats/min" "C" "cm" "kg");

    do i = 1 to 6;
        /*  NO RESULT -> NO ROW. This is what stops HEIGHT, which is only
            collected at SCREENING, from producing empty rows at the other
            two visits. Tall structure simply omits what wasn't measured.  */
        if not missing(vals{i}) then do;
            vstestcd = cds{i};
            vstest   = nms{i};
            vsorresu = uns{i};

            /*  --ORRES is CHARACTER: the result EXACTLY as collected.
                Straight copy of the raw text - no PUT, no format. A weight
                of "82.0" stays "82.0". Round-tripping it through a numeric
                would give "82" and destroy a significant figure.         */
            vsorres  = strip(vals{i});

            /*  Standardised result. In ABC-01 the sites already collect in
                standard units, so STRESC = ORRES. In a study with mixed
                units this is where you would convert.                    */
            vsstresc = vsorres;

            /*  --STRESN is the NUMERIC version, for analysis. This is the
                one place the value legitimately becomes a number: 82.0 and
                82 are the same number, and no trailing zero survives - a
                numeric variable simply has no such concept.
                ?? suppresses a log note if a result is not numeric.      */
            vsstresn = input(vals{i}, ?? best.);
            vsstresu = vsorresu;

            output;          /* <-- INSIDE the loop. One row per test.    */
        end;
    end;

    format vsdtc $10.;
    keep studyid domain usubjid vstestcd vstest vsorres vsorresu
         vsstresc vsstresn vsstresu vsblfl visitnum visit vsdtc vsdy;
run;


/*---------------------------------------------------------------------------*
 | 2. THE BASELINE FLAG                                                       |
 |                                                                            |
 |    VSBLFL = "Y" on the LAST record before first dose - per subject,        |
 |    PER TEST. Not the first record, and not every pre-dose record.          |
 |                                                                            |
 |    *** READ THE COMPARISON BELOW CAREFULLY: it is VSDY <= 1, NOT < 1. ***  |
 |                                                                            |
 |    The BASELINE visit happens ON the first dosing day, so its VSDY is 1 -  |
 |    but the vitals are taken BEFORE the dose is given that morning. So a    |
 |    Day 1 assessment IS pre-dose. Writing "vsdy < 1" looks right, excludes  |
 |    BASELINE entirely, and silently flags SCREENING instead. It is the      |
 |    single easiest way to get this domain wrong.                            |
 |                                                                            |
 |    Note what we are relying on: the raw data records a DATE but no TIME,   |
 |    so nothing in the data proves the measurement preceded the dose. We     |
 |    know it from the PROTOCOL, which schedules Day 1 vitals pre-dose. When  |
 |    a study collects times, use them instead of trusting the schedule.      |
 |                                                                            |
 |    We express the rule as "latest pre-dose visit" rather than testing      |
 |    VISIT = "BASELINE" so the code still works when a subject has an        |
 |    unscheduled pre-dose visit - which real studies do.                     |
 *---------------------------------------------------------------------------*/
/*  Step 2a: for each subject and test, find the LATEST pre-dose visit -
    but ONLY for tests that actually have a post-dose value to compare
    against. A baseline exists to be the anchor of a change-from-baseline
    analysis; a test measured once and never repeated has nothing to
    anchor, so it gets no flag.

    In ABC-01 that rule excludes exactly one test: HEIGHT, collected only
    at SCREENING. Result: 40 flags (8 subjects x 5 repeated tests), not 48.

    !! SPONSOR-DEPENDENT !! Some sponsors do flag a single measurement as
    its own baseline, which would give 48. SDTMIG defines --BLFL as the
    baseline value indicator but does not settle this case, so the study
    SPEC decides. Ours specifies the no-post-dose-value-no-flag rule and
    this code implements it. Do not carry this choice to another study
    without checking its spec.                                            */
proc sql;
    create table pre_dose as
    select usubjid, vstestcd, max(visitnum) as maxpre
    from vs_tall
    where vsdy <= 1              /* <= 1, not < 1: Day 1 vitals are pre-dose */
      and catx("|", usubjid, vstestcd) in
          (select catx("|", usubjid, vstestcd) from vs_tall where vsdy > 1)
    group by usubjid, vstestcd;
quit;

/*  Step 2b: flag the record sitting at that visit.                        */
proc sort data = vs_tall;  by usubjid vstestcd; run;
proc sort data = pre_dose; by usubjid vstestcd; run;

data vs;
    merge vs_tall (in = a) pre_dose;
    by usubjid vstestcd;
    if a;

    if vsdy <= 1 and visitnum = maxpre then vsblfl = "Y";
    else                                    vsblfl = "";
    /*  Note the blank, not "N". VSBLFL is a Y-or-null flag; an "N" is a
        conformance finding. The same is true of every SDTM --BLFL.       */

    drop maxpre;
run;


/*---------------------------------------------------------------------------*
 | 3. VSSEQ  -  numbered per subject across ALL tests and visits              |
 |    Sort by visit then by the test's collection order so the sequence is    |
 |    reproducible. We use the array order, not alphabetical order.           |
 *---------------------------------------------------------------------------*/
data vs;
    set vs;
    select (vstestcd);
        when ("SYSBP")  _ord = 1;
        when ("DIABP")  _ord = 2;
        when ("PULSE")  _ord = 3;
        when ("TEMP")   _ord = 4;
        when ("HEIGHT") _ord = 5;
        when ("WEIGHT") _ord = 6;
        otherwise       _ord = 9;
    end;
run;

proc sort data = vs;
    by usubjid visitnum _ord;
run;

data vs;
    set vs;
    by usubjid;
    retain vsseq;
    if first.usubjid then vsseq = 1;
    else                  vsseq + 1;
    drop _ord;
run;

data vs;
    retain studyid domain usubjid vsseq vstestcd vstest vsorres vsorresu
           vsstresc vsstresn vsstresu vsblfl visitnum visit vsdtc vsdy;
    set vs;
run;

proc print data = vs (obs = 14) noobs;
    var usubjid vsseq vstestcd vsorres vsorresu vsblfl visitnum visit vsdtc vsdy;
    title "SDTM VS - first 14 rows (subject 1, screening + start of baseline)";
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
data sdtm.vs;
    set vs;
run;

%put NOTE: VS saved to &outpath (128 rows);


/*---------------------------------------------------------------------------*
 | 4. CHECK YOUR WORK  -  these catch the two classic transpose bugs          |
 *---------------------------------------------------------------------------*/
proc sql;
    title "Check 1 - MUST be 128 rows";
    /*  24  = OUTPUT was outside the loop (1 row per visit)
        144 = you emitted HEIGHT rows at every visit                        */
    select count(*) as n_rows from vs;

    title "Check 2 - rows per test (HEIGHT must be 8, the rest 24)";
    select vstestcd, count(*) as n from vs group by vstestcd order by n, vstestcd;

    title "Check 3 - USUBJID + VSSEQ unique";
    select count(distinct catx("-", usubjid, put(vsseq, 8.))) as n_keys from vs;

    title "Check 4 - baseline flag: exactly 40 rows, all at BASELINE";
    select visit, count(*) as n_flagged from vs where vsblfl = "Y" group by visit;

    title "Check 5 - at most ONE baseline flag per subject per test";
    select usubjid, vstestcd, count(*) as n
    from vs where vsblfl = "Y" group by usubjid, vstestcd having count(*) > 1;

    title "Check 6 - no VSDY equal to 0";
    select sum(vsdy = 0) as day_zero from vs;

    title "Check 7 - units are consistent within each test";
    select vstestcd, count(distinct vsorresu) as n_units
    from vs group by vstestcd having count(distinct vsorresu) > 1;
quit;

title;


/*===========================================================================*
 |  YOUR TURN  -  exercises                                                   |
 |  Solutions: ../../answer-keys/08_build_vs_answers.md                      |
 *===========================================================================*/

/* EXERCISE 1 -------------------------------------------------------------- *
 | Move the OUTPUT statement to AFTER the "end;" of the do-loop and re-run.   |
 | How many rows do you get, and which test survives on each row? Explain     |
 | why this bug is more dangerous than one that crashes.                      |
 | (Put it back afterwards!)                                                  |
 *------------------------------------------------------------------------- */



/* EXERCISE 2 -------------------------------------------------------------- *
 | HEIGHT has 8 rows, every other test has 24. Explain why - and say what     |
 | the raw data looks like at BASELINE and WEEK 4 for that column.            |
 *------------------------------------------------------------------------- */



/* EXERCISE 3 -------------------------------------------------------------- *
 | Which visits have VSDY < 1? Both SCREENING and BASELINE precede the        |
 | first dose for some subjects - so why does only one of them get VSBLFL?    |
 *------------------------------------------------------------------------- */



/* EXERCISE 4 -------------------------------------------------------------- *
 | VSDY at SCREENING is not the same for every subject. Find its range, and   |
 | explain why it varies when the protocol schedules screening once.          |
 *------------------------------------------------------------------------- */



/* EXERCISE 5 (stretch) ---------------------------------------------------- *
 | The raw file has a VSND column and it never reaches VS. Find out what it   |
 | stands for, and explain the rule that decides whether a collected field    |
 | is submitted. (Hint: you met the same rule in Notebook 07.)                |
 *------------------------------------------------------------------------- */



/* EXERCISE 6 (stretch) ---------------------------------------------------- *
 | Suppose a site reported a weight in POUNDS instead of kilograms. Which of  |
 | VSORRES, VSORRESU, VSSTRESC, VSSTRESN and VSSTRESU would change, and to    |
 | what? Write the values for a 155 lb subject.                               |
 *------------------------------------------------------------------------- */



/* EXERCISE 7 (stretch) ---------------------------------------------------- *
 | Compare your VS against ../../data/sdtm/vs.csv with PROC COMPARE.          |
 *------------------------------------------------------------------------- */
