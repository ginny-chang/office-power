// Draws the avatar images of 大腦總管 NOVA and the ten characters: public/bot-avatars/<role>.png.
// Not loaded by the product. Run it from the concept page with ?export (see design-system/ip-concepts) after changing a character.
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {ROLES, buildAgent, buildNova} from './agent-characters.js';

export function renderPortraits(size = 192) {
  const renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
  renderer.setPixelRatio(1);
  renderer.setSize(size, size, false);
  // Same tone mapping, environment and lights as the row on My Board, so an avatar matches the character above it
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.05);
  scene.environment = env.texture;
  scene.environmentIntensity = 0.85;
  scene.add(new THREE.AmbientLight('#ffffff', 0.4), new THREE.HemisphereLight('#ffffff', '#d4d6df', 0.5));
  [[[4.2, 10.5, 6], 2.45, '#ffffff'], [[-7, 5.5, -3], 0.5, '#eef2ff'], [[0.5, 3.2, -8], 0.22, '#fff6ee']].forEach(([at, intensity, color]) => {
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(...at);
    scene.add(light);
  });
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 40);
  const out = {};
  // 大腦總管 NOVA is drawn here too, as the robot on its own
  for (const role of ['nova', ...Object.keys(ROLES)]) {
    const model = role === 'nova' ? buildNova() : buildAgent(role), height = role === 'nova' ? 1.62 : model.userData.height;
    model.rotation.y = -0.25;
    scene.add(model);
    // Frame the whole character with a little air, whatever its height
    const span = Math.max(height + 0.45, 1.75);
    camera.position.set(0, height * 0.52 + 0.1, span / (2 * Math.tan(THREE.MathUtils.degToRad(12))));
    camera.lookAt(0, height * 0.52, 0);
    // A pale tint of the character's own colour fills the tile, so the image works in a circle or a rounded square
    scene.background = new THREE.Color(role === 'nova' ? '#c6e85c' : ROLES[role].color).lerp(new THREE.Color('#ffffff'), 0.78);
    renderer.render(scene, camera);
    out[role] = renderer.domElement.toDataURL('image/png');
    scene.remove(model);
  }
  env.texture.dispose();
  pmrem.dispose();
  room.traverse(obj => {obj.geometry?.dispose(); [].concat(obj.material || []).forEach(material => material.dispose());});
  renderer.dispose();
  renderer.forceContextLoss();
  return out;
}
