/*===========================================================================*
 |  NOTEBOOK 10 (SAS)  -  APPLYING CONTROLLED TERMINOLOGY                     |
 |  Clinical Programming Bootcamp  -  Module: Controlled Terminology          |
 |---------------------------------------------------------------------------|
 |  This notebook does NOT build a new domain. It changes HOW you apply CT.   |
 |                                                                            |
 |  Every mapping you have written so far hard-codes the terminology in a     |
 |  SELECT block. That works for 6 values. Real studies have hundreds, and    |
 |  the list arrives as a FILE from NCI-EVS that somebody must reconcile      |
 |  against your data.                                                        |
 |                                                                            |
 |  So here you will:                                                         |
 |     1. hold the mapping as DATA, not code                                  |
 |     2. turn it into a FORMAT with PROC FORMAT + CNTLIN                     |
 |     3. apply it with PUT()                                                 |
 |     4. FAIL LOUDLY on anything the list does not cover                     |
 |     5. audit every coded variable in the study in one pass                 |
 |                                                                            |
 |  Deck        : 08_controlled_terminology.pptx                              |
 |  Spec        : ../../data/mapping_specification.md   (section 1.5)         |
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


/*---------------------------------------------------------------------------*
 | 0. READ THE RAW DATA WE WILL RE-MAP                                        |
 *---------------------------------------------------------------------------*/
data dm_raw;
    infile "&datapath/dm_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 brthdtc $11 sex $1
           race $40 ethnic $30 country $3 arm $20
           rficdtc $11 randdtc $11;
    input studyid $ siteid $ subjid $ brthdtc $ sex $ race $ ethnic $
          country $ arm $ rficdtc $ randdtc $;
run;

data ae_raw;
    infile "&datapath/ae_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 aeterm $60 aestdt $12 aeendt $12
           aesev $12 aeser $5 aerel $25 aeout $2;
    input studyid $ siteid $ subjid $ aeterm $ aestdt $ aeendt $
          aesev $ aeser $ aerel $ aeout $;
run;


/*---------------------------------------------------------------------------*
 | 1. THE MAPPING AS DATA                                                     |
 |                                                                            |
 |  This is the whole idea of the notebook. Instead of burying the mapping    |
 |  in a SELECT block that only a SAS programmer can read, hold it in a       |
 |  DATASET with one row per raw value.                                       |
 |                                                                            |
 |  A lookup table can be printed, reviewed by a data manager, diffed         |
 |  between CT releases, attached to the spec and signed off. A SELECT        |
 |  block can be none of those things.                                        |
 |                                                                            |
 |  In a real study you would READ this from the NCI-EVS download plus a      |
 |  study-specific mapping sheet. We type it here so the notebook runs        |
 |  standalone - but note the SHAPE is the same.                              |
 *---------------------------------------------------------------------------*/
data ct_map;
    length fmtname $10 start $40 label $40;
    /*  FMTNAME = the format we are building
        START   = the RAW value (upper-cased, so the lookup is case-blind)
        LABEL   = the SDTM submission value                                 */
    infile datalines dsd dlm = "|" truncover;
    input fmtname $ start $ label $;
    datalines;
sexmap|1|M
sexmap|2|F
sevmap|MILD|MILD
sevmap|MODERATE|MODERATE
sevmap|SEVERE|SEVERE
sermap|Y|Y
sermap|YES|Y
sermap|N|N
sermap|NO|N
outmap|1|RECOVERED/RESOLVED
outmap|2|RECOVERING/RESOLVING
outmap|3|NOT RECOVERED/NOT RESOLVED
outmap|4|FATAL
outmap|5|UNKNOWN
;
run;

/*  PROC FORMAT needs one more thing: what to return when the value is NOT
    in the list. That is what the HLO variable is for - "High, Low, Other".
    A row with HLO = "O" is the catch-all, and its LABEL is what any
    unrecognised value maps to. This is what turns a silent blank into a
    signal you can search for.

    HLO is a CNTLIN convention, not a value you invent: "O" = OTHER,
    "H" = HIGH, "L" = LOW. Setting START = "**OTHER**" does NOT work.     */
