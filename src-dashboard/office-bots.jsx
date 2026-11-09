import React, {useEffect, useMemo, useRef} from 'react';
import {useFrame, useThree} from '@react-three/fiber';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {ExtrudeGeometry, Shape, PMREMGenerator, CanvasTexture, SRGBColorSpace} from 'three';
import * as THREE from 'three';
import {BOT_VARIANTS, botVariantFor} from './bot-variants.js';

export {botVariantFor};

function roundGeo(w, h, d, radius, segments = 4) {
  return new RoundedBoxGeometry(w, h, d, segments, radius);
}

function Gloss({color, rough = 0.32, metal = 0.05, coat = 0.82, coatRough = 0.22, emissive = '#000000', emissiveIntensity = 0}) {
  return <meshPhysicalMaterial color={color} roughness={rough} metalness={metal} clearcoat={coat} clearcoatRoughness={coatRough} emissive={emissive} emissiveIntensity={emissiveIntensity} envMapIntensity={0.78}/>;
}

function Round({w, h, d, radius = 0.08, segments = 3, color, position, rotation, scale, rough, metal, coat, coatRough, emissive, emissiveIntensity, castShadow = true}) {
  const geo = useMemo(() => roundGeo(w, h, d, radius, segments), [w, h, d, radius, segments]);
  useEffect(() => () => geo.dispose(), [geo]);
  return <mesh geometry={geo} position={position} rotation={rotation} scale={scale} castShadow={castShadow} dispose={null}>
    <Gloss color={color} rough={rough} metal={metal} coat={coat} coatRough={coatRough} emissive={emissive} emissiveIntensity={emissiveIntensity}/>
  </mesh>;
}

function createLeafGeometry() {
  const shape = new Shape();
  shape.moveTo(0, 0.02);
  shape.bezierCurveTo(0.5, 0.2, 0.66, 0.58, 0.2, 0.96);
  shape.bezierCurveTo(0.08, 1.12, 0.02, 1.18, 0, 1.22);
  shape.bezierCurveTo(-0.02, 1.18, -0.08, 1.12, -0.2, 0.96);
  shape.bezierCurveTo(-0.66, 0.58, -0.5, 0.2, 0, 0.02);
  const geo = new ExtrudeGeometry(shape, {depth: 0.1, bevelEnabled: true, bevelThickness: 0.045, bevelSize: 0.04, bevelSegments: 4, curveSegments: 24});
  geo.translate(0, 0, -0.05);
  geo.computeVertexNormals();
  return geo;
}

let shadowTexture;
function contactShadow() {
  if (shadowTexture) return shadowTexture;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const wash = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
  wash.addColorStop(0, 'rgba(48,52,64,0.38)');
  wash.addColorStop(0.42, 'rgba(48,52,64,0.14)');
  wash.addColorStop(1, 'rgba(48,52,64,0)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, 128, 128);
  shadowTexture = new CanvasTexture(canvas);
  shadowTexture.colorSpace = SRGBColorSpace;
  return shadowTexture;
}

function White() {
  return <meshPhysicalMaterial color="#ffffff" roughness={0.18} metalness={0.02} clearcoat={1} clearcoatRoughness={0.1} envMapIntensity={1.05}/>;
}
function RobotBody({eyes, arm}) {
  return <group>
    {[-0.18, 0.18].map(x => <Round key={x} w={0.4} h={0.32} d={0.46} radius={0.15} segments={4} color="#ffffff" position={[x, 0.16, 0.02]} rough={0.22} coat={0.85} coatRough={0.12}/>)}
    <Round w={0.82} h={0.62} d={0.66} radius={0.2} segments={4} color="#ffffff" position={[0, 0.46, 0]} rough={0.2} coat={0.9} coatRough={0.12}/>
    <Round w={0.3} h={0.08} d={0.05} radius={0.035} segments={2} color="#e3e6ed" position={[0, 0.52, 0.34]} rough={0.42} coat={0.25} castShadow={false}/>
    <Round w={0.94} h={1.12} d={0.76} radius={0.26} segments={5} color="#ffffff" position={[0, 1.24, 0]} rough={0.18} coat={1} coatRough={0.1}/>
    <Round w={0.82} h={0.8} d={0.22} radius={0.22} segments={5} color="#0c0e12" position={[0, 1.3, 0.32]} rough={0.08} metal={0.22} coat={1} coatRough={0.05}/>
    {[-0.15, 0.15].map((x, i) => <mesh key={x} ref={el => {eyes.current[i] = el;}} position={[x, 1.32, 0.46]} castShadow>
      <capsuleGeometry args={[0.072, 0.26, 8, 16]}/>
      <meshBasicMaterial color="#ffffff"/>
    </mesh>)}
    {[-1, 1].map(side => <group key={side} ref={side === 1 ? arm : undefined} position={[side * 0.46, 0.62, 0.04]}>
      <mesh position={[0, -0.01, 0]} castShadow>
        <sphereGeometry args={[0.12, 18, 12]}/>
        <White/>
      </mesh>
    </group>)}
    {[-1, 1].map(side => <group key={`ear-${side}`} position={[side * 0.22, 1.68, 0]} rotation={[0, 0, side * -0.22]}>
      <mesh position={[0, 0.05, 0]}><cylinderGeometry args={[0.15, 0.16, 0.1, 24]}/><meshStandardMaterial color="#3a414b" metalness={0.5} roughness={0.3}/></mesh>
      <mesh position={[0, 0.24, 0]} castShadow><cylinderGeometry args={[0.135, 0.14, 0.36, 24]}/><White/></mesh>
    </group>)}
  </group>;
}

function ArchiveBox() {
  const {color, lite, deep} = BOT_VARIANTS.operations;
  return <group position={[0, 0.28, 0]} rotation={[0, -0.55, 0]}>
    <Round w={0.72} h={0.42} d={0.56} radius={0.1} segments={4} color={color} position={[0, 0, 0]} rough={0.24} coat={0.92}/>
    <Round w={0.78} h={0.16} d={0.62} radius={0.07} segments={3} color={lite} position={[0, 0.26, 0]} rough={0.22} coat={0.95}/>
    <Round w={0.24} h={0.045} d={0.04} radius={0.02} segments={2} color={deep} position={[0, 0.02, 0.3]} rough={0.3} coat={0.5} castShadow={false}/>
  </group>;
}

function Badge() {
  const {color, deep, lite} = BOT_VARIANTS.hr;
  return <group position={[0, 0.42, 0]} rotation={[0, -0.28, 0]}>
    <Round w={0.5} h={0.74} d={0.12} radius={0.06} segments={4} color={color} rough={0.26} coat={0.9}/>
    <mesh position={[0, 0.5, 0]} castShadow>
      <torusGeometry args={[0.078, 0.024, 12, 28]}/>
      <Gloss color={deep} rough={0.28} coat={0.85}/>
    </mesh>
    <mesh position={[0, 0.38, 0]} castShadow>
      <cylinderGeometry args={[0.022, 0.022, 0.1, 12]}/>
      <Gloss color={color} rough={0.28} coat={0.8}/>
    </mesh>
    <group position={[0, 0.02, 0.08]}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.068, 24, 16]}/>
        <Gloss color={deep} rough={0.32} coat={0.7}/>
      </mesh>
      <mesh position={[0, -0.02, 0]} scale={[1.2, 0.7, 0.55]} castShadow>
        <sphereGeometry args={[0.105, 24, 16]}/>
        <Gloss color={deep} rough={0.32} coat={0.7}/>
      </mesh>
    </group>
  </group>;
}

