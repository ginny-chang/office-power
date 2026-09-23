import React,{useEffect,useLayoutEffect,useRef} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Office,Lights,sampleCamera} from './OfficeScene';
import HROffice from './HROffice';
import * as THREE from 'three';

const shots = [
 {p:[-.5,2.55,4.9],t:[-2.95,.78,1.0]},
 {p:[.4,2.4,3.7],t:[-2.65,.72,1.12]},
 {p:[-1.8,2.0,5.6],t:[-2.85,1.02,.88]},
 {p:[-.8,4.3,3.8],t:[-2.6,.57,1.05]},
 {p:[-1.15,2.1,3.6],t:[-2.55,.7,1.12]},
];
const kinds=['overtime','dispatch','leave','contract','punch'];
function World({kind,entry,progress,reduced,onReadyChange,RobotComponent}) {
 const {camera,size,invalidate,scene}=useThree();
 useLayoutEffect(()=>{scene.traverse(node=>{if(node.isLight)node.layers.enable(1);});},[scene]);
 // Render the room first, then the portrait layer with a fresh depth buffer.
 // Portraits retain their own facial depth while furniture cannot cover them.
 useFrame(({gl,scene,camera})=>{
  const mask=camera.layers.mask,autoClear=gl.autoClear,background=scene.background;
  try{
   camera.layers.set(0);gl.render(scene,camera);
   gl.autoClear=false;gl.clearDepth();scene.background=null;
   camera.layers.set(1);gl.render(scene,camera);
  }finally{camera.layers.mask=mask;gl.autoClear=autoClear;scene.background=background;}
 },1);
 const surroundings=useRef(),materials=useRef([]),shotProgress=useRef(progress.current);
 useEffect(()=>{onReadyChange?.(true);return()=>onReadyChange?.(false);},[onReadyChange]);
 useEffect(()=>{const found=new Set();surroundings.current.traverse(node=>{if(node.material){for(const m of (Array.isArray(node.material)?node.material:[node.material]))found.add(m);}});materials.current=[...found].map(m=>({m,opacity:m.opacity}));},[]);
 useEffect(()=>{invalidate();},[kind,reduced,size.width,size.height,invalidate]);
 useFrame((_,delta)=>{
  // Match the hero's final full-office view, then dolly into its actual HR corner.
  const t=reduced?1:THREE.MathUtils.smoothstep(entry.current,.05,1);
  const fade=1-THREE.MathUtils.smoothstep(t,.05,.9);
  surroundings.current.visible=fade>.005;
  materials.current.forEach(({m,opacity})=>{m.transparent=true;m.opacity=opacity*fade;m.depthWrite=fade>.95;});
  shotProgress.current=reduced?progress.current:THREE.MathUtils.damp(shotProgress.current,progress.current,6,delta);
  const raw=reduced?kinds.indexOf(kind):shotProgress.current;
  const index=Math.min(3,Math.floor(raw));
  const blend=THREE.MathUtils.smoothstep(raw-index,.18,.82);
  const close=shots[index].p.map((v,i)=>THREE.MathUtils.lerp(v,shots[index+1].p[i],blend));
  const target=shots[index].t.map((v,i)=>THREE.MathUtils.lerp(v,shots[index+1].t[i],blend));
  // The hero ends on sampleCamera(1) pulled back 2.15x (see OfficeScene finale); start from that exact framing.
  const full=sampleCamera(1);full.position=full.position.map((v,i)=>full.target[i]+(v-full.target[i])*2.15);
  camera.position.set(...full.position.map((v,i)=>THREE.MathUtils.lerp(v,close[i],t)));
  camera.lookAt(...full.target.map((v,i)=>THREE.MathUtils.lerp(v,target[i],t)));
  const mobile=size.width<=650, aspect=size.width/size.height;
  // On phones the accordion column sits above the room, so the room is framed smaller and lower.
  camera.zoom=mobile?aspect/1.22*Math.min(.9,Math.max(.55,(size.height-420)/430)):.82*Math.min(1,aspect/1.6);
  camera.setViewOffset(size.width,size.height,-size.width*(mobile?0:.23),-size.height*(mobile?.27:0),size.width,size.height);
  camera.updateProjectionMatrix();
 });
 return <><color attach="background" args={['#e6e8ed']}/><Lights/><Office reduced={reduced} hrCorner={<HROffice kind={kind} reduced={reduced} RobotComponent={RobotComponent}/>} surroundingsRef={surroundings}/><mesh rotation={[-Math.PI/2,0,0]} position={[0,-.46,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color="#e6e8ed" roughness={.8}/></mesh></>;
}
export default function ScenarioScene(props){return <Canvas shadows dpr={[1,1.5]} frameloop={props.reduced?'demand':'always'} camera={{position:[9,8,12],fov:36}} gl={{antialias:true}}><World {...props}/></Canvas>;}
