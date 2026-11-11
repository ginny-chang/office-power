import {AdminOnly} from '../src-shared/UserRole.jsx';
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Plus,RefreshCw} from 'lucide-react';
import {Button,Dialog,Input} from '../src-shared/ui/index.jsx';
import WorkspaceRail from '../src-shared/WorkspaceRail.jsx';
import useLocalData from '../src-shared/useLocalData.js';
import '../src-shared/tokens.css';
import '../src-apps/styles.css';
import '../src-shared/management.css';
import '../src-capabilities/styles.css';
import './styles.css';

const codePattern=/^[a-z][a-z0-9-]{1,31}$/;
const services=[
 {id:'jira',name:'Atlassian (Jira Cloud)',kind:'OAuth App 設定',redirect:'https://office-power.local/oauth/jira'},
 {id:'gitlab',name:'GitLab.com',kind:'OAuth App 設定',redirect:'https://office-power.local/oauth/gitlab'},
];
const groups=[['all','所有員工'],['nhi','健保署']];
const seedProjects=[
 {id:'p1',name:'giant-bpm',code:'gbpm',status:'published',access:'all',jira:'DEMO',note:'',connection:'none',repos:[{id:'r1',name:'giant-bpm',branch:'main'},{id:'r2',name:'giant-bpm-web',branch:'main'}]},
 {id:'p2',name:'捷安特中台',code:'gmp',status:'published',access:'all',jira:'OPS',note:'',connection:'none',repos:[{id:'r3',name:'gmp-api',branch:'main'},{id:'r4',name:'gmp-web',branch:'main'}]},
 {id:'p3',name:'健保署',code:'nhi',status:'draft',access:'nhi',jira:'NHI',note:'',connection:'none',repos:[{id:'r5',name:'nhi-portal',branch:'main'}]},
 {id:'p4',name:'健保署',code:'nhi-v2',status:'published',access:'all',jira:'NHI',note:'',connection:'none',repos:[{id:'r6',name:'nhi-v2',branch:'main'}]},
];
const blankProject=()=>({name:'',code:'',access:'all',jira:'',note:'',connection:'none',repos:[]});
const accessLabel=id=>groups.find(([value])=>value===id)?.[1]||id;

