# Origami Designer & 3D Fold Animator

## Context
Build a web-based origami designer inspired by Robert Lang's TreeMaker and computational origami research. Users create crease patterns (via presets, tree-graph-to-crease-pattern computation, or free-drawing) and watch the paper fold step-by-step in 3D. Each fold step is labeled A through Z with mountain/valley classifications. Improves on the existing TreeMaker 3D prototype at `~/Downloads/treemaker_3dv2.html` which had approximate folding and no step-by-step control.

## Theoretical Foundation: Lang's TreeMaker & Computational Origami

This project is grounded in Robert Lang's research on computational origami design, particularly the tree method published in *Origami Design Secrets* (2003) and implemented in TreeMaker 5 (2005). We implement these ideas as a web-based interactive tool.

### The Tree Method (Core Algorithm)
Lang's key insight: any origami base can be described as a **metric tree** (stick figure) where:
- **Leaf nodes** = flaps on the finished model (legs, wings, antennae, etc.)
- **Edge lengths** = minimum flap lengths
- **Internal nodes** = junction points where flaps meet

The algorithm converts this tree into a **crease pattern** on a square sheet through:

1. **Circle-River Packing**: Each leaf node maps to a circle on the square. The circle's radius equals the path length from that leaf to the tree's base. Circles must not overlap (they pack). Rivers (channels) connect circles along internal edges. The optimization problem: fit all circles+rivers into the unit square while maximizing paper usage.

2. **Active Paths**: A path between two leaf nodes is "active" when the corresponding circles are tangent (touching). Active paths determine where creases must go — they are the geometric constraints that force the crease pattern.

3. **Universal Molecule**: At each polygon formed by active paths, Lang's "universal molecule" algorithm fills in the internal crease structure. This guarantees flat-foldability and produces the mountain/valley assignments.

4. **Crease Assignment**: Ridge creases → valley folds, gusset creases → mountain folds, most axial creases → mountain folds. TreeMaker 5 automated this fully.

### Flat-Foldability Theorems (Validation)
We implement these as real-time validation checks:

- **Kawasaki-Justin Theorem**: At any interior vertex, alternating angles must sum to 180°. Formally: α₁ + α₃ + α₅ + ... = α₂ + α₄ + α₆ + ... = 180°. This is necessary for a crease pattern to fold flat.

- **Maekawa's Theorem**: At any vertex, the number of mountain folds minus valley folds = ±2. This constrains the mountain/valley assignment.

- **Big-Little-Big Lemma**: If any angle at a vertex is a local minimum, exactly one of its bounding creases must be mountain and the other valley. Combined with Maekawa's theorem, this forms the primary conditions for flat-foldability.

- **Non-crossing condition**: Paper cannot penetrate itself through fold lines (zero Gaussian curvature constraint).

### Uniaxial Bases
All models in our presets produce **uniaxial bases** — bases where all flaps lie along a single axis when fully folded. This is the class of bases TreeMaker solves for. Circle-packing can compute a crease pattern for any uniaxial base of arbitrary complexity.

### Box Pleating (Alternative to Circle Packing)
An alternative approach where **squares** replace circles in the packing. Produces crease patterns with only 45° and 90° angles, making them significantly easier to fold. We may offer this as a "grid mode" toggle.

### Huzita-Justin Axioms (Construction Foundation)
The 7 axioms defining all possible single-fold operations:
1. Fold through two points
2. Fold one point onto another
3. Fold one line onto another
4. Fold through a point, perpendicular to a line
5. Fold a point onto a line through another point
6. Fold two points onto two lines simultaneously (Beloch fold — solves cubics)
7. Fold a point onto a line, perpendicular to another line

These define what geometric constructions are possible with origami and inform our snap/alignment system in the designer.

### NP-Completeness Note
Assigning mountain/valley folds to a general crease pattern is NP-complete (Bern & Hayes). For our presets, assignments are pre-computed. For user-drawn patterns, we use heuristic validation rather than exhaustive search.

### Key References
- Robert J. Lang, *Origami Design Secrets* (2003) — full tree method exposition
- Robert J. Lang, TreeMaker 5.0.1 — GPL source code implementing circle-river packing + optimization
- Erik Demaine & Joseph O'Rourke, *Geometric Folding Algorithms* (2007) — formal proofs
- Tomohiro Tachi, Origamizer (2008) — 3D structure crease patterns (future extension)

## Project Structure
```
aitree/
├── index.html           # App shell — 3-panel layout
├── css/
│   └── styles.css       # Dark theme styling (refined from prototype)
├── js/
│   ├── app.js           # Boot, wiring, global state
│   ├── designer.js      # 2D canvas — draw/edit crease patterns on paper
│   ├── treegraph.js     # Tree graph editor (Lang's tree method input)
│   ├── packing.js       # Circle-river packing solver (tree → crease pattern)
│   ├── presets.js        # Preset origami models with pre-defined fold steps
│   ├── steps.js          # A-Z step sequencer + timeline
│   ├── folder.js         # Rigid origami fold engine (hinge-based)
│   ├── validator.js      # Kawasaki, Maekawa, flat-foldability checks
│   └── renderer.js       # Three.js 3D scene, camera, orbit, paper mesh
```

