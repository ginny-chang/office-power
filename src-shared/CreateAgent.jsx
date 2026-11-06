import React,{useEffect,useRef,useState} from 'react';
import {ArrowRight,ChevronLeft,ChevronRight,LayoutTemplate,ListChecks,MessageSquareText,Plus,Search,Sparkles} from 'lucide-react';
import ModelPicker,{agentModels} from './ModelPicker.jsx';
import {readLocal} from './useLocalData.js';
import {initialEmployees} from '../src-organization/data.js';

export const choices=['🤖','✨','🧠','💡','📊','📝','🎨','📅','🔧','💬','🚀','🛡️'];
export {agentModels};
export const agentAccess=[['workspace','所有員工','工作空間中的所有成員'],['admin','平台管理員','僅平台管理員可以使用'],['private','僅自己','只有建立者可以使用']];

const palettes=[
 {name:'溫暖活力',copy:'親切、鮮明，適合服務與團隊協作工具',colors:['#FFF7EC','#F05A28','#33261F','#F4BE4F']},
 {name:'清新專業',copy:'可信賴、沉穩，適合營運與管理流程',colors:['#F7FAF8','#18A957','#0F1A32','#DDF2E4']},
 {name:'現代質感',copy:'俐落、成熟，適合內部生產力工具',colors:['#F7F4ED','#FF9F0A','#17120F','#3B342E']}
];
// Same four steps as the App Pack interview; the first two would come from the AI, so here they are fixed examples.
const questions=[
 {title:'這位 Agent 主要由哪些人使用，以及主要的工作流程是什麼？',heading:'AI 建議選項',hint:'可複選；點擊整個選項即可加入或取消。',customLabel:'補充自訂回答',customPlaceholder:'輸入其他補充答案…',multiple:true,options:['員工自行使用：一般員工直接向 Agent 提問，立即取得結果。','專人代為處理：由行政或專責團隊統一使用，再把結果提供給需求者。','搭配審核流程：Agent 產出內容後，由主管或管理者確認才算完成。','內外部人員皆可使用：除公司員工外，外部訪客或合作夥伴也需要透過 Agent 取得協助。']},
 {title:'除了基本對話功能外，這位 Agent 需要處理哪些資料與工作規則？',heading:'AI 建議選項',hint:'可複選；點擊整個選項即可加入或取消。',customLabel:'補充自訂回答',customPlaceholder:'輸入其他補充答案…',multiple:true,options:['資料與知識管理：需要維護可查詢的文件、清單與常見問題。','規則與例外處理：需要依公司規則判斷，遇到例外時轉交給負責人。','通知與行事曆同步：完成或變更時需要寄送通知，並同步到使用者的行事曆工具。','統計與報表：需要彙整使用狀況與處理結果，供管理層參考。']},
 {title:'是否需要設定誰可以使用這位 Agent？',heading:'權限管理',hint:'請選擇是否加入權限管理。',options:['需要：加入權限管理，從員工名錄設定可以使用的員工。','不需要：所有員工都可以使用。']},
 {title:'你希望這位 Agent 使用哪一種顏色與視覺風格？',lead:'請選擇一組色票，或輸入自己的品牌顏色與風格。',heading:'選擇一組視覺風格與色彩搭配',hint:'此題請選擇一項，也可以在下方補充品牌要求。',customLabel:'補充品牌色彩與自訂風格要求',customPlaceholder:'例如：使用公司品牌深藍，強調俐落與可靠度…',palette:true,options:palettes.map(palette=>palette.name)}
];
const prepareDelay=900,generateDelay=1000;
const clampSplit=percent=>Math.min(70,Math.max(30,percent));
const blankAnswers=()=>questions.map(()=>({picked:[],custom:''}));
const isAnswered=answer=>answer.picked.length>0||!!answer.custom.trim();
const optionTitle=option=>option.split('：')[0];

