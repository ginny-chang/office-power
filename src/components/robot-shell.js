import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Slice the curved shell itself: a thin rectangular plate protrudes at its corners.
function sliceShell(source, height, keepAbove) {
  const positions = [], normals = [];
  const p = source.getAttribute('position'), n = source.getAttribute('normal');
  const inside = vertex => keepAbove ? vertex.p.y >= height : vertex.p.y <= height;
  for (let i = 0; i < p.count; i += 3) {
    const triangle = [0, 1, 2].map(offset => ({
      p: new Vector3().fromBufferAttribute(p, i + offset),
      n: new Vector3().fromBufferAttribute(n, i + offset),
    }));
    const polygon = [];
    for (let j = 0; j < 3; j++) {
      const a = triangle[j], b = triangle[(j + 1) % 3];
      if (inside(a)) polygon.push(a);
      if (inside(a) !== inside(b)) {
        const t = (height - a.p.y) / (b.p.y - a.p.y);
        polygon.push({ p: a.p.clone().lerp(b.p, t), n: a.n.clone().lerp(b.n, t).normalize() });
      }
    }
    for (let j = 1; j < polygon.length - 1; j++) {
      for (const vertex of [polygon[0], polygon[j], polygon[j + 1]]) {
        positions.push(...vertex.p.toArray());
        normals.push(...vertex.n.toArray());
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

export function createRobotShell() {
  const source = new RoundedBoxGeometry(1.05, 1.18, .7, 6, .3);
  // 0.008-unit seam at world y=.77; the backing is recessed on every side.
  const head = sliceShell(source, .044, true);
  const torso = sliceShell(source, .036, false);
  const inset = source.clone().scale(.985, .985, .985);
  source.dispose();
  return { head, torso, inset };
}
