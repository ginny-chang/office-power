import AccountMenu from '../src-shared/AccountMenu';
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
// Thin line glyphs shared with My Board and NOVA Apps.
import {LayoutGrid as IconLayoutGrid,MessageCircle as IconMessageCircle,Blocks as IconApps,Clock as IconClock,Box as IconCube,Users as IconUsers,Search as IconSearch,Plus as IconPlus,ArrowUp as IconSend,Pin as IconPin,PinOff as IconPinnedOff,ChevronLeft as IconChevronLeft,ChevronRight as IconChevronRight,Folder as IconFolder,Sparkles as IconSparkles,Package as IconPackage,X as IconX} from 'lucide-react';
import AgentIcon from '../src-shared/AgentIcon.jsx';
import {showAdmin} from '../src-shared/features.js';
import {useUserRole} from '../src-shared/UserRole.jsx';
import CreateAgent from '../src-shared/CreateAgent.jsx';
import AgentSettings from '../src-dashboard/AgentSettings.jsx';
import useLocalData from '../src-shared/useLocalData.js';
import {Welcome,NovaAppCard} from './ConversationContent.jsx';
// Tokens load first in dev and build alike (Vite emits shared CSS ahead of page CSS); page layers override them.
import '../src-shared/tokens.css';
import './styles.css';
import '../src-shared/create-agent.css';

