import React,{useRef,useState,useEffect} from 'react';
import {ChevronLeft,Trash2,ArrowUp,Check,Sparkles,AppWindow,Globe} from 'lucide-react';
import {Dialog} from '../src-shared/ui/index.jsx';
import {appIcons} from './app-data.js';
import AppScreen from './AppScreen.jsx';
// Detail view: Chat on the left, live App window on the right.
export default function AppEditor({app,onSave,onDelete,onBack}){
 const [draft,setDraft]=useState(app),[baseline,setBaseline]=useState(app),[input,setInput]=useState(''),[messages,setMessages]=useState([]),[confirm,setConfirm]=useState(false),[saved,setSaved]=useState(''),[error,setError]=useState('');
 const bottom=useRef();
 useEffect(()=>{bottom.current?.scrollIntoView({block:'nearest'})},[messages]);
 const Icon=appIcons[app.id]||AppWindow;
 const change=(key,value)=>{setDraft(d=>({...d,[key]:value}));setSaved('')};
 const commit=extra=>{if(!draft.name.trim()){setError('請填寫 App 名稱。');return false}const next={...draft,...extra,name:draft.name.trim()};setDraft(next);setBaseline(next);onSave(next);setError('');return true};
 const save=()=>{if(commit())setSaved('已儲存')};
 const publish=()=>{if(commit({online:true}))setSaved('已發佈上線')};
 const send=e=>{e.preventDefault();if(!input.trim())return;setMessages(v=>[...v,{role:'you',text:input.trim()},{role:'agent',text:'已記錄你的修改需求。目前尚未連接 AI；可以在下方調整 App 內容，右側 App window 會同步更新。'}]);setInput('')};
 return <main className="app-editor">
  <header className="editor-head"><button className="editor-back" onClick={onBack}><ChevronLeft size={16}/>NOVA Apps</button><div className="editor-title"><div><h1>{draft.name||'未命名 App'}</h1></div><div className="editor-actions"><span className="editor-save-status" role="status">{saved||''}</span>{error&&<span className="editor-error" role="alert">{error}</span>}<button className="editor-delete" onClick={()=>setConfirm(true)}><Trash2 size={16}/>刪除</button><button className="editor-save" disabled={JSON.stringify(draft)===JSON.stringify(baseline)} onClick={save}><Check size={16}/>儲存</button><button className="editor-publish" onClick={publish}><Globe size={16}/>發佈</button></div></div></header>
  <section className="editor-chat" aria-label="App Agent 對話">
   <header><span className="editor-agent-mark" style={{'--app-color':app.color}}><Icon size={20}/></span><div><h2>{draft.name||'未命名 App'} Agent</h2><p>描述想調整的地方，Agent 會協助修改</p></div><dl className="editor-meta"><div><dt>作者</dt><dd>{app.author}</dd></div><div><dt>狀態</dt><dd>{draft.online===false?'未上架':'已上架'}</dd></div></dl></header>
   <div className="editor-messages">
    {!messages.length&&<div className="editor-welcome"><span className="editor-spark"><Sparkles size={24}/></span><h2>一起調整你的 App</h2><p>描述想改的地方，或在下方直接修改內容；右側 App window 會即時反映變更。</p></div>}
    {messages.map((m,i)=><div className={`editor-message ${m.role}`} key={i}><p>{m.text}</p><small>{m.role==='you'?'你':'App Agent · 示範'}</small></div>)}
    <div ref={bottom}/>
   </div>
   <div className="editor-fields" aria-label="App 內容">
    <label>App 名稱<input value={draft.name} maxLength={70} onChange={e=>change('name',e.target.value)}/></label>
    <label>說明<textarea rows={2} value={draft.description} maxLength={180} onChange={e=>change('description',e.target.value)}/></label>
    <label>內容項目（每行一個）<textarea rows={3} value={draft.items.join('\n')} onChange={e=>change('items',e.target.value.split('\n'))}/></label>
   </div>
   <form className="editor-composer" onSubmit={send}><textarea rows={1} aria-label="App 修改需求" placeholder={`傳訊息給 ${draft.name||'App'} Agent…`} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();send(e)}}}/><button disabled={!input.trim()} aria-label="送出修改需求"><ArrowUp size={18}/></button></form>
  </section>
  <section className="editor-app-window" aria-label="App window">
   <header><span className="editor-window-dots" aria-hidden="true"><i/><i/><i/></span><span>{draft.name||'未命名 App'}</span></header>
   <div className="editor-screen-scroll"><AppScreen app={draft}/></div>
  </section>
  {confirm&&<Dialog title={`刪除「${app.name}」？`} onClose={()=>setConfirm(false)} footer={<><button onClick={()=>setConfirm(false)}>取消</button><button className="danger" onClick={()=>onDelete(app.id)}>刪除</button></>}><p className="dialog-copy">刪除後可在應用市集的回收區復原。</p></Dialog>}
 </main>
}
