import React,{useEffect,useRef,useState} from 'react';
import AgentAvatar from './AgentAvatar.jsx';
import {AppWindow,ArrowRight,Bot,Check,ChevronDown,ChevronLeft,ChevronRight,CircleHelp,FileText,LayoutTemplate,ListChecks,MessageSquareText,Plus,Puzzle,Sparkles} from 'lucide-react';
import {agentModels} from './ModelPicker.jsx';
import {readLocal} from './useLocalData.js';
import {appSeed,appsStorageKey} from '../src-apps/app-data.js';

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
const revisionPrompts=['增加開場建議問句','回答時附上資料來源','送出前先請使用者確認','語氣改得更親切','加入 Slack / Email 通知'];
const scopes=[['private','只有我','保留你的使用權限，不新增分享。'],['workspace','整個組織','組織成員都可以使用，不授予編輯或刪除權限。']];
// The App's type is a best guess from the need; it can be changed on the App's detail page.
const appCategoryRules=[[/請假|出勤|打卡|人資|招募/,'人資與出勤'],[/報帳|費用|財務|發票/,'財務管理'],[/客戶|業務|銷售/,'業務管理'],[/器材|設備|資產|會議室|預約/,'營運與資產'],[/活動|植物|生活/,'生活助理']];
const appCategory=need=>appCategoryRules.find(([rule])=>rule.test(need))?.[1]||'專案協作';
function saveApp(app){try{localStorage.setItem(appsStorageKey,JSON.stringify([...readLocal(appsStorageKey,appSeed),app]));return true}catch{return false}}
// The demo has no AI behind it: the Blueprint is composed from the need and the answers, and each revision records the request.
function buildSpec(need,answers){
 const core=need.replace(/^(幫我|請|我想要?|想要?)*(建立|做|新增|打造|設計)?(一個|一位)?/,'').trim().slice(0,16)||'新的';
 const [usage,rules,access,style]=answers;
 const palette=palettes.find(item=>item.name===style.picked[0]);
 const needsPermission=!access.picked[0]?.startsWith('不需要');
 const notifies=rules.picked.some(option=>option.startsWith('通知'));
 const usageTitles=usage.picked.map(optionTitle),ruleTitles=rules.picked.map(optionTitle);
 const description=`協助${usageTitles.join('、')||'團隊成員'}處理「${core}」相關工作${ruleTitles.length?`，涵蓋${ruleTitles.join('、')}`:''}。`;
 return {emoji:choices[0],name:`${core} Agent`,role:'自訂 Agent',description,
  prompt:[`你是「${core} Agent」。`,`需求背景：${need}`,`使用方式：${answerText(questions[0],usage)}`,`工作規則：${answerText(questions[1],rules)}`].join('\n'),
  model:'inherit',access:needsPermission?'private':'workspace',color:palette?palette.colors[1]:'#5f80c8',palette,
  starters:(rules.picked.length?ruleTitles:['這位 Agent 可以幫我做什麼']).slice(0,3).map(title=>`請協助${title}`),
  skills:ruleTitles.filter(title=>!title.startsWith('規則')),
  assumptions:['回覆語言以繁體中文為主。','使用者的資料只在這位 Agent 內處理，不對外分享。',...(answers[3].custom.trim()?[`品牌要求：${answers[3].custom.trim()}`]:[])],
  app:{name:core,category:appCategory(need),description,items:[...usageTitles.map(title=>`使用方式 · ${title}`),...ruleTitles.map(title=>`工作規則 · ${title}`)]},
  pending:[needsPermission&&'可以使用這位 Agent 的員工名單尚未設定。',notifies&&'通知與行事曆需要連接的服務與授權方式尚未確認。','需要查詢的資料來源尚未連接。'].filter(Boolean)};
}
function Section({icon:Icon,title,children}){return <details className="agent-blueprint-section" open><summary><Icon size={16}/><span>{title}</span><ChevronDown size={16}/></summary><div>{children}</div></details>}

