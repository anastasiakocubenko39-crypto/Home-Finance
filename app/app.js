/* Home Finance — особистий фінансовий помічник */
import { auth, authMessage, createStore } from './store.js';
import { reply, findFood, RECIPE_TITLES } from './bot.js';
import { NUTRITION } from './nutrition-db.js';

/* ── довідники ── */
const CATS = [
  { id: 'products', name: 'Продукти', ic: 'cart' },
  { id: 'walks', name: 'Прогулянки й кафе', ic: 'cup' },
  { id: 'home', name: 'Побут і хімія', ic: 'spray' },
  { id: 'bills', name: 'Комуналка', ic: 'bolt' },
  { id: 'transport', name: 'Транспорт', ic: 'car' },
  { id: 'health', name: 'Здоров’я', ic: 'heart' },
  { id: 'clothes', name: 'Одяг', ic: 'shirt' },
  { id: 'savings', name: 'У накопичення', ic: 'target' },
  { id: 'other', name: 'Інше', ic: 'dots' },
];
const CAT = Object.fromEntries(CATS.map((c) => [c.id, c]));
const SERVICES = ['Газ (розподіл)', 'Газ (постачання)', 'Електроенергія', 'Вода', 'Водовідведення', 'Тепло', 'Гаряча вода', 'Абонплата тепло', 'Сміття', 'Квартплата / ОСББ', 'Інтернет', 'Мобільний зв’язок'];
const METERS = ['Газ', 'Вода', 'Світло'];
const HOUSE_CATS = ['Кухня', 'Ванна', 'Прання', 'Прибирання', 'Гігієна', 'Інше'];
const UNITS = ['шт', 'кг', 'г', 'л', 'мл', 'уп'];
const MONTHS = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];
const MONTHS_G = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];

/* ── іконки ── */
const P = {
  home: '<path d="M3 11 12 4l9 7M5 10v10h14V10"/>', list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  cart: '<path d="M3 4h2l2.4 11h11L21 8H6.2"/><circle cx="9" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/>', bot: '<rect x="4" y="7" width="16" height="12"/><path d="M12 3v4M9 12h.01M15 12h.01M9 16h6"/>',
  more: '<path d="M4 6h16M4 12h16M4 18h16"/>', cup: '<path d="M5 8h12v5a6 6 0 0 1-12 0zM17 9h2a2 2 0 0 1 0 4h-2M8 3v2M12 3v2"/>',
  spray: '<path d="M9 9h6v12H9zM10 9V6h4v3M14 4h3M17 2v4"/>', bolt: '<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>', car: '<path d="M4 16V11l2-5h12l2 5v5M4 16h16M6 19v-3M18 19v-3"/><circle cx="7.5" cy="13.5" r=".5"/><circle cx="16.5" cy="13.5" r=".5"/>',
  heart: '<path d="M12 20s-7-4.4-9.2-9A5 5 0 0 1 12 6.2 5 5 0 0 1 21.2 11C19 15.6 12 20 12 20z"/>', shirt: '<path d="M8 3 3 6l2 4 3-1v12h8V9l3 1 2-4-5-3c0 2-2 3-4 3S8 5 8 3z"/>',
  dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>', target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  cal: '<rect x="3" y="5" width="18" height="16"/><path d="M3 10h18M8 3v4M16 3v4"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  left: '<path d="m15 5-7 7 7 7"/>', right: '<path d="m9 5 7 7-7 7"/>', plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', check: '<path d="m5 12 5 5 9-10"/>', send: '<path d="M4 12 20 4l-6 16-3-7z"/>',
  basket: '<path d="M4 9h16l-2 11H6zM9 9l3-5 3 5"/>', box: '<path d="M3 7 12 3l9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10"/>', down: '<path d="M12 4v12M6 10l6 6 6-6M4 20h16"/>', out: '<path d="M15 4h5v16h-5M10 16l4-4-4-4M14 12H3"/>',
  meter: '<circle cx="12" cy="13" r="8"/><path d="M12 13l4-4M12 5V3"/>',
};
const ic = (n) => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${P[n] || P.dots}</svg>`;

/* ── утиліти ── */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => { const v = Number(n) || 0; return `${(Math.sign(v) * Math.round(Math.abs(v))).toLocaleString('uk-UA').replace(/,/g, ' ')} ₴`; };
const num = (v) => { const n = parseFloat(String(v ?? '').replace(/\s/g, '').replace(',', '.')); return isFinite(n) ? n : 0; };
const pad = (n) => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const monthOf = (date) => String(date).slice(0, 7);
const monthLabel = (m) => { const [y, mm] = m.split('-'); return `${MONTHS[+mm - 1]} ${y}`; };
const shiftMonth = (m, k) => { const [y, mm] = m.split('-').map(Number); const d = new Date(y, mm - 1 + k, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
const dayLabel = (d) => { const [y, m, dd] = d.split('-'); const t = today(); const yest = new Date(Date.now() - 864e5); const ys = `${yest.getFullYear()}-${pad(yest.getMonth() + 1)}-${pad(yest.getDate())}`; return d === t ? 'Сьогодні' : d === ys ? 'Вчора' : `${+dd} ${MONTHS_G[+m - 1]}${y !== t.slice(0, 4) ? ' ' + y : ''}`; };
function toast(t) { $('.toast')?.remove(); const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.append(d); setTimeout(() => d.remove(), 2400); }
function modal(html, onMount) {
  const m = document.createElement('div'); m.className = 'modal'; m.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true">${html}</div>`;
  document.body.append(m);
  const close = () => m.remove();
  m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('[data-close]')) close(); });
  addEventListener('keydown', function k(e) { if (e.key === 'Escape') { close(); removeEventListener('keydown', k); } });
  onMount?.(m.firstElementChild, close);
  m.querySelector('input, select, textarea')?.focus();
  return close;
}
const safe = (fn) => async (...a) => { try { await fn(...a); } catch (e) { console.error(e); toast('Не вдалося зберегти: ' + (e.code === 'permission-denied' ? 'немає доступу до бази (перевірте правила Firestore)' : e.message)); } };

/* ── стан ── */
let S = null; // сховище
let user = null;
const D = { expenses: [], budgets: [], pantry: [], catalog: [], bills: [], meters: [], household: [], goals: [], plans: [], settings: [] };
let month = monthOf(today());
let view = 'overview';
const unsub = [];

/* ── вхід ── */
function showAuth() {
  $('#app').hidden = true; $('#auth').hidden = false;
  let mode = 'in';
  const box = $('#authBox');
  const draw = () => {
    box.innerHTML = `
      <div class="brand"><img src="app/logo.svg" alt=""><span><b>HOME FINANCE</b><small>особисті фінанси</small></span></div>
      <h2>${mode === 'up' ? 'Створити акаунт' : mode === 'reset' ? 'Відновити пароль' : 'Вхід'}</h2>
      <p>${mode === 'up' ? 'Ваші витрати, продукти і цілі бачите лише ви.' : mode === 'reset' ? 'Надішлемо посилання для нового пароля на вашу пошту.' : 'Увійдіть за поштою і паролем.'}</p>
      ${mode !== 'reset' ? `<div class="auth-tabs"><button type="button" data-m="in" aria-pressed="${mode === 'in'}">Вхід</button><button type="button" data-m="up" aria-pressed="${mode === 'up'}">Реєстрація</button></div>` : ''}
      <form id="authForm" class="grid" style="gap:14px" novalidate>
        <label class="f">Пошта<input class="field" id="aEmail" type="email" autocomplete="email" required placeholder="name@example.com"></label>
        ${mode !== 'reset' ? `<label class="f">Пароль<input class="field" id="aPass" type="password" autocomplete="${mode === 'up' ? 'new-password' : 'current-password'}" required minlength="6" placeholder="${mode === 'up' ? 'Щонайменше 6 символів' : '••••••'}"></label>` : ''}
        <button class="btn block" type="submit">${mode === 'up' ? 'Створити акаунт' : mode === 'reset' ? 'Надіслати посилання' : 'Увійти'}</button>
      </form>
      <p class="auth-msg" id="aMsg"></p>
      <div class="auth-links">${mode === 'reset' ? '<button type="button" data-m="in">← Повернутись до входу</button>' : '<button type="button" data-m="reset">Забули пароль?</button>'}<button type="button" id="demoBtn">Спробувати без реєстрації</button></div>`;
    $$('[data-m]', box).forEach((b) => (b.onclick = () => { mode = b.dataset.m; draw(); }));
    $('#demoBtn').onclick = () => { localStorage.setItem('hf_demo', '1'); start({ email: 'Демо-режим', uid: 'demo' }, 'demo'); };
    $('#authForm').onsubmit = async (e) => {
      e.preventDefault();
      const email = $('#aEmail').value.trim(), pass = $('#aPass')?.value || '';
      const msg = $('#aMsg'); msg.className = 'auth-msg'; msg.textContent = 'Зачекайте…';
      try {
        if (mode === 'reset') { await auth.reset(email); msg.className = 'auth-msg ok'; msg.textContent = 'Готово! Перевірте пошту (і папку «Спам»).'; return; }
        await (mode === 'up' ? auth.signUp(email, pass) : auth.signIn(email, pass));
      } catch (err) { msg.className = 'auth-msg err'; msg.textContent = authMessage(err); }
    };
  };
  draw();
}

