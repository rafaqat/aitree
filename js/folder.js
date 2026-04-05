/**
 * folder.js — Multi-layer sequential origami fold engine
 *
 * Uses "Virtual UV" tracking to correctly handle multi-layer folding:
 *
 * Each vertex maintains a virtualUV — its logical position on the paper.
 * When a vertex is folded across a crease line, its virtualUV is reflected
 * across that line. Subsequent folds classify using these reflected UVs,
 * so the engine correctly knows which side each vertex should be on, even
 * when multiple paper layers are stacked in the same 3D position.
 *
 * This solves the fundamental limitation of the old engine which classified
 * vertices using their original flat UV coordinates, causing all folds after
 * the first to misclassify vertices that had been moved by previous folds.
 *
 * Algorithm per fold step:
 * 1. Classify vertices using virtualUVs (which track logical paper position)
 * 2. Sample the fold axis in current 3D state (via bilinear mesh interpolation)
 * 3. Rotate "moving side" vertices around the 3D fold axis (Rodrigues' formula)
 * 4. When step completes, reflect moved vertices' UVs across the fold line
 *
 * Based on research from:
 * - Amanda Ghassaei's OrigamiSimulator (face-based FOLD format)
 * - Erik Demaine's FOLD specification (layer ordering)
 * - Robert Lang's TreeMaker (crease pattern computation)
 */
