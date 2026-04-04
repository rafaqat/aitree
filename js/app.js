/**
 * app.js — Boot, wiring, global state
 *
 * Connects all modules: Designer, TreeGraph, Packing, Presets,
 * StepSequencer, FoldEngine, Validator, Renderer.
 */
(function() {
  'use strict';

  let currentMode = 'draw'; // 'draw' | 'tree'
  let wfOn = false, clOn = true;

  // ── Boot ──────────────────────────────────

  window.addEventListener('DOMContentLoaded', function() {
    // Wait for Three.js to be available
    if (typeof THREE === 'undefined') {
      document.getElementById('empty-msg').textContent = 'Failed to load Three.js. Check connection.';
      return;
    }

    Renderer.init();
    Designer.init(document.getElementById('draw-canvas'));
    TreeGraph.init(document.getElementById('tree-canvas'));

    wirePresets();
    wireMode();
    wireToolbar();
    wireTreeToolbar();
    wireTransport();
    wireSliders();
    wireViewButtons();
    wireCallbacks();

    // Load crane by default after a short delay
    setTimeout(function() { loadPreset('crane'); }, 300);
  });

  // ── Presets ───────────────────────────────

  function wirePresets() {
    const sel = document.getElementById('preset-select');
    Presets.getList().forEach(function(p) {
      const opt = document.createElement('option');
      opt.value = p.key;
      opt.textContent = p.name;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', function() {
      if (sel.value) loadPreset(sel.value);
    });
  }

  function loadPreset(key) {
    const data = Presets.load(key);
    if (!data) return;

    // Update preset dropdown
    document.getElementById('preset-select').value = key;

    // Load steps into sequencer
    StepSequencer.setSteps(data.steps);
    StepSequencer.renderStepList(document.getElementById('step-list'));

    // Load tree data into tree graph
    TreeGraph.setTree(data.tree);

    // Set creases for designer view
    var designerCreases = data.steps.map(function(s) {
      return { line: s.line, type: s.type, stepId: s.id };
    });
    Designer.setCreases(designerCreases);

    // Update 3D
    updateFold(0);
    updateCreaseLines(data.steps);
    Renderer.showEmpty(false);

    // Validate
    runValidation(designerCreases, [], data.tree);

    // Update stats
    updateStats(data.tree.nodes.length, 0, data.steps.length, data.steps.length);
  }

  // ── Mode Switching ────────────────────────

  function wireMode() {
    var btnDraw = document.getElementById('mode-draw');
    var btnTree = document.getElementById('mode-tree');

    btnDraw.addEventListener('click', function() { setMode('draw'); });
    btnTree.addEventListener('click', function() { setMode('tree'); });
  }

  function setMode(mode) {
    currentMode = mode;
    var btnDraw = document.getElementById('mode-draw');
    var btnTree = document.getElementById('mode-tree');
    var drawToolbar = document.getElementById('draw-toolbar');
    var treeToolbar = document.getElementById('tree-toolbar');
    var drawCanvas = document.getElementById('draw-canvas');
    var treeCanvas = document.getElementById('tree-canvas');

    if (mode === 'draw') {
      btnDraw.classList.add('active');
      btnTree.classList.remove('active');
      drawToolbar.style.display = '';
      treeToolbar.style.display = 'none';
      drawCanvas.style.display = '';
      treeCanvas.style.display = 'none';
      Designer.resize();
    } else {
      btnTree.classList.add('active');
      btnDraw.classList.remove('active');
      drawToolbar.style.display = 'none';
      treeToolbar.style.display = '';
      drawCanvas.style.display = 'none';
      treeCanvas.style.display = '';
      TreeGraph.resize();
    }
  }

  // ── Toolbars ──────────────────────────────

  function wireToolbar() {
    var buttons = document.querySelectorAll('#draw-toolbar .tb[data-tool]');
    buttons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        buttons.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        Designer.setTool(btn.dataset.tool);
      });
    });
  }

  function wireTreeToolbar() {
    var buttons = document.querySelectorAll('#tree-toolbar .tb[data-tmode]');
    buttons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        buttons.forEach(function(b) { if (b.dataset.tmode) b.classList.remove('active'); });
        btn.classList.add('active');
        TreeGraph.setMode(btn.dataset.tmode);
      });
    });

    document.getElementById('btn-clear-tree').addEventListener('click', function() {
      TreeGraph.clear();
    });

    document.getElementById('btn-compute').addEventListener('click', function() {
      computeFromTree();
    });
  }

  // ── Transport ─────────────────────────────

  function wireTransport() {
    document.getElementById('btn-prev').addEventListener('click', function() {
      StepSequencer.prev();
    });
    document.getElementById('btn-play').addEventListener('click', function() {
      StepSequencer.togglePlay();
      var btn = document.getElementById('btn-play');
      btn.textContent = StepSequencer.isPlaying() ? 'Pause' : 'Play';
      btn.classList.toggle('on', StepSequencer.isPlaying());
    });
    document.getElementById('btn-next').addEventListener('click', function() {
      StepSequencer.next();
    });
  }

  // ── Sliders ───────────────────────────────

  function wireSliders() {
    var timeline = document.getElementById('timeline');
    timeline.addEventListener('input', function() {
      StepSequencer.setProgress(parseFloat(timeline.value) / 1000);
    });

    var speed = document.getElementById('speed');
    speed.addEventListener('input', function() {
      var val = parseFloat(speed.value);
      StepSequencer.setSpeed(val);
      document.getElementById('spd-val').textContent = (val / 5).toFixed(1) + 'x';
    });
  }

  // ── View Buttons ──────────────────────────

  function wireViewButtons() {
    document.getElementById('btn-wf').addEventListener('click', function() {
      wfOn = !wfOn;
      Renderer.setWireframe(wfOn);
      this.classList.toggle('on', wfOn);
    });

    document.getElementById('btn-cl').addEventListener('click', function() {
      clOn = !clOn;
      Renderer.setCreaseLinesVisible(clOn);
      this.classList.toggle('on', !clOn);
    });

    document.getElementById('btn-export').addEventListener('click', exportSVG);
  }

  // ── Callbacks ─────────────────────────────

  function wireCallbacks() {
    // Step sequencer update → fold + UI
    StepSequencer.onUpdate = function(globalT, activeIdx) {
      updateFold(globalT);
      StepSequencer.updateStepList(globalT);
      StepSequencer.updateOverlay(globalT);
      Renderer.setGroupTilt(globalT);

      // Update timeline slider
      document.getElementById('timeline').value = Math.round(globalT * 1000);
      document.getElementById('pct').textContent = Math.round(globalT * 100) + '%';

      // Update play button state
      var btn = document.getElementById('btn-play');
      btn.textContent = StepSequencer.isPlaying() ? 'Pause' : 'Play';
      btn.classList.toggle('on', StepSequencer.isPlaying());
    };

    // Designer changes → update 3D + validation
    Designer.onChanged = function(creases) {
      var steps = creases.map(function(c, i) {
        var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return {
          id: i < 26 ? letters[i] : letters[i % 26],
          label: c.type + ' fold',
          type: c.type,
          line: c.line,
          angle: 180
        };
      });
      StepSequencer.setSteps(steps);
      StepSequencer.renderStepList(document.getElementById('step-list'));
      updateFold(0);
      updateCreaseLines(steps);
      runValidation(creases, [], null);
      updateStats(0, 0, creases.length, steps.length);
      Renderer.showEmpty(steps.length === 0);
    };

    // Tree graph changes → run validation
    TreeGraph.onChanged = function(tree) {
      runValidation([], [], tree);
      updateStats(tree.nodes.length, 0, 0, 0);
    };

    // Window resize
    window.addEventListener('resize', function() {
      Renderer.resize();
      if (currentMode === 'draw') Designer.resize();
      else TreeGraph.resize();
    });
  }

  // ── Core Update Functions ─────────────────

  function updateFold(globalT) {
    var baseMesh = Renderer.getBaseMesh();
    var steps = StepSequencer.getSteps();
    var folded = FoldEngine.computeFoldState(baseMesh, steps, globalT);
    Renderer.updatePaper(folded);
  }

  function updateCreaseLines(steps) {
    Renderer.updateCreaseLines(steps);
  }

  function computeFromTree() {
    var tree = TreeGraph.getTree();
    if (!tree.nodes.length || !tree.edges.length) return;

    var treeCanvas = document.getElementById('tree-canvas');
    var result = Packing.compute(tree, treeCanvas.width, treeCanvas.height);

    // Show disk packing circles on tree canvas
    TreeGraph.setCircles(result.circles);

    // Load computed steps
    StepSequencer.setSteps(result.steps);
    StepSequencer.renderStepList(document.getElementById('step-list'));
    updateFold(0);
    updateCreaseLines(result.steps);
    Renderer.showEmpty(result.steps.length === 0);

    // Update designer with computed creases
    var designerCreases = result.steps.map(function(s) {
      return { line: s.line, type: s.type, stepId: s.id };
    });
    Designer.setCreases(designerCreases);

    // Validate
    var creaseLines = result.creases.map(function(c) {
      return { line: c.line, type: c.type };
    });
    runValidation(creaseLines, result.circles, tree);
    updateStats(tree.nodes.length, result.circles.length, result.creases.length, result.steps.length);
  }

  // ── Validation ────────────────────────────

  function runValidation(creases, circles, tree) {
    var result = Validator.validate(creases, circles, tree);
    setDot('v-kawasaki', result.kawasaki);
    setDot('v-maekawa', result.maekawa);
    setDot('v-packing', result.packing);
    setDot('v-tree', result.tree);
  }

  function setDot(id, status) {
    var el = document.getElementById(id);
    if (el) el.className = 'vdot ' + status;
  }

  // ── Stats ─────────────────────────────────

  function updateStats(nodes, disks, creases, steps) {
    setText('s-nodes', nodes);
    setText('s-disks', disks);
    setText('s-creases', creases);
    setText('s-steps', steps);
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // ── SVG Export ────────────────────────────

  function exportSVG() {
    var steps = StepSequencer.getSteps();
    if (!steps.length) return;

    var W = 400, H = 400;
    var parts = [];
    parts.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '">');
    parts.push('<rect width="' + W + '" height="' + H + '" fill="#faf8f0" stroke="#bbb" stroke-width="0.5"/>');

    steps.forEach(function(s) {
      var col = s.type === 'mountain' ? '#cc4444' : s.type === 'valley' ? '#4466cc' : '#88aacc';
      var dash = s.type === 'valley' ? ' stroke-dasharray="4,2"' : '';
      var x1 = (s.line.x1 * (W - 40) + 20).toFixed(1);
      var y1 = (s.line.y1 * (H - 40) + 20).toFixed(1);
      var x2 = (s.line.x2 * (W - 40) + 20).toFixed(1);
      var y2 = (s.line.y2 * (H - 40) + 20).toFixed(1);
      parts.push('<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
        '" stroke="' + col + '" stroke-width="0.8"' + dash + '/>');
    });

    parts.push('</svg>');
    var blob = new Blob([parts.join('\n')], { type: 'image/svg+xml' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'crease_pattern.svg';
    a.click();
    URL.revokeObjectURL(a.href);
  }

})();
