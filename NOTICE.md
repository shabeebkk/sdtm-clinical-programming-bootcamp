# Notices and attribution

## All data is synthetic
Every dataset here — studies **ABC-01** and **DEF-01** — is fabricated for training. No real
patients, sites, investigators, sponsors or products are represented, and no real clinical data
was used to produce it. The generators (`generate_mock_data.py`, `def01_generate_mock_data.py`)
create every value from hard-coded literals; there is no source dataset behind them.

## CDISC standards
This course *teaches about* the CDISC **SDTM** and **SDTMIG v3.3** standards. All specifications,
tables and explanations here are original prose written for this course. **No CDISC copyrighted
material is redistributed.** CDISC standards documents are available from cdisc.org, and
Controlled Terminology from NCI EVS.

Core designations (Required / Expected / Permissible) and variable definitions follow SDTMIG
v3.3 as of writing. **Always verify against the Implementation Guide for a real study** — they
change between versions, and this is a teaching corpus, not a regulatory reference.

## MedDRA and WHODrug
`AEDECOD` and `CMDECOD` values in this repository are **illustrative stand-ins**, not dictionary
output. They exist only so the exercises run end to end, and every notebook says so at the point
of use.

- **MedDRA** is a registered trademark of ICH and requires a licence from the MSSO. The handful
  of preferred-term-style strings used here (e.g. *Nausea*, *Headache*, *Hypoglycaemia*) are
  ordinary medical words chosen to make a teaching point — they are not extracted from, and must
  not be treated as, the MedDRA dictionary.
- **WHODrug** is maintained by the Uppsala Monitoring Centre and likewise requires a licence.
  The drug names used are common generic names, not WHODrug extracts.

Real coding is performed by trained coders against a licensed dictionary. Nothing in this
repository substitutes for that, and the materials state this explicitly wherever coding appears.

## Other names
**SAS** is a registered trademark of SAS Institute Inc. **Pinnacle 21** is a product of Certara.
Both are referenced descriptively, for teaching about the tools trainees will encounter. This
course is not affiliated with, endorsed by, or sponsored by either.

The sample CRF is a generic EDC-style form. It deliberately carries **no vendor branding** and
does not reproduce any commercial EDC system's layout.

## Licence
No open-source licence is applied. All rights reserved by the author unless stated otherwise.
If you intend to make this public or allow reuse, add a `LICENSE` file — for teaching material,
Creative Commons (e.g. CC BY-NC-SA 4.0) is often a better fit than a software licence, or a dual
arrangement: CC for the prose and decks, MIT for the code.
