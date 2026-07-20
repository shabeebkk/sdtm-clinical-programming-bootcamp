/*===========================================================================*
 |  NOTEBOOK 05 (SAS)  -  BUILD THE AE DOMAIN                                 |
 |  Clinical Programming Bootcamp  -  Module: Interventions & Events          |
 |---------------------------------------------------------------------------|
 |  GOAL: turn ae_raw.csv into a compliant SDTM AE dataset.                   |
 |  AE is an EVENTS domain: MANY rows per subject, so for the first time you  |
 |  must derive --SEQ and --DY.                                               |
 |                                                                            |
 |  This is the hardest domain in the bootcamp. You will:                     |
 |     1. convert MIXED date formats in ONE column to ISO 8601                |
 |     2. apply Controlled Terminology to AESEV, AESER, AEREL                 |
 |     3. DECODE the AEOUT number (1-5) into its CT term                      |
 |     4. attach the illustrative dictionary term AEDECOD                     |
 |     5. derive AESEQ  (per subject)                                         |
 |     6. derive AESTDY / AEENDY from RFSTDTC                                 |
 |     7. leave ongoing events NULL - and prove you did                       |
 |     8. build SUPPAE with the AETRTEM treatment-emergent flag               |
 |                                                                            |
 |  Spec       : ../../data/mapping_specification.md   (section 4)            |
 |  Target     : ../../data/sdtm/ae.csv  +  sdtm/suppae.csv                  |
 |  ATTEMPT IT FIRST, then compare against the target.                        |
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

    /*  Create the output folder if it is missing. DCREATE takes the new
        folder's NAME and its PARENT separately, so we split the path.    */
    %if %sysfunc(fileexist(&outpath)) = 0 %then %do;
        %local nm pa rc;
        %let nm = %scan(&outpath, -1, %str(/));
        %let pa = %substr(&outpath, 1, %eval(%length(&outpath) - %length(&nm) - 1));
        %let rc = %sysfunc(dcreate(&nm, &pa));
    %end;

    /*  Assign SDTM only if it is not already assigned, so running 00_setup.sas
        first always wins over this fallback.                              */
    %if %sysfunc(libref(sdtm)) ne 0 %then %do;
        libname sdtm "&outpath";
    %end;

    %put NOTE: datapath = &datapath;
    %put NOTE: outpath  = &outpath   (libref SDTM);
%mend;
%_setpath;


/*---------------------------------------------------------------------------*
 | 0. READ THE RAW DATA                                                       |
 |    Note the date fields are $12: "10-Mar-2024" is 11 characters and we     |
 |    leave a little headroom. Read every date as CHARACTER - we convert      |
 |    them ourselves in step 2.                                               |
 *---------------------------------------------------------------------------*/
data ae_raw;
    infile "&datapath/ae_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 aeterm $60 aestdt $12 aeendt $12
           aesev $12 aeser $5 aerel $25 aeout $2;
    input studyid $ siteid $ subjid $ aeterm $ aestdt $ aeendt $
          aesev $ aeser $ aerel $ aeout $;
run;

/* AE needs RFSTDTC (first dose) to compute study day. It lives in DM, which
   got it from EX - so we read EX and derive it the same way Notebook 04 did. */
data ex_raw;
    infile "&datapath/ex_raw.csv" dsd firstobs = 2 truncover;
    length studyid $10 siteid $3 subjid $5 extrt $20 exdose 8 exdosu $10
           exfreq $10 exroute $15 exstdtc $11 exendtc $11 exintp $1;
    input studyid $ siteid $ subjid $ extrt $ exdose exdosu $ exfreq $
          exroute $ exstdtc $ exendtc $ exintp $;
run;

proc sql;
    create table ref_dates as
    select siteid,
           subjid,
           /* EX dates are DD-MMM-YYYY (11 chars) -> date11., NOT date9.  */
           min(input(exstdtc, date11.)) as rfstdtc_n     /* keep as a SAS date */
    from ex_raw
    group by siteid, subjid;
quit;


/*---------------------------------------------------------------------------*
 | 1. A REUSABLE DATE PARSER  (the hard part of this notebook)                |
 |    ONE raw column contains TWO different formats:                          |
 |        15/03/2024   DD/MM/YYYY   -> ddmmyy10.                              |
 |        10-Mar-2024  DD-Mon-YYYY  -> date11.                                |
 |    So we must look at each VALUE and pick the right informat.              |
 |                                                                            |
 |    Why not the ANYDTDTE informat, which auto-detects?                      |
 |    Because 15/03/2024 is AMBIGUOUS - is it 15 March or month 15? ANYDTDTE  |
 |    resolves that using the DATESTYLE system option, so the same program    |
 |    could give different answers on a differently-configured machine.       |
 |    Being explicit is safer and self-documenting.                           |
 *---------------------------------------------------------------------------*/
