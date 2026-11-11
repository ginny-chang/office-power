import {AdminOnly} from '../src-shared/UserRole.jsx';
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ChevronLeft,Plus,RefreshCw} from 'lucide-react';
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
 {id:'jira',name:'Atlassian (Jira Cloud)',kind:'OAuth App 設定',redirect:'https://op.bct-tw.org/api/project-agent-connections/oauth/atlassian/callback',guide:['到 Atlassian Developer Console 建立 OAuth 2.0 (3LO) App。','把這個頁面的 Callback URL 貼到 Authorization callback URL。','在 Permissions 加入讀取 Jira 專案與議題的範圍。','回到這裡確認 Client ID，再按連接 Atlassian。Secret 只在更新設定時輸入，送出後不會保留。']},
 {id:'gitlab',name:'GitLab.com',kind:'OAuth App 設定',redirect:'https://op.bct-tw.org/api/project-agent-connections/oauth/gitlab/callback',guide:['到 GitLab.com → Preferences → Applications。','建立應用，Redirect URI 貼上這個頁面的 Callback URL。','勾選 read_api 與 read_repository。','回到這裡確認 Application ID。Secret 只在更新設定時輸入，送出後不會保留。']},
];
const groups=[['all','所有員工'],['nhi','健保署']];
const seedProjects=[
 {id:'flir',name:'FLIR',code:'flir',status:'published',enabled:true,access:'all',jira:'FM',note:'',connection:'c1',skills:97,members:['Ginny','King'],repos:[{id:'fr1',name:'flir-firmware',branch:'main'},{id:'fr2',name:'flir-cloud',branch:'main'}]},
 {id:'p1',name:'giant-bpm',code:'gbpm',status:'published',enabled:true,access:'all',jira:'DEMO',note:'',connection:'none',skills:12,members:['Ginny'],repos:[{id:'r1',name:'giant-bpm',branch:'main'},{id:'r2',name:'giant-bpm-web',branch:'main'}]},
 {id:'p2',name:'捷安特中台',code:'gmp',status:'published',enabled:true,access:'all',jira:'OPS',note:'',connection:'none',skills:8,members:['Alison'],repos:[{id:'r3',name:'gmp-api',branch:'main'},{id:'r4',name:'gmp-web',branch:'main'}]},
 {id:'p3',name:'健保署',code:'nhi',status:'draft',enabled:false,access:'nhi',jira:'NHI',note:'',connection:'none',skills:4,members:['Dylan'],repos:[{id:'r5',name:'nhi-portal',branch:'main'}]},
 {id:'p4',name:'健保署',code:'nhi-v2',status:'published',enabled:true,access:'all',jira:'NHI',note:'',connection:'c1',skills:6,members:['Ginny','Ramble'],repos:[{id:'r6',name:'nhi-v2',branch:'main'}]},
];
const seedConnections=[
 {id:'c1',service:'jira',serviceName:'Atlassian (Jira Cloud) · OAuth App 設定',clientId:'ZtnqwBRU0CnarJoXxU5xclyBUntHofkx',redirectUri:services[0].redirect,site:'dt360.atlassian.net',hasCredential:true,maintainer:'ginny@example.com',expires:''},
 {id:'c2',service:'gitlab',serviceName:'GitLab.com · OAuth App 設定',clientId:'bct-office-power',redirectUri:services[1].redirect,site:'gitlab.com',hasCredential:true,maintainer:'ginny@example.com',expires:''},
];
const blankProject=()=>({name:'',code:'',access:'all',jira:'',note:'',connection:'none',skills:0,members:[],repos:[]});
const accessLabel=id=>groups.find(([value])=>value===id)?.[1]||id;
const sections=[['overview','概覽'],['members','成員'],['repos','程式庫'],['skills','技能'],['jira','Jira 資料檢查'],['library','知識庫']];

