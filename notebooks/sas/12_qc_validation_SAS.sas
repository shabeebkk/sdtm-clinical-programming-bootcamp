/*===========================================================================*
 |  NOTEBOOK 12 (SAS)  -  QC & VALIDATION CHECKS                             |
 |  Clinical Programming Bootcamp  -  Module: Data Quality & Validation       |
 |---------------------------------------------------------------------------|
 |  Pinnacle 21 is the tool the industry runs before a submission. It reads   |
 |  your SDTM datasets against thousands of published rules and produces a    |
 |  report of findings. You will not install it here - but you WILL write     |
 |  the core checks it runs, so you understand what it is actually doing.     |
 |                                                                            |
 |  A conformance check is just a query that SHOULD return zero rows. If it    |
 |  returns any, that is a finding.                                           |
 |                                                                            |
 |  You will:                                                                 |
 |     1. build a reusable "expect zero rows" check macro                     |
 |     2. run a QC suite over the whole SDTM library - it should be CLEAN     |
 |     3. INJECT four classic defects into a copy and watch them get caught   |
 |     4. read the findings report the way a reviewer would                   |
 |                                                                            |
 |  PREREQUISITE: run 00_setup.sas then run_all.sas (or notebooks 04-09) so   |
 |  the SDTM library holds the built domains.                                 |
 |                                                                            |
 |  Deck        : 10_data_quality_validation.pptx                             |
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
    %if %sysfunc(exist(sdtm.dm)) = 0 or %sysfunc(exist(sdtm.ae)) = 0 %then %do;
        %put ERROR: SDTM domains not found. Run 00_setup.sas then run_all.sas;
        %put ERROR- (or notebooks 04-09) so the library is populated.;
        %abort cancel;
    %end;
%mend;
%_need_domains;


/*---------------------------------------------------------------------------*
 | 1. THE CHECK ENGINE                                                        |
 |                                                                            |
 |  Every conformance check has the same shape: a WHERE clause that describes |
 |  a VIOLATION, run against a dataset, expecting zero rows. So we write ONE  |
 |  macro that runs any such query, counts the rows, and records a finding    |
 |  if the count is not zero.                                                 |
 |                                                                            |
 |  This is exactly how a validation engine works: rule + dataset -> count.   |
 *---------------------------------------------------------------------------*/
%macro qc_check(ruleid, severity, domain, where, message);
    /*  NOTE ON CALLING THIS MACRO.
        If your WHERE clause contains an "=", wrap it in %str() at the call
        site:   %qc_check(..., %str(aestdy = 0), ...)
        Without it, SAS's macro parser reads "aestdy = 0" as a KEYWORD
        parameter named AESTDY and rejects everything after it with:
            ERROR: All positional parameters must precede keyword parameters.
        %str() masks the "=" so the argument stays positional. (Using the
        EQ operator - "aestdy eq 0" - avoids the problem too.)            */
    %local n;
    proc sql noprint;
        select count(*) into :n trimmed
        from sdtm.&domain
        where &where;
    quit;

    data _one;
        length ruleid $12 severity $8 domain $8 nfound 8 message $80;
        ruleid   = "&ruleid";
        severity = "&severity";
        domain   = upcase("&domain");
        nfound   = &n;
        message  = "&message";
    run;
    proc append base = qc_findings data = _one force; run;
%mend;

/*  Start every run with an empty findings dataset. */
data qc_findings;
    length ruleid $12 severity $8 domain $8 nfound 8 message $80;
    stop;
run;


/*---------------------------------------------------------------------------*
 | 2. THE QC SUITE                                                            |
 |                                                                            |
 |  A representative slice of what Pinnacle 21 checks. Each is a rule that    |
 |  describes a VIOLATION - so a clean dataset returns zero for every one.    |
 |                                                                            |
 |  The four categories these fall into are the four a reviewer cares about:  |
 |     - key integrity   (uniqueness, no orphans)                            |
 |     - required data   (Req variables must be populated)                   |
 |     - controlled terms (values must be from the codelist)                 |
 |     - value logic     (dates, study day, ranges make sense)               |
 *---------------------------------------------------------------------------*/

/* --- key integrity: no --DY may be zero (there is no Day 0) ------------- */
%qc_check(SD0001, ERROR, ae, %str(aestdy = 0), AESTDY must never be 0 - there is no study Day 0)
%qc_check(SD0001, ERROR, vs, %str(vsdy = 0),   VSDY must never be 0 - there is no study Day 0)
%qc_check(SD0001, ERROR, lb, %str(lbdy = 0),   LBDY must never be 0 - there is no study Day 0)

/* --- required data: DM Required variables must be populated ------------- */
%qc_check(SD0002, ERROR, dm, missing(usubjid), USUBJID is Required and must be populated)
%qc_check(SD0002, ERROR, dm, missing(armcd),   ARMCD is Required and must be populated)
%qc_check(SD0002, ERROR, dm, missing(sex),     SEX is Required and must be populated)

