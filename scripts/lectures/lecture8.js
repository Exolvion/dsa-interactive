/* ==========================================================================
   Lecture 8 — Graph Algorithms 1: DFS, BFS, Tree Traversals, Topological Sort
   ========================================================================== */
(function () {
  'use strict';
  const V = window.VizKit;

  const READING = [
    { label: 'Princeton algs4 — Undirected Graphs', url: 'https://algs4.cs.princeton.edu/41graph/' },
    { label: 'Princeton algs4 — Directed Graphs', url: 'https://algs4.cs.princeton.edu/42digraph/' },
    { label: 'MIT OCW 6.006 — Graph traversal', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/' }
  ];

  // Inline swatch styles reused wherever we need a queue/stack cell to carry
  // the same current/frontier state language as the graph nodes, since .qcell
  // itself only ships the "visited" (blue) look out of the box.
  const STYLE_CURRENT = 'border-color:var(--accent);color:var(--accent);background:var(--accent-soft)';
  const STYLE_FRONTIER = 'border-color:var(--found);color:var(--found);background:var(--found-soft)';

  function queueRowEl(label, items) {
    const cells = V.el('div', { class: 'queue-cells' }, items.map(function (it) {
      return V.el('span', { class: 'qcell', style: it.style || '' }, String(it.label));
    }));
    return V.el('div', { class: 'queue-row' }, [
      V.el('span', { class: 'queue-label' }, label),
      cells
    ]);
  }

  // -------------------------------------------------- shared demo graph ---
  // 6-vertex undirected graph used throughout DFS/BFS (matches lecture notes).
  const NODES = [
    { id: 0, x: 60, y: 130 }, { id: 1, x: 150, y: 50 }, { id: 2, x: 150, y: 130 },
    { id: 3, x: 240, y: 90 }, { id: 4, x: 240, y: 190 }, { id: 5, x: 60, y: 210 }
  ];
  const EDGES = [[0, 1], [0, 2], [0, 5], [1, 2], [2, 3], [2, 4], [3, 4], [3, 5]];
  function buildAdjacency(n, edges) {
    const adj = Array.from({ length: n }, function () { return []; });
    edges.forEach(function (e) { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); });
    adj.forEach(function (l) { l.sort(function (a, b) { return a - b; }); });
    return adj;
  }
  const ADJ = buildAdjacency(6, EDGES); // 0:[1,2,5] 1:[0,2] 2:[0,1,3,4] 3:[2,4,5] 4:[2,3] 5:[0,3]

  function clampVertex(v) {
    v = Math.floor(+v);
    if (isNaN(v)) v = 0;
    return Math.max(0, Math.min(5, v));
  }

  // ============================================================ DFS =====
  function buildDFS(container) {
    const card = V.el('div', { class: 'card' });
    const inputRow = V.el('div', { class: 'input-row' });
    const startInput = V.el('input', { class: 'input-field', value: '0', size: 3 });
    const btn = V.el('button', { class: 'btn primary' }, 'Run DFS');
    inputRow.appendChild(V.el('label', {}, 'start vertex (0–5)'));
    inputRow.appendChild(startInput);
    inputRow.appendChild(btn);
    card.appendChild(inputRow);
    const vizHost = V.el('div', {});
    card.appendChild(vizHost);
    container.appendChild(card);

    function dfsFrames(start) {
      const marked = new Array(NODES.length).fill(false);
      const edgeTo = new Array(NODES.length).fill(-1);
      const stack = [];
      const frames = [];
      function push(current, note, code) {
        frames.push({ current: current, marked: marked.slice(), edgeTo: edgeTo.slice(), stack: stack.slice(), note: note, code: code });
      }
      function dfs(v) {
        marked[v] = true;
        stack.push(v);
        push(v, 'Visit vertex <b>' + v + '</b> → marked[' + v + '] = True. Push ' + v + ' onto the call stack.', 1);
        const nbrs = ADJ[v];
        for (let k = 0; k < nbrs.length; k++) {
          const w = nbrs[k];
          if (!marked[w]) {
            edgeTo[w] = v;
            push(v, 'Neighbour <b>' + w + '</b> of ' + v + ' is unmarked → edgeTo[' + w + '] = ' + v + ', recurse dfs(' + w + ').', 4);
            dfs(w);
            push(v, 'Back at <b>' + v + '</b> (returned from dfs(' + w + ')) → continue scanning adj[' + v + '].', 2);
          } else {
            push(v, 'Neighbour ' + w + ' of ' + v + ' is already marked → skip.', 3);
          }
        }
        stack.pop();
        push(v, 'All neighbours of <b>' + v + '</b> processed → backtrack (pop ' + v + ' off the call stack).', 2);
      }
      dfs(start);
      const last = frames[frames.length - 1];
      frames.push(Object.assign({}, last, {
        current: null,
        note: 'DFS complete. edgeTo = [' + edgeTo.map(function (x) { return x; }).join(', ') + '] (−1 = root / no parent).',
        code: -1
      }));
      return frames;
    }

    function render(f, ctx) {
      const nodes = NODES.map(function (n) {
        let cls = '';
        if (n.id === f.current) cls = 'current';
        else if (f.marked[n.id]) cls = 'visited';
        return { id: n.id, x: n.x, y: n.y, label: n.id, cls: cls };
      });
      const edges = EDGES.map(function (e) {
        const cls = (f.edgeTo[e[0]] === e[1] || f.edgeTo[e[1]] === e[0]) ? 'tree' : '';
        return { from: e[0], to: e[1], cls: cls };
      });
      V.renderGraphSVG(ctx.vizArea, { nodes: nodes, edges: edges }, { width: 320, height: 260 });
      V.clear(ctx.sideArea);
      ctx.sideArea.appendChild(queueRowEl('Call stack', f.stack.map(function (v, i) {
        return { label: v, style: i === f.stack.length - 1 ? STYLE_CURRENT : '' };
      })));
    }

    const viz = V.createStepVisualizer(vizHost, {
      getFrames: function () { return dfsFrames(clampVertex(startInput.value)); },
      render: render,
      split: true,
      pseudocode: ['def dfs(v):', '    marked[v] = True', '    for w in adj[v]:', '        if not marked[w]:', '            edgeTo[w] = v', '            dfs(v=w)'],
      legend: [
        { cls: 'current', label: 'current vertex' },
        { cls: 'visited', label: 'marked' },
        { label: 'tree edge', style: 'background:var(--visited)' }
      ]
    });
    btn.onclick = function () { viz.rebuild(); };
  }

  // ============================================================ BFS =====
  function buildBFS(container) {
    const card = V.el('div', { class: 'card' });
    const inputRow = V.el('div', { class: 'input-row' });
    const startInput = V.el('input', { class: 'input-field', value: '0', size: 3 });
    const btn = V.el('button', { class: 'btn primary' }, 'Run BFS');
    inputRow.appendChild(V.el('label', {}, 'start vertex (0–5)'));
    inputRow.appendChild(startInput);
    inputRow.appendChild(btn);
    card.appendChild(inputRow);
    const vizHost = V.el('div', {});
    card.appendChild(vizHost);
    container.appendChild(card);

    function bfsFrames(start) {
      const marked = new Array(NODES.length).fill(false);
      const edgeTo = new Array(NODES.length).fill(-1);
      const dist = new Array(NODES.length).fill(-1);
      const queue = [];
      const frames = [];
      function push(current, note, code) {
        frames.push({ current: current, marked: marked.slice(), edgeTo: edgeTo.slice(), dist: dist.slice(), queue: queue.slice(), note: note, code: code });
      }
      marked[start] = true; dist[start] = 0; queue.push(start);
      push(null, 'Enqueue source <b>' + start + '</b>, mark visited, dist = 0.', 0);
      while (queue.length) {
        const v = queue.shift();
        push(v, 'Dequeue <b>' + v + '</b> from the front of the queue → examine its neighbours.', 1);
        const nbrs = ADJ[v];
        for (let k = 0; k < nbrs.length; k++) {
          const w = nbrs[k];
          if (!marked[w]) {
            marked[w] = true; edgeTo[w] = v; dist[w] = dist[v] + 1; queue.push(w);
            push(v, 'Neighbour <b>' + w + '</b> unmarked → mark, edgeTo[' + w + '] = ' + v + ', dist = ' + dist[w] + ', enqueue.', 4);
          } else {
            push(v, 'Neighbour ' + w + ' already marked → skip.', 3);
          }
        }
      }
      push(null, 'Queue empty → BFS complete. Shortest-hop distances from ' + start + ' are shown above each vertex.', -1);
      return frames;
    }

    function render(f, ctx) {
      const nodes = NODES.map(function (n) {
        let cls = '';
        if (n.id === f.current) cls = 'current';
        else if (f.queue.indexOf(n.id) > -1) cls = 'frontier';
        else if (f.marked[n.id]) cls = 'visited';
        return { id: n.id, x: n.x, y: n.y, label: n.id, cls: cls, dist: f.dist[n.id] > -1 ? f.dist[n.id] : undefined };
      });
      const edges = EDGES.map(function (e) {
        const cls = (f.edgeTo[e[0]] === e[1] || f.edgeTo[e[1]] === e[0]) ? 'tree' : '';
        return { from: e[0], to: e[1], cls: cls };
      });
      V.renderGraphSVG(ctx.vizArea, { nodes: nodes, edges: edges }, { width: 320, height: 260 });
      V.clear(ctx.sideArea);
      ctx.sideArea.appendChild(queueRowEl('Queue', f.queue.map(function (v) { return { label: v, style: STYLE_FRONTIER }; })));
      if (f.current !== null) {
        ctx.sideArea.appendChild(queueRowEl('Dequeued', [{ label: f.current, style: STYLE_CURRENT }]));
      }
    }

    const viz = V.createStepVisualizer(vizHost, {
      getFrames: function () { return bfsFrames(clampVertex(startInput.value)); },
      render: render,
      split: true,
      pseudocode: ['q = deque([s]); marked[s] = True', 'v = q.popleft()', 'for w in adj[v]:', '    if not marked[w]:', '        marked[w]=True; edgeTo[w]=v; q.append(w)'],
      legend: [
        { cls: 'current', label: 'just dequeued' },
        { cls: 'frontier', label: 'queued' },
        { cls: 'visited', label: 'done' },
        { label: 'tree edge', style: 'background:var(--visited)' }
      ]
    });
    btn.onclick = function () { viz.rebuild(); };
  }

  // ================================================ Tree Traversals =====
  const TREE_NODES = [
    { id: 50, x: 160, y: 40 }, { id: 25, x: 90, y: 110 }, { id: 76, x: 230, y: 110 },
    { id: 17, x: 55, y: 180 }, { id: 34, x: 125, y: 180 }, { id: 62, x: 195, y: 180 }, { id: 94, x: 265, y: 180 }
  ];
  const TREE_CHILDREN = { 50: [25, 76], 25: [17, 34], 76: [62, 94], 17: [null, null], 34: [null, null], 62: [null, null], 94: [null, null] };
  const TREE_EDGES = [[50, 25], [50, 76], [25, 17], [25, 34], [76, 62], [76, 94]];
  const PSEUDOCODE_TRAV = {
    inorder: ['def inorder(n):', '    if n is None: return', '    inorder(n.left)', '    visit(n)', '    inorder(n.right)'],
    preorder: ['def preorder(n):', '    if n is None: return', '    visit(n)', '    preorder(n.left)', '    preorder(n.right)'],
    postorder: ['def postorder(n):', '    if n is None: return', '    postorder(n.left)', '    postorder(n.right)', '    visit(n)']
  };
  const LINES_TRAV = {
    inorder: { left: 2, visit: 3, right: 4 },
    preorder: { visit: 2, left: 3, right: 4 },
    postorder: { left: 2, right: 3, visit: 4 }
  };

  function traversalFrames(mode) {
    const state = {};
    const output = [];
    const frames = [];
    const L = LINES_TRAV[mode];
    function snapshot(activeId, note, code) {
      frames.push({ state: Object.assign({}, state), output: output.slice(), active: activeId, note: note, code: code });
    }
    function visit(id) {
      output.push(id);
      state[id] = 'visited';
      snapshot(id, 'Visit <b>' + id + '</b> → append to output: [' + output.join(', ') + ']', L.visit);
    }
    function recurse(id) {
      if (id == null) return;
      state[id] = 'current';
      const kids = TREE_CHILDREN[id], left = kids[0], right = kids[1];
      function goLeft() {
        if (left != null) snapshot(id, 'At <b>' + id + '</b>: recurse into LEFT child (' + left + ').', L.left);
        recurse(left);
      }
      function goRight() {
        if (right != null) snapshot(id, 'Now recurse into RIGHT child (' + right + ') of ' + id + '.', L.right);
        recurse(right);
      }
      if (mode === 'preorder') { visit(id); goLeft(); goRight(); }
      else if (mode === 'inorder') { goLeft(); visit(id); goRight(); }
      else { goLeft(); goRight(); visit(id); }
    }
    recurse(50);
    snapshot(null, 'Traversal complete. Output sequence: [' + output.join(', ') + ']', -1);
    return frames;
  }

  function buildTraversals(container) {
    const card = V.el('div', { class: 'card' });
    const tabs = V.el('div', { class: 'tabs' });
    const inTab = V.el('button', { class: 'tab active' }, 'In-order');
    const preTab = V.el('button', { class: 'tab' }, 'Pre-order');
    const postTab = V.el('button', { class: 'tab' }, 'Post-order');
    [inTab, preTab, postTab].forEach(function (t) { tabs.appendChild(t); });
    card.appendChild(tabs);
    const vizHost = V.el('div', {});
    card.appendChild(vizHost);
    container.appendChild(card);

    function render(f, ctx) {
      const nodes = TREE_NODES.map(function (n) {
        return { id: n.id, x: n.x, y: n.y, label: n.id, cls: f.state[n.id] || '' };
      });
      const edges = TREE_EDGES.map(function (e) { return { from: e[0], to: e[1], cls: '' }; });
      V.renderGraphSVG(ctx.vizArea, { nodes: nodes, edges: edges }, { width: 320, height: 220 });
      V.clear(ctx.sideArea);
      ctx.sideArea.appendChild(queueRowEl('Output', f.output.map(function (id) { return { label: id }; })));
    }

    let mode = 'inorder';
    let viz = null;
    function makeViz() {
      viz = V.createStepVisualizer(vizHost, {
        getFrames: function () { return traversalFrames(mode); },
        render: render,
        split: true,
        pseudocode: PSEUDOCODE_TRAV[mode],
        legend: [
          { cls: 'current', label: 'currently recursing' },
          { cls: 'visited', label: 'visited (in output)' }
        ]
      });
    }
    makeViz();
    tabs.addEventListener('click', function (e) {
      const t = e.target.closest('.tab'); if (!t) return;
      tabs.querySelectorAll('.tab').forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      mode = t === inTab ? 'inorder' : t === preTab ? 'preorder' : 'postorder';
      makeViz();
    });
  }

  // ============================================== Topological Sort ======
  const NODES_DAG = [{ id: 0, x: 40, y: 150 }, { id: 1, x: 150, y: 70 }, { id: 2, x: 150, y: 230 }, { id: 3, x: 260, y: 150 }, { id: 4, x: 370, y: 150 }];
  const EDGES_DAG = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]];
  const ADJ_DAG = { 0: [1, 2], 1: [3], 2: [3], 3: [4], 4: [] };

  function topoFrames() {
    const n = NODES_DAG.length;
    const marked = new Array(n).fill(false);
    const finished = new Array(n).fill(false);
    const edgeTo = new Array(n).fill(-1);
    const postorder = [];
    const frames = [];
    function push(current, note, code, lastEdge) {
      frames.push({
        current: current, marked: marked.slice(), finished: finished.slice(), edgeTo: edgeTo.slice(),
        postorder: postorder.slice(), lastEdge: lastEdge || null, topo: null, note: note, code: code
      });
    }
    function dfs(v) {
      marked[v] = true;
      push(v, 'Visit vertex <b>' + v + '</b> → mark it.', 0);
      const nbrs = ADJ_DAG[v];
      for (let k = 0; k < nbrs.length; k++) {
        const w = nbrs[k];
        if (!marked[w]) {
          edgeTo[w] = v;
          push(v, 'Edge ' + v + '→' + w + ': ' + w + ' unmarked → recurse dfs(' + w + ').', 1, [v, w]);
          dfs(w);
        } else {
          push(v, 'Edge ' + v + '→' + w + ': ' + w + ' already visited → skip.', 1, [v, w]);
        }
      }
      finished[v] = true;
      postorder.push(v);
      push(v, '<b>' + v + '</b> finishes (all out-edges explored) → append to finish list: [' + postorder.join(', ') + ']', 2);
    }
    dfs(0);
    const topo = postorder.slice().reverse();
    const pos = {};
    topo.forEach(function (v, i) { pos[v] = i; });
    const checks = EDGES_DAG.map(function (e) {
      const ok = pos[e[0]] < pos[e[1]];
      return e[0] + '→' + e[1] + ' (pos ' + pos[e[0]] + '<' + pos[e[1]] + ') ' + (ok ? '✓' : '✗');
    }).join(', ');
    frames.push({
      current: null, marked: marked.slice(), finished: finished.slice(), edgeTo: edgeTo.slice(),
      postorder: postorder.slice(), lastEdge: null, topo: topo,
      note: 'Reverse the finish list → topological order: <b>[' + topo.join(', ') + ']</b>. Every edge points forward: ' + checks,
      code: 4
    });
    return frames;
  }

  function buildTopoSort(container) {
    const card = V.el('div', { class: 'card' });
    const vizHost = V.el('div', {});
    card.appendChild(vizHost);
    container.appendChild(card);

    function render(f, ctx) {
      const nodes = NODES_DAG.map(function (n) {
        let cls = '';
        if (n.id === f.current) cls = 'current';
        else if (f.finished[n.id]) cls = 'visited';
        else if (f.marked[n.id]) cls = 'frontier';
        return { id: n.id, x: n.x, y: n.y, label: n.id, cls: cls };
      });
      const edges = EDGES_DAG.map(function (e) {
        let cls = '';
        if (f.edgeTo[e[1]] === e[0]) cls = 'tree';
        else if (f.lastEdge && f.lastEdge[0] === e[0] && f.lastEdge[1] === e[1]) cls = 'active';
        return { from: e[0], to: e[1], cls: cls };
      });
      V.renderGraphSVG(ctx.vizArea, { nodes: nodes, edges: edges }, { width: 410, height: 280, directed: true });
      V.clear(ctx.sideArea);
      ctx.sideArea.appendChild(queueRowEl('Finish order', f.postorder.map(function (v) { return { label: v }; })));
      if (f.topo) {
        ctx.sideArea.appendChild(queueRowEl('Topological order', f.topo.map(function (v) { return { label: v, style: STYLE_CURRENT }; })));
      }
    }

    V.createStepVisualizer(vizHost, {
      getFrames: topoFrames,
      render: render,
      split: true,
      pseudocode: ['dfs(v): mark v', '    for w in adj[v] unmarked: dfs(w)', '    postorder.append(v)   # v finishes', '# after full DFS:', 'topological_order = reversed(postorder)'],
      legend: [
        { cls: 'current', label: 'current vertex' },
        { cls: 'frontier', label: 'marked, not yet finished' },
        { cls: 'visited', label: 'finished' },
        { label: 'tree edge', style: 'background:var(--visited)' },
        { label: 'edge being explored', style: 'background:var(--accent)' }
      ]
    });
  }

  // ------------------------------------------------------------ register --
  App.registerLecture({
    id: 'l8', number: 8, title: 'Graph Algorithms 1',
    sections: [
      {
        id: 'dfs', title: 'Depth-First Search',
        intro: 'DFS recurses into the first unmarked neighbour it finds, going as deep as possible before backtracking (the implicit call stack shown on the right). On this 6-vertex graph, <code>dfs(0)</code> visits vertices in order <b>0, 1, 2, 3, 4, 5</b>.',
        build: buildDFS,
        reading: READING
      },
      {
        id: 'bfs', title: 'Breadth-First Search',
        intro: 'BFS explores level by level using a FIFO queue: neighbours are marked and enqueued the moment they are discovered, not when dequeued. This guarantees <code>edgeTo</code> forms a <b>shortest-path tree</b> (fewest edges) from the source.',
        build: buildBFS,
        reading: READING
      },
      {
        id: 'traversals', title: 'Tree Traversals (In/Pre/Post-order)',
        intro: 'Three ways to linearise a binary tree by choosing when to visit the root relative to its subtrees: <b>in-order</b> (left, root, right — sorted order for a BST), <b>pre-order</b> (root, left, right), <b>post-order</b> (left, right, root).',
        build: buildTraversals,
        reading: READING
      },
      {
        id: 'topo-sort', title: 'Topological Sort',
        intro: 'Only defined for a DAG: a linear order where every edge points forward. Run DFS, record each vertex when it <b>finishes</b> (post-order), then reverse that list.',
        build: buildTopoSort,
        reading: READING
      }
    ]
  });
})();
