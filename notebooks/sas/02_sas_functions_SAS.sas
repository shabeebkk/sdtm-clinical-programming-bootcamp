/*===========================================================================*
 |  NOTEBOOK 02 (SAS)  -  SAS FUNCTIONS: THE BASICS                           |
 |  Clinical Programming Bootcamp  -  Module: Tooling                         |
 |---------------------------------------------------------------------------|
 |  GOAL: learn the ~25 SAS functions that do almost all the work in clinical |
 |  programming. Notebook 01 taught you the SHAPE of a program (DATA step,    |
 |  PROC SORT, PROC FREQ). This notebook teaches the TOOLS you use inside it. |
 |                                                                            |
 |  NO DATA FILES NEEDED. Everything is typed into the program itself, so     |
 |  you can run this anywhere - a fresh SAS session, nothing uploaded.        |
 |  Just open it and submit.                                                  |
 |                                                                            |
 |  No prior SAS knowledge assumed beyond Notebook 01. Read the comments top  |
 |  to bottom, run each section, and look at the output as you go.            |
 |                                                                            |
 |  WHAT IS A FUNCTION?                                                       |
 |  A function takes something IN and hands something back OUT:               |
 |                                                                            |
 |         upcase( "mild" )   ---->   "MILD"                                  |
 |         ^^^^^^   ^^^^^^             ^^^^^^                                 |
 |         name     argument           result                                 |
 |                                                                            |
 |  You use the result: assign it to a variable, or test it in an IF.         |
 |  A function NEVER changes its argument - it returns a new value.           |
 |                                                                            |
 |  Next: 03_import_raw_data_SAS.sas                                          |
 *===========================================================================*/


/*---------------------------------------------------------------------------*
 | 0. A LITTLE DATA TO PLAY WITH                                              |
 |    DATALINES puts the data right inside the program. The values are        |
 |    deliberately messy - that is what real collected data looks like.       |
 *---------------------------------------------------------------------------*/
data demo;
    length subjid $5 name $20 sev $10 dose_c $6 visit_dt $11;
    input subjid $ name $ sev $ dose_c $ visit_dt $;
    datalines;
001 John_Smith mild 50 01-MAR-2024
002 Ana_Lopez MODERATE 100 04-MAR-2024
003 Wei_Chen Severe 75 11-MAR-2024
;
run;

proc print data = demo noobs;
    title "The data we will use (note the messy severity values)";
run;
title;


/*---------------------------------------------------------------------------*
 | 1. CHARACTER FUNCTIONS - CLEANING UP TEXT                                  |
 |                                                                            |
 |  Collected text is never tidy: stray spaces, inconsistent capitals.        |
 |  These are the functions that fix it.                                      |
 *---------------------------------------------------------------------------*/
data char_demo;
    /*  output_note MUST be declared. A character variable created by an
        assignment takes its length from the FIRST value assigned - here 19
        characters - and every longer label after that is silently chopped.
        This is one of the most common beginner bugs in SAS, and it never
        raises an error.                                                    */
    length messy $20 result $30 output_note $30;
    messy = "  mild  ";          /* leading AND trailing spaces */

    /* --- 1a. removing spaces ------------------------------------------- */
    result = strip(messy);       /* "mild"   - both ends. USE THIS ONE.   */
    output_note = "strip  -> both ends"; output;

    result = trim(messy);        /* "  mild" - trailing only              */
    output_note = "trim   -> trailing only"; output;

    result = left(messy);        /* "mild  " - shifts left                */
    output_note = "left   -> leading only"; output;

    result = compress(messy);    /* "mild"   - removes ALL spaces, even   */
    output_note = "compress -> ALL spaces";   /*   ones in the middle     */
    output;
    keep messy result output_note;
run;

proc print data = char_demo noobs;
    title "1a. STRIP vs TRIM vs LEFT vs COMPRESS";
run;

/* --- 1b. changing case ------------------------------------------------- */
/*  SDTM controlled terminology is almost always UPPER CASE, so UPCASE is
    the one you will reach for constantly.                                  */
