/**
 * renderer.js — Three.js 3D scene, camera, orbit controls, paper mesh
 * Ported from prototype's initThree() + build3D() with OrbitControls upgrade
 */
const Renderer = (() => {
  let scene, camera, renderer, controls;
  let paperMesh, paperGeo, creaseLinesGroup, foldGroup;
  let baseMeshData;
  let showCL = true;
  const SEGS = 40;

  function init() {
    const canvas = document.getElementById('gl');
    const vp = document.getElementById('vp');
    const W = vp.clientWidth || 600, H = vp.clientHeight || 600;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05050a);
    scene.fog = new THREE.FogExp2(0x05050a, 0.065);

    camera = new THREE.PerspectiveCamera(44, W / H, 0.01, 100);
    camera.position.set(0, 1.4, 3.5);
    camera.lookAt(0, 0, 0);

    // Lights (matched from prototype)
    scene.add(new THREE.AmbientLight(0xffffff, 0.22));
    const dl = new THREE.DirectionalLight(0xd0f0b0, 0.95);
    dl.position.set(2, 4, 3); dl.castShadow = true; scene.add(dl);
    const fl = new THREE.DirectionalLight(0x90c0f0, 0.4);
    fl.position.set(-3, 1, -2); scene.add(fl);
    const rl = new THREE.PointLight(0xf0c890, 0.65, 10);
    rl.position.set(0, -2, 1); scene.add(rl);

    // Grid
    const grid = new THREE.GridHelper(8, 24, 0x181820, 0x111118);
    grid.position.y = -0.55; scene.add(grid);

    // OrbitControls (upgrade from prototype's manual orbit)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0.1, 0);
    controls.update();

    // Fold group holds paper + crease lines
    foldGroup = new THREE.Group();
    scene.add(foldGroup);

    // Paper mesh
    paperGeo = new THREE.PlaneGeometry(2, 2, SEGS, SEGS);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xeae4d6, roughness: 0.5, metalness: 0.0,
      side: THREE.DoubleSide, transparent: true, opacity: 0.96
    });
    paperMesh = new THREE.Mesh(paperGeo, mat);
    paperMesh.castShadow = true;
    paperMesh.receiveShadow = true;
    foldGroup.add(paperMesh);

    // Crease lines group
    creaseLinesGroup = new THREE.Group();
    foldGroup.add(creaseLinesGroup);

    // Store base mesh data for fold engine
    baseMeshData = FoldEngine.createPaperMesh(SEGS);

    window.addEventListener('resize', resize);
    loop();
  }

  function resize() {
    const vp = document.getElementById('vp');
    const W = vp.clientWidth, H = vp.clientHeight;
    renderer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }

  function loop() {
    requestAnimationFrame(loop);
    controls.update();
    renderer.render(scene, camera);
  }

  /**
   * Update paper mesh from folded vertex positions.
   * Vertices are in unit-square [0,1] space; map to [-1,1] world coords.
   */
  function updatePaper(vertices) {
    const pos = paperGeo.attributes.position;
    const n = pos.count;
    for (let i = 0; i < n && i < vertices.length; i++) {
      const v = vertices[i];
      pos.setXYZ(i, (v.x - 0.5) * 2, v.y * 2, (v.z - 0.5) * 2);
    }
    pos.needsUpdate = true;
    paperGeo.computeVertexNormals();
  }

  /**
   * Draw crease lines on the paper surface.
   * lines: array of {line:{x1,y1,x2,y2}, type:'mountain'|'valley'|'axial'}
   */
  function updateCreaseLines(lines) {
    // Clear old
    while (creaseLinesGroup.children.length) {
      const c = creaseLinesGroup.children[0];
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
      creaseLinesGroup.remove(c);
    }
    if (!lines || !showCL) return;

    for (const step of lines) {
      const col = step.type === 'mountain' ? 0xf07070
                : step.type === 'valley' ? 0x6090f0
                : 0x80c0f0;
      const opacity = step.type === 'axial' ? 0.35 : 0.8;
      const material = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity });
      const pts = [
        new THREE.Vector3((step.line.x1 - 0.5) * 2, 0.003, (step.line.y1 - 0.5) * 2),
        new THREE.Vector3((step.line.x2 - 0.5) * 2, 0.003, (step.line.y2 - 0.5) * 2)
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      creaseLinesGroup.add(new THREE.Line(geo, material));
    }
  }

  function setWireframe(on) { if (paperMesh) paperMesh.material.wireframe = on; }

  function setCreaseLinesVisible(on) {
    showCL = on;
    if (creaseLinesGroup) creaseLinesGroup.visible = on;
  }

  function getBaseMesh() { return baseMeshData; }

  function setGroupTilt(t) {
    foldGroup.rotation.x = t * 0.22;
    foldGroup.rotation.z = t * 0.06;
    foldGroup.position.y = t * 0.14;
  }

  function showEmpty(show) {
    const el = document.getElementById('empty-msg');
    if (el) el.style.display = show ? 'block' : 'none';
  }

  return { init, updatePaper, updateCreaseLines, setWireframe, setCreaseLinesVisible,
           getBaseMesh, setGroupTilt, showEmpty, resize };
})();
