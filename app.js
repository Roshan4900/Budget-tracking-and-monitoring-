/* ============================================================
   Sudurpaschim Province Budget Visualizer — RENDERING
   One shared script. Each build function looks for its
   container; if it's not on the current page, it does nothing.
   Requires data.js to be loaded first.
============================================================ */

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

  const max = Math.max(...revenues.map(r => r.amt));
  revenues.forEach(r => {
    const color = r.type === 'Federal' ? '#1a3c5e' : r.type === 'Own' ? '#3b8c5a' : '#e6a817';
    const pct = Math.round(r.amt / 1842 * 100);
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
    const pct = Math.round(p.spent / p.budget * 100);
    const color = p.status === 'completed' ? '#2e7d32' : p.status === 'delayed' ? '#e65100' : '#1565c0';
    tbody.innerHTML += `<tr>
      <td style="font-weight:500;max-width:200px">${p.name}</td>
      <td style="font-size:12px"><a class="inline-link" href="districts.html" title="See district allocations">${p.dist}</a></td>
      <td>Rs ${p.budget} Cr</td>
      <td>Rs ${p.spent} Cr</td>
      <td>
        <div style="display:flex;align-items:center;gap:7px">
          <div class="prog-track"><div class="prog-fill" style="width:${pct}%;background:${color}"></div></div>
          <span style="font-size:11px;color:var(--color-text-tertiary);white-space:nowrap">${pct}%</span>
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

document.addEventListener('DOMContentLoaded', () => {
  buildMinistries();
  buildDistricts();
  buildRevenue();
  buildProjects();
  buildOutcomes();
});