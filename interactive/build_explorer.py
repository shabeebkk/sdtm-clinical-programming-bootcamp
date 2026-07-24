#!/usr/bin/env python3
"""
build_explorer.py — stitch lineage_data.json into a self-contained HTML tool.

The data (real ABC-01 metadata + values) is INLINED so the page is one file with
no external requests — it opens from disk, a server, or an Artifact identically.

Run after build_lineage_data.py:  python3 build_explorer.py
Writes: sdtm_lineage_explorer.html
"""

import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "lineage_data.json")
OUT = os.path.join(HERE, "sdtm_lineage_explorer.html")

TEMPLATE = r"""<title>SDTM Lineage Explorer — ABC-01</title>
<style>
  :root{
    --ink:#0F2E3D; --ink-2:#33525f; --muted:#5A7682;
    --bg:#eef3f4; --panel:#ffffff; --panel-2:#f3f8f8; --rail:#f7fafa;
    --line:#d3e0e3; --line-2:#bcd0d4;
    --accent:#0E7C86; --accent-2:#0a5a62;
    --derive:#C56A1B; --derive-bg:#fbeede; --derive-line:#ecc99a;
    --assign:#5A7682; --assign-bg:#eef2f3;
    --collect:#0E7C86; --collect-bg:#e2f1f1;
    --req:#C0455B; --exp:#B5771A; --perm:#5A7682;
    --gotcha:#E8833A; --gotcha-bg:#fdf1da; --gotcha-line:#eac48a;
    --field:#fbfdfd;
    --shadow:0 1px 2px rgba(15,46,61,.05), 0 10px 30px rgba(15,46,61,.07);
    --mono:ui-monospace,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace;
    --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  }
  @media (prefers-color-scheme:dark){
    :root{
      --ink:#e7f0f2; --ink-2:#b6cace; --muted:#89a3ab;
      --bg:#0b1315; --panel:#111f22; --panel-2:#0e1a1d; --rail:#0e1a1c;
      --line:#243d42; --line-2:#34545b;
      --accent:#4fc2cc; --accent-2:#7fd6de;
      --derive:#e79a4d; --derive-bg:#291f12; --derive-line:#5a4523;
      --assign:#89a3ab; --assign-bg:#18262a;
      --collect:#4fc2cc; --collect-bg:#122a2c;
      --req:#ef8a9c; --exp:#e0b25e; --perm:#89a3ab;
      --gotcha:#f0a35d; --gotcha-bg:#2a2013; --gotcha-line:#5c451f;
      --field:#0d191c;
      --shadow:0 1px 2px rgba(0,0,0,.3), 0 12px 34px rgba(0,0,0,.4);
    }
  }
  :root[data-theme="light"]{
    --ink:#0F2E3D; --ink-2:#33525f; --muted:#5A7682;
    --bg:#eef3f4; --panel:#ffffff; --panel-2:#f3f8f8; --rail:#f7fafa;
    --line:#d3e0e3; --line-2:#bcd0d4; --accent:#0E7C86; --accent-2:#0a5a62;
    --derive:#C56A1B; --derive-bg:#fbeede; --derive-line:#ecc99a;
    --assign:#5A7682; --assign-bg:#eef2f3; --collect:#0E7C86; --collect-bg:#e2f1f1;
    --req:#C0455B; --exp:#B5771A; --perm:#5A7682;
    --gotcha:#E8833A; --gotcha-bg:#fdf1da; --gotcha-line:#eac48a;
    --field:#fbfdfd; --shadow:0 1px 2px rgba(15,46,61,.05), 0 10px 30px rgba(15,46,61,.07);
  }
  :root[data-theme="dark"]{
    --ink:#e7f0f2; --ink-2:#b6cace; --muted:#89a3ab;
    --bg:#0b1315; --panel:#111f22; --panel-2:#0e1a1d; --rail:#0e1a1c;
    --line:#243d42; --line-2:#34545b; --accent:#4fc2cc; --accent-2:#7fd6de;
    --derive:#e79a4d; --derive-bg:#291f12; --derive-line:#5a4523;
    --assign:#89a3ab; --assign-bg:#18262a; --collect:#4fc2cc; --collect-bg:#122a2c;
    --req:#ef8a9c; --exp:#e0b25e; --perm:#89a3ab;
    --gotcha:#f0a35d; --gotcha-bg:#2a2013; --gotcha-line:#5c451f;
    --field:#0d191c; --shadow:0 1px 2px rgba(0,0,0,.3), 0 12px 34px rgba(0,0,0,.4);
  }

  *{box-sizing:border-box}
  html,body{margin:0}
  body{font-family:var(--sans); color:var(--ink); background:var(--bg); -webkit-font-smoothing:antialiased; line-height:1.5}
  .app{max-width:1240px; margin:0 auto; min-height:100vh; padding:clamp(14px,2.2vw,28px)}

  /* header */
  header.top{display:flex; align-items:flex-end; gap:18px 26px; flex-wrap:wrap; margin-bottom:6px}
  .brand .kick{font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--accent-2); font-weight:700; margin:0 0 5px}
  .brand h1{font-size:clamp(21px,2.6vw,28px); margin:0; letter-spacing:-.02em; font-weight:800}
  .brand p{margin:5px 0 0; color:var(--ink-2); font-size:14px; max-width:56ch}
  .search{margin-left:auto; position:relative; min-width:min(320px,100%)}
  .search input{font-family:var(--sans); font-size:14px; width:100%; padding:11px 14px 11px 38px; border:1.5px solid var(--line-2); border-radius:11px; background:var(--panel); color:var(--ink)}
  .search input:focus{outline:none; border-color:var(--accent); box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 20%, transparent)}
  .search svg{position:absolute; left:13px; top:50%; transform:translateY(-50%); width:16px; height:16px; color:var(--muted)}
  .search .results{position:absolute; z-index:20; top:calc(100% + 6px); left:0; right:0; background:var(--panel); border:1px solid var(--line); border-radius:12px; box-shadow:var(--shadow); max-height:340px; overflow:auto; display:none}
  .search .results.on{display:block}
  .search .results button{display:flex; gap:10px; align-items:baseline; width:100%; text-align:left; background:none; border:0; border-bottom:1px solid var(--line); padding:9px 13px; cursor:pointer; color:var(--ink)}
  .search .results button:hover{background:var(--panel-2)}
  .search .results .rv{font-family:var(--mono); font-weight:700; font-size:13px; color:var(--accent-2)}
  .search .results .rd{font-size:12px; color:var(--muted)}
  .search .results .rdom{font-family:var(--mono); font-size:11px; color:var(--muted); margin-left:auto}

  /* layout */
  .board{display:grid; grid-template-columns:270px 1fr; gap:18px; margin-top:18px; align-items:start}
  @media (max-width:880px){ .board{grid-template-columns:1fr} }

  .rail{background:var(--rail); border:1px solid var(--line); border-radius:15px; overflow:hidden; box-shadow:var(--shadow)}
  .doms{display:flex; flex-wrap:wrap; gap:6px; padding:12px 12px 4px}
  .doms button{font-family:var(--mono); font-size:12.5px; font-weight:700; padding:6px 11px; border-radius:8px; border:1.5px solid var(--line-2); background:var(--panel); color:var(--ink-2); cursor:pointer}
  .doms button:hover{border-color:var(--accent)}
  .doms button.on{background:var(--accent); border-color:var(--accent); color:#fff}
  .domhead{padding:11px 15px 8px; border-top:1px solid var(--line); margin-top:8px}
  .domhead .dc{font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); font-weight:700}
  .domhead .ds{font-size:12.5px; color:var(--ink-2); margin-top:2px}
  .vars{list-style:none; margin:0; padding:6px; max-height:60vh; overflow:auto}
  .vars li button{display:flex; align-items:center; gap:9px; width:100%; text-align:left; border:0; background:none; padding:8px 10px; border-radius:8px; cursor:pointer; color:var(--ink)}
  .vars li button:hover{background:var(--panel-2)}
  .vars li button.on{background:color-mix(in srgb,var(--accent) 12%, transparent)}
  .vars .odot{width:8px; height:8px; border-radius:50%; flex:none}
  .odot.Collected{background:var(--collect)} .odot.Derived{background:var(--derive)}
  .odot.Assigned{background:var(--assign)} .odot.Protocol{background:#8a6fbf}
  .vars .vn{font-family:var(--mono); font-weight:600; font-size:13px}
  .vars .vl{font-size:11.5px; color:var(--muted); margin-left:auto; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:120px}

  /* detail */
  .detail{background:var(--panel); border:1px solid var(--line); border-radius:15px; box-shadow:var(--shadow); overflow:hidden}
  .dhead{padding:18px 22px 16px; border-bottom:1px solid var(--line); background:var(--panel-2)}
  .dhead .row1{display:flex; align-items:baseline; gap:12px; flex-wrap:wrap}
  .dhead .vname{font-family:var(--mono); font-size:22px; font-weight:800; letter-spacing:-.01em; color:var(--accent-2)}
  .dhead .vlabel{font-size:15px; color:var(--ink-2)}
  .dhead .meta{display:flex; gap:8px 14px; flex-wrap:wrap; margin-top:11px; align-items:center}
  .badge{font-size:10.5px; letter-spacing:.05em; text-transform:uppercase; font-weight:700; padding:3px 9px; border-radius:20px; border:1px solid}
  .badge.origin.Collected{color:var(--collect); border-color:var(--collect); background:var(--collect-bg)}
  .badge.origin.Derived{color:var(--derive); border-color:var(--derive-line); background:var(--derive-bg)}
  .badge.origin.Assigned{color:var(--assign); border-color:var(--line-2); background:var(--assign-bg)}
  .badge.origin.Protocol{color:#8a6fbf; border-color:#c4b4e0; background:#f1ecf8}
  .core{font-family:var(--mono); font-size:11.5px; font-weight:700}
  .core.Req{color:var(--req)} .core.Exp{color:var(--exp)} .core.Perm{color:var(--perm)}
  .core .k{color:var(--muted); font-family:var(--sans); font-weight:600; text-transform:uppercase; letter-spacing:.05em; font-size:10.5px; margin-right:4px}
  .typ{font-family:var(--mono); font-size:12px; color:var(--muted)}

  /* pipeline */
  .pipe{padding:20px 22px; display:grid; grid-template-columns:1fr auto 1.2fr auto 1fr; gap:0 14px; align-items:stretch}
  @media (max-width:760px){ .pipe{grid-template-columns:1fr; gap:14px 0} .pipe .arrow{transform:rotate(90deg); justify-self:center; height:20px} }
  .stage{border:1px solid var(--line); border-radius:13px; padding:14px 15px; background:var(--field); display:flex; flex-direction:column; min-height:150px}
  .stage.rule{background:var(--panel-2)}
  .stage .sh{font-size:10.5px; letter-spacing:.12em; text-transform:uppercase; font-weight:700; color:var(--muted); margin:0 0 10px; display:flex; align-items:center; gap:7px}
  .stage .sh .n{width:18px; height:18px; border-radius:50%; background:var(--accent); color:#fff; font-family:var(--mono); font-size:11px; display:grid; place-items:center; font-weight:700}
  .kv{font-size:12px; color:var(--muted); margin:0 0 2px}
  .mv{font-family:var(--mono); font-size:14px; color:var(--ink); font-weight:600; word-break:break-word}
  .mv.big{font-size:16px}
  .srcvar{display:flex; flex-direction:column; gap:9px}
  .srcvar .item{border-left:2px solid var(--line-2); padding-left:10px}
  .val{margin-top:auto; padding-top:12px}
  .val .chip{display:inline-block; font-family:var(--mono); font-size:13px; font-weight:700; padding:5px 10px; border-radius:8px; border:1px dashed var(--line-2); background:var(--panel); color:var(--ink)}
  .val .vlab{font-size:10.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); font-weight:700; margin-bottom:5px}
  .val .none{color:var(--muted); font-style:italic; font-size:12.5px; font-family:var(--sans)}
  .stage.sdtm{border-color:var(--accent); box-shadow:0 0 0 1px var(--accent) inset}
  .stage.sdtm .val .chip{border-style:solid; border-color:var(--accent); background:var(--collect-bg); color:var(--accent-2)}
  .rule-text{font-family:var(--mono); font-size:13px; line-height:1.5; color:var(--ink)}
  .ct{margin-top:11px}
  .ct .vlab{font-size:10.5px; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); font-weight:700; margin-bottom:4px}
  .ct .cl{font-family:var(--mono); font-size:12.5px; color:var(--accent-2); font-weight:700}
  .arrow{display:flex; align-items:center; color:var(--line-2)}
  .arrow svg{width:22px; height:22px}

  .gotcha{margin:0 22px 20px; border:1px solid var(--gotcha-line); background:var(--gotcha-bg); border-radius:12px; padding:12px 15px; display:flex; gap:11px; align-items:flex-start}
  .gotcha svg{width:18px; height:18px; color:var(--gotcha); flex:none; margin-top:1px}
  .gotcha .gh{font-size:11px; letter-spacing:.08em; text-transform:uppercase; font-weight:700; color:var(--gotcha); margin:0 0 2px}
  .gotcha p{margin:0; font-size:13.5px; color:var(--ink); line-height:1.5}

  .worked{margin:0 22px 20px; border-top:1px dashed var(--line); padding-top:14px; font-size:12.5px; color:var(--muted); display:flex; gap:8px 14px; flex-wrap:wrap; align-items:center}
  .worked .wk{font-weight:700; color:var(--ink-2)}
  .worked .rec{font-family:var(--mono); color:var(--ink); font-size:12.5px}

  footer{margin-top:22px; padding-top:15px; border-top:1px solid var(--line); font-size:12px; color:var(--muted); display:flex; gap:8px 16px; flex-wrap:wrap; align-items:center}
  footer .b{font-weight:700; color:var(--accent-2)}
  .legend{display:flex; gap:12px; flex-wrap:wrap; margin-left:auto}
  .legend span{display:inline-flex; align-items:center; gap:5px}
  .legend .d{width:8px; height:8px; border-radius:50%}
  a{color:var(--accent-2)}
  @media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>

<div class="app">
  <header class="top">
    <div class="brand">
      <p class="kick">SDTM Bootcamp · Study ABC-01 · Data Lineage</p>
      <h1>SDTM Lineage Explorer</h1>
      <p>Pick any SDTM variable and see its whole life — the CRF field it came from, the rule that made it, and its value in one real record. Every value here is genuine ABC-01 data.</p>
    </div>
    <div class="search">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="M14 14l4 4" stroke-linecap="round"/></svg>
      <input id="q" type="text" placeholder="Search any variable — USUBJID, AESTDTC, VSSTRESN…" autocomplete="off" spellcheck="false" aria-label="Search variables">
      <div class="results" id="results"></div>
    </div>
  </header>

  <div class="board">
    <nav class="rail">
      <div class="doms" id="doms"></div>
      <div class="domhead"><div class="dc" id="domClass"></div><div class="ds" id="domStruct"></div></div>
      <ul class="vars" id="vars"></ul>
    </nav>
    <main class="detail" id="detail"></main>
  </div>

  <footer>
    <span class="b">Reference tool</span>
    <span>Synthetic ABC-01 data — no real patients.</span>
    <span>Lineage from the study mapping specification.</span>
    <span class="legend">
      <span><span class="d" style="background:var(--collect)"></span>Collected</span>
      <span><span class="d" style="background:var(--derive)"></span>Derived</span>
      <span><span class="d" style="background:var(--assign)"></span>Assigned</span>
      <span><span class="d" style="background:#8a6fbf"></span>Protocol</span>
    </span>
  </footer>
</div>

<script type="application/json" id="lineage">__DATA__</script>
<script>
const DATA = JSON.parse(document.getElementById('lineage').textContent);
const DOMS = DATA.domains;
let curDom = DOMS[0], curVar = curDom.variables[0];

const ARROW = '<span class="arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h15M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
const el = id => document.getElementById(id);
const esc = s => (s==null?'':String(s)).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

// caption fields per domain for the worked-record line
const CAP = {DM:['USUBJID'], AE:['USUBJID','AESEQ','AETERM'], SUPPAE:['USUBJID','QNAM','IDVARVAL'],
  VS:['USUBJID','VSTESTCD','VISIT'], LB:['USUBJID','LBTESTCD','VISIT'], EX:['USUBJID','EXTRT'],
  CM:['USUBJID','CMTRT'], DS:['USUBJID','DSDECOD']};

function rawSourceCols(d, v){
  let cols = (v.srcVar||'').split(/[,/]/).map(s=>s.trim()).filter(Boolean);
  const raw = d.example.raw || {};
  let present = cols.filter(c => raw[c] !== undefined && raw[c] !== '');
  // Findings result columns name the source generically; the real column is the test code.
  if(!present.length && (d.name==='VS'||d.name==='LB')){
    const tc = d.example.sdtm[d.name+'TESTCD'];
    if(tc && raw[tc]!==undefined) present = [tc];
  }
  return present;
}

function renderDoms(){
  el('doms').innerHTML = DOMS.map(d =>
    `<button class="${d===curDom?'on':''}" data-d="${d.name}">${d.name}</button>`).join('');
  el('doms').querySelectorAll('button').forEach(b => b.onclick = () => {
    curDom = DOMS.find(x=>x.name===b.dataset.d); curVar = curDom.variables[0];
    renderDoms(); renderVars(); renderDetail();
  });
  el('domClass').textContent = curDom.class + ' domain';
  el('domStruct').textContent = curDom.structure;
}

function renderVars(){
  el('vars').innerHTML = curDom.variables.map(v =>
    `<li><button class="${v===curVar?'on':''}" data-v="${v.name}">
       <span class="odot ${v.origin}"></span>
       <span class="vn">${v.name}</span>
       <span class="vl">${esc(v.label)}</span>
     </button></li>`).join('');
  el('vars').querySelectorAll('button').forEach(b => b.onclick = () => {
    curVar = curDom.variables.find(x=>x.name===b.dataset.v);
    renderVars(); renderDetail();
  });
}

function renderDetail(){
  const d = curDom, v = curVar, ex = d.example;
  const sdtmVal = ex.sdtm[v.name];

  // stage 1 — source
  let srcHtml;
  const isLiteral = v.origin==='Assigned' && /literal|constant/i.test(v.rule||'');
  if(isLiteral){
    srcHtml = `<div class="kv">Not collected</div><div class="mv big">${esc(v.rule)}</div>`;
  } else {
    const cols = rawSourceCols(d, v);
    if(cols.length){
      srcHtml = `<div class="kv">${esc(v.srcData||'raw')}</div><div class="srcvar">` +
        cols.map(c => `<div class="item"><div class="mv">${esc(c)}</div>
          <div class="val" style="margin-top:6px;padding-top:0">
            <span class="chip">${esc(ex.raw[c])}</span></div></div>`).join('') + `</div>`;
    } else if(v.srcVar){
      srcHtml = `<div class="kv">${esc(v.srcData||'raw')}</div><div class="mv">${esc(v.srcVar)}</div>
        <div class="val"><div class="none">no single source column in this record</div></div>`;
    } else {
      srcHtml = `<div class="kv">Origin</div><div class="mv big">${esc(v.origin)}</div>
        <div class="val"><div class="none">not traced to a raw column</div></div>`;
    }
  }

  // stage 3 — sdtm value
  const valHtml = (sdtmVal!==undefined && sdtmVal!=='')
    ? `<span class="chip">${esc(sdtmVal)}</span>`
    : `<div class="none">null in this record</div>`;

  const ctHtml = v.ct ? `<div class="ct"><div class="vlab">Controlled terminology</div><div class="cl">${esc(v.ct)}</div></div>` : '';
  const gotcha = v.notes ? `
    <div class="gotcha">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <div><p class="gh">Watch out</p><p>${esc(v.notes)}</p></div>
    </div>` : '';

  const cap = (CAP[d.name]||['USUBJID']).map(k=>ex.sdtm[k]).filter(Boolean).join(' · ');

  el('detail').innerHTML = `
    <div class="dhead">
      <div class="row1"><span class="vname">${v.name}</span><span class="vlabel">${esc(v.label)}</span></div>
      <div class="meta">
        <span class="badge origin ${v.origin}">${esc(v.origin)}</span>
        <span class="core ${v.core}"><span class="k">Core</span>${esc(v.core)}</span>
        <span class="typ">${esc(v.type)}</span>
        <span class="typ">· ${d.name} — ${esc(d.class)}</span>
      </div>
    </div>
    <div class="pipe">
      <div class="stage source">
        <p class="sh"><span class="n">1</span> Source</p>${srcHtml}
      </div>
      ${ARROW}
      <div class="stage rule">
        <p class="sh"><span class="n">2</span> Rule</p>
        <div class="rule-text">${esc(v.rule)||'<span class="none" style="font-family:var(--sans)">Straight copy</span>'}</div>
        ${ctHtml}
      </div>
      ${ARROW}
      <div class="stage sdtm">
        <p class="sh"><span class="n">3</span> SDTM value</p>
        <div class="kv">${d.name}.${v.name}</div>
        <div class="val"><div class="vlab">In the worked record</div>${valHtml}</div>
      </div>
    </div>
    ${gotcha}
    <div class="worked"><span class="wk">Worked record:</span> <span class="rec">${esc(cap)}</span>
      <span>— one real row from the built ${d.name} dataset.</span></div>
  `;
}

/* search across every variable in every domain */
const qi = el('q'), res = el('results');
const INDEX = DOMS.flatMap(d => d.variables.map(v => ({d, v})));
qi.addEventListener('input', () => {
  const q = qi.value.trim().toUpperCase();
  if(!q){ res.classList.remove('on'); res.innerHTML=''; return; }
  const hits = INDEX.filter(x => x.v.name.toUpperCase().includes(q) || x.v.label.toUpperCase().includes(q)).slice(0,40);
  res.innerHTML = hits.length ? hits.map(x =>
    `<button data-d="${x.d.name}" data-v="${x.v.name}">
       <span class="rv">${x.v.name}</span><span class="rd">${esc(x.v.label)}</span>
       <span class="rdom">${x.d.name}</span></button>`).join('')
    : `<button disabled style="cursor:default;color:var(--muted)">No variable matches “${esc(qi.value)}”</button>`;
  res.classList.add('on');
  res.querySelectorAll('button[data-v]').forEach(b => b.onclick = () => {
    curDom = DOMS.find(x=>x.name===b.dataset.d);
    curVar = curDom.variables.find(x=>x.name===b.dataset.v);
    qi.value=''; res.classList.remove('on');
    renderDoms(); renderVars(); renderDetail();
    el('detail').scrollIntoView({behavior:'smooth', block:'nearest'});
  });
});
document.addEventListener('click', e => { if(!e.target.closest('.search')) res.classList.remove('on'); });

renderDoms(); renderVars(); renderDetail();
</script>
"""


def main():
    with open(DATA) as f:
        data_str = f.read()
    # keep the JSON safe inside a <script> block
    data_str = data_str.replace("</", "<\\/")
    html = TEMPLATE.replace("__DATA__", data_str)
    with open(OUT, "w") as f:
        f.write(html)
    d = json.loads(open(DATA).read())
    nv = sum(len(x["variables"]) for x in d["domains"])
    print(f"wrote {OUT}  ({len(html)//1024} KB, {len(d['domains'])} domains, {nv} variables)")


if __name__ == "__main__":
    main()
