/**
 * folder.js — Sequential rigid-hinge fold engine
 *
 * Each fold step:
 * 1. Classifies vertices using ORIGINAL flat 2D positions (which side of fold line)
 * 2. Rotates the moving side in 3D around the fold line axis
 * 3. Next step operates on the already-folded result
 *
 * This produces flat panels with sharp creases, folded one at a time.
 */
const FoldEngine = (() => {

  /** Cross-product sign: >0 one side, <0 other side */
  function sideOfLine(px, pz, x1, z1, x2, z2) {
    return (x2 - x1) * (pz - z1) - (z2 - z1) * (px - x1);
  }

  /**
   * Generate subdivided grid mesh for unit square [0,1]x[0,1].
   * Vertices on XZ plane (y=0).
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
   * Rotate a 3D point around an axis line (Rodrigues' formula).
   * p: point {x,y,z}
   * pivot: point on the axis {x,y,z}
   * axis: normalized direction {x,y,z}
   * angle: radians
   */
  function rotateAroundAxis(p, pivot, axis, angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    // Translate to pivot
    const rx = p.x - pivot.x, ry = p.y - pivot.y, rz = p.z - pivot.z;
    // Rodrigues: v*cos + (k×v)*sin + k*(k·v)*(1-cos)
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

  /**
   * Apply a single fold step to current 3D positions.
   * Uses original flat positions for side classification.
   * Rotates one side around the fold line in 3D.
   */
  function applyFold(verts3D, flatVerts, step, progress) {
    const line = step.line;
    const maxAngle = step.foldAngle || ((step.angle || 180) * Math.PI / 180);
    const sign = step.type === 'mountain' ? -1 : 1;
    const angle = sign * maxAngle * progress;

    // Fold line axis direction (in XZ plane, y=0)
    const dx = line.x2 - line.x1;
    const dz = line.y2 - line.y1;
    const len = Math.sqrt(dx * dx + dz * dz) || 1;
    const axis = { x: dx / len, y: 0, z: dz / len };
    const pivot = { x: line.x1, y: 0, z: line.y1 };

    const result = new Array(verts3D.length);
    for (let i = 0; i < verts3D.length; i++) {
      const flat = flatVerts[i];
      const side = sideOfLine(flat.x, flat.z, line.x1, line.y1, line.x2, line.y2);

      if (side < -0.001) {
        // Rotate this vertex around the fold line
        result[i] = rotateAroundAxis(verts3D[i], pivot, axis, angle);
      } else {
        result[i] = { x: verts3D[i].x, y: verts3D[i].y, z: verts3D[i].z };
      }
    }
    return result;
  }

  /**
   * Compute folded state at globalProgress.
   * Each step is sequential — operates on the result of all previous steps.
   * Each step gets a discrete 1/N slice of the timeline.
   */
  function computeFoldState(baseMesh, steps, globalProgress) {
    const flatVerts = baseMesh.vertices;
    const nV = flatVerts.length;

    if (!steps || !steps.length) {
      return flatVerts.map(v => ({ x: v.x, y: 0, z: v.z }));
    }

    // Start from flat
    let verts = flatVerts.map(v => ({ x: v.x, y: 0, z: v.z }));

    const count = steps.length;
    for (let si = 0; si < count; si++) {
      const start = si / count;
      const end = (si + 1) / count;

      if (globalProgress <= start) break;

      const raw = Math.min(1, (globalProgress - start) / (end - start));
      const progress = ease(raw);

      verts = applyFold(verts, flatVerts, steps[si], progress);
    }

    return verts;
  }

  // Stubs for compatibility — no longer needed with sequential approach
  function precomputeDeltas() { return []; }
  function buildFlatArray() { return new Float32Array(0); }

  /** Quadratic ease-in-out */
  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  /** Which step index is active at globalProgress */
  function activeStepIndex(steps, globalProgress) {
    if (!steps || !steps.length) return -1;
    const idx = Math.floor(globalProgress * steps.length);
    return Math.min(idx, steps.length - 1);
  }

  return { createPaperMesh, computeFoldState, precomputeDeltas, buildFlatArray,
           activeStepIndex, ease };
})();
