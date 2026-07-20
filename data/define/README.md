# define.xml — how to open it

| File | What it is |
|---|---|
| `define.xml` | **the real artifact** — the machine-readable metadata a regulator receives |
| `define2-0-0.xsl` | the stylesheet a browser applies to make it readable |
| `define.html` | a **pre-rendered copy**, for convenience |

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
python3 ../build_define_xml.py
```
Reads `../SDTM_Mapping_Specification.xlsx` and rewrites both `define.xml` and `define.html`.
The spec is the single source of metadata; if the two ever disagree, the spec wins.

⚠️ Structurally correct and self-checked, but **not schema-validated** against
`define2-0-0.xsd` — that needs Pinnacle 21.
