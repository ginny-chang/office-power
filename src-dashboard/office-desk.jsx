import React,{useEffect,useMemo} from 'react';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {CanvasTexture,SRGBColorSpace} from 'three';
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
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=320;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#1b212b';ctx.fillRect(0,0,512,320);
  ctx.fillStyle=color;ctx.globalAlpha=.9;
  [150,210,250].forEach((h,i)=>{ctx.fillRect(48+i*130,300-h,86,h)});
  ctx.globalAlpha=.35;ctx.fillRect(48,78,300,10);ctx.fillRect(48,104,210,10);
  const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;return texture;
 },[color]);
 useEffect(()=>()=>map.dispose(),[map]);
 return <mesh position={[0,0,.03]}><planeGeometry args={[1.16,.68]}/><meshBasicMaterial map={map} toneMapped={false}/></mesh>;
}

function RoleMark({variant}){
 const spec=BOT_VARIANTS[variant]||BOT_VARIANTS.life;
 if(spec.tool==='bars')return <group position={[.72,.78,-.15]}>{[0.18,.32,.48].map((h,i)=><Box key={h} w={.08} h={h} d={.08} radius={.03} color={i===0?spec.deep:i===1?spec.color:spec.lite} position={[-.12+i*.12,h/2,0]}/>)}</group>;
 if(spec.tool==='badge')return <Box w={.28} h={.4} d={.04} radius={.04} color={spec.color} position={[.78,.96,-.2]}/>;
 if(spec.tool==='clipboard')return <Box w={.32} h={.42} d={.04} radius={.04} color={spec.color} position={[.78,.98,-.18]}/>;
 if(spec.tool==='calculator')return <Box w={.32} h={.4} d={.05} radius={.04} color={spec.color} position={[.78,.96,-.18]}/>;
 if(spec.tool==='box')return <Box w={.36} h={.26} d={.28} radius={.05} color={spec.color} position={[.76,.9,-.15]}/>;
 return <Box w={.22} h={.36} d={.04} radius={.08} color={spec.color} position={[.78,.98,-.16]} rotation={[0,0,.3]}/>;
}

export function AgentDesk({agent,reduced,hovered,onSelect}){
 const variant=botVariantFor(agent);
 const accent=(BOT_VARIANTS[variant]||BOT_VARIANTS.life).color;
 return <group>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.02,0]} receiveShadow><planeGeometry args={[14,12]}/><meshStandardMaterial color="#f3f1ee" roughness={.92}/></mesh>
  <Box w={6.2} h={3.1} d={.08} radius={.02} color="#e7ebf1" position={[-.2,1.55,-2.35]} cast={false}/>
  <Box w={.08} h={3.1} d={4.4} radius={.02} color="#eef1f5" position={[-3.15,1.55,-.2]} cast={false}/>
  <Box w={1.7} h={1.15} d={.06} radius={.02} color="#d5dde8" position={[-2.15,1.7,-2.28]} cast={false}/>
  {[-.55,-.18,.18,.55].map(x=><Box key={x} w={.05} h={1.05} d={.04} color="#f7f8fa" position={[-2.15+x,1.7,-2.24]} cast={false}/>)}
  <mesh position={[.15,2.15,-2.28]}><circleGeometry args={[.28,32]}/><meshStandardMaterial color="#f7f8fa" roughness={.5}/></mesh>
  <mesh position={[.15,2.15,-2.27]} rotation={[0,0,-.9]}><boxGeometry args={[.02,.16,.01]}/><meshStandardMaterial color="#8b93a0"/></mesh>
  <Box w={.72} h={.52} d={.03} radius={.04} color="#e4e9f0" position={[1.15,2.05,-2.28]} cast={false}/>
  <Box w={2.35} h={.08} d={1.05} radius={.03} color="#e6e0d6" position={[.35,.76,-.35]} rough={.55}/>
  {[[-.7,-.75],[.15,-.75],[1.25,-.75],[-.7,.05]].map(([x,z])=><Box key={`${x}${z}`} w={.08} h={.72} d={.08} radius={.02} color="#c9c3b8" position={[x,.36,z]}/>)}
  <Box w={1.28} h={.78} d={.06} radius={.03} color="#d7dee7" position={[.15,1.28,-.72]}/>
  <group position={[.15,1.28,-.68]}><Screen color={accent}/></group>
  <Box w={.16} h={.22} d={.08} color="#c5ceda" position={[.15,.9,-.7]}/>
  <Box w={.72} h={.025} d={.24} radius={.01} color="#f4f6f8" position={[-.15,.81,-.15]}/>
  <Box w={.42} h={.55} d={.36} radius={.04} color="#e7ebf0" position={[1.55,.28,.55]}/>
  {[.42,.28,.14].map(y=><Box key={y} w={.36} h={.012} d={.32} color="#f7f8fa" position={[1.55,y,.56]} cast={false}/>)}
  <Box w={.9} h={.04} d={.34} radius={.02} color="#e7e1d6" position={[1.85,1.55,-2.05]}/>
  <Box w={.9} h={.04} d={.34} radius={.02} color="#e7e1d6" position={[1.85,1.15,-2.05]}/>
  <Box w={.04} h={1.15} d={.04} color="#b7c0cc" position={[1.48,.95,-2.2]}/>
  <Box w={.04} h={1.15} d={.04} color="#b7c0cc" position={[2.22,.95,-2.2]}/>
  {[[1.62,1.62,'#c9d4e4'],[1.86,1.66,'#d7e3d8'],[2.08,1.58,'#e6dcc8'],[1.68,1.22,'#d5dbe8'],[1.96,1.26,'#e7e0d4']].map(([x,y,color])=><Box key={`${x}${y}`} w={.12} h={.28} d={.16} radius={.02} color={color} position={[x,y,-1.95]}/>)}
  <mesh position={[-2.55,.95,.4]} castShadow><cylinderGeometry args={[.03,.03,1.7,12]}/><meshStandardMaterial color="#c5ccd6" roughness={.45}/></mesh>
  <mesh position={[-2.55,1.72,.4]} castShadow><coneGeometry args={[.28,.32,24]}/><meshStandardMaterial color="#f6f3ee" roughness={.6}/></mesh>
  <mesh position={[-2.55,.12,.4]} rotation={[-Math.PI/2,0,0]} receiveShadow><circleGeometry args={[.28,24]}/><meshStandardMaterial color="#d5dbe3" roughness={.7}/></mesh>
  <Box w={1.5} h={.015} d={1.15} radius={.01} color="#e4e8ee" position={[-.85,.01,.85]} cast={false}/>
  <mesh position={[2.15,.28,1.15]} castShadow><cylinderGeometry args={[.16,.18,.5,20]}/><meshStandardMaterial color="#efeae3" roughness={.7}/></mesh>
  <mesh position={[2.15,.72,1.15]} castShadow><sphereGeometry args={[.28,20,14]}/><meshStandardMaterial color="#9db89a" roughness={.62}/></mesh>
  <RoleMark variant={variant}/>
  <OfficeBot variant={variant} reduced={reduced} hovered={hovered} rest={.35} position={[-1.15,0,.95]} scale={.78} onSelect={onSelect}/>
 </group>;
}
