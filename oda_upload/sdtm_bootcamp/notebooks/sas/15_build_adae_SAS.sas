/*===========================================================================*
 |  NOTEBOOK 15 (SAS)  -  BUILD ADAE                                          |
 |  Clinical Programming Bootcamp  -  Module: Occurrence Data                 |
 |---------------------------------------------------------------------------|
 |  GOAL: turn SDTM AE + SUPPAE + ADSL into ADAE - the adverse event analysis |
 |  dataset, and the source of every safety table in the study.               |
 |                                                                            |
 |  ADAE is an OCCURRENCE dataset (OCCDS): ONE ROW PER EVENT. An event either |
 |  happened or it did not. There is no visit structure and no change from    |
 |  baseline - which is exactly what makes it a different shape from ADVS.    |
 |                                                                            |
 |  You will:                                                                 |
 |     1. merge the subject-level variables from ADSL                         |
 |     2. derive the analysis dates, study days and duration                  |
 |     3. derive the analysis severity and causality variables                |
 |     4. bring TRTEMFL across from SUPPAE - and NOT re-derive it             |
 |     5. set the occurrence flags AOCCFL and AOCCPFL                         |
 |     6. check, and compare against the reference                            |
 |                                                                            |
 |  Spec      : ../../data/adam_specification.md      (section 2)             |
 |  Target    : ../../data/adam/adae.csv              (the finished answer)   |
 |  Needs     : Notebook 14 (ADSL) understood first                           |
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
 |                                                                            |
 | We read the REFERENCE ADSL rather than the one you built in Notebook 14,   |
 | for the same reason Notebook 14 read the reference SDTM: a mistake made    |
 | yesterday should not make today unsolvable. In a real study you would read |
 | your own ADSL - and it would be the only ADSL there is.                    |
 *---------------------------------------------------------------------------*/
data ae;
    infile "&datapath/sdtm/ae.csv" dsd firstobs = 2 truncover;
    length studyid $10 domain $2 usubjid $20 aeseq 8 aeterm $60 aedecod $60
           aesev $10 aeser $1 aerel $20 aeout $30
           aestdtc aeendtc $10 aestdy 8 aeendy 8;
    input studyid $ domain $ usubjid $ aeseq aeterm $ aedecod $ aesev $
          aeser $ aerel $ aeout $ aestdtc $ aeendtc $ aestdy aeendy;
run;

/*  SUPPAE is the SUPPLEMENTAL QUALIFIERS dataset built in the SDTM course.
    It is deliberately narrow - QNAM names the variable, QVAL holds the value -
    because a standard domain must never grow a non-standard column.
    IDVARVAL is CHARACTER even though it holds an AESEQ, so it needs
    converting before it can be merged onto a numeric AESEQ.                  */
data suppae;
    infile "&datapath/sdtm/suppae.csv" dsd firstobs = 2 truncover;
    length studyid $10 rdomain $2 usubjid $20 idvar $8 idvarval $8
           qnam $8 qlabel $40 qval $20 qorig $20 qeval $20;
    input studyid $ rdomain $ usubjid $ idvar $ idvarval $ qnam $ qlabel $
          qval $ qorig $ qeval $;
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

    /*  Back to NUMERIC dates. The CSV had to store them as text; ADaM does not. */
    trtsdt = input(c_trtsdt, yymmdd10.);
    trtedt = input(c_trtedt, yymmdd10.);
    format trtsdt trtedt date9.;
    keep usubjid subjid siteid trt01a trt01an age agegr1 agegr1n
         sex race saffl trtsdt trtedt;
run;


/*---------------------------------------------------------------------------*
 | 1. MERGE ADSL ONTO THE EVENTS                                              |
 |                                                                            |
 | Every subject-level variable is COPIED from ADSL. None is re-derived here. |
 | If you ever find yourself computing SAFFL inside ADAE, stop: the study now  |
 | has two answers to "who was dosed" and no way to tell which is right.      |
 |                                                                            |
 | TRTA (actual treatment) is what safety tables group on, because a safety   |
 | table reports what a body received, not what a randomisation list planned.  |
 *---------------------------------------------------------------------------*/
proc sort data = ae;       by usubjid; run;
proc sort data = ref_adsl; by usubjid; run;

data adae_1;
    merge ae (in = a) ref_adsl (in = b);
    by usubjid;
    if a;                  /* AE defines the rows. ADSL only decorates them.  */

    length trta $20;
    trta  = trt01a;
    trtan = trt01an;

    /*  A subject with an event but no ADSL row is a data integrity failure,
        not something to absorb quietly.                                      */
    if not b then put "ERROR: " usubjid= "has an AE but no ADSL record";
