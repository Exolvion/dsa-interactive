/* ==========================================================================
   Lecture 6 — Search Algorithms 1: Linear Search, Binary Search, Hash Tables
   Reference implementation: other lecture modules follow this file's
   conventions (VizKit.createStepVisualizer, tabs, input-row pattern).
   ========================================================================== */
(function () {
  'use strict';
  const V = window.VizKit;

  // ------------------------------------------------------------ helpers ---
  function parseKeys(str) {
    return str.split(',').map(function (s) { return s.trim(); }).filter(Boolean).map(Number);
  }

  // ===================================================== Linear Search ===
  function buildLinearSearch(container) {
    const baseList = [
      { key: 'H', value: 5 }, { key: 'C', value: 4 }, { key: 'R', value: 3 },
      { key: 'A', value: 2 }, { key: 'E', value: 1 }, { key: 'S', value: 0 }
    ]; // front-inserted order for keys S,E,A,R,C,H (H is head / most recent)

    const card = V.el('div', { class: 'card' });
    const tabs = V.el('div', { class: 'tabs' });
    const getTab = V.el('button', { class: 'tab active' }, 'get(key)');
    const putTab = V.el('button', { class: 'tab' }, 'put(key, value)');
    tabs.appendChild(getTab); tabs.appendChild(putTab);
    card.appendChild(tabs);

    const inputRow = V.el('div', { class: 'input-row' });
    card.appendChild(inputRow);
    const vizHost = V.el('div', {});
    card.appendChild(vizHost);
    container.appendChild(card);

    function snapshot(list, currentIdx, note, code, foundIdx) {
      return { list: list, currentIdx: currentIdx, note: note, code: code, foundIdx: foundIdx };
    }
    function render(f, ctx) {
      const cells = f.list.map(function (n, i) {
        let cls = '';
        if (i === f.foundIdx) cls = 'found';
        else if (i === f.currentIdx) cls = 'active';
        return { label: n.key + ':' + n.value, cls: cls, idx: i, ptrs: i === 0 ? [{ label: 'head', cls: 'lo' }] : [] };
      });
      V.renderArrayRow(ctx.vizArea, cells);
    }

    function searchFrames(list, key) {
      const frames = [snapshot(list, null, 'Search for key <b>' + key + '</b>. Start at head (index 0).', 0)];
      for (let i = 0; i < list.length; i++) {
        const match = list[i].key === key;
        frames.push(snapshot(list, i,
          "Compare node[" + i + "] = '" + list[i].key + "' " + (match ? "== '" + key + "' → found!" : '≠ target, continue'),
          match ? 2 : 1));
        if (match) {
          frames.push(snapshot(list, i, "Found '" + key + "' → return value " + list[i].value, 2, i));
          return frames;
        }
      }
      frames.push(snapshot(list, null, "Reached end of list — '" + key + "' not found → return None", 4));
      return frames;
    }

    function putFrames(list, key, value) {
      const frames = [snapshot(list, null, "put('" + key + "', " + value + "). Must scan for an existing key first, since put() overwrites duplicates.", 0)];
      for (let i = 0; i < list.length; i++) {
        const match = list[i].key === key;
        frames.push(snapshot(list, i,
          "Compare node[" + i + "] = '" + list[i].key + "' " + (match ? "== '" + key + "' → overwrite its value" : '≠ target, continue'),
          match ? 2 : 1));
        if (match) {
          const next = list.slice(); next[i] = { key: key, value: value };
          frames.push(snapshot(next, i, "Overwrote node[" + i + "] value → " + value + ". No new node created.", 2, i));
          return frames;
        }
      }
      const next = [{ key: key, value: value }].concat(list);
      frames.push(snapshot(next, 0, "Key not found anywhere → insert new node '" + key + ':' + value + "' at the <b>front</b>.", 5, 0));
      return frames;
    }

    let mode = 'get';
    let currentList = baseList;
    let viz = null;

    function buildInputs() {
      V.clear(inputRow);
      if (mode === 'get') {
        const keyInput = V.el('input', { class: 'input-field', value: 'H', size: 4 });
        const btn = V.el('button', { class: 'btn primary' }, 'Search');
        btn.onclick = function () { viz.rebuild(); };
        inputRow.appendChild(V.el('label', {}, 'key'));
        inputRow.appendChild(keyInput);
        inputRow.appendChild(btn);
        inputRow._getKey = function () { return keyInput.value.trim().toUpperCase(); };
      } else {
        const keyInput = V.el('input', { class: 'input-field', value: 'X', size: 4 });
        const valInput = V.el('input', { class: 'input-field', value: '99', size: 4 });
        const btn = V.el('button', { class: 'btn primary' }, 'Put');
        btn.onclick = function () { viz.rebuild(); };
        inputRow.appendChild(V.el('label', {}, 'key'));
        inputRow.appendChild(keyInput);
        inputRow.appendChild(V.el('label', {}, 'value'));
        inputRow.appendChild(valInput);
        inputRow.appendChild(btn);
        inputRow._getKey = function () { return keyInput.value.trim().toUpperCase(); };
        inputRow._getVal = function () { return valInput.value.trim(); };
      }
    }
    buildInputs();

    viz = V.createStepVisualizer(vizHost, {
      getFrames: function () {
        return mode === 'get'
          ? searchFrames(currentList, inputRow._getKey())
          : putFrames(currentList, inputRow._getKey(), inputRow._getVal());
      },
      render: render,
      pseudocode: mode === 'get'
        ? ['node = head', 'while node is not None:', "    if node.key == key: return node.value", '    node = node.next', 'return None            # not found']
        : ['node = head', 'while node is not None:            # scan for existing key', '    if node.key == key: node.value = value; return', '    node = node.next', 'head = Node(key, value, head)      # new key -> front'],
      legend: [
        { cls: 'active', label: 'comparing' },
        { cls: 'found', label: 'match / result' }
      ]
    });

    tabs.addEventListener('click', function (e) {
      const t = e.target.closest('.tab'); if (!t) return;
      tabs.querySelectorAll('.tab').forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      mode = t === getTab ? 'get' : 'put';
      buildInputs();
      viz = V.createStepVisualizer(vizHost, {
        getFrames: function () {
          return mode === 'get'
            ? searchFrames(currentList, inputRow._getKey())
            : putFrames(currentList, inputRow._getKey(), inputRow._getVal());
        },
        render: render,
        pseudocode: mode === 'get'
          ? ['node = head', 'while node is not None:', "    if node.key == key: return node.value", '    node = node.next', 'return None            # not found']
          : ['node = head', 'while node is not None:            # scan for existing key', '    if node.key == key: node.value = value; return', '    node = node.next', 'head = Node(key, value, head)      # new key -> front'],
        legend: [
          { cls: 'active', label: 'comparing' },
          { cls: 'found', label: 'match / result' }
        ]
      });
    });
  }

  // ===================================================== Binary Search ===
  function buildBinarySearch(container) {
    const card = V.el('div', { class: 'card' });
    const inputRow = V.el('div', { class: 'input-row' });
    const arrInput = V.el('input', { class: 'input-field', value: 'A,C,E,H,L,M,P,R,S,X', size: 24 });
    const targetInput = V.el('input', { class: 'input-field', value: 'P', size: 4 });
    const btn = V.el('button', { class: 'btn primary' }, 'Search');
    inputRow.appendChild(V.el('label', {}, 'sorted array'));
    inputRow.appendChild(arrInput);
    inputRow.appendChild(V.el('label', {}, 'target'));
    inputRow.appendChild(targetInput);
    inputRow.appendChild(btn);
    card.appendChild(inputRow);
    const vizHost = V.el('div', {});
    card.appendChild(vizHost);
    container.appendChild(card);

    function frames(arr, target) {
      const out = [];
      let lo = 0, hi = arr.length - 1;
      out.push({ lo: lo, hi: hi, mid: null, note: 'Search for <b>' + target + '</b>. lo=0, hi=' + hi + '.', code: 0 });
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        out.push({ lo: lo, hi: hi, mid: mid, note: 'mid = ⌊(' + lo + '+' + hi + ')/2⌋ = ' + mid + " → arr[" + mid + "] = '" + arr[mid] + "'", code: 1 });
        if (target < arr[mid]) {
          out.push({ lo: lo, hi: mid - 1, mid: mid, note: "'" + target + "' &lt; '" + arr[mid] + "' → search left half, hi = " + (mid - 1), code: 2 });
          hi = mid - 1;
        } else if (target > arr[mid]) {
          out.push({ lo: mid + 1, hi: hi, mid: mid, note: "'" + target + "' &gt; '" + arr[mid] + "' → search right half, lo = " + (mid + 1), code: 3 });
          lo = mid + 1;
        } else {
          out.push({ lo: lo, hi: hi, mid: mid, found: mid, note: "'" + target + "' == arr[" + mid + "] → <b>found at index " + mid + '</b>', code: 4 });
          return out;
        }
      }
      out.push({ lo: lo, hi: hi, mid: null, note: 'lo (' + lo + ') &gt; hi (' + hi + ') → target not in array, insertion point = ' + lo, code: 5 });
      return out;
    }

    let arr = arrInput.value.split(',').map(function (s) { return s.trim(); });
    const viz = V.createStepVisualizer(vizHost, {
      getFrames: function () { return frames(arr, targetInput.value.trim()); },
      render: function (f, ctx) {
        const cells = arr.map(function (v, i) {
          let cls = (i < f.lo || i > f.hi) ? 'excluded' : 'range';
          if (f.mid === i) cls = 'mid';
          if (f.found === i) cls = 'found';
          const ptrs = [];
          if (i === f.lo) ptrs.push({ label: 'lo', cls: 'lo' });
          if (i === f.hi) ptrs.push({ label: 'hi', cls: 'hi' });
          if (i === f.mid) ptrs.push({ label: 'mid', cls: 'mid' });
          return { idx: i, label: v, cls: cls, ptrs: ptrs };
        });
        V.renderArrayRow(ctx.vizArea, cells);
      },
      pseudocode: ['lo, hi = 0, len(a) - 1', 'mid = (lo + hi) // 2', 'if key < a[mid]: hi = mid - 1', 'elif key > a[mid]: lo = mid + 1', 'else: return mid            # found', 'return lo                   # not found: insertion point'],
      legend: [
        { cls: 'range', label: 'in range [lo,hi]' },
        { cls: 'mid', label: 'mid (comparing)' },
        { cls: 'found', label: 'found' },
        { cls: 'excluded', label: 'excluded', style: 'opacity:.5' }
      ]
    });
    btn.onclick = function () {
      arr = arrInput.value.split(',').map(function (s) { return s.trim(); });
      viz.rebuild();
    };
  }

  // ================================================ Hashing — Chaining ===
  function buildHashChaining(container) {
    const card = V.el('div', { class: 'card' });
    const inputRow = V.el('div', { class: 'input-row' });
    const strInput = V.el('input', { class: 'input-field', value: 'SEARCHEXAMPLE', size: 20 });
    const mInput = V.el('input', { class: 'input-field', value: '5', size: 3 });
    const btn = V.el('button', { class: 'btn primary' }, 'Rebuild');
    inputRow.appendChild(V.el('label', {}, 'insert keys (chars)'));
    inputRow.appendChild(strInput);
    inputRow.appendChild(V.el('label', {}, 'table size m'));
    inputRow.appendChild(mInput);
    inputRow.appendChild(btn);
    card.appendChild(inputRow);
    const vizHost = V.el('div', {});
    card.appendChild(vizHost);
    container.appendChild(card);

    function frames(str, m) {
      const out = [];
      let buckets = Array.from({ length: m }, function () { return []; });
      out.push({ buckets: cloneBuckets(buckets), note: 'Insert each character of "<b>' + str + '</b>" with value = its insertion index. hash(key) = ASCII(key) mod ' + m + '.', code: 0 });
      for (let i = 0; i < str.length; i++) {
        const key = str[i];
        const ascii = key.charCodeAt(0);
        const h = ascii % m;
        const chain = buckets[h];
        const existingIdx = chain.findIndex(function (n) { return n.key === key; });
        if (existingIdx > -1) {
          chain[existingIdx] = { key: key, val: i, cls: 'new' };
          out.push({ buckets: cloneBuckets(buckets), note: "hash('" + key + "') = " + ascii + ' mod ' + m + ' = ' + h + ". '" + key + "' already in chain " + h + ' → <b>overwrite</b> value to ' + i + '.', code: 2, hl: h });
        } else {
          chain.unshift({ key: key, val: i, cls: 'new' });
          out.push({ buckets: cloneBuckets(buckets), note: "hash('" + key + "') = " + ascii + ' mod ' + m + ' = ' + h + '. New key → insert at <b>front of chain ' + h + '</b>.', code: 1, hl: h });
        }
      }
      buckets.forEach(function (c) { c.forEach(function (n) { delete n.cls; }); });
      out.push({ buckets: cloneBuckets(buckets), note: 'Done. Final table shown above (average chain length = N/m = load factor).', code: 3 });
      return out;
    }
    function cloneBuckets(b) { return b.map(function (c) { return c.map(function (n) { return Object.assign({}, n); }); }); }

    const viz = V.createStepVisualizer(vizHost, {
      getFrames: function () { return frames(strInput.value.toUpperCase().replace(/[^A-Z]/g, ''), Math.max(2, +mInput.value || 5)); },
      render: function (f, ctx) { V.renderBucketsChaining(ctx.vizArea, f.buckets); },
      pseudocode: ['i = hash(key)                 # ASCII(key) mod m', 'if key already in chain[i]:', '    overwrite its value', 'else:', '    prepend new node to chain[i]'],
      codeLine: function (f) { return f.code === 1 ? 4 : f.code === 2 ? 2 : f.code === 0 ? 0 : -1; },
      legend: [{ cls: 'new', label: 'just inserted / updated' }]
    });
    btn.onclick = function () { viz.rebuild(); };
  }

  // ============================================= Hashing — Open Addr. ===
  function buildHashOpenAddressing(container) {
    const card = V.el('div', { class: 'card' });
    const tabs = V.el('div', { class: 'tabs' });
    const linearTab = V.el('button', { class: 'tab active' }, 'Linear probing');
    const quadTab = V.el('button', { class: 'tab' }, 'Quadratic probing');
    const doubleTab = V.el('button', { class: 'tab' }, 'Double hashing');
    [linearTab, quadTab, doubleTab].forEach(function (t) { tabs.appendChild(t); });
    card.appendChild(tabs);

    const inputRow = V.el('div', { class: 'input-row' });
    const keysInput = V.el('input', { class: 'input-field', value: '76,93,40,47,10,55', size: 20 });
    const mInput = V.el('input', { class: 'input-field', value: '7', size: 3 });
    const btn = V.el('button', { class: 'btn primary' }, 'Rebuild');
    inputRow.appendChild(V.el('label', {}, 'insert keys'));
    inputRow.appendChild(keysInput);
    inputRow.appendChild(V.el('label', {}, 'table size m'));
    inputRow.appendChild(mInput);
    inputRow.appendChild(btn);
    card.appendChild(inputRow);
    const vizHost = V.el('div', {});
    card.appendChild(vizHost);
    container.appendChild(card);

    function emptySlots(m) { return Array.from({ length: m }, function () { return { key: null }; }); }

    function linearFrames(keys, m) {
      const out = [];
      let slots = emptySlots(m);
      out.push({ slots: cloneSlots(slots), note: 'Linear probing: on collision, try (i+1) mod m, (i+2) mod m, … h(k) = k mod ' + m + '.', code: 0 });
      keys.forEach(function (k) {
        const h = ((k % m) + m) % m;
        let i = h, steps = 0;
        while (slots[i].key !== null && steps < m) {
          out.push(frameWithProbe(slots, i, k, h, steps === 0 ? 'h(' + k + ')=' + h + ' taken by ' + slots[i].key + ' → probe (i+1) mod m' : 'still taken → probe (i+1) mod m'));
          i = (i + 1) % m; steps++;
        }
        slots[i] = { key: k };
        out.push({ slots: cloneSlots(slots, i), note: (steps === 0 ? 'h(' + k + ') = ' + h + ', slot free → ' : 'probed ' + steps + ' step(s) → ') + '<b>insert ' + k + ' at index ' + i + '</b>.', code: 1 });
      });
      return out;
    }

    function quadraticFrames(keys, m) {
      const out = [];
      let slots = emptySlots(m);
      out.push({ slots: cloneSlots(slots), note: 'Quadratic probing: offsets grow as j², i.e. (i + j²) mod m. h(k) = k mod ' + m + '.', code: 0 });
      keys.forEach(function (k) {
        const h = ((k % m) + m) % m;
        let j = 0, i = h;
        while (slots[i].key !== null && j < m) {
          j++;
          i = ((h + j * j) % m + m) % m;
          out.push(frameWithProbe(slots, i, k, h, 'collision → probe (h + ' + j + '²) mod m = ' + i));
        }
        slots[i] = { key: k };
        out.push({ slots: cloneSlots(slots, i), note: (j === 0 ? 'h(' + k + ') = ' + h + ', slot free → ' : 'after ' + j + ' probe(s) → ') + '<b>insert ' + k + ' at index ' + i + '</b>.', code: 1 });
      });
      return out;
    }

    function doubleFrames(keys, m) {
      const out = [];
      let slots = emptySlots(m);
      out.push({ slots: cloneSlots(slots), note: 'Double hashing: probe sequence h1(k) + j·h2(k) mod m. h1(k) = k mod ' + m + ', h2(k) = (k mod 5) + 1.', code: 0 });
      keys.forEach(function (k) {
        const h1 = ((k % m) + m) % m;
        const h2 = (k % 5) + 1;
        let j = 0, i = h1;
        while (slots[i].key !== null && j < m) {
          j++;
          i = ((h1 + j * h2) % m + m) % m;
          out.push(frameWithProbe(slots, i, k, h1, 'collision → probe h1 + ' + j + '·h2 = (' + h1 + '+' + j + '·' + h2 + ') mod m = ' + i));
        }
        slots[i] = { key: k };
        out.push({ slots: cloneSlots(slots, i), note: (j === 0 ? 'h1(' + k + ') = ' + h1 + ', slot free → ' : 'after ' + j + ' probe(s), step h2=' + h2 + ' → ') + '<b>insert ' + k + ' at index ' + i + '</b>.', code: 1 });
      });
      return out;
    }

    function frameWithProbe(slots, probeIdx, key, home, note) {
      const s = cloneSlots(slots);
      s[probeIdx] = Object.assign({}, s[probeIdx], { probing: true });
      return { slots: s, note: note, code: 2 };
    }
    function cloneSlots(slots, landedIdx) {
      return slots.map(function (s, i) {
        const c = Object.assign({}, s);
        if (i === landedIdx) c.landed = true;
        return c;
      });
    }

    const strategies = { linear: linearFrames, quadratic: quadraticFrames, double: doubleFrames };
    let mode = 'linear';
    let viz = null;

    function pseudocodeFor(mode) {
      if (mode === 'linear') return ['i = h(key)', 'while table[i] is occupied:', '    i = (i + 1) mod m', 'table[i] = key'];
      if (mode === 'quadratic') return ['i = h(key); j = 0', 'while table[i] is occupied:', '    j += 1; i = (h(key) + j*j) mod m', 'table[i] = key'];
      return ['i = h1(key); j = 0', 'while table[i] is occupied:', '    j += 1; i = (h1(key) + j*h2(key)) mod m', 'table[i] = key'];
    }

    function render(f, ctx) {
      const slots = f.slots.map(function (s) {
        let cls = '';
        if (s.landed) cls = 'landed';
        else if (s.probing) cls = 'probe';
        else if (s.key !== null) cls = 'filled';
        return { key: s.key === null ? '' : s.key, cls: cls };
      });
      V.renderBucketsLinear ? null : null;
      renderSlotsRow(ctx.vizArea, slots);
    }
    function renderSlotsRow(container, slots) { V.renderBucketsLinear(container, slots); }

    function makeViz() {
      viz = V.createStepVisualizer(vizHost, {
        getFrames: function () {
          const keys = parseKeys(keysInput.value);
          const m = Math.max(3, +mInput.value || 7);
          return strategies[mode](keys, m);
        },
        render: render,
        pseudocode: pseudocodeFor(mode),
        codeLine: function (f) { return f.code === 0 ? -1 : f.code === 2 ? 1 : 3; },
        legend: [
          { cls: 'probe', label: 'probing (occupied)' },
          { cls: 'landed', label: 'just inserted' },
          { cls: 'filled', label: 'occupied' }
        ]
      });
    }
    makeViz();
    btn.onclick = function () { viz.rebuild(); };
    tabs.addEventListener('click', function (e) {
      const t = e.target.closest('.tab'); if (!t) return;
      tabs.querySelectorAll('.tab').forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      mode = t === linearTab ? 'linear' : t === quadTab ? 'quadratic' : 'double';
      makeViz();
    });
  }

  // ------------------------------------------------------------ register --
  App.registerLecture({
    id: 'l6', number: 6, title: 'Search Algorithms 1',
    sections: [
      {
        id: 'linear-search', title: 'Linear Search',
        intro: 'An unordered list of (key, value) nodes. Both <code>get</code> and <code>put</code> scan from the head — <code>put</code> must scan too, to honour the rule that a symbol table overwrites duplicate keys. Both are O(N).',
        build: buildLinearSearch,
        reading: [{ label: 'Princeton algs4 — Elementary Symbol Tables', url: 'https://algs4.cs.princeton.edu/31elementary/' }]
      },
      {
        id: 'binary-search', title: 'Binary Search (Ordered Array)',
        intro: 'A sorted array with a <code>rank(k)</code> helper: search is O(log N), but insertion is O(N) because keeping the array sorted means shifting every larger key one slot right.',
        build: buildBinarySearch,
        reading: [{ label: 'Princeton algs4 — Elementary Symbol Tables (BinarySearch)', url: 'https://algs4.cs.princeton.edu/31elementary/' }]
      },
      {
        id: 'hash-chaining', title: 'Hash Tables — Separate Chaining',
        intro: 'Each slot holds a linked chain of all keys that hash there. Reproduces the classic <code>S E A R C H E X A M P L E</code> trace: hash = ASCII(key) mod m, insert at the front of the chain, overwrite on duplicate.',
        build: buildHashChaining,
        reading: [{ label: 'Princeton algs4 — Hash Tables', url: 'https://algs4.cs.princeton.edu/34hash/' }]
      },
      {
        id: 'hash-open-addressing', title: 'Hash Tables — Open Addressing',
        intro: 'All keys live directly in the table. On collision, <b>probe</b> for the next empty slot — linear (+1, +2, …), quadratic (+1², +2², …), or double hashing (step size from a second hash function). Same key set across all three tabs so you can compare where each strategy lands them.',
        build: buildHashOpenAddressing,
        reading: [{ label: 'Princeton algs4 — Hash Tables', url: 'https://algs4.cs.princeton.edu/34hash/' }]
      }
    ]
  });
})();
