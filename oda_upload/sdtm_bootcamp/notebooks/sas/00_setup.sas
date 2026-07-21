/*===========================================================================*
 |  00_SETUP.SAS  -  RUN THIS FIRST, ONCE PER SAS SESSION                     |
 |  Clinical Programming Bootcamp                                             |
 |---------------------------------------------------------------------------|
 |  This is the ONLY file you need to edit to run the bootcamp anywhere -     |
 |  SAS OnDemand for Academics, a desktop SAS install, or a server.           |
 |                                                                            |
 |  Every notebook checks whether DATAPATH is already set. If you ran this    |
 |  file first, they use your paths. If you didn't, they fall back to the     |
 |  author's local machine and will fail to find the CSVs.                    |
 |                                                                            |
 |  SAS Studio keeps macro variables alive for the whole session, so you      |
 |  only run this once - not before every notebook.                           |
 *===========================================================================*/


/*---------------------------------------------------------------------------*
 |  >>>>>>>>>>>>>>>>>>>>  EDIT THESE TWO LINES  <<<<<<<<<<<<<<<<<<<<<<        |
 |                                                                            |
 |  On SAS OnDemand for Academics your home directory is /home/<your-userid>  |
 |  where <your-userid> is the ID you log in with (NOT your email address).   |
 |                                                                            |
 |  Don't know it? Submit this and read the log:                              |
 |         %put &=sysuserid;                                                   |
 |                                                                            |
 |  Then upload the bootcamp folder so the paths below are real.              |
 *---------------------------------------------------------------------------*/
%global datapath codepath outpath;

%let codepath = /home/YOURUSERID/sdtm_bootcamp/notebooks/sas;   /* the .sas files   */
%let datapath = /home/YOURUSERID/sdtm_bootcamp/data;            /* the .csv files   */
%let outpath  = /home/YOURUSERID/sdtm_bootcamp/output;          /* YOUR built datasets */

/*  Local-machine example, for reference:
      %let codepath = /Volumes/D Drive/SDTM Training/Bootcamp/notebooks/sas;
      %let datapath = /Volumes/D Drive/SDTM Training/Bootcamp/data;
      %let outpath  = /Volumes/D Drive/SDTM Training/Bootcamp/output;         */

/*  NO TRAILING SLASH on any of the three paths.
    OUTPATH is where YOUR built domains are saved, and it is deliberately a
    DIFFERENT folder from datapath/sdtm - that one holds the REFERENCE answers,
    and writing over it would destroy the thing you check your work against. */


/*---------------------------------------------------------------------------*
 |  NOTHING BELOW THIS LINE NEEDS EDITING                                     |
 |  It verifies your paths are right and tells you exactly what is missing.   |
 *---------------------------------------------------------------------------*/
options nosyntaxcheck;   /* one bad step must not silently skip everything after it */

