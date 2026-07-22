/* Diagram-answer bank — Lecture 6: Search Algorithms 1 (Hash Tables)
   kind:'row' questions render a row of clickable slots; `correct` is a cell id. */
window.DiagramBank = window.DiagramBank || {};
window.DiagramBank.l6 = [
  {
    kind: 'row',
    prompt: "Linear probing, m=7, h(k) = k mod 7. Keys 21 and 14 have already been inserted as shown (21 landed at slot 0; 14 collided at slot 0 and moved on). Key 8 hashes to slot 1 (8 mod 7 = 1), which is occupied. Click the slot where 8 lands.",
    cells: [
      { id: 0, label: '21', filled: true }, { id: 1, label: '14', filled: true },
      { id: 2, label: '' }, { id: 3, label: '' }, { id: 4, label: '' }, { id: 5, label: '' }, { id: 6, label: '' }
    ],
    correct: 2,
    explain: 'Linear probing steps to the next slot in sequence: slot 1 is taken, so it tries slot 2 (1+1), which is free.'
  },
  {
    kind: 'row',
    prompt: "Quadratic probing, m=7, h(k) = k mod 7. Keys 76 and 40 are already placed (76 at slot 6, 40 at slot 5). Key 48 also hashes to slot 6 (48 mod 7 = 6), which is taken. Click the slot where 48 lands.",
    cells: [
      { id: 0, label: '' }, { id: 1, label: '' }, { id: 2, label: '' }, { id: 3, label: '' },
      { id: 4, label: '' }, { id: 5, label: '40', filled: true }, { id: 6, label: '76', filled: true }
    ],
    correct: 0,
    explain: 'Quadratic probing tries (6 + 1²) mod 7 = 0 next, which is free — no further probes needed.'
  },
  {
    kind: 'row',
    prompt: "Double hashing, m=7, h1(k) = k mod 7, h2(k) = (k mod 5) + 1. Keys 93, 40, and 76 are already placed (93 at slot 2, 40 at slot 5, 76 at slot 6). Key 47 hashes to slot 5 (47 mod 7 = 5), which is taken. h2(47) = (47 mod 5) + 1 = 3. Click the slot where 47 lands.",
    cells: [
      { id: 0, label: '' }, { id: 1, label: '' }, { id: 2, label: '93', filled: true }, { id: 3, label: '' },
      { id: 4, label: '' }, { id: 5, label: '40', filled: true }, { id: 6, label: '76', filled: true }
    ],
    correct: 1,
    explain: 'The probe sequence is h1=5, then (5 + 3) mod 7 = 1 — slot 1 is empty, so 47 lands there.'
  },
  {
    kind: 'row',
    prompt: "Separate chaining with h(key) = ASCII(key) mod 5. Click the bucket (0-4) that key 'M' (ASCII 77) hashes to.",
    cells: [
      { id: 0, label: '0' }, { id: 1, label: '1' }, { id: 2, label: '2' }, { id: 3, label: '3' }, { id: 4, label: '4' }
    ],
    correct: 2,
    explain: "ASCII('M') = 77, and 77 mod 5 = 2."
  },
  {
    kind: 'row',
    prompt: "Linear probing, m=7. Slots 3, 4, and 5 are already filled (a cluster). A new key X hashes to slot 3 (h(X) = 3). Click the slot X lands in.",
    cells: [
      { id: 0, label: '' }, { id: 1, label: '' }, { id: 2, label: '' }, { id: 3, label: 'A', filled: true },
      { id: 4, label: 'B', filled: true }, { id: 5, label: 'C', filled: true }, { id: 6, label: '' }
    ],
    correct: 6,
    explain: "Linear probing must step past the entire cluster — 3 (taken), 4 (taken), 5 (taken) — before reaching the first free slot at 6. This clustering is linear probing's key weakness."
  }
];
