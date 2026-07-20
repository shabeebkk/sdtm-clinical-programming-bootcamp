/*===========================================================================*
 |  VERIFY_AGAINST_REFERENCE.SAS                                              |
 |  Clinical Programming Bootcamp  -  instructor smoke test                   |
 |---------------------------------------------------------------------------|
 |  PREREQUISITE:   run 00_setup.sas (for the paths and the SDTM libref).     |
 |                  Then either run_all.sas in this session, OR just rely on  |
 |                  domains saved to the SDTM library by an EARLIER session - |
 |                  this reads SDTM first and falls back to WORK.             |
 |                                                                            |
 |  WHAT IT DOES                                                              |
 |  Exports each built domain to CSV and compares it, line by line, against   |
 |  the reference CSV in data/sdtm/. Reports the first difference per domain. |
 |                                                                            |
 |  WHY NOT PROC COMPARE?                                                     |
 |  PROC IMPORT guesses variable types from the CSV, so it reads VSORRES and  |
 |  LBORRES as NUMERIC (every value happens to be a number) while your        |
 |  program stores them as CHARACTER - which is correct SDTM. PROC COMPARE    |
 |  then flags whole columns that are actually identical. Comparing the text  |
 |  sidesteps the guessing entirely, and additionally catches wrong COLUMN    |
 |  ORDER, which PROC COMPARE ignores.                                        |
 |                                                                            |
 |  A difference here is not automatically your bug - read the detail. Number |
 |  formatting can differ harmlessly (e.g. "36.70" vs "36.7").                |
 *===========================================================================*/

/*  Bump this whenever the file changes. It prints to the log, so the log
    always says which version produced it - and an out-of-date upload is
    obvious immediately instead of after a confusing debugging round.      */
%let verify_version = 2026-07-19f;

%put ;
%put NOTE- =========================================================;
%put NOTE-   verify_against_reference.sas   version &verify_version;
%put NOTE- =========================================================;
%put ;

%macro _guard;
    %if not %symexist(datapath) %then %do;
        %put ERROR: Run 00_setup.sas first - DATAPATH is not defined.;
        %abort cancel;
    %end;
%mend;
%_guard;

options nosyntaxcheck;
%let workdir = %sysfunc(pathname(work));

data _verify;
    length domain $10 status $10 detail $200;
    stop;
run;

%macro verify(dom);
    %local nb nr;

    /*  Prefer the PERMANENT copy in the SDTM library over the WORK copy.
        Because the domains now persist, verification no longer has to run in
        the same session that built them - which is why this checks SDTM first. */
    %local src;
    %if %sysfunc(exist(sdtm.&dom)) %then %let src = sdtm.&dom;
    %else %if %sysfunc(exist(work.&dom)) %then %let src = work.&dom;
    %else %let src = ;

    %if %superq(src) = %then %do;
        data _v1;
            length domain $10 status $10 detail $200;
            domain = "&dom"; status = "SKIPPED";
            detail = "neither SDTM.&dom nor WORK.&dom exists - did run_all.sas build it?";
        run;
        proc append base = _verify data = _v1 force; run;
        %return;
    %end;
    %if %sysfunc(fileexist(&datapath/sdtm/&dom..csv)) = 0 %then %do;
        data _v1;
            length domain $10 status $10 detail $200;
            domain = "&dom"; status = "SKIPPED";
            detail = "reference file sdtm/&dom..csv was not uploaded";
        run;
        proc append base = _verify data = _v1 force; run;
        %return;
    %end;

    /* 1. export what the notebook built */
    proc export data = &src
                outfile = "&workdir/&dom._built.csv"
                dbms = csv replace;
    run;

    /* 2. read both files as plain text */
    data _built;
        infile "&workdir/&dom._built.csv" truncover lrecl = 8000;
        length line $4000;
        input line $char4000.;
        n = _n_;
        /*  '0D'x  -- the x suffix makes this the HEX byte 0D (carriage
            return). Without it, "0D" is the two CHARACTERS 0 and D, and
            SAS strips every zero and every D from the line: STUDYID
            becomes STUYI, 12.0 becomes 12., 2024-03-01 becomes 224-3-1.
            Both sides were mangled equally so most comparisons still
            worked, but the report was unreadable AND a genuine difference
            like "10" vs "1" would have been masked.                    */
        line = strip(compress(line, '0D'x));
    run;

    data _ref;
        infile "&datapath/sdtm/&dom..csv" truncover lrecl = 8000;
        length line $4000;
        input line $char4000.;
        n = _n_;
        line = strip(compress(line, '0D'x));
    run;

    proc sql noprint;
        select count(*) into :nb trimmed from _built;
        select count(*) into :nr trimmed from _ref;
    quit;

    /* 3. compare line by line
       ---------------------------------------------------------------------
       THE HEADER IS COMPARED CASE-INSENSITIVELY, ON PURPOSE.

       SAS variable names are case-insensitive, and PROC EXPORT writes them
       in lower case ("studyid,domain,...") while the reference CSVs use
       upper case ("STUDYID,DOMAIN,..."). Those two headers describe the
       SAME dataset, so treating them as a difference would fail every
       domain on line 1 and hide the real comparison underneath.

       Column ORDER is still compared strictly - only the letter case is
       ignored, and only on line 1. Data rows are compared exactly.
       --------------------------------------------------------------------- */
    data _diff;
        merge _built (in = b rename = (line = built_line))
              _ref   (in = r rename = (line = ref_line));
        by n;
        length kind $12;
        if      not r then kind = "EXTRA ROW";
        else if not b then kind = "MISSING ROW";
        else if n = 1 then do;
            if upcase(built_line) ne upcase(ref_line) then kind = "HEADER";
            else delete;
        end;
        else if built_line ne ref_line then kind = "DIFFERENT";
        else delete;
    run;

    /*  Count header and data differences SEPARATELY. A header-only
        difference means the data reproduced perfectly, which is a very
        different message from "your values are wrong".                  */
    proc sql noprint;
        select count(*)                        into :ndiff  trimmed from _diff;
        select sum(kind = "HEADER")            into :nhead  trimmed from _diff;
        select sum(kind ne "HEADER")           into :ndata  trimmed from _diff;
    quit;
    %if &nhead = . %then %let nhead = 0;
    %if &ndata = . %then %let ndata = 0;

    data _v1;
        length domain $10 status $10 detail $200;
        domain = "&dom";
        %if &nb ne &nr %then %do;
            status = "FAIL";
            detail = "line count differs: built %eval(&nb - 1) rows, reference %eval(&nr - 1) rows";
        %end;
        %else %if &ndiff = 0 %then %do;
            status = "MATCH";
            detail = "identical to the reference (%eval(&nr - 1) rows)";
        %end;
        %else %if &ndata = 0 %then %do;
            status = "HEADER";
            detail = "all %eval(&nr - 1) data rows match; only the header line differs";
        %end;
        %else %do;
            status = "FAIL";
            detail = "&ndata data row(s) differ - see the listing below";
        %end;
    run;
    proc append base = _verify data = _v1 force; run;

    %if &ndiff > 0 %then %do;
        data _diff2;
            length domain $10;
            set _diff;
            domain = "&dom";
        run;
        proc append base = _alldiff data = _diff2 force; run;

        title "&dom - first 5 differing lines";
        proc print data = _diff (obs = 5) noobs;
            var n kind ref_line built_line;
        run;
        title;
    %end;