data case_demo;
    length word $12 up $12 low $12 prop $12;
    word = "moDeRate";
    up   = upcase(word);         /* MODERATE */
    low  = lowcase(word);        /* moderate */
    prop = propcase(word);       /* Moderate  (first letter of each word)  */
run;

proc print data = case_demo noobs;
    title "1b. UPCASE / LOWCASE / PROPCASE";
run;

/* --- 1c. pulling pieces out of text ------------------------------------ */
data pieces;
    length full $20 first4 $4 firstname $10 lastname $10;
    full = "John_Smith";

    /*  SUBSTR(text, start, how_many)  - by POSITION
        Positions start at 1, not 0.                                       */
    first4 = substr(full, 1, 4);          /* "John" - chars 1 to 4.
                                             Declare it $4: a shorter LENGTH
                                             would quietly truncate it.     */

    /*  SCAN(text, n, delimiter)  - by WORD
        Much safer than SUBSTR when the pieces vary in length.             */
    firstname = scan(full, 1, "_");       /* "John"  */
    lastname  = scan(full, 2, "_");       /* "Smith" */

    /*  INDEX(haystack, needle) - WHERE does it appear? 0 = not found.     */
    underscore_at = index(full, "_");     /* 5 */
    has_z         = index(full, "z");     /* 0 - not found */
run;

proc print data = pieces noobs;
    title "1c. SUBSTR (by position) / SCAN (by word) / INDEX (find it)";
run;

/* --- 1d. sticking text together ---------------------------------------- */
/*  CATX is the one you want: it strips each piece and puts a separator
    between them. This is exactly how USUBJID is built in real SDTM work.  */
data joining;
    length studyid $10 siteid $3 subjid $5 usubjid $20 squashed $20;
    studyid = "ABC-01"; siteid = "01"; subjid = "001";

    usubjid  = catx("-", studyid, siteid, subjid);   /* ABC-01-01-001      */
    squashed = cats(studyid, siteid, subjid);        /* ABC-0101001        */
    /*  CATX = separator between, spaces stripped
        CATS = no separator,      spaces stripped
        CAT  = no separator,      spaces KEPT (rarely what you want)       */
run;

proc print data = joining noobs;
    title "1d. CATX / CATS - joining text";
run;

/* --- 1e. how long is it? ----------------------------------------------- */
data lengths;
    length word $10;
    word = "mild";
    n_chars   = length(word);      /* 4 - trailing blanks ignored          */
    blank     = "";
    n_blank   = length(blank);     /* 1  <- SURPRISE! LENGTH never returns 0 */
    n_blank_n = lengthn(blank);    /* 0  <- LENGTHN does. Use it for tests */
run;

proc print data = lengths noobs;
    title "1e. LENGTH vs LENGTHN (watch the blank!)";
run;
title;


/*---------------------------------------------------------------------------*
 | 2. NUMERIC FUNCTIONS                                                       |
 *---------------------------------------------------------------------------*/
data numbers;
    x = 3.14159;
    y = -7;

    rounded1 = round(x, 0.01);   /* 3.14  - to 2 decimal places            */
    rounded2 = round(x);         /* 3     - to a whole number              */
    chopped  = int(x);           /* 3     - just throws away the decimals  */
    positive = abs(y);           /* 7                                      */

    /*  These take a LIST and ignore missing values - very handy.          */
    smallest = min(5, 2, 9);     /* 2  */
    largest  = max(5, 2, 9);     /* 9  */
    total    = sum(5, 2, 9);     /* 16 */
    average  = mean(5, 2, 9);    /* 5.33... */
run;

proc print data = numbers noobs;
    title "2. ROUND / INT / ABS / MIN / MAX / SUM / MEAN";
run;

/*  WHY SUM() INSTEAD OF + ?
    Because "+" gives up if ANY value is missing, but SUM() ignores it.
    In clinical data missing values are everywhere, so this matters.       */
data why_sum;
    a = 10; b = .; c = 5;        /* "." is how SAS writes a missing number */
    with_plus = a + b + c;       /* .  <- one missing poisons the whole sum */
    with_sum  = sum(a, b, c);    /* 15 <- ignores the missing              */
run;

proc print data = why_sum noobs;
    title "2b. Why SUM(a,b,c) beats a + b + c";
run;
title;


