import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';
import Icon from './icons';
import { createRobotShell } from './robot-shell';
import { OPENING, openingBounce } from './opening-motion';

// All departments share materials and world coordinates. Only the camera travels.
const C = { shell: '#eaf0f7', metal: '#b4bfce', ink: '#34465f', floor: '#d5deeb', wall: '#e1e8f1', light: '#ffffff' };
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
// 05: a soft blue-to-grey wash spreading out from the middle of the platform.
function FloorGlow({glow}) {
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
    const ctx=canvas.getContext('2d');
    const gradient=ctx.createRadialGradient(128,128,0,128,128,128);
    gradient.addColorStop(0,'rgba(150,190,240,.62)');
    gradient.addColorStop(.45,'rgba(178,203,233,.34)');
    gradient.addColorStop(.8,'rgba(205,216,231,.08)');
    gradient.addColorStop(1,'rgba(213,222,235,0)');
    ctx.fillStyle=gradient;ctx.fillRect(0,0,256,256);
    const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;
  },[]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  return <mesh ref={glow} rotation={[-Math.PI/2,0,0]} position={[0,.001,0]}>
    <planeGeometry args={[10,8]}/>
    <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} opacity={0}/>
  </mesh>;
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
function Agent({at,index=0,reduced,walking=false,working=false,waving=false,ambient,seated=false,arrivalProgress,guide=false,gazeActive=false,journey,panelGaze,celebrate=false,active=false,hovered=false,onHover,onLeave,onSelect}) {
  const body=useRef(), arm=useRef(),leftArm=useRef(),feet=useRef([]),eyes=useRef([]),cursor=useRef(null),celebration=useRef(0);
  useEffect(()=>{if(!guide||!gazeActive)return;const move=e=>{cursor.current=[(e.clientX/innerWidth-.5)*2,(e.clientY/innerHeight-.5)*2];};const reset=()=>{cursor.current=null;};window.addEventListener('pointermove',move);window.addEventListener('blur',reset);return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('blur',reset);};},[guide,gazeActive]);
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
    const gaze=gazeActive?(panelGaze?.current??cursor.current??[Math.sin(clock.elapsedTime*.55)*.65,Math.sin(clock.elapsedTime*.37)*.3]):[0,0];
    const facing=guide ? (travel>0?Math.PI:reduced?0:gaze[0]*.7) : waving||hovered||active ? .65 : Math.PI;
    body.current.rotation.y=reduced ? facing : THREE.MathUtils.lerp(body.current.rotation.y,facing,1-Math.exp(-delta*9));
    const blinkTime=(clock.elapsedTime+index*.7)%4.6;
    const blink=reduced?1:blinkTime<.18?Math.max(.07,Math.abs(blinkTime-.09)/.09):1;
    eyes.current.forEach((eye,i)=>{eye.scale.y=blink;eye.position.x=(i===0?-.115:.115)+(guide&&!reduced&&travel===0?gaze[0]*.065:0);eye.position.y=.9+(guide&&!reduced&&travel===0?-gaze[1]*.04:0);});
    // Chapter 01 follows v1: turn the whole shell, returning to neutral on exit.
    body.current.rotation.x=THREE.MathUtils.lerp(body.current.rotation.x,guide&&gazeActive&&!reduced&&travel===0?gaze[1]*.22:0,1-Math.exp(-delta*9));
    body.current.rotation.z=0;
    if(guide&&travel===0)feet.current.forEach(foot=>{foot.position.z=.015;foot.position.y=.16;});
    if(reduced) { arm.current.rotation.z=hovered?2.15:.18; return; }
    const t=clock.elapsedTime+index*.618;
    const typing=working||ambient?.current.index===index;
    body.current.position.y=at[1]+(guide?0:Math.sin(t*1.8)*.018);
    if(celebrate){celebration.current=Math.min(1,celebration.current+delta/.62);body.current.position.y=at[1]+Math.sin(celebration.current*Math.PI)*.95;body.current.rotation.y=.2+Math.PI*2*THREE.MathUtils.smoothstep(celebration.current,0,1);}
    // Fixed shoulder pivot: the flipper rotates around a joint inside the shell.
    arm.current.rotation.z=hovered||waving ? 2.15+Math.sin(t*9)*.3 : .18+(typing?Math.sin(t*18)*.1:0);
    arm.current.rotation.x=hovered||waving?0:-.8+(typing?Math.sin(t*18)*.35:0);
    leftArm.current.rotation.x=-.8+(typing?Math.sin(t*18+Math.PI)*.35:0);
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
  return <group ref={body} position={at} rotation={[0,guide?0:Math.PI,0]} scale={.92} onPointerOver={onHover} onPointerOut={onLeave} onClick={onSelect}>
    <RobotShell/>
    {[-.29,.29].map((x,i)=><group key={x} ref={el=>feet.current[i]=el} position={[x,seated?.3:.16,seated?.28:.015]}><Box size={[.46,.32,.66]} radius={.13} color="#f1f2f3"/></group>)}
    <RoundedBox position={[0,.97,.335]} args={[.79,.76,.22]} radius={.24} smoothness={6} castShadow><meshPhysicalMaterial color="#101116" roughness={.16} metalness={.2} clearcoat={1} clearcoatRoughness={.08}/></RoundedBox>
    {[-.115,.115].map((x,i)=><mesh key={x} ref={el=>eyes.current[i]=el} position={[x,.9,.465]} scale={[1,1,.22]}><capsuleGeometry args={[.056,.135,6,16]}/><meshBasicMaterial color="#f7f7fa"/></mesh>)}
    <Box at={[0,.41,.36]} size={[.35,.115,.019]} radius={.052} color="#9ca3aa"/>
    <Box at={[0,.41,.371]} size={[.326,.096,.016]} radius={.045} color="#e2e5e8"/>
    {[-1,1].map(side=><group key={side} position={[side*.36,1.33,0]} rotation={[0,0,side*-.4]}>
      <mesh position={[0,.055,0]}><cylinderGeometry args={[.14,.15,.1,32]}/><meshStandardMaterial color="#e5e7e9" roughness={.35}/></mesh>
      <mesh position={[0,.13,0]}><cylinderGeometry args={[.1,.1,.05,32]}/><meshStandardMaterial color="#777d84" metalness={.8} roughness={.25}/></mesh>
      <mesh position={[0,.27,0]} castShadow><cylinderGeometry args={[.13,.13,.24,32]}/><meshStandardMaterial color="#f0f1f3" roughness={.35}/></mesh>
    </group>)}
    {[-1,1].map(side=><Sphere key={side} at={[side*.48,.64,0]} size={[.11,.115,.13]} color="#d4dbe3"/>)}
    <group ref={arm} position={[.48,.64,0]}><Sphere at={[.055,-.14,.015]} size={[.135,.235,.15]} color="#eef0f2"/></group>
    <group ref={leftArm} position={[-.48,.64,0]} rotation={[-.8,0,-.18]}><Sphere at={[-.055,-.14,.015]} size={[.135,.235,.15]} color="#eef0f2"/></group>
  </group>;
}
function Fireworks({reduced}) {
 const group=useRef(),elapsed=useRef(0);
 const particles=useMemo(()=>Array.from({length:32},(_,i)=>{const a=i/32*Math.PI*2;return [Math.cos(a),Math.sin(a),Math.sin(i*2.4)*.5];}),[]);
 useFrame((_,delta)=>{if(reduced)return;elapsed.current+=delta;const t=Math.max(0,elapsed.current-.4);group.current.visible=t<1.5;group.current.children.forEach((mesh,i)=>{const v=particles[i];mesh.position.set(v[0]*t*1.5,v[1]*t*1.5-t*t*.4,v[2]*t);mesh.scale.setScalar(Math.max(0,1-t/1.5));});});
 if(reduced)return null;
 return <group ref={group} position={[.5,2.4,.6]}>{particles.map((_,i)=><mesh key={i}><sphereGeometry args={[.035,6,4]}/><meshBasicMaterial color={i%3===0?'#f3cf84':i%3===1?'#b1c7ea':'#f4f7ff'}/></mesh>)}</group>;
}
function Workstation({at,index,selected,reduced,markers,chapter,taskStage,celebrating,hovered,onHover,building,waving,ambient,card,guideMotion}) {
  const label=['HR Agent','財務 Agent','業務 Agent','IT Agent'][index%4];
  const worker=useRef();
  useFrame(()=>{if(worker.current)worker.current.visible=index!==0||!guideMotion||guideMotion.current>=.999;});
  const interactive=markers&&chapter===3;
  return <group position={at}>
    <mesh position={[0,.025,0]} receiveShadow><cylinderGeometry args={[1.52,1.52,.07,64]}/><meshStandardMaterial color="#e9eff6" roughness={.42}/></mesh>
    <mesh position={[0,.054,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[1.49,.012,6,64]}/><meshBasicMaterial color={C.light}/></mesh>
    <Box at={[0,.93,-.55]} size={[2.35,.16,1.18]} color='#e6e9ed' radius={.045}/>
    <Box at={[-.87,.46,-.55]} size={[.5,.86,1.02]} color="#b9bec5" radius={.04}/>
    {[.25,.5,.75].map(y=><group key={y}><Box at={[-.87,y,-.026]} size={[.42,.008,.014]} color="#929aa4"/><Box at={[-.87,y+.1,-.016]} size={[.16,.025,.02]} color="#777f88"/></group>)}
    <Box at={[.99,.46,-.55]} size={[.08,.86,1.02]} color="#a5abb3" metal={.6}/>
    <Box at={[0,1.43,-.74]} size={[1.2,.82,.055]} color="#c5d5e9" radius={.045} metal={.8}/>
    <Box at={[0,1.48,-.703]} size={[1.12,.65,.016]} color="#f0f5fc" radius={.025}/><Screen at={[0,1.48,-.692]} size={[1.04,.58]} variant={index%4}/>
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
    <group ref={worker}><Agent at={[0,.07,.62]} ambient={ambient} index={index} reduced={reduced} working={chapter===4||(markers&&chapter===1&&index===0&&building)} waving={markers&&chapter===1&&index===0&&waving} active={markers&&chapter===2&&index===0&&taskStage>0} celebrate={markers&&chapter===2&&index===0&&celebrating} hovered={hovered===index&&interactive} onHover={interactive?e=>{e.stopPropagation();onHover(index);}:undefined} onLeave={interactive?()=>onHover(null):undefined} onSelect={interactive?e=>{e.stopPropagation();onHover(hovered===index?null:index);}:undefined}/></group>
    {markers&&chapter===2&&index===0&&taskStage>0&&<group position={[.45,2.05,.6]}><mesh><sphereGeometry args={[.13,20,16]}/><meshStandardMaterial color="#fff0b0" emissive="#ffe298" emissiveIntensity={2}/></mesh><Box at={[0,-.16,0]} size={[.11,.09,.11]} color="#a2a9b4"/><pointLight color="#ffebad" intensity={1.3} distance={2}/></group>}
    {markers&&chapter===2&&index===0&&celebrating&&<Fireworks reduced={reduced}/>}
    {markers&&(interactive||(chapter===2&&index===0&&taskStage>0))&&<Html position={[0,2.12,-.05]} center zIndexRange={[8,0]}>
    <div className="agent-marker" onMouseEnter={()=>interactive&&onHover(index)} onMouseLeave={()=>interactive&&onHover(null)}>
    {<div className="agent-bubble">
    <div className="bubble-heading"><Icon name={chapter===0?['spark','book','chat','upgrade'][index]:['people','money','trend','shield'][index]}/><strong>{chapter===0?['Agent 建立與調度','知識庫與權限','多通道上線','自我升級'][index]:label}</strong></div>
    {(hovered===index||chapter===2)&&<p>{chapter===0?['建立角色 · 分配任務','授權資料 · 安全存取','Web · Teams · LINE','提出改進 · 人工審核'][index]:chapter===2?['等待任務','收到任務，開始處理','假單已處理！等待確認','已完成！假單已送出給主管'][taskStage]:['請假、出勤、政策查詢','報帳、發票、預算預警','業績、報價、客戶跟進','權限、部署、版本管理'][index]}</p>}
    </div>}</div></Html>}
  </group>;
}
const destinations=[[-3.25,0,2.15],[3.25,0,2.15],[3.25,0,-2.15],[-3.25,0,-2.15]];
function Circuit({to,index,reduced}) {
  const heads=useRef([]);
  const paths=useMemo(()=>[0].map(()=>{
    const x=to[0],z=to[2]+.4;
    const length=Math.hypot(x,z);
    const dx=x/length,dz=z/length;
    const path=new THREE.CurvePath();
    // One dedicated trace per station, fanning out without parallel bundles.
    const points=[[dx*.78,.074,-.4+dz*.78],[x*.6,.074,-.4+z*.45],[x,.074,to[2]-.55]].map(p=>new THREE.Vector3(...p));
    for(let i=1;i<points.length;i++)path.add(new THREE.LineCurve3(points[i-1],points[i]));
    return path;
  }),[to]);
    useFrame(({clock})=>heads.current.forEach((head,i)=>{if(head)head.position.copy(paths[i].getPoint(reduced?.6:(clock.elapsedTime*.3+index*.16+i*.12)%1));}));
  return <group>{paths.map((path,i)=><React.Fragment key={i}>
    <mesh><tubeGeometry args={[path,40,.014,5,false]}/><meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={.95}/></mesh>
    <mesh><tubeGeometry args={[path,40,.04,5,false]}/><meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={.16} depthWrite={false}/></mesh>
    <mesh ref={el=>heads.current[i]=el}><sphereGeometry args={[.037,8,6]}/><meshBasicMaterial color="#ffffff" toneMapped={false}/></mesh>
    <mesh position={path.getPoint(1)} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.037,.06,12]}/><meshBasicMaterial color="#ffffff"/></mesh>
  </React.Fragment>)}</group>;
}
const networkNodes=[[-8,0,-6],[0,0,-6],[8,0,-6],[-8,0,0],[8,0,0],[-8,0,6],[0,0,6],[8,0,6]];
function Office({chapter=0,reduced=false,markers=false,taskStage=0,celebrating=false,built=false,appSpec,buildStage,guideMotion,hovered=null,onHover=()=>{}}) {
  const backWall=useRef(),sideWall=useRef(),core=useRef(),floor=useRef(),glow=useRef(),nodes=useRef([]),expansion=useRef(0);
  const ambient=useRef({index:-1,next:0,until:0});
  useFrame(({clock},delta)=>{
    const goal=chapter===4?1:0;
    expansion.current=reduced?goal:THREE.MathUtils.damp(expansion.current,goal,2.3,Math.min(delta,.05));
    const e=expansion.current;
    backWall.current.rotation.x=-Math.PI/2*THREE.MathUtils.smoothstep(e,0,.5);
    sideWall.current.rotation.z=Math.PI/2*THREE.MathUtils.smoothstep(e,0,.5);
    const wallScale=1-THREE.MathUtils.smoothstep(e,.48,.78);
    backWall.current.scale.y=sideWall.current.scale.y=Math.max(.001,wallScale);
    backWall.current.visible=sideWall.current.visible=e<.8;
    floor.current.scale.set(1+e*1.1,1,1+e*1.15);
    if(glow.current)glow.current.material.opacity=THREE.MathUtils.smoothstep(e,.05,.75);
    core.current.scale.setScalar(1+e*.85);
    nodes.current.forEach((node,i)=>{
      if(!node)return;
      const n=THREE.MathUtils.smoothstep(e,.3+i*.032,.55+i*.032);
      node.visible=n>0;
      node.scale.setScalar(Math.max(.001,n));
      node.position.y=(1-n)*-.65+Math.sin(n*Math.PI)*.25;
    });
    const state=ambient.current,t=clock.elapsedTime;
    if(reduced||buildStage==='typing'||buildStage==='wave'){state.index=-1;state.next=t+1;return;}
    if(t>=state.next){state.index=Math.floor(Math.random()*4);state.until=t+.7;state.next=state.until+1.2+Math.random()*3.2;}
    else if(t>=state.until)state.index=-1;
  });
  return <group>
    <group ref={floor}><Box at={[0,-.22,0]} size={[10,.42,8]} color={C.floor} radius={.12}/><FloorGlow glow={glow}/></group>
    <group ref={backWall} position={[0,-.17,-3.85]}><Box at={[0,1.3,0]} size={[10,2.6,.12]} color={C.wall}/>
    {[-3,-.1,2.8].map(x=><group key={x}><Box at={[x,1.64,.09]} size={[2.4,1.7,.035]} color='#d4dfed' radius={.012}/><Box at={[x,1.64,.14]} size={[.025,1.7,.026]} color={C.metal}/><Box at={[x,1.64,.14]} size={[2.4,.025,.026]} color={C.metal}/></group>)}</group>
    <group ref={sideWall} position={[-4.85,-.17,0]}><Box at={[0,1.3,0]} size={[.12,2.6,8]} color={C.wall}/></group>
    {[-3,-1,1,3].map(z=><Box key={z} at={[0,.002,z]} size={[9.8,.005,.009]} color='#c4cad3' radius={.001}/>)}
    {destinations.map((at,index)=><Workstation key={index} ambient={ambient} guideMotion={guideMotion} at={at} index={index} building={buildStage==='typing'} waving={buildStage==='wave'} selected={chapter===0||chapter===3||chapter===2&&index===0||chapter===4&&index===3} chapter={chapter} taskStage={taskStage} celebrating={celebrating} hovered={hovered} onHover={onHover} reduced={reduced} markers={markers}/>)}
    <group ref={core}>
    <mesh position={[0,.37,-.4]} castShadow receiveShadow><cylinderGeometry args={[.75,.75,.74,48]}/><meshStandardMaterial color={C.shell} roughness={.32} metalness={.65}/></mesh>
    <mesh position={[0,.75,-.4]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.61,.015,8,48]}/><meshBasicMaterial color={C.light}/></mesh>
    <Box at={[0,1.1,-.4]} size={[.33,.52,.33]} color={C.ink} metal={.65}/>
    {[0,1,2,3].map(i=><Box key={i} at={[0,.94+i*.11,-.228]} size={[.23,.014,.009]} color={C.light}/>)}
    </group>
    {networkNodes.map((at,i)=><group key={i} ref={el=>nodes.current[i]=el}>
      <Circuit to={at} index={i+4} reduced={reduced}/>
      <Workstation at={at} index={i+4} chapter={chapter} reduced={reduced} markers={false}/>
    </group>)}
    {false&&markers&&chapter===4&&<Html position={[0,1.88,-.4]} center distanceFactor={10} zIndexRange={[8,0]}><div className="scene-pin"><i className="pin-sheen"/><em className="pin-icon"><Icon name="shield"/></em><span className="pin-body"><b>AI Core</b><span className="pin-detail">權限 / 用量 / 執行紀錄</span></span></div></Html>}

    <Box at={[-4.25,.56,-.1]} size={[.55,1.12,1.5]} color={C.ink}/>
    {[0,1,2,3].map(i=><Box key={i} at={[-3.96,.3+i*.22,-.1]} size={[.01,.014,1.15]} color='#b8bec7'/>)}
    {destinations.map((to,i)=><Circuit key={i} to={to} index={i} reduced={reduced}/>)}
  </group>;
}
function Lights() {
  return <><ambientLight intensity={.65}/><hemisphereLight args={['#e9eff8','#a7aab3',1]}/><directionalLight position={[-3,9,6]} intensity={2.4} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-normalBias={.03}/><directionalLight position={[8,4,-6]} color='#d5e3fa' intensity={1.4}/></>;
}
const openingPosition=[10,8,12], openingTarget=[0,.2,0];
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
// The HR agent stands at destinations[0]; the celebration frames it head-on.
const CELEBRATION={eye:new THREE.Vector3(-.65,2.55,6.8),mobileEye:new THREE.Vector3(-2.6,2.2,7.6),target:new THREE.Vector3(-3.25,1.4,2.77)};
const heroLinks=[[-4.5,0,2.4],[4.5,0,2.4],[-4.5,0,-2.8],[4.5,0,-2.8],[-1.8,0,-4],[1.8,0,-4]];
function AtlasWorld({openingStarted,progress,panelGaze,reduced,chapter,taskStage,celebrating,built,appSpec,buildStage,hovered,onHover,phase,onReady,onDone}) {
  const hero=useRef(),bot=useRef(),office=useRef(),walk=useRef(0),journey=useRef(0),transition=useRef(0),announced=useRef(false),complete=useRef(false);
  // Per-chapter lift of the look-at point: raising it drops the model down the frame.
  const lift=useRef(0),cutIn=useRef(0);
  // Phone-only staging: 02 lifts the office once the build lands, 03 holds the office
  // back until the task is sent, 04 walks the camera from one Agent to the next.
  const appLift=useRef(0),officeIn=useRef(1),agentCut=useRef(0);
  const {camera,size,invalidate}=useThree();
  const narrow=size.width<=760;
  const eye=useMemo(()=>new THREE.Vector3(),[]),target=useMemo(()=>new THREE.Vector3(),[]);
  const agentEye=useMemo(()=>new THREE.Vector3(),[]),agentTarget=useMemo(()=>new THREE.Vector3(),[]);
  useEffect(()=>{if(phase==='boot'){walk.current=0;complete.current=false;}invalidate();},[phase,chapter,reduced,invalidate]);
  useFrame((_,delta)=>{
    if(!announced.current){announced.current=true;onReady();}
    const dt=Math.min(delta,.05),tour=phase==='tour',mobile=size.width<=760;
    const elapsed=openingStarted.current===null?0:Math.max(0,performance.now()-openingStarted.current);
    if(phase==='flight'){
      // Wall-clock timing keeps the opening short even on slower GPUs.
      walk.current=THREE.MathUtils.clamp((elapsed-OPENING.retreatAt)/(OPENING.tourAt-OPENING.retreatAt),0,1);
      if(walk.current===1&&!complete.current){complete.current=true;onDone();}
    }else if(tour)walk.current=1;
    const w=THREE.MathUtils.smoothstep(walk.current,0,1);
    journey.current=phase==='flight'?Math.min(.99,walk.current):0;
    const destination=tour&&chapter>0?1:0;
    transition.current=reduced?destination:THREE.MathUtils.damp(transition.current,destination,3.2,dt);
    const t=transition.current;
    hero.current.visible=t<.995;
    hero.current.scale.setScalar(Math.max(.001,1-t));
    const bounce=openingBounce(elapsed,reduced||phase!=='boot');
    bot.current.position.set(0,.08+w*.05+bounce.y,2.5*(1-w));
    bot.current.scale.set(1.3*bounce.scaleXZ,1.3*bounce.scaleY,1.3*bounce.scaleXZ);
    // 03 on phones keeps the office off-stage until the task has been sent.
    const holdOffice=mobile&&tour&&chapter===2&&taskStage<3;
    const officeGoal=holdOffice?0:1;
    officeIn.current=reduced?officeGoal:THREE.MathUtils.damp(officeIn.current,officeGoal,3,dt);
    // 02 on phones floats the office up to clear the finished App.
    const appGoal=mobile&&tour&&chapter===1&&built?1:0;
    appLift.current=reduced?appGoal:THREE.MathUtils.damp(appLift.current,appGoal,2.6,dt);
    office.current.visible=t>.005&&officeIn.current>.004;
    office.current.position.y=-2*(1-t)-2.4*(1-officeIn.current)+2.1*appLift.current;
    const shot=sampleCamera(reduced?(chapter+.5)/5:progress.current);
    const finale=tour&&chapter===4?1:0;
    const zoom=1+finale*1.12;
    eye.fromArray(shot.position).multiplyScalar(zoom);
    // 04 lifts the look-at point so the office clears the heading stacked above it.
    const liftGoal=tour&&chapter===3?1.15:0;
    lift.current=reduced?liftGoal:THREE.MathUtils.damp(lift.current,liftGoal,3.2,dt);
    target.set(0,.55+lift.current,0);
    // 01: desktop rings the robot with panels; phones stack the cards above it and
    // give it the bottom band, so the framing is closer and flatter there.
    const heroEye=new THREE.Vector3(0,mobile?1.6:2.8,mobile?5.8:12.5);
    const heroTarget=new THREE.Vector3(0,mobile?.95:1.85,0);
    // The opening frame is a shoulder-up portrait. Dolly out as the bot walks back.
    // It is framed on WIDTH, so a portrait phone has to sit further back or the
    // robot is cropped to a visor. Landscape viewports keep the original 7.5.
    const aspect=size.width/Math.max(1,size.height);
    const portrait=THREE.MathUtils.clamp(2.2/(.377*aspect),5,12.8);
    heroEye.lerp(new THREE.Vector3(0,1.98,2.5+portrait),1-w);
    heroTarget.lerp(new THREE.Vector3(0,1.98,2.5),1-w);
    eye.lerp(heroEye,1-t);
    target.lerp(heroTarget,1-t);
    if(mobile&&t>.01)eye.multiplyScalar(1+t*.3);
    // 03 cuts in on the HR agent a beat after the task lands, for the celebration.
    const cutGoal=tour&&chapter===2&&celebrating?1:0;
    cutIn.current=reduced?cutGoal:THREE.MathUtils.damp(cutIn.current,cutGoal,2.4,dt);
    if(cutIn.current>.001){
      eye.lerp(mobile?CELEBRATION.mobileEye:CELEBRATION.eye,cutIn.current);
      target.lerp(CELEBRATION.target,cutIn.current);
    }
    // 04 on phones: scrolling steps the camera through the four Agents one at a time.
    const cutGoal4=mobile&&tour&&chapter===3?1:0;
    agentCut.current=reduced?cutGoal4:THREE.MathUtils.damp(agentCut.current,cutGoal4,2.8,dt);
    if(agentCut.current>.001){
      const seat=destinations[Math.max(0,Math.min(3,hovered??0))];
      agentEye.set(seat[0]*.55,2.3,seat[2]+5.22);
      agentTarget.set(seat[0],1.15,seat[2]+.62);
      eye.lerp(agentEye,agentCut.current);
      target.lerp(agentTarget,agentCut.current);
    }
    if(t<.001)camera.position.copy(eye);
    else camera.position.lerp(eye,reduced?1:1-Math.exp(-dt*5));
    camera.lookAt(target);
    const offset=!mobile&&tour&&(chapter===1||chapter===2||chapter===4)?-.18*size.width*t:0;
    camera.setViewOffset(size.width,size.height,offset,0,size.width,size.height);
  });
  return <>
    <color attach="background" args={['#e6ebf2']}/><fog attach="fog" args={['#e6ebf2',22,65]}/><Lights/>
    <mesh visible={phase!=='boot'} rotation={[-Math.PI/2,0,0]} position={[0,-.46,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color="#e1e7ef" roughness={.7}/></mesh>
    <group ref={hero}>
      <group visible={phase==='tour'||phase==='flight'}>
        {[[-7,-5,2.8],[-3.7,-8,2.2],[3.8,-7,2.5],[8,-10,3.4],[-9,-13,3.8]].map(([x,z,width],i)=><group key={x} position={[x,0,z]} rotation={[0,.12,0]}>
          <Box at={[0,.06,0]} size={[width+.18,.14,width+.18]} color="#dce8f5" radius={.1}/>
          <Box at={[0,.24,0]} size={[width,.26,width]} color="#f8fbff" radius={.12} metal={.05}/>
          <Box at={[0,.39,0]} size={[width-.08,.04,width-.08]} color="#ffffff" radius={.09} metal={0}/>
          <mesh position={[0,.49,0]}><cylinderGeometry args={[.28,.34,.16,32]}/><meshStandardMaterial color={i%2?'#dceefa':'#b8d7f1'} roughness={.3}/></mesh>
        </group>)}
        <Box at={[0,.035,-10]} size={[17,.025,.025]} color="#f7faff"/>
        <Box at={[0,.035,-15]} size={[25,.025,.025]} color="#edf3fa"/>
      </group>
      <group visible={phase!=='boot'}>
      <Box at={[0,-.1,0]} size={[11,.18,10]} color="#e9eff7" radius={.15} metal={.05}/>
      {heroLinks.map((to,i)=><Circuit key={i} to={to} index={i} reduced={reduced}/>)}
      </group>
      <group ref={bot} position={[0,-2.32,2.5]} scale={1.3}><Agent at={[0,0,0]} reduced={reduced} guide gazeActive={phase==='tour'&&chapter===0} waving={phase==='boot'} journey={journey} panelGaze={chapter===0&&phase==='tour'?panelGaze:undefined}/></group>
    </group>
    <group ref={office} visible={false}><Office chapter={chapter} reduced={reduced} markers={phase==='tour'&&chapter>0&&!(narrow&&chapter===2&&taskStage<3)} taskStage={taskStage} celebrating={celebrating} built={built} appSpec={appSpec} buildStage={buildStage} hovered={hovered} onHover={onHover}/></group>
  </>;
}
export default function OfficeScene(props) {
  return <Canvas shadows frameloop={props.visible&&!props.reduced?'always':'demand'} dpr={[1,1.5]} camera={{position:[0,1.98,7.5],fov:36,near:.05,far:250}} gl={{antialias:true,powerPreference:'high-performance'}}><AtlasWorld {...props}/></Canvas>;
}