%macro parse_raw_date(src, out);
    /* returns a SAS date number, or missing when src is blank */
    if missing(&src) then &out = .;
    else if index(&src, "/") then &out = input(&src, ddmmyy10.);
    else                          &out = input(&src, date11.);
%mend;


/*---------------------------------------------------------------------------*
 | 2. BUILD AE                                                                |
 *---------------------------------------------------------------------------*/
proc sort data = ae_raw;    by siteid subjid; run;
proc sort data = ref_dates; by siteid subjid; run;

data ae_work;
    merge ae_raw (in = a) ref_dates;
    by siteid subjid;
    if a;

    length usubjid $20 domain $2 aedecod $60 aesev_c $12 aeser_c $1
           aerel_c $25 aeout_c $30 aestdtc $10 aeendtc $10;
    domain = "AE";

    /* --- 2a. identifiers ------------------------------------------------ */
    usubjid = catx("-", studyid, siteid, subjid);

    /* --- 2b. dates: parse the raw value, then FORMAT to ISO 8601 --------- */
    %parse_raw_date(aestdt, _stdt)
    %parse_raw_date(aeendt, _endt)
    if not missing(_stdt) then aestdtc = put(_stdt, yymmdd10.);
    /* an ongoing event has no end date - aeendtc stays blank */
    if not missing(_endt) then aeendtc = put(_endt, yymmdd10.);

    /* --- 2c. study day -------------------------------------------------- */
    /*   on/after first dose -> diff + 1 ;  before -> diff.  THERE IS NO DAY 0 */
    if not missing(_stdt) and not missing(rfstdtc_n) then do;
        if _stdt >= rfstdtc_n then aestdy = _stdt - rfstdtc_n + 1;
        else                       aestdy = _stdt - rfstdtc_n;
    end;
    if not missing(_endt) and not missing(rfstdtc_n) then do;
        if _endt >= rfstdtc_n then aeendy = _endt - rfstdtc_n + 1;
        else                       aeendy = _endt - rfstdtc_n;
    end;

    /* --- 2d. Controlled Terminology ------------------------------------- */
    /* severity: free text, inconsistent case                               */
    aesev_c = upcase(strip(aesev));

    /* seriousness: "No" and "N" both appear                                */
    if      upcase(strip(aeser)) in ("Y", "YES") then aeser_c = "Y";
    else if upcase(strip(aeser)) in ("N", "NO")  then aeser_c = "N";

    /* relationship: sponsor-defined codelist, just normalise the case      */
    aerel_c = upcase(strip(aerel));

    /* outcome: the CRF stores a NUMBER - decode it, never pass it through  */
    select (strip(aeout));
        when ("1") aeout_c = "RECOVERED/RESOLVED";
        when ("2") aeout_c = "RECOVERING/RESOLVING";
        when ("3") aeout_c = "NOT RECOVERED/NOT RESOLVED";
        when ("4") aeout_c = "FATAL";
        when ("5") aeout_c = "UNKNOWN";
        otherwise  aeout_c = "";        /* unexpected code -> leave blank and investigate */
    end;

    /* --- 2e. dictionary term -------------------------------------------- */
    /* ILLUSTRATIVE ONLY. Real AEDECOD comes from MedDRA coding by trained   */
    /* coders against a licensed dictionary - it is NOT derivable in code.   */
    select (strip(aeterm));
        when ("bad headache")           aedecod = "Headache";
        when ("Headache")               aedecod = "Headache";
        when ("Nausea")                 aedecod = "Nausea";
        when ("mild dizziness")         aedecod = "Dizziness";
        /* verbatim and coded term share NO words - the clearest proof that
           AEDECOD cannot be derived by string manipulation. A coder looked
           this up in MedDRA; a program never could.                        */
        when ("sore throat")            aedecod = "Oropharyngeal pain";
        when ("worsening hypertension") aedecod = "Hypertension";
        when ("fatigue")                aedecod = "Fatigue";
        when ("insomnia")               aedecod = "Insomnia";
        when ("vomiting")               aedecod = "Vomiting";
        when ("rash on both arms")      aedecod = "Rash";
        otherwise                       aedecod = "";
    end;

run;

