import {AdminOnly} from '../src-shared/UserRole.jsx';
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ChevronLeft,Folder,Info,Plus,RefreshCw} from 'lucide-react';
import githubLogo from './logos/github.svg';
import gitlabLogo from './logos/gitlab.svg';
import jiraLogo from './logos/jira.svg';
import {Button,Dialog,Input,SearchBar} from '../src-shared/ui/index.jsx';
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
 {id:'flir',name:'FLIR',code:'flir',status:'published',enabled:true,access:'all',jira:'FM',note:'',connection:'jira1',skills:97,members:['Ginny','King'],repos:[{id:'fr1',name:'flir-firmware',branch:'main'},{id:'fr2',name:'flir-cloud',branch:'main'}]},
 {id:'p1',name:'giant-bpm',code:'gbpm',status:'published',enabled:true,access:'all',jira:'DEMO',note:'',connection:'none',skills:12,members:['Ginny'],repos:[{id:'r1',name:'giant-bpm',branch:'main'},{id:'r2',name:'giant-bpm-web',branch:'main'}]},
 {id:'p2',name:'捷安特中台',code:'gmp',status:'published',enabled:true,access:'all',jira:'OPS',note:'',connection:'none',skills:8,members:['Alison'],repos:[{id:'r3',name:'gmp-api',branch:'main'},{id:'r4',name:'gmp-web',branch:'main'}]},
 {id:'p3',name:'健保署',code:'nhi',status:'draft',enabled:false,access:'nhi',jira:'NHI',note:'',connection:'none',skills:4,members:['Dylan'],repos:[{id:'r5',name:'nhi-portal',branch:'main'}]},
 {id:'p4',name:'健保署',code:'nhi-v2',status:'published',enabled:true,access:'all',jira:'NHI',note:'',connection:'jira1',skills:6,members:['Ginny','Ramble'],repos:[{id:'r6',name:'nhi-v2',branch:'main'}]},
];
const seedApps={
 jira:{clientId:'ZtnqwBRU0CnarJoXxU5xclyBUntHofkx',site:'dt360.atlassian.net',maintainer:'Ramble Lo',expires:'',hasCredential:true},
 gitlab:{clientId:'bct-office-power',site:'gitlab.com',maintainer:'BCT-Ramble',expires:'',hasCredential:true},
};
const oauthNote='更新權限（例如新增 scope）時請按重新連接，不要刪除後重建；重建會讓既有專案的儲存庫失去連線。';
const seedConnections=[
 {id:'gh1',provider:'github',title:'github · github.com/bct-tpe',url:'https://github.com/',auth:'存取權杖',account:'不適用',linkStatus:'有效',credential:'已設定（尚不代表測試成功）',maintainer:'BCT-Ramble',expires:'2027-02-03T00:00:00.000Z',note:'GitHub 僅支援 github.com。PAT 請選擇專案程式庫，授予 Contents 與 Pull requests 讀寫、Metadata 讀取權限。測試僅驗證讀取。'},
 {id:'gl1',provider:'gitlab',title:'gitlab · gitlab.com/bct-taipei',url:'https://gitlab.com/',auth:'OAuth',account:'BCT-Ramble',linkStatus:'有效',credential:'已設定（尚不代表測試成功）',maintainer:'BCT-Ramble',expires:'',note:oauthNote},
 {id:'jira1',provider:'jira',title:'jira · dt360.atlassian.net',url:'https://api.atlassian.com/ex/jira/0e1e0801-fa4b-4e05-ab54-6c591bb070d5/',auth:'OAuth',account:'Ramble Lo',linkStatus:'有效',credential:'已設定（尚不代表測試成功）',maintainer:'Ramble Lo',expires:'',note:oauthNote},
];
const blankProject=()=>({name:'',code:'',access:'all',jira:'',note:'',connection:'none',skills:0,members:[],repos:[]});
const accessLabel=id=>groups.find(([value])=>value===id)?.[1]||id;
const publishLabel=project=>project.status==='published'?(project.enabled?'已發佈':'未啟用'):'草稿';
const providerLogos={github:githubLogo,gitlab:gitlabLogo,jira:jiraLogo};
function ProviderLogo({id}){return <img className="provider-logo" src={providerLogos[id]||jiraLogo} alt="" width={22} height={22}/>}
const sections=[['overview','概覽'],['members','成員'],['repos','程式庫'],['skills','技能'],['jira','Jira 資料檢查'],['library','知識庫']];
const knowledgeFiles={
 flir:[
  {id:'flir-spec',name:'FLIR 產品規格',kind:'PDF',source:'專案交付',updated:'2026/11/08 下午03:12',summary:'熱像儀產品規格、解析度與工作溫度範圍，供現場安裝與客服回答引用。',tags:['#規格','#FLIR']},
  {id:'flir-fw',name:'韌體更新說明',kind:'MD',source:'Web',updated:'2026/11/06 上午10:20',summary:'韌體 2.4 的更新步驟、已知問題與回復方式。',tags:['#韌體']},
  {id:'flir-site',name:'現場安裝紀錄',kind:'DOCX',source:'Teams',updated:'2026/11/02 下午04:48',summary:'最近三次現場安裝的檢查項目與未完成事項。',tags:['#安裝']},
 ],
 p1:[
  {id:'gbpm-flow',name:'BPM 流程說明',kind:'PDF',source:'專案交付',updated:'2026/10/28 上午11:05',summary:'giant-bpm 的申請、審核與結案節點。',tags:['#流程']},
  {id:'gbpm-api',name:'介面欄位對照',kind:'MD',source:'Web',updated:'2026/10/21 下午02:40',summary:'表單欄位與 API 的對照，含必填與錯誤碼。',tags:['#API']},
 ],
 p2:[{id:'gmp-runbook',name:'中台操作手冊',kind:'DOCX',source:'Teams',updated:'2026/10/18 上午09:30',summary:'捷安特中台的日常操作、權限與異常處理。',tags:['#操作']}],
 p3:[{id:'nhi-scope',name:'健保署範圍備忘',kind:'MD',source:'專案交付',updated:'2026/10/12 下午05:10',summary:'草稿專案目前納入的資料範圍與尚未開放的項目。',tags:['#範圍']}],
 p4:[{id:'nhi-v2-note',name:'健保署 v2 交付紀錄',kind:'PDF',source:'Web',updated:'2026/11/04 上午08:55',summary:'第二版上線後的交付檔案與已知差異。',tags:['#交付']}],
};
const filesFor=project=>knowledgeFiles[project.id]||[{id:`${project.id}-note`,name:`${project.name} 工作說明`,kind:'MD',source:'專案交付',updated:'2026/11/01 上午09:00',summary:`${project.name} 的專案範圍、資料來源與 Agent 可以引用的文件。`,tags:['#專案']}];
const librariesFor=project=>{
 const files=filesFor(project);
 if(project.id==='flir')return [
  {id:'flir-product',name:'FLIR 產品文件',description:'規格與韌體說明，供現場安裝與客服回答引用。',files:files.filter(file=>file.id!=='flir-site')},
  {id:'flir-site',name:'現場紀錄',description:'最近的現場安裝與未完成事項。',files:files.filter(file=>file.id==='flir-site')},
 ];
 return [{id:`${project.id}-lib`,name:project.name,description:files[0]?.summary||'專案交付檔案。',files}];
};
const issuesFor=project=>{
 const code=project.jira||'DEMO';
 const people=project.members?.length?project.members:['未指派'];
 const summaries=['欄位對應與權限需要再確認','搜尋條件沒有帶回預期議題','草稿回覆缺少專案範圍','附件沒有跟著議題一起讀到','狀態流轉後負責人沒有更新','客製欄位的選項與專案設定不一致','權限不足時沒有回傳明確錯誤','重複議題需要合併後再檢查'];
 return summaries.map((summary,index)=>({key:`${code}-${128-index}`,summary,status:['進行中','待辦','已完成'][index%3],assignee:people[index%people.length]}));
};

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
   <label>連線<Input as="select" value={draft.connection} onChange={e=>set({connection:e.target.value})}><option value="none">不使用</option>{connections.map(item=><option key={item.id} value={item.id}>{item.title||item.serviceName}</option>)}</Input><p className="field-hint">專案的 sandbox 以此連線的權限使用 gh 與 git。</p></label>
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