%macro setup_check;
    %local i n missing_raw missing_ref missing_adam rawlist reflist adamlist;
    %let rawlist  = dm ds ex ae cm vs lb;
    %let reflist  = dm ds ex ae suppae cm vs lb;
    %let adamlist = adsl adae advs adlb adtte;
    %let missing_raw  = ;
    %let missing_ref  = ;
    %let missing_adam = ;

    %put ;
    %put ===========================================================;
    %put   BOOTCAMP SETUP CHECK;
    %put ===========================================================;
    %put   codepath = &codepath;
    %put   datapath = &datapath;
    %put ;

    /* --- 1. did the user actually edit the placeholder? --- */
    %if %index(&datapath, YOURUSERID) or %index(&codepath, YOURUSERID) %then %do;
        %put ERROR: You have not edited 00_setup.sas yet.;
        %put ERROR- Replace YOURUSERID with your own SAS OnDemand user ID.;
        %put ERROR- Submit  %nrstr(%put &=sysuserid;)  to find it.;
        %return;
    %end;

    /* --- 2. do the folders exist? --- */
    %if %sysfunc(fileexist(&datapath)) = 0 %then
        %put ERROR: datapath does not exist: &datapath;
    %if %sysfunc(fileexist(&codepath)) = 0 %then
        %put ERROR: codepath does not exist: &codepath;

    /* --- 3. are all 7 raw files there? --- */
    %let n = %sysfunc(countw(&rawlist));
    %do i = 1 %to &n;
        %let d = %scan(&rawlist, &i);
        %if %sysfunc(fileexist(&datapath/&d._raw.csv)) = 0 %then
            %let missing_raw = &missing_raw &d._raw.csv;
    %end;

    /* --- 4. are the 8 reference SDTM files there? (needed for PROC COMPARE) --- */
    %let n = %sysfunc(countw(&reflist));
    %do i = 1 %to &n;
        %let d = %scan(&reflist, &i);
        %if %sysfunc(fileexist(&datapath/sdtm/&d..csv)) = 0 %then
            %let missing_ref = &missing_ref sdtm/&d..csv;
    %end;

    /* --- 4b. are the 5 reference ADaM files there? --- */
    /* The ADaM notebooks (14-19) READ these - not only for PROC COMPARE, but
       for the reference ADSL they merge subject-level variables from. Without
       data/adam/, notebook 14 fails on its first INFILE. Only relevant if you
       are doing the ADaM track; the SDTM notebooks (01-12b) do not need them. */
    %let n = %sysfunc(countw(&adamlist));
    %do i = 1 %to &n;
        %let d = %scan(&adamlist, &i);
        %if %sysfunc(fileexist(&datapath/adam/&d..csv)) = 0 %then
            %let missing_adam = &missing_adam adam/&d..csv;
    %end;

    /* --- 5. report --- */
    %if %length(&missing_raw) %then %do;
        %put ERROR: missing raw data files: &missing_raw;
        %put ERROR- Upload them into &datapath;
    %end;
    %else %put   PASS  all 7 raw CSVs found;

    %if %length(&missing_ref) %then %do;
        %put WARNING: missing reference SDTM files: &missing_ref;
        %put WARNING- The notebooks will still run, but the PROC COMPARE;
        %put WARNING- exercises cannot check your work without them.;
    %end;
    %else %put   PASS  all 8 reference SDTM CSVs found;

    /* ADaM reference files: a WARNING, not an ERROR, because the SDTM track
       does not need them. But say so loudly, because if you ARE on the ADaM
       track their absence shows up as a cryptic INFILE error, not here. */
    %if %length(&missing_adam) %then %do;
        %put WARNING: missing reference ADaM files: &missing_adam;
        %put WARNING- Only needed for the ADaM track (notebooks 14-19).;
        %put WARNING- Upload data/adam/ before running notebook 14, or those;
        %put WARNING- notebooks will fail on their first INFILE statement.;
    %end;
    %else %put   PASS  all 5 reference ADaM CSVs found;

    /* --- 6. the OUTPUT library: create the folder, then point the librefs at it --- */
    %if %sysfunc(fileexist(&outpath)) = 0 %then %do;
        %local nm pa rc;
        %let nm = %scan(&outpath, -1, %str(/));
        %let pa = %substr(&outpath, 1, %eval(%length(&outpath) - %length(&nm) - 1));
        %let rc = %sysfunc(dcreate(&nm, &pa));
        %if %superq(rc) = %then
            %put ERROR: could not create the output folder &outpath;
        %else %put   PASS  created output folder &rc;
    %end;
    %else %put   PASS  output folder exists;

    /* Both librefs point at the SAME output folder: the SDTM notebooks write
       their domains to SDTM.<domain>, the ADaM notebooks write ADSL etc. to
       ADAM.<dataset>. They coexist in one library directory without clashing. */
    libname sdtm "&outpath";
    %if %sysfunc(libref(sdtm)) = 0 %then
        %put   PASS  libref SDTM assigned to &outpath;
    %else %put ERROR: could not assign libref SDTM to &outpath;

    libname adam "&outpath";
    %if %sysfunc(libref(adam)) = 0 %then
        %put   PASS  libref ADAM assigned to &outpath;
    %else %put ERROR: could not assign libref ADAM to &outpath;

    %if %length(&missing_raw) = 0 and %sysfunc(fileexist(&codepath)) %then %do;
        %put ;
        %put   SETUP OK - you can now run any notebook, or run_all.sas;
        %put   Domains you build are saved to the SDTM library, so they;
        %put   SURVIVE after the session ends - unlike WORK.;
    %end;
    %put ===========================================================;
    %put ;
%mend;
%setup_check;
