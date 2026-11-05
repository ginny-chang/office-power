import React,{useState,useEffect,useLayoutEffect,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {Search,User,Undo2,X,ChevronDown,Check,Maximize2,Plus,MessageCircle,LayoutGrid,Store} from 'lucide-react';
import WorkspaceRail from '../src-shared/WorkspaceRail.jsx';
import {useUserRole} from '../src-shared/UserRole.jsx';
import useLocalData from '../src-shared/useLocalData.js';
import {appSeed,appTypes,migrateApps,marketCatalog} from './app-data.js';
import AppScreen from './AppScreen.jsx';
import {TypeIcon,paletteFor} from './type-icons.jsx';
import AppEditor from './AppEditor.jsx';
// Tokens load first in dev and build alike (Vite emits shared CSS ahead of page CSS); page layers override them.
import '../src-shared/tokens.css';
import './styles.css';
import './workspace-updates.css';
function MarketCard({item,installed,onOpen,onAdd,onChat}){
 return <article className="market-card" style={{'--app-color':item.color}}>
  <button type="button" className="card-expand" aria-label={`在新分頁開啟${item.name}`} onClick={onOpen}><Maximize2 size={16}/></button>
  <div className="market-card-top"><span className="type-icon"><TypeIcon type={item.category} size={44}/></span><div><h3>{item.name}</h3><small>{item.publisher}</small></div></div>
  <p>{item.description}</p>
  <div className="market-pills"><span>{item.kind}</span><span>{item.catalog}</span><span>{item.version}</span></div>
  <div className="market-foot"><span>{installed?`可使用 · ${item.version}`:'尚未安裝'}</span><div className="market-actions"><button type="button" className="market-add" disabled={installed} aria-label={installed?`${item.name}已在我的 Apps`:`將${item.name}新增至我的 Apps`} onClick={onAdd}><Plus size={18}/></button>{installed&&<button type="button" aria-label={`${item.name} App chat`} onClick={onChat}><MessageCircle size={16}/></button>}</div></div>
  <div className="app-hover-stage" role="img" aria-label={`${item.name} 外觀預覽`}><div className="app-hover-screen" aria-hidden="true"><AppScreen app={item} compact/></div></div>
 </article>;
}
function App(){
 const isAdmin=useUserRole()==='admin';
 const [apps,setApps,error]=useLocalData('office-nova-apps-v2',appSeed),[trash,setTrash]=useLocalData('office-nova-app-trash-v1',[]);
 const [query,setQuery]=useState(''),[type,setType]=useState(''),[typeOpen,setTypeOpen]=useState(false),[library,setLibrary]=useState('mine'),[editing,setEditing]=useState(new URLSearchParams(location.search).get('edit'));
 // Move saved apps (and trashed ones) off old seed authors and merged categories, keeping publish/delete state.
 useLayoutEffect(()=>{if(migrateApps(apps)!==apps)setApps(migrateApps);if(migrateApps(trash)!==trash)setTrash(migrateApps)},[]);
 const typeRef=useRef();
 useEffect(()=>{const close=e=>{if(!typeRef.current?.contains(e.target))setTypeOpen(false)};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[]);
 const openId=new URLSearchParams(location.search).get('open');
 const openApp=openId&&(apps.find(a=>a.id===openId)||marketCatalog.find(a=>a.id===openId));
 // Apps taken offline stay visible to admins only.
 const available=apps.filter(a=>isAdmin||a.online!==false);
 const mine=library==='mine';
 const pool=mine?available:marketCatalog;
 const countFor=t=>t?pool.filter(a=>a.category===t).length:pool.length;
 const pickType=t=>{setType(t);setTypeOpen(false)};
 const matches=a=>(!type||a.category===type)&&`${a.name} ${a.author||''} ${a.category} ${a.catalog||''} ${a.kind||''} ${a.version||''} ${a.description} ${a.publisher||''}`.toLowerCase().includes(query.toLowerCase());
 const shown=available.filter(matches).sort((a,b)=>a.name.localeCompare(b.name,'zh-Hant'));
 const market=marketCatalog.filter(matches);
 const selected=apps.find(a=>a.id===editing);
 const back=()=>{setEditing(null);history.replaceState(null,'','./apps.html')};
 const edit=id=>{setEditing(id);history.replaceState(null,'',`./apps.html?edit=${encodeURIComponent(id)}`)};
 const remove=id=>{const item=apps.find(a=>a.id===id);setTrash(t=>[...t.filter(a=>a.id!==id),item]);setApps(a=>a.filter(app=>app.id!==id));back()};
 const openInTab=a=>{window.open(`./apps.html?open=${encodeURIComponent(a.id)}`,'_blank','noopener')};
 const addMarket=item=>{if(apps.some(a=>a.id===item.id))return;const {kind,publisher,version,catalog,...app}=item;setApps(list=>[...list,{...app,online:true}])};
 if(openId)return <div className="app-standalone">{openApp?<AppScreen app={openApp}/>:<main className="app-missing"><h1>找不到這個 App</h1><a href="./apps.html">回到 NOVA Apps</a></main>}</div>;
 if(selected)return <div className="market-shell editor-shell"><WorkspaceRail active="NOVA Apps"/><AppEditor key={selected.id} app={selected} onBack={back} onSave={data=>setApps(prev=>prev.map(a=>a.id===data.id?data:a))} onDelete={remove}/>{error&&<p className="storage-warning" role="alert">{error}</p>}</div>;
 return <div className="market-shell"><WorkspaceRail active="NOVA Apps"/><main><header className="page-heading"><div><h1>NOVA Apps</h1><p>找到工作所需的小程式，從預覽開始探索。</p></div></header>
 <div className="catalog-tabs manage-tabs" role="tablist" aria-label="App 清單">{[['mine','我的 Apps',LayoutGrid],['market','Apps 市集',Store]].map(([id,label,Icon])=><button key={id} type="button" role="tab" className={library===id?'active':''} aria-selected={library===id} onClick={()=>setLibrary(id)}><Icon size={16}/>{label}</button>)}</div>
 {isAdmin&&mine&&trash.length>0&&<div className="app-trash-notice" role="status"><span>{trash.length} 個 App 已移至回收區</span><button onClick={()=>{setApps(a=>[...a,...trash.filter(t=>!a.some(v=>v.id===t.id))]);setTrash([])}}><Undo2 size={15}/>全部復原</button></div>}
 <div className="catalog-bar"><label className="op-search"><Search size={17}/><input aria-label="搜尋 NOVA Apps" placeholder={mine?'搜尋 App 名稱、分類或作者…':'搜尋市集 App 名稱、分類或說明…'} value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="清除搜尋" onClick={()=>setQuery('')}><X size={16}/></button>}</label><div className="type-filter" ref={typeRef} onKeyDown={e=>e.key==='Escape'&&setTypeOpen(false)}><button className={`type-filter-trigger${type?' picked':''}`} aria-label={`App 類型：${type||'全部類型'}`} aria-haspopup="menu" aria-expanded={typeOpen} onClick={()=>setTypeOpen(o=>!o)}><span>{type||'App 類型'}</span><ChevronDown size={16}/></button>{typeOpen&&<div className="card-more-menu type-filter-menu" role="menu" aria-label="App 類型">{['',...appTypes].map(t=><button key={t||'all'} role="menuitemradio" aria-checked={type===t} onClick={()=>pickType(t)}><span className="type-check" aria-hidden="true">{type===t&&<Check size={16}/>}</span>{t||'全部類型'}<small>{countFor(t)}</small></button>)}</div>}</div></div>
 {mine&&<div className="app-grid">{shown.map(a=><article className="app-card gallery-card" key={a.id} style={{'--app-color':a.color,'--type-tint':paletteFor(a.category).tile,'--type-deep':paletteFor(a.category).deep}} onClick={()=>edit(a.id)}><button type="button" className="card-expand" aria-label={`在新分頁開啟${a.name}`} onClick={e=>{e.stopPropagation();openInTab(a)}}><Maximize2 size={16}/></button><div className="gallery-card-top"><span className="type-icon"><TypeIcon type={a.category} size={44}/></span><div className="gallery-card-title"><h3>{a.name}</h3></div></div><p>{a.description}</p><div className="card-tags"><span className="card-tag card-tag-type">{a.category}</span><span className="card-tag"><User size={14}/>{a.author}</span>{a.online===false&&<span className="card-tag card-tag-offline">未上架</span>}</div><div className="app-hover-stage" role="img" aria-label={`${a.name} App Screen 預覽`}><div className="app-hover-screen" aria-hidden="true"><AppScreen app={a} compact/></div></div></article>)}</div>}
 {!mine&&<div className="market-grid">{market.map(a=><MarketCard key={a.id} item={a} installed={apps.some(item=>item.id===a.id)} onOpen={()=>openInTab(a)} onAdd={()=>addMarket(a)} onChat={()=>edit(a.id)}/>)}</div>}
 {mine&&!shown.length&&<div className="empty"><Search size={30}/><h3>找不到符合的 App</h3><button onClick={()=>{setQuery('');setType('')}}>顯示全部應用</button></div>}
 {!mine&&!market.length&&<div className="empty"><Search size={30}/><h3>找不到符合的 App</h3><button onClick={()=>{setQuery('');setType('')}}>顯示全部應用</button></div>}
 {error&&<p role="alert">{error}</p>}</main></div>
}
createRoot(document.getElementById('root')).render(<App/>);
