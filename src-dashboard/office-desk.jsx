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
 const accent=(BOT_VARIANTS[variant]||BOT_VARIANTS.life).color;
 return <group position={at} onPointerOver={e=>{e.stopPropagation();setHovered(true)}} onPointerOut={()=>setHovered(false)}>
  {selected&&<mesh rotation={[-Math.PI/2,0,0]} position={[0,.02,.72]} raycast={()=>null}><ringGeometry args={[.62,.7,40]}/><meshBasicMaterial color={fresh?'#e5f68c':'#121214'}/></mesh>}
  <Box w={1.45} h={.06} d={.78} radius={.03} color="#e6e0d6" position={[0,.58,-.15]} rough={.55}/>
  {[[-.58,-.42],[.58,-.42],[-.58,.12],[.58,.12]].map(([x,z])=><Box key={`${x}${z}`} w={.06} h={.54} d={.06} radius={.015} color="#c9c3b8" position={[x,.28,z]}/>)}
  <Box w={.7} h={.46} d={.04} radius={.02} color="#d7dee7" position={[0,.92,-.42]}/>
  <group position={[0,.92,-.39]}><Screen color={accent}/></group>
  <RoleMark variant={variant}/>
  <OfficeBot variant={variant} reduced={reduced} hovered={hovered||selected} rest={.45} index={at[0]} position={[0,0,.72]} scale={.62} onSelect={e=>{e.stopPropagation();onSelect(agent.id)}}/>
  {fresh&&<Html position={[0,1.85,.72]} center zIndexRange={[8,6]}><Button variant="secondary" type="button" className={`bot-bubble ${agent.status}`} onClick={()=>onSelect(agent.id)}><span className="bubble-meta"><i/>{agent.eventType}<span>↗</span></span><strong>{agent.event}</strong></Button></Html>}
 </group>;
}
function Room({rows}){
 const depth=3.2+rows*3.15;
 return <group>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.02,.2]} receiveShadow><planeGeometry args={[12,depth+2]}/><meshStandardMaterial color="#f3f1ee" roughness={.92}/></mesh>
  <Box w={11.2} h={3.2} d={.08} radius={.02} color="#e7ebf1" position={[0,1.6,-rows*1.55-1.5]} cast={false}/>
  <Box w={.08} h={3.2} d={depth} radius={.02} color="#eef1f5" position={[-5.55,1.6,-.2]} cast={false}/>
  <Box w={1.5} h={1} d={.05} radius={.02} color="#d5dde8" position={[-3.7,1.75,-rows*1.55-1.42]} cast={false}/>
  {[-.45,-.15,.15,.45].map(x=><Box key={x} w={.045} h={.9} d={.03} color="#f7f8fa" position={[-3.7+x,1.75,-rows*1.55-1.38]} cast={false}/>)}
  <mesh position={[1.15,2.25,-rows*1.55-1.42]}><circleGeometry args={[.26,28]}/><meshStandardMaterial color="#f7f8fa" roughness={.5}/></mesh>
  <Box w={.62} h={.42} d={.03} radius={.03} color="#e4e9f0" position={[2.4,2.05,-rows*1.55-1.42]} cast={false}/>
  <Box w={.8} h={.035} d={.28} radius={.02} color="#e7e1d6" position={[4.45,1.55,-rows*1.55-1.22]}/>
  <Box w={.8} h={.035} d={.28} radius={.02} color="#e7e1d6" position={[4.45,1.1,-rows*1.55-1.22]}/>
  <Box w={.035} h={1.05} d={.035} color="#b7c0cc" position={[4.1,.85,-rows*1.55-1.32]}/>
  <Box w={.035} h={1.05} d={.035} color="#b7c0cc" position={[4.8,.85,-rows*1.55-1.32]}/>
  <mesh position={[-4.7,.9,.8]} castShadow><cylinderGeometry args={[.03,.03,1.6,12]}/><meshStandardMaterial color="#c5ccd6" roughness={.45}/></mesh>
  <mesh position={[-4.7,1.65,.8]} castShadow><coneGeometry args={[.26,.3,20]}/><meshStandardMaterial color="#f6f3ee" roughness={.6}/></mesh>
  <mesh position={[4.55,.22,1.7]} castShadow><cylinderGeometry args={[.14,.16,.42,16]}/><meshStandardMaterial color="#efeae3" roughness={.7}/></mesh>
  <mesh position={[4.55,.58,1.7]} castShadow><sphereGeometry args={[.24,16,12]}/><meshStandardMaterial color="#9db89a" roughness={.62}/></mesh>
 </group>;
}
export function SharedOffice({agents,focusId,read,reduced,onSelect}){
 const rows=Math.max(1,Math.ceil(agents.length/3));
 return <group>
  <Room rows={rows}/>
  {agents.map((agent,index)=>{
   const col=index%3,row=Math.floor(index/3);
   const fresh=!!(agent.event&&agent.published!==false&&!read.includes(agent.id));
   return <Spot key={agent.id} agent={agent} at={[(col-1)*3.15,0,-1.7+row*3.35]} selected={agent.id===focusId} fresh={fresh} reduced={reduced} onSelect={onSelect}/>;
  })}
 </group>;
}
