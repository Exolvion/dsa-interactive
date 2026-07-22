/* Diagram-answer bank — Lecture 10: String Algorithms (Brute Force, KMP) */
window.DiagramBank = window.DiagramBank || {};
window.DiagramBank.l10 = [
  {
    kind: 'row',
    prompt: "Brute force aligns pattern \"AAAB\" at i=0 against text \"AAAAAAAAAAAAAAAB\" (fifteen A's then a B). Click the text index where the FIRST mismatch occurs.",
    cells: 'AAAAAAAAAAAAAAAB'.split('').map(function (ch, i) { return { id: i, label: ch }; }),
    correct: 3,
    explain: "Pattern 'AAAB' matches the text's A's for indices 0-2 but fails at index 3, since the text has 'A' there while the pattern needs 'B' at that position — this partial-match-then-fail is what makes brute force costly on repetitive text."
  },
  {
    kind: 'row',
    prompt: "Pattern \"ABABAC\" has M=6 characters, so its KMP DFA has states 0 through 6. Click the box representing the ACCEPTING state.",
    cells: [0, 1, 2, 3, 4, 5, 6].map(function (n) { return { id: n, label: String(n) }; }),
    correct: 6,
    explain: "The accepting state is always state M (here, 6) — reached only once the full pattern 'ABABAC' has matched."
  },
  {
    kind: 'row',
    prompt: "Searching for pattern \"ABABAC\" in text \"BCBAABACAABABACAA\" with KMP, a match is found starting at index 9 (text[9..14] = \"ABABAC\"). Click the text character where the match BEGINS.",
    cells: 'BCBAABACAABABACAA'.split('').map(function (ch, i) { return { id: i, label: ch }; }),
    correct: 9,
    explain: 'text[9..14] reads "ABABAC", exactly matching the pattern — the match position is i − M + 1 = 14 − 6 + 1 = 9.'
  },
  {
    kind: 'row',
    prompt: "Pattern \"AAAB\" DFA: dfa['A'][j] = 1, 2, 3, 3 for j = 0..3. In state j=2 (meaning \"AA\" has matched so far), click the state you move to on reading another 'A'.",
    cells: [0, 1, 2, 3, 4].map(function (n) { return { id: n, label: 'state ' + n }; }),
    correct: 3,
    explain: "dfa['A'][2] = 3 — reading a third 'A' after already matching \"AA\" advances to state 3 (matched \"AAA\"), one step closer to the full pattern."
  },
  {
    kind: 'row',
    prompt: "Brute force just failed comparing pattern \"AAAB\" at alignment i=0 against text \"AAAAAAAAAAAAAAAB\" (mismatch at index 3). It now backs up and restarts the next alignment one position to the right. Click the text index where the NEXT alignment begins.",
    cells: 'AAAAAAAAAAAAAAAB'.split('').map(function (ch, i) { return { id: i, label: ch }; }),
    correct: 1,
    explain: "Having failed at alignment i=0, brute force shifts the whole pattern one position right and restarts comparisons from j=0 at text index i=1 — re-reading text characters it already looked at, which is the \"backup\" problem KMP avoids."
  }
];
