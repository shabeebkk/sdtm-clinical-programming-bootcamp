# define.xml — how to open it

| File | What it is |
|---|---|
| `define.xml` | **SDTM** define (SDTM-IG v3.3) — metadata for the 8 tabulation datasets |
| `define_adam.xml` | **ADaM** define (ADaM-IG v1.2) — metadata for ADSL, ADAE, ADVS, ADLB, ADTTE, with value-level metadata per parameter |
| `define2-0-0.xsl` | the stylesheet a browser applies to make either one readable |
| `define.html` / `define_adam.html` | **pre-rendered copies**, for convenience |

A submission carries **both**: SDTM define for the tabulation datasets, ADaM define for the
analysis datasets. The ADaM one additionally describes, for each `PARAMCD`, what `AVAL` means and
how it was derived — the value-level metadata a reviewer needs to read one parameter without
reading the rest.

## "It opens as raw XML / a blank page"

**Chrome and Edge block XSLT over `file://`.** They treat every local file as its own
origin, so `define.xml` loading `define2-0-0.xsl` counts as a cross-origin request and is
refused. The transform never runs. This is browser security policy, not a fault in the files.

Three ways round it:

1. **Open `define.html`** — pre-rendered, works everywhere by double-click. Easiest.
2. **Serve it over HTTP**, which satisfies the same-origin rule:
   ```bash
   cd data/define
   python3 -m http.server 8000
   # then open http://localhost:8000/define.xml
   ```
3. **Use Firefox**, which still allows same-directory local XSLT.

> For teaching, hand trainees `define.html` but show them `define.xml` — the point is that the
> submitted artifact is XML, and the readable page is produced *by the browser*, not shipped.

## Regenerating

```bash
# SDTM define
python3 ../build_define_xml.py

# ADaM spec workbook, then the ADaM define, then its HTML rendering
python3 ../build_adam_spec_xlsx.py
python3 ../build_adam_define_xml.py
xsltproc define2-0-0.xsl define_adam.xml > define_adam.html
```

Each define is generated from its spec workbook — `SDTM_Mapping_Specification.xlsx` and
`ADaM_Specification.xlsx`. The spec is the single source of metadata; if the two ever disagree,
the spec wins. Both generators self-check that every dataset and variable in the spec made it
into the XML, and the ADaM one additionally checks that every value-list and where-clause
reference resolves.

⚠️ Structurally correct and self-checked, but **not schema-validated** against
`define2-0-0.xsd` — that needs Pinnacle 21.
