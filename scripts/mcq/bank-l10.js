/* MCQ bank — Lecture 10: String Algorithms (Brute-Force Search, KMP) */
window.MCQBank = window.MCQBank || {};
window.MCQBank.l10 = [
  {
    q: 'What is the worst-case number of character comparisons for brute-force substring search of a length-M pattern in a length-N text?',
    options: ['O(N)', 'O(M + N)', '~MN', 'O(log N)'],
    answer: 2,
    explain: 'On repetitive text/pattern (e.g. text "AAAAAAAAAB", pattern "AAAB"), nearly every alignment matches M-1 characters before failing, giving close to M·N total comparisons.'
  },
  {
    q: 'What is the core inefficiency (the "backup problem") in brute-force substring search on a text stream?',
    options: [
      'It requires the pattern to be sorted first',
      "On a mismatch it must move the text pointer i back to i+1 and re-scan from there, requiring the ability to \"un-read\" characters already seen",
      'It cannot detect a match at all',
      'It requires random access to the pattern only'
    ],
    answer: 1,
    explain: 'Because brute force restarts each new alignment from scratch, it effectively re-reads text characters it already examined — a problem for streaming input that can’t be buffered and replayed.'
  },
  {
    q: 'In KMP\'s DFA, what does "state j" represent while processing the text?',
    options: [
      'The index in the text currently being read',
      'The number of pattern characters matched so far — progress toward the accepting state',
      'The number of mismatches encountered',
      'The size of the alphabet'
    ],
    answer: 1,
    explain: 'The DFA state tracks how much of the pattern is currently matched; reaching state M (the pattern length) means a full match has occurred.'
  },
  {
    q: "In KMP's search phase (j = dfa[txt[i]][j]; i++), how does the text pointer i behave?",
    options: [
      'It can move backward on a mismatch, just like brute force',
      'It only ever moves forward — one step per character read, regardless of match or mismatch',
      'It resets to 0 after every mismatch',
      'It skips ahead by M positions on a mismatch'
    ],
    answer: 1,
    explain: "This is KMP's key advantage: i is monotonically increasing, so it never re-reads a text character — only the DFA state j can drop back on a mismatch."
  },
  {
    q: "For pattern \"ABABAC\", what are dfa['A'][0] and dfa['C'][5] in the standard DFA construction?",
    options: [
      "dfa['A'][0] = 0 and dfa['C'][5] = 0",
      "dfa['A'][0] = 1 (a match advances to state 1) and dfa['C'][5] = 6 (the accepting state)",
      "dfa['A'][0] = 5 and dfa['C'][5] = 1",
      'Both are undefined until runtime'
    ],
    answer: 1,
    explain: 'Match transitions always advance one state (dfa[pat[j]][j] = j+1), so matching \'A\' at state 0 goes to state 1, and matching the final \'C\' at state 5 reaches the accepting state 6.'
  },
  {
    q: "What is the general rule for a \"match\" transition in the DFA, dfa[pat[j]][j]?",
    options: [
      'It is always 0',
      'It always equals j+1 — matching the next expected pattern character advances one state',
      'It equals M regardless of j',
      'It depends on the text, not the pattern'
    ],
    answer: 1,
    explain: 'Every diagonal entry dfa[pat[j]][j] is j+1 by definition — a correct match always progresses the match count by exactly one.'
  },
  {
    q: 'What does the "restart state" X represent during DFA construction?',
    options: [
      'The state reached by reading the whole pattern from scratch',
      "The state you'd be in if matching restarted from the empty string at the mismatch point — i.e. how much of the pattern's own prefix overlaps its current position, used to fill in the mismatch transitions",
      'A fixed constant equal to M/2',
      'The alphabet size R'
    ],
    answer: 1,
    explain: 'X captures self-overlap in the pattern (its longest prefix that is also a suffix up to that point), letting the DFA "fall back" intelligently instead of restarting at state 0 on every mismatch.'
  },
  {
    q: "What is the total time complexity to build the DFA and then run KMP's search?",
    options: [
      'O(M·N)',
      'O(R·M) to build the DFA plus O(N) to search, an overall O(R·M + N), with the search phase alone bounded by O(M+N) character accesses',
      'O(log(M·N))',
      'O(N²)'
    ],
    answer: 1,
    explain: 'Building the DFA costs O(R·M) (R = alphabet size, M = pattern length); the search phase then reads each of the N text characters once — giving KMP its linear-time guarantee.'
  },
  {
    q: 'Searching for pattern "AAAB" in text "AAAAAAAAAAAAAAAB" (fifteen A\'s then a B), roughly how do brute force and KMP compare in total character comparisons?',
    options: [
      'Brute force ~52, KMP ~16 — KMP is far cheaper because it never re-compares characters it has already matched',
      'Both are exactly the same, ~16',
      'Brute force is cheaper because the pattern is short',
      'KMP requires more comparisons because it must build the DFA first'
    ],
    answer: 0,
    explain: 'Brute force re-scans "AAA" at every one of the 13 alignments before failing on the B (≈52 compares); KMP\'s DFA remembers the overlap and only reads each text character once (≈16 total).'
  },
  {
    q: 'Which statement correctly compares Brute-Force search to KMP?',
    options: [
      'Brute force guarantees O(M+N); KMP guarantees ~MN',
      'Brute force can require ~MN compares and must back up the text pointer; KMP guarantees O(M+N) compares and never backs up the text pointer',
      'Both require preprocessing the pattern into a DFA',
      'KMP is only faster for single-character alphabets'
    ],
    answer: 1,
    explain: "This is the headline trade-off from the lecture: KMP trades a one-time O(R·M) DFA build for a linear, backup-free search, guaranteeing O(M+N) overall versus brute force's ~MN worst case."
  }
];
