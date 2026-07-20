/*===========================================================================*
 |  VERIFY_CAPSTONE.SAS  -  compare YOUR DEF-01 output to the reference        |
 |---------------------------------------------------------------------------|
 |  PREREQUISITE: build the six domains first (run the SKELETON you filled in,|
 |  or the SOLUTION), so the SDTM library holds dm/ex/ae/suppae/vs/lb.        |
 |                                                                            |
 |  Exports each built domain to CSV and compares it line-by-line against the |
 |  reference in ../data/sdtm/. MATCH = you reproduced it exactly.            |
 |  (Text compare, not PROC COMPARE: it sidesteps PROC IMPORT's type guessing |
 |  and also catches wrong column order. Header case is ignored on purpose.)  |
 *===========================================================================*/
%let verify_version = def01-2026-07-19a;
%put NOTE- verify_capstone.sas version &verify_version;

%macro _setpath;
    %global datapath outpath;
    %if %superq(datapath) = %then
        %let datapath = /Volumes/D Drive/SDTM Training/Bootcamp/capstone/data;
    %if %superq(outpath) = %then
        %let outpath  = /Volumes/D Drive/SDTM Training/Bootcamp/capstone/output;
    %if %sysfunc(libref(sdtm)) ne 0 %then %do; libname sdtm "&outpath"; %end;
%mend;
%_setpath;

options nosyntaxcheck;
%let workdir = %sysfunc(pathname(work));

data _verify;
    length domain $10 status $10 detail $200;  stop;
run;
data _alldiff;
    length domain $10 n 8 kind $12 ref_line built_line $4000;  stop;
run;

%macro verify(dom);
    %local nb nr src;
    %if      %sysfunc(exist(sdtm.&dom)) %then %let src = sdtm.&dom;
    %else %if %sysfunc(exist(work.&dom)) %then %let src = work.&dom;
    %else %let src = ;

    %if %superq(src) = %then %do;
        data _v1; length domain $10 status $10 detail $200;
            domain = "&dom"; status = "SKIPPED";
            detail = "neither SDTM.&dom nor WORK.&dom exists - build it first"; run;
        proc append base = _verify data = _v1 force; run;  %return;
    %end;
    %if %sysfunc(fileexist(&datapath/sdtm/&dom..csv)) = 0 %then %do;
        data _v1; length domain $10 status $10 detail $200;
            domain = "&dom"; status = "SKIPPED";
            detail = "reference sdtm/&dom..csv not found"; run;
        proc append base = _verify data = _v1 force; run;  %return;
    %end;

    proc export data = &src outfile = "&workdir/&dom._built.csv" dbms = csv replace; run;

    data _built; infile "&workdir/&dom._built.csv" truncover lrecl = 8000;
        length line $4000; input line $char4000.; n = _n_;
        line = strip(compress(line, '0D'x)); run;
    data _ref; infile "&datapath/sdtm/&dom..csv" truncover lrecl = 8000;
        length line $4000; input line $char4000.; n = _n_;
        line = strip(compress(line, '0D'x)); run;

    proc sql noprint;
        select count(*) into :nb trimmed from _built;
        select count(*) into :nr trimmed from _ref;
    quit;

    data _diff;
        merge _built (in = b rename = (line = built_line))
              _ref   (in = r rename = (line = ref_line));
        by n;  length kind $12;
        if      not r then kind = "EXTRA ROW";
        else if not b then kind = "MISSING ROW";
        else if n = 1 then do;
            if upcase(built_line) ne upcase(ref_line) then kind = "HEADER"; else delete;
        end;
        else if built_line ne ref_line then kind = "DIFFERENT"; else delete;
    run;

    proc sql noprint;
        select count(*) into :ndiff trimmed from _diff;
        select sum(kind ne "HEADER") into :ndata trimmed from _diff;
    quit;
    %if &ndata = . %then %let ndata = 0;

    data _v1; length domain $10 status $10 detail $200; domain = "&dom";
        %if &nb ne &nr %then %do;
            status = "FAIL"; detail = "row count differs: built %eval(&nb-1), reference %eval(&nr-1)"; %end;
        %else %if &ndiff = 0 %then %do;
            status = "MATCH"; detail = "identical (%eval(&nr-1) rows)"; %end;
        %else %if &ndata = 0 %then %do;
            status = "HEADER"; detail = "all %eval(&nr-1) data rows match; only header case differs"; %end;
        %else %do;
            status = "FAIL"; detail = "&ndata data row(s) differ - see listing"; %end;
    run;
    proc append base = _verify data = _v1 force; run;

    %if &ndiff > 0 %then %do;
        data _d2; length domain $10; set _diff; domain = "&dom"; run;
        proc append base = _alldiff data = _d2 force; run;
        title "&dom - first 5 differing lines";
        proc print data = _diff (obs = 5) noobs; var n kind ref_line built_line; run;
        title;
    %end;
%mend;

%verify(dm)
%verify(ex)
%verify(ae)
%verify(suppae)
%verify(vs)
%verify(lb)

proc sql noprint;
    select sum(status in ("MATCH","HEADER")), count(*) into :nok trimmed, :nall trimmed from _verify;
quit;

title  "CAPSTONE DEF-01 - verification against the reference";
title2 "MATCH = you reproduced the reference dataset exactly";
proc print data = _verify noobs label;
    var domain status detail;
    label domain = "Domain" status = "Result" detail = "Detail";
run;
title;

%put ;
%put ===============================================================;
%put   &nok of &nall domains reproduced the reference exactly.;
%put ===============================================================;
%put ;
