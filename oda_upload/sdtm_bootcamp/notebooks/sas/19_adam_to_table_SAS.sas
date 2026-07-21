/*===========================================================================*
 |  NOTEBOOK 19 (SAS)  -  FROM ADaM TO A TABLE                                |
 |  Clinical Programming Bootcamp  -  Module: The payoff                      |
 |---------------------------------------------------------------------------|
 |  This notebook is SHORT ON PURPOSE.                                        |
 |                                                                            |
 |  You have spent four days deriving variables. This is why. Two of the      |
 |  tables that appear in every clinical study report get produced here with  |
 |  PROC FREQ and PROC MEANS, against ONE dataset each, with:                 |
 |                                                                            |
 |         NO merging.  NO joins.  NO derivation.                             |
 |                                                                            |
 |  That is the definition of analysis-ready from Module 14, and this is the  |
 |  test of it. If you find yourself needing a join to produce a table, the   |
 |  analysis dataset was built wrong - go back and fix the dataset, not the   |
 |  table program.                                                            |
 |                                                                            |
 |  You will produce:                                                         |
 |     Table 14.1.1  Demographics and baseline characteristics  (from ADSL)   |
 |     Table 14.3.1  Treatment-emergent adverse events          (from ADAE)   |
 |                                                                            |
 |  Needs : Notebooks 14 (ADSL) and 15 (ADAE)                                 |
 *===========================================================================*/

%macro _setpath;
    %global datapath outpath;
    %if %superq(datapath) = %then
        %let datapath = /Volumes/D Drive/SDTM Training/Bootcamp/data;     /* local default */
    %if %superq(outpath) = %then
        %let outpath  = /Volumes/D Drive/SDTM Training/Bootcamp/output;   /* local default */

    %if %sysfunc(libref(adam)) ne 0 %then %do;
        libname adam "&outpath";
    %end;

    %put NOTE: datapath = &datapath;
%mend;
%_setpath;

options nosyntaxcheck;


/*---------------------------------------------------------------------------*
 | 0. READ THE TWO ANALYSIS DATASETS                                          |
 |                                                                            |
 | Two datasets. That is the entire input to two tables. Everything those     |
 | tables need is already on the rows - which is the point.                   |
 *---------------------------------------------------------------------------*/
data adsl;
    infile "&datapath/adam/adsl.csv" dsd firstobs = 2 truncover;
    length studyid $10 usubjid $20 subjid $5 siteid $3 country $3
           arm actarm trt01p $20 trt01pn 8 trt01a $20 trt01an 8
           age 8 ageu $10 agegr1 $5 agegr1n 8 sex $1 race $40 ethnic $30
           c_rficdt c_randdt c_trtsdt c_trtedt $10 trtdurd 8
           eosstt $12 dcsreas $40 dcsreasp $60 saffl ittfl complfl $1
           heightbl 8 weightbl 8 bmibl 8;
    input studyid $ usubjid $ subjid $ siteid $ country $ arm $ actarm $
          trt01p $ trt01pn trt01a $ trt01an age ageu $ agegr1 $ agegr1n
          sex $ race $ ethnic $ c_rficdt $ c_randdt $ c_trtsdt $ c_trtedt $
          trtdurd eosstt $ dcsreas $ dcsreasp $ saffl $ ittfl $ complfl $
          heightbl weightbl bmibl;
run;

data adae;
    infile "&datapath/adam/adae.csv" dsd firstobs = 2 truncover;
    length studyid $10 usubjid $20 subjid $5 siteid $3 trta $20 trtan 8
           age 8 agegr1 $5 agegr1n 8 sex $1 race $40 saffl $1
           c_trtsdt c_trtedt $10 aeseq 8 aeterm $60 aedecod $60
           aesev $10 asevn 8 aeser $1 aerel $20 arel $1 aeout $30
           c_astdt c_aendt $10 astdy 8 aendy 8 adurn 8
           trtemfl aoccfl aoccpfl $1;
    input studyid $ usubjid $ subjid $ siteid $ trta $ trtan age agegr1 $
          agegr1n sex $ race $ saffl $ c_trtsdt $ c_trtedt $ aeseq aeterm $
          aedecod $ aesev $ asevn aeser $ aerel $ arel $ aeout $
          c_astdt $ c_aendt $ astdy aendy adurn trtemfl $ aoccfl $ aoccpfl $;
