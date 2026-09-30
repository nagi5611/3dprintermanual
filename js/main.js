// 3Dプリンター使い方ガイド — 画面 UI（素の JS）
(function () {
  const { GUIDE_MACHINES, GUIDE_SECTIONS, GUIDE_CHECKLIST } = window;
  const RESERVE_URL = './reference/public/apps/3dprint-reservation/index.html';
  const LAYOUT = 'alt';

  const root = document.getElementById('root');
  const toast = document.createElement('div');
  toast.className = 'page-toast';
  toast.setAttribute('aria-live', 'polite');

  const state = {
    machine: localStorage.getItem('g3d-machine') || 'ke',
    checkDone: loadCheck(),
    troubleOpen: {},
    tocActive: GUIDE_SECTIONS[0].id,
  };

  /** localStorage からチェックリスト状態を読む */
  function loadCheck() {
    try {
      return JSON.parse(localStorage.getItem('g3d-check')) || [];
    } catch {
      return [];
    }
  }

  /** 機種別フィールドを解決する */
  function pick(v, m) {
    return v && typeof v === 'object' && !Array.isArray(v) && (v.ke || v.cc) ? v[m] : v;
  }

  /** HTML エスケープ */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** 【要記入】等を span.todo に変換した HTML */
  function txtHtml(str) {
    if (str == null) return '';
    const parts = String(str).split(/(【要(?:記入|確認)[^】]*】)/);
    return parts
      .map((p) => (/^【要/.test(p) ? `<span class="todo">${esc(p)}</span>` : esc(p)))
      .join('');
  }

  /** 画像プレースホルダー */
  function phHtml(label, src) {
    const img = src ? `<img src="${esc(src)}" alt="${esc(label || '')}">` : '';
    return `<div class="ph">${img}<span class="ph-l">画像：${esc(label || '')}</span></div>`;
  }

  /** 注意・ヒント */
  function noteHtml(n) {
    if (!n) return '';
    const tag = n.type === 'warn' ? '注意' : 'ヒント';
    return `<div class="note ${esc(n.type)}"><i>${tag}</i><div>${txtHtml(n.text)}</div></div>`;
  }

  /** 1 ステップ（交互レイアウト） */
  function stepHtml(st, i, m, flip) {
    const text = pick(st.text, m);
    const img = pick(st.img, m);
    const hasImg = !!(img || st.src);
    const cls = 'st' + (hasImg ? '' : ' st-noimg') + (flip ? ' st-flip' : '');
    const no = String(i + 1);
    const ph = hasImg ? phHtml(img || '写真', st.src) : '';
    const body = `<h3>${esc(st.title)}</h3><p>${txtHtml(text)}</p>${noteHtml(st.note)}`;
    return `<div class="${cls}">${ph}<div><div class="st-no"><b class="num">${no}</b>ステップ</div>${body}</div></div>`;
  }

  /** チェックリスト */
  function checklistHtml() {
    const total = GUIDE_CHECKLIST.length;
    const n = state.checkDone.length;
    const all = n === total;
    const items = GUIDE_CHECKLIST.map((c, i) => {
      const on = state.checkDone.includes(i);
      return `<li><button type="button" class="${on ? 'on' : ''}" data-check="${i}">
        <span class="box">${on ? '✓' : ''}</span><span class="ct">${esc(c)}</span></button></li>`;
    }).join('');
    return `<div class="check" id="check">
      <div class="check-h">
        <b>印刷前チェックリスト</b>
        <span class="cnt num${all ? ' done' : ''}">${all ? '準備OK ✓' : `${n} / ${total}`}</span>
        <div class="bar${all ? ' done' : ''}"><i style="width:${(n / total) * 100}%"></i></div>
      </div>
      <ul>${items}</ul>
      <div class="check-f"><button type="button" data-check-reset>リセット</button></div>
    </div>`;
  }

  /** トラブルシューティング */
  function troubleHtml(sectionId, items) {
    const open = state.troubleOpen[sectionId] ?? -1;
    return `<div class="tr">${items
      .map((t, i) => {
        const isOpen = open === i;
        return `<div class="tr-i${isOpen ? ' open' : ''}">
          <button type="button" class="tr-q" data-trouble-section="${esc(sectionId)}" data-trouble="${i}">
            <span class="num">Q${i + 1}</span>${esc(t.q)}<em>+</em>
          </button>
          ${isOpen ? `<div class="tr-a"><p>${txtHtml(t.a)}</p>${phHtml(t.img)}</div>` : ''}
        </div>`;
      })
      .join('')}</div>`;
  }

  /** ページ全体を描画 */
  function render() {
    const M = GUIDE_MACHINES[state.machine];
    const seg = Object.entries(GUIDE_MACHINES)
      .map(
        ([k, v]) =>
          `<button type="button" role="tab" aria-selected="${state.machine === k}" class="${state.machine === k ? 'on' : ''}" data-machine="${esc(k)}">${esc(v.name)}</button>`,
      )
      .join('');

    const toc = GUIDE_SECTIONS.map(
      (s) =>
        `<a href="#${esc(s.id)}" class="${state.tocActive === s.id ? 'on' : ''}"><span class="num">${+s.no}</span>${esc(s.title)}</a>`,
    ).join('');

    const sections = GUIDE_SECTIONS.map((s) => {
      let stepsBlock = '';
      if (s.steps) {
        let flipN = 0;
        const steps = s.steps
          .map((st, i) => {
            const has = !!(pick(st.img, state.machine) || st.src);
            const flip = has && flipN++ % 2 === 1;
            return stepHtml(st, i, state.machine, flip);
          })
          .join('');
        stepsBlock = `<div class="L-${LAYOUT}">${steps}</div>`;
      }
      const check = s.id === 'print' ? checklistHtml() : '';
      const trouble = s.trouble ? troubleHtml(s.id, s.trouble) : '';
      const time = s.time ? `<span class="badge badge-muted">目安 ${esc(s.time)}</span>` : '';
      return `<section class="card sec" id="${esc(s.id)}" data-screen-label="${esc(s.no + ' ' + s.title)}">
        <div class="sec-h"><div class="sec-no num">${esc(s.no)}</div><h2>${esc(s.title)}</h2>${time}</div>
        <p class="lead">${esc(s.lead)}</p>${check}${stepsBlock}${trouble}
      </section>`;
    }).join('');

    root.innerHTML = `<header class="site-header"><div class="header-inner">
      <a href="./index.html" class="site-title"><img src="./assets/icon-192.png" alt="">ScienceHUB <span>3Dプリンター使い方ガイド</span></a>
      <div class="seg" role="tablist" aria-label="機種">${seg}</div>
      <a class="btn btn-primary hdr-cta" href="${esc(RESERVE_URL)}">3D印刷予約</a>
    </div></header>
    <div class="main-content">
      <section class="hero">
        <div class="hero-text">
          <span class="badge">自然科学部 / 3Dモデル班</span>
          <h1 class="page-heading">はじめての3Dプリント</h1>
          <p class="page-subheading">本校3Dプリンターの使い方です。データ作りから取り外しまで、この順番どおりに進めればOK。わからないところは飛ばさずに、班員か先生に聞いてください。</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="${esc(RESERVE_URL)}">カレンダーから予約する →</a>
            <a class="btn btn-secondary" href="#check">印刷前チェックリスト</a>
          </div>
        </div>
        <dl class="card spec">
          <div class="spec-h"><b>使用機種の情報</b><span class="badge badge-muted">${esc(M.maker)}</span></div>
          <div class="spec-row"><dt>機種</dt><dd>${esc(M.name)}</dd></div>
          <div class="spec-row"><dt>スライサー</dt><dd>${esc(M.slicer)}</dd></div>
          <div class="spec-row"><dt>基本材料</dt><dd>PLA</dd></div>
          <div class="spec-row"><dt>設置場所</dt><dd><span class="todo">【要記入】</span></dd></div>
          <div class="spec-row"><dt>管理</dt><dd>自然科学部 3Dモデル班</dd></div>
          <div class="spec-row"><dt>顧問</dt><dd><span class="todo">【要記入】</span> 先生</dd></div>
        </dl>
      </section>
      <div class="layout">
        <nav class="toc card"><div class="toc-h">もくじ</div>${toc}
          <div class="keyhint"><kbd>↑</kbd><kbd>↓</kbd> キーでステップごとに移動できます</div>
        </nav>
        <main>${sections}</main>
      </div>
    </div>
    <footer class="site-footer"><div class="footer-inner">
      <div class="footer-club"><img src="./assets/icon-192.png" alt="自然科学部"><div><b>松山南高校 自然科学部 / 3Dモデル班</b><span>わからないことは部員に気軽に聞いてね</span></div></div>
      <div class="footer-meta"><a href="mailto:diorama@mmh-virtual.jp">diorama@mmh-virtual.jp</a>
        <span>最終更新：<span class="todo">【要記入】</span></span></div>
    </div></footer>`;

    if (!toast.parentElement) document.body.appendChild(toast);
    observeSections();
  }

  /** もくじのハイライト（スクロール位置） */
  function observeSections() {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            state.tocActive = e.target.id;
            document.querySelectorAll('.toc a').forEach((a) => {
              a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id);
            });
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    GUIDE_SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
  }

  /** クリック操作 */
  root.addEventListener('click', (e) => {
    const machineBtn = e.target.closest('[data-machine]');
    if (machineBtn) {
      state.machine = machineBtn.getAttribute('data-machine');
      localStorage.setItem('g3d-machine', state.machine);
      render();
      return;
    }

    const checkBtn = e.target.closest('[data-check]');
    if (checkBtn) {
      const i = Number(checkBtn.getAttribute('data-check'));
      const on = state.checkDone.includes(i);
      state.checkDone = on ? state.checkDone.filter((x) => x !== i) : [...state.checkDone, i];
      localStorage.setItem('g3d-check', JSON.stringify(state.checkDone));
      render();
      return;
    }

    if (e.target.closest('[data-check-reset]')) {
      state.checkDone = [];
      localStorage.setItem('g3d-check', '[]');
      render();
      return;
    }

    const trBtn = e.target.closest('[data-trouble]');
    if (trBtn) {
      const sid = trBtn.getAttribute('data-trouble-section');
      const idx = Number(trBtn.getAttribute('data-trouble'));
      state.troubleOpen[sid] = state.troubleOpen[sid] === idx ? -1 : idx;
      render();
    }
  });

  /** ↑↓ キーでステップ移動 */
  function initStepKeys() {
    let anim = null;
    let hideT = null;

    const targets = () => [...document.querySelectorAll('main .st, main .check, main .tr-i')];
    const offset = () => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 84;

    const scrollTo = (y) => {
      cancelAnimationFrame(anim);
      const html = document.documentElement;
      html.style.scrollBehavior = 'auto';
      const from = window.scrollY;
      const d = y - from;
      const dur = Math.min(700, 320 + Math.abs(d) * 0.3);
      const t0 = performance.now();
      const ease = (t) => 1 - Math.pow(1 - t, 4);
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / dur);
        window.scrollTo(0, from + d * ease(t));
        if (t < 1) anim = requestAnimationFrame(tick);
        else html.style.scrollBehavior = '';
      };
      anim = requestAnimationFrame(tick);
    };

    const showToast = (h, n) => {
      toast.innerHTML = `${esc(h)}<b class="num">${esc(n)}</b>`;
      toast.classList.add('show');
      clearTimeout(hideT);
      hideT = setTimeout(() => toast.classList.remove('show'), 1600);
    };

    window.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      if (e.target.closest('input, textarea, select')) return;
      e.preventDefault();
      const list = targets();
      const off = offset();
      const tops = list.map((el) => el.getBoundingClientRect().top - off);
      let i =
        e.key === 'ArrowDown'
          ? tops.findIndex((t) => t > 24)
          : (() => {
              let k = -1;
              tops.forEach((t, j) => {
                if (t < -4) k = j;
              });
              return k;
            })();
      if (i < 0) {
        if (e.key === 'ArrowUp') scrollTo(0);
        return;
      }
      const el = list[i];
      scrollTo(window.scrollY + tops[i] - 12);
      el.classList.remove('st-arrive');
      void el.offsetWidth;
      el.classList.add('st-arrive');
      setTimeout(() => el.classList.remove('st-arrive'), 900);
      const sec = el.closest('.sec');
      const inSec = [...sec.querySelectorAll('.st, .check, .tr-i')];
      showToast(sec.querySelector('h2').textContent, `${inSec.indexOf(el) + 1} / ${inSec.length}`);
    });
  }

  render();
  initStepKeys();
})();
