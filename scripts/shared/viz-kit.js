/* ==========================================================================
   VizKit — shared DOM/SVG helpers + step-visualizer scaffold used by every
   lecture module. Plain global (no ES modules) so the site works over file://
   and via GitHub Pages without a build step.
   ========================================================================== */
window.VizKit = (function () {
  'use strict';

  // ---------------------------------------------------------------- DOM ---
  function el(tag, attrs, children) {
    attrs = attrs || {};
    const e = document.createElement(tag);
    for (const k in attrs) {
      const v = attrs[k];
      if (v === undefined || v === null) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.indexOf('on') === 0 && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    (Array.isArray(children) ? children : children != null ? [children] : []).forEach(function (c) {
      if (c === null || c === undefined) return;
      e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(c) : c);
    });
    return e;
  }

  const SVG_NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    const e = document.createElementNS(SVG_NS, tag);
    attrs = attrs || {};
    for (const k in attrs) {
      if (attrs[k] === undefined || attrs[k] === null) continue;
      e.setAttribute(k, attrs[k]);
    }
    return e;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  // ------------------------------------------------------- Frame player ---
  // frames: array of arbitrary state objects (each frame is a full snapshot,
  // so step-back is just re-render, no algorithm re-execution needed).
  // config:
  //   render(frame, index, frames)  -- required, draws the frame
  //   speedMs                       -- default 900
  //   getNote(frame) -> html string -- optional, else frame.note is used
  //   getCodeLine(frame) -> int     -- optional, else frame.code is used
  function FramePlayer(container, frames, config) {
    config = config || {};
    const speedMs = config.speedMs || 900;
    let state = { frames: frames, i: 0, timer: null };

    clear(container);
    const prevBtn = el('button', { class: 'btn', title: 'Previous step' }, '◀ Prev');
    const playBtn = el('button', { class: 'btn primary', title: 'Play / pause' }, '▶ Play');
    const nextBtn = el('button', { class: 'btn', title: 'Next step' }, 'Next ▶');
    const resetBtn = el('button', { class: 'btn', title: 'Reset to first step' }, '⟲ Reset');
    const scrub = el('input', { type: 'range', class: 'scrub', min: 0, max: Math.max(0, frames.length - 1), value: 0 });
    const count = el('span', { class: 'step-count' }, '1 / ' + frames.length);
    const controls = el('div', { class: 'controls' }, [resetBtn, prevBtn, playBtn, nextBtn, scrub, count]);
    container.appendChild(controls);

    function stop() {
      if (state.timer) { clearInterval(state.timer); state.timer = null; }
      playBtn.textContent = '▶ Play';
    }
    function render() {
      const f = state.frames[state.i];
      scrub.value = state.i;
      count.textContent = (state.i + 1) + ' / ' + state.frames.length;
      prevBtn.disabled = state.i === 0;
      nextBtn.disabled = state.i === state.frames.length - 1;
      config.render(f, state.i, state.frames);
    }
    prevBtn.onclick = function () { stop(); state.i = Math.max(0, state.i - 1); render(); };
    nextBtn.onclick = function () { stop(); state.i = Math.min(state.frames.length - 1, state.i + 1); render(); };
    resetBtn.onclick = function () { stop(); state.i = 0; render(); };
    scrub.oninput = function () { stop(); state.i = +scrub.value; render(); };
    playBtn.onclick = function () {
      if (state.timer) { stop(); return; }
      if (state.i >= state.frames.length - 1) state.i = 0;
      playBtn.textContent = '⏸ Pause';
      state.timer = setInterval(function () {
        state.i++;
        if (state.i >= state.frames.length - 1) { state.i = state.frames.length - 1; render(); stop(); return; }
        render();
      }, speedMs);
    };
    render();

    return {
      setFrames: function (newFrames) {
        stop();
        state.frames = newFrames;
        state.i = 0;
        scrub.max = Math.max(0, newFrames.length - 1);
        render();
      },
      goTo: function (idx) { stop(); state.i = Math.max(0, Math.min(state.frames.length - 1, idx)); render(); },
      destroy: stop
    };
  }

  // ---------------------------------------------------- Step visualizer ---
  // High-level scaffold: builds viz-area + optional side area + note +
  // pseudocode panel + legend + frame player, all wired together.
  // config:
  //   getFrames()            -- () -> frames array (called on build & rebuild)
  //   render(frame, ctx)     -- ctx = {vizArea, sideArea}
  //   pseudocode: [lines]    -- optional
  //   codeLine(frame)        -- optional fn, defaults to frame.code
  //   note(frame)            -- optional fn, defaults to frame.note
  //   legend: [{label, cls}] -- cls = css class for a .dot swatch, or swatchStyle for inline style
  //   split: true|false      -- two-column viz/side layout
  //   speedMs
  function createStepVisualizer(container, config) {
    clear(container);
    const vizArea = el('div', { class: 'viz-area' });
    let sideArea = null;
    let vizWrap;
    if (config.split) {
      sideArea = el('div', {});
      vizWrap = el('div', { class: 'viz-split' }, [vizArea, sideArea]);
    } else {
      vizWrap = vizArea;
    }
    container.appendChild(vizWrap);

    const playerHost = el('div', {});
    container.appendChild(playerHost);

    const note = el('div', { class: 'note' });
    container.appendChild(note);

    let codeLines = [];
    let codePanel = null;
    if (config.pseudocode && config.pseudocode.length) {
      codePanel = el('div', { class: 'code-panel' });
      config.pseudocode.forEach(function (line, idx) {
        const l = el('div', { class: 'code-line' }, line);
        l.dataset.i = idx;
        codePanel.appendChild(l);
        codeLines.push(l);
      });
      container.appendChild(codePanel);
    }

    if (config.legend && config.legend.length) {
      const legend = el('div', { class: 'legend' });
      config.legend.forEach(function (item) {
        const dot = el('i', { class: 'dot', style: item.style || '' });
        if (item.cls) dot.classList.add(item.cls);
        legend.appendChild(el('span', {}, [dot, item.label]));
      });
      container.appendChild(legend);
    }

    const ctx = { vizArea: vizArea, sideArea: sideArea };
    let player = null;

    function frameNote(f) {
      if (config.note) return config.note(f);
      return f && f.note ? f.note : '';
    }
    function frameCode(f) {
      if (config.codeLine) return config.codeLine(f);
      return f && typeof f.code === 'number' ? f.code : -1;
    }

    function onFrame(f) {
      config.render(f, ctx);
      note.innerHTML = frameNote(f);
      if (codePanel) {
        const active = frameCode(f);
        codeLines.forEach(function (l) { l.classList.toggle('active', +l.dataset.i === active); });
      }
    }

    function build() {
      const frames = config.getFrames();
      if (player) player.setFrames(frames);
      else player = FramePlayer(playerHost, frames, { render: onFrame, speedMs: config.speedMs });
    }
    build();

    return { rebuild: build, ctx: ctx, goTo: function (i) { player.goTo(i); } };
  }

  // ------------------------------------------------------- Array cells ---
  // cells: [{ key, label, cls: 'range mid found excluded tomb', ptrs: [{label,cls}] }]
  function renderArrayRow(container, cells) {
    clear(container);
    const row = el('div', { class: 'array-row' });
    cells.forEach(function (c) {
      const cellEl = el('div', { class: 'cell ' + (c.cls || '') }, String(c.label !== undefined ? c.label : c.key));
      const ptrsEl = el('div', { class: 'ptrs' });
      (c.ptrs || []).forEach(function (p) {
        ptrsEl.appendChild(el('span', { class: 'ptr ' + (p.cls || '') }, p.label));
      });
      const col = el('div', { class: 'cell-col' }, [
        c.idx !== undefined ? el('span', { class: 'idx' }, String(c.idx)) : null,
        cellEl,
        ptrsEl
      ]);
      row.appendChild(col);
    });
    container.appendChild(row);
  }

  // ------------------------------------------------------------ Graph  ---
  // graph: { nodes: [{id,x,y,label,cls}], edges: [{from,to,label,cls,directed}] }
  // opts: { width, height, directed (default arrowheads for all edges) }
  function renderGraphSVG(container, graph, opts) {
    opts = opts || {};
    clear(container);
    const w = opts.width || 360, h = opts.height || 280;
    const svg = svgEl('svg', { class: 'graph', viewBox: '0 0 ' + w + ' ' + h });

    if (opts.directed) {
      const defs = svgEl('defs');
      ['default', 'tree', 'active', 'found'].forEach(function (kind) {
        const marker = svgEl('marker', {
          id: 'arrow-' + kind, viewBox: '0 0 10 10', refX: 9, refY: 5,
          markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse'
        });
        const cssVar = kind === 'default' ? 'var(--border)' : kind === 'tree' ? 'var(--visited)' : kind === 'active' ? 'var(--accent)' : 'var(--found)';
        marker.appendChild(svgEl('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: cssVar }));
        defs.appendChild(marker);
      });
      svg.appendChild(defs);
    }

    const nodeById = {};
    graph.nodes.forEach(function (n) { nodeById[n.id] = n; });

    (graph.edges || []).forEach(function (e) {
      const a = nodeById[e.from], b = nodeById[e.to];
      if (!a || !b) return;
      const r = opts.nodeR || 18;
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const ux = dx / len, uy = dy / len;
      const x1 = a.x + ux * r, y1 = a.y + uy * r;
      const x2 = b.x - ux * r, y2 = b.y - uy * r;
      const cls = 'g-edge ' + (e.cls || '');
      const line = svgEl('line', { x1: x1, y1: y1, x2: x2, y2: y2, class: cls });
      if (opts.directed || e.directed) {
        const kind = (e.cls || '').indexOf('tree') > -1 ? 'tree' : (e.cls || '').indexOf('active') > -1 ? 'active' : (e.cls || '').indexOf('found') > -1 ? 'found' : 'default';
        line.setAttribute('marker-end', 'url(#arrow-' + kind + ')');
      }
      svg.appendChild(line);
      if (e.label !== undefined) {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const offx = -uy * 10, offy = ux * 10;
        svg.appendChild(svgEl('text', { x: mx + offx, y: my + offy, class: 'g-edge-label' }, undefined));
        svg.lastChild.textContent = e.label;
      }
    });

    graph.nodes.forEach(function (n) {
      const r = opts.nodeR || 18;
      const g = svgEl('g', {});
      g.appendChild(svgEl('circle', { cx: n.x, cy: n.y, r: r, class: 'g-node-circle ' + (n.cls || '') }));
      const label = svgEl('text', { x: n.x, y: n.y, class: 'g-node-label' });
      label.textContent = n.label !== undefined ? n.label : n.id;
      g.appendChild(label);
      if (n.dist !== undefined) {
        const dl = svgEl('text', { x: n.x, y: n.y - r - 8, class: 'g-dist-label' });
        dl.textContent = n.dist;
        g.appendChild(dl);
      }
      svg.appendChild(g);
    });

    container.appendChild(svg);
    return svg;
  }

  // ------------------------------------------------------- Hash tables ---
  // buckets: [ [{key,val,cls}], ... ]  one array of entries per slot index
  function renderBucketsChaining(container, buckets) {
    clear(container);
    const list = el('div', { class: 'bucket-list' });
    buckets.forEach(function (chain, idx) {
      const chainEl = el('div', { class: 'bucket-chain' });
      chain.forEach(function (node) {
        chainEl.appendChild(el('span', { class: 'bucket-node ' + (node.cls || '') },
          node.val !== undefined ? node.key + ':' + node.val : String(node.key)));
      });
      list.appendChild(el('div', { class: 'bucket-row' }, [
        el('span', { class: 'bucket-idx' }, String(idx)),
        chainEl
      ]));
    });
    container.appendChild(list);
  }

  // slots: [{key,val,cls,tombstone}] one per table slot, index = position
  function renderBucketsLinear(container, slots) {
    clear(container);
    const row = el('div', { class: 'slot-row' });
    slots.forEach(function (s, idx) {
      const cls = 'slot ' + (s.cls || '') + (s.tombstone ? ' tomb' : '');
      const label = s.tombstone ? '×' : (s.key !== undefined && s.key !== null ? (s.val !== undefined ? s.key + ':' + s.val : s.key) : '');
      row.appendChild(el('div', { class: cls }, [
        el('span', { class: 'slot-idx' }, String(idx)),
        label
      ]));
    });
    container.appendChild(row);
  }

  // -------------------------------------------------------------- Table --
  // {headers:[...], rows: [[{val,cls}, ...], ...]}
  function renderTable(container, data) {
    clear(container);
    const wrap = el('div', { class: 'stat-table-wrap' });
    const table = el('table', { class: 'stat-table' });
    const thead = el('thead', {}, el('tr', {}, data.headers.map(function (h) { return el('th', {}, String(h)); })));
    const tbody = el('tbody', {}, data.rows.map(function (row) {
      return el('tr', {}, row.map(function (cell) {
        if (cell && typeof cell === 'object' && 'val' in cell) {
          return el('td', { class: cell.cls || '' }, String(cell.val));
        }
        return el('td', {}, String(cell));
      }));
    }));
    table.appendChild(thead);
    table.appendChild(tbody);
    wrap.appendChild(table);
    container.appendChild(wrap);
  }

  return {
    el: el, svgEl: svgEl, clear: clear,
    FramePlayer: FramePlayer,
    createStepVisualizer: createStepVisualizer,
    renderArrayRow: renderArrayRow,
    renderGraphSVG: renderGraphSVG,
    renderBucketsChaining: renderBucketsChaining,
    renderBucketsLinear: renderBucketsLinear,
    renderTable: renderTable
  };
})();