const seed=[
 {id:'t1',agentId:'nova',agent:'大腦總管 NOVA',role:'團隊協作',time:'今天 14:38',stamp:12,title:'今天的工作摘要',preview:'三個部門的進度已整理完成。',unread:2,color:'#007aff',used:true,messages:[
  ['agent','午安！我整理好了今天的工作摘要：HR 有兩筆請假待你確認，維修小管家的報修 #128 已經完成，Nova PM 正在更新 Dashboard 改版的里程碑。'],
  ['me','先把需要我決策的項目排在最前面。'],
  ['agent','好的，需要你決策的有三項：\n1. HR：兩筆請假申請（王小明 10/31、陳怡君 11/3–11/4）\n2. 財務：九月差旅費有一筆超出部門預算 8%\n3. PM：Dashboard 改版是否延後一週上線'],
  ['me','請假的部分有沒有衝突？'],
  ['agent','我查過部門行事曆，10/31 當天只有王小明請假，沒有衝突。陳怡君 11/3 有一場客戶簡報，她已經指定林佳穎代理，簡報資料也交接完成了。'],
  ['me','那兩筆都可以核准。差旅費超出的原因是什麼？'],
  ['agent','主要是 9/18 臨時加開的台中客戶拜訪，高鐵和住宿多出 NT$4,860。這筆有 Sales 主管的事前核可，我建議核准，並在十月預算中調整。'],
  ['me','好，照你的建議處理。Dashboard 延後的事等 PM 整理完再說。'],
  ['agent','收到。我已經請 HR 小幫手送出兩筆請假核准，也通知報帳助理處理差旅費。Nova PM 預計 16:00 前交里程碑更新，到時候我再提醒你。']]},
 {id:'t7',agentId:'nova',agent:'大腦總管 NOVA',role:'團隊協作',time:'昨天 09:12',stamp:10,title:'週一主管會議議程',preview:'議程草稿已完成，共 5 個討論項目。',unread:0,color:'#007aff',used:true,messages:[
  ['me','幫我準備週一主管會議的議程。'],
  ['agent','我根據上週的會議紀錄和各部門回報，整理出 5 個討論項目：Q4 招募進度、Dashboard 改版時程、辦公室設備汰換、年終活動預算、客戶滿意度調查結果。'],
  ['me','設備汰換的部分先拿掉，下個月再談。'],
  ['agent','已移除。目前剩 4 個項目，預計 50 分鐘。需要我把議程寄給與會主管嗎？'],
  ['me','好，週五下午寄出。'],
  ['agent','已排定週五 15:00 寄出，寄出後我會在這裡回報。']]},
 {id:'t2',agentId:'hr',agent:'HR 小幫手',role:'人力資源',time:'今天 11:06',stamp:11,title:'請假規定與待審核項目',preview:'兩筆申請已完成資料檢查。',unread:1,color:'#af52de',used:true,messages:[
  ['me','請幫我整理這週的請假申請。'],
  ['agent','這週共有兩筆請假申請等你確認：\n・王小明｜特休｜10/31（一天）\n・陳怡君｜特休｜11/3–11/4（兩天），代理人：林佳穎'],
  ['me','陳怡君今年的特休還剩多少？'],
  ['agent','陳怡君今年共有 14 天特休，已使用 9 天，這次請 2 天後還會剩 3 天。依公司規定，未休完的特休可以遞延到明年 3 月底。'],
  ['me','了解，兩筆都先幫我標成待核准。'],
  ['agent','已標記完成。你核准後我會自動通知兩位同仁並更新出勤紀錄。']]},
 {id:'t8',agentId:'hr',agent:'HR 小幫手',role:'人力資源',time:'10 月 10 日',stamp:6,title:'11 月新人報到清單',preview:'三位新人的報到事項已建立。',unread:0,color:'#af52de',used:true,messages:[
  ['me','11 月有三位新人報到，幫我建立報到清單。'],
  ['agent','已建立報到清單，包含帳號開通、設備領取、勞健保加保、新人訓練和導師配對五個階段。'],
  ['me','設備的部分請維修小管家一起準備。'],
  ['agent','已經同步給維修小管家，三台筆電預計 10/28 前設定完成。']]},
 {id:'t3',agentId:'it',agent:'維修小管家',role:'設備管理',time:'昨天 16:42',stamp:9,title:'會議室報修 #128',preview:'投影設備已恢復使用。',unread:0,color:'#30b0c7',used:true,messages:[
  ['me','3F 大會議室的投影機又沒畫面了。'],
  ['agent','收到，已建立報修 #128。我先遠端檢查過，投影機有通電，但訊號源沒有偵測到輸入，可能是 HDMI 線材或切換器的問題。'],
  ['me','下午兩點有客戶會議，來得及嗎？'],
  ['agent','來得及。已經安排總務同仁 13:00 到場，會先帶一條備用 HDMI 線和無線投影器過去。'],
  ['agent','更新：問題是 HDMI 切換器故障，已更換新品。會議室投影設備已恢復使用，報修 #128 已完成。'],
  ['me','請把處理紀錄留在設備履歷。'],
  ['agent','已更新設備履歷。這台切換器今年第二次故障，我建議下季汰換，已經加進設備汰換清單。']]},
 {id:'t9',agentId:'it',agent:'維修小管家',role:'設備管理',time:'10 月 6 日',stamp:3,title:'筆電更換申請',preview:'新筆電已送達，等待資料轉移。',unread:0,color:'#30b0c7',used:true,messages:[
  ['me','我的筆電電池續航剩不到一小時，可以申請更換嗎？'],
  ['agent','可以。你的筆電已使用 4 年 2 個月，符合汰換條件，我已經幫你送出申請。'],
  ['agent','新筆電已送達，你方便的時候告訴我，我會安排資料轉移。']]},
 {id:'t4',agentId:'pm',agent:'Nova PM',role:'專案管理',time:'10 月 9 日',stamp:8,title:'Dashboard 改版里程碑',preview:'已建立 NOVA App：Dashboard 改版待辦。',unread:0,color:'#34c759',used:true,messages:[
  ['me','本週改版先處理哪些項目？'],
  ['agent','依照目前的相依關係，建議這週先完成資訊架構和 Office 互動設計，Chat 流程可以下週再接著做。'],
  ['me','好，幫我整理成待辦。'],
  ['agent','已建立 Dashboard 改版待辦 App，可直接在下方更新任務進度，或展開操作。',{title:'Dashboard 改版待辦',description:'集中管理這週的設計與開發任務。',agent:'Nova PM',items:['確認 My Board 資訊架構','完成 Office 互動設計','檢視 Chat 對話流程']}],
  ['me','Office 互動設計需要誰一起看？'],
  ['agent','建議找前端的志豪和設計的若涵，他們這週三下午都有空，要我幫你約 30 分鐘嗎？']]},
 {id:'t10',agentId:'pm',agent:'Nova PM',role:'專案管理',time:'10 月 2 日',stamp:2,title:'Q4 Roadmap 排序',preview:'已依影響範圍排出優先順序。',unread:0,color:'#34c759',used:true,messages:[
  ['me','幫我把 Q4 的需求依影響範圍排序。'],
  ['agent','已依影響使用者數與開發成本排序，前三名是：排程失敗通知、Agent 選擇器、看板推薦釘選。']]},
 {id:'t5',agentId:'sales',agent:'Sales 助理',role:'客戶關係',time:'10 月 8 日',stamp:5,title:'本週客戶跟進',preview:'五位客戶需要安排下一步。',unread:0,color:'#5856d6',used:false,messages:[['agent','本週有五位客戶需要安排下一步，其中兩位建議今天回覆。']]},
 {id:'t6',agentId:'finance',agent:'Nova 報帳助理',role:'財務管理',time:'10 月 7 日',stamp:4,title:'九月費用整理',preview:'費用分類已完成。',unread:0,color:'#ff9500',used:false,messages:[['me','九月費用整理好了嗎？'],['agent','已完成分類，目前沒有需要補件的項目。']]}
];

