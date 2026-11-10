import React,{useEffect,useMemo,useRef,useState} from 'react';
import {useThree} from '@react-three/fiber';
import {Html,OrbitControls} from '@react-three/drei';
import {LineCurve3,TubeGeometry,Vector3} from 'three';
import {Settings} from 'lucide-react';
import {Button} from '../src-shared/ui/index.jsx';
import AgentIcon from '../src-shared/AgentIcon.jsx';
import {BotLighting,OfficeBot} from './office-bots.jsx';
import {botVariantFor,isAgentAlert} from './bot-variants.js';
import {officeLayout} from './office-layout.js';

function LinkLine({to}){
 const geo=useMemo(()=>new TubeGeometry(new LineCurve3(new Vector3(0,.045,0),new Vector3(to[0],.045,to[2])),1,.012,6,false),[to]);
 useEffect(()=>()=>geo.dispose(),[geo]);
 return <mesh geometry={geo} raycast={()=>null}><meshBasicMaterial color="#d5d8e0"/></mesh>;
}
function Platform({radius,hub}){
 return <group>
  <mesh position={[0,.12,0]} castShadow receiveShadow><cylinderGeometry args={[radius,radius,.24,72]}/><meshStandardMaterial color="#f7f8fb" roughness={.42}/></mesh>
  <mesh position={[0,.25,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><circleGeometry args={[radius-.1,72]}/><meshStandardMaterial color="#ffffff" roughness={.5}/></mesh>
  <mesh position={[0,.248,0]} rotation={[-Math.PI/2,0,0]} raycast={()=>null}><torusGeometry args={[radius-.05,.045,10,72]}/><meshStandardMaterial color="#fbfcfe" roughness={.35}/></mesh>
  {hub&&[radius+.16,radius+.3].map(ring=><mesh key={ring} position={[0,.02,0]} rotation={[-Math.PI/2,0,0]} raycast={()=>null}><torusGeometry args={[ring,.012,8,80]}/><meshBasicMaterial color="#e7eaef" transparent opacity={.9}/></mesh>)}
 </group>;
}
function towardCamera(at,distance){
 const dx=7.4-at[0],dz=12.8-at[2],len=Math.hypot(dx,dz)||1;
 return [dx/len*distance,dz/len*distance];
}
function Station({agent,fresh,reduced,onSelect,onSettings}){
 const [hovered,setHovered]=useState(false);
 const hub=agent.id==='nova';
 const radius=hub?1.62:1.42;
 const rest=Math.atan2(7.4-agent.at[0],12.8-agent.at[2]);
 const [lx,lz]=towardCamera(agent.at,radius*.55);
 const [bx,bz]=towardCamera(agent.at,.7);
 const variant=botVariantFor(agent);
 return <group position={agent.at} onPointerOver={e=>{e.stopPropagation();setHovered(true)}} onPointerOut={()=>setHovered(false)}>
  <Platform radius={radius} hub={hub}/>
  <OfficeBot variant={variant} reduced={reduced} hovered={hovered} alert={isAgentAlert(agent)} rest={rest} index={agent.at[0]} position={[0,.28,0]} scale={1.05} onSelect={e=>{e.stopPropagation();onSelect(agent.id)}}/>
  <Html position={[lx,.22,lz]} center zIndexRange={[5,1]}>
   <div className="bot-name-actions" data-hovered={hovered} onPointerEnter={()=>setHovered(true)} onPointerLeave={()=>setHovered(false)}>
    <Button variant="plain" type="button" data-agent={agent.id} data-hovered={hovered} className="bot-label" onClick={()=>onSelect(agent.id)}><AgentIcon agent={agent.id} emoji={agent.emoji} size={18}/>{agent.name}</Button>
    {onSettings&&<Button variant="plain" type="button" className="bot-settings-button" aria-label={`設定 ${agent.name}`} onClick={e=>{e.stopPropagation();onSettings(agent.id)}}><Settings size={14}/></Button>}
   </div>
  </Html>
  {fresh&&<Html position={[bx,2.85,bz]} center zIndexRange={[8,6]}><Button variant="secondary" type="button" className={`bot-bubble ${agent.status}`} onClick={()=>onSelect(agent.id)}><span className="bubble-meta"><i/>{agent.eventType}<span>↗</span></span><strong>{agent.event}</strong></Button></Html>}
 </group>;
}
function BoardCamera({radius,reduced,frame}){
 const {camera,size,invalidate}=useThree();
 const controls=useRef();
 const {left=0,right=0,top=0,bottom=0}=frame?.(size.width,size.height)||{};
 const span=Math.max(8,radius*2+4.8);
 const fit=Math.max(10,Math.min((size.width-left-right-40)/span,(size.height-top-bottom-8)/(span*.78)));
 useEffect(()=>{
  const dx=(right-left)/2,dy=(bottom-top)/2;
  if(dx||dy)camera.setViewOffset(size.width,size.height,dx,dy,size.width,size.height);
  else camera.clearViewOffset();
  camera.zoom=fit;
  camera.position.set(7.4,8.6,12.8);
  camera.lookAt(0,.9,0);
  camera.updateProjectionMatrix();
  if(controls.current){
   controls.current.target.set(0,.9,0);
   const angle=Math.atan2(Math.hypot(camera.position.x,camera.position.z),camera.position.y-.9);
   controls.current.minPolarAngle=controls.current.maxPolarAngle=angle;
   controls.current.update();
  }
  invalidate();
 },[camera,size.width,size.height,left,right,top,bottom,fit,invalidate]);
 return <OrbitControls ref={controls} enablePan enableZoom screenSpacePanning minZoom={10} maxZoom={160} target={[0,.9,0]} enableDamping={!reduced} dampingFactor={.08}/>;
}
export function RobotBoard({agents,allAgents=agents,read,reduced,onSelect,onSettings,onReady,frame}){
 const layout=useMemo(()=>{
  const placed=officeLayout(allAgents);
  const tighten=placed.radius?Math.min(1,4.55/placed.radius):1;
  return {radius:placed.radius*tighten,agents:placed.agents.map(agent=>({...agent,at:[agent.at[0]*tighten,agent.at[1],agent.at[2]*tighten]}))};
 },[allAgents]);
 const visible=layout.agents.filter(agent=>agents.some(shown=>shown.id===agent.id));
 useEffect(()=>{onReady?.()},[onReady]);
 return <>
  <color attach="background" args={['#f3f4f6']}/>
  <BotLighting/>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.02,0]} receiveShadow><planeGeometry args={[320,240]}/><meshStandardMaterial color="#f4f5f7" roughness={.94}/></mesh>
  {visible.filter(agent=>agent.at[0]||agent.at[2]).map(agent=><LinkLine key={agent.id} to={agent.at}/>)}
  {visible.map(agent=>{
   const fresh=!!(agent.event&&agent.published!==false&&!read.includes(agent.id));
   return <Station key={agent.id} agent={agent} fresh={fresh} reduced={reduced} onSelect={onSelect} onSettings={onSettings}/>;
  })}
  <BoardCamera radius={layout.radius} reduced={reduced} frame={frame}/>
 </>;
}
