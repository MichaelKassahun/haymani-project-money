/* Haymani Project Money v2 — local-first, works offline */
const K = 'haymani_money_v1';           // same key as v1, so existing data is kept
const EXPENSE_CATS = ['Material','Hardware','Labor','Transport','Installation','Finishing','Outsourcing','CNC-Machine','Fuel','Food-Allowance','Miscellaneous','Refund','Other'];
const INCOME_CATS  = ['Customer Payment','Refund','Other'];
const STATUSES     = ['Planned','Active','Completed','Cancelled'];
const METHODS      = ['Cash','Bank Transfer','Mobile Money','Card','Other'];

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const jsArg = v => esc(JSON.stringify(v));          // safe value inside onclick="..."
const $ = x => document.querySelector(x);
const money = n => new Intl.NumberFormat('en-US', {maximumFractionDigits: 2}).format(n || 0) + ' Birr';
const pct = n => (isFinite(n) ? Math.round(n * 1000) / 10 : 0) + '%';
const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/* ---------- data ---------- */
function normalize(x) {
  const out = { projects: [], transactions: [] };
  (x.projects || []).forEach(p => out.projects.push({
    id: p.id, customer: p.customer || '', name: p.name || '', quote: p.quote || '',
    price: +p.price || 0, expectedCost: +p.expectedCost || 0, advance: +p.advance || 0,
    start: p.start || '', deadline: p.deadline || '', status: p.status || 'Planned', notes: p.notes || ''
  }));
  (x.transactions || []).forEach(t => out.transactions.push({
    uid: t.uid || uid(), projectId: t.projectId, date: t.date || '', amount: +t.amount || 0,
    category: t.category || '', description: t.description || '', person: t.person || '',
    method: t.method || '', ref: t.ref || '', by: t.by || '', notes: t.notes || '', type: t.type
  }));
  return out;
}
function load() {
  try {
    const x = JSON.parse(localStorage.getItem(K));
    if (x && Array.isArray(x.projects) && Array.isArray(x.transactions)) return normalize(x);
  } catch (e) {}
  return { projects: [], transactions: [] };
}
let d = load();
let cur = 'home', ledgerId = null;

function save() {
  try { localStorage.setItem(K, JSON.stringify(d)); }
  catch (e) { alert('Could not save — phone storage may be full. Export a backup now.'); }
  page(cur);
}

const sum = (list) => list.reduce((s, t) => s + t.amount, 0);
const total = (id, type) => sum(d.transactions.filter(t => t.projectId === id && t.type === type));
function stats(p) {
  const spent = total(p.id, 'expense'), paid = total(p.id, 'income');
  return {
    spent, paid,
    expectedProfit: p.price - p.expectedCost,
    currentProfit: p.price - spent,
    costPct: p.price ? spent / p.price : 0,
    balance: p.price - p.advance - paid,       // quoted − advance − later customer payments
    netCash: p.advance + paid - spent
  };
}

/* ---------- pages ---------- */
function row(t, deletable) {
  return `<div class="tx"><div><b>${esc(t.description)}</b><small>${esc(t.date)} · ${esc(t.projectId)} · ${esc(t.category)}${t.person ? ' · ' + esc(t.person) : ''}</small>${t.notes ? `<small>${esc(t.notes)}</small>` : ''}${deletable ? `<small><a href="#" onclick="delTx(${jsArg(t.uid)});return false" style="color:#b91c1c">Delete</a></small>` : ''}</div><b class="${t.type}">${t.type === 'income' ? '+' : '−'}${money(t.amount)}</b></div>`;
}

