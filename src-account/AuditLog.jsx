import React,{useMemo,useState} from 'react';
import {Check,ChevronLeft,ChevronRight,Copy,Download,Inbox,RotateCw,Search} from 'lucide-react';
import {Button,Dialog,PageTitle,SegmentedControl} from '../src-shared/ui/index.jsx';
import {csv,download} from '../src-shared/Management';
import {readLocal} from '../src-shared/useLocalData.js';
import './usage.css';
import './audit.css';

const categories=['Agent 使用','發佈','設定變更','用量攔截','權限拒絕','Slack 身分驗證','Slack 解除綁定','Slack 負責人轉移','Slack 儲存失敗','資料來源','推送送達','推送拒絕','任務執行','CSV 匯入','規則執行','Pack 安裝','Pack 卸載'];
const eventCodes={'Agent 使用':'agent.invoked','發佈':'agent.published','設定變更':'settings.updated','用量攔截':'usage.blocked','權限拒絕':'access.denied','Slack 身分驗證':'slack.identity_verified','Slack 解除綁定':'slack.unlinked','Slack 負責人轉移':'slack.owner_transferred','Slack 儲存失敗':'slack.save_failed','資料來源':'datasource.accessed','推送送達':'push.delivered','推送拒絕':'push.rejected','任務執行':'task.executed','CSV 匯入':'csv.imported','規則執行':'rule.executed','Pack 安裝':'pack.installed','Pack 卸載':'pack.uninstalled'};
const bad=new Set(['用量攔截','權限拒絕','Slack 儲存失敗','推送拒絕']),good=new Set(['推送送達','任務執行']);
const demoAgents={nova:{name:'大腦總管 NOVA',role:'團隊協作',emoji:'🧠',model:'anthropic/claude-sonnet-5'},hr:{name:'HR 小幫手',role:'人力資源',emoji:'🤖',model:'openai/gpt-6.1-terra'},sales:{name:'Sales 助理',role:'客戶經營',emoji:'🤖',model:'openai/gpt-6.1-terra'},finance:{name:'Nova 報帳助理',role:'財務管理',emoji:'🧾',model:'anthropic/claude-haiku-4-5'},it:{name:'維修小管家',role:'設備管理',emoji:'🔧',model:'anthropic/claude-haiku-4-5'}};
const demoPeople={'Ginny Chang':{email:'ginny@example.com',orgUnitPath:'設計部',role:'管理員'},King:{email:'king@example.com',orgUnitPath:'管理部',role:'管理員'},Alison:{email:'alison@example.com',orgUnitPath:'產品研發',role:'管理員'},Ramble:{email:'ramble@example.com',orgUnitPath:'管理部',role:'一般使用者'},Dylan:{email:'dylan@example.com',orgUnitPath:'產品研發',role:'一般使用者'}};
// Demo events in the live page's shape, newest first: [category, subject, actor, summary, agent id, minutes before the previous event].
const demoRows=[
 ['Agent 使用','大腦總管 NOVA','Ginny Chang','','nova',0],['權限拒絕','薪資資料表','Dylan','沒有讀取權限','hr',14],['Agent 使用','HR 小幫手','Ramble','','hr',9],['發佈','會議室預約系統 Agent','Ginny Chang','Revision 2 已發佈',null,31],['推送送達','每週工作摘要','系統','已送達 3 位成員','nova',6],
 ['任務執行','每週工作摘要','系統','執行 42 秒','nova',2],['Agent 使用','Sales 助理','Alison','','sales',18],['資料來源','HR 共用資料夾','HR 小幫手','讀取 2 個檔案','hr',23],['用量攔截','Nova 報帳助理','Dylan','超過單次執行上限','finance',12],['CSV 匯入','員工名錄','King','新增 4 位員工',null,47],
 ['Agent 使用','維修小管家','King','','it',16],['Slack 身分驗證','Ramble','Ramble','Slack 帳號已驗證',null,28],['規則執行','報修自動分派','系統','指派給維修小管家','it',35],['Pack 安裝','請假管理 Agent','King','v1',null,52],['推送拒絕','植物澆水狀況','系統','收件人已停用通知',null,11],
 ['Agent 使用','大腦總管 NOVA','Alison','','nova',19],['Slack 負責人轉移','行政支援頻道','King','負責人改為 Alison',null,64],['資料來源','Sales 客戶資料','Sales 助理','讀取 1 個檔案','sales',8],['Slack 儲存失敗','行政支援頻道','系統','權杖已過期',null,27],['發佈','HR 小幫手','Alison','Revision 5 已發佈',null,73],
 ['Agent 使用','Nova 報帳助理','Ramble','','finance',22],['任務執行','植物澆水狀況','系統','執行 8 秒',null,41],['Pack 卸載','舊版出勤 Pack','King','v3',null,95],['Slack 解除綁定','Dylan','Dylan','',null,36],['權限拒絕','能力中心','Ramble','需要管理員身分',null,14],
 ['Agent 使用','Sales 助理','Ginny Chang','','sales',58],['規則執行','逾期報帳提醒','系統','提醒 2 位成員','finance',120],['Agent 使用','HR 小幫手','Dylan','','hr',33],['資料來源','共用資料夾','大腦總管 NOVA','讀取 4 個檔案','nova',17],['CSV 匯入','員工名錄','King','更新 2 位員工',null,140]
];
const demoId=(prefix,seed)=>{let hash=seed*2654435761%4294967296;const part=()=>{hash=(hash*1103515245+12345)%2147483648;return hash.toString(16).padStart(8,'0')};return `${prefix}-${part()}-${part().slice(0,4)}`};
const demoEvents=(()=>{let time=Date.UTC(2026,10,6,4,7,56);return demoRows.map(([category,subject,actor,summary,agentId,minutes],index)=>{time-=minutes*60000;return {id:demoId('audit',index+1),ts:new Date(time).toISOString(),category,subject,actor,summary,agentId,requestId:category==='Agent 使用'?demoId('req',index+101):null}})})();
// 主體 is the thing that changed (the setting item); the new value goes in 摘要, like the live page's records
const fromSettings=log=>({id:log.id,ts:log.time,category:'設定變更',subject:log.action?.replace(/^更新/,'')||log.resource,actor:log.actor,summary:log.action?`改為 ${log.resource}`:'',agentId:null,requestId:null});
const formatter=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
const when=iso=>formatter.format(new Date(iso));
const severity=category=>bad.has(category)?'warning':'info';
const tagClass=category=>bad.has(category)?'bad':good.has(category)?'good':'';
const pageSize=10;
function record(event){
 const system=event.actor==='系統';
 return {id:event.id,ts:event.ts,tenantId:'demo-workspace',actorType:system?'system':'account',actorName:event.actor,event:eventCodes[event.category],category:event.category,severity:severity(event.category),subjectName:event.subject,...(event.agentId?{agentId:event.agentId}:{}),detail:{...(event.summary?{summary:event.summary}:{}),...(event.requestId?{channel:'web',requestId:event.requestId}:{})}};
}
const agentInfo=event=>{const agent=demoAgents[event.agentId];return agent?{id:event.agentId,...agent,status:'published'}:null};
const userInfo=event=>{const person=demoPeople[event.actor];return person?{name:event.actor,...person,status:'active'}:null};
const empty=text=><div className="usage-empty"><Inbox size={32} aria-hidden="true"/><p>{text}</p></div>;

