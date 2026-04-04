/**
 * presets.js — Preset origami models
 *
 * Each step is ONE fold: a single crease line on the flat paper.
 * foldAngle = Math.PI for a full 180° flat fold.
 * All lines in unit square [0,1]x[0,1].
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
        // Square base (4 folds)
        {id:'A', label:'Fold in half diagonally', type:'valley',
         line:{x1:0,y1:0,x2:1,y2:1}, foldAngle:PI},
        {id:'B', label:'Fold other diagonal', type:'valley',
         line:{x1:1,y1:0,x2:0,y2:1}, foldAngle:PI},
        {id:'C', label:'Fold in half horizontally', type:'mountain',
         line:{x1:0,y1:0.5,x2:1,y2:0.5}, foldAngle:PI},
        {id:'D', label:'Fold in half vertically', type:'mountain',
         line:{x1:0.5,y1:0,x2:0.5,y2:1}, foldAngle:PI},
        // Kite folds — top edges to center (4 folds)
        {id:'E', label:'Fold top-left edge to center', type:'valley',
         line:{x1:0.5,y1:0,x2:0,y2:0.5}, foldAngle:PI},
        {id:'F', label:'Fold top-right edge to center', type:'valley',
         line:{x1:0.5,y1:0,x2:1,y2:0.5}, foldAngle:PI},
        // Kite folds — bottom edges to center (4 folds)
        {id:'G', label:'Fold bottom-left edge to center', type:'valley',
         line:{x1:0,y1:0.5,x2:0.5,y2:1}, foldAngle:PI},
        {id:'H', label:'Fold bottom-right edge to center', type:'valley',
         line:{x1:1,y1:0.5,x2:0.5,y2:1}, foldAngle:PI},
        // Petal fold creases
        {id:'I', label:'Fold top section down', type:'mountain',
         line:{x1:0.25,y1:0.25,x2:0.75,y2:0.25}, foldAngle:PI},
        {id:'J', label:'Fold bottom section up', type:'mountain',
         line:{x1:0.25,y1:0.75,x2:0.75,y2:0.75}, foldAngle:PI},
        // Narrow folds for neck and tail
        {id:'K', label:'Narrow fold left — neck', type:'mountain',
         line:{x1:0,y1:0.65,x2:0.35,y2:1}, foldAngle:PI},
        {id:'L', label:'Narrow fold right — tail', type:'mountain',
         line:{x1:0.65,y1:1,x2:1,y2:0.65}, foldAngle:PI},
        // Shape neck and tail
        {id:'M', label:'Shape neck narrower', type:'valley',
         line:{x1:0.08,y1:0.55,x2:0.45,y2:0.92}, foldAngle:PI},
        {id:'N', label:'Shape tail narrower', type:'valley',
         line:{x1:0.55,y1:0.92,x2:0.92,y2:0.55}, foldAngle:PI},
        // Head
        {id:'O', label:'Reverse fold — head', type:'valley',
         line:{x1:0,y1:0.82,x2:0.18,y2:1}, foldAngle:PI * 0.7},
        // Wings
        {id:'P', label:'Fold wings down', type:'valley',
         line:{x1:0.3,y1:0.3,x2:0.7,y2:0.3}, foldAngle:PI * 0.4}
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
        {id:'B', label:'Fold left half to center', type:'valley',
         line:{x1:0.5,y1:0,x2:0.5,y2:1}, foldAngle:PI},
        {id:'C', label:'Fold top-left corner down', type:'valley',
         line:{x1:0.5,y1:0,x2:0,y2:0.5}, foldAngle:PI},
        {id:'D', label:'Fold top-right corner down', type:'valley',
         line:{x1:0.5,y1:0,x2:1,y2:0.5}, foldAngle:PI},
        {id:'E', label:'Fold bottom strip up', type:'valley',
         line:{x1:0,y1:0.75,x2:1,y2:0.75}, foldAngle:PI},
        {id:'F', label:'Fold bottom-left corner in', type:'mountain',
         line:{x1:0,y1:0.75,x2:0.15,y2:0.5}, foldAngle:PI},
        {id:'G', label:'Fold bottom-right corner in', type:'mountain',
         line:{x1:1,y1:0.75,x2:0.85,y2:0.5}, foldAngle:PI},
        {id:'H', label:'Fold top layer down', type:'valley',
         line:{x1:0,y1:0.35,x2:1,y2:0.35}, foldAngle:PI},
        {id:'I', label:'Tuck left side in', type:'mountain',
         line:{x1:0.2,y1:0.35,x2:0,y2:0.6}, foldAngle:PI},
        {id:'J', label:'Tuck right side in', type:'mountain',
         line:{x1:0.8,y1:0.35,x2:1,y2:0.6}, foldAngle:PI},
        {id:'K', label:'Fold bottom edge up', type:'valley',
         line:{x1:0,y1:0.85,x2:1,y2:0.85}, foldAngle:PI},
        {id:'L', label:'Open boat hull', type:'mountain',
         line:{x1:0.5,y1:0.3,x2:0.5,y2:0.9}, foldAngle:PI * 0.5}
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
        {id:'D', label:'Fold left edge to center again', type:'valley',
         line:{x1:0.1,y1:0,x2:0.5,y2:0.4}, foldAngle:PI},
        {id:'E', label:'Fold right edge to center again', type:'valley',
         line:{x1:0.9,y1:0,x2:0.5,y2:0.4}, foldAngle:PI},
        {id:'F', label:'Fold in half (body)', type:'mountain',
         line:{x1:0.5,y1:0,x2:0.5,y2:1}, foldAngle:PI},
        {id:'G', label:'Fold left wing down', type:'valley',
         line:{x1:0.2,y1:0,x2:0.35,y2:1}, foldAngle:PI},
        {id:'H', label:'Fold right wing down', type:'valley',
         line:{x1:0.8,y1:0,x2:0.65,y2:1}, foldAngle:PI},
        {id:'I', label:'Fold left winglet up', type:'mountain',
         line:{x1:0.08,y1:0.2,x2:0.22,y2:1}, foldAngle:PI * 0.5},
        {id:'J', label:'Fold right winglet up', type:'mountain',
         line:{x1:0.92,y1:0.2,x2:0.78,y2:1}, foldAngle:PI * 0.5},
        {id:'K', label:'Fold tail fin up', type:'valley',
         line:{x1:0.4,y1:0.85,x2:0.6,y2:0.85}, foldAngle:PI * 0.4},
        {id:'L', label:'Crease nose down', type:'valley',
         line:{x1:0.35,y1:0.05,x2:0.65,y2:0.05}, foldAngle:PI * 0.3}
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
        // First fold all corners to center
        {id:'A', label:'Fold top-left corner to center', type:'valley',
         line:{x1:0,y1:0.5,x2:0.5,y2:0}, foldAngle:PI},
        {id:'B', label:'Fold top-right corner to center', type:'valley',
         line:{x1:0.5,y1:0,x2:1,y2:0.5}, foldAngle:PI},
        {id:'C', label:'Fold bottom-right corner to center', type:'valley',
         line:{x1:1,y1:0.5,x2:0.5,y2:1}, foldAngle:PI},
        {id:'D', label:'Fold bottom-left corner to center', type:'valley',
         line:{x1:0.5,y1:1,x2:0,y2:0.5}, foldAngle:PI},
        // Flip and fold corners to center again
        {id:'E', label:'Fold new top-left to center', type:'mountain',
         line:{x1:0.25,y1:0.5,x2:0.5,y2:0.25}, foldAngle:PI},
        {id:'F', label:'Fold new top-right to center', type:'mountain',
         line:{x1:0.5,y1:0.25,x2:0.75,y2:0.5}, foldAngle:PI},
        {id:'G', label:'Fold new bottom-right to center', type:'mountain',
         line:{x1:0.75,y1:0.5,x2:0.5,y2:0.75}, foldAngle:PI},
        {id:'H', label:'Fold new bottom-left to center', type:'mountain',
         line:{x1:0.5,y1:0.75,x2:0.25,y2:0.5}, foldAngle:PI},
        // Fold in half both ways
        {id:'I', label:'Fold in half horizontally', type:'valley',
         line:{x1:0,y1:0.5,x2:1,y2:0.5}, foldAngle:PI},
        {id:'J', label:'Fold in half vertically', type:'valley',
         line:{x1:0.5,y1:0,x2:0.5,y2:1}, foldAngle:PI},
        // Shape
        {id:'K', label:'Crease diagonal for opening', type:'valley',
         line:{x1:0,y1:0,x2:1,y2:1}, foldAngle:PI * 0.3},
        {id:'L', label:'Crease other diagonal', type:'valley',
         line:{x1:1,y1:0,x2:0,y2:1}, foldAngle:PI * 0.3}
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
        {id:'A', label:'Fold top-left edge to diagonal', type:'valley',
         line:{x1:0,y1:0,x2:0.5,y2:0.5}, foldAngle:PI},
        {id:'B', label:'Fold bottom-left edge to diagonal', type:'valley',
         line:{x1:0,y1:1,x2:0.5,y2:0.5}, foldAngle:PI},
        // Fold in half
        {id:'C', label:'Fold in half along diagonal', type:'mountain',
         line:{x1:0,y1:0,x2:1,y2:1}, foldAngle:PI},
        // Extend kite
        {id:'D', label:'Fold top-right edge to diagonal', type:'valley',
         line:{x1:1,y1:0,x2:0.5,y2:0.5}, foldAngle:PI},
        {id:'E', label:'Fold bottom-right edge to diagonal', type:'valley',
         line:{x1:1,y1:1,x2:0.5,y2:0.5}, foldAngle:PI},
        // Shape tail
        {id:'F', label:'Fold tail fin up', type:'valley',
         line:{x1:0.7,y1:0.7,x2:1,y2:0.4}, foldAngle:PI},
        {id:'G', label:'Fold tail fin crease', type:'mountain',
         line:{x1:0.8,y1:0.8,x2:1,y2:0.55}, foldAngle:PI * 0.5},
        // Shape head
        {id:'H', label:'Fold head point', type:'valley',
         line:{x1:0,y1:0.3,x2:0.3,y2:0}, foldAngle:PI * 0.6},
        // Shape body
        {id:'I', label:'Fold belly crease', type:'mountain',
         line:{x1:0.15,y1:0.65,x2:0.65,y2:0.85}, foldAngle:PI * 0.4},
        {id:'J', label:'Fold dorsal crease', type:'valley',
         line:{x1:0.15,y1:0.35,x2:0.65,y2:0.15}, foldAngle:PI * 0.3},
        {id:'K', label:'Shape pectoral fin', type:'valley',
         line:{x1:0.2,y1:0.4,x2:0.4,y2:0.6}, foldAngle:PI * 0.4},
        {id:'L', label:'Shape rear fin', type:'valley',
         line:{x1:0.55,y1:0.55,x2:0.7,y2:0.75}, foldAngle:PI * 0.3}
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
        // Base folds
        {id:'A', label:'Fold in half horizontally', type:'valley',
         line:{x1:0,y1:0.5,x2:1,y2:0.5}, foldAngle:PI},
        {id:'B', label:'Fold in half vertically', type:'valley',
         line:{x1:0.5,y1:0,x2:0.5,y2:1}, foldAngle:PI},
        {id:'C', label:'Fold diagonally', type:'mountain',
         line:{x1:0,y1:0,x2:1,y2:1}, foldAngle:PI},
        {id:'D', label:'Fold other diagonal', type:'mountain',
         line:{x1:1,y1:0,x2:0,y2:1}, foldAngle:PI},
        // Collapse into triangle
        {id:'E', label:'Fold left flap in', type:'valley',
         line:{x1:0,y1:1,x2:0.5,y2:0.5}, foldAngle:PI},
        {id:'F', label:'Fold right flap in', type:'valley',
         line:{x1:1,y1:1,x2:0.5,y2:0.5}, foldAngle:PI},
        // Fold corners up
        {id:'G', label:'Fold bottom-left corner up', type:'valley',
         line:{x1:0,y1:0.75,x2:0.5,y2:0.75}, foldAngle:PI},
        {id:'H', label:'Fold bottom-right corner up', type:'valley',
         line:{x1:0.5,y1:0.75,x2:1,y2:0.75}, foldAngle:PI},
        // Tuck flaps
        {id:'I', label:'Tuck left corner in', type:'mountain',
         line:{x1:0.25,y1:0.5,x2:0.5,y2:0.75}, foldAngle:PI},
        {id:'J', label:'Tuck right corner in', type:'mountain',
         line:{x1:0.75,y1:0.5,x2:0.5,y2:0.75}, foldAngle:PI},
        // Fold tabs for inflation
        {id:'K', label:'Fold left tab down', type:'valley',
         line:{x1:0.15,y1:0.5,x2:0.35,y2:0.65}, foldAngle:PI * 0.5},
        {id:'L', label:'Fold right tab down', type:'valley',
         line:{x1:0.85,y1:0.5,x2:0.65,y2:0.65}, foldAngle:PI * 0.5}
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
        {id:'A', label:'Fold in half diagonally', type:'valley',
         line:{x1:0,y1:0,x2:1,y2:1}, foldAngle:PI},
        {id:'B', label:'Fold other diagonal', type:'valley',
         line:{x1:1,y1:0,x2:0,y2:1}, foldAngle:PI},
        {id:'C', label:'Fold in half horizontally', type:'mountain',
         line:{x1:0,y1:0.5,x2:1,y2:0.5}, foldAngle:PI},
        {id:'D', label:'Fold in half vertically', type:'mountain',
         line:{x1:0.5,y1:0,x2:0.5,y2:1}, foldAngle:PI},
        // Kite folds for legs
        {id:'E', label:'Fold top-left to center', type:'valley',
         line:{x1:0.5,y1:0,x2:0,y2:0.5}, foldAngle:PI},
        {id:'F', label:'Fold top-right to center', type:'valley',
         line:{x1:0.5,y1:0,x2:1,y2:0.5}, foldAngle:PI},
        {id:'G', label:'Fold bottom-left to center', type:'valley',
         line:{x1:0,y1:0.5,x2:0.5,y2:1}, foldAngle:PI},
        {id:'H', label:'Fold bottom-right to center', type:'valley',
         line:{x1:1,y1:0.5,x2:0.5,y2:1}, foldAngle:PI},
        // Narrow for legs
        {id:'I', label:'Narrow front-left leg', type:'mountain',
         line:{x1:0.15,y1:0,x2:0.5,y2:0.35}, foldAngle:PI},
        {id:'J', label:'Narrow front-right leg', type:'mountain',
         line:{x1:0.85,y1:0,x2:0.5,y2:0.35}, foldAngle:PI},
        {id:'K', label:'Narrow back-left leg', type:'mountain',
         line:{x1:0.15,y1:1,x2:0.5,y2:0.65}, foldAngle:PI},
        {id:'L', label:'Narrow back-right leg', type:'mountain',
         line:{x1:0.85,y1:1,x2:0.5,y2:0.65}, foldAngle:PI},
        // Antennae
        {id:'M', label:'Fold left antenna', type:'valley',
         line:{x1:0.25,y1:0,x2:0.4,y2:0.15}, foldAngle:PI * 0.6},
        {id:'N', label:'Fold right antenna', type:'valley',
         line:{x1:0.75,y1:0,x2:0.6,y2:0.15}, foldAngle:PI * 0.6},
        // Body shape
        {id:'O', label:'Shape abdomen', type:'mountain',
         line:{x1:0.35,y1:0.85,x2:0.65,y2:0.85}, foldAngle:PI * 0.5},
        {id:'P', label:'Shape head', type:'valley',
         line:{x1:0.35,y1:0.15,x2:0.65,y2:0.15}, foldAngle:PI * 0.4}
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
