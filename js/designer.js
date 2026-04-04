/**
 * designer.js — 2D crease pattern editor (manual draw mode)
 *
 * Canvas renders unit square paper [0,1]x[0,1].
 * Tools: Mountain, Valley, Select, Delete.
 * Snap system: edges, corners, midpoints, intersections.
 */
const Designer = (() => {
  let canvas, ctx;
  let creases = []; // [{line:{x1,y1,x2,y2}, type:'mountain'|'valley', stepId:string}]
  let tool = 'mountain';
  let firstPoint = null; // {x, z} for in-progress line
  let hoverPoint = null;
  let selectedIndex = -1;
  let onChanged = null;

  const SNAP_RADIUS = 0.04;
  const PAPER_MARGIN = 20; // px

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    resize();

    canvas.addEventListener('mousedown', onClick);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('contextmenu', onRightClick);
  }

  function resize() {
    const wrap = canvas.parentElement;
    canvas.width = wrap.clientWidth || 260;
    canvas.height = wrap.clientHeight || 300;
    draw();
  }

  function setTool(t) { tool = t; firstPoint = null; selectedIndex = -1; draw(); }
  function getCreases() { return creases; }

  function setCreases(c) {
    creases = (c || []).map(cr => ({
      line: { ...cr.line },
      type: cr.type || 'mountain',
      stepId: cr.stepId || ''
    }));
    draw();
  }

  // ── Coordinate transforms ─────────────────

  function paperRect() {
    const size = Math.min(canvas.width, canvas.height) - PAPER_MARGIN * 2;
    const ox = (canvas.width - size) / 2;
    const oy = (canvas.height - size) / 2;
    return { ox, oy, size };
  }

  function toCanvas(ux, uz) {
    const { ox, oy, size } = paperRect();
    return { x: ox + ux * size, y: oy + uz * size };
  }

  function toUnit(cx, cy) {
    const { ox, oy, size } = paperRect();
    return { x: (cx - ox) / size, z: (cy - oy) / size };
  }

  // ── Snap system ───────────────────────────

  function snap(ux, uz) {
    let best = { x: ux, z: uz, snapped: false };
    let bestDist = SNAP_RADIUS;

    // Snap targets: corners, midpoints, existing endpoints
    const targets = [
      {x:0,z:0},{x:1,z:0},{x:0,z:1},{x:1,z:1}, // corners
      {x:0.5,z:0},{x:0.5,z:1},{x:0,z:0.5},{x:1,z:0.5},{x:0.5,z:0.5}, // midpoints
    ];

    // Add existing crease endpoints
    creases.forEach(c => {
      targets.push({x:c.line.x1, z:c.line.y1});
      targets.push({x:c.line.x2, z:c.line.y2});
    });

    // Add intersections between existing creases
    for (let i = 0; i < creases.length; i++) {
      for (let j = i + 1; j < creases.length; j++) {
        const pt = segIntersect(creases[i].line, creases[j].line);
        if (pt) targets.push({x: pt.x, z: pt.z});
      }
    }

    // Edge snapping (snap to nearest point on edges x=0, x=1, z=0, z=1)
    const edgeSnaps = [
      {x: ux, z: 0}, {x: ux, z: 1}, {x: 0, z: uz}, {x: 1, z: uz}
    ];
    edgeSnaps.forEach(t => {
      if (t.x >= 0 && t.x <= 1 && t.z >= 0 && t.z <= 1) targets.push(t);
    });

    for (const t of targets) {
      const d = Math.hypot(t.x - ux, t.z - uz);
      if (d < bestDist) {
        bestDist = d;
        best = { x: t.x, z: t.z, snapped: true };
      }
    }
    return best;
  }

  function segIntersect(a, b) {
    const dx1 = a.x2 - a.x1, dy1 = a.y2 - a.y1;
    const dx2 = b.x2 - b.x1, dy2 = b.y2 - b.y1;
    const denom = dx1 * dy2 - dy1 * dx2;
    if (Math.abs(denom) < 1e-8) return null;
    const t = ((b.x1 - a.x1) * dy2 - (b.y1 - a.y1) * dx2) / denom;
    const u = ((b.x1 - a.x1) * dy1 - (b.y1 - a.y1) * dx1) / denom;
    if (t < 0.01 || t > 0.99 || u < 0.01 || u > 0.99) return null;
    return { x: a.x1 + t * dx1, z: a.y1 + t * dy1 };
  }

  // ── Interaction ───────────────────────────

  function onClick(e) {
    const r = canvas.getBoundingClientRect();
    const pt = toUnit(e.clientX - r.left, e.clientY - r.top);
    if (pt.x < -0.05 || pt.x > 1.05 || pt.z < -0.05 || pt.z > 1.05) return;

    const snapped = snap(pt.x, pt.z);
    const ux = Math.max(0, Math.min(1, snapped.x));
    const uz = Math.max(0, Math.min(1, snapped.z));

    if (tool === 'mountain' || tool === 'valley') {
      if (!firstPoint) {
        firstPoint = { x: ux, z: uz };
      } else {
        // Create fold line
        if (Math.hypot(ux - firstPoint.x, uz - firstPoint.z) > 0.02) {
          creases.push({
            line: { x1: firstPoint.x, y1: firstPoint.z, x2: ux, y2: uz },
            type: tool,
            stepId: ''
          });
          if (onChanged) onChanged(creases);
        }
        firstPoint = null;
      }
    } else if (tool === 'select') {
      selectedIndex = findNearestCrease(ux, uz);
    } else if (tool === 'delete') {
      const idx = findNearestCrease(ux, uz);
      if (idx >= 0) {
        creases.splice(idx, 1);
        if (onChanged) onChanged(creases);
      }
    }
    draw();
  }

  function onMove(e) {
    const r = canvas.getBoundingClientRect();
    const pt = toUnit(e.clientX - r.left, e.clientY - r.top);
    const snapped = snap(pt.x, pt.z);
    hoverPoint = { x: snapped.x, z: snapped.z, snapped: snapped.snapped };

    // Update coord display
    const coord = document.getElementById('coord-info');
    if (coord) coord.textContent = pt.x.toFixed(2) + ', ' + pt.z.toFixed(2);
    const snapEl = document.getElementById('snap-info');
    if (snapEl) snapEl.textContent = snapped.snapped ? 'Snap: on' : 'Snap: off';

    draw();
  }

  function onRightClick(e) {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    const pt = toUnit(e.clientX - r.left, e.clientY - r.top);
    const idx = findNearestCrease(pt.x, pt.z);
    if (idx >= 0) {
      // Toggle type on right-click
      const c = creases[idx];
      c.type = c.type === 'mountain' ? 'valley' : 'mountain';
      if (onChanged) onChanged(creases);
      draw();
    }
  }

  function findNearestCrease(ux, uz) {
    let bestIdx = -1, bestDist = 0.05;
    creases.forEach((c, i) => {
      const d = distToSegment(ux, uz, c.line.x1, c.line.y1, c.line.x2, c.line.y2);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    return bestIdx;
  }

  function distToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq < 1e-10) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  // ── Drawing ───────────────────────────────

  function draw() {
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const { ox, oy, size } = paperRect();

    // Paper background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(ox, oy, size, size);

    // Grid on paper
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 8; i++) {
      const p = i / 8;
      const px = ox + p * size, py = oy + p * size;
      ctx.beginPath(); ctx.moveTo(px, oy); ctx.lineTo(px, oy + size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ox, py); ctx.lineTo(ox + size, py); ctx.stroke();
    }

    // Paper border
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(ox, oy, size, size);

    // Crease lines
    creases.forEach((c, i) => {
      const p1 = toCanvas(c.line.x1, c.line.y1);
      const p2 = toCanvas(c.line.x2, c.line.y2);

      if (c.type === 'mountain') {
        ctx.strokeStyle = '#f07070';
        ctx.setLineDash([6, 3]);
      } else if (c.type === 'valley') {
        ctx.strokeStyle = '#6090f0';
        ctx.setLineDash([6, 2, 2, 2]);
      } else {
        ctx.strokeStyle = '#80c0f0';
        ctx.setLineDash([]);
      }
      ctx.lineWidth = i === selectedIndex ? 2.5 : 1.5;
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      ctx.setLineDash([]);
    });

    // In-progress line
    if (firstPoint && hoverPoint) {
      const p1 = toCanvas(firstPoint.x, firstPoint.z);
      const p2 = toCanvas(hoverPoint.x, hoverPoint.z);
      ctx.strokeStyle = tool === 'mountain' ? 'rgba(240,112,112,0.5)' : 'rgba(96,144,240,0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      ctx.setLineDash([]);
    }

    // First point marker
    if (firstPoint) {
      const p = toCanvas(firstPoint.x, firstPoint.z);
      ctx.fillStyle = '#c8f0a0';
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
    }

    // Hover snap indicator
    if (hoverPoint && hoverPoint.snapped) {
      const p = toCanvas(hoverPoint.x, hoverPoint.z);
      ctx.strokeStyle = '#c8f0a0';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.stroke();
    }
  }

  return {
    init, setTool, getCreases, setCreases, resize, draw,
    set onChanged(fn) { onChanged = fn; },
    get onChanged() { return onChanged; }
  };
})();
