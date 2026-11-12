// Office Power agent characters: ten fixed roles built from plain three.js parts.
// Shared by My Board (through office-bots.jsx) and the concept page in design-system/ip-concepts.
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createRobotShell} from '../src/components/robot-shell.js';

// ---------- materials ----------
const tint = (hex, amount) => new THREE.Color(hex).lerp(new THREE.Color('#ffffff'), amount);
// Soft satin finish: smooth surface with a broad, gentle highlight, close to the white robot's shell so the two sit together.
// The colour is deepened a little because My Board's bright stage lighting washes pale tones out.
const clay = color => new THREE.MeshPhysicalMaterial({color: new THREE.Color(color).multiplyScalar(0.86), roughness: 0.42, clearcoat: 0.38, clearcoatRoughness: 0.38, envMapIntensity: 0.55});
const gloss = color => new THREE.MeshPhysicalMaterial({color, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08});
const dark = new THREE.MeshPhysicalMaterial({color: '#17171c', roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05});

// ---------- bodies ----------
const PROFILES = {
  bean: [[0, 0], [0.3, 0.015], [0.5, 0.2], [0.54, 0.6], [0.5, 1.0], [0.42, 1.3], [0.26, 1.5], [0.11, 1.572], [0, 1.58]],
  dumpling: [[0, 0], [0.46, 0.02], [0.74, 0.28], [0.75, 0.58], [0.62, 0.9], [0.36, 1.1], [0.16, 1.158], [0, 1.17]],
  drop: [[0, 0], [0.4, 0.02], [0.67, 0.3], [0.64, 0.68], [0.44, 1.04], [0.22, 1.34], [0.1, 1.52], [0.045, 1.585], [0, 1.6]],
  barrel: [[0, 0], [0.46, 0.015], [0.61, 0.2], [0.62, 0.95], [0.54, 1.18], [0.32, 1.31], [0.14, 1.344], [0, 1.35]],
  gumdrop: [[0, 0], [0.52, 0.015], [0.68, 0.16], [0.66, 0.56], [0.52, 0.94], [0.3, 1.18], [0.12, 1.262], [0, 1.275]],
  pill: [[0, 0], [0.28, 0.015], [0.43, 0.16], [0.45, 0.9], [0.43, 1.42], [0.31, 1.69], [0.12, 1.782], [0, 1.795]],
  pear: [[0, 0], [0.44, 0.015], [0.71, 0.26], [0.68, 0.58], [0.47, 0.9], [0.39, 1.14], [0.31, 1.33], [0.13, 1.442], [0, 1.455]],
  egg: [[0, 0], [0.42, 0.015], [0.68, 0.28], [0.67, 0.72], [0.52, 1.12], [0.32, 1.37], [0.14, 1.468], [0, 1.48]],
};
function lathe(name, sx = 1, sz = 0.92) {
  const pts = new THREE.SplineCurve(PROFILES[name].map(p => new THREE.Vector2(...p))).getPoints(80).map(p => new THREE.Vector2(Math.max(p.x, 0), p.y));
  const geo = new THREE.LatheGeometry(pts, 96);
  geo.scale(sx, 1, sz);
  geo.computeVertexNormals();
  const top = pts[pts.length - 1].y;
  const rAt = y => pts.reduce((best, p) => Math.abs(p.y - y) < Math.abs(best.y - y) ? p : best).x;
  return {
    geo, top, rAt, sx, sz,
    eyeY: {barrel: 0.86, bean: 1.12, dumpling: 0.7, drop: 0.78, egg: 0.98, gumdrop: 0.8, pill: 1.36, pear: 1.1}[name],
    armY: {barrel: 0.5, bean: 0.66, dumpling: 0.46, drop: 0.5, egg: 0.6, gumdrop: 0.46, pill: 0.8, pear: 0.55}[name],
    front: (a, y, off = 0) => [(rAt(y) + off) * Math.sin(a) * sx, y, (rAt(y) + off) * Math.cos(a) * sz],
    side: (s, y, off = 0) => [s * (rAt(y) + off) * sx, y, 0],
    headR: y => rAt(y) * sx,
    // height near the top where the body is r wide, so a hat sits on it instead of floating over a pointed tip
    capY: r => { for (let i = pts.length - 1; i > 0; i--) if (pts[i].x >= r) return pts[i].y; return top; },
  };
}
function box(w = 1.12, h = 1.12, d = 1.12) {
  const hw = w / 2, hd = d / 2;
  const geo = new RoundedBoxGeometry(w, h, d, 8, 0.26);
  geo.translate(0, h / 2, 0);
  return {
    geo, top: h, sx: 1, sz: 1, eyeY: h / 2 + 0.06, armY: h / 2 - 0.1, rAt: () => hw, hw, hd,
    front: (a, y, off = 0) => [a * 0.95, y, hd + off],
    side: (s, y, off = 0) => [s * (hw + off), y, 0],
    headR: () => hw,
    capY: () => h,
    flat: true,
  };
}
const BODIES = {cube: () => box(), tower: () => Object.assign(box(0.98, 1.52, 0.92), {eyeY: 1.14, armY: 0.68})};

