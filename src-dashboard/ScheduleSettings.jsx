import {SegmentedControl,SearchBar,Input,Button} from '../src-shared/ui/index.jsx';
import React, {useEffect, useRef, useState} from 'react';
import {Clock, Search, Plus, ChevronLeft, ChevronRight} from 'lucide-react';
import './schedule-settings.css';
import useLocalData from '../src-shared/useLocalData.js';
import {initialEmployees} from '../src-organization/data.js';

export const initialSchedules = [
 {id:'summary',name:'每週工作摘要',agent:'大腦總管 NOVA',frequency:'weekly',time:'09:00',enabled:true,prompt:'整理本週各部門工作進度與待決策項目。'},
 {id:'plants',name:'植物澆水狀況',agent:'澆水提醒小幫手',frequency:'daily',time:'12:52',enabled:false,prompt:'檢查植物澆水紀錄，提醒需要澆水的植物。'}
];
const agentNames=['大腦總管 NOVA','澆水提醒小幫手','HR 小幫手','維修小管家','Sales 助理','Nova 報帳助理','Nova PM'];
const history=[
 {id:'h1',name:'每週工作摘要',agent:'大腦總管 NOVA',date:'2026-10-22 09:00',status:'success',detail:'已彙整各部門進度與 3 個待決策項目。',duration:'32 秒'},
 {id:'h2',name:'植物澆水狀況',agent:'澆水提醒小幫手',date:'2026-10-21 12:52',status:'failed',detail:'無法讀取澆水資料：MCP 存取權限不足，請檢查連線授權。',duration:'8 秒'},
 {id:'h3',name:'植物澆水狀況',agent:'澆水提醒小幫手',date:'2026-10-20 12:52',status:'success',detail:'已檢查 5 株植物，2 株需要澆水。',duration:'15 秒'},
 {id:'h4',name:'每週工作摘要',agent:'大腦總管 NOVA',date:'2026-10-15 09:00',status:'success',detail:'本週摘要已完成，沒有待決策項目。',duration:'28 秒'}
];
const weekdays=['日','一','二','三','四','五','六'];
export const scheduleLabel=s=>`${s.frequency==='weekly'?`每週${weekdays[s.weekday??4]}`:s.frequency==='weekdays'?'每個工作日':'每日'} ${s.time}`;
export function nextRun(s, now=new Date()) {
 const offset=({'Asia/Taipei':8,'Asia/Tokyo':9,'UTC':0})[s.timezone||'Asia/Taipei']??8;
 const local=new Date(now.getTime()+offset*3600000);
 const [h,m]=s.time.split(':').map(Number);
 for(let day=0;day<9;day++){
  const wall=new Date(Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),local.getUTCDate()+day,h,m));
  const next=new Date(wall.getTime()-offset*3600000),weekday=wall.getUTCDay();
  if(next>now&&(s.frequency!=='weekly'||weekday===Number(s.weekday??4))&&(s.frequency!=='weekdays'||(weekday>0&&weekday<6)))return next;
 }
}
export function upcomingRuns(s,now=new Date()){const result=[];for(let i=0;i<3;i++){const date=nextRun(s,now);result.push(date);now=date}return result}
const newSchedule=()=>({name:'',agent:agentNames[0],frequency:'daily',weekday:4,time:'09:00',timezone:'Asia/Taipei',delivery:'history',recipients:[],channel:'',enabled:true,prompt:''});
function ScheduleForm({value,agents,onCancel,onSave}){
 const [draft,setDraft]=useState({...newSchedule(),...value});
 const [employees]=useLocalData('office-employees-v1',initialEmployees);
 const update=(key,value)=>setDraft(d=>({...d,[key]:value}));
 const dates=draft.time?upcomingRuns(draft):[];
 return <form className="schedule-editor" onSubmit={e=>{e.preventDefault();if(!draft.name.trim()||!draft.prompt.trim())return;if(draft.delivery==='employees'&&!draft.recipients.length)return;onSave({...draft,name:draft.name.trim(),prompt:draft.prompt.trim()})}}>
 <div className="schedule-editor-body">
 <label>任務 Prompt <em>*</em><Input as="textarea" aria-label="任務 Prompt" autoFocus required rows={7} maxLength={10000} value={draft.prompt} onChange={e=>update('prompt',e.target.value)} placeholder="請彙整昨日各業務線訂單數據並提出異常警示…"/></label>
 <label>執行 Agent <em>*</em><Input as="select" aria-label="執行 Agent" required value={draft.agent} onChange={e=>update('agent',e.target.value)}>{agents.map(a=><option key={a}>{a}</option>)}</Input></label>
 <label>任務名稱 <em>*</em><Input aria-label="任務名稱" required maxLength={80} value={draft.name} onChange={e=>update('name',e.target.value)} placeholder="例如：每日營運日報與數據異常警示"/></label>
 <section className="schedule-editor-section"><h3>排程觸發頻率</h3><div className="schedule-frequency-controls"><label>頻率<Input as="select" aria-label="頻率" value={draft.frequency} onChange={e=>update('frequency',e.target.value)}><option value="daily">每日</option><option value="weekdays">每個工作日</option><option value="weekly">每週</option></Input></label>{draft.frequency==='weekly'&&<label>星期<Input as="select" aria-label="星期" value={draft.weekday} onChange={e=>update('weekday',Number(e.target.value))}>{weekdays.map((d,i)=><option key={i} value={i}>星期{d}</option>)}</Input></label>}<label>執行時間<Input aria-label="執行時間" required type="time" value={draft.time} onChange={e=>update('time',e.target.value)}/></label></div>
 <div className="schedule-next-preview" aria-live="polite"><strong>{scheduleLabel(draft)}</strong><p>執行時區：{draft.timezone}</p><h4>接下來三次執行{!draft.enabled&&'（啟用後）'}</h4><ol>{dates.map(d=><li key={d.toISOString()}>{d.toLocaleString('zh-TW',{timeZone:draft.timezone,year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false})}</li>)}</ol></div>
 <label>執行時區<Input as="select" aria-label="執行時區" value={draft.timezone} onChange={e=>update('timezone',e.target.value)}><option>Asia/Taipei</option><option>Asia/Tokyo</option><option>UTC</option></Input></label></section>
 <fieldset className="schedule-editor-section"><legend>結果派送方式</legend><div className="schedule-delivery-options">{[['history','僅留存紀錄','只記錄於系統歷史中，不對外發送'],['employees','員工推播通知','執行完成後推播給指定內部員工'],['slack','Slack 頻道發送','發送至 Agent 使用的 Slack 頻道']].map(([id,title,desc])=><label key={id} className={draft.delivery===id?'selected':''}><span><Input type="radio" name="delivery" value={id} checked={draft.delivery===id} onChange={()=>update('delivery',id)}/>{title}</span><small>{desc}</small></label>)}</div>
 {draft.delivery==='employees'&&<label>通知員工（可多選）<Input as="select" required multiple value={draft.recipients} onChange={e=>update('recipients',Array.from(e.target.selectedOptions,o=>o.value))}>{employees.filter(e=>e.status==='active').map(e=><option key={e.id} value={e.id}>{e.name} · {e.email}</option>)}</Input></label>}
 {draft.delivery==='slack'&&<label>Slack 頻道<Input required value={draft.channel} onChange={e=>update('channel',e.target.value)} placeholder="#team-updates"/></label>}</fieldset>
 <label className="schedule-enable-row"><span><strong>啟用此排程任務</strong><small>依設定週期執行</small></span><Input role="switch" type="checkbox" checked={draft.enabled} onChange={e=>update('enabled',e.target.checked)}/><span>{draft.enabled?'啟用':'停用'}</span></label>

 </div><footer className="schedule-editor-footer"><Button onClick={onCancel}>取消</Button><Button variant="primary" type="submit" disabled={!!value.id&&JSON.stringify(draft)===JSON.stringify({...newSchedule(),...value})}>{value.id?'儲存':'新增'}</Button></footer></form>
}
const dateLabel=s=>nextRun(s).toLocaleString('zh-TW',{timeZone:s.timezone||'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
export default function ScheduleSettings({schedules,setSchedules,onClose,startNew=false,startId=null,agents=[]}) {
 const back=useRef();
 const [tab,setTab]=useState('latest'),[status,setStatus]=useState('all'),[query,setQuery]=useState(''),[agent,setAgent]=useState('all'),[sort,setSort]=useState('next'),[editing,setEditing]=useState(()=>startNew?newSchedule():startId?schedules.find(s=>s.id===startId)||null:null),[expanded,setExpanded]=useState(null);
 // A detail page over the board: it takes a history entry so the browser's back button returns to My Board.
 useEffect(()=>{const before=document.activeElement;window.history.pushState({schedules:true},'');back.current.focus();const pop=()=>onClose();addEventListener('popstate',pop);return()=>{removeEventListener('popstate',pop);before?.focus()}},[]);
 const isHistory=tab==='history';
 const rows=(isHistory?history:schedules).filter(s=>(agent==='all'||s.agent===agent)&&`${s.name} ${s.agent} ${s.prompt||s.detail}`.toLowerCase().includes(query.toLowerCase())&&(status==='all'||(isHistory?s.status===status:String(s.enabled)===status))).sort((a,b)=>isHistory?b.date.localeCompare(a.date):sort==='name'?a.name.localeCompare(b.name,'zh-Hant'):Number(b.enabled)-Number(a.enabled)||nextRun(a)-nextRun(b));
 const changeTab=value=>{setTab(value);setStatus('all');setExpanded(null);setEditing(null)};
 const availableAgents=[...new Set([...agents.map(a=>a.name),...agentNames,...schedules.map(s=>s.agent)])];
 const save=item=>{setSchedules(prev=>item.id?prev.map(s=>s.id===item.id?item:s):[...prev,{...item,id:crypto.randomUUID()}]);if(startNew||startId){window.history.back();return}setEditing(null);setTab('latest');setQuery('');setStatus('all');setAgent('all')};
 const search=<label className="schedule-search op-search"><Search size={17}/><input aria-label="搜尋排程" placeholder="搜尋任務名稱、指令或 Agent…" value={query} onChange={e=>setQuery(e.target.value)}/></label>;
 // Opened straight into one form (new, or a schedule from My Board): back and cancel return to My Board.
 const direct=startNew||!!startId;
 const inForm=editing&&!direct;
 return <main className="schedule-dialog schedule-page" aria-labelledby="schedule-title">
  <button className="schedule-back" ref={back} onClick={()=>inForm?setEditing(null):window.history.back()}><ChevronLeft size={16}/>{inForm?'排程任務管理':'My Board'}</button>
  <header className="schedule-dialog-header"><div><h2 id="schedule-title">{editing?(editing.id?'編輯排程任務':'新增排程任務'):'排程任務管理'}</h2><p>安排 Agent 的工作，查看每一次執行結果。</p></div>{!editing&&search}</header>
  {!editing&&<div className="schedule-toolbar"><div className="schedule-tabs seg op-segmented" role="group" aria-label="排程檢視">{[['latest','最新排程',schedules.length],['history','歷史排程',history.length]].map(([id,label,count])=><button key={id} aria-pressed={tab===id} onClick={()=>changeTab(id)}>{label}<span>{count}</span></button>)}</div><button className="schedule-add" onClick={()=>{setTab('latest');setEditing(newSchedule())}}><Plus size={16}/>新增任務</button></div>}
  {editing?<ScheduleForm key={editing.id||'new'} value={editing} agents={availableAgents} onCancel={()=>direct?window.history.back():setEditing(null)} onSave={save}/>:<section className="schedule-list" aria-label={isHistory?'歷史排程':'最新排程'}>
   <div className="schedule-filters"><div className="schedule-status-filters">{(isHistory?[['all','所有結果'],['success','已完成'],['failed','執行失敗']]:[['all','所有狀態'],['true','已啟用'],['false','已停用']]).map(([id,label])=><button key={id} aria-pressed={status===id} onClick={()=>setStatus(id)}>{label}</button>)}</div><div className="schedule-search-row"><div className="schedule-selects"><select aria-label="篩選 Agent" value={agent} onChange={e=>setAgent(e.target.value)}><option value="all">所有 Agent</option>{availableAgents.map(a=><option key={a}>{a}</option>)}</select>{!isHistory?<select aria-label="排程排序" value={sort} onChange={e=>setSort(e.target.value)}><option value="next">下次執行時間</option><option value="name">任務名稱</option></select>:<span>依執行時間由新到舊</span>}</div></div></div>
   <div className="schedule-rows">{rows.map(s=><article key={s.id} className="schedule-row"><button className="schedule-row-main" aria-expanded={isHistory?expanded===s.id:undefined} onClick={()=>isHistory?setExpanded(expanded===s.id?null:s.id):setEditing(s)}><i className={`schedule-dot ${isHistory?s.status:s.enabled?'success':'disabled'}`}/><div><h3>{s.name}</h3><p>{s.agent}{!isHistory&&` · ${scheduleLabel(s)}`}</p><small><Clock size={13}/>{isHistory?`${s.date} · ${s.duration}`:s.enabled?`下次執行：${dateLabel(s)} · ${s.timezone||'Asia/Taipei'}`:'已停用'}</small></div><span className="schedule-row-status">{isHistory?(s.status==='success'?'已完成':'執行失敗'):s.enabled?'已啟用':'已停用'}<ChevronRight size={15}/></span></button>{isHistory&&expanded===s.id&&<p className="schedule-result">{s.detail}</p>}</article>)}{!rows.length&&<div className="schedule-empty"><Search size={26}/><h3>沒有符合條件的排程</h3><button onClick={()=>{setQuery('');setStatus('all');setAgent('all')}}>清除篩選</button></div>}</div>
  </section>}
 </main>;
}