function Check({position, color}) {
  return <group position={position}>
    <Round w={0.035} h={0.1} d={0.03} radius={0.012} segments={2} color={color} position={[-0.03, -0.01, 0]} rotation={[0, 0, 0.75]} rough={0.3} coat={0.6} castShadow={false}/>
    <Round w={0.035} h={0.18} d={0.03} radius={0.012} segments={2} color={color} position={[0.035, 0.03, 0]} rotation={[0, 0, -0.85]} rough={0.3} coat={0.6} castShadow={false}/>
  </group>;
}

function Clipboard() {
  const {color, deep, lite} = BOT_VARIANTS.project;
  return <group position={[0, 0.44, 0]} rotation={[0, -0.32, 0]}>
    <Round w={0.58} h={0.8} d={0.1} radius={0.05} segments={4} color={color} rough={0.24} coat={0.92}/>
    <Round w={0.22} h={0.12} d={0.08} radius={0.04} segments={2} color={lite} position={[0, 0.4, 0.02]} rough={0.26} coat={0.85}/>
    <Check position={[-0.1, 0.1, 0.07]} color={deep}/>
    <Check position={[-0.1, -0.12, 0.07]} color={deep}/>
    <Round w={0.14} h={0.035} d={0.02} radius={0.012} segments={2} color={lite} position={[0.12, 0.1, 0.07]} rough={0.35} coat={0.4} castShadow={false}/>
  </group>;
}

function Calculator() {
  const {color, deep} = BOT_VARIANTS.finance;
  const buttons = [];
  for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) buttons.push([col, row]);
  return <group position={[0, 0.42, 0]} rotation={[0, -0.4, 0]}>
    <Round w={0.62} h={0.78} d={0.12} radius={0.06} segments={4} color={color} rough={0.26} coat={0.9}/>
    {buttons.map(([col, row]) => <Round key={`${col}-${row}`} w={0.09} h={0.09} d={0.045} radius={0.022} segments={2} color={deep} position={[-0.18 + col * 0.12, -0.22 + row * 0.14, 0.07]} rough={0.3} coat={0.75} castShadow={false}/>)}
  </group>;
}

function Bars() {
  const heights = [0.42, 0.68, 0.98];
  const colors = [BOT_VARIANTS.sales.deep, '#ef8d45', BOT_VARIANTS.sales.color];
  return <group position={[0, 0, 0]}>
    {heights.map((h, i) => <Round key={h} w={0.2} h={h} d={0.2} radius={0.095} segments={4} color={colors[i]} position={[-0.3 + i * 0.3, h / 2, -0.06 + i * 0.1]} rough={0.24} coat={0.9}/>)}
  </group>;
}

