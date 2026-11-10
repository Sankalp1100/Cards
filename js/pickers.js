// Our own dropdown and calendar (the browser's grey popups can't be styled, ran into the top bar
// and had no "Save"). The real <select>/<input> stays in the form, hidden, and keeps the value.
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let openOne = null;
  const closeOpen = () => { if (openOne) openOne(); };
  document.addEventListener('pointerdown', e => { if (openOne && !e.target.closest('.fx-wrap')) closeOpen(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeOpen(); });
  addEventListener('resize', closeOpen);

  // Keeps a popup inside the screen and below the sticky top bar: opens downward, or upward if there is more room there
  function place(pop, anchor) {
    const r = anchor.getBoundingClientRect();
    const nav = document.querySelector('.nav');
    const topLimit = Math.max(8, nav ? nav.getBoundingClientRect().bottom + 8 : 8);
    const bottomLimit = innerHeight - (document.querySelector('.bottom-nav')?.offsetHeight || 0) - 8;
    const below = bottomLimit - r.bottom - 6, above = r.top - topLimit - 6;
    const want = pop.scrollHeight;
    const down = below >= Math.min(want, 260) || below >= above;
    pop.classList.toggle('up', !down);
    pop.style.maxHeight = Math.max(160, Math.min(want, down ? below : above)) + 'px';
  }

  function select(sel) {
    if (!sel || sel.dataset.fx) return;
    sel.dataset.fx = '1';
    const wrap = document.createElement('div'); wrap.className = 'fx-wrap';
    sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(sel);
    sel.classList.add('fx-hidden'); sel.tabIndex = -1;
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'fx-btn'; btn.setAttribute('aria-haspopup', 'listbox');
    const list = document.createElement('div'); list.className = 'fx-pop fx-list'; list.setAttribute('role', 'listbox'); list.hidden = true;
    wrap.append(btn, list);
    list.addEventListener('click', e => { if (!e.target.closest('[data-i]')) e.preventDefault(); }); // a tap on the gap must not reach the <label>
    const label = () => { const o = sel.options[sel.selectedIndex]; btn.innerHTML = `<span>${esc(o ? o.text : '')}</span><i aria-hidden="true"></i>`; };
    let hi = 0;
    const mark = () => [...list.children].forEach((b, i) => { b.classList.toggle('hi', i === hi); if (i === hi) b.scrollIntoView({ block: 'nearest' }); });
    const close = () => { list.hidden = true; btn.setAttribute('aria-expanded', 'false'); wrap.classList.remove('open'); if (openOne === close) openOne = null; };
    const open = () => {
      closeOpen();
      list.innerHTML = [...sel.options].map((o, i) => `<button type="button" role="option" data-i="${i}" class="${i === sel.selectedIndex ? 'on' : ''}" aria-selected="${i === sel.selectedIndex}">${esc(o.text)}</button>`).join('');
      list.hidden = false; wrap.classList.add('open'); btn.setAttribute('aria-expanded', 'true');
      place(list, btn); hi = sel.selectedIndex; mark(); openOne = close;
    };
    const pick = i => { sel.selectedIndex = i; sel.dispatchEvent(new Event('change', { bubbles: true })); sel.dispatchEvent(new Event('input', { bubbles: true })); label(); close(); btn.focus(); };
    btn.addEventListener('click', () => (list.hidden ? open() : close()));
    list.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) pick(+b.dataset.i); });
    btn.addEventListener('keydown', e => {
      if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); if (list.hidden) return open(); hi = Math.max(0, Math.min(sel.options.length - 1, hi + (e.key === 'ArrowDown' ? 1 : -1))); mark(); }
      else if ((e.key === 'Enter' || e.key === ' ') && !list.hidden) { e.preventDefault(); pick(hi); }
    });
    sel.addEventListener('change', label);
    label();
  }

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const shown = v => v ? v.split('-').reverse().join('-') : '';

  function date(input, opts = {}) {
    if (!input || input.dataset.fx) return;
    input.dataset.fx = '1';
    const wrap = document.createElement('div'); wrap.className = 'fx-wrap';
    input.parentNode.insertBefore(wrap, input); wrap.appendChild(input);
    input.type = 'hidden';
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'fx-btn fx-date'; btn.setAttribute('aria-haspopup', 'dialog');
    const pop = document.createElement('div'); pop.className = 'fx-pop fx-cal'; pop.hidden = true; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Choose a date');
    wrap.append(btn, pop);
    pop.addEventListener('click', e => { if (!e.target.closest('button:not([disabled])')) e.preventDefault(); });
    const today = iso(new Date());
    const min = opts.future === false ? '' : today;
    let view = new Date(), pending = '';
    const label = () => { btn.classList.toggle('empty', !input.value); btn.innerHTML = `<span>${input.value ? shown(input.value) : 'dd-mm-yyyy'}</span><i aria-hidden="true">📅</i>`; };
    function draw() {
      const y = view.getFullYear(), m = view.getMonth();
      const first = new Date(y, m, 1), start = new Date(y, m, 1 - first.getDay());
      let days = '';
      for (let i = 0; i < 42; i++) {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i), v = iso(d);
        const cls = [d.getMonth() !== m && 'out', v === today && 'today', v === pending && 'on', min && v < min && 'past'].filter(Boolean).join(' ');
        days += `<button type="button" data-d="${v}" class="${cls}" ${min && v < min ? 'disabled' : ''}>${d.getDate()}</button>`;
      }
      const canBack = !min || iso(new Date(y, m, 0)) >= min;
      pop.innerHTML = `<div class="fx-cal-head"><button type="button" data-nav="-1" aria-label="Previous month" ${canBack ? '' : 'disabled'}>‹</button><b>${MONTHS[m]} ${y}</b><button type="button" data-nav="1" aria-label="Next month">›</button></div>
        <div class="fx-cal-week">${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(w => `<span>${w}</span>`).join('')}</div>
        <div class="fx-cal-days">${days}</div>
        <div class="fx-cal-foot"><button type="button" data-act="clear">Clear</button><button type="button" data-act="save" class="fx-save" ${pending ? '' : 'disabled'}>Save</button><button type="button" data-act="today">Today</button></div>`;
    }
    const close = () => { pop.hidden = true; wrap.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); if (openOne === close) openOne = null; };
    const open = () => {
      closeOpen();
      pending = input.value; view = pending ? new Date(pending + 'T00:00') : new Date();
      draw(); pop.hidden = false; wrap.classList.add('open'); btn.setAttribute('aria-expanded', 'true');
      place(pop, btn); openOne = close;
    };
    const commit = v => { input.value = v; input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); label(); close(); btn.focus(); };
    btn.addEventListener('click', () => (pop.hidden ? open() : close()));
    pop.addEventListener('click', e => {
      const nav = e.target.closest('[data-nav]'), day = e.target.closest('[data-d]'), act = e.target.closest('[data-act]');
      if (nav && !nav.disabled) { view = new Date(view.getFullYear(), view.getMonth() + +nav.dataset.nav, 1); draw(); }
      else if (day && !day.disabled) { pending = day.dataset.d; if (day.classList.contains('out')) view = new Date(pending + 'T00:00'); draw(); }
      else if (act) {
        if (act.dataset.act === 'clear') commit('');
        else if (act.dataset.act === 'today') { pending = today; view = new Date(); draw(); }
        else if (act.dataset.act === 'save' && pending) commit(pending);
      }
    });
    pop.addEventListener('dblclick', e => { const day = e.target.closest('[data-d]'); if (day && !day.disabled) commit(day.dataset.d); });
    input.form && input.form.addEventListener('reset', () => setTimeout(label));
    label();
  }

  // ---------- Floating calendar (+ time) for every date / date-and-time box inside `root` ----------
  // The boxes stay real inputs (their value, events and validation are untouched); they are made read-only so the
  // browser's own grey picker never opens, and a tap opens ours: Clear · Save · Today, past days off.
  const DT = 'input[type="date"], input[type="datetime-local"]';
  let fpop = null, fclose = null;
  function floating(input) {
    if (fclose) fclose();
    const withTime = (input.getAttribute('type') || input.type) === 'datetime-local';
    const today = iso(new Date());
    const min = input.min || '';
    const minDay = min.slice(0, 10);
    let v = input.value || '';
    let day = v.slice(0, 10), hh = 19, mm = 0;
    if (/T\d\d:\d\d/.test(v)) { hh = +v.slice(11, 13); mm = +v.slice(14, 16); }
    let view = day ? new Date(day + 'T00:00') : (minDay && minDay > today ? new Date(minDay + 'T00:00') : new Date());
    const pop = document.createElement('div');
    pop.className = 'fx-pop fx-cal fx-float' + (withTime ? ' with-time' : '');
    pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', withTime ? 'Choose date and time' : 'Choose a date');
    document.body.appendChild(pop);
    const value = () => day ? (withTime ? `${day}T${String(hh).padStart(2, '0')}:${String(Math.round(mm)).padStart(2, '0')}` : day) : '';
    const tooEarly = () => !!(day && min && value() < (withTime ? min : minDay));
    function draw() {
      const y = view.getFullYear(), m = view.getMonth();
      const start = new Date(y, m, 1 - new Date(y, m, 1).getDay());
      let days = '';
      for (let i = 0; i < 42; i++) {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i), s = iso(d), past = minDay && s < minDay;
        days += `<button type="button" data-d="${s}" class="${[d.getMonth() !== m && 'out', s === today && 'today', s === day && 'on', past && 'past'].filter(Boolean).join(' ')}" ${past ? 'disabled' : ''}>${d.getDate()}</button>`;
      }
      const canBack = !minDay || iso(new Date(y, m, 0)) >= minDay;
      const h12 = hh % 12 || 12, pm = hh >= 12;
      const col = (items, cur, k) => `<div class="fx-col" data-col="${k}">${items.map(([val, txt]) => `<button type="button" data-${k}="${val}" class="${val === cur ? 'on' : ''}">${txt}</button>`).join('')}</div>`;
      const time = withTime ? `<div class="fx-time"><p>Time</p><div class="fx-cols">
          ${col(Array.from({ length: 12 }, (_, i) => [i + 1, String(i + 1).padStart(2, '0')]), h12, 'h')}
          ${col(Array.from({ length: 12 }, (_, i) => [i * 5, String(i * 5).padStart(2, '0')]), Math.round(mm / 5) * 5 % 60, 'm')}
          ${col([['am', 'AM'], ['pm', 'PM']], pm ? 'pm' : 'am', 'ap')}</div></div>` : '';
      pop.innerHTML = `<div class="fx-cal-main"><div class="fx-cal-head"><button type="button" data-nav="-1" aria-label="Previous month" ${canBack ? '' : 'disabled'}>‹</button><b>${MONTHS[m]} ${y}</b><button type="button" data-nav="1" aria-label="Next month">›</button></div>
        <div class="fx-cal-week">${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(w => `<span>${w}</span>`).join('')}</div>
        <div class="fx-cal-days">${days}</div></div>${time}
        <p class="fx-note">${tooEarly() ? 'That time has already passed: pick a later one.' : day ? (withTime ? new Date(value()).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : new Date(day + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })) : 'Pick a day' + (withTime ? ' and a time' : '')}</p>
        <div class="fx-cal-foot"><button type="button" data-act="clear">Clear</button><button type="button" data-act="save" class="fx-save" ${day && !tooEarly() ? '' : 'disabled'}>Save</button><button type="button" data-act="today">Today</button></div>`;
      pop.querySelectorAll('.fx-col .on').forEach(b => { b.parentNode.scrollTop = b.offsetTop - b.parentNode.clientHeight / 2 + b.offsetHeight / 2; });
    }
    function placeFloat() {
      const r = input.getBoundingClientRect(), W = innerWidth, H = innerHeight;
      const w = Math.min(pop.offsetWidth, W - 16);
      pop.style.left = Math.max(8, Math.min(r.left, W - w - 8)) + 'px';
      const below = H - r.bottom - 12, above = r.top - 12, h = pop.offsetHeight;
      if (below >= h || below >= above) { pop.style.top = Math.min(r.bottom + 6, Math.max(8, H - h - 8)) + 'px'; pop.style.bottom = 'auto'; pop.classList.remove('up'); }
      else { pop.style.top = 'auto'; pop.style.bottom = Math.min(H - r.top + 6, Math.max(8, H - h - 8)) + 'px'; pop.classList.add('up'); }
      pop.style.maxHeight = (H - 16) + 'px';
    }
    const commit = val => {
      input.value = val;
      input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true }));
      close(); try { input.focus({ preventScroll: true }); } catch (e) { /* old browser */ }
    };
    const onDown = e => { if (!pop.contains(e.target) && e.target !== input) close(); };
    const onScroll = e => { if (!pop.contains(e.target)) placeFloat(); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    function close() {
      pop.remove(); fpop = fclose = null;
      document.removeEventListener('pointerdown', onDown, true); document.removeEventListener('scroll', onScroll, true);
      document.removeEventListener('keydown', onKey); removeEventListener('resize', close);
    }
    pop.addEventListener('click', e => {
      const t = e.target.closest('button'); if (!t || t.disabled) return;
      if (t.dataset.nav) { view = new Date(view.getFullYear(), view.getMonth() + +t.dataset.nav, 1); draw(); }
      else if (t.dataset.d) { day = t.dataset.d; if (t.classList.contains('out')) view = new Date(day + 'T00:00'); draw(); }
      else if (t.dataset.h) { const pm = hh >= 12; hh = (+t.dataset.h % 12) + (pm ? 12 : 0); draw(); }
      else if (t.dataset.m != null && t.dataset.m !== undefined && t.hasAttribute('data-m')) { mm = +t.dataset.m; draw(); }
      else if (t.dataset.ap) { const h12 = hh % 12; hh = h12 + (t.dataset.ap === 'pm' ? 12 : 0); draw(); }
      else if (t.dataset.act === 'clear') commit('');
      else if (t.dataset.act === 'today') { day = today; view = new Date(); if (withTime && tooEarly()) { const n = new Date(Date.now() + 3600e3); hh = n.getHours(); mm = 0; } draw(); }
      else if (t.dataset.act === 'save' && day && !tooEarly()) commit(value());
    });
    pop.addEventListener('dblclick', e => { const t = e.target.closest('[data-d]'); if (t && !t.disabled && !withTime) commit(t.dataset.d); });
    draw(); placeFloat();
    document.addEventListener('pointerdown', onDown, true); document.addEventListener('scroll', onScroll, true);
    document.addEventListener('keydown', onKey); addEventListener('resize', close);
    fpop = pop; fclose = close;
  }
  function attach(root) {
    if (!root || root.dataset.fxDates) return;
    root.dataset.fxDates = '1';
    const lock = e => { const i = e.target.closest && e.target.closest(DT); if (i) i.readOnly = true; };
    root.addEventListener('pointerdown', lock, true);
    root.addEventListener('focusin', lock);
    root.querySelectorAll(DT).forEach(i => { i.readOnly = true; });
    root.addEventListener('click', e => { const i = e.target.closest(DT); if (!i || i.disabled) return; e.preventDefault(); i.readOnly = true; floating(i); });
    root.addEventListener('keydown', e => { const i = e.target.closest(DT); if (i && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); floating(i); } });
  }

  window.Pickers = { select, date, attach, close: () => { closeOpen(); if (fclose) fclose(); } };
})();
