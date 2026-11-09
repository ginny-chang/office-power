import React,{useState} from 'react';
import {Check,CheckCircle2,MessageCircle,RotateCcw,Settings} from 'lucide-react';
import {Button,Card,PageTitle} from '../src-shared/ui/index.jsx';
import {Field} from '../src-shared/Management';
import useLocalData,{readLocal} from '../src-shared/useLocalData.js';
import {useAccountSettings} from '../src-shared/accountSettings.js';
import AgentSettings from '../src-dashboard/AgentSettings.jsx';
import CardHeading from './CardHeading.jsx';
import './settings.css';
import './runtime.css';

const referenceAgents=[['nova','🧠','大腦總管 NOVA'],['watering','🌱','澆水提醒小幫手'],['visitor','🔔','訪客通知助手'],['repairs','🛠️','總務報修管理 Agent'],['platform','🏢','Office Power 指令中心'],['product','🚀','Office Power 產品助理'],['pm-helper','🧑‍💼','PM小幫手'],['nova-app','✨','Nova App 產生修改小幫手'],['html','🔍','HTML 結構分析專員'],['sales','🤖','Sales 助理'],['business-card','🪪','Nova名片辨識管家'],['hr','🤖','HR 小幫手'],['attendance-helper','⏱️','出勤打卡小幫手'],['attendance','🕘','出勤打卡助理'],['leave-specialist','🧑‍💼','假勤流程專員'],['leave','🗓️','假勤流程管家'],['pantry','🥛','Pantry 食物管理'],['pm','🤖','Nova PM'],['finance','🧾','Nova 報帳助理'],['asset','🖥️','AssetBot'],['it','🔧','維修小管家'],['equipment','🧰','器材管理幫手'],['events','🎟️','活動管理 Agent'],['ppt','💡','PPT 小幫手'],['slide','🧭','Slide 助理'],['hr-helper','🤖','HR小幫手']].map(([id,emoji,name])=>({id,emoji,name,role:name}));
const workers=[['hr','4b7319a5-3501-4154-aead-09c6be4c6e32'],['sales','f34ef4e6-34d0-4603-8766-ca225ef5476'],['nova-app','4a339416-8148-4f74-b41c-505c23556089']];
const fields=({gateway,timeout,concurrency})=>JSON.stringify([gateway,String(timeout),String(concurrency)]);

export default function Runtime(){
 const [settings,save,saveError]=useAccountSettings(),[draft,setDraft]=useState(settings),[notice,setNotice]=useState('');
 const [configs,setConfigs,error]=useLocalData('office-agent-settings-v1',{}),[selected,setSelected]=useState(null);
 const deleted=readLocal('office-deleted-agents-v1',[]),custom=readLocal('office-custom-agents-v1',[]);
 const agents=[...referenceAgents,...custom.filter(agent=>!referenceAgents.some(item=>item.id===agent.id))].filter(agent=>!deleted.includes(agent.id)).map(agent=>({...agent,...configs[agent.id]}));
 const connected=workers.map(([id,worker])=>({agent:agents.find(agent=>agent.id===id),worker})).filter(item=>item.agent);
 const dirty=fields(draft)!==fields(settings);
 const submit=event=>{event.preventDefault();if(!dirty)return;if(save({gateway:draft.gateway,timeout:draft.timeout,concurrency:draft.concurrency},'更新 Runtime 設定','Gateway 與執行設定'))setNotice('Runtime 設定已儲存。')};
 return <form className="settings-page runtime-page" onSubmit={submit}>
  <header className="page-heading usage-heading"><div><PageTitle>Runtime 管理</PageTitle><p>檢視執行器狀態、Gateway 設定，以及使用這個 Runtime 的 Agent。</p></div>
   <div className="usage-actions"><Button disabled={!dirty} onClick={()=>{setDraft(settings);setNotice('已還原為上次儲存的設定。')}}><RotateCcw size={16}/>還原修改</Button><Button variant="primary" type="submit" disabled={!dirty}><Check size={16}/>儲存</Button></div></header>
  {(notice||saveError||error)&&<p className="manage-alert settings-alert" role="status">{saveError||error||notice}</p>}
  <div className="settings-grid">
   <Card as="section" className="settings-card"><CardHeading title="執行器" copy="所有 Office Power Agent 統一在隔離的 OpenShell Sandbox 中由 Hermes 執行。"/>
    <div className="runtime-engine-row"><span><strong>OpenShell + Hermes</strong><small>隔離環境 OpenShell Sandbox · 執行器 Hermes</small></span><span className="usage-tag good"><CheckCircle2 size={16}/>Gateway 可連線</span></div></Card>
   <Card as="section" className="settings-card"><CardHeading title="Gateway 與執行設定" copy="連線位址與任務的執行上限。"/>
    <Field label="Gateway URL" required type="url" pattern="https?://.*" value={draft.gateway} onChange={gateway=>setDraft(d=>({...d,gateway}))}/>
    <div className="runtime-field-pair"><Field label="任務逾時（秒）" required type="number" min="10" max="3600" value={draft.timeout} onChange={timeout=>setDraft(d=>({...d,timeout}))}/><Field label="同時執行上限" required type="number" min="1" max="32" value={draft.concurrency} onChange={concurrency=>setDraft(d=>({...d,concurrency}))}/></div></Card>
   <Card as="section" className="settings-card wide"><CardHeading title={`使用此 Runtime 的 Agent · ${agents.length}`} copy="目前由這個 Runtime 執行的 Agent。"/>
    <div className="runtime-agents">{agents.map(agent=><button type="button" key={agent.id} aria-label={`${agent.name} 的 Agent 設定`} onClick={()=>setSelected(agent)}><span aria-hidden="true">{agent.emoji}</span>{agent.name}</button>)}</div></Card>
   <Card as="section" className="settings-card wide"><CardHeading title="Slack 連線" copy="平台自建出站 WebSocket 連線至 Slack，免公開 URL 接收事件；權限、用量、安全性、稽核與計費由平台統一管理。"/>
    <ul className="runtime-workers">{connected.map(({agent,worker})=><li key={agent.id}><MessageCircle size={20} aria-hidden="true"/><span><strong>{agent.name}</strong><small>{worker}</small></span><span className="usage-tag good">已連線</span><Button size="medium" onClick={()=>setSelected(agent)}><Settings size={16}/>Agent 設定</Button></li>)}</ul></Card>
  </div>
  {selected&&<AgentSettings modal agent={selected} config={configs[selected.id]} onSave={config=>setConfigs(previous=>({...previous,[selected.id]:config}))} onClose={()=>setSelected(null)}/>}
 </form>;
}
