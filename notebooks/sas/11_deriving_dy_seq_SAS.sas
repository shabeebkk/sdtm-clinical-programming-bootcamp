/*===========================================================================*
 |  NOTEBOOK 11 (SAS)  -  DERIVING --DY AND --SEQ                             |
 |  Clinical Programming Bootcamp  -  Module: Derivations                     |
 |---------------------------------------------------------------------------|
 |  You have derived --DY and --SEQ in six domains. This notebook turns six   |
 |  separate habits into TWO REUSABLE MACROS, then breaks them on purpose so  |
 |  you can see the failure modes.                                            |
 |                                                                            |
 |     1. write %study_day  and prove it against all 226 --DY values          |
 |     2. write %derive_seq and prove it against every domain                 |
 |     3. BREAK the sort and watch --SEQ move                                 |
 |     4. BREAK the +1 and watch Day 0 appear                                 |
 |                                                                            |
 |  PREREQUISITE: the SDTM library must hold the built domains. Run           |
 |  00_setup.sas then run_all.sas, or notebooks 04-09, in this session.       |
 |                                                                            |
 |  Deck        : 09_derivations.pptx                                         |
 |  Spec        : ../../data/mapping_specification.md   (sections 1.3, 1.4)   |
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

    %if %sysfunc(fileexist(&outpath)) = 0 %then %do;
        %local nm pa rc;
        %let nm = %scan(&outpath, -1, %str(/));
        %let pa = %substr(&outpath, 1, %eval(%length(&outpath) - %length(&nm) - 1));
        %let rc = %sysfunc(dcreate(&nm, &pa));
    %end;
    %if %sysfunc(libref(sdtm)) ne 0 %then %do;
        libname sdtm "&outpath";
    %end;

    %put NOTE: datapath = &datapath;
    %put NOTE: outpath  = &outpath   (libref SDTM);
%mend;
%_setpath;

%macro _need_domains;
    %if %sysfunc(exist(sdtm.ae)) = 0 %then %do;
        %put ERROR: SDTM.AE not found. Run 00_setup.sas then run_all.sas first;
        %put ERROR- (or notebooks 04-09) so the domains exist in the library.;
        %abort cancel;
    %end;
%mend;
%_need_domains;


/*---------------------------------------------------------------------------*
 | 1. THE STUDY-DAY MACRO                                                     |
 |                                                                            |
 |  One formula, two branches, no Day 0. Written once, used everywhere.       |
 |                                                                            |
 |  Both arguments are SAS DATE NUMBERS, not character --DTC strings. Doing   |
 |  the conversion outside the macro keeps it honest: the macro does date     |
 |  arithmetic and nothing else.                                              |
 *---------------------------------------------------------------------------*/
%macro study_day(dtc, ref, out);
    /*  dtc = the event date        (SAS date)
        ref = RFSTDTC for that subject (SAS date)
        out = the --DY variable to create                                   */
    if missing(&dtc) or missing(&ref) then &out = .;
    else if &dtc >= &ref then &out = &dtc - &ref + 1;   /* on/after: +1     */
    else                      &out = &dtc - &ref;       /* before: no +1    */
%mend;


/*---------------------------------------------------------------------------*
 | 2. PROVE IT - re-derive every --DY in the study and compare                |
 |                                                                            |
 |  The real test of a derivation macro is that it reproduces what is         |
 |  already there. We rebuild --DY for all six domains from RFSTDTC and       |
 |  the --DTC values, then diff against the stored values.                    |
 *---------------------------------------------------------------------------*/
proc sql;
    create table ref_dates as
    select usubjid, input(rfstdtc, yymmdd10.) as ref_n
    from sdtm.dm;
quit;

%macro recheck_dy(dom, dtcvar, dyvar);
    proc sql;
        create table _chk as
        select a.usubjid, a.&dtcvar, a.&dyvar, b.ref_n
        from sdtm.&dom as a left join ref_dates as b
          on a.usubjid = b.usubjid;
    quit;

    data _chk;
        set _chk;
        _dtc_n = input(&dtcvar, yymmdd10.);
        %study_day(_dtc_n, ref_n, _recomputed)
        _mismatch = (&dyvar ne _recomputed);
    run;

    proc sql noprint;
        select sum(_mismatch), count(*) into :bad trimmed, :tot trimmed from _chk;
    quit;

    data _one;
        length domain $8 variable $10 verdict $8 detail $60;
        domain = "&dom"; variable = "&dyvar";
        %if &bad = 0 %then %do;
            verdict = "MATCH"; detail = "&tot values re-derived identically";
        %end;
        %else %do;
            verdict = "FAIL";  detail = "&bad of &tot values differ";
        %end;
    run;
    proc append base = dy_report data = _one force; run;
