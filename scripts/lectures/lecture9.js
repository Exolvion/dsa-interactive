/* ==========================================================================
   Lecture 9 — Graph Algorithms 2: Minimum Spanning Trees & Shortest Paths
   Follows lecture6.js conventions: IIFE, VizKit.createStepVisualizer, tabs,
   input-row pattern. Frames are full state snapshots (not deltas).
   ========================================================================== */
(function () {
  'use strict';
  const V = window.VizKit;

  // ------------------------------------------------------------ helpers ---
  // Circular layout: viewBox 0 0 460 380, centered (230,190), radius 155.
  // Vertex 0 at top, going clockwise. GRAPH_VB must match these dimensions
  // exactly, since renderGraphSVG's viewBox is sized from opts, not from
  // the node coordinates -- a mismatch here clips/crams the layout.
  const GRAPH_VB = { width: 460, height: 380 };
  function circleLayout(n) {
    const nodes = [];
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + i * 2 * Math.PI / n;
      nodes.push({ x: 230 + 155 * Math.cos(angle), y: 190 + 155 * Math.sin(angle) });
    }
    return nodes;
  }
  function ukey(a, b) { return a < b ? a + '-' + b : b + '-' + a; }
  function totalWeight(edges) { return edges.reduce(function (s, e) { return s + e[2]; }, 0); }
  function vertexSelect(count, value) {
    const sel = V.el('select', { class: 'input-field' });
    for (let i = 0; i < count; i++) sel.appendChild(V.el('option', { value: i }, String(i)));
    sel.value = value;
    return sel;
  }

  const READING = [
    { label: 'Princeton algs4 — Minimum Spanning Trees', url: 'https://algs4.cs.princeton.edu/43mst/' },
    { label: 'Princeton algs4 — Shortest Paths', url: 'https://algs4.cs.princeton.edu/44sp/' },
    { label: 'MIT OCW 6.006 — Dijkstra', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/lecture-16-dijkstra/' },
    { label: 'MIT OCW 6.006 — Bellman-Ford', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/lecture-17-bellman-ford/' },
    { label: 'cp-algorithms — Prim, Dijkstra, Bellman-Ford', url: 'https://cp-algorithms.com/graph/mst_prim.html' }
  ];

  // ============================================== Prim's Algorithm (MST) ===
  // tinyEWG — standard textbook 8-vertex weighted undirected graph.
  const tinyEWG = [
    [0, 7, 0.16], [2, 3, 0.17], [1, 7, 0.19], [0, 2, 0.26], [5, 7, 0.28], [1, 3, 0.29],
    [1, 5, 0.32], [2, 7, 0.34], [4, 5, 0.35], [1, 2, 0.36], [4, 7, 0.37], [0, 4, 0.38],
    [6, 2, 0.40], [3, 6, 0.52], [6, 0, 0.58], [6, 4, 0.93]
  ];
  const TINY_V = 8;

  function primFrames(edgeList, n, start) {
    const layout = circleLayout(n);
    const adj = Array.from({ length: n }, function () { return []; });
    edgeList.forEach(function (e) { adj[e[0]].push([e[1], e[2]]); adj[e[1]].push([e[0], e[2]]); });
    const inTree = new Array(n).fill(false);
    inTree[start] = true;
    const treeEdges = [];
    const decided = {}; // edge key -> 'tree' | 'reject'
    let pq = adj[start].map(function (p) { return [p[1], start, p[0]]; }); // [w, a, b]
    const frames = [];

    function snapshot(note, code, activeEdge) {
      const nodes = [];
      for (let i = 0; i < n; i++) {
        nodes.push({ id: i, x: layout[i].x, y: layout[i].y, label: String(i), cls: inTree[i] ? 'settled' : '' });
      }
      const edges = edgeList.map(function (e) {
        const key = ukey(e[0], e[1]);
        let cls = decided[key] || '';
        if (activeEdge && ukey(activeEdge[0], activeEdge[1]) === key) cls = 'active';
        return { from: e[0], to: e[1], label: e[2].toFixed(2), cls: cls };
      });
      frames.push({ nodes: nodes, edges: edges, note: note, code: code });
    }

    snapshot('Start Prim’s algorithm from vertex <b>' + start + '</b>. PQ = all edges incident to ' + start + '.', 0);

    while (pq.length && treeEdges.length < n - 1) {
      pq.sort(function (x, y) { return x[0] - y[0]; });
      const min = pq.shift();
      const w = min[0], a = min[1], b = min[2];
      snapshot('PQ.deleteMin() → edge ' + a + '-' + b + ' (weight ' + w.toFixed(2) + ').', 2, [a, b]);
      if (inTree[a] && inTree[b]) {
        decided[ukey(a, b)] = 'reject';
        snapshot('Both ' + a + ' and ' + b + ' are already in the tree → discard (would create a cycle).', 3, [a, b]);
        continue;
      }
      const newV = inTree[a] ? b : a;
      inTree[newV] = true;
      treeEdges.push([a, b, w]);
      decided[ukey(a, b)] = 'tree';
      snapshot('Add edge ' + a + '-' + b + ' (weight ' + w.toFixed(2) + ') to MST — vertex ' + newV + ' joins the tree.', 4, [a, b]);
      adj[newV].forEach(function (p) { if (!inTree[p[0]]) pq.push([p[1], newV, p[0]]); });
    }
    snapshot('MST complete: ' + treeEdges.length + ' edges, total weight ' + totalWeight(treeEdges).toFixed(2) + '.', -1);
    return frames;
  }

  function buildPrim(container) {
    const card = V.el('div', { class: 'card' });
    const inputRow = V.el('div', { class: 'input-row' });
    const startSel = vertexSelect(TINY_V, 0);
    const btn = V.el('button', { class: 'btn primary' }, 'Run Prim');
    inputRow.appendChild(V.el('label', {}, 'start vertex'));
    inputRow.appendChild(startSel);
    inputRow.appendChild(btn);
    card.appendChild(inputRow);
    const vizHost = V.el('div', {});
    card.appendChild(vizHost);
    container.appendChild(card);

    const viz = V.createStepVisualizer(vizHost, {
      getFrames: function () { return primFrames(tinyEWG, TINY_V, +startSel.value); },
      render: function (f, ctx) { V.renderGraphSVG(ctx.vizArea, { nodes: f.nodes, edges: f.edges }, GRAPH_VB); },
      pseudocode: ['PQ = all edges incident to start vertex', 'while PQ not empty and |MST edges| < V-1:', '    e = PQ.deleteMin()', '    if both endpoints of e already in tree: discard e   # cycle', '    else: add e to MST; add new vertex\'s edges to PQ'],
      legend: [
        { cls: 'settled', label: 'in MST tree' },
        { cls: 'tree', label: 'MST edge' },
        { cls: 'active', label: 'considering' },
        { cls: 'reject', label: 'rejected (cycle)' }
      ]
    });
    btn.onclick = function () { viz.rebuild(); };
  }

  // =========================================== Kruskal's Algorithm (MST) ===
  function kruskalFrames(edgeList, n) {
    const layout = circleLayout(n);
    const parent = [];
    for (let i = 0; i < n; i++) parent.push(i);
    function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
    const sorted = edgeList.slice().sort(function (a, b) { return a[2] - b[2]; });
    const treeEdges = [];
    const decided = {};
    const frames = [];
    let prevRoots = null;

    function snapshot(note, code, activeKey) {
      const nodes = [];
      for (let i = 0; i < n; i++) nodes.push({ id: i, x: layout[i].x, y: layout[i].y, label: String(i), cls: '' });
      const edges = edgeList.map(function (e) {
        const key = ukey(e[0], e[1]);
        let cls = decided[key] || '';
        if (activeKey === key) cls = 'active';
        return { from: e[0], to: e[1], label: e[2].toFixed(2), cls: cls };
      });
      const currentRoots = [];
      for (let i = 0; i < n; i++) currentRoots.push(find(i));
      const rootRow = currentRoots.map(function (r, i) {
        return { val: r, cls: (prevRoots && prevRoots[i] !== r) ? 'hl' : '' };
      });
      prevRoots = currentRoots;
      const headers = Array.from({ length: n }, function (_, i) { return String(i); });
      frames.push({ nodes: nodes, edges: edges, note: note, code: code, headers: headers, rootRow: rootRow });
    }

    snapshot('Sort all ' + edgeList.length + ' edges ascending by weight. Scan in order; add an edge unless it creates a cycle (checked via union-find).', 0);

    sorted.forEach(function (e) {
      const a = e[0], b = e[1], w = e[2];
      const key = ukey(a, b);
      const ra = find(a), rb = find(b);
      snapshot('Testing edge ' + a + '-' + b + ' (weight ' + w.toFixed(2) + '): find(' + a + ')=' + ra + ', find(' + b + ')=' + rb + '.', 2, key);
      if (ra !== rb) {
        parent[ra] = rb;
        treeEdges.push([a, b, w]);
        decided[key] = 'tree';
        snapshot(a + ' and ' + b + ' are in <b>different</b> sets → add edge ' + a + '-' + b + ' to MST; union(' + a + ',' + b + ').', 3, key);
      } else {
        decided[key] = 'reject';
        snapshot(a + ' and ' + b + ' are already in the <b>same set</b> (root ' + ra + ') → would create a cycle → skip.', 4, key);
      }
    });

    snapshot('Kruskal complete: ' + treeEdges.length + ' edges in MST, total weight ' + totalWeight(treeEdges).toFixed(2) + '.', -1);
    return frames;
  }

  function buildKruskal(container) {
    const card = V.el('div', { class: 'card' });
    const vizHost = V.el('div', {});
    card.appendChild(vizHost);
    container.appendChild(card);

    V.createStepVisualizer(vizHost, {
      getFrames: function () { return kruskalFrames(tinyEWG, TINY_V); },
      render: function (f, ctx) {
        V.renderGraphSVG(ctx.vizArea, { nodes: f.nodes, edges: f.edges }, GRAPH_VB);
        V.renderTable(ctx.sideArea, { headers: f.headers, rows: [f.rootRow] });
      },
      pseudocode: ['sort all edges by weight ascending', 'for e = (v,w) in sorted edges:', '    if find(v) != find(w):', '        add e to MST; union(v,w)', '    else: skip   # would create a cycle'],
      split: true,
      legend: [
        { cls: 'active', label: 'testing' },
        { cls: 'tree', label: 'added to MST' },
        { cls: 'reject', label: 'skipped (cycle)' }
      ]
    });
  }

  // ================================================= Dijkstra's Algorithm ==
  const dijkstraEdges = [
    [0, 1, 5], [0, 4, 9], [0, 7, 8], [1, 2, 12], [1, 3, 15], [1, 7, 4], [2, 3, 3], [2, 6, 11],
    [3, 6, 9], [4, 5, 4], [4, 6, 20], [5, 2, 1], [5, 6, 13], [7, 2, 7], [7, 5, 6]
  ];
  const DIJKSTRA_V = 8;

  function dijkstraFrames(edgeList, n, src) {
    const layout = circleLayout(n);
    const adj = Array.from({ length: n }, function () { return []; });
    edgeList.forEach(function (e) { adj[e[0]].push([e[1], e[2]]); });
    const dist = new Array(n).fill(Infinity);
    const edgeTo = new Array(n).fill(null);
    const settled = new Array(n).fill(false);
    dist[src] = 0;
    const frames = [];

    function snapshot(note, code, currentV, hlSet, activeEdge) {
      const nodes = [];
      for (let i = 0; i < n; i++) {
        nodes.push({
          id: i, x: layout[i].x, y: layout[i].y, label: String(i),
          cls: i === currentV ? 'current' : (settled[i] ? 'settled' : ''),
          dist: dist[i] === Infinity ? '∞' : dist[i]
        });
      }
      const edges = edgeList.map(function (e) {
        let cls = edgeTo[e[1]] === e[0] ? 'tree' : '';
        if (activeEdge && activeEdge[0] === e[0] && activeEdge[1] === e[1]) cls = 'active';
        return { from: e[0], to: e[1], label: e[2], cls: cls };
      });
      const headers = ['v'].concat(Array.from({ length: n }, function (_, i) { return String(i); }));
      const distRow = ['distTo'].concat(Array.from({ length: n }, function (_, i) {
        return { val: dist[i] === Infinity ? '∞' : dist[i], cls: (hlSet && hlSet.indexOf(i) > -1) ? 'hl' : '' };
      }));
      const edgeToRow = ['edgeTo'].concat(Array.from({ length: n }, function (_, i) {
        return { val: edgeTo[i] === null ? '-' : edgeTo[i], cls: '' };
      }));
      frames.push({ nodes: nodes, edges: edges, note: note, code: code, headers: headers, rows: [distRow, edgeToRow] });
    }

    snapshot('Initialize distTo[' + src + ']=0, all others ∞. Source = <b>' + src + '</b>.', 0);

    for (let iter = 0; iter < n; iter++) {
      let u = -1, best = Infinity;
      for (let v = 0; v < n; v++) if (!settled[v] && dist[v] < best) { best = dist[v]; u = v; }
      if (u === -1) break;
      snapshot('Unsettled vertex with min distTo is <b>' + u + '</b> (distTo=' + dist[u] + ') → settle it.', 1, u);
      settled[u] = true;
      snapshot('Vertex ' + u + ' marked settled.', 2, u);
      if (adj[u].length) snapshot('Relax all outgoing edges of ' + u + '.', 3, u);
      adj[u].forEach(function (p) {
        const w = p[0], wt = p[1];
        const newDist = dist[u] + wt;
        const improves = newDist < dist[w];
        snapshot('Test ' + u + '->' + w + ' (weight ' + wt + '): distTo[' + u + ']+' + wt + '=' + newDist +
          (improves ? ' &lt; distTo[' + w + ']=' + (dist[w] === Infinity ? '∞' : dist[w]) + ' → improves' : ' ≥ distTo[' + w + ']=' + dist[w] + ' → no change'),
          4, u, null, [u, w]);
        if (improves) {
          dist[w] = newDist; edgeTo[w] = u;
          snapshot('distTo[' + w + '] updated to ' + dist[w] + ' (via ' + u + ').', 5, u, [w], [u, w]);
        }
      });
    }
    snapshot('All reachable vertices settled. Final distTo shown above.', -1);
    return frames;
  }

  function buildDijkstra(container) {
    const card = V.el('div', { class: 'card' });
    const inputRow = V.el('div', { class: 'input-row' });
    const srcSel = vertexSelect(DIJKSTRA_V, 0);
    const btn = V.el('button', { class: 'btn primary' }, 'Run Dijkstra');
    inputRow.appendChild(V.el('label', {}, 'source vertex'));
    inputRow.appendChild(srcSel);
    inputRow.appendChild(btn);
    card.appendChild(inputRow);
    const vizHost = V.el('div', {});
    card.appendChild(vizHost);
    container.appendChild(card);

    const viz = V.createStepVisualizer(vizHost, {
      getFrames: function () { return dijkstraFrames(dijkstraEdges, DIJKSTRA_V, +srcSel.value); },
      render: function (f, ctx) {
        V.renderGraphSVG(ctx.vizArea, { nodes: f.nodes, edges: f.edges }, Object.assign({ directed: true }, GRAPH_VB));
        V.renderTable(ctx.sideArea, { headers: f.headers, rows: f.rows });
      },
      pseudocode: ['while unsettled vertices remain:', '    v = unsettled vertex with min distTo[v]', '    mark v settled', '    for each edge v->w:', '        if distTo[v]+weight < distTo[w]:', '            distTo[w] = distTo[v]+weight; edgeTo[w]=v   # relax'],
      split: true,
      legend: [
        { cls: 'current', label: 'being settled' },
        { cls: 'settled', label: 'settled' },
        { cls: 'tree', label: 'shortest-path tree edge' },
        { cls: 'active', label: 'relaxing' }
      ]
    });
    btn.onclick = function () { viz.rebuild(); };
  }

  // ================================================ Bellman-Ford Algorithm =
  const bfEdges = [[0, 1, 5], [0, 2, 8], [1, 2, 2], [1, 3, 4], [1, 4, 6], [3, 2, 3], [4, 3, -10]];
  const bfEdgesNegCycle = bfEdges.concat([[2, 1, -100]]); // creates cycle 1->2->1 (weight 2 + -100 = -98)
  const BF_V = 5;

  function bellmanFordFrames(edgeList, n, src) {
    const layout = circleLayout(n);
    const dist = new Array(n).fill(Infinity);
    const edgeTo = new Array(n).fill(null);
    dist[src] = 0;
    const frames = [];

    function snapshot(note, code, activeEdge, hlSet) {
      const nodes = [];
      for (let i = 0; i < n; i++) {
        nodes.push({ id: i, x: layout[i].x, y: layout[i].y, label: String(i), cls: '', dist: dist[i] === Infinity ? '∞' : dist[i] });
      }
      const edges = edgeList.map(function (e) {
        let cls = edgeTo[e[1]] === e[0] ? 'tree' : '';
        if (activeEdge && activeEdge[0] === e[0] && activeEdge[1] === e[1]) cls = 'active';
        return { from: e[0], to: e[1], label: e[2], cls: cls };
      });
      const headers = ['v'].concat(Array.from({ length: n }, function (_, i) { return String(i); }));
      const distRow = ['distTo'].concat(Array.from({ length: n }, function (_, i) {
        return { val: dist[i] === Infinity ? '∞' : dist[i], cls: (hlSet && hlSet.indexOf(i) > -1) ? 'hl' : '' };
      }));
      const edgeToRow = ['edgeTo'].concat(Array.from({ length: n }, function (_, i) {
        return { val: edgeTo[i] === null ? '-' : edgeTo[i], cls: '' };
      }));
      frames.push({ nodes: nodes, edges: edges, note: note, code: code, headers: headers, rows: [distRow, edgeToRow] });
    }

    snapshot('Initialize distTo[' + src + ']=0, all others ∞. Relax all edges, for up to V=' + n + ' passes.', 0);

    for (let i = 0; i < n; i++) {
      let changed = false;
      snapshot('<b>Pass ' + (i + 1) + '</b> of ' + n + ': relax every edge, in fixed order.', 1);
      edgeList.forEach(function (e) {
        const a = e[0], b = e[1], w = e[2];
        if (dist[a] !== Infinity && dist[a] + w < dist[b]) {
          dist[b] = dist[a] + w; edgeTo[b] = a; changed = true;
          snapshot('relax(' + a + '->' + b + ', ' + w + '): distTo[' + a + ']+' + w + '=' + dist[b] + ' improves distTo[' + b + '] → update.', 2, [a, b], [b]);
        } else {
          snapshot('relax(' + a + '->' + b + ', ' + w + '): no improvement.', 2, [a, b]);
        }
      });
      if (!changed) {
        snapshot('<b>Pass ' + (i + 1) + ' made no changes → terminate.</b> Shortest paths finalized.', -1);
        break;
      }
      if (i === n - 1) {
        snapshot('<b>Pass ' + n + ' (the V-th pass) still changed distances → negative cycle detected!</b> Shortest-path distances are undefined.', 3);
      }
    }
    return frames;
  }

  function buildBellmanFord(container) {
    const card = V.el('div', { class: 'card' });
    const tabs = V.el('div', { class: 'tabs' });
    const stdTab = V.el('button', { class: 'tab active' }, 'Standard (no negative cycle)');
    const negTab = V.el('button', { class: 'tab' }, 'Negative cycle demo');
    tabs.appendChild(stdTab); tabs.appendChild(negTab);
    card.appendChild(tabs);
    const vizHost = V.el('div', {});
    card.appendChild(vizHost);
    container.appendChild(card);

    let edgeSet = bfEdges;
    function makeViz() {
      V.createStepVisualizer(vizHost, {
        getFrames: function () { return bellmanFordFrames(edgeSet, BF_V, 0); },
        render: function (f, ctx) {
          V.renderGraphSVG(ctx.vizArea, { nodes: f.nodes, edges: f.edges }, Object.assign({ directed: true }, GRAPH_VB));
          V.renderTable(ctx.sideArea, { headers: f.headers, rows: f.rows });
        },
        pseudocode: ['for i in range(V):              # V passes', '    for e in all_edges:          # in fixed order', '    relax(e)', '# if pass V still changes distTo -> negative cycle exists'],
        split: true,
        legend: [
          { cls: 'active', label: 'relaxing edge' },
          { cls: 'tree', label: 'edgeTo tree edge' }
        ]
      });
    }
    makeViz();
    tabs.addEventListener('click', function (e) {
      const t = e.target.closest('.tab'); if (!t) return;
      tabs.querySelectorAll('.tab').forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      edgeSet = t === stdTab ? bfEdges : bfEdgesNegCycle;
      makeViz();
    });
  }

  // ------------------------------------------------------------ register --
  App.registerLecture({
    id: 'l9', number: 9, title: 'Graph Algorithms 2',
    sections: [
      {
        id: 'prim', title: 'Prim\'s Algorithm (MST)',
        intro: 'Grow a minimum spanning tree one edge at a time: repeatedly add the minimum-weight edge with exactly one endpoint already in the tree (conceptually a priority queue of crossing edges). Uses the classic 8-vertex <code>tinyEWG</code> weighted graph — an edge that would close a cycle is briefly shown rejected before the next true pick.',
        build: buildPrim,
        reading: READING
      },
      {
        id: 'kruskal', title: 'Kruskal\'s Algorithm (MST)',
        intro: 'Sort all edges ascending by weight and greedily add each one unless it would close a cycle — checked via union-find. Same <code>tinyEWG</code> graph and the same final MST (7 edges, total weight 1.81) as Prim, built in a completely different order. Watch the vertex → root table beside the graph as sets merge.',
        build: buildKruskal,
        reading: READING
      },
      {
        id: 'dijkstra', title: 'Dijkstra\'s Algorithm',
        intro: 'Repeatedly settle the unsettled vertex with the smallest known <code>distTo</code>, then relax all of its outgoing edges. Requires non-negative edge weights. The live distTo/edgeTo table beside the graph highlights exactly which entries change at each relaxation. Edit the source vertex and re-run.',
        build: buildDijkstra,
        reading: READING
      },
      {
        id: 'bellman-ford', title: 'Bellman-Ford Algorithm',
        intro: 'Relax every edge, V times over, in a fixed order — slower than Dijkstra (O(VE)) but correct even with negative edge weights, provided there is no negative cycle. If a pass still improves distances after the V-th pass, a negative cycle reachable from the source exists. Try the "Negative cycle demo" tab to see that check fire.',
        build: buildBellmanFord,
        reading: READING
      }
    ]
  });
})();
