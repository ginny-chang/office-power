import {Input} from '../src-shared/ui/index.jsx';
import React,{useState} from 'react';
import {Search,Check,ArrowUpRight} from 'lucide-react';
import {appIcons} from './app-data.js';
export default function AppScreen({app,compact=false}){
 const [checked,setChecked]=useState([]),[query,setQuery]=useState('');const Icon=appIcons[app.id]||ArrowUpRight;
 return <div className={`nova-screen ${compact?'compact':''}`} style={{'--app-color':app.color}}>
  <header><span className="screen-app-icon"><Icon size={compact?20:26}/></span><div><h2>{app.name}</h2><p>{app.description}</p></div></header>
  <div className="screen-tabs"><span>總覽</span><span>我的紀錄</span></div>
  <div className="screen-summary"><div><small>所有項目</small><strong>{app.items.length}</strong></div><div><small>已完成</small><strong>{checked.length}</strong></div><div><small>待處理</small><strong>{app.items.length-checked.length}</strong></div></div>
  {!compact&&<label className="screen-search"><Search size={17}/><Input aria-label="搜尋 App 項目" placeholder="搜尋項目…" value={query} onChange={e=>setQuery(e.target.value)}/></label>}
  <div className="screen-items">{app.items.map((item,i)=>({item,i})).filter(({item})=>item.toLowerCase().includes(query.toLowerCase())).map(({item,i})=>compact?<div className="screen-item" key={i}><span className="screen-check"/>{item}<ArrowUpRight size={14}/></div>:<label className="screen-item" key={i}><Input type="checkbox" checked={checked.includes(i)} onChange={()=>setChecked(v=>v.includes(i)?v.filter(n=>n!==i):[...v,i])}/><span>{item}</span>{checked.includes(i)&&<Check size={16}/>}</label>)}{!app.items.some(item=>item.toLowerCase().includes(query.toLowerCase()))&&<p className="screen-no-results">沒有符合的項目</p>}</div>
 </div>
}
