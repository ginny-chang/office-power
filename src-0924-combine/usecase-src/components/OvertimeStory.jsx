import {CASE_DURATIONS} from './hr-workspace/CompactTimeline';
import React,{createContext,useContext,useEffect,useRef,useState} from 'react';
import './overtime-story.css';
export const OvertimeContext=createContext({time:0,reduced:true});
export const useOvertime=()=>useContext(OvertimeContext);
export const scenarioDurations=CASE_DURATIONS;
export function OvertimeProvider({active,entry,reduced,children,scenario=0,playing,onComplete,replay=0}){
 const [time,setTime]=useState(0);
 const sample=useRef({time:0,stamp:performance.now()});
 const getTime=()=>{
  if(reduced)return 28;
  const running=active&&entry.current>=.95&&!document.hidden&&(!playing||playing.current);
  return sample.current.time+(running?Math.min(.25,(performance.now()-sample.current.stamp)/1000):0);
 };

 const completion=useRef(onComplete);completion.current=onComplete;
 useEffect(()=>{
  setTime(0); sample.current={time:0,stamp:performance.now()};
  if(!active||reduced)return;
  let elapsed=0,last=performance.now();
  const timer=setInterval(()=>{
   const now=performance.now(),delta=Math.min(.25,(now-last)/1000);last=now;sample.current.stamp=now;
   if(entry.current<.95||document.hidden||(playing&&!playing.current))return;
   elapsed+=delta;
   if(elapsed>=scenarioDurations[scenario]){
    elapsed=0;
    completion.current?.();
   }
   sample.current.time=elapsed;setTime(elapsed);
  },100);
  return()=>clearInterval(timer);
 },[active,entry,reduced,scenario,playing,replay]);
 return <OvertimeContext.Provider value={{time:reduced?20:time,reduced,getTime}}>{children}</OvertimeContext.Provider>;
}
