/*===========================================================================*
 |  RUN_ALL.SAS  -  execute every notebook and print ONE summary              |
 |  Clinical Programming Bootcamp                                             |
 |---------------------------------------------------------------------------|
 |  PREREQUISITE: run 00_setup.sas first, in the same session.                |
 |                                                                            |
 |  This runs notebooks 01 and 03-09 in order and reports, for each:          |
 |      - whether it completed without an ERROR                               |
 |      - the row count of the domain it built, against the expected count    |
 |                                                                            |
 |  It exists so ONE log tells you the state of the whole bootcamp, rather    |
 |  than nine separate runs. It is a smoke test for the instructor, not a     |
 |  teaching exercise - trainees should run the notebooks individually.       |
 |                                                                            |
 |  This covers the SDTM track (01-12). The ADaM track (14-19) has its own    |
 |  harness, run_all_adam.sas - the two are independent.                      |
 |                                                                            |
 |  Scroll to the bottom of the output for the summary table.                 |
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

%macro run_nb(file, dom=, expect=, label=);
    %local before rc n;

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

    /* Row count of the domain this notebook was supposed to build. */
    %let n = .;
    %if %length(&dom) %then %do;
        %if %sysfunc(exist(work.&dom)) %then %do;
            proc sql noprint;
                select count(*) into :n trimmed from work.&dom;
            quit;
        %end;
        %else %let n = .;
    %end;

    /*  Echo the verdict to the LOG, not only the listing. The summary table
        prints to the results/listing, which a saved .log does not contain -
        so without this line a failing run cannot be diagnosed from the log
        alone (rc>4 = error, n=. = dataset missing, else count vs expected).  */
    %put RUN_ALL RESULT: &file  dom=&dom  built_rows=&n  expected=&expect  rc=&rc;

    data _one;
        length notebook $32 built $8 status $8 note $60;
        notebook = "&file";
        built    = "&dom";
        %if &rc > 4 %then %do;
            status = "ERROR";
            note   = "SAS raised an error - search the log for 'ERROR:'";
        %end;
        %else %if %length(&dom) = 0 %then %do;
            status = "OK";
            note   = "ran clean (builds no domain)";
        %end;
        %else %if "&n" = "." %then %do;
            status = "FAIL";
            note   = "dataset WORK.&dom was never created";
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
 |  The run order matters: each notebook rebuilds what it needs, but running  |
 |  them in protocol order is how a trainee meets them.                       |
 *---------------------------------------------------------------------------*/
%run_nb(01_sas_basics_SAS.sas)
%run_nb(03_import_raw_data_SAS.sas)
%run_nb(04_build_dm_domain_SAS.sas, dom=dm,     expect=8)
%run_nb(04_build_dm_domain_SAS.sas, dom=ds,     expect=24, label=04 (DS))
%run_nb(05_build_ae_domain_SAS.sas, dom=ae,     expect=10)
%run_nb(05_build_ae_domain_SAS.sas, dom=suppae, expect=10, label=05 (SUPPAE))
%run_nb(06_build_cm_domain_SAS.sas, dom=cm,     expect=8)
%run_nb(07_build_ex_domain_SAS.sas, dom=ex,     expect=8)
%run_nb(08_build_vs_domain_SAS.sas, dom=vs,     expect=128)
%run_nb(09_build_lb_domain_SAS.sas, dom=lb,     expect=48)
/*  Notebooks 10 and 11 build no domain - they re-map and re-derive against the
    domains above, so they are run for their SIDE EFFECTS (does it run clean?)
    not a row count. 11 depends on the SDTM library the builds just populated. */
%run_nb(10_applying_ct_SAS.sas)
%run_nb(11_deriving_dy_seq_SAS.sas)
%run_nb(12_qc_validation_SAS.sas)


/*---------------------------------------------------------------------------*
 |  SUMMARY                                                                   |
 *---------------------------------------------------------------------------*/
options notes;

proc sql noprint;
    select sum(status in ("ERROR", "FAIL")) into :n_bad trimmed from _results;
quit;

/*  What actually persists: list the SDTM library. WORK vanishes at session
    end, so this is the real deliverable.                                  */
title "SAVED SDTM LIBRARY - these datasets survive the session";
proc sql;
    select memname   label = "Dataset",
           nobs      label = "Rows",
           nvar      label = "Variables"
    from dictionary.tables
    where libname = "SDTM"
    order by memname;
quit;
title;

title  "BOOTCAMP SMOKE TEST - all notebooks";
title2 "PASS = ran clean and built the expected number of rows";
proc print data = _results noobs label;
    var notebook built status note;
    label notebook = "Notebook" built = "Domain" status = "Result" note = "Detail";
run;
title;

%macro _verdict;
    %put ;
    %put ===============================================================;
    %if &n_bad = 0 %then %do;
        %put   ALL NOTEBOOKS RAN CLEAN AND PRODUCED THE EXPECTED ROW COUNTS.;
        %put   Next: run verify_against_reference.sas for a value-level check.;
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
