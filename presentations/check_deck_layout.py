#!/usr/bin/env python3
"""
check_deck_layout.py — geometry checks on the built .pptx decks.

Catches the two layout faults that a human only notices by staring at every slide:

  1. HIDDEN TEXT — a text box that a LATER shape with a solid fill paints over.
     In PowerPoint, shapes render in document order, so a filled card drawn after
     a text box covers it completely. The text is still in the file (and in the
     speaker notes, and in any text extraction), so nothing looks wrong except
     the rendered slide. Deck 05 slide 8 shipped with its ARM row invisible this
     way, and deck 06 had a similar collision.

  2. OFF-SLIDE — a shape extending past the 13.33 x 7.5in canvas, which is
     silently clipped when rendered.

Reads the OOXML directly, so it checks the SHIPPED artefact rather than the
build script — a build script can be correct and still emit a bad deck.

Run: python3 check_deck_layout.py
Exit 0 = clean, 1 = at least one FAIL.
"""

import glob
import os
import sys
import zipfile
import re
from xml.etree import ElementTree as ET

NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
}
EMU = 914400.0
SLIDE_W, SLIDE_H = 13.333, 7.5
COVER_THRESHOLD = 0.15   # fraction of a text box that must be covered to call it hidden

FAILS = []


def fail(m):
    print(f"  FAIL  {m}")
    FAILS.append(m)


def shapes_in_order(slide_xml):
    """Every shape on the slide, in render order (document order = z-order)."""
    root = ET.fromstring(slide_xml)
    spTree = root.find(".//p:cSld/p:spTree", NS)
    out = []
    if spTree is None:
        return out
    for el in spTree:
        tag = el.tag.split("}")[-1]
        if tag not in ("sp", "pic", "graphicFrame"):
            continue
        xfrm = el.find(".//a:xfrm", NS)
        if xfrm is None:
            continue
        off, ext = xfrm.find("a:off", NS), xfrm.find("a:ext", NS)
        if off is None or ext is None:
            continue
        x, y = int(off.get("x", 0)) / EMU, int(off.get("y", 0)) / EMU
        w, h = int(ext.get("cx", 0)) / EMU, int(ext.get("cy", 0)) / EMU
        text = "".join(t.text or "" for t in el.findall(".//a:t", NS)).strip()
        spPr = el.find(".//p:spPr", NS)
        filled = spPr is not None and spPr.find("a:solidFill", NS) is not None
        out.append({"x": x, "y": y, "w": w, "h": h,
                    "text": text, "filled": filled})
    return out


def overlap_area(a, b):
    dx = min(a["x"] + a["w"], b["x"] + b["w"]) - max(a["x"], b["x"])
    dy = min(a["y"] + a["h"], b["y"] + b["h"]) - max(a["y"], b["y"])
    return dx * dy if dx > 0 and dy > 0 else 0.0


print("=" * 78)
print("DECK LAYOUT CHECK — geometry of the built .pptx files")
print("=" * 78)

decks = sorted(glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), "*.pptx")))
for deck in decks:
    name = os.path.basename(deck)
    with zipfile.ZipFile(deck) as z:
        slide_names = sorted(
            (n for n in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n)),
            key=lambda n: int(re.search(r"(\d+)", os.path.basename(n)).group(1)))
        n_hidden = n_off = 0
        for idx, sn in enumerate(slide_names, start=1):
            shapes = shapes_in_order(z.read(sn).decode("utf-8"))

            for sh in shapes:
                # 1. off-slide — TEXT-BEARING shapes only.
                #    Decorative shapes deliberately bleed past the edge (the title
                #    slides all do it with their corner circles), so flagging every
                #    off-slide shape reported 29 failures, none of them real. What
                #    actually matters is CONTENT being clipped.
                if not sh["text"]:
                    continue
                if sh["x"] + sh["w"] > SLIDE_W + 0.02 or sh["y"] + sh["h"] > SLIDE_H + 0.02:
                    label = sh["text"][:40].replace("\n", " ")
                    fail(f"{name} slide {idx}: text runs off-slide — "
                         f"ends at {sh['x']+sh['w']:.2f} x {sh['y']+sh['h']:.2f}in "
                         f"(limit {SLIDE_W} x {SLIDE_H}) — \"{label}\"")
                    n_off += 1

            # 2. text hidden behind a later filled shape
            for i, sh in enumerate(shapes):
                if not sh["text"] or sh["w"] * sh["h"] <= 0:
                    continue
                covered = 0.0
                for later in shapes[i + 1:]:
                    if later["filled"] and not later["text"]:
                        covered += overlap_area(sh, later)
                frac = covered / (sh["w"] * sh["h"])
                if frac >= COVER_THRESHOLD:
                    label = sh["text"][:45].replace("\n", " ")
                    fail(f"{name} slide {idx}: text {frac*100:.0f}% covered by a "
                         f"later filled shape — \"{label}\"")
                    n_hidden += 1

        if n_hidden == 0 and n_off == 0:
            print(f"  PASS  {name}: {len(slide_names)} slides, no hidden text, nothing off-slide")

print("\n" + "=" * 78)
if FAILS:
    print(f"{len(FAILS)} LAYOUT FAILURE(S)")
    sys.exit(1)
print("ALL DECK LAYOUT CHECKS PASSED")
sys.exit(0)
