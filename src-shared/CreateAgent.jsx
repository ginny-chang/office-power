import {SearchBar,Button,Input} from './ui/index.jsx';
import React,{useEffect,useRef,useState} from 'react';
import {IconArrowLeft,IconArrowRight,IconPlus,IconSearch,IconX} from '@tabler/icons-react';
import ModelPicker,{agentModels} from './ModelPicker.jsx';
import {readLocal} from './useLocalData.js';
import {initialEmployees} from '../src-organization/data.js';

const choices=['🤖','✨','🧠','💡','📊','📝','🎨','📅','🔧','💬','🚀','🛡️'];
export {agentModels};
export const agentAccess=[['workspace','所有員工','工作空間中的所有成員'],['admin','平台管理員','僅平台管理員可以使用'],['private','僅自己','只有建立者可以使用']];

export default function CreateAgent({onClose,onCreate}){
 const ref=useRef(null),[step,setStep]=useState(0),[icon,setIcon]=useState(choices[0]),[name,setName]=useState(''),[prompt,setPrompt]=useState(''),[model,setModel]=useState(''),[access,setAccess]=useState(''),[employeeQuery,setEmployeeQuery]=useState('');
 const employees=readLocal('office-employees-v1',initialEmployees),visibleEmployees=employees.filter(person=>`${person.name} ${person.email} ${person.department} ${person.role}`.toLowerCase().includes(employeeQuery.toLowerCase()));
 useEffect(()=>{const before=document.activeElement;ref.current?.showModal();return()=>{ref.current?.close();before?.focus()}},[]);
 const valid=[!!name.trim(),!!prompt.trim()&&!!model,!!access];
 function submit(event){event.preventDefault();if(!valid[step])return;if(step<2){setStep(step+1);return}onCreate({id:`custom-${crypto.randomUUID()}`,name:name.trim(),emoji:icon,role:'自訂 Agent',model,prompt:prompt.trim(),access,color:'#5f80c8',status:'idle',task:'目前沒有待處理的任務',detail:'準備好接受你的工作。',progress:0})}
 return <dialog ref={ref} className="create-agent-dialog" onCancel={onClose} onClick={event=>event.target===ref.current&&onClose()} aria-labelledby="create-agent-title">
  <form onSubmit={submit} noValidate>
   <header><div><span>NEW AGENT · {step+1} / 3</span><h2 id="create-agent-title">新增 Agent</h2><p>{['設定圖示與名稱','設定 System Prompt 與模型','設定使用權限'][step]}</p></div><Button variant="plain" type="button" className="create-agent-close" onClick={onClose} aria-label="關閉"><IconX size={19}/></Button></header>
   <div className="create-agent-progress" aria-label={`步驟 ${step+1}，共 3 步`}>{[0,1,2].map(i=><span key={i} className={i<=step?'active':''}/>)}</div>
   {step===0&&<div className="create-agent-step"><label className="create-agent-label">選擇 Icon</label><div className="create-agent-icons" role="group" aria-label="選擇 Agent Icon">{choices.map(choice=><Button variant="secondary" type="button" key={choice} className={icon===choice?'selected':''} aria-label={`選擇 ${choice} Icon`} aria-pressed={icon===choice} onClick={()=>setIcon(choice)}>{choice}</Button>)}</div><label className="create-agent-label" htmlFor="new-agent-name">Agent Name <b>*</b></label><Input id="new-agent-name" value={name} onChange={event=>setName(event.target.value)} maxLength={32} placeholder="例如：行銷企劃助理" autoFocus/></div>}
   {step===1&&<div className="create-agent-step"><label className="create-agent-label" htmlFor="new-agent-prompt">System Prompt <b>*</b></label><Input as="textarea" id="new-agent-prompt" rows={7} value={prompt} onChange={event=>setPrompt(event.target.value)} placeholder="說明這位 Agent 的職責、工作範圍與回應方式…" autoFocus/><label className="create-agent-label" htmlFor="new-agent-model">模型 Model <b>*</b></label><ModelPicker id="new-agent-model" value={model} onChange={setModel}/></div>}
   {step===2&&<div className="create-agent-step"><fieldset className="create-agent-access"><legend className="create-agent-label">誰可以使用此 Agent？ <b>*</b></legend>{agentAccess.map(([value,label,detail])=><label key={value} className={access===value?'selected':''}><Input type="radio" name="access" value={value} checked={access===value} onChange={()=>setAccess(value)}/><span><strong>{label}</strong><small>{detail}</small></span></label>)}</fieldset>{access==='workspace'&&<section className="create-agent-employees"><header><strong>員工清單</strong><span>{employees.filter(person=>person.status==='active').length} 位可使用 · 共 {employees.length} 位</span></header><label className="create-agent-employee-search"><IconSearch size={16}/><SearchBar aria-label="搜尋員工" value={employeeQuery} onChange={event=>setEmployeeQuery(event.target.value)} placeholder="搜尋姓名、Email 或部門"/></label><div>{visibleEmployees.map(person=><article key={person.id} className={person.status==='inactive'?'inactive':''}><span>{person.name.slice(0,1)}</span><p><strong>{person.name}</strong><small>{person.email} · {person.department}</small></p><em>{person.status==='active'?'可使用':'已停用'}</em></article>)}{!visibleEmployees.length&&<p className="create-agent-no-results">找不到符合的員工</p>}</div></section>}</div>}
   <footer><Button variant="secondary" type="button" onClick={step?()=>setStep(step-1):onClose}>{step?<><IconArrowLeft size={16}/>上一步</>:'取消'}</Button><Button variant="secondary" type="submit" disabled={!valid[step]}>{step===2?<><IconPlus size={18}/>新增</>:<>下一步<IconArrowRight size={17}/></>}</Button></footer>
  </form>
 </dialog>
}
