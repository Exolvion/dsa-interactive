/* MCQ bank — Lecture 8: Graph Algorithms 1 (DFS, BFS, Topological Sort) */
window.MCQBank = window.MCQBank || {};
window.MCQBank.l8 = [
  {
    q: 'For a sparse graph, which representation is preferred, and why?',
    options: [
      'Adjacency matrix, because edge lookup is O(1)',
      'Adjacency list, because iterating a vertex’s neighbours costs O(degree(v)) instead of O(V), and space is O(V+E) instead of O(V²)',
      'Adjacency matrix, because it uses less memory for sparse graphs',
      'Neither — sparse graphs require a hash set of all edges'
    ],
    answer: 1,
    explain: 'Adjacency lists match how graph algorithms actually work — they iterate over neighbours — and avoid the wasted O(V²) space a mostly-empty matrix would need.'
  },
  {
    q: "What data structure drives DFS's traversal order, and what analogy is used to describe it?",
    options: [
      'A queue (FIFO), like ripples spreading from a dropped stone',
      "A stack, via the recursive call stack — like Tremaux's \"ball of string\" maze exploration",
      'A priority queue ordered by edge weight',
      'A union-find structure'
    ],
    answer: 1,
    explain: 'DFS recurses into an unmarked neighbour before backtracking, exactly like unspooling string down one maze corridor at a time and only retreating at a dead end.'
  },
  {
    q: 'What does edgeTo[w] represent after running DFS or BFS from source s?',
    options: [
      'The total distance from s to w',
      'The edge v–w used to first reach w, forming a parent-link tree rooted at s',
      'The degree of vertex w',
      'Whether w is a leaf'
    ],
    answer: 1,
    explain: "edgeTo[] is a parent-pointer tree — following it backward from any reachable w recovers the path back to s in time proportional to the path's length."
  },
  {
    q: 'Why does BFS use a queue rather than a stack?',
    options: [
      'Queues are faster to implement',
      'A queue processes vertices in increasing-distance "rings" from the source, which is what guarantees BFS finds shortest (fewest-edge) paths',
      'It doesn’t matter — either data structure gives an identical traversal',
      "Stacks can't store visited markers"
    ],
    answer: 1,
    explain: 'FIFO order means every vertex at distance k is dequeued (and its neighbours at distance k+1 discovered) before any vertex at distance k+1 is processed — that ring-by-ring order is what makes BFS distances correct.'
  },
  {
    q: 'Which statement correctly contrasts DFS and BFS?',
    options: [
      'DFS explores by distance rings; BFS dead-ends as deep as possible first',
      'Both are identical, just implemented with different data structures for style',
      'DFS explores as deep as possible before backtracking; BFS explores outward in order of increasing distance from the source',
      'DFS requires a directed graph; BFS requires an undirected graph'
    ],
    answer: 2,
    explain: 'This is the fundamental behavioral difference: depth-first vs. breadth-first — same O(V+E) cost, different trees, different guarantees (BFS gives shortest unweighted paths, DFS does not).'
  },
  {
    q: 'A BST’s in-order traversal produces 17, 25, 34, 50, 62, 76, 94. What does this tell you?',
    options: [
      'The tree is unbalanced',
      'In-order traversal of any BST always visits keys in ascending sorted order — this confirms the BST property held',
      'This is actually a pre-order traversal',
      'The root of the tree must be 17'
    ],
    answer: 1,
    explain: 'In-order (left, root, right) always yields sorted output for a valid BST, since every node is visited strictly between its smaller left subtree and larger right subtree.'
  },
  {
    q: 'What is required for a topological order of a digraph to exist?',
    options: [
      'The graph must be undirected',
      'The graph must be a DAG (directed acyclic graph) — it must contain no directed cycle',
      'The graph must be connected',
      'All vertices must have the same out-degree'
    ],
    answer: 1,
    explain: 'A directed cycle makes it impossible to linearly order the vertices so every edge points forward — a topological order exists if and only if the graph is a DAG.'
  },
  {
    q: 'How is topological order computed from a DFS traversal?',
    options: [
      'Take the order in which vertices are first visited (pre-order)',
      "Take the order in which vertices finish (post-order), then reverse it",
      "Sort vertices by their final edgeTo[] value",
      'Take the BFS visiting order instead'
    ],
    answer: 1,
    explain: 'Recording each vertex when its DFS call finishes, then reversing that finish order, guarantees every edge points from an earlier vertex to a later one.'
  },
  {
    q: 'What is the running time of DFS, BFS, and topological sort on a graph represented with adjacency lists?',
    options: ['O(V²) always', 'O(V+E) for all three', 'O(E log V)', 'O(V·E)'],
    answer: 1,
    explain: 'Each vertex is marked once and each edge examined a constant number of times, giving linear O(V+E) time for all three algorithms on an adjacency-list representation.'
  },
  {
    q: 'Why is it incorrect to say "DFS finds the shortest path from s to v"?',
    options: [
      'DFS doesn’t build an edgeTo[] tree at all',
      'DFS only guarantees finding *a* path to v, not the fewest-edge path — that guarantee belongs to BFS',
      'DFS can’t reach every connected vertex',
      'DFS only works on weighted graphs'
    ],
    answer: 1,
    explain: "DFS's edgeTo[] tree connects s to every reachable vertex, but because DFS dives deep rather than expanding by distance, the path it records is not guaranteed to have the fewest edges."
  }
];
