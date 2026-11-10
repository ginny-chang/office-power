import React,{useEffect,useRef,useState} from 'react';
import {CalendarDays,History,Inbox,Share2,X} from 'lucide-react';
import {Button} from '../src-shared/ui/index.jsx';
import {initialSchedules,scheduleLabel} from '../src-dashboard/ScheduleSettings.jsx';

const sections=[['usage','使用紀錄',History],['delegation','委派狀態',Share2],['schedules','排程任務',CalendarDays]];
const users=['ginny@example.com','king@example.com','alison@example.com','ramble@example.com'];
// Demo log in the live page's shape: the latest uses of this period, sized from the agent's own numbers.
function usageLog(agent,month){
 if(!agent.requests)return [];
 const average=(agent.input+agent.output)/agent.requests,lastDay=Number(agent.last.slice(3,5));
 const log=[1.3,.7,1.1,.9].map((scale,index)=>{
  const tokens=Math.round(average*scale);
  return {id:index,time:`${month}-${String(Math.max(1,lastDay-index*2)).padStart(2,'0')} ${String(18-index*3).padStart(2,'0')}:${String(14+index*11).padStart(2,'0')}`,status:'ok',user:users[index],channel:'web',tokens,ms:Math.round(tokens*2.4)};
 });
 return [...log,{id:'scheduler',time:`${month}-01 03:52`,status:'blocked',user:'system:scheduler',channel:'api',tokens:0,ms:5}];
}
const empty=text=><div className="usage-empty"><Inbox size={32} aria-hidden="true"/><p>{text}</p></div>;

export default function AgentMonitor({agent,scheduleAgent,month,onClose}){
 const ref=useRef(),[tab,setTab]=useState('usage');
 useEffect(()=>{const before=document.activeElement,dialog=ref.current;dialog.showModal();return()=>{dialog.close();before?.focus()}},[]);
 const log=usageLog(agent,month),schedules=initialSchedules.filter(item=>item.agent===scheduleAgent);
 const heading={usage:['使用紀錄','每次使用一筆，顯示這段期間最近的紀錄。'],delegation:['委派狀態','這位 Agent 收到的 Slack 委派。'],schedules:['指定的排程任務','唯讀清單，要修改請到排程任務管理。']}[tab];
 return <dialog ref={ref} className="agent-settings agent-detail agent-settings-modal agent-monitor" aria-labelledby="agent-monitor-title" onCancel={onClose}>
  <header className="agent-page-head"><div className="agent-page-title"><div className="agent-settings-identity"><span aria-hidden="true">{agent.emoji}</span><div><h2 id="agent-monitor-title">{agent.name}</h2><p>監控紀錄 · {agent.role}</p></div></div><Button variant="ghost" iconOnly aria-label="關閉" onClick={onClose}><X size={20}/></Button></div></header>
  <div className="agent-settings-body"><nav aria-label="監控紀錄分類">{sections.map(([id,label,Icon])=><Button variant="ghost" type="button" key={id} aria-pressed={tab===id} aria-controls="agent-monitor-panel" onClick={()=>setTab(id)}><Icon size={16}/>{label}</Button>)}</nav>
   <section id="agent-monitor-panel" className="agent-settings-content" aria-labelledby="agent-monitor-section" key={tab}><div className="agent-section-heading"><h3 id="agent-monitor-section">{heading[0]}</h3><p>{heading[1]}</p></div>
    {tab==='usage'&&<><section className="usage-stats" aria-label="本期用量"><article><header><small>本期呼叫</small></header><strong>{agent.requests.toLocaleString('en-US')}</strong></article><article><header><small>本期 Token</small></header><strong>{(agent.input+agent.output).toLocaleString('en-US')}</strong></article></section>
     {log.length?<div className="usage-table"><table><thead><tr><th>時間</th><th>狀態</th><th>使用者</th><th>管道</th><th>Token</th><th>耗時</th></tr></thead><tbody>{log.map(row=><tr key={row.id}><td>{row.time}</td><td><span className={`usage-tag ${row.status==='ok'?'good':'bad'}`}>{row.status==='ok'?'成功':'已阻擋'}</span></td><td>{row.user}</td><td>{row.channel}</td><td>{row.tokens.toLocaleString('en-US')}</td><td>{row.ms.toLocaleString('en-US')} ms</td></tr>)}</tbody></table></div>:empty('這段期間沒有使用紀錄。')}</>}
    {tab==='delegation'&&empty('尚無 Slack 委派紀錄。')}
    {tab==='schedules'&&(schedules.length?<div className="usage-table"><table><thead><tr><th>任務</th><th>頻率</th><th>狀態</th></tr></thead><tbody>{schedules.map(item=><tr key={item.id}><td><strong>{item.name}</strong></td><td>{scheduleLabel(item)}</td><td><span className={`usage-tag ${item.enabled?'good':''}`}>{item.enabled?'啟用中':'已停用'}</span></td></tr>)}</tbody></table></div>:empty('此 Agent 尚未被指派排程任務。'))}
   </section>
  </div>
 </dialog>
}
