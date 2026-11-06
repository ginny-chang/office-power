import {PageTitle,Card,Input,Button} from '../src-shared/ui/index.jsx';
import RuntimeOverview from './RuntimeOverview.jsx';
import UsagePanel from './Usage.jsx';
import AuditLog from './AuditLog.jsx';
import {AdminOnly} from '../src-shared/UserRole.jsx';
import React,{useState}from'react';import{createRoot}from'react-dom/client';import{Server,UserRound,Palette,Bot,Check}from'lucide-react';import WorkspaceRail from'../src-shared/WorkspaceRail';import useLocalData from'../src-shared/useLocalData';import{Field}from'../src-shared/Management';import '../src-shared/tokens.css';
import'../src-apps/styles.css';import'../src-shared/management.css';
const initial={name:'Ginny Chang',model:'繼承組織預設',gateway:'https://gateway.example.com',timeout:120,concurrency:4};
function App(){
 const query=new URLSearchParams(location.search).get('tab');
 const tab=['usage','audit','settings'].includes(query)?query:'settings';
 const[saved,setSaved,error]=useLocalData('office-account-settings-v1',initial);
 const[draft,setDraft]=useState(saved);
 const[,setLogs,logError]=useLocalData('office-account-audit-v1',[]);
 const[notice,setNotice]=useState('');
 function save(e){e.preventDefault();setSaved(draft);setLogs(old=>[{id:crypto.randomUUID(),time:new Date().toISOString(),actor:'Ginny Chang',action:'更新帳號設定',resource:'Settings / Model Provider / Runtime',result:'已儲存'},...old]);setNotice('設定已儲存。')}
 const railActive=tab==='usage'?'用量與費用':tab==='audit'?'稽核紀錄':'Account';
 return <div className="market-shell management"><WorkspaceRail active={railActive}/><main>
  {tab==='settings'&&<header className="page-heading"><div><PageTitle>Account</PageTitle><p>管理工作空間的執行設定。</p></div></header>}
  {(notice||error||logError)&&<p className="manage-alert" role="status">{error||logError||notice}</p>}
  {tab==='usage'&&<UsagePanel/>}
  {tab==='audit'&&<AuditLog/>}
  {tab==='settings'&&<form onSubmit={save} className="account-layout"><Card as="section" className="manage-card"><h2 className="function-title"><UserRound size={20}/>個人資料</h2><Field label="顯示名稱" required value={draft.name} onChange={name=>setDraft(d=>({...d,name}))}/></Card><Card as="section" className="manage-card"><header style={{justifyContent:'space-between',marginBottom:0}}><h2 className="function-title"><Palette size={20}/>外觀主題</h2><span className="manage-tag">更新中</span></header></Card><Card as="section" className="manage-card"><h2 className="function-title"><Bot size={20}/>控制中心預設模型</h2><p>未指定模型的 Agent 共用此設定。</p><label className="manage-field">預設模型<Input as="select" value={draft.model} onChange={e=>setDraft(d=>({...d,model:e.target.value}))}><option>繼承組織預設</option><option>快速模型（示範）</option><option>推理模型（示範）</option></Input></label></Card><Card as="section" className="manage-card"><h2 className="function-title"><Server size={20}/>模型供應來源</h2><p>檢視模型連線與 Runtime 執行設定。</p><RuntimeOverview draft={draft} setDraft={setDraft}/></Card><div className="manage-actions"><Button variant="primary" type="submit" className="primary"><Check size={16}/>儲存設定</Button><Button variant="secondary" type="button" onClick={()=>{setDraft(saved);setNotice('已還原為上次儲存的設定。')}}>還原修改</Button></div></form>}
 </main></div>;
}
createRoot(document.getElementById('root')).render(<AdminOnly><App/></AdminOnly>);
