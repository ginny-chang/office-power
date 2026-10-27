import React,{useState} from 'react';
import {ArrowUpRight,ArrowUp,AppWindow,X,Check,Pin} from 'lucide-react';
import AgentIcon from '../src-shared/AgentIcon.jsx';

const questions={
 '大腦總管 NOVA':['我想請特休，公司規定是什麼？','差旅費怎麼報銷？','幫我整理一份新人第一週要辦的事'],
 'HR 小幫手':['這週有哪些請假申請？','幫我建立新人報到清單','我還有多少特休？'],
 '維修小管家':['幫我查詢會議室設備狀態','建立一筆設備報修','整理本週維修紀錄'],
 'Nova PM':['整理本週專案進度','建立一個專案待辦 App','有哪些里程碑需要注意？'],
 'Sales 助理':['整理本週客戶跟進','幫我準備拜訪摘要','建立客戶追蹤 App'],
 'Nova 報帳助理':['差旅費怎麼報銷？','整理本月費用','建立費用追蹤 App']
};
export function Welcome({agent,onSend}){return <div className="chat-welcome"><span className="welcome-icon" style={{color:agent.color}}><AgentIcon agent={agent.agent} size={40}/></span><h2>和「{agent.agent}」開始對話吧。</h2><p>{agent.role}{agent.agent==='大腦總管 NOVA'?' · 會自動調度專責 Agent':' · 你的專屬 AI 工作夥伴'}</p><div className="suggestion-heading"><strong>試試以下問題</strong><span>點擊即可送出</span></div><div className="suggestions">{questions[agent.agent].map(q=><button key={q} onClick={()=>onSend(q)}>{q}<ArrowUp size={17}/></button>)}</div></div>}

export function NovaAppCard({app}){
 const [expanded,setExpanded]=useState(false),[pinned,setPinned]=useState(false),[done,setDone]=useState([]);
 const preview=<div className="nova-preview"><span>PROJECT / WORKSPACE</span><h3>{app.title}</h3><p>{app.description}</p>{app.items.map((item,i)=><label key={item}><input type="checkbox" checked={done.includes(i)} onChange={()=>setDone(v=>v.includes(i)?v.filter(n=>n!==i):[...v,i])}/>{item}</label>)}</div>;
 return <><article className="nova-message-card"><header><span><AppWindow size={18}/>NOVA APP</span><small>示範預覽</small></header>{preview}<footer><span>由 {app.agent} 建立</span><button onClick={()=>setExpanded(true)}>展開 App<ArrowUpRight size={16}/></button></footer></article>{expanded&&<div className="app-preview-overlay" onClick={()=>setExpanded(false)}><section role="dialog" aria-modal="true" aria-label={app.title} onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Escape')setExpanded(false)}}><header><strong>{app.title}</strong><button autoFocus aria-label="關閉 App 預覽" onClick={()=>setExpanded(false)}><X size={20}/></button></header>{preview}<footer><span>本機示範 · 未連接正式 App</span><button onClick={()=>setPinned(v=>!v)}>{pinned?<Check size={16}/>:<Pin size={16}/>} {pinned?'已收藏預覽':'收藏預覽'}</button></footer></section></div>}</>
}