function ProjectForm({initial,connections,onClose,onSave}){
 const [draft,setDraft]=useState(initial);
 const [error,setError]=useState('');
 const set=patch=>setDraft(value=>({...value,...patch}));
 const locked=!!initial.id;
 const save=()=>{
  if(!draft.name.trim()){setError('請填寫專案名稱。');return}
  if(!codePattern.test(draft.code.trim())){setError('專案代碼要 2–32 個小寫英數字或連字號，並以字母開頭。');return}
  onSave({...draft,name:draft.name.trim(),code:draft.code.trim(),repos:draft.repos.filter(repo=>repo.name.trim())});
 };
 return <Dialog title={locked?'編輯專案':'建立專案'} description="專案設定會在下一回編進該專案的 profile，不會修改專案助理 Agent 的名稱、角色、提示詞或呼叫群組。模型與發佈請使用 Agent 設定。" size="wide" onClose={onClose} footer={<><Button onClick={onClose}>取消</Button><Button variant="primary" onClick={save}><Plus size={16}/>儲存專案</Button></>}>
  <div className="project-form">
   <div className="project-pair">
    <label>專案名稱<Input value={draft.name} onChange={e=>set({name:e.target.value})}/></label>
    <label>專案代碼<Input value={draft.code} onChange={e=>set({code:e.target.value.toLowerCase()})} disabled={locked} placeholder="例如 gbpm"/><p className="field-hint">2–32 個小寫英數字或連字號，以字母開頭；建立後固定。</p></label>
   </div>
   <label>存取群組<Input as="select" value={draft.access} onChange={e=>set({access:e.target.value})}>{groups.map(([value,label])=><option key={value} value={value}>{label}</option>)}</Input><p className="field-hint">{draft.access==='all'?'所有員工都可以使用此專案的 Agent，不需要管理成員。':'只有這個群組的成員可以使用此專案的 Agent。'}</p></label>
   <label>Jira 專案代碼<Input value={draft.jira} onChange={e=>set({jira:e.target.value})} placeholder="DEMO, OPS"/><p className="field-hint">以逗號分隔，例如 DEMO, OPS</p></label>
   <label>備註<Input as="textarea" rows={3} value={draft.note} onChange={e=>set({note:e.target.value})} placeholder="尚無備註"/></label>
   <label>連線<Input as="select" value={draft.connection} onChange={e=>set({connection:e.target.value})}><option value="none">不使用</option>{connections.map(item=><option key={item.id} value={item.id}>{item.serviceName}</option>)}</Input><p className="field-hint">專案的 sandbox 以此連線的權限使用 gh 與 git。</p></label>
   <section>
    <h3>程式庫</h3>
    <p className="field-hint">Agent 可讀取任意分支、tag 或 commit；未指定時使用程式庫的預設分支。</p>
    <div className="project-form" style={{marginTop:12}}>{draft.repos.map(repo=><div className="repo-row" key={repo.id}><label>程式庫<Input value={repo.name} onChange={e=>set({repos:draft.repos.map(item=>item.id===repo.id?{...item,name:e.target.value}:item)})}/></label><label>預設分支<Input value={repo.branch} onChange={e=>set({repos:draft.repos.map(item=>item.id===repo.id?{...item,branch:e.target.value}:item)})}/></label><Button type="button" onClick={()=>set({repos:draft.repos.filter(item=>item.id!==repo.id)})}>移除</Button></div>)}</div>
    <Button type="button" onClick={()=>set({repos:[...draft.repos,{id:crypto.randomUUID(),name:'',branch:'main'}]})}><Plus size={16}/>新增程式庫</Button>
   </section>
   {error&&<p className="mcp-error" role="alert">{error}</p>}
  </div>
 </Dialog>;
}

function ProjectDetail({project,onBack,onEdit,onConnections}){
 const [section,setSection]=useState('overview');
 return <main>
  <button type="button" className="project-back" onClick={onBack}><ChevronLeft size={16}/>專案 Agent</button>
  <header className="page-heading project-detail-head"><div><h1>{project.name}</h1><p>{project.code} · {project.status} · {project.enabled?'已啟用':'未啟用'}</p></div><div className="heading-actions"><Button onClick={onEdit}>編輯專案</Button><a className="op-button op-button--secondary" href="./dashboard.html">Agent 設定</a></div></header>
  <nav className="manage-tabs button-tabs" aria-label="專案內容">{sections.map(([id,label])=><button key={id} type="button" className={section===id?'active':''} aria-pressed={section===id} onClick={()=>setSection(id)}>{label}</button>)}</nav>
  {section==='overview'&&<section className="project-overview"><div className="project-pair"><div><small>存取群組</small><strong>{accessLabel(project.access)}</strong></div><div><small>Jira 專案代碼</small><strong>{project.jira||'—'}</strong></div></div><div><small>技能</small><strong>指定 · 安裝 {project.skills||0} 個 skill</strong></div><div><small>備註</small><strong>{project.note||'尚無備註'}</strong></div><p className="field-hint">儲存專案不會發佈 Agent。請至 Agent 設定選擇模型、確認權限與發佈。</p><Button onClick={onConnections}>管理共用連線</Button></section>}
  {section==='members'&&<section className="project-list">{(project.members||[]).map(name=><article className="project-row" key={name}><strong>{name}</strong><span>{accessLabel(project.access)}</span></article>)}{!(project.members||[]).length&&<p className="manage-empty">這個專案還沒有指定成員。</p>}</section>}
  {section==='repos'&&<section className="project-list">{project.repos.map(repo=><article className="project-row" key={repo.id}><div><strong>{repo.name}</strong><small>預設分支 {repo.branch}</small></div></article>)}{!project.repos.length&&<p className="manage-empty">還沒有程式庫。</p>}</section>}
  {section==='skills'&&<p className="manage-empty">已安裝 {project.skills||0} 個 skill。技能內容由能力中心管理。</p>}
  {section==='jira'&&<p className="manage-empty">{project.jira?`會檢查 Jira 專案 ${project.jira} 的欄位與權限。`:'尚未填寫 Jira 專案代碼。'}</p>}
  {section==='library'&&<p className="manage-empty">知識庫會在專案建立後，從能力中心已採用的資料夾掛進來。</p>}
 </main>;
}

