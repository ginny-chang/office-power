import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, RenderTexture, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import { appOptions } from './AppBuilder';
import Icon from './icons';
import { createRobotShell } from './robot-shell';

// All departments share materials and world coordinates. Only the camera travels.
const C = { shell: '#e7eefb', metal: '#a6b8d4', ink: '#203c86', floor: '#a8bfe5', wall: '#dce7f8', light: '#73caff' };
function Box({ at=[0,0,0], size=[1,1,1], color=C.shell, radius=.035, metal=.15, ...props }) {
  return <RoundedBox position={at} args={size} radius={Math.min(radius,...size.map(v=>v*.45))} smoothness={3} castShadow receiveShadow {...props}><meshStandardMaterial color={color} roughness={.48} metalness={metal}/></RoundedBox>;
}
function Sphere({at,size,color=C.metal}) {
  return <mesh position={at} scale={size} castShadow><sphereGeometry args={[1,20,12]}/><meshStandardMaterial color={color} roughness={.45} metalness={.3}/></mesh>;
}
function Screen({at,size=[.95,.58],variant=0,alarm=false}) {
  const texture = useMemo(() => {
    const canvas=document.createElement('canvas'); canvas.width=512;canvas.height=320;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#19212d';ctx.fillRect(0,0,512,320);
    ctx.fillStyle='#8999ac';ctx.font='14px sans-serif';ctx.fillText(['PEOPLE / 01','FINANCE / 02','SALES / 03','GOVERNANCE / 04'][variant],26,35);
    ctx.fillStyle='#e4eaf0';ctx.font='24px sans-serif';ctx.fillText(['Leave requests','Expense review','Account activity','Access control'][variant],26,80);
    for(let i=0;i<4;i++){ctx.fillStyle='#2c3746';ctx.fillRect(26,110+i*40,460,28);ctx.fillStyle='#93a8c3';ctx.fillRect(40,120+i*40,130+i*28,6);ctx.fillStyle='#c5d2e1';ctx.fillRect(390,118+i*40,65,10);}
    if(alarm){ctx.fillStyle='#c71936';ctx.fillRect(0,0,512,320);ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='bold 72px sans-serif';ctx.fillText('ERROR',256,157);ctx.font='22px sans-serif';ctx.fillText('BUDGET LIMIT REACHED',256,210);ctx.font='16px sans-serif';ctx.fillText('AGENT PAUSED',256,262);}
    const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;
  },[variant,alarm]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  return <mesh position={at}><planeGeometry args={size}/><meshBasicMaterial map={texture} toneMapped={false}/></mesh>;
}
function RobotShell() {
  const parts=useMemo(createRobotShell,[]);
  useEffect(()=>()=>Object.values(parts).forEach(geometry=>geometry.dispose()),[parts]);
  return <group position={[0,.73,0]}>
    <mesh geometry={parts.head} castShadow receiveShadow><meshStandardMaterial color="#f1f2f3" roughness={.48} metalness={.12}/></mesh>
    <mesh geometry={parts.torso} castShadow receiveShadow><meshStandardMaterial color="#f1f2f3" roughness={.48} metalness={.12}/></mesh>
    <mesh geometry={parts.inset}><meshStandardMaterial color="#bcc1c7" roughness={.65} metalness={.08}/></mesh>
  </group>;
}
function Agent({at,index=0,reduced,walking=false,working=false,waving=false,seated=false,arrivalProgress,guide=false,journey,panelGaze,gazeActive=false,panic=false,celebrate=false,active=false,hovered=false,onHover,onLeave,onSelect}) {
  const body=useRef(), arm=useRef(),leftArm=useRef(),feet=useRef([]),eyes=useRef([]),cursor=useRef([0,0]),celebration=useRef(0);
  useEffect(()=>{if(!guide||!gazeActive)return;const move=e=>{cursor.current=[(e.clientX/innerWidth-.5)*2,(e.clientY/innerHeight-.5)*2];};const reset=()=>{cursor.current=[0,0];};window.addEventListener('pointermove',move);window.addEventListener('blur',reset);return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('blur',reset);};},[guide]);
  useEffect(()=>{celebration.current=0;},[celebrate]);
  useFrame(({clock},delta)=>{
    if(arrivalProgress){
      const t=arrivalProgress.current,sit=THREE.MathUtils.smoothstep(t,.43,.58);
      feet.current.forEach((foot,i)=>{
        foot.position.z=THREE.MathUtils.lerp(.015,.3,sit)+Math.sin(t*90+i*Math.PI)*.12*(1-sit);
        foot.position.y=THREE.MathUtils.lerp(.16,.3,sit);
      });
    }
    const travel=journey?.current??0;
    const gaze=panelGaze?.current??cursor.current;
    const facing=guide ? (travel>0?Math.PI:reduced?0:gaze[0]*.7) : panic||waving||hovered||active ? .65 : Math.PI;
    body.current.rotation.y=reduced ? facing : THREE.MathUtils.lerp(body.current.rotation.y,facing,.09);
    const blinkTime=(clock.elapsedTime+index*.7)%4.6;
    const blink=reduced?1:blinkTime<.18?Math.max(.07,Math.abs(blinkTime-.09)/.09):1;
    eyes.current.forEach((eye,i)=>{eye.scale.y=blink;eye.position.x=(i===0?-.115:.115)+(guide&&!reduced&&travel===0?gaze[0]*.065:0);eye.position.y=.9+(guide&&!reduced&&travel===0?-gaze[1]*.04:0);});
    body.current.rotation.x=THREE.MathUtils.lerp(body.current.rotation.x,guide&&!reduced&&travel===0?gaze[1]*.22:0,1-Math.exp(-delta*9));
    arm.current.position.y=panic?.96:.7;
    leftArm.current.position.y=panic?.96:.61;
    arm.current.scale.y=leftArm.current.scale.y=panic?1.5:1;
    leftArm.current.rotation.z=-.45;
    body.current.rotation.z=0;
    if(panic){
      const t=reduced?0:clock.elapsedTime*8+index*.7;
      arm.current.rotation.set(Math.sin(t)*.45,0,2.65+Math.sin(t)*.5);
      leftArm.current.rotation.set(Math.cos(t)*.45,0,-2.65+Math.cos(t)*.5);
      body.current.rotation.x=-.18;
      body.current.rotation.z=reduced?0:Math.sin(t*.65)*.07;
      body.current.position.y=at[1]+(reduced?0:Math.abs(Math.sin(t*.55))*.14);
      eyes.current.forEach(eye=>eye.scale.y=1.45);
      return;
    }
    if(reduced) { arm.current.rotation.set(0,0,hovered?-2.2:0); leftArm.current.rotation.x=-.8; body.current.position.y=at[1]; return; }
    const t=clock.elapsedTime+index*1.4;
    body.current.position.y=at[1]+Math.sin(t*1.8)*.018;
    if(celebrate){celebration.current=Math.min(1,celebration.current+delta/.62);body.current.position.y=at[1]+Math.sin(celebration.current*Math.PI)*.95;body.current.rotation.y=.2+Math.PI*2*THREE.MathUtils.smoothstep(celebration.current,0,1);}
    arm.current.rotation.z=hovered||waving ? -2.2+Math.sin(t*9)*.35 : Math.sin(t*(working?18:4))*(working?.24:.08);
    arm.current.rotation.x=hovered||waving?0:-.8+Math.sin(t*(working?18:4))*(working?.35:.1);
    leftArm.current.rotation.x=-.8+Math.sin(t*(working?18:4)+Math.PI)*(working?.35:.1);
    if(arrivalProgress){
      const p=arrivalProgress.current;
      const pushing=THREE.MathUtils.smoothstep(p,.23,.29)*(1-THREE.MathUtils.smoothstep(p,.39,.44));
      arm.current.rotation.x=THREE.MathUtils.lerp(arm.current.rotation.x,-1.5,pushing);
      leftArm.current.rotation.x=THREE.MathUtils.lerp(leftArm.current.rotation.x,-1.5,pushing);
    }
    if(guide&&travel>0&&travel<1){
      feet.current.forEach((foot,i)=>{foot.position.z=.015+Math.sin(clock.elapsedTime*15+i*Math.PI)*.15;});
      body.current.position.y=at[1]+Math.abs(Math.sin(clock.elapsedTime*15))*.035;
      arm.current.rotation.x=Math.sin(clock.elapsedTime*15)*.4;
    }
    if(walking){body.current.position.x=at[0]+Math.sin(t*.22)*.55;body.current.rotation.y=Math.sin(t*.22)*.25;}
  });
  return <group ref={body} position={at} rotation={[0,Math.PI,0]} scale={.92} onPointerOver={onHover} onPointerOut={onLeave} onClick={onSelect}>
    <RobotShell/>
    {[-.29,.29].map((x,i)=><group key={x} ref={el=>feet.current[i]=el} position={[x,seated?.3:.16,seated?.28:.015]}><Box size={[.46,.32,.66]} radius={.13} color="#f1f2f3"/></group>)}
    <RoundedBox position={[0,.97,.335]} args={[.79,.76,.22]} radius={.24} smoothness={6} castShadow><meshPhysicalMaterial color="#101116" roughness={.16} metalness={.2} clearcoat={1} clearcoatRoughness={.08}/></RoundedBox>
    {[-.115,.115].map((x,i)=><mesh key={x} ref={el=>eyes.current[i]=el} position={[x,.9,.465]} scale={[1,1,.22]}><capsuleGeometry args={[.056,.135,6,16]}/><meshBasicMaterial color="#f7f7fa"/></mesh>)}
    {panic&&<mesh position={[0,.69,.465]} scale={[1,1,.2]}><sphereGeometry args={[.065,16,12]}/><meshBasicMaterial color="#fff"/></mesh>}
    <Box at={[0,.41,.36]} size={[.35,.115,.019]} radius={.052} color="#9ca3aa"/>
    <Box at={[0,.41,.371]} size={[.326,.096,.016]} radius={.045} color="#e2e5e8"/>
    {[-1,1].map(side=><group key={side} position={[side*.36,1.33,0]} rotation={[0,0,side*-.4]}>
      <mesh position={[0,.055,0]}><cylinderGeometry args={[.14,.15,.1,32]}/><meshStandardMaterial color="#e5e7e9" roughness={.35}/></mesh>
      <mesh position={[0,.13,0]}><cylinderGeometry args={[.1,.1,.05,32]}/><meshStandardMaterial color="#777d84" metalness={.8} roughness={.25}/></mesh>
      <mesh position={[0,.27,0]} castShadow><cylinderGeometry args={[.13,.13,.24,32]}/><meshStandardMaterial color="#f0f1f3" roughness={.35}/></mesh>
    </group>)}
    <group ref={arm} position={[.53,.7,0]}><Sphere at={[0,-.14,0]} size={[.105,.25,.14]} color="#eef0f2"/></group><group ref={leftArm} position={[-.53,.61,0]} rotation={[-.8,0,-.45]}><Sphere at={[0,-.14,0]} size={[.105,.25,.14]} color="#eef0f2"/></group>
  </group>;
}
function Fireworks({reduced}) {
 const group=useRef(),elapsed=useRef(0);
 const particles=useMemo(()=>Array.from({length:32},(_,i)=>{const a=i/32*Math.PI*2;return [Math.cos(a),Math.sin(a),Math.sin(i*2.4)*.5];}),[]);
 useFrame((_,delta)=>{if(reduced)return;elapsed.current+=delta;const t=Math.max(0,elapsed.current-.4);group.current.visible=t<1.5;group.current.children.forEach((mesh,i)=>{const v=particles[i];mesh.position.set(v[0]*t*1.5,v[1]*t*1.5-t*t*.4,v[2]*t);mesh.scale.setScalar(Math.max(0,1-t/1.5));});});
 if(reduced)return null;
 return <group ref={group} position={[.5,2.4,.6]}>{particles.map((_,i)=><mesh key={i}><sphereGeometry args={[.035,6,4]}/><meshBasicMaterial color={i%3===0?'#f3cf84':i%3===1?'#b1c7ea':'#f4f7ff'}/></mesh>)}</group>;
}
function Workstation({budgetAlarm,at,index,selected,reduced,markers,chapter,taskStage,hovered,onHover,building,waving,card,guideMotion}) {
  const label=['HR Agent','財務 Agent','業務 Agent','IT Agent'][index];
  const worker=useRef();
  useFrame(()=>{if(worker.current)worker.current.visible=index!==0||!guideMotion||guideMotion.current>=.999;});
  const interactive=markers&&chapter===3;
  return <group position={at}>
    <Box at={[0,.025,0]} size={[2.7,.02,2.65]} color='#cdd3db' radius={.09}/>
    <Box at={[0,.93,-.55]} size={[2.35,.16,1.18]} color='#e6e9ed' radius={.045}/>
    <Box at={[-.87,.46,-.55]} size={[.5,.86,1.02]} color="#b9bec5" radius={.04}/>
    {[.25,.5,.75].map(y=><group key={y}><Box at={[-.87,y,-.026]} size={[.42,.008,.014]} color="#929aa4"/><Box at={[-.87,y+.1,-.016]} size={[.16,.025,.02]} color="#777f88"/></group>)}
    <Box at={[.99,.46,-.55]} size={[.08,.86,1.02]} color="#a5abb3" metal={.6}/>
    <Box at={[0,1.43,-.74]} size={[1.2,.82,.055]} color="#c5d5e9" radius={.045} metal={.8}/>
    <Box at={[0,1.48,-.703]} size={[1.12,.65,.016]} color="#f0f5fc" radius={.025}/><Screen at={[0,1.48,-.692]} size={[1.04,.58]} variant={index} alarm={budgetAlarm}/>
    <Sphere at={[0,1.826,-.702]} size={[.012,.012,.006]} color={C.ink}/>
    <Box at={[0,1.087,-.702]} size={[1.12,.075,.015]} color="#aec4e4" radius={.012}/>
    <Box at={[0,1.07,-.74]} size={[.05,.25,.06]} color={C.metal}/>
    <Box at={[0,1,-.74]} size={[.38,.035,.28]} color={C.metal}/>
    <Box at={[0,1.005,-.28]} size={[.78,.065,.3]} color='#b9c1cc'/>
    {Array.from({length:10},(_,i)=><Box key={i} at={[-.335+i*.074,1.043,-.28]} size={[.048,.012,.19]} color="#8f97a1" radius={.004}/>)}
    <Sphere at={[.64,1.045,-.28]} size={[.09,.035,.13]} color="#cbd0d6"/>
    <Box at={[.91,1.015,-.83]} size={[.3,.045,.23]} color="#525a64"/>
    <Box at={[.91,1.27,-.83]} size={[.025,.5,.025]} color="#77808b"/>
    <Box at={[.81,1.52,-.78]} size={[.35,.08,.2]} color="#626b76" radius={.035}/>
    <group ref={worker}><Agent panic={budgetAlarm} at={[0,.07,.62]} index={index} reduced={reduced} working={markers&&chapter===1&&index===0&&building} waving={markers&&chapter===1&&index===0&&waving} active={markers&&chapter===2&&index===0&&taskStage>0} celebrate={markers&&chapter===2&&index===0&&taskStage===3} hovered={hovered===index&&interactive} onHover={interactive?e=>{e.stopPropagation();onHover(index);}:undefined} onLeave={interactive?()=>onHover(null):undefined} onSelect={interactive?e=>{e.stopPropagation();onHover(hovered===index?null:index);}:undefined}/></group>
    {markers&&chapter===2&&index===0&&taskStage>0&&<group position={[.45,2.05,.6]}><mesh><sphereGeometry args={[.13,20,16]}/><meshStandardMaterial color="#fff0b0" emissive="#ffe298" emissiveIntensity={2}/></mesh><Box at={[0,-.16,0]} size={[.11,.09,.11]} color="#a2a9b4"/><pointLight color="#ffebad" intensity={1.3} distance={2}/></group>}
    {markers&&chapter===2&&index===0&&taskStage===3&&<Fireworks reduced={reduced}/>}
    {markers&&(interactive||(chapter===2&&index===0&&taskStage>0))&&<Html position={[0,2.12,-.05]} center zIndexRange={[8,0]}>
    <div className="agent-marker" onMouseEnter={()=>interactive&&onHover(index)} onMouseLeave={()=>interactive&&onHover(null)}>
    {<div className="agent-bubble">
    <div className="bubble-heading"><Icon name={chapter===0?['spark','book','chat','upgrade'][index]:['people','money','trend','shield'][index]}/><strong>{chapter===0?['Agent 建立與調度','知識庫與權限','多通道上線','自我升級'][index]:label}</strong></div>
    {(hovered===index||chapter===2)&&<p>{chapter===0?['建立角色 · 分配任務','授權資料 · 安全存取','Web · Teams · LINE','提出改進 · 人工審核'][index]:chapter===2?['等待任務','收到任務，開始處理','假單已處理！等待確認','已完成！假單已送出給主管'][taskStage]:['請假、出勤、政策查詢','報帳、發票、預算預警','業績、報價、客戶跟進','權限、部署、版本管理'][index]}</p>}
    </div>}</div></Html>}
  </group>;
}
const destinations=[[-2.8,0,1.4],[2.65,0,1.4],[2.65,0,-1.8],[-2.8,0,-1.8]];
function Circuit({to,index,reduced}) {
  const heads=useRef([]);
  const paths=useMemo(()=>[-.13,0,.13].map((offset)=>{
    const s=Math.sign(to[0]),z=Math.sign(to[2]+.4);
    const path=new THREE.CurvePath();
    const points=[[s*.55,.072,-.4+offset],[s*1.05,.072,-.4+offset],[s*1.45,.072,-.4+offset+z*.4],[to[0]+offset,.072,-.4+offset+z*.4],[to[0]+offset,.072,to[2]+.8]].map(p=>new THREE.Vector3(...p));
    for(let i=1;i<points.length;i++)path.add(new THREE.LineCurve3(points[i-1],points[i]));
    return path;
  }),[to]);
    useFrame(({clock})=>heads.current.forEach((head,i)=>{if(head)head.position.copy(paths[i].getPoint(reduced?.6:(clock.elapsedTime*.3+index*.16+i*.12)%1));}));
  return <group>{paths.map((path,i)=><React.Fragment key={i}>
    <mesh><tubeGeometry args={[path,40,.014,5,false]}/><meshBasicMaterial color="#3378ee" transparent opacity={.85}/></mesh>
    <mesh><tubeGeometry args={[path,40,.04,5,false]}/><meshBasicMaterial color="#69baff" transparent opacity={.14} depthWrite={false}/></mesh>
    <mesh ref={el=>heads.current[i]=el}><sphereGeometry args={[.037,8,6]}/><meshBasicMaterial color="#b6edff" toneMapped={false}/></mesh>
    <mesh position={path.getPoint(1)} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.037,.06,12]}/><meshBasicMaterial color="#2374e8"/></mesh>
  </React.Fragment>)}</group>;
}
function GeneratedApp({reduced,appSpec}) {
  const panel=useRef();
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=680;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='rgba(239,246,255,.97)';ctx.beginPath();ctx.roundRect(0,0,1000,680,48);ctx.fill();
    ctx.fillStyle='#d5e4fa';ctx.fillRect(0,0,1000,65);
    ['#ed8c95','#ebc376','#7cbea7'].forEach((color,i)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(30+i*26,32,7,0,Math.PI*2);ctx.fill();});
    ctx.fillStyle='#405d86';ctx.font='18px sans-serif';ctx.fillText('Office Power / Workspace App',132,40);
    ctx.fillStyle='#2867cb';ctx.font='bold 16px sans-serif';ctx.fillText('●  LIVE PREVIEW',805,40);
    ctx.fillStyle='#242f40';ctx.font='bold 40px sans-serif';ctx.fillText(appOptions[appSpec.kind].name+' App',50,135);
    ctx.font='20px sans-serif';ctx.fillStyle='#8190a3';ctx.fillText('已建立介面 · 已設定簽核流程 · 權限已就緒',50,180);
    const fields={leave:[['假別','特休'],['日期','9 / 16 — 9 / 17'],['代理人','王小明']],expense:[['費用類別','差旅費'],['金額','NT$ 3,200'],['憑證','發票已附上']],room:[['會議室','Meeting Room A'],['時段','14:00 — 15:00'],['參與人數','6 人']]};
    const rows=[...fields[appSpec.kind],['已接上系統',appOptions[appSpec.kind].links.length+' 個']];
    rows.forEach(([label,value],i)=>{
      const y=230+i*74;ctx.fillStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.roundRect(50,y,900,58,18);ctx.fill();
      ctx.font='22px sans-serif';ctx.fillStyle='#7b899c';ctx.fillText(label,70,y+37);
      ctx.fillStyle='#2d3d51';ctx.fillText(value,400,y+37);
    });
    ctx.fillStyle='#2467dc';ctx.beginPath();ctx.roundRect(50,558,900,64,28);ctx.fill();ctx.fillStyle='#fff';ctx.font='24px sans-serif';ctx.fillText('提交申請     →',410,599);
    const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;
  },[appSpec.kind]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  useFrame(({camera,clock},delta)=>{
    const scale=reduced?1:THREE.MathUtils.lerp(panel.current.scale.x,1,1-Math.exp(-delta*7));
    panel.current.scale.setScalar(scale);
    panel.current.quaternion.copy(camera.quaternion);
    panel.current.position.y=3.25+(reduced?0:Math.sin(clock.elapsedTime*1.2)*.045);
  });
  return <group ref={panel} position={[1.2,3.25,1.8]} scale={reduced?1:.01}>
    <RoundedBox args={[4.85,3.39,.12]} radius={.12} smoothness={4} renderOrder={20}><meshPhysicalMaterial color="#90b7f3" transparent opacity={.8} roughness={.2} metalness={.45} clearcoat={1} depthTest={false}/></RoundedBox>
    <mesh position={[0,0,.085]} renderOrder={21}><planeGeometry args={[4.58,3.12]}/><meshBasicMaterial map={texture} transparent depthWrite={false} depthTest={false} toneMapped={false}/></mesh>
    <Html position={[0,-1.88,.1]} center zIndexRange={[6,0]}><span className="app-preview-label">✓ 介面、流程與權限已就緒 · 互動示範</span></Html>
  </group>;
}

