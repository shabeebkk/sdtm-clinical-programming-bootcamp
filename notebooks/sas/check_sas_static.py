#!/usr/bin/env python3
"""
check_sas_static.py — static checks on the SAS notebooks.

There is no SAS interpreter in this environment, so these programs cannot be executed.
This is the next best thing: a syntax/consistency linter that catches the classes of
error that would otherwise only show up when a trainee runs the code.

It does NOT prove the programs are correct — only that they are structurally sound and
internally consistent.

STATUS: as of 2026-07-20 all notebooks HAVE been executed on SAS OnDemand for Academics
(SAS 9.04.01M8P022223, Linux x64) with ZERO errors, and all 8 domains reproduce the
reference datasets exactly. Those runs found SEVEN defects this checker could not see,
because they were SAS EXECUTION semantics rather than syntax:
  - a RENAME collision that silently kept raw values in AE  (now checked, rule 6b)
  - a LENGTH statement placed after MERGE in DM             (log-only; see note in rule 6b area)
  - VS reading results as numeric, losing precision         (design, not syntax)
  - SITEID/SUBJID leaking into LB                           (now checked, rule 6d)
  - DS was specified and referenced but NEVER BUILT          (now built in nb 04)
  - PROC FORMAT CNTLIN without TYPE="C" built NUMERIC formats
  - macro args containing "=" parsed as keyword params       (now checked, rule 6e)
Re-run the notebooks in SAS after any substantive change; this checker is a fast
pre-filter, not a substitute.

Run: python3 check_sas_static.py
Exit 0 = clean, 1 = at least one FAIL.
"""

import csv, glob, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, "..", "..", "data"))
FAILS = []


def fail(m):
    print(f"  FAIL  {m}")
    FAILS.append(m)


def ok(m):
    print(f"  PASS  {m}")


def check(cond, good, bad):
    ok(good) if cond else fail(bad)


def strip_comments(src):
    """Blank out /* */ comments, PRESERVING length so offsets stay valid."""
    def blank(m):
        return re.sub(r"\S", " ", m.group(0))
    return re.sub(r"/\*.*?\*/", blank, src, flags=re.S)


def strip_macro_quotes(text):
    """Remove %str(...) / %nrstr(...) spans, counting NESTED parentheses.

    A regex like %str\\([^)]*\\) stops at the first ')', so a quoted argument
    containing put(x, best.) is only half-removed and the leftover trips the
    bare-'=' check. Scan for the matching close paren instead.
    """
    out, i = [], 0
    while i < len(text):
        m = re.compile(r"%n?r?str\(", re.I).match(text, i)
        if not m:
            out.append(text[i])
            i += 1
            continue
        depth, j = 1, m.end()
        while j < len(text) and depth:
            if text[j] == "(":
                depth += 1
            elif text[j] == ")":
                depth -= 1
            j += 1
        i = j                      # skip the whole quoted span
    return "".join(out)


def raw_cols(name):
    with open(os.path.join(DATA, name)) as f:
        return [c.upper() for c in next(csv.reader(f))]


print("=" * 78)
print("STATIC CHECK — SAS notebooks (pre-filter; real runs happen on SAS ODA)")
print("=" * 78)

