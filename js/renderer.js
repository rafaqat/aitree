/**
 * renderer.js — Three.js 3D scene
 *
 * Visual style: clean line-art like an IKEA assembly diagram.
 * - Light paper/gray background
 * - Two-sided paper: white front, dark back
 * - Fold lines drawn on the model surface
 * - Thin wireframe edges for paper-like outline
 */
const Renderer = (() => {
  let scene, camera, renderer, controls;
  let paperFront, paperBack, paperGeo;
  let edgeLines, creaseLinesGroup, foldGroup;
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
    scene.background = new THREE.Color(0xe8e4de); // warm light paper

    camera = new THREE.PerspectiveCamera(44, W / H, 0.01, 100);
    camera.position.set(0, 2.2, 3.0);
    camera.lookAt(0, 0, 0);

    // Soft, even lighting for diagram look
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const dl = new THREE.DirectionalLight(0xffffff, 0.5);
    dl.position.set(2, 5, 3); scene.add(dl);
    const fl = new THREE.DirectionalLight(0xffffff, 0.25);
    fl.position.set(-3, 3, -2); scene.add(fl);

    // Subtle grid floor
    const grid = new THREE.GridHelper(6, 12, 0xcccccc, 0xdddddd);
    grid.position.y = -0.01; scene.add(grid);

    // OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0.3, 0);
    controls.update();

    // Fold group
    foldGroup = new THREE.Group();
    scene.add(foldGroup);

    // Paper geometry
    paperGeo = new THREE.PlaneGeometry(2, 2, SEGS, SEGS);

    // Use MeshBasicMaterial to avoid lighting issues — pure white/gray
    // FrontSide of PlaneGeometry faces +Z, but after XY→XZ remap the
    // normal points in a different direction. We render both sides and
    // let the color tell you which side you're looking at.
    paperFront = new THREE.Mesh(paperGeo, new THREE.MeshBasicMaterial({
      color: 0xf5f5f0, side: THREE.FrontSide
    }));
    foldGroup.add(paperFront);

    paperBack = new THREE.Mesh(paperGeo, new THREE.MeshBasicMaterial({
      color: 0xb0b0a8, side: THREE.BackSide
    }));
    foldGroup.add(paperBack);

    // Thin wireframe edges for line-art paper outline
    const edgeGeo = new THREE.EdgesGeometry(paperGeo, 15);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x999999, linewidth: 1 });
    edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    foldGroup.add(edgeLines);

    // Crease lines group (fold lines on the model)
    creaseLinesGroup = new THREE.Group();
    foldGroup.add(creaseLinesGroup);

    // Store base mesh
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
   * Update paper mesh vertices from folded positions.
   * Maps unit-square [0,1] to world [-1,1].
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

    // Update edge wireframe
    if (edgeLines) {
      foldGroup.remove(edgeLines);
      if (edgeLines.geometry) edgeLines.geometry.dispose();
      const edgeGeo = new THREE.EdgesGeometry(paperGeo, 15);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0x888888, linewidth: 1 });
      edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
      foldGroup.add(edgeLines);
    }
  }

  /**
   * Draw fold lines on the paper surface.
   * These show where future folds will happen.
   * Mountain = red, Valley = blue, completed = gray
   */
  function updateCreaseLines(lines, activeIdx) {
    while (creaseLinesGroup.children.length) {
      const c = creaseLinesGroup.children[0];
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
      creaseLinesGroup.remove(c);
    }
    if (!lines || !showCL) return;

    activeIdx = activeIdx || -1;

    for (let i = 0; i < lines.length; i++) {
      const step = lines[i];

      // Front side: mountain=red, valley=blue
      // Back side: swapped (mountain becomes valley from behind, vice versa)
      var sides = [
        { yOff:  0.005, type: step.type },          // front
        { yOff: -0.005, type: step.type === 'mountain' ? 'valley' : step.type === 'valley' ? 'mountain' : step.type }  // back (swapped)
      ];

      for (var s = 0; s < sides.length; s++) {
        var side = sides[s];
        var col, opacity;
        if (i < activeIdx) {
          col = s === 0 ? 0xaaaaaa : 0x777777; opacity = 0.4;
        } else if (side.type === 'mountain') {
          col = s === 0 ? 0xcc3333 : 0xff4444; opacity = 1.0; // brighter on back
        } else if (side.type === 'valley') {
          col = s === 0 ? 0x3366cc : 0x4488ff; opacity = 1.0;
        } else {
          col = 0x6699cc; opacity = 0.6;
        }

        var material = new THREE.LineDashedMaterial({
          color: col,
          transparent: true,
          opacity: opacity,
          dashSize: side.type === 'mountain' ? 0.06 : 0.04,
          gapSize: side.type === 'mountain' ? 0.03 : 0.02,
          linewidth: 1
        });

        var pts = [
          new THREE.Vector3((step.line.x1 - 0.5) * 2, side.yOff, (step.line.y1 - 0.5) * 2),
          new THREE.Vector3((step.line.x2 - 0.5) * 2, side.yOff, (step.line.y2 - 0.5) * 2)
        ];
        var geo = new THREE.BufferGeometry().setFromPoints(pts);
        var line = new THREE.Line(geo, material);
        line.computeLineDistances();
        creaseLinesGroup.add(line);
      }
    }
  }

  function setWireframe(on) {
    if (edgeLines) edgeLines.visible = on;
  }

  function setCreaseLinesVisible(on) {
    showCL = on;
    if (creaseLinesGroup) creaseLinesGroup.visible = on;
  }

  function getBaseMesh() { return baseMeshData; }

  function setGroupTilt(t) {
    foldGroup.rotation.x = t * 0.15;
    foldGroup.position.y = t * 0.1;
  }

  function showEmpty(show) {
    const el = document.getElementById('empty-msg');
    if (el) el.style.display = show ? 'block' : 'none';
  }

  return { init, updatePaper, updateCreaseLines, setWireframe, setCreaseLinesVisible,
           getBaseMesh, setGroupTilt, showEmpty, resize };
})();
