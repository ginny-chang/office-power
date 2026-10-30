import {Input,Button} from './ui/index.jsx';
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Search,Check,ChevronDown} from 'lucide-react';
import './model-picker.css';

export const agentModelGroups=[
 {provider:'工作空間',models:[
  {value:'inherit',name:'繼承工作空間預設',id:'workspace/default',detail:'跟隨 Account 的預設模型設定'}
 ]},
 {provider:'OpenAI',models:[
  {value:'openai/gpt-6-astra',name:'GPT-6 Astra',id:'gpt-6-astra',detail:'最高能力的旗艦推理模型'},
  {value:'openai/gpt-6.1-sol',name:'GPT-6.1 Sol',id:'gpt-6.1-sol',detail:'程式與日常任務的主力模型'},
  {value:'openai/gpt-6.1-terra',name:'GPT-6.1 Terra',id:'gpt-6.1-terra',detail:'兼顧能力、速度與成本'},
  {value:'openai/gpt-6-sol',name:'GPT-6 Sol',id:'gpt-6-sol',detail:'通用工作與推理'},
  {value:'openai/gpt-6-luna',name:'GPT-6 Luna',id:'gpt-6-luna',detail:'快速、輕量與大量任務'},
  {value:'openai/gpt-5.6-sol',name:'GPT-5.6 Sol',id:'gpt-5.6-sol',detail:'Daybreak 系列通用模型'},
  {value:'openai/gpt-5.6-cyber',name:'GPT-5.6 Cyber',id:'gpt-5.6-cyber',detail:'資安分析專用模型'},
  {value:'openai/gpt-5.3-codex',name:'GPT-5.3 Codex',id:'gpt-5.3-codex',detail:'程式開發與軟體工程'},
  {value:'openai/chat-latest',name:'Chat Latest',id:'chat-latest',detail:'ChatGPT 最新對話模型'},
  {value:'openai/gpt-rosalind-research',name:'GPT Rosalind Research',id:'gpt-rosalind-research',detail:'生命科學研究；需核准存取'},
  {value:'openai/gpt-rosalind-discovery',name:'GPT Rosalind Discovery',id:'gpt-rosalind-discovery',detail:'生命科學探索；需核准存取'}
 ]},
 {provider:'Claude',models:[
  {value:'anthropic/claude-fable-5',name:'Claude Fable 5',id:'claude-fable-5',detail:'最新 Fable 系列模型'},
  {value:'anthropic/claude-mythos-5',name:'Claude Mythos 5',id:'claude-mythos-5',detail:'長篇推理與複雜工作'},
  {value:'anthropic/claude-opus-5',name:'Claude Opus 5',id:'claude-opus-5',detail:'最高能力的 Claude 模型'},
  {value:'anthropic/claude-opus-4-8',name:'Claude Opus 4.8',id:'claude-opus-4-8',detail:'高強度推理與代理工作'},
  {value:'anthropic/claude-opus-4-7',name:'Claude Opus 4.7',id:'claude-opus-4-7',detail:'複雜分析與長時間任務'},
  {value:'anthropic/claude-opus-4-6',name:'Claude Opus 4.6',id:'claude-opus-4-6',detail:'進階推理與程式工作'},
  {value:'anthropic/claude-opus-4-5-20251101',name:'Claude Opus 4.5',id:'claude-opus-4-5-20251101',detail:'穩定版 Opus 模型'},
  {value:'anthropic/claude-sonnet-5',name:'Claude Sonnet 5',id:'claude-sonnet-5',detail:'能力與速度平衡的主力模型'},
  {value:'anthropic/claude-sonnet-4-6',name:'Claude Sonnet 4.6',id:'claude-sonnet-4-6',detail:'通用工作與代理任務'},
  {value:'anthropic/claude-sonnet-4-5-20250929',name:'Claude Sonnet 4.5',id:'claude-sonnet-4-5-20250929',detail:'穩定版 Sonnet 模型'},
  {value:'anthropic/claude-haiku-4-5-20251001',name:'Claude Haiku 4.5',id:'claude-haiku-4-5-20251001',detail:'快速、低延遲與大量任務'}
 ]}
];

export const agentModels=agentModelGroups.flatMap(group=>group.models.map(model=>({...model,provider:group.provider})));

export default function ModelPicker({id='agent-model',value,onChange,autoFocus=false}){
 const root=useRef(null),selected=agentModels.find(model=>model.value===value);
 const [query,setQuery]=useState(selected?.name||''),[open,setOpen]=useState(false);
 useEffect(()=>{if(!open)setQuery(selected?.name||'')},[value,open,selected?.name]);
 useEffect(()=>{const close=event=>{if(!root.current?.contains(event.target))setOpen(false)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[]);
 const groups=useMemo(()=>{const term=query.trim().toLowerCase();return agentModelGroups.map(group=>({...group,models:group.models.filter(model=>!term||`${group.provider} ${model.name} ${model.id} ${model.detail}`.toLowerCase().includes(term))})).filter(group=>group.models.length)},[query]);
 const choose=model=>{onChange(model.value);setQuery(model.name);setOpen(false)};
 return <div className="model-picker" ref={root}>
  <div className="model-search-wrap op-search"><Search size={17}/><input className="op-search-input" id={id} autoFocus={autoFocus} role="combobox" aria-expanded={open} aria-controls={`${id}-options`} aria-autocomplete="list" value={query} placeholder="搜尋 OpenAI 或 Claude 模型…" onFocus={event=>{setOpen(true);event.currentTarget.select()}} onChange={event=>{setQuery(event.target.value);setOpen(true)}} onKeyDown={event=>{if(event.key==='Escape')setOpen(false)}}/><ChevronDown size={16}/></div>
  {open&&<div className="model-options" id={`${id}-options`} role="listbox" aria-label="模型清單">{groups.length?groups.map(group=><section key={group.provider}><header>{group.provider}<span>{group.models.length}</span></header>{group.models.map(model=><Button variant="secondary" type="button" role="option" aria-selected={value===model.value} key={model.value} onClick={()=>choose(model)}><span><strong>{model.name}</strong><small>{model.id}</small><em>{model.detail}</em></span>{value===model.value&&<Check size={17}/>}</Button>)}</section>):<div className="model-empty">找不到符合的模型</div>}</div>}
  {selected&&<div className="model-selected"><span>{selected.provider}</span><strong>{selected.name}</strong><small>{selected.id}</small></div>}
 </div>
}
