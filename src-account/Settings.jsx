import React,{useEffect,useRef,useState} from 'react';
import {Check,CheckCircle2} from 'lucide-react';
import {Button,Card,Input,PageTitle} from '../src-shared/ui/index.jsx';
import {agentModels} from '../src-shared/ModelPicker.jsx';
import {useUserRole} from '../src-shared/UserRole.jsx';
import {showAdmin} from '../src-shared/features.js';
import {languages,useAccountSettings} from '../src-shared/accountSettings.js';
import {defaultTheme} from '../src-shared/theme.js';
import CardHeading from './CardHeading.jsx';
import './usage.css';
import './settings.css';

const models=agentModels.filter(model=>model.value!=='inherit');
// Swatches are literal colors so each card previews its own theme whichever one is active. `ready` themes have tokens in tokens.css.
const themes=[
 {id:'soft-light',name:'簡約淺色',copy:'淺灰底色，萊姆綠點綴',ready:true,colors:['#eeeef2','#ffffff','#e5f68c','#121214']},
 {id:'soft-dark',name:'簡約深色',copy:'炭黑底色，琥珀橘按鈕',ready:true,colors:['#1a1712','#2b241b','#ffffff','#ff9a2e']},
 {id:'tech-light',name:'科技淺色',copy:'冷灰藍底色，鈷藍按鈕',ready:true,colors:['#e6ecf5','#ffffff','#d6e4ff','#1c4fd8']},
 {id:'tech-dark',name:'科技深色',copy:'深色控制台，青藍按鈕',ready:true,colors:['#070b14','#111a2e','#ffffff','#22d3ee']}
];
const knownModel=value=>models.some(model=>model.value===value)?value:models[0].value;

// Personal cards come first and look the same for every role; admins get the 模型 card below them.
export default function Settings(){
 const role=useUserRole(),admin=showAdmin&&role==='admin';
 const [settings,save,saveError]=useAccountSettings();
 const activeValue=knownModel(settings.model);
 const [model,setModel]=useState(activeValue),[verifying,setVerifying]=useState(false),[notice,setNotice]=useState('');
 const timer=useRef();
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 function verifyModel(){setVerifying(true);setNotice('');timer.current=setTimeout(()=>{if(save({model},'更新控制中心預設模型',models.find(item=>item.value===model).name))setNotice('模型驗證成功，從下一回合開始生效。');setVerifying(false)},1000)}
 // A personal preference applies as soon as it is picked, so it has no save button
 const activeTheme=settings.theme||defaultTheme;
 function changeTheme(item){setNotice('');save({theme:item.id},'更新外觀主題',item.name)}
 function changeLanguage(value){setNotice('');save({language:value},'更新介面語言',languages.find(([key])=>key===value)[1])}
 return <div className="settings-page">
  <header className="page-heading usage-heading"><div><PageTitle>設定</PageTitle><p>{admin?'你的帳號偏好，以及平台的預設模型。':'你的帳號與外觀偏好。'}</p></div></header>
  {(notice||saveError)&&<p className="manage-alert settings-alert" role="status">{saveError||notice}</p>}
  <div className="settings-stack">
   <Card as="section" className="settings-card"><CardHeading title="帳號"/><dl className="settings-account"><div><dt>名稱</dt><dd>{settings.name}</dd></div><div><dt>電子郵件</dt><dd>ginny@example.com</dd></div><div><dt>身分</dt><dd><span className="usage-tag">{admin?'管理員':'一般使用者'}</span></dd></div></dl></Card>
   <Card as="section" className="settings-card"><CardHeading title="外觀與語言" copy="只影響你自己的帳號，選擇後立即套用。"/>
    <label className="manage-field settings-language">介面語言<Input as="select" value={settings.language} onChange={event=>changeLanguage(event.target.value)}>{languages.map(([value,label])=><option key={value} value={value}>{label}</option>)}</Input></label>
    <fieldset className="settings-themes"><legend>外觀主題</legend>{themes.map(theme=>{const selected=theme.id===activeTheme;return <label key={theme.id} className={selected?'selected':''}><span className="settings-theme-head"><input type="radio" name="theme" checked={selected} disabled={!theme.ready} onChange={()=>changeTheme(theme)}/><strong>{theme.name}</strong>{!theme.ready&&<span className="usage-tag">即將推出</span>}</span><small>{theme.copy}</small><span className="settings-swatches" aria-hidden="true">{theme.colors.map(color=><i key={color} style={{background:color}}/>)}</span></label>})}</fieldset>
   </Card>
   {admin&&<Card as="section" className="settings-card"><CardHeading title="模型" copy="未指定模型的 Agent 與任務共用。儲存前會先驗證，成功後從下一回合生效，不中斷執行中的工作。"/>
    <label className="manage-field">預設模型<div className="settings-model-row"><Input as="select" value={model} onChange={event=>setModel(event.target.value)}>{models.map(item=><option key={item.value} value={item.value}>{item.name}</option>)}</Input><Button variant="primary" loading={verifying} disabled={model===activeValue} onClick={verifyModel}>{!verifying&&<Check size={16}/>}{verifying?'驗證中':'驗證並儲存'}</Button></div></label>
    <dl className="settings-model-meta"><div><dt>模型來源</dt><dd>OpenShell + Hermes<span className="usage-tag good"><CheckCircle2 size={16}/>Gateway 可連線</span></dd></div></dl>
   </Card>}
  </div>
 </div>;
}
