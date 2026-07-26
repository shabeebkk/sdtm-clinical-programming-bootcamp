# Independent review plan — Codex as external reviewer

**Purpose.** Everything in this course has been checked by harnesses *written by the same
author as the material*. That is marking your own homework. This plan uses Codex (a different
model, no memory of how any of it was built) as a genuinely independent reviewer.

**Status:** plan only — no pass has been run yet.

---

## Ground rules

These are what make the review independent rather than a rubber stamp. They apply to every
pass.

1. **Read-only.** Every session runs `sandbox: read-only`. Codex reports; it never edits the
   course. Fixes are a separate, deliberate step.
2. **No anchoring.** Codex is never told that the harnesses pass, what they check, or what
   defects were found before. Telling it "this is validated" invites confirmation. It derives
   its own conclusions cold.
3. **Adversarial framing.** Each pass asks *what is wrong*, not *summarise this*. A pass that
   returns prose about how nice the course is has failed.
4. **Every finding must be checkable.** `file:line`, what the code/text actually does, and a
   concrete input or scenario where it goes wrong. A finding I cannot verify is not a finding.
5. **"No findings" is a valid result** — and is explicitly requested, so Codex does not
   manufacture issues to look useful.
6. **Nothing is reported to the user unverified.** Codex can be confidently wrong. Every
   finding gets checked against the real files and data before it reaches a summary. Findings
   that do not survive are reported as *investigated and dismissed*, with the reason.

---

## The passes

Ordered by value: earlier passes target the failure modes that have actually bitten this
project, or that would do the most damage if wrong.

### Pass 1 — SAS execution semantics
**Why first.** This is the one defect class with a track record here: eleven bugs reached SAS
OnDemand having passed every static check, because they are runtime behaviours, not syntax.
Three of the four worst announced themselves only as `WARNING` while the run reported success.

**Scope.** All 27 `.sas` programs (8,557 lines) — bootcamp, ADaM and capstone.

**Hunt for:** `RENAME` collisions · character length fixed by first assignment or set after
`MERGE` · numeric reads that drop significant figures · `SUBSTR` into a too-short target ·
columns that survive into a domain because they were never dropped · missing values
propagating through arithmetic or comparisons · `PROC SORT NODUPKEY` silently discarding rows ·
`BY`-group logic assuming an order that is not guaranteed · macro variable resolution and
quoting · anything that produces a wrong answer while the log says success.

**Deliverable.** Per finding: file:line, what SAS actually does at runtime, the input that
exposes it, and whether the log would warn or stay silent.

---

### Pass 2 — Derivations, re-derived from the spec
**Why.** Catches divergence between what the specification *says* and what the code *does* —
invisible to any check that reads only one of them.

**Method.** Codex is given the raw CSVs, the built SDTM/ADaM CSVs, and the mapping
specification — **but not the SAS code**. It independently derives the values from the spec and
compares against what shipped. It cannot copy logic it has not seen.

**Cover:** `USUBJID` · every `--DY` (including the no-Day-0 rule and pre-dose negatives) ·
`--SEQ` ordering and contiguity · `--BLFL` · `LBNRIND` against reference ranges · `AETRTEM` ·
and on the ADaM side `ABLFL`, `BASE`, `CHG`, `PCHG`, `BMI`, `TRTEMFL`, `AVAL`/`AVALC`,
`ADTTE` event-vs-censor and time-to-event.

**Deliverable.** Any value where an independent derivation from the spec disagrees with the
shipped data — or where the spec is too ambiguous to derive from at all. The second kind
matters as much as the first.

---

### Pass 3 — Is anything taught *wrong*?
**Why this is the highest-stakes pass.** A code bug costs an afternoon. Teaching a fresher
something false about CDISC sends them into a real job carrying it. This is the failure mode
with the longest half-life.

**Scope.** 19 walkthroughs, 20 answer keys, 18 deck builders, and the curriculum documents
(~13,000 lines of prose and slide copy).

**Check:** claims about SDTMIG v3.3 and the ADaM IG that are wrong or overstated · variable
core designations (Req/Exp/Perm) · which variables legitimately belong to a domain versus
SUPPQUAL · misuse of CDISC terms (*domain* vs *dataset*, *codelist* vs *format*, *origin*
values) · anywhere the course states as a rule something that is really a sponsor convention ·
oversimplifications that will have to be unlearned · claims about what a regulator requires.

**Deliverable.** Quote the claim, cite where it appears, state what is actually correct, and
say whether it is *wrong* or merely *incomplete* — those warrant different fixes.

---

### Pass 3b — Presentations: every sentence, and the design
**Why separate.** The decks are what a room full of trainees actually looks at. They are also
the only artifact where *design* carries meaning — a slide can be factually correct and still
fail because the hierarchy is wrong or the text does not fit.