function AuditDetail({event,onClose}){
 const [view,setView]=useState('audit'),[copied,setCopied]=useState(false);
 const data={audit:record(event),agent:agentInfo(event),user:userInfo(event)}[view];
 const json=data&&JSON.stringify(data,null,2);
 const copy=()=>navigator.clipboard?.writeText(JSON.stringify(record(event),null,2)).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)}).catch(()=>{});
 return <Dialog size="wide" className="audit-dialog" title="稽核事件詳細檢視" description={event.id} onClose={onClose}>
  <div className="audit-detail">
   <div className="audit-detail-time"><span><small>發生時間（Asia/Taipei）</small><strong>{when(event.ts)}</strong></span><Button size="medium" onClick={copy}>{copied?<Check size={16}/>:<Copy size={16}/>}{copied?'已複製':'複製 JSON'}</Button></div>
   <SegmentedControl label="詳細資料分類" value={view} onChange={setView} items={[{value:'audit',label:'稽核完整資料'},{value:'agent',label:'Agent 資訊'},{value:'user',label:'使用者資訊'}]}/>
   {json?<pre className="audit-json" tabIndex={0}>{json}</pre>:empty(view==='agent'?'這筆事件沒有關聯的 Agent。':'這筆事件由系統產生，沒有使用者資訊。')}
  </div>
 </Dialog>;
}

