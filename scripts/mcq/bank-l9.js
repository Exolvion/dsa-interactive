/* MCQ bank — Lecture 9: Graph Algorithms 2 (MST: Prim/Kruskal; Shortest Paths: Dijkstra/Bellman-Ford) */
window.MCQBank = window.MCQBank || {};
window.MCQBank.l9 = [
  {
    q: 'A spanning tree of a connected graph with V vertices has exactly how many edges?',
    options: ['V', 'V - 1', 'V + 1', 'E - 1'],
    answer: 1,
    explain: 'A tree on V vertices always has exactly V-1 edges — one fewer edge than vertices, with no cycles.'
  },
  {
    q: "What is Prim's greedy rule for building an MST?",
    options: [
      'Sort all edges by weight and add each one if it doesn’t form a cycle',
      'Repeatedly add the minimum-weight edge that has exactly one endpoint already in the growing tree',
      'Repeatedly add the maximum-weight edge available',
      'Run BFS from every vertex and merge the resulting trees'
    ],
    answer: 1,
    explain: "Prim's grows a single tree outward, always crossing to a new vertex via the cheapest available edge leaving the current tree — edges with both endpoints already inside are discarded."
  },
  {
    q: "What is Kruskal's greedy rule, and what structure detects cycles?",
    options: [
      'Grow one tree from a start vertex using a priority queue of edges',
      'Consider edges in ascending weight order and add each unless it would form a cycle; cycle detection uses union-find over connected components',
      'Consider edges in descending weight order and add each unless it would form a cycle',
      'Use a stack to detect cycles as edges are added'
    ],
    answer: 1,
    explain: "Kruskal's works globally across the whole edge list rather than growing outward from one vertex — union-find efficiently answers \"are these two endpoints already connected?\" in near-constant time."
  },
  {
    q: "Both Prim's and Kruskal's algorithms achieve what asymptotic running time (with a binary heap / sorted edge list)?",
    options: ['O(V²)', 'O(E log E)', 'O(E·V)', 'O(V + E)'],
    answer: 1,
    explain: 'Both are dominated by priority-queue operations or sorting over the E edges, each costing O(log E).'
  },
  {
    q: "Why must Dijkstra's algorithm require non-negative edge weights?",
    options: [
      'Negative weights cause infinite loops in the priority queue',
      'Once a vertex is "settled" with its shortest distance, Dijkstra assumes no later relaxation can improve it — a negative edge discovered later could produce a cheaper path, breaking that assumption',
      'Negative weights make the graph disconnected',
      'Negative weights are only a problem for undirected graphs'
    ],
    answer: 1,
    explain: "Dijkstra's correctness relies on always settling the globally-nearest unsettled vertex next; a negative edge appearing later can undercut an already-settled distance, which the algorithm never revisits."
  },
  {
    q: "Can Dijkstra's negative-weight problem be fixed by adding a large constant to every edge weight?",
    options: [
      'Yes, this always produces the same shortest-path tree',
      'No — longer paths accumulate more of the added constant than shorter paths, so it can change which path is actually shortest',
      'Yes, but only for DAGs',
      'No, because it makes all weights negative instead'
    ],
    answer: 1,
    explain: 'A path with more edges gains proportionally more of the added constant, so relative path costs shift and the "shortest" path can silently change.'
  },
  {
    q: 'What is the "relax" operation on edge v→w?',
    options: [
      'Remove the edge from the graph',
      'If distTo[v] + weight(v,w) < distTo[w], update distTo[w] and edgeTo[w] to reflect this shorter path via v',
      'Set distTo[w] to infinity',
      'Swap v and w in the adjacency list'
    ],
    answer: 1,
    explain: 'Relaxation is the single core operation shared by Dijkstra and Bellman-Ford — it improves a distance estimate whenever a cheaper route is found.'
  },
  {
    q: 'Why does Bellman-Ford need up to V passes, relaxing every edge in each pass?',
    options: [
      'One pass per vertex is required to visit each vertex exactly once, like BFS',
      'After pass k, distances are correct for shortest paths using at most k edges; a simple shortest path has at most V-1 edges, so V-1 passes suffice, and a Vth pass that still changes something signals a negative cycle',
      "It's an arbitrary safety margin with no theoretical basis",
      'The priority queue needs V-1 extractions to empty'
    ],
    answer: 1,
    explain: 'This is the key correctness argument: the number of passes bounds the number of edges a candidate shortest path can use, and an extra pass making further progress is precisely the signature of a negative cycle.'
  },
  {
    q: 'Unlike Dijkstra, Bellman-Ford can correctly handle:',
    options: [
      'Undirected graphs only',
      'Graphs with negative edge weights, as long as there is no negative cycle reachable from the source',
      'Graphs with negative cycles, still producing a valid shortest path',
      'Graphs without a designated source vertex'
    ],
    answer: 1,
    explain: 'Bellman-Ford relaxes edges repeatedly rather than committing to a settled distance early, which lets it tolerate negative edges — but a reachable negative cycle still means no shortest path exists.'
  },
  {
    q: "In the worked Prim's trace on tinyEWG starting from vertex 0, edge 2-3 (weight 0.17) — one of the cheapest edges in the entire graph — isn't added until partway through. Why?",
    options: [
      'Prim’s ignores cheap edges to avoid ties',
      'Edge 2-3 only becomes eligible once vertex 2 (one of its endpoints) joins the tree — Prim’s only considers edges with exactly one endpoint already in the tree, not the globally cheapest edge overall',
      'It is a mistake in the trace; it should have been added first',
      'Because edge 2-3 creates a cycle initially'
    ],
    answer: 1,
    explain: "This illustrates the difference between Prim's (locally cheapest edge leaving the current tree) and Kruskal's (globally cheapest edge overall) — a globally cheap edge can still wait its turn in Prim's."
  }
];