function ConnectionForm({initial,onClose,onSave}){
 const [service,setService]=useState(initial?.service||'jira');
 const [clientId,setClientId]=useState(initial?.clientId||'');
 const [secret,setSecret]=useState('');
 const [site,setSite]=useState(initial?.site||'');
 const [maintainer,setMaintainer]=useState(initial?.maintainer||'');
 const [expires,setExpires]=useState(initial?.expires||'');
 const [error,setError]=useState('');
 const current=services.find(item=>item.id===service);
 const close=()=>{setSecret('');onClose()};
 const save=()=>{
  if(!clientId.trim()||!maintainer.trim()||(!initial&&!secret.trim())){setError('請填寫用戶端識別、維護人，以及這次要更新的憑證。');return}
  onSave({id:initial?.id||crypto.randomUUID(),service,serviceName:`${current.name} · ${current.kind}`,clientId:clientId.trim(),redirectUri:current.redirect,site:site.trim(),maintainer:maintainer.trim(),expires,hasCredential:true});
  setSecret('');
 };
 return <Dialog title={initial?'更新設定':'新增連線'} description="連線資訊由所有專案共用。憑證輸入會在提交或關閉時清除。" size="wide" onClose={close} footer={<><Button onClick={close}>取消</Button><Button variant="primary" onClick={save}>儲存連線</Button></>}>
  <div className="project-form connection-form">
   <label>服務<Input as="select" value={service} disabled={!!initial} onChange={e=>setService(e.target.value)}>{services.map(item=><option key={item.id} value={item.id}>{item.name} · {item.kind}</option>)}</Input></label>
   <label>{service==='jira'?'OAuth Client ID':'Application ID'}<Input value={clientId} onChange={e=>setClientId(e.target.value)}/></label>
   <p className="field-hint">Callback URL 建立後固定：{current.redirect}</p>
   <label>{service==='jira'?'Jira 網站':'GitLab 網站'}<Input value={site} onChange={e=>setSite(e.target.value)} placeholder={service==='jira'?'your-domain.atlassian.net':'gitlab.com'}/></label>
   <label>憑證維護人<Input value={maintainer} onChange={e=>setMaintainer(e.target.value)} placeholder="name@example.com"/></label>
   <label>憑證到期日（選填）<Input type="date" value={expires} onChange={e=>setExpires(e.target.value)}/></label>
   <label>{service==='jira'?'Client secret':'Secret'}<Input type="password" value={secret} onChange={e=>setSecret(e.target.value)} autoComplete="off" placeholder={initial?'留空代表不更換已設定的 Secret':''}/></label>
   <p className="field-hint">若儲存失敗，請重新輸入憑證。其他欄位會保留。</p>
   {error&&<p className="mcp-error" role="alert">{error}</p>}
  </div>
 </Dialog>;
}