export default function AuditLog(){
 const [localLogs,setLocalLogs]=useState(()=>readLocal('office-account-audit-v1',[]));
 const [category,setCategory]=useState(''),[query,setQuery]=useState(''),[page,setPage]=useState(1),[detail,setDetail]=useState(null),[refreshedAt,setRefreshedAt]=useState('');
 const events=useMemo(()=>[...localLogs.map(fromSettings),...demoEvents].sort((a,b)=>b.ts.localeCompare(a.ts)),[localLogs]);
 const text=query.trim().toLowerCase();
 const shown=events.filter(event=>(!category||event.category===category)&&`${event.subject} ${event.actor} ${event.summary}`.toLowerCase().includes(text));
 const pages=Math.max(1,Math.ceil(shown.length/pageSize)),current=Math.min(page,pages),rows=shown.slice((current-1)*pageSize,current*pageSize);
 const refresh=()=>{setLocalLogs(readLocal('office-account-audit-v1',[]));setRefreshedAt(when(new Date().toISOString()).slice(11,16))};
 const exportCsv=()=>download('audit-log.csv',csv([['時間','事件','主體','操作者','摘要'],...shown.map(event=>[when(event.ts),event.category,event.subject,event.actor,event.summary])]),'text/csv;charset=utf-8');
 return <>
  <header className="page-heading usage-heading"><div><PageTitle>稽核紀錄</PageTitle><p>設定變更、發佈、資料存取與每次 Agent 使用的完整軌跡，紀錄只會新增，不能修改。</p></div>
   <div className="usage-actions"><Button onClick={refresh}><RotateCw size={16}/>重新整理</Button><Button variant="primary" onClick={exportCsv}><Download size={16}/>匯出紀錄</Button></div></header>
  <section className="usage-card audit-card" aria-labelledby="audit-title">
   <header><div><h2 id="audit-title">事件紀錄</h2><p role="status">{shown.length} 筆{refreshedAt&&` · 已更新 ${refreshedAt}`}</p></div>
    <div className="audit-filters"><label className="op-search"><Search size={16}/><input aria-label="搜尋稽核紀錄" placeholder="搜尋主體、操作者或摘要…" value={query} onChange={event=>{setQuery(event.target.value);setPage(1)}}/></label><select aria-label="事件類型" value={category} onChange={event=>{setCategory(event.target.value);setPage(1)}}><option value="">全部事件</option>{categories.map(item=><option key={item}>{item}</option>)}</select></div></header>
   {rows.length?<div className="usage-table audit-table"><table><thead><tr><th>時間</th><th>事件</th><th>主體</th><th>操作者</th><th>摘要</th><th><span className="usage-sr">操作</span></th></tr></thead><tbody>{rows.map(event=><tr key={event.id}><td>{when(event.ts)}</td><td><span className={`usage-tag ${tagClass(event.category)}`}>{event.category}</span></td><td><strong>{event.subject}</strong></td><td>{event.actor}</td><td>{event.summary||'—'}</td><td><Button size="medium" aria-label={`檢視 ${event.subject} 的詳細資料`} onClick={()=>setDetail(event)}>檢視詳細</Button></td></tr>)}</tbody></table></div>:empty(text||category?'沒有符合的稽核紀錄。':'尚無稽核紀錄。')}
   {pages>1&&<nav className="audit-pager" aria-label="稽核紀錄分頁"><Button variant="plain" size="medium" disabled={current===1} onClick={()=>setPage(current-1)}><ChevronLeft size={16}/>上一頁</Button>{Array.from({length:pages},(_,index)=>index+1).map(number=><Button key={number} variant="plain" size="medium" aria-current={number===current?'page':undefined} onClick={()=>setPage(number)}>{number}</Button>)}<Button variant="plain" size="medium" disabled={current===pages} onClick={()=>setPage(current+1)}>下一頁<ChevronRight size={16}/></Button></nav>}
  </section>
  {detail&&<AuditDetail event={detail} onClose={()=>setDetail(null)}/>}
 </>;
}
