import React,{useCallback,useEffect,useRef,useState} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {ChevronLeft,ChevronRight,Settings} from 'lucide-react';
import {BotLighting} from './office-bots.jsx';
import {botVariantFor,isAgentAlert} from './bot-variants.js';
import {RobotRow,ROW_PITCH} from './office-desk.jsx';
import {AgentPortrait,AlertPoint} from './bot-avatar.jsx';
function AgentDock({agents,activeId,read,onFocus,onSettings}){
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
 })}</div>;
}
function rowBounds(count,halfView){
 const last=Math.max(0,count-1)*ROW_PITCH,edge=1.7;
 const min=halfView-edge,max=last+edge-halfView;
 if(count<=1||min>max)return{min:last/2,max:last/2};
 return{min,max};
}
function RowCamera({count,focusIndex,onSettle,reduced,frame}){
 const {camera,size,gl,invalidate}=useThree();
 const target=useRef(0),current=useRef(0),drag=useRef(null),wheelTimer=useRef();
 const {left=0,right=0,top=0,bottom=0}=frame?.(size.width,size.height)||{};
 const freeW=Math.max(280,size.width-left-right-72),freeH=Math.max(280,size.height-top-bottom-12);
 const zoom=Math.max(24,Math.min(freeW/(ROW_PITCH*3.85),freeH/4.5));
 const bounds=rowBounds(count,freeW/zoom/2);
 const clamp=value=>Math.min(bounds.max,Math.max(bounds.min,value));
 useEffect(()=>{const dx=(right-left)/2,dy=(bottom-top)/2;if(dx||dy)camera.setViewOffset(size.width,size.height,dx,dy,size.width,size.height);else camera.clearViewOffset();camera.zoom=zoom;camera.updateProjectionMatrix();invalidate()},[camera,size.width,size.height,left,right,top,bottom,zoom,invalidate]);
 useEffect(()=>{target.current=clamp(Math.max(0,focusIndex)*ROW_PITCH);if(reduced)current.current=target.current;invalidate()},[focusIndex,bounds.min,bounds.max,reduced,invalidate]);
 useEffect(()=>{
  const el=gl.domElement;
  const nearest=x=>{let best=0,dist=Infinity;for(let i=0;i<count;i++){const d=Math.abs(i*ROW_PITCH-x);if(d<dist){dist=d;best=i}}return best};
  const finish=()=>{clearTimeout(wheelTimer.current);wheelTimer.current=setTimeout(()=>onSettle?.(nearest(target.current)),reduced?0:180)};
  const down=e=>{if(e.button!==0)return;drag.current={x:e.clientX,moved:false};el.setPointerCapture?.(e.pointerId)};
  const move=e=>{if(!drag.current)return;const dx=e.clientX-drag.current.x;if(Math.abs(dx)>3)drag.current.moved=true;drag.current.x=e.clientX;target.current=clamp(target.current-dx/camera.zoom);invalidate()};
  const up=e=>{if(!drag.current)return;const moved=drag.current.moved;drag.current=null;if(moved){const stop=ev=>{ev.stopPropagation();el.removeEventListener('click',stop,true)};el.addEventListener('click',stop,true);finish()}};
  const wheel=e=>{e.preventDefault();const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;target.current=clamp(target.current+delta/camera.zoom);invalidate();finish()};
  el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('wheel',wheel,{passive:false});
  return()=>{clearTimeout(wheelTimer.current);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('wheel',wheel)};
 },[gl,camera,count,bounds.min,bounds.max,reduced,onSettle,invalidate]);
 useFrame((_,delta)=>{
  const k=reduced?1:1-Math.exp(-delta*7);
  current.current+= (target.current-current.current)*k;
  camera.position.set(current.current+.1,3.15,6.6);
  camera.lookAt(current.current,2.85,.12);
  camera.zoom=zoom;camera.updateProjectionMatrix();
 });
 return null;
}
function Scene({agents,focusId,cameraIndex=2,onSelect,onSettle,read,reduced,onReady,frame}){
 useEffect(()=>{onReady?.()},[onReady]);
 return <><color attach="background" args={['#e7ebf0']}/><BotLighting/>
 <RobotRow agents={agents} focusId={focusId} read={read} reduced={reduced} onSelect={onSelect}/>
 <RowCamera count={agents.length} focusIndex={cameraIndex} onSettle={onSettle} reduced={reduced} frame={frame}/></>
}
export default function Office({agents=[],onSelect,onSettings,read=[],...props}){
 const [visible,setVisible]=useState(true);
 const [focusId,setFocusId]=useState(null);
 const [cameraIndex,setCameraIndex]=useState(1.88);
 useEffect(()=>{const fn=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',fn);return()=>document.removeEventListener('visibilitychange',fn)},[]);
 useEffect(()=>{if(focusId&&!agents.some(agent=>agent.id===focusId))setFocusId(agents[0]?.id??null)},[agents,focusId]);
 const focus=agents.find(agent=>agent.id===focusId)||agents.find(agent=>agent.event&&!read.includes(agent.id))||agents[0];
 const focusIndex=Math.max(0,agents.findIndex(agent=>agent.id===focus?.id));
 const choose=useCallback(id=>{const index=agents.findIndex(agent=>agent.id===id);if(index>=0)setCameraIndex(index);setFocusId(id)},[agents]);
 const settle=useCallback(index=>{const agent=agents[index];if(agent){setCameraIndex(index);setFocusId(agent.id)}},[agents]);
 return <div className="three-office" aria-label="可左右瀏覽的 Agent 工作桌">
  <Canvas orthographic shadows dpr={[1,1.5]} frameloop={!visible?'never':props.reduced?'demand':'always'} camera={{position:[1,2.6,6.7],zoom:40,near:.1,far:40}} gl={{antialias:true,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.shadowMap.type=THREE.PCFSoftShadowMap;gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.05}}><Scene {...props} agents={agents} focusId={focus?.id} cameraIndex={cameraIndex} onSelect={onSelect} onSettle={settle} read={read}/></Canvas>
  <button type="button" className="agent-row-arrow is-prev" aria-label="往左看" disabled={focusIndex<=0} onClick={()=>agents[focusIndex-1]&&choose(agents[focusIndex-1].id)}><ChevronLeft size={22}/></button>
  <button type="button" className="agent-row-arrow is-next" aria-label="往右看" disabled={focusIndex>=agents.length-1} onClick={()=>agents[focusIndex+1]&&choose(agents[focusIndex+1].id)}><ChevronRight size={22}/></button>
  {focus&&<p className="agent-dock-caption"><strong>{focus.name}</strong><span>{focus.role}</span></p>}
  <AgentDock agents={agents} activeId={focus?.id} read={read} onFocus={choose} onSettings={onSettings}/>
 </div>;
}
