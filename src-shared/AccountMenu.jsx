import {Button,Dialog,Input} from './ui/index.jsx';
import React,{useState,useRef,useEffect,useId} from 'react';
import {Check} from 'lucide-react';
import {showAdmin} from './features.js';
import {setUserRole,useUserRole} from './UserRole.jsx';
import {languages,useAccountSettings} from './accountSettings.js';
import './account-menu.css';

// Open to every role: what a person sets for their own account, not the workspace.
function PersonalPreferences({settings,save,error,onClose}){
 const formId=useId(),[name,setName]=useState(settings.name),[language,setLanguage]=useState(settings.language);
 const clean=name.trim(),dirty=clean!==settings.name||language!==settings.language;
 const submit=event=>{event.preventDefault();if(clean&&dirty&&save({name:clean,language},'更新個人偏好','顯示名稱與介面語言'))onClose()};
 return <Dialog title="個人偏好" description="只影響你自己的帳號。" onClose={onClose} footer={<><button type="button" onClick={onClose}>取消</button><button type="submit" form={formId} className="primary" disabled={!clean||!dirty}><Check size={16}/>儲存</button></>}>
  <form id={formId} className="account-preferences" onSubmit={submit}>
   <label>顯示名稱<Input required maxLength={60} value={name} onChange={event=>setName(event.target.value)}/></label>
   <label>介面語言<Input as="select" value={language} onChange={event=>setLanguage(event.target.value)}>{languages.map(([value,label])=><option key={value} value={value}>{label}</option>)}</Input></label>
   {error&&<p role="alert">{error}</p>}
  </form>
 </Dialog>;
}

export default function AccountMenu(){
 const [open,setOpen]=useState(false),[preferences,setPreferences]=useState(false),role=useUserRole(),ref=useRef(null),admin=showAdmin&&role==='admin';
 const [settings,save,error]=useAccountSettings();
 useEffect(()=>{function close(event){if(!ref.current?.contains(event.target))setOpen(false)}document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[]);
 return <div className="account-menu" ref={ref} onKeyDown={event=>{if(event.key==='Escape')setOpen(false)}}>
  <Button variant="plain" type="button" className="account-trigger" data-label="Account" aria-label="Account" aria-expanded={open} onClick={()=>setOpen(!open)}>{settings.name.slice(0,1).toUpperCase()}</Button>
  {open&&<div className="account-popover"><strong>{settings.name}</strong><small>ginny@example.com</small>
   <div className="account-role-switch" role="group" aria-label="切換使用者身份"><span>檢視身份</span>{[['normal','Normal User'],['admin','Admin']].map(([value,label])=><Button variant="secondary" type="button" key={value} aria-pressed={role===value} onClick={()=>{setUserRole(value);setOpen(false)}}>{label}</Button>)}</div>
   {admin&&<a href="./account.html?tab=audit">稽核紀錄</a>}
   <button type="button" className="account-menu-item" onClick={()=>{setOpen(false);setPreferences(true)}}>個人偏好</button>
   {admin&&<a href="./account.html?tab=settings">進階設定</a>}
  </div>}
  {preferences&&<PersonalPreferences settings={settings} save={save} error={error} onClose={()=>setPreferences(false)}/>}
 </div>;
}
