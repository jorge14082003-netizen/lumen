// Genera los iconos PNG de Lumen sin dependencias: dibuja el arco del medidor
// con campos de distancia y supermuestreo, y codifica el PNG a mano.
// Uso: node tools/iconos.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'icons');
mkdirSync(OUT, { recursive: true });

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, rgba) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ]);
}

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
// Composición "over" sobre un píxel [r,g,b,a] premultiplicado no; usamos color recto.
function over(dst, col, a) {
  const outA = a + dst[3] * (1 - a);
  if (outA <= 0) return [0, 0, 0, 0];
  const c = [0, 1, 2].map((i) => (col[i] * a + dst[i] * dst[3] * (1 - a)) / outA);
  return [...c, outA];
}

const BG_IN = hex('#4a2410'), BG_OUT = hex('#120904');
const ARC_A = hex('#ffc48a'), ARC_B = hex('#ff7a2f');
const KNOB = hex('#fff4e8'), GLOW = hex('#ff8a3d');

// Geometría en unidades 0..1 del lienzo. El arco abre 240º, como el medidor de la app.
const A0 = 150, SWEEP = 240, VAL = 0.68;
function angDist(theta, a0, sweep) {
  // devuelve t∈[0,1] si theta cae dentro del arco, o null
  let d = (theta - a0) % 360; if (d < 0) d += 360;
  return d <= sweep ? d / sweep : null;
}
function arcSdf(px, py, cx, cy, R, w, a0, sweep) {
  const dx = px - cx, dy = py - cy;
  const theta = (Math.atan2(dy, dx) * 180) / Math.PI;
  const t = angDist(theta, a0, sweep);
  if (t !== null) return { d: Math.abs(Math.hypot(dx, dy) - R) - w / 2, t };
  // fuera del barrido: distancia a los extremos redondeados
  const e = (a) => [cx + R * Math.cos((a * Math.PI) / 180), cy + R * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = e(a0), [x1, y1] = e(a0 + sweep);
  const d0 = Math.hypot(px - x0, py - y0), d1 = Math.hypot(px - x1, py - y1);
  return d0 < d1 ? { d: d0 - w / 2, t: 0 } : { d: d1 - w / 2, t: 1 };
}
function roundRectSdf(px, py, half, r) {
  const qx = Math.abs(px - 0.5) - half + r, qy = Math.abs(py - 0.5) - half + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

// shape: 'rounded' (esquinas transparentes), 'full' (a sangre), 'maskable' (arte reducido)
function scene(px, py, shape, mark) {
  // fondo
  let col = mix(BG_IN, BG_OUT, clamp(Math.hypot(px - 0.5, py - 0.32) / 0.75));
  let a = 1;
  if (shape === 'rounded') {
    const d = roundRectSdf(px, py, 0.5, 0.22);
    a = clamp(0.5 - d * 512);
  }
  let p = [...col, a];
  const s = shape === 'maskable' ? 0.78 : 1; // zona segura del icono adaptable
  const X = 0.5 + (px - 0.5) / s, Y = 0.5 + (py - 0.5) / s;
  const AA = 1 / 512 / s;
  if (mark === 'plus') {
    const bar = (u, v) => Math.max(Math.abs(u - 0.5) - 0.2, Math.abs(v - 0.5) - 0.045) ;
    const d = Math.min(bar(X, Y), bar(Y, X)) - 0.02;
    const ring = Math.abs(Math.hypot(X - 0.5, Y - 0.5) - 0.36) - 0.025;
    const glow = Math.exp(-Math.pow(Math.hypot(X - 0.5, Y - 0.5) / 0.3, 2)) * 0.35;
    p = over(p, GLOW, glow * a);
    p = over(p, ARC_A, clamp(0.5 - ring / AA) * 0.5 * a);
    p = over(p, KNOB, clamp(0.5 - d / AA) * a);
    return p;
  }
  if (mark === 'lamp') {
    // Lámpara colgante: cordón, pantalla, bombilla y cono de luz sobre el "suelo".
    const sy = 0.5; // borde inferior de la pantalla
    if (Y > sy) {
      const t = (Y - sy) / (1 - sy);
      const half = 0.16 + t * 0.34;
      const edge = clamp((half - Math.abs(X - 0.5)) / 0.08);
      p = over(p, ARC_A, edge * Math.pow(1 - t, 1.3) * 0.42 * a);
    }
    const floor = Math.exp(-(Math.pow((X - 0.5) / 0.3, 2) + Math.pow((Y - 0.86) / 0.05, 2)));
    p = over(p, ARC_A, floor * 0.35 * a);
    const halo = Math.exp(-Math.pow(Math.hypot(X - 0.5, Y - (sy + 0.02)) / 0.2, 2));
    p = over(p, GLOW, halo * 0.6 * a);
    const cord = Math.abs(X - 0.5) - 0.006;
    if (Y < 0.3) p = over(p, [0.85, 0.72, 0.6], clamp(0.5 - cord / AA) * 0.7 * a);
    const cap = Math.max(Math.abs(X - 0.5) - 0.035, Math.abs(Y - 0.29) - 0.022);
    p = over(p, [0.55, 0.32, 0.18], clamp(0.5 - cap / AA) * a);
    const dome = Math.max(Math.hypot((X - 0.5) / 0.25, (Y - sy) / 0.2) - 1, Y - sy) * 0.2;
    if (dome < AA) {
      const g = clamp((Y - 0.3) / 0.2);
      p = over(p, mix([1, 0.8, 0.58], ARC_B, g * 0.8), clamp(0.5 - dome / AA) * a);
    }
    const bd = Math.hypot(X - 0.5, Y - (sy + 0.012)) - 0.055;
    p = over(p, KNOB, clamp(0.5 - bd / AA) * clamp((Y - sy + 0.01) / 0.012) * a);
    return p;
  }
  const cx = 0.5, cy = 0.55, R = 0.3, W = 0.075;
  // halo cálido bajo el arco
  const halo = Math.exp(-Math.pow(Math.hypot(X - cx, Y - (cy - 0.06)) / 0.36, 2)) * 0.28;
  p = over(p, GLOW, halo * a);
  const track = arcSdf(X, Y, cx, cy, R, W, A0, SWEEP);
  p = over(p, [1, 0.92, 0.85], clamp(0.5 - track.d / AA) * 0.12 * a);
  const val = arcSdf(X, Y, cx, cy, R, W, A0, SWEEP * VAL);
  if (val.d < AA) p = over(p, mix(ARC_A, ARC_B, val.t), clamp(0.5 - val.d / AA) * a);
  const ka = ((A0 + SWEEP * VAL) * Math.PI) / 180;
  const kx = cx + R * Math.cos(ka), ky = cy + R * Math.sin(ka);
  const kd = Math.hypot(X - kx, Y - ky);
  p = over(p, GLOW, Math.exp(-Math.pow(kd / 0.11, 2)) * 0.55 * a);
  p = over(p, KNOB, clamp(0.5 - (kd - 0.062) / AA) * a);
  // punto central: "la luz"
  const cd = Math.hypot(X - cx, Y - cy);
  p = over(p, ARC_A, Math.exp(-Math.pow(cd / 0.07, 2)) * 0.5 * a);
  p = over(p, KNOB, clamp(0.5 - (cd - 0.03) / AA) * 0.95 * a);
  return p;
}

function render(size, shape, mark = 'arc') {
  const buf = Buffer.alloc(size * size * 4);
  const SS = 3;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let acc = [0, 0, 0, 0];
    for (let j = 0; j < SS; j++) for (let i = 0; i < SS; i++) {
      const p = scene((x + (i + 0.5) / SS) / size, (y + (j + 0.5) / SS) / size, shape, mark);
      acc = [acc[0] + p[0] * p[3], acc[1] + p[1] * p[3], acc[2] + p[2] * p[3], acc[3] + p[3]];
    }
    const A = acc[3] / (SS * SS);
    const o = (y * size + x) * 4;
    for (let k = 0; k < 3; k++) buf[o + k] = Math.round(clamp(A ? acc[k] / acc[3] : 0) * 255);
    buf[o + 3] = Math.round(A * 255);
  }
  return png(size, buf);
}

const files = [
  ['icon-512.png', 512, 'rounded', 'lamp'],
  ['icon-192.png', 192, 'rounded', 'lamp'],
  ['maskable-512.png', 512, 'maskable', 'lamp'],
  ['apple-touch-icon.png', 180, 'full', 'lamp'],
  ['shortcut-add.png', 96, 'full', 'plus'],
];
for (const [name, size, shape, mark] of files) {
  writeFileSync(join(OUT, name), render(size, shape, mark));
  console.log('ok', name);
}
