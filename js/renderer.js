/**
 * renderer.js — Three.js 3D origami renderer
 *
 * Provides all APIs needed by app.js:
 * - Grid-based paper mesh for sequential fold engine
 * - FOLD-based face rendering for real crease patterns
 * - Crease line overlay with M/V coloring
 * - Keyboard camera controls (1/3/7/5/0/F/arrows)
 */
const Renderer = (() => {
  let scene, camera, renderer, controls;
  let paperFront, paperBack, paperGeo;
  let outlineLine, creaseLinesGroup, foldGroup;
  let baseMeshData;
  let showCL = true;
  let showWF = false;

  let currentCreaseData = [];
  let currentActiveIdx = -1;
  let creaseEntries = [];

  // FOLD rendering
  let foldMeshFront = null, foldMeshBack = null, foldEdgeLines = null;

  const SEGS = 48;
  const CREASE_SAMPLES = 20;
  const OUTLINE_INDICES = buildOutlineIndices();

  // ── Init ──────────────────────────────────────

  function init() {
    const canvas = document.getElementById('gl');
    const vp = document.getElementById('vp');
    const W = vp.clientWidth || 600;
    const H = vp.clientHeight || 600;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0ece4);

    camera = new THREE.PerspectiveCamera(38, W / H, 0.01, 100);
    camera.position.set(0, 3.0, 3.2);
    camera.lookAt(0, 0, 0);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const key = new THREE.DirectionalLight(0xffffff, 0.6);
    key.position.set(3, 6, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0005;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.3);
    fill.position.set(-3, 2, -2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.15);
    rim.position.set(0, 1, -4);
    scene.add(rim);

    // Grid floor
    const grid = new THREE.GridHelper(6, 12, 0xd8d0c8, 0xe0dbd4);
    grid.position.y = -0.015;
    scene.add(grid);

    // Orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0.2, 0);
    controls.update();

    foldGroup = new THREE.Group();
    scene.add(foldGroup);

    // Paper geometry
    paperGeo = new THREE.PlaneGeometry(2, 2, SEGS, SEGS);

    paperFront = new THREE.Mesh(paperGeo, new THREE.MeshPhongMaterial({
      color: 0xdddddd, side: THREE.FrontSide,
      polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1
    }));
    paperFront.castShadow = true;
    paperFront.receiveShadow = true;
    foldGroup.add(paperFront);

    paperBack = new THREE.Mesh(paperGeo, new THREE.MeshPhongMaterial({
      color: 0xffffff, side: THREE.BackSide,
      polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1
    }));
    paperBack.castShadow = true;
    foldGroup.add(paperBack);

    outlineLine = createOutlineLine();
    foldGroup.add(outlineLine);

    creaseLinesGroup = new THREE.Group();
    foldGroup.add(creaseLinesGroup);

    baseMeshData = FoldEngine.createPaperMesh(SEGS);

    window.addEventListener('resize', resize);
    window.addEventListener('keydown', handleKey);

    // Render loop
    requestAnimationFrame(function loop() {
      requestAnimationFrame(loop);
      controls.update();
      renderer.render(scene, camera);
    });
  }

  // ── Outline ───────────────────────────────────

  function buildOutlineIndices() {
    const n = SEGS + 1;
    const idx = [];
    for (let c = 0; c <= SEGS; c++) idx.push(c);
    for (let r = 1; r <= SEGS; r++) idx.push(r * n + SEGS);
    for (let c = SEGS - 1; c >= 0; c--) idx.push(SEGS * n + c);
    for (let r = SEGS - 1; r >= 1; r--) idx.push(r * n);
    return idx;
  }

  function createOutlineLine() {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(OUTLINE_INDICES.length * 3), 3));
    return new THREE.LineLoop(geo, new THREE.LineBasicMaterial({ color: 0x000000 }));
  }

  function updateOutlinePositions() {
    if (!outlineLine || !paperGeo) return;
    const src = paperGeo.attributes.position;
    const tgt = outlineLine.geometry.attributes.position;
    for (let i = 0; i < OUTLINE_INDICES.length; i++) {
      const si = OUTLINE_INDICES[i];
      tgt.setXYZ(i, src.getX(si), src.getY(si), src.getZ(si));
    }
    tgt.needsUpdate = true;
  }

  // ── Resize ────────────────────────────────────

  function resize() {
    const vp = document.getElementById('vp');
    renderer.setSize(vp.clientWidth, vp.clientHeight);
    camera.aspect = vp.clientWidth / vp.clientHeight;
    camera.updateProjectionMatrix();
  }

  // ── Paper update (grid mesh) ──────────────────

  function updatePaper(vertices) {
    if (!paperGeo || !vertices) return;
    const pos = paperGeo.attributes.position;
    const n = Math.min(pos.count, vertices.length);
    for (let i = 0; i < n; i++) {
      const v = vertices[i];
      pos.setXYZ(i, (v.x - 0.5) * 2, v.y * 2, (v.z - 0.5) * 2);
    }
    pos.needsUpdate = true;
    paperGeo.computeVertexNormals();
    updateOutlinePositions();
    if (showCL && currentCreaseData.length) updateCreaseLinePositions();
  }

  function getBaseMesh() { return baseMeshData; }

  function rebuildMesh(foldLines) {
    baseMeshData = FoldEngine.createPaperMesh(SEGS, foldLines);
    const pos = paperGeo.attributes.position;
    const verts = baseMeshData.vertices;
    for (let i = 0; i < verts.length && i < pos.count; i++) {
      pos.setXYZ(i, (verts[i].x - 0.5) * 2, 0, (verts[i].z - 0.5) * 2);
    }
    pos.needsUpdate = true;
    paperGeo.computeVertexNormals();
  }

  // ── Crease lines ──────────────────────────────

  function samplePosition(ux, uz, nOff) {
    const pos = paperGeo.attributes.position;
    const n = SEGS + 1;
    const fx = Math.max(0, Math.min(1, ux)) * SEGS;
    const fz = Math.max(0, Math.min(1, uz)) * SEGS;
    let col = Math.min(Math.floor(fx), SEGS - 1);
    let row = Math.min(Math.floor(fz), SEGS - 1);
    const tx = fx - col, tz = fz - row;
    const i00 = row * n + col, i10 = i00 + 1, i01 = i00 + n, i11 = i01 + 1;
    return {
      x: (1-tx)*(1-tz)*pos.getX(i00) + tx*(1-tz)*pos.getX(i10) + (1-tx)*tz*pos.getX(i01) + tx*tz*pos.getX(i11),
      y: (1-tx)*(1-tz)*pos.getY(i00) + tx*(1-tz)*pos.getY(i10) + (1-tx)*tz*pos.getY(i01) + tx*tz*pos.getY(i11) + nOff,
      z: (1-tx)*(1-tz)*pos.getZ(i00) + tx*(1-tz)*pos.getZ(i10) + (1-tx)*tz*pos.getZ(i01) + tx*tz*pos.getZ(i11)
    };
  }

  function getCreaseColor(stepIdx, type) {
    if (stepIdx < currentActiveIdx) return { color: 0x999999, opacity: 0.3 };
    if (type === 'mountain') return { color: 0xdc143c, opacity: stepIdx === currentActiveIdx ? 1 : 0.75 };
    if (type === 'valley') return { color: 0x4169e1, opacity: stepIdx === currentActiveIdx ? 1 : 0.75 };
    return { color: 0xd3d3d3, opacity: 0.5 };
  }

  function disposeCreaseLines() {
    while (creaseLinesGroup.children.length) {
      const c = creaseLinesGroup.children[0];
      creaseLinesGroup.remove(c);
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    }
    creaseEntries = [];
  }

  function rebuildCreaseLines() {
    disposeCreaseLines();
    if (!showCL || !currentCreaseData.length) return;

    for (let i = 0; i < currentCreaseData.length; i++) {
      const step = currentCreaseData[i];
      const sides = [
        { nOff: 0.006, type: step.type },
        { nOff: -0.006, type: step.type === 'mountain' ? 'valley' : step.type === 'valley' ? 'mountain' : step.type }
      ];
      for (const side of sides) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((CREASE_SAMPLES + 1) * 3), 3));
        const mat = new THREE.LineBasicMaterial({ transparent: true, opacity: 1, depthWrite: false });
        const line = new THREE.Line(geo, mat);
        creaseLinesGroup.add(line);
        creaseEntries.push({ geometry: geo, material: mat, stepIndex: i, lineDef: step.line, type: side.type, nOff: side.nOff });
      }
    }
    refreshCreaseStyles();
  }

  function refreshCreaseStyles() {
    for (const e of creaseEntries) {
      const s = getCreaseColor(e.stepIndex, e.type);
      e.material.color.setHex(s.color);
      e.material.opacity = s.opacity;
    }
  }

  function updateCreaseLinePositions() {
    for (const e of creaseEntries) {
      const arr = e.geometry.attributes.position.array;
      const l = e.lineDef;
      for (let s = 0; s <= CREASE_SAMPLES; s++) {
        const f = s / CREASE_SAMPLES;
        const p = samplePosition(l.x1 + (l.x2 - l.x1) * f, l.y1 + (l.y2 - l.y1) * f, e.nOff);
        arr[s * 3] = p.x; arr[s * 3 + 1] = p.y; arr[s * 3 + 2] = p.z;
      }
      e.geometry.attributes.position.needsUpdate = true;
    }
  }

  function updateCreaseLines(lines, activeIdx) {
    currentCreaseData = lines || [];
    currentActiveIdx = typeof activeIdx === 'number' ? activeIdx : -1;
    if (!showCL) { creaseLinesGroup.visible = false; return; }
    creaseLinesGroup.visible = true;
    rebuildCreaseLines();
    updateCreaseLinePositions();
  }

  function setActiveStep(activeIdx) {
    const next = typeof activeIdx === 'number' ? activeIdx : -1;
    if (next === currentActiveIdx) return;
    currentActiveIdx = next;
    refreshCreaseStyles();
  }

  function setWireframe(on) { showWF = on; }
  function setCreaseLinesVisible(on) {
    showCL = on;
    if (creaseLinesGroup) creaseLinesGroup.visible = on;
    if (on) { rebuildCreaseLines(); updateCreaseLinePositions(); }
  }

  // ── FOLD-based face rendering ─────────────────

  function renderFOLD(foldData) {
    if (!scene || !foldGroup) return;
    clearFOLDMeshes();

    // Hide grid paper
    if (paperFront) paperFront.visible = false;
    if (paperBack) paperBack.visible = false;
    if (outlineLine) outlineLine.visible = false;
    creaseLinesGroup.visible = false;

    const verts = foldData.vertices;
    const faces = foldData.faces;
    const folded = foldData.foldedCoords;
    const t = foldData.t !== undefined ? foldData.t : 1;
    if (!verts || !faces || !faces.length) return;

    // Compute body centerline from folded coords to derive wing height
    // The crane body runs roughly from min-Y to max-Y in the folded projection
    let centerX = 0, centerZ = 0;
    if (folded && folded.length) {
      for (let i = 0; i < folded.length; i++) {
        centerX += folded[i][0]; centerZ += folded[i][1];
      }
      centerX /= folded.length; centerZ /= folded.length;
    }

    // Interpolate flat → folded, with Y from distance to body center
    const positions = [];
    for (let i = 0; i < verts.length; i++) {
      const flat = verts[i];
      const f3d = folded && folded[i] ? folded[i] : flat;
      const fx = flat[0] * (1 - t) + f3d[0] * t;
      const fz = flat[1] * (1 - t) + f3d[1] * t;

      // Wing height: distance from folded body centerline creates Y elevation
      // This makes both wings rise equally above the body
      const distFromCenter = Math.hypot(f3d[0] - centerX, f3d[1] - centerZ);
      const wingHeight = t * distFromCenter * 0.4;

      positions.push(
        (fx - 0.5) * 2,
        wingHeight + t * 0.001 * i,  // wing elevation + z-fight offset
        (fz - 0.5) * 2
      );
    }

    // Triangulate faces
    const indices = [];
    for (const face of faces) {
      for (let j = 1; j < face.length - 1; j++) {
        indices.push(face[0], face[j], face[j + 1]);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    foldMeshFront = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
      color: 0xdddddd, side: THREE.FrontSide,
      polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1
    }));
    foldMeshFront.castShadow = true;
    foldGroup.add(foldMeshFront);

    foldMeshBack = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({
      color: 0xffffff, side: THREE.BackSide,
      polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1
    }));
    foldGroup.add(foldMeshBack);

    // Edge lines
    if (foldData.edges && foldData.assignments) {
      const ep = [], ec = [];
      const posArr = positions;
      for (let i = 0; i < foldData.edges.length; i++) {
        const e = foldData.edges[i], a = foldData.assignments[i];
        let r = 0, g = 0, b = 0;
        if (a === 'M') { r = 0.86; g = 0.08; b = 0.24; }
        else if (a === 'V') { r = 0.25; g = 0.41; b = 0.88; }
        const i0 = e[0] * 3, i1 = e[1] * 3;
        ep.push(posArr[i0], posArr[i0+1] + 0.003, posArr[i0+2], posArr[i1], posArr[i1+1] + 0.003, posArr[i1+2]);
        ec.push(r, g, b, r, g, b);
      }
      const eg = new THREE.BufferGeometry();
      eg.setAttribute('position', new THREE.Float32BufferAttribute(ep, 3));
      eg.setAttribute('color', new THREE.Float32BufferAttribute(ec, 3));
      foldEdgeLines = new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.8 }));
      foldGroup.add(foldEdgeLines);
    }
  }

  function clearFOLDMeshes() {
    if (foldMeshFront) { foldGroup.remove(foldMeshFront); foldMeshFront.geometry.dispose(); foldMeshFront = null; }
    if (foldMeshBack) { foldGroup.remove(foldMeshBack); foldMeshBack.geometry.dispose(); foldMeshBack = null; }
    if (foldEdgeLines) { foldGroup.remove(foldEdgeLines); foldEdgeLines.geometry.dispose(); foldEdgeLines = null; }
  }

  function clearFOLD() {
    clearFOLDMeshes();
    if (paperFront) paperFront.visible = true;
    if (paperBack) paperBack.visible = true;
    if (outlineLine) outlineLine.visible = true;
    creaseLinesGroup.visible = showCL;
  }

  // ── Keyboard camera controls ──────────────────

  const ANIM_DUR = 300;
  const CAM_R = 4.2;
  let camAnim = false;

  const VIEWS = {
    front:  { pos: [0, 0.2, CAM_R],  tgt: [0, 0.2, 0] },
    back:   { pos: [0, 0.2, -CAM_R], tgt: [0, 0.2, 0] },
    right:  { pos: [CAM_R, 0.2, 0],  tgt: [0, 0.2, 0] },
    left:   { pos: [-CAM_R, 0.2, 0], tgt: [0, 0.2, 0] },
    top:    { pos: [0, CAM_R, 0.01], tgt: [0, 0, 0] },
    bottom: { pos: [0, -CAM_R, 0.01],tgt: [0, 0, 0] },
    home:   { pos: [0, 3.0, 3.2],    tgt: [0, 0.2, 0] }
  };

  // Auto-rotate state
  let autoRotating = false;
  let autoRotateSpeed = 0.008; // radians per frame
  let autoRotateDir = 1; // 1 = clockwise, -1 = counter

  function handleKey(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
    if (camAnim) return;
    const k = e.key, sh = e.shiftKey;

    // View presets (numpad style)
    if (k==='1') { goView('front'); e.preventDefault(); return; }
    if (k==='3') { goView('right'); e.preventDefault(); return; }
    if (k==='7') { goView('top');   e.preventDefault(); return; }
    if (sh&&k==='!') { goView('back');  e.preventDefault(); return; }
    if (sh&&k==='#') { goView('left');  e.preventDefault(); return; }
    if (sh&&k==='&') { goView('bottom');e.preventDefault(); return; }
    if (k==='0') { goView('home');  e.preventDefault(); return; }
    if (k==='5') { toggleOrtho();   e.preventDefault(); return; }
    if (k==='f'||k==='F') { frameModel(); e.preventDefault(); return; }

    // ASDX rotate controls (smooth, 15° per press)
    const R = Math.PI / 12;
    if (k==='a'||k==='A') { orbit(-R, 0); e.preventDefault(); return; } // rotate left
    if (k==='d'||k==='D') { orbit(R, 0);  e.preventDefault(); return; } // rotate right
    if (k==='w'||k==='W') { orbit(0, -R); e.preventDefault(); return; } // tilt up
    if (k==='s'||k==='S') { orbit(0, R);  e.preventDefault(); return; } // tilt down
    if (k==='q'||k==='Q') { zoom(-0.3);   e.preventDefault(); return; } // zoom in
    if (k==='e'||k==='E') { zoom(0.3);    e.preventDefault(); return; } // zoom out

    // Arrow keys also rotate
    if (k==='ArrowLeft')  { orbit(-R, 0); e.preventDefault(); return; }
    if (k==='ArrowRight') { orbit(R, 0);  e.preventDefault(); return; }
    if (k==='ArrowUp')    { orbit(0, -R); e.preventDefault(); return; }
    if (k==='ArrowDown')  { orbit(0, R);  e.preventDefault(); return; }
    if (k==='+'||k==='=') { zoom(-0.3); e.preventDefault(); return; }
    if (k==='-'||k==='_') { zoom(0.3);  e.preventDefault(); return; }

    // R = toggle auto-rotate (turntable)
    if (k==='r'||k==='R') {
      autoRotating = !autoRotating;
      if (autoRotating) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 2.0;
      } else {
        controls.autoRotate = false;
      }
      e.preventDefault();
      return;
    }

    // T = reverse auto-rotate direction
    if (k==='t'||k==='T') {
      controls.autoRotateSpeed = -controls.autoRotateSpeed;
      e.preventDefault();
      return;
    }
  }

  function goView(name) {
    const v = VIEWS[name]; if (!v) return;
    const sp = camera.position.clone(), ep = new THREE.Vector3(...v.pos);
    const st = controls.target.clone(), et = new THREE.Vector3(...v.tgt);
    const t0 = performance.now();
    camAnim = true;
    (function tick(now) {
      const p = Math.min(1, (now - t0) / ANIM_DUR);
      const e = p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2, 2)/2;
      camera.position.lerpVectors(sp, ep, e);
      controls.target.lerpVectors(st, et, e);
      controls.update();
      if (p < 1) requestAnimationFrame(tick); else camAnim = false;
    })(t0);
  }

  function orbit(dT, dP) {
    const off = camera.position.clone().sub(controls.target);
    const r = off.length();
    let th = Math.atan2(off.x, off.z) + dT;
    let ph = Math.acos(Math.max(-1, Math.min(1, off.y / r))) + dP;
    ph = Math.max(0.05, Math.min(Math.PI - 0.05, ph));
    off.set(r*Math.sin(ph)*Math.sin(th), r*Math.cos(ph), r*Math.sin(ph)*Math.cos(th));
    camera.position.copy(controls.target).add(off);
    controls.update();
  }

  function zoom(d) {
    const off = camera.position.clone().sub(controls.target);
    off.normalize().multiplyScalar(Math.max(0.5, Math.min(12, off.length() + d)));
    camera.position.copy(controls.target).add(off);
    controls.update();
  }

  function toggleOrtho() {
    const vp = document.getElementById('vp');
    if (camera.isPerspectiveCamera) {
      const dist = camera.position.distanceTo(controls.target);
      const hh = dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const hw = hh * camera.aspect;
      const o = new THREE.OrthographicCamera(-hw, hw, hh, -hh, 0.01, 100);
      o.position.copy(camera.position); o.quaternion.copy(camera.quaternion);
      camera = o;
    } else {
      const p = new THREE.PerspectiveCamera(38, vp.clientWidth / vp.clientHeight, 0.01, 100);
      p.position.copy(camera.position); p.quaternion.copy(camera.quaternion);
      camera = p;
    }
    controls.object = camera;
    controls.update();
  }

  function frameModel() {
    if (!paperGeo) return;
    paperGeo.computeBoundingSphere();
    const s = paperGeo.boundingSphere;
    const c = s.center.clone();
    foldGroup.localToWorld(c);
    const d = s.radius * 2.8;
    const dir = camera.position.clone().sub(controls.target).normalize();
    controls.target.copy(c);
    camera.position.copy(c).add(dir.multiplyScalar(d));
    controls.update();
  }

  // ── Misc ──────────────────────────────────────

  function setGroupTilt() {}
  function showEmpty(show) {
    const el = document.getElementById('empty-msg');
    if (el) el.style.display = show ? 'block' : 'none';
  }
  function getRenderer() { return renderer; }

  // ── Public API ────────────────────────────────

  return {
    init, resize, updatePaper, getBaseMesh, rebuildMesh, getRenderer,
    updateCreaseLines, setActiveStep, setWireframe, setCreaseLinesVisible,
    renderFOLD, clearFOLD, setGroupTilt, showEmpty
  };
})();
