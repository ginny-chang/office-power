import React,{useMemo,useRef} from 'react';
import * as THREE from 'three';
import {Billboard,Html} from '@react-three/drei';
import {useFrame,useThree} from '@react-three/fiber';
import {Box} from './OfficeScene';
import {people,Portrait} from './OvertimePeople';
import {useOvertime} from './OvertimeStory';
import {dispatchState} from './dispatch-story';

// Keep each person in a separate screen column while retaining a 3D bust.
function RosterSlot({column,summary=false,faceWidth=90,target,children}){
 const ref=useRef();
 const vectors=useMemo(()=>({anchor:new THREE.Vector3(),world:new THREE.Vector3(),edge:new THREE.Vector3(),scale:new THREE.Vector3(),rotation:new THREE.Quaternion()}),[]);
 useFrame(({camera,size})=>{
  const group=ref.current,parent=group.parent,mobile=size.width<=650;
  parent.updateWorldMatrix(true,false);
  const cardWidth=mobile?Math.min(100,size.width*.28):Math.min(142,size.width*.17);
  const gap=mobile?8:16;
  const center=mobile?size.width*.5:Math.min(size.width*.72,size.width-cardWidth*1.5-gap-16);
  const x=(center+(summary?0:(column-1)*(cardWidth+gap)))/size.width;
  const y=summary?(mobile?.64:.23):(mobile?.77:.43);
  // Use the room's depth, then unproject screen columns back into its coordinates.
  vectors.anchor.set(0,2.9,.4);parent.localToWorld(vectors.anchor);vectors.anchor.project(camera);
  vectors.world.set(x*2-1,1-y*2,vectors.anchor.z).unproject(camera);
  vectors.edge.set(x*2-1+2/size.width,1-y*2,vectors.anchor.z).unproject(camera);
  const unitsPerPixel=vectors.world.distanceTo(vectors.edge);
  parent.worldToLocal(vectors.world);group.position.copy(vectors.world);
  parent.getWorldQuaternion(vectors.rotation);group.quaternion.copy(vectors.rotation.invert()).multiply(camera.quaternion);
  parent.getWorldScale(vectors.scale);group.scale.setScalar(unitsPerPixel*faceWidth/1.18/vectors.scale.x);
  if(target)target.at.splice(0,3,...group.position.toArray());
 });
 return <group ref={ref}>{children}</group>;
}
function MessageIcon(){return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 10.5c0 4-3.6 7-8 7H9l-4 3v-5C3 14 2 12.5 2 10.5 2 6.5 6 3 11 3s9 3.5 9 7.5Z" fill="currentColor"/><path d="M7 9h8M7 12h5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
function Delivery({person,row,time,reduced}){
 const packet=useRef(),path=useRef();const vertices=useMemo(()=>new Float32Array(6),[]);const from=[-.45,1.9,-1.1];
 useFrame(()=>{
  const positions=path.current.geometry.attributes.position;
  positions.setXYZ(0,...from);positions.setXYZ(1,...person.at);positions.needsUpdate=true;
  path.current.visible=time>=row.sentAt-1.2;
  const outbound=time>=row.sentAt-1.2&&time<row.sentAt;
  const inbound=Number.isFinite(row.doneAt)&&time>=row.doneAt-1.2&&time<row.doneAt;
  packet.current.visible=!reduced&&(outbound||inbound);
  const u=Math.min(1,Math.max(0,(time-((outbound?row.sentAt:row.doneAt)-1.2))/1.2));
  const progress=inbound?1-u:u;
  packet.current.position.set(...from.map((v,i)=>v+(person.at[i]-v)*progress));
 });
 return <>
  <line ref={path} frustumCulled={false}><bufferGeometry><bufferAttribute attach="attributes-position" args={[vertices,3]}/></bufferGeometry><lineBasicMaterial color={row.done?'#67ad85':person.color} transparent opacity={.4}/></line>
  <group ref={packet}><Billboard><Box size={[.23,.16,.035]} color="#77c997" radius={.03}/><Box at={[0,.015,.025]} size={[.13,.018,.01]} color="#fff"/><Box at={[-.025,-.03,.025]} size={[.08,.015,.01]} color="#fff"/></Billboard></group>
 </>;
}
function PaperChase({time}){
 if(time>=4)return null;
 return <group position={[-.4,2.4,.4]}><Billboard>
  {[0,1,2].map(i=><group key={i} position={[(i-1)*.55,(i===1?.12:0),i*.045]} rotation={[0,0,(i-1)*-.13]}><Box size={[.62,.84,.025]} color="#f6f2ea"/>{[0,1,2,3].map(j=><React.Fragment key={j}><Box at={[-.19,.24-j*.15,.025]} size={[.065,.065,.01]} color="#dba85e"/><Box at={[.045,.24-j*.15,.025]} size={[.3,.025,.01]} color="#aeb7c1"/></React.Fragment>)}</group>)}
  <Html center position={[0,-.72,.3]} zIndexRange={[8,6]}><div className="dispatch-manual"><span>◷</span><strong>2–3 天</strong><small>印清單 · 逐一催回覆</small></div></Html>
 </Billboard></group>;
}
export default function DispatchPeople({reduced}){
 const {time}=useOvertime();const state=dispatchState(time);
 const {size}=useThree();const mobile=size.width<=650;
 const faceWidth=mobile?Math.min(64,size.width*.2):Math.min(100,size.width*.12);
 const cardWidth=mobile?Math.min(100,size.width*.28):Math.min(142,size.width*.17);
 const detailY=-.59-(mobile?58:68)*1.18/faceWidth;
 const recipients=useMemo(()=>people.map(p=>({...p,at:[...p.at]})),[]);
 return <group>
  <PaperChase time={time}/>
  {time>=4&&<RosterSlot summary><Html center zIndexRange={[9,6]}><div className="dispatch-summary"><span>{state.phase==='scan'?'掃描缺卡':state.phase==='send'?'LINE 自動派件':'HR 待處理'}</span><strong>{state.pending}<small>人</small></strong><i>{state.completed}/3 已處理</i>{state.phase==='track'&&<b>{people.filter((_,i)=>!state.rows[i].done).map(p=>p.name).join(' · ')}</b>}</div></Html></RosterSlot>}
  {people.map((person,i)=>{
   const row=state.rows[i];
   return <React.Fragment key={person.name}>
    <RosterSlot column={i} faceWidth={faceWidth} target={recipients[i]}><Portrait person={{...person,at:[0,0,0]}} detailPosition={[0,detailY,0]} detailLayer={i===2?[60,60]:[40,40]} badgeLayer={i===2?[80,80]:[70,70]} index={i} time={time} reduced={reduced} appearAt={4+i*.4} completed={row.done} showHours={false} badge={row.sent?<MessageIcon/>:'!'} badgeClass={row.sent?' is-line':''} badgeLabel={row.done?'缺卡已處理':row.sent?'LINE 已派件，待處理':'已發現缺卡'}>
     <div style={{width:cardWidth}} className={`dispatch-detail${row.done?' is-done':''}`}>
      <header><strong>{person.name}</strong><span>{row.done?'✓ 已處理':row.sent?'LINE':'缺卡明細'}</span></header>
      <div className="dispatch-detail-row"><span>{row.date}</span><b>{row.issue}</b></div>
      <div className="dispatch-detail-row"><span>{row.expected}</span><i>{row.done?'已補登':'— —'}</i></div>
      <footer>{row.done?'回覆已同步 HR':row.sent?'待處理':'準備自動派件'}</footer>
     </div>
    </Portrait></RosterSlot>
    <Delivery person={recipients[i]} row={row} time={time} reduced={reduced}/>
   </React.Fragment>;
  })}
 </group>;
}