/* ── запуск ── */
function start(u, mode) {
  user = u;
  unsub.splice(0).forEach((f) => f());
  S = createStore(mode, u.uid);
  $('#auth').hidden = true; $('#app').hidden = false;
  $('#who').textContent = u.email;
  resubscribe();
  route();
}
function resubscribe() {
  unsub.splice(0).forEach((f) => f());
  Object.keys(D).forEach((c) => unsub.push(S.watch(c, (list) => { D[c] = list; render(); })));
}
addEventListener('hf-error', (e) => toast('Не вдалося зберегти: ' + (e.detail?.code === 'permission-denied' ? 'немає доступу до бази' : e.detail?.message || 'помилка')));
async function logout() {
  if (S?.mode === 'demo') { localStorage.removeItem('hf_demo'); location.reload(); return; }
  await auth.signOut(); location.reload();
}

/* ── навігація ── */
const VIEWS = [
  ['overview', 'Огляд', 'home'], ['expenses', 'Витрати', 'list'], ['products', 'Продукти', 'cart'], ['bot', 'Кухня-бот', 'bot'],
  ['bills', 'Комуналка', 'bolt'], ['household', 'Побут', 'spray'], ['goals', 'Накопичення', 'target'], ['plans', 'Плани', 'cal'], ['settings', 'Налаштування', 'gear'],
];
function chrome() {
  $('#nav').innerHTML = VIEWS.map(([k, t, i]) => `<a href="#${k}" data-v="${k}">${ic(i)}${t}</a>`).join('');
  $('#tabbar').innerHTML = VIEWS.slice(0, 4).map(([k, t, i]) => `<a href="#${k}" data-v="${k}">${ic(i)}${t === 'Кухня-бот' ? 'Бот' : t}</a>`).join('') + `<a href="#more" id="moreBtn">${ic('more')}Ще</a>`;
  $('#moreBtn').onclick = (e) => {
    e.preventDefault();
    const s = document.createElement('div'); s.className = 'sheet';
    s.innerHTML = `<div class="sheet-box">${VIEWS.slice(4).map(([k, t, i]) => `<a href="#${k}">${ic(i)}${t}</a>`).join('')}</div>`;
    s.onclick = () => s.remove(); document.body.append(s);
  };
  $('#logoutBtn').onclick = logout; $('#logoutTop').onclick = logout;
}
function route() {
  const h = location.hash.slice(1);
  view = VIEWS.some(([k]) => k === h) ? h : 'overview';
  $$('[data-v]').forEach((a) => a.toggleAttribute('aria-current', a.dataset.v === view));
  if (VIEWS.slice(4).some(([k]) => k === view)) $('#moreBtn')?.setAttribute('aria-current', '');
  render(true);
  scrollTo(0, 0);
}
addEventListener('hashchange', route);

let renderQueued = false;
function render(force) {
  if (!S) return;
  if (!force) { if (renderQueued) return; renderQueued = true; requestAnimationFrame(() => { renderQueued = false; draw(); }); return; }
  draw(true);
}
function draw(force) {
  // не перемальовуємо, поки людина друкує у полі (щоб не губився фокус); перехід між розділами — завжди
  const a = document.activeElement;
  if (!force && a && a.closest('#view') && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && a.dataset.live !== '1' && view !== 'bot') { pending = true; return; }
  if (force && a && a.closest?.('#view')) a.blur();
  pending = false;
  const V = { overview, expenses, products, bot, bills, household, goals, plans, settings }[view];
  V($('#view'));
}
let pending = false;
document.addEventListener('focusout', () => setTimeout(() => { if (pending && !document.activeElement?.closest?.('#view input, #view textarea, #view select')) draw(); }, 50));

const monthNav = () => `<div class="monthnav"><button data-mn="-1" aria-label="Попередній місяць">${ic('left')}</button><span>${monthLabel(month)}</span><button data-mn="1" aria-label="Наступний місяць">${ic('right')}</button></div>`;
const bindMonth = (root) => $$('[data-mn]', root).forEach((b) => (b.onclick = () => { month = shiftMonth(month, +b.dataset.mn); draw(); }));

/* ── розрахунки ── */
const monthExp = (m) => D.expenses.filter((e) => monthOf(e.date) === m);
const sum = (l) => l.reduce((s, e) => s + num(e.amount), 0);
const byCat = (l) => { const o = {}; l.forEach((e) => (o[e.cat] = (o[e.cat] || 0) + num(e.amount))); return o; };
const budgetOf = (m) => num(D.budgets.find((b) => b.id === m)?.amount);
/* дні отримання грошей (зарплата, аванс) з налаштувань */
const paySettings = () => D.settings.find((x) => x.id === 'pay') || {};
function payDays() {
  const s = paySettings();
  return [['salary', 'Зарплата', s.salaryDay, s.salaryAmount], ['advance', 'Аванс', s.advanceDay, s.advanceAmount]]
    .filter(([, , d]) => +d >= 1 && +d <= 31).map(([k, name, d, a]) => ({ k, name, day: +d, amount: num(a) }));
}
/* найближче надходження після сьогодні (з урахуванням коротких місяців) */
function nextPay(from = new Date()) {
  const days = payDays(); if (!days.length) return null;
  const y = from.getFullYear(), m = from.getMonth(), d0 = from.getDate();
  const cands = [];
  for (const off of [0, 1]) for (const p of days) {
    const last = new Date(y, m + off + 1, 0).getDate();
    const dt = new Date(y, m + off, Math.min(p.day, last));
    if (off === 1 || dt.getDate() > d0) cands.push({ ...p, date: dt });
  }
  cands.sort((a, b) => a.date - b.date);
  const n = cands[0];
  return { ...n, days: Math.round((n.date - new Date(y, m, d0)) / 864e5), label: `${n.date.getDate()} ${MONTHS_G[n.date.getMonth()]}` };
}
/* скільки можна витрачати на день до найближчих грошей.
   Якщо вказані суми зарплати й авансу — рахуємо від того, що вже надійшло цього місяця. */
function payInfo(budget, spent, N) {
  const today = new Date().getDate();
  const withAmounts = payDays().length > 0 && payDays().every((p) => p.amount > 0);
  const received = payDays().filter((p) => p.day <= today).reduce((s, p) => s + p.amount, 0);
  const avail = withAmounts && received ? received - spent : budget - spent;
  return { avail, per: N && N.days > 0 && avail > 0 ? avail / N.days : 0, withAmounts };
}
function financeCtx() {
  const l = monthExp(month), pl = monthExp(shiftMonth(month, -1));
  const [y, mm] = month.split('-').map(Number);
  const last = new Date(y, mm, 0).getDate();
  const isNow = month === monthOf(today());
  return { budget: budgetOf(month), spent: sum(l), byCat: byCat(l), prevSpent: sum(pl), prevByCat: byCat(pl), daysLeft: isNow ? last - new Date().getDate() + 1 : 0, next: isNow ? nextPay() : null, pay: payInfo(budgetOf(month), sum(l), isNow ? nextPay() : null), catNames: Object.fromEntries(CATS.map((c) => [c.id, c.name])) };
}

