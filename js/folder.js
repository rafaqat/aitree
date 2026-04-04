/**
 * folder.js — Rigid origami fold engine (hinge-based)
 *
 * Key improvement over prototype: binary side-of-line classification
 * with true rigid rotation (Rodrigues' formula) instead of soft
 * exponential falloff. Steps accumulate sequentially.
 */
const FoldEngine = (() => {

  /** Cross-product sign: >0 left, <0 right, ~0 on line */
  function sideOfLine(px, pz, x1, z1, x2, z2) {
    return (x2 - x1) * (pz - z1) - (z2 - z1) * (px - x1);
  }

  /** Rodrigues' rotation matrix around normalized axis by angle (radians) */
  function axisAngleMatrix(ax, ay, az, angle) {
    const c = Math.cos(angle), s = Math.sin(angle), t = 1 - c;
    return [
      t*ax*ax + c,      t*ax*ay - s*az,  t*ax*az + s*ay,
      t*ax*ay + s*az,   t*ay*ay + c,     t*ay*az - s*ax,
      t*ax*az - s*ay,   t*ay*az + s*ax,  t*az*az + c
    ];
  }

  /** Apply 3x3 rotation matrix to vector */
  function rotVec(m, x, y, z) {
    return {
      x: m[0]*x + m[1]*y + m[2]*z,
      y: m[3]*x + m[4]*y + m[5]*z,
      z: m[6]*x + m[7]*y + m[8]*z
    };
  }

  /**
   * Generate subdivided grid mesh for unit square [0,1]x[0,1].
   * Vertices on XZ plane (y=0).
   */
  function createPaperMesh(subdivisions) {
    subdivisions = subdivisions || 40;
    const n = subdivisions + 1;
    const vertices = [];
    const triangles = [];

    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        vertices.push({ x: col / subdivisions, y: 0, z: row / subdivisions });
      }
    }
    for (let row = 0; row < subdivisions; row++) {
      for (let col = 0; col < subdivisions; col++) {
        const tl = row * n + col, tr = tl + 1;
        const bl = (row + 1) * n + col, br = bl + 1;
        triangles.push([tl, bl, tr]);
        triangles.push([tr, bl, br]);
      }
    }
    return { vertices, triangles };
  }

  /**
   * Apply a single fold to a set of vertices.
   *
   * classifyPositions: the 2D positions used to determine which side each vertex is on
   *   (these are the positions BEFORE this fold, in the accumulated state)
   * vertices: current 3D positions to transform
   * step: { line:{x1,y1,x2,y2}, type:'mountain'|'valley', angle:degrees }
   * progress: 0..1 interpolation
   *
   * Returns new vertex array with one side rotated around the fold line.
   */
  function applyFold(vertices, classifyPositions, step, progress) {
    const { line, type } = step;
    const angleDeg = step.angle || 180;
    const angleRad = angleDeg * (Math.PI / 180) * progress;
    const sign = type === 'mountain' ? -1 : 1;
    const foldAngle = sign * angleRad;

    // Fold line as 3D axis (on XZ plane)
    const dx = line.x2 - line.x1;
    const dz = line.y2 - line.y1;
    const len = Math.sqrt(dx * dx + dz * dz) || 1;
    const ax = dx / len, az = dz / len; // axis in XZ plane, ay=0

    // Pivot point on fold line
    const px = line.x1, pz = line.y1;

    // Build rotation matrix
    const m = axisAngleMatrix(ax, 0, az, foldAngle);

    const result = new Array(vertices.length);
    for (let i = 0; i < vertices.length; i++) {
      const cp = classifyPositions[i];
      const side = sideOfLine(cp.x, cp.z, line.x1, line.y1, line.x2, line.y2);

      if (side < -0.0001) {
        // Rotate this vertex around the fold line
        const v = vertices[i];
        const rx = v.x - px, ry = v.y, rz = v.z - pz;
        const rot = rotVec(m, rx, ry, rz);
        result[i] = { x: rot.x + px, y: rot.y, z: rot.z + pz };
      } else {
        result[i] = { x: vertices[i].x, y: vertices[i].y, z: vertices[i].z };
      }
    }
    return result;
  }

  /**
   * Compute the fully folded state at globalProgress through all steps.
   *
   * Steps execute sequentially. For each completed step, apply the full fold
   * and update the classification positions for the next step.
   * The active (partial) step uses interpolated progress.
   */
  function computeFoldState(baseMesh, steps, globalProgress) {
    if (!steps || !steps.length) return baseMesh.vertices.map(v => ({ ...v }));

    let verts = baseMesh.vertices.map(v => ({ ...v }));
    let classifyPos = baseMesh.vertices.map(v => ({ ...v }));

    const count = steps.length;
    const sliceW = 1 / count;
    const overlap = 0.15;

    for (let i = 0; i < count; i++) {
      const start = Math.max(0, i * sliceW - overlap * 0.5);
      const end = Math.min(1, (i + 1) * sliceW + overlap * 0.5);

      if (globalProgress <= start) break;

      const raw = Math.min(1, (globalProgress - start) / (end - start));
      const progress = ease(raw);

      verts = applyFold(verts, classifyPos, steps[i], progress);

      // Once step is complete, update classify positions for next step
      if (raw >= 1) {
        classifyPos = verts.map(v => ({ ...v }));
      }
    }
    return verts;
  }

  /** Quadratic ease-in-out (from prototype) */
  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  /** Which step index is active at globalProgress */
  function activeStepIndex(steps, globalProgress) {
    if (!steps || !steps.length) return -1;
    const count = steps.length;
    const sliceW = 1 / count;
    const overlap = 0.15;

    for (let i = count - 1; i >= 0; i--) {
      const start = Math.max(0, i * sliceW - overlap * 0.5);
      const end = Math.min(1, (i + 1) * sliceW + overlap * 0.5);
      if (globalProgress > start && globalProgress <= end) return i;
    }
    return globalProgress >= 1 ? count - 1 : 0;
  }

  return { createPaperMesh, computeFoldState, activeStepIndex, sideOfLine, ease };
})();
