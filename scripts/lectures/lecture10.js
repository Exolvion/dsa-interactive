/* ==========================================================================
   Lecture 10 — String Algorithms: Brute-Force Search & Knuth-Morris-Pratt
   Follows lecture6.js conventions: VizKit.createStepVisualizer, tabs,
   input-row + button -> viz.rebuild() pattern.
   ========================================================================== */
(function () {
  'use strict';
  const V = window.VizKit;

  // ============================================================ helpers ===
  function uniqSortedChars(str) {
    return Array.from(new Set(str.split(''))).filter(Boolean).sort();
  }

  // ===================================================== Brute force  ===
  // Runs the classic "backup" brute-force search, producing one frame per
  // character comparison (plus bookkeeping frames for alignment/advance).
  function bruteForceRun(text, pattern) {
    const N = text.length, M = pattern.length;
    const frames = [];
    let compares = 0;
    let foundIndex = -1;
    frames.push({
      text: text, pattern: pattern, i: 0, j: 0, compares: 0, state: 'init',
      note: 'Start: text length N=' + N + ', pattern length M=' + M + '. Try every alignment i = 0..' + Math.max(0, N - M) + '.',
      code: 0
    });
    outer:
    for (let i = 0; i <= N - M; i++) {
      frames.push({
        text: text, pattern: pattern, i: i, j: 0, compares: compares, state: 'align',
        note: 'Alignment i=' + i + ': reset j=0, start comparing pat[0] against txt[' + i + '].',
        code: 1
      });
      let j = 0;
      while (j < M) {
        compares++;
        const match = text[i + j] === pattern[j];
        frames.push({
          text: text, pattern: pattern, i: i, j: j, compares: compares, state: match ? 'match' : 'mismatch',
          note: "Compare txt[" + (i + j) + "]='" + text[i + j] + "' vs pat[" + j + "]='" + pattern[j] + "' → " + (match ? 'match' : 'mismatch') + '. (compare #' + compares + ')',
          code: 2
        });
        if (!match) break;
        j++;
        if (j < M) {
          frames.push({
            text: text, pattern: pattern, i: i, j: j, compares: compares, state: 'advance',
            note: 'j += 1 → j=' + j, code: 3
          });
        }
      }
      if (j === M) {
        foundIndex = i;
        frames.push({
          text: text, pattern: pattern, i: i, j: j, compares: compares, state: 'found',
          note: 'j == M → <b>pattern found at i=' + i + '</b> after ' + compares + ' character compares.',
          code: 4
        });
        break outer;
      }
    }
    if (foundIndex === -1) {
      frames.push({
        text: text, pattern: pattern, i: Math.max(0, N - M + 1), j: 0, compares: compares, state: 'notfound',
        note: 'No alignment matched → return -1 (not found) after ' + compares + ' compares.',
        code: 5
      });
    }
    return { frames: frames, compares: compares, foundIndex: foundIndex };
  }

  function renderBruteForce(f, ctx) {
    const M = f.pattern.length;
    const cmpIdx = f.i + f.j;
    const comparing = f.state === 'match' || f.state === 'mismatch';
    const cells = f.text.split('').map(function (ch, idx) {
      let cls = '';
      if (f.state === 'found' && idx >= f.i && idx < f.i + M) cls = 'found';
      else if (idx >= f.i && idx < f.i + f.j) cls = 'range';
      else if (comparing && idx === cmpIdx) cls = 'active';
      const ptrs = [];
      if (idx === f.i) ptrs.push({ label: 'i', cls: 'lo' });
      if (comparing && idx === cmpIdx) ptrs.push({ label: 'j', cls: 'mid' });
      return { idx: idx, label: ch, cls: cls, ptrs: ptrs };
    });
    V.renderArrayRow(ctx.vizArea, cells);

    const pcells = f.pattern.split('').map(function (ch, pidx) {
      let cls = '';
      if (f.state === 'found') cls = 'found';
      else if (pidx < f.j) cls = 'range';
      else if (comparing && pidx === f.j) cls = 'active';
      return { idx: pidx, label: ch, cls: cls };
    });
    V.renderArrayRow(ctx.sideArea, pcells);
  }

  function buildBruteForce(container) {
    const card = V.el('div', { class: 'card' });
    const inputRow = V.el('div', { class: 'input-row' });
    const textInput = V.el('input', { class: 'input-field', value: 'AAAAAAAAAAAAAAAB', size: 26 });
    const patInput = V.el('input', { class: 'input-field', value: 'AAAB', size: 10 });
    const btn = V.el('button', { class: 'btn primary' }, 'Search');
    inputRow.appendChild(V.el('label', {}, 'text'));
    inputRow.appendChild(textInput);
    inputRow.appendChild(V.el('label', {}, 'pattern'));
    inputRow.appendChild(patInput);
    inputRow.appendChild(btn);
    card.appendChild(inputRow);
    const vizHost = V.el('div', {});
    card.appendChild(vizHost);
    container.appendChild(card);

    const viz = V.createStepVisualizer(vizHost, {
      getFrames: function () { return bruteForceRun(textInput.value, patInput.value).frames; },
      render: renderBruteForce,
      split: true,
      pseudocode: [
        'for i in range(N - M + 1):',
        '    j = 0',
        '    while j < M and txt[i+j] == pat[j]:',
        '        j += 1',
        '    if j == M: return i   # match',
        'return -1   # not found'
      ],
      legend: [
        { cls: 'range', label: 'matched so far (this alignment)' },
        { cls: 'active', label: 'comparing now' },
        { cls: 'found', label: 'pattern found' }
      ]
    });
    btn.onclick = function () { viz.rebuild(); };
  }

  // ============================================================ KMP DFA ===
  function cloneDfa(dfa, alphabet) {
    const c = {};
    alphabet.forEach(function (ch) { c[ch] = dfa[ch].slice(); });
    return c;
  }

  // Builds dfa[c][j] for j = 0..M-1 following the standard construction:
  //   dfa[pat[0]][0] = 1; X = 0
  //   for j in 1..M-1:
  //     for c in alphabet: dfa[c][j] = dfa[c][X]   # copy mismatch case
  //     dfa[pat[j]][j] = j + 1                        # match case
  //     X = dfa[pat[j]][X]                             # update restart state
  function buildDFAFrames(pattern, alphabet) {
    const M = pattern.length;
    if (M === 0 || alphabet.length === 0) {
      return { frames: [{ dfaSnap: {}, builtUpTo: -1, hlCol: -1, note: 'Pattern is empty — nothing to build.', code: -1 }], dfa: {} };
    }
    const dfa = {};
    alphabet.forEach(function (c) { dfa[c] = new Array(M).fill(0); });
    dfa[pattern[0]][0] = 1;
    let X = 0;
    const frames = [{
      dfaSnap: cloneDfa(dfa, alphabet), builtUpTo: 0, hlCol: 0,
      note: "dfa['" + pattern[0] + "'][0] = 1 — the first pattern character always advances state 0 → 1; every other character stays at state 0. Restart state X = 0.",
      code: 0
    }];
    for (let j = 1; j < M; j++) {
      alphabet.forEach(function (c) { dfa[c][j] = dfa[c][X]; });
      dfa[pattern[j]][j] = j + 1;
      const newX = dfa[pattern[j]][X];
      frames.push({
        dfaSnap: cloneDfa(dfa, alphabet), builtUpTo: j, hlCol: j,
        note: 'state ' + j + ': restart state X=' + X + ', so mismatch entries copy column ' + X + " (dfa[c][" + j + "] = dfa[c][" + X + "]). Match entry dfa['" + pattern[j] + "'][" + j + '] = ' + (j + 1) + ". New X = dfa['" + pattern[j] + "'][" + X + '] = ' + newX + '.',
        code: 1
      });
      X = newX;
    }
    return { frames: frames, dfa: dfa };
  }

  function renderDfaConstruction(f, ctx, pattern, alphabet) {
    V.clear(ctx.vizArea);
    const M = pattern.length;
    if (!f.dfaSnap || M === 0) return;
    const headers = ['char \\ j'].concat(pattern.split('').map(function (ch, j) { return j + ':' + ch; }));
    const rows = alphabet.map(function (c) {
      return [c].concat(Array.from({ length: M }, function (_, j) {
        if (j > f.builtUpTo) return '';
        const v = f.dfaSnap[c][j];
        return j === f.hlCol ? { val: v, cls: 'hl' } : { val: v };
      }));
    });
    V.renderTable(ctx.vizArea, { headers: headers, rows: rows });
  }

  // Simulates the DFA over a text: one "compare" per text character read
  // (one transition consumed), matching the lecture's compare-counting.
  function kmpSimFrames(dfa, alphabet, pattern, text) {
    const M = pattern.length, N = text.length;
    const frames = [];
    let i = 0, j = 0, compares = 0;
    frames.push({
      text: text, pattern: pattern, i: i, j: j, compares: compares, charIdx: -1, prevJ: -1,
      note: 'Start: i=0, j=0 (state 0 = no pattern characters matched yet).', code: 0, state: 'init'
    });
    while (i < N && j < M) {
      const c = text[i];
      const nj = (dfa[c] !== undefined) ? dfa[c][j] : 0;
      compares++;
      const stepCharIdx = i, stepPrevJ = j;
      i++;
      j = nj;
      frames.push({
        text: text, pattern: pattern, i: i, j: j, compares: compares, charIdx: stepCharIdx, prevJ: stepPrevJ,
        note: "txt[" + stepCharIdx + "] = '" + c + "': j = dfa['" + c + "'][" + stepPrevJ + '] = ' + nj + '. i += 1 → i=' + i + '.',
        code: 2, state: j === M ? 'about-found' : 'step'
      });
      if (j === M) break;
    }
    if (j === M) {
      frames.push({
        text: text, pattern: pattern, i: i, j: j, compares: compares, charIdx: -1, prevJ: -1,
        note: 'j == M (' + M + ') → <b>match found</b>. Start index = i - M = ' + i + ' - ' + M + ' = ' + (i - M) + '.',
        code: 4, state: 'found', matchStart: i - M
      });
    } else {
      frames.push({
        text: text, pattern: pattern, i: i, j: j, compares: compares, charIdx: -1, prevJ: -1,
        note: 'i reached N (' + N + ') with j < M → no match found, return -1.', code: 5, state: 'notfound'
      });
    }
    return frames;
  }

  function renderDfaSim(f, ctx, dfa, alphabet, pattern) {
    const M = pattern.length;
    const cells = f.text.split('').map(function (ch, idx) {
      let cls = '';
      if (f.state === 'found' && f.matchStart !== undefined && idx >= f.matchStart && idx < f.matchStart + M) cls = 'found';
      else if (idx === f.charIdx) cls = 'active';
      const ptrs = idx === f.i ? [{ label: 'i', cls: 'lo' }] : [];
      return { idx: idx, label: ch, cls: cls, ptrs: ptrs };
    });
    V.renderArrayRow(ctx.vizArea, cells);

    V.clear(ctx.sideArea);
    if (!pattern || M === 0) return;
    const headers = ['char \\ j'].concat(pattern.split('').map(function (ch, j) { return j + ':' + ch; }));
    const usedChar = f.charIdx > -1 ? f.text[f.charIdx] : null;
    const rows = alphabet.map(function (c) {
      return [c].concat(Array.from({ length: M }, function (_, j) {
        const v = dfa[c][j];
        const used = usedChar === c && j === f.prevJ;
        return used ? { val: v, cls: 'hl' } : { val: v };
      }));
    });
    V.renderTable(ctx.sideArea, { headers: headers, rows: rows });
  }

  function buildKmpDfa(container) {
    const patInput = V.el('input', { class: 'input-field', value: 'ABABAC', size: 10 });
    const textInput = V.el('input', { class: 'input-field', value: 'AABABACA', size: 16 });

    // --- Step 1: construction ------------------------------------------
    const buildCard = V.el('div', { class: 'card' });
    buildCard.appendChild(V.el('h3', {}, 'Step 1 — Build the DFA'));
    buildCard.appendChild(V.el('p', { class: 'desc' }, 'One state (column) is compiled at a time, left to right. Each state copies its mismatch transitions from the current "restart state" X, then overwrites the single transition that advances the match.'));
    const buildRow = V.el('div', { class: 'input-row' });
    buildRow.appendChild(V.el('label', {}, 'pattern'));
    buildRow.appendChild(patInput);
    const buildBtn = V.el('button', { class: 'btn primary' }, 'Build DFA');
    buildRow.appendChild(buildBtn);
    buildCard.appendChild(buildRow);
    const buildHost = V.el('div', {});
    buildCard.appendChild(buildHost);
    container.appendChild(buildCard);

    let ccPattern = '', ccAlphabet = [];
    const constructViz = V.createStepVisualizer(buildHost, {
      getFrames: function () {
        ccPattern = patInput.value.trim();
        ccAlphabet = uniqSortedChars(ccPattern + textInput.value.trim());
        return buildDFAFrames(ccPattern, ccAlphabet).frames;
      },
      render: function (f, ctx) { renderDfaConstruction(f, ctx, ccPattern, ccAlphabet); },
      pseudocode: [
        'dfa[pat[0]][0] = 1; X = 0',
        'for j in 1..M-1:',
        '    for c in alphabet: dfa[c][j] = dfa[c][X]',
        '    dfa[pat[j]][j] = j + 1',
        '    X = dfa[pat[j]][X]'
      ],
      legend: [{ label: 'state just computed', style: 'background:var(--accent)' }]
    });

    // --- Step 2: simulation ---------------------------------------------
    const simCard = V.el('div', { class: 'card' });
    simCard.appendChild(V.el('h3', {}, 'Step 2 — Run the DFA over text'));
    simCard.appendChild(V.el('p', { class: 'desc' }, 'Feed the text through the compiled DFA one character at a time: state = number of characters currently matched. No backup ever happens — each text character is read exactly once.'));
    const simRow = V.el('div', { class: 'input-row' });
    simRow.appendChild(V.el('label', {}, 'text'));
    simRow.appendChild(textInput);
    const simBtn = V.el('button', { class: 'btn primary' }, 'Run Simulation');
    simRow.appendChild(simBtn);
    simCard.appendChild(simRow);
    const simHost = V.el('div', {});
    simCard.appendChild(simHost);
    container.appendChild(simCard);

    let simDfa = {}, simAlphabet = [], simPattern = '';
    const simViz = V.createStepVisualizer(simHost, {
      getFrames: function () {
        simPattern = patInput.value.trim();
        const text = textInput.value.trim();
        simAlphabet = uniqSortedChars(simPattern + text);
        simDfa = buildDFAFrames(simPattern, simAlphabet).dfa;
        return kmpSimFrames(simDfa, simAlphabet, simPattern, text);
      },
      render: function (f, ctx) { renderDfaSim(f, ctx, simDfa, simAlphabet, simPattern); },
      split: true,
      pseudocode: [
        'i = j = 0',
        'while i < N and j < M:',
        '    j = dfa[txt[i]][j]',
        '    i += 1',
        'if j == M: return i - M   # match',
        'return -1'
      ],
      legend: [
        { cls: 'active', label: 'char just read' },
        { cls: 'found', label: 'matched substring' },
        { label: 'transition cell used', style: 'background:var(--accent)' }
      ]
    });

    buildBtn.onclick = function () { constructViz.rebuild(); simViz.rebuild(); };
    simBtn.onclick = function () { simViz.rebuild(); };
  }

  // ================================================= KMP vs Brute Force ===
  function bigStat(value, label, color) {
    return V.el('div', { style: 'text-align:center;min-width:150px' }, [
      V.el('div', { style: 'font-family:var(--mono);font-size:2.4rem;font-weight:700;color:' + color }, String(value)),
      V.el('div', { style: 'font-size:.78rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:.05em' }, label)
    ]);
  }

  function buildKmpVsBrute(container) {
    const card = V.el('div', { class: 'card' });
    const inputRow = V.el('div', { class: 'input-row' });
    const patInput = V.el('input', { class: 'input-field', value: 'AAAB', size: 10 });
    const textInput = V.el('input', { class: 'input-field', value: 'AAAAAAAAAAAAAAAB', size: 26 });
    const btn = V.el('button', { class: 'btn primary' }, 'Compare');
    inputRow.appendChild(V.el('label', {}, 'pattern'));
    inputRow.appendChild(patInput);
    inputRow.appendChild(V.el('label', {}, 'text'));
    inputRow.appendChild(textInput);
    inputRow.appendChild(btn);
    card.appendChild(inputRow);

    const statsHost = V.el('div', { style: 'display:flex;gap:24px;flex-wrap:wrap;justify-content:center;margin:22px 0' });
    card.appendChild(statsHost);
    const tableHost = V.el('div', {});
    card.appendChild(tableHost);
    container.appendChild(card);

    function run() {
      const pattern = patInput.value;
      const text = textInput.value;
      const bf = bruteForceRun(text, pattern);
      const alphabet = uniqSortedChars(pattern + text);
      const dfa = buildDFAFrames(pattern, alphabet).dfa;
      const simFrames = kmpSimFrames(dfa, alphabet, pattern, text);
      const last = simFrames[simFrames.length - 1];
      const kmpCompares = last.compares;
      const kmpMatchStart = last.state === 'found' ? last.matchStart : -1;

      V.clear(statsHost);
      statsHost.appendChild(bigStat(bf.compares, 'Brute-force compares', 'var(--accent)'));
      statsHost.appendChild(bigStat(kmpCompares, 'KMP compares', 'var(--found)'));

      V.renderTable(tableHost, {
        headers: ['Algorithm', 'Worst-case', "This example's compares", 'Match starts at'],
        rows: [
          ['Brute-force', 'O(N·M)', String(bf.compares), bf.foundIndex >= 0 ? String(bf.foundIndex) : 'not found'],
          ['KMP', 'O(N+M)', String(kmpCompares), kmpMatchStart >= 0 ? String(kmpMatchStart) : 'not found']
        ]
      });
    }

    run();
    btn.onclick = run;
  }

  // ------------------------------------------------------------ register --
  App.registerLecture({
    id: 'l10', number: 10, title: 'String Algorithms',
    sections: [
      {
        id: 'brute-force', title: 'Brute-Force Substring Search',
        intro: 'For each start position <code>i</code> in the text, compare pattern characters one by one from <code>j=0</code>. On a mismatch, "back up" — move to <code>i+1</code> and restart the pattern comparison from scratch. Worst case (few distinct characters, e.g. many A\'s) is O(N·M) character compares.',
        build: buildBruteForce,
        reading: [
          { label: 'Princeton algs4 — Substring Search', url: 'https://algs4.cs.princeton.edu/53substring/' },
          { label: 'cp-algorithms — Prefix function / KMP', url: 'https://cp-algorithms.com/string/prefix-function.html' }
        ]
      },
      {
        id: 'kmp-dfa', title: 'KMP — Building the DFA',
        intro: 'Knuth-Morris-Pratt precompiles the pattern into a Deterministic Finite Automaton, where the state = number of pattern characters currently matched. Once built, the DFA scans the text in a single pass — it never backs up, so each text character is read exactly once.',
        build: buildKmpDfa,
        reading: [
          { label: 'Princeton algs4 — Substring Search', url: 'https://algs4.cs.princeton.edu/53substring/' },
          { label: 'cp-algorithms — Prefix function / KMP', url: 'https://cp-algorithms.com/string/prefix-function.html' }
        ]
      },
      {
        id: 'kmp-vs-brute', title: 'KMP vs Brute Force',
        intro: 'Same input, same underlying algorithms (brute force from the first section, KMP\'s DFA simulation from the second) — tallying every character compare each makes. On a worst-case input like many repeated characters, KMP\'s O(N+M) guarantee pulls far ahead of brute force\'s O(N·M).',
        build: buildKmpVsBrute,
        reading: [
          { label: 'Princeton algs4 — Substring Search', url: 'https://algs4.cs.princeton.edu/53substring/' },
          { label: 'cp-algorithms — Prefix function / KMP', url: 'https://cp-algorithms.com/string/prefix-function.html' }
        ]
      }
    ]
  });
})();