// ---------- parts ----------
const mesh = (geo, mat, shadow = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = shadow; return m; };
const ball = (r, mat) => mesh(new THREE.SphereGeometry(r, 40, 28), mat);
// Every character's eyes sit the same distance apart, however wide the body is at eye height
const EYE_HALF = 0.16;
const eyeAngle = body => body.flat ? EYE_HALF / 0.95 : Math.asin(Math.min(0.9, EYE_HALF / (body.rAt(body.eyeY) * body.sx)));
function eyes(body, {color = dark, glow = false} = {}) {
  const g = new THREE.Group(), gap = eyeAngle(body);
  [-1, 1].forEach(s => {
    const a = s * gap, eye = mesh(new THREE.CapsuleGeometry(0.042, 0.075, 8, 20), glow ? new THREE.MeshBasicMaterial({color: '#fbffe9'}) : color, false);
    eye.position.set(...body.front(a, body.eyeY, 0.012));
    eye.rotation.y = body.flat ? 0 : a;
    eye.scale.z = 0.45;
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.013, 12, 8), new THREE.MeshBasicMaterial({color: '#ffffff'}));
    glint.position.set(-0.013, 0.04, 0.04);
    eye.add(glint);
    eye.name = s < 0 ? 'eye0' : 'eye1';
    g.add(eye);
  });
  return g;
}
function limbs(body, mat, holding) {
  const g = new THREE.Group();
  [-1, 1].forEach(s => {
    // The arm hangs from a pivot at the shoulder so it can swing to wave
    const arm = ball(1, mat), shoulder = new THREE.Group();
    arm.scale.set(0.095, 0.2, 0.12);
    arm.position.y = -0.13;
    shoulder.add(arm);
    shoulder.name = s < 0 ? 'arm0' : 'arm1';
    if (holding) {
      // Both arms come round to the front and rest on the sides of what is being held
      shoulder.position.set(holding.x + s * (holding.half + 0.05), holding.y + 0.02, (body.hd ?? body.rAt(holding.y) * body.sz) - 0.03);
      shoulder.rotation.set(1.3, -s * 0.3, 0);
      shoulder.userData.fixed = true;
    } else {
      const [x, y, z] = body.side(s, body.armY, 0.03);
      shoulder.position.set(x - s * 0.04, y + 0.125, z);
      shoulder.rotation.z = s * 0.32;
    }
    shoulder.userData.rest = shoulder.rotation.z;
    g.add(shoulder);
    const foot = ball(1, mat);
    foot.scale.set(0.17, 0.1, 0.22);
    foot.position.set(s * 0.24, -0.02, 0.1);
    g.add(foot);
  });
  return g;
}
// Carried low at the side, below the eyes, so it never covers the face
function hold(g, body, a = 0.78) {
  g.scale.setScalar(0.82);
  g.position.set(...(body.flat ? [body.hw - 0.16, 0.28, body.hd + 0.07] : body.front(a, body.armY - 0.12, 0.1)));
  g.rotation.set(-0.1, body.flat ? 0.15 : a - 0.25, -0.1);
}
const ACCESSORIES = {
  headset(body) {
    const g = new THREE.Group(), y = body.eyeY + 0.02, R = body.headR(y) + 0.035, band = new THREE.MeshPhysicalMaterial({color: '#2b2b33', roughness: 0.4, clearcoat: 0.6});
    const arc = mesh(new THREE.TorusGeometry(R, 0.03, 16, 64, Math.PI), band);
    arc.position.y = y;
    arc.scale.y = (body.top - y + 0.018) / R;
    g.add(arc);
    [-1, 1].forEach(s => {
      const cup = mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 40), band);
      cup.rotation.z = Math.PI / 2;
      cup.position.set(s * (R + 0.02), y, 0);
      g.add(cup);
    });
    const boom = mesh(new THREE.CapsuleGeometry(0.014, 0.34, 6, 12), band);
    boom.position.set(-(R + 0.02), y - 0.14, 0.17);
    boom.rotation.x = -0.95;
    g.add(boom);
    const mic = ball(0.045, band);
    mic.position.set(-(R + 0.0), y - 0.24, 0.32);
    g.add(mic);
    return g;
  },
  hardhat(body) {
    const g = new THREE.Group(), mat = new THREE.MeshPhysicalMaterial({color: '#ffc533', roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.4});
    const y = body.flat ? body.top - 0.02 : body.capY(0.5), R = body.flat ? 0.5 : 0.56, squash = 0.68;
    const dome = mesh(new THREE.SphereGeometry(R, 56, 28, 0, Math.PI * 2, 0, Math.PI / 2), mat);
    dome.scale.y = squash;
    g.add(dome);
    const brim = mesh(new THREE.CylinderGeometry(R * 1.06, R * 1.08, 0.04, 56), mat);
    brim.scale.z = 1.12;
    brim.position.set(0, 0.012, 0.05);
    g.add(brim);
    [-0.17, 0, 0.17].forEach(x => {
      const rib = mesh(new THREE.TorusGeometry(Math.sqrt(R * R - x * x) * 0.995, 0.03, 10, 40, Math.PI), mat, false);
      rib.rotation.y = Math.PI / 2;
      rib.scale.y = squash;
      rib.position.x = x;
      g.add(rib);
    });
    g.position.y = y;
    g.rotation.x = -0.06;
    return g;
  },
  badge(body) {
    // Lanyard: a tilted loop that hangs lower at the front, with the ID card clipped at its lowest point
    const g = new THREE.Group(), blue = gloss('#3d5fd0'), high = body.eyeY - 0.2, drop = 0.3;
    blue.roughness = 0.5;
    // Follow the body surface all the way round so the strap never sinks into the body
    const loop = [];
    for (let i = 0; i < 72; i++) {
      const a = i / 72 * Math.PI * 2;
      loop.push(new THREE.Vector3(...body.front(a, high - drop * ((1 + Math.cos(a)) / 2) ** 1.6, 0.012)));
    }
    g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(loop, true), 160, 0.017, 10, true), blue));
    const low = high - drop, card = new THREE.Group();
    card.add(mesh(new RoundedBoxGeometry(0.24, 0.3, 0.035, 4, 0.016), gloss('#ffffff')));
    const face = ball(0.042, gloss('#7d5fd6'));
    face.scale.z = 0.4;
    face.position.set(0, 0.04, 0.02);
    card.add(face);
    const line = mesh(new RoundedBoxGeometry(0.13, 0.026, 0.012, 2, 0.006), gloss('#c9bdf0'), false);
    line.position.set(0, -0.07, 0.02);
    card.add(line);
    const clip = mesh(new RoundedBoxGeometry(0.06, 0.07, 0.04, 2, 0.012), blue, false);
    clip.position.y = 0.165;
    card.add(clip);
    card.position.set(...body.front(0, low - 0.2, 0.04));
    card.rotation.x = -0.05;
    g.add(card);
    return g;
  },
  clipboard(body) {
    const g = new THREE.Group(), a = 0.78;
    g.add(mesh(new RoundedBoxGeometry(0.36, 0.46, 0.045, 4, 0.02), gloss('#f2a84a')));
    const paper = mesh(new RoundedBoxGeometry(0.3, 0.38, 0.02, 2, 0.008), gloss('#ffffff'), false);
    paper.position.set(0, -0.02, 0.02);
    g.add(paper);
    const clip = mesh(new RoundedBoxGeometry(0.14, 0.06, 0.05, 2, 0.015), gloss('#4a4a55'), false);
    clip.position.set(0, 0.21, 0.02);
    g.add(clip);
    [0.08, -0.02, -0.12].forEach((y, i) => {
      const tick = mesh(new RoundedBoxGeometry(0.045, 0.045, 0.012, 2, 0.008), gloss(i < 2 ? '#1f9a66' : '#d6d6dc'), false);
      tick.position.set(-0.09, y, 0.034);
      g.add(tick);
      const row = mesh(new RoundedBoxGeometry(0.14, 0.024, 0.01, 2, 0.005), gloss('#c9c9d2'), false);
      row.position.set(0.035, y, 0.034);
      g.add(row);
    });
    // Sits low at the side, below the eyes
    hold(g, body, a);
    return g;
  },
  calculator(body) {
    const g = new THREE.Group();
    g.add(mesh(new RoundedBoxGeometry(0.36, 0.46, 0.06, 4, 0.03), gloss('#2f3140')));
    const screen = mesh(new RoundedBoxGeometry(0.28, 0.1, 0.02, 2, 0.012), gloss('#c9f2e0'), false);
    screen.position.set(0, 0.14, 0.03);
    g.add(screen);
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
      const keycap = mesh(new RoundedBoxGeometry(0.07, 0.065, 0.03, 2, 0.014), gloss(row === 2 && col === 2 ? '#ff9a3c' : '#f4f5f7'), false);
      keycap.position.set(-0.095 + col * 0.095, 0.03 - row * 0.085, 0.035);
      g.add(keycap);
    }
    hold(g, body);
    return g;
  },
  clock(body) {
    // Alarm clock: a face on the tummy and two bells on top
    const g = new THREE.Group(), navy = gloss('#2f3f8f'), y = body.eyeY - 0.42, face = new THREE.Group();
    navy.roughness = 0.35;
    const dial = mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.04, 56), gloss('#ffffff'));
    dial.rotation.x = Math.PI / 2;
    face.add(dial);
    const bezel = mesh(new THREE.TorusGeometry(0.19, 0.026, 14, 64), navy, false);
    bezel.position.z = 0.012;
    face.add(bezel);
    [[0.1, 0.5], [0.14, -1.1]].forEach(([len, turn]) => {
      const hand = mesh(new RoundedBoxGeometry(0.026, len, 0.016, 2, 0.008), navy, false);
      hand.geometry.translate(0, len / 2, 0);
      hand.rotation.z = turn;
      hand.position.z = 0.026;
      hand.name = len > 0.12 ? 'minute' : 'hour';
      face.add(hand);
    });
    const hub = ball(0.024, navy);
    hub.position.z = 0.03;
    face.add(hub);
    face.position.set(...body.front(0, y, 0.01));
    face.rotation.x = -0.1;
    g.add(face);
    [-1, 1].forEach(s => {
      const bell = mesh(new THREE.SphereGeometry(0.13, 36, 20, 0, Math.PI * 2, 0, Math.PI / 2), navy);
      bell.position.set(s * 0.24, body.capY(0.3) - 0.02, 0);
      bell.rotation.z = -s * 0.5;
      g.add(bell);
    });
    return g;
  },
  gear(body) {
    // One solid piece set slightly into the body: tapered teeth with rounded tips on a true circular rim, a bevelled edge and a raised hub round the bore
    const outline = new THREE.Shape(), teeth = 8, step = Math.PI * 2 / teeth, r1 = 0.15, r2 = 0.215, root = 0.24, tip = 0.13;
    outline.moveTo(Math.cos(-root) * r1, Math.sin(-root) * r1);
    for (let i = 0; i < teeth; i++) {
      const a = i * step;
      outline.absarc(0, 0, r2, a - tip, a + tip, false);
      outline.absarc(0, 0, r1, a + root, a + step - root, false);
    }
    const bore = new THREE.Path();
    bore.absarc(0, 0, 0.058, 0, Math.PI * 2, true);
    outline.holes.push(bore);
    const steel = gloss('#f4f5f8'), shade = gloss('#d5dbe6');
    steel.roughness = shade.roughness = 0.35;
    const g = new THREE.Group();
    g.add(mesh(new THREE.ExtrudeGeometry(outline, {depth: 0.045, bevelEnabled: true, bevelThickness: 0.014, bevelSize: 0.014, bevelSegments: 5, curveSegments: 40}), steel));
    const hub = new THREE.Shape();
    hub.absarc(0, 0, 0.105, 0, Math.PI * 2, false);
    const hubBore = new THREE.Path();
    hubBore.absarc(0, 0, 0.058, 0, Math.PI * 2, true);
    hub.holes.push(hubBore);
    const collar = mesh(new THREE.ExtrudeGeometry(hub, {depth: 0.02, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3, curveSegments: 40}), shade, false);
    collar.position.z = 0.055;
    g.add(collar);
    g.position.set(...body.front(0, body.eyeY - 0.46, -0.04));
    g.rotation.z = step / 2;
    return g;
  },
  laptop(body) {
    // Open laptop held in front of the tummy, screen towards the character, so we see the back of the lid
    const g = new THREE.Group(), silver = new THREE.MeshPhysicalMaterial({color: '#e9ebef', metalness: 0.35, roughness: 0.32, clearcoat: 0.4, clearcoatRoughness: 0.3});
    const w = 0.56, deep = 0.36, tall = 0.33;
    const base = mesh(new RoundedBoxGeometry(w, 0.03, deep, 3, 0.014), silver);
    g.add(base);
    const lid = new THREE.Group();
    const panel = mesh(new RoundedBoxGeometry(w, tall, 0.022, 3, 0.011), silver);
    panel.position.y = tall / 2;
    lid.add(panel);
    const mark = mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.008, 40), new THREE.MeshPhysicalMaterial({color: '#aeb5c2', metalness: 0.4, roughness: 0.3}), false);
    mark.rotation.x = Math.PI / 2;
    mark.position.set(0, tall / 2, 0.012);
    lid.add(mark);
    lid.position.set(0, 0.012, deep / 2 - 0.012);
    lid.rotation.x = 0.26;
    g.add(lid);
    g.position.set(0.03, body.armY - 0.3, body.hd + deep / 2 - 0.05);
    g.rotation.set(0.1, 0, 0);
    return g;
  },
  glasses(body) {
    // Thin gold round frames. The bridge and both side arms start on the rims themselves, so the frame is one connected piece.
    const g = new THREE.Group(), gold = new THREE.MeshPhysicalMaterial({color: '#e2b23a', metalness: 0.75, roughness: 0.22, clearcoat: 0.5});
    const R = 0.118, wire = 0.011, gap = eyeAngle(body), rim = {};
    const tube = (points, segments = 32) => g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), segments, wire, 8, false), gold, false));
    [-1, 1].forEach(s => {
      const a = s * gap, centre = new THREE.Vector3(...body.front(a, body.eyeY, 0.05)), across = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
      const ring = mesh(new THREE.TorusGeometry(R, wire, 14, 64), gold, false);
      ring.position.copy(centre);
      ring.rotation.y = a;
      g.add(ring);
      rim[s] = {inner: centre.clone().addScaledVector(across, -s * R), outer: centre.clone().addScaledVector(across, s * R)};
      const edge = Math.atan2(rim[s].outer.x / body.sx, rim[s].outer.z / body.sz);
      tube([rim[s].outer, ...[0.25, 0.6, 1].map(t => new THREE.Vector3(...body.front(edge + s * t * 0.95, body.eyeY + t * 0.02, 0.03)))]);
    });
    const arch = rim[-1].inner.clone().lerp(rim[1].inner, 0.5);
    arch.y += 0.03;
    arch.z += 0.012;
    tube([rim[-1].inner, arch, rim[1].inner], 20);
    return g;
  },
  beret(body) {
    // A soft cap worn slightly to one side: the designer's mark
    const g = new THREE.Group(), felt = clay('#2f3140'), y = body.capY(0.3);
    const band = mesh(new THREE.TorusGeometry(0.27, 0.035, 12, 56), felt);
    band.rotation.x = Math.PI / 2;
    g.add(band);
    const crown = ball(1, felt);
    crown.scale.set(0.4, 0.13, 0.4);
    crown.position.set(0.05, 0.07, 0);
    g.add(crown);
    const stalk = mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.07, 10), felt);
    stalk.position.set(0.05, 0.21, 0);
    g.add(stalk);
    g.position.y = y;
    g.rotation.z = -0.16;
    return g;
  },
  pencil(body) {
    // A big pencil stood beside the body like a staff
    const g = new THREE.Group(), r = 0.062;
    const part = (geo, mat, y) => { const m = mesh(geo, mat); m.position.y = y; g.add(m); return m; };
    part(new THREE.CylinderGeometry(r, r, 0.12, 20), clay('#f48fb1'), 1.0);
    part(new THREE.CylinderGeometry(r * 1.04, r * 1.04, 0.06, 20), new THREE.MeshPhysicalMaterial({color: '#c9ccd3', metalness: 0.6, roughness: 0.3}), 0.91);
    part(new THREE.CylinderGeometry(r, r, 0.64, 6), gloss('#ffc533'), 0.56).material.roughness = 0.4;
    // The sharpened wood stops where the lead starts, at the same width and with the same six sides, so the two read as one point
    part(new THREE.CylinderGeometry(r, r * 0.36, 0.13, 6), clay('#f0d2a8'), 0.175);
    part(new THREE.ConeGeometry(r * 0.36, 0.07, 6), dark, 0.075).rotation.x = Math.PI;
    // Top rests in the hand; the point is planted forward, in front of the feet
    const hand = body.side(1, body.armY, 0.13)[0], lean = 0.4, inward = 0.15, reach = 0.9;
    g.position.set(hand - Math.sin(inward) * reach, -0.13, 0.07 + Math.sin(lean) * reach);
    g.rotation.set(-lean, 0, -inward);
    return g;
  },
  sprout(body) {
    // Built around its own base on top of the head so it can sway from there
    const g = new THREE.Group(), mat = gloss('#6fb52c');
    const stem = mesh(new THREE.CylinderGeometry(0.02, 0.024, 0.18, 12), mat);
    stem.position.y = 0.06;
    g.add(stem);
    [-1, 1].forEach(s => {
      const leaf = ball(1, mat);
      leaf.scale.set(0.17, 0.045, 0.095);
      leaf.position.set(s * 0.14, 0.17, 0);
      leaf.rotation.z = s * 0.55;
      g.add(leaf);
    });
    g.position.y = body.top;
    return g;
  },
};

