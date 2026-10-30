import React,{useEffect,useRef,useState} from 'react';
import {Plus,Send,ArrowLeft,ArrowRight,Sparkles,CheckCircle2,Layers3} from 'lucide-react';
import {Button,Input,Card} from './ui/index.jsx';
import ModelPicker from './ModelPicker.jsx';
import {getUserRole,useUserRole} from './UserRole.jsx';
import {readLocal} from './useLocalData.js';
import {appSeed} from '../src-apps/app-data.js';
import './create-feature.css';

export default function CreateFeature({onClose,onCreated}){
 const isAdmin=useUserRole()==='admin';
 const [step,setStep]=useState(-1),[request,setRequest]=useState(''),[draft,setDraft]=useState(''),[answers,setAnswers]=useState([]),[access,setAccess]=useState('private'),[model,setModel]=useState(''),[emoji,setEmoji]=useState('🤖'),[agentName,setAgentName]=useState(''),[appName,setAppName]=useState(''),[result,setResult]=useState(null),[error,setError]=useState('');
 const saving=useRef(false),inputRef=useRef(null),pageRef=useRef(null),conversationRef=useRef(null);
 useEffect(()=>{const page=pageRef.current;page.showModal();return ()=>page.close()},[]);
 useEffect(()=>{conversationRef.current?.scrollTo({top:conversationRef.current.scrollHeight})},[step,result]);
 useEffect(()=>{inputRef.current?.focus()},[step]);
 const questions=['誰會使用這個功能？設定使用權限。','需要記錄或參考哪些資料？','Agent 應如何完成工作？設定工作流程與模型。',isAdmin?'為 Agent 和 NOVA App 命名。':'為 Agent 命名。'];
 const valid=step===-1?!!draft.trim():step===0?!!access:step===1?!!draft.trim():step===2?!!draft.trim()&&!!model:!!agentName.trim()&&(!isAdmin||!!appName.trim());
 function submit(e){e.preventDefault();if(!valid||saving.current)return;setError('');
  if(step===-1){setRequest(draft.trim());setDraft('');setStep(0);return}
  if(step<3){setAnswers(a=>[...a,step===0?access:draft.trim()]);setDraft('');setStep(step+1);return}
  saving.current=true;
  const canCreateApp=getUserRole()==='admin';
  const id=`custom-${crypto.randomUUID()}`,at=new Date().toISOString();
  const agent={id,name:agentName.trim(),emoji,role:'自訂 Agent',model,access:canCreateApp?access:'private',prompt:`${request}\n\n資料來源：${answers[1]}\n\n工作流程：${answers[2]}`,color:'#5f80c8',status:'idle',task:'目前沒有待處理的任務',detail:request,progress:0,createdAt:at,interview:{request,answers}};
  const app=canCreateApp?{id:`feature-${id}`,name:appName.trim(),agentId:id,category:'工作應用',description:request,author:agent.name,color:'#426fe1',views:0,tools:0,items:answers[1].split(/[、，,。；;\n]/).map(v=>v.trim()).filter(Boolean).slice(0,6),online:true}:null;
  let oldAgents,agentsWritten=false;
  try{
   oldAgents=localStorage.getItem('office-custom-agents-v1');
   localStorage.setItem('office-custom-agents-v1',JSON.stringify([...readLocal('office-custom-agents-v1',[]),agent]));
   agentsWritten=true;
   if(app)localStorage.setItem('office-nova-apps-v2',JSON.stringify([...readLocal('office-nova-apps-v2',appSeed),app]));
  }catch{
   try{if(agentsWritten){oldAgents===null?localStorage.removeItem('office-custom-agents-v1'):localStorage.setItem('office-custom-agents-v1',oldAgents)}}catch{}
   setError('無法儲存，請確認瀏覽器儲存空間後重試。');saving.current=false;return;
  }
  setResult({agent,app});onCreated(agent);saving.current=false;
 }
 return <dialog ref={pageRef} className="feature-fullscreen" aria-labelledby="feature-title" onCancel={e=>{e.preventDefault();onClose()}}><header className="feature-page-header"><div><Layers3 size={28}/><div><h1 id="feature-title">新增功能</h1><p>透過對話建立你的 {isAdmin?'Agent 與 NOVA App':'Agent'}。</p></div></div><Button onClick={onClose}><ArrowLeft size={18}/>Back</Button></header><div className={`feature-create ${result?'is-complete':''}`}>
  {result?<><div className="feature-success"><CheckCircle2 size={24}/><h3>已新增{result.app?' Agent 與 NOVA App':' Agent'}</h3></div><p>{result.agent.name} 已加入 My Board。{result.app&&`${result.app.name} 已加入 NOVA Apps。`}</p>
   <details className="feature-history"><summary>查看需求與四題回答</summary><p>{request}</p>{questions.map((q,i)=><div key={q}><strong>{q}</strong><p>{i===3?`${result.agent.name}${result.app?' / '+result.app.name:''}`:answers[i]}</p></div>)}</details>
   <Card className="feature-result"><details><summary>{result.agent.emoji} 查看 Agent 設定 · {result.agent.name}</summary><dl><dt>模型</dt><dd>{result.agent.model}</dd><dt>使用權限</dt><dd>{{private:'僅自己',workspace:'所有員工',admin:'管理員'}[result.agent.access]}</dd><dt>System Prompt</dt><dd>{result.agent.prompt}</dd></dl></details></Card>
   {result.app&&<Card className="feature-result"><header><Layers3 size={20}/><strong>NOVA App Screen Snapshot · {result.app.name}</strong></header><div className="feature-app-preview"><h3>{result.app.name}</h3><p>{result.app.description}</p><table><thead><tr><th>資料欄位</th><th>狀態</th></tr></thead><tbody>{result.app.items.map((field,i)=><tr key={i}><td>{field}</td><td>尚無紀錄</td></tr>)}</tbody></table></div></Card>}
   <Button variant="primary" onClick={onClose}>完成</Button>
  </>:<form onSubmit={submit}>
   <div ref={conversationRef} className={`feature-conversation ${step===-1?'is-empty':''}`} role="log" aria-label="建立功能對話">
   {step===-1?<div className="feature-welcome"><Sparkles size={40}/><h2>你想要建立什麼功能？</h2><p>{isAdmin?'先描述想解決的工作問題，我會透過四個問題整理 Agent 與 NOVA App。':'先描述想解決的工作問題，我會透過四個問題整理你的 Agent。'}</p><div className="feature-examples">{(isAdmin?['建立活動報名系統','建立打卡系統']:['建立會議摘要助理','建立工作規劃助理']).map(text=><Button key={text} onClick={()=>{setDraft(text);inputRef.current?.focus()}}><span>{text}</span><ArrowRight size={20}/></Button>)}</div></div>:<><div className="feature-message user"><small>你</small><p>{request}</p></div>{answers.map((answer,i)=><React.Fragment key={i}><div className="feature-message"><small>功能助理 · {i+1} / 4</small><p>{questions[i]}</p></div><div className="feature-message user"><small>你</small><p>{i===0?{private:'僅自己',workspace:'所有員工',admin:'管理員'}[answer]:answer}</p></div></React.Fragment>)}<div className="feature-message"><small>功能助理 · {step+1} / 4</small><h2>{questions[step]}</h2></div></>}
   </div><div className="feature-composer">
   {(step===-1||step===1||step===2)&&<label>{step===2?'工作流程 / System Prompt':step===1?'資料需求':'功能需求'}<Input ref={inputRef} as="textarea" rows={2} value={draft} onChange={e=>setDraft(e.target.value)} placeholder={step===1?'例如：姓名、日期、狀態；或參考的文件內容…':'說明你希望完成的工作…'}/></label>}
   {step===0&&<fieldset><legend>使用權限</legend>{(isAdmin?[['private','僅自己'],['workspace','所有員工'],['admin','管理員']]:[['private','僅自己']]).map(([value,label])=><label className="feature-radio" key={value}><input type="radio" name="feature-access" value={value} checked={access===value} onChange={()=>setAccess(value)}/>{label}</label>)}</fieldset>}
   {step===2&&<label>模型 Model<ModelPicker value={model} onChange={setModel}/></label>}
   {step===3&&<><label>Icon<Input as="select" value={emoji} onChange={e=>setEmoji(e.target.value)}>{['🤖','🧠','✨','📅','📝','📊','🔧'].map(icon=><option key={icon}>{icon}</option>)}</Input></label><label>Agent 名稱<Input ref={inputRef} value={agentName} onChange={e=>setAgentName(e.target.value)} maxLength={32}/></label>{isAdmin&&<label>NOVA App 名稱<Input value={appName} onChange={e=>setAppName(e.target.value)} maxLength={32}/></label>}</>}
   {error&&<p role="alert">{error}</p>}
   <footer>{step>=0&&<Button onClick={()=>{const previous=step-1;setDraft(previous===-1?request:answers[previous]||'');setAnswers(a=>a.slice(0,Math.max(0,previous)));setStep(previous)}}><ArrowLeft size={16}/>上一步</Button>}<Button variant="primary" type="submit" disabled={!valid}>{step===3?<><Plus size={18}/>新增</>:<><Send size={16}/>送出回答</>}</Button></footer>
  </div></form>}
 </div></dialog>
}
