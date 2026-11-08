import {Button} from '../src-shared/ui/index.jsx';
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Html,OrbitControls} from '@react-three/drei';
import * as THREE from 'three';
import AgentIcon from '../src-shared/AgentIcon.jsx';
import {Settings} from 'lucide-react';
import {officeLayout} from './office-layout.js';
import {OfficeBot,BotLighting,botVariantFor} from './office-bots.jsx';
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
    <OfficeBot variant={botVariantFor(agent)} reduced={reduced} hovered={hovered} rest={0.5} index={index} position={[0,.34,0]} scale={1.28} onSelect={e=>{e.stopPropagation();onSelect(agent.id)}}/>
 <Html position={[.18,.47,1.24]} center zIndexRange={[5,1]}><div className="bot-name-actions" {...hoverProps} data-hovered={hovered}><Button variant="plain" type="button" data-agent={agent.id} data-hovered={hovered} className="bot-label" style={{padding:'7px 11px',borderRadius:12,fontSize:12,color:agent.color,background:'#fcfdff',boxShadow:'0 3px 10px #66779920'}} onClick={()=>onSelect(agent.id)}><AgentIcon agent={agent.id} emoji={agent.emoji} size={21}/>{agent.name}</Button>{onSettings&&<Button variant="plain" type="button" className="bot-settings-button" aria-label={`設定 ${agent.name}`} onClick={e=>{e.stopPropagation();onSettings(agent.id)}}><Settings size={14}/>設定</Button>}</div></Html>
 {agent.event&&agent.published!==false&&!read.includes(agent.id)&&<Html position={[0,3.15,.1]} center zIndexRange={[8,6]}><Button variant="secondary" type="button" {...hoverProps} className={`bot-bubble ${agent.status}`} onClick={()=>onSelect(agent.id)}><span className="bubble-meta"><i/>{agent.eventType}<span>↗</span></span><strong>{agent.event}</strong></Button></Html>}
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
  const ctx=canvas.getContext('2d');ctx.fillStyle='#f3f3f6';ctx.fillRect(0,0,512,512);
  const wash=ctx.createRadialGradient(260,258,8,260,258,240);
  wash.addColorStop(0,'#fbfbfc');wash.addColorStop(.34,'#f6f6f8');wash.addColorStop(.72,'#f0f0f3');wash.addColorStop(1,'#e6e6eb');
  ctx.fillStyle=wash;ctx.fillRect(0,0,512,512);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;
 },[]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 return <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.02,0]} receiveShadow><planeGeometry args={[160,130]}/><meshStandardMaterial map={texture} roughness={.92} metalness={0}/></mesh>
}
function Scene({agents,allAgents=agents,onSelect,onSettings,read,reset,reduced,onReady,frame}){
 const controls=useRef(),intro=useRef(!reduced);
 const layout=useMemo(()=>officeLayout(allAgents),[allAgents]);
 const visibleAgents=layout.agents.filter(a=>agents.some(visible=>visible.id===a.id));
 useEffect(()=>{onReady?.()},[onReady]);
 return <><color attach="background" args={['#f3f3f6']}/><BotLighting/><BlueFloor/>
 <gridHelper args={[140,140,'#ffffff','#ffffff']} scale={[1,1,.81]} position={[0,-.009,0]} material-transparent material-opacity={.22}/>
 {visibleAgents.map((a,i)=><React.Fragment key={a.id}>{a.id!=='nova'&&visibleAgents.some(b=>b.id==='nova')&&<Connection to={a.at} index={i} reduced={reduced}/>}<Station agent={a} index={i} onSelect={onSelect} onSettings={onSettings} read={read} reduced={reduced}/></React.Fragment>)}
 <Camera reset={reset} controls={controls} reduced={reduced} intro={intro} radius={layout.radius} frame={frame}/><OrbitControls ref={controls} onStart={()=>{intro.current=false}} enablePan enableZoom screenSpacePanning mouseButtons={{LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN}} touches={{ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN}} minZoom={3} maxZoom={150} target={[0,.35,0]} enableDamping={!reduced} dampingFactor={.08}/></>
}
export default function Office(props){const [visible,setVisible]=useState(true);useEffect(()=>{const fn=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',fn);return()=>document.removeEventListener('visibilitychange',fn)},[]);return <div className="three-office" aria-label="可水平旋轉與縮放的 3D AI 辦公室"><Canvas orthographic shadows dpr={[1,1.5]} frameloop={!visible?'never':props.reduced?'demand':'always'} camera={{position:[24,38,20],zoom:18,near:.1,far:180}} gl={{antialias:true,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.shadowMap.type=THREE.PCFSoftShadowMap;gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.05}}><Scene {...props}/></Canvas></div>}
