import React,{useLayoutEffect,useRef} from 'react';
import {Billboard,Html,Line} from '@react-three/drei';
import {useFrame} from '@react-three/fiber';
import {useOvertime} from './OvertimeStory';
import AvatarBust from './AvatarBust';
import {useSceneUI} from './SceneUI';

// Shape, hairstyle and accessories identify each person independently of colour.
export const people=[
 {name:'柏宇',role:'工程師',color:'#769fc8',skin:'#e8c4a8',hair:'#3f495a',at:[-1.65,2.55,.45],hours:'44h'},
 {name:'佳穎',role:'客服',color:'#d69b87',skin:'#efcdb6',hair:'#715442',at:[-.05,3.15,.2],hours:'41.5h'},
 {name:'陳經理',role:'主管',color:'#9c8abd',skin:'#dbb493',hair:'#55535c',at:[1.65,2.65,.4],hours:null},
];
export function Portrait({person,index,time,reduced,appearAt=6+index*.65,completed,showHours=true,badge="!",badgeClass="",badgeLabel,detailLayer=[5,0],badgeLayer=[20,15],detailPosition=[0,-.72,.6],children}){
 const overlay=useSceneUI();
 const root=useRef();
 useLayoutEffect(()=>{root.current.traverse(node=>{if(node.isMesh)node.layers.set(1);});},[]);
 const done=completed??(time>=16);
 useFrame(()=>{const show=reduced?1:Math.min(1,Math.max(0,(time-appearAt)/.8));root.current.scale.setScalar(Math.max(.001,show));root.current.visible=show>0;root.current.position.y=person.at[1]+(!reduced&&time<16?Math.sin(time*1.6+index)*.035:0);});
 return <group ref={root} position={person.at}><Billboard>
  <mesh><circleGeometry args={[.59,48]}/><meshStandardMaterial color={index===0?'#dce8f3':index===1?'#f1dfd6':'#e6dfef'} roughness={.7}/></mesh>
  <mesh position={[0,0,.025]}><torusGeometry args={[.57,.018,12,64]}/><meshStandardMaterial color={person.color}/></mesh>
  <AvatarBust person={person} index={index}/>
  {(reduced||time>=appearAt)&&<>
   <Html portal={overlay} position={[.4,.46,.6]} center zIndexRange={badgeLayer}><div className={`ot-alert-badge${done?' is-done':badgeClass}`} role="img" aria-label={badgeLabel||(done?'已通知確認':'工時預警')}>{done?'✓':badge}</div></Html>
   <Html portal={overlay} position={detailPosition} center zIndexRange={detailLayer}>{children||<div className="ot-person-label"><strong>{person.name}</strong><span className={person.hours?'ot-hours':''}>{person.hours||person.role}</span>{showHours&&person.hours&&<em>+{index===0?'4':'1.5'}h</em>}</div>}</Html>
  </>}
 </Billboard></group>;
}
function Signal({to,color,index,time,reduced}){
 const dot=useRef();const from=[-.45,1.55,-.5];
 useFrame(()=>{const sending=time>=9&&time<15,returning=time>=15&&time<18;dot.current.visible=sending||returning;const u=reduced?.5:((time-(sending?9:15))*.6+index*.23)%1;const t=returning?1-u:u;dot.current.position.set(...from.map((v,i)=>v+(to[i]-v)*t));});
 return <><Line points={[from,to]} color={color} lineWidth={1} transparent opacity={time>=9?.38:0}/><mesh ref={dot}><sphereGeometry args={[.065,12,8]}/><meshBasicMaterial color={color}/></mesh></>;
}
export default function OvertimePeople({reduced}){
 const {time}=useOvertime();
 return <group>{people.map((person,i)=><React.Fragment key={person.name}><Portrait person={person} index={i} time={time} reduced={reduced}/><Signal to={person.at} color={person.color} index={i} time={time} reduced={reduced}/></React.Fragment>)}</group>;
}