run;


/*---------------------------------------------------------------------------*
 | 1. THE DENOMINATOR - ESTABLISH IT ONCE, FROM ADSL                          |
 |                                                                            |
 | Every percentage in both tables divides by this. It comes from ADSL, not   |
 | from the dataset being summarised - Notebook 17 showed what happens        |
 | otherwise.                                                                 |
 *---------------------------------------------------------------------------*/
proc sql noprint;
    select count(*) into : n_drug  trimmed from adsl where saffl = 'Y' and trt01a = 'Drug A';
    select count(*) into : n_plac  trimmed from adsl where saffl = 'Y' and trt01a = 'Placebo';
    select count(*) into : n_total trimmed from adsl where saffl = 'Y';
quit;
%put NOTE: Safety population - Drug A = &n_drug, Placebo = &n_plac, Total = &n_total;


/*===========================================================================*
 |  TABLE 14.1.1  -  DEMOGRAPHICS AND BASELINE CHARACTERISTICS                |
 |  Source: ADSL only. One PROC MEANS and one PROC FREQ.                      |
 *===========================================================================*/
title1 'Table 14.1.1';
title2 'Demographics and Baseline Characteristics';
title3 "Safety Population (N = &n_total)";

/*  Continuous characteristics. Note that AGE, BMIBL, HEIGHTBL and WEIGHTBL
    are all sitting on the ADSL row already - none of them is computed here.  */
proc means data = adsl n mean std median min max maxdec = 1;
    where saffl = 'Y';
    class trt01a;
    var age heightbl weightbl bmibl trtdurd;
run;

/*  Categorical characteristics. AGEGR1 was derived in ADSL, not here - so
    every table that reports age groups uses the SAME grouping.               */
proc freq data = adsl;
    where saffl = 'Y';
    tables (agegr1 sex race ethnic) * trt01a / nopercent norow nocol;
run;

/*  Disposition. EOSSTT and DCSREAS came from DS via ADSL.                    */
proc freq data = adsl;
    where saffl = 'Y';
    tables eosstt * trt01a / nopercent norow nocol;
    tables dcsreas * trt01a / nopercent norow nocol;
run;
title;


/*===========================================================================*
 |  TABLE 14.3.1  -  TREATMENT-EMERGENT ADVERSE EVENTS                        |
 |  Source: ADAE only. The flags do all the work.                             |
 *===========================================================================*/
title1 'Table 14.3.1';
title2 'Treatment-Emergent Adverse Events by Preferred Term';
title3 "Safety Population";

/*  LINE 1 of the table: "Subjects with at least one TEAE".
    AOCCFL marks exactly ONE row per subject, so counting FLAGGED ROWS counts
    SUBJECTS. This is the entire reason that flag exists.                     */
title4 'Subjects with at least one treatment-emergent adverse event';
proc freq data = adae;
    where aoccfl = 'Y';
    tables trta / nocum nopercent;
run;

/*  BY PREFERRED TERM. AOCCPFL marks one row per subject per term, so a
    subject with two headaches counts once in the Headache row.               */
title4 'Subjects with each preferred term';
proc freq data = adae;
    where aoccpfl = 'Y';
    tables aedecod * trta / nopercent norow nocol;
run;

/*  BY SEVERITY. ASEVN gives the correct clinical order - without it, MILD
    would print above MODERATE above SEVERE alphabetically, which is wrong.   */
title4 'Subjects by maximum reported severity';
proc freq data = adae;
    where aoccfl = 'Y';
    tables asevn * trta / nopercent norow nocol;