data ct_map;
    set ct_map;
    by fmtname notsorted;               /* NOTSORTED: groups are in file order */
    length hlo $1 type $1;

    /*  TYPE = "C" MAKES THESE CHARACTER FORMATS. This one line is essential.
        Leave it out and PROC FORMAT builds NUMERIC formats (that is the
        default when FMTNAME has no leading $), then tries to read "MILD",
        "MODERATE" and "SEVERE" as numbers. All three become missing, so all
        three collapse to the same range and you get:

            ERROR: For format SEVMAP, this range is repeated,
                   or values overlap: .-.

        The "." in that message is the tell: SAS is showing you a NUMERIC
        range for what you meant to be text. (The alternative fix is to name
        the format "$sevmap" in FMTNAME - TYPE="C" is clearer.)            */
    type = "C";

    output;                             /* the real mapping row */
    if last.fmtname then do;            /* then one catch-all per format */
        hlo   = "O";
        start = "";
        label = "!!UNMAPPED!!";
        output;
    end;
run;

proc print data = ct_map noobs;
    title "The mapping, as reviewable DATA";
run;


/*---------------------------------------------------------------------------*
 | 2. TURN THE DATA INTO FORMATS                                              |
 |                                                                            |
 |  CNTLIN = "control input": build formats FROM a dataset. The dataset must  |
 |  have the variables FMTNAME, START and LABEL - which is why we named them  |
 |  that above. One PROC FORMAT call builds all four formats at once.         |
 *---------------------------------------------------------------------------*/
proc format cntlin = ct_map;
run;

/*  $ in front of the name means a CHARACTER format. We defined FMTNAME
    without the $, and PROC FORMAT infers it because START is character.  */
proc format library = work fmtlib;
    select $sexmap $sevmap;
    title "The formats SAS built from that dataset";
run;


/*---------------------------------------------------------------------------*
 | 3. APPLY THE FORMATS                                                       |
 |                                                                            |
 |  put(value, $fmtname.) replaces the whole SELECT block. Note the           |
 |  upcase(strip(...)) - the lookup keys are upper-case, so normalising the   |
 |  input first makes the mapping case- and space-blind in one place instead  |
 |  of scattered through the code.                                            |
 *---------------------------------------------------------------------------*/
data dm_ct;
    set dm_raw;
    length sex_ct $1;
    sex_ct = put(strip(sex), $sexmap.);
    keep siteid subjid sex sex_ct;
run;

data ae_ct;
    set ae_raw;
    length aesev_ct $12 aeser_ct $1 aeout_ct $30;
    aesev_ct = put(upcase(strip(aesev)), $sevmap.);
    aeser_ct = put(upcase(strip(aeser)), $sermap.);
    aeout_ct = put(strip(aeout),         $outmap.);
    keep siteid subjid aeterm aesev aesev_ct aeser aeser_ct aeout aeout_ct;
run;

proc print data = ae_ct noobs;
    var siteid subjid aesev aesev_ct aeser aeser_ct aeout aeout_ct;
    title "Raw values and their CT equivalents, side by side";
run;


/*---------------------------------------------------------------------------*
 | 4. FAIL LOUDLY  -  the habit this notebook exists to teach                 |
 |                                                                            |
 |  Because unmapped values become "!!UNMAPPED!!" rather than blank, they     |
 |  are now FINDABLE. Search for them and stop the program if any exist.      |
 *---------------------------------------------------------------------------*/
proc sql noprint;
    create table ct_problems as
    select "AESEV" as variable length = 10, aesev as raw_value length = 40
    from ae_ct where aesev_ct = "!!UNMAPPED!!"
    union all
    select "AESER", aeser from ae_ct where aeser_ct = "!!UNMAPPED!!"
    union all
    select "AEOUT", aeout from ae_ct where aeout_ct = "!!UNMAPPED!!"
    union all
    select "SEX",   sex   from dm_ct where sex_ct   = "!!UNMAPPED!!";
quit;

proc sql noprint;
    select count(*) into :n_problems trimmed from ct_problems;
quit;

%macro ct_verdict;
    %if &n_problems = 0 %then %do;
        %put NOTE: ============================================;
        %put NOTE:   CT CHECK PASSED - every value was mapped.;
        %put NOTE: ============================================;
    %end;
    %else %do;
        proc print data = ct_problems noobs;
            title "UNMAPPED VALUES - these must be resolved before mapping";
        run;
        %put ERROR: ==========================================;
        %put ERROR:   &n_problems value(s) had no CT mapping.;
        %put ERROR:   A new value is a SPEC CHANGE, not something;
        %put ERROR:   a mapping program should quietly absorb.;
        %put ERROR: ==========================================;
    %end;