function page(p) {
  cur = p;
  document.querySelectorAll('nav button').forEach(b => b.style.color = b.dataset.p === p ? '#111827' : '');
  const inc = sum(d.transactions.filter(t => t.type === 'income')), exp = sum(d.transactions.filter(t => t.type === 'expense'));
  let h = '';
  if (p === 'home') {
    h = `<div class="hero"><span>Net Cash Position</span><strong>${money(inc - exp)}</strong></div>
      <div class="grid"><div class="card"><small>Income</small><b>${money(inc)}</b></div><div class="card"><small>Expenses</small><b>${money(exp)}</b></div></div>
      <button class="btn" onclick="tx('expense')">＋ Add Expense</button>
      <button class="secondary" onclick="tx('income')">＋ Customer Payment</button>
      <h2>Recent</h2>${d.transactions.slice(-8).reverse().map(t => row(t)).join('') || '<p class="muted">No transactions yet.</p>'}`;
  }
  if (p === 'projects') {
    h = `<div class="row"><h2>Projects</h2><button class="secondary" style="width:auto;padding:10px 16px" onclick="projectForm()">＋ New</button></div>` +
      (d.projects.slice().reverse().map(x => {
        const s = stats(x);
        return `<div class="card"><div class="row"><div><b>${esc(x.id)}</b><div>${esc(x.name)}</div><small>${esc(x.customer)}${x.deadline ? ' · Due ' + esc(x.deadline) : ''}</small></div><span class="badge">${esc(x.status)}</span></div>
          <p>Quoted: ${money(x.price)} · Spent: ${money(s.spent)}<br>Customer balance: ${money(s.balance)}</p>
          <button class="secondary" onclick="openLedger(${jsArg(x.id)})">Open Ledger</button>
          <button class="secondary" onclick="tx('expense',${jsArg(x.id)})">＋ Expense</button>
          <button class="secondary" onclick="tx('income',${jsArg(x.id)})">＋ Customer Payment</button>
          <button class="secondary" onclick="projectForm(${jsArg(x.id)})">Edit Project</button></div>`;
      }).join('') || '<p class="muted">No projects yet.</p>');
  }
  if (p === 'ledger') {
    if (!d.projects.some(x => x.id === ledgerId)) ledgerId = d.projects.length ? d.projects[0].id : null;
    const opts = d.projects.map(x => `<option value="${esc(x.id)}" ${x.id === ledgerId ? 'selected' : ''}>${esc(x.id)} — ${esc(x.name)}</option>`).join('');
    h = `<h2>Project Ledger</h2>` + (ledgerId === null ? '<p class="muted">No projects yet.</p>' :
      `<select onchange="openLedger(this.value)">${opts}</select><div id="ll">${ledgerHtml(ledgerId)}</div>`);
  }
  if (p === 'reports') {
    const tq = sum(d.projects.map(x => ({amount: x.price}))), ts = exp;
    h = `<h2>Reports</h2><div class="grid"><div class="card"><small>Total Quoted</small><b>${money(tq)}</b></div><div class="card"><small>Total Spent</small><b>${money(ts)}</b></div></div>` +
      (d.projects.map(x => {
        const s = stats(x);
        return `<div class="card"><div class="row"><b>${esc(x.id)} — ${esc(x.name)}</b><span class="badge">${esc(x.status)}</span></div>
          <p>Quoted: ${money(x.price)}<br>Expected cost: ${money(x.expectedCost)}<br>Expected profit: ${money(s.expectedProfit)}</p>
          <p>Actual cost: ${money(s.spent)} (${pct(s.costPct)} of quote)<br>Current estimated profit: <b class="${s.currentProfit < 0 ? 'expense' : 'income'}">${money(s.currentProfit)}</b></p>
          <p>Advance: ${money(x.advance)}<br>Payments logged: ${money(s.paid)}<br>Customer balance: ${money(s.balance)}<br>Net cash: ${money(s.netCash)}</p></div>`;
      }).join('') || '<p class="muted">No projects.</p>');
  }
  if (p === 'data') {
    h = `<h2>Backup &amp; Data</h2><div class="card"><p class="muted">Data is stored locally on this iPhone. Export a backup regularly.</p>
      <button class="btn" onclick="backup()">Export Backup</button>
      <label class="secondary" style="display:block;text-align:center">Import Backup<input type="file" accept=".json,application/json" onchange="imp(event)" style="display:none"></label>
      <button class="danger" onclick="wipe()">Delete All Data</button></div>
      <div class="card"><b>Haymani Project Money v2</b><p class="muted">Works offline once opened online one time. Designed for iPhone 8 Plus / iOS 16.</p></div>`;
  }
  $('#app').innerHTML = h;
}

function ledgerHtml(id) {
  const ts = d.transactions.filter(t => t.projectId === id).slice().reverse();
  return `<div class="grid"><div class="card">Income<br><b>${money(total(id, 'income'))}</b></div><div class="card">Expense<br><b>${money(total(id, 'expense'))}</b></div></div>` +
    (ts.map(t => row(t, true)).join('') || '<p class="muted">No transactions.</p>');
}
function openLedger(id) { ledgerId = id; page('ledger'); }

/* ---------- forms ---------- */
function modal(html) {
  const m = document.createElement('div');
  m.className = 'modal';
  m.innerHTML = '<div><button class="close" onclick="this.closest(\'.modal\').remove()">×</button>' + html + '</div>';
  document.body.appendChild(m);
}
const closeModal = () => { const m = document.querySelector('.modal'); if (m) m.remove(); };
const opts = (list, sel) => list.map(x => `<option ${x === sel ? 'selected' : ''}>${esc(x)}</option>`).join('');

