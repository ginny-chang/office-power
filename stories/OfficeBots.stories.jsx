import React,{useEffect,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {OrbitControls,Html} from '@react-three/drei';
import * as THREE from 'three';
import {OfficeBot,BotLighting} from '../src-dashboard/office-bots.jsx';
import {DASHBOARD_BOTS} from '../src-dashboard/bot-variants.js';

const NOVA_BODY_BOTS=[
  {name:'大腦總管 NOVA',role:'團隊協作'},
  {name:'Office Power 指令中心',role:'平台調度',prop:'command'},
  {name:'Nova App 產生修改小幫手',role:'App 製作',prop:'app-helper'},
  {name:'專案助理',role:'專案協作',prop:'planner'},
];
import {AgentPortrait,AlertPoint} from '../src-dashboard/bot-avatar.jsx';

export default {
  title:'Product/Office bots',
  tags:['autodocs'],
  parameters:{docs:{description:{component:'大腦總管 NOVA、Office Power 指令中心、Nova App 產生修改小幫手與專案助理共用同一隻白色機器人。後三者各自帶一件道具：控制台、App 與扳手、月曆。其餘 Agent 維持各自的角色造型。'}}}
};

function useReduced(){
  const [reduced,set]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{const m=matchMedia('(prefers-reduced-motion: reduce)');const fn=()=>set(m.matches);m.addEventListener('change',fn);return()=>m.removeEventListener('change',fn)},[]);
  return reduced;
}

const spots=[[-3.3,2.55],[0,2.55],[3.3,2.55],[-3.3,-2.55],[0,-2.55],[3.3,-2.55]];

function Lineup({reduced}){
  return <>
    <color attach="background" args={['#f4f4f6']}/>
    <BotLighting/>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.02,0]} receiveShadow>
      <planeGeometry args={[24,16]}/>
      <meshStandardMaterial color="#f4f4f6" roughness={0.94}/>
    </mesh>
    {DASHBOARD_BOTS.map((bot,i)=><group key={bot.variant} position={[spots[i][0],0,spots[i][1]]}>
      <OfficeBot variant={bot.variant} reduced={reduced} alert={bot.variant==='hr'} rest={0.18} index={i} scale={0.96}/>
      <Html position={[0.12,0.02,1.15]} center zIndexRange={[4,0]} style={{pointerEvents:'none'}}>
        <div style={{width:168,textAlign:'center',whiteSpace:'nowrap',fontFamily:'Archivo,"Noto Sans TC",sans-serif',color:'#121214'}}>
          <div style={{fontSize:14,fontWeight:600,lineHeight:'20px'}}>{bot.name}</div>
          <div style={{fontSize:12,fontWeight:500,lineHeight:'18px',color:'#3a3a42'}}>{bot.role}</div>
        </div>
      </Html>
    </group>)}
    <OrbitControls enablePan={false} minPolarAngle={0.55} maxPolarAngle={1.25} minZoom={36} maxZoom={150} target={[0,.55,0]} enableDamping={!reduced} dampingFactor={0.08}/>
  </>;
}

class StageBoundary extends React.Component{
  state={error:false};
  static getDerivedStateFromError(){return{error:true}}
  render(){return this.state.error?<div style={{padding:24}}><h2 style={{fontSize:20,color:'#121214'}}>目前無法顯示 3D 機器人</h2><ul>{DASHBOARD_BOTS.map(bot=><li key={bot.variant} style={{fontSize:14,lineHeight:'22px',color:'#121214'}}>{bot.name} · {bot.role}</li>)}</ul></div>:this.props.children}
}

function Showcase(){
  const reduced=useReduced();
  return <StageBoundary><div style={{height:820,margin:'0 -12px',borderRadius:12,overflow:'hidden',background:'#f4f4f6'}} aria-label="六種 Office Power 機器人">
    <Canvas orthographic shadows dpr={[1,1.75]} frameloop={reduced?'demand':'always'} camera={{position:[0,5.2,9.4],zoom:72,near:0.1,far:50}} gl={{antialias:true}} onCreated={({gl,camera})=>{gl.shadowMap.type=THREE.PCFSoftShadowMap;gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.02;camera.lookAt(0,0.9,0)}}>
      <Lineup reduced={reduced}/>
    </Canvas>
  </div></StageBoundary>;
}