for path in sorted(glob.glob(os.path.join(HERE, "*.sas"))):
    name = os.path.basename(path)
    src = open(path).read()
    code = strip_comments(src)
    print(f"\n--- {name} ---")

    # 1. every DATA / PROC step is closed by RUN; or QUIT;
    steps = len(re.findall(r"^\s*(?:data|proc)\s", code, re.I | re.M))
    ends = len(re.findall(r"(?<![\w.])(?:run|quit)\s*;", code, re.I))
    check(ends >= steps, f"{steps} DATA/PROC steps, {ends} run;/quit; terminators",
          f"{steps} DATA/PROC steps but only {ends} run;/quit; — a step is unterminated")

    # 2. every string literal is closed.
    #    A naive "count the quotes" test is WRONG: an apostrophe inside a
    #    double-quoted string ("reviewer's guide") is perfectly legal SAS and
    #    would be flagged as an unclosed literal. Scan instead, tracking which
    #    kind of string we are inside, and report only genuinely unterminated ones.
    scan_src = re.sub(r"/\*.*?\*/", " ", src, flags=re.S)   # comments cannot hold literals
    inside, opened_line, line_no, bad = None, 0, 1, None
    for ch in scan_src:
        if ch == "\n":
            line_no += 1
        elif inside is None and ch in "\"'":
            inside, opened_line = ch, line_no
        elif inside is not None and ch == inside:
            inside = None
    if inside is not None:
        bad = (inside, opened_line)
    check(bad is None, "every string literal is closed",
          f"UNCLOSED {'double' if bad and bad[0] == chr(34) else 'single'}-quoted "
          f"string opened on line {bad[1] if bad else '?'}")

    # 3. balanced comment markers
    check(src.count("/*") == src.count("*/"),
          f"balanced /* */ comments ({src.count('/*')})",
          f"unbalanced comments: {src.count('/*')} open vs {src.count('*/')} close")

    # 4. INFILE datasets: INPUT list must match the CSV header exactly (order + count)
    for m in re.finditer(r"data\s+(\w+)\s*;(.*?)run\s*;", code, re.S | re.I):
        ds, body = m.group(1).lower(), m.group(2)
        inf = re.search(r'infile\s+"([^"]*?)"', body, re.I)
        if not inf:
            continue                       # not a file-reading step
        spec = inf.group(1)
        # The filename may be built from macro variables (e.g. "&workdir/&dom._built.csv"),
        # which only resolve at run time. There is no file on disk to check it against, so
        # skip rather than guess — and never let it look like a missing raw dataset.
        base = spec.rsplit("/", 1)[-1]
        if "&" in base or not base.lower().endswith(".csv"):
            continue
        csvname = base
        if not os.path.exists(os.path.join(DATA, csvname)):
            continue                       # not one of the study's raw files
        # INPUT *statement* = the word followed by whitespace; input( is the FUNCTION
        im = re.search(r"(?<![\w.])input\s+(?!\()(.*?);", body, re.S | re.I)
        if not im:
            fail(f"{ds}: has INFILE but no INPUT statement")
            continue
        got = [t.rstrip("$").upper() for t in im.group(1).split() if t != "$"]
        want = raw_cols(csvname)
        check(got == want, f"{ds}: INPUT matches {csvname} ({len(want)} vars)",
              f"{ds}: INPUT does not match {csvname}\n          file : {want}\n          input: {got}")
        # LENGTH must declare every variable the INPUT reads
        lm = re.search(r"\blength\b(.*?);", body, re.S | re.I)
        if lm:
            declared = {t.upper() for t in re.findall(r"(\w+)\s*\$?\s*\d*", lm.group(1)) if t.isalpha() or "_" in t}
            missing = [v for v in got if v not in declared]
            check(not missing, f"{ds}: LENGTH declares every INPUT variable",
                  f"{ds}: INPUT reads variables with no LENGTH: {missing}")

    # 5. informat WIDTH must cover the longest raw value it reads.
    #    SAS reads only <width> characters, so date9. on "14-MAY-1969" (11 chars)
    #    silently truncates to "14-MAY-19" and yields the wrong year.
    widths = {}
    for csvname in sorted(glob.glob(os.path.join(DATA, "*_raw.csv"))):
        with open(csvname) as fh:
            rdr = csv.DictReader(fh)
            for row in rdr:
                for k, v in row.items():
                    if v:
                        widths[k.lower()] = max(widths.get(k.lower(), 0), len(v))
    for m in re.finditer(r"input\(\s*(\w+)\s*,\s*([a-z]+)(\d+)\.\s*\)", code, re.I):
        var, base, w = m.group(1).lower(), m.group(2).lower(), int(m.group(3))
        need = widths.get(var)
        if need is None:
            continue
        check(w >= need,
              f"input({var}, {base}{w}.) width {w} covers the {need}-char raw value",
              f"input({var}, {base}{w}.) is TOO NARROW — raw {var} is {need} chars; "
              f"SAS reads only {w} and truncates (use {base}{need}.)")

    # 6. character variables assigned before a LENGTH statement (silent truncation risk)
    for m in re.finditer(r"data\s+\w+\s*;(.*?)run\s*;", code, re.S | re.I):
        body = m.group(1)
        lpos = body.lower().find("length")
        for am in re.finditer(r"^\s*(\w+)\s*=\s*(?:catx|cats|put|strip|upcase)\(", body, re.M | re.I):
            if lpos != -1 and am.start() < lpos:
                fail(f"'{am.group(1)}' assigned before the LENGTH statement — truncation risk")

    # 6b. RENAME onto a name that still exists in the same step.
    #     SAS only WARNS ("Variable x_c cannot be renamed to x because x already
    #     exists") and carries on, leaving the ORIGINAL value in place and the
    #     derived one stranded under its temporary name. Found in the wild in
    #     notebook 05, where all four CT-mapped AE variables silently failed to
    #     land. A warning, not an error — so the program "succeeds".
    for m in re.finditer(r"data\s+(\w+)\s*;(.*?)run\s*;", code, re.S | re.I):
        ds, body = m.group(1), m.group(2)
        # A rename STATEMENT starts a statement. `merge x (rename = (a = b))` is a
        # dataset OPTION — different thing, and matching it produced false hits on
        # the `keep =` that followed it.
        rn = re.search(r"(?:^|;)\s*rename\s+(.*?);", body, re.S | re.I | re.M)
        if not rn:
            continue
        dropped = set()
        dm_ = re.search(r"(?:^|;)\s*drop\s+(.*?);", body, re.S | re.I | re.M)
        if dm_:
            dropped = {v.lower() for v in dm_.group(1).split()}
        # The colliding variable usually arrives via SET/MERGE from a dataset built
        # earlier in the file, so it is NOT declared in this step — which is exactly
        # why a LENGTH/INPUT-based test missed the real AE bug. Instead: if the
        # rename TARGET is used anywhere else in the file, it is a live variable, and
        # renaming onto it without dropping it first is the collision.
        rename_span = rn.group(1)
        for src, tgt in re.findall(r"(\w+)\s*=\s*(\w+)", rename_span):
            t = tgt.lower()
            if t in dropped or t == src.lower():
                continue
            # count references to the target outside the rename statement itself
            elsewhere = len(re.findall(rf"(?<![\w.]){re.escape(t)}(?![\w.])", code, re.I)) \
                        - len(re.findall(rf"(?<![\w.]){re.escape(t)}(?![\w.])", rename_span, re.I))
            if elsewhere > 0:
                fail(f"{ds}: RENAME {src}={tgt} collides — {tgt.upper()} is a live variable "
                     f"and is not dropped in this step; SAS only WARNS and keeps the ORIGINAL value")

    # NOTE: a LENGTH-after-SET/MERGE check was tried here and REMOVED.
    #   SAS warns only when LENGTH targets a variable the SET/MERGE already
    #   supplied; declaring NEW variables after a MERGE is perfectly normal and
    #   is what most steps here do. Statically we cannot know the incoming
    #   columns, so the check fired on 9 innocent steps to catch 1 real one.
    #   A checker that cries wolf gets ignored, which is worse than no checker.
    #   The SAS log reports this precisely — read it after every run.

    # 6d. Join keys must not leak into the finished domain.
    #     SITEID and SUBJID are needed to build USUBJID and to join to the
    #     reference dates, but they are NOT variables of AE/CM/EX/VS/LB. Leaving
    #     them in ships two extra columns with no error and no warning — exactly
    #     what happened to LB, which was the only build notebook that neither
    #     dropped them nor used a KEEP list.
    #     DM is exempt: SITEID and SUBJID are genuine DM variables.
    m_dom = re.match(r"\d\d_build_(\w+?)_domain", name, re.I)
    if m_dom and m_dom.group(1).lower() != "dm":
        dom_up = m_dom.group(1).upper()
        for key in ("siteid", "subjid"):
            if not re.search(rf"(?<![\w.]){key}(?![\w.])", code, re.I):
                continue                        # never used, nothing to leak
            dropped_anywhere = any(
                re.search(rf"(?<![\w.]){key}(?![\w.])", mm.group(1), re.I)
                for mm in re.finditer(r"(?:^|;)\s*drop\s+(.*?);", code, re.S | re.I | re.M))
            keeps = list(re.finditer(r"(?:^|;)\s*keep\s+(.*?);", code, re.S | re.I | re.M))
            kept_out = bool(keeps) and all(
                not re.search(rf"(?<![\w.]){key}(?![\w.])", mm.group(1), re.I) for mm in keeps)
            check(dropped_anywhere or kept_out,
                  f"{dom_up}: {key.upper()} does not leak into the domain",
                  f"{dom_up}: {key.upper()} is used but never dropped and no KEEP excludes it — "
                  f"it will ship as an extra column in {dom_up}")

    # 6e. A macro ARGUMENT containing a bare "=" is parsed as a KEYWORD parameter.
    #     SAS then rejects everything after it:
    #       ERROR: All positional parameters must precede keyword parameters.
    #     Caught in the wild in notebook 12, where four %qc_check calls passed a
    #     WHERE clause like "aestdy = 0". Wrap such an argument in %str().
    #     Only flags a bare "=" that is NOT already inside %str()/%nrstr() and is
    #     not the leading "name=" of a genuine keyword argument.
    #     An argument like "aestdy = 0" LOOKS like a keyword argument, which is
    #     exactly why SAS misreads it. So compare against the macro's DECLARED
    #     parameters: a "name=" whose name is not a declared parameter is really
    #     a positional argument that needs %str().
    declared = {}
    for dm_ in re.finditer(r"%macro\s+(\w+)\s*\(([^)]*)\)", code, re.I):
        params = {p.split("=")[0].strip().lower()
                  for p in dm_.group(2).split(",") if p.strip()}
        declared[dm_.group(1).lower()] = params

    for m in re.finditer(r"^\s*%(\w+)\s*\((.*?)\)\s*;?\s*$", code, re.M | re.S):
        name, args = m.group(1).lower(), m.group(2)
        if name not in declared:
            continue                                  # not a macro defined here
        masked = strip_macro_quotes(args)             # drop %str()-quoted spans
        for arg in masked.split(","):
            a = arg.strip()
            if "=" not in a:
                continue
            kw = re.match(r"^(\w+)\s*=", a)
            if kw and kw.group(1).lower() in declared[name]:
                continue                              # a genuine keyword argument
            fail(f"%{name}(...): argument '{a[:40]}' contains a bare '=' — SAS reads it "
                 f"as a keyword parameter; wrap it in %str()")
            break

    # 7. no leftover references to variables that no longer exist
    for dead in ["completion", "eosdtc"]:
        hits = re.findall(rf"\b{dead}\b", code, re.I)
        check(not hits, f"no reference to retired variable {dead.upper()}",
              f"references retired variable {dead.upper()} ({len(hits)}x)")

print("\n" + "=" * 78)
if FAILS:
    print(f"{len(FAILS)} FAILURE(S)")
    for f_ in FAILS:
        print("  -", f_)
else:
    print("ALL STATIC CHECKS PASSED")
    print("NOTE: static checks only. The notebooks last ran clean on SAS ODA 9.4M8 with")
    print("      all 8 domains matching the reference. Re-run there after any real change.")
sys.exit(1 if FAILS else 0)
