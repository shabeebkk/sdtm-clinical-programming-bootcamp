/*===========================================================================*
 |  RUN_ALL_ADAM.SAS  -  execute every ADaM notebook and print ONE summary    |
 |  Clinical Programming Bootcamp  -  ADaM track                              |
 |---------------------------------------------------------------------------|
 |  PREREQUISITE: run 00_setup.sas first, in the same session.                |
 |                                                                            |
 |  This runs notebooks 14-19 in order and reports, for each:                 |
 |      - whether it completed without an ERROR                               |
 |      - the row count of the dataset it built, against the expected count   |
 |                                                                            |
 |  It is the ADaM counterpart of run_all.sas (which smoke-tests the SDTM     |
 |  notebooks 01-12). The two are INDEPENDENT: the ADaM notebooks read their  |
 |  inputs from the reference CSVs in data/adam and data/sdtm, NOT from the    |
 |  SDTM library, so you do not have to run the SDTM track first.             |
 |                                                                            |
 |  Value-level checking is BUILT IN: each of notebooks 14-18 ends with its   |
 |  own PROC COMPARE against the reference dataset, so those reports appear in |
 |  this log as the notebooks run. There is no separate verify step for ADaM. |
 |                                                                            |
 |  It is a smoke test for the instructor, not a teaching exercise - trainees |
 |  should run the notebooks individually. Scroll to the bottom for the       |
 |  summary table.                                                            |
 *===========================================================================*/

%macro _guard;
    %if not %symexist(datapath) %then %do;
        %put ERROR: Run 00_setup.sas first - DATAPATH is not defined.;
        %abort cancel;
    %end;
    %if %index(&datapath, YOURUSERID) %then %do;
        %put ERROR: 00_setup.sas still contains the YOURUSERID placeholder.;
        %abort cancel;
    %end;
%mend;
%_guard;

options nosyntaxcheck nomprint nonotes;

/* Collect one row per notebook. */
data _results;
    length notebook $32 built $8 status $8 note $60;
    stop;
run;

%macro run_nb(file, ds=, expect=, label=);
    %local rc n;

    %let label = %sysfunc(coalescec(&label, &file));

    /*  SYSCC is SAS's running condition code. Reset it, run the notebook,
        then read it back: >4 means at least one ERROR was written.        */
    %let syscc = 0;

    %put ;
    %put ---------------------------------------------------------------;
    %put   RUNNING  &file;
    %put ---------------------------------------------------------------;

    %include "&codepath/&file";

    %let rc = &syscc;
    %let syscc = 0;                      /* don't let one failure poison the next */

    /* Row count of the analysis dataset this notebook was supposed to build. */
    %let n = .;
    %if %length(&ds) %then %do;
        %if %sysfunc(exist(work.&ds)) %then %do;
            proc sql noprint;
                select count(*) into :n trimmed from work.&ds;
            quit;
        %end;
        %else %let n = .;
    %end;

    data _one;
        length notebook $32 built $8 status $8 note $60;
        notebook = "&file";
        built    = "&ds";
        %if &rc > 4 %then %do;
            status = "ERROR";
            note   = "SAS raised an error - search the log for 'ERROR:'";
        %end;
        %else %if %length(&ds) = 0 %then %do;
            status = "OK";
            note   = "ran clean (builds no dataset - produces tables)";
        %end;
        %else %if "&n" = "." %then %do;
            status = "FAIL";
            note   = "dataset WORK.&ds was never created";
        %end;
        %else %if &n = &expect %then %do;
            status = "PASS";
            note   = "&n rows, as expected";
        %end;
        %else %do;
            status = "FAIL";
            note   = "&n rows, expected &expect";
        %end;
    run;

    proc append base = _results data = _one force; run;
%mend;


/*---------------------------------------------------------------------------*
 |  Run order matters: each notebook reads the reference CSVs, so they are    |
 |  independent - but this is the order a trainee meets them, and 18 and 19   |
 |  are written to follow 14 and 15 conceptually.                             |
 *---------------------------------------------------------------------------*/
%run_nb(14_build_adsl_SAS.sas,    ds=adsl,  expect=8)
%run_nb(15_build_adae_SAS.sas,    ds=adae,  expect=10)
%run_nb(16_build_advs_SAS.sas,    ds=advs,  expect=152)
%run_nb(17_build_adlb_SAS.sas,    ds=adlb,  expect=48)
%run_nb(18_build_adtte_SAS.sas,   ds=adtte, expect=8)
/*  Notebook 19 builds no dataset - it produces two tables from ADSL and ADAE,
    which is the whole point of the ADaM track. Run it for its side effects.  */
%run_nb(19_adam_to_table_SAS.sas)


/*---------------------------------------------------------------------------*
 |  SUMMARY                                                                   |
 *---------------------------------------------------------------------------*/
options notes;

proc sql noprint;
    select sum(status in ("ERROR", "FAIL")) into :n_bad trimmed from _results;
quit;

/*  What actually persists: list the ADAM library. WORK vanishes at session
    end, so this is the real deliverable. It is a SEPARATE folder from the
    SDTM library, so it shows only your analysis datasets.                  */
title "SAVED ADAM LIBRARY - these datasets survive the session";
proc sql;
    select memname   label = "Dataset",
           nobs      label = "Rows",
           nvar      label = "Variables"
    from dictionary.tables
    where libname = "ADAM"
    order by memname;
quit;
title;

title  "ADaM SMOKE TEST - notebooks 14-19";
title2 "PASS = ran clean and built the expected number of rows";
proc print data = _results noobs label;
    var notebook built status note;
    label notebook = "Notebook" built = "Dataset" status = "Result" note = "Detail";
run;
title;

%macro _verdict;
    %put ;
    %put ===============================================================;
    %if &n_bad = 0 %then %do;
        %put   ALL ADaM NOTEBOOKS RAN CLEAN AND PRODUCED THE EXPECTED ROW COUNTS.;
        %put   The PROC COMPARE in each notebook (above) is the value-level check;
        %put   against the reference - look for "NOTE: No unequal values" in each.;
    %end;
    %else %do;
        %put   &n_bad NOTEBOOK(S) FAILED. See the table above, then search;
        %put   the log for "ERROR:" - the FIRST error is the one that matters,;
        %put   later ones are usually knock-on effects.;
    %end;
    %put ===============================================================;
    %put ;
%mend;
%_verdict;
