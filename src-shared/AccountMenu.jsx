import {Button} from './ui/index.jsx';
import React,{useState,useRef,useEffect} from 'react';
import {setUserRole,useUserRole} from './UserRole.jsx';
import {useAccountSettings} from './accountSettings.js';
import './account-menu.css';

export default function AccountMenu(){
 const [open,setOpen]=useState(false),role=useUserRole(),ref=useRef(null);
 const [settings]=useAccountSettings();
 useEffect(()=>{function close(event){if(!ref.current?.contains(event.target))setOpen(false)}document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[]);
 return <div className="account-menu" ref={ref} onKeyDown={event=>{if(event.key==='Escape')setOpen(false)}}>
  <Button variant="plain" type="button" className="account-trigger" data-label="Account" aria-label="Account" aria-expanded={open} onClick={()=>setOpen(!open)}>{settings.name.slice(0,1).toUpperCase()}</Button>
  {open&&<div className="account-popover"><strong>{settings.name}</strong><small>ginny@example.com</small>
   <div className="account-role-switch" role="group" aria-label="切換使用者身份"><span>檢視身份</span>{[['normal','Normal User'],['admin','Admin']].map(([value,label])=><Button variant="secondary" type="button" key={value} aria-pressed={role===value} onClick={()=>{setUserRole(value);setOpen(false)}}>{label}</Button>)}</div>
   <a href="./account.html?tab=settings">設定</a>
   {/* The prototype has no sign-in, so 登出 returns to the entry page */}
   <a href="./index.html">登出</a>
  </div>}
 </div>;
}
