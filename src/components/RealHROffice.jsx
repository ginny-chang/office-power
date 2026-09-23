import {visibleStoryPerson} from './hr-workspace/StoryVisuals';
import React,{useEffect,useRef} from 'react';
import * as THREE from 'three';
import {createHRWorkspace,overtimeStep,STEP_LABELS} from './hr-workspace/HRWorkspace';
import {dispatchStep,DISPATCH_LABELS,dispatchCard,dispatchConnection} from './hr-workspace/DispatchStory';
import {leaveStep,LEAVE_LABELS,leaveCard,leaveConnection} from './hr-workspace/LeaveStory';
import {contractStep,CONTRACT_LABELS,contractCard,contractConnection} from './hr-workspace/ContractStory';
import {punchStep,PUNCH_LABELS,punchCard,punchConnection} from './hr-workspace/PunchStory';
import {useOvertime} from './OvertimeStory';
import './real-hr-office.css';

const people=[['柏宇','boyu','#dce7f4','44h · 剩 2h'],['佳穎','jiaying','#f3ded6','41.5h'],['陳經理','manager','#e5e0ef','直屬主管']];
export default function RealHROffice({onReadyChange,scenario='overtime'}){
 const wires=useRef(),paths=useRef([]),cards=useRef(),connectionsDirty=useRef(true);
 const host=useRef(),clock=useOvertime(),state=useRef(clock),ready=useRef(onReadyChange);state.current=clock;ready.current=onReadyChange;
 const punch=scenario==='punch',contract=scenario==='contract',leave=scenario==='leave',dispatch=scenario==='dispatch',t=clock.reduced?28:clock.time,step=punch?punchStep(t):contract?contractStep(t):leave?leaveStep(t):dispatch?dispatchStep(t):overtimeStep(t);
 const labels=punch?PUNCH_LABELS:contract?CONTRACT_LABELS:leave?LEAVE_LABELS:dispatch?DISPATCH_LABELS:STEP_LABELS;
 useEffect(()=>{connectionsDirty.current=true;},[step]);
 useEffect(()=>{
  const container=host.current;let renderer,world,frame,observer,visible=true,lastTime=-1,timeChanged=performance.now();
  try{
   renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;container.appendChild(renderer.domElement);
   world=createHRWorkspace({scenario});const camera=new THREE.OrthographicCamera(-4,4,3,-3,.1,60);camera.position.set((leave||contract||punch)?6.25:6.5,5.5,(leave||contract||punch)?8.15:8);camera.lookAt(0,.9,0);
   const resize=()=>{const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const aspect=w/h,size=Math.max(6.3,6.8/aspect);camera.left=-size*aspect/2;camera.right=size*aspect/2;camera.top=size/2;camera.bottom=-size/2;camera.updateProjectionMatrix();connectionsDirty.current=true;};
   observer=new ResizeObserver(resize);observer.observe(container);resize();
   const visibility=new IntersectionObserver(([e])=>visible=e.isIntersecting);visibility.observe(container);
   const anchor=new THREE.Vector3();
   let lastReduced=false,drawn=false;
   function connectCards(){
    if(!cards.current||!wires.current)return;
    const rect=container.getBoundingClientRect();
    camera.updateMatrixWorld();world.robot.object.updateWorldMatrix(true,false);
    anchor.set(0,.04,0);world.robot.object.localToWorld(anchor);anchor.project(camera);
    const x=(anchor.x+1)*rect.width/2,y=(1-anchor.y)*rect.height/2;
    wires.current.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);
    [...cards.current.children].forEach((card,i)=>{
     i=Number(card.dataset.person);
     const box=card.getBoundingClientRect(),endX=box.left+box.width/2-rect.left,endY=box.top-rect.top-7;
     const middleX=x+(endX-x)*.65;
     paths.current[i]?.setAttribute('d',`M ${x} ${y} Q ${middleX} ${y-8}, ${endX} ${endY}`);
    });
   }
   function draw(now){
    frame=requestAnimationFrame(draw);if(document.hidden||!visible)return;
    const {time,reduced,getTime}=state.current;
    if(time!==lastTime){lastTime=time;timeChanged=now;}
    const t=reduced?28:Math.min(28.999,getTime?getTime():time+Math.min(.10,(now-timeChanged)/1000));
    if(dispatch){
     const slide=reduced?1:THREE.MathUtils.smoothstep(t,0,1.8),x=6.5-.25*slide;
     if(camera.position.x!==x){camera.position.set(x,5.5,8+.15*slide);camera.lookAt(0,.9,0);connectionsDirty.current=true;}
    }
    if(connectionsDirty.current){connectCards();connectionsDirty.current=false;drawn=false;}
    if(reduced&&lastReduced&&drawn)return;
    world.update(t,{reducedMotion:reduced});renderer.render(world.scene,camera);
    lastReduced=reduced;drawn=true;
   }
   frame=requestAnimationFrame(draw);ready.current?.(true);
   return()=>{cancelAnimationFrame(frame);observer.disconnect();visibility.disconnect();world.dispose();renderer.dispose();renderer.domElement.remove();};
  }catch(error){console.error('HR 3D office:',error);container.textContent='3D 場景載入失敗，請重新整理或啟用 WebGL。';ready.current?.(false);world?.dispose();renderer?.dispose();observer?.disconnect();}
 },[scenario]);
 return <div className={`real-hr-office ${punch?'real-hr-office--punch':contract?'real-hr-office--contract':leave?'real-hr-office--leave':dispatch?'real-hr-office--dispatch':''}`} aria-label={`${punch?'補卡一句話完成':contract?'試用期／合約到期提醒':leave?'特休到期預警':dispatch?'月結出勤異常派件':'加班時數守門員'} 3D 辦公室動畫`}>
  <div className="real-hr-canvas" ref={host}/>
  <div className="real-hr-status" key={step}><span>{String(step+1).padStart(2,'0')} / {String(labels.length).padStart(2,'0')}</span>{labels[step]}</div>
  <svg ref={wires} className={`real-hr-connections ${(punch?step===0||step===4:(leave||contract)?step===3||step===4:dispatch?step>=2&&step<=6:step>=4&&step<=6)?'is-visible':''} ${step===5?'is-reply':''}`} aria-hidden="true">
   {people.map(([name,id],i)=><path key={`${id}-${step}`} ref={node=>paths.current[i]=node} style={{'--wire-delay':i*.12+'s',display:(!visibleStoryPerson(scenario,step,i)|| (punch?!punchConnection(step,i):contract?!contractConnection(step,i):leave?!leaveConnection(step,i):dispatch&&!dispatchConnection(step,i)))?'none':undefined}} />)}
  </svg>
  {(punch||step>=((dispatch||leave||contract)?2:3))&&<div className="real-hr-cards" ref={cards}>{people.map(([name,id,tint,value],i)=>{if(!visibleStoryPerson(scenario,step,i))return null;const detail=punch?punchCard(step,i):contract?contractCard(step,i,t):leave?leaveCard(step,i,t):dispatch?dispatchCard(step,i):null,done=detail?detail.done:step>=6||(step===5&&i<2);return <div key={id} data-person={i} className={`real-hr-card ${(detail?detail.focus:i===2&&step===5)?'is-processing':''}`} style={{'--tint':tint,'--delay':i*.15+'s'}}>
   {(detail?detail.line:step===4)&&<span className="real-hr-line">LINE</span>}<span className={`real-hr-badge ${done?'is-done':detail?.waiting?'is-waiting':''}`}>{detail?detail.badge:done?'✓':step===4?'↗':'!'}</span>
   <div className="real-hr-avatar"><img src={`${import.meta.env.BASE_URL}hr-workspace/${id}.png`} alt=""/></div><strong>{name}</strong><b>{detail?detail.value:value}</b><small>{detail?detail.status:step===3?(i<2?'超過 40h 預警線':'收到團隊預警'):step===4?'LINE 通知已送出':step===5?(i<2?'員工已回覆':'等待主管處理'):step===6?'排班調整已確認':'已記錄 · HR 已收到'}</small>
  </div>;})}</div>}
 </div>;
}
