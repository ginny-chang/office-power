import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Search,ArrowUpRight,SlidersHorizontal,Pencil,User,Undo2,X} from 'lucide-react';
import WorkspaceRail from '../src-shared/WorkspaceRail.jsx';
import useLocalData from '../src-shared/useLocalData.js';
import {appSeed,appIcons} from './app-data.js';
import AppScreen from './AppScreen.jsx';
import AppEditor from './AppEditor.jsx';
// Tokens load first in dev and build alike (Vite emits shared CSS ahead of page CSS); page layers override them.
import '../src-shared/tokens.css';
import './styles.css';
import './workspace-updates.css';
function App(){
 const [apps,setApps,error]=useLocalData('office-nova-apps-v2',appSeed),[trash,setTrash]=useLocalData('office-nova-app-trash-v1',[]);
 const [query,setQuery]=useState(''),[category,setCategory]=useState('全部'),[sort,setSort]=useState('name'),[editing,setEditing]=useState(new URLSearchParams(location.search).get('edit'));
 const categories=['全部',...new Set(apps.map(a=>a.category))];
 const shown=apps.filter(a=>(category==='全部'||a.category===category)&&`${a.name} ${a.author} ${a.category} ${a.description}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==='popular'?b.views-a.views:a.name.localeCompare(b.name,'zh-Hant'));
 const selected=apps.find(a=>a.id===editing);
 const back=()=>{setEditing(null);history.replaceState(null,'','./apps.html')};
 const edit=id=>{setEditing(id);history.replaceState(null,'',`./apps.html?edit=${encodeURIComponent(id)}`)};
 const remove=id=>{const item=apps.find(a=>a.id===id);setTrash(t=>[...t.filter(a=>a.id!==id),item]);setApps(a=>a.filter(app=>app.id!==id));back()};
 if(selected)return <div className="market-shell editor-shell"><WorkspaceRail active="NOVA Apps"/><AppEditor key={selected.id} app={selected} onBack={back} onSave={data=>setApps(prev=>prev.map(a=>a.id===data.id?data:a))} onDelete={remove}/>{error&&<p className="storage-warning" role="alert">{error}</p>}</div>;
 return <div className="market-shell"><WorkspaceRail active="NOVA Apps"/><main><header className="page-heading"><div><h1>NOVA Apps <span>應用市集</span></h1><p>找到工作所需的小程式，從預覽開始探索。</p></div><label className="op-search"><Search size={17}/><input aria-label="搜尋 NOVA Apps" placeholder="搜尋 App 名稱、分類或作者…" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="清除搜尋" onClick={()=>setQuery('')}><X size={16}/></button>}</label></header>
 {trash.length>0&&<div className="app-trash-notice" role="status"><span>{trash.length} 個 App 已移至回收區</span><button onClick={()=>{setApps(a=>[...a,...trash.filter(t=>!a.some(v=>v.id===t.id))]);setTrash([])}}><Undo2 size={15}/>全部復原</button></div>}
 <div className="catalog-bar"><div className="categories seg op-segmented" role="group" aria-label="應用分類">{categories.map(c=><button key={c} aria-pressed={category===c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}<span>{c==='全部'?apps.length:apps.filter(a=>a.category===c).length}</span></button>)}</div><label className="sort" title="排序"><SlidersHorizontal size={18}/><select aria-label="排序" value={sort} onChange={e=>setSort(e.target.value)}><option value="name">依名稱排序</option><option value="popular">熱門優先</option></select></label></div>
 <div className="app-grid">{shown.map(a=>{const Icon=appIcons[a.id]||ArrowUpRight;return <article className="app-card gallery-card" key={a.id} style={{'--app-color':a.color}} onClick={()=>edit(a.id)}><div className="gallery-card-top"><div><span className="category-tag">{a.category}</span><h3>{a.name}</h3></div><span className="clay-icon"><Icon size={30} strokeWidth={1.8}/></span></div><p>{a.description}</p><div className="app-hover-stage" role="img" aria-label={`${a.name} App Screen 預覽`}><div className="app-hover-screen" aria-hidden="true"><AppScreen app={a} compact/></div></div><footer><span><User size={14}/>{a.author}</span><button onClick={e=>{e.stopPropagation();edit(a.id)}} aria-label={`編輯 ${a.name}`}><Pencil size={14}/>編輯</button></footer></article>})}</div>
 {!shown.length&&<div className="empty"><Search size={30}/><h3>找不到符合的 App</h3><button onClick={()=>{setQuery('');setCategory('全部')}}>顯示全部應用</button></div>}{error&&<p role="alert">{error}</p>}</main></div>
}
createRoot(document.getElementById('root')).render(<App/>);
