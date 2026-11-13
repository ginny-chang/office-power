import React,{useEffect,useMemo,useState} from 'react';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {CanvasTexture,SRGBColorSpace} from 'three';
import {Html} from '@react-three/drei';
import {Button} from '../src-shared/ui/index.jsx';
import {OfficeBot,AgentCharacter} from './office-bots.jsx';
import {BOT_VARIANTS,agentRoleFor,novaPropFor,isAgentAlert} from './bot-variants.js';
import {ROLES} from './agent-characters.js';

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
 // A light screen with a small chart in the agent's colour
 const map=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=288;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#fbfbfd';ctx.fillRect(0,0,512,288);
  ctx.fillStyle='#e3e6ee';ctx.fillRect(40,44,150,14);ctx.fillRect(40,70,96,10);
  ctx.fillStyle=color;
  [96,136,176,150].forEach((h,i)=>{const x=250+i*56;ctx.beginPath();ctx.roundRect(x,248-h,36,h,10);ctx.fill()});
  ctx.fillStyle='#eef0f5';ctx.fillRect(40,236,170,12);ctx.fillRect(40,206,120,12);
  const texture=new CanvasTexture(canvas);texture.colorSpace=SRGBColorSpace;return texture;
 },[color]);
 useEffect(()=>()=>map.dispose(),[map]);
 return <mesh position={[0,0,.026]}><planeGeometry args={[.98,.55]}/><meshBasicMaterial map={map} toneMapped={false}/></mesh>;
}
function watermarkTexture(color){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle=color;ctx.globalAlpha=.9;
 ctx.translate(128,128);
 ctx.beginPath();ctx.arc(0,0,84,0,Math.PI*2);ctx.fill();
 const map=new CanvasTexture(canvas);map.colorSpace=SRGBColorSpace;return map;
}
function Watermark({color}){
 const map=useMemo(()=>watermarkTexture(color),[color]);
 useEffect(()=>()=>map.dispose(),[map]);
 return <mesh position={[0,1.45,-1.85]} raycast={()=>null}><planeGeometry args={[2.5,2.3]}/><meshBasicMaterial map={map} transparent opacity={.16} depthWrite={false} toneMapped={false}/></mesh>;
}
function Round({r,h,color,position,rotation,rough,metal,segments=28,top=r}){
 return <mesh position={position} rotation={rotation} castShadow receiveShadow><cylinderGeometry args={[top,r,h,segments]}/><Mat color={color} rough={rough} metal={metal}/></mesh>;
}
// A working desk behind each agent: all-in-one computer, keyboard and mouse on a mat, lamp, mug, plant, and a drawer unit under one side
function WorkDesk({color}){
 const body='#f1f2f5',trim='#d3d8e0',wood='#e7dfd2',woodDark='#d5cbbb';
 return <group position={[0,0,-1.05]}>
  <Box w={2.36} h={.09} d={.98} radius={.04} color={wood} position={[0,.745,0]} rough={.6}/>
  {/* drawers */}
  <Box w={.66} h={.68} d={.84} radius={.03} color="#efe9df" position={[-.78,.36,0]} rough={.62}/>
  {[.56,.36,.16].map(y=><group key={y} position={[-.78,y,.425]}>
   <Box w={.58} h={.17} d={.02} radius={.01} color="#f6f2ea" cast={false}/>
   <Box w={.2} h={.022} d={.012} radius={.006} color={woodDark} position={[0,.05,.014]} cast={false}/>
  </group>)}
  <Box w={.07} h={.7} d={.8} radius={.02} color={trim} position={[1.06,.35,0]} rough={.4} metal={.25}/>
  {/* computer */}
  <group position={[.06,0,-.2]}>
   <Box w={1.12} h={.8} d={.05} radius={.04} color={body} position={[0,1.33,0]} rough={.35}/>
   <group position={[0,1.4,0]}><Screen color={color}/></group>
   <Round r={.012} h={.004} color="#b9bfca" position={[0,1.695,.027]} rotation={[Math.PI/2,0,0]} segments={12}/>
   <Box w={.3} h={.26} d={.045} radius={.02} color={trim} position={[0,.9,-.03]} rough={.3} metal={.3}/>
   <Box w={.4} h={.022} d={.26} radius={.011} color={trim} position={[0,.801,0]} rough={.3} metal={.3}/>
  </group>
  {/* mat, keyboard, mouse */}
  <Box w={1.2} h={.012} d={.44} radius={.006} color="#e3e6ec" position={[.06,.797,.2]} rough={.8} cast={false}/>
  <group position={[-.04,.812,.2]}>
   <Box w={.62} h={.024} d={.19} radius={.012} color="#fafbfc" rough={.4}/>
   {[-.055,0,.055].map(z=><Box key={z} w={.56} h={.006} d={.04} radius={.003} color="#dfe3ea" position={[0,.014,z]} cast={false}/>)}
  </group>
  <mesh position={[.44,.822,.22]} scale={[.052,.026,.08]} castShadow><sphereGeometry args={[1,20,14]}/><Mat color="#fafbfc" rough={.35}/></mesh>
  <Box w={.17} h={.014} d={.27} radius={.007} color="#dfe3ea" position={[.78,.8,.2]} rotation={[0,-.2,0]} rough={.3}/>
  {/* mug */}
  <group position={[-.58,.79,.12]}>
   <Round r={.058} h={.12} color="#fbf7f1" position={[0,.06,0]} rough={.5}/>
   <mesh position={[.066,.06,0]} castShadow><torusGeometry args={[.034,.011,10,20]}/><Mat color="#fbf7f1" rough={.5}/></mesh>
  </group>
  {/* lamp */}
  <group position={[-.95,.79,-.2]}>
   <Round r={.1} h={.022} color="#f3f0ea" position={[0,.011,0]} rough={.4}/>
   <Round r={.012} h={.52} color="#e6e1d8" position={[0,.27,0]} rough={.35}/>
   <group position={[.07,.55,.04]} rotation={[.5,0,-.9]}>
    <mesh castShadow><sphereGeometry args={[.11,24,14,0,Math.PI*2,0,Math.PI/2]}/><Mat color="#f6f2ea" rough={.45}/></mesh>
    <mesh position={[0,.012,0]}><sphereGeometry args={[.05,16,12]}/><meshBasicMaterial color="#fff6dc" toneMapped={false}/></mesh>
   </group>
  </group>
  {/* plant */}
  <group position={[.98,.79,-.24]}>
   <Round r={.06} top={.075} h={.11} color="#f1e6dc" position={[0,.055,0]} rough={.6}/>
   {[[0,.2,0,.07,.11],[-.06,.16,.02,.05,.08],[.06,.17,-.02,.05,.09]].map(([x,y,z,w,h])=><mesh key={x} position={[x,y,z]} scale={[w,h,w]} castShadow><sphereGeometry args={[1,14,10]}/><Mat color="#8fbf86" rough={.7}/></mesh>)}
  </group>
 </group>;
}
function Spot({agent,selected,fresh,reduced,onSelect,index=0}){
 const [hovered,setHovered]=useState(false);
 // 大腦總管 NOVA stays the white robot. 指令中心、App 小幫手 and 專案助理 use that same body with their own prop.
 const role=agentRoleFor(agent);
 const prop=novaPropFor(agent);
 const nova=role==='nova'||!!prop;
 const accent=prop==='command'?'#7ec8ee':prop==='app-helper'?'#cbb6f2':prop==='planner'?'#7ee0c2':nova?BOT_VARIANTS.life.color:ROLES[role].color;
 const alert=isAgentAlert(agent);
 const pick=e=>{e.stopPropagation();onSelect(agent.id)};
 return <group onPointerOver={e=>{e.stopPropagation();setHovered(true)}} onPointerOut={()=>setHovered(false)}>
  <Watermark color={accent}/>
  <WorkDesk color={accent}/>
  {nova
   ?<OfficeBot variant="life" tool={false} prop={prop} reduced={reduced} hovered={hovered} selected={selected} alert={alert} rest={0} index={index} position={[.1,0,.95]} scale={NOVA_SCALE} onSelect={pick}/>
   :<AgentCharacter role={role} reduced={reduced} hovered={hovered} selected={selected} alert={alert} fresh={fresh} rest={0} index={index} position={[.1,0,.95]} scale={1} onSelect={pick}/>}
  {/* Who this agent is and what it is doing, on the floor in front of it. The office view has no such card. */}
  <Html position={[.1,-1.04,.95]} center zIndexRange={[5,3]} style={{pointerEvents:'none'}}><div className="agent-fact-card">
   <span className="agent-fact-name"><b>{agent.name}</b><small>{agent.role}</small></span>
   <strong>{agent.task||'目前沒有待處理的任務'}</strong>
   {agent.detail&&<p>{agent.detail}</p>}
  </div></Html>
  {fresh&&<Html position={[.15,2.7,.95]} center zIndexRange={[8,6]}><Button variant="secondary" type="button" className={`bot-bubble ${agent.status}`} onClick={()=>onSelect(agent.id)}><span className="bubble-meta"><i/>{agent.eventType}<span>↗</span></span><strong>{agent.event}</strong></Button></Html>}
 </group>;
}
// 大腦總管 NOVA stands 1.2x the size of the other agents
const NOVA_SCALE=1.2;
export const ROW_PITCH=3.45;
const ROW_SCALE=1.14;
export function RobotRow({agents,focusId,read,reduced,onSelect}){
 const mid=(agents.length-1)*ROW_PITCH/2;
 return <group>
  <mesh rotation={[-Math.PI/2,0,0]} position={[mid,-.02,18]} receiveShadow><planeGeometry args={[320,240]}/><meshStandardMaterial color="#f4f2ef" roughness={.94}/></mesh>
  {agents.map((agent,index)=>{
   const fresh=!!(agent.event&&agent.published!==false&&!read.includes(agent.id));
   return <group key={agent.id} position={[index*ROW_PITCH,0,0]} scale={ROW_SCALE}><Spot agent={agent} index={index} selected={agent.id===focusId} fresh={fresh} reduced={reduced} onSelect={onSelect}/></group>;
  })}
 </group>;
}
