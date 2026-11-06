import {useEffect,useState} from 'react';
import {readLocal} from './useLocalData.js';

const key='office-account-settings-v1',auditKey='office-account-audit-v1',changed='office-account-settings-changed';
const defaults={name:'Ginny Chang',language:'zh-TW',gateway:'https://gateway.example.com',timeout:120,concurrency:4};
export const languages=[['zh-TW','繁體中文'],['en','English']];
const read=()=>({...defaults,...readLocal(key,{})});

// One record shared by the account menu, 進階設定 and Runtime 管理. Each saves only its own fields, so none overwrites another.
export function useAccountSettings(){
 const [settings,setSettings]=useState(read),[error,setError]=useState('');
 useEffect(()=>{const sync=()=>setSettings(read());window.addEventListener(changed,sync);return()=>window.removeEventListener(changed,sync)},[]);
 const save=(patch,action,resource)=>{
  try{
   const next={...read(),...patch};
   localStorage.setItem(key,JSON.stringify(next));
   localStorage.setItem(auditKey,JSON.stringify([{id:crypto.randomUUID(),time:new Date().toISOString(),actor:next.name,action,resource,result:'已儲存'},...readLocal(auditKey,[])]));
   setError('');window.dispatchEvent(new Event(changed));return true;
  }catch{setError('瀏覽器無法儲存資料，這次修改只會保留到重新載入前。');return false}
 };
 return [settings,save,error];
}