/* --- controlled terminology: SEX and AESER draw on non-extensible lists -- */
%qc_check(CT0001, ERROR, dm, sex not in ("M" "F" "U"),
          SEX must be an M/F/U CDISC value)
%qc_check(CT0001, ERROR, ae, aeser not in ("Y" "N"),
          AESER must be Y or N)
%qc_check(CT0002, WARNING, ae, aesev not in ("MILD" "MODERATE" "SEVERE"),
          AESEV outside the expected severity codelist)

/* --- value logic: an end date must not precede its start date ---------- */
%qc_check(SD0003, ERROR, ae, not missing(aeendtc) and aeendtc < aestdtc,
          AE end date is before its start date)
%qc_check(SD0003, ERROR, ex, not missing(exendtc) and exendtc < exstdtc,
          EX end date is before its start date)

/* --- value logic: a baseline flag must be Y or blank, never N ---------- */
%qc_check(SD0004, ERROR, vs, vsblfl not in ("Y" ""),
          VSBLFL must be Y or null - never N)
%qc_check(SD0004, ERROR, lb, lbblfl not in ("Y" ""),
          LBBLFL must be Y or null - never N)


/*---------------------------------------------------------------------------*
 | 3. CROSS-DOMAIN CHECKS  (the ones a single-domain rule cannot catch)       |
 |                                                                            |
 |  These need TWO datasets, so they do not fit the qc_check macro. They are  |
 |  the most valuable checks, because each domain can be internally perfect   |
 |  while the SET of them is incoherent.                                      |
 *---------------------------------------------------------------------------*/
%macro qc_cross(ruleid, severity, message, query);
    %local n;
    proc sql noprint;
        create table _x as &query;
        select count(*) into :n trimmed from _x;
    quit;
    data _one;
        length ruleid $12 severity $8 domain $8 nfound 8 message $80;
        ruleid = "&ruleid"; severity = "&severity"; domain = "CROSS";
        nfound = &n; message = "&message";
    run;
    proc append base = qc_findings data = _one force; run;
%mend;

/* every domain subject must exist in DM */
%qc_cross(SD0010, ERROR, Subject in a domain but not in DM,
    %str(select distinct a.usubjid from sdtm.ae as a
         left join sdtm.dm as d on a.usubjid = d.usubjid
         where d.usubjid is null))

/* every SUPPAE row must point at a real AE record */
%qc_cross(SD0011, ERROR, SUPPAE row with no matching AE parent,
    %str(select s.usubjid, s.idvarval from sdtm.suppae as s
         left join sdtm.ae as a
           on s.usubjid = a.usubjid and s.idvarval = put(a.aeseq, best.)
         where a.usubjid is null))

/* EX first-dose date must equal DM.RFSTDTC */
%qc_cross(SD0012, ERROR, EX first dose disagrees with DM.RFSTDTC,
    %str(select e.usubjid from sdtm.ex as e
         inner join sdtm.dm as d on e.usubjid = d.usubjid
         where e.exseq = 1 and e.exstdtc ne d.rfstdtc))


/*---------------------------------------------------------------------------*
 | 4. THE FINDINGS REPORT                                                     |
 |                                                                            |
 |  Present it the way Pinnacle 21 does: one row per rule, worst first, with  |
 |  a clear PASS/FAIL. On the clean library every nfound is 0.                |
 *---------------------------------------------------------------------------*/
%macro qc_report(title);
    proc sql noprint;
        select sum(nfound > 0 and severity = "ERROR"),
               sum(nfound > 0 and severity = "WARNING"),
               count(*)
          into :n_err trimmed, :n_warn trimmed, :n_rules trimmed
        from qc_findings;
    quit;

    data qc_show;
        set qc_findings;
        length result $6;
        if nfound = 0 then result = "PASS";
        else               result = "FAIL";
    run;
    proc sort data = qc_show; by descending nfound severity ruleid; run;

    title "&title";
    title2 "%superq(n_rules) rules checked  -  &n_err error(s), &n_warn warning(s)";
    proc print data = qc_show noobs label;
        var result severity ruleid domain nfound message;
        label result = "Result" severity = "Severity" ruleid = "Rule"
              domain = "Domain" nfound = "Rows" message = "Finding";
    run;
    title;
%mend;

%qc_report(QC SUITE - clean SDTM library);


/*---------------------------------------------------------------------------*
 | 5. NOW BREAK IT  -  what a finding actually looks like                     |
 |                                                                            |
 |  A QC suite that only ever passes teaches you nothing. We copy the domains |
 |  into WORK, inject four classic defects, point the checks at the copy, and |
 |  watch them light up.                                                      |
 *---------------------------------------------------------------------------*/

/*  Copy the library into WORK so the real datasets are never touched. */
proc datasets library = work nolist;
    copy in = sdtm out = work;
    select dm ae suppae ex vs;
