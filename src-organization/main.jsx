import {SegmentedControl,SearchBar,PageTitle,Input,Button} from '../src-shared/ui/index.jsx';
import {AdminOnly} from '../src-shared/UserRole.jsx';
import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Search,Plus,Network,List,SlidersHorizontal,Pencil,Users} from 'lucide-react';
import WorkspaceRail from '../src-shared/WorkspaceRail.jsx';
import useLocalData from '../src-shared/useLocalData.js';
import {initialEmployees} from './data.js';
import EmployeeDialog from './EmployeeDialog.jsx';
import OrgGraph from './OrgGraph.jsx';
import '../src-apps/styles.css';
import './styles.css';
function Organization(){
 const [employees,setEmployees,storageError]=useLocalData('office-employees-v1',initialEmployees);
 const [query,setQuery]=useState(''),[department,setDepartment]=useState('all'),[status,setStatus]=useState('all'),[view,setView]=useState('list'),[form,setForm]=useState(null),[message,setMessage]=useState('');
 const departments=[...new Set(employees.map(e=>e.department))];
 const shown=employees.filter(e=>(department==='all'||e.department===department)&&(status==='all'||e.status===status)&&`${e.name} ${e.email}`.toLowerCase().includes(query.toLowerCase()));
 const save=person=>{setEmployees(prev=>prev.some(p=>p.id===person.id)?prev.map(p=>p.id===person.id?person:p):[...prev,person]);setMessage(`已儲存 ${person.name} 的資料`)};
 return <div className="market-shell organization-shell"><WorkspaceRail active="Organization"/><main><header className="page-heading"><div><PageTitle icon={Users}>Organization</PageTitle><p>連結團隊成員、部門與主管，讓協作關係清楚可見。</p></div><div className="org-heading-actions"><Button variant="secondary" className="org-secondary" aria-pressed={view==='graph'} onClick={()=>setView(view==='graph'?'list':'graph')}>{view==='graph'?<List size={17}/>:<Network size={17}/>} {view==='graph'?'員工名錄':'組織架構圖'}</Button></div></header>

 {(message||storageError)&&<p className="org-feedback" role="status">{storageError||message}</p>}
 {view==='graph'?<OrgGraph employees={employees}/>:<section className="employee-directory" aria-label="員工名錄"><header className="directory-heading"><div className="org-summary"><span><Users size={17}/><strong>{employees.length}</strong> 位員工</span><span>{employees.filter(e=>e.status==='active').length} 位在職</span><span>{departments.length} 個部門</span></div><Button variant="primary" className="org-primary" onClick={()=>setForm('new')}><Plus size={17}/>新增員工</Button></header><div className="directory-filters"><SearchBar className="directory-search" aria-label="搜尋員工" placeholder="搜尋姓名或 Email…" value={query} onChange={e=>setQuery(e.target.value)}/><label className="directory-department"><SlidersHorizontal size={16}/><Input as="select" aria-label="篩選部門" value={department} onChange={e=>setDepartment(e.target.value)}><option value="all">所有部門</option>{departments.map(d=><option key={d}>{d}</option>)}</Input></label><SegmentedControl label="員工狀態" value={status} onChange={setStatus} items={[{value:'all',label:'全部狀態'},{value:'active',label:'在職'},{value:'inactive',label:'已停用'}]}/><span>{shown.length} / {employees.length} 人</span></div>
 <div className="directory-table-scroll"><table className="employee-table"><thead><tr><th>姓名</th><th>Email</th><th>部門</th><th>直屬主管</th><th>角色</th><th>狀態</th><th>操作</th></tr></thead><tbody>{shown.map(e=><tr key={e.id}><td><span className="employee-name"><i>{e.name.slice(0,1)}</i><strong>{e.name}</strong></span></td><td>{e.email}</td><td><span className="department-chip">{e.department}</span></td><td>{employees.find(p=>p.id===e.manager)?.name||'—'}</td><td>{e.role}</td><td><span className={`employee-status ${e.status}`}><i/>{e.status==='active'?'在職':'已停用'}</span></td><td><div className="employee-actions"><Button variant="secondary" type="button" aria-label={`編輯 ${e.name}`} onClick={()=>setForm(e)}><Pencil size={15}/></Button><Button variant="secondary" type="button" onClick={()=>{setEmployees(prev=>prev.map(p=>p.id===e.id?{...p,status:p.status==='active'?'inactive':'active'}:p));setMessage(`已${e.status==='active'?'停用':'啟用'} ${e.name}`)}}>{e.status==='active'?'停用':'啟用'}</Button></div></td></tr>)}</tbody></table></div>{!shown.length&&<div className="empty"><Search size={27}/><h3>沒有符合條件的員工</h3><Button variant="secondary" type="button" onClick={()=>{setQuery('');setDepartment('all');setStatus('all')}}>清除篩選</Button></div>}</section>}
 </main>{form&&<EmployeeDialog employees={employees} employee={form==='new'?null:form} onSave={save} onImport={people=>{setEmployees(prev=>[...prev,...people]);setMessage(`已匯入 ${people.length} 位員工，組織架構已同步更新。`)}} onClose={()=>setForm(null)}/>}</div>
}
createRoot(document.getElementById('root')).render(<AdminOnly><Organization/></AdminOnly>);

import '../src-shared/ui/workspace.css';