run;


/*---------------------------------------------------------------------------*
 | 2. ANALYSIS DATES, STUDY DAYS, DURATION                                    |
 |                                                                            |
 | Same no-Day-0 rule as SDTM --DY, but anchored on ADSL.TRTSDT rather than    |
 | DM.RFSTDTC. In this study they are the same date; in a study with a         |
 | treatment period that starts later than the reference start date, they     |
 | are not - and ADaM always uses TRTSDT.                                     |
 *---------------------------------------------------------------------------*/
data adae_2;
    set adae_1;

    astdt = input(aestdtc, yymmdd10.);

    /*  An ONGOING event has no end date. Guard the conversion so a blank
        string does not quietly become a missing date you then subtract.      */
    if not missing(aeendtc) then aendt = input(aeendtc, yymmdd10.);

    if astdt > . then do;
        if astdt >= trtsdt then astdy = astdt - trtsdt + 1;
        else                    astdy = astdt - trtsdt;
    end;
    if aendt > . then do;
        if aendt >= trtsdt then aendy = aendt - trtsdt + 1;
        else                    aendy = aendt - trtsdt;
    end;

    /*  Duration is MISSING for an ongoing event - not 0. A 0 would enter a
        mean-duration summary and pull it toward zero, understating how long
        events actually last.                                                 */
    if astdt > . and aendt > . then adurn = aendt - astdt + 1;

    format astdt aendt date9.;
run;


/*---------------------------------------------------------------------------*
 | 3. ANALYSIS SEVERITY AND CAUSALITY                                         |
 |                                                                            |
 | AESEV and AEREL are kept exactly as collected. ASEVN and AREL are the       |
 | ANALYSIS versions, and they exist because tables need them:                |
 |   - ASEVN gives severity a sort order, so "Severe" prints below "Mild"      |
 |     rather than alphabetically above it.                                    |
 |   - AREL collapses four collected causality values into the yes/no that     |
 |     a "treatment-related adverse events" table actually reports.            |
 |                                                                            |
 | Collapsing is a decision, not a fact. The SAP must state which collected    |
 | values count as related. Here: RELATED and POSSIBLY RELATED are 'Y';        |
 | UNLIKELY RELATED and NOT RELATED are 'N'.                                   |
 *---------------------------------------------------------------------------*/
data adae_3;
    set adae_2;
    length arel $1;

    if      aesev = 'MILD'     then asevn = 1;
    else if aesev = 'MODERATE' then asevn = 2;
    else if aesev = 'SEVERE'   then asevn = 3;

    if aerel in ('RELATED', 'POSSIBLY RELATED') then arel = 'Y';
    else                                             arel = 'N';
run;


/*---------------------------------------------------------------------------*
 | 4. TREATMENT-EMERGENT - BRING IT ACROSS, DO NOT RE-DERIVE IT               |
 |                                                                            |
 | The flag already exists. The SDTM course derived it as SUPPAE.AETRTEM,      |
 | and ADaM READS it. One derivation, one home.                                |
 |                                                                            |
 | Why this matters: if ADaM recomputes the rule and someone later refines     |
 | the SDTM definition - say, to handle a partial start date - the two drift   |
 | apart. Nothing errors. The SDTM package and the analysis package simply     |
 | disagree about which events were treatment-emergent, and a reviewer finds   |
 | it before you do.                                                           |
 *---------------------------------------------------------------------------*/
data trtem;
    set suppae;
    where qnam = 'AETRTEM';
    length trtemfl $1;
    aeseq   = input(idvarval, best8.);   /* CHARACTER -> NUMERIC to merge on   */
    trtemfl = qval;
    keep usubjid aeseq trtemfl;
run;

proc sort data = adae_3; by usubjid aeseq; run;
proc sort data = trtem;  by usubjid aeseq; run;

data adae_4;
    merge adae_3 (in = a) trtem;
    by usubjid aeseq;
    if a;

    /*  Every event must get a flag. A missing TRTEMFL means SUPPAE and AE
        disagree about which events exist - loud failure, not a blank cell.    */
    if missing(trtemfl) then
        put "ERROR: " usubjid= aeseq= "has no AETRTEM record in SUPPAE";
run;

/*  INDEPENDENT CHECK. We trust SUPPAE, but we verify it: a treatment-emergent
    event starts on or after first dose. This should print ZERO rows. If it
    ever prints one, SUPPAE and the dates disagree and you must find out why
    before going any further.                                                 */
