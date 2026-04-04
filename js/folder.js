/**
 * folder.js — Soft-influence fold engine (ported from prototype)
 *
 * Pre-computes per-vertex displacement deltas for each fold step using
 * Rodrigues' rotation with exponential falloff. During animation, starts
 * from flat and accumulates weighted deltas additively.
 *
 * This produces smooth, organic-looking folds that approximate real paper
 * without needing to track layers.
 */
const FoldEngine = (() => {

  /**
   * Generate subdivided grid mesh for unit square [0,1]x[0,1].
   * Vertices on XZ plane (y=0), stored as flat Float32Array for perf.
   */
  function createPaperMesh(subdivisions) {
    subdivisions = subdivisions || 40;
    const n = subdivisions + 1;
    const vertices = [];
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        vertices.push({ x: col / subdivisions, y: 0, z: row / subdivisions });
      }
    }
    return { vertices, subdivisions };
  }

  /**
   * Pre-compute per-vertex displacement deltas for a set of fold steps.
   *
   * Each step's crease line acts as a hinge. Vertices near the crease fold
   * sharply; far vertices fold gently (exponential falloff).
   *
   * Uses Rodrigues' rotation formula around the crease axis.
   *
   * flatPositions: Float32Array [x,y,z, x,y,z, ...] — flat paper positions
   * steps: array of { line:{x1,y1,x2,y2}, type, angle, foldAngle }
   *
   * Returns array of Float32Array deltas, one per step.
   */
  function precomputeDeltas(flatPositions, steps) {
    const nV = flatPositions.length / 3;
    const deltas = [];

    for (let si = 0; si < steps.length; si++) {
      const step = steps[si];
      const line = step.line;
      const delta = new Float32Array(nV * 3);

      // Crease line direction
      const ax = line.x2 - line.x1;
      const ay = line.y2 - line.y1;
      const len = Math.sqrt(ax * ax + ay * ay) || 1;
      const ux = ax / len, uy = ay / len; // unit along crease
      const nx = -uy, ny = ux;            // normal to crease (in plane)

      const foldSign = step.type === 'mountain' ? 1 : -1;
      // Use foldAngle (radians) if provided, otherwise convert degrees to radians
      const maxAngle = step.foldAngle || ((step.angle || 180) * Math.PI / 180);

      for (let i = 0; i < nV; i++) {
        const vx = flatPositions[i * 3];
        const vy = flatPositions[i * 3 + 1];

        // Project vertex relative to crease start point
        const pvx = vx - line.x1;
        const pvy = vy - line.y1;
        const along = pvx * ux + pvy * uy; // distance along crease
        const perp = pvx * nx + pvy * ny;  // signed distance from crease

        if (Math.abs(perp) < 0.0005) {
          delta[i * 3] = 0; delta[i * 3 + 1] = 0; delta[i * 3 + 2] = 0;
          continue;
        }

        // Steep sigmoid: flat panels with sharp hinge at the crease.
        // Vertices on the positive side get full rotation (influence → 1.0),
        // vertices on negative side stay put (influence → 0.0),
        // with a narrow smooth transition at the crease itself.
        const HINGE_SHARPNESS = 60; // higher = sharper crease
        const HINGE_WIDTH = 0.02;   // transition zone width in paper units
        const influence = 1.0 / (1.0 + Math.exp(-HINGE_SHARPNESS * (perp - HINGE_WIDTH)));

        // Full fold angle for vertices on the fold side
        const angle = foldSign * maxAngle * influence;

        // Nearest point on crease to this vertex
        const crPx = line.x1 + along * ux;
        const crPy = line.y1 + along * uy;
        const relX = vx - crPx;
        const relY = vy - crPy;

        // Rodrigues' rotation around crease axis (ux, uy, 0):
        const kxvZ = ux * relY - uy * relX;
        const kkxvX = uy * kxvZ;
        const kkxvY = -ux * kxvZ;

        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        // Delta from rotation — NO extra influence scaling (angle handles it)
        delta[i * 3]     = (1 - cosA) * kkxvX;    // dx
        delta[i * 3 + 1] = (1 - cosA) * kkxvY;    // dy
        delta[i * 3 + 2] = sinA * kxvZ;            // dz (main lift)
      }
      deltas.push(delta);
    }
    return deltas;
  }

  /**
   * Build flat position array from paper mesh vertices.
   * Maps unit-square coords to PlaneGeometry coords (centered, size 2).
   */
  function buildFlatArray(baseMesh) {
    const verts = baseMesh.vertices;
    const flat = new Float32Array(verts.length * 3);
    for (let i = 0; i < verts.length; i++) {
      flat[i * 3]     = (verts[i].x - 0.5) * 2;
      flat[i * 3 + 1] = (verts[i].z - 0.5) * 2; // z maps to y in PlaneGeometry
      flat[i * 3 + 2] = 0;
    }
    return flat;
  }

  /**
   * Compute folded vertex positions at a given global progress.
   *
   * Starts from flat, accumulates each step's pre-computed delta
   * weighted by its eased progress. This is additive, not sequential.
   */
  function computeFoldState(baseMesh, steps, globalProgress, deltas, flatPositions) {
    const verts = baseMesh.vertices;
    const nV = verts.length;
    const result = new Array(nV);

    if (!steps || !steps.length || !deltas || !flatPositions) {
      for (let i = 0; i < nV; i++) {
        result[i] = { x: verts[i].x, y: 0, z: verts[i].z };
      }
      return result;
    }

    // Start from flat positions
    const px = new Float32Array(nV);
    const py = new Float32Array(nV);
    const pz = new Float32Array(nV);
    for (let i = 0; i < nV; i++) {
      px[i] = flatPositions[i * 3];
      py[i] = flatPositions[i * 3 + 1];
      pz[i] = flatPositions[i * 3 + 2];
    }

    // Each step gets its own discrete slice — one fold at a time.
    // Previous steps are fully applied (stepT=1), current step animates.
    const count = steps.length;
    const sliceW = 1 / count;

    for (let si = 0; si < count; si++) {
      const start = si * sliceW;
      const end = (si + 1) * sliceW;

      if (globalProgress <= start) break; // haven't reached this step yet

      const raw = Math.min(1, (globalProgress - start) / (end - start));
      const stepT = ease(raw);

      const delta = deltas[si];
      for (let i = 0; i < nV; i++) {
        px[i] += delta[i * 3]     * stepT;
        py[i] += delta[i * 3 + 1] * stepT;
        pz[i] += delta[i * 3 + 2] * stepT;
      }
    }

    // Convert back to unit-square space for renderer
    for (let i = 0; i < nV; i++) {
      result[i] = {
        x: px[i] / 2 + 0.5,
        y: pz[i],           // z (lift) becomes y in our coordinate system
        z: py[i] / 2 + 0.5
      };
    }
    return result;
  }

  /** Quadratic ease-in-out (from prototype) */
  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  /** Which step index is active at globalProgress */
  function activeStepIndex(steps, globalProgress) {
    if (!steps || !steps.length) return -1;
    const idx = Math.floor(globalProgress * steps.length);
    return Math.min(idx, steps.length - 1);
  }

  return { createPaperMesh, precomputeDeltas, buildFlatArray, computeFoldState,
           activeStepIndex, ease };
})();
