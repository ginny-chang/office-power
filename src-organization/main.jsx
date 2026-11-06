import {SegmentedControl,SearchBar,PageTitle,Input,Button} from '../src-shared/ui/index.jsx';
import {AdminOnly} from '../src-shared/UserRole.jsx';
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Search,Plus,Network,List,SlidersHorizontal,Users} from 'lucide-react';
import WorkspaceRail from '../src-shared/WorkspaceRail.jsx';
import useLocalData from '../src-shared/useLocalData.js';
import {initialEmployees,validateEmployees} from './data.js';
import EmployeeDialog from './EmployeeDialog.jsx';
import OrgGraph from './OrgGraph.jsx';
import Bindings from './Bindings.jsx';
// Tokens load first in dev and build alike (Vite emits shared CSS ahead of page CSS); page layers override them.
import '../src-shared/tokens.css';
import '../src-apps/styles.css';
import './styles.css';
function Organization(){
 const [employees,setEmployees,storageError]=useLocalData('office-employees-v1',initialEmployees);
 const [query,setQuery]=useState(''),[department,setDepartment]=useState('all'),[status,setStatus]=useState('all'),[view,setView]=useState('list'),[form,setForm]=useState(null),[message,setMessage]=useState('');
 const [org,setOrg]=useLocalData('office-org-units-v1',{name:'Office Power',units:[...new Set(initialEmployees.map(e=>e.department))].map((name,i)=>({id:'unit-'+i,name,parent:''}))});
 const departments=[...new Set([...org.units.map(u=>u.name),...employees.map(e=>e.department)])];
 const shown=employees.filter(e=>(department==='all'||e.department===department)&&(status==='all'||e.status===status)&&`${e.name} ${e.email}`.toLowerCase().includes(query.toLowerCase()));
 const save=person=>{setEmployees(prev=>prev.some(p=>p.id===person.id)?prev.map(p=>p.id===person.id?person:p):[...prev,person]);setMessage(`已儲存 ${person.name} 的資料`)};
 const updateEmployee=(id,patch)=>{setEmployees(prev=>{const next=prev.map(p=>p.id===id?{...p,...patch}:p);const issues=validateEmployees(next);if(issues.length){setMessage(issues[0]);return prev}setMessage(`已更新 ${next.find(p=>p.id===id).name}`);return next})};
 return <div className="market-shell organization-shell"><WorkspaceRail active="員工名單"/><main><header className="page-heading"><div><h1>{view==='list'?'員工名單':'組織架構圖'} <span className="employee-count">{employees.length} 人</span></h1>{view==='list'&&<p>連結團隊成員、部門與主管，讓協作關係清楚可見。</p>}</div><div className="org-heading-actions"><button className="org-secondary" aria-pressed={view==='graph'} onClick={()=>setView(view==='graph'?'list':'graph')}>{view==='graph'?<List size={16}/>:<Network size={16}/>} {view==='graph'?'員工名單':'組織架構圖'}</button><button className="org-primary" onClick={()=>setForm('new')}><Plus size={16}/>新增員工</button></div></header>

 {(message||storageError)&&<p className="org-feedback" role="status">{storageError||message}</p>}
 {view==='graph'?<OrgGraph employees={employees} org={org} setOrg={setOrg} setEmployees={setEmployees} onUpdate={updateEmployee} onEdit={setForm}/>:<section className="employee-directory" aria-label="員工名單"><div className="directory-filters"><SearchBar className="employee-search" aria-label="搜尋員工" placeholder="搜尋姓名或 Email…" value={query} onChange={e=>setQuery(e.target.value)}/><Input as="select" className="employee-department-filter" aria-label="篩選部門" value={department} onChange={e=>setDepartment(e.target.value)}><option value="all">所有部門</option>{departments.map(d=><option key={d}>{d}</option>)}</Input><SegmentedControl label="員工狀態" value={status} onChange={setStatus} items={[{value:'all',label:'全部'},{value:'active',label:'在職'},{value:'inactive',label:'已停用'}]}/></div>
 <div className="directory-table-scroll"><table className="employee-table"><thead><tr><th>姓名</th><th>Email</th><th>部門</th><th>直屬主管</th><th>管理員</th><th>綁定</th><th>狀態</th><th>操作</th></tr></thead><tbody>{shown.map(e=><tr key={e.id}><td><span className="employee-name"><i>{e.name.slice(0,1)}</i><button className="employee-detail-link" onClick={()=>setForm(e)}>{e.name}</button></span></td><td>{e.email}</td><td><select aria-label={`${e.name} 的部門`} value={e.department} onChange={ev=>updateEmployee(e.id,{department:ev.target.value})}>{departments.map(d=><option key={d}>{d}</option>)}</select></td><td><select aria-label={`${e.name} 的直屬主管`} value={e.manager||''} onChange={ev=>updateEmployee(e.id,{manager:ev.target.value})}><option value="">無直屬主管</option>{employees.filter(p=>p.id!==e.id).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></td><td><select aria-label={`${e.name} 的角色`} value={e.role} onChange={ev=>updateEmployee(e.id,{role:ev.target.value})}><option>一般使用者</option><option>管理員</option></select></td><td><Bindings values={e.bindings}/></td><td><span className={`employee-status ${e.status}`}><i/>{e.status==='active'?'在職':'已停用'}</span></td><td><div className="employee-actions"><button onClick={()=>{setEmployees(prev=>prev.map(p=>p.id===e.id?{...p,status:p.status==='active'?'inactive':'active'}:p));setMessage(`已${e.status==='active'?'停用':'啟用'} ${e.name}`)}}>{e.status==='active'?'停用':'啟用'}</button></div></td></tr>)}</tbody></table></div>{!shown.length&&<div className="empty"><Search size={24}/><h3>沒有符合條件的員工</h3><button onClick={()=>{setQuery('');setDepartment('all');setStatus('all')}}>清除篩選</button></div>}</section>}
 </main>{form&&<EmployeeDialog departments={departments} employees={employees} employee={form==='new'?null:form} onSave={save} onImport={people=>{setEmployees(prev=>[...prev,...people]);setMessage(`已匯入 ${people.length} 位員工，組織架構已同步更新。`)}} onClose={()=>setForm(null)}/>}</div>
}
createRoot(document.getElementById('root')).render(<AdminOnly><Organization/></AdminOnly>);

