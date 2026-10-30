import {SegmentedControl,SearchBar,Card,Input,Button} from '../src-shared/ui/index.jsx';
import {AdminOnly} from '../src-shared/UserRole.jsx';
import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowLeft,ArrowRight,CheckCircle2,Clock3,FileClock,Layers3,MessageSquareText,Package,Search,Send,Sparkles,ChevronDown,CalendarDays,Timer,ClipboardList} from 'lucide-react';
import WorkspaceRail from '../src-shared/WorkspaceRail.jsx';
import useLocalData,{readLocal} from '../src-shared/useLocalData.js';
import {appSeed} from '../src-apps/app-data.js';
import '../src-apps/styles.css';
import './styles.css';

const questions=[
 '誰會使用這個 App？他們各自需要什麼權限？',
 '需要記錄哪些資料？例如姓名、日期、狀態或金額。',
 '最重要的操作流程是什麼？需要誰審核嗎？',
 '你想給 App 和 Agent 取什麼名字？',
];
const now=()=>new Date().toISOString();
const date=value=>new Intl.DateTimeFormat('zh-TW',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
const titleFrom=text=>text.includes('請假')?'請假管理':text.includes('報帳')?'報帳管理':text.includes('活動')?'活動管理':text.includes('打卡')||text.includes('出勤')?'打卡管理':text.includes('採購')?'採購申請':'新 App Pack';
const packSeeds=[
 {id:'event',name:'活動管理',request:'建立公司活動報名系統，員工可以報名，管理員可以查看名單。',status:'已發佈',answers:['全體員工可報名，行政管理員管理活動。','活動名稱、日期、地點、名額與報名紀錄。','員工報名或取消；管理員匯出名單。','活動管理'],revisions:[{number:1,at:'2026-10-24T09:30:00+08:00',summary:'建立活動報名、名額與出席管理。',changes:'初版：Agent、活動資料表與報名頁面',published:true},{number:2,at:'2026-10-27T15:20:00+08:00',summary:'加入取消報名與候補名單。',changes:'新增候補流程、名單篩選與取消報名',published:true}],events:[{type:'create',at:'2026-10-24T09:00:00+08:00',text:'提交建立需求'},{type:'interview',at:'2026-10-24T09:15:00+08:00',text:'完成 4 題需求訪談'},{type:'revision',at:'2026-10-24T09:30:00+08:00',text:'Revision 1 · 初版已建立'},{type:'publish',at:'2026-10-24T09:45:00+08:00',text:'發佈 Revision 1'},{type:'revision',at:'2026-10-27T15:20:00+08:00',text:'Revision 2 · 加入候補名單'},{type:'publish',at:'2026-10-27T15:35:00+08:00',text:'發佈 Revision 2'}],messages:[{role:'user',text:'建立公司活動報名系統，員工可以報名，管理員可以查看名單。'},{role:'assistant',text:'已整理需求並建立活動管理 App Pack。包含活動管理 Agent 與 NOVA App。'},{role:'user',text:'加入取消報名和候補名單。'},{role:'assistant',text:'Revision 2 已建立，並記錄新增的候補流程。'}]},
 {id:'leave',name:'請假管理',request:'讓員工快速申請請假，主管可以核准並查看剩餘假期。',status:'已發佈',answers:['員工提出申請，直屬主管審核。','假別、起迄日期、天數與審核狀態。','提出申請後通知主管，核准後更新餘額。','請假管理'],revisions:[{number:1,at:'2026-10-25T11:00:00+08:00',summary:'建立請假申請與主管審核流程。',changes:'初版：請假 Agent、申請資料表與假期頁面',published:true}],events:[{type:'create',at:'2026-10-25T10:10:00+08:00',text:'提交建立需求'},{type:'interview',at:'2026-10-25T10:40:00+08:00',text:'完成 4 題需求訪談'},{type:'revision',at:'2026-10-25T11:00:00+08:00',text:'Revision 1 · 初版已建立'},{type:'publish',at:'2026-10-25T11:15:00+08:00',text:'發佈 Revision 1'}],messages:[{role:'user',text:'讓員工快速申請請假，主管可以核准並查看剩餘假期。'},{role:'assistant',text:'已建立請假管理 App Pack，包含 Agent 與 NOVA App。'}]},
 {id:'expense',name:'報帳管理',request:'建立報帳申請與審核流程，讓員工追蹤費用狀態。',status:'待發佈',answers:['員工申請，財務審核。','費用名稱、金額、收據與狀態。','送出後財務審核，結果通知申請人。','報帳管理'],revisions:[{number:1,at:'2026-10-28T10:30:00+08:00',summary:'建立費用申請、收據與審核頁面。',changes:'初版：報帳 Agent、費用資料表與報帳頁面',published:false}],events:[{type:'create',at:'2026-10-28T10:00:00+08:00',text:'提交建立需求'},{type:'interview',at:'2026-10-28T10:15:00+08:00',text:'完成 4 題需求訪談'},{type:'revision',at:'2026-10-28T10:30:00+08:00',text:'Revision 1 · 等待發佈'}],messages:[{role:'user',text:'建立報帳申請與審核流程，讓員工追蹤費用狀態。'},{role:'assistant',text:'初版已準備好，請檢查 Agent 與 NOVA App 的內容。'}]},
];
function Badge({status}){return <span className={'pack-badge '+(status==='已發佈'?'live':status==='待發佈'?'ready':'draft')}>{status==='已發佈'?<CheckCircle2 size={14}/>:<Clock3 size={14}/>} {status}</span>}
function PackPreview({pack}){
 const type=pack.name.includes('活動')?'event':pack.name.includes('打卡')||pack.name.includes('出勤')?'attendance':pack.name.includes('請假')?'leave':pack.name.includes('報帳')?'expense':'general';
 const Icon=type==='event'?CalendarDays:type==='attendance'?Timer:ClipboardList;
 const label=type==='event'?'活動總覽':type==='attendance'?'今日出勤':type==='leave'?'請假申請':type==='expense'?'費用申請':'工作總覽';
 const fields=pack.answers?.[1]?.split(/[、，,。；;]/).map(item=>item.trim()).filter(Boolean).slice(0,3)||[];
 return <section className="pack-preview-section" aria-label="建立成果">
  <Card as="article" className="pack-snapshot-card"><header><span className="pack-preview-icon"><Layers3 size={20}/></span><div><strong>NOVA App Screen Snapshot</strong><small>{pack.name}</small></div></header><div className="pack-app-chrome"><span className="pack-window-dots"><i/><i/><i/></span><span>NOVA App · {pack.name}</span><span>預覽模式</span></div><div className="pack-app-screen"><div className="pack-app-screen-title"><span><Icon size={21}/></span><div><small>{label}</small><h4>{pack.name}</h4><p>{pack.request}</p></div></div><div className="pack-app-screen-grid"><div><small>目前狀態</small><strong>準備就緒</strong></div><div><small>資料欄位</small><strong>{fields.length||3} 項</strong></div></div><div className="pack-app-screen-table"><div><strong>最近紀錄</strong></div>{(fields.length?fields:['名稱','日期','狀態']).map((field,index)=><div key={index}><span>{field}</span><span>{index===fields.length-1?'待處理':index===1?new Date().toLocaleDateString('zh-TW'):'範例內容'}</span></div>)}</div></div></Card>
  <details className="pack-agent-settings"><summary><span className="pack-preview-icon"><Sparkles size={20}/></span><span><strong>查看 Agent 設定</strong><small>{pack.name} Agent</small></span><ChevronDown size={18}/></summary><div className="pack-agent-setting-body"><dl><div><dt>名稱</dt><dd>{pack.name} Agent</dd></div><div><dt>使用者與權限</dt><dd>{pack.answers?.[0]||'待確認'}</dd></div><div><dt>工作流程</dt><dd>{pack.answers?.[2]||pack.request}</dd></div></dl></div></details>
 </section>
}
function App(){
 const [packs,setPacks,storageError]=useLocalData('office-app-packs-v1',packSeeds);
 const initial=new URLSearchParams(location.search);
 const [selectedId,setSelectedId]=useState(initial.get('pack'));
 const [newScreen,setNewScreen]=useState(initial.has('new'));
 const [search,setSearch]=useState('');
 const [filter,setFilter]=useState('全部');
 const [message,setMessage]=useState('');
 const [notice,setNotice]=useState('');
 const messagesRef=useRef(null);
 const selected=packs.find(pack=>pack.id===selectedId);
 const latest=selected?.revisions.at(-1);
 useEffect(()=>{if(messagesRef.current)messagesRef.current.scrollTop=messagesRef.current.scrollHeight},[selectedId,selected?.messages.length,newScreen]);
 const listed=packs.filter(pack=>(filter==='全部'||pack.status===filter)&&`${pack.name} ${pack.request}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())).sort((a,b)=>new Date(b.events.at(-1).at)-new Date(a.events.at(-1).at));
 function goList(){setSelectedId(null);setNewScreen(false);setMessage('');history.replaceState(null,'','./app-packs.html')}
 function goNew(){setSelectedId(null);setNewScreen(true);setMessage('');history.replaceState(null,'','./app-packs.html?new=1')}
 function goPack(id){setSelectedId(id);setNewScreen(false);setMessage('');history.replaceState(null,'',`./app-packs.html?pack=${encodeURIComponent(id)}`)}
 function submit(event){event.preventDefault();const text=message.trim();if(!text)return;
  if(newScreen){const id=crypto.randomUUID();const pack={id,name:titleFrom(text),request:text,status:'訪談中',answers:[],revisions:[],events:[{type:'create',at:now(),text:'提交建立需求'}],messages:[{role:'user',text},{role:'assistant',text:questions[0]}]};setPacks(old=>[pack,...old]);setMessage('');goPack(id);return}
  if(!selected)return;
  if(selected.status==='訪談中')setPacks(old=>old.map(pack=>{if(pack.id!==selected.id)return pack;const answers=[...pack.answers,text];const done=answers.length===questions.length;const name=done?(answers[3].trim().slice(0,32)||pack.name):pack.name;return {...pack,name,answers,status:done?'待發佈':'訪談中',revisions:done?[...pack.revisions,{number:1,at:now(),summary:pack.request,changes:'初版：Agent、NOVA App 與資料規格',published:false}]:pack.revisions,events:done?[...pack.events,{type:'interview',at:now(),text:'完成 4 題需求訪談'},{type:'revision',at:now(),text:'Revision 1 · 初版已建立'}]:pack.events,messages:[...pack.messages,{role:'user',text},{role:'assistant',text:done?'需求訪談完成。已建立初版 Blueprint，請在下方預覽 Agent 與 NOVA App。':questions[answers.length]}]}}));
  else setPacks(old=>old.map(pack=>{if(pack.id!==selected.id)return pack;const number=(pack.revisions.at(-1)?.number||0)+1;return {...pack,status:'待發佈',revisions:[...pack.revisions,{number,at:now(),summary:text,changes:text,published:false}],events:[...pack.events,{type:'revision',at:now(),text:`Revision ${number} · ${text}`}],messages:[...pack.messages,{role:'user',text},{role:'assistant',text:`已依照你的修改建立 Revision ${number}。檢查版本內容後即可發佈。`}]}}));
  setMessage('');
 }
 function publish(){
  if(!selected||!latest||latest.published)return;
  const appId=`pack-${selected.id}`;
  const fields=(selected.answers?.[1]||'').split(/[、，,。；;]/).map(item=>item.trim()).filter(Boolean).slice(0,6);
  const app={id:appId,name:selected.name,category:'APP Pack',description:selected.request,author:`${selected.name} Agent`,color:'#426fe1',views:0,tools:0,items:fields.length?fields:['總覽','我的紀錄']};
  try{const saved=readLocal('office-nova-apps-v2',appSeed);localStorage.setItem('office-nova-apps-v2',JSON.stringify([...saved.filter(item=>item.id!==appId),app]))}catch{setNotice('瀏覽器無法儲存 NOVA App，請檢查儲存空間。');return}
  setPacks(old=>old.map(pack=>pack.id===selected.id?{...pack,generatedAppId:appId,status:'已發佈',revisions:pack.revisions.map(rev=>rev.number===latest.number?{...rev,published:true}:rev),events:[...pack.events,{type:'publish',at:now(),text:`發佈 Revision ${latest.number}`}],messages:[...pack.messages,{role:'assistant',text:`Revision ${latest.number} 已發佈。Agent 與 NOVA App 已建立；可以在下方繼續預覽。`}]}:pack));
  setNotice('已發佈，請在此頁預覽 Agent 與 NOVA App。');
 }
 return <div className="market-shell pack-shell">
  <WorkspaceRail active="APP Pack"/>
  {!selected&&!newScreen ? <main className="pack-main">
   <header className="pack-heading"><div className="pack-heading-copy"><span className="pack-heading-icon"><Package size={28}/></span><div><h1>APP Pack</h1><p>把 Agent 與 NOVA App 組合成可追蹤版本的工作應用。</p></div></div><Button variant="primary" className="pack-primary" onClick={goNew}><Sparkles size={18}/>新增</Button></header>
   <div className="pack-filterbar"><SearchBar className="" value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜尋名稱或需求…" aria-label="搜尋 APP Pack"/><SegmentedControl label="篩選狀態" value={filter} onChange={setFilter} items={['全部','已發佈','待發佈','訪談中'].map(item=>({value:item,label:item,count:item==='全部'?packs.length:packs.filter(p=>p.status===item).length}))}/></div>
   <section className="pack-list" aria-label="APP Pack 發佈紀錄"><div className="pack-list-title"><h2>發佈紀錄</h2><span>{listed.length} 筆</span></div>{listed.map(pack=><article key={pack.id} className="pack-row"><Button variant="plain" type="button" className="pack-row-main" onClick={()=>goPack(pack.id)}><span className="pack-row-icon"><Package size={23}/></span><span className="pack-row-copy"><span><strong>{pack.name}</strong><em>Rev {pack.revisions.at(-1)?.number||'—'}</em><Badge status={pack.status}/></span><small>{pack.request}</small><i>建立於 {date(pack.events[0].at)} · {pack.revisions.length} 次版本紀錄</i></span><ArrowRight size={20}/></Button></article>)}{!listed.length&&<div className="pack-empty"><Search size={28}/><h3>找不到符合的 APP Pack</h3><Button variant="secondary" type="button" onClick={()=>{setSearch('');setFilter('全部')}}>顯示所有紀錄</Button></div>}</section>
  </main> : <main className="pack-workspace">
   <header className="pack-workspace-header"><Button variant="plain" type="button" className="pack-back" onClick={goList}><ArrowLeft size={18}/>返回 APP Pack</Button><div><span className="pack-heading-icon"><Package size={23}/></span><span><h1>{newScreen?'建立 APP Pack':selected?.name||'找不到 APP Pack'}</h1><small>{newScreen?'用幾個簡單問題整理 Agent 與 NOVA App。':selected?`建立於 ${date(selected.events[0].at)} · ${selected.revisions.length} 次版本紀錄`:'請返回列表選擇紀錄。'}</small></span></div>{selected&&<Badge status={selected.status}/>}</header>
   {(newScreen||selected) ? <section className="pack-thread" aria-label="APP Pack 建立對話">
    <div className="pack-thread-body" ref={messagesRef}>
     {newScreen ? <div className="pack-start"><span className="pack-start-icon"><Sparkles size={28}/></span><h2>你想建立什麼樣的 App Pack？</h2><p>先描述想解決的工作問題。我會接著詢問使用者、資料與流程，再整理 Agent 和 NOVA App 的 Blueprint。</p><div className="pack-example-list"><Button variant="secondary" type="button" onClick={()=>setMessage('建立活動報名系統，員工可以查看活動並報名，管理員可以管理名單。')}><CalendarDays size={19}/><span><strong>建立活動報名系統</strong><small>活動列表、員工報名與名單管理</small></span><ArrowRight size={17}/></Button><Button variant="secondary" type="button" onClick={()=>setMessage('建立打卡系統，員工可以上下班打卡並查看出勤紀錄，主管可以查看團隊狀態。')}><Timer size={19}/><span><strong>建立打卡系統</strong><small>上下班打卡、出勤紀錄與團隊狀態</small></span><ArrowRight size={17}/></Button></div></div> : <div className="pack-conversation">
      <div className="pack-user-request"><span>你的需求</span><p>{selected.request}</p></div>
      {selected.status==='訪談中'&&<><div className="pack-progress"><span>需求訪談</span><strong>{selected.answers.length} / 4</strong><div><i style={{width:`${selected.answers.length*25}%`}}/></div></div><div className="pack-current-question"><span className="pack-answer-icon"><Sparkles size={16}/></span><div><small>下一個問題</small><h2>{questions[selected.answers.length]}</h2></div></div></>}
      {latest&&<div className="pack-text-result"><span>BLUEPRINT · REVISION {latest.number} · {latest.published?'已發佈':'待發佈'}</span><h2>{latest.number>1?'已更新':'已建立'}「{selected.name}」</h2><p>{latest.summary}</p><p>已整理 {selected.name} Agent、NOVA App 與相關資料規格。下方可查看畫面快照和 Agent 設定。</p>{!latest.published&&<div className="pack-publish-action"><Button variant="primary" type="button" className="pack-primary" onClick={publish}><CheckCircle2 size={17}/>發佈 Revision {latest.number}</Button><small>發佈後仍可在此預覽成果。</small></div>}</div>}
      {latest&&<details className="pack-fold"><summary><span>需求、權限與資料規格</span><ChevronDown size={17}/></summary><div className="pack-fold-content pack-spec-list">{selected.answers.map((answer,index)=><div key={index}><strong>{questions[index]}</strong><p>{answer}</p></div>)}</div></details>}
      {latest&&<details className="pack-fold"><summary><span>版本修改紀錄</span><ChevronDown size={17}/></summary><div className="pack-fold-content">{selected.revisions.map(rev=><div className="revision-row" key={rev.number}><strong>Revision {rev.number}</strong><span>{rev.changes}</span><small>{rev.published?'已發佈':'待發佈'} · {date(rev.at)}</small></div>)}</div></details>}
      <details className="pack-fold"><summary><span><MessageSquareText size={17}/>查看對話與問答紀錄</span><ChevronDown size={17}/></summary><div className="pack-fold-content">{selected.messages.map((item,index)=><div className={'pack-message '+item.role} key={index}>{item.role==='assistant'&&<span><Sparkles size={16}/></span>}<p>{item.text}</p></div>)}</div></details>
      <details className="pack-fold"><summary><span><FileClock size={17}/>建立與修改過程</span><ChevronDown size={17}/></summary><div className="pack-fold-content pack-event-list">{selected.events.map((event,index)=><div key={index}><strong>{event.text}</strong><small>{date(event.at)}</small></div>)}</div></details>
      {latest&&<PackPreview key={selected.id} pack={selected}/>}
     </div>}
    </div>
    <form className="pack-thread-composer" onSubmit={submit}><label htmlFor="pack-prompt">{newScreen?'描述你想建立的 App Pack':selected?.status==='訪談中'?'回答目前問題':'修改 Blueprint'}</label><div><Input as="textarea" id="pack-prompt" value={message} onChange={e=>setMessage(e.target.value)} placeholder={newScreen?'例如：建立活動報名系統…':selected?.status==='訪談中'?'輸入你的回答…':'例如：加入主管審核與 CSV 匯出…'} rows="2"/><Button variant="primary" className="pack-primary" type="submit" disabled={!message.trim()} aria-label="送出訊息"><Send size={18}/></Button></div></form>
   </section> : <div className="pack-empty"><p>這筆紀錄不存在。</p><Button variant="secondary" type="button" onClick={goList}>返回列表</Button></div>}
  </main>}
  {(notice||storageError)&&<div className="pack-toast" role="status">{storageError||notice}<Button variant="secondary" type="button" onClick={()=>setNotice('')} aria-label="關閉提示">×</Button></div>}
 </div>
}
createRoot(document.getElementById('root')).render(<AdminOnly><App/></AdminOnly>);

import '../src-shared/ui/workspace.css';
