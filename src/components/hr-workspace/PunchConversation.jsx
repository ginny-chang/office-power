import React from 'react';
import './punch-conversation.css';

export default function PunchConversation({phase,time,lang,reduced}){
 const en=lang==='en';
 const message=en?'I missed my clock-out today. I left at 18:30.':'今天忘記打卡，18:30 下班。';
 const typed=reduced||phase>0?message:message.slice(0,Math.floor(Math.max(0,time-.5)/2.1*message.length));
 const avatar=id=>`${import.meta.env.BASE_URL}hr-workspace/${id}.png`;
 const fields=en?[['Date','Today'],['Clock-out','18:30'],['Reason','Missed punch']]:[['日期','今天'],['下班時間','18:30'],['原因','忘記打卡']];
 return <div className={`punch-conversation phase-${phase}`} aria-label={en?'Message to attendance request':'從訊息到補卡申請'}>
  <div className="punch-phone">
   <header><span className="punch-line">LINE</span><div><strong>{en?'HR Assistant':'HR 小幫手'}</strong><small>{en?'Attendance support':'出勤小幫手'}</small></div><i/><span className="punch-online">{en?'Online':'在線'}</span></header>
   <div className="punch-message"><div className="punch-person"><img src={avatar('boyu')} alt=""/><b>{en?'Boyu':'柏宇'}</b></div><p>{typed}<span className="punch-cursor" aria-hidden="true"/></p></div>
   <div className="punch-form" aria-hidden={phase===0}>
    <div className="punch-form-heading"><span>OP</span><strong>{en?'Punch request':'補卡申請'}</strong><small>{en?'Drafted':'已整理'}</small></div>
    {fields.map(([label,value],i)=><div className="punch-field" style={{'--field-delay':`${i*.22}s`}} key={i}><span>{label}</span><b>{value}</b></div>)}
    <div className="punch-form-footer">{phase===2?(en?'Sent for review':'已送交主管'):(en?'Details ready':'資料已整理')}</div>
   </div>
   <div className="punch-compose" aria-hidden="true"><span>{en?'Message…':'輸入訊息…'}</span><b>↑</b></div>
  </div>
  {phase===2&&<div className="punch-handoff"><svg viewBox="0 0 24 70" aria-hidden="true"><path d="M12 2V68"/></svg><div className="punch-manager"><div className="punch-manager-avatar"><img src={avatar('manager')} alt=""/></div><div><strong>{en?'Manager Chen':'陳經理'}</strong><span>{en?'Pending review':'待主管確認'}</span></div><b>◷</b></div><small>{en?'Submitted · Not yet approved':'申請已送出，尚未核准'}</small></div>}
 </div>;
}
