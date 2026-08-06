#!/usr/bin/env python3
"""
build_day1_assets.py — generate the images for the Day 1 "day in the life" deck.

Everything is drawn here rather than sourced, so the deck stays self-contained
and every number in a graphic comes from this file (no stock art, no stray
copyright). Run this before build_day1_a_day_in_the_life.js.

Writes: assets_day1/*.png
"""

import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "assets_day1")
os.makedirs(OUT, exist_ok=True)

F = "/System/Library/Fonts/Supplemental/"
def geo(sz, bold=False):   return ImageFont.truetype(F + ("Georgia Bold.ttf" if bold else "Georgia.ttf"), sz)
def treb(sz, bold=False):  return ImageFont.truetype(F + ("Trebuchet MS Bold.ttf" if bold else "Trebuchet MS.ttf"), sz)
def mono(sz, bold=False):  return ImageFont.truetype(F + ("Courier New Bold.ttf" if bold else "Courier New.ttf"), sz)

PAPER = (239, 237, 232)
INK   = (26, 26, 26)
MUTE  = (122, 118, 110)
LINE  = (208, 204, 196)

# the day's arc — dawn to dusk
DAWN, GREEN, AMBER, CLAY, ROSE, DUSK = ((61, 90, 128), (91, 140, 90), (201, 162, 39),
                                        (217, 119, 66), (181, 72, 93), (123, 75, 148))

SCALE = 2  # render at 2x for crisp placement in the deck


def canvas(w, h, bg=PAPER):
    im = Image.new("RGB", (w * SCALE, h * SCALE), bg)
    return im, ImageDraw.Draw(im)


def autocrop(im, bg, pad=20):
    """Trim to the drawn content. Slides place these by height, so trailing
       whitespace inside the PNG becomes a silent gap on the slide."""
    from PIL import ImageChops
    ref = Image.new("RGB", im.size, bg)
    box = ImageChops.difference(im, ref).convert("L").point(lambda v: 255 if v > 8 else 0).getbbox()
    if not box:
        return im
    p = pad * SCALE
    return im.crop((max(0, box[0] - p), max(0, box[1] - p),
                    min(im.width, box[2] + p), min(im.height, box[3] + p)))


def save(im, name, bg=PAPER):
    im = autocrop(im, bg)
    im.save(os.path.join(OUT, name))
    print(f"  wrote {name}  {im.width}x{im.height}")


def text(d, xy, s, font, fill=INK, anchor=None):
    d.text((xy[0] * SCALE, xy[1] * SCALE), s, font=font, fill=fill, anchor=anchor)


def rect(d, box, fill=None, outline=None, width=1, radius=None):
    b = [box[0] * SCALE, box[1] * SCALE, box[2] * SCALE, box[3] * SCALE]
    if radius:
        d.rounded_rectangle(b, radius=radius * SCALE, fill=fill, outline=outline, width=width * SCALE)
    else:
        d.rectangle(b, fill=fill, outline=outline, width=width * SCALE)


