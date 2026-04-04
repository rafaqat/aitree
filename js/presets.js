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
        {id:'A', label:'Valley fold in half diagonally', type:'valley',
         line:{x1:0,y1:0,x2:1,y2:1}, angle:180},
        {id:'B', label:'Valley fold triangle in half', type:'valley',
         line:{x1:0,y1:1,x2:0.5,y2:0.5}, angle:180},
        {id:'C', label:'Squash fold left flap', type:'mountain',
         line:{x1:0.25,y1:0.5,x2:0.5,y2:1}, angle:180},
        {id:'D', label:'Squash fold right flap', type:'mountain',
         line:{x1:0.5,y1:0.5,x2:0.75,y2:1}, angle:180},
        {id:'E', label:'Kite fold left edge to center', type:'valley',
         line:{x1:0.25,y1:0.5,x2:0.5,y2:0.85}, angle:180},
        {id:'F', label:'Kite fold right edge to center', type:'valley',
         line:{x1:0.75,y1:0.5,x2:0.5,y2:0.85}, angle:180},
        {id:'G', label:'Fold top triangle down', type:'valley',
         line:{x1:0.25,y1:0.5,x2:0.75,y2:0.5}, angle:180},
        {id:'H', label:'Petal fold — lift and flatten', type:'mountain',
         line:{x1:0.35,y1:0.55,x2:0.65,y2:0.55}, angle:160},
        {id:'I', label:'Reverse fold neck', type:'mountain',
         line:{x1:0.35,y1:0.4,x2:0.5,y2:0.6}, angle:140},
        {id:'J', label:'Reverse fold tail', type:'mountain',
         line:{x1:0.5,y1:0.6,x2:0.65,y2:0.4}, angle:140},
        {id:'K', label:'Reverse fold head', type:'valley',
         line:{x1:0.3,y1:0.3,x2:0.4,y2:0.45}, angle:120},
        {id:'L', label:'Fold wings down', type:'valley',
         line:{x1:0.3,y1:0.5,x2:0.7,y2:0.5}, angle:150}
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
        {id:'A', label:'Valley fold in half horizontally', type:'valley',
         line:{x1:0,y1:0.5,x2:1,y2:0.5}, angle:180},
        {id:'B', label:'Valley fold top corners down', type:'valley',
         line:{x1:0.25,y1:0.5,x2:0.5,y2:0.75}, angle:180},
        {id:'C', label:'Valley fold top corners down (right)', type:'valley',
         line:{x1:0.5,y1:0.75,x2:0.75,y2:0.5}, angle:180},
        {id:'D', label:'Fold bottom strip up (front)', type:'valley',
         line:{x1:0,y1:0.3,x2:1,y2:0.3}, angle:180},
        {id:'E', label:'Fold bottom strip up (back)', type:'mountain',
         line:{x1:0,y1:0.25,x2:1,y2:0.25}, angle:180},
        {id:'F', label:'Tuck corners into pocket', type:'mountain',
         line:{x1:0.15,y1:0.25,x2:0.25,y2:0.4}, angle:160},
        {id:'G', label:'Tuck corners (right side)', type:'mountain',
         line:{x1:0.75,y1:0.4,x2:0.85,y2:0.25}, angle:160},
        {id:'H', label:'Open and flatten into boat', type:'valley',
         line:{x1:0.5,y1:0.25,x2:0.5,y2:0.75}, angle:120}
      ]
    },

    frog: {
      name: 'Frog',
      tree: {
        nodes: [
          {id:0,x:134,y:134,r:9},{id:1,x:54,y:60,r:20},{id:2,x:214,y:60,r:20},
          {id:3,x:54,y:236,r:20},{id:4,x:214,y:236,r:20},
          {id:5,x:134,y:46,r:13},{id:6,x:134,y:246,r:13}
        ],
        edges: [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6]]
      },
      steps: [
        {id:'A', label:'Valley fold in half diagonally', type:'valley',
         line:{x1:0,y1:0,x2:1,y2:1}, angle:180},
        {id:'B', label:'Valley fold in half again', type:'valley',
         line:{x1:0,y1:1,x2:0.5,y2:0.5}, angle:180},
        {id:'C', label:'Squash fold to square', type:'mountain',
         line:{x1:0.25,y1:0.5,x2:0.5,y2:1}, angle:180},
        {id:'D', label:'Kite fold edges to center', type:'valley',
         line:{x1:0.25,y1:0.5,x2:0.5,y2:0.8}, angle:180},
        {id:'E', label:'Kite fold right side', type:'valley',
         line:{x1:0.75,y1:0.5,x2:0.5,y2:0.8}, angle:180},
        {id:'F', label:'Petal fold front flap up', type:'mountain',
         line:{x1:0.3,y1:0.55,x2:0.7,y2:0.55}, angle:160},
        {id:'G', label:'Fold front legs down', type:'valley',
         line:{x1:0.3,y1:0.6,x2:0.5,y2:0.4}, angle:140},
        {id:'H', label:'Fold front legs down (right)', type:'valley',
         line:{x1:0.5,y1:0.4,x2:0.7,y2:0.6}, angle:140},
        {id:'I', label:'Fold back legs outward', type:'mountain',
         line:{x1:0.3,y1:0.7,x2:0.5,y2:0.85}, angle:130},
        {id:'J', label:'Fold back legs outward (right)', type:'mountain',
         line:{x1:0.5,y1:0.85,x2:0.7,y2:0.7}, angle:130}
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
        {id:'A', label:'Valley fold in half diagonally', type:'valley',
         line:{x1:0,y1:0,x2:1,y2:1}, angle:180},
        {id:'B', label:'Fold edges to diagonal', type:'valley',
         line:{x1:0,y1:0.35,x2:0.35,y2:0}, angle:180},
        {id:'C', label:'Fold edges to diagonal (lower)', type:'valley',
         line:{x1:0.65,y1:1,x2:1,y2:0.65}, angle:180},
        {id:'D', label:'Mountain fold in half', type:'mountain',
         line:{x1:0.25,y1:0.25,x2:0.75,y2:0.75}, angle:180},
        {id:'E', label:'Fold tail fin', type:'valley',
         line:{x1:0.7,y1:0.5,x2:0.85,y2:0.7}, angle:140},
        {id:'F', label:'Fold head point', type:'valley',
         line:{x1:0.15,y1:0.3,x2:0.3,y2:0.5}, angle:120},
        {id:'G', label:'Shape body', type:'mountain',
         line:{x1:0.3,y1:0.4,x2:0.7,y2:0.6}, angle:100}
      ]
    },

    star: {
      name: 'Star',
      tree: {
        nodes: [
          {id:0,x:134,y:148,r:8},{id:1,x:134,y:53,r:17},{id:2,x:217,y:106,r:17},
          {id:3,x:188,y:226,r:17},{id:4,x:80,y:226,r:17},{id:5,x:51,y:106,r:17}
        ],
        edges: [[0,1],[0,2],[0,3],[0,4],[0,5]]
      },
      steps: [
        {id:'A', label:'Valley fold bottom edge up', type:'valley',
         line:{x1:0,y1:0.6,x2:1,y2:0.6}, angle:180},
        {id:'B', label:'Valley fold left side', type:'valley',
         line:{x1:0.3,y1:0,x2:0.5,y2:0.6}, angle:180},
        {id:'C', label:'Valley fold right side', type:'valley',
         line:{x1:0.5,y1:0.6,x2:0.7,y2:0}, angle:180},
        {id:'D', label:'Mountain fold left point behind', type:'mountain',
         line:{x1:0.15,y1:0.3,x2:0.4,y2:0.5}, angle:160},
        {id:'E', label:'Mountain fold right point behind', type:'mountain',
         line:{x1:0.6,y1:0.5,x2:0.85,y2:0.3}, angle:160},
        {id:'F', label:'Fold top point down', type:'valley',
         line:{x1:0.35,y1:0.2,x2:0.65,y2:0.2}, angle:150},
        {id:'G', label:'Shape bottom points outward', type:'valley',
         line:{x1:0.3,y1:0.7,x2:0.7,y2:0.7}, angle:130},
        {id:'H', label:'Final shaping folds', type:'mountain',
         line:{x1:0.4,y1:0.35,x2:0.6,y2:0.35}, angle:110}
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
        {id:'A', label:'Valley fold in half vertically', type:'valley',
         line:{x1:0.5,y1:0,x2:0.5,y2:1}, angle:180},
        {id:'B', label:'Valley fold in half horizontally', type:'valley',
         line:{x1:0,y1:0.5,x2:0.5,y2:0.5}, angle:180},
        {id:'C', label:'Squash fold to preliminary base', type:'mountain',
         line:{x1:0.25,y1:0.25,x2:0.5,y2:0.5}, angle:180},
        {id:'D', label:'Petal fold front', type:'valley',
         line:{x1:0.15,y1:0.35,x2:0.35,y2:0.65}, angle:170},
        {id:'E', label:'Petal fold back', type:'mountain',
         line:{x1:0.15,y1:0.65,x2:0.35,y2:0.35}, angle:170},
        {id:'F', label:'Fold antenna left', type:'valley',
         line:{x1:0.2,y1:0.2,x2:0.35,y2:0.35}, angle:140},
        {id:'G', label:'Fold antenna right', type:'valley',
         line:{x1:0.35,y1:0.35,x2:0.5,y2:0.2}, angle:140},
        {id:'H', label:'Fold front legs out', type:'mountain',
         line:{x1:0.2,y1:0.4,x2:0.4,y2:0.5}, angle:130},
        {id:'I', label:'Fold middle legs out', type:'mountain',
         line:{x1:0.2,y1:0.55,x2:0.4,y2:0.6}, angle:130},
        {id:'J', label:'Fold back legs down', type:'valley',
         line:{x1:0.2,y1:0.7,x2:0.4,y2:0.8}, angle:120},
        {id:'K', label:'Shape abdomen', type:'mountain',
         line:{x1:0.25,y1:0.8,x2:0.45,y2:0.9}, angle:100}
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
