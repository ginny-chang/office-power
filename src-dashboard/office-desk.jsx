import React,{useEffect,useMemo,useState} from 'react';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {CanvasTexture,SRGBColorSpace} from 'three';
import {Html} from '@react-three/drei';
import {Button} from '../src-shared/ui/index.jsx';
import {OfficeBot} from './office-bots.jsx';
import {BOT_VARIANTS,botVariantFor} from './bot-variants.js';

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
function Spot({agent,at,selected,fresh,reduced,onSelect}){
 const [hovered,setHovered]=useState(false);
 const variant=botVariantFor(agent);
 const accent=(BOT_VARIANTS[variant]||BOT_VARIANTS.life).color;
 return <group position={at} onPointerOver={e=>{e.stopPropagation();setHovered(true)}} onPointerOut={()=>setHovered(false)}>
  <WorkDesk color={accent}/>
  {selected&&<mesh rotation={[-Math.PI/2,0,0]} position={[0,.025,.15]} raycast={()=>null}><ringGeometry args={[.78,.9,48]}/><meshBasicMaterial color={fresh?'#e5f68c':'#121214'}/></mesh>}
  <OfficeBot variant={variant} reduced={reduced} hovered={hovered||selected} rest={.18} index={at[0]} position={[0,0,.2]} scale={1.05} onSelect={e=>{e.stopPropagation();onSelect(agent.id)}}/>
  {fresh&&<Html position={[.2,2.35,.2]} center zIndexRange={[8,6]}><Button variant="secondary" type="button" className={`bot-bubble ${agent.status}`} onClick={()=>onSelect(agent.id)}><span className="bubble-meta"><i/>{agent.eventType}<span>↗</span></span><strong>{agent.event}</strong></Button></Html>}
 </group>;
}
export const ROW_PITCH=4.15;
export function RobotRow({agents,focusId,read,reduced,onSelect}){
 const width=Math.max(ROW_PITCH,(agents.length-1)*ROW_PITCH+6);
 return <group>
  <mesh rotation={[-Math.PI/2,0,0]} position={[(agents.length-1)*ROW_PITCH/2,-.02,0]} receiveShadow><planeGeometry args={[width,8]}/><meshStandardMaterial color="#f4f2ef" roughness={.94}/></mesh>
  {agents.map((agent,index)=>{
   const fresh=!!(agent.event&&agent.published!==false&&!read.includes(agent.id));
   return <Spot key={agent.id} agent={agent} at={[index*ROW_PITCH,0,0]} selected={agent.id===focusId} fresh={fresh} reduced={reduced} onSelect={onSelect}/>;
  })}
 </group>;
}
