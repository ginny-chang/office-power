import React,{useState} from 'react';
import AgentAvatar from '../src-shared/AgentAvatar.jsx';
import {ArrowDownLeft,ArrowDownRight,ArrowUpRight,ChevronRight,Download,Layers,MessagesSquare,Receipt,Search,Settings,SquareActivity,Wallet,X} from 'lucide-react';
import {PageTitle,Button} from '../src-shared/ui/index.jsx';
import {csv,download} from '../src-shared/Management';
import useLocalData from '../src-shared/useLocalData.js';
import AgentSettings from '../src-dashboard/AgentSettings.jsx';
import AgentMonitor from './AgentMonitor.jsx';
import './usage.css';

// Demo data in the live page's shape; cost and tokens have their own daily curves because models price tokens differently.
const periods={
 '2026-11':{label:'本期 · 2026-11',short:'11 月',
  previous:{cost:1.86,tokens:1020000,input:990000,output:30000,requests:318},
  dailyCost:[5,6,4,2,2,6,7,6,5,7,3,2,6,8,7,6,7,2,3,7,8,6,7,9,3,2,8,22,9,7],
  dailyTokens:[7,8,6,3,2,9,12,9,7,8,4,3,14,18,15,9,8,3,3,6,7,8,11,13,4,3,7,9,10,8],
  agents:[
   {id:'nova',name:'大腦總管 NOVA',role:'團隊協作',emoji:'🧠',cost:1.12,input:528000,output:12000,requests:142,previous:.94,model:'anthropic/claude-sonnet-5',last:'11/05 17:58'},
   {id:'hr',name:'HR 小幫手',role:'人力資源',emoji:'🤖',cost:.48,input:254000,output:6000,requests:96,previous:.26,model:'openai/gpt-6.1-terra',last:'11/05 11:06'},
   {id:'sales',name:'Sales 助理',role:'客戶經營',emoji:'🤖',cost:.36,input:215000,output:5000,requests:58,previous:.41,model:'openai/gpt-6.1-terra',last:'11/04 16:20'},
   {id:'finance',name:'Nova 報帳助理',role:'財務管理',emoji:'🧾',cost:.24,input:137000,output:3000,requests:44,previous:.2,model:'anthropic/claude-haiku-4-5',last:'11/04 09:32'},
   {id:'it',name:'維修小管家',role:'設備管理',emoji:'🔧',cost:.12,input:78000,output:2000,requests:27,previous:.12,model:'anthropic/claude-haiku-4-5',last:'11/03 16:42'},
   {id:'plants',name:'澆水提醒小幫手',role:'植栽排程管理',emoji:'🌱',cost:0,input:0,output:0,requests:0,previous:0,model:'繼承工作空間預設',last:'—'}
  ]},
 '2026-10':{label:'上期 · 2026-10',short:'10 月',
  previous:{cost:1.52,tokens:880000,input:856000,output:24000,requests:254},
  dailyCost:[6,5,4,6,5,2,2,6,5,6,7,5,2,2,6,6,5,7,6,2,3,6,7,6,5,6,2,2,7,6,5],
  dailyTokens:[5,6,5,7,4,2,2,7,6,8,9,6,3,2,5,7,8,9,6,2,2,5,6,7,6,5,3,2,8,9,7],
  agents:[
   {id:'nova',name:'大腦總管 NOVA',role:'團隊協作',emoji:'🧠',cost:.94,input:470000,output:10000,requests:128,previous:.8,model:'anthropic/claude-sonnet-5',last:'10/31 18:02'},
   {id:'sales',name:'Sales 助理',role:'客戶經營',emoji:'🤖',cost:.34,input:196000,output:4000,requests:52,previous:.28,model:'openai/gpt-6.1-terra',last:'10/31 15:11'},
   {id:'hr',name:'HR 小幫手',role:'人力資源',emoji:'🤖',cost:.26,input:158000,output:2000,requests:68,previous:.22,model:'openai/gpt-6.1-terra',last:'10/30 10:48'},
   {id:'finance',name:'Nova 報帳助理',role:'財務管理',emoji:'🧾',cost:.2,input:108000,output:2000,requests:40,previous:.14,model:'anthropic/claude-haiku-4-5',last:'10/29 09:20'},
   {id:'it',name:'維修小管家',role:'設備管理',emoji:'🔧',cost:.12,input:68000,output:2000,requests:30,previous:.08,model:'anthropic/claude-haiku-4-5',last:'10/28 14:05'},
   {id:'plants',name:'澆水提醒小幫手',role:'植栽排程管理',emoji:'🌱',cost:0,input:0,output:0,requests:0,previous:0,model:'繼承工作空間預設',last:'—'}
  ]}
};
const money=value=>`$${value.toFixed(2)}`;
const unitCost=value=>`$${value.toFixed(4)}`;
const compact=value=>value>=1e6?`${(value/1e6).toFixed(2)}M`:value>=1e3?`${(value/1e3).toFixed(value>=1e5?0:1)}K`:String(Math.round(value));
const percent=value=>`${value.toFixed(value>0&&value<10?1:0)}%`;
const sum=(list,key)=>list.reduce((total,item)=>total+item[key],0);
const scaleDays=(days,total)=>{const all=days.reduce((a,b)=>a+b,0);return days.map(day=>day/all*total)};