// Ten fixed roles. Agents in the same role share one look: same shape, colour and prop.
export const ROLES = {
  attendance: {name: '出勤假勤', prop: '鬧鐘', fits: '打卡、請假、假勤流程', shape: 'gumdrop', color: '#3f93ea', accessory: ['clock']},
  equipment: {name: '設備維修', prop: '工程帽與齒輪', fits: '報修、器材、資產', shape: 'barrel', color: '#6a7da6', accessory: ['hardhat', 'gear']},
  product: {name: '產品開發', prop: '筆電', fits: '產品、App、網頁分析', shape: 'tower', color: '#6a4be0', accessory: ['laptop']},
  project: {name: '專案管理', prop: '待辦清單板', fits: 'PM、專案、活動', shape: 'cube', color: '#1fae9c', accessory: ['clipboard']},
  sales: {name: '業務接待', prop: '耳機', fits: '業務、名片、訪客', shape: 'egg', color: '#fb7430', accessory: ['headset']},
  hr: {name: '人資', prop: '識別證', fits: 'HR、招募', shape: 'bean', color: '#ef6f9c', accessory: ['badge']},
  design: {name: '設計內容', prop: '貝雷帽與鉛筆', fits: '設計、簡報、文件', shape: 'pill', color: '#ea4f42', accessory: ['beret', 'pencil']},
  life: {name: '生活福利', prop: '嫩芽', fits: '澆水、茶水間', shape: 'drop', color: '#72c043', accessory: ['sprout']},
  finance: {name: '財務', prop: '計算機', fits: '報帳、費用、發票', shape: 'dumpling', color: '#fcbf1e', accessory: ['calculator']},
  general: {name: '通用', prop: '金色細框眼鏡', fits: '對不到類別的 Agent', shape: 'pear', color: '#e0cba9', accessory: ['glasses']},
};

