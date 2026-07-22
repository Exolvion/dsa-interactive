/* ==========================================================================
   Lecture 7 — Search Algorithms 2: Binary Search Trees & Balanced Search Trees
   Sections: BST (insert + Hibbard deletion), 2-3 Tree, Left-Leaning Red-Black Tree.
   Follows the lecture6.js conventions: VizKit.createStepVisualizer, tabs,
   input-row + rebuild button, full-snapshot frames (free step-back).
   No other files are touched by this module — all styling for the bespoke
   2-3 tree boxes and LLRBT red links is done with inline `style` attrs that
   reference the existing CSS custom properties (var(--accent) etc.), and all
   tree/node states reuse existing g-node-circle / dot classes already defined
   in main.css.
   ========================================================================== */
(function () {
  'use strict';
  const V = window.VizKit;

  // ------------------------------------------------------------ helpers ---
  // Parses a comma-separated sequence. If every token is numeric, returns
  // numbers (for the BST's default numeric trace); otherwise returns
  // upper-cased strings (for the letter-keyed 2-3 tree / LLRBT traces).
  function parseSeq(str) {
    const toks = str.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    const allNum = toks.length > 0 && toks.every(function (t) { return t !== '' && !isNaN(Number(t)); });
    return allNum ? toks.map(Number) : toks.map(function (t) { return t.toUpperCase(); });
  }

  // Deep-clones a binary tree node {key,left,right[,red]} for independent
  // frame snapshots (BST + LLRBT share this shape; `red` is undefined for BST).
  function cloneTree(node) {
    if (!node) return null;
    return { key: node.key, red: node.red, left: cloneTree(node.left), right: cloneTree(node.right) };
  }

  // In-order x position (spacing apart), depth-based y. Works for BST + LLRBT.
  function layoutBST(root) {
    const nodes = [], edges = [];
    let counter = 0;
    function walk(node, depth) {
      if (!node) return;
      walk(node.left, depth + 1);
      const x = 46 + counter * 62;
      const y = 40 + depth * 68;
      counter++;
      nodes.push({ id: String(node.key), x: x, y: y, label: String(node.key), cls: '' });
      if (node.left) edges.push({ from: String(node.key), to: String(node.left.key), redLink: !!node.left.red });
      if (node.right) edges.push({ from: String(node.key), to: String(node.right.key), redLink: !!node.right.red });
      walk(node.right, depth + 1);
    }
    walk(root, 0);
    return { nodes: nodes, edges: edges, count: counter };
  }

  // Renders a BST/LLRBT frame: node.cls set for current/frontier highlight,
  // red-black links get an inline accent-colored stroke (no CSS file edits).
  function renderTreeGraph(container, root, currentKey, frontierKey) {
    V.clear(container);
    if (!root) {
      container.appendChild(V.el('div', { style: 'color:var(--text-dim);font-family:var(--mono);padding:24px;' }, 'Empty tree'));
      return;
    }
    const layout = layoutBST(root);
    layout.nodes.forEach(function (n) {
      if (currentKey !== null && currentKey !== undefined && String(n.id) === String(currentKey)) n.cls = 'current';
      else if (frontierKey !== null && frontierKey !== undefined && String(n.id) === String(frontierKey)) n.cls = 'frontier';
    });
    let maxY = 40;
    layout.nodes.forEach(function (n) { if (n.y > maxY) maxY = n.y; });
    const w = Math.max(280, layout.count * 62 + 60);
    const h = maxY + 66;
    const svg = V.renderGraphSVG(container, { nodes: layout.nodes, edges: layout.edges }, { width: w, height: h, nodeR: 17 });
    const lines = svg.querySelectorAll('line');
    layout.edges.forEach(function (e, i) {
      if (e.redLink && lines[i]) { lines[i].style.stroke = 'var(--accent)'; lines[i].style.strokeWidth = '3px'; }
    });
  }

  // ============================================================ BST ======
  function buildTreeFromSeq(keys) {
    let root = null;
    keys.forEach(function (k) {
      if (root === null) { root = { key: k, left: null, right: null }; return; }
      let node = root;
      while (true) {
        if (k < node.key) {
          if (node.left === null) { node.left = { key: k, left: null, right: null }; break; }
          node = node.left;
        } else if (k > node.key) {
          if (node.right === null) { node.right = { key: k, left: null, right: null }; break; }
          node = node.right;
        } else { break; }
      }
    });
    return root;
  }

  function bstInsertFrames(keys) {
    const frames = [];
    let root = null;
    function snap(currentKey, frontierKey, note, code) {
      frames.push({ tree: cloneTree(root), currentKey: currentKey, frontierKey: frontierKey, note: note, code: code });
    }
    snap(null, null, 'Empty tree.', -1);
    keys.forEach(function (k) {
      if (root === null) {
        root = { key: k, left: null, right: null };
        snap(null, k, 'Insert ' + k + ': tree is empty &rarr; ' + k + ' becomes the root.', 7);
        return;
      }
      let node = root;
      while (true) {
        if (k < node.key) {
          snap(node.key, null, 'Insert ' + k + ': ' + k + ' &lt; ' + node.key + ' &rarr; go left.', 8);
          if (node.left === null) {
            node.left = { key: k, left: null, right: null };
            snap(node.key, k, 'No left child of ' + node.key + ' &rarr; insert ' + k + ' here.', 7);
            break;
          }
          node = node.left;
        } else if (k > node.key) {
          snap(node.key, null, 'Insert ' + k + ': ' + k + ' &gt; ' + node.key + ' &rarr; go right.', 9);
          if (node.right === null) {
            node.right = { key: k, left: null, right: null };
            snap(node.key, k, 'No right child of ' + node.key + ' &rarr; insert ' + k + ' here.', 7);
            break;
          }
          node = node.right;
        } else {
          snap(node.key, null, k + ' already exists &rarr; overwrite value (key unchanged).', -1);
          break;
        }
      }
    });
    return frames;
  }

  function bstDeleteFrames(seedKeys, delKey) {
    const frames = [];
    let root = buildTreeFromSeq(seedKeys);
    function snap(currentKey, note, code) {
      frames.push({ tree: cloneTree(root), currentKey: currentKey, note: note, code: code });
    }
    snap(null, 'Starting tree (built from ' + seedKeys.join(', ') + '). Delete key ' + delKey + '.', -1);

    function contains(node, k) {
      while (node) { if (k === node.key) return true; node = k < node.key ? node.left : node.right; }
      return false;
    }
    if (!contains(root, delKey)) {
      snap(null, 'Key ' + delKey + ' is not in the tree &mdash; nothing to delete.', -1);
      return frames;
    }

    let parent = null, isLeft = false, cur = root;
    while (cur.key !== delKey) {
      snap(cur.key, 'Compare ' + delKey + ' with ' + cur.key + ' &rarr; ' + (delKey < cur.key ? 'go left' : 'go right') + '.', 0);
      parent = cur; isLeft = delKey < cur.key;
      cur = isLeft ? cur.left : cur.right;
    }
    snap(cur.key, 'Found node to delete: ' + cur.key + '.', 0);

    function deleteNode(parent, node, isLeftChild) {
      if (node.left === null && node.right === null) {
        snap(node.key, node.key + ' is a leaf &rarr; simply remove it.', 2);
        if (parent === null) root = null; else if (isLeftChild) parent.left = null; else parent.right = null;
      } else if (node.left === null || node.right === null) {
        const child = node.left || node.right;
        snap(node.key, node.key + ' has one child (' + child.key + ') &rarr; splice it in, bypassing ' + node.key + '.', 2);
        if (parent === null) root = child; else if (isLeftChild) parent.left = child; else parent.right = child;
      } else {
        snap(node.key, node.key + ' has two children &rarr; Hibbard deletion: find the successor (min of right subtree).', 1);
        let succParent = node, succ = node.right;
        snap(succ.key, 'Successor candidate: ' + succ.key + ' (right child of ' + node.key + ').', 1);
        while (succ.left) {
          succParent = succ; succ = succ.left;
          snap(succ.key, 'Go left &rarr; ' + succ.key + '.', 1);
        }
        snap(succ.key, 'Successor = ' + succ.key + ' (leftmost node of the right subtree &mdash; no left child).', 1);
        const succRight = succ.right;
        if (succParent === node) succParent.right = succRight; else succParent.left = succRight;
        snap(node.key, 'Splice ' + succ.key + ' out of its old spot (it has at most a right child &rarr; easy case).', 2);
        node.key = succ.key;
        snap(node.key, 'Copy successor key ' + succ.key + ' into the deleted node’s spot. Deletion complete.', 3);
      }
    }
    deleteNode(parent, cur, isLeft);
    snap(null, 'Final tree after deleting ' + delKey + '.', -1);
    return frames;
  }

  function buildBST(container) {
    // --- card 1: insert-step visualizer -------------------------------
    const card1 = V.el('div', { class: 'card' });
    card1.appendChild(V.el('h3', {}, 'Insert Sequence'));
    card1.appendChild(V.el('p', { class: 'desc' }, 'Default sequence <code>30,20,40,10,25,35,50</code> reproduces the lecture’s worked BST example. Each key falls to the null link it compares its way down to.'));
    const inputRow1 = V.el('div', { class: 'input-row' });
    const seqInput = V.el('input', { class: 'input-field', value: '30,20,40,10,25,35,50', size: 28 });
    const buildBtn = V.el('button', { class: 'btn primary' }, 'Build tree');
    inputRow1.appendChild(V.el('label', {}, 'insert sequence'));
    inputRow1.appendChild(seqInput);
    inputRow1.appendChild(buildBtn);
    card1.appendChild(inputRow1);
    const vizHost1 = V.el('div', {});
    card1.appendChild(vizHost1);
    container.appendChild(card1);

    const bstPseudocode = [
      'def get(node, key):',
      '    while node is not None:',
      '        if key < node.key: node = node.left',
      '        elif key > node.key: node = node.right',
      '        else: return node.value',
      '    return None',
      'def put(node, key, val):',
      '    if node is None: return Node(key, val)',
      '    if key < node.key: node.left = put(node.left, key, val)',
      '    elif key > node.key: node.right = put(node.right, key, val)',
      '    else: node.value = val',
      '    return node'
    ];

    const viz1 = V.createStepVisualizer(vizHost1, {
      getFrames: function () { return bstInsertFrames(parseSeq(seqInput.value)); },
      render: function (f, ctx) { renderTreeGraph(ctx.vizArea, f.tree, f.currentKey, f.frontierKey); },
      pseudocode: bstPseudocode,
      legend: [
        { cls: 'current', label: 'comparing' },
        { cls: 'frontier', label: 'just inserted' }
      ]
    });
    buildBtn.onclick = function () { viz1.rebuild(); };

    // --- card 2: Hibbard deletion demo ----------------------------------
    const card2 = V.el('div', { class: 'card' });
    card2.appendChild(V.el('h3', {}, 'Deletion (Hibbard Method)'));
    card2.appendChild(V.el('p', { class: 'desc' }, 'Deleting a two-children node: find it, find its successor (min of the right subtree), splice the successor out of its old spot, then copy the successor’s key into the deleted node’s spot. Built fresh from the same default sequence <code>30,20,40,10,25,35,50</code>; default deletes the root, key 30.'));
    const inputRow2 = V.el('div', { class: 'input-row' });
    const delInput = V.el('input', { class: 'input-field', value: '30', size: 6 });
    const delBtn = V.el('button', { class: 'btn primary' }, 'Delete');
    inputRow2.appendChild(V.el('label', {}, 'delete key'));
    inputRow2.appendChild(delInput);
    inputRow2.appendChild(delBtn);
    card2.appendChild(inputRow2);
    const vizHost2 = V.el('div', {});
    card2.appendChild(vizHost2);
    container.appendChild(card2);

    const deletePseudocode = [
      '1. find node to delete',
      '2. successor = min(node.right)      # leftmost of right subtree',
      '3. remove successor from its old spot (0 or 1 child -> easy case)',
      '4. node.key = successor.key'
    ];

    const viz2 = V.createStepVisualizer(vizHost2, {
      getFrames: function () {
        const seedKeys = [30, 20, 40, 10, 25, 35, 50];
        const raw = delInput.value.trim();
        const delKey = isNaN(Number(raw)) ? raw : Number(raw);
        return bstDeleteFrames(seedKeys, delKey);
      },
      render: function (f, ctx) { renderTreeGraph(ctx.vizArea, f.tree, f.currentKey, null); },
      pseudocode: deletePseudocode,
      codeLine: function (f) { return f.code; },
      legend: [{ cls: 'current', label: 'node in focus' }]
    });
    delBtn.onclick = function () { viz2.rebuild(); };
  }

  // ======================================================== 2-3 Tree =====
  function insert23Frames(seq) {
    const frames = [];
    let root = null;
    function cloneWithState(node, markMap) {
      if (!node) return null;
      return {
        keys: node.keys.slice(),
        state: markMap.get(node) || '',
        children: node.children.map(function (c) { return cloneWithState(c, markMap); })
      };
    }
    function snap(markMap, note, code) {
      frames.push({ tree: root ? cloneWithState(root, markMap || new Map()) : null, note: note, code: code });
    }

    snap(null, 'Empty 2-3 tree.', -1);

    seq.forEach(function (key) {
      if (root === null) {
        root = { keys: [key], children: [], parent: null };
        snap(new Map([[root, 'frontier']]), 'Insert ' + key + ': tree is empty &rarr; ' + key + ' becomes the root (a 2-node).', -1);
        return;
      }
      let node = root;
      while (node.children.length > 0) {
        snap(new Map([[node, 'active']]), 'Insert ' + key + ': at node [' + node.keys.join(' ') + '], find the correct child to descend into.', 4);
        let i = 0;
        while (i < node.keys.length && key > node.keys[i]) i++;
        node = node.children[i];
      }
      snap(new Map([[node, 'active']]), 'Insert ' + key + ': reached leaf [' + node.keys.join(' ') + '].', 4);
      node.keys.push(key);
      node.keys.sort(function (a, b) { return a < b ? -1 : a > b ? 1 : 0; });
      if (node.keys.length === 2) {
        snap(new Map([[node, 'frontier']]), 'Leaf gains a key &rarr; [' + node.keys.join(' ') + '] (now a 3-node). No split needed.', 2);
      } else {
        snap(new Map([[node, 'overflow']]), 'Leaf overflows &rarr; [' + node.keys.join(' ') + '] (temporary 4-node). Must split.', 5);
        let cur = node;
        while (cur.keys.length === 3) {
          const a = cur.keys[0], b = cur.keys[1], c = cur.keys[2];
          let leftKids = [], rightKids = [];
          if (cur.children.length === 4) {
            leftKids = [cur.children[0], cur.children[1]];
            rightKids = [cur.children[2], cur.children[3]];
          }
          const leftNode = { keys: [a], children: leftKids, parent: null };
          const rightNode = { keys: [c], children: rightKids, parent: null };
          leftKids.forEach(function (ch) { ch.parent = leftNode; });
          rightKids.forEach(function (ch) { ch.parent = rightNode; });
          const parent = cur.parent;
          if (parent === null) {
            const newRoot = { keys: [b], children: [leftNode, rightNode], parent: null };
            leftNode.parent = newRoot; rightNode.parent = newRoot;
            root = newRoot;
            snap(new Map([[newRoot, 'frontier']]), 'Split [' + a + ' ' + b + ' ' + c + ']: middle key ' + b + ' has nowhere to go up to &rarr; it becomes a new root. Tree grows one level taller.', 7);
            break;
          } else {
            const idx = parent.children.indexOf(cur);
            parent.children.splice(idx, 1, leftNode, rightNode);
            parent.keys.splice(idx, 0, b);
            leftNode.parent = parent; rightNode.parent = parent;
            snap(new Map([[parent, 'frontier']]), 'Split [' + a + ' ' + b + ' ' + c + '] into [' + a + '] and [' + c + ']; middle key ' + b + ' pushed up into parent &rarr; parent becomes [' + parent.keys.join(' ') + '].', 6);
            cur = parent;
          }
        }
      }
    });
    snap(null, 'All insertions complete.', -1);
    return frames;
  }

  function buildNode23(node) {
    const colors = {
      active: { b: 'var(--accent)', bg: 'var(--accent-soft)', c: 'var(--accent)' },
      overflow: { b: 'var(--warn)', bg: 'var(--warn-soft)', c: 'var(--warn)' },
      frontier: { b: 'var(--found)', bg: 'var(--found-soft)', c: 'var(--found)' }
    };
    const sc = colors[node.state] || { b: 'var(--border)', bg: 'var(--surface)', c: 'var(--text)' };
    const keySpans = node.keys.map(function (k, i) {
      return V.el('span', {
        style: 'padding:5px 12px;font-weight:700;font-variant-numeric:tabular-nums;' + (i > 0 ? 'border-left:1.5px solid ' + sc.b + ';' : '')
      }, String(k));
    });
    const box = V.el('div', {
      style: 'display:flex;align-items:center;border:1.5px solid ' + sc.b + ';background:' + sc.bg + ';color:' + sc.c +
        ';border-radius:8px;font-family:var(--mono);font-size:.95rem;transition:all .2s;' +
        (node.state ? 'box-shadow:0 0 0 3px ' + sc.bg + ';' : '')
    }, keySpans);
    if (node.children && node.children.length) {
      const childEls = node.children.map(function (c) { return buildNode23(c); });
      const childrenRow = V.el('div', {
        style: 'display:flex;gap:26px;padding-top:16px;margin-top:6px;border-top:1.5px solid var(--border);'
      }, childEls);
      return V.el('div', { style: 'display:flex;flex-direction:column;align-items:center;' }, [box, childrenRow]);
    }
    return V.el('div', { style: 'display:flex;flex-direction:column;align-items:center;' }, [box]);
  }

  function render23(container, tree) {
    V.clear(container);
    if (!tree) {
      container.appendChild(V.el('div', { style: 'color:var(--text-dim);font-family:var(--mono);padding:24px;' }, 'Empty 2-3 tree'));
      return;
    }
    container.appendChild(buildNode23(tree));
  }

  function buildTree23(container) {
    const card = V.el('div', { class: 'card' });
    const inputRow = V.el('div', { class: 'input-row' });
    const seqInput = V.el('input', { class: 'input-field', value: 'A,B,C,D,E', size: 22 });
    const btn = V.el('button', { class: 'btn primary' }, 'Build tree');
    inputRow.appendChild(V.el('label', {}, 'insert sequence'));
    inputRow.appendChild(seqInput);
    inputRow.appendChild(btn);
    card.appendChild(inputRow);
    const vizHost = V.el('div', {});
    card.appendChild(vizHost);
    container.appendChild(card);

    const pseudocode = [
      'insert(node, key):',
      '  if node is a leaf:',
      '      add key to node, sorted        # 2-node -> 3-node, or 3-node -> temp 4-node',
      '  else:',
      '      recurse into the correct child',
      '  if node now has 3 keys (overflow):',
      '      split into two 2-nodes; push middle key up to parent',
      '      (parent was root -> new root; tree grows one level taller)'
    ];

    const viz = V.createStepVisualizer(vizHost, {
      getFrames: function () { return insert23Frames(parseSeq(seqInput.value)); },
      render: function (f, ctx) { render23(ctx.vizArea, f.tree); },
      pseudocode: pseudocode,
      legend: [
        { style: 'background:var(--accent)', label: 'currently visiting' },
        { style: 'background:var(--warn)', label: 'temporary overflow (3 keys)' },
        { style: 'background:var(--found)', label: 'just changed (gained key / split)' }
      ]
    });
    btn.onclick = function () { viz.rebuild(); };
  }

  // ======================================================== LLRBT ========
  function llrbtFrames(seq) {
    const frames = [];
    const state = { root: null };
    function snap(currentKey, note, code) {
      frames.push({ tree: cloneTree(state.root), currentKey: currentKey, note: note, code: code });
    }
    function newNode(key) { return { key: key, left: null, right: null, red: true, parent: null }; }
    function isRed(n) { return !!n && n.red === true; }
    function rotateLeftInPlace(h) {
      const x = h.right, parent = h.parent;
      h.right = x.left; if (x.left) x.left.parent = h;
      x.left = h; h.parent = x;
      x.red = h.red; h.red = true;
      x.parent = parent;
      if (parent) { if (parent.left === h) parent.left = x; else parent.right = x; }
      return x;
    }
    function rotateRightInPlace(h) {
      const x = h.left, parent = h.parent;
      h.left = x.right; if (x.right) x.right.parent = h;
      x.right = h; h.parent = x;
      x.red = h.red; h.red = true;
      x.parent = parent;
      if (parent) { if (parent.left === h) parent.left = x; else parent.right = x; }
      return x;
    }
    function flipColorsInPlace(h) {
      h.red = !h.red; h.left.red = !h.left.red; h.right.red = !h.right.red;
    }
    function insertNode(node, key) {
      if (node === null) {
        const n = newNode(key);
        if (state.root === null) state.root = n;
        snap(key, 'Insert ' + key + ' as a new red leaf.', -1);
        return n;
      }
      if (key < node.key) {
        snap(node.key, key + ' &lt; ' + node.key + ' &rarr; go left.', -1);
        const child = insertNode(node.left, key);
        node.left = child; child.parent = node;
      } else if (key > node.key) {
        snap(node.key, key + ' &gt; ' + node.key + ' &rarr; go right.', -1);
        const child = insertNode(node.right, key);
        node.right = child; child.parent = node;
      } else {
        node.key = key;
      }
      if (isRed(node.right) && !isRed(node.left)) {
        node = rotateLeftInPlace(node);
        if (node.parent === null) state.root = node;
        snap(node.key, 'Right-leaning red link at ' + node.left.key + ' &rarr; rotate left at ' + node.key + '.', 0);
      }
      if (isRed(node.left) && isRed(node.left.left)) {
        node = rotateRightInPlace(node);
        if (node.parent === null) state.root = node;
        snap(node.key, 'Two red links in a row on the left &rarr; rotate right at ' + node.key + '.', 1);
      }
      if (isRed(node.left) && isRed(node.right)) {
        flipColorsInPlace(node);
        snap(node.key, 'Both children of ' + node.key + ' are red &rarr; flip colors (push red link up).', 2);
      }
      return node;
    }
    snap(null, 'Empty tree.', -1);
    seq.forEach(function (key) {
      const newRoot = insertNode(state.root, key);
      state.root = newRoot;
      if (state.root && state.root.red) {
        state.root.red = false;
        snap(state.root.key, 'Color the root black (the root is always black).', -1);
      }
    });
    return frames;
  }

  function buildLLRBT(container) {
    const card = V.el('div', { class: 'card' });
    const inputRow = V.el('div', { class: 'input-row' });
    const seqInput = V.el('input', { class: 'input-field', value: 'A,C,E,H,L,M,P,R,S,X', size: 26 });
    const btn = V.el('button', { class: 'btn primary' }, 'Build tree');
    inputRow.appendChild(V.el('label', {}, 'insert sequence'));
    inputRow.appendChild(seqInput);
    inputRow.appendChild(btn);
    card.appendChild(inputRow);
    const vizHost = V.el('div', {});
    card.appendChild(vizHost);
    container.appendChild(card);

    const pseudocode = [
      'if right child red and left child black: rotate left',
      'if left child red and left-left grandchild red: rotate right',
      'if both children red: flip colors'
    ];

    const viz = V.createStepVisualizer(vizHost, {
      getFrames: function () { return llrbtFrames(parseSeq(seqInput.value)); },
      render: function (f, ctx) { renderTreeGraph(ctx.vizArea, f.tree, f.currentKey, null); },
      pseudocode: pseudocode,
      codeLine: function (f) { return f.code; },
      legend: [
        { cls: 'current', label: 'node in focus' },
        { style: 'background:transparent;border:2px solid var(--accent)', label: 'red link (3-node)' }
      ]
    });
    btn.onclick = function () { viz.rebuild(); };
  }

  // ------------------------------------------------------------ register --
  App.registerLecture({
    id: 'l7', number: 7, title: 'Search Algorithms 2',
    sections: [
      {
        id: 'bst', title: 'Binary Search Tree',
        intro: 'A BST node holds a key, value, left and right link, in <b>symmetric order</b>: everything in the left subtree is smaller, everything in the right subtree is larger. Search/insert both walk the same comparison chain &mdash; insert just falls off the tree at a null link and plants a new node there.',
        build: buildBST,
        reading: [
          { label: 'Princeton algs4 — Binary Search Trees', url: 'https://algs4.cs.princeton.edu/32bst/' },
          { label: 'Princeton algs4 — Balanced Search Trees', url: 'https://algs4.cs.princeton.edu/33balanced/' },
          { label: 'USF interactive visualizations (BST / Red-Black / 2-3-4 tree)', url: 'https://www.cs.usfca.edu/~galles/visualization/' }
        ]
      },
      {
        id: 'tree-23', title: '2-3 Tree',
        intro: 'Nodes hold 1 key (2-node, 2 children) or 2 keys (3-node, 3 children). The invariant is <b>perfect balance</b>: every root-to-null-link path has the same length. Insertion always happens at the bottom; a leaf that overflows to 3 keys splits and pushes its middle key up into its parent &mdash; repeating upward, which is the only way the tree grows taller.',
        build: buildTree23,
        reading: [
          { label: 'Princeton algs4 — Binary Search Trees', url: 'https://algs4.cs.princeton.edu/32bst/' },
          { label: 'Princeton algs4 — Balanced Search Trees', url: 'https://algs4.cs.princeton.edu/33balanced/' },
          { label: 'USF interactive visualizations (BST / Red-Black / 2-3-4 tree)', url: 'https://www.cs.usfca.edu/~galles/visualization/' }
        ]
      },
      {
        id: 'llrbt', title: 'Left-Leaning Red-Black Tree',
        intro: 'A 2-3 tree encoded as a BST with colored links: a 3-node is two BST nodes joined by an internal, <b>left-leaning red link</b>; every other link is black. After every ordinary red-linked insert, three local repairs restore the invariants on the way back up: rotate left (right-leaning red), rotate right (two reds in a row on the left), flip colors (both children red).',
        build: buildLLRBT,
        reading: [
          { label: 'Princeton algs4 — Binary Search Trees', url: 'https://algs4.cs.princeton.edu/32bst/' },
          { label: 'Princeton algs4 — Balanced Search Trees', url: 'https://algs4.cs.princeton.edu/33balanced/' },
          { label: 'USF interactive visualizations (BST / Red-Black / 2-3-4 tree)', url: 'https://www.cs.usfca.edu/~galles/visualization/' }
        ]
      }
    ]
  });
})();