function projectForm(eid) {
  const p = eid ? d.projects.find(x => x.id === eid) : { id: '', customer: '', name: '', quote: '', price: '', expectedCost: '', advance: '', start: today(), deadline: '', status: 'Planned', notes: '' };
  modal(`<h2>${eid ? 'Edit Project' : 'New Project'}</h2>
    <label>Project ID *</label><input id="pid" value="${esc(p.id)}" ${eid ? 'readonly' : ''}>
    <label>Customer *</label><input id="cu" value="${esc(p.customer)}">
    <label>Project Name *</label><input id="pn" value="${esc(p.name)}">
    <label>Quotation No.</label><input id="qn" value="${esc(p.quote)}">
    <label>Quoted Price (Birr)</label><input id="qp" type="number" inputmode="decimal" value="${esc(p.price || '')}">
    <label>Expected Cost (Birr)</label><input id="ec" type="number" inputmode="decimal" value="${esc(p.expectedCost || '')}">
    <label>Advance Received (Birr)</label><input id="ad" type="number" inputmode="decimal" value="${esc(p.advance || '')}">
    <label>Start Date</label><input id="sd" type="date" value="${esc(p.start)}">
    <label>Deadline</label><input id="dl" type="date" value="${esc(p.deadline)}">
    <label>Status</label><select id="st">${opts(STATUSES, p.status)}</select>
    <label>Notes</label><textarea id="nt" rows="3">${esc(p.notes)}</textarea>
    <button class="btn" onclick="saveProject(${jsArg(eid || '')})">Save Project</button>`);
}
function saveProject(eid) {
  const v = id => $('#' + id).value.trim();
  const p = { id: v('pid'), customer: v('cu'), name: v('pn'), quote: v('qn'), price: +v('qp') || 0, expectedCost: +v('ec') || 0,
              advance: +v('ad') || 0, start: v('sd'), deadline: v('dl'), status: $('#st').value, notes: v('nt') };
  if (!p.id || !p.customer || !p.name) return alert('Project ID, Customer and Project Name are required.');
  if (eid) { d.projects[d.projects.findIndex(x => x.id === eid)] = p; }
  else {
    if (d.projects.some(x => x.id === p.id)) return alert('Project ID already exists.');
    d.projects.push(p);
  }
  closeModal(); save();
}

function tx(type, pid) {
  if (!d.projects.length) return alert('Create a project first.');
  const o = d.projects.map(x => `<option value="${esc(x.id)}" ${x.id === pid ? 'selected' : ''}>${esc(x.id)} — ${esc(x.name)}</option>`).join('');
  modal(`<h2>${type === 'income' ? 'Customer Payment' : 'Add Expense'}</h2>
    <label>Project *</label><select id="tp">${o}</select>
    <label>Date</label><input id="td" type="date" value="${today()}">
    <label>Amount (Birr) *</label><input id="ta" type="number" inputmode="decimal">
    <label>Category</label><select id="tc">${opts(type === 'income' ? INCOME_CATS : EXPENSE_CATS)}</select>
    <label>Description *</label><input id="txd">
    <label>${type === 'income' ? 'Received From' : 'Paid To'}</label><input id="person">
    <label>Payment Method</label><select id="tm">${opts(METHODS)}</select>
    <label>Receipt / Reference</label><input id="ref">
    <label>Recorded By</label><input id="by">
    <label>Notes</label><input id="tn">
    <button class="btn" onclick="addTx('${type}')">Save</button>`);
}
function addTx(type) {
  const t = { uid: uid(), projectId: $('#tp').value, date: $('#td').value, amount: +$('#ta').value || 0, category: $('#tc').value,
              description: $('#txd').value.trim(), person: $('#person').value.trim(), method: $('#tm').value,
              ref: $('#ref').value.trim(), by: $('#by').value.trim(), notes: $('#tn').value.trim(), type };
  if (t.amount <= 0 || !t.description) return alert('Amount and Description are required.');
  d.transactions.push(t);
  closeModal(); save();
}
function delTx(id) {
  if (!confirm('Delete this transaction?')) return;
  d.transactions = d.transactions.filter(t => t.uid !== id);
  save();
}

/* ---------- backup ---------- */
function backup() {
  const b = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }), a = document.createElement('a');
  a.href = URL.createObjectURL(b);
  a.download = 'Haymani_Backup_' + today() + '.json';
  document.body.appendChild(a); a.click(); a.remove();
}
function imp(e) {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const x = JSON.parse(r.result);
      if (!Array.isArray(x.projects) || !Array.isArray(x.transactions)) throw 0;
      if (!confirm('Replace current data with this backup?')) return;
      d = normalize(x); save(); alert('Backup imported.');
    } catch { alert('Invalid backup.'); }
  };
  r.readAsText(f); e.target.value = '';
}
function wipe() {
  if (confirm('Delete ALL data? This cannot be undone.')) { d = { projects: [], transactions: [] }; save(); }
}

/* ---------- start ---------- */
page('home');
if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
