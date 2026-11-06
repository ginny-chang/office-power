import React,{useEffect,useRef,useState} from 'react';
import {Bot,Check,ChevronRight,CheckCircle2,Layers,Palette,Server} from 'lucide-react';
import {Button,Card,Input,PageTitle,SegmentedControl} from '../src-shared/ui/index.jsx';
import {agentModels} from '../src-shared/ModelPicker.jsx';
import {useUserRole} from '../src-shared/UserRole.jsx';
import {useAccountSettings} from '../src-shared/accountSettings.js';
import CardHeading from './CardHeading.jsx';
import './usage.css';
import './settings.css';

const models=agentModels.filter(model=>model.value!=='inherit');
const sections=[{value:'all',label:'全部設定',icon:Layers},{value:'model',label:'模型與閘道',icon:Bot},{value:'theme',label:'外觀主題',icon:Palette},{value:'environment',label:'環境資訊',icon:Server}];
// Only 簡約淺色 exists in the design system today. The other swatches preview themes that are not built yet.
const themes=[
 {id:'soft-light',name:'簡約淺色',copy:'目前使用的 Soft Card 外觀',colors:['var(--canvas)','var(--surface)','var(--lime)','var(--ink)']},
 {id:'soft-dark',name:'簡約深色',copy:'炭黑底色，適合低光環境',colors:['#1a1712','#2b241b','#3b3020','#ff9a2e']},
 {id:'tech-light',name:'科技淺色',copy:'冷灰藍底色，直角俐落',colors:['#e6ecf5','#ffffff','#c9d6e8','#1c4fd8']},
 {id:'tech-dark',name:'科技深色',copy:'深色控制台，青藍強調',colors:['#070b14','#0c1322','#1c2c4a','#22d3ee']}
];
const knownModel=value=>models.some(model=>model.value===value)?value:models[0].value;

export default function Settings(){
 const role=useUserRole();
 const [settings,save,saveError]=useAccountSettings();
 const activeValue=knownModel(settings.model),activeModel=models.find(item=>item.value===activeValue);
 const [model,setModel]=useState(activeValue),[section,setSection]=useState('all'),[verifying,setVerifying]=useState(false),[notice,setNotice]=useState('');
 const timer=useRef();
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 const show=id=>section==='all'||section===id;
 function verifyModel(){setVerifying(true);setNotice('');timer.current=setTimeout(()=>{if(save({model},'更新控制中心預設模型',models.find(item=>item.value===model).name))setNotice('模型驗證成功，從下一回合開始生效。');setVerifying(false)},1000)}
 return <div className="settings-page">
  <header className="page-heading usage-heading"><div><PageTitle>進階設定</PageTitle><p>平台的預設模型、外觀主題與環境資訊。</p></div></header>
  <SegmentedControl className="settings-tabs" label="設定分類" value={section} onChange={setSection} items={sections}/>
  {(notice||saveError)&&<p className="manage-alert settings-alert" role="status">{saveError||notice}</p>}
  <div className={`settings-grid${section==='all'?'':' single'}`}>
   {show('model')&&<Card as="section" className="settings-card"><CardHeading title="控制中心預設模型" copy="未指定模型的 Agent 與任務共用。儲存前會先驗證，成功後從下一回合生效，不中斷執行中的工作。"/><label className="manage-field">預設模型<div className="settings-model-row"><Input as="select" value={model} onChange={event=>setModel(event.target.value)}>{models.map(item=><option key={item.value} value={item.value}>{item.name}</option>)}</Input><Button variant="primary" loading={verifying} disabled={model===activeValue} onClick={verifyModel}>{!verifying&&<Check size={16}/>}{verifying?'驗證中':'驗證並儲存'}</Button></div></label><p className="settings-current"><span>目前生效模型</span><span className="usage-tag">{activeModel.name}</span></p></Card>}
   {show('model')&&<Card as="section" className="settings-card"><CardHeading title="模型供應來源" copy="平台目前接取的 AI 推理來源與連線狀態。"><a className="settings-go" href="./account.html?tab=runtime">前往<ChevronRight size={16}/></a></CardHeading><div className="settings-provider"><strong>OpenShell + Hermes</strong><span className="usage-tag good"><CheckCircle2 size={16}/>Gateway 可連線</span></div></Card>}
   {show('theme')&&<Card as="section" className="settings-card wide"><CardHeading title="外觀主題" copy="目前提供簡約淺色，其他主題推出後可以在這裡切換。"/><fieldset className="settings-themes"><legend className="usage-sr">外觀主題</legend>{themes.map((theme,index)=><label key={theme.id} className={index===0?'selected':''}><span className="settings-theme-head"><input type="radio" name="theme" checked={index===0} disabled={index!==0} readOnly/><strong>{theme.name}</strong><span className={`usage-tag${index===0?' good':''}`}>{index===0?'目前生效':'即將推出'}</span></span><small>{theme.copy}</small><span className="settings-swatches" aria-hidden="true">{theme.colors.map(color=><i key={color} style={{background:color}}/>)}</span></label>)}</fieldset></Card>}
   {show('environment')&&<Card as="section" className="settings-card wide"><CardHeading title="平台環境資訊" copy="目前帳號的身分與環境參數。"/><dl className="settings-env"><div><dt>權限身分</dt><dd><span className="usage-tag">{role==='admin'?'管理員':'一般使用者'}</span>{settings.name}</dd></div><div><dt>帳號電子郵件</dt><dd>ginny@example.com</dd></div><div><dt>介面主題</dt><dd>簡約淺色</dd></div></dl></Card>}
  </div>
 </div>;
}
