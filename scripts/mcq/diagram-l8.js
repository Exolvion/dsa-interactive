/* Diagram-answer bank — Lecture 8: Graph Algorithms 1 (DFS, BFS, Topological Sort) */
window.DiagramBank = window.DiagramBank || {};
window.DiagramBank.l8 = [
  {
    kind: 'graph',
    prompt: 'Graph with vertices 0-5 and edges 0-1, 0-2, 0-5, 1-2, 2-3, 2-4, 3-4, 3-5. Starting DFS from vertex 0 (visiting neighbours in ascending order), click the vertex visited 2nd (right after 0).',
    targetType: 'node',
    nodes: [
      { id: '0', x: 160, y: 20, label: '0' }, { id: '1', x: 60, y: 100, label: '1' },
      { id: '2', x: 160, y: 100, label: '2' }, { id: '5', x: 260, y: 100, label: '5' },
      { id: '3', x: 110, y: 180, label: '3' }, { id: '4', x: 210, y: 180, label: '4' }
    ],
    edges: [
      { from: '0', to: '1' }, { from: '0', to: '2' }, { from: '0', to: '5' }, { from: '1', to: '2' },
      { from: '2', to: '3' }, { from: '2', to: '4' }, { from: '3', to: '4' }, { from: '3', to: '5' }
    ],
    correct: '1',
    explain: "0's neighbours are 1, 2, and 5 — DFS greedily visits the smallest unvisited one first, so vertex 1 is visited right after 0."
  },
  {
    kind: 'graph',
    prompt: 'Same graph, same DFS from vertex 0. The full visit order (ascending-neighbour tie-break) is 0, 1, 2, 3, 4, 5. Click the vertex visited LAST.',
    targetType: 'node',
    nodes: [
      { id: '0', x: 160, y: 20, label: '0' }, { id: '1', x: 60, y: 100, label: '1' },
      { id: '2', x: 160, y: 100, label: '2' }, { id: '5', x: 260, y: 100, label: '5' },
      { id: '3', x: 110, y: 180, label: '3' }, { id: '4', x: 210, y: 180, label: '4' }
    ],
    edges: [
      { from: '0', to: '1' }, { from: '0', to: '2' }, { from: '0', to: '5' }, { from: '1', to: '2' },
      { from: '2', to: '3' }, { from: '2', to: '4' }, { from: '3', to: '4' }, { from: '3', to: '5' }
    ],
    correct: '5',
    explain: 'Even though 0-5 is a direct edge, DFS commits to the 0→1→2→3→4 chain first (ascending neighbour order) and only backtracks to reach 5 afterward, via the 3-5 edge.'
  },
  {
    kind: 'graph',
    prompt: 'Same graph. Running BFS from vertex 0, all of 1, 2, and 5 are discovered in the first ring (distance 1). Click the distance-1 vertex reached specifically via the edge 0-5.',
    targetType: 'node',
    nodes: [
      { id: '0', x: 160, y: 20, label: '0' }, { id: '1', x: 60, y: 100, label: '1' },
      { id: '2', x: 160, y: 100, label: '2' }, { id: '5', x: 260, y: 100, label: '5' },
      { id: '3', x: 110, y: 180, label: '3' }, { id: '4', x: 210, y: 180, label: '4' }
    ],
    edges: [
      { from: '0', to: '1' }, { from: '0', to: '2' }, { from: '0', to: '5' }, { from: '1', to: '2' },
      { from: '2', to: '3' }, { from: '2', to: '4' }, { from: '3', to: '4' }, { from: '3', to: '5' }
    ],
    correct: '5',
    explain: '0’s neighbours 1, 2, and 5 are all discovered in the first BFS ring; vertex 5 specifically has edgeTo[5] = 0 via the direct 0-5 edge.'
  },
  {
    kind: 'graph',
    prompt: 'Same graph. In BFS from vertex 0, vertex 3 is first discovered while processing vertex 2’s neighbours (edgeTo[3] = 2). Click the edge BFS uses to first reach vertex 3.',
    targetType: 'edge',
    nodes: [
      { id: '0', x: 160, y: 20, label: '0' }, { id: '1', x: 60, y: 100, label: '1' },
      { id: '2', x: 160, y: 100, label: '2' }, { id: '5', x: 260, y: 100, label: '5' },
      { id: '3', x: 110, y: 180, label: '3' }, { id: '4', x: 210, y: 180, label: '4' }
    ],
    edges: [
      { from: '0', to: '1' }, { from: '0', to: '2' }, { from: '0', to: '5' }, { from: '1', to: '2' },
      { from: '2', to: '3' }, { from: '2', to: '4' }, { from: '3', to: '4' }, { from: '3', to: '5' }
    ],
    correct: '2-3',
    explain: 'Vertex 2 is processed before vertex 5 in the BFS queue, so 3 is discovered via the 2-3 edge — even though 3-5 also connects to 3, 5 hasn’t reached it yet at that point.'
  },
  {
    kind: 'graph',
    prompt: 'A DAG with edges 0→1, 0→2, 1→3, 2→3, 3→4. Topological sort runs DFS and reverses the post-order (finish order) 4, 3, 1, 2, 0. Click the vertex that finishes DFS FIRST.',
    targetType: 'node',
    directed: true,
    nodes: [
      { id: '0', x: 50, y: 100, label: '0' }, { id: '1', x: 150, y: 40, label: '1' },
      { id: '2', x: 150, y: 160, label: '2' }, { id: '3', x: 250, y: 100, label: '3' },
      { id: '4', x: 350, y: 100, label: '4' }
    ],
    edges: [
      { from: '0', to: '1' }, { from: '0', to: '2' }, { from: '1', to: '3' },
      { from: '2', to: '3' }, { from: '3', to: '4' }
    ],
    correct: '4',
    explain: 'Vertex 4 has no outgoing edges, so its DFS call returns (finishes) immediately — it is always first in post-order, which is exactly why it ends up LAST once the order is reversed for the topological sort.'
  }
];
