import React,{createContext,useContext,useEffect,useState} from 'react';
import './overtime-story.css';
export const OvertimeContext=createContext({time:0,reduced:true});
export const useOvertime=()=>useContext(OvertimeContext);
export function OvertimeProvider({active,entry,reduced,children}){
 const [time,setTime]=useState(0);
 useEffect(()=>{
  setTime(0);
  if(!active||reduced)return;
  const timer=setInterval(()=>{
   if(entry.current<.95||document.hidden)return;
   setTime(t=>t>=25?0:t+.1);
  },100);
  return()=>clearInterval(timer);
 },[active,entry,reduced]);
 return <OvertimeContext.Provider value={{time:reduced?20:time,reduced}}>{children}</OvertimeContext.Provider>;
}