/*---------------------------------------------------------------------------*
 | 3. DERIVE AESEQ                                                            |
 |    Sequential 1,2,3... WITHIN each subject, restarting for the next one.   |
 |    Sort DETERMINISTICALLY (date then term) so re-running gives the same    |
 |    numbers - otherwise your output differs run to run for no good reason.  |
 *---------------------------------------------------------------------------*/
proc sort data = ae_work;
    by usubjid aestdtc aeterm;
run;

data ae;
    set ae_work;
    by usubjid;
    retain aeseq;
    if first.usubjid then aeseq = 1;   /* restart for each subject */
    else                  aeseq + 1;

    /*  The RAW versions MUST be dropped, or the rename silently fails.
        SAS applies DROP first (using the original names), then RENAME - so
        dropping AESEV and renaming AESEV_C to AESEV in the same step is
        legal and is the standard idiom.

        Leave the raw ones in and SAS writes only:
            WARNING: Variable aesev_c cannot be renamed to aesev because
                     aesev already exists.
        ...then carries on. You get a dataset that still holds the RAW
        values ("moderate", "No", "1") in AESEV/AESER/AEOUT plus four extra
        _c columns - so the controlled terminology you carefully derived
        never reaches the domain. A WARNING, not an ERROR, and the program
        "succeeds". Read your log.                                        */
    drop aesev aeser aerel aeout                    /* the raw values */
         aestdt aeendt _stdt _endt rfstdtc_n siteid subjid;
    rename aesev_c = aesev  aeser_c = aeser  aerel_c = aerel  aeout_c = aeout;
run;

/* variable order per the SDTMIG */
data ae;
    retain studyid domain usubjid aeseq aeterm aedecod aesev aeser aerel aeout
           aestdtc aeendtc aestdy aeendy;
    set ae;
run;

proc print data = ae noobs;
    var usubjid aeseq aeterm aedecod aesev aeser aeout aestdtc aeendtc aestdy;
    title "SDTM AE - built from raw";
run;


/*---------------------------------------------------------------------------*
 | 4. SUPPAE - SUPPLEMENTAL QUALIFIERS                                        |
 |    You may NEVER add a non-standard column to a standard domain. AETRTEM   |
 |    (Treatment Emergent Flag) is not an SDTM AE variable, so it goes into a |
 |    SUPP-- dataset with this fixed, generic shape:                          |
 |        RDOMAIN  the related domain            "AE"                        |
 |        IDVAR    how we point at the parent    "AESEQ"                     |
 |        IDVARVAL that variable's value                                     |
 |        QNAM / QLABEL / QVAL   the qualifier's name, label and value        |
 |                                                                            |
 |    An AE is TREATMENT-EMERGENT if it started on or after the first dose.   |
 |    AESTDY already encodes that: >= 1 means on/after Day 1 (no Day 0).      |
 *---------------------------------------------------------------------------*/
data suppae;
    set ae;
    length studyid $10 rdomain $2 usubjid $20 idvar $8 idvarval $8
           qnam $8 qlabel $40 qval $20 qorig $10 qeval $20;

    rdomain  = "AE";
    idvar    = "AESEQ";
    idvarval = strip(put(aeseq, 8.));
    qnam     = "AETRTEM";
    qlabel   = "Treatment Emergent Flag";
    qval     = ifc(not missing(aestdy) and aestdy >= 1, "Y", "N");
    qorig    = "DERIVED";
    qeval    = "";                 /* derived, not assessed by a person */

    keep studyid rdomain usubjid idvar idvarval qnam qlabel qval qorig qeval;
run;

data suppae;
    retain studyid rdomain usubjid idvar idvarval qnam qlabel qval qorig qeval;
    set suppae;
run;

proc print data = suppae noobs;
    title "SUPPAE - supplemental qualifiers for AE";
run;

proc freq data = suppae;
    tables qval / nocum nopercent;
    title "AETRTEM distribution";
run;

/* EXPECTED: 9 x "Y" and 1 x "N".
   The single N belongs to subject ABC-01-01-002, whose "sore throat" started
   on 2024-02-28 - five days BEFORE their first dose - giving AESTDY = -5.
   That same subject also has a Day 7 event flagged Y, so ONE subject shows
   both values. Compare their two records: the flag depends on WHEN the event
   started relative to first dose, not on the event itself. */


