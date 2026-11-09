import React,{useEffect,useRef,useState} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import * as THREE from 'three';
import {Settings} from 'lucide-react';
import {BotLighting,botVariantFor} from './office-bots.jsx';
import {BOT_VARIANTS} from './bot-variants.js';
import {SharedOffice} from './office-desk.jsx';
function BotFace({variant}){
 const color=(BOT_VARIANTS[variant]||BOT_VARIANTS.life).color;
 return <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true" focusable="false"><rect x="10" y="16" width="28" height="26" rx="10" fill="#f7f8fa"/><rect x="16" y="8" width="5" height="9" rx="2.5" fill="#f4f5f7"/><rect x="27" y="8" width="5" height="9" rx="2.5" fill="#f4f5f7"/><rect x="15" y="7" width="5" height="3" rx="1" fill="#8e959e"/><rect x="28" y="7" width="5" height="3" rx="1" fill="#8e959e"/><rect x="14" y="21" width="20" height="13" rx="5" fill="#14161c"/><rect x="18" y="23" width="3.5" height="8" rx="1.7" fill="#fbfcff"/><rect x="26.5" y="23" width="3.5" height="8" rx="1.7" fill="#fbfcff"/><circle cx="36" cy="36" r="5.5" fill={color}/></svg>;
}
function AgentDock({agents,activeId,read,onFocus,onSettings}){
 return <div className="agent-dock" role="listbox" aria-label="Agent">{agents.map(agent=>{
  const fresh=!!(agent.event&&agent.published!==false&&!read.includes(agent.id));
  const selected=agent.id===activeId;
  return <div key={agent.id} className={`agent-dock-item${selected?' is-selected':''}${fresh?' has-update':''}`} role="presentation">
   <button type="button" role="option" aria-selected={selected} className="agent-dock-avatar" aria-label={fresh?`${agent.name}，有新動態`:`${agent.name}`} onClick={()=>onFocus(agent.id)}><BotFace variant={botVariantFor(agent)}/></button>
   {onSettings&&<button type="button" className="agent-dock-settings" aria-label={`設定 ${agent.name}`} onClick={()=>onSettings(agent.id)}><Settings size={16}/></button>}
  </div>;
 })}</div>;
}
function Camera({reset,controls,reduced,intro,frame}){
 const {camera,size,invalidate}=useThree();const elapsed=useRef(0),initial=useRef(true);
 // Centre the office in the area the floating UI leaves free, not the whole canvas.
 const {left=0,right=0,top=0,bottom=0}=frame?.(size.width,size.height)||{};
 const span=9.2;
 const fit=Math.max(18,Math.min((size.width-left-right-32)/span,(size.height-top-bottom-16)/(span*.78)));
 useEffect(()=>{const dx=(right-left)/2,dy=(bottom-top)/2;if(dx||dy)camera.setViewOffset(size.width,size.height,dx,dy,size.width,size.height);else camera.clearViewOffset();camera.updateProjectionMatrix();invalidate()},[camera,size.width,size.height,left,right,top,bottom]);
 const lockTilt=()=>{if(controls.current){const angle=Math.atan2(Math.hypot(camera.position.x,camera.position.z),camera.position.y-1.05);controls.current.minPolarAngle=controls.current.maxPolarAngle=angle}};
 const settle=()=>{camera.position.set(2.6,6.4,9.6);camera.zoom=fit;camera.updateProjectionMatrix();controls.current?.target.set(0,1.05,0);lockTilt();controls.current?.update()};
 useEffect(()=>{if(!initial.current){intro.current=false;settle()}initial.current=false},[reset]);
 useEffect(()=>{if(!intro.current||reduced){intro.current=false;settle()}invalidate()},[size.width,size.height,reduced,fit]);
 useFrame((_,delta)=>{
  if(!intro.current)return;
  elapsed.current+=Math.min(delta,.05);const t=Math.min(elapsed.current/2.6,1),e=1-Math.pow(1-t,3);
  // Decreasing azimuth gives the office a subtle clockwise turn on screen.
  const angle=THREE.MathUtils.lerp(.9,Math.atan2(2.6,9.6),e),radius=THREE.MathUtils.lerp(16,Math.hypot(2.6,9.6),e);
  camera.position.set(Math.sin(angle)*radius,THREE.MathUtils.lerp(10,6.4,e),Math.cos(angle)*radius);
  camera.zoom=fit*THREE.MathUtils.lerp(.7,1,e);camera.lookAt(0,1.05,0);camera.updateProjectionMatrix();
  controls.current?.target.set(0,1.05,0);lockTilt();controls.current?.update();if(t===1)intro.current=false;
 });return null
}
function Scene({agents,focusId,onSelect,read,reset,reduced,onReady,frame}){
 const controls=useRef(),intro=useRef(!reduced);
 useEffect(()=>{onReady?.()},[onReady]);
 return <><color attach="background" args={['#e7ebf0']}/><BotLighting/>
 <SharedOffice agents={agents} focusId={focusId} read={read} reduced={reduced} onSelect={onSelect}/>
 <Camera reset={reset} controls={controls} reduced={reduced} intro={intro} frame={frame}/><OrbitControls ref={controls} onStart={()=>{intro.current=false}} enablePan enableZoom screenSpacePanning mouseButtons={{LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN}} touches={{ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN}} minZoom={12} maxZoom={220} target={[0,1.05,0]} enableDamping={!reduced} dampingFactor={.08}/></>
}
export default function Office({agents=[],onSelect,onSettings,read=[],...props}){
 const [visible,setVisible]=useState(true);
 const [focusId,setFocusId]=useState(null);
 useEffect(()=>{const fn=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',fn);return()=>document.removeEventListener('visibilitychange',fn)},[]);
 useEffect(()=>{if(focusId&&!agents.some(agent=>agent.id===focusId))setFocusId(agents[0]?.id??null)},[agents,focusId]);
 const focus=agents.find(agent=>agent.id===focusId)||agents.find(agent=>agent.event&&!read.includes(agent.id))||agents[0];
 return <div className="three-office" aria-label="可旋轉的共享辦公室">
  <Canvas orthographic shadows dpr={[1,1.5]} frameloop={!visible?'never':props.reduced?'demand':'always'} camera={{position:[10,9,12],zoom:28,near:.1,far:90}} gl={{antialias:true,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.shadowMap.type=THREE.PCFSoftShadowMap;gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.05}}><Scene {...props} agents={agents} focusId={focus?.id} onSelect={onSelect} read={read}/></Canvas>
  {focus&&<p className="agent-dock-caption"><strong>{focus.name}</strong><span>{focus.role}</span></p>}
  <AgentDock agents={agents} activeId={focus?.id} read={read} onFocus={setFocusId} onSettings={onSettings}/>
 </div>;
}