// Every comparison reads the same way: a rise is green, a fall is red.
function Trend({now,before}){
 if(!before)return <span className="usage-tag">無上期資料</span>;
 const delta=Math.round((now-before)/before*100);
 if(delta===0)return <span className="usage-tag">與上期相同</span>;
 const tone=delta>0?'good':'bad',Icon=delta>0?ArrowUpRight:ArrowDownRight;
 return <span className={`usage-tag ${tone}`}><Icon size={16}/>{delta>0?'+':''}{delta}%</span>;
}

function SplitBar({input,output}){
 const total=input+output,share=total?input/total*100:0;
 return <div className="usage-split" role="img" aria-label={`輸入 ${percent(share)}，輸出 ${percent(100-share)}`}>{total?<><i className="input" style={{flexGrow:input}}/><i className="output" style={{flexGrow:output}}/></>:<i className="empty"/>}</div>;
}

// Two measures on different scales, so each is drawn against its own peak instead of two y-axes; the exact values are in the legend and tooltip.
function DailyChart({cost,tokens,month}){
 const [active,setActive]=useState(null);
 const n=cost.length,costPeak=Math.max(...cost),tokenPeak=Math.max(...tokens);
 const line=tokens.map((value,index)=>`${(index+.5)/n*100},${100-value/tokenPeak*94}`).join(' ');
 return <div className="usage-chart-wrap">
  <ul className="usage-legend"><li><i className="cost"/>費用（USD）<em>高峰 {money(costPeak)}</em></li><li><i className="tokens"/>Token<em>高峰 {compact(tokenPeak)}</em></li></ul>
  <div className="usage-chart" role="img" aria-label={`${month}每日費用與 Token。費用高峰在 ${cost.indexOf(costPeak)+1} 日 ${money(costPeak)}，Token 高峰在 ${tokens.indexOf(tokenPeak)+1} 日 ${compact(tokenPeak)}`} onMouseLeave={()=>setActive(null)}>
   <div className="usage-chart-grid" aria-hidden="true">{['高峰','50%','0'].map(label=><span key={label}><em>{label}</em></span>)}</div>
   <div className={`usage-chart-plot${active===null?'':' has-active'}`}>
    {cost.map((value,index)=><div key={index} className={`usage-chart-day${active===index?' active':''}`} tabIndex={0} aria-label={`${month} ${index+1} 日，費用 ${money(value)}，Token ${compact(tokens[index])}`} onMouseEnter={()=>setActive(index)} onFocus={()=>setActive(index)} onBlur={()=>setActive(null)}><i style={{height:`${value/costPeak*94}%`}}/></div>)}
    <svg className="usage-chart-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={line} vectorEffect="non-scaling-stroke"/></svg>
    {active!==null&&<><span className="usage-chart-dot" style={{left:`${(active+.5)/n*100}%`,top:`${100-tokens[active]/tokenPeak*94}%`}}/><div className={`usage-chart-tip${active>n*.75?' left':active<n*.25?' right':''}`} style={{left:`${(active+.5)/n*100}%`}}><small>{month} {active+1} 日</small><span><i className="cost"/>費用（USD）<strong>{money(cost[active])}</strong></span><span><i className="tokens"/>Token<strong>{compact(tokens[active])}</strong></span></div></>}
   </div>
   <div className="usage-chart-x" aria-hidden="true">{cost.map((_,index)=><span key={index}>{index===0||(index+1)%5===0?index+1:''}</span>)}</div>
  </div>
 </div>;
}