/* ── додати/редагувати витрату ── */
function expenseForm(e = {}) {
  const editing = !!e.id;
  modal(`<h3>${editing ? 'Редагувати витрату' : 'Нова витрата'}</h3>
    <label class="f">Сума, ₴<input class="field" id="eAmt" inputmode="decimal" value="${e.amount ?? ''}" placeholder="0"></label>
    <div><div class="f" style="margin-bottom:8px">Категорія</div><div class="chips" id="eCats">${CATS.map((c) => `<button type="button" class="chip" data-c="${c.id}" aria-pressed="${(e.cat || 'products') === c.id}">${ic(c.ic)}${c.name}</button>`).join('')}</div></div>
    <label class="f" id="eGoalWrap" ${(e.cat || 'products') === 'savings' ? '' : 'hidden'}>Ціль накопичення<select class="field" id="eGoal">${D.goals.map((g) => `<option value="${g.id}"${e.goalId === g.id ? ' selected' : ''}>${esc(g.name)} (${Math.round(num(g.current))} з ${Math.round(num(g.target))} ${g.currency || '₴'})</option>`).join('')}<option value="__new">+ Нова ціль…</option></select></label>
    <label class="f">Коментар<input class="field" id="eNote" value="${esc(e.note || '')}" placeholder="Наприклад: АТБ, кава з подругою"></label>
    <label class="f">Дата<input class="field" id="eDate" type="date" value="${e.date || (month === monthOf(today()) ? today() : month + '-01')}"></label>
    <div class="row"><button class="btn line" data-close>Скасувати</button><button class="btn" id="eSave">${editing ? 'Зберегти' : 'Додати'}</button></div>`, (box, close) => {
    let cat = e.cat || 'products';
    $$('#eCats .chip', box).forEach((b) => (b.onclick = () => { cat = b.dataset.c; $$('#eCats .chip', box).forEach((x) => x.setAttribute('aria-pressed', x === b)); $('#eGoalWrap', box).hidden = cat !== 'savings'; }));
    $('#eSave', box).onclick = safe(async () => {
      const amount = num($('#eAmt', box).value);
      if (amount <= 0) { $('#eAmt', box).focus(); toast('Вкажіть суму'); return; }
      const d = { amount, cat, note: $('#eNote', box).value.trim(), date: $('#eDate', box).value || today() };
      if (cat === 'savings') {
        let gid = $('#eGoal', box).value;
        if (gid === '__new' || !gid) { const name = prompt('Назва нової цілі (наприклад, «Відпустка»)'); if (!name?.trim()) return; gid = await S.add('goals', { name: name.trim(), target: amount * 10, current: 0, currency: '₴', history: [] }); }
        d.goalId = gid; if (!d.note) d.note = 'У накопичення: ' + (D.goals.find((g) => g.id === gid)?.name || '');
        const old = editing && e.cat === 'savings' && e.goalId ? num(e.amount) : 0;
        if (old && e.goalId !== gid) await moveGoal(e.goalId, -old);
        await moveGoal(gid, amount - (e.goalId === gid ? old : 0));
      } else if (editing && e.cat === 'savings' && e.goalId) await moveGoal(e.goalId, -num(e.amount));
      if (editing) await S.update('expenses', e.id, d); else await S.add('expenses', d);
      close(); toast(editing ? 'Збережено' : `Додано ${money(amount)}`);
    });
    $('#eAmt', box).onkeydown = (ev) => { if (ev.key === 'Enter') $('#eSave', box).click(); };
  });
}
/* поповнення або зменшення цілі накопичення з історією */
async function moveGoal(id, delta) {
  if (!delta) return;
  const g = D.goals.find((x) => x.id === id);
  const h = [...(g?.history || []), { type: delta > 0 ? 'add' : 'remove', amount: Math.abs(delta), date: dayLabel(today()) }];
  await S.update('goals', id, { current: Math.max(0, num(g?.current) + delta), history: h });
}
const delExpense = safe(async (id) => {
  if (!confirm('Видалити витрату?')) return;
  const e = D.expenses.find((x) => x.id === id);
  if (e?.cat === 'savings' && e.goalId && D.goals.some((g) => g.id === e.goalId)) await moveGoal(e.goalId, -num(e.amount));
  await S.remove('expenses', id); toast('Видалено');
});
function expenseItem(e) {
  const c = CAT[e.cat] || CAT.other;
  return `<div class="item"><div class="ic">${ic(c.ic)}</div><div><div class="t">${esc(e.note || c.name)}</div><div class="m">${esc(c.name)}${e.auto ? ' · автоматично' : ''}</div></div>
    <div class="r"><span class="amt">${money(e.amount)}</span><button class="ibtn" data-edit="${e.id}" aria-label="Редагувати">${ic('edit')}</button><button class="ibtn del" data-del="${e.id}" aria-label="Видалити">${ic('trash')}</button></div></div>`;
}
const bindItems = (root) => {
  $$('[data-edit]', root).forEach((b) => (b.onclick = () => expenseForm(D.expenses.find((x) => x.id === b.dataset.edit))));
  $$('[data-del]', root).forEach((b) => (b.onclick = () => delExpense(b.dataset.del)));
};

/* ═════════ ОГЛЯД ═════════ */
function overview(root) {
  const F = financeCtx();
  const left = F.budget - F.spent, pct = F.budget ? Math.min(100, F.spent / F.budget * 100) : 0;
  const cats = CATS.map((c) => ({ ...c, v: F.byCat[c.id] || 0 })).filter((c) => c.v > 0).sort((a, b) => b.v - a.v);
  const recent = [...monthExp(month)].sort((a, b) => (b.date + (b.createdAt || 0)).localeCompare(a.date + (a.createdAt || 0))).slice(0, 7);
  const plans = D.plans.filter((p) => !p.done && p.date >= today()).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const toBuy = D.pantry.filter((p) => p.status === 'buy').length;
  root.innerHTML = `
    <div class="head"><div><p class="kicker">${new Date().toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}</p><h1 class="title">Огляд місяця</h1></div>${monthNav()}</div>
    <div class="grid g5">
      <div class="kpi gold"><span>Бюджет</span><b>${F.budget ? money(F.budget) : '—'}</b><small>${F.budget ? 'на ' + monthLabel(month).toLowerCase() : 'ще не задано'}</small></div>
      <div class="kpi"><span>Витрачено</span><b>${money(F.spent)}</b><small>${F.prevSpent ? `минулого місяця ${money(F.prevSpent)}` : `${monthExp(month).length} записів`}</small></div>
      <div class="kpi"><span>Залишок</span><b class="${left < 0 ? 'neg' : ''}">${F.budget ? money(left) : '—'}</b><small>${left < 0 ? 'перевищено' : 'до кінця місяця'}</small></div>
      <div class="kpi"><span>Відкладено всього</span><b>${money(D.goals.filter((g) => (g.currency || '₴') === '₴').reduce((s, g) => s + num(g.current), 0))}</b><small>${D.goals.length ? `${D.goals.length} цілей · <a href="#goals">переглянути</a>` : '<a href="#goals">створити ціль</a>'}</small></div>
      ${(() => {
        const N = F.next;
        if (!N) return `<div class="kpi"><span>Можна на день</span><b>${F.budget && F.daysLeft && left > 0 ? money(left / F.daysLeft) : '—'}</b><small>${F.daysLeft ? `до кінця місяця ${F.daysLeft} дн. · <a href="#settings">дні зарплати</a>` : 'місяць завершено'}</small></div>`;
        const { avail, per, withAmounts } = F.pay;
        return `<div class="kpi"><span>Можна на день</span><b class="${avail < 0 ? 'neg' : ''}">${F.budget || withAmounts ? (avail > 0 ? money(per) : money(0)) : '—'}</b><small>до ${N.k === 'salary' ? 'зарплати' : 'авансу'} ${N.days} дн. (${N.label})</small></div>`;
      })()}
    </div>
    <div class="card" style="margin-top:20px">
      <div class="progress-row"><span>Використано бюджету</span><span>${Math.round(pct)}%</span></div>
      <div class="bar${pct > 85 ? ' warn' : ''}"><i style="width:${pct}%"></i></div>
      <div class="row" style="margin-top:16px;align-items:end">
        <label class="f">Бюджет на ${monthLabel(month).toLowerCase()}, ₴<input class="field" id="bAmt" inputmode="decimal" value="${F.budget || ''}" placeholder="Наприклад, 25 000"></label>
        <button class="btn" id="bSave">Зберегти бюджет</button>
        ${!F.budget && budgetOf(shiftMonth(month, -1)) ? `<button class="btn line" id="bCopy">Як минулого місяця (${money(budgetOf(shiftMonth(month, -1)))})</button>` : ''}
      </div>
      <div class="row" style="margin-top:12px">
        <button class="btn line sm w-auto" id="mRefresh">Оновити дані</button>
        <button class="btn line sm danger w-auto" id="mReset">Скинути ${monthLabel(month).toLowerCase()}</button>
      </div>
    </div>
    <div class="grid g-main" style="margin-top:20px">
      <div class="card"><h3>Останні витрати <button class="btn sm" id="addExp">${ic('plus')}Додати</button></h3>
        ${recent.length ? `<div class="list">${recent.map(expenseItem).join('')}</div><a class="link" href="#expenses" style="display:inline-block;margin-top:12px">Усі витрати місяця →</a>` : `<div class="empty"><b>Ще немає витрат</b>Натисніть «Додати», щоб записати першу.</div>`}
      </div>
      <div class="grid" style="gap:20px">
        <div class="card"><h3>За категоріями</h3>${cats.length ? `<div class="cats-list">${cats.map((c) => `<div class="cat-row" data-cat="${c.id}"><span class="nm">${ic(c.ic)}${c.name}</span><span class="am">${money(c.v)}</span><div class="bar"><i style="width:${(c.v / cats[0].v) * 100}%"></i></div></div>`).join('')}</div>` : '<p class="sub" style="margin:0">Тут з’явиться розподіл витрат.</p>'}</div>
        <div class="card"><h3>Найближчі плани <a class="link" href="#plans">усі</a></h3>${plans.length ? `<div class="list">${plans.map((p) => `<div class="item"><div class="ic">${ic('cal')}</div><div><div class="t">${esc(p.text)}</div><div class="m">${dayLabel(p.date)}</div></div><div class="r"></div></div>`).join('')}</div>` : '<p class="sub" style="margin:0">Планів немає.</p>'}</div>
        <div class="card"><h3>Покупки</h3><p class="sub" style="margin:0 0 14px">${toBuy ? `У списку покупок <b style="color:var(--text)">${toBuy}</b> позицій.` : 'Список покупок порожній.'}</p><a class="btn line sm" href="#products">До продуктів</a> <a class="btn line sm" href="#bot">Порада від бота</a></div>
      </div>
    </div>`;
  bindMonth(root); bindItems(root);
  $('#addExp').onclick = () => expenseForm();
  $('#bSave').onclick = safe(async () => { const v = num($('#bAmt').value); if (v <= 0) return toast('Вкажіть суму бюджету'); await S.set('budgets', month, { amount: v }); $('#bAmt').blur(); toast('Бюджет збережено'); });
  $('#bAmt').onkeydown = (e) => { if (e.key === 'Enter') $('#bSave').click(); };
  $('#bCopy')?.addEventListener('click', safe(async () => { await S.set('budgets', month, { amount: budgetOf(shiftMonth(month, -1)) }); toast('Бюджет скопійовано'); }));
  $('#mRefresh').onclick = () => { resubscribe(); toast('Дані оновлено'); };
  $('#mReset').onclick = () => {
    const l = monthExp(month);
    modal(`<h3>Скинути ${monthLabel(month).toLowerCase()}?</h3><p class="sub" style="margin:0">Буде видалено ${l.length} витрат на суму ${money(sum(l))}. Інші місяці не зміняться.</p>
      <label style="display:flex;gap:10px;align-items:center;font-size:14px"><input type="checkbox" id="rB"> Також скинути бюджет місяця</label>
      <div class="row"><button class="btn line" data-close>Скасувати</button><button class="btn" id="rOk">Скинути</button></div>`, (box, close) => {
      $('#rOk', box).onclick = safe(async () => { for (const e of l) await S.remove('expenses', e.id); if ($('#rB', box).checked) await S.remove('budgets', month); close(); toast('Місяць скинуто — можна починати спочатку'); });
    });
  };
  $$('[data-cat]', root).forEach((r) => (r.onclick = () => { expFilter.cat = r.dataset.cat; location.hash = 'expenses'; }));
}