function answerText(question,answer){
 const picked=question.palette?answer.picked.map(name=>{const palette=palettes.find(item=>item.name===name);return `${name}：${palette.copy}；色票 ${palette.colors.join(', ')}`}):answer.picked;
 return [...picked,answer.custom.trim()].filter(Boolean).join(' ');
}
// The demo has no AI behind it: the name, prompt and opening questions are composed from the need and the answers.
function buildSpec(need,answers){
 const core=need.replace(/^(幫我|請|我想要?|想要?)*(建立|做|新增|打造|設計)?(一個|一位)?/,'').trim().slice(0,16)||'新的';
 const [usage,rules,access,style]=answers;
 const palette=palettes.find(item=>item.name===style.picked[0]);
 const lines=[`你是「${core} Agent」。`,`需求背景：${need}`,`使用方式：${answerText(questions[0],usage)}`,`工作規則：${answerText(questions[1],rules)}`];
 return {emoji:choices[0],name:`${core} Agent`,prompt:lines.join('\n'),model:'inherit',access:access.picked[0]?.startsWith('不需要')?'workspace':'private',color:palette?palette.colors[1]:'#5f80c8',starters:rules.picked.slice(0,3).map(option=>`請協助${optionTitle(option)}`).join('\n')};
}

// A sub page like the App editor: the interview on the left, the timeline it builds on the right.
export default function CreateAgent({onClose,onCreate,backLabel='My Board'}){
 const [need,setNeed]=useState(''),[draftNeed,setDraftNeed]=useState(''),[answers,setAnswers]=useState(blankAnswers),[current,setCurrent]=useState(0),[phase,setPhase]=useState('need'),[spec,setSpec]=useState(null),[employeeQuery,setEmployeeQuery]=useState(''),[split,setSplit]=useState(50);
 const timer=useRef(),columns=useRef(),dragging=useRef(false);
 const employees=readLocal('office-employees-v1',initialEmployees),visibleEmployees=employees.filter(person=>`${person.name} ${person.email} ${person.department} ${person.role}`.toLowerCase().includes(employeeQuery.toLowerCase()));
 const question=questions[current],answer=answers[current];
 const answeredCount=answers.filter(isAnswered).length,allAnswered=answeredCount===questions.length,isLast=current===questions.length-1;
 const canCreate=!!spec&&!!spec.name.trim()&&!!spec.prompt.trim()&&!!spec.model;
 const updateSpec=(key,value)=>setSpec(state=>({...state,[key]:value}));
 const updateAnswer=change=>setAnswers(state=>state.map((item,index)=>index===current?{...item,...change}:item));
 const pick=option=>updateAnswer({picked:question.multiple?(answer.picked.includes(option)?answer.picked.filter(item=>item!==option):[...answer.picked,option]):[option]});
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 function sendNeed(){const text=draftNeed.trim();if(!text)return;setNeed(text);setPhase('preparing');timer.current=setTimeout(()=>setPhase('asking'),prepareDelay)}
 function generate(){if(!allAnswered)return;setPhase('generating');timer.current=setTimeout(()=>{setSpec(buildSpec(need,answers));setPhase('done')},generateDelay)}
 const create=()=>{if(canCreate)onCreate({id:`custom-${crypto.randomUUID()}`,name:spec.name.trim(),emoji:spec.emoji,role:'自訂 Agent',model:spec.model,prompt:spec.prompt.trim(),access:spec.access,starters:spec.starters.split('\n').map(line=>line.trim()).filter(Boolean),color:spec.color,status:'idle',task:'目前沒有待處理的任務',detail:'準備好接受你的工作。',progress:0})};
 const dragTo=event=>{if(!dragging.current)return;const box=columns.current.getBoundingClientRect();setSplit(clampSplit((event.clientX-box.left)/box.width*100))};
 const asking=phase==='asking';
 const progressCopy=!need?'先送出你想建立的 Agent':asking?`目前進行第 ${current+1} 題，可點擊切換`:phase==='preparing'?'AI 正在準備問題…':'訪談已完成';
 return <main className="agent-interview" aria-labelledby="create-agent-title">
  <button type="button" className="agent-interview-back" onClick={onClose}><ChevronLeft size={16}/>{backLabel}</button>
  <header className="agent-interview-head"><div><h1 id="create-agent-title">新增 Agent</h1><p>回答 4 個問題，AI 會幫你產生 Agent 的 Blueprint。</p></div></header>
  <div className="agent-interview-columns" ref={columns} style={{'--interview-split':`${split}%`}}>
   <section className="agent-interview-chat" aria-label="AI 需求訪談">
    <div className="agent-interview-top">
     <div className="agent-interview-progress"><div className="agent-interview-progress-head"><span><strong>AI 快速訪談進度</strong><small>{progressCopy}</small></span><em>{answeredCount}/{questions.length} 已回答</em></div>
      <ol>{questions.map((item,index)=><li key={item.title} className={isAnswered(answers[index])?'answered':''}><button type="button" disabled={!asking} aria-label={`第 ${index+1} 題：${isAnswered(answers[index])?'已回答':'待回答'}`} aria-current={asking&&index===current?'step':undefined} onClick={()=>setCurrent(index)}>{index+1}</button></li>)}</ol></div>
     {need&&<p className="agent-interview-user">{need}</p>}
    </div>
    {phase==='need'&&<form className="agent-interview-composer" onSubmit={event=>{event.preventDefault();sendNeed()}}><input autoFocus aria-label="描述你想建立的 Agent" value={draftNeed} onChange={event=>setDraftNeed(event.target.value)} placeholder="例如：幫業務整理客戶跟進紀錄"/><button type="submit" disabled={!draftNeed.trim()}>送出需求<ArrowRight size={16}/></button></form>}
    {phase==='preparing'&&<p className="agent-interview-status" role="status"><Sparkles size={16}/>AI 正在準備問題…</p>}
    {phase==='generating'&&<p className="agent-interview-status" role="status"><Sparkles size={16}/>AI 正在產生 Blueprint…</p>}
    {phase==='done'&&<p className="agent-interview-status" role="status">Blueprint 已產生，請確認右側的內容。</p>}
    {asking&&<div className="agent-interview-panel">
     <header><div className="agent-interview-kicker"><span><Sparkles size={16}/>AI 訪談 · 第 {current+1} 題 / 共 {questions.length} 題</span><em className={answer.picked.length?'picked':''}>{answer.picked.length?`已選 ${answer.picked.length} 項`:isAnswered(answer)?'已補充':'尚未回答'}</em></div><h2>{question.title}</h2>{question.lead&&<p>{question.lead}</p>}</header>
     <div className="agent-interview-body">
      <fieldset><legend>{question.heading}</legend><p>{question.hint}</p>
       {question.palette?<div className="agent-interview-palettes">{palettes.map(palette=><label key={palette.name} className={answer.picked.includes(palette.name)?'selected':''}><span className="agent-interview-swatches" aria-hidden="true">{palette.colors.map(color=><i key={color} style={{background:color}}/>)}</span><span className="agent-interview-palette-name"><strong>{palette.name}</strong><input type="radio" name="agent-palette" checked={answer.picked.includes(palette.name)} onChange={()=>pick(palette.name)}/></span><small>{palette.copy}</small></label>)}</div>
       :<div className="agent-interview-options">{question.options.map(option=><label key={option} className={answer.picked.includes(option)?'selected':''}><input type={question.multiple?'checkbox':'radio'} name={`agent-question-${current}`} checked={answer.picked.includes(option)} onChange={()=>pick(option)}/><span>{option}</span></label>)}</div>}
      </fieldset>
      {question.customLabel&&<label className="agent-interview-custom">{question.customLabel}<textarea rows={2} value={answer.custom} onChange={event=>updateAnswer({custom:event.target.value})} placeholder={question.customPlaceholder}/></label>}
     </div>
     <footer><button type="button" className="agent-interview-prev" disabled={current===0} onClick={()=>setCurrent(index=>index-1)}><ChevronLeft size={16}/>上一題</button><span>第 {current+1} 題 / 共 {questions.length} 題</span>{isLast?<button type="button" className="agent-interview-next" disabled={!allAnswered} onClick={generate}>送出 4 題並產生 Blueprint<ArrowRight size={16}/></button>:<button type="button" className="agent-interview-next" disabled={!isAnswered(answer)} onClick={()=>setCurrent(index=>index+1)}>下一題<ChevronRight size={16}/></button>}</footer>
    </div>}
   </section>
   <div className="agent-interview-resize" role="separator" aria-label="調整訪談與 Timeline 的寬度" aria-orientation="vertical" aria-valuemin={30} aria-valuemax={70} aria-valuenow={Math.round(split)} tabIndex={0} onPointerDown={event=>{if(event.button!==0)return;event.preventDefault();dragging.current=true;event.currentTarget.setPointerCapture(event.pointerId)}} onPointerMove={dragTo} onPointerUp={()=>{dragging.current=false}} onPointerCancel={()=>{dragging.current=false}} onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();setSplit(value=>clampSplit(value+(event.key==='ArrowLeft'?-2:2)))}}}><span/></div>
   <aside className="agent-interview-timeline" aria-label="Timeline">
    <h2>Timeline</h2>
    <ol>
     <li className={need?'done':'active'}><i><MessageSquareText size={16}/></i><div><strong>{need?'需求已送出':'等待需求'}</strong>{need?<p className="agent-interview-record">{need}</p>:<p>從左側描述你想建立的 Agent。</p>}</div></li>
     <li className={allAnswered?'done':need?'active':''}><i><ListChecks size={16}/></i><div><strong>{allAnswered?'訪談完成':`需求訪談 · ${answeredCount}/${questions.length}`}</strong>{need?<section className="agent-interview-answers"><h3>訪談回答記錄</h3>{questions.map((item,index)=><article key={item.title}><p>{item.title}</p>{isAnswered(answers[index])?<strong>{answerText(item,answers[index])}</strong>:<small>尚未回答</small>}</article>)}</section>:<p>送出需求後，AI 會一次準備 4 題確認細節。</p>}</div></li>
     <li className={spec?'done':phase==='generating'?'active':''}><i><LayoutTemplate size={16}/></i><div><strong>{spec?'Revision 1 · Blueprint 已完成':'Revision 1 · 等待產生 Blueprint'}</strong><p>{spec?'確認或修改下方內容，再按「新增 Agent」。':'完成訪談後，Blueprint 會直接出現在這裡。'}</p></div></li>
    </ol>
    {spec&&<div className="agent-interview-spec">
     <fieldset className="create-agent-field"><legend>圖示</legend><div className="create-agent-icons" role="group" aria-label="選擇 Agent 圖示">{choices.map(choice=><button type="button" key={choice} aria-label={`選擇 ${choice}`} aria-pressed={spec.emoji===choice} onClick={()=>updateSpec('emoji',choice)}>{choice}</button>)}</div></fieldset>
     <label className="create-agent-field">名稱<input value={spec.name} maxLength={32} onChange={event=>updateSpec('name',event.target.value)}/></label>
     <label className="create-agent-field">System Prompt<textarea rows={6} value={spec.prompt} onChange={event=>updateSpec('prompt',event.target.value)}/></label>
     <div className="create-agent-field"><label htmlFor="new-agent-model">模型</label><ModelPicker id="new-agent-model" value={spec.model} onChange={value=>updateSpec('model',value)}/></div>
     <label className="create-agent-field">開場建議問句（每行一個）<textarea rows={3} value={spec.starters} onChange={event=>updateSpec('starters',event.target.value)}/></label>
     <label className="create-agent-field">誰可以使用<select value={spec.access} onChange={event=>updateSpec('access',event.target.value)}>{agentAccess.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><small className="create-agent-hint">{agentAccess.find(([value])=>value===spec.access)?.[2]}</small></label>
     {spec.access==='workspace'&&<section className="create-agent-employees"><header><strong>員工清單</strong></header><label className="op-search"><Search size={16}/><input aria-label="搜尋員工" value={employeeQuery} onChange={event=>setEmployeeQuery(event.target.value)} placeholder="搜尋姓名、Email 或部門"/></label><div>{visibleEmployees.map(person=><article key={person.id} className={person.status==='inactive'?'inactive':''}><span>{person.name.slice(0,1)}</span><p><strong>{person.name}</strong><small>{person.email} · {person.department}</small></p><em>{person.status==='active'?'可使用':'已停用'}</em></article>)}{!visibleEmployees.length&&<p className="create-agent-no-results">找不到符合的員工</p>}</div></section>}
     <div className="agent-interview-spec-actions"><button type="button" className="agent-interview-create" disabled={!canCreate} onClick={create}><Plus size={16}/>新增 Agent</button></div>
    </div>}
   </aside>
  </div>
 </main>
}
