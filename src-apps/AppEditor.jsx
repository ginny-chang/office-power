import React,{useRef,useState,useEffect} from 'react';
import {ChevronLeft,Trash2,ArrowUp,Check,AppWindow,Globe} from 'lucide-react';
import {Dialog,Button} from '../src-shared/ui/index.jsx';
import {appIcons} from './app-data.js';
import AppScreen from './AppScreen.jsx';

const suggestions=[
 '幫我把說明寫得更清楚一點',
 '新增一個常用項目',
 '調整 App 的內容結構'
];

// Detail: Chat (Chat page Start Screen + conversation) left; full-bleed AppScreen right.
export default function AppEditor({app,onSave,onDelete,onBack}){
 const [draft,setDraft]=useState(app),[baseline,setBaseline]=useState(app),[input,setInput]=useState(''),[messages,setMessages]=useState([]),[confirm,setConfirm]=useState(false),[saved,setSaved]=useState(''),[error,setError]=useState('');
 const bottom=useRef();
 useEffect(()=>{bottom.current?.scrollIntoView({block:'nearest'})},[messages]);
 const Icon=appIcons[app.id]||AppWindow;
 const commit=extra=>{if(!draft.name.trim()){setError('請填寫 App 名稱。');return false}const next={...draft,...extra,name:draft.name.trim()};setDraft(next);setBaseline(next);onSave(next);setError('');return true};
 const save=()=>{if(commit())setSaved('已儲存')};
 const publish=()=>{if(commit({online:true}))setSaved('已發佈上線')};
 const send=text=>{const value=(typeof text==='string'?text:input).trim();if(!value)return;setMessages(v=>[...v,{role:'me',text:value},{role:'agent',text:'已記下你的調整需求。目前尚未連接 AI；請繼續描述想改的地方，右側畫面會是你調整後的 App。'}]);setInput('')};
 return <main className="app-editor">
  <header className="editor-head"><button className="editor-back" onClick={onBack}><ChevronLeft size={16}/>NOVA Apps</button><div className="editor-title"><div><h1>{draft.name||'未命名 App'}</h1></div><div className="editor-actions"><span className="editor-save-status" role="status">{saved||''}</span>{error&&<span className="editor-error" role="alert">{error}</span>}<button className="editor-delete" onClick={()=>setConfirm(true)}><Trash2 size={16}/>刪除</button><button className="editor-save" disabled={JSON.stringify(draft)===JSON.stringify(baseline)} onClick={save}><Check size={16}/>儲存</button><button className="editor-publish" onClick={publish}><Globe size={16}/>發佈</button></div></div></header>
  <section className="editor-chat conversation" aria-label="App Agent 對話">
   <header><span className="agent-mark" style={{'--agent':app.color,color:app.color}}><Icon size={20}/></span><div><h2>{draft.name||'未命名 App'} Agent</h2><p>App 調整 · 已就緒</p></div></header>
   <div className="message-space">
    {!messages.length&&<div className="chat-welcome"><span className="welcome-icon" style={{color:app.color}}><Icon size={24}/></span><h2>告訴我你需要做什麼調整</h2><p>描述想改的地方，右側會即時顯示完整的 App 畫面。</p><div className="suggestions">{suggestions.map(q=><Button variant="secondary" type="button" key={q} onClick={()=>send(q)}><span>{q}</span><ArrowUp size={16}/></Button>)}</div></div>}
    {!!messages.length&&<div className="date-rule"><span>新對話</span></div>}
    {messages.map((m,i)=><div className={`message ${m.role}`} key={i}><span>{m.role==='agent'&&<Icon size={16}/>}</span><div><p>{m.text}</p><small>{m.role==='me'?'你':'Agent'} · 剛剛</small></div></div>)}
    <div ref={bottom}/>
   </div>
   <footer><form className="composer" onSubmit={e=>{e.preventDefault();send()}}><textarea rows={1} aria-label="App 修改需求" placeholder={`傳訊息給 ${draft.name||'App'} Agent…`} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();send()}}}/><button type="submit" disabled={!input.trim()} aria-label="送出修改需求"><ArrowUp size={18}/></button></form></footer>
  </section>
  <section className="editor-app-window" aria-label="App">
   <div className="editor-screen-scroll"><AppScreen app={draft}/></div>
  </section>
  {confirm&&<Dialog title={`刪除「${app.name}」？`} onClose={()=>setConfirm(false)} footer={<><button onClick={()=>setConfirm(false)}>取消</button><button className="danger" onClick={()=>onDelete(app.id)}>刪除</button></>}><p className="dialog-copy">刪除後可在應用市集的回收區復原。</p></Dialog>}
 </main>
}
