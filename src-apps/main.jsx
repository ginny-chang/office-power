import React,{useState,useEffect,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {createPortal} from 'react-dom';
import {Input,Card,Button,SearchBar,PageTitle,Dialog} from '../src-shared/ui/index.jsx';
import {AppWindow,ArrowUpRight,MoreHorizontal,User,Undo2,Trash2} from 'lucide-react';
import WorkspaceRail from '../src-shared/WorkspaceRail.jsx';
import {useUserRole} from '../src-shared/UserRole.jsx';
import useLocalData from '../src-shared/useLocalData.js';
import {appSeed,appIcons} from './app-data.js';
import AppScreen from './AppScreen.jsx';
import AppEditor from './AppEditor.jsx';
import './styles.css';
import './workspace-updates.css';
import '../src-shared/ui/workspace.css';
function App(){
 const isAdmin=useUserRole()==='admin';
 const [apps,setApps,error]=useLocalData('office-nova-apps-v2',appSeed),[trash,setTrash]=useLocalData('office-nova-app-trash-v1',[]);
 const [query,setQuery]=useState(''),[category,setCategory]=useState('全部'),[editing,setEditing]=useState(new URLSearchParams(location.search).get('edit')),[hover,setHover]=useState(null),[menu,setMenu]=useState(null),[deleting,setDeleting]=useState(null),[preview,setPreview]=useState(null);
 const menuRef=useRef();useEffect(()=>{const close=e=>{if(!menuRef.current?.contains(e.target))setMenu(null)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[]);
 const available=apps.filter(a=>isAdmin||a.online!==false),categories=['全部',...new Set(available.map(a=>a.category))];
 const shown=available.filter(a=>(category==='全部'||a.category===category)&&`${a.name} ${a.author} ${a.category}`.toLowerCase().includes(query.toLowerCase()));
 const selected=isAdmin?apps.find(a=>a.id===editing):null;
 const back=()=>{setEditing(null);history.replaceState(null,'','./apps.html')};
 const edit=a=>{setHover(null);if(!isAdmin){setPreview(a);return}setEditing(a.id);history.replaceState(null,'',`./apps.html?edit=${encodeURIComponent(a.id)}`)};
 const remove=id=>{const item=apps.find(a=>a.id===id);setTrash(t=>[...t.filter(a=>a.id!==id),item]);setApps(a=>a.filter(app=>app.id!==id));setDeleting(null);setMenu(null);back()};
 const showPreview=(e,a)=>{const r=e.currentTarget.getBoundingClientRect();const width=Math.min(440,innerWidth-32);setHover({app:a,left:Math.max(16,Math.min(innerWidth-width-16,r.left)),top:r.bottom+360<innerHeight?r.bottom+10:Math.max(16,r.top-350)})};
 if(selected)return <AppEditor key={selected.id} app={selected} onBack={back} onSave={data=>setApps(prev=>prev.map(a=>a.id===data.id?data:a))} onDelete={remove}/>;
 return <div className="market-shell"><WorkspaceRail active="NOVA Apps"/><main><header className="page-heading"><div><PageTitle icon={AppWindow}>NOVA Apps</PageTitle><p>找到工作所需的小程式。</p></div></header>{isAdmin&&trash.length>0&&<div className="app-trash-notice"><span>{trash.length} 個 App 已移至回收區</span><Button variant="ghost" onClick={()=>{setApps(a=>[...a,...trash.filter(t=>!a.some(v=>v.id===t.id))]);setTrash([])}}><Undo2 size={16}/>全部復原</Button></div>}<section className="catalog"><SearchBar label="搜尋 NOVA Apps" placeholder="搜尋 App 名稱、分類或作者…" value={query} onChange={e=>setQuery(e.target.value)}/><div className="categories">{categories.map(c=><Button variant="ghost" key={c} aria-pressed={category===c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</Button>)}</div><div className="nova-compact-grid">{shown.map(a=>{const Icon=appIcons[a.id]||AppWindow;return <Card className="nova-compact-card" key={a.id} onMouseEnter={e=>!menu&&showPreview(e,a)} onMouseLeave={()=>setHover(null)}><Button variant="plain" className="nova-card-open" onFocus={e=>showPreview(e,a)} onBlur={()=>setHover(null)} onClick={()=>edit(a)} aria-label={`${isAdmin?'編輯':'開啟'} ${a.name}`}><span className="nova-card-icon"><Icon size={24}/></span><span><strong>{a.name}</strong><small><User size={13}/>{a.author} · {a.category}</small></span></Button>{a.online===false&&<span className="nova-offline">未上線</span>}{isAdmin&&<div className="nova-card-menu" ref={menu===a.id?menuRef:null}><Button className="nova-more" variant="ghost" iconOnly aria-label={`${a.name} 更多選項`} aria-expanded={menu===a.id} onClick={()=>{setHover(null);setMenu(menu===a.id?null:a.id)}}><MoreHorizontal size={20}/></Button>{menu===a.id&&<div className="nova-more-popover" onKeyDown={e=>e.key==='Escape'&&setMenu(null)}><label>上線<Input type="checkbox" role="switch" checked={a.online!==false} onChange={e=>setApps(old=>old.map(x=>x.id===a.id?{...x,online:e.target.checked}:x))}/></label><Button variant="danger" onClick={()=>{setDeleting(a);setMenu(null)}}><Trash2 size={16}/>刪除</Button></div>}</div>}</Card>})}</div>{!shown.length&&<p className="op-empty">沒有符合的 App</p>}</section>{error&&<p role="alert">{error}</p>}</main>{hover&&!menu&&createPortal(<div className="nova-floating-preview" style={{left:hover.left,top:hover.top}} aria-hidden="true"><header><AppWindow size={16}/>{hover.app.name}<ArrowUpRight size={16}/></header><AppScreen app={hover.app} compact/></div>,document.body)}{deleting&&<Dialog title={`刪除「${deleting.name}」？`} onClose={()=>setDeleting(null)} footer={<><Button onClick={()=>setDeleting(null)}>取消</Button><Button variant="danger" onClick={()=>remove(deleting.id)}>刪除</Button></>}><p>刪除後可在回收區復原。</p></Dialog>}{preview&&<Dialog title={preview.name} size="wide" onClose={()=>setPreview(null)}><AppScreen app={preview}/></Dialog>}</div>
}
createRoot(document.getElementById('root')).render(<App/>);
