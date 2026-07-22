/* Diagram-answer bank — Lecture 9: Graph Algorithms 2 (MST: Prim/Kruskal; SSSP: Dijkstra/Bellman-Ford) */
window.DiagramBank = window.DiagramBank || {};

(function () {
  // tinyEWG (Princeton algs4 dataset): 8 vertices, 16 weighted undirected edges, circle layout.
  var tinyEWGNodes = [
    { id: '0', x: 180, y: 30, label: '0' }, { id: '1', x: 258, y: 62, label: '1' },
    { id: '2', x: 290, y: 140, label: '2' }, { id: '3', x: 258, y: 218, label: '3' },
    { id: '4', x: 180, y: 250, label: '4' }, { id: '5', x: 102, y: 218, label: '5' },
    { id: '6', x: 70, y: 140, label: '6' }, { id: '7', x: 102, y: 62, label: '7' }
  ];
  var tinyEWGEdges = [
    { from: '0', to: '7', label: '0.16' }, { from: '2', to: '3', label: '0.17' },
    { from: '1', to: '7', label: '0.19' }, { from: '0', to: '2', label: '0.26' },
    { from: '5', to: '7', label: '0.28' }, { from: '1', to: '3', label: '0.29' },
    { from: '1', to: '5', label: '0.32' }, { from: '2', to: '7', label: '0.34' },
    { from: '4', to: '5', label: '0.35' }, { from: '1', to: '2', label: '0.36' },
    { from: '4', to: '7', label: '0.37' }, { from: '0', to: '4', label: '0.38' },
    { from: '6', to: '2', label: '0.40' }, { from: '3', to: '6', label: '0.52' },
    { from: '6', to: '0', label: '0.58' }, { from: '6', to: '4', label: '0.93' }
  ];

  window.DiagramBank.l9 = [
    {
      kind: 'graph',
      prompt: 'tinyEWG (8 vertices, 16 weighted edges). Running Prim’s MST algorithm starting from vertex 0, click the very first edge added to the tree.',
      targetType: 'edge',
      nodes: tinyEWGNodes,
      edges: tinyEWGEdges,
      correct: '0-7',
      explain: 'Vertex 0’s cheapest incident edge is 0-7 (weight 0.16) — Prim’s greedily adds it first.'
    },
    {
      kind: 'graph',
      prompt: 'Same graph. Running Kruskal’s algorithm (edges considered in ascending global weight order), the first edge added is 0-7 (0.16). Click the SECOND edge added to the MST.',
      targetType: 'edge',
      nodes: tinyEWGNodes,
      edges: tinyEWGEdges,
      correct: '2-3',
      explain: 'Kruskal’s looks at edges in globally ascending order regardless of any start vertex — 2-3 (0.17) is the next-cheapest edge overall and doesn’t create a cycle. Prim’s from vertex 0, by contrast, wouldn’t add 2-3 until vertex 2 joins the tree.'
    },
    {
      kind: 'graph',
      prompt: 'Same graph and Kruskal’s trace. Click the edge with weight 0.29 that must be SKIPPED because both its endpoints are already connected in the forming MST (adding it would create a cycle).',
      targetType: 'edge',
      nodes: tinyEWGNodes,
      edges: tinyEWGEdges,
      correct: '1-3',
      explain: 'By the time the weight-0.29 edge 1-3 is considered, vertices 1 and 3 are already connected (via 0-7, 1-7 and 0-7, 2-3, 0-2) — adding 1-3 would form a cycle, so Kruskal’s discards it.'
    },
    {
      kind: 'graph',
      prompt: 'Directed weighted graph. Running Dijkstra’s algorithm from vertex 0, the settle order is 0, 1, 7, 4, 5, 2, 3, 6. Click the vertex that gets settled (finalized) 3rd.',
      targetType: 'node',
      directed: true,
      nodes: tinyEWGNodes,
      edges: [
        { from: '0', to: '1', label: '5' }, { from: '0', to: '4', label: '9' }, { from: '0', to: '7', label: '8' },
        { from: '1', to: '2', label: '12' }, { from: '1', to: '3', label: '15' }, { from: '1', to: '7', label: '4' },
        { from: '2', to: '3', label: '3' }, { from: '2', to: '6', label: '11' }, { from: '3', to: '6', label: '9' },
        { from: '4', to: '5', label: '4' }, { from: '4', to: '6', label: '20' }, { from: '5', to: '2', label: '1' },
        { from: '5', to: '6', label: '13' }, { from: '7', to: '2', label: '7' }, { from: '7', to: '5', label: '6' }
      ],
      correct: '7',
      explain: 'Settle order is by increasing finalized distance: 0 (dist 0), 1 (dist 5), 7 (dist 8), … — vertex 7 is the third vertex settled, since 8 is the next-smallest distance after 0 and 5.'
    },
    {
      kind: 'graph',
      prompt: 'Directed weighted graph with a negative edge 4→3 (weight -10). Bellman-Ford’s pass 1 leaves distTo[3] = 11; click the edge that, once relaxed, drops distTo[3] down to 1.',
      targetType: 'edge',
      directed: true,
      nodes: [
        { id: '0', x: 50, y: 140, label: '0' }, { id: '1', x: 150, y: 60, label: '1' },
        { id: '2', x: 320, y: 140, label: '2' }, { id: '3', x: 230, y: 220, label: '3' },
        { id: '4', x: 230, y: 60, label: '4' }
      ],
      edges: [
        { from: '0', to: '1', label: '5' }, { from: '0', to: '2', label: '8' }, { from: '1', to: '2', label: '2' },
        { from: '1', to: '3', label: '4' }, { from: '1', to: '4', label: '6' }, { from: '3', to: '2', label: '3' },
        { from: '4', to: '3', label: '-10' }
      ],
      correct: '4-3',
      explain: 'Relaxing 4→3 (-10) gives distTo[3] = distTo[4] + (-10) = 11 - 10 = 1. Dijkstra would never revisit vertex 3 like this once settled — exactly why it can’t handle negative edges.'
    }
  ];
})();
