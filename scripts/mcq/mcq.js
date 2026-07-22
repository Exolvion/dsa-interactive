/* ==========================================================================
   MCQ Practice — topic picker + one-question-at-a-time quiz runner.
   Reads from window.MCQBank (populated by scripts/mcq/bank-l*.js), each
   entry: { q, options: [...], answer: index, explain }.
   ========================================================================== */
window.Quiz = (function () {
  'use strict';
  const V = window.VizKit;

  const TOPICS = [
    { id: 'l6', num: 6, title: 'Search Algorithms 1' },
    { id: 'l7', num: 7, title: 'Search Algorithms 2' },
    { id: 'l8', num: 8, title: 'Graph Algorithms 1' },
    { id: 'l9', num: 9, title: 'Graph Algorithms 2' },
    { id: 'l10', num: 10, title: 'String Algorithms' }
  ];
  const QUIZ_LEN = 10;

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
    container.appendChild(V.el('h1', { class: 'section-title' }, 'MCQ Practice'));
    container.appendChild(V.el('p', { class: 'section-intro' },
      'Pick a lecture to pull a fresh set of multiple-choice questions from that topic’s bank. Each question is checked immediately with an explanation.'));

    const grid = V.el('div', { class: 'quiz-topic-grid' });
    TOPICS.forEach(function (t) {
      const bank = (window.MCQBank && window.MCQBank[t.id]) || [];
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
    const bank = (window.MCQBank && window.MCQBank[topic.id]) || [];
    const count = Math.min(QUIZ_LEN, bank.length);
    const state = { topic: topic, questions: shuffle(bank).slice(0, count), idx: 0, score: 0 };
    renderQuestion(container, state);
  }

  function renderQuestion(container, state) {
    V.clear(container);
    const q = state.questions[state.idx];

    container.appendChild(V.el('p', { class: 'crumb' }, 'MCQ Practice — L' + state.topic.num + ' · ' + state.topic.title));
    container.appendChild(V.el('div', { class: 'quiz-progress' }, [
      V.el('span', {}, 'Question ' + (state.idx + 1) + ' / ' + state.questions.length),
      V.el('span', {}, 'Score: ' + state.score)
    ]));

    const card = V.el('div', { class: 'card quiz-card' });
    card.appendChild(V.el('h3', { class: 'quiz-question' }, q.q));

    const optsEl = V.el('div', { class: 'quiz-options' });
    const feedback = V.el('div', { class: 'quiz-feedback' });
    let answered = false;

    q.options.forEach(function (opt, i) {
      const btn = V.el('button', { class: 'quiz-option' }, opt);
      btn.addEventListener('click', function () {
        if (answered) return;
        answered = true;
        const correct = i === q.answer;
        if (correct) state.score++;
        Array.prototype.forEach.call(optsEl.children, function (el, j) {
          el.disabled = true;
          if (j === q.answer) el.classList.add('correct');
          else if (j === i) el.classList.add('incorrect');
        });
        feedback.innerHTML = (correct ? '<b>Correct.</b> ' : '<b>Not quite.</b> ') + q.explain;
        feedback.classList.add(correct ? 'correct' : 'incorrect');
        nextBtn.disabled = false;
        nextBtn.focus();
      });
      optsEl.appendChild(btn);
    });
    card.appendChild(optsEl);
    card.appendChild(feedback);

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
    container.appendChild(V.el('p', { class: 'crumb' }, 'MCQ Practice — L' + state.topic.num + ' · ' + state.topic.title));
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