/* ═════════ ВИТРАТИ ═════════ */
const expFilter = { cat: '', q: '' };
function expenses(root) {
  let l = monthExp(month).filter((e) => (!expFilter.cat || e.cat === expFilter.cat) && (!expFilter.q || `${e.note} ${CAT[e.cat]?.name}`.toLowerCase().includes(expFilter.q.toLowerCase())));
  l.sort((a, b) => (b.date + (b.createdAt || 0)).localeCompare(a.date + (a.createdAt || 0)));
  const days = {}; l.forEach((e) => (days[e.date] ||= []).push(e));
  root.innerHTML = `
    <div class="head"><div><p class="kicker">Журнал</p><h1 class="title">Витрати</h1><p class="sub">Усього ${money(sum(l))}${expFilter.cat || expFilter.q ? ' за фільтром' : ''} · ${l.length} записів</p></div>
      <div class="row" style="flex:none;align-items:center">${monthNav()}<button class="btn" id="addExp">${ic('plus')}Витрата</button></div></div>
    <div class="card" style="margin-bottom:20px"><div class="row">
      <input class="field" id="xq" data-live="1" placeholder="Пошук за коментарем" value="${esc(expFilter.q)}">
      <select class="field" id="xc"><option value="">Усі категорії</option>${CATS.map((c) => `<option value="${c.id}"${expFilter.cat === c.id ? ' selected' : ''}>${c.name}</option>`).join('')}</select>
      <button class="btn line w-auto" id="csv">${ic('down')}CSV</button></div></div>
    <div class="card">${l.length ? Object.entries(days).map(([d, items]) => `<div class="day-head"><span>${dayLabel(d)}</span><span>${money(sum(items))}</span></div><div class="list">${items.map(expenseItem).join('')}</div>`).join('') : `<div class="empty"><b>Нічого не знайдено</b>${expFilter.cat || expFilter.q ? 'Змініть фільтр.' : 'Додайте першу витрату цього місяця.'}</div>`}</div>`;
  bindMonth(root); bindItems(root);
  $('#addExp').onclick = () => expenseForm({ cat: expFilter.cat || 'products' });
  let t; $('#xq').oninput = (e) => { expFilter.q = e.target.value; clearTimeout(t); t = setTimeout(() => { const p = e.target.selectionStart; draw(); const n = $('#xq'); n.focus(); n.setSelectionRange(p, p); }, 250); };
  $('#xc').onchange = (e) => { expFilter.cat = e.target.value; e.target.blur(); draw(); };
  $('#csv').onclick = () => {
    const rows = [['Дата', 'Категорія', 'Коментар', 'Сума'], ...l.map((e) => [e.date, CAT[e.cat]?.name || e.cat, e.note || '', e.amount])];
    const csv = '﻿' + rows.map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(';')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `витрати-${month}.csv`; a.click();
  };
}

