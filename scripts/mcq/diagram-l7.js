/* Diagram-answer bank — Lecture 7: Search Algorithms 2 (BST, LLRBT)
   kind:'graph' questions render clickable nodes/edges; `correct` is a node id
   (targetType:'node') or an edge id "from-to" (targetType:'edge'). */
window.DiagramBank = window.DiagramBank || {};
window.DiagramBank.l7 = [
  {
    kind: 'graph',
    prompt: 'In this BST, click the node where key 40 would be inserted as a new child (its parent-to-be).',
    targetType: 'node',
    nodes: [
      { id: '50', x: 170, y: 30, label: '50' },
      { id: '25', x: 90, y: 100, label: '25' },
      { id: '75', x: 250, y: 100, label: '75' },
      { id: '10', x: 50, y: 170, label: '10' },
      { id: '30', x: 130, y: 170, label: '30' }
    ],
    edges: [{ from: '50', to: '25' }, { from: '50', to: '75' }, { from: '25', to: '10' }, { from: '25', to: '30' }],
    correct: '30',
    explain: '40 < 50 → go left to 25. 40 > 25 → go right to 30. 30 has no right child, so 40 would be inserted as 30’s right child.'
  },
  {
    kind: 'graph',
    prompt: 'This BST was built by inserting 30, 20, 40, 10, 25, 35, 50 in that order. Click the node that Hibbard deletion would use to replace 30 if it were deleted (its successor).',
    targetType: 'node',
    nodes: [
      { id: '30', x: 170, y: 30, label: '30' },
      { id: '20', x: 90, y: 100, label: '20' },
      { id: '40', x: 250, y: 100, label: '40' },
      { id: '10', x: 50, y: 170, label: '10' },
      { id: '25', x: 130, y: 170, label: '25' },
      { id: '35', x: 210, y: 170, label: '35' },
      { id: '50', x: 290, y: 170, label: '50' }
    ],
    edges: [
      { from: '30', to: '20' }, { from: '30', to: '40' }, { from: '20', to: '10' },
      { from: '20', to: '25' }, { from: '40', to: '35' }, { from: '40', to: '50' }
    ],
    correct: '35',
    explain: 'The successor is the minimum key in the right subtree {40, 35, 50}: following left-children from 40 reaches 35, which has no left child.'
  },
  {
    kind: 'graph',
    prompt: 'In this BST, click the node holding the minimum key (follow left children from the root until you can’t go further).',
    targetType: 'node',
    nodes: [
      { id: '50', x: 170, y: 30, label: '50' },
      { id: '25', x: 90, y: 100, label: '25' },
      { id: '75', x: 250, y: 100, label: '75' },
      { id: '10', x: 50, y: 170, label: '10' },
      { id: '30', x: 130, y: 170, label: '30' }
    ],
    edges: [{ from: '50', to: '25' }, { from: '50', to: '75' }, { from: '25', to: '10' }, { from: '25', to: '30' }],
    correct: '10',
    explain: 'From the root, repeatedly following the left child reaches 25 then 10, which has no left child — the minimum.'
  },
  {
    kind: 'graph',
    prompt: 'This LLRBT fragment shows node M with two children. The red link represents two BST nodes acting as one 2-3 tree 3-node. Click the red (left-leaning) link.',
    targetType: 'edge',
    nodes: [
      { id: 'M', x: 150, y: 40, label: 'M' },
      { id: 'L', x: 70, y: 130, label: 'L' },
      { id: 'R', x: 230, y: 130, label: 'R' }
    ],
    edges: [{ from: 'M', to: 'L', cls: 'red' }, { from: 'M', to: 'R', cls: 'black' }],
    correct: 'M-L',
    explain: 'M–L is drawn as a red, left-leaning link — M and L together represent one 3-node. M–R is an ordinary black link.'
  },
  {
    kind: 'graph',
    prompt: 'In this fragment, the red link between A and its RIGHT child B leans right — not allowed in an LLRBT (rule: red links must lean left). Click the link that violates this rule and needs a rotate-left fix.',
    targetType: 'edge',
    nodes: [
      { id: 'A', x: 90, y: 40, label: 'A' },
      { id: 'B', x: 230, y: 130, label: 'B' }
    ],
    edges: [{ from: 'A', to: 'B', cls: 'red' }],
    correct: 'A-B',
    explain: 'A–B is red but leans right (B is a right child) — the unifying LLRBT fix-up rotates this link left whenever a right-leaning red link is found.'
  }
];