run;

/*  RELATED EVENTS. AREL collapsed four collected values into the yes/no this
    table reports - a decision made in the SAP, not here.                     */
title4 'Subjects with at least one treatment-related event';
proc freq data = adae;
    where aoccfl = 'Y' and arel = 'Y';
    tables trta / nocum nopercent;
run;
title;


/*---------------------------------------------------------------------------*
 |  THE POINT                                                                 |
 |                                                                            |
 |  Scroll back through this notebook and count the joins. There are none.    |
 |  Count the derivations. There are none - only the denominator macro        |
 |  variables, and those just read a count out of ADSL.                       |
 |                                                                            |
 |  Every hard decision was made ONCE, in the analysis dataset, where it is   |
 |  documented in define.xml and checked by the audit:                        |
 |                                                                            |
 |    which subjects count          ->  SAFFL in ADSL                         |
 |    which events count            ->  TRTEMFL in ADAE                       |
 |    how to count a subject once   ->  AOCCFL / AOCCPFL in ADAE              |
 |    what "related" means          ->  AREL in ADAE                          |
 |    what order severity prints    ->  ASEVN in ADAE                         |
 |    which age grouping            ->  AGEGR1 in ADSL                        |
 |                                                                            |
 |  If those decisions lived in the table programs instead, every table       |
 |  would re-implement them, and sooner or later two tables in the same       |
 |  submission would disagree - with no error, and no way to tell which was   |
 |  right.                                                                    |
 |                                                                            |
 |  THAT is what ADaM is for.                                                 |
 *---------------------------------------------------------------------------*/


/*===========================================================================*
 |  YOUR TURN  -  exercises                                                   |
 |  Solutions: ../../answer-keys/19_adam_to_table_answers.md                  |
 *===========================================================================*/

/* EXERCISE 1 -------------------------------------------------------------- *
 | The AE table above reports COUNTS. A real table reports n (%). Add the     |
 | percentages, using the macro variables from section 1 as denominators.     |
 | Then deliberately use PROC FREQ's own percentages instead and explain,     |
 | with numbers, why they are wrong for the "subjects with any TEAE" line.    |
 *------------------------------------------------------------------------- */



/* EXERCISE 2 -------------------------------------------------------------- *
 | Two subjects (ABC-01-01-003, ABC-01-02-004) had no adverse events at all,  |
 | so they appear NOWHERE in ADAE. Show that they are still counted correctly |
 | in the denominator of the AE table. Then break it: compute the same        |
 | percentage using ADAE's own subject count and report both numbers.         |
 *------------------------------------------------------------------------- */



/* EXERCISE 3 -------------------------------------------------------------- *
 | Produce a shift table from ADLB - baseline reference range indicator by    |
 | Week 4 indicator - using ONE PROC FREQ and no joins. Then write down what  |
 | you would have had to do if BNRIND were not on the row.                    |
 *------------------------------------------------------------------------- */



/* EXERCISE 4 -------------------------------------------------------------- *
 | Add a "mean change from baseline at Week 4" row for systolic blood         |
 | pressure, from ADVS, by treatment. Now run it twice: once with             |
 |     where avisit = 'Week 4' and anl01fl = 'Y';                             |
 | and once with ANL01FL dropped from the WHERE. Compare the numbers.         |
 |                                                                            |
 | They are identical. So why write ANL01FL at all? Name two situations in a  |
 | real study where the two versions WOULD differ, and decide whether you     |
 | would still include the flag in a study where it currently changes         |
 | nothing.                                                                   |
 *------------------------------------------------------------------------- */



/* EXERCISE 5 (stretch) ---------------------------------------------------- *
 | Pick any number your tables produce. Write the full traceability chain     |
 | from that number back to a page of the CRF - naming the ADaM variable,     |
 | the ADaM dataset, the SDTM variable, the SDTM domain, and the CRF form.    |
 | Then say which artifact in the submission documents each link.             |
 *------------------------------------------------------------------------- */
