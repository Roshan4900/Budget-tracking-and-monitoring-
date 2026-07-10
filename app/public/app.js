/* ============================================================
   Sudurpaschim Province Budget Visualizer — RENDERING
   ------------------------------------------------------------
   Data is loaded from the API (/api/data) when the server is
   running, and falls back to window.BUDGET_FALLBACK (data.js)
   when it isn't. Each build function renders only if its
   container exists on the current page.
============================================================ */

// these are filled by loadData() before any build function runs
let ministries = [], districts = [], projects = [], revenues = [], indicators = [], sdgs = [];

async function loadData() {
  try {
    const res = await fetch('/api/data', { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('API ' + res.status);
    const d = await res.json();
    ministries = d.ministries || [];
    districts  = d.districts  || [];
    projects   = d.projects   || [];
    revenues   = d.revenues   || [];
    indicators = d.indicators || [];
    sdgs       = d.sdgs       || [];
  } catch (err) {
    // server not running / opened as a file — use the bundled fallback
    const f = window.BUDGET_FALLBACK || {};
    ministries = f.ministries || [];
    districts  = f.districts  || [];
    projects   = f.projects   || [];
    revenues   = f.revenues   || [];
    indicators = f.indicators || [];
    sdgs       = f.sdgs       || [];
  }
  renderAll();
}

function renderAll() {
  buildMinistries();
  buildDistricts();
  buildRevenue();
  buildProjects();
  buildOutcomes();
  buildReport();
}

function buildMinistries() {
  const tbody = document.getElementById('ministry-tbody');
  const bars  = document.getElementById('ministry-bars');
  if (!tbody || !bars) return;

  const total = ministries.reduce((s, m) => s + m.amt, 0);
  const max   = Math.max(...ministries.map(m => m.amt));

  ministries.forEach(m => {
    const chg = Math.round((m.amt - m.last) / m.last * 100);
    const pct = Math.round(m.amt / total * 100);
    tbody.innerHTML += `<tr>
      <td style="font-weight:500">${m.name}</td>
      <td style="color:var(--color-text-secondary)">${m.nepali}</td>
      <td>Rs ${m.amt} Cr</td>
      <td style="color:var(--color-text-tertiary)">Rs ${m.last} Cr</td>
      <td class="${chg >= 0 ? 'up' : 'down'}">${chg >= 0 ? '↑' : '↓'} ${Math.abs(chg)}%</td>
      <td style="color:var(--color-text-tertiary)">${pct}%</td>
    </tr>`;
    bars.innerHTML += `<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
        <span style="color:var(--color-text-primary)">${m.name}</span>
        <span style="color:var(--color-text-tertiary)">${m.nepali}</span>
      </div>
      <div style="display:flex;gap:4px;align-items:center">
        <div style="flex:1;height:16px;background:var(--color-background-secondary);border-radius:4px;overflow:hidden;position:relative">
          <div style="position:absolute;top:0;left:0;height:100%;width:${Math.round(m.amt / max * 100)}%;background:${m.color};border-radius:4px;opacity:0.85"></div>
          <div style="position:absolute;top:0;left:0;height:100%;width:${Math.round(m.last / max * 100)}%;background:${m.color};border-radius:4px;opacity:0.3"></div>
        </div>
        <span style="font-size:11px;color:var(--color-text-tertiary);width:100px;text-align:right">Rs ${m.amt} Cr · ${m.last} Cr</span>
      </div>
    </div>`;
  });
}

function buildDistricts() {
  const bars  = document.getElementById('district-bars');
  const tbody = document.getElementById('district-tbody');
  if (!bars || !tbody) return;

  const maxAlloc = Math.max(...districts.map(d => d.alloc));
  [...districts].sort((a, b) => b.alloc - a.alloc).forEach(d => {
    const perCap = Math.round(d.alloc * 10000000 / (d.pop * 1000));
    const remote = d.hdi < 0.44;
    bars.innerHTML += `<div class="bar-row">
      <div class="bar-label">${d.name} <span style="color:var(--color-text-tertiary);font-size:11px">${d.nepali}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.round(d.alloc / maxAlloc * 100)}%;background:#1a3c5e"></div></div>
      <div class="bar-val">Rs ${d.alloc} Cr</div>
    </div>`;
    tbody.innerHTML += `<tr>
      <td><strong>${d.name}</strong><br><span style="font-size:11px;color:var(--color-text-tertiary)">${d.nepali}</span></td>
      <td>${d.pop.toLocaleString()} thousand</td>
      <td>Rs ${d.alloc} Cr</td>
      <td>Rs ${perCap.toLocaleString()}</td>
      <td>${d.hdi}</td>
      <td><span class="badge ${remote ? 'b-delayed' : 'b-ongoing'}">${remote ? 'Priority zone' : 'Standard'}</span></td>
    </tr>`;
  });
}

function buildRevenue() {
  const rows = document.getElementById('revenue-rows');
  if (!rows) return;

  const totalRev = revenues.reduce((s, r) => s + r.amt, 0) || 1;
  const max = Math.max(...revenues.map(r => r.amt));
  revenues.forEach(r => {
    const color = r.type === 'Federal' ? '#1a3c5e' : r.type === 'Own' ? '#3b8c5a' : '#e6a817';
    const pct = Math.round(r.amt / totalRev * 100);
    rows.innerHTML += `<div class="revenue-block">
      <div style="width:60px;flex-shrink:0">
        <span class="badge" style="background:${color}20;color:${color}">${r.type}</span>
      </div>
      <div style="flex:1">
        <div class="rev-label">${r.name}</div>
        <div class="rev-sub">${r.nepali}</div>
        <div style="margin-top:5px;display:flex;align-items:center;gap:8px">
          <div style="flex:1;height:8px;background:var(--color-background-secondary);border-radius:4px;overflow:hidden">
            <div class="rev-bar" style="width:${Math.round(r.amt / max * 100)}%;background:${color}"></div>
          </div>
          <span style="font-size:11px;color:var(--color-text-tertiary);width:90px;text-align:right">Rs ${r.amt} Cr · ${pct}%</span>
        </div>
      </div>
    </div>`;
  });
}

function buildProjects() {
  const tbody = document.getElementById('projects-tbody');
  if (!tbody) return;

  projects.forEach(p => {
    const work = p.work;                 // real physical progress (not spend)
    const color = p.status === 'completed' ? '#2e7d32' : p.status === 'delayed' ? '#e65100' : '#1565c0';
    tbody.innerHTML += `<tr>
      <td style="font-weight:500;max-width:200px">${p.name}</td>
      <td style="font-size:12px"><a class="inline-link" href="districts.html" title="See district allocations">${p.dist}</a></td>
      <td>Rs ${p.budget} Cr</td>
      <td>Rs ${p.spent} Cr</td>
      <td>
        <div style="display:flex;align-items:center;gap:7px">
          <div class="prog-track"><div class="prog-fill" style="width:${work}%;background:${color}"></div></div>
          <span style="font-size:11px;color:var(--color-text-tertiary);white-space:nowrap">${work}%</span>
        </div>
      </td>
      <td><span class="badge b-${p.status}">${p.status}</span></td>
    </tr>`;
  });
}

function buildOutcomes() {
  const rows = document.getElementById('indicators-rows');
  if (!rows) return;

  indicators.forEach(ind => {
    const isPoverty = ind.name === 'Below poverty line';
    const prov = isPoverty ? (100 - ind.val) : ind.val;
    const nat  = isPoverty ? (100 - ind.nat) : ind.nat;
    const tgt  = isPoverty ? (100 - ind.tgt) : ind.tgt;
    const gap = Math.abs(ind.val - ind.nat).toFixed(1);
    const behind = isPoverty ? ind.val > ind.nat : ind.val < ind.nat;
    rows.innerHTML += `<div class="indicator-row">
      <div class="ind-label">${ind.name}</div>
      <div class="ind-tracks">
        <div style="display:flex;align-items:center;gap:5px">
          <div class="ind-track" style="flex:1"><div class="ind-fill" style="width:${prov}%;background:#1a3c5e"></div></div>
          <span style="font-size:11px;width:36px;text-align:right;color:#1a3c5e">${ind.val}%</span>
        </div>
        <div style="display:flex;align-items:center;gap:5px">
          <div class="ind-track" style="flex:1"><div class="ind-fill" style="width:${nat}%;background:#EF9F27"></div></div>
          <span style="font-size:11px;width:36px;text-align:right;color:#854F0B">${ind.nat}%</span>
        </div>
        <div style="display:flex;align-items:center;gap:5px">
          <div class="ind-track" style="flex:1"><div class="ind-fill" style="width:${tgt}%;background:#1D9E75;opacity:0.5"></div></div>
          <span style="font-size:11px;width:36px;text-align:right;color:#0F6E56">${ind.tgt}%</span>
        </div>
      </div>
      <div style="width:80px;flex-shrink:0;text-align:right">
        <span class="badge ${behind ? 'b-delayed' : 'b-completed'}">${behind ? '↓ ' + gap + '% gap' : '↑ ahead'}</span>
      </div>
    </div>`;
  });

  const sdgRows = document.getElementById('sdg-rows');
  if (!sdgRows) return;
  const maxSdg = Math.max(...sdgs.map(s => s.amt));
  sdgs.forEach(s => {
    sdgRows.innerHTML += `<div class="sdg-row">
      <div class="sdg-label">${s.goal}</div>
      <div class="sdg-track"><div class="sdg-fill" style="width:${Math.round(s.amt / maxSdg * 100)}%;background:${s.color}"></div></div>
      <div class="sdg-val">Rs ${s.amt} Cr</div>
    </div>`;
  });
}

/* ---------- budget vs progress report ---------- */

const REPORT_BANDS = {
  efficient: { label: 'Efficient',   color: '#1D9E75' },
  ontrack:   { label: 'On track',    color: '#2e7d32' },
  watch:     { label: 'Watch',       color: '#e65100' },
  over:      { label: 'Over budget', color: '#c62828' },
  done:      { label: 'Completed',   color: '#1565c0' },
};

// classify by comparing % money spent against % work done
function healthBand(spentPct, work) {
  if (work >= 100) return 'done';
  const gap = spentPct - work;          // positive = spending ahead of work
  if (gap <= -5) return 'efficient';
  if (gap <= 10) return 'ontrack';
  if (gap <= 25) return 'watch';
  return 'over';
}

function metricCard(label, value, sub, color) {
  return `<div class="metric">
    <div class="metric-label">${label}</div>
    <div class="metric-value"${color ? ` style="color:${color}"` : ''}>${value}</div>
    <div class="metric-sub" style="color:var(--color-text-tertiary)">${sub}</div>
  </div>`;
}

function reportRow(name, sub, budget, spent, work) {
  const spentPct = Math.round(spent / budget * 100);
  const band = healthBand(spentPct, work);
  const { label, color } = REPORT_BANDS[band];
  const remBudget = Math.max(0, 100 - spentPct);
  const remWork = Math.max(0, 100 - work);

  let note;
  if (band === 'done')           note = `Completed — Rs ${spent} Cr of Rs ${budget} Cr used.`;
  else if (band === 'over')      note = `Critical: only ${remBudget}% of budget remains for ${remWork}% of the work still to do.`;
  else if (band === 'watch')     note = `Spending is ${spentPct - work} points ahead of progress — watch the burn rate (${remBudget}% budget left for ${remWork}% of work).`;
  else if (band === 'efficient') note = `Good value: work is ${work - spentPct} points ahead of spending.`;
  else                           note = `On track: spending (${spentPct}%) and progress (${work}%) are aligned.`;

  return `<div class="rep-row rep-${band}">
    <div class="rep-head">
      <div><span class="rep-name">${name}</span>${sub ? ` <span class="rep-sub">${sub}</span>` : ''}</div>
      <span class="r-badge r-${band}">${label}</span>
    </div>
    <div class="rep-barrow">
      <span class="rep-blabel">Budget used</span>
      <div class="rep-track"><div class="rep-fill" style="width:${spentPct}%;background:${color}"></div></div>
      <span class="rep-bval">${spentPct}% · Rs ${spent}/${budget} Cr</span>
    </div>
    <div class="rep-barrow">
      <span class="rep-blabel">Work done</span>
      <div class="rep-track"><div class="rep-fill" style="width:${work}%;background:#1a3c5e"></div></div>
      <span class="rep-bval">${work}%</span>
    </div>
    <div class="rep-note">${note}</div>
  </div>`;
}

function buildReport() {
  const projWrap = document.getElementById('report-projects');
  const distWrap = document.getElementById('report-districts');
  if (!projWrap || !distWrap) return;

  // ----- projects -----
  let pB = 0, pS = 0;
  const pc = { efficient:0, ontrack:0, watch:0, over:0, done:0 };
  projects.forEach(p => {
    pB += p.budget; pS += p.spent;
    pc[healthBand(Math.round(p.spent / p.budget * 100), p.work)]++;
    projWrap.innerHTML += reportRow(p.name, p.dist, p.budget, p.spent, p.work);
  });
  const pm = document.getElementById('report-proj-metrics');
  if (pm) pm.innerHTML =
    metricCard('Allocated', `Rs ${pB} Cr`, `across ${projects.length} projects`) +
    metricCard('Spent to date', `Rs ${pS} Cr`, `${Math.round(pS / pB * 100)}% of budget`) +
    metricCard('Over budget', pc.over, 'spend far ahead of work', '#c62828') +
    metricCard('Watch', pc.watch, 'monitor burn rate', '#e65100') +
    metricCard('Healthy', pc.efficient + pc.ontrack + pc.done, 'on track or better', '#2e7d32');

  // ----- districts -----
  let dB = 0, dS = 0;
  const dc = { efficient:0, ontrack:0, watch:0, over:0, done:0 };
  districts.forEach(d => {
    dB += d.alloc; dS += d.spent;
    dc[healthBand(Math.round(d.spent / d.alloc * 100), d.work)]++;
    distWrap.innerHTML += reportRow(d.name, d.nepali, d.alloc, d.spent, d.work);
  });
  const dm = document.getElementById('report-dist-metrics');
  if (dm) dm.innerHTML =
    metricCard('Allocated', `Rs ${dB} Cr`, `across ${districts.length} districts`) +
    metricCard('Spent to date', `Rs ${dS} Cr`, `${Math.round(dS / dB * 100)}% of budget`) +
    metricCard('Over budget', dc.over, 'spend far ahead of work', '#c62828') +
    metricCard('Watch', dc.watch, 'monitor burn rate', '#e65100') +
    metricCard('Healthy', dc.efficient + dc.ontrack + dc.done, 'on track or better', '#2e7d32');

  // ----- headline -----
  const head = document.getElementById('report-headline');
  if (head) head.innerHTML = `<div class="you-card">
    <div class="you-title">At a glance — is spending matched by progress?</div>
    <div class="you-grid">
      <div class="you-item"><div class="you-val" style="color:#c62828">${pc.over}</div><div class="you-label">Projects over budget vs progress</div></div>
      <div class="you-item"><div class="you-val" style="color:#c62828">${dc.over}</div><div class="you-label">Districts over budget vs progress</div></div>
      <div class="you-item"><div class="you-val" style="color:#2e7d32">${pc.efficient + dc.efficient}</div><div class="you-label">Running efficiently</div></div>
      <div class="you-item"><div class="you-val" style="color:#e65100">${pc.over + pc.watch + dc.over + dc.watch}</div><div class="you-label">Need attention</div></div>
    </div>
  </div>`;
}

document.addEventListener('DOMContentLoaded', loadData);
