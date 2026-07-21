/*===========================================================================*
 |  NOTEBOOK 12b (SAS)  -  THE SUBMISSION PACKAGE: XPT AND define.xml         |
 |  Clinical Programming Bootcamp  -  Module: Data Quality & Validation       |
 |---------------------------------------------------------------------------|
 |  Everything so far produced SAS datasets. That is NOT what goes to a        |
 |  regulator. A submission is three things, and you have only built one:     |
 |                                                                            |
 |     1. THE DATA        one .xpt file per dataset  (XPORT v5)   <- here      |
 |     2. THE METADATA    define.xml                              <- here      |
 |     3. THE NARRATIVE   cSDRG (reviewer's guide, a PDF)         <- see docs  |
 |                                                                            |
 |  XPT v5 is a 1980s transport format. It is still mandated because it is    |
 |  open, documented, and readable without SAS. Its age is why it imposes     |
 |  limits that explain several SDTM design decisions you have already met    |
 |  and probably found arbitrary:                                             |
 |                                                                            |
 |     - dataset name        <= 8 characters   (why domains are 2 letters)    |
 |     - variable name       <= 8 characters   (why it is AESTDTC, not        |
 |                                              ADVERSE_EVENT_START_DATE)     |
 |     - variable label      <= 40 characters                                 |
 |     - character length    <= 200 bytes                                     |
 |     - ASCII only                                                           |
 |                                                                            |
 |  So --TESTCD is 8 characters not because CDISC likes brevity, but because  |
 |  the transport format cannot carry more.                                   |
 |                                                                            |
 |  PREREQUISITE: run 00_setup.sas then run_all.sas so the SDTM library holds  |
 |  the eight built datasets.                                                 |
 |                                                                            |
 |  Deck: 12_define_xml_submission.pptx                                       |
 *===========================================================================*/

%macro _setpath;
    %global datapath outpath;
    %if %superq(datapath) = %then
        %let datapath = /Volumes/D Drive/SDTM Training/Bootcamp/data;
    %if %superq(outpath) = %then
        %let outpath  = /Volumes/D Drive/SDTM Training/Bootcamp/output;
    %if %sysfunc(fileexist(&outpath)) = 0 %then %do;
        %local nm pa rc;
        %let nm = %scan(&outpath, -1, %str(/));
        %let pa = %substr(&outpath, 1, %eval(%length(&outpath) - %length(&nm) - 1));
        %let rc = %sysfunc(dcreate(&nm, &pa));
    %end;
    %if %sysfunc(libref(sdtm)) ne 0 %then %do; libname sdtm "&outpath"; %end;
    %put NOTE: datapath = &datapath;  %put NOTE: outpath = &outpath (libref SDTM);
%mend;
%_setpath;

%macro _need_domains;
    %if %sysfunc(exist(sdtm.dm)) = 0 %then %do;
        %put ERROR: SDTM library is empty. Run 00_setup.sas then run_all.sas first.;
        %abort cancel;
    %end;
%mend;
%_need_domains;


/*---------------------------------------------------------------------------*
 | 1. CHECK BEFORE YOU EXPORT                                                 |
 |                                                                            |
 |  The XPORT engine does NOT stop you breaking its own rules - it truncates  |
 |  quietly, exactly like everything else in SAS. So check FIRST.             |
 |                                                                            |
 |  This reads the data dictionary (DICTIONARY.COLUMNS), which is SAS's own   |
 |  catalogue of every variable in every library. Useful well beyond today.   |
 *---------------------------------------------------------------------------*/
proc sql;
    create table xpt_issues as
    select memname   as dataset  length = 32,
           name      as variable length = 32,
           type,
           length    as len,
           label,
           case
               when length(compress(memname)) > 8 then "DATASET NAME  > 8 chars"
               when length(compress(name))    > 8 then "VARIABLE NAME > 8 chars"
               when length(label)            > 40 then "LABEL        > 40 chars"
               when type = "char" and length > 200 then "CHAR LENGTH  > 200 bytes"
               else ""
           end as issue length = 30
    from dictionary.columns
    where libname = "SDTM"
    having issue ne "";