export default function UsagePanel(){
 const [periodId,setPeriodId]=useState('2026-11'),[query,setQuery]=useState(''),[open,setOpen]=useState(null);
 const [configs,setConfigs]=useLocalData('office-agent-settings-v1',{}),[deleted,setDeleted]=useLocalData('office-deleted-agents-v1',[]),[settingsId,setSettingsId]=useState(null),[monitorId,setMonitorId]=useState(null);
 const period=periods[periodId];
 // Rows show the name from Agent 設定. A deleted agent keeps its row, since its cost is history, but can no longer be opened.
 const agents=period.agents.map(agent=>{const config=configs[agent.id];return config?{...agent,name:config.name||agent.name,role:config.role||agent.role,emoji:config.emoji||agent.emoji}:agent});
 const settingsAgent=agents.find(agent=>agent.id===settingsId),monitorAgent=agents.find(agent=>agent.id===monitorId);
 const deleteAgent=id=>{setSettingsId(null);setDeleted(ids=>[...ids,id]);setConfigs(({[id]:removed,...rest})=>rest)};
 const totalCost=sum(agents,'cost'),input=sum(agents,'input'),output=sum(agents,'output'),tokens=input+output,requests=sum(agents,'requests');
 const avg=requests?totalCost/requests:0,prev=period.previous,prevAvg=prev.cost/prev.requests;
 const inputShare=tokens?input/tokens*100:0;
 const dailyCost=scaleDays(period.dailyCost,totalCost),dailyTokens=scaleDays(period.dailyTokens,tokens);
 const peak=period.dailyCost.indexOf(Math.max(...period.dailyCost));
 const rest=period.dailyCost.filter((_,index)=>index!==peak);
 const used=agents.filter(agent=>agent.cost>0&&agent.previous>0);
 const fastest=[...used].sort((a,b)=>b.cost/b.previous-a.cost/a.previous)[0];
 const top=[...agents].sort((a,b)=>b.cost-a.cost)[0];
 const alerts=[
  period.dailyCost[peak]>Math.max(...rest)*1.5&&{title:'費用異常',copy:`${period.short} ${peak+1} 日費用是平常的 ${(period.dailyCost[peak]/(period.dailyCost.reduce((a,b)=>a+b,0)/period.dailyCost.length)).toFixed(1)} 倍。`},
  fastest&&fastest.cost/fastest.previous>=1.4&&{title:'成長快速',copy:`${fastest.name} 費用較上期增加 ${Math.round((fastest.cost-fastest.previous)/fastest.previous*100)}%。`},
  top.cost/totalCost>=.4&&{title:'費用集中',copy:`${top.name} 佔總費用的 ${Math.round(top.cost/totalCost*100)}%。`}
 ].filter(Boolean);
 const shown=agents.filter(agent=>`${agent.name} ${agent.role} ${agent.model}`.toLowerCase().includes(query.toLowerCase()));
 const exportCsv=()=>download(`usage-${periodId}.csv`,csv([['Agent','費用（USD）','輸入 Token','輸出 Token','對話次數','使用模型','最近活動'],...agents.map(agent=>[agent.name,agent.cost,agent.input,agent.output,agent.requests,agent.model,agent.last])]),'text/csv;charset=utf-8');
 const stats=[
  {label:'總費用',unit:'USD',Icon:Wallet,focus:true,value:money(totalCost),foot:<Trend now={totalCost} before={prev.cost}/>},
  {label:'總 Token 用量',Icon:Layers,value:compact(tokens),foot:<Trend now={tokens} before={prev.tokens}/>},
  {label:'對話次數',Icon:MessagesSquare,value:String(requests),foot:<Trend now={requests} before={prev.requests}/>},
  {label:'平均每次成本',unit:'USD',Icon:Receipt,value:unitCost(avg),foot:<Trend now={avg} before={prevAvg}/>},
  {label:'輸入 Token',Icon:ArrowDownLeft,value:compact(input),foot:<Trend now={input} before={prev.input}/>},
  {label:'輸出 Token',Icon:ArrowUpRight,value:compact(output),foot:<Trend now={output} before={prev.output}/>}
 ];
 return <>
  <header className="page-heading usage-heading"><div><PageTitle>用量與費用</PageTitle><p>平台整體 Token 用量與費用，並可展開每個 Agent 的個別明細。</p></div>
   <div className="usage-actions"><select aria-label="統計期間" value={periodId} onChange={event=>{setPeriodId(event.target.value);setOpen(null)}}>{Object.entries(periods).map(([id,item])=><option key={id} value={id}>{item.label}</option>)}</select><Button variant="primary" onClick={exportCsv}><Download size={16}/>匯出報表</Button></div>
  </header>
  <section className="usage-stats" aria-label="用量總覽">{stats.map(({label,unit,Icon,focus,value,foot})=><article key={label} className={focus?'focus':''}><header><small>{label}{unit&&`（${unit}）`}</small><i className="usage-icon"><Icon size={16}/></i></header><strong>{value}</strong>{foot}</article>)}</section>
  <div className="usage-columns">
   <section className="usage-card" aria-labelledby="usage-trend-title"><header><h2 id="usage-trend-title">每日費用與 Token</h2></header><DailyChart key={periodId} cost={dailyCost} tokens={dailyTokens} month={period.short}/></section>
   <div className="usage-side">
    <section className="usage-card usage-tokens" aria-labelledby="usage-tokens-title">
     <h2 id="usage-tokens-title">整體 Token 分布</h2>
     <SplitBar input={input} output={output}/>
     <ul className="usage-legend"><li><i className="input"/>輸入 Prompt<em>{percent(inputShare)}（{compact(input)}）</em></li><li><i className="output"/>輸出 Completion<em>{percent(100-inputShare)}（{compact(output)}）</em></li></ul>
    </section>
    <section className="usage-card usage-alerts" aria-labelledby="usage-alerts-title">
     <h2 id="usage-alerts-title">需要留意</h2>
     {alerts.length?<ul>{alerts.map(({title,copy},index)=><li key={title}><i className="usage-number">{index+1}</i><span><strong>{title}</strong><small>{copy}</small></span></li>)}</ul>:<p>這段期間沒有異常。</p>}
    </section>
   </div>
  </div>
  <section className="usage-card usage-agents" aria-labelledby="usage-agents-title">
   <header><div><h2 id="usage-agents-title">各 Agent 明細</h2><p>點擊列展開詳細計量。</p></div><label className="op-search"><Search size={16}/><input aria-label="搜尋 Agent" value={query} onChange={event=>setQuery(event.target.value)} placeholder="搜尋 Agent 名稱、角色或模型…"/>{query&&<button type="button" aria-label="清除搜尋" onClick={()=>setQuery('')}><X size={16}/></button>}</label></header>
   {shown.length?<div className="usage-table"><table><thead><tr><th>Agent</th><th>Token（輸入 / 輸出）</th><th>對話次數</th><th>費用（USD）</th><th>占比</th><th>較上期</th><th><span className="usage-sr">操作</span></th></tr></thead><tbody>{shown.map(agent=>{
    const share=totalCost?agent.cost/totalCost*100:0,idle=agent.requests===0,expanded=open===agent.id,total=agent.input+agent.output;
    return <React.Fragment key={agent.id}><tr className={`usage-row${expanded?' expanded':''}`} onClick={()=>setOpen(expanded?null:agent.id)}>
     <td><button type="button" className="usage-agent" aria-expanded={expanded} onClick={event=>{event.stopPropagation();setOpen(expanded?null:agent.id)}}><ChevronRight size={16}/><i aria-hidden="true"><AgentAvatar agent={agent} fill/></i><span><strong>{agent.name}</strong><small>{agent.role}</small></span></button></td>
     <td>{compact(total)}<small>{compact(agent.input)} / {compact(agent.output)}</small></td>
     <td>{agent.requests}</td>
     <td><strong>{money(agent.cost)}</strong></td>
     <td className="usage-share">{percent(share)}<span className="usage-share-bar" aria-hidden="true"><i style={{width:`${share}%`}}/></span></td>
     <td>{idle?<span className="usage-tag">無用量</span>:<Trend now={agent.cost} before={agent.previous}/>}</td>
     <td><div className="usage-row-actions"><button type="button" className="usage-open" title="監控紀錄" aria-label={`${agent.name} 的監控紀錄`} onClick={event=>{event.stopPropagation();setMonitorId(agent.id)}}><SquareActivity size={16}/></button>{!deleted.includes(agent.id)&&<button type="button" className="usage-open" title="Agent 設定" aria-label={`${agent.name} 的 Agent 設定`} onClick={event=>{event.stopPropagation();setSettingsId(agent.id)}}><Settings size={16}/></button>}</div></td>
    </tr>
    {expanded&&<tr className="usage-detail"><td colSpan={7}><div>
     <div className="usage-detail-bars"><div><p><span>佔總費用比例（USD）</span><strong>{percent(share)}（{money(agent.cost)}）</strong></p><div className="usage-split"><i className="cost" style={{flexGrow:share}}/><i className="rest" style={{flexGrow:100-share}}/></div></div>
      <div><p><span>輸入 / 輸出比例</span><strong>{total?`${percent(agent.input/total*100)} / ${percent(agent.output/total*100)}`:'無用量'}</strong></p><SplitBar input={agent.input} output={agent.output}/></div></div>
     <dl>{[['輸入 Token',compact(agent.input)],['輸出 Token',compact(agent.output)],['對話次數',agent.requests],['平均每次成本（USD）',agent.requests?unitCost(agent.cost/agent.requests):'—'],['使用模型',agent.model],['最近活動',agent.last]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </div></td></tr>}</React.Fragment>})}</tbody></table></div>:<p className="usage-empty">找不到符合的 Agent。</p>}
  </section>
   {monitorAgent&&<AgentMonitor agent={monitorAgent} scheduleAgent={period.agents.find(agent=>agent.id===monitorId).name} month={periodId.slice(5)} onClose={()=>setMonitorId(null)}/>}
  {settingsAgent&&<AgentSettings modal agent={{id:settingsAgent.id,name:settingsAgent.name,role:settingsAgent.role,emoji:settingsAgent.emoji}} config={configs[settingsAgent.id]} onSave={config=>setConfigs(previous=>({...previous,[settingsAgent.id]:config}))} onClose={()=>setSettingsId(null)} onDelete={settingsAgent.id==='nova'?undefined:()=>deleteAgent(settingsAgent.id)}/>}
 </>;
}
