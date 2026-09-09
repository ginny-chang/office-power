import React, { useEffect, useRef, useState } from 'react';
import ScenarioVisual from './ScenarioVisual';
import './use-case-stage.css';

const titles = [ ['加班超標前，','先提醒。'], ['異常送到人，','進度看得見。'], ['把特休，','排進計畫。'], ['重要的日子，','不再漏接。'], ['忘了打卡？','說一句就好。'] ];
const descriptions = ['不用月底手動比對；每週自動掃描加班，接近門檻就通知本人與主管。','不用逐一催回覆；異常自動派到員工 LINE，HR 只看誰還沒完成。','不用年底才算折現；到期前 90 天提醒剩餘特休，提早安排休假。','不靠記憶追日期；試用期或合約到期前 30 天，主動提醒主管與 HR。','不用找表單、追主管；LINE 說一句，AI 比對佐證並整理補卡摘要。'];
const metrics = [['44','h','接近門檻，已通知'], ['4','人','異常待完成'], ['6','天','剩餘特休'], ['30','天','到期前提醒'], ['09:05','','到班佐證已比對']];

export default function UseCaseExplorer({ packs }) {
  const pack = packs.find(p => p.status === 'available');
  const root = useRef(), stage = useRef(), progress = useRef(0), entry = useRef(0);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const count = pack.scenarios.length;
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const preference = () => setReduced(media.matches);
    preference(); media.addEventListener('change', preference);
    let frame;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = root.current.getBoundingClientRect();
        const travel = Math.max(1, rect.height - stage.current.offsetHeight);
        const value = Math.max(0, Math.min(1, -rect.top / travel));
        entry.current = Math.max(0, Math.min(1, (stage.current.offsetHeight - rect.top) / stage.current.offsetHeight));
        progress.current = value * (count - 1);
        setActive(Math.round(progress.current));
        stage.current.style.setProperty('--journey', value);
      });
    };
    update(); window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update);
    return () => { cancelAnimationFrame(frame); media.removeEventListener('change', preference); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [count]);
  const jump = index => {
    const travel = Math.max(1, root.current.offsetHeight - stage.current.offsetHeight);
    window.scrollTo({ top: window.scrollY + root.current.getBoundingClientRect().top + travel * index / (count - 1), behavior: reduced ? 'instant' : 'smooth' });
  };
  const current = pack.scenarios[active], metric = metrics[active];
  return <div className="use-case-explorer case-journey" ref={root}>
    <div className={`case-stage case-stage--${current.visual}`} ref={stage}>
      <div className="case-grid" aria-hidden="true" />
      <ScenarioVisual kind={current.visual} progress={progress} entry={entry} reduced={reduced} />
      <div className="case-editorial">
      <header className="case-masthead">
        <span>USE CASES</span>
        <nav className="case-pack-label" aria-label="部門 Pack">{packs.map(p => <button key={p.id} disabled={p.status==='soon'} aria-current={p.id===pack.id?'true':undefined}>{p.label}<small>{p.status==='soon'?'即將推出':null}</small></button>)}</nav>
      </header>
      <div className="case-copy" aria-live="polite" aria-atomic="true">
        <div className="case-copy-inner" key={active}>
          <h2>{titles[active][0]}<br /><span>{titles[active][1]}</span></h2>
          <p className="case-description">{descriptions[active]}</p>
        </div>
      </div>
      <footer className="case-navigation">
        <nav aria-label="HR 情境導覽"><ol>{pack.scenarios.map((s, i) => <li key={s.visual}><button onClick={() => jump(i)} aria-current={active === i ? 'step' : undefined} className={i === active ? 'is-active' : i < active ? 'is-complete' : ''}><span>0{i + 1}</span><strong>{s.title.replace('試用期／合約到期提醒', '合約到期提醒')}</strong></button></li>)}</ol></nav>
        <div className="case-progress" aria-hidden="true"><i /></div>
      </footer>
      </div>
      <div className="case-readout" key={current.visual}><strong>{metric[0]}<small>{metric[1]}</small></strong><span>{metric[2]}<small>情境示意</small></span></div>
    </div>
  </div>;
}
