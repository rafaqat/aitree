/**
 * renderer.js — Three.js 3D scene
 *
 * Technical origami rendering style:
 * - Rigid facets with flat shading (each triangle panel visible)
 * - Thin wireframe mesh overlay showing facet structure
 * - Front = soft paper color, back = lighter tint
 * - Clean edges, academic/architectural quality
 * - Shadows between folded layers
 */
const Renderer = (() => {
  let scene, camera, renderer, controls;
  let paperFront, paperBack, paperGeo;
  let wireframeMesh; // thin wireframe overlay
  let outlineLine, creaseLinesGroup, foldGroup;
  let shadowPlane;
  let baseMeshData;
  let showCL = true;
  let showWF = false;

  let currentCreaseData = [];
  let currentActiveIdx = -1;
  let creaseEntries = [];

  const SEGS = 128;
  const CREASE_SAMPLES = 24;
  const OUTLINE_INDICES = buildOutlineIndices();

  function init() {
    const canvas = document.getElementById('gl');
    const vp = document.getElementById('vp');
    const W = vp.clientWidth || 600;
    const H = vp.clientHeight || 600;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfafafa);

    camera = new THREE.PerspectiveCamera(36, W / H, 0.01, 100);
    camera.position.set(0, 3.2, 3.5);
    camera.lookAt(0, 0, 0);

    // ── Lighting: clean, even, academic diagram style ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const topLight = new THREE.DirectionalLight(0xffffff, 0.6);
    topLight.position.set(0, 80, 20);
    topLight.castShadow = true;
    topLight.shadow.mapSize.width = 2048;
    topLight.shadow.mapSize.height = 2048;
    topLight.shadow.camera.near = 0.5;
    topLight.shadow.camera.far = 200;
    topLight.shadow.camera.left = -4;
    topLight.shadow.camera.right = 4;
    topLight.shadow.camera.top = 4;
    topLight.shadow.camera.bottom = -4;
    topLight.shadow.bias = -0.0003;
    topLight.shadow.normalBias = 0.02;
    scene.add(topLight);

    const fillRight = new THREE.DirectionalLight(0xffffff, 0.35);
    fillRight.position.set(60, 10, 30);
    scene.add(fillRight);

    const fillLeft = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLeft.position.set(-60, 10, -20);
    scene.add(fillLeft);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.15);
    rimLight.position.set(0, -40, -60);
    scene.add(rimLight);

    // ── Ground shadow receiver ──
    const groundGeo = new THREE.PlaneGeometry(10, 10);
    groundGeo.rotateX(-Math.PI / 2);
    shadowPlane = new THREE.Mesh(groundGeo, new THREE.ShadowMaterial({ opacity: 0.12 }));
    shadowPlane.position.y = -0.02;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Subtle floor grid
    const grid = new THREE.GridHelper(6, 18, 0xdddddd, 0xeeeeee);
    grid.position.y = -0.015;
    scene.add(grid);

    // Orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0.15, 0);
    controls.update();

    foldGroup = new THREE.Group();
    scene.add(foldGroup);

    // ── Paper geometry ──
    paperGeo = new THREE.PlaneGeometry(2, 2, SEGS, SEGS);

    // Front face — smooth shading hides grid staircase artifacts
    paperFront = new THREE.Mesh(paperGeo, new THREE.MeshPhongMaterial({
      color: 0xd5cec6,
      side: THREE.FrontSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    }));
    paperFront.castShadow = true;
    paperFront.receiveShadow = true;
    foldGroup.add(paperFront);

    // Back face — warm tint shows when paper flips
    paperBack = new THREE.Mesh(paperGeo, new THREE.MeshPhongMaterial({
      color: 0xe0c0b0,
      side: THREE.BackSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    }));
    paperBack.castShadow = true;
    paperBack.receiveShadow = true;
    foldGroup.add(paperBack);

    // ── Wireframe overlay — toggled with Wireframe button ──
    wireframeMesh = new THREE.LineSegments(
      new THREE.WireframeGeometry(paperGeo),
      new THREE.LineBasicMaterial({
        color: 0x999999,
        transparent: true,
        opacity: 0.15
      })
    );
    wireframeMesh.visible = false;
    foldGroup.add(wireframeMesh);

    // ── Paper edge outline — dark border ──
    outlineLine = createOutlineLine();
    outlineLine.visible = true;
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

  // ── Keyboard camera controls (3D-modeling style) ──────────

  const ANIM_DURATION = 300;
  const CAM_DIST = 4.2;
  let camAnimating = false;

  const VIEW_PRESETS = {
    front:  { pos: [0, 0.2, CAM_DIST],  target: [0, 0.2, 0] },
    back:   { pos: [0, 0.2, -CAM_DIST], target: [0, 0.2, 0] },
    right:  { pos: [CAM_DIST, 0.2, 0],  target: [0, 0.2, 0] },
    left:   { pos: [-CAM_DIST, 0.2, 0], target: [0, 0.2, 0] },
    top:    { pos: [0, CAM_DIST, 0.01],  target: [0, 0, 0] },
    bottom: { pos: [0, -CAM_DIST, 0.01], target: [0, 0, 0] },
    home:   { pos: [0, 3.0, 3.2],        target: [0, 0.2, 0] }
  };

  function handleKey(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
    if (camAnimating) return;

    const k = e.key;
    const shift = e.shiftKey;

    if (k === '1')                   { animateToView('front'); e.preventDefault(); return; }
    if (k === '3')                   { animateToView('right'); e.preventDefault(); return; }
    if (k === '7')                   { animateToView('top');   e.preventDefault(); return; }
    if (shift && k === '!')          { animateToView('back');   e.preventDefault(); return; }
    if (shift && k === '#')          { animateToView('left');   e.preventDefault(); return; }
    if (shift && k === '&')          { animateToView('bottom'); e.preventDefault(); return; }
    if (k === '0')                   { animateToView('home');  e.preventDefault(); return; }
    if (k === '5')                   { toggleOrtho();          e.preventDefault(); return; }
    if (k === 'f' || k === 'F')      { frameModel();           e.preventDefault(); return; }

    const ROT = Math.PI / 12;
    if (k === 'ArrowLeft')  { orbitBy(-ROT, 0); e.preventDefault(); return; }
    if (k === 'ArrowRight') { orbitBy(ROT, 0);  e.preventDefault(); return; }
    if (k === 'ArrowUp')    { orbitBy(0, -ROT); e.preventDefault(); return; }
    if (k === 'ArrowDown')  { orbitBy(0, ROT);  e.preventDefault(); return; }

    if (k === '+' || k === '=') { zoomBy(-0.3); e.preventDefault(); return; }
    if (k === '-' || k === '_') { zoomBy(0.3);  e.preventDefault(); return; }
  }

  function animateToView(name) {
    const preset = VIEW_PRESETS[name];
    if (!preset) return;

    const startPos = camera.position.clone();
    const endPos = new THREE.Vector3(...preset.pos);
    const startTarget = controls.target.clone();
    const endTarget = new THREE.Vector3(...preset.target);
    const startTime = performance.now();

    camAnimating = true;

    function tick(now) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / ANIM_DURATION);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      camera.position.lerpVectors(startPos, endPos, e);
      controls.target.lerpVectors(startTarget, endTarget, e);
      controls.update();

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        camAnimating = false;
      }
    }
    requestAnimationFrame(tick);
  }

  function orbitBy(dTheta, dPhi) {
    const offset = camera.position.clone().sub(controls.target);
    const r = offset.length();
    let theta = Math.atan2(offset.x, offset.z) + dTheta;
    let phi = Math.acos(Math.min(1, Math.max(-1, offset.y / r))) + dPhi;
    phi = Math.max(0.05, Math.min(Math.PI - 0.05, phi));

    offset.x = r * Math.sin(phi) * Math.sin(theta);
    offset.y = r * Math.cos(phi);
    offset.z = r * Math.sin(phi) * Math.cos(theta);

    camera.position.copy(controls.target).add(offset);
    controls.update();
  }

  function zoomBy(delta) {
    const offset = camera.position.clone().sub(controls.target);
    const newLen = Math.max(0.5, Math.min(12, offset.length() + delta));
    offset.normalize().multiplyScalar(newLen);
    camera.position.copy(controls.target).add(offset);
    controls.update();
  }

  function toggleOrtho() {
    const vp = document.getElementById('vp');
    const W = vp.clientWidth;
    const H = vp.clientHeight;

    if (camera.isPerspectiveCamera) {
      const dist = camera.position.distanceTo(controls.target);
      const halfH = dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const halfW = halfH * camera.aspect;
      const ortho = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.01, 100);
      ortho.position.copy(camera.position);
      ortho.quaternion.copy(camera.quaternion);
      camera = ortho;
    } else {
      const persp = new THREE.PerspectiveCamera(38, W / H, 0.01, 100);
      persp.position.copy(camera.position);
      persp.quaternion.copy(camera.quaternion);
      camera = persp;
    }
    controls.object = camera;
    controls.update();
  }

  function frameModel() {
    if (!paperGeo) return;
    paperGeo.computeBoundingSphere();
    const sphere = paperGeo.boundingSphere;
    const center = new THREE.Vector3();
    center.copy(sphere.center);
    foldGroup.localToWorld(center);

    const dist = sphere.radius * 2.8;
    const dir = camera.position.clone().sub(controls.target).normalize();

    controls.target.copy(center);
    camera.position.copy(center).add(dir.multiplyScalar(dist));
    controls.update();
  }

  // ── Outline geometry ──────────────────────────

  function buildOutlineIndices() {
    const n = SEGS + 1;
    const indices = [];
    for (let col = 0; col <= SEGS; col++) indices.push(col);
    for (let row = 1; row <= SEGS; row++) indices.push(row * n + SEGS);
    for (let col = SEGS - 1; col >= 0; col--) indices.push(SEGS * n + col);
    for (let row = SEGS - 1; row >= 1; row--) indices.push(row * n);
    return indices;
  }

  function createOutlineLine() {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(OUTLINE_INDICES.length * 3), 3)
    );

    return new THREE.LineLoop(geo, new THREE.LineBasicMaterial({
      color: 0x333333,
      linewidth: 1
    }));
  }

  // ── Resize ────────────────────────────────────

  function resize() {
    const vp = document.getElementById('vp');
    const W = vp.clientWidth;
    const H = vp.clientHeight;
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }

  function render() {
    // render loop handles this continuously now
  }

  // ── Paper update ──────────────────────────────

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

    if (showCL && currentCreaseData.length) {
      updateCreaseLinePositions();
    }
  }

  function updateOutlinePositions() {
    if (!outlineLine || !paperGeo) return;

    const source = paperGeo.attributes.position;
    const target = outlineLine.geometry.attributes.position;

    for (let i = 0; i < OUTLINE_INDICES.length; i++) {
      const srcIdx = OUTLINE_INDICES[i];
      target.setXYZ(i, source.getX(srcIdx), source.getY(srcIdx), source.getZ(srcIdx));
    }

    target.needsUpdate = true;
    outlineLine.geometry.computeBoundingSphere();
  }

  // ── Bilinear mesh sampling ────────────────────

  function sampleFoldedPositionToArray(ux, uz, nOff, arr, offset) {
    const pos = paperGeo.attributes.position;
    const n = SEGS + 1;

    const fx = Math.max(0, Math.min(1, ux)) * SEGS;
    const fz = Math.max(0, Math.min(1, uz)) * SEGS;
    let col = Math.floor(fx);
    let row = Math.floor(fz);
    col = Math.min(col, SEGS - 1);
    row = Math.min(row, SEGS - 1);
    const tx = fx - col;
    const tz = fz - row;

    const i00 = row * n + col;
    const i10 = row * n + col + 1;
    const i01 = (row + 1) * n + col;
    const i11 = (row + 1) * n + col + 1;

    const x = (1 - tx) * (1 - tz) * pos.getX(i00) + tx * (1 - tz) * pos.getX(i10) +
              (1 - tx) * tz * pos.getX(i01) + tx * tz * pos.getX(i11);
    const y = (1 - tx) * (1 - tz) * pos.getY(i00) + tx * (1 - tz) * pos.getY(i10) +
              (1 - tx) * tz * pos.getY(i01) + tx * tz * pos.getY(i11);
    const z = (1 - tx) * (1 - tz) * pos.getZ(i00) + tx * (1 - tz) * pos.getZ(i10) +
              (1 - tx) * tz * pos.getZ(i01) + tx * tz * pos.getZ(i11);

    arr[offset] = x;
    arr[offset + 1] = y + nOff;
    arr[offset + 2] = z;
  }

  // ── Crease lines ──────────────────────────────

  function invertType(type) {
    if (type === 'mountain') return 'valley';
    if (type === 'valley') return 'mountain';
    return type;
  }

  function getCreaseStyle(stepIndex, type, isBack) {
    // Past steps: subtle gray
    if (stepIndex < currentActiveIdx) {
      return { color: 0x888888, opacity: 0.25 };
    }

    // Mountain: red (like reference diagrams)
    if (type === 'mountain') {
      return {
        color: isBack ? 0xcc4444 : 0xaa2222,
        opacity: stepIndex === currentActiveIdx ? 1.0 : 0.7
      };
    }

    // Valley: blue dashed
    if (type === 'valley') {
      return {
        color: isBack ? 0x4466cc : 0x2244aa,
        opacity: stepIndex === currentActiveIdx ? 1.0 : 0.7
      };
    }

    // Axial/other: dark gray
    return { color: 0x555555, opacity: 0.5 };
  }

  function disposeCreaseLines() {
    while (creaseLinesGroup.children.length) {
      const child = creaseLinesGroup.children[0];
      creaseLinesGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }
    creaseEntries = [];
  }

  function refreshCreaseStyles() {
    for (let i = 0; i < creaseEntries.length; i++) {
      const entry = creaseEntries[i];
      const style = getCreaseStyle(entry.stepIndex, entry.type, entry.isBack);
      entry.material.color.setHex(style.color);
      entry.material.opacity = style.opacity;
      entry.material.needsUpdate = true;
    }
  }

  function rebuildCreaseLines() {
    disposeCreaseLines();

    if (!showCL || !currentCreaseData.length) return;

    for (let i = 0; i < currentCreaseData.length; i++) {
      const step = currentCreaseData[i];
      const defs = [
        { isBack: false, nOff: 0.008, type: step.type },
        { isBack: true, nOff: -0.008, type: invertType(step.type) }
      ];

      for (let d = 0; d < defs.length; d++) {
        const def = defs[d];
        const geo = new THREE.BufferGeometry();
        geo.setAttribute(
          'position',
          new THREE.BufferAttribute(new Float32Array((CREASE_SAMPLES + 1) * 3), 3)
        );

        const material = new THREE.LineBasicMaterial({
          transparent: true,
          opacity: 1,
          depthWrite: false
        });

        const line = new THREE.Line(geo, material);
        creaseLinesGroup.add(line);
        creaseEntries.push({
          geometry: geo,
          material,
          line,
          stepIndex: i,
          lineDef: step.line,
          type: def.type,
          isBack: def.isBack,
          nOff: def.nOff
        });
      }
    }

    refreshCreaseStyles();
  }

  function updateCreaseLinePositions() {
    for (let i = 0; i < creaseEntries.length; i++) {
      const entry = creaseEntries[i];
      const arr = entry.geometry.attributes.position.array;
      const line = entry.lineDef;

      for (let s = 0; s <= CREASE_SAMPLES; s++) {
        const frac = s / CREASE_SAMPLES;
        const ux = line.x1 + (line.x2 - line.x1) * frac;
        const uz = line.y1 + (line.y2 - line.y1) * frac;
        sampleFoldedPositionToArray(ux, uz, entry.nOff, arr, s * 3);
      }

      entry.geometry.attributes.position.needsUpdate = true;
      entry.geometry.computeBoundingSphere();
    }
  }

  function updateCreaseLines(lines, activeIdx) {
    currentCreaseData = lines || [];
    currentActiveIdx = typeof activeIdx === 'number' ? activeIdx : -1;

    if (!showCL) {
      creaseLinesGroup.visible = false;
      return;
    }

    creaseLinesGroup.visible = true;
    rebuildCreaseLines();
    updateCreaseLinePositions();
  }

  function setActiveStep(activeIdx) {
    const nextIdx = typeof activeIdx === 'number' ? activeIdx : -1;
    if (nextIdx === currentActiveIdx) return;
    currentActiveIdx = nextIdx;
    refreshCreaseStyles();

  }

  function setWireframe(on) {
    showWF = on;
    if (wireframeMesh) wireframeMesh.visible = on;
  }

  function setCreaseLinesVisible(on) {
    showCL = on;
    if (!creaseLinesGroup) return;

    creaseLinesGroup.visible = on;
    if (on) {
      rebuildCreaseLines();
      updateCreaseLinePositions();
    }
  }

  function getBaseMesh() { return baseMeshData; }

  function setGroupTilt() {}

  function showEmpty(show) {
    const el = document.getElementById('empty-msg');
    if (el) el.style.display = show ? 'block' : 'none';
  }

  return {
    init,
    updatePaper,
    updateCreaseLines,
    setActiveStep,
    setWireframe,
    setCreaseLinesVisible,
    getBaseMesh,
    setGroupTilt,
    showEmpty,
    resize
  };
})();