const FoldEngine = (() => {
  const EPS = 0.001;

  // ── Geometry primitives ─────────────────────────

  /** Cross-product sign: >0 one side, <0 other side */
  function sideOfLine(px, pz, x1, z1, x2, z2) {
    return (x2 - x1) * (pz - z1) - (z2 - z1) * (px - x1);
  }

  /** Reflect a point across a line defined by two points */
  function reflectAcrossLine(px, pz, x1, z1, x2, z2) {
    const dx = x2 - x1, dz = z2 - z1;
    const len2 = dx * dx + dz * dz;
    if (len2 < 1e-12) return { x: px, z: pz };
    const t = ((px - x1) * dx + (pz - z1) * dz) / len2;
    return {
      x: 2 * (x1 + t * dx) - px,
      z: 2 * (z1 + t * dz) - pz
    };
  }

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  // ── Mesh creation ───────────────────────────────

  /**
   * Generate subdivided grid mesh for unit square [0,1]x[0,1].
   * Vertices on XZ plane (y=0).
   */
  function createPaperMesh(subdivisions) {
    subdivisions = subdivisions || 128;
    const n = subdivisions + 1;
    const vertices = [];
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        vertices.push({ x: col / subdivisions, y: 0, z: row / subdivisions });
      }
    }
    return { vertices, subdivisions };
  }

  // ── Mesh sampling ───────────────────────────────

  /**
   * Sample a point on the current folded mesh by bilinear interpolation.
   * Maps UV coordinate [0,1]² to the current 3D position.
   */
  function sampleMeshPoint(verts3D, subdivisions, ux, uz) {
    const segs = subdivisions || 1;
    const n = segs + 1;
    const fx = clamp01(ux) * segs;
    const fz = clamp01(uz) * segs;
    let col = Math.floor(fx);
    let row = Math.floor(fz);
    col = Math.min(col, segs - 1);
    row = Math.min(row, segs - 1);

    const tx = fx - col;
    const tz = fz - row;

    const i00 = row * n + col;
    const i10 = row * n + col + 1;
    const i01 = (row + 1) * n + col;
    const i11 = (row + 1) * n + col + 1;

    return {
      x: (1 - tx) * (1 - tz) * verts3D[i00].x + tx * (1 - tz) * verts3D[i10].x +
         (1 - tx) * tz * verts3D[i01].x + tx * tz * verts3D[i11].x,
      y: (1 - tx) * (1 - tz) * verts3D[i00].y + tx * (1 - tz) * verts3D[i10].y +
         (1 - tx) * tz * verts3D[i01].y + tx * tz * verts3D[i11].y,
      z: (1 - tx) * (1 - tz) * verts3D[i00].z + tx * (1 - tz) * verts3D[i10].z +
         (1 - tx) * tz * verts3D[i01].z + tx * tz * verts3D[i11].z
    };
  }

  // ── Rotation ────────────────────────────────────

  /**
   * Rotate a 3D point around an axis line (Rodrigues' formula).
   */
  function rotateAroundAxis(p, pivot, axis, angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    const rx = p.x - pivot.x, ry = p.y - pivot.y, rz = p.z - pivot.z;
    const dot = axis.x * rx + axis.y * ry + axis.z * rz;
    const cx = axis.y * rz - axis.z * ry;
    const cy = axis.z * rx - axis.x * rz;
    const cz = axis.x * ry - axis.y * rx;
    return {
      x: pivot.x + rx * c + cx * s + axis.x * dot * (1 - c),
      y: pivot.y + ry * c + cy * s + axis.y * dot * (1 - c),
      z: pivot.z + rz * c + cz * s + axis.z * dot * (1 - c)
    };
  }

  // ── Core fold step ──────────────────────────────

  /**
   * Apply a single fold step to current 3D positions.
   *
   * Classification uses virtualUVs (which track each vertex's logical
   * position after previous folds), not original flat coordinates.
   *
   * The fold axis is sampled from the current 3D mesh state.
   *
   * Returns { verts, moved } where moved[i] = true if vertex i was rotated.
   */
  function applyFoldStep(verts3D, virtualUVs, baseMesh, step, progress) {
    const line = step.line;
    const maxAngle = step.foldAngle || Math.PI;
    const sign = step.type === 'mountain' ? -1 : 1;
    const angle = sign * maxAngle * progress;
    const subdivisions = baseMesh.subdivisions;

    // Sample fold axis endpoints in current 3D state
    const pivot = sampleMeshPoint(verts3D, subdivisions, line.x1, line.y1);
    const lineEnd = sampleMeshPoint(verts3D, subdivisions, line.x2, line.y2);

    const dx = lineEnd.x - pivot.x;
    const dy = lineEnd.y - pivot.y;
    const dz = lineEnd.z - pivot.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (len < 1e-8) {
      return {
        verts: verts3D.map(v => ({ x: v.x, y: v.y, z: v.z })),
        moved: new Uint8Array(verts3D.length)
      };
    }

    const axis = { x: dx / len, y: dy / len, z: dz / len };
    const nV = verts3D.length;
    const result = new Array(nV);
    const moved = new Uint8Array(nV);

    for (let i = 0; i < nV; i++) {
      const uv = virtualUVs[i];
      const side = sideOfLine(uv.x, uv.z, line.x1, line.y1, line.x2, line.y2);

      if (side < -EPS) {
        result[i] = rotateAroundAxis(verts3D[i], pivot, axis, angle);
        moved[i] = 1;
      } else {
        result[i] = { x: verts3D[i].x, y: verts3D[i].y, z: verts3D[i].z };
      }
    }

    return { verts: result, moved: moved };
  }

  // ── Timeline ────────────────────────────────────

  /** Quadratic ease-in-out */
  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  /**
   * Compute folded state at globalProgress ∈ [0, 1].
   *
   * Each fold step gets an equal slice of the timeline.
   * Steps are applied sequentially — each operates on the result of all
   * previous steps. Virtual UVs are updated when each step completes,
   * reflecting moved vertices across the fold line.
   */
  function computeFoldState(baseMesh, steps, globalProgress) {
    const flatVerts = baseMesh.vertices;
    const nV = flatVerts.length;

    if (!steps || !steps.length) {
      return flatVerts.map(v => ({ x: v.x, y: 0, z: v.z }));
    }

    // Initialize: 3D positions from flat, virtual UVs from flat
    let verts = flatVerts.map(v => ({ x: v.x, y: 0, z: v.z }));
    let virtualUVs = flatVerts.map(v => ({ x: v.x, z: v.z }));

    const count = steps.length;

    for (let si = 0; si < count; si++) {
      const start = si / count;
      const end = (si + 1) / count;

      if (globalProgress <= start) break;

      const raw = Math.min(1, (globalProgress - start) / (end - start));
      const progress = ease(raw);

      // Apply this fold using current virtual UVs for classification
      const result = applyFoldStep(verts, virtualUVs, baseMesh, steps[si], progress);
      verts = result.verts;

      // When step is fully complete, reflect virtual UVs of moved vertices
      // This updates their logical position so subsequent folds classify correctly
      if (raw >= 1.0) {
        const line = steps[si].line;
        for (let i = 0; i < nV; i++) {
          if (result.moved[i]) {
            virtualUVs[i] = reflectAcrossLine(
              virtualUVs[i].x, virtualUVs[i].z,
              line.x1, line.y1, line.x2, line.y2
            );
          }
        }
      }
    }

    return verts;
  }

  // ── Utilities ───────────────────────────────────

  // Stubs for compatibility
  function precomputeDeltas() { return []; }
  function buildFlatArray() { return new Float32Array(0); }

  /** Which step index is active at globalProgress */
  function activeStepIndex(steps, globalProgress) {
    if (!steps || !steps.length) return -1;
    if (globalProgress <= 0) return -1;
    const idx = Math.ceil(Math.min(1, globalProgress) * steps.length) - 1;
    return Math.min(idx, steps.length - 1);
  }

  return {
    createPaperMesh,
    computeFoldState,
    precomputeDeltas,
    buildFlatArray,
    activeStepIndex,
    ease
  };
})();
