// Concept stills for the Office Power character IP. Plain three.js so what is approved here can ship in My Board.
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {ROLES, buildAgent, buildNova} from './src-dashboard/agent-characters.js';

const SIZE = 520;
const BG = '#f4f3f7';
const renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
renderer.setPixelRatio(2);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(BG);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.75;
scene.add(new THREE.HemisphereLight('#ffffff', '#d9d6e2', 0.7));
const key = new THREE.DirectionalLight('#ffffff', 2.3);
key.position.set(3.2, 6.5, 5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, {left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 20});
key.shadow.radius = 9;
key.shadow.bias = -0.0002;
key.shadow.normalBias = 0.03;
scene.add(key);
const fill = new THREE.DirectionalLight('#eef0ff', 0.55);
fill.position.set(-5, 3, 2.5);
scene.add(fill);
const rim = new THREE.DirectionalLight('#fff4e8', 0.7);
rim.position.set(-1, 4, -6);
scene.add(rim);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({opacity: 0.2}));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 50);

function shoot(model, {turn = -0.3, zoom = 1.45, width = SIZE, height = SIZE, look = 0.8} = {}) {
  model.rotation.y = turn;
  scene.add(model);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.position.set(0, 1.5, 8.6 / zoom);
  camera.lookAt(0, look, 0);
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL('image/png');
  scene.remove(model);
  return url;
}

// Shape = job category, material = matte clay for everyone, accessory = what the agent's name says it does.
const ROSTER = Object.entries(ROLES).map(([id, role]) => ({id, ...role}));

const hero = document.getElementById('hero');
hero.innerHTML = `<img alt="大腦總管 NOVA" src="${shoot(buildNova(), {turn: -0.3, zoom: 1.02, width: 520, height: 860, look: 0.78})}"><div><b class="tag">固定主角</b><strong>大腦總管 NOVA</strong><span>常駐、不會消失的總管</span><small>維持原本的白色機器人。全站只有它是機器人，白色在四種主題下都不用換色。</small></div>`;
document.getElementById('agents').innerHTML = ROSTER.map((a, i) => `<div class="card"><img alt="${a.name}" src="${shoot(buildAgent(a.id))}"><div><strong>${i + 1}. ${a.name}</strong><span>${a.prop}</span><small>${a.fits}</small></div></div>`).join('');
document.body.dataset.ready = '1';
// #n shows one still large, for checking details
if (location.hash) { const img = document.querySelectorAll('img')[+location.hash.slice(1)]; document.body.innerHTML = `<img src="${img.src}" style="height:${location.search.includes('x2') ? '200vh' : 'calc(100vh - 64px)'}">`; }
// ?export sends each avatar image to the local receiver (design-system/ip-concepts/receive.py), which writes public/bot-avatars/<role>.png
if (location.search.includes('export')) {
  const {renderPortraits} = await import('./src-dashboard/agent-portraits.js');
  const done = [];
  for (const [role, image] of Object.entries(renderPortraits())) done.push(await fetch(`http://localhost:4199/${role}.png`, {method: 'POST', body: image}).then(r => `${role} ${r.status}`));
  document.body.dataset.exported = done.join(', ');
}
