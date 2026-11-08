import React,{useEffect,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {OrbitControls,Html} from '@react-three/drei';
import * as THREE from 'three';
import {OfficeBot,BotLighting} from '../src-dashboard/office-bots.jsx';
import {DASHBOARD_BOTS} from '../src-dashboard/bot-variants.js';

export default {
  title:'Product/Office bots',
  tags:['autodocs'],
  parameters:{docs:{description:{component:'My Board 的六位 Agent 共用同一隻白色機器人。工具依現有職能對應：維修小管家是檔案箱、HR 小幫手是識別證、Nova PM 是清單、Nova 報帳助理是計算機、Sales 助理是長條、大腦總管 NOVA 是萊姆葉。名稱與角色維持 Dashboard 原文。'}}}
};

function useReduced(){
  const [reduced,set]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{const m=matchMedia('(prefers-reduced-motion: reduce)');const fn=()=>set(m.matches);m.addEventListener('change',fn);return()=>m.removeEventListener('change',fn)},[]);
  return reduced;
}

const spots=[[-3.05,1.7],[0,1.7],[3.05,1.7],[-3.05,-1.7],[0,-1.7],[3.05,-1.7]];

function Lineup({reduced}){
  return <>
    <color attach="background" args={['#f4f4f6']}/>
    <BotLighting/>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.02,0]} receiveShadow>
      <planeGeometry args={[24,16]}/>
      <meshStandardMaterial color="#f4f4f6" roughness={0.94}/>
    </mesh>
    {DASHBOARD_BOTS.map((bot,i)=><group key={bot.variant} position={[spots[i][0],0,spots[i][1]]}>
      <OfficeBot variant={bot.variant} reduced={reduced} rest={0.18} index={i} scale={0.96}/>
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
    <Canvas orthographic shadows dpr={[1,1.75]} frameloop={reduced?'demand':'always'} camera={{position:[0,6.6,8.6],zoom:108,near:0.1,far:50}} gl={{antialias:true}} onCreated={({gl,camera})=>{gl.shadowMap.type=THREE.PCFSoftShadowMap;gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.02;camera.lookAt(0,0.55,0)}}>
      <Lineup reduced={reduced}/>
    </Canvas>
  </div></StageBoundary>;
}

export const SixVariants={name:'六種角色',render:()=><Showcase/>};
