import React from 'react';
import './contract-documents.css';

function CalendarIcon(){return <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="7" width="24" height="21" rx="4"/><path d="M10 4v7m12-7v7M5 15h22M11 21h3m5 0h3"/></svg>;}
export default function ContractDocuments({phase,step,lang,reduced}){
 const en=lang==='en',planned=step===5;
 const people=[{id:'boyu',name:en?'Boyu':'柏宇',title:en?'Probation':'試用期',action:en?'Review':'安排評估'},{id:'jiaying',name:en?'Jiaying':'佳穎',title:en?'Contract':'合約',action:en?'Renewal talk':'續約洽談'}];
 return <div className={`contract-desk-story phase-${phase}${planned?' is-planned':''}`} data-reduced={reduced} aria-label={en?'Probation and contract follow-ups':'試用期與合約後續安排'}>
  <div className="contract-papers">{people.map((p,i)=><article className={`contract-paper paper-${i}`} key={p.id}>
   <span className="contract-paper-tab">{p.title}</span>
   <div className="contract-paper-owner"><div><img src={`${import.meta.env.BASE_URL}hr-workspace/${p.id}.webp`} alt=""/></div><strong>{p.name}</strong></div>
   <div className="contract-paper-lines" aria-hidden="true"><i/><i/><i/></div>
   <div className="contract-paper-due"><CalendarIcon/><span><b>30</b> {en?'days left':'天後到期'}</span><em aria-hidden="true">!</em></div>
   <div className="contract-follow-up"><span aria-hidden="true">{planned?'✓':'◷'}</span>{p.action}</div>
   {planned&&<span className="contract-paper-stamp">{en?'Planned':'已安排'}</span>}
  </article>)}</div>
  {phase===2&&<><svg className="contract-document-routes" viewBox="0 0 600 500" preserveAspectRatio="none" aria-hidden="true"><path d="M180 270 Q180 330 300 390M420 270 Q420 330 300 390"/></svg>
   <div className="contract-reviewer"><div className="contract-reviewer-avatar"><img src={`${import.meta.env.BASE_URL}hr-workspace/manager.webp`} alt=""/></div><div><strong>{en?'Manager Chen':'陳經理'}</strong><span>{planned?(en?'Follow-ups set · HR synced':'後續已安排 · HR 已同步'):(en?'Scheduling follow-ups':'安排評估與洽談')}</span></div><b aria-hidden="true">{planned?'✓':'…'}</b></div>
   <small className="contract-review-note">{en?'Renewal approval pending':'續約仍待確認'}</small>
  </>}
 </div>;
}
