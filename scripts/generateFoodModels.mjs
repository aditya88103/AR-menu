/**
 * generateFoodModels.mjs
 * Creates simple but recognisable food-shaped GLB files using raw glTF JSON.
 * Run:  node scripts/generateFoodModels.mjs
 * Output: public/models/*.glb
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'public', 'models');
fs.mkdirSync(OUT, { recursive: true });

/* ─────────────────────────────────────────────────────────────
   Minimal glTF 2.0 builder helpers
───────────────────────────────────────────────────────────── */

function float32Buffer(arr) {
  const buf = Buffer.allocUnsafe(arr.length * 4);
  arr.forEach((v, i) => buf.writeFloatLE(v, i * 4));
  return buf;
}
function uint16Buffer(arr) {
  const buf = Buffer.allocUnsafe(arr.length * 2);
  arr.forEach((v, i) => buf.writeUInt16LE(v, i * 2));
  return buf;
}

/**
 * Build a minimal GLB from arrays of positions and indices.
 * positions: flat [x,y,z, x,y,z, …]   (Float32)
 * indices:   flat [i,j,k, …]            (Uint16)
 * color:     [r,g,b] 0-1 floats
 */
function buildGLB(meshes) {
  // meshes: [{positions, indices, color}]  (accepts pos/idx too)

  const binChunks = [];
  const accessors  = [];
  const bufferViews = [];
  const meshGltf   = { primitives: [] };
  const materials  = [];

  let byteOffset = 0;

  meshes.forEach(({ positions, indices, pos, idx, color }, mi) => {
    // Accept both naming conventions
    const verts = positions ?? pos;
    const tris  = indices   ?? idx;

    const posBuf  = float32Buffer(verts);
    const idxBuf  = uint16Buffer(tris);

    // Align idxBuf to 2-byte boundary (already is)
    const idxViewIdx = bufferViews.length;
    bufferViews.push({ buffer: 0, byteOffset, byteLength: idxBuf.byteLength, target: 34963 });
    byteOffset += idxBuf.byteLength;
    // Pad to 4-byte boundary
    const idxPad = (4 - (idxBuf.byteLength % 4)) % 4;
    byteOffset += idxPad;
    binChunks.push(idxBuf);
    binChunks.push(Buffer.alloc(idxPad));

    const posViewIdx = bufferViews.length;
    bufferViews.push({ buffer: 0, byteOffset, byteLength: posBuf.byteLength, target: 34962 });
    byteOffset += posBuf.byteLength;
    binChunks.push(posBuf);

    // compute bbox for accessor
    let minX=Infinity,minY=Infinity,minZ=Infinity;
    let maxX=-Infinity,maxY=-Infinity,maxZ=-Infinity;
    for (let i=0;i<verts.length;i+=3){
      minX=Math.min(minX,verts[i]);   maxX=Math.max(maxX,verts[i]);
      minY=Math.min(minY,verts[i+1]); maxY=Math.max(maxY,verts[i+1]);
      minZ=Math.min(minZ,verts[i+2]); maxZ=Math.max(maxZ,verts[i+2]);
    }

    const idxAcc = accessors.length;
    accessors.push({ bufferView: idxViewIdx, componentType: 5123, count: tris.length, type: 'SCALAR' });
    const posAcc = accessors.length;
    accessors.push({ bufferView: posViewIdx, componentType: 5126, count: verts.length/3, type: 'VEC3',
      min:[minX,minY,minZ], max:[maxX,maxY,maxZ] });

    const matIdx = materials.length;
    materials.push({
      pbrMetallicRoughness: {
        baseColorFactor: [color[0], color[1], color[2], 1.0],
        metallicFactor:  0.0,
        roughnessFactor: 0.6,
      },
      doubleSided: true,
    });

    meshGltf.primitives.push({ attributes:{ POSITION: posAcc }, indices: idxAcc, material: matIdx });
  });

  const totalBin = Buffer.concat(binChunks);

  const gltf = {
    asset: { version: '2.0', generator: 'BiggiesARGen' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [meshGltf],
    accessors,
    bufferViews,
    materials,
    buffers: [{ byteLength: totalBin.byteLength }],
  };

  const jsonStr  = JSON.stringify(gltf);
  const jsonBuf  = Buffer.from(jsonStr, 'utf8');
  const jsonPad  = (4 - (jsonBuf.byteLength % 4)) % 4;
  const jsonPadded = Buffer.concat([jsonBuf, Buffer.alloc(jsonPad, 0x20)]); // space pad

  const binPad   = (4 - (totalBin.byteLength % 4)) % 4;
  const binPadded = Buffer.concat([totalBin, Buffer.alloc(binPad)]);

  const totalLen = 12 + 8 + jsonPadded.byteLength + 8 + binPadded.byteLength;
  const header   = Buffer.allocUnsafe(12);
  header.writeUInt32LE(0x46546C67, 0); // magic 'glTF'
  header.writeUInt32LE(2,           4); // version
  header.writeUInt32LE(totalLen,    8);

  const jsonChunkHeader = Buffer.allocUnsafe(8);
  jsonChunkHeader.writeUInt32LE(jsonPadded.byteLength, 0);
  jsonChunkHeader.writeUInt32LE(0x4E4F534A, 4); // 'JSON'

  const binChunkHeader = Buffer.allocUnsafe(8);
  binChunkHeader.writeUInt32LE(binPadded.byteLength, 0);
  binChunkHeader.writeUInt32LE(0x004E4942, 4); // 'BIN\0'

  return Buffer.concat([header, jsonChunkHeader, jsonPadded, binChunkHeader, binPadded]);
}

/* ─────────────────────────────────────────────────────────────
   Geometry helpers
───────────────────────────────────────────────────────────── */

/** Rounded cylinder: stacked quads around Y axis */
function cylinder(rx, ry, rz, h, segs=16, yOffset=0) {
  const pos=[], idx=[];
  const rings = 2;
  for (let r=0;r<=rings;r++){
    const y = yOffset + (r/rings)*h;
    for (let s=0;s<segs;s++){
      const a = (s/segs)*Math.PI*2;
      pos.push(rx*Math.cos(a), y, rz*Math.sin(a));
    }
  }
  for (let r=0;r<rings;r++){
    for (let s=0;s<segs;s++){
      const a=r*segs+s, b=r*segs+(s+1)%segs, c=(r+1)*segs+s, d=(r+1)*segs+(s+1)%segs;
      idx.push(a,b,c, b,d,c);
    }
  }
  // top cap
  const topY = yOffset+h, topCenter=pos.length/3;
  pos.push(0,topY,0);
  const topRing = rings*segs;
  for(let s=0;s<segs;s++) idx.push(topCenter,topRing+s,topRing+(s+1)%segs);
  // bottom cap
  const botCenter=pos.length/3;
  pos.push(0,yOffset,0);
  const botRing = 0;
  for(let s=0;s<segs;s++) idx.push(botCenter,botRing+(s+1)%segs,botRing+s);
  return {pos,idx};
}

function sphere(r, segs=12, latSegs=8, cx=0,cy=0,cz=0){
  const pos=[], idx=[];
  for(let lat=0;lat<=latSegs;lat++){
    const phi = (lat/latSegs)*Math.PI;
    for(let lon=0;lon<segs;lon++){
      const theta = (lon/segs)*Math.PI*2;
      pos.push(cx+r*Math.sin(phi)*Math.cos(theta), cy+r*Math.cos(phi), cz+r*Math.sin(phi)*Math.sin(theta));
    }
  }
  for(let lat=0;lat<latSegs;lat++){
    for(let lon=0;lon<segs;lon++){
      const a=lat*segs+lon, b=lat*segs+(lon+1)%segs;
      const c=(lat+1)*segs+lon, d=(lat+1)*segs+(lon+1)%segs;
      idx.push(a,c,b, b,c,d);
    }
  }
  return {pos,idx};
}

function box(w,h,d, ox=0,oy=0,oz=0){
  const hw=w/2,hh=h/2,hd=d/2;
  const pos=[
    ox-hw,oy-hh,oz+hd, ox+hw,oy-hh,oz+hd, ox+hw,oy+hh,oz+hd, ox-hw,oy+hh,oz+hd,
    ox-hw,oy-hh,oz-hd, ox+hw,oy-hh,oz-hd, ox+hw,oy+hh,oz-hd, ox-hw,oy+hh,oz-hd,
  ];
  const idx=[0,1,2,0,2,3, 4,6,5,4,7,6, 0,4,5,0,5,1, 3,2,6,3,6,7, 1,5,6,1,6,2, 0,3,7,0,7,4];
  return {pos,idx};
}

/* merge multiple {pos,idx} – reindexing idx */
function merge(...parts){
  const pos=[], idx=[];
  parts.forEach(p=>{
    const base=pos.length/3;
    pos.push(...p.pos);
    idx.push(...p.idx.map(i=>i+base));
  });
  return {pos,idx};
}

/* ─────────────────────────────────────────────────────────────
   FOOD MODEL FACTORIES
   Each returns  [{positions, indices, color}]  (meshes array)
───────────────────────────────────────────────────────────── */

function makeBurger() {
  const botBun  = cylinder(0.12,0.12,0.12, 0.04, 20, 0);
  const patty   = cylinder(0.11,0.11,0.11, 0.025,20, 0.04);
  const lettuce = cylinder(0.13,0.13,0.13, 0.015,20, 0.065);
  const topBun  = sphere(0.12, 20, 10, 0, 0.14, 0);
  return [
    { ...merge(botBun),  color:[0.76,0.52,0.20] },
    { ...merge(patty),   color:[0.35,0.18,0.08] },
    { ...merge(lettuce), color:[0.25,0.65,0.20] },
    { ...merge(topBun),  color:[0.82,0.60,0.28] },
  ];
}

function makeCurryBowl() {
  const bowl    = cylinder(0.15,0.15,0.15, 0.08, 20, 0);
  const liquid  = cylinder(0.13,0.13,0.13, 0.02, 20, 0.07);
  const garnish = sphere(0.03, 8, 6, 0, 0.10, 0);
  return [
    { ...merge(bowl),    color:[0.95,0.95,0.90] },
    { ...merge(liquid),  color:[0.85,0.35,0.05] },
    { ...merge(garnish), color:[0.20,0.65,0.20] },
  ];
}

function makeNoodleBowl() {
  const bowl = cylinder(0.16,0.16,0.16, 0.09, 20, 0);
  const liquid = cylinder(0.14,0.14,0.14, 0.015, 20, 0.08);
  // Noodle strands as flat boxes
  const noodles = [];
  for(let i=0;i<6;i++){
    const a=(i/6)*Math.PI;
    noodles.push(box(0.18,0.01,0.02, Math.cos(a)*0.02,0.10,Math.sin(a)*0.02));
  }
  return [
    { ...merge(bowl),              color:[0.9,0.8,0.7]  },
    { ...merge(liquid),            color:[0.8,0.5,0.15]  },
    { ...merge(...noodles),        color:[0.95,0.85,0.55] },
  ];
}

function makeBiryaniPlate() {
  const plate = cylinder(0.18,0.18,0.18, 0.03, 24, 0);
  const rice  = cylinder(0.16,0.16,0.16, 0.06, 24, 0.03);
  const herb  = sphere(0.04, 8, 6, 0.05, 0.10, 0.02);
  const herb2 = sphere(0.03, 8, 6, -0.06, 0.10, 0.03);
  return [
    { ...merge(plate), color:[0.95,0.92,0.88] },
    { ...merge(rice),  color:[0.90,0.75,0.35]  },
    { ...merge(herb),  color:[0.20,0.60,0.20]  },
    { ...merge(herb2), color:[0.90,0.20,0.10]  },
  ];
}

function makeIceCream() {
  const cone   = cylinder(0.07,0.01,0.07, 0.15, 16, 0);
  const scoop1 = sphere(0.08, 12, 8, 0, 0.18, 0);
  const scoop2 = sphere(0.07, 12, 8, 0.05, 0.25, 0);
  return [
    { ...merge(cone),   color:[0.85,0.65,0.35] },
    { ...merge(scoop1), color:[0.99,0.80,0.80] },
    { ...merge(scoop2), color:[0.60,0.30,0.15] },
  ];
}

function makeMilkShake() {
  const glass  = cylinder(0.08,0.10,0.08, 0.22, 16, 0);
  const liquid = cylinder(0.07,0.09,0.07, 0.18, 16, 0.01);
  const whip   = sphere(0.09, 12, 6, 0, 0.24, 0);
  const straw  = cylinder(0.01,0.01,0.01, 0.28, 8, 0.10);
  return [
    { ...merge(glass),  color:[0.85,0.95,1.00] },
    { ...merge(liquid), color:[0.70,0.35,0.55] },
    { ...merge(whip),   color:[0.99,0.99,0.99] },
    { ...merge(straw),  color:[0.99,0.30,0.30] },
  ];
}

function makeTandooriPlate() {
  const plate = cylinder(0.18,0.18,0.18, 0.02, 24, 0);
  const piece1 = sphere(0.06, 10, 6, 0.06, 0.06, 0.02);
  const piece2 = sphere(0.06, 10, 6, -0.05, 0.06, -0.03);
  const piece3 = sphere(0.05, 10, 6, 0.00, 0.06, 0.08);
  const garnish = cylinder(0.03,0.03,0.03,0.01,12,0.06);
  return [
    { ...merge(plate),   color:[0.95,0.92,0.88] },
    { ...merge(piece1),  color:[0.80,0.30,0.10]  },
    { ...merge(piece2),  color:[0.75,0.28,0.08]  },
    { ...merge(piece3),  color:[0.78,0.28,0.10]  },
    { ...merge(garnish), color:[0.15,0.60,0.15]  },
  ];
}

function makeWrap() {
  const wrap = cylinder(0.06,0.06,0.06, 0.20, 16, 0);
  const top  = sphere(0.07, 12, 6, 0, 0.22, 0);
  const fillingA = sphere(0.03, 8, 6, 0.02, 0.23, 0);
  const fillingB = sphere(0.025, 8, 6, -0.02, 0.245, 0.01);
  return [
    { ...merge(wrap),     color:[0.96,0.88,0.65] },
    { ...merge(top),      color:[0.94,0.86,0.62] },
    { ...merge(fillingA), color:[0.80,0.25,0.10]  },
    { ...merge(fillingB), color:[0.20,0.70,0.20]  },
  ];
}

function makeNaan() {
  // Flat oval shape
  const base = [];
  const idx  = [];
  const segs = 20;
  const cIdx = 0;
  base.push(0, 0.005, 0); // center top
  for(let i=0;i<segs;i++){
    const a=(i/segs)*Math.PI*2;
    base.push(0.14*Math.cos(a), 0.005, 0.10*Math.sin(a));
  }
  for(let i=0;i<segs;i++) idx.push(0, 1+i, 1+(i+1)%segs);
  // bottom face
  base.push(0, -0.005, 0);
  for(let i=0;i<segs;i++) base.push(0.14*Math.cos((i/segs)*Math.PI*2), -0.005, 0.10*Math.sin((i/segs)*Math.PI*2));
  const botCenter = segs+1;
  for(let i=0;i<segs;i++) idx.push(botCenter, botCenter+1+(i+1)%segs, botCenter+1+i);
  // sides
  for(let i=0;i<segs;i++){
    const a=1+i, b=1+(i+1)%segs, c=botCenter+1+i, d=botCenter+1+(i+1)%segs;
    idx.push(a,b,d, a,d,c);
  }
  return [{ positions:base, indices:idx, color:[0.94,0.80,0.50] }];
}

function makeGulab() {
  const ball1 = sphere(0.07, 12, 8, -0.08, 0.07, 0);
  const ball2 = sphere(0.07, 12, 8,  0.08, 0.07, 0);
  const syrup = cylinder(0.18,0.18,0.18,0.02,20,0);
  return [
    { ...merge(syrup), color:[0.20,0.05,0.00]  },
    { ...merge(ball1), color:[0.70,0.30,0.15]  },
    { ...merge(ball2), color:[0.72,0.30,0.14]  },
  ];
}

function makeBrownie() {
  const brownie = box(0.20, 0.07, 0.16, 0, 0.035, 0);
  const scoop   = sphere(0.07, 12, 8, 0, 0.14, 0);
  const sauce1  = box(0.18, 0.005, 0.14, 0, 0.075, 0);
  return [
    { ...merge(brownie), color:[0.25,0.12,0.04] },
    { ...merge(scoop),   color:[0.96,0.92,0.82]  },
    { ...merge(sauce1),  color:[0.15,0.06,0.02]  },
  ];
}

function makeChai() {
  const cup    = cylinder(0.07,0.08,0.07, 0.10, 16, 0);
  const liquid = cylinder(0.06,0.07,0.06, 0.07, 16, 0.01);
  const handle = box(0.02, 0.06, 0.06, 0.10, 0.05, 0);
  return [
    { ...merge(cup),    color:[0.90,0.90,0.82] },
    { ...merge(liquid), color:[0.65,0.35,0.15]  },
    { ...merge(handle), color:[0.90,0.90,0.82]  },
  ];
}

function makeRice() {
  const plate = cylinder(0.18,0.18,0.18, 0.02, 24, 0);
  const rice  = sphere(0.14, 16, 8, 0, 0.07, 0);
  const herb  = sphere(0.02, 8, 6, 0.04, 0.12, 0);
  return [
    { ...merge(plate), color:[0.94,0.90,0.86] },
    { ...merge(rice),  color:[0.96,0.92,0.80]  },
    { ...merge(herb),  color:[0.20,0.60,0.20]  },
  ];
}

function makeSpringRoll() {
  const roll1 = cylinder(0.04,0.04,0.04, 0.15, 12, 0);
  const roll2 = cylinder(0.04,0.04,0.04, 0.15, 12, 0);
  // rotate roll2 conceptually (just offset it)
  const r2pos = roll2.pos.map((v,i)=>{ const c=i%3; return c===0?v+0.06:c===2?v+0.04:v; });
  const dip   = cylinder(0.06,0.06,0.06, 0.04, 12, 0);
  const dipPos = dip.pos.map((v,i)=>{ const c=i%3; return c===0?v-0.10:v; });
  return [
    { positions:roll1.pos, indices:roll1.idx, color:[0.88,0.72,0.38] },
    { positions:r2pos,     indices:roll2.idx, color:[0.88,0.72,0.38] },
    { positions:dipPos,    indices:dip.idx,   color:[0.80,0.15,0.10]  },
  ];
}

/* ─────────────────────────────────────────────────────────────
   GENERATE ALL MODELS
───────────────────────────────────────────────────────────── */

const models = [
  { name: 'burger',        factory: makeBurger        },
  { name: 'curry-bowl',    factory: makeCurryBowl     },
  { name: 'noodle-bowl',   factory: makeNoodleBowl    },
  { name: 'biryani',       factory: makeBiryaniPlate  },
  { name: 'ice-cream',     factory: makeIceCream      },
  { name: 'milkshake',     factory: makeMilkShake     },
  { name: 'tandoori',      factory: makeTandooriPlate },
  { name: 'wrap',          factory: makeWrap          },
  { name: 'naan',          factory: makeNaan          },
  { name: 'gulab-jamun',   factory: makeGulab         },
  { name: 'brownie',       factory: makeBrownie       },
  { name: 'chai',          factory: makeChai          },
  { name: 'rice',          factory: makeRice          },
  { name: 'spring-roll',   factory: makeSpringRoll    },
];

models.forEach(({ name, factory }) => {
  const meshes = factory();
  const glb    = buildGLB(meshes);
  const outPath = path.join(OUT, `${name}.glb`);
  fs.writeFileSync(outPath, glb);
  console.log(`✅  ${name}.glb  (${(glb.byteLength/1024).toFixed(1)} KB)`);
});

console.log(`\n🎉  ${models.length} food models generated in public/models/`);