/*---------------------------------------------------------------------------*
 | 3. DATE FUNCTIONS                                                          |
 |                                                                            |
 |  THE KEY IDEA: to SAS a date is just a NUMBER - how many days since        |
 |  1 January 1960. So 01JAN1960 = 0, 02JAN1960 = 1, and today is around      |
 |  24,000. That is why you can subtract two dates to get days between.       |
 |  A FORMAT is what makes that number readable.                              |
 *---------------------------------------------------------------------------*/
data dates;
    /*  '01MAR2024'd is a DATE LITERAL - the d tells SAS it is a date.     */
    start = "01MAR2024"d;
    end   = "28MAR2024"d;

    days_between = end - start;          /* 27 - dates are numbers!        */

    /*  Pull pieces out of a date                                          */
    yr  = year(start);                   /* 2024 */
    mth = month(start);                  /* 3    */
    dy  = day(start);                    /* 1    */

    /*  Build a date from pieces: MDY(month, day, year)                    */
    built = mdy(12, 25, 2024);           /* Christmas 2024                 */

    /*  INTCK counts INTERVALS between two dates.
        The "C" means CONTINUOUS - count completed intervals, which is how
        you calculate a person's AGE correctly.                            */
    birth   = "14MAY1969"d;
    consent = "20FEB2024"d;
    age     = intck("year", birth, consent, "C");   /* 54 - birthday not yet reached */

    /*  INTNX moves a date by whole intervals. "end" = end of that period. */
    month_end = intnx("month", start, 0, "end");    /* 31MAR2024           */

    format start end built birth consent month_end date9.;
run;

proc print data = dates noobs;
    title "3. Dates are numbers: subtract them, split them, shift them";
run;
title;


/*---------------------------------------------------------------------------*
 | 4. CONVERSION: INPUT AND PUT                                               |
 |                                                                            |
 |  THE MOST CONFUSED PAIR IN SAS. Learn them once, properly:                 |
 |                                                                            |
 |      INPUT( character, informat )  ->  NUMBER      "read INto a number"    |
 |      PUT  ( number,    format   )  ->  CHARACTER   "PUT it out as text"    |
 |                                                                            |
 |  Remember the direction by the shape of the word:                          |
 |      INPUT  takes text IN  and gives you a number                          |
 |      PUT    PUTs a number OUT as text                                      |
 |                                                                            |
 |  Get them backwards and SAS will either error or silently give you         |
 |  something odd - so check the direction every single time.                 |
 *---------------------------------------------------------------------------*/
data conversion;
    length dose_text $6 iso_date $10;

    /* --- text -> number, so you can do arithmetic --------------------- */
    dose_text = "50";
    dose_num  = input(dose_text, best.);    /* 50 as a NUMBER  */
    double    = dose_num * 2;               /* 100 - works because it is numeric */

    /* --- text date -> real date --------------------------------------- */
    /*  date11. reads "01-MAR-2024". The number is the informat WIDTH -
        it must be wide enough for the whole value INCLUDING the dashes.  */
    raw_date  = "01-MAR-2024";
    real_date = input(raw_date, date11.);   /* a real SAS date number      */

    /* --- number -> text, in the format you want ------------------------ */
    /*  yymmdd10. writes 2024-03-01 - which is the ISO 8601 layout every
        SDTM date variable uses.                                           */
    iso_date  = put(real_date, yymmdd10.);  /* "2024-03-01" as TEXT        */

    format real_date date9.;
run;

proc print data = conversion noobs;
    var dose_text dose_num double raw_date real_date iso_date;
    title "4. INPUT (text->number) and PUT (number->text)";
run;
title;


/*---------------------------------------------------------------------------*
 | 5. MISSING VALUES                                                          |
 |                                                                            |
 |  Clinical data is full of gaps. SAS writes a missing NUMBER as "." and a   |
 |  missing TEXT value as "" (nothing at all).                                |
 *---------------------------------------------------------------------------*/
