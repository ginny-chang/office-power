import React,{useEffect,useMemo,useRef,useState} from 'react';
import {useFrame} from '@react-three/fiber';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {CanvasTexture,SRGBColorSpace,CatmullRomCurve3,TubeGeometry,Vector3} from 'three';
import {Html} from '@react-three/drei';
import {Button} from '../src-shared/ui/index.jsx';
import {OfficeBot} from './office-bots.jsx';
import {BOT_VARIANTS,botVariantFor,isAgentAlert} from './bot-variants.js';

function useBox(w,h,d,radius=0.04,segments=2){
 const geo=useMemo(()=>new RoundedBoxGeometry(w,h,d,segments,radius),[w,h,d,radius,segments]);
 useEffect(()=>()=>geo.dispose(),[geo]);
 return geo;
}
function Mat({color,rough=.62,metal=0}){return <meshStandardMaterial color={color} roughness={rough} metalness={metal}/>}
function Box({w,h,d,radius,color,position,rotation,rough,metal,cast=true}){
 const geo=useBox(w,h,d,radius);
 return <mesh geometry={geo} position={position} rotation={rotation} castShadow={cast} receiveShadow dispose={null}><Mat color={color} rough={rough} metal={metal}/></mesh>;
}
function Screen({color}){
 const map=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=160;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#1b212b';ctx.fillRect(0,0,256,160);
  ctx.fillStyle=color;
  [70,100,120].forEach((h,i)=>ctx.fillRect(28+i*70,148-h,46,h));
  const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;return texture;
 },[color]);
 useEffect(()=>()=>map.dispose(),[map]);
 return <mesh position={[0,0,.02]}><planeGeometry args={[.62,.36]}/><meshBasicMaterial map={map} toneMapped={false}/></mesh>;
}
function watermarkTexture(variant){
 const spec=BOT_VARIANTS[variant]||BOT_VARIANTS.life;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle=spec.color;ctx.globalAlpha=.9;
 ctx.translate(128,128);
 if(spec.tool==='bars'){[ -46,0,46].forEach((x,i)=>{const h=70+i*28;ctx.fillRect(x-16,40-h,32,h)});}
 else if(spec.tool==='leaf'){ctx.beginPath();ctx.ellipse(0,-8,62,86,0,0,Math.PI*2);ctx.fill();}
 else if(spec.tool==='calculator'){ctx.fillRect(-54,-70,108,140);ctx.globalAlpha=.35;ctx.fillStyle='#fff';for(let r=0;r<4;r++)for(let c=0;c<3;c++)ctx.fillRect(-40+c*28,-28+r*28,18,18);}
 else {ctx.fillRect(-58,-72,116,148);}
 const map=new CanvasTexture(canvas);map.colorSpace=SRGBColorSpace;return map;
}
function Watermark({variant}){
 const map=useMemo(()=>watermarkTexture(variant),[variant]);
 useEffect(()=>()=>map.dispose(),[map]);
 return <mesh position={[0,1.45,-1.85]} raycast={()=>null}><planeGeometry args={[2.5,2.3]}/><meshBasicMaterial map={map} transparent opacity={.16} depthWrite={false} toneMapped={false}/></mesh>;
}
function WorkDesk({color}){
 return <group position={[0,0,-1.05]}>
  <Box w={2.15} h={.07} d={.92} radius={.04} color="#e7e1d6" position={[0,.74,0]} rough={.55}/>
  {[[-.9,-.32],[.9,-.32],[-.9,.32],[.9,.32]].map(([x,z])=><Box key={`${x}${z}`} w={.07} h={.7} d={.07} radius={.02} color="#cfc8bc" position={[x,.36,z]}/>)}
  <Box w={.92} h={.58} d={.05} radius={.03} color="#d5dde6" position={[0,1.16,-.28]}/>
  <group position={[0,1.16,-.24]}><Screen color={color}/></group>
  <Box w={.08} h={.18} d={.06} color="#c5ceda" position={[0,.86,-.28]}/>
  <Box w={.7} h={.02} d={.22} radius={.01} color="#f7f8fa" position={[-.15,.78,.16]}/>
 </group>;
}
function Spot({agent,selected,fresh,reduced,onSelect,index=0}){
 const [hovered,setHovered]=useState(false);
 const variant=botVariantFor(agent);
 const accent=(BOT_VARIANTS[variant]||BOT_VARIANTS.life).color;
 const alert=isAgentAlert(agent);
 return <group onPointerOver={e=>{e.stopPropagation();setHovered(true)}} onPointerOut={()=>setHovered(false)}>
  <Watermark variant={variant}/>
  <WorkDesk color={accent}/>
  <OfficeBot variant={variant} reduced={reduced} hovered={hovered||selected} alert={alert} rest={0} index={index} position={[0,0,.95]} scale={1} onSelect={e=>{e.stopPropagation();onSelect(agent.id)}}/>
  {fresh&&<Html position={[.15,2.7,.95]} center zIndexRange={[8,6]}><Button variant="secondary" type="button" className={`bot-bubble ${agent.status}`} onClick={()=>onSelect(agent.id)}><span className="bubble-meta"><i/>{agent.eventType}<span>↗</span></span><strong>{agent.event}</strong></Button></Html>}
 </group>;
}
function arcPose(offset){
 const steps=Math.abs(offset);
 const dir=Math.sign(offset)||0;
 return {
  x:offset*ROW_PITCH,
  z:2.55-steps*steps*.78,
  yaw:-dir*Math.min(.4,steps*.14),
  scale:Math.max(.78,1.34-steps*.1),
 };
}
function ArcMover({offset,reduced,children}){
 const ref=useRef();
 const pose=useRef(null);
 useFrame((_,delta)=>{
  const goal=arcPose(offset);
  const current=pose.current||(pose.current={...goal});
  const k=reduced?1:1-Math.exp(-delta*6);
  current.x+=(goal.x-current.x)*k;
  current.z+=(goal.z-current.z)*k;
  current.yaw+=(goal.yaw-current.yaw)*k;
  current.scale+=(goal.scale-current.scale)*k;
  ref.current.position.set(current.x,0,current.z);
  ref.current.rotation.y=current.yaw;
  ref.current.scale.setScalar(current.scale);
 });
 return <group ref={ref}>{children}</group>;
}
function StageRim({count}){
 const geo=useMemo(()=>{
  const half=(Math.max(count,1)-1)/2+.55;
  const pts=[];
  for(let i=0;i<=48;i++){
   const pose=arcPose(-half+(2*half)*i/48);
   pts.push(new Vector3(pose.x,.07,pose.z+1.28));
  }
  return new TubeGeometry(new CatmullRomCurve3(pts),96,.12,14,false);
 },[count]);
 useEffect(()=>()=>geo.dispose(),[geo]);
 return <mesh geometry={geo} receiveShadow><meshStandardMaterial color="#f7f4ef" roughness={.46} metalness={.02}/></mesh>;
}
export const ROW_PITCH=3.05;
export function RobotRow({agents,focusId,read,reduced,onSelect}){
 const focusIndex=Math.max(0,agents.findIndex(agent=>agent.id===focusId));
 return <group>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.02,6]} receiveShadow><planeGeometry args={[260,200]}/><meshStandardMaterial color="#f4f2ef" roughness={.94}/></mesh>
  <StageRim count={agents.length}/>
  {agents.map((agent,index)=>{
   const fresh=!!(agent.event&&agent.published!==false&&!read.includes(agent.id));
   return <ArcMover key={agent.id} offset={index-focusIndex} reduced={reduced}>
    <Spot agent={agent} index={index} selected={agent.id===focusId} fresh={fresh} reduced={reduced} onSelect={onSelect}/>
   </ArcMover>;
  })}
 </group>;
}
