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

  window.Pickers = { select, date, close: closeOpen };
})();