# ============================================================ 1. THE PIPELINE
def pipeline():
    W, H = 1180, 300
    im, d = canvas(W, H)
    stages = [
        ("CRF",        "the form a nurse fills in",        DAWN),
        ("EDC",        "the database it lands in",         DAWN),
        ("RAW EXTRACT","a CSV, one file per form",         GREEN),
        ("SDTM",       "standardised — what you build",    AMBER),
        ("ADaM",       "analysis-ready",                   CLAY),
        ("TABLES",     "what the statistician reports",    ROSE),
        ("SUBMISSION", "what the regulator reads",         DUSK),
    ]
    n = len(stages)
    pad, gap = 26, 14
    bw = (W - 2 * pad - gap * (n - 1)) / n
    y0, bh = 96, 92
    for i, (name, sub, col) in enumerate(stages):
        x = pad + i * (bw + gap)
        rect(d, (x, y0, x + bw, y0 + bh), fill=col, radius=7)
        text(d, (x + bw / 2, y0 + 30), name, treb(19, True), fill=(255, 255, 255), anchor="mm")
        # wrap the caption to two lines
        words, lines, cur = sub.split(), [], ""
        for w in words:
            t = (cur + " " + w).strip()
            if len(t) > 20:
                lines.append(cur); cur = w
            else:
                cur = t
        lines.append(cur)
        for j, ln in enumerate(lines[:2]):
            text(d, (x + bw / 2, y0 + 56 + j * 17), ln, treb(12), fill=(255, 255, 255), anchor="mm")
        if i < n - 1:
            ax = x + bw + gap / 2
            d.line([(ax - 4) * SCALE, (y0 + bh / 2) * SCALE, (ax + 4) * SCALE, (y0 + bh / 2) * SCALE],
                   fill=MUTE, width=2 * SCALE)
    text(d, (pad, 40), "Where your work sits", geo(30, True))
    text(d, (pad, 76), "Every dataset you build has a nurse at one end and a reviewer at the other.",
         treb(15), fill=MUTE)
    # the span the course covers
    x1 = pad + 2 * (bw + gap)
    x2 = pad + 5 * (bw + gap) - gap
    yb = y0 + bh + 26
    d.line([x1 * SCALE, yb * SCALE, x2 * SCALE, yb * SCALE], fill=AMBER, width=3 * SCALE)
    for xx in (x1, x2):
        d.line([xx * SCALE, (yb - 6) * SCALE, xx * SCALE, (yb + 6) * SCALE], fill=AMBER, width=3 * SCALE)
    text(d, ((x1 + x2) / 2, yb + 22), "THESE TEN DAYS", treb(14, True), fill=AMBER, anchor="mm")
    save(im, "pipeline.png")


# ============================================================ 2. THE SAS LOG
def saslog():
    """Sized so the type is READABLE FROM A ROOM. The image is placed 7.6in wide
       on the slide, so a glyph drawn at N px here lands at roughly N*0.72 pt on
       screen — fewer lines at a larger size beats a faithful full log nobody can
       read. The WARNING is the whole point, so it gets the most weight."""
    W, H = 620, 330
    im, d = canvas(W, H, bg=(24, 28, 33))
    text(d, (20, 14), "log  —  dm_build.sas", mono(15), fill=(150, 160, 172))
    d.line([0, 42 * SCALE, W * SCALE, 42 * SCALE], fill=(48, 55, 63), width=1 * SCALE)
    lines = [
        ("NOTE: 8 records were read from DM_RAW.", (120, 190, 140), 16),
        ("NOTE: WORK.DM has 8 obs and 23 variables.", (120, 190, 140), 16),
        ("", None, 8),
        ("WARNING: Multiple lengths were specified", (240, 186, 84), 17),
        ("         for the variable USUBJID.", (240, 186, 84), 17),
        ("", None, 8),
        ("NOTE: WORK.DS has 24 obs and 9 variables.", (120, 190, 140), 16),
        ("NOTE: PROCEDURE PRINT used 0.04 seconds.", (120, 190, 140), 16),
    ]
    y = 58
    for txt_, col, sz in lines:
        if txt_:
            text(d, (20, y), txt_, mono(sz), fill=col)
        y += sz + 8
    rect(d, (20, 252, W - 20, 316), fill=(58, 44, 20), outline=(240, 186, 84), width=2, radius=6)
    text(d, (34, 262), "This run succeeded.", treb(18, True), fill=(255, 214, 120))
    text(d, (34, 288), "The WARNING is the bug.", treb(16), fill=(230, 218, 196))
    save(im, "saslog.png", bg=(24, 28, 33))


