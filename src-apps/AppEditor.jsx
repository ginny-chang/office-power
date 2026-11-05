import React,{useRef,useState,useEffect} from 'react';
import {ChevronLeft,Trash2,ArrowRight,AppWindow,Maximize2,Plus,X} from 'lucide-react';
import {Dialog,Button} from '../src-shared/ui/index.jsx';
import {appIcons,appAuthors} from './app-data.js';
import AppScreen from './AppScreen.jsx';

const suggestions=[
 '幫我把說明寫得更清楚一點',
 '新增一個常用項目',
 '調整 App 的內容結構'
];
const clampChatWidth=width=>Math.max(280,Math.min(720,window.innerWidth-520,width));

// Detail: Chat left + drag resize (Chat-style) + full App right with Expand preview.
export default function AppEditor({app,onSave,onDelete,onBack}){
 const [draft,setDraft]=useState(app),[input,setInput]=useState(''),[messages,setMessages]=useState([]),[confirm,setConfirm]=useState(false),[expanded,setExpanded]=useState(false),[error,setError]=useState('');
 const [chatWidth,setChatWidth]=useState(()=>{const saved=Number(localStorage.getItem('office-nova-app-chat-width'));return clampChatWidth(Number.isFinite(saved)&&saved>=280&&saved<=720?saved:420)});
 const bottom=useRef(),resize=useRef(null);
 useEffect(()=>{bottom.current?.scrollIntoView({block:'nearest'})},[messages]);
 useEffect(()=>{localStorage.setItem('office-nova-app-chat-width',String(chatWidth))},[chatWidth]);
 useEffect(()=>{const fit=()=>setChatWidth(width=>clampChatWidth(width));window.addEventListener('resize',fit);return()=>window.removeEventListener('resize',fit)},[]);
 const Icon=appIcons[app.id]||AppWindow;
 const blankRecord=()=>({author:app.author||appAuthors[0],category:app.category||'',emoji:app.emoji||'',description:app.description||''});
 const [record,setRecord]=useState(blankRecord);
 const authors=[...new Set([record.author,...appAuthors].filter(Boolean))];
 const saveRecord=()=>{const next={...draft,author:record.author,category:record.category.trim(),emoji:record.emoji.trim(),description:record.description.trim()};setDraft(next);onSave(next);setError('')};
 const send=text=>{const value=(typeof text==='string'?text:input).trim();if(!value)return;setMessages(v=>[...v,{role:'me',text:value},{role:'agent',text:'已記下你的調整需求。目前尚未連接 AI；請繼續描述想改的地方，右側畫面會是你調整後的 App。'}]);setInput('')};
 const beginResize=e=>{if(e.button!==0)return;e.preventDefault();resize.current={x:e.clientX,width:chatWidth};e.currentTarget.setPointerCapture(e.pointerId)};
 const moveResize=e=>{if(!resize.current)return;setChatWidth(clampChatWidth(resize.current.width+e.clientX-resize.current.x))};
 const endResize=e=>{resize.current=null;if(e.currentTarget.hasPointerCapture?.(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId)};
 return <main className="app-editor" style={{'--editor-chat-width':`${chatWidth}px`}}>
  <header className="editor-head"><button className="editor-back" onClick={onBack}><ChevronLeft size={16}/>NOVA Apps</button><div className="editor-title"><h1>{draft.name||'未命名 App'}</h1><span className="editor-save-status" role="status">{error||''}</span></div></header>
  <section className="editor-chat conversation" aria-label="App Agent 對話">
   <header><span className="agent-mark" style={{'--agent':app.color,color:app.color}}><Icon size={20}/></span><div><h2>{draft.name||'未命名 App'} Agent</h2><p>App 調整 · 已就緒</p></div></header>
   <form className="page-record" onSubmit={e=>{e.preventDefault();saveRecord()}}>
    <h3>編輯 Page 登錄資料</h3>
    <div className="page-record-grid">
     <label>負責作者<select aria-label="負責作者" value={record.author} onChange={e=>setRecord(v=>({...v,author:e.target.value}))}>{authors.map(name=><option key={name}>{name}</option>)}</select></label>
     <label>分類<input aria-label="分類" value={record.category} onChange={e=>setRecord(v=>({...v,category:e.target.value}))}/></label>
     <label>圖示 (Emoji)<input aria-label="圖示" value={record.emoji} maxLength={8} onChange={e=>setRecord(v=>({...v,emoji:e.target.value}))}/></label>
     <label>簡短說明<textarea aria-label="簡短說明" rows={2} value={record.description} onChange={e=>setRecord(v=>({...v,description:e.target.value}))}/></label>
    </div>
    <div className="page-record-actions"><button type="submit" className="record-save"><Plus size={16}/>儲存</button><button type="button" onClick={()=>setRecord(blankRecord())}>取消</button><button type="button" className="record-delete" onClick={()=>setConfirm(true)}><Trash2 size={16}/>刪除</button></div>
   </form>
   <div className="message-space">
    {!messages.length&&<div className="chat-welcome"><span className="welcome-icon" style={{color:app.color}}><Icon size={24}/></span><h2>告訴我你需要做什麼調整</h2><p>描述想改的地方，右側會即時顯示完整的 App 畫面。</p><div className="suggestions">{suggestions.map(q=><Button variant="secondary" type="button" key={q} onClick={()=>send(q)}><span>{q}</span><ArrowRight size={16}/></Button>)}</div></div>}
    {!!messages.length&&<div className="date-rule"><span>新對話</span></div>}
    {messages.map((m,i)=><div className={`message ${m.role}`} key={i}><span>{m.role==='agent'&&<Icon size={16}/>}</span><div><p>{m.text}</p><small>{m.role==='me'?'你':'Agent'} · 剛剛</small></div></div>)}
    <div ref={bottom}/>
   </div>
   <footer><form className="composer" onSubmit={e=>{e.preventDefault();send()}}><textarea rows={1} aria-label="App 修改需求" placeholder={`傳訊息給 ${draft.name||'App'} Agent…`} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();send()}}}/><button type="submit" disabled={!input.trim()} aria-label="送出修改需求"><ArrowRight size={16}/></button></form></footer>
  </section>
  <div className="chat-resize-handle" role="separator" aria-label="調整 Chat 與 App 寬度" aria-orientation="vertical" aria-valuemin={280} aria-valuemax={Math.max(280,Math.min(720,window.innerWidth-520))} aria-valuenow={chatWidth} tabIndex={0} onPointerDown={beginResize} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();setChatWidth(width=>clampChatWidth(width+(e.key==='ArrowRight'?28:-28)))}}}><span/></div>
  <section className="editor-app-window" aria-label="App">
   <button type="button" className="editor-expand" aria-label="全螢幕預覽 App" onClick={()=>setExpanded(true)}><Maximize2 size={16}/></button>
   <div className="editor-screen-scroll"><AppScreen app={draft}/></div>
  </section>
  {expanded&&<div className="app-fullscreen-overlay" onClick={()=>setExpanded(false)}><section role="dialog" aria-modal="true" aria-label={`${draft.name||'App'} 全螢幕預覽`} onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Escape')setExpanded(false)}}><header><strong>{draft.name||'未命名 App'}</strong><button type="button" autoFocus aria-label="關閉全螢幕預覽" onClick={()=>setExpanded(false)}><X size={20}/></button></header><div className="app-fullscreen-screen"><AppScreen app={draft}/></div></section></div>}
  {confirm&&<Dialog title={`刪除「${app.name}」？`} onClose={()=>setConfirm(false)} footer={<><button onClick={()=>setConfirm(false)}>取消</button><button className="danger" onClick={()=>onDelete(app.id)}>刪除</button></>}><p className="dialog-copy">刪除後可在應用市集的回收區復原。</p></Dialog>}
 </main>
}
