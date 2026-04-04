/**
 * presets.js — Preset origami models
 *
 * Each preset has:
 *   tree: {nodes, edges} — for tree graph mode (from prototype)
 *   steps: [...] — pre-computed fold steps in A-Z format
 *
 * Fold lines are on unit square [0,1]x[0,1].
 * Angles in degrees (180 = full fold).
 */
const Presets = (() => {

  // All fold lines are in ORIGINAL flat paper coordinates [0,1]x[0,1].
  // The fold engine always classifies vertices using their original position,
  // so each line divides the unfolded sheet into two halves.
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
        // Preliminary base: two diagonal folds + two book folds
        {id:'A', label:'Valley fold in half diagonally', type:'valley',
         line:{x1:0,y1:0,x2:1,y2:1}, angle:180},
        {id:'B', label:'Valley fold other diagonal', type:'valley',
         line:{x1:1,y1:0,x2:0,y2:1}, angle:180},
        {id:'C', label:'Mountain fold in half vertically', type:'mountain',
         line:{x1:0.5,y1:0,x2:0.5,y2:1}, angle:180},
        {id:'D', label:'Mountain fold in half horizontally', type:'mountain',
         line:{x1:0,y1:0.5,x2:1,y2:0.5}, angle:180},
        // Kite folds on front: fold edges to center diagonal
        {id:'E', label:'Kite fold left edge to center', type:'valley',
         line:{x1:0,y1:0,x2:0.5,y2:0.5}, angle:45},
        {id:'F', label:'Kite fold right edge to center', type:'valley',
         line:{x1:1,y1:0,x2:0.5,y2:0.5}, angle:45},
        // Neck and tail: narrow folds from bottom corners
        {id:'G', label:'Reverse fold — neck', type:'mountain',
         line:{x1:0,y1:0.5,x2:0.25,y2:1}, angle:60},
        {id:'H', label:'Reverse fold — tail', type:'mountain',
         line:{x1:1,y1:0.5,x2:0.75,y2:1}, angle:60},
        // Head
        {id:'I', label:'Reverse fold — head', type:'valley',
         line:{x1:0,y1:0.75,x2:0.15,y2:1}, angle:45},
        // Wings
        {id:'J', label:'Fold wings down', type:'valley',
         line:{x1:0.25,y1:0.25,x2:0.75,y2:0.25}, angle:35}
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
        {id:'A', label:'Valley fold in half', type:'valley',
         line:{x1:0,y1:0.5,x2:1,y2:0.5}, angle:180},
        {id:'B', label:'Fold left corner to center', type:'valley',
         line:{x1:0.5,y1:0,x2:0,y2:0.5}, angle:180},
        {id:'C', label:'Fold right corner to center', type:'valley',
         line:{x1:0.5,y1:0,x2:1,y2:0.5}, angle:180},
        {id:'D', label:'Fold bottom strip up', type:'valley',
         line:{x1:0,y1:0.75,x2:1,y2:0.75}, angle:180},
        {id:'E', label:'Open hull', type:'mountain',
         line:{x1:0.5,y1:0,x2:0.5,y2:1}, angle:90}
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
        // Fold all 4 corners to center — classic fortune teller / cootie catcher
        {id:'A', label:'Fold top-left corner to center', type:'valley',
         line:{x1:0,y1:0.5,x2:0.5,y2:0}, angle:180},
        {id:'B', label:'Fold top-right corner to center', type:'valley',
         line:{x1:0.5,y1:0,x2:1,y2:0.5}, angle:180},
        {id:'C', label:'Fold bottom-right corner to center', type:'valley',
         line:{x1:1,y1:0.5,x2:0.5,y2:1}, angle:180},
        {id:'D', label:'Fold bottom-left corner to center', type:'valley',
         line:{x1:0.5,y1:1,x2:0,y2:0.5}, angle:180},
        // Fold in half then open
        {id:'E', label:'Valley fold in half', type:'valley',
         line:{x1:0,y1:0.5,x2:1,y2:0.5}, angle:120},
        {id:'F', label:'Valley fold in half again', type:'valley',
         line:{x1:0.5,y1:0,x2:0.5,y2:1}, angle:120}
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
        // Fish base: kite fold then fold in half
        {id:'A', label:'Fold top-left edge to diagonal', type:'valley',
         line:{x1:0,y1:0,x2:0.5,y2:0.5}, angle:180},
        {id:'B', label:'Fold bottom-left edge to diagonal', type:'valley',
         line:{x1:0,y1:1,x2:0.5,y2:0.5}, angle:180},
        {id:'C', label:'Fold top-right edge to diagonal', type:'valley',
         line:{x1:1,y1:0,x2:0.5,y2:0.5}, angle:180},
        {id:'D', label:'Fold bottom-right edge to diagonal', type:'valley',
         line:{x1:1,y1:1,x2:0.5,y2:0.5}, angle:180},
        {id:'E', label:'Mountain fold in half', type:'mountain',
         line:{x1:0,y1:0,x2:1,y2:1}, angle:90},
        {id:'F', label:'Fold tail fin up', type:'valley',
         line:{x1:0.75,y1:0.75,x2:1,y2:0.5}, angle:60}
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
        // Water bomb base: two diagonals (valley) + two book folds (mountain)
        {id:'A', label:'Valley fold diagonal', type:'valley',
         line:{x1:0,y1:0,x2:1,y2:1}, angle:180},
        {id:'B', label:'Valley fold other diagonal', type:'valley',
         line:{x1:1,y1:0,x2:0,y2:1}, angle:180},
        {id:'C', label:'Mountain fold horizontally', type:'mountain',
         line:{x1:0,y1:0.5,x2:1,y2:0.5}, angle:180},
        {id:'D', label:'Mountain fold vertically', type:'mountain',
         line:{x1:0.5,y1:0,x2:0.5,y2:1}, angle:180},
        // Fold flaps up to form the bomb
        {id:'E', label:'Fold left flap up', type:'valley',
         line:{x1:0,y1:1,x2:0.5,y2:0.5}, angle:90},
        {id:'F', label:'Fold right flap up', type:'valley',
         line:{x1:1,y1:1,x2:0.5,y2:0.5}, angle:90},
        // Tuck flaps
        {id:'G', label:'Tuck left corner in', type:'mountain',
         line:{x1:0.25,y1:0.5,x2:0.5,y2:0.75}, angle:60},
        {id:'H', label:'Tuck right corner in', type:'mountain',
         line:{x1:0.75,y1:0.5,x2:0.5,y2:0.75}, angle:60}
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
        // Bird base then split into legs
        {id:'A', label:'Valley fold diagonal', type:'valley',
         line:{x1:0,y1:0,x2:1,y2:1}, angle:180},
        {id:'B', label:'Valley fold other diagonal', type:'valley',
         line:{x1:1,y1:0,x2:0,y2:1}, angle:180},
        {id:'C', label:'Mountain fold horizontally', type:'mountain',
         line:{x1:0,y1:0.5,x2:1,y2:0.5}, angle:180},
        {id:'D', label:'Mountain fold vertically', type:'mountain',
         line:{x1:0.5,y1:0,x2:0.5,y2:1}, angle:180},
        // Narrow folds for legs — kite-fold edges to center line
        {id:'E', label:'Fold left edge to center', type:'valley',
         line:{x1:0,y1:0,x2:0.5,y2:0.5}, angle:60},
        {id:'F', label:'Fold right edge to center', type:'valley',
         line:{x1:1,y1:0,x2:0.5,y2:0.5}, angle:60},
        {id:'G', label:'Fold bottom-left to center', type:'valley',
         line:{x1:0,y1:1,x2:0.5,y2:0.5}, angle:60},
        {id:'H', label:'Fold bottom-right to center', type:'valley',
         line:{x1:1,y1:1,x2:0.5,y2:0.5}, angle:60},
        // Shape legs outward
        {id:'I', label:'Fold front legs out', type:'mountain',
         line:{x1:0.25,y1:0,x2:0.5,y2:0.25}, angle:45},
        {id:'J', label:'Fold back legs out', type:'mountain',
         line:{x1:0.25,y1:1,x2:0.5,y2:0.75}, angle:45}
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