/* ═════════ ПРОДУКТИ ═════════ */
let prodTab = 'buy';
const catalogPrice = (name) => D.catalog.find((c) => c.name === name.toLowerCase());
function products(root) {
  const buy = D.pantry.filter((p) => p.status === 'buy'), home = D.pantry.filter((p) => p.status !== 'buy');
  const names = [...new Set([...D.catalog.map((c) => c.name), ...Object.keys(NUTRITION)])];
  const buyTotal = buy.reduce((s, p) => s + num(p.price), 0);
  root.innerHTML = `
    <div class="head"><div><p class="kicker">Кухня</p><h1 class="title">Продукти</h1><p class="sub">Список покупок, що є вдома, і ціни, які запам’ятовуються самі.</p></div></div>
    <div class="card" style="margin-bottom:20px"><h3>Швидко додати</h3>
      <form id="pForm" class="row" autocomplete="off">
        <input class="field" id="pName" list="pNames" placeholder="Назва: молоко, курка, гречка…" style="flex:2">
        <input class="field" id="pQty" inputmode="decimal" placeholder="Кількість" style="max-width:130px">
        <select class="field" id="pUnit" style="max-width:100px">${UNITS.map((u) => `<option>${u}</option>`).join('')}</select>
        <input class="field" id="pPrice" inputmode="decimal" placeholder="Ціна, ₴" style="max-width:130px">
        <select class="field" id="pWhere" style="max-width:170px"><option value="buy">У список покупок</option><option value="home">Вже є вдома</option></select>
        <button class="btn" type="submit">${ic('plus')}Додати</button>
      </form><datalist id="pNames">${names.map((n) => `<option value="${esc(n)}">`).join('')}</datalist>
      <p class="sub" id="pHint" style="font-size:13px;margin-top:10px">Підказка: почніть вводити назву — ціну підставлю з вашого каталогу.</p></div>
    <div class="seg" style="margin-bottom:16px"><button data-t="buy" aria-pressed="${prodTab === 'buy'}">Купити<b>${buy.length}</b></button><button data-t="home" aria-pressed="${prodTab === 'home'}">Є вдома<b>${home.length}</b></button><button data-t="prices" aria-pressed="${prodTab === 'prices'}">Ціни<b>${D.catalog.length}</b></button></div>
    <div class="card" id="pList"></div>`;
  const L = $('#pList');
  if (prodTab === 'buy') {
    L.innerHTML = buy.length ? `<h3>Список покупок <span style="letter-spacing:0;text-transform:none">орієнтовно ${money(buyTotal)}</span></h3><div class="list">${buy.map((p) => `
      <div class="item"><div class="ic">${ic('basket')}</div><div><div class="t">${esc(p.name)}</div><div class="m">${p.qty ? `${p.qty} ${p.unit}` : ''}</div></div>
      <div class="r"><input class="price-in" data-price="${p.id}" inputmode="decimal" placeholder="Ціна, ₴" value="${p.price || ''}"><button class="btn sm" data-bought="${p.id}">${ic('check')}Куплено</button><button class="ibtn del" data-pdel="${p.id}" aria-label="Видалити">${ic('trash')}</button></div></div>`).join('')}</div>
      <div class="row" style="margin-top:16px"><button class="btn line w-auto" id="buyAll">${ic('check')}Купила все (${money(buyTotal)})</button></div>
      <p class="sub" style="font-size:13px">«Куплено» запише витрату в категорію «Продукти», перенесе продукт у «Є вдома» і запам’ятає ціну.</p>`
      : '<div class="empty"><b>Список покупок порожній</b>Додайте продукти вище або натисніть «Закінчилось» у вкладці «Є вдома».</div>';
  } else if (prodTab === 'home') {
    L.innerHTML = home.length ? `<div class="list">${home.sort((a, b) => a.name.localeCompare(b.name, 'uk')).map((p) => `
      <div class="item"><div class="ic">${ic('box')}</div><div><div class="t">${esc(p.name)}</div><div class="m">${p.price ? `остання ціна ${money(p.price)}` : ''}</div></div>
      <div class="r"><span class="qty"><button data-dq="${p.id}" aria-label="Менше">−</button><span>${p.qty || 0} ${p.unit}</span><button data-iq="${p.id}" aria-label="Більше">+</button></span>
      <button class="btn line sm" data-out="${p.id}">Закінчилось</button><button class="ibtn del" data-pdel="${p.id}" aria-label="Видалити">${ic('trash')}</button></div></div>`).join('')}</div>`
      : '<div class="empty"><b>Поки нічого</b>Позначайте покупки як «Куплено» — і вони з’являться тут.</div>';
  } else {
    L.innerHTML = `<h3>Каталог цін</h3><p class="sub" style="margin:-6px 0 14px;font-size:13px">Ціни оновлюються автоматично, коли ви позначаєте покупку. Можна змінити вручну.</p>
      ${D.catalog.length ? `<div class="list">${[...D.catalog].sort((a, b) => a.name.localeCompare(b.name, 'uk')).map((c) => `
      <div class="item"><div class="ic">${ic('cart')}</div><div><div class="t">${esc(c.name)}</div><div class="m">${c.updated ? 'оновлено ' + dayLabel(c.updated) : ''}</div></div>
      <div class="r"><input class="price-in" data-cprice="${c.id}" inputmode="decimal" value="${c.price || ''}"><span class="m">₴ / ${esc(c.unit || 'шт')}</span><button class="ibtn del" data-cdel="${c.id}" aria-label="Видалити">${ic('trash')}</button></div></div>`).join('')}</div>` : '<div class="empty"><b>Каталог порожній</b>Ціни з’являться, щойно ви щось купите.</div>'}`;
  }
  $$('.seg [data-t]').forEach((b) => (b.onclick = () => { prodTab = b.dataset.t; draw(); }));
  const name = $('#pName');
  name.oninput = () => { const c = catalogPrice(name.value.trim()); $('#pHint').textContent = c ? `Ціна з каталогу: ${money(c.price)} за ${c.unit || 'шт'}` : findFood(name.value) ? 'Знайшла в словнику продуктів.' : 'Підказка: почніть вводити назву — ціну підставлю з вашого каталогу.'; if (c) { $('#pPrice').value = c.price; $('#pUnit').value = c.unit || 'шт'; } };
  $('#pForm').onsubmit = safe(async (e) => {
    e.preventDefault();
    const n = name.value.trim().toLowerCase(); if (!n) { name.focus(); return; }
    const existing = D.pantry.find((p) => p.name === n && p.status === $('#pWhere').value);
    const qty = num($('#pQty').value) || 1;
    if (existing) await S.update('pantry', existing.id, { qty: num(existing.qty) + qty });
    else await S.add('pantry', { name: n, qty, unit: $('#pUnit').value, price: num($('#pPrice').value) || 0, status: $('#pWhere').value });
    prodTab = $('#pWhere').value; e.target.reset(); name.blur(); toast(`«${n}» додано`); draw();
  });
  const setCatalog = async (n, price, unit) => {
    if (!price) return;
    const c = D.catalog.find((x) => x.name === n);
    if (c) await S.update('catalog', c.id, { price, unit: unit || c.unit, updated: today() }); else await S.add('catalog', { name: n, price, unit: unit || 'шт', updated: today() });
  };
  const bought = async (p) => {
    const price = num($(`[data-price="${p.id}"]`)?.value) || num(p.price);
    if (price > 0) await S.add('expenses', { amount: price, cat: 'products', note: p.name, date: today(), auto: true });
    await setCatalog(p.name, price, p.unit);
    const h = D.pantry.find((x) => x.name === p.name && x.status !== 'buy');
    if (h) { await S.update('pantry', h.id, { qty: num(h.qty) + num(p.qty || 1), price: price || h.price }); await S.remove('pantry', p.id); }
    else await S.update('pantry', p.id, { status: 'home', price: price || p.price });
    return price;
  };
  $$('[data-price]').forEach((i) => (i.onchange = safe(async () => S.update('pantry', i.dataset.price, { price: num(i.value) }))));
  $$('[data-bought]').forEach((b) => (b.onclick = safe(async () => { const p = D.pantry.find((x) => x.id === b.dataset.bought); const pr = await bought(p); toast(pr ? `Куплено: ${p.name}, ${money(pr)} записано у витрати` : `Куплено: ${p.name}`); })));
  $('#buyAll')?.addEventListener('click', safe(async () => {
    if (!confirm('Позначити всі продукти як куплені й записати витрати?')) return;
    let t = 0; for (const p of buy) t += await bought(p); toast(`Готово. Записано ${money(t)}`);
  }));
  $$('[data-pdel]').forEach((b) => (b.onclick = safe(async () => S.remove('pantry', b.dataset.pdel))));
  $$('[data-iq]').forEach((b) => (b.onclick = safe(async () => { const p = D.pantry.find((x) => x.id === b.dataset.iq); await S.update('pantry', p.id, { qty: Math.round((num(p.qty) + (p.unit === 'г' || p.unit === 'мл' ? 100 : p.unit === 'кг' || p.unit === 'л' ? 0.5 : 1)) * 10) / 10 }); })));
  $$('[data-dq]').forEach((b) => (b.onclick = safe(async () => { const p = D.pantry.find((x) => x.id === b.dataset.dq); const q = Math.max(0, Math.round((num(p.qty) - (p.unit === 'г' || p.unit === 'мл' ? 100 : p.unit === 'кг' || p.unit === 'л' ? 0.5 : 1)) * 10) / 10); await S.update('pantry', p.id, { qty: q }); if (!q) toast('Закінчилось? Натисніть «Закінчилось», щоб додати в покупки'); })));
  $$('[data-out]').forEach((b) => (b.onclick = safe(async () => { const p = D.pantry.find((x) => x.id === b.dataset.out); await S.update('pantry', p.id, { status: 'buy', qty: p.qty || 1 }); toast(`«${p.name}» у списку покупок`); })));
  $$('[data-cprice]').forEach((i) => (i.onchange = safe(async () => S.update('catalog', i.dataset.cprice, { price: num(i.value), updated: today() }))));
  $$('[data-cdel]').forEach((b) => (b.onclick = safe(async () => S.remove('catalog', b.dataset.cdel))));
}