%mend;

data dy_report;
    length domain $8 variable $10 verdict $8 detail $60;
    stop;
run;

%recheck_dy(ae, aestdtc, aestdy)
%recheck_dy(cm, cmstdtc, cmstdy)
%recheck_dy(ex, exstdtc, exstdy)
%recheck_dy(vs, vsdtc,   vsdy)
%recheck_dy(lb, lbdtc,   lbdy)
%recheck_dy(ds, dsstdtc, dsstdy)

title "Every --DY in the study, re-derived from one macro";
proc print data = dy_report noobs label;
    label domain = "Domain" variable = "Variable" verdict = "Result" detail = "Detail";
run;


/*---------------------------------------------------------------------------*
 | 3. THE TWO PROPERTIES THAT MUST HOLD EVERYWHERE                            |
 *---------------------------------------------------------------------------*/
%macro dy_properties;
    proc sql;
        title "Property 1 - NO --DY anywhere equals zero (expect 0 rows)";
        select "AE" as domain length = 4, count(*) as day_zero from sdtm.ae where aestdy = 0
        union all select "CM", count(*) from sdtm.cm where cmstdy = 0
        union all select "EX", count(*) from sdtm.ex where exstdy = 0
        union all select "VS", count(*) from sdtm.vs where vsdy   = 0
        union all select "LB", count(*) from sdtm.lb where lbdy   = 0
        union all select "DS", count(*) from sdtm.ds where dsstdy = 0;

        /*  ". < x < 0", not "x < 0". A missing --DY is SMALLER than every
            number in SAS, so a bare "x < 0" counts nulls as negative days.
            ABC-01 has no missing --DY so both forms agree here - but the
            CAPSTONE deliberately has one (the partial AE date leaves AESTDY
            null), and there the bare form reports 1 negative day when the
            true answer is 0. A QC check that miscounts is worse than none. */
        title "Property 2 - the spread of --DY, and where negatives live";
        select "AE" as domain length = 4, min(aestdy) as min_dy, max(aestdy) as max_dy,
               sum(. < aestdy < 0) as negative from sdtm.ae
        union all select "CM", min(cmstdy), max(cmstdy), sum(. < cmstdy < 0) from sdtm.cm
        union all select "EX", min(exstdy), max(exstdy), sum(. < exstdy < 0) from sdtm.ex
        union all select "VS", min(vsdy),   max(vsdy),   sum(. < vsdy   < 0) from sdtm.vs
        union all select "LB", min(lbdy),   max(lbdy),   sum(. < lbdy   < 0) from sdtm.lb
        union all select "DS", min(dsstdy), max(dsstdy), sum(. < dsstdy < 0) from sdtm.ds;
    quit;
%mend;
%dy_properties;


/*---------------------------------------------------------------------------*
 | 4. THE --SEQ MACRO                                                         |
 |                                                                            |
 |  The SORT is the derivation. The counter is trivial; choosing a            |
 |  deterministic order is the part that takes judgement.                     |
 *---------------------------------------------------------------------------*/
%macro derive_seq(indata, outdata, seqvar, sortby);
    /*  sortby = the WITHIN-SUBJECT ordering, INCLUDING a tiebreaker.
        Without a tiebreaker, records that tie can come out in either order
        and &seqvar changes between runs.                                   */
    proc sort data = &indata out = _sorted;
        by usubjid &sortby;
    run;

    data &outdata;
        set _sorted;
        by usubjid;
        retain &seqvar;
        if first.usubjid then &seqvar = 1;
        else                  &seqvar + 1;
    run;
%mend;

/*  Re-derive AESEQ and check it reproduces what is stored. */
%derive_seq(sdtm.ae, ae_reseq, aeseq_new, aestdtc aeterm)

