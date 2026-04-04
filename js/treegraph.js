/**
 * treegraph.js — Tree graph editor (Lang's tree method input)
 *
 * Ported from prototype's tree canvas interaction model.
 * Modes: add (click=node, drag=move), edge (connect two nodes), move, delete (right-click)
 */
const TreeGraph = (() => {
  let canvas, ctx;
  let tree = { nodes: [], edges: [] };
  let circles = []; // disk packing overlay
  let mode = 'add';
  let dragNode = null, edgeFrom = null;
  let onChanged = null;

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    resize();

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('contextmenu', onContextMenu);
  }

  function resize() {
    const wrap = canvas.parentElement;
    canvas.width = wrap.clientWidth || 260;
    canvas.height = wrap.clientHeight || 300;
    draw();
  }

  function setTree(t) {
    tree = {
      nodes: (t.nodes || []).map(n => ({ ...n })),
      edges: (t.edges || []).map(e => [...e])
    };
    circles = [];
    draw();
  }

  function getTree() { return tree; }
  function setCircles(c) { circles = c || []; draw(); }
  function setMode(m) { mode = m; }

  function clear() {
    tree = { nodes: [], edges: [] };
    circles = [];
    draw();
    if (onChanged) onChanged(tree);
  }

  // ── Interaction ────────────────────────────

  function findNode(x, y) {
    return tree.nodes.find(n => Math.hypot(n.x - x, n.y - y) < n.r + 5);
  }

  function onMouseDown(e) {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const hit = findNode(x, y);

    if (mode === 'add') {
      if (hit) {
        dragNode = hit.id;
      } else {
        const maxId = tree.nodes.length ? Math.max(...tree.nodes.map(n => n.id)) : -1;
        tree.nodes.push({ id: maxId + 1, x, y, r: 13 });
        if (onChanged) onChanged(tree);
      }
    } else if (mode === 'move') {
      if (hit) dragNode = hit.id;
    } else if (mode === 'edge') {
      if (hit) edgeFrom = hit.id;
    }
    draw();
  }

  function onMouseMove(e) {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;

    if (dragNode !== null) {
      const n = tree.nodes.find(nd => nd.id === dragNode);
      if (n) { n.x = x; n.y = y; draw(); if (onChanged) onChanged(tree); }
    }
    if (edgeFrom !== null) {
      draw();
      const ns = tree.nodes.find(nd => nd.id === edgeFrom);
      if (ns) {
        ctx.strokeStyle = 'rgba(200,240,160,0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(ns.x, ns.y); ctx.lineTo(x, y); ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  function onMouseUp(e) {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;

    if (edgeFrom !== null) {
      const hit = tree.nodes.find(n =>
        n.id !== edgeFrom && Math.hypot(n.x - x, n.y - y) < n.r + 5
      );
      if (hit) {
        const exists = tree.edges.some(ed =>
          (ed[0] === edgeFrom && ed[1] === hit.id) || (ed[0] === hit.id && ed[1] === edgeFrom)
        );
        if (!exists) {
          tree.edges.push([edgeFrom, hit.id]);
          if (onChanged) onChanged(tree);
        }
      }
      edgeFrom = null;
    }
    dragNode = null;
    draw();
  }

  function onContextMenu(e) {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const hit = findNode(x, y);
    if (hit) {
      tree.nodes = tree.nodes.filter(n => n.id !== hit.id);
      tree.edges = tree.edges.filter(ed => ed[0] !== hit.id && ed[1] !== hit.id);
      draw();
      if (onChanged) onChanged(tree);
    }
  }

  // ── Drawing ────────────────────────────────

  function buildDeg() {
    const m = new Map();
    tree.nodes.forEach(n => m.set(n.id, 0));
    tree.edges.forEach(e => {
      m.set(e[0], (m.get(e[0]) || 0) + 1);
      m.set(e[1], (m.get(e[1]) || 0) + 1);
    });
    return m;
  }

  function draw() {
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Disk packing circles
    circles.forEach(c => {
      ctx.strokeStyle = 'rgba(200,240,160,0.09)';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.stroke();
    });

    // Edges
    tree.edges.forEach(e => {
      const a = tree.nodes.find(n => n.id === e[0]);
      const b = tree.nodes.find(n => n.id === e[1]);
      if (!a || !b) return;
      ctx.strokeStyle = 'rgba(160,212,240,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      // Distance label
      ctx.fillStyle = 'rgba(160,212,240,0.3)';
      ctx.font = '8px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        Math.round(Math.hypot(b.x - a.x, b.y - a.y) / 10) + 'u',
        (a.x + b.x) / 2 + 3, (a.y + b.y) / 2 - 2
      );
    });

    // Nodes
    const deg = buildDeg();
    tree.nodes.forEach(n => {
      const isLeaf = (deg.get(n.id) || 0) <= 1;
      ctx.fillStyle = isLeaf ? 'rgba(180,230,120,0.85)' : 'rgba(120,180,230,0.85)';
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.font = Math.max(8, n.r * 0.6) + 'px monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(n.id, n.x, n.y);
    });

    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  }

  return {
    init, setTree, getTree, setCircles, setMode, clear, resize, draw, buildDeg,
    set onChanged(fn) { onChanged = fn; },
    get onChanged() { return onChanged; }
  };
})();