function ProjectDetail({project,onBack,onEdit}){
 const [section,setSection]=useState('overview');
 const [query,setQuery]=useState('');
 const [limit,setLimit]=useState('10');
 const [issue,setIssue]=useState(null);
 const [file,setFile]=useState(null);
 const [member,setMember]=useState(null);
 const [repo,setRepo]=useState(null);
 const [library,setLibrary]=useState(null);
 const libraries=librariesFor(project);
 const issues=issuesFor(project).filter(item=>`${item.key} ${item.summary} ${item.assignee}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0,Number(limit)||10);
 return <main>
  <button type="button" className="project-back" onClick={onBack}><ChevronLeft size={16}/>專案 Agent</button>
  <header className="page-heading project-detail-head"><div><h1>{project.name}</h1><p>{project.code} · {publishLabel(project)}</p></div><div className="heading-actions"><Button onClick={onEdit}>編輯專案</Button><a className="op-button op-button--secondary" href="./dashboard.html">Agent 設定</a></div></header>
  <nav className="manage-tabs button-tabs" aria-label="專案內容">{sections.map(([id,label])=><button key={id} type="button" className={section===id?'active':''} aria-pressed={section===id} onClick={()=>setSection(id)}>{label}</button>)}</nav>
  {section==='overview'&&<article className="overview-card"><div className="manage-meta"><span className="manage-tag">{accessLabel(project.access)}</span><span className="manage-tag">Jira {project.jira||'未設定'}</span><span className="manage-tag">{project.repos.length} 個程式庫</span><span className="manage-tag">{project.skills||0} 個 skill 生效</span>{project.note&&<span className="manage-tag">{project.note}</span>}</div></article>}
  {section==='members'&&<section className="detail-block">{project.access==='all'?<p className="member-note">此專案開放給所有員工使用，不需要管理成員。若要限制使用者，請編輯專案並改選特定群組。</p>:project.members?.length?<div className="dataset-table-wrap"><table className="dataset-table"><thead><tr><th>成員</th><th>角色</th><th>存取群組</th></tr></thead><tbody>{project.members.map(name=><tr key={name} className="is-clickable" tabIndex={0} onClick={()=>setMember(name)} onKeyDown={event=>{if(event.key==='Enter')setMember(name)}}><td>{name}</td><td>{name==='Ginny'?'管理員':'一般用戶'}</td><td>{accessLabel(project.access)}</td></tr>)}</tbody></table></div>:<p className="manage-empty">這個專案還沒有指定成員。</p>}</section>}
  {section==='repos'&&<section className="detail-block">{project.repos.length?<div className="dataset-table-wrap"><table className="dataset-table"><thead><tr><th>程式庫</th><th>預設分支</th><th>權限</th></tr></thead><tbody>{project.repos.map(item=><tr key={item.id} className="is-clickable" tabIndex={0} onClick={()=>setRepo(item)} onKeyDown={event=>{if(event.key==='Enter')setRepo(item)}}><td>{item.name}</td><td>{item.branch}</td><td>讀取</td></tr>)}</tbody></table></div>:<p className="manage-empty">還沒有程式庫。</p>}<p className="field-hint">Agent 可讀取任意分支、tag 或 commit；未指定時使用程式庫的預設分支。</p></section>}
  {section==='skills'&&<section className="detail-block"><div className="dataset-table-wrap"><table className="dataset-table"><thead><tr><th>技能</th><th>生效數量</th></tr></thead><tbody><tr><td>已安裝 skill</td><td>{project.skills||0}</td></tr></tbody></table></div></section>}
  {section==='jira'&&<section className="detail-block"><div className="jira-toolbar"><SearchBar label="搜尋議題" placeholder="搜尋議題" value={query} onChange={event=>setQuery(event.target.value)}/><label className="jira-limit">結果筆數<Input as="select" aria-label="結果筆數" value={limit} onChange={event=>setLimit(event.target.value)}><option value="5">5</option><option value="10">10</option><option value="20">20</option></Input></label></div><div className="dataset-table-wrap"><table className="dataset-table"><thead><tr><th>議題</th><th>摘要</th><th>狀態</th><th>負責人</th></tr></thead><tbody>{issues.map(item=><tr key={item.key} className="is-clickable" tabIndex={0} onClick={()=>setIssue(item)} onKeyDown={event=>{if(event.key==='Enter')setIssue(item)}}><td>{item.key}</td><td>{item.summary}</td><td>{item.status}</td><td>{item.assignee}</td></tr>)}{!issues.length&&<tr><td colSpan={4}>沒有符合的議題</td></tr>}</tbody></table></div></section>}
  {section==='library'&&<section className="detail-block">{library?<><button type="button" className="project-back" onClick={()=>setLibrary(null)}><ChevronLeft size={16}/>知識庫</button><header className="library-detail-head"><h2>{library.name}</h2><p>{library.description}</p></header><div className="dataset-table-wrap"><table className="dataset-table"><thead><tr><th>檔案</th><th>類型</th><th>來源</th><th>更新</th></tr></thead><tbody>{library.files.map(item=><tr key={item.id} className="is-clickable" tabIndex={0} onClick={()=>setFile(item)} onKeyDown={event=>{if(event.key==='Enter')setFile(item)}}><td>{item.name}</td><td>{item.kind}</td><td>{item.source}</td><td>{item.updated}</td></tr>)}</tbody></table></div></>:<div className="manage-grid">{libraries.map(item=><article key={item.id} className="manage-card clickable" role="button" tabIndex={0} onClick={()=>setLibrary(item)} onKeyDown={event=>{if(event.key==='Enter')setLibrary(item)}}><header><span className="tile"><Folder size={20}/></span><h3>{item.name}</h3></header><p>{item.description}</p><div className="manage-meta">{item.files.length} 個檔案</div></article>)}{!libraries.length&&<p className="manage-empty">這個專案還沒有知識庫。</p>}</div>}</section>}
  {issue&&<Dialog title={issue.key} description={issue.status} onClose={()=>setIssue(null)} footer={<Button variant="primary" onClick={()=>setIssue(null)}>關閉</Button>}><p>{issue.summary}</p><p className="field-hint">負責人 {issue.assignee} · 範圍 {project.jira||'未設定'}</p></Dialog>}
  {file&&<Dialog title={file.name} description={`${file.kind} · ${file.source} · ${file.updated}`} onClose={()=>setFile(null)} footer={<Button variant="primary" onClick={()=>setFile(null)}>關閉</Button>}><p>{file.summary}</p><p className="kb-tags">關聯標籤：{file.tags.map(tag=><span key={tag}>{tag}</span>)}</p></Dialog>}
  {member&&<Dialog title={member} description={accessLabel(project.access)} onClose={()=>setMember(null)} footer={<Button variant="primary" onClick={()=>setMember(null)}>關閉</Button>}><p>{member==='Ginny'?'管理員':'一般用戶'}可以在這個專案使用 Agent，並下載知識庫的原始檔案。</p></Dialog>}
  {repo&&<Dialog title={repo.name} description={`預設分支 ${repo.branch}`} onClose={()=>setRepo(null)} footer={<Button variant="primary" onClick={()=>setRepo(null)}>關閉</Button>}><p>Agent 以讀取權限使用這個程式庫。未指定分支、tag 或 commit 時，會使用 {repo.branch}。</p></Dialog>}
 </main>;
}

function ConnectionForm({initial,onClose,onSave,onGuide}){
 const [service,setService]=useState(initial?.service||'jira');
 const [clientId,setClientId]=useState(initial?.clientId||'');
 const [secret,setSecret]=useState('');
 const [site,setSite]=useState(initial?.site||'');
 const [maintainer,setMaintainer]=useState(initial?.maintainer||'');
 const [expires,setExpires]=useState(initial?.expires||'');
 const [error,setError]=useState('');
 const [copied,setCopied]=useState(false);
 const current=services.find(item=>item.id===service);
 const close=()=>{setSecret('');onClose()};
 const save=()=>{
  if(!clientId.trim()||!maintainer.trim()||(!initial?.hasCredential&&!secret.trim())){setError('請填寫用戶端識別、維護人，以及這次要更新的憑證。');return}
  onSave({id:initial?.id||crypto.randomUUID(),service,serviceName:`${current.name} · ${current.kind}`,clientId:clientId.trim(),redirectUri:current.redirect,site:site.trim(),maintainer:maintainer.trim(),expires,hasCredential:true});
  setSecret('');
 };
 return <Dialog title={initial?'更新設定':'新增連線'} description="連線資訊由所有專案共用。憑證輸入會在提交或關閉時清除。" size="wide" onClose={close} footer={<><Button onClick={close}>取消</Button><Button variant="primary" onClick={save}>儲存連線</Button></>}>
  <div className="project-form connection-form">
   <label>服務<Input as="select" value={service} disabled={!!initial} onChange={e=>setService(e.target.value)}>{services.map(item=><option key={item.id} value={item.id}>{item.name} · {item.kind}</option>)}</Input></label>
   <label>{service==='jira'?'OAuth Client ID':'Application ID'}<Input value={clientId} onChange={e=>setClientId(e.target.value)}/></label>
   <div className="connection-actions"><Button variant="ghost" className="guide-chip" onClick={onGuide}><Info size={14} aria-hidden="true"/>註冊教學</Button><Button variant="ghost" className="text-button" onClick={()=>navigator.clipboard?.writeText(current.redirect).then(()=>setCopied(true)).catch(()=>setError('這個瀏覽器無法複製'))}>{copied?'已複製':'複製網址'}</Button></div>
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

function SavedLinkDialog({link,onClose,onSave,onDelete,onTest}){
 const [draft,setDraft]=useState(link);
 const [error,setError]=useState('');
 const set=patch=>setDraft(value=>({...value,...patch}));
 const save=()=>{
  if(!draft.title.trim()||!draft.url.trim()||!draft.maintainer.trim()){setError('請填寫名稱、網址與維護人。');return}
  onSave({...draft,title:draft.title.trim(),url:draft.url.trim(),maintainer:draft.maintainer.trim()});
 };
 const test=()=>{const next={...draft,linkStatus:'有效',credential:'已設定（測試讀取成功）'};setDraft(next);onTest(next)};
 return <Dialog title="編輯連線" description={draft.title} size="wide" onClose={onClose} footer={<><Button variant="danger" onClick={()=>onDelete(draft.id)}>刪除</Button><Button onClick={test}>測試連線</Button><Button onClick={onClose}>取消</Button><Button variant="primary" onClick={save}>儲存</Button></>}>
  <div className="project-form">
   <label>名稱<Input value={draft.title} onChange={event=>set({title:event.target.value})}/></label>
   <label>網址<Input value={draft.url} onChange={event=>set({url:event.target.value})}/></label>
   <div className="project-pair">
    <label>授權方式<Input as="select" value={draft.auth} onChange={event=>set({auth:event.target.value})}><option>OAuth</option><option>存取權杖</option></Input></label>
    <label>授權帳號<Input value={draft.account} onChange={event=>set({account:event.target.value})}/></label>
   </div>
   <div className="project-pair">
    <label>連線狀態<Input value={draft.linkStatus} readOnly/></label>
    <label>憑證狀態<Input value={draft.credential} readOnly/></label>
   </div>
   <div className="project-pair">
    <label>維護人<Input value={draft.maintainer} onChange={event=>set({maintainer:event.target.value})}/></label>
    <label>到期日<Input value={draft.expires} onChange={event=>set({expires:event.target.value})} placeholder="選填"/></label>
   </div>
   <p className="field-hint">{draft.note}</p>
   {error&&<p className="mcp-error" role="alert">{error}</p>}
  </div>
 </Dialog>;
}

function App(){
 const [projects,setProjects]=useLocalData('office-projects-v3',seedProjects);
 const [connections,setConnections]=useLocalData('office-project-connections-v3',seedConnections);
 const [apps,setApps]=useLocalData('office-connection-apps-v1',seedApps);
 const [tab,setTab]=useState(()=>location.pathname.endsWith('connections.html')?'connections':'projects');
 const [creating,setCreating]=useState(false);
 const [editing,setEditing]=useState(null);
 const [selected,setSelected]=useState(null);
 const [adding,setAdding]=useState(null);
 const [linkEditor,setLinkEditor]=useState(null);
 const [guide,setGuide]=useState(null);
 const [notice,setNotice]=useState('');
 const project=projects.find(item=>item.id===selected);
 const refresh=()=>setNotice(tab==='projects'?'已重新整理專案':'已重新整理連線');
 const saveProject=next=>{setProjects(list=>list.some(item=>item.id===next.id)?list.map(item=>item.id===next.id?next:item):[...list,{...next,id:crypto.randomUUID(),status:'draft',enabled:false}]);setCreating(false);setEditing(null);setNotice(`已儲存 ${next.name}`)};
 return <div className="market-shell management"><WorkspaceRail active="專案 Agent"/>{project?<ProjectDetail project={project} onBack={()=>setSelected(null)} onEdit={()=>setEditing(project)}/>:<main>
  <header className="page-heading"><div><h1>專案 Agent</h1><p>建立專案、管理成員與資料來源，並檢查連線狀態。</p></div><div className="heading-actions"><Button onClick={refresh}><RefreshCw size={16}/>重新整理</Button>{tab==='projects'&&<Button variant="primary" onClick={()=>setCreating(true)}><Plus size={16}/>建立專案</Button>}</div></header>
  <nav className="manage-tabs button-tabs project-tabs" aria-label="專案 Agent 分類"><button type="button" className={tab==='projects'?'active':''} aria-pressed={tab==='projects'} onClick={()=>setTab('projects')}>專案</button><button type="button" className={tab==='connections'?'active':''} aria-pressed={tab==='connections'} onClick={()=>setTab('connections')}>連線</button></nav>
  {notice&&<p role="status" className="manage-alert">{notice}</p>}
  {tab==='projects'&&<div className="dataset-table-wrap"><table className="dataset-table"><thead><tr><th>名稱</th><th>Jira 專案代碼</th><th>狀態</th><th>發佈對象</th><th>程式庫數量</th></tr></thead><tbody>{projects.map(item=><tr key={item.id}><td><button type="button" className="table-title" onClick={()=>setSelected(item.id)}>{item.name}</button></td><td>{item.jira||'—'}</td><td>{publishLabel(item)}</td><td>{accessLabel(item.access)}</td><td>{item.repos.length}</td></tr>)}</tbody></table></div>}
  {tab==='connections'&&<div className="connection-page"><section><h2>服務設定</h2><div className="setup-grid">{services.map(service=>{const app=apps[service.id]||{};return <button type="button" className="setup-card" key={service.id} onClick={()=>setAdding({service:service.id,...app})}><span className="saved-connection-head"><ProviderLogo id={service.id}/><span className="setup-title">{service.name}</span></span><span className="setup-kind">{service.kind}</span><small>{app.hasCredential?'憑證已設定':'尚未設定憑證'}{app.site?` · ${app.site}`:''}</small></button>})}</div></section><section><h2>已設定的連線</h2><div className="manage-grid connection-grid">{connections.map(item=><article className="manage-card clickable" key={item.id} role="button" tabIndex={0} onClick={()=>setLinkEditor(item)} onKeyDown={event=>{if(event.key==='Enter')setLinkEditor(item)}}><header><span className="tile provider-tile"><ProviderLogo id={item.provider}/></span><h3>{item.title}</h3></header><div className="manage-meta"><span className="manage-tag">存取方式 · {item.auth}</span><span className="manage-tag">維護人 · {item.maintainer}</span></div></article>)}{!connections.length&&<p className="manage-empty">還沒有已設定的連線。</p>}</div></section></div>}
 </main>}
 {creating&&<ProjectForm initial={blankProject()} connections={connections} onClose={()=>setCreating(false)} onSave={saveProject}/>}
 {editing&&<ProjectForm initial={editing} connections={connections} onClose={()=>setEditing(null)} onSave={project=>{saveProject(project);setSelected(project.id)}}/>}
 {adding&&<ConnectionForm initial={adding} onGuide={()=>setGuide(services.find(item=>item.id===adding.service))} onClose={()=>setAdding(null)} onSave={item=>{setApps(current=>({...current,[item.service]:{clientId:item.clientId,site:item.site,maintainer:item.maintainer,expires:item.expires,hasCredential:true}}));setAdding(null);setNotice(`已儲存 ${item.serviceName}`)}}/>}
 {linkEditor&&<SavedLinkDialog link={linkEditor} onClose={()=>setLinkEditor(null)} onSave={item=>{setConnections(list=>list.map(entry=>entry.id===item.id?item:entry));setLinkEditor(null);setNotice(`已儲存 ${item.title}`)}} onDelete={id=>{setConnections(list=>list.filter(entry=>entry.id!==id));setLinkEditor(null);setNotice('已刪除連線')}} onTest={item=>{setConnections(list=>list.map(entry=>entry.id===item.id?item:entry));setNotice(`已測試 ${item.title}：連線有效。這是示範流程。`)}}/>}
 {guide&&<Dialog title={`${guide.name} 註冊教學`} description={guide.kind} onClose={()=>setGuide(null)} footer={<Button variant="primary" onClick={()=>setGuide(null)}>知道了</Button>}><ol className="guide-steps">{guide.guide.map(step=><li key={step}>{step}</li>)}</ol></Dialog>}
 </div>;
}
createRoot(document.getElementById('root')).render(<AdminOnly><App/></AdminOnly>);