quit;

proc sql noprint;
    select count(*) into :n_issues trimmed from xpt_issues;
quit;

%macro xpt_gate;
    %if &n_issues = 0 %then %do;
        %put ;
        %put NOTE: ---------------------------------------------------------;
        %put NOTE:   XPT PRE-CHECK PASSED - nothing breaks the v5 limits.;
        %put NOTE: ---------------------------------------------------------;
    %end;
    %else %do;
        title "XPT v5 violations - FIX THESE BEFORE EXPORTING";
        proc print data = xpt_issues noobs label; run;
        title;
        %put ERROR: &n_issues variable(s) break the XPORT v5 limits. See the listing.;
    %end;
%mend;
%xpt_gate;


/*---------------------------------------------------------------------------*
 | 2. EXPORT TO XPT                                                           |
 |                                                                            |
 |  ONE FILE PER DATASET. That is the FDA convention - dm.xpt, ae.xpt, and    |
 |  so on - not one big file containing everything.                           |
 |                                                                            |
 |  The XPORT engine is just a LIBNAME. Assign it to a FILE (not a folder),   |
 |  copy the dataset in, then clear it. Clearing matters: the file is not     |
 |  finished until the libref is released.                                    |
 *---------------------------------------------------------------------------*/
%macro to_xpt(dom);
    %if %sysfunc(exist(sdtm.&dom)) = 0 %then %do;
        %put WARNING: SDTM.&dom does not exist - skipped.;
        %return;
    %end;

    libname xptout xport "&outpath/&dom..xpt";
    proc copy in = sdtm out = xptout memtype = data;
        select &dom;
    run;
    libname xptout clear;            /* <- releases and finalises the file */

    %if %sysfunc(fileexist(&outpath/&dom..xpt)) %then
        %put NOTE: wrote &dom..xpt;
    %else %put ERROR: &dom..xpt was not created;
%mend;

%to_xpt(dm)
%to_xpt(ds)
%to_xpt(ex)
%to_xpt(ae)
%to_xpt(suppae)
%to_xpt(cm)
%to_xpt(vs)
%to_xpt(lb)


/*---------------------------------------------------------------------------*
 | 3. PROVE THE ROUND TRIP                                                    |
 |                                                                            |
 |  An .xpt you cannot read back is worthless. Read each one and compare the  |
 |  row count to the source. This is the minimum honest check.                |
 *---------------------------------------------------------------------------*/
data xpt_check;
    length dataset $8 status $8 detail $60;
    stop;
run;

%macro verify_xpt(dom, expect);
    %local n;
    %let n = .;
    %if %sysfunc(fileexist(&outpath/&dom..xpt)) %then %do;
        libname xptin xport "&outpath/&dom..xpt";
        proc sql noprint;
            select count(*) into :n trimmed from xptin.&dom;
        quit;
        libname xptin clear;
    %end;

    data _one;
        length dataset $8 status $8 detail $60;
        dataset = "&dom";
        %if "&n" = "." %then %do;
            status = "FAIL"; detail = "file missing or unreadable";
        %end;
        %else %if &n = &expect %then %do;
            status = "OK";   detail = "&n rows, round-tripped";
        %end;
        %else %do;
            status = "FAIL"; detail = "&n rows read back, expected &expect";
        %end;
    run;
    proc append base = xpt_check data = _one force; run;
%mend;

%verify_xpt(dm,      8)
%verify_xpt(ds,     24)
%verify_xpt(ex,      8)
%verify_xpt(ae,     10)
%verify_xpt(suppae, 10)
%verify_xpt(cm,      8)
%verify_xpt(vs,    128)
%verify_xpt(lb,     48)

