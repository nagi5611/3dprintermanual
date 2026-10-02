// 3Dプリンター使い方ガイド — メインスクリプト（依存なし）
(() => {
  'use strict';

  const RESERVE_URL = '/apps/3dprint-reservation/';
  const LS_MACHINE = 'g3d-machine';
  const LS_CHECK = 'g3d-check';
  const LS_PAT = 'g3d-pattern';

  const state = {
    machine: localStorage.getItem(LS_MACHINE) in GUIDE_MACHINES ? localStorage.getItem(LS_MACHINE) : 'ke',
    done: (() => { try { return JSON.parse(localStorage.getItem(LS_CHECK)) || []; } catch { return []; } })(),
    openTrouble: 0,
    pattern: (() => { try { return JSON.parse(localStorage.getItem(LS_PAT)) || {}; } catch { return {}; } })(),
  };

  // ── helpers ──
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pick = (v, m) => (v && typeof v === 'object' && (v.ke || v.cc)) ? v[m] : v;
  // 【要記入】【要確認】を黄色タグ化
  // URLは自動でリンク化
  const txt = s => esc(s || '')
    .replace(/(【要(?:記入|確認)[^】]*】)/g, '<span class="todo">$1</span>')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');

  // 画像リストを正規化（文字列 / 配列 / 未指定 → 配列）
  const srcList = v => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);

  const ph = (label, src, srcs, tall) => {
    const list = srcList(srcs);
    const tc = tall ? ' ph-tall' : '';   // 縦長の写真用（枠を 3:4 にする）
    if (list.length > 1)
      return `<div class="ph ph-multi${tc}" data-car data-i="0" role="region" aria-roledescription="carousel" aria-label="${esc(label)}">
        <div class="car-view"><div class="car-track">${list.map((s, k) =>
          `<div class="car-slide" aria-label="${k + 1} / ${list.length}"${k ? ' aria-hidden="true"' : ''}><img src="${esc(s)}" alt="${esc(label)} (${k + 1}/${list.length})" loading="lazy" draggable="false"></div>`).join('')}</div></div>
        <button type="button" class="car-btn car-prev" data-car-go="-1" aria-label="前の画像" disabled>‹</button>
        <button type="button" class="car-btn car-next" data-car-go="1" aria-label="次の画像">›</button>
        <div class="car-ft">
          <div class="car-dots">${list.map((_, k) => `<button type="button" data-car-to="${k}" aria-label="${k + 1}枚目"${k ? '' : ' class="on"'}></button>`).join('')}</div>
          <span class="car-n num"><b>1</b> / ${list.length}</span>
        </div>
      </div>`;
    const one = list[0] || src;
    return one
      ? `<div class="ph ph-img${tc}"><img src="${esc(one)}" alt="${esc(label)}" loading="lazy"></div>`
      : `<div class="ph"><span class="ph-l">画像：${esc(label)}</span></div>`;
  };

  const note = n => !n ? '' :
    `<div class="note ${n.type}"><i>${n.type === 'warn' ? '注意' : 'ヒント'}</i><div>${txt(n.text)}</div></div>`;

  // ── renderers ──
  function renderSpec() {
    const M = GUIDE_MACHINES[state.machine];
    $('#spec-maker').textContent = M.maker;
    $('#spec-name').textContent = M.name;
    $('#spec-slicer').textContent = M.slicer;
  }

  function renderMachineSwitch() {
    $('#machine-seg').innerHTML = Object.entries(GUIDE_MACHINES).map(([k, v]) =>
      `<button type="button" role="tab" data-machine="${k}" aria-selected="${state.machine === k}" class="${state.machine === k ? 'on' : ''}">${esc(v.name)}</button>`
    ).join('');
  }

  function tocLinksHtml() {
    return GUIDE_SECTIONS.map(s =>
      `<a href="#${s.id}" data-sec="${s.id}"><span class="num">${+s.no}</span>${esc(s.title)}</a>`
    ).join('');
  }

  function renderToc() {
    $('#toc-links').innerHTML = tocLinksHtml();
    $('#toc-sheet-list').innerHTML = tocLinksHtml();
  }

  // 小画面用：右端から引き出すもくじドロワー
  function tocSheet() {
    const sheet = $('#toc-sheet'), tab = $('#toc-pill'), hdr = $('.site-header');
    if (!sheet || !tab) return;
    // ドロワーはヘッダーの下から出す
    const syncH = () => document.documentElement.style.setProperty('--hdr-h', hdr.getBoundingClientRect().height + 'px');
    syncH(); window.addEventListener('resize', syncH);
    const set = on => {
      sheet.classList.toggle('open', on);
      tab.setAttribute('aria-expanded', on);
      tab.setAttribute('aria-label', on ? 'もくじを閉じる' : 'もくじを開く');
      document.body.style.overflow = on ? 'hidden' : '';
    };
    tab.addEventListener('click', () => set(!sheet.classList.contains('open')));
    $$('[data-toc-close]').forEach(el => el.addEventListener('click', () => set(false)));
    $$('#toc-sheet-list a').forEach(a => a.addEventListener('click', () => set(false)));
    window.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
    window.matchMedia('(min-width:1001px)').addEventListener('change', e => { if (e.matches) set(false); });
  }

  function stepHtml(s, i, flip) {
    const m = state.machine;
    const img = pick(s.img, m);
    const srcs = pick(s.srcs, m);
    const hasImg = !!(img || srcList(srcs).length);
    const cls = 'st' + (hasImg ? '' : ' st-noimg') + (flip ? ' st-flip' : '');
    return `<div class="${cls}">
      ${hasImg ? ph(img || '写真', s.src, srcs, s.tall) : ''}
      <div>
        <div class="st-no"><b class="num">${i + 1}</b>ステップ</div>
        <h3>${esc(s.title)}</h3>
        <p>${txt(pick(s.text, m))}</p>
        ${note(s.note)}
      </div>
    </div>`;
  }

  function checklistHtml() {
    return `<div class="check" id="check">
      <div class="check-h">
        <b>印刷前チェックリスト</b>
        <span class="cnt num" id="check-cnt"></span>
        <div class="bar" id="check-bar"><i></i></div>
      </div>
      <ul>${GUIDE_CHECKLIST.map((c, i) =>
        `<li><button type="button" data-check="${i}"><span class="box"></span><span class="ct">${esc(c)}</span></button></li>`).join('')}
      </ul>
      <div class="check-f"><button type="button" id="check-reset">リセット</button></div>
    </div>`;
  }

  function updateChecklist() {
    const total = GUIDE_CHECKLIST.length, n = state.done.length, all = n === total;
    const cnt = $('#check-cnt'), bar = $('#check-bar');
    if (!cnt) return;
    cnt.textContent = all ? '準備OK ✓' : `${n} / ${total}`;
    cnt.classList.toggle('done', all);
    bar.classList.toggle('done', all);
    bar.firstElementChild.style.width = (n / total * 100) + '%';
    $$('[data-check]').forEach(b => {
      const on = state.done.includes(+b.dataset.check);
      b.classList.toggle('on', on);
      b.firstElementChild.textContent = on ? '✓' : '';
    });
    localStorage.setItem(LS_CHECK, JSON.stringify(state.done));
  }

  // 参考動画：src（mp4）または url（埋め込み）があればプレーヤー、なければ 16:9 のプレースホルダー
  function videoBlock(v) {
    if (!v) return '';
    const player = v.src
      ? `<video controls preload="metadata" src="${esc(v.src)}"></video>`
      : v.url
        ? `<iframe src="${esc(v.url)}" title="${esc(v.title || '参考動画')}" allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>`
        : `<div class="vid-ph"><span class="vid-play" aria-hidden="true"></span><span class="vid-ph-l">${txt(v.label || '参考動画：動画ファイルか埋め込みURLを入れてください')}</span></div>`;
    return `<div class="vid">
      <div class="vid-h"><b>参考動画</b><span>${esc(v.title || '')}</span></div>
      <div class="vid-frame">${player}</div>
    </div>`;
  }

  function troubleHtml(items) {
    return `<div class="tr">${items.map((t, i) =>
      `<div class="tr-i" data-tr="${i}">
        <button type="button" class="tr-q"><span class="num">Q${i + 1}</span>${esc(t.q)}<em>+</em></button>
        <div class="tr-a"><p>${txt(t.a)}</p>${ph(t.img)}</div>
      </div>`).join('')}</div>`;
  }

  function updateTrouble() {
    $$('[data-tr]').forEach(el => {
      const open = +el.dataset.tr === state.openTrouble;
      el.classList.toggle('open', open);
      el.querySelector('.tr-a').hidden = !open;
    });
  }

  function renderSections() {
    const stepsHtml = list => {
      let n = 0;
      return `<div class="L-alt">${list.map((st, i) => {
        const has = !!(pick(st.img, state.machine) || srcList(pick(st.srcs, state.machine)).length || st.src);
        const flip = has && (n++ % 2 === 1);
        return stepHtml(st, i, flip);
      }).join('')}</div>`;
    };
    const patternsHtml = s => {
      const P = s.patterns;
      const cur = P.options.some(o => o.key === state.pattern[s.id]) ? state.pattern[s.id] : P.options[0].key;
      return `<div class="pat">
        <div class="pat-q">${esc(P.question)}</div>
        <div class="pat-opts" role="tablist">${P.options.map((o, i) =>
          `<button type="button" role="tab" class="pat-o${o.key === cur ? ' on' : ''}" aria-selected="${o.key === cur}" data-pat="${s.id}:${o.key}">
            <span class="pat-k num">${String.fromCharCode(65 + i)}</span>
            <span><b>${esc(o.label)}</b><small>${esc(o.sub || '')}</small></span>
          </button>`).join('')}</div>
      </div>
      ${P.options.map(o => `<div class="pat-pane" data-pane="${o.key}"${o.key === cur ? '' : ' hidden'}>${videoBlock(o.video)}${stepsHtml(o.steps)}</div>`).join('')}`;
    };
    $('#sections').innerHTML = GUIDE_SECTIONS.map(s => {
      const steps = s.patterns ? patternsHtml(s) : s.steps ? stepsHtml(s.steps) : '';
      return `<section class="card sec" id="${s.id}" data-screen-label="${s.no} ${esc(s.title)}">
        <div class="sec-h">
          <div class="sec-no num">${s.no}</div><h2>${esc(s.title)}</h2>
          ${s.time ? `<span class="badge badge-muted">目安 ${esc(s.time)}</span>` : ''}
        </div>
        <p class="lead">${txt(s.lead)}</p>
        ${s.id === 'print' ? checklistHtml() : ''}
        ${steps}
        ${s.trouble ? troubleHtml(s.trouble) : ''}
        ${s.id === 'trouble' ? `<div class="qa-cta">
          <div><b>ここにない困りごとは？</b><span>質問・Q&amp;A で過去の質問を検索したり、部員・先生に質問したりできます。</span></div>
          <a class="btn btn-primary" href="questions/index.html">質問・Q&amp;A を見る →</a>
        </div>` : ''}
      </section>`;
    }).join('');
    updateChecklist();
    updateTrouble();
  }

  function renderAll() {
    renderMachineSwitch();
    renderSpec();
    renderSections();
  }

  // ── events ──
  // ── 画像カルーセル（複数枚のとき） ──
  function carSet(car, i) {
    const slides = $$('.car-slide', car), n = slides.length;
    i = Math.max(0, Math.min(n - 1, i));
    car.dataset.i = i;
    $('.car-track', car).style.transform = `translateX(${-i * 100}%)`;
    slides.forEach((s, k) => s.toggleAttribute('aria-hidden', k !== i));
    $$('[data-car-to]', car).forEach((d, k) => d.classList.toggle('on', k === i));
    $('.car-n b', car).textContent = i + 1;
    $('.car-prev', car).disabled = i === 0;
    $('.car-next', car).disabled = i === n - 1;
  }
  // カード内スワイプ（ページ全体のステップ送りより優先）
  let cs = null;
  document.addEventListener('pointerdown', e => {
    const car = e.target.closest('[data-car]');
    if (!car || e.target.closest('button') || (e.pointerType === 'mouse' && e.button !== 0)) return;
    cs = { car, x: e.clientX, y: e.clientY, dx: 0, lock: null, id: e.pointerId, w: $('.car-view', car).clientWidth };
  });
  document.addEventListener('pointermove', e => {
    if (!cs || e.pointerId !== cs.id) return;
    const dx = e.clientX - cs.x, dy = e.clientY - cs.y;
    if (!cs.lock && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      cs.lock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (cs.lock === 'x') { cs.car.classList.add('dragging'); try { cs.car.setPointerCapture(e.pointerId); } catch {} }
    }
    if (cs.lock !== 'x') return;
    const i = +cs.car.dataset.i, n = $$('.car-slide', cs.car).length;
    const edge = (i === 0 && dx > 0) || (i === n - 1 && dx < 0);
    cs.dx = edge ? dx * 0.3 : dx;
    $('.car-track', cs.car).style.transform = `translateX(calc(${-i * 100}% + ${cs.dx}px))`;
  });
  const carEnd = e => {
    if (!cs || e.pointerId !== cs.id) return;
    const { car, dx, lock, w } = cs; cs = null;
    car.classList.remove('dragging');
    if (lock !== 'x') return;
    car._swiped = true; setTimeout(() => car._swiped = false, 50);
    const i = +car.dataset.i;
    carSet(car, Math.abs(dx) > Math.min(60, w * 0.18) ? i + (dx < 0 ? 1 : -1) : i);
  };
  document.addEventListener('pointerup', carEnd);
  document.addEventListener('pointercancel', carEnd);
  document.addEventListener('keydown', e => {
    const car = e.target.closest && e.target.closest('[data-car]');
    if (!car || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    e.preventDefault();
    carSet(car, +car.dataset.i + (e.key === 'ArrowRight' ? 1 : -1));
  });

  document.addEventListener('click', e => {
    const cg = e.target.closest('[data-car-go]');
    if (cg) { const car = cg.closest('[data-car]'); carSet(car, +car.dataset.i + +cg.dataset.carGo); return; }
    const ct = e.target.closest('[data-car-to]');
    if (ct) { carSet(ct.closest('[data-car]'), +ct.dataset.carTo); return; }
    const mb = e.target.closest('[data-machine]');
    if (mb) {
      state.machine = mb.dataset.machine;
      localStorage.setItem(LS_MACHINE, state.machine);
      renderAll();
      return;
    }
    const pb = e.target.closest('[data-pat]');
    if (pb) {
      const [sec, key] = pb.dataset.pat.split(':');
      state.pattern[sec] = key;
      localStorage.setItem(LS_PAT, JSON.stringify(state.pattern));
      const root = document.getElementById(sec);
      $$('[data-pat]', root).forEach(b => { const on = b === pb; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
      $$('[data-pane]', root).forEach(p => p.hidden = p.dataset.pane !== key);
      return;
    }
    const cb = e.target.closest('[data-check]');
    if (cb) {
      const i = +cb.dataset.check;
      state.done = state.done.includes(i) ? state.done.filter(x => x !== i) : [...state.done, i];
      updateChecklist();
      return;
    }
    if (e.target.closest('#check-reset')) { state.done = []; updateChecklist(); return; }
    const tq = e.target.closest('.tr-q');
    if (tq) {
      const i = +tq.parentElement.dataset.tr;
      state.openTrouble = state.openTrouble === i ? -1 : i;
      updateTrouble();
    }
  });

  // 目次の現在地ハイライト（サイドバー＋シート）／ピルの現在地表示
  function watchToc() {
    const links = $$('#toc-links a, #toc-sheet-list a');
    const mark = id => {
      links.forEach(a => a.classList.toggle('on', a.dataset.sec === id));
    };
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) mark(e.target.id);
    }), { rootMargin: '-30% 0px -60% 0px' });
    GUIDE_SECTIONS.forEach(s => { const el = document.getElementById(s.id); el && io.observe(el); });
    mark(GUIDE_SECTIONS[0].id);
  }

  // ── ステップ移動（↑↓ / Space / PageDown・PageUp / スワイプ） ──
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function stepNav() {
    const toast = $('#page-toast');
    let anim = null, hideT = null;

    const targets = () => $$('main .st').filter(el => !el.closest('[hidden]'));          // 移動対象は各ステップのみ
    const offset = () => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 84;

    function scrollTo(y) {
      cancelAnimationFrame(anim);
      if (reduceMotion) { window.scrollTo(0, y); return; }
      const html = document.documentElement; html.style.scrollBehavior = 'auto';
      const from = window.scrollY, d = y - from, dur = Math.min(700, 320 + Math.abs(d) * 0.3), t0 = performance.now();
      const ease = t => 1 - Math.pow(1 - t, 4);
      const tick = now => {
        const t = Math.min(1, (now - t0) / dur);
        window.scrollTo(0, from + d * ease(t));
        if (t < 1) anim = requestAnimationFrame(tick); else html.style.scrollBehavior = '';
      };
      anim = requestAnimationFrame(tick);
    }

    // 着地演出：左に縦線が伸びる＋画像スライド＋テキストのフェードイン
    function arrive(el) {
      el.classList.remove('st-arrive'); void el.offsetWidth; el.classList.add('st-arrive');
      clearTimeout(el._arriveT);
      el._arriveT = setTimeout(() => el.classList.remove('st-arrive'), 920);
    }

    function showToast(el) {
      const sec = el.closest('.sec');
      if (!sec) return;
      const inSec = $$('.st', sec).filter(x => !x.closest('[hidden]'));
      toast.innerHTML = `${esc(sec.querySelector('h2').textContent)}<b class="num">${inSec.indexOf(el) + 1} / ${inSec.length}</b>`;
      toast.classList.add('show');
      clearTimeout(hideT); hideT = setTimeout(() => toast.classList.remove('show'), 1600);
    }

    // dir: +1 = 下へ / -1 = 上へ
    function go(dir) {
      const list = targets();
      if (!list.length) return false;
      const off = offset();
      const tops = list.map(el => el.getBoundingClientRect().top - off);
      let i;
      if (dir > 0) i = tops.findIndex(t => t > 24);
      else { i = -1; tops.forEach((t, j) => { if (t < -4) i = j; }); }
      if (i < 0) {
        if (dir < 0) scrollTo(0);
        return false;
      }
      const el = list[i];
      scrollTo(window.scrollY + tops[i] - 12);
      arrive(el);
      showToast(el);
      return true;
    }

    // キーボード
    const NEXT = ['ArrowDown', 'PageDown', ' '];
    const PREV = ['ArrowUp', 'PageUp'];
    window.addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t && t.closest && t.closest('input, textarea, select, [contenteditable="true"]')) return;
      let dir = 0;
      if (NEXT.includes(e.key)) dir = 1;
      else if (PREV.includes(e.key)) dir = -1;
      if (!dir) return;
      e.preventDefault();
      go(dir);
    });

    // スワイプ（モバイル）：横スワイプでステップ送り
    let x0 = null, y0 = null, locked = null;
    window.addEventListener('touchstart', e => {
      if (e.touches.length !== 1) return;
      const t = e.target;
      if (t && t.closest && t.closest('input, textarea, select, [data-car]')) return;   // カルーセル内はそちらで処理
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; locked = null;
    }, { passive: true });
    window.addEventListener('touchmove', e => {
      if (x0 === null) return;
      const dx = e.touches[0].clientX - x0, dy = e.touches[0].clientY - y0;
      if (locked === null && (Math.abs(dx) > 12 || Math.abs(dy) > 12)) locked = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (locked === 'x' && e.cancelable) e.preventDefault();
    }, { passive: false });
    window.addEventListener('touchend', e => {
      if (x0 === null) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - x0, dy = t.clientY - y0;
      const wasX = locked === 'x';
      x0 = y0 = null; locked = null;
      if (!wasX || Math.abs(dx) < 48) return;
      go(dx < 0 ? 1 : -1);   // 左へ払う = 次へ
    }, { passive: true });
  }

  // ── init ──
  $$('[data-reserve]').forEach(a => a.href = RESERVE_URL);
  renderToc();
  renderAll();
  watchToc();
  tocSheet();
  stepNav();
})();