/*---------------------------------------------------------------------------*
 | SAVE THE FINISHED DOMAIN                                                   |
 |                                                                            |
 |  Everything above lives in WORK, which SAS DELETES when the session ends.  |
 |  Real SDTM datasets are permanent: they are written to a study library,    |
 |  and later exported to XPT v5 for submission.                              |
 |                                                                            |
 |  SDTM is the libref 00_setup.sas pointed at your output folder. Writing    |
 |  "sdtm.<domain>" instead of "<domain>" is the whole difference between a   |
 |  temporary dataset and a deliverable.                                      |
 *---------------------------------------------------------------------------*/
data sdtm.ae;
    set ae;
run;

%put NOTE: AE saved to &outpath (10 rows);


/*---------------------------------------------------------------------------*
 | SAVE THE FINISHED DOMAIN                                                   |
 |                                                                            |
 |  Everything above lives in WORK, which SAS DELETES when the session ends.  |
 |  Real SDTM datasets are permanent: they are written to a study library,    |
 |  and later exported to XPT v5 for submission.                              |
 |                                                                            |
 |  SDTM is the libref 00_setup.sas pointed at your output folder. Writing    |
 |  "sdtm.<domain>" instead of "<domain>" is the whole difference between a   |
 |  temporary dataset and a deliverable.                                      |
 *---------------------------------------------------------------------------*/
data sdtm.suppae;
    set suppae;
run;

%put NOTE: SUPPAE saved to &outpath (10 rows);


/*---------------------------------------------------------------------------*
 | 5. CHECK YOUR WORK                                                         |
 *---------------------------------------------------------------------------*/
proc sql;
    title "Check 1 - 10 rows, and USUBJID+AESEQ is unique";
    select count(*) as n_rows,
           count(distinct catx("-", usubjid, put(aeseq, 8.))) as n_keys
    from ae;

    title "Check 2 - no AESTDY equal to 0 (there is no Day 0)";
    select sum(aestdy = 0) as day_zero_count from ae;

    title "Check 3 - ongoing events keep NULL end values (expect 2)";
    select usubjid, aeterm, aestdtc, aeendtc, aeendy
    from ae where missing(aeendtc);
quit;

proc freq data = ae;
    tables aesev aeser aeout aerel / nocum nopercent;
    title "Check 4 - every coded value is a CT term (no raw codes left)";
run;

proc sql;
    title "Check 5 - every SUPPAE row links to a real AE record (expect 0 orphans)";
    select count(*) as orphans from suppae s
    where not exists (select 1 from ae a
                      where a.usubjid = s.usubjid
                        and strip(put(a.aeseq, 8.)) = s.idvarval);
quit;

title;


/*===========================================================================*
 |  YOUR TURN  -  exercises                                                   |
 |  Solutions: ../../answer-keys/05_build_ae_answers.md                      |
 *===========================================================================*/

/* EXERCISE 1 -------------------------------------------------------------- *
 | How many events used each raw date format? Count how many AESTDT values    |
 | contain "/" versus how many contain a month name.                          |
 *------------------------------------------------------------------------- */



/* EXERCISE 2 -------------------------------------------------------------- *
 | Our AEOUT decode has an "otherwise" branch that silently blanks unknown    |
 | codes. That hides bad data. Write a check that lists any raw AEOUT value    |
 | that is NOT one of 1-5. It should return zero rows for this study.          |
 *------------------------------------------------------------------------- */



/* EXERCISE 3 -------------------------------------------------------------- *
 | Which subject had the most adverse events? List each subject with their    |
 | event count and their highest AESEQ - the two numbers should agree.        |
 *------------------------------------------------------------------------- */



/* EXERCISE 4 -------------------------------------------------------------- *
 | Find every SERIOUS event (AESER = "Y"). For each, report the subject, the  |
 | verbatim term, the severity and the study day it started. Then look up     |
 | that subject in sdtm/ds.csv - what happened to them?                       |
 *------------------------------------------------------------------------- */



/* EXERCISE 5 (stretch) ---------------------------------------------------- *
 | Exactly ONE event in this study has a negative AESTDY.                     |
 |                                                                            |
 | (a) Find it. Which subject, which term, and what is its AESTDY?            |
 | (b) That subject has a second event. Print BOTH of their AE records side   |
 |     by side with their SUPPAE flags. Explain in one sentence why the two   |
 |     rows get different AETRTEM values.                                     |
 | (c) Confirm no AESTDY equals 0, and say why that is guaranteed by the      |
 |     derivation rather than by luck.                                        |
 *------------------------------------------------------------------------- */



/* EXERCISE 6 (stretch) ---------------------------------------------------- *
 | Compare your AE against the reference: ../../data/sdtm/ae.csv              |
 | Import it and use PROC COMPARE to prove they match.                        |
 *------------------------------------------------------------------------- */