title "XPT round-trip check - read each file back and count the rows";
proc print data = xpt_check noobs label;
    label dataset = "Dataset" status = "Result" detail = "Detail";
run;
title;


/*---------------------------------------------------------------------------*
 | 4. THE OTHER TWO PIECES                                                    |
 |                                                                            |
 |  You have now produced the DATA. The package also needs:                   |
 |                                                                            |
 |  define.xml - the METADATA. Every dataset, every variable, its type,       |
 |     length, origin (was it collected on the CRF, or derived?), the         |
 |     codelists, and the derivation method for anything computed.            |
 |     It is what lets a reviewer understand your data WITHOUT phoning you.   |
 |     See ../../data/define/define.xml - and note it was GENERATED from the  |
 |     mapping specification, not typed. One source of metadata, two          |
 |     consumers: the programmers and the define.                             |
 |                                                                            |
 |  cSDRG - the NARRATIVE. A short PDF explaining the things metadata cannot: |
 |     why a domain is missing, why a conformance rule fires and is           |
 |     acceptable, what a reviewer should know before opening the data.       |
 |     See ../../docs/cSDRG_ABC-01.pdf                                        |
 |                                                                            |
 |  A submission with perfect data and no define.xml is not reviewable.       |
 *---------------------------------------------------------------------------*/
proc sql;
    title "What the submission package looks like";
    select "1. DATA"     as part length = 12, "one .xpt per dataset" as item length = 40,
           "&outpath"    as location length = 60
    union all
    select "2. METADATA", "define.xml", "data/define/"
    union all
    select "3. NARRATIVE", "cSDRG (reviewer's guide)", "docs/"
    union all
    select "4. aCRF",      "annotated CRF, linked from define", "data/";
quit;
title;


/*===========================================================================*
 |  YOUR TURN  -  exercises                                                   |
 |  Solutions: ../../answer-keys/12b_submission_answers.md                   |
 *===========================================================================*/

/* EXERCISE 1 -------------------------------------------------------------- *
 | Section 1 passed - nothing in ABC-01 breaks the v5 limits. That is not     |
 | luck. Name THREE SDTM naming conventions you have already followed that    |
 | exist BECAUSE of these limits, and say which limit each one satisfies.     |
 *------------------------------------------------------------------------- */



/* EXERCISE 2 -------------------------------------------------------------- *
 | Add a variable with a 45-character label to a copy of SDTM.DM, re-run the  |
 | section 1 check, and confirm it is caught. Then export it anyway and see   |
 | what happened to the label. What does that tell you about trusting the     |
 | export step to protect you?                                                |
 *------------------------------------------------------------------------- */



/* EXERCISE 3 -------------------------------------------------------------- *
 | Open ../../data/define/define.xml in a text editor and find IT.DM.USUBJID. |
 | It says Length="13". Where did 13 come from, and why would hard-coding a   |
 | guess like 20 be worse than reading it from the data?                      |
 *------------------------------------------------------------------------- */



/* EXERCISE 4 -------------------------------------------------------------- *
 | In define.xml, DM.USUBJID has a def:MethodOID pointing at MT.DM.USUBJID,   |
 | but DM.SUBJID has none. Why does one carry a derivation method and the     |
 | other does not? (Look at the Origin of each.)                              |
 *------------------------------------------------------------------------- */



/* EXERCISE 5 (stretch) ---------------------------------------------------- *
 | XPT v5 dates back to the 1980s and cannot store a variable name longer     |
 | than 8 characters. Argue BOTH sides: why is it defensible that regulators  |
 | still mandate it, and what does the industry lose by it?                   |
 *------------------------------------------------------------------------- */



/* EXERCISE 6 (stretch) ---------------------------------------------------- *
 | Section 3 checks only the ROW COUNT after the round trip. Name two ways an |
 | .xpt could pass that check and still be wrong, and write a check for one.  |
 *------------------------------------------------------------------------- */
