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
      color: 0xd0d0c8, side: THREE.BackSide
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

    // Redraw crease lines to follow the deformed mesh
    if (currentCreaseData) redrawCreaseLines();

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

  // Store current crease line data so we can redraw when paper moves
  var currentCreaseData = null;
  var currentActiveIdx = -1;

  /**
   * Look up the folded 3D position for a point on the unit square [0,1]x[0,1]
   * by bilinear interpolation from the mesh grid.
   */
  function sampleFoldedPosition(ux, uz, nOff) {
    var pos = paperGeo.attributes.position;
    var n = SEGS + 1; // vertices per row

    // Clamp to mesh bounds
    var fx = Math.max(0, Math.min(1, ux)) * SEGS;
    var fz = Math.max(0, Math.min(1, uz)) * SEGS;
    var col = Math.floor(fx), row = Math.floor(fz);
    col = Math.min(col, SEGS - 1);
    row = Math.min(row, SEGS - 1);
    var tx = fx - col, tz = fz - row;

    // Four corners of the grid cell
    var i00 = row * n + col;
    var i10 = row * n + col + 1;
    var i01 = (row + 1) * n + col;
    var i11 = (row + 1) * n + col + 1;

    // Bilinear interpolation
    var x = (1 - tx) * (1 - tz) * pos.getX(i00) + tx * (1 - tz) * pos.getX(i10) +
            (1 - tx) * tz * pos.getX(i01) + tx * tz * pos.getX(i11);
    var y = (1 - tx) * (1 - tz) * pos.getY(i00) + tx * (1 - tz) * pos.getY(i10) +
            (1 - tx) * tz * pos.getY(i01) + tx * tz * pos.getY(i11);
    var z = (1 - tx) * (1 - tz) * pos.getZ(i00) + tx * (1 - tz) * pos.getZ(i10) +
            (1 - tx) * tz * pos.getZ(i01) + tx * tz * pos.getZ(i11);

    // Offset slightly along normal for front/back
    return new THREE.Vector3(x, y + nOff, z);
  }

  /**
   * Draw fold lines on the paper surface, deformed with the mesh.
   * Each line is sampled as a polyline of ~20 points that follow the paper.
   */
  function updateCreaseLines(lines, activeIdx) {
    currentCreaseData = lines;
    currentActiveIdx = activeIdx || -1;
    redrawCreaseLines();
  }

  function redrawCreaseLines() {
    while (creaseLinesGroup.children.length) {
      var c = creaseLinesGroup.children[0];
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
      creaseLinesGroup.remove(c);
    }
    var lines = currentCreaseData;
    if (!lines || !showCL) return;

    var SAMPLES = 20;

    for (var i = 0; i < lines.length; i++) {
      var step = lines[i];

      var sides = [
        { nOff:  0.005, type: step.type },
        { nOff: -0.005, type: step.type === 'mountain' ? 'valley' : step.type === 'valley' ? 'mountain' : step.type }
      ];

      for (var s = 0; s < sides.length; s++) {
        var side = sides[s];
        var col, opacity;
        if (i < currentActiveIdx) {
          col = s === 0 ? 0xaaaaaa : 0x666666; opacity = 0.5;
        } else if (side.type === 'mountain') {
          col = s === 0 ? 0xcc3333 : 0xff2222; opacity = 1.0;
        } else if (side.type === 'valley') {
          col = s === 0 ? 0x3366cc : 0x2266ff; opacity = 1.0;
        } else {
          col = 0x6699cc; opacity = 0.7;
        }

        var material = new THREE.LineDashedMaterial({
          color: col, transparent: true, opacity: opacity,
          dashSize: side.type === 'mountain' ? 0.08 : 0.05,
          gapSize: side.type === 'mountain' ? 0.03 : 0.02,
          linewidth: 2
        });

        // Sample points along the crease line, mapped through folded mesh
        var pts = [];
        for (var t = 0; t <= SAMPLES; t++) {
          var frac = t / SAMPLES;
          var ux = step.line.x1 + (step.line.x2 - step.line.x1) * frac;
          var uz = step.line.y1 + (step.line.y2 - step.line.y1) * frac;
          pts.push(sampleFoldedPosition(ux, uz, side.nOff));
        }

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
