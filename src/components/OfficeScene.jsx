import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, RenderTexture, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import { appOptions } from './AppBuilder';
import Icon from './icons';

// All departments share materials and world coordinates. Only the camera travels.
const C = { shell: '#e9ecf0', metal: '#a8b0bb', ink: '#262b34', floor: '#dfe3e8', wall: '#eceef2', light: '#b5c9e8' };
function Box({ at=[0,0,0], size=[1,1,1], color=C.shell, radius=.035, metal=.15, ...props }) {
  return <RoundedBox position={at} args={size} radius={Math.min(radius,...size.map(v=>v*.45))} smoothness={3} castShadow receiveShadow {...props}><meshStandardMaterial color={color} roughness={.48} metalness={metal}/></RoundedBox>;
}
function Sphere({at,size,color=C.metal}) {
  return <mesh position={at} scale={size} castShadow><sphereGeometry args={[1,20,12]}/><meshStandardMaterial color={color} roughness={.45} metalness={.3}/></mesh>;
}
function Screen({at,size=[.95,.58],variant=0}) {
  const texture = useMemo(() => {
    const canvas=document.createElement('canvas'); canvas.width=512;canvas.height=320;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#19212d';ctx.fillRect(0,0,512,320);
    ctx.fillStyle='#8999ac';ctx.font='14px sans-serif';ctx.fillText(['PEOPLE / 01','FINANCE / 02','SALES / 03','GOVERNANCE / 04'][variant],26,35);
    ctx.fillStyle='#e4eaf0';ctx.font='24px sans-serif';ctx.fillText(['Leave requests','Expense review','Account activity','Access control'][variant],26,80);
    for(let i=0;i<4;i++){ctx.fillStyle='#2c3746';ctx.fillRect(26,110+i*40,460,28);ctx.fillStyle='#93a8c3';ctx.fillRect(40,120+i*40,130+i*28,6);ctx.fillStyle='#c5d2e1';ctx.fillRect(390,118+i*40,65,10);}
    const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;
  },[variant]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  return <mesh position={at}><planeGeometry args={size}/><meshBasicMaterial map={texture} toneMapped={false}/></mesh>;
}
function Agent({at,index=0,reduced,walking=false,working=false,seated=false,arrivalProgress,celebrate=false,active=false,hovered=false,onHover,onLeave,onSelect}) {
  const body=useRef(), arm=useRef(),feet=useRef([]),celebration=useRef(0);
  useEffect(()=>{celebration.current=0;},[celebrate]);
  useFrame(({clock},delta)=>{
    if(arrivalProgress){
      const t=arrivalProgress.current,sit=THREE.MathUtils.smoothstep(t,.31,.45);
      feet.current.forEach((foot,i)=>{
        foot.position.z=THREE.MathUtils.lerp(.015,.3,sit)+Math.sin(t*90+i*Math.PI)*.12*(1-sit);
        foot.position.y=THREE.MathUtils.lerp(.16,.3,sit);
      });
    }
    const facing=hovered||active ? .2 : Math.PI;
    body.current.rotation.y=reduced ? facing : THREE.MathUtils.lerp(body.current.rotation.y,facing,.09);
    if(reduced) { arm.current.rotation.z=hovered?-2.2:0; return; }
    const t=clock.elapsedTime+index*1.4;
    body.current.position.y=at[1]+Math.sin(t*1.8)*.018;
    if(celebrate){celebration.current=Math.min(1,celebration.current+delta/.62);body.current.position.y=at[1]+Math.sin(celebration.current*Math.PI)*.95;body.current.rotation.y=.2+Math.PI*2*THREE.MathUtils.smoothstep(celebration.current,0,1);}
    arm.current.rotation.z=hovered ? -2.2+Math.sin(t*9)*.35 : Math.sin(t*(working?18:4))*(working?.24:.08);
    arm.current.rotation.x=hovered?0:-.8+Math.sin(t*(working?18:4))*(working?.35:.1);
    if(walking){body.current.position.x=at[0]+Math.sin(t*.22)*.55;body.current.rotation.y=Math.sin(t*.22)*.25;}
  });
  return <group ref={body} position={at} rotation={[0,Math.PI,0]} scale={.92} onPointerOver={onHover} onPointerOut={onLeave} onClick={onSelect}>
    <Box at={[0,.73,0]} size={[1.05,1.18,.7]} radius={.3} color="#f1f2f3" metal={.12}/>
    {[-.29,.29].map((x,i)=><group key={x} ref={el=>feet.current[i]=el} position={[x,seated?.3:.16,seated?.28:.015]}><Box size={[.46,.32,.66]} radius={.13} color="#f1f2f3"/></group>)}
    <Box at={[0,.77,.006]} size={[1.056,.009,.69]} radius={.003} color="#93999f"/>
    <RoundedBox position={[0,.97,.335]} args={[.79,.76,.22]} radius={.24} smoothness={6} castShadow><meshPhysicalMaterial color="#101116" roughness={.16} metalness={.2} clearcoat={1} clearcoatRoughness={.08}/></RoundedBox>
    {[-.115,.115].map(x=><mesh key={x} position={[x,.9,.465]} scale={[1,1,.22]}><capsuleGeometry args={[.056,.135,6,16]}/><meshBasicMaterial color="#f7f7fa"/></mesh>)}
    <Box at={[0,.41,.36]} size={[.35,.115,.019]} radius={.052} color="#9ca3aa"/>
    <Box at={[0,.41,.371]} size={[.326,.096,.016]} radius={.045} color="#e2e5e8"/>
    {[-1,1].map(side=><group key={side} position={[side*.36,1.33,0]} rotation={[0,0,side*-.4]}>
      <mesh position={[0,.055,0]}><cylinderGeometry args={[.14,.15,.1,32]}/><meshStandardMaterial color="#e5e7e9" roughness={.35}/></mesh>
      <mesh position={[0,.13,0]}><cylinderGeometry args={[.1,.1,.05,32]}/><meshStandardMaterial color="#777d84" metalness={.8} roughness={.25}/></mesh>
      <mesh position={[0,.27,0]} castShadow><cylinderGeometry args={[.13,.13,.24,32]}/><meshStandardMaterial color="#f0f1f3" roughness={.35}/></mesh>
    </group>)}
    <group ref={arm} position={[.53,.7,0]}><Sphere at={[0,-.14,0]} size={[.105,.25,.14]} color="#eef0f2"/></group><group position={[-.53,.61,0]} rotation={[-.8,0,-.45]}><Sphere at={[0,-.14,0]} size={[.105,.25,.14]} color="#eef0f2"/></group>
  </group>;
}
function Fireworks({reduced}) {
 const group=useRef(),elapsed=useRef(0);
 const particles=useMemo(()=>Array.from({length:32},(_,i)=>{const a=i/32*Math.PI*2;return [Math.cos(a),Math.sin(a),Math.sin(i*2.4)*.5];}),[]);
 useFrame((_,delta)=>{if(reduced)return;elapsed.current+=delta;const t=Math.max(0,elapsed.current-.4);group.current.visible=t<1.5;group.current.children.forEach((mesh,i)=>{const v=particles[i];mesh.position.set(v[0]*t*1.5,v[1]*t*1.5-t*t*.4,v[2]*t);mesh.scale.setScalar(Math.max(0,1-t/1.5));});});
 if(reduced)return null;
 return <group ref={group} position={[.5,2.4,.6]}>{particles.map((_,i)=><mesh key={i}><sphereGeometry args={[.035,6,4]}/><meshBasicMaterial color={i%3===0?'#f3cf84':i%3===1?'#b1c7ea':'#f4f7ff'}/></mesh>)}</group>;
}
function Workstation({at,index,selected,reduced,markers,chapter,taskStage,hovered,onHover,building,card}) {
  const label=['HR Agent','財務 Agent','業務 Agent','IT Agent'][index];
  const interactive=markers&&(chapter===0||chapter===1||chapter===3);
  return <group position={at}>
    <Box at={[0,.025,0]} size={[2.7,.05,2.65]} color='#cdd3db' radius={.09}/>
    <Box at={[0,.93,-.55]} size={[2.2,.11,.94]} color='#e6e9ed' radius={.045}/>
    {[-.91,.91].map(x=><Box key={x} at={[x,.47,-.55]} size={[.06,.9,.65]} color={C.metal} metal={.65}/>)}
    <Box at={[0,1.39,-.74]} size={[1.04,.69,.06]} color={C.metal} radius={.035} metal={.65}/>
    <Screen at={[0,1.41,-.704]} variant={index}/>
    <Box at={[0,1.07,-.74]} size={[.05,.25,.06]} color={C.metal}/>
    <Box at={[0,1,-.74]} size={[.38,.035,.28]} color={C.metal}/>
    <Box at={[0,1.005,-.28]} size={[.63,.024,.22]} color='#b9c1cc'/>
    <Box at={[.81,1.075,-.7]} size={[.18,.19,.18]} color={C.ink}/>
    <Agent at={[0,.07,.62]} index={index} reduced={reduced} working={markers&&chapter===1&&building} active={markers&&chapter===2&&index===0&&taskStage>0} celebrate={markers&&chapter===2&&index===0&&taskStage===3} hovered={hovered===index&&interactive} onHover={interactive?e=>{e.stopPropagation();onHover(index);}:undefined} onLeave={interactive?()=>onHover(null):undefined} onSelect={interactive?e=>{e.stopPropagation();onHover(hovered===index?null:index);}:undefined}/>
    {markers&&chapter===2&&index===0&&taskStage>0&&<group position={[.45,2.05,.6]}><mesh><sphereGeometry args={[.13,20,16]}/><meshStandardMaterial color="#fff0b0" emissive="#ffe298" emissiveIntensity={2}/></mesh><Box at={[0,-.16,0]} size={[.11,.09,.11]} color="#a2a9b4"/><pointLight color="#ffebad" intensity={1.3} distance={2}/></group>}
    {markers&&chapter===2&&index===0&&taskStage===3&&<Fireworks reduced={reduced}/>}
    {markers&&(interactive||(chapter===2&&index===0&&taskStage>0))&&<Html position={[0,2.12,-.05]} center zIndexRange={[8,0]}>
    <div className="agent-marker" onMouseEnter={()=>interactive&&onHover(index)} onMouseLeave={()=>interactive&&onHover(null)}>
    {<div className="agent-bubble">
    <div className="bubble-heading"><Icon name={chapter===1?(card?card.icon:'spark'):chapter===0?['spark','book','chat','upgrade'][index]:['people','money','trend','shield'][index]}/><strong>{chapter===1?(card?card.title:''):chapter===0?['Agent 建立與調度','知識庫與權限','多通道上線','自我升級'][index]:label}</strong>{chapter===1&&card&&<em className="bubble-code">{card.code}</em>}</div>
    {(hovered===index||chapter===2)&&<p>{chapter===1?(card?card.body:''):chapter===0?['建立角色 · 分配任務','授權資料 · 安全存取','Web · Teams · LINE','提出改進 · 人工審核'][index]:chapter===2?['等待任務','收到任務，開始處理','假單已處理！等待確認','已完成！假單已送出給主管'][taskStage]:['請假、出勤、政策查詢','報帳、發票、預算預警','業績、報價、客戶跟進','權限、部署、版本管理'][index]}</p>}
    </div>}</div></Html>}
  </group>;
}
function Packet({from,to,index,reduced}) {
  const ref=useRef();
  useFrame(({clock})=>{
    const t=reduced ? .5 : (clock.elapsedTime*.2+index*.23)%1;
    ref.current.position.set(THREE.MathUtils.lerp(from[0],to[0],t),.12,THREE.MathUtils.lerp(from[2],to[2],t));
  });
  return <mesh ref={ref}><sphereGeometry args={[.045,10,8]}/><meshBasicMaterial color='#8fa9cb'/></mesh>;
}
const destinations=[[-2.8,0,1.4],[2.65,0,1.4],[2.65,0,-1.8],[-2.8,0,-1.8]];
function Connection({to}) {
  const points=useMemo(()=>[new THREE.Vector3(0,.085,-.4),new THREE.Vector3(to[0],.085,-.4),new THREE.Vector3(to[0],.085,to[2])],[to]);
  const geometry=useMemo(()=>new THREE.BufferGeometry().setFromPoints(points),[points]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <line geometry={geometry}><lineBasicMaterial color='#94a3b8' transparent opacity={.6}/></line>;
}
function GeneratedApp({reduced,appSpec}) {
  const panel=useRef();
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=680;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='rgba(246,248,255,.72)';ctx.beginPath();ctx.roundRect(0,0,1000,680,48);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(0,0,1000,65);
    ctx.fillStyle='#536174';ctx.font='22px sans-serif';ctx.fillText('Office Power / Workspace App',30,42);
    ctx.fillStyle='#242f40';ctx.font='bold 40px sans-serif';ctx.fillText(appOptions[appSpec.kind].name+' App',50,135);
    ctx.font='20px sans-serif';ctx.fillStyle='#8190a3';ctx.fillText('已建立介面 · 已設定簽核流程 · 權限已就緒',50,180);
    const fields={leave:[['假別','特休'],['日期','9 / 16 — 9 / 17'],['代理人','王小明']],expense:[['費用類別','差旅費'],['金額','NT$ 3,200'],['憑證','發票已附上']],room:[['會議室','Meeting Room A'],['時段','14:00 — 15:00'],['參與人數','6 人']]};
    const rows=[...fields[appSpec.kind],['已接上系統',appOptions[appSpec.kind].links.length+' 個']];
    rows.forEach(([label,value],i)=>{
      const y=230+i*74;ctx.fillStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.roundRect(50,y,900,58,18);ctx.fill();
      ctx.font='22px sans-serif';ctx.fillStyle='#7b899c';ctx.fillText(label,70,y+37);
      ctx.fillStyle='#2d3d51';ctx.fillText(value,400,y+37);
    });
    ctx.fillStyle='#355b98';ctx.beginPath();ctx.roundRect(50,558,900,64,28);ctx.fill();ctx.fillStyle='#fff';ctx.font='24px sans-serif';ctx.fillText('提交申請     →',410,599);
    const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;
  },[appSpec.kind]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  useFrame((_,delta)=>{panel.current.scale.lerp(new THREE.Vector3(1,1,1),reduced?1:1-Math.exp(-delta*7));});
  return <group ref={panel} position={[0,2.5,1]} rotation={[-.12,.35,0]} scale={reduced?1:.01}>
    <RoundedBox args={[4.7,3.24,.12]} radius={.055} smoothness={4}><meshPhysicalMaterial color="#e6ecfa" transparent opacity={.28} roughness={.14} metalness={.1} clearcoat={1}/></RoundedBox>
    <mesh position={[0,0,.085]} renderOrder={2}><planeGeometry args={[4.58,3.12]}/><meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false}/></mesh>
  </group>;
}