function App(){
 const [projects,setProjects]=useLocalData('office-projects-v2',seedProjects);
 const [connections,setConnections]=useLocalData('office-project-connections-v2',seedConnections);
 const [tab,setTab]=useState(()=>location.pathname.endsWith('connections.html')?'connections':'projects');
 const [creating,setCreating]=useState(false);
 const [editing,setEditing]=useState(null);
 const [selected,setSelected]=useState(null);
 const [adding,setAdding]=useState(null);
 const [guide,setGuide]=useState(null);
 const [notice,setNotice]=useState('');
 const project=projects.find(item=>item.id===selected);
 const refresh=()=>setNotice(tab==='projects'?'已重新整理專案':'已重新整理連線');
 const saveProject=next=>{setProjects(list=>list.some(item=>item.id===next.id)?list.map(item=>item.id===next.id?next:item):[...list,{...next,id:crypto.randomUUID(),status:'draft',enabled:false}]);setCreating(false);setEditing(null);setNotice(`已儲存 ${next.name}`)};
 return <div className="market-shell management"><WorkspaceRail active="專案 Agent"/>{project?<ProjectDetail project={project} onBack={()=>setSelected(null)} onEdit={()=>setEditing(project)} onConnections={()=>{setSelected(null);setTab('connections')}}/>:<main>
  <header className="page-heading"><div><h1>專案 Agent</h1><p>建立專案、管理成員與資料來源，並檢查連線狀態。</p></div><div className="heading-actions"><Button onClick={refresh}><RefreshCw size={16}/>重新整理</Button>{tab==='projects'?<Button variant="primary" onClick={()=>setCreating(true)}><Plus size={16}/>建立專案</Button>:<Button variant="primary" onClick={()=>setAdding({})}>新增連線</Button>}</div></header>
  <nav className="op-segmented project-tabs" aria-label="專案 Agent 分類"><button type="button" className={tab==='projects'?'active':''} aria-pressed={tab==='projects'} onClick={()=>setTab('projects')}>專案</button><button type="button" className={tab==='connections'?'active':''} aria-pressed={tab==='connections'} onClick={()=>setTab('connections')}>連線</button></nav>
  {notice&&<p role="status" className="manage-alert">{notice}</p>}
  {tab==='projects'&&<div className="manage-grid">{projects.map(item=><article key={item.id} className="manage-card clickable" role="button" tabIndex={0} onClick={()=>setSelected(item.id)} onKeyDown={event=>{if(event.key==='Enter')setSelected(item.id)}}><h3>{item.name}</h3><p>{item.code} · {item.status} · {accessLabel(item.access)}</p><small>程式庫 {item.repos.length}</small></article>)}</div>}
  {tab==='connections'&&<div className="project-list">{connections.map(item=>{const service=services.find(entry=>entry.id===item.service);return <article className="connection-card" key={item.id}><h3>{item.serviceName}</h3><Button onClick={()=>setGuide(service)}>註冊教學</Button><label>Callback URL<Input readOnly value={item.redirectUri}/></label><Button onClick={()=>navigator.clipboard?.writeText(item.redirectUri).then(()=>setNotice('已複製 Callback URL')).catch(()=>setNotice('這個瀏覽器無法複製'))}>複製網址</Button><p>Client ID: {item.clientId}</p><p>{item.hasCredential?'Secret 已設定':'Secret 尚未設定'}</p><Button onClick={()=>setAdding(item)}>更新設定</Button><label>{item.service==='jira'?'Jira 網站':'GitLab 網站'}<Input value={item.site} readOnly/></label><Button variant="primary" onClick={()=>setNotice(`這是示範流程，尚未真正連到 ${service.name}。`)}>連接 {item.service==='jira'?'Atlassian':'GitLab'}</Button></article>})}</div>}
 </main>}
 {creating&&<ProjectForm initial={blankProject()} connections={connections} onClose={()=>setCreating(false)} onSave={saveProject}/>}
 {editing&&<ProjectForm initial={editing} connections={connections} onClose={()=>setEditing(null)} onSave={project=>{saveProject(project);setSelected(project.id)}}/>}
 {adding&&<ConnectionForm initial={adding.id?adding:null} onClose={()=>setAdding(null)} onSave={item=>{setConnections(list=>list.some(entry=>entry.id===item.id)?list.map(entry=>entry.id===item.id?item:entry):[...list,item]);setAdding(null);setNotice(`已儲存 ${item.serviceName}`)}}/>}
 {guide&&<Dialog title={`${guide.name} 註冊教學`} description={guide.kind} onClose={()=>setGuide(null)} footer={<Button variant="primary" onClick={()=>setGuide(null)}>知道了</Button>}><ol className="guide-steps">{guide.guide.map(step=><li key={step}>{step}</li>)}</ol></Dialog>}
 </div>;
}
createRoot(document.getElementById('root')).render(<AdminOnly><App/></AdminOnly>);
