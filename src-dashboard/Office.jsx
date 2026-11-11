import React,{useCallback,useEffect,useRef,useState} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {ChevronLeft,ChevronRight,Plus,Settings} from 'lucide-react';
import {BotLighting} from './office-bots.jsx';
import {botVariantFor,isAgentAlert} from './bot-variants.js';
import {RobotRow,ROW_PITCH} from './office-desk.jsx';
import {OriginalBoard} from './office-original.jsx';
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
function StageCamera({count,focusIndex,onSettle,reduced,frame}){
 const {camera,size,gl,invalidate}=useThree();
 const target=useRef(0),current=useRef(0),drag=useRef(null),wheelTimer=useRef();
 const {left=0,right=0,top=0,bottom=0}=frame?.(size.width,size.height)||{};
 const freeW=Math.max(280,size.width-left-right-72);
 const distance=9.4;
 const span=(ROW_PITCH*3.05+1.8)*(size.width/freeW);
 const aspect=size.width/Math.max(1,size.height);
 const fov=2*Math.atan((span/2)/distance/aspect)*(180/Math.PI);
 const worldPerPixel=(2*Math.tan((fov*Math.PI/180)/2)*distance)/Math.max(1,size.height);
 const last=Math.max(0,count-1)*ROW_PITCH;
 const clamp=value=>Math.min(last,Math.max(0,value));
 useEffect(()=>{const dx=(right-left)/2,dy=(bottom-top)/2;if(dx||dy)camera.setViewOffset(size.width,size.height,dx,dy,size.width,size.height);else camera.clearViewOffset();camera.fov=fov;camera.zoom=1;camera.updateProjectionMatrix();invalidate()},[camera,size.width,size.height,left,right,top,bottom,fov,invalidate]);
 useEffect(()=>{target.current=clamp(Math.max(0,focusIndex)*ROW_PITCH);if(reduced)current.current=target.current;invalidate()},[focusIndex,last,reduced,invalidate]);
 useEffect(()=>{
  const el=gl.domElement;
  const nearest=x=>{let best=0,dist=Infinity;for(let i=0;i<count;i++){const d=Math.abs(i*ROW_PITCH-x);if(d<dist){dist=d;best=i}}return best};
  const finish=()=>{clearTimeout(wheelTimer.current);wheelTimer.current=setTimeout(()=>onSettle?.(nearest(target.current)),reduced?0:180)};
  const down=e=>{if(e.button!==0)return;drag.current={x:e.clientX,moved:false};el.setPointerCapture?.(e.pointerId)};
  const move=e=>{if(!drag.current)return;const dx=e.clientX-drag.current.x;if(Math.abs(dx)>3)drag.current.moved=true;drag.current.x=e.clientX;target.current=clamp(target.current-dx*worldPerPixel);invalidate()};
  const up=e=>{if(!drag.current)return;const moved=drag.current.moved;drag.current=null;if(moved){const stop=ev=>{ev.stopPropagation();el.removeEventListener('click',stop,true)};el.addEventListener('click',stop,true);finish()}};
  const wheel=e=>{e.preventDefault();const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;target.current=clamp(target.current+delta*worldPerPixel);invalidate();finish()};
  el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('wheel',wheel,{passive:false});
  return()=>{clearTimeout(wheelTimer.current);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.removeEventListener('wheel',wheel)};
 },[gl,camera,count,last,reduced,onSettle,invalidate,worldPerPixel]);
 useFrame((_,delta)=>{
  const k=reduced?1:1-Math.exp(-delta*7);
  current.current+=(target.current-current.current)*k;
  const x=current.current;
  camera.position.set(x,1.08,distance);
  camera.lookAt(x,1.08,0);
  camera.fov=fov;camera.zoom=1;camera.updateProjectionMatrix();
 });
 return null;
}
function RowScene({agents,focusId,focusIndex,onSelect,onSettle,read,reduced,onReady,frame}){
 useEffect(()=>{onReady?.()},[onReady]);
 return <><color attach="background" args={['#e7ebf0']}/><BotLighting/>
 <RobotRow agents={agents} focusId={focusId} read={read} reduced={reduced} onSelect={onSelect}/>
 <StageCamera count={agents.length} focusIndex={focusIndex} onSettle={onSettle} reduced={reduced} frame={frame}/></>
}
export default function Office({agents=[],onSelect,onSettings,onAdd,read=[],layout='row',...props}){
 const [visible,setVisible]=useState(true);
 const [focusId,setFocusId]=useState(null);
 const [stageHover,setStageHover]=useState(false);
 const board=layout==='board';
 useEffect(()=>{const fn=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',fn);return()=>document.removeEventListener('visibilitychange',fn)},[]);
 useEffect(()=>{if(focusId&&!agents.some(agent=>agent.id===focusId))setFocusId(agents[0]?.id??null)},[agents,focusId]);
 const focus=agents.find(agent=>agent.id===focusId)||agents.find(agent=>agent.event&&!read.includes(agent.id))||agents[0];
 const focusIndex=Math.max(0,agents.findIndex(agent=>agent.id===focus?.id));
 const choose=useCallback(id=>setFocusId(id),[]);
 const settle=useCallback(index=>{const agent=agents[index];if(agent)setFocusId(agent.id)},[agents]);
 // The row sits a little below the middle of the stage, closer to the dock, instead of riding high under the toolbar
 const rowFrame=(w,h)=>{const base=props.frame?.(w,h)||{};return window.innerWidth>720?{...base,bottom:(base.bottom??0)-112}:base};
 // The office has no dock under it, so it centres in the space below the toolbar rather than in the whole stage
 const boardFrame=(w,h)=>{const base=props.frame?.(w,h)||{};return window.innerWidth>720?{...base,top:156,bottom:36}:{...base,bottom:Math.min(base.bottom??0,88)}};
 const glProps={antialias:true,powerPreference:'high-performance'};
 const onCreated=({gl})=>{gl.shadowMap.type=THREE.PCFSoftShadowMap;gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.05};
 return <div className={`three-office${board?' is-board':''}${stageHover?' is-hover':''}`} aria-label={board?'Agent 辦公室':'可左右瀏覽的 Agent 工作桌'} onMouseEnter={()=>setStageHover(true)} onMouseLeave={()=>setStageHover(false)}>
  {board
   ?<OriginalBoard {...props} visible={visible} agents={agents} read={read} onSelect={onSelect} onSettings={onSettings} frame={boardFrame}/>
   :<Canvas key="row" shadows dpr={[1,1.5]} frameloop={!visible?'never':props.reduced?'demand':'always'} camera={{position:[2,1.08,9.4],fov:42,near:.1,far:90}} gl={glProps} onCreated={onCreated}><RowScene {...props} frame={rowFrame} agents={agents} focusId={focus?.id} focusIndex={focusIndex} onSelect={onSelect} onSettle={settle} read={read}/></Canvas>}
  {!board&&<button type="button" className="agent-row-arrow is-prev" aria-label="往左看" disabled={focusIndex<=0} onClick={()=>agents[focusIndex-1]&&choose(agents[focusIndex-1].id)}><ChevronLeft size={22}/></button>}
  {!board&&<button type="button" className="agent-row-arrow is-next" aria-label="往右看" disabled={focusIndex>=agents.length-1} onClick={()=>agents[focusIndex+1]&&choose(agents[focusIndex+1].id)}><ChevronRight size={22}/></button>}
  {!board&&focus&&<p className="agent-dock-caption"><strong>{focus.name}</strong><span>{focus.role}</span></p>}
  {!board&&<AgentDock agents={agents} activeId={focus?.id} read={read} onFocus={choose} onSettings={onSettings} onAdd={onAdd}/>}
 </div>;
}
