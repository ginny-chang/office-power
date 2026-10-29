import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {RoundedBox,Html,OrbitControls} from '@react-three/drei';
import * as THREE from 'three';
import {createRobotShell} from '../src/components/robot-shell.js';
import AgentIcon from '../src-shared/AgentIcon.jsx';
import {renderToStaticMarkup} from 'react-dom/server';
import {Settings2} from 'lucide-react';
import {officeLayout} from './office-layout.js';
// Desk and robot geometry adapted from the landing page's reservation scene.
const C = { shell: '#e7eefb', metal: '#a6b8d4', ink: '#203c86', floor: '#a8bfe5', wall: '#dce7f8', light: '#ffffff' };
function Box({ at=[0,0,0], size=[1,1,1], color=C.shell, radius=.035, metal=.15, ...props }) {
  return <RoundedBox position={at} args={size} radius={Math.min(radius,...size.map(v=>v*.45))} smoothness={3} castShadow receiveShadow {...props}><meshStandardMaterial color={color} roughness={.48} metalness={metal}/></RoundedBox>;
}
function Sphere({at,size,color=C.metal}) {
  return <mesh position={at} scale={size} castShadow><sphereGeometry args={[1,20,12]}/><meshStandardMaterial color={color} roughness={.45} metalness={.3}/></mesh>;
}
function Screen({at,size=[.95,.58],variant=0,alarm=false,agent}) {
  const texture = useMemo(() => {
    const canvas=document.createElement('canvas'); canvas.width=512;canvas.height=320;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#19212d';ctx.fillRect(0,0,512,320);
    ctx.fillStyle='#8999ac';ctx.font='14px sans-serif';ctx.fillText(['PEOPLE / 01','FINANCE / 02','SALES / 03','GOVERNANCE / 04'][variant],26,35);
    ctx.fillStyle='#e4eaf0';ctx.font='24px sans-serif';ctx.fillText(['Leave requests','Expense review','Account activity','Access control'][variant],26,80);
    for(let i=0;i<4;i++){ctx.fillStyle='#2c3746';ctx.fillRect(26,110+i*40,460,28);ctx.fillStyle='#93a8c3';ctx.fillRect(40,120+i*40,130+i*28,6);ctx.fillStyle='#c5d2e1';ctx.fillRect(390,118+i*40,65,10);}
    if(alarm){ctx.fillStyle='#c71936';ctx.fillRect(0,0,512,320);ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='bold 72px sans-serif';ctx.fillText('ERROR',256,157);ctx.font='22px sans-serif';ctx.fillText('BUDGET LIMIT REACHED',256,210);ctx.font='16px sans-serif';ctx.fillText('AGENT PAUSED',256,262);}
    const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
    if(agent){ctx.fillStyle='#233b59';ctx.fillRect(0,0,512,320);const img=new Image();img.onload=()=>{ctx.drawImage(img,166,50,180,180);ctx.fillStyle='#adc6e8';ctx.textAlign='center';ctx.font='18px sans-serif';ctx.fillText('NOVA / '+agent.toUpperCase(),256,277);map.needsUpdate=true};img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(renderToStaticMarkup(<AgentIcon agent={agent} size={180} color="#e8f3ff" xmlns="http://www.w3.org/2000/svg"/>));}
    return map;
  },[variant,alarm,agent]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  return <mesh position={at}><planeGeometry args={size}/><meshBasicMaterial map={texture} toneMapped={false}/></mesh>;
}
function Agent({at,index=0,reduced,hovered,onHover,onLeave,onSelect}) {
 const body=useRef(),arm=useRef(),leftArm=useRef(),headPivot=useRef(),feet=useRef([]),eyes=useRef([]);
 const parts=useMemo(createRobotShell,[]),world=useMemo(()=>new THREE.Vector3(),[]);const panic=false,seated=false;
 useEffect(()=>()=>Object.values(parts).forEach(g=>g.dispose()),[parts]);
 useFrame(({clock,camera},delta)=>{
  const t=clock.elapsedTime+index*.7,k=reduced?1:1-Math.exp(-delta*9);
  body.current.getWorldPosition(world);
  const facing=hovered?Math.atan2(camera.position.x-world.x,camera.position.z-world.z):.42;
  let diff=THREE.MathUtils.euclideanModulo(facing-body.current.rotation.y+Math.PI,Math.PI*2)-Math.PI;
  body.current.rotation.y+=diff*k;
  headPivot.current.rotation.x=THREE.MathUtils.lerp(headPivot.current.rotation.x,hovered?-.23:.10,k);
  body.current.position.y=at[1];
  arm.current.rotation.x=hovered?THREE.MathUtils.lerp(arm.current.rotation.x,-.35,k):-.95+(reduced?0:Math.sin(t*15)*.18);
  leftArm.current.rotation.x=hovered?THREE.MathUtils.lerp(leftArm.current.rotation.x,-.35,k):-.95+(reduced?0:Math.sin(t*15+Math.PI)*.18);
  arm.current.rotation.z=.1;leftArm.current.rotation.z=-.1;
  eyes.current.forEach(eye=>eye.scale.y=reduced||hovered?1:t%4.6<.14?.15:1);
 });
  return <group ref={body} position={at} rotation={[0,.42,0]} scale={1.22} onClick={onSelect}>
    <group position={[0,.73,0]}>{['torso','inset'].map(part=><mesh key={part} geometry={parts[part]} castShadow><meshStandardMaterial color={part==='inset'?'#bcc1c7':'#f1f2f3'} roughness={.48}/></mesh>)}</group>
    {[-.29,.29].map((x,i)=><group key={x} ref={el=>feet.current[i]=el} position={[x,seated?.3:.16,seated?.28:.015]}><Box size={[.46,.32,.66]} radius={.13} color="#f1f2f3"/></group>)}
    <Box at={[0,.41,.36]} size={[.35,.115,.019]} radius={.052} color="#9ca3aa"/>
    <Box at={[0,.41,.371]} size={[.326,.096,.016]} radius={.045} color="#e2e5e8"/>
<group ref={headPivot} position={[0,.73,0]}><group position={[0,-.73,0]}><mesh geometry={parts.head} position={[0,.73,0]} castShadow><meshStandardMaterial color="#f1f2f3" roughness={.48}/></mesh>    <RoundedBox position={[0,.97,.335]} args={[.79,.76,.22]} radius={.24} smoothness={6} castShadow><meshPhysicalMaterial color="#101116" roughness={.16} metalness={.2} clearcoat={1} clearcoatRoughness={.08}/></RoundedBox>
    {[-.115,.115].map((x,i)=><mesh key={x} ref={el=>eyes.current[i]=el} position={[x,.9,.465]} scale={[1,1,.22]}><capsuleGeometry args={[.056,.135,6,16]}/><meshBasicMaterial color="#f7f7fa"/></mesh>)}
    {panic&&<mesh position={[0,.69,.465]} scale={[1,1,.2]}><sphereGeometry args={[.065,16,12]}/><meshBasicMaterial color="#fff"/></mesh>}
    {[-1,1].map(side=><group key={side} position={[side*.36,1.33,0]} rotation={[0,0,side*-.4]}>
      <mesh position={[0,.055,0]}><cylinderGeometry args={[.14,.15,.1,32]}/><meshStandardMaterial color="#e5e7e9" roughness={.35}/></mesh>
      <mesh position={[0,.13,0]}><cylinderGeometry args={[.1,.1,.05,32]}/><meshStandardMaterial color="#777d84" metalness={.8} roughness={.25}/></mesh>
      <mesh position={[0,.27,0]} castShadow><cylinderGeometry args={[.13,.13,.24,32]}/><meshStandardMaterial color="#f0f1f3" roughness={.35}/></mesh>
    </group>)}
</group></group>    <group ref={arm} position={[.53,.7,0]}><Sphere at={[0,-.14,0]} size={[.105,.25,.14]} color="#eef0f2"/></group><group ref={leftArm} position={[-.53,.61,0]} rotation={[-.8,0,-.45]}><Sphere at={[0,-.14,0]} size={[.105,.25,.14]} color="#eef0f2"/></group>
  </group>;
}
function BaseGlow({color,radius}){
 const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(128,128,0,128,128,128);g.addColorStop(0,'#ffffff80');g.addColorStop(.35,'#ffffff60');g.addColorStop(.55,'#ffffff30');g.addColorStop(.8,'#ffffff0a');g.addColorStop(1,'#ffffff00');ctx.fillStyle=g;ctx.fillRect(0,0,256,256);return new THREE.CanvasTexture(c)},[]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 return <mesh raycast={()=>null} rotation={[-Math.PI/2,0,0]} position={[0,.015,0]}><planeGeometry args={[radius*4,radius*4]}/><meshBasicMaterial map={texture} color={color} transparent opacity={.65} depthWrite={false} toneMapped={false}/></mesh>
}
function Station({agent,index,onSelect,onSettings,read,reduced}){
 const [hovered,setHovered]=useState(false);const at=agent.at;
 const hoverTimer=useRef();useEffect(()=>()=>clearTimeout(hoverTimer.current),[]);
 const enter=()=>{clearTimeout(hoverTimer.current);setHovered(true)};
 const leave=()=>{clearTimeout(hoverTimer.current);hoverTimer.current=setTimeout(()=>setHovered(false),220)};
 // Every station sits on the same neutral glow; status shows in the label and bubble instead.
 const tint='#ffffff';
 const radius=agent.id==='nova'?1.85:1.65;
 const hoverProps={onPointerEnter:enter,onPointerLeave:leave,onFocus:enter,onBlur:leave};
 return <group position={at} onPointerOver={e=>{e.stopPropagation();enter()}} onPointerOut={leave}>
    <BaseGlow color={tint} radius={radius}/>
    <mesh position={[0,.15,0]} castShadow receiveShadow><cylinderGeometry args={[radius,radius,.28,96]}/><meshStandardMaterial color="#f5f7fd" roughness={.3}/></mesh>
    <mesh position={[0,.303,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><circleGeometry args={[radius-.13,96]}/><meshStandardMaterial color="#ffffff" roughness={.45}/></mesh>
    <mesh position={[0,.30,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[radius-.07,.065,12,96]}/><meshStandardMaterial color="#fcfdff" roughness={.3}/></mesh>
    {agent.id==='nova'&&[2.04,2.17].map(r=><mesh key={r} position={[0,.02,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[r,.014,8,96]}/><meshBasicMaterial color="#f9fbff" transparent opacity={.8}/></mesh>)}
    <group rotation={[0,.42,0]} position={[.6,.31,.48]} scale={.86}>
      <Box at={[0,.70,.1]} size={[1.65,.11,.82]} color="#edf0f6" radius={.07}/>
      {[-.64,.64].map(x=><Box key={x} at={[x,.36,.15]} size={[.065,.66,.55]} color="#bcc7d7"/>)}
      <Box at={[.2,1.13,.38]} size={[.88,.68,.07]} color="#b4bfd0" radius={.04}/>
      <Box at={[.2,.83,.38]} size={[.055,.28,.06]} color="#a8b5c9"/>
      <Box at={[.2,.78,.3]} size={[.36,.035,.26]} color="#a8b5c9"/>
      <group position={[.2,1.13,.335]} rotation={[0,Math.PI,0]}><Screen at={[0,0,0]} size={[.78,.57]} agent={agent.id}/></group>
      <Screen at={[.2,1.13,.422]} size={[.78,.57]} agent={agent.id}/>
      <Box at={[-.1,.77,-.10]} size={[.63,.045,.20]} color="#bcc7d7"/>
      {Array.from({length:8},(_,i)=><Box key={i} at={[-.365+i*.075,.797,-.10]} size={[.04,.008,.13]} color="#919fb3" radius={.002}/>)}
      <Sphere at={[.57,.79,-.09]} size={[.07,.026,.10]} color="#c4cddb"/>
    </group>
 <Agent at={[-.22,.31,-.38]} index={index} reduced={reduced} hovered={hovered} onHover={e=>{e.stopPropagation();setHovered(true)}} onLeave={()=>setHovered(false)} onSelect={e=>{e.stopPropagation();onSelect(agent.id)}}/>
 <Html position={[.18,.47,1.24]} center zIndexRange={[5,1]}><div className="bot-name-actions" {...hoverProps} data-hovered={hovered}><button data-agent={agent.id} data-hovered={hovered} className="bot-label" style={{padding:'7px 11px',borderRadius:12,fontSize:12,color:agent.color,background:'#fcfdff',boxShadow:'0 3px 10px #66779920'}} onClick={()=>onSelect(agent.id)}><AgentIcon agent={agent.id} emoji={agent.emoji} size={21}/>{agent.name}</button><button className="bot-settings-button" aria-label={`設定 ${agent.name}`} onClick={e=>{e.stopPropagation();onSettings(agent.id)}}><Settings2 size={14}/>設定</button></div></Html>
 {agent.event&&!read.includes(agent.id)&&<Html position={[0,3.15,.1]} center zIndexRange={[8,6]}><button {...hoverProps} className={`bot-bubble ${agent.status}`} onClick={()=>onSelect(agent.id)}><span className="bubble-meta"><i/>{agent.eventType}<span>↗</span></span><strong>{agent.event}</strong></button></Html>}
 </group>
}
function Connection({to,index,reduced}){
 const dot=useRef();const path=useMemo(()=>new THREE.LineCurve3(new THREE.Vector3(0,.07,0),new THREE.Vector3(to[0],.07,to[2])),[to]);
 useFrame(({clock})=>{dot.current.position.copy(path.getPoint(reduced?.5:(clock.elapsedTime*.14+index*.16)%1))});
 return <><mesh><tubeGeometry args={[path,1,.025,6,false]}/><meshBasicMaterial color="#fff" toneMapped={false}/></mesh><group ref={dot}><mesh><sphereGeometry args={[.075,12,8]}/><meshBasicMaterial color="#fff" toneMapped={false}/></mesh><mesh><sphereGeometry args={[.14,12,8]}/><meshBasicMaterial color="#fff" transparent opacity={.23} depthWrite={false} toneMapped={false}/></mesh></group></>
}
function Camera({reset,controls,reduced,intro,radius,frame}){
 const {camera,size,invalidate}=useThree();const elapsed=useRef(0),initial=useRef(true);
 // Centre the office in the area the floating UI leaves free, not the whole canvas.
 const {left=0,right=0,top=0,bottom=0}=frame?.(size.width,size.height)||{};
 const fit=Math.max(3,Math.min((size.width-left-right-(size.width>720?72:8))/(radius*2+4.2),(size.height-top-bottom)/(radius*1.5+5.4)));
 useEffect(()=>{const dx=(right-left)/2,dy=(bottom-top)/2;if(dx||dy)camera.setViewOffset(size.width,size.height,dx,dy,size.width,size.height);else camera.clearViewOffset();camera.updateProjectionMatrix();invalidate()},[camera,size.width,size.height,left,right,top,bottom]);
 const lockTilt=()=>{if(controls.current){const angle=Math.atan2(Math.hypot(camera.position.x,camera.position.z),camera.position.y-.35);controls.current.minPolarAngle=controls.current.maxPolarAngle=angle}};
 const settle=()=>{camera.position.set(10,12,18);camera.zoom=fit;camera.updateProjectionMatrix();controls.current?.target.set(0,.35,0);lockTilt();controls.current?.update()};
 useEffect(()=>{if(!initial.current){intro.current=false;settle()}initial.current=false},[reset]);
 useEffect(()=>{if(!intro.current||reduced){intro.current=false;settle()}invalidate()},[size.width,size.height,reduced,radius]);
 useFrame((_,delta)=>{
  if(!intro.current)return;
  elapsed.current+=Math.min(delta,.05);const t=Math.min(elapsed.current/2.6,1),e=1-Math.pow(1-t,3);
  // Decreasing azimuth gives the office a subtle clockwise turn on screen.
  const angle=THREE.MathUtils.lerp(.90,Math.atan2(10,18),e),radius=THREE.MathUtils.lerp(30,Math.hypot(10,18),e);
  camera.position.set(Math.sin(angle)*radius,THREE.MathUtils.lerp(38,12,e),Math.cos(angle)*radius);
  camera.zoom=fit*THREE.MathUtils.lerp(.40,1,e);camera.lookAt(0,.35,0);camera.updateProjectionMatrix();
  controls.current?.target.set(0,.35,0);lockTilt();controls.current?.update();if(t===1)intro.current=false;
 });return null
}
function BlueFloor(){
 const texture=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#e8e8ec';ctx.fillRect(0,0,512,512);
  const wash=ctx.createRadialGradient(260,258,8,260,258,240);
  wash.addColorStop(0,'#f8f8fa');wash.addColorStop(.34,'#f2f2f5');wash.addColorStop(.72,'#eaeaee');wash.addColorStop(1,'#e1e1e6');
  ctx.fillStyle=wash;ctx.fillRect(0,0,512,512);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;
 },[]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 return <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.025,0]}><planeGeometry args={[160,130]}/><meshBasicMaterial map={texture} toneMapped={false}/></mesh>
}
function Scene({agents,allAgents=agents,onSelect,onSettings,read,reset,reduced,onReady,frame}){
 const controls=useRef(),intro=useRef(!reduced);
 const layout=useMemo(()=>officeLayout(allAgents),[allAgents]);
 const visibleAgents=layout.agents.filter(a=>agents.some(visible=>visible.id===a.id));
 useEffect(()=>{onReady?.()},[onReady]);
 return <><color attach="background" args={['#eeeef2']}/><ambientLight intensity={.9}/><hemisphereLight args={['#ffffff','#c7c7cc',1.15]}/><directionalLight position={[-3,9,6]} intensity={2.4} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15} shadow-camera-bottom={-15} shadow-normalBias={.03}/><directionalLight position={[8,4,-6]} color="#e7f0ff" intensity={1.4}/>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.03,0]} receiveShadow><planeGeometry args={[160,130]}/><meshStandardMaterial color="#e8e8ec" roughness={.8}/></mesh><BlueFloor/>
 <gridHelper args={[140,140,'#ffffff','#ffffff']} scale={[1,1,.81]} position={[0,-.009,0]} material-transparent material-opacity={.22}/>
 {visibleAgents.map((a,i)=><React.Fragment key={a.id}>{a.id!=='nova'&&<Connection to={a.at} index={i} reduced={reduced}/>}<Station agent={a} index={i} onSelect={onSelect} onSettings={onSettings} read={read} reduced={reduced}/></React.Fragment>)}
 <Camera reset={reset} controls={controls} reduced={reduced} intro={intro} radius={layout.radius} frame={frame}/><OrbitControls ref={controls} onStart={()=>{intro.current=false}} enablePan enableZoom screenSpacePanning mouseButtons={{LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN}} touches={{ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN}} minZoom={3} maxZoom={150} target={[0,.35,0]} enableDamping={!reduced} dampingFactor={.08}/></>
}
export default function Office(props){const [visible,setVisible]=useState(true);useEffect(()=>{const fn=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',fn);return()=>document.removeEventListener('visibilitychange',fn)},[]);return <div className="three-office" aria-label="可水平旋轉與縮放的 3D AI 辦公室"><Canvas orthographic shadows dpr={[1,1.5]} frameloop={!visible?'never':props.reduced?'demand':'always'} camera={{position:[24,38,20],zoom:18,near:.1,far:180}} gl={{antialias:true,powerPreference:'high-performance'}}><Scene {...props}/></Canvas></div>}