function assemble({shape, color, accessory}) {
  const body = BODIES[shape] ? BODIES[shape]() : lathe(shape);
  const mat = clay(color);
  const root = new THREE.Group(), lift = new THREE.Group();
  lift.name = 'body';
  lift.position.y = 0.09;
  lift.add(mesh(body.geo, mat));
  lift.add(eyes(body));
  accessory.forEach(name => { const part = ACCESSORIES[name](body, null, mat); part.name = part.name || name; lift.add(part); });
  const l = limbs(body, mat, accessory.includes('laptop') ? {x: 0.03, y: body.armY - 0.3, half: 0.28} : null);
  // Arms ride on the body so they breathe and bounce with it; the feet stay planted
  l.children.filter(child => child.name.startsWith('arm')).forEach(arm => lift.add(arm));
  l.position.y = 0.09;
  root.add(l, lift);
  root.userData.height = body.top + 0.09;
  return root;
}

// One prototype per role; every agent in that role gets a clone that shares its geometry and materials
const prototypes = new Map();
export function buildAgent(role) {
  const id = ROLES[role] ? role : 'general';
  if (!prototypes.has(id)) prototypes.set(id, assemble(ROLES[id]));
  const copy = prototypes.get(id).clone(true);
  copy.userData.role = id;
  return copy;
}

