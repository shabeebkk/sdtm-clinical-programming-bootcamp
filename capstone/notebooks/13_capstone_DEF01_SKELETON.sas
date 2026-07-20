/*===========================================================================*
 |  CAPSTONE  -  STUDY DEF-01  -  YOUR WORKSPACE                              |
 |  Clinical Programming Bootcamp  -  Day 10                                  |
 |---------------------------------------------------------------------------|
 |  Map the raw DEF-01 data to SDTM, end to end, ON YOUR OWN. Build five      |
 |  domains + SUPPAE and save them to the SDTM library, then run              |
 |  verify_capstone.sas to compare your output to the reference.             |
 |                                                                            |
 |  Your ABC-01 notebooks (04-09) are the right starting point - but FOUR     |
 |  things here will break a blind copy-paste. Read the data dictionary       |
 |  (../data/def01_data_dictionary.md) before you start. The traps are:       |
 |                                                                            |
 |    TRAP 1  VS: site 02 collects WEIGHT in lb and TEMP in °F. Keep the      |
 |               collected value/unit in --ORRES/--ORRESU; CONVERT to kg/°C   |
 |               in --STRESN/--STRESU.                                        |
 |    TRAP 2  EX: subject 02/003 has TWO dosing periods (an interruption).    |
 |               Keep both records; RFSTDTC = first dose, RFENDTC = last.     |
 |    TRAP 3  AE: 02/001's screening AE is dated "FEB-2024" (no day). Keep    |
 |               the partial in AESTDTC (2024-02); AESTDY is NULL; AETRTEM=N. |
 |    TRAP 4  LB: many results are HIGH (the diabetes; plus one ALT). Derive  |
 |               LBNRIND - do NOT invent adverse events for abnormal labs.    |
 |                                                                            |
 |  The raw reads (section 0) are done for you. Everything marked  ***TODO*** |
 |  is yours to write. Aim to reproduce ../data/sdtm/ exactly.                |
 *===========================================================================*/

/*  Paths. On SAS OnDemand, edit these two to your uploaded capstone folder. */
%macro _setpath;
    %global datapath outpath;
    %if %superq(datapath) = %then
        %let datapath = /Volumes/D Drive/SDTM Training/Bootcamp/capstone/data;
    %if %superq(outpath) = %then
        %let outpath  = /Volumes/D Drive/SDTM Training/Bootcamp/capstone/output;
    %if %sysfunc(fileexist(&outpath)) = 0 %then %do;
        %local nm pa; %let nm = %scan(&outpath, -1, %str(/));
        %let pa = %substr(&outpath, 1, %eval(%length(&outpath) - %length(&nm) - 1));
        %let rc = %sysfunc(dcreate(&nm, &pa));
    %end;
    %if %sysfunc(libref(sdtm)) ne 0 %then %do; libname sdtm "&outpath"; %end;
    %put NOTE: datapath = &datapath;  %put NOTE: outpath = &outpath (libref SDTM);
%mend;
%_setpath;


/*---------------------------------------------------------------------------*
 | 0. READ THE RAW DATA  (done for you)                                       |
 *---------------------------------------------------------------------------*/
data dm_raw;
    infile "&datapath/dm_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 brthdtc $11 sex $1 race $40
           ethnic $30 country $3 arm $20 rficdtc $11 randdtc $11;
    input studyid $ siteid $ subjid $ brthdtc $ sex $ race $ ethnic $
          country $ arm $ rficdtc $ randdtc $;
run;

data ex_raw;
    infile "&datapath/ex_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 extrt $20 exdose 8 exdosu $10
           exfreq $10 exroute $15 exstdtc $11 exendtc $11 exintp $1;
    input studyid $ siteid $ subjid $ extrt $ exdose exdosu $ exfreq $
          exroute $ exstdtc $ exendtc $ exintp $;
run;

data ae_raw;
    infile "&datapath/ae_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 aeterm $60 aestdt $12 aeendt $12
           aesev $12 aeser $5 aerel $25 aeout $2;
    input studyid $ siteid $ subjid $ aeterm $ aestdt $ aeendt $
          aesev $ aeser $ aerel $ aeout $;
run;

/*  VS is read AS CHARACTER (to preserve VSORRES precision) and it carries the
    per-row collected units TEMPU and WEIGHTU - you will need them for TRAP 1. */
data vs_raw;
    infile "&datapath/vs_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 visit $20 vsdt $11
           sysbp $8 diabp $8 pulse $8 temp $8 tempu $2
           height $8 weight $8 weightu $4 vsnd $1;
    input studyid $ siteid $ subjid $ visit $ vsdt $
          sysbp $ diabp $ pulse $ temp $ tempu $ height $ weight $ weightu $ vsnd $;
run;

data lb_raw;
    infile "&datapath/lb_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 visit $20 lbdt $11 lbtest $40
           lborres $20 lborresu $12 lbornrlo $12 lbornrhi $12;
    input studyid $ siteid $ subjid $ visit $ lbdt $ lbtest $
          lborres $ lborresu $ lbornrlo $ lbornrhi $;
run;