## Layout (3 panels)
1. **Left Panel** — Crease Pattern Designer (two modes)
   - **Mode toggle**: "Draw" (manual crease lines) / "Tree" (Lang's tree method)
   - **Draw mode**: 2D canvas showing square paper
     - Tool bar: Draw Mountain, Draw Valley, Select/Move, Delete
     - Click two points on paper to define a fold line
     - Snap to edges, corners, midpoints, intersections (Huzita-Justin-informed)
     - Each fold line can be assigned to a step (A, B, C...)
   - **Tree mode**: Tree graph editor (ported from prototype)
     - Click to add nodes, drag to connect edges
     - Node radii represent flap lengths
     - "Compute Creases" button runs circle-river packing → generates crease pattern
     - Shows disk packing overlay on canvas
   - Preset dropdown to load pre-built models (works in either mode)

2. **Center Panel** — 3D Viewport
   - Three.js renderer with orbit controls
   - Paper mesh that folds along crease lines
   - Grid floor, ambient + directional lighting
   - Step label overlay ("Step C: Valley fold")

3. **Right Panel** — Step Sequencer & Controls
   - Step list: A, B, C... with fold type badges (mountain/valley)
   - Click any step to jump to it
   - Prev / Play / Next buttons
   - Continuous timeline slider
   - Animation speed control
   - View toggles (wireframe, crease lines, paper texture)
   - Stats (creases, steps, nodes, disks)
   - Validation panel: Kawasaki theorem, Maekawa theorem, disk packing, tree feasibility (real-time dot indicators like prototype)

## Key Technical Decisions

### Fold Engine (folder.js)
- **Rigid origami folding**: Each fold step rotates one half of the paper around the fold line (crease acts as hinge)
- For each step, split mesh faces into two groups by which side of the fold line they're on
- Apply rotation matrix around the fold line axis
- Accumulate transforms: Step B folds on top of Step A's result
- This gives crisp, paper-like folds instead of the prototype's rubbery deformation

### Step System (steps.js)
- Each step = `{ id: 'A', label: 'Valley fold in half', type: 'valley'|'mountain', line: {x1,y1,x2,y2}, angle: degrees }`
- Steps execute sequentially: A first, then B on A's result, etc.
- Timeline maps [0,1] → steps with equal slices + overlap for smooth transitions
- Discrete step buttons (A, B, C...) jump to that step's end state
- Prev/Next animate one step at a time

### Presets (presets.js)
Start with 4-6 well-known models:
- **Crane** (~12 steps)
- **Boat** (~8 steps)  
- **Frog** (~10 steps)
- **Fortune Teller** (~6 steps)
- **Water Bomb** (~8 steps)
- **Fish** (~7 steps)

Each preset defines: crease lines on unit square + ordered fold steps with descriptions.

### Tree Graph Editor (treegraph.js)
- Ported from prototype's tree canvas interaction model
- Click blank space to add node, click node to select/drag, right-click to delete
- Edge mode: click two nodes to connect them
- Each node has an ID and radius (representing flap length)
- Degree tracking: leaf nodes (degree ≤ 1) shown differently from internal nodes
- "Compute Creases" triggers packing.js → generates crease pattern + fold steps

### Circle-River Packing (packing.js)
- Implements Lang's circle-river packing algorithm from TreeMaker
- **Input**: Tree graph (nodes + edges with lengths)
- **Process**: 
  1. BFS from root to compute path distances → circle radii
  2. Place leaf circles on unit square
  3. Iterative relaxation to resolve overlaps (from prototype's `computeCircles()`)
  4. Generate creases in 3 phases: axial, ridge/river bisectors, molecule twist rays
  5. Assign mountain/valley based on phase and alternation rules
- **Output**: Ordered list of crease lines with fold angles → feeds into steps.js

### Validator (validator.js)
- **Kawasaki check**: At each interior vertex, verify Σ(odd angles) = Σ(even angles) = 180°
- **Maekawa check**: At each vertex, |mountains - valleys| = 2
- **Disk packing check**: No circle overlaps (distance ≥ sum of radii)
- **Tree feasibility**: Graph is connected, has ≥ 2 nodes, ≥ 1 edge
- Returns pass/warn/fail status for each check, displayed as colored dots in UI

### Designer (designer.js)
- Canvas with unit-square paper (0,0 to 1,1)
- Click two points to create a fold line
- Toggle mountain/valley per line
- Assign lines to steps via right-click or step panel
- Snap to edges, corners, midpoints, existing intersections (informed by Huzita-Justin axioms)
- Visual: mountain = red dashed, valley = blue dash-dot, axial = light blue

### Renderer (renderer.js)
- Three.js r128+ (CDN loaded)
- Paper: subdivided PlaneGeometry with physical material (cream color, slight roughness)
- Each fold step modifies vertex positions via rigid rotation
- Crease lines rendered as colored lines on paper surface
- Orbit camera, grid floor, fog, shadows

## Implementation Order
1. `index.html` + `css/styles.css` — App shell and layout (3-panel, mode toggle)
2. `js/renderer.js` — 3D scene setup (Three.js r128, OrbitControls)
3. `js/folder.js` — Fold engine (rigid hinge rotation, Rodrigues' formula)
4. `js/validator.js` — Kawasaki, Maekawa, flat-foldability validation
5. `js/steps.js` — Step sequencer with timeline
6. `js/presets.js` — Preset models (converted from prototype's tree graphs to explicit step format)
7. `js/treegraph.js` — Tree graph editor (ported from prototype: add/move/edge/delete nodes)
8. `js/packing.js` — Circle-river packing solver (tree → disk positions → crease lines)
9. `js/designer.js` — 2D crease pattern editor (manual draw mode)
10. `js/app.js` — Wire everything together, mode switching, SVG export

## Reference: Existing Prototype (`~/Downloads/treemaker_3dv2.html`)

The existing prototype is a single-file ~760-line HTML app. Key patterns to port or improve:

### What to Reuse
- **Three.js r128 setup**: Scene, camera, lighting, grid floor — similar structure to our `renderer.js`
- **Preset models**: Crane, Bird, Frog, Fish, Star, Insect — defined as node/edge tree graphs with disk packing radii. Convert to our step-based format with explicit fold lines
- **SVG export**: The `doExport()` function generates SVG crease patterns — port to our app
- **Validation indicators**: Kawasaki theorem, Maekawa theorem, disk packing checks — include in stats panel
- **Dark monospace aesthetic**: `--bg:#0a0a0a`, monospace fonts, accent colors `--acc:#c8f0a0`, mountain red `#f07070`, valley blue `#6090f0`
- **3-panel layout**: Left (tree editor), Center (3D viewport), Right (controls) — same structure we're building

### What to Improve (Why We're Rebuilding)
- **Fold engine**: Prototype uses soft exponential falloff (`Math.exp(-|perp| * 0.8)`) creating rubbery deformation. Replace with **rigid hinge rotation** — binary side-of-line classification, full rotation of one half
- **Step control**: Prototype has a single continuous slider with no step labeling. Add A-Z step sequencer with discrete step navigation, play/pause per step, and step labels
- **Crease generation**: Prototype auto-generates creases from tree graphs via disk packing. Keep this as a "tree mode" but add **manual drawing** of fold lines on a 2D paper canvas
- **Orbit controls**: Prototype uses manual mouse orbit math. Use Three.js `OrbitControls` for damped, smooth interaction
- **Accumulated folding**: Prototype applies all fold deltas additively from flat state. New engine should fold sequentially — Step B operates on Step A's already-folded geometry

### Prototype Architecture (for reference)
```
Tree Graph (nodes/edges) → computeCircles() (disk packing)
  → genCreases() (3 phases: axial, ridge/river, molecule twist)
  → buildFoldSteps() (ordered by phase, each gets [start,end] window)
  → build3D() (create PlaneGeometry, compute per-step vertex deltas via Rodrigues)
  → applyFold(t) (sum weighted deltas from flat state)
```

### Crease Generation Phases (from prototype)
1. **Phase 0 — Axial**: Center → each leaf circle, gentle fold angle (0.6 rad)
2. **Phase 1 — Ridge/River**: Bisectors between adjacent circles, alternating mountain/valley (2.4 rad)
3. **Phase 2 — Molecule Twist**: Rays at junction nodes where multiple circles meet (1.8 rad)

### Key Constants to Port
- Paper: `PlaneGeometry(2, 2, 32, 32)` — 32 subdivisions
- Material: `MeshPhysicalMaterial { color: 0xeae4d6, roughness: 0.5, opacity: 0.96 }`
- Fog: `FogExp2(0x05050a, 0.065)`
- Crease colors: mountain=`#f07070`, valley=`#6090f0`, axial=`#80c0f0`
- Animation speed: `parseFloat(speedSlider.value) / 2200` per frame

## Verification
- Open `index.html` in browser (no server needed — use ES modules with CDN imports or classic script tags)
- Select "Crane" preset → should see crease pattern on left, step list on right
- Click Play → paper folds step-by-step in 3D viewport
- Click step buttons (A, B, C...) → jumps to that fold state
- Draw custom fold lines on the 2D canvas → see them reflected in 3D
- Scrub timeline slider → smooth interpolation between steps
