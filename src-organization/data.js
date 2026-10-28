export const initialEmployees=[
 {id:'e1',name:'King',email:'king@example.com',department:'管理部',role:'管理員',manager:'',status:'active'},
 {id:'e2',name:'Alison',email:'alison@example.com',department:'產品研發',role:'管理員',manager:'e1',status:'active'},
 {id:'e3',name:'Ginny',email:'ginny@example.com',department:'設計部',role:'管理員',manager:'e1',status:'active'},
 {id:'e4',name:'Ramble',email:'ramble@example.com',department:'營運部',role:'一般使用者',manager:'e1',status:'active'},
 {id:'e5',name:'Dylan',email:'dylan@example.com',department:'產品研發',role:'一般使用者',manager:'e2',status:'active'},
 {id:'e6',name:'Barney',email:'barney@example.com',department:'產品研發',role:'一般使用者',manager:'e2',status:'active'},
 {id:'e7',name:'Jamie',email:'jamie@example.com',department:'設計部',role:'一般使用者',manager:'e3',status:'active'},
 {id:'e8',name:'Alex',email:'alex@example.com',department:'營運部',role:'一般使用者',manager:'e4',status:'inactive'}
];
export function parseCSV(text){
 const rows=[];let row=[],cell='',quoted=false;
 text=text.replace(/^\uFEFF/,'');
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else if(!cell||quoted)quoted=!quoted;else throw new Error('CSV 引號格式不正確。')}else if(c===','&&!quoted){row.push(cell.trim());cell=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell.trim());if(row.some(Boolean))rows.push(row);row=[];cell=''}else cell+=c}
 if(quoted)throw new Error('CSV 有未關閉的引號。');row.push(cell.trim());if(row.some(Boolean))rows.push(row);return rows;
}
export function validateEmployees(all){
 const errors=[],emails=new Set(),map=new Map(all.map(e=>[e.id,e]));
 all.forEach(e=>{const tag=e.name||'未命名員工';if(!e.name.trim())errors.push('姓名不可留空。');const mail=e.email.toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail))errors.push(`${tag}：Email 格式不正確。`);if(emails.has(mail))errors.push(`${tag}：Email 重複（${e.email}）。`);emails.add(mail);if(e.manager&&!map.has(e.manager))errors.push(`${tag}：找不到指定主管。`);const seen=new Set([e.id]);let id=e.manager;while(id&&map.has(id)){if(seen.has(id)){errors.push(`${tag}：主管關係形成循環。`);break}seen.add(id);id=map.get(id).manager}});return [...new Set(errors)];
}
export function prepareCSV(text,existing){
 const rows=parseCSV(text);if(rows.length<2)throw new Error('CSV 需要標題列與至少一位員工。');if(rows.length>501)throw new Error('每次最多匯入 500 位員工。');
 const aliases={姓名:'name',email:'email',Email:'email',部門:'department',角色:'role',主管:'manager',主管email:'manager',主管Email:'manager',manager_email:'manager'};
 const headers=rows[0].map(h=>aliases[h]||h.toLowerCase());if(!headers.includes('name')||!headers.includes('email'))throw new Error('缺少 name（姓名）或 email 欄位。');if(new Set(headers).size!==headers.length)throw new Error('CSV 含有重複欄位。');
 const errors=[];const people=rows.slice(1).map((row,i)=>{if(row.length!==headers.length)errors.push(`第 ${i+2} 列：欄位數量與標題不符。`);const values=Object.fromEntries(headers.map((h,n)=>[h,row[n]||'']));const role=values.role==='admin'?'管理員':values.role==='user'?'一般使用者':values.role||'一般使用者';if(!['管理員','一般使用者'].includes(role))errors.push(`第 ${i+2} 列：角色只能是管理員或一般使用者。`);return {id:`csv-${i}-${values.email.toLowerCase()}`,name:values.name,email:values.email.toLowerCase(),department:values.department||'未分配',role,manager:'',managerEmail:values.manager?.toLowerCase()||'',status:'active'}});
 const combined=[...existing,...people];people.forEach(p=>{if(p.managerEmail){const manager=combined.find(e=>e.email.toLowerCase()===p.managerEmail);if(!manager)errors.push(`${p.name}：找不到主管 ${p.managerEmail}，請使用主管 Email。`);else p.manager=manager.id}delete p.managerEmail});errors.push(...validateEmployees(combined));return {people,errors:[...new Set(errors)]};
}
export function graphLayout(people){
 const children=new Map([['root',[]]]);people.forEach(p=>children.set(p.id,[]));people.forEach(p=>children.get(p.manager&&children.has(p.manager)?p.manager:'root').push(p.id));
 const widths=new Map();const measure=id=>{const width=Math.max(1,children.get(id).reduce((sum,child)=>sum+measure(child),0));widths.set(id,width);return width};measure('root');
 const positions=new Map();const place=(id,left,depth)=>{positions.set(id,{x:left+widths.get(id)*110,y:60+depth*150});let cursor=left;children.get(id).forEach(child=>{place(child,cursor,depth+1);cursor+=widths.get(child)*220})};place('root',0,0);
 return {positions,width:Math.max(660,widths.get('root')*220),height:Math.max(440,...[...positions.values()].map(p=>p.y+90))};
}
