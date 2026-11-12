import React,{useState} from 'react';
import AgentAvatar from '../src-shared/AgentAvatar.jsx';
import {CheckCircle2,ChevronDown,MessageCircle,RotateCw,Settings} from 'lucide-react';
import {Button,Card,PageTitle} from '../src-shared/ui/index.jsx';
import useLocalData,{readLocal} from '../src-shared/useLocalData.js';
import AgentSettings from '../src-dashboard/AgentSettings.jsx';
import CardHeading from './CardHeading.jsx';
import './settings.css';
import './runtime.css';

// Same agents, order and Slack workers as the live Runtime 管理 page. The control plane declares which runtime each
// agent runs on; every agent here runs on OpenShell + Hermes, one isolated sandbox per session.
const referenceAgents=[['nova','🧠','大腦總管 NOVA'],['watering','🌱','澆水提醒小幫手'],['visitor','🛎️','訪客通知助手'],['repairs','🛠️','總務報修管理 Agent'],['platform','🏢','Office Power 指令中心'],['product','🚀','Office Power 產品助理'],['pm-helper','🧑‍🦽','PM小幫手'],['nova-app','✨','Nova App 產生修改小幫手'],['html','🔍','HTML 結構分析專員'],['sales','🤖','Sales 助理'],['business-card','🪪','Nova名片辨識管家'],['hr','🤖','HR 小幫手'],['attendance-helper','⏱️','出勤打卡小幫手'],['attendance','🕘','出勤打卡助理'],['leave-specialist','🧑‍💼','假勤流程專員'],['leave','🗓️','假勤流程管家'],['pantry','🥛','Pantry 食物管理'],['pm','🤖','Nova PM'],['finance','🧾','Nova 報帳助理'],['asset','🖥️','AssetBot'],['it','🔧','維修小管家'],['equipment','🧰','器材管理幫手'],['events','🎟️','活動管理 Agent'],['ppt','🫨','PPT 小幫手'],['slide','🧭','Slide 助理'],['hr-helper','🤖','HR小幫手'],['leave-manager','🗓️','請假管理 Agent'],['nhi','','健保署 assistant'],['project','','專案助理']].map(([id,emoji,name])=>({id,emoji,name,role:name}));
const workers=[['hr','4b7319a5-3501-4154-aead-09c6be4c6e32'],['sales','f34eef46-34d0-4603-8766-cea225ef5476'],['nova-app','4a339416-8148-4f74-b41c-505c23556089']];
const capabilities=['Session Isolation','Tool Calling','Governance'];
const clock=()=>new Intl.DateTimeFormat('zh-TW',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());

export default function Runtime(){
 const [configs,setConfigs,error]=useLocalData('office-agent-settings-v1',{}),[selected,setSelected]=useState(null);
 const [checking,setChecking]=useState(false),[checkedAt,setCheckedAt]=useState('');
 const deleted=readLocal('office-deleted-agents-v1',[]),custom=readLocal('office-custom-agents-v1',[]);
 const agents=[...referenceAgents,...custom.filter(agent=>!referenceAgents.some(item=>item.id===agent.id))].filter(agent=>!deleted.includes(agent.id)).map(agent=>({...agent,...configs[agent.id]}));
 const connected=workers.map(([id,worker])=>({agent:agents.find(agent=>agent.id===id),worker})).filter(item=>item.agent);
 // The prototype has no gateway to ping, so a recheck only refreshes the checked time
 const recheck=()=>{setChecking(true);setTimeout(()=>{setChecking(false);setCheckedAt(clock())},800)};
 return <div className="settings-page runtime-page">
  <header className="page-heading usage-heading"><div><PageTitle>Runtime 管理</PageTitle><p className="runtime-intro">控制平面宣告 Agent 的 Runtime，所有對話由 OpenShell + Hermes 執行，每個 Session 使用獨立的 sandbox 與 Hermes Profile。<br/>OpenShell Gateway 由平台共用，服務無法連線時會明確回報錯誤。</p></div>
   <div className="usage-actions">{checkedAt&&<span className="usage-tag" role="status">最後檢查 {checkedAt}</span>}<Button onClick={recheck} disabled={checking}><RotateCw size={16}/>{checking?'檢查中…':'重新檢查狀態'}</Button></div></header>
  {error&&<p className="manage-alert settings-alert" role="alert">{error}</p>}
  <div className="settings-stack">
   <Card as="section" className="settings-card"><CardHeading title="執行器狀態總覽" copy="所有 Office Power Agent 統一在隔離的 OpenShell Sandbox 中由 Hermes 執行。"/>
    <div className="runtime-engine-row"><span><strong>OpenShell + Hermes <span className="usage-tag">hermes</span></strong><small><i className="runtime-dot" aria-hidden="true"/>可執行 (Runnable)</small></span><span className="usage-tag good"><CheckCircle2 size={16}/>Gateway 可連線</span></div>
    <details className="runtime-specs"><summary>規格與能力詳細<ChevronDown size={16} aria-hidden="true"/></summary>
     <dl><div><dt>健康狀態</dt><dd>正常</dd></div><div><dt>執行器類型</dt><dd>OpenShell / Session Sandbox</dd></div><div><dt>能力</dt><dd>{capabilities.map(item=><span key={item} className="usage-tag">{item}</span>)}</dd></div></dl></details></Card>
   <Card as="section" className="settings-card"><CardHeading title={<>使用此 Runtime 的 Agent<span className="runtime-count">{agents.length}</span></>} copy="點選 Agent 開啟它的 Agent 設定。"/>
    <div className="runtime-agents-wrap"><div className="runtime-agents">{agents.map(agent=><button type="button" key={agent.id} title={agent.name} aria-label={`${agent.name} 的 Agent 設定`} onClick={()=>setSelected(agent)}><AgentAvatar agent={agent} size={20} round/><span className="runtime-agent-name">{agent.name}</span><Settings size={16} aria-hidden="true"/></button>)}</div></div></Card>
   <Card as="section" className="settings-card"><CardHeading title="Slack Socket Mode Workers" copy="平台自建出站 WebSocket 連線至 Slack，免公網 URL 接收事件，完整經過平台治理（權限/用量/防護/稽核/計量）。"/>
    <ul className="runtime-workers">{connected.map(({agent,worker})=><li key={agent.id}><MessageCircle size={20} aria-hidden="true"/><span><strong>{agent.name}</strong><small>{worker}</small></span><span className="usage-tag good">已連線</span><Button size="medium" onClick={()=>setSelected(agent)}><Settings size={16}/>Agent 設定</Button></li>)}</ul></Card>
  </div>
  {selected&&<AgentSettings modal agent={selected} config={configs[selected.id]} onSave={config=>setConfigs(previous=>({...previous,[selected.id]:config}))} onClose={()=>setSelected(null)}/>}
 </div>;
}