# ============================================================ 3. RAW -> SDTM
def transform():
    """Real ABC-01 rows. Note BRTHDTC is COLLECTED but never submitted - AGE is
       derived from it - and SEX arrives as a numeric code. Both are true of the
       shipped data; inventing prettier examples would contradict the course."""
    W, H = 1020, 360
    im, d = canvas(W, H)
    text(d, (26, 18), "What the site collected", treb(19, True), fill=MUTE)
    raw_h = ["SITEID", "SUBJID", "BRTHDTC", "SEX"]
    raw_r = [["01", "001", "14-MAY-1969", "2"],
             ["01", "002", "02-NOV-1963", "1"],
             ["02", "001", "30-AUG-1977", "2"]]
    colw = [66, 74, 150, 52]
    x0, y0, rh = 26, 52, 40
    for i, h in enumerate(raw_h):
        x = x0 + sum(colw[:i])
        rect(d, (x, y0, x + colw[i], y0 + rh), fill=(224, 221, 213))
        text(d, (x + 9, y0 + 11), h, mono(16, True), fill=INK)
    for r, row in enumerate(raw_r):
        for i, v in enumerate(row):
            x = x0 + sum(colw[:i]); y = y0 + rh * (r + 1)
            rect(d, (x, y, x + colw[i], y + rh), fill=(247, 246, 243), outline=LINE, width=1)
            text(d, (x + 9, y + 11), v, mono(16), fill=INK)
    ynote = y0 + rh * 4 + 16
    for j, ln in enumerate(["subject 001 appears at BOTH sites",
                            "sex is a CODE, not a word",
                            "date of birth is collected"]):
        text(d, (26, ynote + j * 24), "- " + ln, treb(15), fill=CLAY)

    ax = 366
    d.line([ax * SCALE, 150 * SCALE, (ax + 58) * SCALE, 150 * SCALE], fill=AMBER, width=4 * SCALE)
    d.polygon([((ax + 58) * SCALE, 150 * SCALE), ((ax + 46) * SCALE, 143 * SCALE),
               ((ax + 46) * SCALE, 157 * SCALE)], fill=AMBER)
    text(d, (ax + 29, 126), "you", treb(14, True), fill=AMBER, anchor="mm")

    text(d, (452, 18), "What the reviewer receives", treb(19, True), fill=MUTE)
    s_h = ["USUBJID", "AGE", "AGEU", "SEX"]
    s_r = [["ABC-01-01-001", "54", "YEARS", "F"],
           ["ABC-01-01-002", "60", "YEARS", "M"],
           ["ABC-01-02-001", "46", "YEARS", "F"]]
    scolw = [200, 58, 90, 52]
    sx0 = 452
    for i, h in enumerate(s_h):
        x = sx0 + sum(scolw[:i])
        rect(d, (x, y0, x + scolw[i], y0 + rh), fill=AMBER)
        text(d, (x + 9, y0 + 11), h, mono(16, True), fill=(255, 255, 255))
    for r, row in enumerate(s_r):
        for i, v in enumerate(row):
            x = sx0 + sum(scolw[:i]); y = y0 + rh * (r + 1)
            rect(d, (x, y, x + scolw[i], y + rh), fill=(255, 255, 255), outline=LINE, width=1)
            text(d, (x + 10, y + 10), v, mono(14), fill=INK)
    for j, ln in enumerate(["one key, unique across the whole study",
                            "code decoded to CDISC terminology",
                            "date of birth is NOT submitted - AGE is derived from it"]):
        text(d, (452, ynote + j * 24), "- " + ln, treb(15), fill=GREEN)
    save(im, "transform.png")


# ============================================================ 4. A QUERY
def query():
    W, H = 760, 300
    im, d = canvas(W, H)
    rect(d, (0, 0, W, H), fill=(255, 255, 255), outline=LINE, width=1, radius=10)
    rect(d, (0, 0, W, 52), fill=ROSE, radius=10)
    rect(d, (0, 38, W, 52), fill=ROSE)
    text(d, (22, 15), "DATA QUERY  ·  ABC-01  ·  #0142", treb(16, True), fill=(255, 255, 255))
    rows = [("Subject", "ABC-01-01-002"),
            ("Form", "Adverse Events"),
            ("Field", "AE start date"),
            ("Value", "28-Feb-2024"),
            ("Raised by", "you")]
    y = 74
    for k, v in rows:
        text(d, (24, y), k, treb(13), fill=MUTE)
        text(d, (140, y), v, mono(14), fill=INK)
        y += 28
    d.line([24 * SCALE, (y + 4) * SCALE, (W - 24) * SCALE, (y + 4) * SCALE], fill=LINE, width=1 * SCALE)
    text(d, (24, y + 18), "The adverse event starts five days BEFORE the first dose,", treb(14), fill=INK)
    text(d, (24, y + 38), "but is flagged as treatment-emergent. Please confirm the", treb(14), fill=INK)
    text(d, (24, y + 58), "start date, or the flag.", treb(14), fill=INK)
    save(im, "query.png")


