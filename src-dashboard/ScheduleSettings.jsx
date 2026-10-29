import React, {useEffect, useRef, useState} from 'react';
import {Clock, Search, Plus, ChevronLeft, ChevronRight} from 'lucide-react';
import './schedule-settings.css';

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
export const scheduleLabel=s=>`${s.frequency==='weekly'?'每週四':'每日'} ${s.time}`;
export function nextRun(s, now=new Date()) {
 const local=new Date(now.getTime()+8*3600000);
 const [h,m]=s.time.split(':').map(Number);
 const next=new Date(Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),local.getUTCDate(),h-8,m));
 if(s.frequency==='weekly')next.setUTCDate(next.getUTCDate()+(4-local.getUTCDay()+7)%7);
 if(next<=now)next.setUTCDate(next.getUTCDate()+(s.frequency==='weekly'?7:1));
 return next;
}
const dateLabel=s=>nextRun(s).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
export default function ScheduleSettings({schedules,setSchedules,onClose}) {
 const back=useRef();
 const [tab,setTab]=useState('latest'),[status,setStatus]=useState('all'),[query,setQuery]=useState(''),[agent,setAgent]=useState('all'),[sort,setSort]=useState('next'),[editing,setEditing]=useState(null),[expanded,setExpanded]=useState(null);
 // A detail page over the board: it takes a history entry so the browser's back button returns to My Board.
 useEffect(()=>{const before=document.activeElement;window.history.pushState({schedules:true},'');back.current.focus();const pop=()=>onClose();addEventListener('popstate',pop);return()=>{removeEventListener('popstate',pop);before?.focus()}},[]);
 const isHistory=tab==='history';
 const rows=(isHistory?history:schedules).filter(s=>(agent==='all'||s.agent===agent)&&`${s.name} ${s.agent} ${s.prompt||s.detail}`.toLowerCase().includes(query.toLowerCase())&&(status==='all'||(isHistory?s.status===status:String(s.enabled)===status))).sort((a,b)=>isHistory?b.date.localeCompare(a.date):sort==='name'?a.name.localeCompare(b.name,'zh-Hant'):Number(b.enabled)-Number(a.enabled)||nextRun(a)-nextRun(b));
 const changeTab=value=>{setTab(value);setStatus('all');setExpanded(null);setEditing(null)};
 const save=e=>{e.preventDefault();const data=new FormData(e.currentTarget);const item={...editing,name:data.get('name').trim(),agent:data.get('agent'),prompt:data.get('prompt').trim(),frequency:data.get('frequency'),time:data.get('time'),enabled:data.get('enabled')==='on'};if(!item.name||!item.prompt)return;setSchedules(prev=>editing.id?prev.map(s=>s.id===item.id?item:s):[...prev,{...item,id:crypto.randomUUID()}]);setEditing(null)};
 return <main className="schedule-dialog schedule-page" aria-labelledby="schedule-title">
  <button className="schedule-back" ref={back} onClick={()=>window.history.back()}><ChevronLeft size={16}/>My Board</button>
  <header className="schedule-dialog-header"><div><h2 id="schedule-title">排程任務管理</h2><p>安排 Agent 的工作，查看每一次執行結果。</p></div><label className="schedule-search op-search"><Search size={17}/><input aria-label="搜尋排程" placeholder="搜尋任務名稱、指令或 Agent…" value={query} onChange={e=>setQuery(e.target.value)}/></label></header>
  <div className="schedule-toolbar"><div className="schedule-tabs seg op-segmented" role="group" aria-label="排程檢視">{[['latest','最新排程',schedules.length],['history','歷史排程',history.length]].map(([id,label,count])=><button key={id} aria-pressed={tab===id} onClick={()=>changeTab(id)}>{label}<span>{count}</span></button>)}</div><button className="schedule-add" onClick={()=>{setTab('latest');setEditing({name:'',agent:agentNames[0],frequency:'weekly',time:'09:00',enabled:true,prompt:''})}}><Plus size={16}/>新增任務</button></div>
  {editing?<form className="schedule-form" onSubmit={save}><h3>{editing.id?'編輯排程':'新增任務'}</h3><label>任務名稱<input name="name" required maxLength={80} defaultValue={editing.name}/></label><label>使用的 Agent<select name="agent" defaultValue={editing.agent}>{agentNames.map(a=><option key={a}>{a}</option>)}</select></label><label className="schedule-form-wide">任務指令<textarea name="prompt" required rows={3} maxLength={2000} defaultValue={editing.prompt}/></label><label>執行頻率<select name="frequency" defaultValue={editing.frequency}><option value="daily">每日</option><option value="weekly">每週四</option></select></label><label>執行時間 · 台北<input type="time" name="time" required defaultValue={editing.time}/></label><label className="schedule-enable"><input type="checkbox" name="enabled" defaultChecked={editing.enabled}/>啟用此排程</label><div className="schedule-form-actions"><button type="button" onClick={()=>setEditing(null)}>取消</button><button className="schedule-add" type="submit">儲存示範排程</button></div></form>:<section className="schedule-list" aria-label={isHistory?'歷史排程':'最新排程'}>
   <div className="schedule-filters"><div className="schedule-status-filters">{(isHistory?[['all','所有結果'],['success','已完成'],['failed','執行失敗']]:[['all','所有狀態'],['true','已啟用'],['false','已停用']]).map(([id,label])=><button key={id} aria-pressed={status===id} onClick={()=>setStatus(id)}>{label}</button>)}</div><div className="schedule-search-row"><div className="schedule-selects"><select aria-label="篩選 Agent" value={agent} onChange={e=>setAgent(e.target.value)}><option value="all">所有 Agent</option>{agentNames.map(a=><option key={a}>{a}</option>)}</select>{!isHistory?<select aria-label="排程排序" value={sort} onChange={e=>setSort(e.target.value)}><option value="next">下次執行時間</option><option value="name">任務名稱</option></select>:<span>依執行時間由新到舊</span>}</div></div></div>
   <div className="schedule-rows">{rows.map(s=><article key={s.id} className="schedule-row"><button className="schedule-row-main" aria-expanded={isHistory?expanded===s.id:undefined} onClick={()=>isHistory?setExpanded(expanded===s.id?null:s.id):setEditing(s)}><i className={`schedule-dot ${isHistory?s.status:s.enabled?'success':'disabled'}`}/><div><h3>{s.name}</h3><p>{s.agent}{!isHistory&&` · ${scheduleLabel(s)}`}</p><small><Clock size={13}/>{isHistory?`${s.date} · ${s.duration}`:s.enabled?`下次執行：${dateLabel(s)} · 台北`:'已停用'}</small></div><span className="schedule-row-status">{isHistory?(s.status==='success'?'已完成':'執行失敗'):s.enabled?'已啟用':'已停用'}<ChevronRight size={15}/></span></button>{isHistory&&expanded===s.id&&<p className="schedule-result">{s.detail}</p>}</article>)}{!rows.length&&<div className="schedule-empty"><Search size={26}/><h3>沒有符合條件的排程</h3><button onClick={()=>{setQuery('');setStatus('all');setAgent('all')}}>清除篩選</button></div>}</div>
  </section>}
</main>;
}
