/* MCQ bank — Lecture 6: Search Algorithms 1 (Linear Search, Binary Search, Hash Tables) */
window.MCQBank = window.MCQBank || {};
window.MCQBank.l6 = [
  {
    q: 'In a symbol table implemented as an unordered linked list, why is put(key, value) O(N) rather than O(1)?',
    options: [
      'Because the list must be kept sorted after every insert',
      'Because put() must scan the whole list first to check for an existing duplicate key before inserting',
      'Because hashing is required before insertion',
      "Because linked lists don't support insertion at the front"
    ],
    answer: 1,
    explain: 'A symbol table overwrites duplicate keys, so put() must scan for a matching key before deciding whether to overwrite or insert a new node — the scan is what makes it O(N), same cost as get().'
  },
  {
    q: 'What is rank(k) in the context of binary search over a sorted array?',
    options: [
      "The hash value of k",
      'The number of probes needed to find k',
      "The number of keys strictly less than k — k's index if present, else its insertion point",
      'The depth of k in a BST'
    ],
    answer: 2,
    explain: 'rank(k) counts keys smaller than k, which doubles as the insertion point when k is absent from the array.'
  },
  {
    q: 'Why should the table size m for division-method hashing (h(k) = k mod m) avoid being a power of 2?',
    options: [
      'Because power-of-2 sizes require more memory',
      'Because k mod 2^p only depends on the low p bits of k, discarding the high-order bits and worsening collisions',
      'Because modulo is undefined for powers of 2',
      'Because separate chaining requires m to be odd'
    ],
    answer: 1,
    explain: "k mod 2^p keeps only k's last p bits, so any variation in the high bits of k is thrown away — a prime m spreads keys using all their bits instead."
  },
  {
    q: "In the classic \"SEARCHEXAMPLE\" separate-chaining trace (h(key) = ASCII(key) mod 5, keys inserted with their string-position index as value), key 'E' appears three times at positions 1, 6, and 12. What value ends up stored for 'E'?",
    options: ['1', '6', '12', 'All three values are stored as separate chain nodes'],
    answer: 2,
    explain: "put() always overwrites on a duplicate key, so only the last insert's value (12) survives — chaining doesn't create three separate 'E' nodes."
  },
  {
    q: 'Quadratic probing resolves a collision at index i by trying which probe sequence?',
    options: [
      'i+1, i+2, i+3, …',
      'i+1, i+4, i+9, … i.e. (i + j²) mod m',
      'h1(k), h1(k)+h2(k), h1(k)+2·h2(k), …',
      'A random sequence of empty slots'
    ],
    answer: 1,
    explain: 'Quadratic probing steps by increasing squares (1, 4, 9, …) rather than by 1 each time, which spreads probes out faster and reduces clustering compared to linear probing.'
  },
  {
    q: 'For double hashing with probe sequence h1(k) + j·h2(k), why must h2(k) never equal 0?',
    options: [
      'It would make the hash function non-deterministic',
      'A zero step size means the probe sequence never advances, so it revisits the same full slot forever',
      'It would cause integer overflow',
      'It only matters when m is prime'
    ],
    answer: 1,
    explain: 'If h2(k) = 0, every probe step adds 0, so the sequence gets stuck re-checking the same occupied slot and can never find an open one.'
  },
  {
    q: "In the worked quadratic-probing trace inserting 76, 40, 48, 5, 55 into a table of size m=7 with h(k) = k mod 7, where does 48 land, and why?",
    options: [
      'Index 6 — same slot as 76, since h(48) also equals 6, and no collision handling is needed',
      'Index 6 is already taken by 76, so quadratic probing tries (6 + 1²) mod 7 = 0, landing at index 0',
      'Index 5, since 48 collides with 40',
      'Table overflow — 48 cannot be inserted'
    ],
    answer: 1,
    explain: 'h(48) = 48 mod 7 = 6, which 76 already occupies. The next quadratic probe is (6 + 1) mod 7 = 0, an empty slot.'
  },
  {
    q: "For a hash table using separate chaining, the load factor N/m is used to decide when to resize. Under the amortized doubling policy discussed, when should the table size be doubled?",
    options: ['When N/m ≥ 8', 'When N/m ≥ 1', 'When N/m ≥ 0.5', 'Chaining never needs to be resized'],
    answer: 0,
    explain: 'The table doubles once the average chain length (N/m) reaches 8, and halves once it drops to 2, keeping chain lengths bounded on average.'
  },
  {
    q: 'Which statement correctly compares separate chaining and open addressing?',
    options: [
      "Open addressing needs extra memory for linked nodes, and chaining doesn't",
      'Chaining degrades more gracefully with a poor hash function; open addressing needs its load factor kept well below 1 and struggles with deletion, which requires tombstones',
      'Deletion is harder in chaining than in open addressing',
      'Open addressing can store more keys than the table has slots (m < N)'
    ],
    answer: 1,
    explain: "Open addressing stores everything directly in the array (so m > N is required and clustering hurts it badly), while chaining's linked buckets tolerate a worse hash function and delete with a simple unlink instead of tombstones."
  },
  {
    q: 'Which statement correctly compares an unordered list and a sorted array (searched via binary search) as symbol table implementations?',
    options: [
      'A sorted array gives O(log N) search but O(N) insert (shifting elements); an unordered list gives O(N) for both search and insert',
      'Both give O(log N) search and insert',
      'A sorted array is O(N) search; an unordered list is O(log N) search',
      'Both are O(1) on average'
    ],
    answer: 0,
    explain: 'Binary search only speeds up lookups — keeping the array sorted after an insert still means shifting every larger key, so insert stays O(N) even though search is O(log N).'
  }
];