# ============================================================ 5. WHERE TIME GOES
def timesplit():
    W, H = 1060, 280
    im, d = canvas(W, H)
    text(d, (24, 18), "Where the day actually goes", geo(28, True))
    text(d, (24, 56), "The surprise for most people: writing new code is the small part.",
         treb(15), fill=MUTE)
    segs = [("Reading code, logs\nand specs", 30, DAWN),
            ("Writing new\nprogrammes", 25, AMBER),
            ("Checking work —\nyours and others'", 20, GREEN),
            ("Queries and\nemail", 15, CLAY),
            ("Meetings", 10, DUSK)]
    x0, y0, bw, bh = 24, 100, W - 48, 52
    x = x0
    for label, pct, col in segs:
        w = bw * pct / 100
        rect(d, (x, y0, x + w, y0 + bh), fill=col)
        text(d, (x + w / 2, y0 + bh / 2), f"{pct}%", treb(19, True), fill=(255, 255, 255), anchor="mm")
        x += w
    # captions under each
    x = x0
    for label, pct, col in segs:
        w = bw * pct / 100
        for j, ln in enumerate(label.split("\n")):
            text(d, (x + w / 2, y0 + bh + 14 + j * 17), ln, treb(12), fill=MUTE, anchor="mm")
        x += w
    text(d, (24, 236), "Indicative of a typical study week — not a timesheet.",
         treb(12), fill=MUTE)
    save(im, "timesplit.png")


# ============================================================ 6. TITLE ARC
def dayarc():
    W, H = 1000, 260
    im, d = canvas(W, H)
    cols = [DAWN, GREEN, AMBER, CLAY, ROSE, DUSK]
    labels = ["08:45", "10:15", "11:30", "13:30", "15:00", "16:45"]
    import math
    cx, cy, r = W / 2, 226, 162
    for i in range(len(cols) - 1):
        a0 = math.pi + i * (math.pi / (len(cols) - 1))
        a1 = math.pi + (i + 1) * (math.pi / (len(cols) - 1))
        steps = 40
        for s in range(steps):
            t0 = a0 + (a1 - a0) * s / steps
            t1 = a0 + (a1 - a0) * (s + 1) / steps
            f = s / steps
            col = tuple(int(cols[i][k] + (cols[i + 1][k] - cols[i][k]) * f) for k in range(3))
            d.line([(cx + r * math.cos(t0)) * SCALE, (cy + r * math.sin(t0)) * SCALE,
                    (cx + r * math.cos(t1)) * SCALE, (cy + r * math.sin(t1)) * SCALE],
                   fill=col, width=5 * SCALE)
    for i, (lab, col) in enumerate(zip(labels, cols)):
        a = math.pi + i * (math.pi / (len(labels) - 1))
        px, py = cx + r * math.cos(a), cy + r * math.sin(a)
        d.ellipse([(px - 9) * SCALE, (py - 9) * SCALE, (px + 9) * SCALE, (py + 9) * SCALE],
                  fill=col)
        d.ellipse([(px - 4) * SCALE, (py - 4) * SCALE, (px + 4) * SCALE, (py + 4) * SCALE],
                  fill=PAPER)
        lx, ly = cx + (r + 30) * math.cos(a), cy + (r + 30) * math.sin(a)
        text(d, (lx, ly), lab, mono(21, True), fill=col, anchor="mm")
    save(im, "dayarc.png")


if __name__ == "__main__":
    pipeline(); saslog(); transform(); query(); timesplit(); dayarc()
    print(f"\n  {len(os.listdir(OUT))} images in {OUT}")
