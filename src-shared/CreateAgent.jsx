import React,{useEffect,useRef,useState} from 'react';
import {Plus,Search,X,ChevronLeft,ChevronRight} from 'lucide-react';
import ModelPicker,{agentModels} from './ModelPicker.jsx';
import {readLocal} from './useLocalData.js';
import {initialEmployees} from '../src-organization/data.js';

export const choices=['🤖','✨','🧠','💡','📊','📝','🎨','📅','🔧','💬','🚀','🛡️'];
export {agentModels};
export const agentAccess=[['workspace','所有員工','工作空間中的所有成員'],['admin','平台管理員','僅平台管理員可以使用'],['private','僅自己','只有建立者可以使用']];

// Two steps in the site's dialog shape: 1) who the Agent is (icon, name, prompt, model), 2) who can use it.
export default function CreateAgent({onClose,onCreate}){
 const ref=useRef(null),[step,setStep]=useState(0),[icon,setIcon]=useState(choices[0]),[name,setName]=useState(''),[prompt,setPrompt]=useState(''),[model,setModel]=useState(''),[access,setAccess]=useState('workspace'),[employeeQuery,setEmployeeQuery]=useState('');
 const employees=readLocal('office-employees-v1',initialEmployees),visibleEmployees=employees.filter(person=>`${person.name} ${person.email} ${person.department} ${person.role}`.toLowerCase().includes(employeeQuery.toLowerCase()));
 useEffect(()=>{const before=document.activeElement;ref.current?.showModal();return()=>{ref.current?.close();before?.focus()}},[]);
 const valid=[!!name.trim()&&!!prompt.trim()&&!!model,!!access];
 function submit(event){event.preventDefault();if(!valid[step])return;if(step===0){setStep(1);return}onCreate({id:`custom-${crypto.randomUUID()}`,name:name.trim(),emoji:icon,role:'自訂 Agent',model,prompt:prompt.trim(),access,color:'#5f80c8',status:'idle',task:'目前沒有待處理的任務',detail:'準備好接受你的工作。',progress:0})}
 return <dialog ref={ref} className="create-agent-dialog" onCancel={onClose} onClick={event=>event.target===ref.current&&onClose()} aria-labelledby="create-agent-title">
  <form onSubmit={submit} noValidate className={step===0?"create-agent-form--open":access==='workspace'?"create-agent-form--tall":""}>
   <header><div><h2 id="create-agent-title">新增 Agent</h2><p>{step===0?'設定圖示、名稱、System Prompt 與模型':'設定誰可以使用這位 Agent'}</p></div><button type="button" className="create-agent-close" onClick={onClose} aria-label="關閉"><X size={20}/></button></header>
   <div className="create-agent-progress" aria-hidden="true"><i className="active"/><i className={step===1?'active':''}/></div>
   <div className={`create-agent-body${step===0?" create-agent-body--open":""}`}>
    {step===0&&<>
    <fieldset className="create-agent-field"><legend>圖示</legend><div className="create-agent-icons" role="group" aria-label="選擇 Agent 圖示">{choices.map(choice=><button type="button" key={choice} aria-label={`選擇 ${choice}`} aria-pressed={icon===choice} onClick={()=>setIcon(choice)}>{choice}</button>)}</div></fieldset>
    <label className="create-agent-field">名稱<input value={name} onChange={event=>setName(event.target.value)} maxLength={32} placeholder="例如：行銷企劃助理" autoFocus/></label>
    <label className="create-agent-field">System Prompt<textarea rows={5} value={prompt} onChange={event=>setPrompt(event.target.value)} placeholder="說明這位 Agent 的職責、工作範圍與回應方式…"/></label>
    <div className="create-agent-field"><label htmlFor="new-agent-model">模型</label><ModelPicker id="new-agent-model" value={model} onChange={setModel}/></div>
    </>}
    {step===1&&<>    <label className="create-agent-field">誰可以使用<select value={access} onChange={event=>setAccess(event.target.value)}>{agentAccess.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><small className="create-agent-hint">{agentAccess.find(([value])=>value===access)?.[2]}</small></label>
     {access==='workspace'&&<section className="create-agent-employees"><header><strong>員工清單</strong></header><label className="op-search"><Search size={17}/><input aria-label="搜尋員工" value={employeeQuery} onChange={event=>setEmployeeQuery(event.target.value)} placeholder="搜尋姓名、Email 或部門"/></label><div>{visibleEmployees.map(person=><article key={person.id} className={person.status==='inactive'?'inactive':''}><span>{person.name.slice(0,1)}</span><p><strong>{person.name}</strong><small>{person.email} · {person.department}</small></p><em>{person.status==='active'?'可使用':'已停用'}</em></article>)}{!visibleEmployees.length&&<p className="create-agent-no-results">找不到符合的員工</p>}</div></section>}
    </>}
   </div>
   <footer><button type="button" className="create-agent-cancel" onClick={step?()=>setStep(0):onClose}>{step?<><ChevronLeft size={16}/>上一步</>:'取消'}</button><button type="submit" className="create-agent-submit" disabled={!valid[step]}>{step?<><Plus size={16}/>新增</>:<>下一步<ChevronRight size={16}/></>}</button></footer>
  </form>
 </dialog>
}
