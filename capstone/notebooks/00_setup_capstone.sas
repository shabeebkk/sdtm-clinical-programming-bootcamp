/*===========================================================================*
 |  00_SETUP_CAPSTONE.SAS  -  RUN THIS FIRST, ONCE PER SAS SESSION            |
 |  Clinical Programming Bootcamp  -  Capstone (study DEF-01)                 |
 |---------------------------------------------------------------------------|
 |  The ONLY file you edit to run the capstone anywhere. It sets the paths,   |
 |  creates your output folder, assigns the SDTM library, and checks that     |
 |  every file is present.                                                     |
 |                                                                            |
 |  Run this once; then the skeleton, the solution and verify_capstone.sas    |
 |  all use the paths it defines.                                             |
 *===========================================================================*/

/*---------------------------------------------------------------------------*
 |  >>>>>>>>>>>>>>>>>>>>  EDIT THESE THREE LINES  <<<<<<<<<<<<<<<<<<<<<<      |
 |  On SAS OnDemand your home is /home/<your-userid> (the ID you log in with, |
 |  NOT your email). Find it with:   %put &=sysuserid;                        |
 *---------------------------------------------------------------------------*/
%global datapath outpath codepath;

%let codepath = /home/YOURUSERID/sdtm_capstone/notebooks;   /* the .sas files      */
%let datapath = /home/YOURUSERID/sdtm_capstone/data;        /* raw + reference CSVs */
%let outpath  = /home/YOURUSERID/sdtm_capstone/output;      /* where YOU save SDTM  */

/*  Local-machine example, for reference:
      %let codepath = /Volumes/D Drive/SDTM Training/Bootcamp/capstone/notebooks;
      %let datapath = /Volumes/D Drive/SDTM Training/Bootcamp/capstone/data;
      %let outpath  = /Volumes/D Drive/SDTM Training/Bootcamp/capstone/output;   */


/*---------------------------------------------------------------------------*
 |  NOTHING BELOW THIS LINE NEEDS EDITING                                     |
 *---------------------------------------------------------------------------*/
options nosyntaxcheck;

%macro setup_check;
    %local i n missing_raw missing_ref rawlist reflist d;
    %let rawlist = dm ex ae vs lb;                 /* 5 raw files            */
    %let reflist = dm ex ae suppae vs lb;          /* 6 reference SDTM files */
    %let missing_raw = ;  %let missing_ref = ;

    %put ;
    %put ===========================================================;
    %put   CAPSTONE DEF-01 SETUP CHECK;
    %put ===========================================================;
    %put   codepath = &codepath;
    %put   datapath = &datapath;
    %put   outpath  = &outpath;
    %put ;

    %if %index(&datapath, YOURUSERID) or %index(&codepath, YOURUSERID)
        or %index(&outpath, YOURUSERID) %then %do;
        %put ERROR: You have not edited 00_setup_capstone.sas yet.;
        %put ERROR- Replace YOURUSERID with your own SAS OnDemand user ID.;
        %put ERROR- Find it with:  %nrstr(%put &=sysuserid;);
        %return;
    %end;

    %if %sysfunc(fileexist(&datapath)) = 0 %then
        %put ERROR: datapath does not exist: &datapath;

    %let n = %sysfunc(countw(&rawlist));
    %do i = 1 %to &n;
        %let d = %scan(&rawlist, &i);
        %if %sysfunc(fileexist(&datapath/&d._raw.csv)) = 0 %then
            %let missing_raw = &missing_raw &d._raw.csv;
    %end;

    %let n = %sysfunc(countw(&reflist));
    %do i = 1 %to &n;
        %let d = %scan(&reflist, &i);
        %if %sysfunc(fileexist(&datapath/sdtm/&d..csv)) = 0 %then
            %let missing_ref = &missing_ref sdtm/&d..csv;
    %end;

    %if %length(&missing_raw) %then %do;
        %put ERROR: missing raw data files: &missing_raw;
        %put ERROR- Upload them into &datapath;
    %end;
    %else %put   PASS  all 5 raw CSVs found;

    %if %length(&missing_ref) %then %do;
        %put WARNING: missing reference SDTM files: &missing_ref;
        %put WARNING- verify_capstone.sas cannot check your work without them.;
    %end;
    %else %put   PASS  all 6 reference SDTM CSVs found;

    /* create the output folder, then point the SDTM library at it */
    %if %sysfunc(fileexist(&outpath)) = 0 %then %do;
        %local nm pa rc;
        %let nm = %scan(&outpath, -1, %str(/));
        %let pa = %substr(&outpath, 1, %eval(%length(&outpath) - %length(&nm) - 1));
        %let rc = %sysfunc(dcreate(&nm, &pa));
        %if %superq(rc) ne %then %put   PASS  created output folder &rc;
        %else %put ERROR: could not create output folder &outpath;
    %end;
    %else %put   PASS  output folder exists;

    libname sdtm "&outpath";
    %if %sysfunc(libref(sdtm)) = 0 %then %put   PASS  libref SDTM -> &outpath;
    %else %put ERROR: could not assign libref SDTM to &outpath;

    %if %length(&missing_raw) = 0 %then %do;
        %put ;
        %put   SETUP OK - fill in 13_capstone_DEF01_SKELETON.sas, build the six;
        %put   domains into the SDTM library, then run verify_capstone.sas.;
    %end;
    %put ===========================================================;
    %put ;
%mend;
%setup_check;