/* ═════════ БОТ ═════════ */
const chatKey = () => 'hf_chat_' + (user?.uid || 'x');
let chat = null;
function bot(root) {
  if (!chat) { try { chat = JSON.parse(localStorage.getItem(chatKey()) || 'null'); } catch {} }
  if (!chat || !chat.length) chat = [{ who: 'bot', html: reply('привіт').html }];
  if ($('#chatLog', root)) { drawChat(); return; }
  root.innerHTML = `
    <div class="head"><div><p class="kicker">Помічник</p><h1 class="title">Кухня-бот</h1><p class="sub">Рецепти з БЖУ на порцію, розрахунок вашої страви і поради з економії.</p></div><button class="btn line sm" id="clr">Очистити чат</button></div>
    <div class="chat"><div class="chat-log" id="chatLog" aria-live="polite"></div>
      <div class="chat-chips">${['Роблю том ям на 4 порції', 'Борщ на 6 порцій', 'Суп: картопля 500 г, курка 400 г, морква 1 шт, цибуля 1 шт — на 4 порції', 'Сирники на 3 порції', 'Гречка 100 г', 'Дай поради, як зекономити'].map((q) => `<button class="chip" data-q="${esc(q)}">${esc(q.length > 34 ? q.slice(0, 32) + '…' : q)}</button>`).join('')}</div>
      <form class="chat-form" id="chatForm"><textarea class="field" id="chatIn" rows="1" placeholder="Напишіть, що готуєте, або попросіть пораду…"></textarea><button class="btn" aria-label="Надіслати">${ic('send')}</button></form>
    </div>
    <p class="sub" style="font-size:12.5px">Відомі рецепти: ${RECIPE_TITLES.join(', ')}. Для своєї страви перелічіть інгредієнти з вагою через кому.</p>`;
  const send = (q) => {
    q = q.trim(); if (!q) return;
    chat.push({ who: 'me', html: esc(q) });
    const r = reply(q, { finance: financeCtx() });
    chat.push({ who: 'bot', html: r.html, dish: r.dish });
    chat = chat.slice(-60);
    try { localStorage.setItem(chatKey(), JSON.stringify(chat)); } catch {}
    drawChat(true);
  };
  $('#chatForm').onsubmit = (e) => { e.preventDefault(); const v = $('#chatIn').value; $('#chatIn').value = ''; send(v); };
  $('#chatIn').onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#chatForm').requestSubmit(); } };
  $('#chatIn').oninput = (e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(160, e.target.scrollHeight) + 'px'; };
  $$('[data-q]').forEach((b) => (b.onclick = () => send(b.dataset.q)));
  $('#clr').onclick = () => { chat = []; localStorage.removeItem(chatKey()); draw(); };
  drawChat();
}
function drawChat(animateLast) {
  const log = $('#chatLog'); if (!log) return;
  log.innerHTML = chat.map((m, i) => `<div class="msg ${m.who}">${m.html}${m.dish && m.dish.items?.length ? `<div class="acts"><button class="btn sm line" data-shop="${i}">${ic('basket')}Інгредієнти в покупки</button></div>` : ''}</div>`).join('');
  $$('[data-shop]', log).forEach((b) => (b.onclick = safe(async () => {
    const dish = chat[+b.dataset.shop].dish;
    const have = new Set(D.pantry.filter((p) => p.status !== 'buy' && num(p.qty) > 0).map((p) => p.name));
    const add = dish.items.filter((x) => !have.has(x.name) && !/^(вода|сіль)$/.test(x.name));
    for (const x of add) {
      const ex = D.pantry.find((p) => p.name === x.name && p.status === 'buy');
      const g = x.grams; const unit = g >= 1000 ? 'кг' : 'г'; const qty = unit === 'кг' ? Math.round(g / 100) / 10 : g;
      if (!ex) await S.add('pantry', { name: x.name, qty, unit, price: catalogPrice(x.name)?.price || 0, status: 'buy' });
    }
    toast(add.length ? `Додано в покупки: ${add.length} поз. (те, що є вдома, пропущено)` : 'Усе вже є вдома');
  })));
  log.scrollTop = log.scrollHeight;
}

/* ═════════ КОМУНАЛКА ═════════ */
function bills(root) {
  const doc = D.bills.find((b) => b.id === month);
  const prev = D.bills.find((b) => b.id === shiftMonth(month, -1));
  const items = doc?.items || (prev?.items || SERVICES.map((name) => ({ name }))).map((x) => ({ name: x.name, amount: 0, paid: false }));
  const total = items.reduce((s, x) => s + num(x.amount), 0), paid = items.filter((x) => x.paid).reduce((s, x) => s + num(x.amount), 0);
  const meters = METERS.map((m) => { const l = D.meters.filter((x) => x.name === m).sort((a, b) => b.date.localeCompare(a.date)); return { m, last: l[0], prev: l[1] }; });
  root.innerHTML = `
    <div class="head"><div><p class="kicker">Платежі</p><h1 class="title">Комуналка</h1><p class="sub">Оплачено ${money(paid)} з ${money(total)}. Оплачені рахунки автоматично потрапляють у витрати.</p></div>${monthNav()}</div>
    <div class="grid g-main">
      <div class="card"><h3>Рахунки за ${monthLabel(month).toLowerCase()} <button class="btn sm line" id="addSvc">${ic('plus')}Послуга</button></h3><div class="list">${items.map((x, i) => `
        <div class="item"><div class="ic">${ic('bolt')}</div><div><div class="t">${esc(x.name)}</div><div class="m">${x.paid ? 'оплачено' : prev?.items?.find((p) => p.name === x.name)?.amount ? `минулого місяця ${money(prev.items.find((p) => p.name === x.name).amount)}` : ''}</div></div>
        <div class="r"><input class="price-in" data-bamt="${i}" inputmode="decimal" placeholder="Сума, ₴" value="${x.amount || ''}" ${x.paid ? 'disabled' : ''}>
        <button class="btn sm ${x.paid ? 'line' : ''}" data-bpay="${i}">${x.paid ? 'Скасувати' : `${ic('check')}Оплатити`}</button><button class="ibtn del" data-bdel="${i}" aria-label="Прибрати">${ic('x')}</button></div></div>`).join('')}</div></div>
      <div class="card"><h3>Лічильники</h3><div class="list">${meters.map(({ m, last, prev: p }) => `
        <div class="item"><div class="ic">${ic('meter')}</div><div><div class="t">${m}</div><div class="m">${last ? `${last.value} · ${dayLabel(last.date)}${p ? ` · спожито ${Math.round((num(last.value) - num(p.value)) * 100) / 100}` : ''}` : 'ще немає показників'}</div></div>
        <div class="r"><input class="price-in" data-mval="${m}" inputmode="decimal" placeholder="Показник"><button class="btn sm line" data-msave="${m}">Зберегти</button></div></div>`).join('')}</div></div>
    </div>`;
  bindMonth(root);
  const save = (list) => S.set('bills', month, { items: list });
  $$('[data-bamt]').forEach((inp) => (inp.onchange = safe(async () => { const l = items.map((x) => ({ ...x })); l[+inp.dataset.bamt].amount = num(inp.value); await save(l); })));
  $$('[data-bpay]').forEach((b) => (b.onclick = safe(async () => {
    const l = items.map((x) => ({ ...x })); const x = l[+b.dataset.bpay];
    const amt = num($(`[data-bamt="${b.dataset.bpay}"]`).value) || num(x.amount);
    if (!x.paid) {
      if (amt <= 0) return toast('Спочатку вкажіть суму');
      x.amount = amt; x.paid = true;
      x.expenseId = await S.add('expenses', { amount: amt, cat: 'bills', note: x.name, date: month === monthOf(today()) ? today() : month + '-01', auto: true });
      toast(`${x.name}: ${money(amt)} записано у витрати`);
    } else { if (x.expenseId) await S.remove('expenses', x.expenseId).catch(() => {}); x.paid = false; delete x.expenseId; }
    await save(l);
  })));
  $$('[data-bdel]').forEach((b) => (b.onclick = safe(async () => { const x = items[+b.dataset.bdel]; if (x.paid) return toast('Спершу скасуйте оплату'); await save(items.filter((_, i) => i !== +b.dataset.bdel)); })));
  $('#addSvc').onclick = () => { const n = prompt('Назва послуги'); if (n?.trim()) safe(save)([...items, { name: n.trim(), amount: 0, paid: false }]); };
  $$('[data-msave]').forEach((b) => (b.onclick = safe(async () => { const v = $(`[data-mval="${b.dataset.msave}"]`).value; if (!v) return; await S.add('meters', { name: b.dataset.msave, value: num(v), date: today() }); toast('Показник збережено'); })));
}