// A sub page like the App editor: the interview on the left, the timeline it builds on the right.
export default function CreateAgent({onClose,onCreate,onOpen,backLabel='My Board'}){
 const [need,setNeed]=useState(''),[draftNeed,setDraftNeed]=useState(''),[answers,setAnswers]=useState(blankAnswers),[current,setCurrent]=useState(0),[phase,setPhase]=useState('need'),[spec,setSpec]=useState(null),[revision,setRevision]=useState(1),[messages,setMessages]=useState([]),[prompt,setPrompt]=useState(''),[created,setCreated]=useState(null),[createdApp,setCreatedApp]=useState(null),[split,setSplit]=useState(50);
 const timer=useRef(),columns=useRef(),dragging=useRef(false),log=useRef();
 const question=questions[current],answer=answers[current];
 const answeredCount=answers.filter(isAnswered).length,allAnswered=answeredCount===questions.length,isLast=current===questions.length-1;
 const updateSpec=(key,value)=>setSpec(state=>({...state,[key]:value}));
 const updateAnswer=change=>setAnswers(state=>state.map((item,index)=>index===current?{...item,...change}:item));
 const pick=option=>updateAnswer({picked:question.multiple?(answer.picked.includes(option)?answer.picked.filter(item=>item!==option):[...answer.picked,option]):[option]});
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 useEffect(()=>{if(messages.length)log.current?.scrollTo({top:log.current.scrollHeight})},[messages,phase]);
 function sendNeed(){const text=draftNeed.trim();if(!text)return;setNeed(text);setPhase('preparing');timer.current=setTimeout(()=>setPhase('asking'),prepareDelay)}
 function generate(){if(!allAnswered)return;setPhase('generating');timer.current=setTimeout(()=>{setSpec(buildSpec(need,answers));setPhase('done')},generateDelay)}
 function revise(text){
  const request=text.trim();if(!request||phase!=='done'||created)return;
  const next=revision+1;
  setPrompt('');setMessages(list=>[...list,{role:'me',text:request}]);setPhase('revising');
  timer.current=setTimeout(()=>{setSpec(state=>({...state,prompt:`${state.prompt}\n補充要求：${request}`,assumptions:[...state.assumptions,`Revision ${next}：${request}`]}));setRevision(next);setMessages(list=>[...list,{role:'ai',text:`已產生 Revision ${next}，右側的 Blueprint 已更新。`}]);setPhase('done')},generateDelay);
 }
 function confirm(){
  if(!spec||created||phase!=='done')return;
  const agent={id:`custom-${crypto.randomUUID()}`,name:spec.name,emoji:spec.emoji,role:spec.role,model:spec.model,prompt:spec.prompt,access:spec.access,starters:spec.starters,color:spec.color,status:'idle',task:'目前沒有待處理的任務',detail:'準備好接受你的工作。',progress:0};
  const app={id:`app-${crypto.randomUUID()}`,...spec.app,author:'Ginny',color:spec.color,views:0,tools:0,online:true,access:spec.access,agentId:agent.id};
  onCreate(agent);setCreated(agent);if(saveApp(app))setCreatedApp(app);
 }
 const dragTo=event=>{if(!dragging.current)return;const box=columns.current.getBoundingClientRect();setSplit(clampSplit((event.clientX-box.left)/box.width*100))};
 const asking=phase==='asking',interviewing=phase==='need'||phase==='preparing'||asking;
 const progressCopy=!need?'先送出你想建立的 Agent':asking?`目前進行第 ${current+1} 題，可點擊切換`:phase==='preparing'?'AI 正在準備問題…':spec?'訪談完成，Blueprint 已產生':'訪談完成，正在產生 Blueprint';
 return <main className="agent-interview" aria-labelledby="create-agent-title">
  <button type="button" className="agent-interview-back" onClick={onClose}><ChevronLeft size={16}/>{backLabel}</button>
  <header className="agent-interview-head"><div><h1 id="create-agent-title">新增 Agent</h1><p>回答 4 個問題，AI 會幫你產生 Agent 的 Blueprint。</p></div></header>
  <div className="agent-interview-columns" ref={columns} style={{'--interview-split':`${split}%`}}>
   <section className="agent-interview-chat" aria-label="AI 需求訪談">
    <div className="agent-interview-top">
     <div className="agent-interview-progress"><div className="agent-interview-progress-head"><span><strong>AI 快速訪談進度</strong><small>{progressCopy}</small></span><em>{answeredCount}/{questions.length} 已回答</em></div>
      <ol>{questions.map((item,index)=><li key={item.title} className={isAnswered(answers[index])?'answered':''}><button type="button" disabled={!asking} aria-label={`第 ${index+1} 題：${isAnswered(answers[index])?'已回答':'待回答'}`} aria-current={asking&&index===current?'step':undefined} onClick={()=>setCurrent(index)}>{index+1}</button></li>)}</ol></div>
     {interviewing&&need&&<p className="agent-interview-user">{need}</p>}
    </div>
    {phase==='need'&&<form className="agent-interview-composer" onSubmit={event=>{event.preventDefault();sendNeed()}}><input autoFocus aria-label="描述你想建立的 Agent" value={draftNeed} onChange={event=>setDraftNeed(event.target.value)} placeholder="例如：幫業務整理客戶跟進紀錄"/><button type="submit" disabled={!draftNeed.trim()}>送出需求<ArrowRight size={16}/></button></form>}
    {phase==='preparing'&&<p className="agent-interview-status" role="status"><Sparkles size={16}/>AI 正在準備問題…</p>}
    {phase==='generating'&&<p className="agent-interview-status" role="status"><Sparkles size={16}/>AI 正在產生 Blueprint…</p>}
    {spec&&<div className="agent-interview-log" ref={log} aria-live="polite">
     <p className="agent-interview-user">{need}</p>
     <article className="agent-interview-summary"><small><Sparkles size={16}/>AI 訪談</small><h3>需求摘要：{need}</h3>
      <h4>使用方式</h4><ul>{answers[0].picked.map(item=><li key={item}>{item}</li>)}{answers[0].custom.trim()&&<li>{answers[0].custom.trim()}</li>}</ul>
      <h4>資料與工作規則</h4><ul>{answers[1].picked.map(item=><li key={item}>{item}</li>)}{answers[1].custom.trim()&&<li>{answers[1].custom.trim()}</li>}</ul>
      <h4>權限</h4><ul><li>{answers[2].picked[0]}</li></ul>
      <h4>視覺風格</h4><ul><li>{answerText(questions[3],answers[3])}</li></ul>
      <p>需求已完整確認。</p></article>
     {messages.map((message,index)=>message.role==='me'?<p key={index} className="agent-interview-user">{message.text}</p>:<p key={index} className="agent-interview-reply">{message.text}</p>)}
     {phase==='revising'&&<p className="agent-interview-reply muted"><Sparkles size={16}/>AI 正在修改 Blueprint…</p>}
    </div>}
    {spec&&!created&&<form className="agent-interview-revise" onSubmit={event=>{event.preventDefault();revise(prompt)}}><h3>修改 Blueprint</h3><p>直接描述想新增、移除或調整的內容，AI 會以目前版本為基礎建立下一個 Revision。</p>
     <div className="agent-interview-chips">{revisionPrompts.map(item=><button type="button" key={item} disabled={phase!=='done'} onClick={()=>revise(item)}><Plus size={16}/>{item}</button>)}</div>
     <div className="agent-interview-composer"><input aria-label="修改 Blueprint" value={prompt} onChange={event=>setPrompt(event.target.value)} placeholder="例如：回答時要附上資料來源"/><button type="submit" disabled={!prompt.trim()||phase!=='done'}>送出修改<ArrowRight size={16}/></button></div>
    </form>}
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
    <header><h2>Timeline</h2>{spec&&<em>{revision} revisions</em>}</header>
    <ol>
     <li className={need?'done':'active'}><i><MessageSquareText size={16}/></i><div><strong>{need?'需求已送出':'等待需求'}</strong>{need?<p className="agent-interview-record">{need}</p>:<p>從左側描述你想建立的 Agent。</p>}</div></li>
     <li className={allAnswered?'done':need?'active':''}><i><ListChecks size={16}/></i><div><strong>{allAnswered?'訪談完成':`需求訪談 · ${answeredCount}/${questions.length}`}</strong>{need?<section className="agent-interview-answers"><h3>訪談回答記錄</h3>{questions.map((item,index)=><article key={item.title}><p>{item.title}</p>{isAnswered(answers[index])?<strong>{answerText(item,answers[index])}</strong>:<small>尚未回答</small>}</article>)}</section>:<p>送出需求後，AI 會一次準備 4 題確認細節。</p>}</div></li>
     <li className={spec?'done':phase==='generating'?'active':''}><i><LayoutTemplate size={16}/></i><div><strong>{spec?`Revision ${revision} · Blueprint 已完成`:'Revision 1 · 等待產生 Blueprint'}</strong>{!spec&&<p>完成訪談後，Blueprint 會直接出現在這裡。</p>}</div></li>
    </ol>
    {spec&&<div className={`agent-blueprint${phase==='revising'?' updating':''}`}>
     <header><small>BLUEPRINT · REVISION {revision}</small><h3>{spec.name}</h3><p>{spec.description}</p><div className="agent-blueprint-tags"><span>{spec.skills.length} 個技能</span><span>{spec.starters.length} 個開場問句</span><span>1 個 NOVA App</span><span>{spec.pending.length} 個待確認</span></div></header>
     <Section icon={FileText} title="需求與假設"><p>{need}</p><ul>{spec.assumptions.map(item=><li key={item}>{item}</li>)}</ul></Section>
     <Section icon={Bot} title="Agent 規格"><div className="agent-blueprint-identity"><i aria-hidden="true"><AgentAvatar agent={{name:spec.name,role:spec.role}} fill/></i><span><strong>{spec.name}</strong><small>{spec.role}</small></span></div>
      <dl><div><dt>System Prompt</dt><dd className="prompt">{spec.prompt}</dd></div><div><dt>開場建議問句</dt><dd><ul>{spec.starters.map(item=><li key={item}>{item}</li>)}</ul></dd></div><div><dt>模型</dt><dd>{agentModels.find(model=>model.value===spec.model)?.name}</dd></div>{spec.palette&&<div><dt>視覺風格</dt><dd className="palette"><span className="agent-interview-swatches" aria-hidden="true">{spec.palette.colors.map(color=><i key={color} style={{background:color}}/>)}</span>{spec.palette.name}</dd></div>}</dl></Section>
     <Section icon={AppWindow} title="NOVA App"><div className="agent-blueprint-identity"><span><strong>{spec.app.name}</strong><small>{spec.app.category}</small></span></div><p>{spec.app.description}</p>{spec.app.items.length>0&&<ul>{spec.app.items.map(item=><li key={item}>{item}</li>)}</ul>}</Section>
     <Section icon={Puzzle} title={`擴充技能 · ${spec.skills.length}`}>{spec.skills.length?<ul>{spec.skills.map(item=><li key={item}>{item}</li>)}</ul>:<p>此 Blueprint 不需要額外技能。</p>}</Section>
     <Section icon={CircleHelp} title="待確認事項"><ul>{spec.pending.map(item=><li key={item}>{item}</li>)}</ul></Section>
     <footer>
      {!created&&<><h4>Blueprint 符合預期嗎？</h4><p>確認後才會真正建立這位 Agent 與 NOVA App，並套用 Blueprint 的內容。</p></>}
      <fieldset disabled={!!created}><legend>存取範圍</legend><p>套用至這次建立的 Agent 與 NOVA App，Agent 的範圍建立後仍可在設定中調整。</p><div>{scopes.map(([value,label,copy])=><label key={value} className={spec.access===value?'selected':''}><input type="radio" name="agent-scope" checked={spec.access===value} onChange={()=>updateSpec('access',value)}/><span><strong>{label}</strong><small>{copy}</small></span></label>)}</div></fieldset>
      {created?<div className="agent-blueprint-done" role="status"><i><Check size={16}/></i><span><strong>{createdApp?'Agent 與 NOVA App 已成功建立':'Agent 已成功建立'}</strong><small>Revision {revision} 已套用</small></span><div><button type="button" className="secondary" onClick={()=>onOpen?.(created)}><Bot size={16}/>開啟 Agent</button>{createdApp&&<a href={`./apps.html?edit=${encodeURIComponent(createdApp.id)}`}>開啟 NOVA App<ArrowRight size={16}/></a>}</div></div>:<div className="agent-blueprint-confirm"><button type="button" disabled={phase!=='done'} onClick={confirm}><Plus size={16}/>確認 Blueprint 並建立 Agent</button></div>}
     </footer>
    </div>}
   </aside>
  </div>
 </main>
}
