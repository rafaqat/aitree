/**
 * presets.js — Preset origami models
 *
 * Design principle: our engine classifies ALL vertices against the
 * original flat paper. It can't fold individual layers. So:
 * - Use 4-8 structural folds (180°) for the base shape
 * - Use partial-angle folds (30-90°) for shaping details
 * - Total ~12-15 steps per model
 *
 * This produces recognizable origami shapes within the engine's limits.
 */
const Presets = (() => {
  const PI = Math.PI;

  const DATA = {
    crane: {
      name: 'Crane',
      tree: {
        nodes: [
          {id:0,x:134,y:88,r:18},{id:1,x:64,y:162,r:14},{id:2,x:204,y:162,r:14},
          {id:3,x:134,y:194,r:11},{id:4,x:70,y:256,r:22},{id:5,x:198,y:256,r:22},{id:6,x:134,y:276,r:17}
        ],
        edges: [[0,1],[0,2],[0,3],[3,4],[3,5],[3,6]]
      },
      steps: [
        // Base folds (full 180°)
        {id:'A', label:'Fold in half diagonally', type:'valley',
         line:{x1:0,y1:0,x2:1,y2:1}, foldAngle:PI},
        {id:'B', label:'Fold triangle in half', type:'valley',
         line:{x1:1,y1:0,x2:0,y2:1}, foldAngle:PI},
        // Kite folds to narrow the shape
        {id:'C', label:'Fold left edge to center', type:'valley',
         line:{x1:0.5,y1:0,x2:0,y2:0.5}, foldAngle:PI * 0.7},
        {id:'D', label:'Fold right edge to center', type:'valley',
         line:{x1:0.5,y1:0,x2:1,y2:0.5}, foldAngle:PI * 0.7},
        {id:'E', label:'Fold bottom-left to center', type:'valley',
         line:{x1:0,y1:0.5,x2:0.5,y2:1}, foldAngle:PI * 0.7},
        {id:'F', label:'Fold bottom-right to center', type:'valley',
         line:{x1:1,y1:0.5,x2:0.5,y2:1}, foldAngle:PI * 0.7},
        // Shape the body
        {id:'G', label:'Crease body center', type:'mountain',
         line:{x1:0.25,y1:0.25,x2:0.75,y2:0.25}, foldAngle:PI * 0.4},
        {id:'H', label:'Crease body bottom', type:'mountain',
         line:{x1:0.25,y1:0.75,x2:0.75,y2:0.75}, foldAngle:PI * 0.4},
        // Raise neck
        {id:'I', label:'Fold neck up', type:'mountain',
         line:{x1:0,y1:0.65,x2:0.35,y2:1}, foldAngle:PI * 0.5},
        // Raise tail
        {id:'J', label:'Fold tail up', type:'mountain',
         line:{x1:0.65,y1:1,x2:1,y2:0.65}, foldAngle:PI * 0.5},
        // Narrow neck and tail
        {id:'K', label:'Narrow neck', type:'valley',
         line:{x1:0.05,y1:0.58,x2:0.42,y2:0.95}, foldAngle:PI * 0.35},
        {id:'L', label:'Narrow tail', type:'valley',
         line:{x1:0.58,y1:0.95,x2:0.95,y2:0.58}, foldAngle:PI * 0.35},
        // Head
        {id:'M', label:'Fold head down', type:'valley',
         line:{x1:0,y1:0.82,x2:0.18,y2:1}, foldAngle:PI * 0.3},
        // Wings
        {id:'N', label:'Fold wings down', type:'valley',
         line:{x1:0.3,y1:0.3,x2:0.7,y2:0.3}, foldAngle:PI * 0.25}
      ]
    },

    boat: {
      name: 'Boat',
      tree: {
        nodes: [
          {id:0,x:134,y:78,r:17},{id:1,x:54,y:154,r:20},{id:2,x:214,y:154,r:20},
          {id:3,x:78,y:252,r:19},{id:4,x:190,y:252,r:19}
        ],
        edges: [[0,1],[0,2],[1,3],[2,4]]
      },
      steps: [
        {id:'A', label:'Fold in half horizontally', type:'valley',
         line:{x1:0,y1:0.5,x2:1,y2:0.5}, foldAngle:PI},
        {id:'B', label:'Fold left corner to center', type:'valley',
         line:{x1:0.5,y1:0,x2:0,y2:0.5}, foldAngle:PI * 0.7},
        {id:'C', label:'Fold right corner to center', type:'valley',
         line:{x1:0.5,y1:0,x2:1,y2:0.5}, foldAngle:PI * 0.7},
        {id:'D', label:'Fold bottom strip up', type:'valley',
         line:{x1:0,y1:0.75,x2:1,y2:0.75}, foldAngle:PI * 0.6},
        {id:'E', label:'Tuck left corner', type:'mountain',
         line:{x1:0,y1:0.75,x2:0.15,y2:0.5}, foldAngle:PI * 0.5},
        {id:'F', label:'Tuck right corner', type:'mountain',
         line:{x1:1,y1:0.75,x2:0.85,y2:0.5}, foldAngle:PI * 0.5},
        {id:'G', label:'Fold top layer down', type:'valley',
         line:{x1:0,y1:0.35,x2:1,y2:0.35}, foldAngle:PI * 0.5},
        {id:'H', label:'Crease left side', type:'mountain',
         line:{x1:0.2,y1:0.35,x2:0,y2:0.6}, foldAngle:PI * 0.4},
        {id:'I', label:'Crease right side', type:'mountain',
         line:{x1:0.8,y1:0.35,x2:1,y2:0.6}, foldAngle:PI * 0.4},
        {id:'J', label:'Fold bottom up', type:'valley',
         line:{x1:0,y1:0.85,x2:1,y2:0.85}, foldAngle:PI * 0.4},
        {id:'K', label:'Shape bow', type:'valley',
         line:{x1:0.3,y1:0.4,x2:0.15,y2:0.7}, foldAngle:PI * 0.25},
        {id:'L', label:'Shape stern', type:'valley',
         line:{x1:0.7,y1:0.4,x2:0.85,y2:0.7}, foldAngle:PI * 0.25}
      ]
    },

    airplane: {
      name: 'Paper Airplane',
      tree: {
        nodes: [
          {id:0,x:134,y:148,r:10},{id:1,x:134,y:40,r:20},{id:2,x:134,y:260,r:20}
        ],
        edges: [[0,1],[0,2]]
      },
      steps: [
        {id:'A', label:'Fold in half vertically', type:'valley',
         line:{x1:0.5,y1:0,x2:0.5,y2:1}, foldAngle:PI},
        {id:'B', label:'Fold top-left corner to center', type:'valley',
         line:{x1:0,y1:0,x2:0.5,y2:0.25}, foldAngle:PI},
        {id:'C', label:'Fold top-right corner to center', type:'valley',
         line:{x1:1,y1:0,x2:0.5,y2:0.25}, foldAngle:PI},
        {id:'D', label:'Fold left edge to center', type:'valley',
         line:{x1:0.1,y1:0,x2:0.5,y2:0.4}, foldAngle:PI * 0.8},
        {id:'E', label:'Fold right edge to center', type:'valley',
         line:{x1:0.9,y1:0,x2:0.5,y2:0.4}, foldAngle:PI * 0.8},
        {id:'F', label:'Fold body in half', type:'mountain',
         line:{x1:0.5,y1:0,x2:0.5,y2:1}, foldAngle:PI * 0.6},
        {id:'G', label:'Fold left wing down', type:'valley',
         line:{x1:0.2,y1:0,x2:0.35,y2:1}, foldAngle:PI * 0.5},
        {id:'H', label:'Fold right wing down', type:'valley',
         line:{x1:0.8,y1:0,x2:0.65,y2:1}, foldAngle:PI * 0.5},
        {id:'I', label:'Fold left winglet up', type:'mountain',
         line:{x1:0.08,y1:0.3,x2:0.22,y2:1}, foldAngle:PI * 0.3},
        {id:'J', label:'Fold right winglet up', type:'mountain',
         line:{x1:0.92,y1:0.3,x2:0.78,y2:1}, foldAngle:PI * 0.3},
        {id:'K', label:'Fold tail fin', type:'valley',
         line:{x1:0.4,y1:0.85,x2:0.6,y2:0.85}, foldAngle:PI * 0.25},
        {id:'L', label:'Shape nose', type:'valley',
         line:{x1:0.35,y1:0.05,x2:0.65,y2:0.05}, foldAngle:PI * 0.2}
      ]
    },

    fortune: {
      name: 'Fortune Teller',
      tree: {
        nodes: [
          {id:0,x:134,y:148,r:8},{id:1,x:54,y:68,r:18},{id:2,x:214,y:68,r:18},
          {id:3,x:54,y:228,r:18},{id:4,x:214,y:228,r:18}
        ],
        edges: [[0,1],[0,2],[0,3],[0,4]]
      },
      steps: [
        // Fold all 4 corners to center
        {id:'A', label:'Fold top-left corner to center', type:'valley',
         line:{x1:0,y1:0.5,x2:0.5,y2:0}, foldAngle:PI},
        {id:'B', label:'Fold top-right corner to center', type:'valley',
         line:{x1:0.5,y1:0,x2:1,y2:0.5}, foldAngle:PI},
        {id:'C', label:'Fold bottom-right corner to center', type:'valley',
         line:{x1:1,y1:0.5,x2:0.5,y2:1}, foldAngle:PI},
        {id:'D', label:'Fold bottom-left corner to center', type:'valley',
         line:{x1:0.5,y1:1,x2:0,y2:0.5}, foldAngle:PI},
        // Fold smaller corners to center
        {id:'E', label:'Fold inner top-left', type:'mountain',
         line:{x1:0.25,y1:0.5,x2:0.5,y2:0.25}, foldAngle:PI * 0.7},
        {id:'F', label:'Fold inner top-right', type:'mountain',
         line:{x1:0.5,y1:0.25,x2:0.75,y2:0.5}, foldAngle:PI * 0.7},
        {id:'G', label:'Fold inner bottom-right', type:'mountain',
         line:{x1:0.75,y1:0.5,x2:0.5,y2:0.75}, foldAngle:PI * 0.7},
        {id:'H', label:'Fold inner bottom-left', type:'mountain',
         line:{x1:0.5,y1:0.75,x2:0.25,y2:0.5}, foldAngle:PI * 0.7},
        // Fold in half both ways to crease
        {id:'I', label:'Fold in half horizontally', type:'valley',
         line:{x1:0,y1:0.5,x2:1,y2:0.5}, foldAngle:PI * 0.5},
        {id:'J', label:'Fold in half vertically', type:'valley',
         line:{x1:0.5,y1:0,x2:0.5,y2:1}, foldAngle:PI * 0.5},
        // Open into 3D shape
        {id:'K', label:'Open diagonal', type:'valley',
         line:{x1:0,y1:0,x2:1,y2:1}, foldAngle:PI * 0.2},
        {id:'L', label:'Open other diagonal', type:'valley',
         line:{x1:1,y1:0,x2:0,y2:1}, foldAngle:PI * 0.2}
      ]
    },

    fish: {
      name: 'Fish',
      tree: {
        nodes: [
          {id:0,x:134,y:148,r:9},{id:1,x:60,y:96,r:19},
          {id:2,x:208,y:96,r:19},{id:3,x:134,y:246,r:26}
        ],
        edges: [[0,1],[0,2],[0,3]]
      },
      steps: [
        // Kite base
        {id:'A', label:'Fold top-left to diagonal', type:'valley',
         line:{x1:0,y1:0,x2:0.5,y2:0.5}, foldAngle:PI},
        {id:'B', label:'Fold bottom-left to diagonal', type:'valley',
         line:{x1:0,y1:1,x2:0.5,y2:0.5}, foldAngle:PI},
        // Fold in half
        {id:'C', label:'Fold in half', type:'mountain',
         line:{x1:0,y1:0,x2:1,y2:1}, foldAngle:PI * 0.7},
        // Extend shape
        {id:'D', label:'Fold top-right to center', type:'valley',
         line:{x1:1,y1:0,x2:0.5,y2:0.5}, foldAngle:PI * 0.6},
        {id:'E', label:'Fold bottom-right to center', type:'valley',
         line:{x1:1,y1:1,x2:0.5,y2:0.5}, foldAngle:PI * 0.6},
        // Tail
        {id:'F', label:'Fold tail fin up', type:'valley',
         line:{x1:0.7,y1:0.7,x2:1,y2:0.4}, foldAngle:PI * 0.5},
        {id:'G', label:'Shape tail fork', type:'mountain',
         line:{x1:0.8,y1:0.8,x2:1,y2:0.55}, foldAngle:PI * 0.3},
        // Head
        {id:'H', label:'Fold mouth', type:'valley',
         line:{x1:0,y1:0.3,x2:0.2,y2:0.1}, foldAngle:PI * 0.4},
        {id:'I', label:'Shape head', type:'mountain',
         line:{x1:0.05,y1:0.45,x2:0.25,y2:0.25}, foldAngle:PI * 0.25},
        // Body details
        {id:'J', label:'Fold pectoral fin', type:'valley',
         line:{x1:0.2,y1:0.4,x2:0.4,y2:0.6}, foldAngle:PI * 0.3},
        {id:'K', label:'Fold dorsal ridge', type:'mountain',
         line:{x1:0.15,y1:0.35,x2:0.6,y2:0.15}, foldAngle:PI * 0.2},
        {id:'L', label:'Shape belly', type:'valley',
         line:{x1:0.2,y1:0.65,x2:0.6,y2:0.8}, foldAngle:PI * 0.2}
      ]
    },

    waterbomb: {
      name: 'Water Bomb',
      tree: {
        nodes: [
          {id:0,x:134,y:148,r:8},{id:1,x:134,y:53,r:17},{id:2,x:217,y:106,r:17},
          {id:3,x:188,y:226,r:17},{id:4,x:80,y:226,r:17},{id:5,x:51,y:106,r:17}
        ],
        edges: [[0,1],[0,2],[0,3],[0,4],[0,5]]
      },
      steps: [
        // Base
        {id:'A', label:'Fold in half horizontally', type:'valley',
         line:{x1:0,y1:0.5,x2:1,y2:0.5}, foldAngle:PI},
        {id:'B', label:'Fold diagonally', type:'mountain',
         line:{x1:0,y1:0,x2:1,y2:1}, foldAngle:PI},
        {id:'C', label:'Fold other diagonal', type:'mountain',
         line:{x1:1,y1:0,x2:0,y2:1}, foldAngle:PI},
        // Collapse
        {id:'D', label:'Fold in half vertically', type:'valley',
         line:{x1:0.5,y1:0,x2:0.5,y2:1}, foldAngle:PI * 0.7},
        {id:'E', label:'Fold left flap in', type:'valley',
         line:{x1:0,y1:1,x2:0.5,y2:0.5}, foldAngle:PI * 0.6},
        {id:'F', label:'Fold right flap in', type:'valley',
         line:{x1:1,y1:1,x2:0.5,y2:0.5}, foldAngle:PI * 0.6},
        // Fold corners up
        {id:'G', label:'Fold left corner up', type:'valley',
         line:{x1:0,y1:0.75,x2:0.5,y2:0.75}, foldAngle:PI * 0.5},
        {id:'H', label:'Fold right corner up', type:'valley',
         line:{x1:0.5,y1:0.75,x2:1,y2:0.75}, foldAngle:PI * 0.5},
        // Tuck
        {id:'I', label:'Tuck left', type:'mountain',
         line:{x1:0.25,y1:0.5,x2:0.5,y2:0.75}, foldAngle:PI * 0.4},
        {id:'J', label:'Tuck right', type:'mountain',
         line:{x1:0.75,y1:0.5,x2:0.5,y2:0.75}, foldAngle:PI * 0.4},
        // Inflate shape
        {id:'K', label:'Open left side', type:'valley',
         line:{x1:0.15,y1:0.5,x2:0.35,y2:0.65}, foldAngle:PI * 0.3},
        {id:'L', label:'Open right side', type:'valley',
         line:{x1:0.85,y1:0.5,x2:0.65,y2:0.65}, foldAngle:PI * 0.3}
      ]
    },

    insect: {
      name: 'Insect',
      tree: {
        nodes: [
          {id:0,x:134,y:148,r:8},{id:1,x:134,y:53,r:12},
          {id:2,x:53,y:86,r:15},{id:3,x:215,y:86,r:15},
          {id:4,x:36,y:163,r:15},{id:5,x:232,y:163,r:15},
          {id:6,x:53,y:243,r:13},{id:7,x:215,y:243,r:13},{id:8,x:134,y:268,r:13}
        ],
        edges: [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8]]
      },
      steps: [
        // Bird base
        {id:'A', label:'Fold diagonally', type:'valley',
         line:{x1:0,y1:0,x2:1,y2:1}, foldAngle:PI},
        {id:'B', label:'Fold other diagonal', type:'valley',
         line:{x1:1,y1:0,x2:0,y2:1}, foldAngle:PI},
        {id:'C', label:'Fold horizontally', type:'mountain',
         line:{x1:0,y1:0.5,x2:1,y2:0.5}, foldAngle:PI},
        // Kite folds for legs
        {id:'D', label:'Fold top-left to center', type:'valley',
         line:{x1:0.5,y1:0,x2:0,y2:0.5}, foldAngle:PI * 0.6},
        {id:'E', label:'Fold top-right to center', type:'valley',
         line:{x1:0.5,y1:0,x2:1,y2:0.5}, foldAngle:PI * 0.6},
        {id:'F', label:'Fold bottom-left to center', type:'valley',
         line:{x1:0,y1:0.5,x2:0.5,y2:1}, foldAngle:PI * 0.6},
        {id:'G', label:'Fold bottom-right to center', type:'valley',
         line:{x1:1,y1:0.5,x2:0.5,y2:1}, foldAngle:PI * 0.6},
        // Narrow legs
        {id:'H', label:'Narrow front-left', type:'mountain',
         line:{x1:0.15,y1:0,x2:0.5,y2:0.35}, foldAngle:PI * 0.4},
        {id:'I', label:'Narrow front-right', type:'mountain',
         line:{x1:0.85,y1:0,x2:0.5,y2:0.35}, foldAngle:PI * 0.4},
        {id:'J', label:'Narrow back-left', type:'mountain',
         line:{x1:0.15,y1:1,x2:0.5,y2:0.65}, foldAngle:PI * 0.4},
        {id:'K', label:'Narrow back-right', type:'mountain',
         line:{x1:0.85,y1:1,x2:0.5,y2:0.65}, foldAngle:PI * 0.4},
        // Antennae and details
        {id:'L', label:'Fold left antenna', type:'valley',
         line:{x1:0.25,y1:0,x2:0.4,y2:0.15}, foldAngle:PI * 0.35},
        {id:'M', label:'Fold right antenna', type:'valley',
         line:{x1:0.75,y1:0,x2:0.6,y2:0.15}, foldAngle:PI * 0.35},
        {id:'N', label:'Shape head', type:'valley',
         line:{x1:0.35,y1:0.15,x2:0.65,y2:0.15}, foldAngle:PI * 0.25},
        {id:'O', label:'Shape abdomen', type:'mountain',
         line:{x1:0.35,y1:0.85,x2:0.65,y2:0.85}, foldAngle:PI * 0.3}
      ]
    }
  };

  function getList() {
    return Object.keys(DATA).map(k => ({ key: k, name: DATA[k].name }));
  }

  function load(key) {
    const d = DATA[key];
    if (!d) return null;
    return {
      name: d.name,
      steps: d.steps.map(s => ({ ...s, line: { ...s.line } })),
      tree: {
        nodes: d.tree.nodes.map(n => ({ ...n })),
        edges: d.tree.edges.map(e => [...e])
      }
    };
  }

  return { getList, load };
})();
