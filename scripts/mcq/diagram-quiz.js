/* ==========================================================================
   Diagram Practice — answer questions by clicking directly on a diagram
   (array/hash-table slots, or graph nodes/edges) instead of picking text.
   Reads from window.DiagramBank (scripts/mcq/diagram-l*.js). Question shape:
     kind:'row'   { cells:[{id,label,filled}], correct: id, prompt, explain }
     kind:'graph' { nodes:[{id,x,y,label}], edges:[{from,to,label,cls}],
                    targetType:'node'|'edge', directed, correct: id, prompt, explain }
   ========================================================================== */
window.DiagramQuiz = (function () {
  'use strict';
  const V = window.VizKit;

  const TOPICS = [
    { id: 'l6', num: 6, title: 'Search Algorithms 1' },
    { id: 'l7', num: 7, title: 'Search Algorithms 2' },
    { id: 'l8', num: 8, title: 'Graph Algorithms 1' },
    { id: 'l9', num: 9, title: 'Graph Algorithms 2' },
    { id: 'l10', num: 10, title: 'String Algorithms' }
  ];
  const QUIZ_LEN = 5;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function mount(container) {
    renderPicker(container);
  }

  function renderPicker(container) {
    V.clear(container);
    container.appendChild(V.el('p', { class: 'crumb' }, 'Practice'));
    container.appendChild(V.el('h1', { class: 'section-title' }, 'Diagram Practice'));
    container.appendChild(V.el('p', { class: 'section-intro' },
      'Pick a lecture, then answer by clicking directly on the diagram — a hash-table slot, a tree/graph node, or an edge — instead of picking from text options.'));

    const grid = V.el('div', { class: 'quiz-topic-grid' });
    TOPICS.forEach(function (t) {
      const bank = (window.DiagramBank && window.DiagramBank[t.id]) || [];
      const attrs = { class: 'quiz-topic-card' };
      if (!bank.length) attrs.disabled = true;
      const card = V.el('button', attrs, [
        V.el('span', { class: 'quiz-topic-num' }, 'L' + t.num),
        V.el('span', { class: 'quiz-topic-title' }, t.title),
        V.el('span', { class: 'quiz-topic-count' }, bank.length + ' questions')
      ]);
      if (bank.length) card.addEventListener('click', function () { startQuiz(container, t); });
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  function startQuiz(container, topic) {
    const bank = (window.DiagramBank && window.DiagramBank[topic.id]) || [];
    const count = Math.min(QUIZ_LEN, bank.length);
    const state = { topic: topic, questions: shuffle(bank).slice(0, count), idx: 0, score: 0 };
    renderQuestion(container, state);
  }

  // ------------------------------------------------------------- row kind --
  function renderRow(host, q, onPick) {
    V.clear(host);
    const row = V.el('div', { class: 'quiz-diagram-row' });
    const cellEls = {};
    q.cells.forEach(function (c) {
      const el = V.el('div', { class: 'quiz-diagram-cell' + (c.filled ? ' filled' : '') }, [
        V.el('span', { class: 'idx' }, String(c.id)),
        V.el('span', { class: 'lbl' }, c.label || ' ')
      ]);
      row.appendChild(el);
      cellEls[c.id] = el;
    });
    host.appendChild(row);

    function markResult(pickedId, correct) {
      Object.keys(cellEls).forEach(function (key) { cellEls[key].classList.add('disabled'); });
      if (cellEls[q.correct]) cellEls[q.correct].classList.add('correct');
      if (!correct && cellEls[pickedId] !== undefined && String(pickedId) !== String(q.correct)) {
        cellEls[pickedId].classList.add('incorrect');
      }
    }

    q.cells.forEach(function (c) {
      cellEls[c.id].addEventListener('click', function () { onPick(c.id, markResult); });
    });
  }

  // ----------------------------------------------------------- graph kind --
  function renderGraph(host, q, onPick) {
    V.clear(host);
    const w = 360, h = 280, r = 18;
    const svg = V.svgEl('svg', { class: 'quiz-diagram-graph', viewBox: '0 0 ' + w + ' ' + h });

    if (q.directed) {
      const defs = V.svgEl('defs');
      const marker = V.svgEl('marker', {
        id: 'dq-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5,
        markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse'
      });
      marker.appendChild(V.svgEl('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: 'var(--border)' }));
      defs.appendChild(marker);
      svg.appendChild(defs);
    }

    const nodeById = {};
    q.nodes.forEach(function (n) { nodeById[n.id] = n; });

    const edgeEls = {};
    (q.edges || []).forEach(function (e) {
      const a = nodeById[e.from], b = nodeById[e.to];
      if (!a || !b) return;
      const id = e.id || (e.from + '-' + e.to);
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const ux = dx / len, uy = dy / len;
      const x1 = a.x + ux * r, y1 = a.y + uy * r;
      const x2 = b.x - ux * r, y2 = b.y - uy * r;
      const strokeColor = e.cls === 'red' ? 'var(--accent)' : e.cls === 'black' ? 'var(--text-dim)' : 'var(--border)';
      const line = V.svgEl('line', {
        x1: x1, y1: y1, x2: x2, y2: y2, class: 'g-edge',
        style: 'stroke:' + strokeColor + (e.cls === 'red' ? ';stroke-width:3px' : '')
      });
      if (q.directed) line.setAttribute('marker-end', 'url(#dq-arrow)');
      svg.appendChild(line);

      if (e.label !== undefined) {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const offx = -uy * 10, offy = ux * 10;
        const t = V.svgEl('text', { x: mx + offx, y: my + offy, class: 'g-edge-label' });
        t.textContent = e.label;
        svg.appendChild(t);
      }

      if (q.targetType === 'edge') {
        const hit = V.svgEl('line', { x1: x1, y1: y1, x2: x2, y2: y2, class: 'g-edge-hit' });
        svg.appendChild(hit);
        edgeEls[id] = { hit: hit, visible: line };
      }
    });

    const nodeEls = {};
    q.nodes.forEach(function (n) {
      const g = V.svgEl('g', { class: q.targetType === 'node' ? 'pickable' : '' });
      const circle = V.svgEl('circle', { cx: n.x, cy: n.y, r: r, class: 'g-node-circle' });
      g.appendChild(circle);
      const label = V.svgEl('text', { x: n.x, y: n.y, class: 'g-node-label' });
      label.textContent = n.label !== undefined ? n.label : n.id;
      g.appendChild(label);
      svg.appendChild(g);
      nodeEls[n.id] = { g: g, circle: circle };
    });

    host.appendChild(svg);

    function markResult(pickedId, correct) {
      if (q.targetType === 'node') {
        Object.keys(nodeEls).forEach(function (key) {
          nodeEls[key].g.classList.remove('pickable');
          if (key === String(q.correct)) nodeEls[key].circle.classList.add('correct');
        });
        if (!correct && nodeEls[pickedId]) nodeEls[pickedId].circle.classList.add('incorrect');
      } else {
        Object.keys(edgeEls).forEach(function (key) {
          edgeEls[key].hit.classList.remove('g-edge-hit');
          if (key === String(q.correct)) edgeEls[key].visible.classList.add('correct');
        });
        if (!correct && edgeEls[pickedId]) edgeEls[pickedId].visible.classList.add('incorrect');
      }
    }

    if (q.targetType === 'node') {
      q.nodes.forEach(function (n) {
        nodeEls[n.id].g.addEventListener('click', function () { onPick(n.id, markResult); });
      });
    } else {
      Object.keys(edgeEls).forEach(function (id) {
        edgeEls[id].hit.addEventListener('click', function () { onPick(id, markResult); });
      });
    }
  }

  // -------------------------------------------------------------- shared --
  function renderQuestion(container, state) {
    V.clear(container);
    const q = state.questions[state.idx];

    container.appendChild(V.el('p', { class: 'crumb' }, 'Diagram Practice — L' + state.topic.num + ' · ' + state.topic.title));
    container.appendChild(V.el('div', { class: 'quiz-progress' }, [
      V.el('span', {}, 'Question ' + (state.idx + 1) + ' / ' + state.questions.length),
      V.el('span', {}, 'Score: ' + state.score)
    ]));

    const card = V.el('div', { class: 'card quiz-card' });
    card.appendChild(V.el('h3', { class: 'quiz-question' }, q.prompt));

    const diagramHost = V.el('div', { class: 'viz-area quiz-diagram-host' });
    card.appendChild(diagramHost);

    const feedback = V.el('div', { class: 'quiz-feedback' });
    card.appendChild(feedback);

    let answered = false;
    function onPick(id, markResult) {
      if (answered) return;
      answered = true;
      const correct = String(id) === String(q.correct);
      if (correct) state.score++;
      markResult(id, correct);
      feedback.innerHTML = (correct ? '<b>Correct.</b> ' : '<b>Not quite.</b> ') + q.explain;
      feedback.classList.add(correct ? 'correct' : 'incorrect');
      nextBtn.disabled = false;
      nextBtn.focus();
    }

    if (q.kind === 'row') renderRow(diagramHost, q, onPick);
    else renderGraph(diagramHost, q, onPick);

    const controls = V.el('div', { class: 'controls', style: 'margin-top:18px' });
    const backBtn = V.el('button', { class: 'btn' }, '← Topics');
    backBtn.addEventListener('click', function () { renderPicker(container); });
    const isLast = state.idx === state.questions.length - 1;
    const nextBtn = V.el('button', { class: 'btn primary', disabled: true }, isLast ? 'See score' : 'Next →');
    nextBtn.addEventListener('click', function () {
      state.idx++;
      if (state.idx >= state.questions.length) renderResult(container, state);
      else renderQuestion(container, state);
    });
    controls.appendChild(backBtn);
    controls.appendChild(nextBtn);
    card.appendChild(controls);

    container.appendChild(card);
  }

  function renderResult(container, state) {
    V.clear(container);
    const pct = Math.round(100 * state.score / state.questions.length);
    container.appendChild(V.el('p', { class: 'crumb' }, 'Diagram Practice — L' + state.topic.num + ' · ' + state.topic.title));
    container.appendChild(V.el('h1', { class: 'section-title' }, 'Score: ' + state.score + ' / ' + state.questions.length));
    container.appendChild(V.el('p', { class: 'section-intro' }, pct + '% correct.'));

    const controls = V.el('div', { class: 'controls' });
    const retryBtn = V.el('button', { class: 'btn primary' }, '↻ Retry this topic');
    retryBtn.addEventListener('click', function () { startQuiz(container, state.topic); });
    const backBtn = V.el('button', { class: 'btn' }, '← Choose another topic');
    backBtn.addEventListener('click', function () { renderPicker(container); });
    controls.appendChild(retryBtn);
    controls.appendChild(backBtn);
    container.appendChild(controls);
  }

  return { mount: mount };
})();
