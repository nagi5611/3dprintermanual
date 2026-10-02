// 質問・Q&A ページ — 表示用スクリプト（デザイン確認用。送信などの内部処理は未実装）
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = d => d.replace(/^\d{4}-0?(\d+)-0?(\d+)$/, '$1/$2');
  const STAFF = ['担当生徒'];

  const state = { cat: 'all', status: 'all', machine: 'all', q: '', open: new Set([QA_ITEMS[0] && QA_ITEMS[0].id]) };

  // ── カテゴリ ──
  function catLinks() {
    const count = id => QA_ITEMS.filter(x => id === 'all' || x.cat === id).length;
    const rows = [{ id: 'all', no: '', title: 'すべての質問' }, ...QA_CATS];
    return rows.map(c =>
      `<a href="#" data-cat="${c.id}" class="${state.cat === c.id ? 'on' : ''}">` +
      `<span class="num${c.id === 'all' ? ' all' : ''}">${c.id === 'all' ? '全' : +c.no}</span>${esc(c.title)}` +
      `<b class="cat-n num">${count(c.id)}</b></a>`).join('');
  }
  function renderCats() {
    $('#cat-links').innerHTML = catLinks();
    $('#toc-sheet-list').innerHTML = catLinks();
  }

  // ── 一覧 ──
  function filtered() {
    const q = state.q.trim().toLowerCase();
    return QA_ITEMS
      .filter(x => state.cat === 'all' || x.cat === state.cat)
      .filter(x => state.status === 'all' || x.status === state.status)
      .filter(x => state.machine === 'all' || x.machine === state.machine || x.machine === 'both')
      .filter(x => !q || (x.title + x.body + x.answers.map(a => a.text).join('')).toLowerCase().includes(q))
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.date.localeCompare(a.date));
  }

  function itemHtml(x) {
    const cat = QA_CATS.find(c => c.id === x.cat);
    const open = state.open.has(x.id);
    const ans = x.answers.length
      ? `<div class="qa-ans">${x.answers.map(a => {
          const staff = STAFF.includes(a.role);
          return `<div class="qa-r${staff ? ' staff' : ''}">
            <div class="qa-av">${esc(staff ? a.by.slice(0, 1) : '質')}</div>
            <div><div class="qa-r-h"><b>${esc(a.by)}</b><span>${esc(a.role)}</span><span class="num">${fmt(a.date)}</span></div><p>${esc(a.text)}</p></div>
          </div>`;
        }).join('')}</div>`
      : `<div class="qa-empty-a">まだ回答はありません。担当生徒が確認しています。</div>`;
    return `<article class="card qa-i${open ? ' open' : ''}" data-id="${x.id}">
      <button type="button" class="qa-q" aria-expanded="${open}">
        <span class="qa-st ${x.status}">${x.status === 'answered' ? '回答済み' : '未回答'}</span>
        <span class="qa-t">${esc(x.title)}</span>
        <span class="qa-meta">
          ${x.pinned ? '<span class="pin">よくある質問</span>' : ''}
          <span>${cat ? cat.no + ' ' + esc(cat.title) : ''}</span>
          <span>${esc(QA_MACHINES[x.machine])}</span>
          <span class="num">回答 ${x.answers.length}</span>
          <span class="num">${fmt(x.date)}</span>
        </span>
        <em>+</em>
      </button>
      <div class="qa-a"${open ? '' : ' hidden'}>
        <p class="qa-body">${esc(x.body)}</p>
        ${ans}
        <div class="qa-reply">
          <textarea rows="1" placeholder="回答・追加の質問を書く"></textarea>
          <button type="button" class="btn btn-secondary" data-reply>送信</button>
        </div>
        ${cat ? `<a class="qa-guide" href="../index.html#${cat.id}">ガイドの「${esc(cat.title)}」を見る →</a>` : ''}
      </div>
    </article>`;
  }

  function renderList() {
    const list = filtered();
    const cat = QA_CATS.find(c => c.id === state.cat);
    $('#qa-heading').textContent = cat ? `${cat.no} ${cat.title}` : 'すべての質問';
    $('#qa-count').textContent = `${list.length}件`;
    $('#qa-list').innerHTML = list.length ? list.map(itemHtml).join('') :
      `<div class="card qa-none"><b>該当する質問が見つかりませんでした</b>キーワードや絞り込みを変えるか、新しく質問してください。<br><button type="button" class="btn btn-primary" data-ask>質問する</button></div>`;
  }

  // ── トースト ──
  const toast = $('#page-toast'); let hideT;
  function showToast(msg) {
    toast.innerHTML = msg; toast.classList.add('show');
    clearTimeout(hideT); hideT = setTimeout(() => toast.classList.remove('show'), 2000);
  }

  // ── ドロワー（ガイドと同じ挙動） ──
  const sheet = $('#toc-sheet'), tab = $('#toc-pill'), hdr = $('.site-header');
  const syncH = () => document.documentElement.style.setProperty('--hdr-h', hdr.getBoundingClientRect().height + 'px');
  syncH(); window.addEventListener('resize', syncH);
  const setSheet = on => {
    sheet.classList.toggle('open', on);
    tab.setAttribute('aria-expanded', on);
    document.body.style.overflow = on ? 'hidden' : '';
  };
  tab.addEventListener('click', () => setSheet(!sheet.classList.contains('open')));
  window.matchMedia('(min-width:1001px)').addEventListener('change', e => { if (e.matches) setSheet(false); });

  // ── 質問フォーム ──
  const modal = $('#qa-modal');
  $('#qa-form-cat').innerHTML = '<option value="">選んでください</option>' + QA_CATS.map(c => `<option value="${c.id}">${c.no} ${esc(c.title)}</option>`).join('');
  const setModal = on => { modal.hidden = !on; document.body.style.overflow = on ? 'hidden' : ''; if (on) setTimeout(() => $('#qa-form input').focus(), 50); };
  $('#qa-form').addEventListener('submit', e => { e.preventDefault(); setModal(false); e.target.reset(); showToast('質問を送信しました<b>（デザイン確認用）</b>'); });

  // ── events ──
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-cat]');
    if (c) { e.preventDefault(); state.cat = c.dataset.cat; renderCats(); renderList(); setSheet(false); window.scrollTo({ top: $('.layout').offsetTop - 80, behavior: 'smooth' }); return; }
    if (e.target.closest('[data-toc-close]')) { setSheet(false); return; }
    if (e.target.closest('[data-ask]')) { setModal(true); return; }
    if (e.target.closest('[data-ask-close]')) { setModal(false); return; }
    const sb = e.target.closest('#qa-status button');
    if (sb) { state.status = sb.dataset.status; $$('#qa-status button').forEach(b => b.classList.toggle('on', b === sb)); renderList(); return; }
    const mb = e.target.closest('#qa-machine button');
    if (mb) { state.machine = mb.dataset.machine; $$('#qa-machine button').forEach(b => b.classList.toggle('on', b === mb)); renderList(); return; }
    const fm = e.target.closest('#qa-form-machine button');
    if (fm) { $$('#qa-form-machine button').forEach(b => b.classList.toggle('on', b === fm)); return; }
    if (e.target.closest('[data-reply]')) { showToast('送信しました<b>（デザイン確認用）</b>'); return; }
    const q = e.target.closest('.qa-q');
    if (q) {
      const id = +q.closest('.qa-i').dataset.id;
      state.open.has(id) ? state.open.delete(id) : state.open.add(id);
      renderList();
    }
  });
  $('#qa-q').addEventListener('input', e => { state.q = e.target.value; renderList(); });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') { setModal(false); setSheet(false); } });

  renderCats();
  renderList();
})();