function ProjectForm({initial,connections,onClose,onSave}){
 const [draft,setDraft]=useState(initial);
 const [error,setError]=useState('');
 const set=patch=>setDraft(value=>({...value,...patch}));
 const save=()=>{
  if(!draft.name.trim()){setError('請填寫專案名稱。');return}
  if(!codePattern.test(draft.code.trim())){setError('專案代碼要 2–32 個小寫英數字或連字號，並以字母開頭。');return}
  onSave({...draft,name:draft.name.trim(),code:draft.code.trim(),repos:draft.repos.filter(repo=>repo.name.trim())});
 };
 return <Dialog title={initial.id?'專案詳情':'建立專案'} description="專案設定會在下一回編進該專案的 profile，不會修改專案助理 Agent 的名稱、角色、提示詞或呼叫群組。模型與發佈請使用 Agent 設定。" size="wide" onClose={onClose} footer={<><Button onClick={onClose}>取消</Button>{!initial.id&&<Button variant="primary" onClick={save}><Plus size={16}/>儲存專案</Button>}</>}>
  <div className="project-form">
   <div className="project-pair">
    <label>專案名稱<Input value={draft.name} onChange={e=>set({name:e.target.value})} disabled={!!initial.id}/></label>
    <label>專案代碼<Input value={draft.code} onChange={e=>set({code:e.target.value.toLowerCase()})} disabled={!!initial.id} placeholder="例如 gbpm"/><p className="field-hint">2–32 個小寫英數字或連字號，以字母開頭；建立後固定。</p></label>
   </div>
   <label>存取群組<Input as="select" value={draft.access} onChange={e=>set({access:e.target.value})} disabled={!!initial.id}>{groups.map(([value,label])=><option key={value} value={value}>{label}</option>)}</Input><p className="field-hint">{draft.access==='all'?'所有員工都可以使用此專案的 Agent，不需要管理成員。':'只有這個群組的成員可以使用此專案的 Agent。'}</p></label>
   <label>Jira 專案代碼<Input value={draft.jira} onChange={e=>set({jira:e.target.value})} disabled={!!initial.id} placeholder="DEMO, OPS"/><p className="field-hint">以逗號分隔，例如 DEMO, OPS</p></label>
   <label>備註<Input as="textarea" rows={3} value={draft.note} onChange={e=>set({note:e.target.value})} disabled={!!initial.id}/></label>
   <label>連線<Input as="select" value={draft.connection} onChange={e=>set({connection:e.target.value})} disabled={!!initial.id}><option value="none">不使用</option>{connections.map(item=><option key={item.id} value={item.id}>{item.serviceName}</option>)}</Input><p className="field-hint">專案的 sandbox 以此連線的權限使用 gh 與 git。</p></label>
   <section>
    <h3>程式庫</h3>
    <p className="field-hint">Agent 可讀取任意分支、tag 或 commit；未指定時使用程式庫的預設分支。</p>
    <div className="project-form" style={{marginTop:12}}>{draft.repos.map(repo=><div className="repo-row" key={repo.id}><label>程式庫<Input value={repo.name} disabled={!!initial.id} onChange={e=>set({repos:draft.repos.map(item=>item.id===repo.id?{...item,name:e.target.value}:item)})}/></label><label>預設分支<Input value={repo.branch} disabled={!!initial.id} onChange={e=>set({repos:draft.repos.map(item=>item.id===repo.id?{...item,branch:e.target.value}:item)})}/></label>{!initial.id&&<Button type="button" onClick={()=>set({repos:draft.repos.filter(item=>item.id!==repo.id)})}>移除</Button>}</div>)}</div>
    {!initial.id&&<Button type="button" onClick={()=>set({repos:[...draft.repos,{id:crypto.randomUUID(),name:'',branch:'main'}]})}><Plus size={16}/>新增程式庫</Button>}
   </section>
   {error&&<p className="mcp-error" role="alert">{error}</p>}
  </div>
 </Dialog>;
}

function Projects({connections}){
 const [projects,setProjects]=useLocalData('office-projects-v1',seedProjects);
 const [creating,setCreating]=useState(false);
 const [detail,setDetail]=useState(null);
 const [notice,setNotice]=useState('');
 return <div className="market-shell management"><WorkspaceRail active="專案 Agent"/><main>
  <header className="page-heading"><div><h1>專案 Agent</h1><p>建立專案、管理成員與資料來源，並檢查連線狀態。</p></div><Button variant="primary" onClick={()=>setCreating(true)}><Plus size={16}/>建立專案</Button></header>
  <div className="catalog-bar"><div className="bar-group"><a className="op-button op-button--secondary" href="./connections.html">連線設定</a></div><Button onClick={()=>setNotice('已重新整理')}><RefreshCw size={16}/>重新整理</Button></div>
  {notice&&<p role="status" className="manage-alert">{notice}</p>}
  <div className="project-list">{projects.map(project=><article className="project-row" key={project.id}><div><h3>{project.name}</h3><p>{project.code} · {project.status} · {accessLabel(project.access)}</p><small>程式庫 {project.repos.length}</small></div><Button onClick={()=>setDetail(project)}>查看詳情</Button></article>)}</div>
  {creating&&<ProjectForm initial={blankProject()} connections={connections} onClose={()=>setCreating(false)} onSave={project=>{setProjects(list=>[...list,{...project,id:crypto.randomUUID(),status:'draft'}]);setCreating(false);setNotice(`已建立 ${project.name}`)}}/>}
  {detail&&<ProjectForm initial={detail} connections={connections} onClose={()=>setDetail(null)} onSave={()=>setDetail(null)}/>}
 </main></div>;
}