title 'TRTEMFL cross-check against the dates - MUST be empty';
proc print data = adae_4 noobs;
    where (astdt >= trtsdt and trtemfl ne 'Y')
       or (astdt <  trtsdt and trtemfl  = 'Y');
    var usubjid aeseq aestdtc astdy trtemfl;
run;
title;


/*---------------------------------------------------------------------------*
 | 5. OCCURRENCE FLAGS                                                        |
 |                                                                            |
 | AOCCFL exists so that COUNTING FLAGGED ROWS COUNTS SUBJECTS. The first     |
 | line of every AE table is "subjects with at least one event" - and a       |
 | subject with three events must contribute 1 to that number, not 3.         |
 |                                                                            |
 | So the flag marks exactly ONE row per subject. AOCCPFL does the same per   |
 | subject per preferred term, for the by-term rows of the same table.        |
 |                                                                            |
 | Both are restricted to treatment-emergent events, and both order by start  |
 | date then AESEQ so that WHICH row gets flagged is deterministic. A flag    |
 | that depends on dataset order is not reproducible, and a result a reviewer |
 | cannot reproduce is a finding.                                             |
 *---------------------------------------------------------------------------*/
data teae;
    set adae_4;
    where trtemfl = 'Y';
run;

/*  First treatment-emergent event per SUBJECT.                               */
proc sort data = teae out = t_subj; by usubjid astdt aeseq; run;
data occ_subj;
    set t_subj;
    by usubjid;
    if first.usubjid;
    length aoccfl $1;
    aoccfl = 'Y';
    keep usubjid aeseq aoccfl;
run;

/*  First treatment-emergent event per SUBJECT and PREFERRED TERM.            */
proc sort data = teae out = t_pt; by usubjid aedecod astdt aeseq; run;
data occ_pt;
    set t_pt;
    by usubjid aedecod;
    if first.aedecod;
    length aoccpfl $1;
    aoccpfl = 'Y';
    keep usubjid aeseq aoccpfl;
run;

proc sort data = occ_subj; by usubjid aeseq; run;
proc sort data = occ_pt;   by usubjid aeseq; run;

data adae;
    merge adae_4 (in = a) occ_subj occ_pt;
    by usubjid aeseq;
    if a;

    label
        usubjid = 'Unique Subject Identifier'
        trta    = 'Actual Treatment'
        trtan   = 'Actual Treatment (N)'
        astdt   = 'Analysis Start Date'
        aendt   = 'Analysis End Date'
        astdy   = 'Analysis Start Relative Day'
        aendy   = 'Analysis End Relative Day'
        adurn   = 'Analysis Duration (Days)'
        asevn   = 'Analysis Severity (N)'
        arel    = 'Analysis Causality'
        trtemfl = 'Treatment Emergent Analysis Flag'
        aoccfl  = 'First Occurrence of Any AE Flag'
        aoccpfl = 'First Occurrence of Preferred Term Flag';

    keep studyid usubjid subjid siteid trta trtan
         age agegr1 agegr1n sex race saffl trtsdt trtedt
         aeseq aeterm aedecod aesev asevn aeser aerel arel aeout
         astdt aendt astdy aendy adurn trtemfl aoccfl aoccpfl;
run;

proc sort data = adae; by usubjid astdt aeseq; run;


/*---------------------------------------------------------------------------*
 | 6. CHECK YOUR WORK                                                         |
 *---------------------------------------------------------------------------*/
title 'ADAE - the events';
proc print data = adae noobs;
    var usubjid aeseq aedecod astdy adurn aesev arel trtemfl aoccfl aoccpfl;
run;
title;

/*  THE ROW THAT MATTERS. Subject 01-002's first event starts on study day -5,
    five days BEFORE first dose. It is a real event and it stays in the
    dataset - but it is not treatment-emergent, so it appears in NO safety
    table and carries NO occurrence flag.                                     */
title 'The pre-dose event - real, retained, and not treatment-emergent';
proc print data = adae noobs;
    where trtemfl = 'N';
    var usubjid aeseq aedecod aestdtc astdy trtemfl aoccfl aoccpfl;
run;
title;

/*  The counting test: flagged rows must equal subjects with a TEAE.          */
proc sql;
    title 'Occurrence flag arithmetic - the two numbers MUST match';
    select (select count(*) from adae where aoccfl = 'Y')          as flagged_rows,
           (select count(distinct usubjid) from adae
            where trtemfl = 'Y')                                   as subjects_with_teae;
    title;
quit;

title 'Treatment-emergent AEs by treatment and severity';
proc freq data = adae;
    where trtemfl = 'Y';
    tables trta * aesev / nocol norow nopercent;
run;
title;