function NovaLineup({reduced}){
  return <>
    <color attach="background" args={['#f4f4f6']}/>
    <BotLighting/>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.02,0]} receiveShadow>
      <planeGeometry args={[24,16]}/>
      <meshStandardMaterial color="#f4f4f6" roughness={0.94}/>
    </mesh>
    {NOVA_BODY_BOTS.map((bot,i)=><group key={bot.name} position={[(i-1.5)*2.6,0,0]}>
      <OfficeBot variant="life" tool={false} prop={bot.prop} reduced={reduced} rest={0.2} index={i} scale={0.9}/>
      <Html position={[0.05,0.02,1.2]} center zIndexRange={[4,0]} style={{pointerEvents:'none'}}>
        <div style={{width:180,textAlign:'center',whiteSpace:'nowrap',fontFamily:'Archivo,"Noto Sans TC",sans-serif',color:'#121214'}}>
          <div style={{fontSize:14,fontWeight:600,lineHeight:'20px'}}>{bot.name}</div>
          <div style={{fontSize:12,fontWeight:500,lineHeight:'18px',color:'#3a3a42'}}>{bot.role}</div>
        </div>
      </Html>
    </group>)}
    <OrbitControls enablePan={false} minPolarAngle={0.7} maxPolarAngle={1.25} minZoom={40} maxZoom={160} target={[0,0.9,0]} enableDamping={!reduced} dampingFactor={0.08}/>
  </>;
}
export const SixVariants={name:'六種角色',render:()=><Showcase/>};
export const NovaBody={name:'NOVA 同款',render:()=>{const reduced=useReduced();return <StageBoundary><div style={{height:640,borderRadius:12,overflow:'hidden',background:'#f4f4f6'}} aria-label="四隻 NOVA 造型機器人"><Canvas orthographic shadows dpr={[1,1.75]} frameloop={reduced?'demand':'always'} camera={{position:[0,3.4,8.2],zoom:78,near:0.1,far:40}} gl={{antialias:true}} onCreated={({gl,camera})=>{gl.shadowMap.type=THREE.PCFSoftShadowMap;gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.02;camera.lookAt(0,0.9,0)}}><NovaLineup reduced={reduced}/></Canvas></div></StageBoundary>}};
export const NovaAvatars={name:'NOVA 同款頭像',render:()=><div style={{display:'flex',gap:20,alignItems:'flex-end',flexWrap:'wrap'}}>{NOVA_BODY_BOTS.map(bot=><div key={bot.name} style={{width:120,textAlign:'center'}}><div style={{width:64,height:64,margin:'0 auto',borderRadius:'50%',overflow:'hidden',background:'#fff'}}><AgentPortrait role={bot.prop||'nova'} size={64}/></div><div style={{marginTop:8,fontSize:12,lineHeight:'16px',fontWeight:600}}>{bot.name}</div></div>)}</div>};
export const Avatars={name:'頭像與提醒',render:()=><div style={{display:'flex',gap:20,alignItems:'flex-end',flexWrap:'wrap'}}>{DASHBOARD_BOTS.map(bot=>{const alert=bot.variant==='hr',fresh=bot.variant==='hr'||bot.variant==='operations';return <div key={bot.variant} style={{position:'relative',width:96,textAlign:'center'}}><div style={{width:48,height:48,margin:'0 auto',display:'grid',placeItems:'center',borderRadius:'50%',background:'#fff',boxShadow:fresh?'0 0 0 2px #3d4a00, 0 0 0 6px #e5f68c, 0 8px 18px rgba(18,18,20,.08)':'0 8px 18px rgba(18,18,20,.08)'}}><AgentPortrait variant={bot.variant}/></div>{alert&&<AlertPoint/>}<div style={{marginTop:12,fontSize:12,lineHeight:'16px',fontWeight:600,color:'#121214'}}>{bot.name}</div></div>})}</div>};