function Office({chapter=0,reduced=false,markers=false,taskStage=0,built=false,appSpec,cards=[],hovered=null,onHover=()=>{}}) {
  return <group>
    {markers&&chapter===1&&built&&<GeneratedApp reduced={reduced} appSpec={appSpec}/>}
    <Box at={[0,-.22,0]} size={[10,.42,8]} color={C.floor} radius={.12}/>
    <Box at={[0,1.13,-3.85]} size={[10,2.6,.12]} color={C.wall}/>
    <Box at={[-4.85,1.13,0]} size={[.12,2.6,8]} color={C.wall}/>
    {[-3,-.1,2.8].map(x=><group key={x}><Box at={[x,1.47,-3.76]} size={[2.4,1.7,.035]} color='#d9e0e8' radius={.012}/><Box at={[x,1.47,-3.71]} size={[.025,1.7,.026]} color={C.metal}/><Box at={[x,1.47,-3.71]} size={[2.4,.025,.026]} color={C.metal}/></group>)}
    {[-3,-1,1,3].map(z=><Box key={z} at={[0,.002,z]} size={[9.8,.005,.009]} color='#c4cad3' radius={.001}/>)}
    {destinations.map((at,index)=><Workstation key={index} card={cards[index]} at={at} index={index} building={appSpec?.step===3&&!built} selected={chapter===0||chapter===3||chapter===2&&index===0||chapter===4&&index===3} chapter={chapter} taskStage={taskStage} hovered={hovered} onHover={onHover} reduced={reduced} markers={markers}/>)}
    <mesh position={[0,.37,-.4]} castShadow receiveShadow><cylinderGeometry args={[.75,.75,.74,48]}/><meshStandardMaterial color={C.shell} roughness={.32} metalness={.65}/></mesh>
    <mesh position={[0,.75,-.4]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.61,.015,8,48]}/><meshBasicMaterial color={C.light}/></mesh>
    <Box at={[0,1.1,-.4]} size={[.33,.52,.33]} color={C.ink} metal={.65}/>
    {[0,1,2,3].map(i=><Box key={i} at={[0,.94+i*.11,-.228]} size={[.23,.014,.009]} color={C.light}/>)}
    {false&&markers&&chapter===4&&<Html position={[0,1.88,-.4]} center distanceFactor={10} zIndexRange={[8,0]}><div className="scene-pin"><i className="pin-sheen"/><em className="pin-icon"><Icon name="shield"/></em><span className="pin-body"><b>AI Core</b><span className="pin-detail">權限 / 用量 / 執行紀錄</span></span></div></Html>}

    <Box at={[-4.25,.56,-.1]} size={[.55,1.12,1.5]} color={C.ink}/>
    {[0,1,2,3].map(i=><Box key={i} at={[-3.96,.3+i*.22,-.1]} size={[.01,.014,1.15]} color='#8398b6'/>)}
    {destinations.map((to,i)=><React.Fragment key={i}><Connection to={to}/><Packet from={[0,0,-.4]} to={to} index={i} reduced={reduced}/></React.Fragment>)}
  </group>;
}
function Lights() {
  return <><ambientLight intensity={.65}/><hemisphereLight args={['#e9eff8','#a7aab3',1]}/><directionalLight position={[-3,9,6]} intensity={2.4} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-normalBias={.03}/><directionalLight position={[8,4,-6]} color='#d5e3fa' intensity={1.4}/></>;
}
const openingPosition=[10,8,12], openingTarget=[0,.2,0];
function Mac({active,reduced}) {
  return <group>
    <Box at={[0,-.7,0]} size={[7.6,.14,3.4]} color='#9fa6af' radius={.055} metal={.7}/>
    {[-3.4,3.4].map(x=><Box key={x} at={[x,-1.95,0]} size={[.12,2.4,2.85]} color='#808892' metal={.75}/>)}
    <Box at={[0,1.5,0]} size={[5.4,3.5,.16]} color='#b9c0ca' radius={.11} metal={.8}/>
    <Box at={[0,1.65,.09]} size={[5.14,2.88,.025]} color='#22262d' radius={.055}/>
    <mesh position={[0,1.65,.11]}><planeGeometry args={[5.02,2.77]}/><meshBasicMaterial toneMapped={false}><RenderTexture attach="map" width={1280} height={706} frames={active&&!reduced?Infinity:1}><color attach="background" args={['#e6e8ed']}/><PerspectiveCamera makeDefault manual aspect={5.02/2.77} position={openingPosition} fov={36} onUpdate={c=>{c.lookAt(...openingTarget);c.updateProjectionMatrix();}}/><Lights/><Office reduced={reduced}/></RenderTexture></meshBasicMaterial></mesh>
    <Sphere at={[0,3.18,.1]} size={[.019,.019,.008]} color={C.ink}/>
    <Box at={[0,-.21,-.08]} size={[.65,.78,.11]} color='#a7afb9' metal={.85}/><Box at={[0,-.57,.22]} size={[1.35,.07,.85]} color='#a7afb9' metal={.85}/>
    <Box at={[-.3,-.58,1.06]} size={[2.14,.065,.6]} color='#d7dce3' radius={.035}/>
    {Array.from({length:12},(_,i)=><Box key={i} at={[-1.25+i*.17,-.538,1.06]} size={[.11,.014,.4]} color='#aab3c0' radius={.008}/>)}
    <Sphere at={[1.42,-.58,1.08]} size={[.2,.06,.27]} color='#e4e7ec'/>
    <Box at={[-3.05,-.42,-.15]} size={[.8,.44,.6]} color='#656d78'/><Box at={[-2.8,-.62,.86]} size={[.72,.035,.54]} color='#e5e8ec'/>
    <mesh position={[3.14,-.41,.58]} castShadow><cylinderGeometry args={[.19,.18,.38,24]}/><meshStandardMaterial color='#d0d6de' roughness={.3} metalness={.6}/></mesh>
    <group position={[0,-1.32,2.55]} scale={1.5}><Box at={[0,0,0]} size={[1.1,.16,1.05]} color='#414955' radius={.12}/><Box at={[0,.67,.41]} size={[1.08,1.22,.14]} color='#414955' radius={.13}/><Box at={[0,-.64,0]} size={[.08,1.1,.08]} color={C.metal} metal={.8}/><Box at={[0,-1.16,0]} size={[1.15,.08,.12]} color={C.ink}/><Box at={[0,-1.16,0]} size={[.12,.08,1.15]} color={C.ink}/></group>
  </group>;
}
// Piecewise smooth interpolation has identical endpoints at every chapter boundary.
const cameraStops=[
  {p:openingPosition,t:openingTarget},
  {p:[8,7,12],t:[0,.8,0]},
  {p:[8,7,12],t:[0,.8,0]},
  {p:[8,7.2,11],t:[0,.4,0]},
  {p:[7,8,10],t:[-.4,.3,-.5]},
  {p:[9,8,12],t:[0,.3,0]},
];
export function sampleCamera(progress) {
  const x=Math.max(0,Math.min(1,progress))*5;
  const index=Math.min(4,Math.floor(x));
  const f=THREE.MathUtils.smoothstep(x-index,0,1);
  return {
    position:cameraStops[index].p.map((v,i)=>THREE.MathUtils.lerp(v,cameraStops[index+1].p[i],f)),
    target:cameraStops[index].t.map((v,i)=>THREE.MathUtils.lerp(v,cameraStops[index+1].t[i],f)),
  };
}
function World({progress,reduced,chapter,taskStage,built,appSpec,cards,hovered,onHover,phase,onReady,onDone}) {
  const desk=useRef(),room=useRef(),shift=useRef(1),arrival=useRef(),flight=useRef(0),push=useRef(0),focus=useRef(0),complete=useRef(false),ready=useRef(false);
  const {camera,size,invalidate}=useThree();
  const target=useMemo(()=>new THREE.Vector3(),[]);
  const desired=useMemo(()=>new THREE.Vector3(),[]);
  const focusEye=useMemo(()=>new THREE.Vector3(-.05,3.1,6.35),[]);
  const focusAt=useMemo(()=>new THREE.Vector3(-2.8,1.3,1.95),[]);
  useEffect(()=>{if(phase!=='flight'){flight.current=0;complete.current=false;}if(phase!=='tour')push.current=0;invalidate();},[phase,chapter,taskStage,size,reduced,invalidate]);
  useFrame((state,delta)=>{
    if(!ready.current){ready.current=true;requestAnimationFrame(onReady);}
    const mobile=size.width<700;
    const tour=phase==='tour';
    desk.current.visible=!tour;room.current.visible=tour;
    if(tour) {
      const shot=sampleCamera(reduced ? (chapter+.5)/5 : progress.current);
      desired.fromArray(shot.position);target.fromArray(shot.target);
      const finale=THREE.MathUtils.smoothstep(reduced?chapter/5:progress.current,.76,.84);
      desired.sub(target).multiplyScalar(1+finale*1.15).add(target);
      if(mobile)desired.sub(target).multiplyScalar(1.35).add(target);
      else if(size.width<1050)desired.sub(target).multiplyScalar(1.32).add(target);
      const closing=chapter===2&&taskStage>=3;
      focus.current=reduced?(closing?1:0):THREE.MathUtils.clamp(focus.current+(closing?1:-1)*delta/.9,0,1);
      if(focus.current>0){
        const near=THREE.MathUtils.smoothstep(focus.current,0,1);
        desired.lerp(focusEye,near);target.lerp(focusAt,near);
        if(mobile)desired.sub(target).multiplyScalar(1+near*.45).add(target);
      }
    } else {
      if(phase==='flight')flight.current=Math.min(1,flight.current+Math.min(delta,.05)/2.85);
      const t=flight.current;
      const first=THREE.MathUtils.smoothstep(t,.42,.85);
      const second=THREE.MathUtils.smoothstep(t,.84,1);
      desired.set(THREE.MathUtils.lerp(9.8,0,first),THREE.MathUtils.lerp(5.9,1.65,first),THREE.MathUtils.lerp(mobile?24.5:16,7.2,first));
      target.set(0,THREE.MathUtils.lerp(-.15,1.65,first),0);
      // End at the physical screen plane's exact vertical field of view.
      const fit=2.77/(2*Math.tan(THREE.MathUtils.degToRad(36/2)));
      desired.z=THREE.MathUtils.lerp(desired.z,fit+.11,second);
      if(t>=1&&!complete.current){complete.current=true;onDone();}
    }
    if(arrival.current){
      const t=flight.current;
      arrival.current.visible=phase==='flight'||phase==='wide';
      const walk=THREE.MathUtils.smoothstep(t,0,.30);
      const hop=THREE.MathUtils.smoothstep(t,.30,.44);
      // Walk up beside the chair, then arc onto the seat.
      arrival.current.position.set(
        THREE.MathUtils.lerp(THREE.MathUtils.lerp(11,1.55,walk),0,hop),
        THREE.MathUtils.lerp(-3.10,-1.40,hop)+Math.sin(hop*Math.PI)*1.25+Math.sin(t*95)*.07*(1-walk),
        THREE.MathUtils.lerp(2.9,2.47,hop));
      arrival.current.rotation.y=THREE.MathUtils.lerp(Math.PI/2,0,hop);
    }
    camera.position.copy(desired);camera.lookAt(target);
    // Keep one continuous camera, shifting the composition toward the right.
    if(tour) {
      push.current=reduced ? 1 : Math.min(1,push.current+Math.min(delta,.05)/.9);
      // Chapters that present the office centred ease the side-shift away.
      shift.current=THREE.MathUtils.lerp(shift.current,(chapter===1||chapter===3||chapter===4)?0:1,1-Math.exp(-delta*4));
      const offset = mobile ? 0 : (1-THREE.MathUtils.smoothstep(reduced?chapter/5:progress.current,.76,.84))*THREE.MathUtils.smoothstep(push.current,0,1)*shift.current;
      camera.setViewOffset(size.width,size.height,-size.width*(size.width<1050?.12:.2)*offset,0,size.width,size.height);
    } else {
      // The desk opens on the right; the frame recenters as the camera flies into the screen.
      const aside=1-THREE.MathUtils.smoothstep(flight.current,.42,.85);
      if(mobile)camera.setViewOffset(size.width,size.height,0,-size.height*.15*aside,size.width,size.height);
      else camera.setViewOffset(size.width,size.height,-size.width*.19*aside,-size.height*.05*aside,size.width,size.height);
    }
  });
  return <><color attach="background" args={['#e6e8ed']}/><Lights/><group ref={desk}><Mac active={phase!=='tour'} reduced={reduced}/><group ref={arrival} scale={1.45}><Agent at={[0,0,0]} reduced={reduced} arrivalProgress={flight}/></group><mesh rotation={[-Math.PI/2,0,0]} position={[0,-3.2,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color='#e6e8ed' roughness={.75}/></mesh></group><group ref={room} visible={false}><Office cards={cards} chapter={chapter} built={built} appSpec={appSpec} taskStage={taskStage} hovered={hovered} onHover={onHover} reduced={reduced} markers={phase==='tour'}/><mesh rotation={[-Math.PI/2,0,0]} position={[0,-.46,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color='#e6e8ed' roughness={.75}/></mesh></group></>;
}
export default function OfficeScene(props) {
  return <Canvas shadows frameloop={props.visible&&!props.reduced?'always':'demand'} dpr={[1,1.5]} camera={{position:[13,8,22],fov:36,near:.05,far:250}} gl={{antialias:true,powerPreference:'high-performance'}}><World {...props}/></Canvas>;
}