function Leaf() {
  const geo = useMemo(createLeafGeometry, []);
  useEffect(() => () => geo.dispose(), [geo]);
  const {color, deep, lite} = BOT_VARIANTS.life;
  return <group position={[0, 0.02, 0]} rotation={[0.12, -0.35, 0.22]} scale={0.92}>
    <mesh geometry={geo} castShadow dispose={null}>
      <Gloss color={color} rough={0.26} coat={0.9}/>
    </mesh>
    <mesh position={[0, 0.66, 0.09]} rotation={[0.12, 0, 0.02]} castShadow>
      <capsuleGeometry args={[0.028, 0.58, 4, 8]}/>
      <Gloss color={lite} rough={0.28} coat={0.65}/>
    </mesh>
    <mesh position={[0.12, 0.52, 0.09]} rotation={[0.12, 0, -0.9]} castShadow>
      <capsuleGeometry args={[0.022, 0.26, 4, 8]}/>
      <Gloss color={lite} rough={0.28} coat={0.65}/>
    </mesh>
    <mesh position={[-0.04, -0.02, 0]} rotation={[0, 0, 0.65]} castShadow>
      <capsuleGeometry args={[0.032, 0.14, 4, 8]}/>
      <Gloss color={deep} rough={0.34} coat={0.55}/>
    </mesh>
  </group>;
}

const tools = {box: ArchiveBox, badge: Badge, clipboard: Clipboard, calculator: Calculator, bars: Bars, leaf: Leaf};

function GroundShadow() {
  const map = useMemo(contactShadow, []);
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.12, 0.012, 0.02]} raycast={() => null}>
    <planeGeometry args={[2.35, 1.25]}/>
    <meshBasicMaterial map={map} transparent depthWrite={false} toneMapped={false} polygonOffset polygonOffsetFactor={-2}/>
  </mesh>;
}

export function OfficeBot({variant = 'life', reduced = false, hovered = false, rest = 0.2, index = 0, alert = false, onSelect, ...props}) {
  const spec = BOT_VARIANTS[variant] || BOT_VARIANTS.life;
  const Tool = tools[spec.tool];
  const root = useRef();
  const eyes = useRef([]);
  const arm = useRef();
  const world = useMemo(() => new THREE.Vector3(), []);
  useFrame(({clock, camera}, delta) => {
    const group = root.current;
    if (!group) return;
    const k = reduced ? 1 : 1 - Math.exp(-delta * 7);
    group.getWorldPosition(world);
    const facing = hovered ? Math.atan2(camera.position.x - world.x, camera.position.z - world.z) : rest;
    const diff = THREE.MathUtils.euclideanModulo(facing - group.rotation.y + Math.PI, Math.PI * 2) - Math.PI;
    group.rotation.y += diff * k;
    const blink = reduced || hovered ? 1 : (clock.elapsedTime + index) % 4.8 < 0.1 ? 0.14 : 1;
    eyes.current.forEach(eye => {if (eye) eye.scale.y = blink;});
    if (arm.current) {
      const wave = alert && !reduced ? Math.sin(clock.elapsedTime * 2.2) : -0.4;
      arm.current.rotation.z = 0.45 + wave * 0.95;
      arm.current.rotation.x = -0.15 + wave * 0.4;
    }
  });
  return <group {...props}>
    <group ref={root} rotation={[0, rest, 0]} onClick={onSelect}>
      <GroundShadow/>
      <group position={[-0.42, 0, 0]}><RobotBody eyes={eyes} arm={arm}/></group>
      <group position={[0.92, 0, 0.02]} scale={1.38}><Tool/></group>
    </group>
  </group>;
}

export function BotLighting() {
  const {gl, scene} = useThree();
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const target = pmrem.fromScene(room, 0.05);
    const previous = scene.environment;
    const previousIntensity = scene.environmentIntensity;
    scene.environment = target.texture;
    scene.environmentIntensity = 0.85;
    return () => {
      scene.environment = previous;
      scene.environmentIntensity = previousIntensity;
      target.texture.dispose();
      pmrem.dispose();
      room.traverse(obj => {
        obj.geometry?.dispose();
        const list = obj.material ? [].concat(obj.material) : [];
        list.forEach(material => material.dispose());
      });
    };
  }, [gl, scene]);
  return <>
    <ambientLight intensity={0.4}/>
    <hemisphereLight args={['#ffffff', '#d4d6df', 0.5]}/>
    <directionalLight position={[4.2, 10.5, 6]} intensity={2.45} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-near={2} shadow-camera-far={40} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={16} shadow-camera-bottom={-16} shadow-bias={-0.00018} shadow-normalBias={0.04} shadow-radius={8}/>
    <directionalLight position={[-7, 5.5, -3]} intensity={0.5} color="#eef2ff"/>
    <directionalLight position={[0.5, 3.2, -8]} intensity={0.22} color="#fff6ee"/>
  </>;
}