// The new-chat picker: NOVA first as the default, the specialists grouped by area.
const blurbs={nova:'不確定找誰時交給我，我會自動調度專責 Agent',hr:'請假、出勤與人事規定',it:'設備狀態、報修與維修紀錄',finance:'費用整理與報帳規定',sales:'客戶跟進與拜訪準備',pm:'專案進度、里程碑與待辦'};
const areas=[['行政支援',['hr','it','finance']],['業務與專案',['sales','pm']]];
const roster=[...new Map(seed.map(({agentId,agent,role,color})=>[agentId,{agentId,agent,role,color}])).values()];
const byId=id=>roster.find(a=>a.agentId===id);

const nav=[[IconLayoutGrid,'My Board','dashboard.html'],[IconMessageCircle,'Chat','chat.html'],[IconApps,'NOVA Apps','apps.html']];
const clampListWidth=width=>Math.max(240,Math.min(700,window.innerWidth-440,width));
function Sidebar(){const role=useUserRole(),admin=showAdmin&&role==='admin';return <aside className="rail op-rail"><a className="logo" href="./dashboard.html" aria-label="Office Power"><img src="./officepower-app-icon.svg" alt=""/></a><nav aria-label="主要導覽">{nav.map(([Icon,label,url])=><a key={url} className={label==='Chat'?'op-rail-item active':'op-rail-item'} href={`./${url}`} data-label={label} aria-label={label} aria-current={label==='Chat'?'page':undefined}><Icon size={20}/></a>)}{admin&&<><span/><a className="op-rail-item" href="./app-packs.html" data-label="APP Pack" aria-label="APP Pack"><IconPackage size={20}/></a><a className="op-rail-item" href="./capabilities.html" data-label="能力中心" aria-label="能力中心"><IconCube size={20}/></a><a className="op-rail-item" href="./organization.html" data-label="Organization" aria-label="Organization"><IconUsers size={20}/></a></>}</nav><AccountMenu/></aside>}

