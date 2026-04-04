/**
 * validator.js — Kawasaki, Maekawa, disk packing, tree feasibility
 *
 * Implements flat-foldability theorems from computational origami research.
 * Returns pass/warn/fail status for each check.
 */
const Validator = (() => {
  const EPS = 1e-6;

  /**
   * Find all interior vertices (points where 3+ crease lines meet).
   * creases: array of {line:{x1,y1,x2,y2}, type:string}
   * Returns array of {x, z, creases: [indices]}
   */
  function findVertices(creases) {
    const vtxMap = new Map(); // "x,z" → {x, z, creaseIndices: Set}

    function key(x, z) {
      return Math.round(x * 1000) + ',' + Math.round(z * 1000);
    }

    creases.forEach((c, i) => {
      const pts = [
        { x: c.line.x1, z: c.line.y1 },
        { x: c.line.x2, z: c.line.y2 }
      ];
      for (const p of pts) {
        const k = key(p.x, p.z);
        if (!vtxMap.has(k)) vtxMap.set(k, { x: p.x, z: p.z, creaseIndices: new Set() });
        vtxMap.get(k).creaseIndices.add(i);
      }
    });

    // Also find intersections between crease lines
    for (let i = 0; i < creases.length; i++) {
      for (let j = i + 1; j < creases.length; j++) {
        const pt = lineIntersect(creases[i].line, creases[j].line);
        if (pt) {
          const k = key(pt.x, pt.z);
          if (!vtxMap.has(k)) vtxMap.set(k, { x: pt.x, z: pt.z, creaseIndices: new Set() });
          vtxMap.get(k).creaseIndices.add(i);
          vtxMap.get(k).creaseIndices.add(j);
        }
      }
    }

    // Interior vertices have 3+ creases AND are inside the paper [0,1]
    return Array.from(vtxMap.values()).filter(v =>
      v.creaseIndices.size >= 3 && v.x > EPS && v.x < 1 - EPS && v.z > EPS && v.z < 1 - EPS
    );
  }

  /** Segment-segment intersection (returns point or null) */
  function lineIntersect(a, b) {
    const dx1 = a.x2 - a.x1, dy1 = a.y2 - a.y1;
    const dx2 = b.x2 - b.x1, dy2 = b.y2 - b.y1;
    const denom = dx1 * dy2 - dy1 * dx2;
    if (Math.abs(denom) < EPS) return null;
    const t = ((b.x1 - a.x1) * dy2 - (b.y1 - a.y1) * dx2) / denom;
    const u = ((b.x1 - a.x1) * dy1 - (b.y1 - a.y1) * dx1) / denom;
    if (t < EPS || t > 1 - EPS || u < EPS || u > 1 - EPS) return null;
    return { x: a.x1 + t * dx1, z: a.y1 + t * dy1 };
  }

  /**
   * Kawasaki-Justin theorem: at each interior vertex,
   * alternating angles sum to 180 degrees.
   */
  function checkKawasaki(creases) {
    if (!creases || creases.length < 2) return 'warn';

    const vertices = findVertices(creases);
    if (vertices.length === 0) return 'warn'; // no interior vertices to check

    for (const vtx of vertices) {
      const indices = Array.from(vtx.creaseIndices);
      // Compute angles of each crease line relative to vertex
      const angles = [];
      for (const ci of indices) {
        const c = creases[ci];
        // Direction away from vertex
        let dx, dz;
        if (Math.abs(c.line.x1 - vtx.x) < 0.01 && Math.abs(c.line.y1 - vtx.z) < 0.01) {
          dx = c.line.x2 - vtx.x; dz = c.line.y2 - vtx.z;
        } else {
          dx = c.line.x1 - vtx.x; dz = c.line.y1 - vtx.z;
        }
        angles.push(Math.atan2(dz, dx));
      }
      angles.sort((a, b) => a - b);

      // Compute sector angles
      const sectors = [];
      for (let i = 0; i < angles.length; i++) {
        const next = (i + 1) % angles.length;
        let diff = angles[next] - angles[i];
        if (diff < 0) diff += 2 * Math.PI;
        sectors.push(diff);
      }

      // Alternating sums should equal PI
      let oddSum = 0, evenSum = 0;
      for (let i = 0; i < sectors.length; i++) {
        if (i % 2 === 0) evenSum += sectors[i];
        else oddSum += sectors[i];
      }

      if (Math.abs(oddSum - Math.PI) > 0.1 || Math.abs(evenSum - Math.PI) > 0.1) {
        return 'fail';
      }
    }
    return 'pass';
  }

  /**
   * Maekawa's theorem: at each vertex, |mountains - valleys| = 2
   */
  function checkMaekawa(creases) {
    if (!creases || creases.length < 2) return 'warn';

    const vertices = findVertices(creases);
    if (vertices.length === 0) return 'warn';

    for (const vtx of vertices) {
      let m = 0, v = 0;
      for (const ci of vtx.creaseIndices) {
        const type = creases[ci].type;
        if (type === 'mountain') m++;
        else if (type === 'valley') v++;
      }
      if (m + v > 0 && Math.abs(m - v) !== 2) return 'fail';
    }
    return 'pass';
  }

  /**
   * Disk packing: no two circles overlap
   */
  function checkDiskPacking(circles) {
    if (!circles || circles.length < 2) return 'warn';
    for (let i = 0; i < circles.length; i++) {
      for (let j = i + 1; j < circles.length; j++) {
        const ci = circles[i], cj = circles[j];
        const d = Math.hypot(ci.x - cj.x, ci.y - cj.y);
        if (d < ci.r + cj.r - 3) return 'fail';
      }
    }
    return 'pass';
  }

  /**
   * Tree feasibility: connected graph, >= 2 nodes, >= 1 edge
   */
  function checkTreeFeasibility(tree) {
    if (!tree || !tree.nodes || tree.nodes.length < 2) return 'fail';
    if (!tree.edges || tree.edges.length < 1) return 'fail';

    // BFS connectivity check
    const adj = new Map();
    tree.nodes.forEach(n => adj.set(n.id, []));
    tree.edges.forEach(e => {
      if (adj.has(e[0]) && adj.has(e[1])) {
        adj.get(e[0]).push(e[1]);
        adj.get(e[1]).push(e[0]);
      }
    });

    const visited = new Set();
    const queue = [tree.nodes[0].id];
    visited.add(tree.nodes[0].id);
    while (queue.length) {
      const cur = queue.shift();
      for (const nbr of (adj.get(cur) || [])) {
        if (!visited.has(nbr)) { visited.add(nbr); queue.push(nbr); }
      }
    }

    return visited.size === tree.nodes.length ? 'pass' : 'fail';
  }

  /**
   * Run all validations.
   * Returns { kawasaki, maekawa, packing, tree } each 'pass'|'warn'|'fail'
   */
  function validate(creases, circles, tree) {
    return {
      kawasaki: checkKawasaki(creases),
      maekawa: checkMaekawa(creases),
      packing: checkDiskPacking(circles),
      tree: checkTreeFeasibility(tree)
    };
  }

  return { validate };
})();
