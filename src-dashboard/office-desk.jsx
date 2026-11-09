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
function RoleMark({variant}){
 const spec=BOT_VARIANTS[variant]||BOT_VARIANTS.life;
 if(spec.tool==='bars')return <group position={[.42,.64,-.08]}>{[.12,.22,.32].map((h,i)=><Box key={h} w={.06} h={h} d={.06} radius={.02} color={i===0?spec.deep:i===1?spec.color:spec.lite} position={[-.08+i*.08,h/2,0]}/>)}</group>;
 if(spec.tool==='box')return <Box w={.24} h={.16} d={.18} radius={.04} color={spec.color} position={[.42,.66,-.06]}/>;
 return <Box w={.18} h={.24} d={.035} radius={.03} color={spec.color} position={[.42,.7,-.08]}/>;
}
function Spot({agent,at,selected,fresh,reduced,onSelect}){
 const [hovered,setHovered]=useState(false);
 const variant=botVariantFor(agent);
 return <group position={at} onPointerOver={e=>{e.stopPropagation();setHovered(true)}} onPointerOut={()=>setHovered(false)}>
  {selected&&<mesh rotation={[-Math.PI/2,0,0]} position={[0,.03,0]} raycast={()=>null}><ringGeometry args={[.85,.98,48]}/><meshBasicMaterial color={fresh?'#e5f68c':'#121214'}/></mesh>}
  <OfficeBot variant={variant} reduced={reduced} hovered={hovered||selected} rest={.4} index={at[0]} scale={1.18} onSelect={e=>{e.stopPropagation();onSelect(agent.id)}}/>
  {fresh&&<Html position={[.15,2.55,0]} center zIndexRange={[8,6]}><Button variant="secondary" type="button" className={`bot-bubble ${agent.status}`} onClick={()=>onSelect(agent.id)}><span className="bubble-meta"><i/>{agent.eventType}<span>↗</span></span><strong>{agent.event}</strong></Button></Html>}
 </group>;
}
function Room(){
 return <group>
  <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[16,14]}/><meshStandardMaterial color="#f3f1ee" roughness={.92}/></mesh>
  <Box w={14} h={4.2} d={.1} radius={.02} color="#e7ebf1" position={[0,2.1,-5.2]} cast={false}/>
  <Box w={.1} h={4.2} d={10} radius={.02} color="#eef1f5" position={[-6.6,2.1,-.4]} cast={false}/>
  <Box w={2.2} h={1.35} d={.06} radius={.02} color="#d5dde8" position={[-3.2,2.35,-5.1]} cast={false}/>
  {[-.62,-.2,.2,.62].map(x=><Box key={x} w={.06} h={1.2} d={.04} color="#f7f8fa" position={[-3.2+x,2.35,-5.05]} cast={false}/>)}
  <mesh position={[.2,3.15,-5.1]}><circleGeometry args={[.34,32]}/><meshStandardMaterial color="#f7f8fa" roughness={.5}/></mesh>
  <Box w={.9} h={.62} d={.04} radius={.04} color="#e4e9f0" position={[1.7,2.85,-5.1]} cast={false}/>
  <Box w={1.7} h={.07} d={.7} radius={.03} color="#e6e0d6" position={[-3.6,.78,-4.15]}/>
  <Box w={1.7} h={.07} d={.7} radius={.03} color="#e6e0d6" position={[3.5,.78,-4.15]}/>
  <Box w={.9} h={.5} d={.05} radius={.02} color="#d7dee7" position={[-3.6,1.15,-4.4]}/>
  <group position={[-3.6,1.15,-4.36]}><Screen color="#8ecff0"/></group>
  <Box w={.9} h={.5} d={.05} radius={.02} color="#d7dee7" position={[3.5,1.15,-4.4]}/>
  <group position={[3.5,1.15,-4.36]}><Screen color="#e5f68c"/></group>
  <Box w={1.15} h={.05} d={.36} radius={.02} color="#e7e1d6" position={[5.3,1.85,-4.85]}/>
  <Box w={1.15} h={.05} d={.36} radius={.02} color="#e7e1d6" position={[5.3,1.25,-4.85]}/>
  <Box w={.04} h={1.35} d={.04} color="#b7c0cc" position={[4.8,1.05,-5]}/>
  <Box w={.04} h={1.35} d={.04} color="#b7c0cc" position={[5.8,1.05,-5]}/>
  <mesh position={[-5.7,1.05,-1.2]} castShadow><cylinderGeometry args={[.04,.04,1.9,12]}/><meshStandardMaterial color="#c5ccd6" roughness={.45}/></mesh>
  <mesh position={[-5.7,1.95,-1.2]} castShadow><coneGeometry args={[.34,.38,20]}/><meshStandardMaterial color="#f6f3ee" roughness={.6}/></mesh>
  <mesh position={[5.5,.28,1.4]} castShadow><cylinderGeometry args={[.18,.2,.52,16]}/><meshStandardMaterial color="#efeae3" roughness={.7}/></mesh>
  <mesh position={[5.5,.78,1.4]} castShadow><sphereGeometry args={[.32,16,12]}/><meshStandardMaterial color="#9db89a" roughness={.62}/></mesh>
 </group>;
}
export function SharedOffice({agents,focusId,read,reduced,onSelect}){
 const count=Math.max(agents.length,1);
 const radius=count<2?0:3.05;
 return <group>
  <Room/>
  {agents.map((agent,index)=>{
   const angle=Math.PI/2-index/count*Math.PI*2;
   const fresh=!!(agent.event&&agent.published!==false&&!read.includes(agent.id));
   return <Spot key={agent.id} agent={agent} at={[Math.cos(angle)*radius,0,Math.sin(angle)*radius]} selected={agent.id===focusId} fresh={fresh} reduced={reduced} onSelect={onSelect}/>;
  })}
 </group>;
}
