import React,{createContext,useContext,useEffect,useRef,useState} from 'react';
import './overtime-story.css';
export const OvertimeContext=createContext({time:0,reduced:true});
export const useOvertime=()=>useContext(OvertimeContext);
export const scenarioDurations=[25,25,12,12,12];
export function OvertimeProvider({active,entry,reduced,children,scenario=0,playing,onComplete,replay=0}){
 const [time,setTime]=useState(0);
 const completion=useRef(onComplete);completion.current=onComplete;
 useEffect(()=>{
  setTime(0);
  if(!active||reduced)return;
  let elapsed=0,last=performance.now();
  const timer=setInterval(()=>{
   const now=performance.now(),delta=Math.min(.25,(now-last)/1000);last=now;
   if(entry.current<.95||document.hidden||(playing&&!playing.current))return;
   elapsed+=delta;
   if(elapsed>=scenarioDurations[scenario]){
    elapsed=0;
    completion.current?.();
   }
   setTime(elapsed);
  },100);
  return()=>clearInterval(timer);
 },[active,entry,reduced,scenario,playing,replay]);
 return <OvertimeContext.Provider value={{time:reduced?20:time,reduced}}>{children}</OvertimeContext.Provider>;
}
