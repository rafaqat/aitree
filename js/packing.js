/**
 * packing.js — Circle-river packing solver
 *
 * Implements Lang's circle-river packing from TreeMaker.
 * Pipeline: tree graph → disk packing → 3-phase crease generation → fold steps
 *
 * Ported from prototype's computeCircles() + genCreases()
 */
const Packing = (() => {

  /**
   * Compute disk packing from tree graph.
   * tree: {nodes: [{id,x,y,r}], edges: [[id,id]]}
   * canvasW, canvasH: pixel dimensions for layout
   * Returns array of {id, x, y, r}
   */
  function computeCircles(tree, canvasW, canvasH) {
    const circles = [];
    if (!tree.nodes || tree.nodes.length < 2) return circles;

    const findNode = id => tree.nodes.find(n => n.id === id);

    // Build degree map
    const deg = new Map();
    tree.nodes.forEach(n => deg.set(n.id, 0));
    tree.edges.forEach(e => {
      deg.set(e[0], (deg.get(e[0]) || 0) + 1);
      deg.set(e[1], (deg.get(e[1]) || 0) + 1);
    });

    // BFS from highest-degree node (root)
    let root = tree.nodes[0];
    tree.nodes.forEach(n => {
      if ((deg.get(n.id) || 0) > (deg.get(root.id) || 0)) root = n;
    });

    const dist = new Map();
    dist.set(root.id, 0);
    const queue = [root.id];
    while (queue.length) {
      const cur = queue.shift();
      const curN = findNode(cur);
      tree.edges.forEach(e => {
        const nbr = e[0] === cur ? e[1] : e[1] === cur ? e[0] : null;
        if (nbr !== null && !dist.has(nbr)) {
          const nN = findNode(nbr);
          const d = curN && nN ? Math.hypot(curN.x - nN.x, curN.y - nN.y) / 38 : 1;
          dist.set(nbr, dist.get(cur) + d);
          queue.push(nbr);
        }
      });
    }

    // Create circles for leaf nodes
    tree.nodes.forEach(n => {
      if ((deg.get(n.id) || 0) <= 1) {
        circles.push({
          id: n.id,
          x: n.x,
          y: n.y,
          r: Math.max(9, (dist.get(n.id) || 1) * 10)
        });
      }
    });

    // Iterative force relaxation (400 iterations)
    const W = canvasW || 260, H = canvasH || 300;
    for (let it = 0; it < 400; it++) {
      const lr = 0.35 * (1 - it / 400 * 0.65);
      for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
          const ci = circles[i], cj = circles[j];
          const dx = cj.x - ci.x, dy = cj.y - ci.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 0.001;
          const ov = ci.r + cj.r - d;
          if (ov > 0) {
            const f = ov * lr, nx = dx / d, ny = dy / d;
            ci.x -= f * nx; ci.y -= f * ny;
            cj.x += f * nx; cj.y += f * ny;
          }
        }
      }
      // Boundary clamping
      circles.forEach(c => {
        c.x = Math.max(18 + c.r, Math.min(W - 18 - c.r, c.x));
        c.y = Math.max(18 + c.r, Math.min(H - 18 - c.r, c.y));
      });
    }

    return circles;
  }

  /**
   * Generate creases from packed circles (3-phase algorithm).
   * Returns array of crease objects with phase, label, type, line coords, foldAngle.
   * Coordinates are normalized to unit square.
   */
  function genCreases(circles, canvasW, canvasH) {
    const creases = [];
    if (!circles.length) return creases;

    const W = canvasW || 260, H = canvasH || 300;
    const cx = W / 2, cy = H / 2, sc = Math.min(W, H) * 0.42;

    // Phase 0 — Axial creases (center to each leaf circle)
    circles.forEach((c, i) => {
      creases.push({
        phase: 0,
        label: 'Axial #' + (i + 1),
        type: 'axial',
        line: {
          x1: 0.5,
          y1: 0.5,
          x2: 0.5 + (c.x - cx) / (sc * 2),
          y2: 0.5 + (c.y - cy) / (sc * 2)
        },
        foldAngle: 0.6
      });
    });

    // Phase 1 — Ridge/river bisectors between adjacent circles
    let ridgeIdx = 0;
    for (let i = 0; i < circles.length; i++) {
      for (let j = i + 1; j < circles.length; j++) {
        const ci = circles[i], cj = circles[j];
        const d = Math.hypot(ci.x - cj.x, ci.y - cj.y);
        if (d < (ci.r + cj.r) * 2.8) {
          const mx = (ci.x + cj.x) / 2, my = (ci.y + cj.y) / 2;
          const ax = (cj.x - ci.x) / d, ay = (cj.y - ci.y) / d;
          const px = -ay, py = ax, len = 0.22;
          const type = ridgeIdx % 2 === 0 ? 'mountain' : 'valley';
          creases.push({
            phase: 1,
            label: (type === 'mountain' ? 'Mountain' : 'Valley') + ' ridge ' + (ridgeIdx + 1),
            type,
            line: {
              x1: 0.5 + (mx - px * sc * len - cx) / (sc * 2),
              y1: 0.5 + (my - py * sc * len - cy) / (sc * 2),
              x2: 0.5 + (mx + px * sc * len - cx) / (sc * 2),
              y2: 0.5 + (my + py * sc * len - cy) / (sc * 2)
            },
            foldAngle: 2.4
          });
          ridgeIdx++;
        }
      }
    }

    // Phase 2 — Molecule twist rays at junction nodes
    let molIdx = 0;
    circles.forEach((ci, ii) => {
      const nbrs = circles.filter((cj, jj) =>
        jj !== ii && Math.hypot(ci.x - cj.x, ci.y - cj.y) < (ci.r + cj.r) * 1.9
      );
      if (nbrs.length >= 2) {
        const totR = nbrs.reduce((s, n) => s + n.r, 0);
        let a = 0;
        nbrs.forEach((nb, k) => {
          const theta = (nb.r / totR) * Math.PI;
          const mid = a + theta / 2;
          const nx = 0.5 + (ci.x - cx) / (sc * 2);
          const ny = 0.5 + (ci.y - cy) / (sc * 2);
          const L = 0.055;
          const type = k % 2 === 0 ? 'mountain' : 'valley';
          creases.push({
            phase: 2,
            label: 'Molecule twist ' + (molIdx + 1),
            type,
            line: {
              x1: nx, y1: ny,
              x2: nx + Math.cos(mid) * L,
              y2: ny + Math.sin(mid) * L
            },
            foldAngle: 1.8
          });
          molIdx++;
          a += theta;
        });
      }
    });

    return creases;
  }

  /**
   * Convert crease array into A-Z labeled step objects, sorted by phase.
   */
  function creasesToSteps(creases) {
    const sorted = creases.slice().sort((a, b) => a.phase - b.phase);
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    return sorted.map((c, i) => ({
      id: i < 26 ? letters[i] : letters[Math.floor(i / 26) - 1] + letters[i % 26],
      label: c.label,
      type: c.type === 'axial' ? 'valley' : c.type,
      line: { ...c.line },
      angle: (c.foldAngle || Math.PI) * (180 / Math.PI)
    }));
  }

  /**
   * Full pipeline: tree → circles → creases → steps
   */
  function compute(tree, canvasW, canvasH) {
    const circles = computeCircles(tree, canvasW, canvasH);
    const creases = genCreases(circles, canvasW, canvasH);
    const steps = creasesToSteps(creases);
    return { circles, creases, steps };
  }

  return { compute, computeCircles, genCreases, creasesToSteps };
})();