/* ═════════ ПОБУТ ═════════ */
function household(root) {
  const st = (q) => (q > 2 ? ['ok', 'Є'] : q > 0 ? ['low', 'Закінчується'] : ['out', 'Купити']);
  root.innerHTML = `
    <div class="head"><div><p class="kicker">Дім</p><h1 class="title">Побутова хімія</h1><p class="sub">Що є вдома і що час купити.</p></div></div>
    <div class="card" style="margin-bottom:20px"><form class="row" id="hForm" autocomplete="off">
      <input class="field" id="hName" placeholder="Назва: порошок, засіб для посуду…" style="flex:2">
      <input class="field" id="hQty" inputmode="decimal" placeholder="Кількість" style="max-width:120px">
      <select class="field" id="hUnit" style="max-width:90px">${['шт', 'уп', 'л', 'кг'].map((u) => `<option>${u}</option>`).join('')}</select>
      <select class="field" id="hCat" style="max-width:150px">${HOUSE_CATS.map((c) => `<option>${c}</option>`).join('')}</select>
      <button class="btn" type="submit">${ic('plus')}Додати</button></form></div>
    ${HOUSE_CATS.map((c) => { const l = D.household.filter((h) => (h.cat || 'Інше') === c); return l.length ? `<div class="card" style="margin-bottom:16px"><h3>${c}</h3><div class="list">${l.map((h) => { const [cls, t] = st(num(h.qty)); return `
      <div class="item"><div class="ic">${ic('spray')}</div><div><div class="t">${esc(h.name)}</div><div class="m"><span class="status ${cls}">${t}</span></div></div>
      <div class="r"><span class="qty"><button data-hd="${h.id}">−</button><span>${h.qty || 0} ${h.unit || 'шт'}</span><button data-hi="${h.id}">+</button></span>
      <button class="btn sm line" data-hbuy="${h.id}">Купила</button><button class="ibtn del" data-hdel="${h.id}">${ic('trash')}</button></div></div>`; }).join('')}</div></div>` : ''; }).join('') || '<div class="card"><div class="empty"><b>Список порожній</b>Додайте засоби, якими користуєтесь.</div></div>'}`;
  $('#hForm').onsubmit = safe(async (e) => { e.preventDefault(); const n = $('#hName').value.trim(); if (!n) return; await S.add('household', { name: n, qty: num($('#hQty').value) || 1, unit: $('#hUnit').value, cat: $('#hCat').value }); e.target.reset(); $('#hName').blur(); toast('Додано'); });
  const chg = (id, d) => { const h = D.household.find((x) => x.id === id); return S.update('household', id, { qty: Math.max(0, num(h.qty) + d) }); };
  $$('[data-hi]').forEach((b) => (b.onclick = safe(() => chg(b.dataset.hi, 1))));
  $$('[data-hd]').forEach((b) => (b.onclick = safe(() => chg(b.dataset.hd, -1))));
  $$('[data-hdel]').forEach((b) => (b.onclick = safe(async () => { if (confirm('Видалити?')) await S.remove('household', b.dataset.hdel); })));
  $$('[data-hbuy]').forEach((b) => (b.onclick = () => {
    const h = D.household.find((x) => x.id === b.dataset.hbuy);
    modal(`<h3>Купила: ${esc(h.name)}</h3><label class="f">Скільки<input class="field" id="bq" inputmode="decimal" value="1"></label><label class="f">Ціна, ₴ (запишемо у витрати)<input class="field" id="bp" inputmode="decimal" placeholder="0"></label><div class="row"><button class="btn line" data-close>Скасувати</button><button class="btn" id="bOk">Зберегти</button></div>`, (box, close) => {
      $('#bOk', box).onclick = safe(async () => { await S.update('household', h.id, { qty: num(h.qty) + (num($('#bq', box).value) || 1) }); const p = num($('#bp', box).value); if (p > 0) await S.add('expenses', { amount: p, cat: 'home', note: h.name, date: today(), auto: true }); close(); toast(p ? `Записано ${money(p)}` : 'Оновлено'); });
    });
  }));
}

/* ═════════ НАКОПИЧЕННЯ ═════════ */
function goals(root) {
  root.innerHTML = `
    <div class="head"><div><p class="kicker">Цілі</p><h1 class="title">Накопичення</h1><p class="sub">Усього відкладено ${money(D.goals.filter((g) => (g.currency || '₴') === '₴').reduce((s, g) => s + num(g.current), 0))}</p></div><button class="btn" id="gAdd">${ic('plus')}Нова ціль</button></div>
    <div class="grid g3">${D.goals.length ? D.goals.map((g) => { const pct = num(g.target) ? Math.min(100, num(g.current) / num(g.target) * 100) : 0; const cur = g.currency || '₴'; return `
      <div class="card"><h3>${esc(g.name)}<button class="ibtn del" data-gdel="${g.id}">${ic('trash')}</button></h3>
        <div class="kpi" style="padding:0;border:0;background:none"><b>${Math.round(num(g.current)).toLocaleString('uk-UA')} ${cur}</b><small>з ${Math.round(num(g.target)).toLocaleString('uk-UA')} ${cur} · ${Math.round(pct)}%</small></div>
        <div class="bar" style="margin:14px 0"><i style="width:${pct}%"></i></div>
        <div class="row"><button class="btn sm" data-gin="${g.id}">${ic('plus')}Додати</button><button class="btn sm line" data-gout="${g.id}">Зняти</button></div>
        ${(g.history || []).length ? `<div class="list" style="margin-top:12px">${g.history.slice(-4).reverse().map((h) => `<div class="item" style="padding:8px 0;grid-template-columns:1fr auto"><div class="m">${esc(h.date)}</div><div class="amt" style="color:${h.type === 'add' ? 'var(--green)' : 'var(--red)'}">${h.type === 'add' ? '+' : '−'}${h.amount} ${cur}</div></div>`).join('')}</div>` : ''}
      </div>`; }).join('') : '<div class="card" style="grid-column:1/-1"><div class="empty"><b>Ще немає цілей</b>Наприклад: відпустка, подушка безпеки, новий ноутбук.</div></div>'}</div>`;
  $('#gAdd').onclick = () => modal(`<h3>Нова ціль</h3><label class="f">Назва<input class="field" id="gn" placeholder="Відпустка"></label><div class="row"><label class="f">Сума цілі<input class="field" id="gt" inputmode="decimal"></label><label class="f">Валюта<select class="field" id="gc"><option>₴</option><option>$</option><option>€</option></select></label></div><div class="row"><button class="btn line" data-close>Скасувати</button><button class="btn" id="gOk">Створити</button></div>`, (box, close) => {
    $('#gOk', box).onclick = safe(async () => { const name = $('#gn', box).value.trim(), target = num($('#gt', box).value); if (!name || target <= 0) return toast('Вкажіть назву і суму'); await S.add('goals', { name, target, current: 0, currency: $('#gc', box).value, history: [] }); close(); });
  });
  const op = (id, type) => { const g = D.goals.find((x) => x.id === id); modal(`<h3>${type === 'add' ? 'Відкласти' : 'Зняти'}: ${esc(g.name)}</h3><label class="f">Сума, ${g.currency || '₴'}<input class="field" id="ga" inputmode="decimal"></label><div class="row"><button class="btn line" data-close>Скасувати</button><button class="btn" id="gaOk">Зберегти</button></div>`, (box, close) => {
    $('#gaOk', box).onclick = safe(async () => { const a = num($('#ga', box).value); if (a <= 0) return; const cur = Math.max(0, num(g.current) + (type === 'add' ? a : -a)); await S.update('goals', id, { current: cur, history: [...(g.history || []), { type, amount: a, date: dayLabel(today()) }] }); close(); toast(type === 'add' && cur >= num(g.target) ? 'Ціль досягнута!' : 'Збережено'); });
  }); };
  $$('[data-gin]').forEach((b) => (b.onclick = () => op(b.dataset.gin, 'add')));
  $$('[data-gout]').forEach((b) => (b.onclick = () => op(b.dataset.gout, 'remove')));
  $$('[data-gdel]').forEach((b) => (b.onclick = safe(async () => { if (confirm('Видалити ціль?')) await S.remove('goals', b.dataset.gdel); })));
}

/* ═════════ ПЛАНИ ═════════ */
function plans(root) {
  const [y, m] = month.split('-').map(Number);
  const first = (new Date(y, m - 1, 1).getDay() + 6) % 7, days = new Date(y, m, 0).getDate();
  const has = new Set(D.plans.filter((p) => monthOf(p.date) === month).map((p) => +p.date.slice(8)));
  const t = today();
  const up = D.plans.filter((p) => !p.done).sort((a, b) => a.date.localeCompare(b.date));
  const done = D.plans.filter((p) => p.done).slice(-5);
  root.innerHTML = `
    <div class="head"><div><p class="kicker">Календар</p><h1 class="title">Плани і нагадування</h1></div>${monthNav()}</div>
    <div class="grid g-main">
      <div class="card"><div class="cal">${['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map((d) => `<div class="dn">${d}</div>`).join('')}${'<div class="off"></div>'.repeat(first)}${Array.from({ length: days }, (_, i) => { const d = `${month}-${pad(i + 1)}`; return `<div class="${d === t ? 'today ' : ''}${has.has(i + 1) ? 'has' : ''}" data-day="${d}" style="cursor:pointer">${i + 1}</div>`; }).join('')}</div></div>
      <div class="card"><h3>Додати план</h3><form id="plForm" class="grid" style="gap:12px"><input class="field" id="plT" placeholder="Що зробити: оплатити інтернет, купити подарунок…"><div class="row"><input class="field" id="plD" type="date" value="${t}"><button class="btn" type="submit">${ic('plus')}Додати</button></div></form>
        <h3 style="margin-top:24px">Заплановано</h3>${up.length ? `<div class="list">${up.map((p) => `<div class="item"><div class="ic">${ic('cal')}</div><div><div class="t">${esc(p.text)}</div><div class="m" style="${p.date < t ? 'color:var(--red)' : ''}">${dayLabel(p.date)}${p.date < t ? ' · прострочено' : ''}</div></div><div class="r"><button class="ibtn" data-pdone="${p.id}" aria-label="Виконано">${ic('check')}</button><button class="ibtn del" data-pldel="${p.id}">${ic('trash')}</button></div></div>`).join('')}</div>` : '<p class="sub" style="margin:0">Немає планів.</p>'}
        ${done.length ? `<h3 style="margin-top:24px">Виконано</h3><div class="list">${done.map((p) => `<div class="item" style="opacity:.55"><div class="ic">${ic('check')}</div><div><div class="t" style="text-decoration:line-through">${esc(p.text)}</div><div class="m">${dayLabel(p.date)}</div></div><div class="r"><button class="ibtn del" data-pldel="${p.id}">${ic('trash')}</button></div></div>`).join('')}</div>` : ''}</div>
    </div>`;
  bindMonth(root);
  $$('[data-day]').forEach((c) => (c.onclick = () => { $('#plD').value = c.dataset.day; $('#plT').focus(); }));
  $('#plForm').onsubmit = safe(async (e) => { e.preventDefault(); const text = $('#plT').value.trim(); if (!text) return $('#plT').focus(); await S.add('plans', { text, date: $('#plD').value || t, done: false }); $('#plT').value = ''; $('#plT').blur(); toast('План додано'); });
  $$('[data-pdone]').forEach((b) => (b.onclick = safe(async () => S.update('plans', b.dataset.pdone, { done: true }))));
  $$('[data-pldel]').forEach((b) => (b.onclick = safe(async () => S.remove('plans', b.dataset.pldel))));
}