%mend;
%ct_verdict;


/*---------------------------------------------------------------------------*
 | 5. AUDIT THE WHOLE STUDY IN ONE PASS                                       |
 |                                                                            |
 |  A useful thing to be able to do: list every distinct value of every       |
 |  coded variable in the finished SDTM datasets, so you can eyeball the      |
 |  study's terminology on one page.                                          |
 *---------------------------------------------------------------------------*/
%macro ct_inventory;
    /*  Audit YOUR built domains. If the SDTM library is empty - you have not
        run notebooks 04-09 in this session - say so plainly rather than
        silently auditing something else.                                  */
    %if %sysfunc(exist(sdtm.dm)) = 0 or %sysfunc(exist(sdtm.ae)) = 0 %then %do;
        %put NOTE: ---------------------------------------------------------;
        %put NOTE:   SDTM.DM / SDTM.AE not found, so the inventory is skipped.;
        %put NOTE:   Run 04_build_dm and 05_build_ae first (or run_all.sas).;
        %put NOTE: ---------------------------------------------------------;
        %return;
    %end;

    proc sql;
        title "CT inventory - every distinct coded value in YOUR built domains";
        select "SEX"    as variable length = 10,
               sex      as value    length = 40,
               count(*) as n
        from sdtm.dm group by sex
        union all
        select "RACE",   race,   count(*) from sdtm.dm group by race
        union all
        select "ETHNIC", ethnic, count(*) from sdtm.dm group by ethnic
        union all
        select "AESEV",  aesev,  count(*) from sdtm.ae group by aesev
        union all
        select "AESER",  aeser,  count(*) from sdtm.ae group by aeser
        union all
        select "AEREL",  aerel,  count(*) from sdtm.ae group by aerel
        union all
        select "AEOUT",  aeout,  count(*) from sdtm.ae group by aeout;
    quit;
%mend;
%ct_inventory;

title;


/*===========================================================================*
 |  YOUR TURN  -  exercises                                                   |
 |  Solutions: ../../answer-keys/10_applying_ct_answers.md                   |
 *===========================================================================*/

/* EXERCISE 1 -------------------------------------------------------------- *
 | Add a row to ae_raw with AEOUT = "6" (a code that does not exist), re-run  |
 | sections 1-4, and describe exactly what happens. Then explain why this is  |
 | better than the SELECT block in Notebook 05, which would have produced a   |
 | blank and reported success.                                                |
 *------------------------------------------------------------------------- */



/* EXERCISE 2 -------------------------------------------------------------- *
 | The RACE mapping is NOT in ct_map. Add it, remembering that the raw data   |
 | contains "White ", "asian" and "black or african american".                |
 | How many rows do you need, and why fewer than you might expect?            |
 *------------------------------------------------------------------------- */



/* EXERCISE 3 -------------------------------------------------------------- *
 | AEREL is sponsor-defined, not CDISC. Where would a reviewer find out what  |
 | "UNLIKELY RELATED" means in this study? What is your obligation as the     |
 | programmer?                                                                |
 *------------------------------------------------------------------------- */



/* EXERCISE 4 -------------------------------------------------------------- *
 | SEX, AESEV and AESER draw on NON-EXTENSIBLE codelists; RACE and LBTEST on  |
 | EXTENSIBLE ones. A site reports SEX as "Unknown". What do you do, and what |
 | do you NOT do?                                                             |
 *------------------------------------------------------------------------- */



/* EXERCISE 5 (stretch) ---------------------------------------------------- *
 | Rewrite the AEDECOD lookup from Notebook 05 as a CNTLIN dataset + format.  |
 | Then explain why, despite it now looking exactly like the CT mappings,     |
 | AEDECOD is fundamentally a DIFFERENT kind of thing.                        |
 *------------------------------------------------------------------------- */



/* EXERCISE 6 (stretch) ---------------------------------------------------- *
 | Your ct_map covers 4 formats. A real study CT file has hundreds of         |
 | codelists. Sketch how you would verify that every coded variable in your   |
 | SDTM datasets uses ONLY values from its assigned codelist - without        |
 | writing one check per variable.                                            |
 *------------------------------------------------------------------------- */