**Method.** `.pptx` is binary, so every slide is extracted to text first, with each run's
**position, size, font and colour** alongside its words (`ALL_DECK_CONTENT.txt`, 3,923 lines,
18 decks, 166 slides). Codex reviews copy and design together, against the builder sources.

**Copy — every sentence:** factual errors · claims that overstate what CDISC requires ·
inconsistent terminology between decks · typos, grammar, mangled characters · headline/body
mismatch · bullets that do not parallel · jargon used before it is defined · anything a
trainee could screenshot and be wrong in public with.

**Design:** text that overflows its box or collides at the stated geometry · type scale used
consistently (is 14pt always the same role?) · colour used semantically or decoratively — and
whether the palette holds meaning across decks · contrast of every text colour against its
ground · slides carrying too much at once · alignment and margin discipline against the stated
13.33×7.5in canvas · whether the visual hierarchy matches the information hierarchy.

---

### Pass 4 — Capstone integrity
**Why.** The capstone is the assessment. If it is unsolvable, unfair, or its answer key is
wrong, it fails exactly when a trainee is most invested.

**Check:** is the skeleton solvable using only what the course has already taught, by that
point in the sequence? · are all four traps fairly signposted in `def01_data_dictionary.md`
and `README_capstone.md` (the design is that trainees *are* told them — the work is the
implementation) · does the solution actually produce the reference datasets · is the answer key
correct and complete · does `verify_capstone.sas` catch a trainee who mishandles each trap, and
does it ever pass something wrong · are the stated row counts right.

---

### Pass 5 — Submission artifacts
**Why.** These are the artifacts a trainee will point at in an interview. They are also the
part never checked by a real validator — Pinnacle 21 is not available here, and the course says
so honestly.

**Check:** `define.xml` and `define_adam.xml` against Define-XML v2.0 structure — element
nesting, required attributes, OID referential integrity, `def:Origin` values, codelist and
method wiring · does every declared variable exist in the data, and every data variable get
declared · the aCRF annotations against the actual SDTM targets · the cSDRG against its
PHUSE-template purpose · whether the XPT export honours the v5 constraints the course teaches
(8-character names, 200-byte character limits, label lengths).

---

### Pass 6 — Consistency across media
**Why.** The same fact is stated in a deck, a walkthrough, an answer key, a spec and the data.
Five copies drift. Harnesses check some pairs; nothing checks all of them.

**Check:** row counts, variable counts, dates, subject IDs and derivation rules stated in slide
copy versus notebooks versus answer keys versus specs versus the CSVs · filenames and paths
referenced in instructions that do not exist · `CONTENTS.md` and the READMEs against the actual
tree · any instruction that would not work if followed literally by someone on a clean machine.

---

### Pass 7 — Sequencing and pedagogy
**Why.** Correct material in the wrong order still fails the learner.

**Check:** anything used before it is taught (a function, a concept, a variable) · exercises
that need knowledge not yet given · the difficulty curve, especially the step into the capstone
· whether stated learning objectives are actually met by the material that follows them ·
where a fresher with mixed clinical/coding background would most likely get stuck and give up.

---

## Mechanics

| Setting | Value |
|---|---|
| `sandbox` | `read-only` — every pass, no exceptions |
| `cwd` | the Bootcamp root |
| `approval-policy` | `never` (nothing to approve in a read-only review) |
| threading | one `codex` call per pass; `codex-reply` to drill into a specific finding |

**Excluded from review:** `video/` (10,369 files, almost all `node_modules`) and any
`node_modules`. Not course material.

**Requested output shape**, so findings can be triaged and verified rather than read as an
essay:

```
SEVERITY   critical | major | minor | nit
WHERE      path/to/file.sas:123
CLAIM      one sentence: what is wrong
EVIDENCE   what the code or text actually does
FAILURE    the concrete input or scenario where it goes wrong
CONFIDENCE high | medium | low
```

---

## After the passes

1. **Verify every finding** against the real files and data. Codex is independent, not
   infallible; an authoritative-sounding claim about SAS behaviour still has to be checked.
2. **Triage into:** confirmed defects · differences of convention (not wrong, worth a note) ·
   false positives, recorded with why they were dismissed.
3. **Report all three categories.** The dismissed ones show the review was read critically
   rather than relayed.
4. **Fix confirmed defects**, each with a regression check where the defect class allows it —
   the standing rule on this project is that every new check gets fault-tested by reintroducing
   the bug it targets.

---

## Suggested order

Passes 1–3 carry most of the value: the defect class that has actually escaped before, the
spec-versus-code gap, and the risk of teaching something false. Passes 4–7 are worth running,
but if the review is trimmed for cost, trim from the bottom.

This plan is reusable — the same seven passes apply to the ADaM course when it is built.
