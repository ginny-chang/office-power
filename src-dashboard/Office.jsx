import React,{useCallback,useEffect,useState} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {ChevronLeft,ChevronRight,Plus,Settings} from 'lucide-react';
import {BotLighting} from './office-bots.jsx';
import {botVariantFor,isAgentAlert} from './bot-variants.js';
import {RobotRow,ROW_PITCH} from './office-desk.jsx';
import {AgentPortrait,AlertPoint} from './bot-avatar.jsx';
function AgentDock({agents,activeId,read,onFocus,onSettings,onAdd}){
 return <div className="agent-dock" role="listbox" aria-label="Agent">{agents.map(agent=>{
  const fresh=!!(agent.event&&agent.published!==false&&!read.includes(agent.id));
  const alert=isAgentAlert(agent);
  const selected=agent.id===activeId;
  const label=[agent.name,fresh?'有新動態':null,alert?'等待你':null].filter(Boolean).join('，');
  return <div key={agent.id} className={`agent-dock-item${selected?' is-selected':''}${fresh?' has-update':''}`} role="presentation">
   <button type="button" role="option" aria-selected={selected} className="agent-dock-avatar" aria-label={label} onClick={()=>onFocus(agent.id)}><AgentPortrait variant={botVariantFor(agent)}/></button>
   {alert&&<AlertPoint/>}
   {onSettings&&<button type="button" className="agent-dock-settings" aria-label={`設定 ${agent.name}`} onClick={()=>onSettings(agent.id)}><Settings size={16}/></button>}
  </div>;
 })}{onAdd&&<button type="button" className="agent-dock-add" aria-label="新增 Agent" onClick={onAdd}><Plus size={20}/></button>}</div>;
}
function StageCamera({count,frame}){
 const {camera,size,invalidate}=useThree();
 const {left=0,right=0,top=0,bottom=0}=frame?.(size.width,size.height)||{};
 const freeW=Math.max(280,size.width-left-right-72);
 const distance=8.2;
 const span=((Math.max(count-1,1)*ROW_PITCH)+8.2)*(size.width/freeW);
 const aspect=size.width/Math.max(1,size.height);
 const fov=2*Math.atan((span/2)/distance/aspect)*(180/Math.PI);
 useEffect(()=>{const dx=(right-left)/2,dy=(bottom-top)/2;if(dx||dy)camera.setViewOffset(size.width,size.height,dx,dy,size.width,size.height);else camera.clearViewOffset();camera.fov=fov;camera.zoom=1;camera.updateProjectionMatrix();invalidate()},[camera,size.width,size.height,left,right,top,bottom,fov,invalidate]);
 useFrame(()=>{
  camera.position.set(0,2.2,distance);
  camera.lookAt(0,4.7,.2);
  camera.fov=fov;camera.zoom=1;camera.updateProjectionMatrix();
 });
 return null;
}
function Scene({agents,focusId,onSelect,read,reduced,onReady,frame}){
 useEffect(()=>{onReady?.()},[onReady]);
 return <><color attach="background" args={['#e7ebf0']}/><BotLighting/>
 <RobotRow agents={agents} focusId={focusId} read={read} reduced={reduced} onSelect={onSelect}/>
 <StageCamera count={agents.length} frame={frame}/></>
}
export default function Office({agents=[],onSelect,onSettings,onAdd,read=[],...props}){
 const [visible,setVisible]=useState(true);
 const [focusId,setFocusId]=useState(null);
 useEffect(()=>{const fn=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',fn);return()=>document.removeEventListener('visibilitychange',fn)},[]);
 useEffect(()=>{if(focusId&&!agents.some(agent=>agent.id===focusId))setFocusId(agents[0]?.id??null)},[agents,focusId]);
 const focus=agents.find(agent=>agent.id===focusId)||agents.find(agent=>agent.event&&!read.includes(agent.id))||agents[0];
 const focusIndex=Math.max(0,agents.findIndex(agent=>agent.id===focus?.id));
 const choose=useCallback(id=>setFocusId(id),[]);
 return <div className="three-office" aria-label="可左右瀏覽的 Agent 工作桌">
  <Canvas shadows dpr={[1,1.5]} frameloop={!visible?'never':props.reduced?'demand':'always'} camera={{position:[0,2.2,8.2],fov:42,near:.1,far:80}} gl={{antialias:true,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.shadowMap.type=THREE.PCFSoftShadowMap;gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.05}}><Scene {...props} agents={agents} focusId={focus?.id} onSelect={onSelect} read={read}/></Canvas>
  <button type="button" className="agent-row-arrow is-prev" aria-label="往左看" disabled={focusIndex<=0} onClick={()=>agents[focusIndex-1]&&choose(agents[focusIndex-1].id)}><ChevronLeft size={22}/></button>
  <button type="button" className="agent-row-arrow is-next" aria-label="往右看" disabled={focusIndex>=agents.length-1} onClick={()=>agents[focusIndex+1]&&choose(agents[focusIndex+1].id)}><ChevronRight size={22}/></button>
  {focus&&<p className="agent-dock-caption"><strong>{focus.name}</strong><span>{focus.role}</span></p>}
  <AgentDock agents={agents} activeId={focus?.id} read={read} onFocus={choose} onSettings={onSettings} onAdd={onAdd}/>
 </div>;
}