proc sql;
    title "AESEQ re-derived - expect zero rows";
    select usubjid, aeterm, aeseq, aeseq_new
    from ae_reseq where aeseq ne aeseq_new;
quit;


/*---------------------------------------------------------------------------*
 | 5. BREAK IT ON PURPOSE  (the point of the notebook)                        |
 |                                                                            |
 |  Sort WITHOUT the tiebreaker. Subject ABC-01-02-001 has two events; if     |
 |  they shared a date, the order would be undefined. Here we sort by a       |
 |  deliberately weak key to show the sequence numbers move.                  |
 *---------------------------------------------------------------------------*/
%derive_seq(sdtm.ae, ae_badseq, aeseq_bad, aesev)   /* severity is NOT unique */

proc sql;
    title "Sorting by a non-unique key - AESEQ no longer matches";
    select usubjid, aeterm, aestdtc, aeseq   label = "correct",
                                     aeseq_bad label = "from a weak sort"
    from ae_badseq
    where aeseq ne aeseq_bad
    order by usubjid, aeterm;
quit;

title;


/*---------------------------------------------------------------------------*
 | 6. SAVE THE MACROS FOR REUSE                                               |
 |                                                                            |
 |  In a real study these live in a macro library that every program calls,   |
 |  so the derivation is defined ONCE. If the definition of study day ever    |
 |  changed, you would change one file - not six notebooks.                   |
 *---------------------------------------------------------------------------*/
%put NOTE: %nrstr(%study_day) and %nrstr(%derive_seq) are defined for this session.;
%put NOTE: In production they belong in an autocall library or a %nrstr(%INCLUDE) file.;


/*===========================================================================*
 |  YOUR TURN  -  exercises                                                   |
 |  Solutions: ../../answer-keys/11_deriving_dy_seq_answers.md               |
 *===========================================================================*/

/* EXERCISE 1 -------------------------------------------------------------- *
 | Remove the "+ 1" from the first branch of %study_day and re-run section 2. |
 | Which domains now report FAIL, and what value appears that the spec says   |
 | can never exist? Put it back afterwards.                                   |
 *------------------------------------------------------------------------- */



/* EXERCISE 2 -------------------------------------------------------------- *
 | Section 3 Property 2 prints the --DY range per domain. Explain, for each   |
 | of the six domains, WHY it does or does not contain negative values.       |
 | Which two would you QUERY if a negative appeared?                          |
 *------------------------------------------------------------------------- */



/* EXERCISE 3 -------------------------------------------------------------- *
 | Section 5 sorts by AESEV, which is not unique. Exactly how many records    |
 | get a different AESEQ, and which subject do they belong to? Explain why a  |
 | QC programmer re-running your code and getting different --SEQ values is    |
 | worse than getting an error.                                               |
 *------------------------------------------------------------------------- */



/* EXERCISE 4 -------------------------------------------------------------- *
 | SUPPAE points at AE records using IDVAR = "AESEQ" and IDVARVAL - so if     |
 | AESEQ moves, every SUPPAE row silently points somewhere else.             |
 |                                                                            |
 | (a) Section 5 swaps AESEQ 1 and 2 for ABC-01-01-001. Look up that          |
 |     subject's two AETRTEM values in SUPPAE. Would the swap be VISIBLE in   |
 |     the data? Why is that answer alarming rather than reassuring?          |
 |                                                                            |
 | (b) Now do the same for ABC-01-01-002, whose two flags differ (N and Y).   |
 |     What would a swap do to the treatment-emergent classification of that  |
 |     subject's screening event?                                             |
 *------------------------------------------------------------------------- */



/* EXERCISE 5 (stretch) ---------------------------------------------------- *
 | %study_day takes SAS date numbers. Rewrite it to accept the CHARACTER      |
 | --DTC strings directly. Then explain why the original design - conversion  |
 | OUTSIDE the macro - is the better one.                                     |
 *------------------------------------------------------------------------- */



/* EXERCISE 6 (stretch) ---------------------------------------------------- *
 | A partial date "2024-03" (no day) cannot produce a study day. Our study    |
 | has none, but real ones do. What should --DY be, and what must you NOT do? |
 *------------------------------------------------------------------------- */