run; quit;

/*  Defect 1: blank out a Required variable (ARMCD) for one subject.
    Defect 2: put an illegal "N" into a baseline flag.
    Defect 3: introduce a Day 0.
    Defect 4: orphan a SUPPAE row by changing its IDVARVAL.               */
data dm;
    set dm;
    if usubjid = "ABC-01-01-001" then armcd = "";        /* defect 1 */
run;
data vs;
    set vs;
    if _n_ = 1 then vsblfl = "N";                        /* defect 2 */
run;
data ae;
    set ae;
    if _n_ = 1 then aestdy = 0;                          /* defect 3 */
run;
data suppae;
    set suppae;
    if _n_ = 1 then idvarval = "99";                     /* defect 4 */
run;

/*  Re-run the same rules, but against WORK this time. We reuse the exact
    logic by re-pointing the checks - here written out against WORK.      */
data qc_findings;
    length ruleid $12 severity $8 domain $8 nfound 8 message $80;
    stop;
run;

%macro qc_check_work(ruleid, severity, domain, where, message);
    %local n;
    proc sql noprint;
        select count(*) into :n trimmed from work.&domain where &where;
    quit;
    data _one;
        length ruleid $12 severity $8 domain $8 nfound 8 message $80;
        ruleid = "&ruleid"; severity = "&severity"; domain = upcase("&domain");
        nfound = &n; message = "&message";
    run;
    proc append base = qc_findings data = _one force; run;
%mend;

%qc_check_work(SD0002, ERROR,   dm, missing(armcd), ARMCD is Required and must be populated)
%qc_check_work(SD0004, ERROR,   vs, vsblfl not in ("Y" ""), VSBLFL must be Y or null - never N)
%qc_check_work(SD0001, ERROR,   ae, %str(aestdy = 0), AESTDY must never be 0 - there is no study Day 0)

proc sql noprint;
    create table _x as
    select s.usubjid, s.idvarval from work.suppae as s
    left join work.ae as a
      on s.usubjid = a.usubjid and s.idvarval = put(a.aeseq, best.)
    where a.usubjid is null;
    select count(*) into :n trimmed from _x;
quit;
data _one;
    length ruleid $12 severity $8 domain $8 nfound 8 message $80;
    ruleid = "SD0011"; severity = "ERROR"; domain = "CROSS";
    nfound = &n; message = "SUPPAE row with no matching AE parent";
run;
proc append base = qc_findings data = _one force; run;

%qc_report(QC SUITE - after injecting four defects);


/*===========================================================================*
 |  YOUR TURN  -  exercises                                                   |
 |  Solutions: ../../answer-keys/12_qc_validation_answers.md                 |
 *===========================================================================*/

/* EXERCISE 1 -------------------------------------------------------------- *
 | Section 4 reports every rule as PASS on the clean library. Pick any ONE    |
 | rule and explain, in words, what raw-data mistake it would catch and why   |
 | that mistake matters to a reviewer.                                        |
 *------------------------------------------------------------------------- */



/* EXERCISE 2 -------------------------------------------------------------- *
 | Section 5 injects four defects and all four are caught. For each, name the |
 | CATEGORY it belongs to (key integrity / required data / controlled terms / |
 | value logic) and say whether a SINGLE-domain check could catch it.         |
 *------------------------------------------------------------------------- */



/* EXERCISE 3 -------------------------------------------------------------- *
 | Add a new rule to the suite: CMDECOD must not be blank when CMTRT is       |
 | populated (a medication that was coded to nothing is a coding gap).        |
 | Run it against the clean library. Does it pass? Should it?                 |
 *------------------------------------------------------------------------- */



/* EXERCISE 4 -------------------------------------------------------------- *
 | The SD0012 cross-check compares EX first-dose to DM.RFSTDTC. Why is this   |
 | the single most important check in the suite, and why can NO single-domain |
 | rule replace it? (Hint: think about what happens if BOTH are wrong by the  |
 | same amount.)                                                              |
 *------------------------------------------------------------------------- */



/* EXERCISE 5 (stretch) ---------------------------------------------------- *
 | Severity matters: an ERROR blocks a submission, a WARNING does not. Look   |
 | at rule CT0002 (AESEV) - it is a WARNING, while CT0001 (SEX, AESER) is an  |
 | ERROR. Justify that difference. When would you argue AESEV should be an    |
 | ERROR instead?                                                             |
 *------------------------------------------------------------------------- */



/* EXERCISE 6 (stretch) ---------------------------------------------------- *
 | This notebook's checks and ../../data/audit_consistency.py check many of   |
 | the same things. What is the essential difference between an INSTRUCTOR    |
 | consistency harness and a SUBMISSION validation tool, and why do both      |
 | need to exist?                                                             |
 *------------------------------------------------------------------------- */