// NOVA keeps the existing white Office Power robot (same parts as office-bots.jsx). White reads on all four themes.
export function buildNova() {
  const shell = createRobotShell(), root = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({color: '#f1f2f3', roughness: 0.48});
  const std = (color, roughness, metalness = 0) => new THREE.MeshStandardMaterial({color, roughness, metalness});
  const box = (w, h, d, r, seg, mat, pos) => { const m = mesh(new RoundedBoxGeometry(w, h, d, seg, r), mat); m.position.set(...pos); root.add(m); return m; };
  ['torso', 'inset', 'head'].forEach(part => { const m = mesh(shell[part], white); m.position.y = 0.73; root.add(m); });
  [-0.29, 0.29].forEach(x => box(0.46, 0.32, 0.66, 0.13, 4, white, [x, 0.16, 0.015]));
  box(0.35, 0.115, 0.08, 0.05, 3, std('#9ca3aa', 0.45), [0, 0.41, 0.36]);
  box(0.326, 0.096, 0.06, 0.045, 3, std('#e2e5e8', 0.4), [0, 0.41, 0.4]);
  // Same rounded-rectangle visor as drei's RoundedBox(0.79, 0.76, 0.22, radius 0.22)
  const w = 0.79, h = 0.76, r = 0.22, bevel = 0.05, face = new THREE.Shape();
  face.moveTo(-w / 2 + r, -h / 2);
  face.lineTo(w / 2 - r, -h / 2); face.absarc(w / 2 - r, -h / 2 + r, r, -Math.PI / 2, 0);
  face.lineTo(w / 2, h / 2 - r); face.absarc(w / 2 - r, h / 2 - r, r, 0, Math.PI / 2);
  face.lineTo(-w / 2 + r, h / 2); face.absarc(-w / 2 + r, h / 2 - r, r, Math.PI / 2, Math.PI);
  face.lineTo(-w / 2, -h / 2 + r); face.absarc(-w / 2 + r, -h / 2 + r, r, Math.PI, Math.PI * 1.5);
  const visorGeo = new THREE.ExtrudeGeometry(face, {depth: 0.22 - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: 8, curveSegments: 24});
  visorGeo.translate(0, 0, -0.11 + bevel);
  const visor = mesh(visorGeo, new THREE.MeshPhysicalMaterial({color: '#101116', roughness: 0.16, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08}));
  visor.position.set(0, 0.97, 0.335);
  root.add(visor);
  [-0.115, 0.115].forEach(x => {
    const eye = mesh(new THREE.CapsuleGeometry(0.056, 0.135, 6, 16), new THREE.MeshBasicMaterial({color: '#f7f7fa'}), false);
    eye.position.set(x, 0.9, 0.465);
    eye.scale.z = 0.22;
    root.add(eye);
  });
  [-1, 1].forEach(side => {
    const arm = ball(1, std('#eef0f2', 0.45));
    arm.scale.set(0.11, 0.26, 0.14);
    arm.position.set(side * 0.55, 0.56, 0.04);
    root.add(arm);
    const ear = new THREE.Group();
    ear.position.set(side * 0.36, 1.33, 0);
    ear.rotation.z = side * -0.4;
    [[0.14, 0.15, 0.1, 0.055, std('#e5e7e9', 0.35)], [0.1, 0.1, 0.05, 0.13, std('#777d84', 0.25, 0.8)], [0.13, 0.13, 0.24, 0.27, std('#f0f1f3', 0.35)]].forEach(([rt, rb, h, y, mat]) => {
      const m = mesh(new THREE.CylinderGeometry(rt, rb, h, 28), mat);
      m.position.y = y;
      ear.add(m);
    });
    root.add(ear);
  });
  return root;
}