data missings;
    length txt $10 note $40;

    num = .;  txt = "";
    /*  MISSING() works for BOTH types, which is why it is the safe test.  */
    num_is_missing = missing(num);     /* 1 = true  */
    txt_is_missing = missing(txt);     /* 1 = true  */

    /*  COALESCE returns the first value that is NOT missing.
        COALESCE  = numbers,  COALESCEC = character. Note the trailing C.  */
    first_num  = coalesce(., ., 7);          /* 7      */
    note       = coalescec("", "fallback");  /* fallback */
run;

proc print data = missings noobs;
    title "5. MISSING() / COALESCE / COALESCEC";
run;

/*  THE TRAP: a missing number is SMALLER than every real number.
    So "where age < 18" quietly picks up subjects whose age is MISSING.
    Always exclude missing explicitly.                                      */
data missing_trap;
    input age @@;
    too_young_wrong = (age < 18);                       /* counts missing!  */
    too_young_right = (not missing(age) and age < 18);  /* correct          */
    datalines;
25 . 12
;
run;

proc print data = missing_trap noobs;
    title "5b. THE TRAP: missing sorts BELOW every real number";
run;
title;


/*---------------------------------------------------------------------------*
 | 6. PUTTING IT TOGETHER                                                     |
 |    Clean the messy demo data from section 0 using what you just learned.   |
 *---------------------------------------------------------------------------*/
data cleaned;
    set demo;
    length usubjid $20 sev_ct $10 firstname $10 iso_dt $10;

    usubjid   = catx("-", "ABC-01", "01", subjid);   /* 1d */
    sev_ct    = upcase(strip(sev));                  /* 1a + 1b */
    firstname = scan(name, 1, "_");                  /* 1c */
    dose      = input(dose_c, best.);                /* 4  */
    iso_dt    = put(input(visit_dt, date11.), yymmdd10.);  /* 4, both ways */

    keep usubjid firstname sev_ct dose iso_dt;
run;

proc print data = cleaned noobs;
    title "6. The same data, cleaned - every column made by a function";
run;
title;

/*  Look at what just happened. Those five lines are, in miniature, exactly
    what the rest of this bootcamp does: build USUBJID, normalise text to
    controlled terminology, convert collected dates to ISO 8601. The domains
    are bigger, but the tools are these.                                    */


/*===========================================================================*
 |  YOUR TURN  -  exercises                                                   |
 |  Write your code below each task, then run it.                             |
 |  Solutions: ../../answer-keys/02_functions_answers.md                     |
 *===========================================================================*/

/* EXERCISE 1 -------------------------------------------------------------- *
 | The value "  Severe  " has spaces on both sides and inconsistent case.     |
 | Write ONE line that turns it into "SEVERE".                               |
 *------------------------------------------------------------------------- */



/* EXERCISE 2 -------------------------------------------------------------- *
 | From "Wei_Chen", extract the LAST name using SCAN.                        |
 | Then extract it again using SUBSTR + INDEX. Which is safer, and why?      |
 *------------------------------------------------------------------------- */



/* EXERCISE 3 -------------------------------------------------------------- *
 | A subject was born 02FEB1990 and consented 01FEB2024.                     |
 | (a) What does intck("year", birth, consent, "C") return?                  |
 | (b) What would it return if they consented one day later, on 02FEB2024?   |
 | Explain the difference in one sentence.                                   |
 *------------------------------------------------------------------------- */



/* EXERCISE 4 -------------------------------------------------------------- *
 | Convert the text "15-JUN-2024" into the ISO 8601 text "2024-06-15".       |
 | You will need BOTH INPUT and PUT. Which comes first, and why?             |
 *------------------------------------------------------------------------- */



/* EXERCISE 5 (stretch) ---------------------------------------------------- *
 | These two both look reasonable but only one is right:                     |
 |      a)  if length(x) = 0 then put "x is blank";                          |
 |      b)  if missing(x)    then put "x is blank";                          |
 | Which one works? Run it on a blank value and explain what you see.        |
 *------------------------------------------------------------------------- */



/* EXERCISE 6 (stretch) ---------------------------------------------------- *
 | dose_c holds "50" as TEXT. A colleague writes:                            |
 |      total = dose_c + 10;                                                 |
 | It appears to work. Run it, then check the LOG. What did SAS do, why is   |
 | it risky, and what should they have written instead?                      |
 *------------------------------------------------------------------------- */
