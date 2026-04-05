/**
 * presets.js — Preset origami models
 *
 * Each preset defines fold steps as crease lines on the unit square [0,1]².
 * The virtual UV fold engine tracks which vertices have been folded,
 * so each step builds on the previous fold's result.
 *
 * Fold angles are partial (< PI) for shaping steps where the single-mesh
 * engine can't do true multi-layer folds. Full PI folds are used for
 * structural folds that cleanly divide the paper.
 */
const Presets = (() => {
  const PI = Math.PI;

  const DATA = {
    crane: {
      name: 'Crane (Tsuru)',
      tree: {
        nodes: [
          {id:0,x:134,y:88,r:18},{id:1,x:64,y:162,r:14},{id:2,x:204,y:162,r:14},
          {id:3,x:134,y:194,r:11},{id:4,x:70,y:256,r:22},{id:5,x:198,y:256,r:22},{id:6,x:134,y:276,r:17}
        ],
        edges: [[0,1],[0,2],[0,3],[3,4],[3,5],[3,6]]
      },
      steps: [
        {id:'A', label:'Fold in half diagonally', type:'valley',
         line:{x1:0, y1:0, x2:1, y2:1}, foldAngle:PI},
        {id:'B', label:'Fold left edge to center', type:'valley',
         line:{x1:0, y1:0, x2:0.5, y2:0.5}, foldAngle:PI * 0.75},
        {id:'C', label:'Fold right edge to center', type:'valley',
         line:{x1:1, y1:1, x2:0.5, y2:0.5}, foldAngle:PI * 0.75},
        {id:'D', label:'Fold bottom-left to center', type:'valley',
         line:{x1:0, y1:1, x2:0.5, y2:0.5}, foldAngle:PI * 0.65},
        {id:'E', label:'Fold bottom-right to center', type:'valley',
         line:{x1:1, y1:0, x2:0.5, y2:0.5}, foldAngle:PI * 0.65},
        {id:'F', label:'Raise neck', type:'mountain',
         line:{x1:0.15, y1:0.35, x2:0.35, y2:0.15}, foldAngle:PI * 0.55},
        {id:'G', label:'Raise tail', type:'mountain',
         line:{x1:0.65, y1:0.85, x2:0.85, y2:0.65}, foldAngle:PI * 0.55},
        {id:'H', label:'Fold head', type:'valley',
         line:{x1:0.08, y1:0.18, x2:0.22, y2:0.08}, foldAngle:PI * 0.4},
        {id:'I', label:'Fold wings up', type:'valley',
         line:{x1:0.35, y1:0.65, x2:0.65, y2:0.35}, foldAngle:PI * 0.35}
      ]
    },

    boat: {
      name: 'Simple Boat',
      tree: {
        nodes: [{id:0,x:134,y:80,r:20},{id:1,x:67,y:200,r:20},{id:2,x:201,y:200,r:20}],
        edges: [[0,1],[0,2]]
      },
      steps: [
        {id:'A', label:'Fold in half', type:'valley',
         line:{x1:0, y1:0.5, x2:1, y2:0.5}, foldAngle:PI},
        {id:'B', label:'Fold left corner down', type:'valley',
         line:{x1:0, y1:0, x2:0.5, y2:0.5}, foldAngle:PI * 0.8},
        {id:'C', label:'Fold right corner down', type:'valley',
         line:{x1:1, y1:0, x2:0.5, y2:0.5}, foldAngle:PI * 0.8},
        {id:'D', label:'Fold bottom strip up', type:'mountain',
         line:{x1:0, y1:0.75, x2:1, y2:0.75}, foldAngle:PI * 0.6},
        {id:'E', label:'Shape hull', type:'valley',
         line:{x1:0.5, y1:0, x2:0.5, y2:1}, foldAngle:PI * 0.35}
      ]
    },

    airplane: {
      name: 'Paper Airplane',
      tree: {
        nodes: [{id:0,x:134,y:148,r:10},{id:1,x:134,y:40,r:20},{id:2,x:134,y:260,r:20}],
        edges: [[0,1],[0,2]]
      },
      steps: [
        {id:'A', label:'Fold in half vertically', type:'valley',
         line:{x1:0.5, y1:0, x2:0.5, y2:1}, foldAngle:PI},
        {id:'B', label:'Fold nose left', type:'valley',
         line:{x1:0, y1:0, x2:0.5, y2:0.3}, foldAngle:PI * 0.85},
        {id:'C', label:'Fold nose right', type:'valley',
         line:{x1:1, y1:0, x2:0.5, y2:0.3}, foldAngle:PI * 0.85},
        {id:'D', label:'Fold left wing', type:'valley',
         line:{x1:0.15, y1:0.1, x2:0.35, y2:1}, foldAngle:PI * 0.5},
        {id:'E', label:'Fold right wing', type:'valley',
         line:{x1:0.85, y1:0.1, x2:0.65, y2:1}, foldAngle:PI * 0.5},
        {id:'F', label:'Shape tail', type:'mountain',
         line:{x1:0.35, y1:0.85, x2:0.65, y2:0.85}, foldAngle:PI * 0.3}
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
        {id:'A', label:'Fold top-left to center', type:'valley',
         line:{x1:0, y1:0.5, x2:0.5, y2:0}, foldAngle:PI},
        {id:'B', label:'Fold top-right to center', type:'valley',
         line:{x1:0.5, y1:0, x2:1, y2:0.5}, foldAngle:PI},
        {id:'C', label:'Fold bottom-right to center', type:'valley',
         line:{x1:1, y1:0.5, x2:0.5, y2:1}, foldAngle:PI},
        {id:'D', label:'Fold bottom-left to center', type:'valley',
         line:{x1:0.5, y1:1, x2:0, y2:0.5}, foldAngle:PI}
      ]
    },

    fish: {
      name: 'Fish Base',
      tree: {
        nodes: [
          {id:0,x:134,y:148,r:9},{id:1,x:60,y:96,r:19},
          {id:2,x:208,y:96,r:19},{id:3,x:134,y:246,r:26}
        ],
        edges: [[0,1],[0,2],[0,3]]
      },
      steps: [
        {id:'A', label:'Fold diagonal', type:'valley',
         line:{x1:0, y1:0, x2:1, y2:1}, foldAngle:PI},
        {id:'B', label:'Kite fold left', type:'valley',
         line:{x1:0, y1:0, x2:0.5, y2:0.5}, foldAngle:PI * 0.8},
        {id:'C', label:'Kite fold right', type:'valley',
         line:{x1:1, y1:1, x2:0.5, y2:0.5}, foldAngle:PI * 0.8},
        {id:'D', label:'Fold in half', type:'mountain',
         line:{x1:0, y1:1, x2:1, y2:0}, foldAngle:PI * 0.5},
        {id:'E', label:'Shape tail', type:'valley',
         line:{x1:0.7, y1:0.7, x2:1, y2:0.4}, foldAngle:PI * 0.45},
        {id:'F', label:'Shape head', type:'valley',
         line:{x1:0, y1:0.3, x2:0.3, y2:0}, foldAngle:PI * 0.35}
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
        {id:'A', label:'Fold in half', type:'valley',
         line:{x1:0, y1:0.5, x2:1, y2:0.5}, foldAngle:PI},
        {id:'B', label:'Fold diagonal left', type:'mountain',
         line:{x1:0, y1:0, x2:1, y2:1}, foldAngle:PI * 0.7},
        {id:'C', label:'Fold diagonal right', type:'mountain',
         line:{x1:1, y1:0, x2:0, y2:1}, foldAngle:PI * 0.7},
        {id:'D', label:'Collapse left', type:'valley',
         line:{x1:0, y1:1, x2:0.5, y2:0.5}, foldAngle:PI * 0.55},
        {id:'E', label:'Collapse right', type:'valley',
         line:{x1:1, y1:1, x2:0.5, y2:0.5}, foldAngle:PI * 0.55},
        {id:'F', label:'Fold left corner up', type:'valley',
         line:{x1:0, y1:0.7, x2:0.5, y2:0.7}, foldAngle:PI * 0.45},
        {id:'G', label:'Fold right corner up', type:'valley',
         line:{x1:0.5, y1:0.7, x2:1, y2:0.7}, foldAngle:PI * 0.45}
      ]
    },

    diamond: {
      name: 'Diamond Base',
      tree: {
        nodes: [{id:0,x:134,y:148,r:10},{id:1,x:67,y:80,r:20},{id:2,x:201,y:216,r:20}],
        edges: [[0,1],[0,2]]
      },
      steps: [
        {id:'A', label:'Fold diagonal', type:'valley',
         line:{x1:0, y1:0, x2:1, y2:1}, foldAngle:PI},
        {id:'B', label:'Fold top edge to diagonal', type:'valley',
         line:{x1:0, y1:0, x2:0.5, y2:0.5}, foldAngle:PI * 0.8},
        {id:'C', label:'Fold bottom edge to diagonal', type:'valley',
         line:{x1:1, y1:1, x2:0.5, y2:0.5}, foldAngle:PI * 0.8}
      ]
    },

    hat: {
      name: 'Paper Hat',
      tree: {
        nodes: [{id:0,x:134,y:60,r:18},{id:1,x:67,y:220,r:16},{id:2,x:201,y:220,r:16}],
        edges: [[0,1],[0,2]]
      },
      steps: [
        {id:'A', label:'Fold in half', type:'valley',
         line:{x1:0, y1:0.5, x2:1, y2:0.5}, foldAngle:PI},
        {id:'B', label:'Fold left corner to center', type:'valley',
         line:{x1:0, y1:0, x2:0.5, y2:0.5}, foldAngle:PI * 0.85},
        {id:'C', label:'Fold right corner to center', type:'valley',
         line:{x1:1, y1:0, x2:0.5, y2:0.5}, foldAngle:PI * 0.85},
        {id:'D', label:'Fold brim up (front)', type:'valley',
         line:{x1:0, y1:0.75, x2:1, y2:0.75}, foldAngle:PI * 0.7}
      ]
    }
  };

  // ── Real crane crease pattern (from rabbit-ear/crane.fold by Robby Kraft) ──
  var CRANE_FOLD = {
    vertices_coords: [
      [0,0],[1,0],[1,1],[0,1],[0.5,0.5],[0.5,0.792893],[0.207107,0.5],[0.5,0.207107],[0.792893,0.5],
      [0.665911,0.5],[0.716773,0.57612],[0.865619,0.675577],[0.5,0.334089],[0.42388,0.283227],
      [0.324423,0.134381],[0.5,0.665911],[0.57612,0.716773],[0.675577,0.865619],[0.334089,0.5],
      [0.283227,0.42388],[0.134381,0.324423],[0.5,1],[0.5,0],[0.476713,0.905176],[0.523287,0.094824],
      [0.46194,0.808658],[0.404138,0.729964],[0.353553,0.646447],[0.270036,0.595862],[0.191342,0.53806],
      [0.094824,0.523287],[0,0.5],[0.53806,0.191342],[0.595862,0.270036],[0.646447,0.353553],
      [0.729964,0.404138],[0.808658,0.46194],[0.905176,0.476713],[1,0.5],[0.373017,0.207107],
      [0.207107,0.373017],[0.180808,0.436509],[0.117317,0.41021],[0,0.41021],[0.436509,0.180808],
      [0.41021,0.117317],[0.41021,0],[0.180808,1],[0.15081,0.970002],[0.167045,0.930808],
      [0.12785,0.914573],[0.12785,0.87215],[0.085427,0.87215],[0.069192,0.832955],[0.029998,0.84919],
      [0,0.819192]
    ],
    edges_vertices: [
      [8,11],[8,9],[9,10],[10,11],[8,10],[12,13],[7,12],[4,12],[5,17],[4,15],[15,16],[0,20],[6,18],
      [18,19],[1,22],[0,14],[2,21],[21,23],[4,18],[22,24],[1,24],[4,9],[10,16],[26,27],[27,28],[28,29],
      [30,31],[6,29],[18,28],[4,27],[15,26],[5,25],[24,32],[32,33],[33,34],[34,35],[35,36],[36,37],
      [37,38],[1,38],[8,36],[1,36],[11,37],[1,37],[9,35],[1,35],[7,32],[1,32],[12,33],[1,33],[4,34],
      [1,34],[7,13],[14,39],[13,39],[13,19],[20,40],[19,40],[6,19],[39,40],[40,41],[41,42],[20,41],
      [6,41],[30,42],[20,42],[42,43],[0,43],[31,43],[0,46],[22,46],[39,44],[14,44],[7,44],[45,46],
      [44,45],[14,45],[24,45],[2,38],[23,25],[17,23],[2,17],[2,11],[25,26],[5,15],[5,16],[16,17],
      [3,47],[21,47],[29,30],[23,48],[49,50],[50,51],[51,52],[52,53],[53,54],[54,55],[31,55],[3,55],
      [3,54],[30,54],[3,49],[25,49],[3,53],[29,53],[3,52],[28,52],[3,51],[27,51],[3,50],[26,50],
      [47,48],[48,49],[3,48]
    ],
    edges_assignment: [
      "M","M","V","M","V","V","M","M","M","M","V","M","M","V","B","M","B","M","M","M","V","M","V",
      "V","V","M","M","M","M","V","M","M","V","M","V","V","M","V","M","B","M","M","V","V","M","M",
      "M","M","M","M","V","M","V","M","M","V","M","M","V","M","V","M","M","M","V","V","V","B","B",
      "B","B","V","M","M","V","M","V","V","B","V","V","M","M","M","M","V","M","B","B","V","V","V",
      "M","M","V","M","V","B","B","V","V","M","M","M","M","M","M","V","M","M","M","V","M","V"
    ],
    faces_vertices: [[10,11,2,17,16],[20,0,14,39,40],[2,21,23,17],[37,38,2,11],[9,10,16,15,4],[13,12,4,18,19],[0,20,42,43],[14,0,46,45],[22,1,24],[38,37,1],[33,32,1],[36,35,1],[37,36,1],[24,1,32],[34,33,1],[35,34,1],[23,21,47,48],[31,30,54,55],[29,28,52,53],[26,25,49,50],[25,23,48,49],[30,29,53,54],[27,26,50,51],[28,27,51,52],[39,13,19,40],[18,4,27,28],[4,12,33,34],[4,15,26,27],[9,4,34,35],[11,8,36,37],[5,17,23,25],[22,24,45,46],[30,31,43,42],[6,29,30,42,41],[24,32,7,44,45],[8,11,10],[17,5,16],[26,15,5,25],[6,18,28,29],[8,9,35,36],[12,7,32,33],[40,19,6,41],[7,13,39,44],[9,8,10],[18,6,19],[12,13,7],[15,16,5],[39,14,44],[20,40,41],[41,42,20],[44,14,45],[47,3,48],[55,54,3],[54,53,3],[3,49,48],[50,49,3],[53,52,3],[52,51,3],[51,50,3]],
    folded_coords: [[0,0.084163],[1,0.618678],[0.824415,0.908579],[0.212476,0.915837],[0.530095,0.614259],[0.363377,0.44754],[0.363377,0.44754],[0.363377,0.44754],[0.363377,0.44754],[0.530095,0.378483],[0.421921,0.306203],[0.633447,0.44754],[0.530095,0.378483],[0.421921,0.306203],[0.461038,0.275132],[0.29432,0.614259],[0.222039,0.506084],[0.363377,0.71761],[0.29432,0.614259],[0.222039,0.506084],[0.190968,0.545202],[0.32198,0.406143],[0.32198,0.406143],[0.203294,0.478029],[0.393865,0.287457],[0.32198,0.406143],[0.203294,0.478029],[0.32198,0.406143],[0.203294,0.478029],[0.32198,0.406143],[0.203294,0.478029],[0.32198,0.406143],[0.32198,0.406143],[0.393865,0.287457],[0.32198,0.406143],[0.393865,0.287457],[0.32198,0.406143],[0.393865,0.287457],[0.32198,0.406143],[0.530095,0.378483],[0.29432,0.614259],[0.363377,0.545202],[0.29432,0.614259],[0.412208,0.496371],[0.461038,0.44754],[0.530095,0.378483],[0.412208,0.496371],[0.457659,0.838981],[0.429731,0.89241],[0.457659,0.838981],[0.429731,0.89241],[0.457659,0.838981],[0.429731,0.89241],[0.457659,0.838981],[0.429731,0.89241],[0.457659,0.838981]]
  };

  /**
   * Convert embedded FOLD data into sorted step list.
   * Creases sorted by length (structural first, detail last).
   */
  function loadCraneFOLD() {
    var verts = CRANE_FOLD.vertices_coords;
    var edgesV = CRANE_FOLD.edges_vertices;
    var assignments = CRANE_FOLD.edges_assignment;
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    var creases = [];
    for (var i = 0; i < edgesV.length; i++) {
      var asgn = assignments[i];
      if (asgn === 'B') continue;

      var v0 = verts[edgesV[i][0]], v1 = verts[edgesV[i][1]];
      var len = Math.hypot(v1[0] - v0[0], v1[1] - v0[1]);
      var mx = (v0[0] + v1[0]) / 2, my = (v0[1] + v1[1]) / 2;
      var distC = Math.hypot(mx - 0.5, my - 0.5);

      creases.push({
        type: asgn === 'M' ? 'mountain' : 'valley',
        line: { x1: v0[0], y1: v0[1], x2: v1[0], y2: v1[1] },
        length: len,
        distFromCenter: distC
      });
    }

    // Sort: longest first (structural), then by proximity to center
    creases.sort(function(a, b) {
      var d = b.length - a.length;
      if (Math.abs(d) > 0.01) return d;
      return a.distFromCenter - b.distFromCenter;
    });

    return {
      name: 'Crane (Traditional)',
      isFOLD: true,
      foldData: {
        vertices: CRANE_FOLD.vertices_coords,
        faces: CRANE_FOLD.faces_vertices,
        edges: CRANE_FOLD.edges_vertices,
        assignments: CRANE_FOLD.edges_assignment,
        foldedCoords: CRANE_FOLD.folded_coords
      },
      steps: creases.map(function(c, i) {
        var phase = c.length > 0.4 ? 'Base' : c.length > 0.25 ? 'Structure' : c.length > 0.1 ? 'Shape' : 'Detail';
        return {
          id: i < 26 ? letters[i] : letters[Math.floor(i/26)-1] + letters[i%26],
          label: phase + ' — ' + c.type,
          type: c.type,
          line: c.line,
          angle: 180,
          foldAngle: PI
        };
      }),
      tree: { nodes: [], edges: [] }
    };
  }

  function getList() {
    var list = [{ key: 'crane-fold', name: 'Crane (Traditional CP)' }];
    Object.keys(DATA).forEach(function(k) {
      list.push({ key: k, name: DATA[k].name });
    });
    return list;
  }

  function load(key) {
    if (key === 'crane-fold') return loadCraneFOLD();

    const d = DATA[key];
    if (!d) return null;
    return {
      name: d.name,
      steps: d.steps.map(s => ({
        ...s,
        line: { ...s.line },
        angle: (s.foldAngle || PI) * (180 / PI),
        foldAngle: s.foldAngle || PI
      })),
      tree: {
        nodes: d.tree.nodes.map(n => ({ ...n })),
        edges: d.tree.edges.map(e => [...e])
      }
    };
  }

  return { getList, load };
})();
