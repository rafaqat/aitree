# Origami Designer & 3D Fold Animator

Web-based origami designer inspired by Robert Lang's TreeMaker and computational origami research.

## Plan

The full implementation plan is at `.claude/plans/keen-booping-swan.md`. It covers:
- Theoretical foundation (Lang's tree method, circle-river packing, flat-foldability theorems)
- Project structure (10 JS modules across 3-panel layout)
- Implementation order (10 steps)
- Reference prototype at `~/Downloads/treemaker_3dv2.html`

## Tech Stack

- Vanilla HTML/CSS/JS (no build step, no server needed)
- Three.js r128 via CDN
- Three.js OrbitControls via CDN

## Project Structure

```
aitree/
├── index.html           # App shell — 3-panel layout
├── CLAUDE.md            # This file
├── css/
│   └── styles.css       # Dark theme styling
├── js/
│   ├── app.js           # Boot, wiring, global state
│   ├── designer.js      # 2D canvas — draw/edit crease patterns
│   ├── treegraph.js     # Tree graph editor (Lang's tree method)
│   ├── packing.js       # Circle-river packing solver
│   ├── presets.js       # Preset origami models
│   ├── steps.js         # A-Z step sequencer + timeline
│   ├── folder.js        # Rigid origami fold engine (hinge-based)
│   ├── validator.js     # Kawasaki, Maekawa, flat-foldability checks
│   └── renderer.js      # Three.js 3D scene, camera, paper mesh
```

## Key Conventions

- All coordinates on unit square [0,1] x [0,1]
- Crease colors: mountain = red (#e94560), valley = blue (#4a9eff), axial = light blue
- Fold steps labeled A-Z sequentially
- Rigid hinge folding (not soft deformation)
- Each fold step accumulates on previous (Step B folds on Step A's result)

## Running

Open `index.html` in any browser. No server required.

## Reference

- Robert J. Lang, *Origami Design Secrets* (2003)
- TreeMaker 5.0.1 (GPL) — circle-river packing + optimization
- Existing prototype: `~/Downloads/treemaker_3dv2.html`