/*---------------------------------------------------------------------------*
 | 1. REFERENCE DATES FROM EX                                                 |
 |    ***TODO*** Derive RFSTDTC (first dose) and RFENDTC (last dose) per       |
 |    subject. Remember TRAP 2: 02/003 has two EX rows, so use MIN(start)      |
 |    and MAX(end) - min()/max() handle the interruption for free.            |
 *---------------------------------------------------------------------------*/
/* ***TODO*** build ref_dates (siteid, subjid, rfst_n, rfen_n) */



/*---------------------------------------------------------------------------*
 | 2. A DATE PARSER FOR AE  (TRAP 3)                                          |
 |    ***TODO*** AE dates come in THREE forms:                                 |
 |        15/03/2024   DD/MM/YYYY   -> ddmmyy10.                              |
 |        10-Mar-2024  DD-Mon-YYYY  -> date11.                                |
 |        FEB-2024     MON-YYYY     -> PARTIAL: ISO "2024-02", study day NULL |
 |    Write a macro (or inline logic) that returns a SAS date number          |
 |    (MISSING for a partial) plus the ISO string. Do NOT impute a day.       |
 *---------------------------------------------------------------------------*/
/* ***TODO*** parse_ae_date logic */



/*---------------------------------------------------------------------------*
 | 3. BUILD DM  ->  sdtm.dm                                                    |
 |    ***TODO*** USUBJID; AGE (birth->consent, completed years, date11.);      |
 |    SEX 1/2->M/F; RACE/ETHNIC to CT; ARMCD X/P; RFSTDTC/RFENDTC/RFXSTDTC/    |
 |    RFXENDTC from EX; RFICDTC->ISO. RFPENDTC is NULL (no DS in scope).       |
 |    Watch the LENGTH-before-MERGE rule and the 11-char raw date lengths.    |
 *---------------------------------------------------------------------------*/
/* ***TODO*** data sdtm.dm; ... run; */



/*---------------------------------------------------------------------------*
 | 4. BUILD EX  ->  sdtm.ex   (TRAP 2)                                         |
 |    ***TODO*** Keep BOTH dosing periods for 02/003. EXFREQ -> EXDOSFRQ;      |
 |    EXINTP is collected but NOT submitted (drop it). Derive EXSTDY/EXENDY    |
 |    and EXSEQ (sort by start date so the periods number 1 then 2).          |
 *---------------------------------------------------------------------------*/
/* ***TODO*** data sdtm.ex; ... run; */



/*---------------------------------------------------------------------------*
 | 5. BUILD AE + SUPPAE  ->  sdtm.ae, sdtm.suppae   (TRAP 3)                   |
 |    ***TODO*** Parse the mixed/partial dates; AESTDY NULL for the partial.   |
 |    CT for AESEV/AESER/AEREL; decode AEOUT (1-5); illustrative AEDECOD.      |
 |    AESEQ per subject. Then SUPPAE with AETRTEM: Y if started on/after       |
 |    first dose, N otherwise - and for the partial, N because the whole       |
 |    month is before first dose.                                             |
 *---------------------------------------------------------------------------*/
/* ***TODO*** data sdtm.ae; ... run;   and   data sdtm.suppae; ... run; */



/*---------------------------------------------------------------------------*
 | 6. BUILD VS  ->  sdtm.vs   (TRAP 1)                                         |
 |    ***TODO*** Transpose wide->tall (SYSBP, DIABP, PULSE, TEMP, HEIGHT,      |
 |    WEIGHT). VSORRES/VSORRESU = as collected. For WEIGHT and TEMP the unit   |
 |    comes from WEIGHTU/TEMPU; CONVERT site-02 values to kg / °C in           |
 |    VSSTRESN/VSSTRESU (lb*0.45359237 ; (F-32)*5/9), rounded to 0.1. Height   |
 |    is SCREENING-only. Baseline flag and VSSEQ as in ABC-01.                |
 *---------------------------------------------------------------------------*/
/* ***TODO*** data sdtm.vs; ... run; */



/*---------------------------------------------------------------------------*
 | 7. BUILD LB  ->  sdtm.lb   (TRAP 4)                                         |
 |    ***TODO*** LBTESTCD/LBTEST from CT (HbA1c->HBA1C/Hemoglobin A1C;         |
 |    Fasting Glucose->GLUC/Glucose). LBCAT. Derive LBNRIND from the range -   |
 |    many rows are HIGH and that is correct (the diabetes). Do NOT create     |
 |    adverse events for abnormal labs. Baseline flag, LBSEQ.                  |
 *---------------------------------------------------------------------------*/
/* ***TODO*** data sdtm.lb; ... run; */



/*---------------------------------------------------------------------------*
 | 8. CHECK WHAT YOU BUILT, THEN VERIFY                                        |
 *---------------------------------------------------------------------------*/
title "CAPSTONE DEF-01 - my SDTM library";
proc sql;
    select memname as Dataset, nobs as Rows, nvar as Variables
    from dictionary.tables where libname = "SDTM" order by memname;
quit;
title;

/*  Expected row counts: DM 6, EX 7, AE 7, SUPPAE 7, VS 96, LB 32.
    When those look right, run verify_capstone.sas to compare every value
    against the reference. Aim for MATCH on all six.                        */
%put NOTE: When your six domains are built, run verify_capstone.sas.;