/* ═════════ НАЛАШТУВАННЯ ═════════ */
const dayOpts = (v) => `<option value="">— не вказано —</option>` + Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}"${+v === i + 1 ? ' selected' : ''}>${i + 1}-го числа</option>`).join('');
function settings(root) {
  root.innerHTML = `
    <div class="head"><div><p class="kicker">Акаунт</p><h1 class="title">Налаштування</h1></div></div>
    <div class="grid g2">
      <div class="card"><h3>Акаунт</h3><p style="margin:0 0 6px">${esc(user.email)}</p><p class="sub" style="margin:0 0 18px">${S.mode === 'demo' ? 'Демо-режим: дані зберігаються лише в цьому браузері.' : 'Ваші дані зберігаються у хмарі й доступні лише вам з будь-якого пристрою.'}</p>
        <button class="btn line" id="out">${ic('out')}Вийти</button></div>
      <div class="card"><h3>Зарплата і аванс</h3><p class="sub" style="margin:0 0 16px">Вкажіть, якого числа приходять гроші. «Можна на день» рахуватиме дні до найближчого надходження, а бот нагадуватиме, скільки протриматись.</p>
        <div class="row"><label class="f">День зарплати<select class="field" id="sDay">${dayOpts(paySettings().salaryDay)}</select></label><label class="f">Сума зарплати, ₴<input class="field" id="sAmt" inputmode="decimal" value="${paySettings().salaryAmount || ''}" placeholder="необов’язково"></label></div>
        <div class="row" style="margin-top:12px"><label class="f">День авансу<select class="field" id="aDay">${dayOpts(paySettings().advanceDay)}</select></label><label class="f">Сума авансу, ₴<input class="field" id="aAmt" inputmode="decimal" value="${paySettings().advanceAmount || ''}" placeholder="необов’язково"></label></div>
        <label style="display:flex;gap:10px;align-items:center;margin-top:14px;font-size:14px"><input type="checkbox" id="pBudget" checked> Бюджет місяця = зарплата + аванс</label>
        <button class="btn" id="pSave" style="margin-top:16px">Зберегти</button>
        <p class="sub" id="pNext" style="font-size:13px">${nextPay() ? `Найближче: ${nextPay().name.toLowerCase()} ${nextPay().label}, через ${nextPay().days} дн.` : ''}</p></div>
      <div class="card"><h3>Перенести старі дані</h3><p class="sub" style="margin:0 0 18px">Скопіює в ваш акаунт дані зі старої версії: бюджет і історію, накопичення, нагадування, продукти й ціни (з бази), а також прогулянки, побут, комуналку і плани (з цього браузера).</p>
        <button class="btn" id="imp">${ic('down')}Перенести</button><p class="sub" id="impMsg" style="font-size:13px"></p></div>
    </div>`;
  $('#out').onclick = logout;
  $('#imp').onclick = safe(importLegacy);
  $('#pSave').onclick = safe(async () => {
    const d = { salaryDay: +$('#sDay').value || null, advanceDay: +$('#aDay').value || null, salaryAmount: num($('#sAmt').value) || null, advanceAmount: num($('#aAmt').value) || null };
    await S.set('settings', 'pay', d);
    const total = num(d.salaryAmount) + num(d.advanceAmount);
    if ($('#pBudget').checked && total > 0) await S.set('budgets', monthOf(today()), { amount: total });
    $$('#view input').forEach((i) => i.blur());
    toast('Збережено' + ($('#pBudget').checked && total > 0 ? `. Бюджет місяця: ${money(total)}` : ''));
  });
}
async function importLegacy() {
  const msg = $('#impMsg'); msg.textContent = 'Переношу…';
  const ls = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
  const t = today(); let n = 0;
  const catMap = { products: 'products', walks: 'walks', home: 'home', bills: 'bills' };
  if (S.readLegacy) {
    const budget = await S.readLegacyDoc('budget', 'main');
    if (budget) {
      if (budget.total && !budgetOf(monthOf(t))) await S.set('budgets', monthOf(t), { amount: num(budget.total) });
      const ex = Object.keys(catMap).filter((k) => num(budget[k]) > 0).map((k) => ({ amount: num(budget[k]), cat: catMap[k], note: 'Перенесено зі старої версії', date: t }));
      if (ex.length) { await S.batchAdd('expenses', ex); n += ex.length; }
    }
    const hist = await S.readLegacy('history');
    const hx = [];
    hist.forEach((h) => { const mm = h.month && h.year ? `${h.year}-${pad(h.month)}` : null; if (!mm) return; if (h.total) S.set('budgets', mm, { amount: num(h.total) }); Object.keys(catMap).forEach((k) => num(h[k]) > 0 && hx.push({ amount: num(h[k]), cat: catMap[k], note: 'Історія зі старої версії', date: mm + '-28' })); });
    if (hx.length) { await S.batchAdd('expenses', hx); n += hx.length; }
    const goalsOld = await S.readLegacy('savingsGoals');
    if (goalsOld.length) { await S.batchAdd('goals', goalsOld.map((g) => ({ name: g.name, target: num(g.goal), current: num(g.current), currency: g.currency === 'грн' || !g.currency ? '₴' : g.currency, history: (g.history || []).map((h) => ({ type: h.type, amount: h.amount, date: h.date })) }))); n += goalsOld.length; }
    const rem = await S.readLegacy('reminders');
    if (rem.length) { await S.batchAdd('plans', rem.map((r) => ({ text: r.text, date: r.date, done: false }))); n += rem.length; }
    const prods = await S.readLegacy('products'), buyOld = await S.readLegacy('buyProducts'), cat = await S.readLegacy('priceCatalog');
    if (prods.length) { await S.batchAdd('pantry', prods.map((p) => ({ name: String(p.name).toLowerCase(), qty: num(p.amount), unit: p.unit || 'шт', price: num(p.price), status: 'home' }))); n += prods.length; }
    if (buyOld.length) { await S.batchAdd('pantry', buyOld.map((p) => ({ name: String(p.name).toLowerCase(), qty: num(p.amount), unit: p.unit || 'шт', price: 0, status: 'buy' }))); n += buyOld.length; }
    if (cat.length) { await S.batchAdd('catalog', cat.map((c) => ({ name: String(c.name).toLowerCase(), price: num(c.price), unit: c.unit || 'шт', updated: t }))); n += cat.length; }
  }
  const walks = ls('walks') || [];
  if (walks.length) { await S.batchAdd('expenses', walks.map((w) => ({ amount: num(w.amount), cat: 'walks', note: w.title, date: t }))); n += walks.length; }
  const hh = ls('homeItems') || [];
  if (hh.length) { await S.batchAdd('household', hh.map((h) => ({ name: h.name, qty: num(h.amount), unit: h.unit || 'шт', cat: HOUSE_CATS.includes(h.category) ? h.category : 'Інше' }))); n += hh.length; }
  const pl = ls('plans') || [];
  if (pl.length) { await S.batchAdd('plans', pl.map((p) => ({ text: p.text, date: p.date, done: false }))); n += pl.length; }
  const bl = ls('bills');
  if (bl?.length && !D.bills.find((b) => b.id === monthOf(t))) { await S.set('bills', monthOf(t), { items: bl.map((b) => ({ name: b.name, amount: num(b.amount), paid: false })) }); n += 1; }
  msg.textContent = n ? `Готово: перенесено ${n} записів.` : 'Старих даних не знайдено.';
}

/* ── старт ── */
chrome();
if (localStorage.getItem('hf_demo') === '1') start({ email: 'Демо-режим', uid: 'demo' }, 'demo');
else {
  auth.onChange((u) => { if (u) start(u, 'cloud'); else showAuth(); }).catch((e) => { console.error(e); showAuth(); });
}
