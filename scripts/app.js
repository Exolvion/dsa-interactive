/* ==========================================================================
   App shell: sidebar nav, hash routing, theme toggle.
   Lecture modules call App.registerLecture(...) when their <script> loads;
   App.init() runs after all of them have registered.
   ========================================================================== */
window.App = (function () {
  'use strict';
  const V = window.VizKit;
  const lectures = [];

  function registerLecture(lecture) { lectures.push(lecture); }

  function flatSections() {
    const out = [];
    lectures.forEach(function (lec) {
      lec.sections.forEach(function (sec) { out.push({ lec: lec, sec: sec }); });
    });
    return out;
  }

  function findByHash(hash) {
    hash = (hash || '').replace(/^#\/?/, '');
    const parts = hash.split('/');
    const lecId = parts[0], secId = parts[1];
    const lec = lectures.filter(function (l) { return l.id === lecId; })[0];
    if (!lec) return null;
    const sec = secId ? lec.sections.filter(function (s) { return s.id === secId; })[0] : lec.sections[0];
    if (!sec) return null;
    return { lec: lec, sec: sec };
  }

  function setHash(lecId, secId) {
    window.location.hash = '#/' + lecId + '/' + secId;
  }

  let sidebarEl, mainEl, themeBtn, quizBtn, diagramBtn;

  function buildSidebar() {
    const nav = V.el('div', { class: 'sidebar-nav' });
    lectures.forEach(function (lec) {
      const chevron = V.el('span', { class: 'nav-lecture-chevron' }, '▸');
      const btn = V.el('button', { class: 'nav-lecture-btn' }, [
        V.el('span', { class: 'nav-lecture-num' }, 'L' + lec.number),
        V.el('span', {}, lec.title),
        chevron
      ]);
      const list = V.el('ul', { class: 'nav-sections' });
      lec.sections.forEach(function (sec) {
        const link = V.el('li', {}, V.el('a', { class: 'nav-section-link', 'data-lec': lec.id, 'data-sec': sec.id }, sec.title));
        list.appendChild(link);
      });
      const group = V.el('div', { class: 'nav-lecture', 'data-lec': lec.id }, [btn, list]);
      btn.addEventListener('click', function () {
        const wasOpen = group.classList.contains('open');
        document.querySelectorAll('.nav-lecture').forEach(function (g) { g.classList.remove('open'); });
        if (!wasOpen) group.classList.add('open');
      });
      nav.appendChild(group);
    });
    nav.addEventListener('click', function (e) {
      const a = e.target.closest('.nav-section-link');
      if (!a) return;
      e.preventDefault();
      setHash(a.dataset.lec, a.dataset.sec);
      if (window.innerWidth <= 860) sidebarEl.classList.remove('open');
    });
    sidebarEl.querySelector('.sidebar-nav') && sidebarEl.querySelector('.sidebar-nav').remove();
    sidebarEl.appendChild(nav);
  }

  function highlightActive(lecId, secId) {
    document.querySelectorAll('.nav-lecture').forEach(function (g) {
      g.classList.toggle('open', g.dataset.lec === lecId);
    });
    document.querySelectorAll('.nav-section-link').forEach(function (a) {
      a.classList.toggle('active', a.dataset.lec === lecId && a.dataset.sec === secId);
    });
    if (quizBtn) quizBtn.classList.remove('active');
    if (diagramBtn) diagramBtn.classList.remove('active');
  }

  function renderQuiz() {
    V.clear(mainEl);
    const inner = V.el('div', { class: 'main-inner' });
    mainEl.appendChild(inner);
    window.Quiz.mount(inner);
    mainEl.scrollTop = 0;
    document.querySelectorAll('.nav-lecture').forEach(function (g) { g.classList.remove('open'); });
    document.querySelectorAll('.nav-section-link').forEach(function (a) { a.classList.remove('active'); });
    if (diagramBtn) diagramBtn.classList.remove('active');
    if (quizBtn) quizBtn.classList.add('active');
  }

  function renderDiagramQuiz() {
    V.clear(mainEl);
    const inner = V.el('div', { class: 'main-inner' });
    mainEl.appendChild(inner);
    window.DiagramQuiz.mount(inner);
    mainEl.scrollTop = 0;
    document.querySelectorAll('.nav-lecture').forEach(function (g) { g.classList.remove('open'); });
    document.querySelectorAll('.nav-section-link').forEach(function (a) { a.classList.remove('active'); });
    if (quizBtn) quizBtn.classList.remove('active');
    if (diagramBtn) diagramBtn.classList.add('active');
  }

  function renderSection(lec, sec) {
    V.clear(mainEl);
    const inner = V.el('div', { class: 'main-inner' });
    inner.appendChild(V.el('p', { class: 'crumb' }, 'Lecture ' + lec.number + ' — ' + lec.title));
    inner.appendChild(V.el('h1', { class: 'section-title' }, sec.title));
    if (sec.intro) inner.appendChild(V.el('p', { class: 'section-intro', html: sec.intro }));
    const body = V.el('div', {});
    inner.appendChild(body);

    if (sec.reading && sec.reading.length) {
      const card = V.el('div', { class: 'card' }, [
        V.el('h3', {}, 'Further reading'),
        V.el('ul', { class: 'reading-list' }, sec.reading.map(function (r) {
          return V.el('li', {}, V.el('a', { href: r.url, target: '_blank', rel: 'noopener' }, r.label));
        }))
      ]);
      inner.appendChild(card);
    }

    inner.appendChild(buildBottomNav(lec, sec));
    mainEl.appendChild(inner);
    sec.build(body);
    mainEl.scrollTop = 0;
    highlightActive(lec.id, sec.id);
  }

  function buildBottomNav(lec, sec) {
    const flat = flatSections();
    const idx = flat.findIndex(function (x) { return x.lec.id === lec.id && x.sec.id === sec.id; });
    const prev = idx > 0 ? flat[idx - 1] : null;
    const next = idx < flat.length - 1 ? flat[idx + 1] : null;
    const wrap = V.el('div', { class: 'section-nav-bottom' });
    if (prev) {
      const b = V.el('button', { class: 'section-nav-btn prev' }, [
        V.el('span', { class: 'dir' }, '← Previous'),
        V.el('span', { class: 'label' }, prev.sec.title)
      ]);
      b.onclick = function () { setHash(prev.lec.id, prev.sec.id); };
      wrap.appendChild(b);
    } else { wrap.appendChild(V.el('span', {})); }
    if (next) {
      const b = V.el('button', { class: 'section-nav-btn next' }, [
        V.el('span', { class: 'dir' }, 'Next →'),
        V.el('span', { class: 'label' }, next.sec.title)
      ]);
      b.onclick = function () { setHash(next.lec.id, next.sec.id); };
      wrap.appendChild(b);
    }
    return wrap;
  }

  function route() {
    const hash = (window.location.hash || '').replace(/^#\/?/, '');
    if (hash === 'quiz' || hash.indexOf('quiz/') === 0) { renderQuiz(); return; }
    if (hash === 'diagram' || hash.indexOf('diagram/') === 0) { renderDiagramQuiz(); return; }
    let found = findByHash(window.location.hash);
    if (!found && lectures.length) found = { lec: lectures[0], sec: lectures[0].sections[0] };
    if (!found) return;
    renderSection(found.lec, found.sec);
  }

  function initTheme() {
    const saved = localStorage.getItem('dsa-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    themeBtn.addEventListener('click', function () {
      const cur = document.documentElement.getAttribute('data-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const curDark = cur ? cur === 'dark' : prefersDark;
      const next = curDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('dsa-theme', next);
    });
  }

  function init() {
    document.body.innerHTML = '';
    const toggleBtn = V.el('button', { class: 'sidebar-toggle' }, '☰ Menu');
    quizBtn = V.el('button', { class: 'nav-toplevel-btn' }, [
      V.el('span', { class: 'nav-toplevel-icon' }, '📝'),
      V.el('span', {}, 'MCQ Practice')
    ]);
    diagramBtn = V.el('button', { class: 'nav-toplevel-btn' }, [
      V.el('span', { class: 'nav-toplevel-icon' }, '🖱️'),
      V.el('span', {}, 'Diagram Practice')
    ]);
    sidebarEl = V.el('div', { class: 'sidebar' }, [
      V.el('div', { class: 'sidebar-header' }, [
        V.el('p', { class: 'brand' }, 'DSA Interactive'),
        V.el('p', { class: 'brand-sub' }, 'INF1008 · Lectures 6–10')
      ]),
      V.el('div', { class: 'nav-toplevel' }, [quizBtn, diagramBtn]),
      V.el('div', { class: 'sidebar-footer' }, (themeBtn = V.el('button', { class: 'theme-toggle' }, '🌓 Toggle theme')))
    ]);
    mainEl = V.el('div', { class: 'main' });
    document.body.appendChild(V.el('div', { class: 'app-shell' }, [toggleBtn, sidebarEl, mainEl]));

    toggleBtn.addEventListener('click', function () { sidebarEl.classList.toggle('open'); });
    quizBtn.addEventListener('click', function () {
      window.location.hash = '#/quiz';
      if (window.innerWidth <= 860) sidebarEl.classList.remove('open');
    });
    diagramBtn.addEventListener('click', function () {
      window.location.hash = '#/diagram';
      if (window.innerWidth <= 860) sidebarEl.classList.remove('open');
    });

    buildSidebar();
    initTheme();
    window.addEventListener('hashchange', route);
    route();
  }

  return { registerLecture: registerLecture, init: init };
})();