%mend;

/*  Keep every difference from every domain, not just the 5 printed on screen,
    so the downloadable report below is complete.                            */
data _alldiff;
    /*  N (the line number) MUST be declared here. Without it, PROC APPEND
        ... FORCE drops the column and only WARNS:
            WARNING: Variable n was not found on BASE file.
        The report then lists differences with no line number, which is the
        one thing you need to find them. FORCE means "append anyway, losing
        what doesn't fit" - so a warning here is real data loss.          */
    length domain $10 n 8 kind $12 ref_line built_line $4000;
    stop;
run;

%verify(dm)
%verify(ds)
%verify(ae)
%verify(suppae)
%verify(cm)
%verify(ex)
%verify(vs)
%verify(lb)

title  "VALUE-LEVEL VERIFICATION against the reference CSVs in data/sdtm";
title2 "MATCH = your program reproduced the reference dataset exactly";
proc print data = _verify noobs label;
    var domain status detail;
    label domain = "Domain" status = "Result" detail = "Detail";
run;
title;

proc sql noprint;
    /*  HEADER counts as a pass: the data reproduced exactly and only the
        letter case of the column names differs, which is not a data issue. */
    select sum(status in ("MATCH", "HEADER")), count(*) into :n_ok trimmed, :n_all trimmed
    from _verify;
quit;

%put ;
%put ===============================================================;
%put   &n_ok of &n_all domains reproduced the reference exactly.;
%put ===============================================================;
%put ;


/*---------------------------------------------------------------------------*
 |  WRITE ONE SHAREABLE REPORT                                                |
 |                                                                            |
 |  Everything needed to diagnose a failure, in a single downloadable file:   |
 |  environment details, the per-domain summary, and EVERY differing line     |
 |  (not just the 5 shown on screen).                                         |
 |                                                                            |
 |  To send it: in SAS Studio's Files pane, right-click verify_report.txt     |
 |  and choose Download.                                                      |
 *---------------------------------------------------------------------------*/
%let reportfile = &datapath/verify_report.txt;

data _null_;
    file "&reportfile" lrecl = 5000;
    put "=================================================================";
    put "  SDTM BOOTCAMP - VERIFICATION REPORT";
    put "=================================================================";
    put "  generated : " "%sysfunc(datetime(), datetime20.)";
    put "  SAS       : &sysvlong";
    put "  running on: &sysscp &sysscpl";
    put "  datapath  : &datapath";
    put "  result    : &n_ok of &n_all domains matched the reference";
    put "=================================================================";
    put ;
run;

data _null_;
    file "&reportfile" mod lrecl = 5000;
    set _verify end = last;
    if _n_ = 1 then do;
        put "SUMMARY";
        put "-----------------------------------------------------------------";
    end;
    put domain $10. " " status $10. " " detail;
    if last then put ;
run;

data _null_;
    file "&reportfile" mod lrecl = 5000;
    set _alldiff end = last nobs = ndiffs;
    if _n_ = 1 then do;
        put "DIFFERENCES (line 1 of each file is the header row)";
        put "-----------------------------------------------------------------";
    end;
    put domain +1 "line " n +1 kind;
    put "    reference: " ref_line;
    put "    yours    : " built_line;
    put ;
run;

%macro _no_diffs;
    %if %sysfunc(exist(_alldiff)) %then %do;
        %local n;
        proc sql noprint; select count(*) into :n trimmed from _alldiff; quit;
        %if &n = 0 %then %do;
            data _null_;
                file "&reportfile" mod lrecl = 5000;
                put "DIFFERENCES";
                put "-----------------------------------------------------------------";
                put "  none - every domain matched the reference exactly.";
            run;
        %end;
    %end;
%mend;
%_no_diffs;

%put ;
%put   Report written to: &reportfile;
%put   Right-click it in the Files pane and choose Download, then send it over.;
%put ;