function Office({budgetAlarm=false,chapter=0,reduced=false,markers=false,taskStage=0,built=false,appSpec,buildStage,guideMotion,hovered=null,onHover=()=>{}}) {
  return <group>
    {markers&&chapter===1&&built&&<GeneratedApp reduced={reduced} appSpec={appSpec}/>}
    <Box at={[0,-.22,0]} size={[10,.42,8]} color={C.floor} radius={.12}/>
    <Box at={[0,1.13,-3.85]} size={[10,2.6,.12]} color={C.wall}/>
    <Box at={[-4.85,1.13,0]} size={[.12,2.6,8]} color={C.wall}/>
    {[-3,-.1,2.8].map(x=><group key={x}><Box at={[x,1.47,-3.76]} size={[2.4,1.7,.035]} color='#d9e0e8' radius={.012}/><Box at={[x,1.47,-3.71]} size={[.025,1.7,.026]} color={C.metal}/><Box at={[x,1.47,-3.71]} size={[2.4,.025,.026]} color={C.metal}/></group>)}
    {[-3,-1,1,3].map(z=><Box key={z} at={[0,.002,z]} size={[9.8,.005,.009]} color='#c4cad3' radius={.001}/>)}
    {destinations.map((at,index)=><Workstation budgetAlarm={budgetAlarm} key={index} guideMotion={guideMotion} at={at} index={index} building={buildStage==='typing'} waving={buildStage==='wave'} selected={chapter===0||chapter===3||chapter===2&&index===0||chapter===4&&index===3} chapter={chapter} taskStage={taskStage} hovered={hovered} onHover={onHover} reduced={reduced} markers={markers}/>)}
    {chapter===4&&<BudgetBeacon alarm={budgetAlarm} reduced={reduced}/>}
    <mesh position={[0,.37,-.4]} castShadow receiveShadow><cylinderGeometry args={[.75,.75,.74,48]}/><meshStandardMaterial color={C.shell} roughness={.32} metalness={.65}/></mesh>
    <mesh position={[0,.75,-.4]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.61,.015,8,48]}/><meshBasicMaterial color={C.light}/></mesh>
    <Box at={[0,1.1,-.4]} size={[.33,.52,.33]} color={C.ink} metal={.65}/>
    {[0,1,2,3].map(i=><Box key={i} at={[0,.94+i*.11,-.228]} size={[.23,.014,.009]} color={C.light}/>)}
    {false&&markers&&chapter===4&&<Html position={[0,1.88,-.4]} center distanceFactor={10} zIndexRange={[8,0]}><div className="scene-pin"><i className="pin-sheen"/><em className="pin-icon"><Icon name="shield"/></em><span className="pin-body"><b>AI Core</b><span className="pin-detail">權限 / 用量 / 執行紀錄</span></span></div></Html>}

    <Box at={[-4.25,.56,-.1]} size={[.55,1.12,1.5]} color={C.ink}/>
    {[0,1,2,3].map(i=><Box key={i} at={[-3.96,.3+i*.22,-.1]} size={[.01,.014,1.15]} color='#b8bec7'/>)}
    {destinations.map((to,i)=><Circuit key={i} to={to} index={i} reduced={reduced}/>)}
  </group>;
}
function BudgetBeacon({alarm,reduced}) {
  const rotor=useRef();
  useFrame(({clock})=>{rotor.current.rotation.y=reduced?0:clock.elapsedTime*(alarm?5:0);});
  return <group position={[0,2.05,-.4]}>
    <mesh position={[0,-.28,0]}><cylinderGeometry args={[.46,.51,.17,40]}/><meshStandardMaterial color="#8798af" metalness={.8} roughness={.24}/></mesh>
    <mesh><sphereGeometry args={[.43,32,20,0,Math.PI*2,0,Math.PI/2]}/><meshPhysicalMaterial color={alarm?'#f52643':'#a9c5e9'} transparent opacity={.62} roughness={.13} metalness={.15} depthWrite={false}/></mesh>
    <mesh position={[0,-.12,0]}><cylinderGeometry args={[.43,.43,.24,32,1,true]}/><meshPhysicalMaterial color={alarm?'#e82240':'#a9c5e9'} transparent opacity={.5} depthWrite={false}/></mesh>
    <group ref={rotor}>
      <mesh position={[0,.02,0]}><boxGeometry args={[.5,.28,.13]}/><meshStandardMaterial color={alarm?'#ff5460':'#7598cc'} emissive={alarm?'#ff1635':'#000000'} emissiveIntensity={alarm?2:0}/></mesh>
      {alarm&&<><pointLight color="#ff183b" intensity={6} distance={7}/><mesh position={[.8,.03,0]} rotation={[0,0,-Math.PI/2]}><coneGeometry args={[.65,1.5,24,1,true]}/><meshBasicMaterial color="#ff2444" transparent opacity={.12} depthWrite={false} side={THREE.DoubleSide}/></mesh></>}
    </group>
    {alarm&&<Html center position={[0,.82,0]} zIndexRange={[5,0]}><span style={{whiteSpace:'nowrap',color:'#b41230',background:'#fff0f3',padding:'7px 12px',borderRadius:8,fontSize:12,fontWeight:700}}>！預算達限 · ERROR</span></Html>}
  </group>;
}
function Lights() {
  return <><ambientLight intensity={.65}/><hemisphereLight args={['#e9eff8','#a7aab3',1]}/><directionalLight position={[-3,9,6]} intensity={2.4} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-normalBias={.03}/><directionalLight position={[8,4,-6]} color='#d5e3fa' intensity={1.4}/></>;
}
const openingPosition=[10,8,12], openingTarget=[0,.2,0];
function Mac({active,reduced,flight}) {
  const chair=useRef();
  useFrame(()=>{
    const pull=THREE.MathUtils.smoothstep(flight.current,.27,.42);
    chair.current.position.z=2.55+pull*.75;
  });
  return <group>
    <Box at={[0,-.7,0]} size={[7.6,.14,3.4]} color='#9fa6af' radius={.055} metal={.7}/>
    {[-3.4,3.4].map(x=><Box key={x} at={[x,-1.95,0]} size={[.12,2.4,2.85]} color='#808892' metal={.75}/>)}
    <Box at={[0,1.5,0]} size={[5.4,3.5,.16]} color='#b9c0ca' radius={.11} metal={.8}/>
    <Box at={[0,1.65,.09]} size={[5.14,2.88,.025]} color='#22262d' radius={.055}/>
    <mesh position={[0,1.65,.11]}><planeGeometry args={[5.02,2.77]}/><meshBasicMaterial toneMapped={false}><RenderTexture attach="map" width={1280} height={706} frames={active&&!reduced?Infinity:1}><color attach="background" args={['#e6e8ed']}/><PerspectiveCamera makeDefault manual aspect={5.02/2.77} position={[0,1.45,6.5]} fov={36} onUpdate={c=>{c.lookAt(0,1.05,0);c.updateProjectionMatrix();}}/><Lights/><group scale={1.3}><Agent at={[0,0,0]} reduced={reduced} guide/></group><mesh position={[0,-.06,0]} receiveShadow><cylinderGeometry args={[1.1,1.13,.12,64]}/><meshStandardMaterial color="#dce0e6" roughness={.5}/></mesh></RenderTexture></meshBasicMaterial></mesh>
    <Sphere at={[0,3.18,.1]} size={[.019,.019,.008]} color={C.ink}/>
    <Box at={[0,-.21,-.08]} size={[.65,.78,.11]} color='#a7afb9' metal={.85}/><Box at={[0,-.57,.22]} size={[1.35,.07,.85]} color='#a7afb9' metal={.85}/>
    <Box at={[-.3,-.58,1.06]} size={[2.14,.065,.6]} color='#d7dce3' radius={.035}/>
    {Array.from({length:12},(_,i)=><Box key={i} at={[-1.25+i*.17,-.538,1.06]} size={[.11,.014,.4]} color='#aab3c0' radius={.008}/>)}
    <Sphere at={[1.42,-.58,1.08]} size={[.2,.06,.27]} color='#e4e7ec'/>
    <Box at={[-3.05,-.42,-.15]} size={[.8,.44,.6]} color='#656d78'/><Box at={[-2.8,-.62,.86]} size={[.72,.035,.54]} color='#e5e8ec'/>
    <mesh position={[3.14,-.41,.58]} castShadow><cylinderGeometry args={[.19,.18,.38,24]}/><meshStandardMaterial color='#d0d6de' roughness={.3} metalness={.6}/></mesh>
    <group ref={chair} position={[0,-1.32,2.55]} scale={1.5}><Box at={[0,0,0]} size={[1.1,.16,1.05]} color='#414955' radius={.12}/><Box at={[0,.67,.41]} size={[1.08,1.22,.14]} color='#414955' radius={.13}/><Box at={[0,-.64,0]} size={[.08,1.1,.08]} color={C.metal} metal={.8}/><Box at={[0,-1.16,0]} size={[1.15,.08,.12]} color={C.ink}/><Box at={[0,-1.16,0]} size={[.12,.08,1.15]} color={C.ink}/></group>
  </group>;
}
// Piecewise smooth interpolation has identical endpoints at every chapter boundary.
const cameraStops=[
  {p:openingPosition,t:openingTarget},
  {p:[8,7,12],t:[0,.8,0]},
  {p:[8,7,12],t:[0,.8,0]},
  {p:[8,7.2,11],t:[0,.4,0]},
  {p:[7,8,10],t:[-.4,.3,-.5]},
  {p:[7,7,11],t:[0,.5,0]},
  {p:[9,8,12],t:[0,.3,0]},
];
export function sampleCamera(progress) {
  const x=Math.max(0,Math.min(1,progress))*6;
  const index=Math.min(5,Math.floor(x));
  const f=THREE.MathUtils.smoothstep(x-index,0,1);
  return {
    position:cameraStops[index].p.map((v,i)=>THREE.MathUtils.lerp(v,cameraStops[index+1].p[i],f)),
    target:cameraStops[index].t.map((v,i)=>THREE.MathUtils.lerp(v,cameraStops[index+1].t[i],f)),
  };
}
function World({budgetAlarm,progress,panelGaze,reduced,chapter,taskStage,built,appSpec,buildStage,hovered,onHover,phase,onReady,onDone}) {
  const desk=useRef(),room=useRef(),workspace=useRef(),guide=useRef(),pedestal=useRef(),guideMotion=useRef(0),shift=useRef(1),drop=useRef(0),arrival=useRef(),flight=useRef(0),push=useRef(0),focus=useRef(0),complete=useRef(false),ready=useRef(false);
  const {camera,size,invalidate}=useThree();
  const returnToOffice=useRef(0);
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
    const destination=tour&&chapter!==0?1:0;
    returnToOffice.current=reduced?destination:THREE.MathUtils.clamp(returnToOffice.current+(destination?1:-1)*Math.min(delta,.05)/1.1,0,1);
    const transition=THREE.MathUtils.smoothstep(returnToOffice.current,0,1);
    guideMotion.current=transition;
    if(workspace.current){workspace.current.visible=transition>0;workspace.current.position.y=-3*(1-transition);}
    if(guide.current){guide.current.visible=transition<1;guide.current.position.set(-2.8*transition,.07*transition,THREE.MathUtils.lerp(4.5,2.02,transition));guide.current.scale.setScalar(THREE.MathUtils.lerp(1.3,1,transition));}
    if(pedestal.current){pedestal.current.visible=transition<.01;}
    if(tour) {
      const shot=sampleCamera(reduced ? (chapter+.5)/6 : progress.current);
      desired.fromArray(shot.position);target.fromArray(shot.target);
      const finale=THREE.MathUtils.smoothstep(reduced?chapter/6:progress.current,.84,.94);
      desired.sub(target).multiplyScalar(1+finale*1.15).add(target);
      if(mobile)desired.sub(target).multiplyScalar(1.35).add(target);
      else if(size.width<1050)desired.sub(target).multiplyScalar(1.32).add(target);
      const heroEye=new THREE.Vector3(0,1.45,11),heroTarget=new THREE.Vector3(0,1.05,4.5);
      if(mobile)heroEye.z=12.5;
      else if(size.width<1050)heroEye.z=15;
      desired.lerp(heroEye,1-transition);target.lerp(heroTarget,1-transition);
      const closing=chapter===2&&taskStage>=3;
      focus.current=reduced?(closing?1:0):THREE.MathUtils.clamp(focus.current+(closing?1:-1)*delta/.9,0,1);
      if(focus.current>0){
        const near=THREE.MathUtils.smoothstep(focus.current,0,1);
        desired.lerp(focusEye,near);target.lerp(focusAt,near);
        if(mobile)desired.sub(target).multiplyScalar(1+near*.45).add(target);
      }
    } else {
      if(phase==='flight')flight.current=Math.min(1,flight.current+Math.min(delta,.05)/4.3);
      const t=flight.current;
      const first=THREE.MathUtils.smoothstep(t,.6,.85);
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
      const walk=THREE.MathUtils.smoothstep(t,0,.24);
      const pull=THREE.MathUtils.smoothstep(t,.27,.42);
      const hop=THREE.MathUtils.smoothstep(t,.43,.58);
      // Walk up beside the chair, then arc onto the seat.
      arrival.current.position.set(
        THREE.MathUtils.lerp(THREE.MathUtils.lerp(11,1.15,walk),0,hop),
        THREE.MathUtils.lerp(-3.10,-1.40,hop)+Math.sin(hop*Math.PI)*1.25+Math.sin(t*95)*.07*(1-walk),
        THREE.MathUtils.lerp(2.9+pull*.75,3.22,hop));
      arrival.current.rotation.y=THREE.MathUtils.lerp(Math.PI/2,0,hop);
    }
    camera.position.copy(desired);camera.lookAt(target);
    // Keep one continuous camera, shifting the composition toward the right.
    if(tour) {
      push.current=reduced ? 1 : Math.min(1,push.current+Math.min(delta,.05)/.9);
      // Chapters that present the office centred ease the side-shift away.
      shift.current=THREE.MathUtils.lerp(shift.current,(chapter===0||chapter===3||chapter===5)?0:1,1-Math.exp(-delta*4));
      const offset = mobile ? 0 : transition*(1-THREE.MathUtils.smoothstep(reduced?chapter/6:progress.current,.84,.94))*THREE.MathUtils.smoothstep(push.current,0,1)*shift.current;
      // 04 sits the office lower so the agent bubbles clear the heading.
      drop.current=THREE.MathUtils.lerp(drop.current,chapter===3?1:0,1-Math.exp(-delta*4));
      camera.setViewOffset(size.width,size.height,-size.width*(size.width<1050?.12:.2)*offset,-size.height*.13*drop.current,size.width,size.height);
    } else {
      // The desk opens on the right; the frame recenters as the camera flies into the screen.
      const aside=1-THREE.MathUtils.smoothstep(flight.current,.6,.85);
      if(mobile)camera.setViewOffset(size.width,size.height,0,-size.height*.15*aside,size.width,size.height);
      else camera.setViewOffset(size.width,size.height,-size.width*.19*aside,-size.height*.05*aside,size.width,size.height);
    }
  });
  return <><color attach="background" args={['#e6e8ed']}/><Lights/><group ref={desk}><Mac active={phase!=='tour'} reduced={reduced} flight={flight}/><group ref={arrival} scale={1.45}><Agent at={[0,0,0]} reduced={reduced} arrivalProgress={flight}/></group><mesh rotation={[-Math.PI/2,0,0]} position={[0,-3.2,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color='#e6e8ed' roughness={.75}/></mesh></group><group ref={room} visible={false}><group ref={guide}><Agent at={[0,0,0]} reduced={reduced} guide journey={guideMotion} panelGaze={chapter===0?panelGaze:undefined} gazeActive={phase==='tour'}/></group><mesh ref={pedestal} position={[0,-.06,4.5]} receiveShadow><cylinderGeometry args={[1.1,1.13,.12,64]}/><meshStandardMaterial color="#dce0e6" roughness={.5}/></mesh><group ref={workspace}><Office budgetAlarm={budgetAlarm} buildStage={buildStage} guideMotion={guideMotion} chapter={chapter} built={built} appSpec={appSpec} taskStage={taskStage} hovered={hovered} onHover={onHover} reduced={reduced} markers={phase==='tour'&&chapter!==0}/></group><mesh rotation={[-Math.PI/2,0,0]} position={[0,-.46,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color='#e6e8ed' roughness={.75}/></mesh></group></>;
}
export default function OfficeScene(props) {
  return <Canvas shadows frameloop={props.visible&&!props.reduced?'always':'demand'} dpr={[1,1.5]} camera={{position:[13,8,22],fov:36,near:.05,far:250}} gl={{antialias:true,powerPreference:'high-performance'}}><World {...props}/></Canvas>;
}
