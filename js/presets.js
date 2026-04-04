/**
 * presets.js — Preset origami models
 *
 * Each step is ONE fold: a single crease line, one rotation.
 * foldAngle = Math.PI for a full flat fold (180 degrees).
 * All fold lines are on the original flat unit square [0,1]x[0,1].
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
        {id:'A', label:'Fold in half diagonally', type:'valley',
         line:{x1:0,y1:0,x2:1,y2:1}, foldAngle:PI},
        {id:'B', label:'Fold triangle in half', type:'valley',
         line:{x1:1,y1:0,x2:0,y2:1}, foldAngle:PI},
        {id:'C', label:'Fold left edge to center', type:'valley',
         line:{x1:0.5,y1:0,x2:0,y2:0.5}, foldAngle:PI},
        {id:'D', label:'Fold right edge to center', type:'valley',
         line:{x1:0.5,y1:0,x2:1,y2:0.5}, foldAngle:PI},
        {id:'E', label:'Fold bottom left up', type:'mountain',
         line:{x1:0,y1:0.5,x2:0.5,y2:1}, foldAngle:PI},
        {id:'F', label:'Fold bottom right up', type:'mountain',
         line:{x1:0.5,y1:1,x2:1,y2:0.5}, foldAngle:PI},
        {id:'G', label:'Narrow fold — neck', type:'mountain',
         line:{x1:0,y1:0.7,x2:0.3,y2:1}, foldAngle:PI},
        {id:'H', label:'Narrow fold — tail', type:'mountain',
         line:{x1:0.7,y1:1,x2:1,y2:0.7}, foldAngle:PI},
        {id:'I', label:'Fold head down', type:'valley',
         line:{x1:0,y1:0.85,x2:0.15,y2:1}, foldAngle:PI * 0.6}
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
        {id:'A', label:'Fold in half', type:'valley',
         line:{x1:0,y1:0.5,x2:1,y2:0.5}, foldAngle:PI},
        {id:'B', label:'Fold left corner down', type:'valley',
         line:{x1:0.5,y1:0,x2:0,y2:0.5}, foldAngle:PI},
        {id:'C', label:'Fold right corner down', type:'valley',
         line:{x1:0.5,y1:0,x2:1,y2:0.5}, foldAngle:PI},
        {id:'D', label:'Fold bottom edge up', type:'valley',
         line:{x1:0,y1:0.75,x2:1,y2:0.75}, foldAngle:PI},
        {id:'E', label:'Fold left flap in', type:'mountain',
         line:{x1:0.15,y1:0.5,x2:0,y2:0.75}, foldAngle:PI},
        {id:'F', label:'Fold right flap in', type:'mountain',
         line:{x1:0.85,y1:0.5,x2:1,y2:0.75}, foldAngle:PI}
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
         line:{x1:0,y1:0,x2:0.5,y2:0.3}, foldAngle:PI},
        {id:'C', label:'Fold top-right corner to center', type:'valley',
         line:{x1:1,y1:0,x2:0.5,y2:0.3}, foldAngle:PI},
        {id:'D', label:'Fold left wing down', type:'valley',
         line:{x1:0.15,y1:0,x2:0.3,y2:1}, foldAngle:PI},
        {id:'E', label:'Fold right wing down', type:'valley',
         line:{x1:0.85,y1:0,x2:0.7,y2:1}, foldAngle:PI},
        {id:'F', label:'Fold left winglet up', type:'mountain',
         line:{x1:0.05,y1:0.3,x2:0.2,y2:1}, foldAngle:PI * 0.5}
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
        {id:'A', label:'Fold top-left corner to center', type:'valley',
         line:{x1:0,y1:0.5,x2:0.5,y2:0}, foldAngle:PI},
        {id:'B', label:'Fold top-right corner to center', type:'valley',
         line:{x1:0.5,y1:0,x2:1,y2:0.5}, foldAngle:PI},
        {id:'C', label:'Fold bottom-right corner to center', type:'valley',
         line:{x1:1,y1:0.5,x2:0.5,y2:1}, foldAngle:PI},
        {id:'D', label:'Fold bottom-left corner to center', type:'valley',
         line:{x1:0.5,y1:1,x2:0,y2:0.5}, foldAngle:PI},
        {id:'E', label:'Fold in half', type:'valley',
         line:{x1:0,y1:0.5,x2:1,y2:0.5}, foldAngle:PI},
        {id:'F', label:'Fold in half again', type:'valley',
         line:{x1:0.5,y1:0,x2:0.5,y2:1}, foldAngle:PI}
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
        {id:'A', label:'Fold top-left edge to diagonal', type:'valley',
         line:{x1:0,y1:0,x2:0.5,y2:0.5}, foldAngle:PI},
        {id:'B', label:'Fold bottom-left edge to diagonal', type:'valley',
         line:{x1:0,y1:1,x2:0.5,y2:0.5}, foldAngle:PI},
        {id:'C', label:'Fold in half', type:'mountain',
         line:{x1:0,y1:0,x2:1,y2:1}, foldAngle:PI},
        {id:'D', label:'Fold top-right to diagonal', type:'valley',
         line:{x1:1,y1:0,x2:0.5,y2:0.5}, foldAngle:PI},
        {id:'E', label:'Fold tail up', type:'valley',
         line:{x1:0.7,y1:0.7,x2:1,y2:0.4}, foldAngle:PI * 0.7}
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
        {id:'A', label:'Fold in half horizontally', type:'valley',
         line:{x1:0,y1:0.5,x2:1,y2:0.5}, foldAngle:PI},
        {id:'B', label:'Fold in half vertically', type:'valley',
         line:{x1:0.5,y1:0,x2:0.5,y2:1}, foldAngle:PI},
        {id:'C', label:'Fold diagonally', type:'mountain',
         line:{x1:0,y1:0,x2:1,y2:1}, foldAngle:PI},
        {id:'D', label:'Fold other diagonal', type:'mountain',
         line:{x1:1,y1:0,x2:0,y2:1}, foldAngle:PI},
        {id:'E', label:'Fold left flap up', type:'valley',
         line:{x1:0,y1:1,x2:0.5,y2:0.5}, foldAngle:PI},
        {id:'F', label:'Fold right flap up', type:'valley',
         line:{x1:1,y1:1,x2:0.5,y2:0.5}, foldAngle:PI},
        {id:'G', label:'Tuck left corner', type:'mountain',
         line:{x1:0.25,y1:0.5,x2:0.5,y2:0.75}, foldAngle:PI * 0.7},
        {id:'H', label:'Tuck right corner', type:'mountain',
         line:{x1:0.75,y1:0.5,x2:0.5,y2:0.75}, foldAngle:PI * 0.7}
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
        {id:'A', label:'Fold in half diagonally', type:'valley',
         line:{x1:0,y1:0,x2:1,y2:1}, foldAngle:PI},
        {id:'B', label:'Fold other diagonal', type:'valley',
         line:{x1:1,y1:0,x2:0,y2:1}, foldAngle:PI},
        {id:'C', label:'Fold horizontally', type:'mountain',
         line:{x1:0,y1:0.5,x2:1,y2:0.5}, foldAngle:PI},
        {id:'D', label:'Fold vertically', type:'mountain',
         line:{x1:0.5,y1:0,x2:0.5,y2:1}, foldAngle:PI},
        {id:'E', label:'Fold left edge to center', type:'valley',
         line:{x1:0,y1:0,x2:0.5,y2:0.5}, foldAngle:PI * 0.6},
        {id:'F', label:'Fold right edge to center', type:'valley',
         line:{x1:1,y1:0,x2:0.5,y2:0.5}, foldAngle:PI * 0.6},
        {id:'G', label:'Fold bottom-left to center', type:'valley',
         line:{x1:0,y1:1,x2:0.5,y2:0.5}, foldAngle:PI * 0.6},
        {id:'H', label:'Fold bottom-right to center', type:'valley',
         line:{x1:1,y1:1,x2:0.5,y2:0.5}, foldAngle:PI * 0.6}
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
