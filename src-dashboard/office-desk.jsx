import React,{useEffect,useMemo,useRef,useState} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {CanvasTexture,SRGBColorSpace} from 'three';
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
function Spot({agent,at,selected,fresh,reduced,onSelect,index=0}){
 const [hovered,setHovered]=useState(false);
 const variant=botVariantFor(agent);
 const accent=(BOT_VARIANTS[variant]||BOT_VARIANTS.life).color;
 const alert=isAgentAlert(agent);
 return <group position={at} onPointerOver={e=>{e.stopPropagation();setHovered(true)}} onPointerOut={()=>setHovered(false)}>
  <Watermark variant={variant}/>
  <WorkDesk color={accent}/>
  <OfficeBot variant={variant} reduced={reduced} hovered={hovered||selected} alert={alert} rest={.12} index={index} position={[0,0,.95]} scale={1} onSelect={e=>{e.stopPropagation();onSelect(agent.id)}}/>
  {fresh&&<Html position={[.15,2.7,.95]} center zIndexRange={[8,6]}><Button variant="secondary" type="button" className={`bot-bubble ${agent.status}`} onClick={()=>onSelect(agent.id)}><span className="bubble-meta"><i/>{agent.eventType}<span>↗</span></span><strong>{agent.event}</strong></Button></Html>}
 </group>;
}
function ArcSpot({x,reduced,children}){
 const ref=useRef();
 const {camera}=useThree();
 const shown=useRef({z:0,scale:1,yaw:0});
 useFrame((_,delta)=>{
  const group=ref.current;
  if(!group)return;
  const center=camera.position.x-.15;
  const dx=x-center;
  const steps=Math.abs(dx)/ROW_PITCH;
  const dir=Math.sign(dx)||0;
  const z=-steps*steps*1.35;
  const scale=Math.max(.58,1.14-steps*.16);
  const yaw=-dir*Math.min(.95,steps*.42);
  const xPos=center+dir*steps*ROW_PITCH*(1-Math.min(.28,steps*.08));
  const k=reduced?1:1-Math.exp(-delta*7);
  const pose=shown.current;
  pose.z+=(z-pose.z)*k;
  pose.scale+=(scale-pose.scale)*k;
  pose.yaw+=(yaw-pose.yaw)*k;
  pose.x=pose.x===undefined?xPos:pose.x+(xPos-pose.x)*k;
  group.position.set(pose.x,0,pose.z);
  group.scale.setScalar(pose.scale);
  group.rotation.y=pose.yaw;
 });
 return <group ref={ref}>{children}</group>;
}
export const ROW_PITCH=2.85;
export function RobotRow({agents,focusId,read,reduced,onSelect}){
 const mid=(agents.length-1)*ROW_PITCH/2;
 return <group>
  <mesh rotation={[-Math.PI/2,0,0]} position={[mid,-.02,14]} receiveShadow><planeGeometry args={[220,160]}/><meshStandardMaterial color="#f4f2ef" roughness={.94}/></mesh>
  {agents.map((agent,index)=>{
   const fresh=!!(agent.event&&agent.published!==false&&!read.includes(agent.id));
   return <ArcSpot key={agent.id} x={index*ROW_PITCH} reduced={reduced}>
    <Spot agent={agent} at={[0,0,0]} index={index} selected={agent.id===focusId} fresh={fresh} reduced={reduced} onSelect={onSelect}/>
   </ArcSpot>;
  })}
 </group>;
}