function App(){
 const requested=new URLSearchParams(location.search).get('agent');
 const initial=seed.find(t=>t.agentId===requested)||seed[0];
 const isAdmin=useUserRole()==='admin';
 const [customAgents,setCustomAgents]=useLocalData('office-custom-agents-v1',[]);
 const [agentConfigs,setAgentConfigs]=useLocalData('office-agent-settings-v1',{});
 const [threads,setThreads]=useLocalData('office-chat-threads-v2',seed);
 const [selected,setSelected]=useState(seed.some(t=>t.agentId===requested)||!requested?initial.id:null),[query,setQuery]=useState(''),[draft,setDraft]=useState(''),[newAgent,setNewAgent]=useState(()=>{const agent=customAgents.find(a=>a.id===requested);return agent?{...agent,agentId:agent.id,agent:agent.name,messages:[]}:null}),[mobileList,setMobileList]=useState(true),[pins,setPins]=useState(()=>{try{return JSON.parse(localStorage.getItem('chat-pins'))||['t1','t4']}catch{return ['t1','t4']}}),[collapsed,setCollapsed]=useState(new Set()),[picking,setPicking]=useState(false),[searching,setSearching]=useState(false),[activeSection,setActiveSection]=useState(null),[createOpen,setCreateOpen]=useState(false),[settingsAgent,setSettingsAgent]=useState(null),[listWidth,setListWidth]=useState(()=>{const saved=Number(localStorage.getItem('office-chat-list-width'));return clampListWidth(Number.isFinite(saved)&&saved>=240&&saved<=700?saved:340)});const input=useRef(),resize=useRef(null);
 useEffect(()=>{localStorage.setItem('chat-pins',JSON.stringify(pins))},[pins]);
 useEffect(()=>{localStorage.setItem('office-chat-list-width',String(listWidth))},[listWidth]);
 useEffect(()=>{const fit=()=>setListWidth(width=>clampListWidth(width));window.addEventListener('resize',fit);return()=>window.removeEventListener('resize',fit)},[]);
 const visible=useMemo(()=>threads.filter(t=>(t.used||pins.includes(t.id)||t.id===selected)&&`${t.agent} ${t.title} ${t.preview}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>b.stamp-a.stamp),[threads,pins,selected,query]);
 const current=newAgent||threads.find(t=>t.id===selected)||initial;
 const groups=useMemo(()=>{const map=new Map();visible.forEach(item=>{if(!map.has(item.agentId))map.set(item.agentId,{id:item.agentId,agent:item.agent,role:item.role,color:item.color,emoji:item.emoji,items:[]});map.get(item.agentId).items.push(item)});customAgents.filter(agent=>agent.name.toLowerCase().includes(query.toLowerCase())).forEach(agent=>{if(!map.has(agent.id))map.set(agent.id,{id:agent.id,agent:agent.name,role:agent.role,color:agent.color,emoji:agent.emoji,items:[]})});return [...map.values()].map(group=>({...group,items:group.items.sort((a,b)=>(Number(pins.includes(b.id))-Number(pins.includes(a.id)))||b.stamp-a.stamp)})).sort((a,b)=>(b.items[0]?.stamp||0)-(a.items[0]?.stamp||0))},[visible,pins,customAgents,query]);
 const choose=(id,section=null)=>{setActiveSection(section);setNewAgent(null);setDraft('');setSelected(id);setThreads(ts=>ts.map(t=>t.id===id?{...t,unread:0,used:true}:t));setMobileList(false)};
 const startNew=(agent=current)=>{setNewAgent({...agent,messages:[]});setSelected(null);setDraft('');setMobileList(false)};
 const pick=agent=>{setPicking(false);startNew(agent)};
 const beginResize=e=>{if(e.button!==0)return;e.preventDefault();resize.current={x:e.clientX,width:listWidth};e.currentTarget.setPointerCapture(e.pointerId)};
 const moveResize=e=>{if(!resize.current)return;setListWidth(clampListWidth(resize.current.width+e.clientX-resize.current.x))};
 const endResize=e=>{resize.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)};
 const createAgent=agent=>{setCustomAgents(items=>[...items,agent]);setCreateOpen(false);setSettingsAgent(agent.id);setNewAgent({...agent,agentId:agent.id,agent:agent.name,messages:[]});setSelected(null);setDraft('');setMobileList(false)};
 const saveAgentConfig=config=>{setAgentConfigs(previous=>({...previous,[settingsAgent]:config}));setCustomAgents(items=>items.map(agent=>agent.id===settingsAgent?{...agent,name:config.name,emoji:config.emoji,role:config.role,model:config.model,prompt:config.prompt,access:config.access}:agent));setNewAgent(agent=>agent?.agentId===settingsAgent?{...agent,agent:config.name,emoji:config.emoji,role:config.role}:agent)};
 const custom=customAgents.map(a=>({agentId:a.id,agent:a.name,role:a.role,color:a.color,emoji:a.emoji}));
 const pinnedItems=visible.filter(t=>pins.includes(t.id));
 // Without an explicit pick (first load, deep link) the first section that holds the conversation carries the highlight.
 const isPinnedOpen=pinnedItems.some(t=>t.id===selected);
 const shownSection=activeSection==='pinned'&&!isPinnedOpen?'agents':activeSection||(isPinnedOpen?'pinned':'agents');
 const closeSearch=()=>{setSearching(false);setQuery('')};
 const togglePin=id=>setPins(p=>p.includes(id)?p.filter(v=>v!==id):[...p,id]);
 const toggleGroup=id=>setCollapsed(previous=>{const next=new Set(previous);next.has(id)?next.delete(id):next.add(id);return next});
 const send=(suggestion)=>{const text=(typeof suggestion==='string'?suggestion:draft).trim();if(!text)return;if(newAgent){const id=`t${Date.now()}`;setThreads(ts=>[{...current,id,title:text,preview:text,messages:[['me',text]],unread:0,used:true,time:'剛剛',stamp:Date.now()},...ts]);setSelected(id);setActiveSection(null);setNewAgent(null)}else setThreads(ts=>ts.map(t=>t.id===current.id?{...t,used:true,messages:[...t.messages,['me',text]],preview:text,time:'剛剛',stamp:Date.now()}:t));setDraft('')};
 return <div className="shell"><Sidebar/><main className="chat-main" style={{'--chat-list-width':`${listWidth}px`}}>
  <section className={`thread-panel ${mobileList?'mobile-open':''}`} aria-label="對話列表"><header><h1>Chat</h1><div className="thread-actions"><button className="thread-icon" onClick={()=>{setSearching(v=>!v);setTimeout(()=>input.current?.focus())}} aria-label="搜尋 Agent 或對話" aria-pressed={searching}><IconSearch size={18}/></button><button className="thread-icon new-chat" onClick={()=>setPicking(v=>!v)} aria-label="開啟新對話" aria-haspopup="dialog" aria-expanded={picking}><IconPlus size={18}/></button></div>{picking&&<AgentPicker custom={custom} onPick={pick} onCreate={()=>{setPicking(false);setCreateOpen(true)}} onClose={()=>setPicking(false)}/>}</header>{searching&&<label className="search op-search"><IconSearch size={17}/><input ref={input} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Escape')closeSearch()}} placeholder="搜尋 Agent 或對話"/><button aria-label="關閉搜尋" onClick={closeSearch}><IconX size={16}/></button></label>}<div className="thread-scroll">{pinnedItems.length>0&&<section className="chat-section"><h2>釘選</h2>{pinnedItems.map(item=><ConversationRow key={item.id} item={item} selected={shownSection==='pinned'?selected:null} choose={id=>choose(id,'pinned')} pinned={pins.includes(item.id)} togglePin={togglePin}/>)}</section>}{groups.length>0&&<section className="chat-section"><h2>Agents</h2>{groups.map(group=><AgentFolder key={group.id} group={group} collapsed={collapsed.has(group.id)} toggle={()=>toggleGroup(group.id)} selected={shownSection==='agents'?selected:null} choose={id=>choose(id,'agents')} pins={pins} togglePin={togglePin} onNew={()=>startNew({agentId:group.id,agent:group.agent,role:group.role,color:group.color,emoji:group.emoji})}/>)}</section>}{visible.length>0&&<section className="chat-section"><h2>最近項目</h2>{visible.map(item=><ConversationRow key={item.id} item={item} selected={shownSection==='recent'?selected:null} choose={id=>choose(id,'recent')} pinned={pins.includes(item.id)} togglePin={togglePin}/>)}</section>}{!groups.length&&<div className="empty"><IconFolder size={25}/><strong>沒有符合的對話</strong><span>試試其他關鍵字，或從右上角開始新對話。</span></div>}</div></section>
  <div className="chat-resize-handle" role="separator" aria-label="調整對話列表與聊天區寬度" aria-orientation="vertical" aria-valuemin={240} aria-valuemax={Math.max(240,Math.min(700,window.innerWidth-440))} aria-valuenow={listWidth} tabIndex={0} onPointerDown={beginResize} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();setListWidth(width=>clampListWidth(width+(e.key==='ArrowRight'?28:-28)))}}}><span/></div>
  <section className={`conversation ${mobileList?'mobile-hidden':''}`} aria-label="目前對話">{current&&<><header><button className="back" onClick={()=>setMobileList(true)} aria-label="返回對話列表"><IconChevronLeft size={20}/></button><span className="agent-mark" style={{'--agent':current.color}}><AgentIcon agent={current.agent} emoji={current.emoji} size={20}/></span><div><h2>{current.agent}</h2><p>{current.role} · 已就緒</p></div>{!newAgent&&<button className="details" aria-label={pins.includes(current.id)?'取消釘選對話':'釘選對話'} aria-pressed={pins.includes(current.id)} onClick={()=>togglePin(current.id)}><IconPin size={18}/></button>}</header><div className="message-space"><div className="date-rule"><span>{newAgent?'新對話':current.time}</span></div>{newAgent&&<Welcome agent={current} onSend={send}/>} {current.messages.map((m,i)=><div key={i} className={`message ${m[0]}`}><span>{m[0]==='agent'&&<AgentIcon agent={current.agent} emoji={current.emoji} size={16}/>}</span><div><p>{m[1]}</p>{m[2]&&<NovaAppCard app={m[2]}/>}<small>{m[0]==='me'?'你':'Agent'} · {i===current.messages.length-1?'剛剛':'稍早'}</small></div></div>)}</div><footer><div className="composer"><textarea rows="1" value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}else if(e.key==='Escape')setDraft('')}} placeholder={`傳訊息給 ${current.agent}…`}/><button onClick={send} disabled={!draft.trim()}><IconSend size={18}/><span>送出</span></button></div></footer></>}</section>
 </main>{createOpen&&<CreateAgent onClose={()=>setCreateOpen(false)} onCreate={createAgent}/>}{settingsAgent&&<AgentSettings agent={customAgents.find(agent=>agent.id===settingsAgent)} config={agentConfigs[settingsAgent]} onSave={saveAgentConfig} onClose={()=>setSettingsAgent(null)}/>}</div>
}
function AgentPicker({custom,onPick,onCreate,onClose}){
 const box=useRef();
 useEffect(()=>{box.current.querySelector('button').focus();const away=e=>{if(!box.current.contains(e.target)&&!e.target.closest('.new-chat'))onClose()};document.addEventListener('mousedown',away);return()=>document.removeEventListener('mousedown',away)},[]);
 const row=a=><button key={a.agentId} className="picker-agent" onClick={()=>onPick(a)}><span className="agent-mark" style={{'--agent':a.color}}><AgentIcon agent={a.agent} emoji={a.emoji} size={16}/></span><span><strong>{a.agent}</strong><small>{[a.role,blurbs[a.agentId]].filter(Boolean).join(' · ')}</small></span></button>;
 const nova=byId('nova');
 return <div className="agent-picker" role="dialog" aria-label="選擇對話的 Agent" ref={box} onKeyDown={e=>{if(e.key==='Escape')onClose()}}>
  <header><strong>新對話</strong><small>選擇要對話的 Agent</small></header>
  <button className="picker-agent featured" onClick={()=>onPick(nova)}><span className="agent-mark"><AgentIcon agent={nova.agent} size={18}/></span><span><strong>{nova.agent}<em><IconSparkles size={12}/>推薦</em></strong><small>{blurbs.nova}</small></span></button>
  {areas.map(([title,ids])=><section key={title}><h3>{title}</h3>{ids.map(id=>row(byId(id)))}</section>)}
  {custom.length>0&&<section><h3>自訂 Agent</h3>{custom.map(row)}</section>}
  {onCreate&&<button className="picker-create" onClick={onCreate}><IconPlus size={16}/>新增 Agent</button>}
 </div>
}
function ConversationRow({item,selected,choose,pinned,togglePin}){return <div className={`conversation-row ${selected===item.id?'active':''}`}><button className="conversation-main" onClick={()=>choose(item.id)}><strong>{item.title}</strong></button><button className={pinned?'row-pin pinned':'row-pin'} aria-label={pinned?`取消釘選${item.title}`:`釘選${item.title}`} onClick={()=>togglePin(item.id)}><IconPin className="pin-idle" size={14}/><IconPinnedOff className="pin-hover" size={14}/></button></div>}
function AgentFolder({group,collapsed,toggle,selected,choose,pins,togglePin,onNew}){const unread=group.items.reduce((sum,item)=>sum+item.unread,0);return <section className={`agent-folder-group ${collapsed?'collapsed':''}`}><div className="agent-folder-row"><button className="agent-folder-toggle" onClick={toggle} aria-expanded={!collapsed}><IconChevronRight className="folder-chevron" size={12}/><span className="agent-folder-icon" style={{'--agent':group.color}}><AgentIcon className="agent-symbol" agent={group.agent} emoji={group.emoji} size={14}/></span><span className="agent-folder-copy"><strong>{group.agent}</strong></span>{unread>0&&<em>{unread}</em>}</button><button className="agent-folder-new" onClick={onNew} aria-label={`和 ${group.agent} 開始新對話`}><IconPlus size={14}/></button></div>{!collapsed&&group.items.length>0&&<div className="agent-threads">{group.items.map(item=><ConversationRow key={item.id} item={item} selected={selected} choose={choose} pinned={pins.includes(item.id)} togglePin={togglePin}/>)}</div>}</section>}
createRoot(document.getElementById('root')).render(<App/>);