function ConnectionForm({onClose,onSave}){
 const [service,setService]=useState('jira');
 const [clientId,setClientId]=useState('');
 const [secret,setSecret]=useState('');
 const [maintainer,setMaintainer]=useState('');
 const [expires,setExpires]=useState('');
 const [error,setError]=useState('');
 const current=services.find(item=>item.id===service);
 const close=()=>{setSecret('');onClose()};
 const save=()=>{
  if(!clientId.trim()||!secret.trim()||!maintainer.trim()){setError('請填寫用戶端識別、憑證與維護人。');return}
  onSave({id:crypto.randomUUID(),service,serviceName:`${current.name} · ${current.kind}`,clientId:clientId.trim(),redirectUri:current.redirect,maintainer:maintainer.trim(),expires,hasCredential:true});
  setSecret('');
 };
 return <Dialog title="新增連線" description="連線資訊由所有專案共用。憑證輸入會在提交或關閉時清除。" size="wide" onClose={close} footer={<><Button onClick={close}>取消</Button><Button variant="primary" onClick={save}>儲存連線</Button></>}>
  <div className="project-form connection-form">
   <label>服務<Input as="select" value={service} onChange={e=>setService(e.target.value)}>{services.map(item=><option key={item.id} value={item.id}>{item.name} · {item.kind}</option>)}</Input></label>
   <label>{service==='jira'?'OAuth Client ID':'Application ID'}<Input value={clientId} onChange={e=>setClientId(e.target.value)}/></label>
   <p className="field-hint">Callback URL 建立後固定：{current.redirect}</p>
   <label>憑證維護人<Input value={maintainer} onChange={e=>setMaintainer(e.target.value)} placeholder="name@example.com"/></label>
   <label>憑證到期日（選填）<Input type="date" value={expires} onChange={e=>setExpires(e.target.value)}/></label>
   <label>{service==='jira'?'Client secret':'Secret'}<Input type="password" value={secret} onChange={e=>setSecret(e.target.value)} autoComplete="off"/></label>
   <p className="field-hint">若儲存失敗，請重新輸入憑證。其他欄位會保留。</p>
   {error&&<p className="mcp-error" role="alert">{error}</p>}
  </div>
 </Dialog>;
}

function Connections(){
 const [connections,setConnections]=useLocalData('office-project-connections-v1',[]);
 const [adding,setAdding]=useState(false);
 return <div className="market-shell management"><WorkspaceRail active="專案 Agent"/><main>
  <header className="page-heading"><div><h1>連線</h1><p>連線資訊由所有專案共用。可以新增 Atlassian (Jira Cloud) 與 GitLab.com 的 OAuth App 設定。</p></div><Button variant="primary" onClick={()=>setAdding(true)}><Plus size={16}/>新增連線</Button></header>
  <div className="catalog-bar"><a className="op-button op-button--secondary" href="./projects.html">回到專案</a></div>
  <div className="project-list">{connections.map(item=><article className="project-row connection-card" key={item.id}><div><h3>{item.serviceName}</h3><p>{item.clientId}</p><small>{item.hasCredential?'憑證已設定，內容不保留':'尚未設定憑證'} · {item.maintainer}{item.expires?` · ${item.expires}`:''}</small></div></article>)}{!connections.length&&<p className="manage-empty">還沒有連線。新增 Jira Cloud 或 GitLab.com 的 OAuth App。</p>}</div>
  {adding&&<ConnectionForm onClose={()=>setAdding(false)} onSave={item=>{setConnections(list=>[...list,item]);setAdding(false)}}/>}
 </main></div>;
}

function App(){
 const [connections]=useLocalData('office-project-connections-v1',[]);
 const connectionsPage=location.pathname.endsWith('connections.html');
 return connectionsPage?<Connections/>:<Projects connections={connections}/>;
}
createRoot(document.getElementById('root')).render(<AdminOnly><App/></AdminOnly>);
