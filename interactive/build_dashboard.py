#!/usr/bin/env python3
"""
build_dashboard.py — stitch subjects.json into the Subject Journey dashboard.

Self-contained: the real ABC-01 per-subject data is inlined, so the page opens
identically from disk, a server, or an Artifact.

Run after build_subject_data.py:  python3 build_dashboard.py
Writes: subject_journey_dashboard.html
"""

import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "subjects.json")
OUT = os.path.join(HERE, "subject_journey_dashboard.html")

TEMPLATE = r"""<title>Subject Journey — ABC-01</title>
<style>
  :root{
    --ink:#0F2E3D; --ink-2:#33525f; --muted:#5A7682;
    --bg:#eaf0f1; --panel:#ffffff; --panel-2:#f2f7f7; --sunk:#e8eff0;
    --line:#d3e0e3; --line-2:#bcd0d4;
    --accent:#0E7C86; --accent-2:#0a5a62;
    --drugA:#0E7C86; --placebo:#7d94a0;
    --dose:#0E7C86; --dose-bg:#d7ebec;
    --cm:#6f74c4; --cm-bg:#e7e8f7;
    --visit:#b6c8cc;
    --mild:#E4B23B; --moderate:#E07E2C; --severe:#C0455B;
    --serious:#C0455B;
    --low:#3E78C4; --normal:#2E9E6B; --high:#C0455B;
    --ok:#157F4E; --ok-bg:#e5f3ec; --warn:#B5771A; --warn-bg:#fbf1dd;
    --shadow:0 1px 2px rgba(15,46,61,.05), 0 10px 30px rgba(15,46,61,.06);
    --mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
    --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  }
  @media (prefers-color-scheme:dark){:root{
    --ink:#e7f0f2; --ink-2:#b6cace; --muted:#87a1a9;
    --bg:#0b1315; --panel:#111f22; --panel-2:#0e1a1d; --sunk:#0c1618;
    --line:#243d42; --line-2:#345257;
    --accent:#4fc2cc; --accent-2:#7fd6de;
    --drugA:#4fc2cc; --placebo:#7d94a0;
    --dose:#4fc2cc; --dose-bg:#123033;
    --cm:#9a9ee0; --cm-bg:#1e2040;
    --visit:#33525a;
    --mild:#d9ab43; --moderate:#e08a45; --severe:#ef8a9c;
    --serious:#ef8a9c;
    --low:#6ba0e0; --normal:#57c491; --high:#ef8a9c;
    --ok:#5cc98f; --ok-bg:#12271d; --warn:#e0b25e; --warn-bg:#241d10;
    --shadow:0 1px 2px rgba(0,0,0,.3), 0 12px 34px rgba(0,0,0,.4);
  }}
  :root[data-theme="light"]{
    --ink:#0F2E3D; --ink-2:#33525f; --muted:#5A7682; --bg:#eaf0f1; --panel:#fff; --panel-2:#f2f7f7; --sunk:#e8eff0;
    --line:#d3e0e3; --line-2:#bcd0d4; --accent:#0E7C86; --accent-2:#0a5a62; --drugA:#0E7C86; --placebo:#7d94a0;
    --dose:#0E7C86; --dose-bg:#d7ebec; --cm:#6f74c4; --cm-bg:#e7e8f7; --visit:#b6c8cc;
    --mild:#E4B23B; --moderate:#E07E2C; --severe:#C0455B; --serious:#C0455B;
    --low:#3E78C4; --normal:#2E9E6B; --high:#C0455B; --ok:#157F4E; --ok-bg:#e5f3ec; --warn:#B5771A; --warn-bg:#fbf1dd;
    --shadow:0 1px 2px rgba(15,46,61,.05), 0 10px 30px rgba(15,46,61,.06);
  }
  :root[data-theme="dark"]{
    --ink:#e7f0f2; --ink-2:#b6cace; --muted:#87a1a9; --bg:#0b1315; --panel:#111f22; --panel-2:#0e1a1d; --sunk:#0c1618;
    --line:#243d42; --line-2:#345257; --accent:#4fc2cc; --accent-2:#7fd6de; --drugA:#4fc2cc; --placebo:#7d94a0;
    --dose:#4fc2cc; --dose-bg:#123033; --cm:#9a9ee0; --cm-bg:#1e2040; --visit:#33525a;
    --mild:#d9ab43; --moderate:#e08a45; --severe:#ef8a9c; --serious:#ef8a9c;
    --low:#6ba0e0; --normal:#57c491; --high:#ef8a9c; --ok:#5cc98f; --ok-bg:#12271d; --warn:#e0b25e; --warn-bg:#241d10;
    --shadow:0 1px 2px rgba(0,0,0,.3), 0 12px 34px rgba(0,0,0,.4);
  }

  *{box-sizing:border-box}
  html,body{margin:0}
  body{font-family:var(--sans); color:var(--ink); background:var(--bg); -webkit-font-smoothing:antialiased; line-height:1.45}
  .app{max-width:1180px; margin:0 auto; padding:clamp(14px,2.2vw,26px)}

  header.top{display:flex; align-items:flex-end; gap:16px 24px; flex-wrap:wrap; margin-bottom:16px}
  .kick{font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--accent-2); font-weight:700; margin:0 0 5px}
  h1{font-size:clamp(20px,2.5vw,27px); margin:0; letter-spacing:-.02em; font-weight:800}
  .subpick{margin-left:auto; display:flex; align-items:center; gap:9px; flex-wrap:wrap}
  .subpick label{font-size:12px; color:var(--muted); font-weight:600}
  select.subject{font-family:var(--mono); font-size:14px; font-weight:700; padding:9px 34px 9px 13px; border:1.5px solid var(--line-2); border-radius:10px; background:var(--panel); color:var(--ink); cursor:pointer;
    -webkit-appearance:none; appearance:none;
    background-image:linear-gradient(45deg,transparent 50%,var(--muted) 50%),linear-gradient(135deg,var(--muted) 50%,transparent 50%);
    background-position:calc(100% - 18px) 52%, calc(100% - 13px) 52%; background-size:5px 5px,5px 5px; background-repeat:no-repeat}
  .navbtn{font-family:var(--sans); font-size:13px; font-weight:600; padding:9px 12px; border:1.5px solid var(--line-2); border-radius:9px; background:var(--panel); color:var(--ink); cursor:pointer}
  .navbtn:hover{border-color:var(--accent)}

  /* summary */
  .summary{background:var(--panel); border:1px solid var(--line); border-radius:15px; box-shadow:var(--shadow); padding:16px 18px; margin-bottom:14px; display:flex; gap:16px 26px; flex-wrap:wrap; align-items:center}
  .idblock{display:flex; align-items:center; gap:13px}
  .idblock .uid{font-family:var(--mono); font-size:17px; font-weight:800; letter-spacing:-.01em}
  .armbadge{font-size:11px; font-weight:700; letter-spacing:.04em; padding:4px 11px; border-radius:20px; color:#fff}
  .armbadge.A{background:var(--drugA)} .armbadge.P{background:var(--placebo)}
  .demo{display:flex; gap:14px 20px; flex-wrap:wrap}
  .demo .d{display:flex; flex-direction:column}
  .demo .dk{font-size:10px; letter-spacing:.07em; text-transform:uppercase; color:var(--muted); font-weight:700}
  .demo .dv{font-family:var(--mono); font-size:13.5px; font-weight:600}
  .status{margin-left:auto; display:flex; align-items:center; gap:9px; padding:8px 14px; border-radius:11px; font-weight:700; font-size:13px; border:1px solid}
  .status.done{color:var(--ok); background:var(--ok-bg); border-color:color-mix(in srgb,var(--ok) 35%,transparent)}
  .status.disc{color:var(--severe); background:color-mix(in srgb,var(--severe) 12%,transparent); border-color:color-mix(in srgb,var(--severe) 35%,transparent)}
  .status .r{font-weight:500; color:var(--ink-2); font-size:12px}

  /* controls */
  .controls{background:var(--panel-2); border:1px solid var(--line); border-radius:13px; padding:12px 15px; margin-bottom:14px; display:flex; gap:14px 22px; flex-wrap:wrap; align-items:center}
  .cgroup{display:flex; align-items:center; gap:9px; flex-wrap:wrap}
  .cgroup .glab{font-size:10.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); font-weight:700}
  .pill{font-size:12.5px; font-weight:600; padding:6px 11px; border:1.5px solid var(--line-2); border-radius:20px; background:var(--panel); color:var(--ink-2); cursor:pointer; display:inline-flex; align-items:center; gap:6px; user-select:none}
  .pill .sw{width:9px; height:9px; border-radius:2px}
  .pill.on{border-color:var(--accent); background:color-mix(in srgb,var(--accent) 13%,transparent); color:var(--ink)}
  .pill.off{opacity:.5}
  .seg{display:inline-flex; border:1.5px solid var(--line-2); border-radius:9px; overflow:hidden}
  .seg button{font-family:var(--sans); font-size:12.5px; font-weight:600; padding:6px 11px; border:0; background:var(--panel); color:var(--ink-2); cursor:pointer}
  .seg button.on{background:var(--accent); color:#fff}
  .zoombtn{width:30px; height:30px; border:1.5px solid var(--line-2); border-radius:8px; background:var(--panel); color:var(--ink); font-size:16px; cursor:pointer; display:grid; place-items:center}
  .zoombtn:hover{border-color:var(--accent)}

  /* timeline */
  .tlcard{background:var(--panel); border:1px solid var(--line); border-radius:15px; box-shadow:var(--shadow); padding:8px 6px 14px; margin-bottom:14px; overflow:hidden}
  .lane{display:grid; grid-template-columns:112px 1fr; align-items:stretch; border-top:1px solid var(--line)}
  .lane:first-child{border-top:0}
  .lane .llabel{font-size:11px; font-weight:700; color:var(--ink-2); padding:9px 10px; display:flex; align-items:center; gap:7px; letter-spacing:.02em}
  .lane .llabel .sw{width:10px;height:10px;border-radius:3px;flex:none}
  .track{position:relative; padding:7px 12px; min-height:34px; overflow:hidden}
  @media (max-width:640px){ .lane{grid-template-columns:76px 1fr} .lane .llabel{font-size:10px} }

  .axis{position:relative; height:26px; margin-left:112px; border-bottom:1px solid var(--line-2)}
  @media (max-width:640px){ .axis{margin-left:76px} }
  .axis .tick{position:absolute; top:0; bottom:0; transform:translateX(-50%)}
  .axis .tick .lab{position:absolute; bottom:4px; left:50%; transform:translateX(-50%); font-family:var(--mono); font-size:10.5px; color:var(--muted); white-space:nowrap}
  .grid{position:absolute; top:0; bottom:0; width:1px; background:var(--line); z-index:0}
  .grid.visit{background:var(--visit)}
  .grid.dose0{background:color-mix(in srgb,var(--accent) 55%,transparent); width:1.5px}

  .bar{position:absolute; height:20px; top:50%; transform:translateY(-50%); border-radius:5px; z-index:2; display:flex; align-items:center; padding:0 7px; font-size:11px; font-weight:600; white-space:nowrap; overflow:hidden; cursor:default; color:#fff}
  .bar.dose{background:var(--dose)}
  .bar.cm{background:var(--cm)}
  .bar.clipL{border-top-left-radius:0; border-bottom-left-radius:0; border-left:2px dashed rgba(255,255,255,.7)}
  .bar.clipR{border-top-right-radius:0; border-bottom-right-radius:0}
  .ae{position:absolute; height:20px; top:50%; transform:translateY(-50%); border-radius:5px; z-index:3; display:flex; align-items:center; gap:5px; padding:0 6px; font-size:11px; font-weight:600; white-space:nowrap; overflow:visible; cursor:default; border:1.5px solid transparent}
  .ae.mild{background:color-mix(in srgb,var(--mild) 26%,var(--panel)); border-color:var(--mild); color:var(--ink)}
  .ae.moderate{background:color-mix(in srgb,var(--moderate) 26%,var(--panel)); border-color:var(--moderate); color:var(--ink)}
  .ae.severe{background:color-mix(in srgb,var(--severe) 24%,var(--panel)); border-color:var(--severe); color:var(--ink)}
  .ae .dot{width:7px;height:7px;border-radius:50%;flex:none}
  .ae .dot.te{background:currentColor}
  .ae .dot.nte{background:transparent; border:1.5px solid currentColor}
  .ae .ser{color:var(--serious); font-weight:800}
  .ae.point{padding-left:5px; padding-right:5px}
  .lane .empty{font-size:11.5px; color:var(--muted); font-style:italic; align-self:center; padding-left:2px}

  /* findings */
  .findwrap{display:grid; gap:14px; grid-template-columns:1fr 1fr}
  @media (max-width:820px){ .findwrap{grid-template-columns:1fr} }
  .fcard{background:var(--panel); border:1px solid var(--line); border-radius:15px; box-shadow:var(--shadow); overflow:hidden}
  .fcard h3{font-size:13px; margin:0; padding:12px 15px; border-bottom:1px solid var(--line); background:var(--panel-2); display:flex; align-items:center; gap:8px}
  .fcard h3 .sw{width:9px;height:9px;border-radius:2px;background:var(--accent)}
  .ftable{width:100%; border-collapse:collapse; font-size:12px}
  .ftable th,.ftable td{padding:6px 9px; text-align:right; border-top:1px solid var(--line); font-variant-numeric:tabular-nums; font-family:var(--mono)}
  .ftable th:first-child,.ftable td:first-child{text-align:left; font-family:var(--sans); color:var(--ink-2); font-weight:600; white-space:nowrap}
  .ftable thead th{border-top:0; color:var(--muted); font-family:var(--sans); font-weight:700; font-size:10.5px; text-transform:uppercase; letter-spacing:.04em}
  .ftable td .cell{display:inline-flex; align-items:center; justify-content:flex-end; gap:5px}
  .ftable td .ind{width:7px;height:7px;border-radius:50%;display:inline-block}
  .ind.LOW{background:var(--low)} .ind.HIGH{background:var(--high)} .ind.NORMAL{background:var(--normal)}
  .ftable td.abn.LOW{color:var(--low)} .ftable td.abn.HIGH{color:var(--high); font-weight:700}
  .ftable td.abn.LOW{font-weight:700}
  .ftable .bl{color:var(--accent-2); font-weight:800}
  .ftable-scroll{overflow-x:auto}
  .fnote{font-size:11px; color:var(--muted); padding:8px 15px}

  /* tooltip */
  #tip{position:fixed; z-index:60; pointer-events:none; background:var(--ink); color:var(--panel); font-size:12px; line-height:1.5; padding:9px 11px; border-radius:9px; box-shadow:0 8px 24px rgba(0,0,0,.3); max-width:280px; opacity:0; transition:opacity .1s}
  #tip.on{opacity:1}
  #tip b{color:#fff} #tip .k{opacity:.7} #tip .mono{font-family:var(--mono)}
  @media (prefers-color-scheme:dark){#tip{background:#04090a}}

  .viewseg{margin-left:auto}
  @media (max-width:640px){ .viewseg{margin-left:0} }

  /* trend charts */
  .charts{display:grid; grid-template-columns:repeat(auto-fill,minmax(148px,1fr)); gap:10px; padding:12px 14px}
  .chart{border:1px solid var(--line); border-radius:10px; padding:8px 9px 6px; background:var(--panel-2)}
  .chart .ct{display:flex; align-items:baseline; justify-content:space-between; margin-bottom:3px}
  .chart .cc{font-family:var(--mono); font-size:12px; font-weight:700; color:var(--ink)}
  .chart .cu{font-size:10px; color:var(--muted); font-family:var(--mono)}
  .chart svg{display:block; width:100%; height:auto; overflow:visible}
  .chart .band{fill:color-mix(in srgb,var(--normal) 15%,transparent)}
  .chart .rl{stroke:color-mix(in srgb,var(--normal) 45%,transparent); stroke-width:1; stroke-dasharray:2 2}
  .chart .ln{fill:none; stroke:var(--accent); stroke-width:1.6}
  .chart .pt{stroke:var(--panel); stroke-width:1.4}
  .chart .pt.LOW{fill:var(--low)} .chart .pt.HIGH{fill:var(--high)} .chart .pt.NORMAL{fill:var(--normal)} .chart .pt.vs{fill:var(--accent)}
  .chart .bl-ring{fill:none; stroke:var(--accent-2); stroke-width:1.6}
  .chart .vlab{font-family:var(--mono); font-size:8.5px; fill:var(--muted)}
  .chart .last{font-family:var(--mono); font-size:11px; font-weight:700}

  /* cohort */
  .cohort{background:var(--panel); border:1px solid var(--line); border-radius:15px; box-shadow:var(--shadow); padding:10px 6px 14px}
  .cohort .caxis{position:relative; height:22px; margin-left:168px; border-bottom:1px solid var(--line-2)}
  @media (max-width:640px){ .cohort .caxis{margin-left:120px} }
  .cohort .caxis .tick{position:absolute; top:0; bottom:0; transform:translateX(-50%)}
  .cohort .caxis .lab{position:absolute; bottom:4px; left:50%; transform:translateX(-50%); font-family:var(--mono); font-size:10px; color:var(--muted); white-space:nowrap}
  .crow{display:grid; grid-template-columns:168px 1fr; align-items:center; border-top:1px solid var(--line); cursor:pointer}
  .crow:hover{background:var(--panel-2)}
  @media (max-width:640px){ .crow{grid-template-columns:120px 1fr} }
  .crow .clab{display:flex; align-items:center; gap:8px; padding:9px 10px; min-width:0}
  .crow .cid{font-family:var(--mono); font-size:12.5px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
  .crow .cstat{margin-left:auto; font-size:12px}
  .crow .cstat.done{color:var(--ok)} .crow .cstat.disc{color:var(--severe)}
  .crow .ctrack{position:relative; height:38px; padding:0 12px}
  .crow .cdose{position:absolute; height:9px; top:50%; transform:translateY(-50%); background:var(--dose); border-radius:3px; z-index:1}
  .crow .cvisit{position:absolute; top:8px; bottom:8px; width:1px; background:var(--visit)}
  .crow .cae{position:absolute; top:50%; width:11px; height:11px; border-radius:50%; transform:translate(-50%,-50%); z-index:3; border:1.5px solid var(--panel)}
  .crow .cae.mild{background:var(--mild)} .crow .cae.moderate{background:var(--moderate)} .crow .cae.severe{background:var(--severe)}
  .crow .cae.ser{box-shadow:0 0 0 2px var(--severe)}
  .crow .cdisc{position:absolute; top:4px; bottom:4px; width:2px; background:var(--severe); z-index:4}
  .crow .cdisc::after{content:'✕'; position:absolute; top:-2px; left:50%; transform:translateX(-50%); color:var(--severe); font-size:9px; font-weight:800}
  .crow .cd0{position:absolute; top:4px; bottom:4px; width:1.5px; background:color-mix(in srgb,var(--accent) 55%,transparent); z-index:2}
  .cohort .clegend{display:flex; gap:14px; flex-wrap:wrap; padding:12px 14px 2px; font-size:11.5px; color:var(--muted)}
  .cohort .clegend span{display:inline-flex; align-items:center; gap:5px}
  .cohort .clegend .d{width:10px;height:10px;border-radius:50%}

  footer{margin-top:18px; padding-top:14px; border-top:1px solid var(--line); font-size:12px; color:var(--muted); display:flex; gap:8px 16px; flex-wrap:wrap; align-items:center}
  footer .b{font-weight:700; color:var(--accent-2)}
  .hint{font-size:11.5px; color:var(--muted); margin-left:auto}
  @media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>

<div class="app">
  <header class="top">
    <div>
      <p class="kick">SDTM Bootcamp · Study ABC-01 · Patient Profile</p>
      <h1 id="viewtitle">Subject Journey</h1>
    </div>
    <div class="seg viewseg" id="viewseg">
      <button data-view="subject" class="on">Subject profile</button>
      <button data-view="cohort">Cohort</button>
    </div>
    <div class="subpick" id="subpick">
      <button class="navbtn" id="prev" aria-label="Previous subject">‹</button>
      <label for="subject">Subject</label>
      <select class="subject" id="subject"></select>
      <button class="navbtn" id="next" aria-label="Next subject">›</button>
    </div>
  </header>

  <div id="subjectView">
    <section class="summary" id="summary"></section>
    <section class="controls" id="controls"></section>
    <div class="tlcard">
      <div class="axis" id="axis"></div>
      <div id="lanes"></div>
    </div>
    <div class="findwrap" id="findings"></div>
  </div>

  <div id="cohortView" hidden></div>

  <footer>
    <span class="b">Patient profile</span>
    <span>Synthetic ABC-01 data — no real patients.</span>
    <span>Every value from the built SDTM datasets.</span>
    <span class="hint">Drag the timeline to pan · hover any bar for detail</span>
  </footer>
</div>
<div id="tip"></div>

<script type="application/json" id="subjects">__DATA__</script>
<script>
const DB = JSON.parse(document.getElementById('subjects').textContent);
const SUBS = DB.subjects;
const el = id => document.getElementById(id);
const esc = s => (s==null?'':String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

let cur = SUBS[0];
let view = {min:0, max:1};
const tracks = {dose:true, ae:true, cm:true, visits:true, vs:true, lb:true};
const filt = {aeSerious:false, aeTE:false, labAbn:false};
const lens = {axis:'day', findings:'chart'};
let mode = 'subject';   // 'subject' | 'cohort'

/* ---- study-day <-> date ---- */
function parseISO(s){ if(!s) return null; const p=s.split('-'); return p.length>=3 ? Date.UTC(+p[0],+p[1]-1,+p[2]) : null; }
function dayToDate(day){
  const base = parseISO(cur.milestones.firstDose);
  if(base==null || day==null) return null;
  const offset = day>0 ? day-1 : day;              // no Day 0
  return new Date(base + offset*86400000);
}
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(day){ const d=dayToDate(day); return d? `${d.getUTCDate()} ${MON[d.getUTCMonth()]}` : ''; }
function axisLabel(day){ return lens.axis==='day' ? (day===0?'':`D${day}`) : fmtDate(day); }

/* default view: keep the on-treatment story readable even when a chronic con-med
   reaches far back — clamp the left edge but let zoom-out reveal everything. */
function defaultView(s){
  const lo = Math.max(s.dayRange.min, -21);
  const hi = s.dayRange.max + 2;
  return {min: Math.min(lo, -3), max: hi};
}
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
function xpct(day){ return (day - view.min)/(view.max - view.min)*100; }

/* ================= subject picker ================= */
function renderPicker(){
  el('subject').innerHTML = SUBS.map(s =>
    `<option value="${s.usubjid}">${s.usubjid} — ${s.arm}${s.disposition && s.disposition.decod!=='COMPLETED' ? ' ⚠' : ''}</option>`).join('');
  el('subject').value = cur.usubjid;
}
function setSubject(u){ cur = SUBS.find(s=>s.usubjid===u); view = defaultView(cur); renderAll(); }
el('subject').addEventListener('change', e => setSubject(e.target.value));
el('prev').onclick = () => { const i=SUBS.indexOf(cur); setSubject(SUBS[(i-1+SUBS.length)%SUBS.length].usubjid); };
el('next').onclick = () => { const i=SUBS.indexOf(cur); setSubject(SUBS[(i+1)%SUBS.length].usubjid); };

/* ================= summary ================= */
function renderSummary(){
  const s = cur, m = s.milestones, disp = s.disposition;
  const done = !disp || disp.decod==='COMPLETED';
  const mile = [['Consent',m.consent],['First dose',m.firstDose],['Last dose',m.lastDose],['Study exit',m.endPart]]
    .filter(x=>x[1]).map(([k,v])=>`<div class="d"><span class="dk">${k}</span><span class="dv">${esc(v)}</span></div>`).join('');
  const demo = [['Age',`${s.age} ${s.ageu==='YEARS'?'y':s.ageu}`],['Sex',s.sex],['Race',titl(s.race)],
                ['Site',s.site],['Country',s.country]]
    .map(([k,v])=>`<div class="d"><span class="dk">${k}</span><span class="dv">${esc(v)}</span></div>`).join('');
  el('summary').innerHTML = `
    <div class="idblock"><span class="uid">${s.usubjid}</span>
      <span class="armbadge ${s.armcd}">${esc(s.arm)}</span></div>
    <div class="demo">${demo}</div>
    <div class="demo" style="border-left:1px solid var(--line); padding-left:20px">${mile}</div>
    <div class="status ${done?'done':'disc'}">
      ${done?'✓ Completed':'✕ Discontinued'}
      ${!done && disp?`<span class="r">— ${titl(disp.decod)}, day ${disp.dy}</span>`:''}
    </div>`;
}
function titl(s){ return (s||'').toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()); }

/* ================= controls ================= */
function renderControls(){
  const tk = [['dose','Dosing','var(--dose)'],['ae','Adverse events','var(--moderate)'],
              ['cm','Con meds','var(--cm)'],['visits','Visits','var(--visit)'],
              ['vs','Vitals','var(--accent)'],['lb','Labs','var(--accent)']];
  const trackPills = tk.map(([k,lab,c])=>
    `<button class="pill ${tracks[k]?'on':'off'}" data-tk="${k}"><span class="sw" style="background:${c}"></span>${lab}</button>`).join('');
  el('controls').innerHTML = `
    <div class="cgroup"><span class="glab">Show</span>${trackPills}</div>
    <div class="cgroup"><span class="glab">Filter</span>
      <button class="pill ${filt.aeSerious?'on':''}" data-ft="aeSerious">Serious AEs only</button>
      <button class="pill ${filt.aeTE?'on':''}" data-ft="aeTE">Treatment-emergent only</button>
      <button class="pill ${filt.labAbn?'on':''}" data-ft="labAbn">Abnormal labs only</button>
    </div>
    <div class="cgroup"><span class="glab">Axis</span>
      <div class="seg"><button data-lens="axis" data-val="day" class="${lens.axis==='day'?'on':''}">Study day</button>
        <button data-lens="axis" data-val="date" class="${lens.axis==='date'?'on':''}">Calendar</button></div></div>
    <div class="cgroup"><span class="glab">Findings</span>
      <div class="seg"><button data-lens="findings" data-val="chart" class="${lens.findings==='chart'?'on':''}">Trend</button>
        <button data-lens="findings" data-val="table" class="${lens.findings==='table'?'on':''}">Table</button></div></div>
    <div class="cgroup" style="margin-left:auto"><span class="glab">Zoom</span>
      <button class="zoombtn" id="zin">+</button><button class="zoombtn" id="zout">−</button>
      <button class="navbtn" id="zreset">Reset</button></div>`;

  el('controls').querySelectorAll('[data-tk]').forEach(b=>b.onclick=()=>{tracks[b.dataset.tk]=!tracks[b.dataset.tk]; renderControls(); renderTimeline(); renderFindings();});
  el('controls').querySelectorAll('[data-ft]').forEach(b=>b.onclick=()=>{filt[b.dataset.ft]=!filt[b.dataset.ft]; renderControls(); renderTimeline(); renderFindings();});
  el('controls').querySelectorAll('[data-lens]').forEach(b=>b.onclick=()=>{lens[b.dataset.lens]=b.dataset.val; renderControls(); renderAxis(); renderTimeline(); renderFindings();});
  el('zin').onclick=()=>zoom(0.7); el('zout').onclick=()=>zoom(1.4);
  el('zreset').onclick=()=>{view=defaultView(cur); renderAxis(); renderTimeline();};
}
function zoom(f){
  const c=(view.min+view.max)/2, half=(view.max-view.min)/2*f;
  const fullLo=cur.dayRange.min-2, fullHi=cur.dayRange.max+2;
  view={min:Math.max(fullLo,c-half), max:Math.min(fullHi,c+half)};
  if(view.max-view.min<4){view={min:c-2,max:c+2};}
  renderAxis(); renderTimeline();
}

/* ================= axis ================= */
function niceStep(span){ const raw=span/8, pw=Math.pow(10,Math.floor(Math.log10(raw)));
  const n=raw/pw; const s=n>=5?5:n>=2?2:1; return Math.max(1,s*pw); }
function renderAxis(){
  const step=niceStep(view.max-view.min);
  let ticks=''; const start=Math.ceil(view.min/step)*step;
  for(let d=start; d<=view.max; d+=step){
    const x=xpct(d); if(x<-1||x>101) continue;
    ticks+=`<div class="tick" style="left:${x}%"><span class="lab">${esc(axisLabel(Math.round(d)))}</span></div>`;
  }
  el('axis').innerHTML=ticks;
}

/* ================= timeline ================= */
function bar(day0, day1, cls, label, tip, ongoing){
  let a=xpct(day0), b=(day1==null? a+0.6 : xpct(day1));
  let clipL=a<0, clipR=b>100; a=clamp(a,0,100); b=clamp(b,0,100);
  const w=Math.max(b-a, 0.8);
  const cl=`${cls}${clipL?' clipL':''}${clipR&&!ongoing?' clipR':''}`;
  return `<div class="${cl}" style="left:${a}%; width:${w}%" data-tip="${esc(tip)}">${label?`<span>${esc(label)}</span>`:''}${ongoing?'<span style="opacity:.8">→</span>':''}</div>`;
}
function lane(key, label, sw, inner, empty){
  if(!tracks[key]) return '';
  const body = inner || `<span class="empty">${empty||'none'}</span>`;
  return `<div class="lane"><div class="llabel">${sw?`<span class="sw" style="background:${sw}"></span>`:''}${label}</div><div class="track" data-track>${gridHtml()}${body}</div></div>`;
}
function gridHtml(){
  let g='';
  // dose start line (day 1) + visit lines
  const d0=xpct(1); if(d0>=0&&d0<=100) g+=`<div class="grid dose0" style="left:${d0}%"></div>`;
  if(tracks.visits) cur.visits.forEach(v=>{ if(v.dy==null)return; const x=xpct(v.dy); if(x>=0&&x<=100) g+=`<div class="grid visit" style="left:${x}%" data-tip="${esc(v.visit)} · day ${v.dy}"></div>`;});
  return g;
}
function renderTimeline(){
  let html='';
  // dosing
  const doseInner = cur.dosing.map(d=>{
    const tip=`<b>${esc(d.trt)}</b><br><span class="k">Dose</span> ${d.dose} ${esc(d.unit)} ${esc(d.freq||'')}<br><span class="k">${esc(d.startDtc)} → ${esc(d.endDtc||'ongoing')}</span><br><span class="k">day ${d.startDy} → ${d.endDy??'…'}</span>`;
    return bar(d.startDy, d.endDy, 'bar dose', `${d.dose} ${d.unit}`, tip, d.endDy==null);
  }).join('');
  html += lane('dose','Dosing','var(--dose)',doseInner,'no exposure');

  // adverse events (one row each)
  let aes = cur.ae.slice();
  if(filt.aeSerious) aes=aes.filter(a=>a.ser==='Y');
  if(filt.aeTE) aes=aes.filter(a=>a.trtem==='Y');
  const aeRows = aes.map(a=>{
    const sev=(a.sev||'').toLowerCase();
    const pt=a.endDy==null||a.endDy===a.startDy;
    const tip=`<b>${esc(a.decod)}</b> <span class="k">(${esc(a.term)})</span><br>`+
      `<span class="k">Severity</span> ${esc(a.sev)}${a.ser==='Y'?' · <span style="color:var(--severe)">SERIOUS</span>':''}<br>`+
      `<span class="k">Causality</span> ${esc(a.rel)}<br>`+
      `<span class="k">Treatment-emergent</span> ${a.trtem==='Y'?'Yes':'No'}<br>`+
      `<span class="k">${esc(a.startDtc)} → ${esc(a.endDtc||'ongoing')} · day ${a.startDy}→${a.endDy??'…'}</span>`;
    const lab = `<span class="dot ${a.trtem==='Y'?'te':'nte'}"></span>${a.ser==='Y'?'<span class="ser">!</span>':''}${esc(a.decod)}`;
    let a0=xpct(a.startDy), b0=(pt?a0:xpct(a.endDy)); let clipL=a0<0,clipR=b0>100; a0=clamp(a0,0,100);b0=clamp(b0,0,100);
    const w=Math.max(b0-a0,0.8);
    return `<div class="lane"><div class="llabel"></div><div class="track" data-track>${gridHtml()}<div class="ae ${sev}${pt?' point':''}${clipL?' clipL':''}" style="left:${a0}%; width:${pt?'auto':w+'%'}" data-tip="${esc(tip)}">${lab}</div></div></div>`;
  }).join('');
  if(tracks.ae){
    html += `<div class="lane"><div class="llabel"><span class="sw" style="background:var(--moderate)"></span>Adverse events</div><div class="track" data-track>${gridHtml()}${aes.length?'':'<span class="empty">'+(cur.ae.length?'none match filter':'no adverse events')+'</span>'}</div></div>`;
    html += aeRows;
  }

  // con meds
  const cmInner = cur.cm.map(c=>{
    const tip=`<b>${esc(c.decod||c.trt)}</b> <span class="k">(${esc(c.trt)})</span><br><span class="k">${esc(c.indc||'')}</span><br><span class="k">${esc(c.startDtc)} → ${esc(c.endDtc||'ongoing')} · day ${c.startDy}→${c.endDy??'…'}</span>`;
    return bar(c.startDy, c.endDy, 'bar cm', esc(c.decod||c.trt), tip, c.endDy==null);
  }).join('');
  html += lane('cm','Con meds','var(--cm)',cmInner,'no con meds');

  el('lanes').innerHTML = html;
  attachTips();
}

/* ================= findings ================= */
function findingsTable(items, pre, title){
  if(!items.length) return '';
  const visits=[...new Map(cur.visits.map(v=>[v.visitnum,v])).values()].sort((a,b)=>a.visitnum-b.visitnum);
  let tests=[...new Map(items.map(i=>[i.testcd,{code:i.testcd,name:i.test,unit:i.unit}])).values()];
  const val=(tc,vn)=>items.find(i=>i.testcd===tc && i.visitnum===vn);
  if(pre==='LB' && filt.labAbn){
    tests=tests.filter(t=>items.some(i=>i.testcd===t.code && i.nrind && i.nrind!=='NORMAL'));
  }
  if(!tests.length) return `<div class="fcard"><h3><span class="sw"></span>${title}</h3><div class="fnote">no ${filt.labAbn?'abnormal ':''}results</div></div>`;
  const head = `<tr><th>Test</th>${visits.map(v=>`<th>${esc(shortVisit(v.visit))}</th>`).join('')}</tr>`;
  const rows = tests.map(t=>{
    const cells = visits.map(v=>{
      const it=val(t.code,v.visitnum);
      if(!it) return `<td>·</td>`;
      const show = it.num!=null ? it.num : it.res;
      const ind = pre==='LB' ? it.nrind : '';
      const abn = ind && ind!=='NORMAL';
      const bl = it.blfl==='Y';
      return `<td class="${abn?'abn '+ind:''}"><span class="cell"><span class="${bl?'bl':''}">${esc(show)}</span>${abn?`<span class="ind ${ind}"></span>`:''}</span></td>`;
    }).join('');
    return `<tr><td>${esc(t.code)} <span style="color:var(--muted);font-weight:400">${esc(t.unit||'')}</span></td>${cells}</tr>`;
  }).join('');
  return `<div class="fcard"><h3><span class="sw"></span>${title}</h3><div class="ftable-scroll"><table class="ftable"><thead>${head}</thead><tbody>${rows}</tbody></table></div>
    <div class="fnote">${pre==='LB'?'● range indicator · ':''}<span class="bl" style="font-family:var(--mono)">bold</span> = baseline</div></div>`;
}
function shortVisit(v){ return (v||'').replace('SCREENING','SCR').replace('BASELINE','BL').replace('WEEK ','W'); }

/* trend charts — one mini SVG per test across visits, reference band for labs */
function findingsChart(items, pre, title){
  if(!items.length) return '';
  const visits=[...new Map(cur.visits.map(v=>[v.visitnum,v])).values()].sort((a,b)=>a.visitnum-b.visitnum);
  let tests=[...new Map(items.map(i=>[i.testcd,{code:i.testcd,name:i.test,unit:i.unit}])).values()];
  if(pre==='LB' && filt.labAbn) tests=tests.filter(t=>items.some(i=>i.testcd===t.code && i.nrind && i.nrind!=='NORMAL'));
  if(!tests.length) return `<div class="fcard"><h3><span class="sw"></span>${title}</h3><div class="fnote">no ${filt.labAbn?'abnormal ':''}results</div></div>`;
  const charts = tests.map(t=>{
    const pts = visits.map((v,i)=>{ const it=items.find(x=>x.testcd===t.code && x.visitnum===v.visitnum);
      return it? {i, v:it.num, res:it.res, ind:it.nrind, bl:it.blfl==='Y', lo:it.lo, hi:it.hi, visit:v.visit}:null; }).filter(Boolean);
    return spark(t, pts, visits.length, pre);
  }).join('');
  return `<div class="fcard"><h3><span class="sw"></span>${title}</h3><div class="charts">${charts}</div>
    <div class="fnote">${pre==='LB'?'shaded band = reference range · ':''}ring = baseline visit · hover a point for detail</div></div>`;
}
function spark(t, pts, nCols, pre){
  const W=150,H=56, padX=9, padTop=6, padBot=10;
  const numeric = pts.filter(p=>p.v!=null);
  if(!numeric.length) return `<div class="chart"><div class="ct"><span class="cc">${esc(t.code)}</span><span class="cu">${esc(t.unit||'')}</span></div><svg viewBox="0 0 ${W} ${H}"></svg></div>`;
  let vals=numeric.map(p=>p.v), lo=Math.min(...vals), hi=Math.max(...vals);
  const rl = pre==='LB' ? numeric.find(p=>p.lo!=null && p.hi!=null) : null;
  if(rl){ lo=Math.min(lo,rl.lo); hi=Math.max(hi,rl.hi); }
  if(hi===lo){ hi=lo+1; lo=lo-1; }
  const pad=(hi-lo)*0.14; lo-=pad; hi+=pad;
  const x=i=> nCols<=1 ? W/2 : padX + i*(W-2*padX)/(nCols-1);
  const y=v=> padTop + (H-padTop-padBot)*(1-(v-lo)/(hi-lo));
  let band='';
  if(rl){ const yt=y(rl.hi), yb=y(rl.lo);
    band=`<rect class="band" x="0" y="${yt.toFixed(1)}" width="${W}" height="${(yb-yt).toFixed(1)}"/>`+
         `<line class="rl" x1="0" y1="${yt.toFixed(1)}" x2="${W}" y2="${yt.toFixed(1)}"/>`+
         `<line class="rl" x1="0" y1="${yb.toFixed(1)}" x2="${W}" y2="${yb.toFixed(1)}"/>`; }
  const line = numeric.length>1 ? `<polyline class="ln" points="${numeric.map(p=>x(p.i).toFixed(1)+','+y(p.v).toFixed(1)).join(' ')}"/>` : '';
  const dots = numeric.map(p=>{
    const cls = pre==='LB' ? (p.ind||'NORMAL') : 'vs';
    const tip=`<b>${esc(t.code)}</b> ${esc(p.res)} ${esc(t.unit||'')}<br><span class="k">${esc(p.visit)}</span>`+
      `${pre==='LB'&&p.ind&&p.ind!=='NORMAL'?`<br><span style="color:var(--high)">${esc(p.ind)}</span>`:''}${p.bl?'<br><span class="k">baseline</span>':''}`;
    return `${p.bl?`<circle class="bl-ring" cx="${x(p.i).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="4.4"/>`:''}`+
      `<circle class="pt ${cls}" cx="${x(p.i).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="2.7" data-tip="${esc(tip)}"/>`;
  }).join('');
  return `<div class="chart"><div class="ct"><span class="cc">${esc(t.code)}</span><span class="cu">${esc(t.unit||'')}</span></div>
    <svg viewBox="0 0 ${W} ${H}">${band}${line}${dots}</svg></div>`;
}

function renderFindings(){
  const render = lens.findings==='chart' ? findingsChart : findingsTable;
  let html='';
  if(tracks.vs) html += render(cur.vs,'VS','Vital signs');
  if(tracks.lb) html += render(cur.lb,'LB','Laboratory');
  el('findings').innerHTML = html || '<div class="fcard"><div class="fnote">Vitals and labs hidden — enable them under “Show”.</div></div>';
  attachTips();
}

/* ================= cohort overview ================= */
function renderCohort(){
  const cmin = Math.max(Math.min(...SUBS.map(s=>s.dayRange.min)), -28);
  const cmax = Math.max(...SUBS.map(s=>s.dayRange.max)) + 2;
  const xp = d => ((d-cmin)/(cmax-cmin))*100;
  const step=niceStep(cmax-cmin); let ax=''; const start=Math.ceil(cmin/step)*step;
  for(let d=start; d<=cmax; d+=step){ const x=xp(d); if(x<-1||x>101) continue;
    ax+=`<div class="tick" style="left:${x}%"><span class="lab">D${Math.round(d)}</span></div>`; }
  const rows = SUBS.map(s=>{
    const done = !s.disposition || s.disposition.decod==='COMPLETED';
    let tk='';
    const d0=xp(1); if(d0>=0&&d0<=100) tk+=`<div class="cd0" style="left:${d0}%"></div>`;
    s.visits.forEach(v=>{ if(v.dy==null) return; const x=xp(v.dy); if(x>=0&&x<=100) tk+=`<div class="cvisit" style="left:${x}%"></div>`; });
    s.dosing.forEach(dz=>{ if(dz.startDy==null) return; const a=Math.max(0,xp(dz.startDy)), b=Math.min(100,xp(dz.endDy??s.dayRange.max));
      tk+=`<div class="cdose" style="left:${a}%; width:${Math.max(0.6,b-a).toFixed(2)}%"></div>`; });
    s.ae.forEach(a=>{ if(a.startDy==null) return; const x=xp(a.startDy); if(x<0||x>100) return; const sev=(a.sev||'').toLowerCase();
      const tip=`<b>${esc(a.decod)}</b> · ${esc(a.sev)}${a.ser==='Y'?' · <span style="color:var(--severe)">SERIOUS</span>':''}<br><span class="k">day ${a.startDy}</span>`;
      tk+=`<div class="cae ${sev}${a.ser==='Y'?' ser':''}" style="left:${x}%" data-tip="${esc(tip)}"></div>`; });
    if(!done && s.disposition && s.disposition.dy!=null){ const x=xp(s.disposition.dy); if(x>=0&&x<=100)
      tk+=`<div class="cdisc" style="left:${x}%" data-tip="Discontinued — ${esc(titl(s.disposition.decod))} · day ${s.disposition.dy}"></div>`; }
    return `<div class="crow" data-sub="${s.usubjid}" role="button" tabindex="0">
      <div class="clab"><span class="cid">${esc(s.usubjid.replace('ABC-01-',''))}</span>
        <span class="armbadge ${s.armcd}" style="padding:2px 7px;font-size:9.5px">${esc(s.arm)}</span>
        <span class="cstat ${done?'done':'disc'}">${done?'✓':'✕'}</span></div>
      <div class="ctrack">${tk}</div></div>`;
  }).join('');
  el('cohortView').innerHTML = `<div class="cohort">
    <div class="clegend">
      <span><span class="d" style="background:var(--mild)"></span>mild</span>
      <span><span class="d" style="background:var(--moderate)"></span>moderate</span>
      <span><span class="d" style="background:var(--severe)"></span>severe AE</span>
      <span>◎ ring = serious</span>
      <span><span style="display:inline-block;width:16px;height:6px;background:var(--dose);border-radius:2px"></span> dosing</span>
      <span style="color:var(--severe)">✕ discontinued</span></div>
    <div class="caxis">${ax}</div>${rows}</div>`;
  el('cohortView').querySelectorAll('.crow').forEach(r=>{
    const go=()=>{ setView('subject'); setSubject(r.dataset.sub); };
    r.onclick=go; r.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(); } };
  });
  attachTips();
}
function setView(m){
  mode=m;
  el('subjectView').hidden = m!=='subject';
  el('cohortView').hidden = m!=='cohort';
  el('subpick').style.display = m==='subject' ? '' : 'none';
  el('viewtitle').textContent = m==='subject' ? 'Subject Journey' : 'Cohort Overview';
  el('viewseg').querySelectorAll('button').forEach(b=>b.classList.toggle('on', b.dataset.view===m));
  if(m==='cohort') renderCohort();
}

/* ================= tooltip + pan ================= */
const tip=el('tip');
function attachTips(){
  document.querySelectorAll('[data-tip]').forEach(node=>{
    node.onmousemove=e=>{ tip.innerHTML=node.dataset.tip; tip.classList.add('on');
      let x=e.clientX+14, y=e.clientY+14;
      if(x+tip.offsetWidth>innerWidth-8) x=e.clientX-tip.offsetWidth-14;
      if(y+tip.offsetHeight>innerHeight-8) y=e.clientY-tip.offsetHeight-14;
      tip.style.left=x+'px'; tip.style.top=y+'px'; };
    node.onmouseleave=()=>tip.classList.remove('on');
  });
}
/* Pan is bound ONCE to the stable #lanes container. The inner lanes get rebuilt
   on every frame, but the listener host and the document-level move/up handlers
   survive that, so the drag keeps tracking. */
let panBound=false;
function setupPan(){
  if(panBound) return; panBound=true;
  const host=el('lanes');
  host.addEventListener('pointerdown', e=>{
    const gutter = innerWidth<=640 ? 76 : 112;
    const w = Math.max(80, host.clientWidth - gutter);   // track pixels ≈ lanes minus label gutter
    const span=view.max-view.min, startX=e.clientX, v0={...view};
    let moved=false; host.style.cursor='grabbing';
    const move=ev=>{
      const dxDays=(ev.clientX-startX)/w*span; if(Math.abs(ev.clientX-startX)>2) moved=true;
      const fullLo=cur.dayRange.min-2, fullHi=cur.dayRange.max+2;
      let mn=v0.min-dxDays, mx=v0.max-dxDays;
      if(mn<fullLo){mx+=fullLo-mn; mn=fullLo;} if(mx>fullHi){mn-=mx-fullHi; mx=fullHi;}
      view={min:mn,max:mx}; renderAxis(); renderTimeline();
    };
    const up=()=>{ host.style.cursor=''; document.removeEventListener('pointermove',move); document.removeEventListener('pointerup',up);
      if(moved) tip.classList.remove('on'); };
    document.addEventListener('pointermove',move); document.addEventListener('pointerup',up);
  });
  // wheel to zoom on the timeline
  host.addEventListener('wheel', e=>{ if(!e.ctrlKey && Math.abs(e.deltaY)<1) return; e.preventDefault(); zoom(e.deltaY>0?1.15:0.87); }, {passive:false});
}

function renderAll(){ renderPicker(); renderSummary(); renderControls(); renderAxis(); renderTimeline(); renderFindings(); }
el('viewseg').querySelectorAll('button').forEach(b=>b.onclick=()=>setView(b.dataset.view));
view = defaultView(cur);
setupPan();
renderAll();
addEventListener('resize', ()=>{ if(mode==='subject'){ renderAxis(); renderTimeline(); } else renderCohort(); });
</script>
"""


def main():
    with open(DATA) as f:
        data_str = f.read()
    data_str = data_str.replace("</", "<\\/")
    html = TEMPLATE.replace("__DATA__", data_str)
    with open(OUT, "w") as f:
        f.write(html)
    d = json.loads(open(DATA).read())
    print(f"wrote {OUT}  ({len(html)//1024} KB, {len(d['subjects'])} subjects)")


if __name__ == "__main__":
    main()
