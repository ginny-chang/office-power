import UsagePanel from './Usage.jsx';
import AuditLog from './AuditLog.jsx';
import Settings from './Settings.jsx';
import Runtime from './Runtime.jsx';
import {AdminOnly} from '../src-shared/UserRole.jsx';
import React from'react';import{createRoot}from'react-dom/client';import WorkspaceRail from'../src-shared/WorkspaceRail';import '../src-shared/tokens.css';
import'../src-apps/styles.css';import'../src-shared/management.css';
const labels={usage:'用量與費用',audit:'稽核紀錄',runtime:'Runtime 管理',settings:'進階設定'};
function App(){
 const query=new URLSearchParams(location.search).get('tab');
 const tab=labels[query]?query:'settings';
 return <div className="market-shell management"><WorkspaceRail active={labels[tab]}/><main>
  {tab==='usage'&&<UsagePanel/>}
  {tab==='audit'&&<AuditLog/>}
  {tab==='runtime'&&<Runtime/>}
  {tab==='settings'&&<Settings/>}
 </main></div>;
}
createRoot(document.getElementById('root')).render(<AdminOnly><App/></AdminOnly>);
