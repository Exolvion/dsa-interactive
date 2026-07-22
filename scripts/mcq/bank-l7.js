/* MCQ bank — Lecture 7: Search Algorithms 2 (BST, 2-3 Trees, LLRBT) */
window.MCQBank = window.MCQBank || {};
window.MCQBank.l7 = [
  {
    q: 'In tree terminology, what is the depth of the root, and what is the height of a leaf?',
    options: [
      'Depth of root = 1, height of leaf = 1',
      'Depth of root = 0, height of leaf = 0',
      'Depth of root = height of leaf = the size of the tree',
      'Depth and height are always equal for any node'
    ],
    answer: 1,
    explain: 'Depth counts downward from the root (root = 0); height counts upward from the leaves (leaf = 0) — the two measures start at opposite ends of the tree.'
  },
  {
    q: 'What is the defining structural property of a Binary Search Tree?',
    options: [
      'Every node has exactly two children',
      'The tree is perfectly balanced at every level',
      "For every node, all keys in its left subtree are smaller and all keys in its right subtree are larger — symmetric order",
      'Keys are stored in a sorted array at each node'
    ],
    answer: 2,
    explain: 'Symmetric order is the only structural invariant a BST guarantees — nothing about balance or child count.'
  },
  {
    q: 'Inserting the keys 10, 20, 30, 40, 50 (already sorted) one at a time into an empty BST produces what shape, and what search cost results?',
    options: [
      'A perfectly balanced tree, O(log N) search',
      'A degenerate "stick" of height N-1, giving O(N) search',
      'A valid 2-3 tree automatically',
      'An error, since BSTs reject sorted input'
    ],
    answer: 1,
    explain: 'Each new key is larger than all previous ones, so every insert goes right, producing a single chain — the classic BST worst case.'
  },
  {
    q: 'When deleting a BST node that has two children (Hibbard deletion), what replaces the deleted node?',
    options: [
      'Its left child directly',
      'An arbitrary leaf from the tree',
      'Its successor — the minimum key in its right subtree',
      'Its parent'
    ],
    answer: 2,
    explain: "The successor (min of the right subtree) is the only key that preserves symmetric order when substituted in — and it's guaranteed to have at most one child, so removing it from the right subtree is the easy case."
  },
  {
    q: 'What is the defining balance invariant of a 2-3 tree?',
    options: [
      'Every node has at most 2 children',
      'Every path from the root to a null link has the same length',
      'The root always holds exactly 3 keys',
      'Every node in the tree must be a 3-node'
    ],
    answer: 1,
    explain: 'Perfect balance in a 2-3 tree means every root-to-null path is the same length, regardless of the mix of 2-nodes and 3-nodes.'
  },
  {
    q: 'When a 3-node in a 2-3 tree receives a new key and temporarily becomes a 4-node, how is the overflow resolved?',
    options: [
      'The 4-node is deleted and reinserted at a leaf',
      'The middle key is pushed up to the parent, splitting the rest into two 2-nodes; overflow can propagate upward, and the tree only grows taller at the root',
      'The new key is simply rejected',
      'The tree is completely rebuilt from scratch'
    ],
    answer: 1,
    explain: '2-3 tree growth always happens at the root via this split-and-push-up mechanism, which is exactly why every leaf stays at the same depth.'
  },
  {
    q: 'In a Left-Leaning Red-Black Tree (LLRBT), what does a single left-leaning red link represent?',
    options: [
      'A deleted node pending cleanup',
      "Two nodes joined together to represent one of a 2-3 tree's 3-nodes",
      'A rotation that failed',
      'A node with no children'
    ],
    answer: 1,
    explain: 'An LLRBT is a 2-3 tree in disguise: a 3-node is represented as two ordinary BST nodes connected by a left-leaning red link.'
  },
  {
    q: 'Which of these is NOT one of the three defining conditions of an LLRBT?',
    options: [
      'No node has two red links connected to it',
      'Every root-to-null path has the same number of black links',
      'Red links lean left',
      'Every node must have exactly two red children'
    ],
    answer: 3,
    explain: "The real three conditions are: no node with two red links, perfect black-balance, and left-leaning red links. Requiring 'two red children' isn't one of them and would make every node a 4-node, which is forbidden."
  },
  {
    q: 'What is the worst-case search cost in a plain (unbalanced) BST versus a 2-3 tree or LLRBT?',
    options: [
      'Both are O(log N) worst case',
      'A BST worst case is O(N) (degenerate stick); 2-3 trees and LLRBTs guarantee O(log N) worst case',
      'BSTs are always faster because they have fewer node types',
      '2-3 trees are O(N) worst case, same as BSTs'
    ],
    answer: 1,
    explain: "Balancing (via 2-3 splits or LLRBT rotations) is exactly what removes the BST's O(N) worst case, bounding height at O(log N)."
  },
  {
    q: 'During an LLRBT insertion, on the way back up the tree, in what order are the three fix-up operations applied at each node?',
    options: [
      'Flip colors, then rotate left, then rotate right',
      'Rotate left if the right link is red; then rotate right if there are two red links in a row on the left; then flip colors if both children links are red',
      'Only rotate left is ever needed',
      "The order doesn't matter"
    ],
    answer: 1,
    explain: 'Applying the checks in this order — lean-right fix, then a doubled-left fix, then a temporary-4-node fix — correctly converts any local violation into a valid 2-3 tree shape as the recursion unwinds.'
  }
];