/*---------------------------------------------------------------------------*
 | 7. COMPARE AGAINST THE REFERENCE                                           |
 *---------------------------------------------------------------------------*/
data ref_adae;
    infile "&datapath/adam/adae.csv" dsd firstobs = 2 truncover;
    length studyid $10 usubjid $20 subjid $5 siteid $3 trta $20 trtan 8
           age 8 agegr1 $5 agegr1n 8 sex $1 race $40 saffl $1
           trtsdt trtedt $10 aeseq 8 aeterm $60 aedecod $60
           aesev $10 asevn 8 aeser $1 aerel $20 arel $1 aeout $30
           astdt aendt $10 astdy 8 aendy 8 adurn 8
           trtemfl aoccfl aoccpfl $1;
    input studyid $ usubjid $ subjid $ siteid $ trta $ trtan age agegr1 $
          agegr1n sex $ race $ saffl $ trtsdt $ trtedt $ aeseq aeterm $
          aedecod $ aesev $ asevn aeser $ aerel $ arel $ aeout $
          astdt $ aendt $ astdy aendy adurn trtemfl $ aoccfl $ aoccpfl $;
run;

data mine_adae;
    set adae;
    length c_trtsdt c_trtedt c_astdt c_aendt $10;
    c_trtsdt = put(trtsdt, yymmdd10.);
    c_trtedt = put(trtedt, yymmdd10.);
    /*  An ongoing event has no end date, and PUT() on a missing date yields
        the string "." - which would not match the reference's empty cell.    */
    if astdt > . then c_astdt = put(astdt, yymmdd10.);
    if aendt > . then c_aendt = put(aendt, yymmdd10.);
    drop trtsdt trtedt astdt aendt;
    rename c_trtsdt = trtsdt  c_trtedt = trtedt
           c_astdt  = astdt   c_aendt  = aendt;
run;

proc sort data = mine_adae; by usubjid aeseq; run;
proc sort data = ref_adae;  by usubjid aeseq; run;

title 'PROC COMPARE - your ADAE vs the reference';
proc compare base = ref_adae compare = mine_adae listall;
    id usubjid aeseq;
run;
title;

data adam.adae;
    set adae;
run;


/*===========================================================================*
 |  YOUR TURN  -  exercises                                                   |
 |  Solutions: ../../answer-keys/15_build_adae_answers.md                     |
 *===========================================================================*/

/* EXERCISE 1 -------------------------------------------------------------- *
 | Build the first line of a real safety table two ways:                      |
 |    (a) count DISTINCT USUBJID where TRTEMFL = 'Y', by treatment            |
 |    (b) count ROWS where AOCCFL = 'Y', by treatment                         |
 | They must agree. Now do it a third way - count all rows where              |
 | TRTEMFL = 'Y' - and explain which subjects make that number different,     |
 | and why a table built on it would be wrong.                                |
 *------------------------------------------------------------------------- */



/* EXERCISE 2 -------------------------------------------------------------- *
 | Delete the pre-dose event (USUBJID = 'ABC-01-01-002', AESEQ = 1) from AE   |
 | entirely, instead of flagging it TRTEMFL = 'N'. Rebuild ADAE. Which        |
 | numbers in your safety summary change, and which do not? Which approach    |
 | could you defend to a regulator, and what does the other one destroy?      |
 *------------------------------------------------------------------------- */



/* EXERCISE 3 -------------------------------------------------------------- *
 | Two subjects have an ongoing event, so ADURN is missing for them.          |
 | Compute the mean duration of treatment-emergent events two ways: once      |
 | letting SAS drop the missing values, and once after setting ADURN = 0 for  |
 | ongoing events. How far apart are the two answers? Which is honest, and    |
 | what would you have to write in the SAP footnote to use either?            |
 *------------------------------------------------------------------------- */



/* EXERCISE 4 -------------------------------------------------------------- *
 | AREL collapses four collected values into two. Re-derive it treating only  |
 | 'RELATED' as related, leaving 'POSSIBLY RELATED' as 'N'. How many events   |
 | move? Express the change as a percentage of treatment-emergent events.     |
 | Who decides which definition the study uses, and where is it written down? |
 *------------------------------------------------------------------------- */



/* EXERCISE 5 (stretch) ---------------------------------------------------- *
 | AOCCFL currently orders by ASTDT then AESEQ. Suppose two of a subject's    |
 | events share a start date. Show that removing AESEQ from the sort makes    |
 | the flagged row depend on input order - run it twice against differently   |
 | sorted input and compare. Why is a reproducible tie-break a regulatory     |
 | concern and not just tidiness?                                             |
 *------------------------------------------------------------------------- */
