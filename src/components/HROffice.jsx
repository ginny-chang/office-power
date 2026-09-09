import React,{useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {Box,Agent} from './OfficeScene';
const accents={overtime:'#cca575',dispatch:'#90abc5',leave:'#9db4a1',contract:'#a99bb8',punch:'#8bb7af'};
function Plant({at,scale=1}){
 return <group position={at} scale={scale}><mesh position={[0,.22,0]} castShadow><cylinderGeometry args={[.25,.19,.44,24]}/><meshStandardMaterial color="#d4c6b5" roughness={.8}/></mesh>{[0,1,2,3,4].map(i=><group key={i} rotation={[0,i*1.25,0]}><Box at={[0,.65,0]} size={[.025,.85,.025]} color="#869283"/><mesh position={[.15,.65+i*.09,0]} rotation={[0,0,-.65]} scale={[.14,.33,.06]} castShadow><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color={i%2?'#99aa95':'#7f947d'} roughness={.8}/></mesh></group>)}</group>;
}
function Monitor({kind}){
 const texture=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=400;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#263342';ctx.fillRect(0,0,640,400);
  ctx.fillStyle='#9cafc3';ctx.font='18px sans-serif';ctx.fillText('PEOPLE / HR WORKSPACE',30,40);
  ctx.fillStyle='#f0f3f6';ctx.font='32px sans-serif';ctx.fillText({overtime:'Overtime monitor',dispatch:'Attendance inbox',leave:'Leave planner',contract:'Contract timeline',punch:'Attendance verified'}[kind],30,92);
  if(kind==='overtime'){[.36,.56,.72,.91].forEach((v,i)=>{ctx.fillStyle=i===3?'#cca575':'#94acc5';ctx.fillRect(45+i*135,335-v*210,85,v*210);});ctx.strokeStyle='#e0bd90';ctx.setLineDash([7,5]);ctx.beginPath();ctx.moveTo(30,151);ctx.lineTo(610,151);ctx.stroke();}
  else if(kind==='leave'){for(let i=0;i<21;i++){ctx.fillStyle=i>14?'#9db4a1':'#485969';ctx.fillRect(30+i%7*84,125+Math.floor(i/7)*70,67,50);}}
  else {for(let i=0;i<4;i++){ctx.fillStyle='#39495b';ctx.fillRect(30,125+i*61,580,45);ctx.fillStyle=accents[kind];ctx.fillRect(45,140+i*61,16,16);ctx.fillStyle='#ced8e2';ctx.font='18px sans-serif';ctx.fillText((kind==='punch'?['09:05  Entry record','Attendance matched','Summary prepared','Sent for review']:kind==='contract'?['Probation review','Contract renewal','30-day reminder','Manager notified']:['Assigned to employee','11 completed','4 pending','LINE delivered'])[i],80,157+i*61);}}
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;
 },[kind]);useEffect(()=>()=>texture.dispose(),[texture]);
 return <group position={[-.45,1.96,-1.25]}><Box size={[1.8,1.18,.12]} color="#a8b2be" radius={.06}/><mesh position={[0,.02,.07]}><planeGeometry args={[1.65,1.03]}/><meshBasicMaterial map={texture} toneMapped={false}/></mesh><Box at={[0,-.68,0]} size={[.09,.3,.1]} color="#9da8b6"/><Box at={[0,-.83,.1]} size={[.6,.045,.38]} color="#a6b1be"/></group>;
}
export default function HROffice({kind='overtime',reduced=false}){
 const stamp=useRef(),parcel=useRef(),scan=useRef(),notice=useRef(),calendar=useRef();
 useFrame(({clock})=>{
  const t=reduced?0:clock.elapsedTime;
  stamp.current.position.y=kind==='contract'?1.33+Math.max(0,Math.sin(t*2.6))*.48:1.36;
  parcel.current.visible=kind==='dispatch';parcel.current.position.set(-.4+(t*.5%1)*1.5,1.6+Math.sin((t*.5%1)*Math.PI)*.45,-.55);
  parcel.current.rotation.z=Math.sin(t*2)*.15;
  notice.current.visible=kind==='punch'||kind==='dispatch';notice.current.position.y=2.02+Math.sin(t*2)*.07;
  calendar.current.visible=kind==='leave';calendar.current.scale.setScalar(1+Math.sin(t*2)*.07);
  scan.current.visible=kind==='overtime';scan.current.position.y=1.6+(Math.sin(t)*.5+.5)*.75;
 });
 return <group>
  <Box at={[0,-.14,0]} size={[6,.24,5.2]} color="#d5d9dd" radius={.06}/>
  {Array.from({length:12},(_,i)=><Box key={i} at={[-2.75+i*.5,-.011,0]} size={[.475,.015,5]} color={i%2?'#d9dcdf':'#e1e2e3'} radius={.005}/>)}
  <Box at={[0,1.9,-2.55]} size={[6,3.85,.12]} color="#e9e8e4"/>
  <Box at={[-2.95,1.9,0]} size={[.12,3.85,5.2]} color="#e0e2e4"/>
  <group position={[-2.86,2.45,-.3]} rotation={[0,Math.PI/2,0]}><Box size={[2.35,1.8,.08]} color="#faf8f1"/><Box at={[0,0,.05]} size={[2.15,1.6,.04]} color="#c6d2dc"/>{[-.7,0,.7].map(x=><Box key={x} at={[x,0,.09]} size={[.045,1.65,.05]} color="#f5f2eb"/>)}<Box at={[0,-.87,.15]} size={[2.5,.09,.35]} color="#eae5da"/><Box at={[0,.72,.13]} size={[2.35,.25,.1]} color="#d0c8bc"/></group>
  <Box at={[-.55,1.18,-1]} size={[3.55,.14,1.3]} color="#c5b9a7" radius={.07}/>
  {[-2, .88].map(x=><Box key={x} at={[x,.57,-1]} size={[.08,1.13,1.07]} color="#9fa7ae"/>)}
  <Monitor kind={kind}/><Box at={[-.58,1.28,-.65]} size={[1.05,.045,.35]} color="#eef0ef"/>
  <Box at={[.12,1.28,-.6]} size={[.18,.05,.26]} color="#e6e8e8" radius={.06}/>
  <group ref={scan} position={[-.45,1.8,-1.16]}><Box size={[1.61,.022,.015]} color="#e0bd90"/></group>
  <group position={[-.8,.06,.2]} rotation={[0,.1,0]}><Agent at={[0,0,0]} reduced={reduced} active/></group>
  <Box at={[-.8,.035,.6]} size={[2.8,.035,2.45]} color="#c3c9cf" radius={.15}/>
  <group position={[.95,1.47,-.63]} rotation={[0,-.2,-.1]}><Box size={[.4,.67,.055]} color="#566474" radius={.04}/><Box at={[0,0,.035]} size={[.34,.57,.015]} color={kind==='punch'?'#b9d7ca':'#c7d2dc'}/>{[0,1,2].map(i=><Box key={i} at={[0,.15-i*.14,.05]} size={[.25,.045,.012]} color="#769484"/>)}</group>
  <group ref={notice} position={[1.03,2.02,-.6]}><Box size={[.82,.37,.075]} color="#bbd6cb" radius={.08}/>{[-.22,0,.22].map(x=><Box key={x} at={[x,0,.047]} size={[.06,.06,.02]} color="#5c8b78"/>)}</group>
  <group ref={calendar} position={[.05,2.9,-2.37]}><Box size={[1.28,1.02,.025]} color="#a0b899"/><Box at={[0,0,.023]} size={[1.16,.9,.025]} color="#e8eee4"/>{Array.from({length:12},(_,i)=><Box key={i} at={[-.36+i%4*.24,.2-Math.floor(i/4)*.2,.045]} size={[.15,.12,.02]} color={i>5?"#829b7e":"#c1cbbd"}/>)}</group>
  <mesh ref={parcel}><boxGeometry args={[.36,.24,.045]}/><meshStandardMaterial color="#8baecb"/></mesh>
  <group position={[1.75,0,-1.7]}><Box at={[0,.58,0]} size={[1.3,1.15,.8]} color="#b5b9b9"/>{[.28,.62,.95].map(y=><group key={y}><Box at={[0,y,.41]} size={[1.17,.28,.035]} color="#d7d8d5"/><Box at={[0,y,.44]} size={[.28,.025,.025]} color="#87929f"/></group>)}{[1.7,2.45,3.2].map((y,j)=><group key={y}><Box at={[0,y,0]} size={[1.45,.07,.65]} color="#b9ad99"/>{[0,1,2].map(i=><Box key={i} at={[-.45+i*.19,y+.22,-.12]} size={[.13,.4,.35]} color={['#9baabb','#bab0a7','#9faf9f'][(i+j)%3]} rotation={[0,0,i===2?-.12:0]}/>)}</group>)}{[-.67,.67].map(x=><Box key={x} at={[x,2.15,-.22]} size={[.045,2.45,.045]} color="#89939e"/>)}</group>
  <group position={[.05,2.95,-2.45]}><Box size={[1.1,.85,.08]} color="#b8bfc5"/><Box at={[0,-.1,.05]} size={[.95,.55,.025]} color="#eeede8"/>{Array.from({length:12},(_,i)=><Box key={i} at={[-.32+i%4*.21,.08-Math.floor(i/4)*.17,.07]} size={[.12,.09,.016]} color={kind==='leave'&&i>5?'#8da58e':'#c3cbd0'}/>)}<Box at={[0,.28,.06]} size={[.95,.14,.025]} color={kind==='leave'?'#a1b6a2':'#a6b0bc'}/></group>
  <group position={[-1.75,2.9,-2.44]}><mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.37,.37,.065,40]}/><meshStandardMaterial color="#f5f3ee"/></mesh><Box at={[0,.1,.05]} size={[.025,.21,.02]} color="#6f7c8d"/><Box at={[.08,0,.05]} size={[.17,.025,.02]} color="#6f7c8d"/></group>
  <group position={[.55,1.28,-.28]} rotation={[-Math.PI/2,0,-.2]}><Box size={[.47,.6,.018]} color="#f4f2ed"/>{[0,1,2].map(i=><Box key={i} at={[0,.13-i*.1,.014]} size={[.3,.02,.005]} color={kind==='contract'?'#aa9ab8':'#b5bdc5'}/>)}</group>
  <group ref={stamp} position={[.6,1.36,-.29]}><Box size={[.22,.06,.19]} color="#a194ad"/><Box at={[0,.11,0]} size={[.08,.2,.08]} color="#697583"/></group>
  <Plant at={[2.2,0,1.6]} scale={1.2}/><Plant at={[-2.13,1.26,-1.32]} scale={.38}/>
  <group position={[-2.35,0,1.38]}><mesh position={[0,.05,0]}><cylinderGeometry args={[.3,.3,.07,32]}/><meshStandardMaterial color="#8f98a2"/></mesh><Box at={[0,1.12,0]} size={[.035,2.2,.035]} color="#8c96a0"/><mesh position={[0,2.24,0]}><cylinderGeometry args={[.28,.42,.38,32,1,true]}/><meshStandardMaterial color="#f2eee3" side={THREE.DoubleSide}/></mesh></group>
 </group>;
}
