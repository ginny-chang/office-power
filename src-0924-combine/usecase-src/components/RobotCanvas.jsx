import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Float, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function ProceduralRobot({ reducedMotion }) {
  const group = useRef(); const eye = useRef();
  useFrame((state, delta) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, Math.sin(state.clock.elapsedTime * 0.55) * 0.12, delta * 2);
    group.current.position.y = Math.sin(state.clock.elapsedTime * 1.3) * 0.035;
    if (eye.current) eye.current.material.emissiveIntensity = 1.7 + Math.sin(state.clock.elapsedTime * 2) * 0.35;
  });
  const shell = <meshStandardMaterial color="#eae8e2" roughness={0.28} metalness={0.12} />;
  const dark = <meshStandardMaterial color="#373e42" roughness={0.23} metalness={0.58} />;
  return <group ref={group} position={[0, -0.1, 0]} rotation={[0, -0.18, 0]}>
    <mesh position={[0, 1.35, 0]} castShadow><boxGeometry args={[1.45, 1.05, 1.1]} />{shell}</mesh>
    <mesh position={[0, 1.35, 0.57]}><boxGeometry args={[0.82, 0.18, 0.035]} /><meshStandardMaterial color="#252a2d" roughness={0.2} metalness={0.45} /></mesh>
    <mesh ref={eye} position={[0, 1.35, 0.6]}><boxGeometry args={[0.24, 0.06, 0.025]} /><meshStandardMaterial color="#ec7a28" emissive="#ec7a28" emissiveIntensity={1.7} /></mesh>
    <mesh position={[0, 0.45, 0]} castShadow><boxGeometry args={[1.22, 1.2, 0.88]} />{shell}</mesh>
    <mesh position={[0, 0.52, 0.49]}><boxGeometry args={[0.12, 0.06, 0.025]} /><meshStandardMaterial color="#ec7a28" emissive="#ec7a28" emissiveIntensity={1.2} /></mesh>
    <mesh position={[-0.9, 0.45, 0]} rotation={[0, 0, -0.14]} castShadow><boxGeometry args={[0.3, 1.05, 0.32]} />{dark}</mesh><mesh position={[0.9, 0.45, 0]} rotation={[0, 0, 0.14]} castShadow><boxGeometry args={[0.3, 1.05, 0.32]} />{dark}</mesh>
    <mesh position={[-0.42, -0.55, 0]} castShadow><boxGeometry args={[0.38, 0.95, 0.42]} />{dark}</mesh><mesh position={[0.42, -0.55, 0]} castShadow><boxGeometry args={[0.38, 0.95, 0.42]} />{dark}</mesh>
    <mesh position={[-0.42, -1.08, 0.08]} castShadow><boxGeometry args={[0.54, 0.2, 0.63]} /><meshStandardMaterial color="#22282b" roughness={0.25} metalness={0.45} /></mesh><mesh position={[0.42, -1.08, 0.08]} castShadow><boxGeometry args={[0.54, 0.2, 0.63]} /><meshStandardMaterial color="#22282b" roughness={0.25} metalness={0.45} /></mesh>
    <mesh position={[0, 2, 0]} castShadow><cylinderGeometry args={[0.04, 0.04, 0.34, 16]} /><meshStandardMaterial color="#333a3d" metalness={0.6} roughness={0.2} /></mesh><mesh position={[0, 2.2, 0]}><sphereGeometry args={[0.12, 20, 12]} /><meshStandardMaterial color="#ec7a28" emissive="#ec7a28" emissiveIntensity={1.4} /></mesh>
  </group>;
}

function GLBModel({ modelUrl }) {
  const { scene } = useGLTF(modelUrl);
  return <primitive object={scene} dispose={null} />;
}

export default function RobotCanvas({ reducedMotion, modelUrl }) {
  return <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} shadows><PerspectiveCamera makeDefault position={[0, 0.75, 6.1]} fov={30} /><ambientLight intensity={1.8} color="#fffaf0" /><directionalLight position={[3, 5, 4]} intensity={3.8} color="#fff3df" castShadow shadow-mapSize={[1024, 1024]} /><directionalLight position={[-4, 2, 1]} intensity={2.4} color="#d9ecf1" /><Float speed={reducedMotion ? 0 : 1.3} rotationIntensity={reducedMotion ? 0 : 0.08} floatIntensity={reducedMotion ? 0 : 0.22}>{modelUrl ? <GLBModel modelUrl={modelUrl} /> : <ProceduralRobot reducedMotion={reducedMotion} />}</Float><ContactShadows position={[0, -1.25, 0]} opacity={0.24} scale={4.2} blur={2.5} far={4} color="#303536" /></Canvas>;
}
